// 导出相关的 DOM / CSS 工具函数
import { readFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import appIconUrl from "../assets/icon.png";

/** 收集当前页面所有同源 <style> 的 CSS 文本（用于自包含 HTML 导出） */
export function collectDocumentCSS(): string {
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        css += rule.cssText + "\n";
      }
    } catch {
      // 跨域样式表无法读取，跳过
    }
  }
  return css;
}

/** 把 Uint8Array 转为 base64 字符串（浏览器环境，分块避免栈溢出） */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
  };
  return map[ext] || "application/octet-stream";
}

/** 读取本地图片文件并转为 data: URI */
async function readLocalImageAsDataUrl(path: string): Promise<string> {
  const data = await readFile(path);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  return `data:${mimeFromPath(path)};base64,${uint8ToBase64(bytes)}`;
}

/** 解析 Tauri asset:// 协议 URL，得到本地绝对路径 */
function decodeAssetUrl(url: string): string {
  return decodeURIComponent(url.replace(/^asset:\/\/localhost\//, "").replace(/^asset:\/\//, ""));
}

/**
 * 将导出内容中的所有本地/远程图片内联为 data: URI，使其自包含。
 * - 带 data-abs-path 的本地图片：直接读文件
 * - asset:// 图片：解码路径后读文件
 * - http(s) 远程图片：经 Rust 代理下载为 data URL
 */
export async function inlineImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  for (const img of imgs) {
    const abs = img.getAttribute("data-abs-path");
    const src = img.getAttribute("src") || "";
    try {
      if (abs) {
        img.src = await readLocalImageAsDataUrl(abs);
      } else if (src.startsWith("asset://")) {
        img.src = await readLocalImageAsDataUrl(decodeAssetUrl(src));
      } else if (src.startsWith("http://") || src.startsWith("https://")) {
        const dataUrl = await invoke<string>("fetch_remote_image", { url: src });
        img.src = dataUrl;
      }
    } catch (e) {
      console.warn("[export] 内联图片失败:", src, e);
    }
  }
}

/**
 * 把 mermaid 的 <svg> 栅格化为 PNG <img>，供 Word(.docx) 导出使用
 * （html-to-docx 对原始 svg 支持不佳，转成图片更稳妥）。
 */
export async function rasterizeMermaidSvgsForDocx(root: HTMLElement): Promise<void> {
  const nodes = Array.from(
    root.querySelectorAll("[data-type='mermaid'], .mermaid-node"),
  ) as HTMLElement[];
  for (const node of nodes) {
    const svg = node.querySelector(".mermaid-preview svg") as SVGSVGElement | null;
    if (!svg) continue;
    try {
      const { dataUrl, width, height } = await svgToPngDataUrl(svg);
      // 将整个 mermaid-node 内容替换为一张居中的 <img>
      // 同时设置 data: src 保证后续 imageBlock 能正确读取
      node.innerHTML = "";
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "diagram";
      // 将 SVG 原始逻辑尺寸写入属性，docx 转换器据此计算比例
      img.setAttribute("width", String(width));
      img.setAttribute("height", String(height));
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.margin = "0 auto";
      // 保留 data-type 属性让 docx 转换器识别
      node.setAttribute("data-type", "mermaid");
      node.style.textAlign = "center";
      node.style.padding = "12px 0";
      node.appendChild(img);
    } catch (e) {
      console.warn("[export] mermaid svg 栅格化失败:", e);
    }
  }
}

function svgToPngDataUrl(svg: SVGSVGElement): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      let w = 0;
      let h = 0;

      // 1. Mermaid SVG 通常没有显式 width/height，但 viewBox 最准确地描述内容边界
      const vb = svg.viewBox.baseVal;
      if (vb && vb.width && vb.height) {
        w = vb.width;
        h = vb.height;
      }

      // 2. 兜底：用 getBBox 获取内容实际包围盒
      if ((!w || !h) && svg.getBBox) {
        try {
          const bbox = svg.getBBox();
          if (bbox.width && bbox.height) {
            w = bbox.width;
            h = bbox.height;
          }
        } catch {
          // ignore
        }
      }

      // 3. 再用 width/height 属性或渲染尺寸兜底
      if (!w) w = svg.width.baseVal.value || svg.clientWidth || img.naturalWidth || 600;
      if (!h) h = svg.height.baseVal.value || svg.clientHeight || img.naturalHeight || 400;

      if (!w || !h) {
        const rect = svg.getBoundingClientRect();
        w = rect.width || w || 600;
        h = rect.height || h || 400;
      }

      // 限制最大宽度，避免生成超大 PNG（viewBox 可能非常大）
      const MAX_PNG_WIDTH = 2400;
      if (w > MAX_PNG_WIDTH) {
        h = Math.round((h * MAX_PNG_WIDTH) / w);
        w = MAX_PNG_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(w * scale);
      canvas.height = Math.ceil(h * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("无法创建 canvas 上下文"));
      ctx.scale(scale, scale);
      // 先填充白底：Mermaid SVG 背景通常透明，Word/PDF 中需要明确白色背景
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: Math.ceil(w),
        height: Math.ceil(h),
      });
    };
    img.onerror = () => reject(new Error("SVG 加载失败"));
    img.src = svg64;
  });
}

/**
 * 创建导出文件顶部的应用标识 header（图标 + 名称）
 */
function createExportHeader(): HTMLElement {
  const header = document.createElement("div");
  header.className = "export-app-header";
  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    paddingBottom: "16px",
    marginBottom: "16px",
    borderBottom: "1px solid var(--border, #d9ede5)",
  } as CSSStyleDeclaration);
  header.innerHTML = `
    <img src="${appIconUrl}" alt="Tydora" style="width:32px;height:32px;flex-shrink:0;" />
    <span style="font-size:20px;font-weight:700;color:var(--text-primary, #1f2330);letter-spacing:0.5px;">Tydora</span>
  `;
  return header;
}

/**
 * 把从编辑器克隆来的内容元素清理后挂到屏幕外容器，保证布局正常（供栅格化/截图）。
 * 返回容器与清理函数。
 */
export function prepareExportElement(
  raw: HTMLElement,
  themeName: string,
  forceLightTheme = false,
): { container: HTMLElement; cleanup: () => void } {
  // 清理编辑器专属 DOM
  raw.removeAttribute("contenteditable");
  raw.classList.add("tiptap-export-content");
  // 移除工具栏和源码区，避免它们出现在导出内容中
  raw.querySelectorAll(".mermaid-toolbar, .mermaid-source, .code-block-toolbar").forEach((el) => el.remove());
  raw
    .querySelectorAll(".ProseMirror-selectednode, .has-focus, .cm-editor")
    .forEach((el) => el.classList.remove("ProseMirror-selectednode", "has-focus"));
  // Wiki-Link / Tag 等节点视图通常渲染为纯文本 span，保留即可

  const container = document.createElement("div");
  container.className = "tiptap-export-container";
  const exportTheme = forceLightTheme ? "white" : themeName;
  Object.assign(container.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "820px",
    padding: "16px 48px 48px 48px",
    boxSizing: "border-box",
    background: forceLightTheme ? "#ffffff" : "var(--bg-primary, #ffffff)",
    color: forceLightTheme ? "#1e293b" : "var(--text-primary, #1f2330)",
    fontFamily: "var(--editor-font, sans-serif)",
  } as CSSStyleDeclaration);
  container.setAttribute("data-theme", exportTheme);

  // 在内容顶部插入应用标识 header
  const header = createExportHeader();
  raw.insertBefore(header, raw.firstChild);

  container.appendChild(raw);
  document.body.appendChild(container);

  const cleanup = () => {
    container.remove();
  };
  return { container, cleanup };
}

/** 取导出容器/内容的背景色（用于截图白底） */
export function getExportBackgroundColor(el: HTMLElement): string {
  const bg = getComputedStyle(el).backgroundColor;
  return bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#ffffff";
}

/** 圆角空白复选框 SVG */
function uncheckedCheckboxSvg(): string {
  return `<svg width="18" height="18" viewBox="0 0 18 18" style="display:inline-block;vertical-align:middle;flex-shrink:0;">
    <circle cx="9" cy="9" r="8" fill="none" stroke="#c0c0c0" stroke-width="2"/>
  </svg>`;
}

/** 圆角选中复选框 SVG（绿色背景 + 白色勾号） */
function checkedCheckboxSvg(): string {
  return `<svg width="18" height="18" viewBox="0 0 18 18" style="display:inline-block;vertical-align:middle;flex-shrink:0;">
    <circle cx="9" cy="9" r="9" fill="#5b8c5a" stroke="#5b8c5a" stroke-width="2"/>
    <polyline points="5,9 8,12 13,6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/**
 * 将任务列表中所有 <input type="checkbox"> 替换为 SVG 图标。
 * html2canvas 无法正确渲染 appearance:none 的自定义复选框，用 SVG 代替。
 * 返回替换个数（用于日志/调试）。
 */
export function replaceTaskCheckboxesWithSvg(root: HTMLElement): number {
  const checkboxes = root.querySelectorAll<HTMLInputElement>(
    "ul[data-type='taskList'] li > label input[type='checkbox']",
  );
  let count = 0;
  checkboxes.forEach((cb) => {
    const isChecked = cb.checked;
    const label = cb.parentElement;
    const wrapper = document.createElement("span");
    wrapper.style.cssText = "display:inline-flex;align-items:center;line-height:1;";
    wrapper.className = "export-checkbox-svg";
    wrapper.innerHTML = isChecked ? checkedCheckboxSvg() : uncheckedCheckboxSvg();
    cb.replaceWith(wrapper);
    // 移除 TipTap 的 checkboxStyler 空 span，避免 CSS 误隐藏
    if (label) {
      label.querySelectorAll(":scope > span:not(.export-checkbox-svg)").forEach((s) => {
        if (!s.textContent?.trim() && !s.querySelector("*")) s.remove();
      });
    }
    count++;
  });
  return count;
}
