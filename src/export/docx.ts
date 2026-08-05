/**
 * HTML → 真实 .docx 转换器
 * 将编辑器渲染的 HTML DOM 解析为 docx 库的文档元素，生成标准 Office Open XML 格式
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  ImageRun,
  ExternalHyperlink,
  UnderlineType,
} from "docx";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Block = Paragraph | Table;

interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  underline?: { type: typeof UnderlineType.SINGLE };
  highlight?: string; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
  superScript?: boolean;
  subScript?: boolean;
  font?: string;
  size?: number;
  color?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

const HEADING_LEVEL = {
  h1: HeadingLevel.HEADING_1,
  h2: HeadingLevel.HEADING_2,
  h3: HeadingLevel.HEADING_3,
  h4: HeadingLevel.HEADING_4,
  h5: HeadingLevel.HEADING_5,
  h6: HeadingLevel.HEADING_6,
};

const HEADING_SIZE: Record<string, number> = {
  h1: 40, // 20pt
  h2: 36, // 18pt
  h3: 32, // 16pt
  h4: 28, // 14pt
  h5: 24, // 12pt
  h6: 22, // 11pt
};

// 字体大小以半点（half-point）为单位
const BODY_SIZE = 22;  // 11pt
const CODE_SIZE = 18;  // 9pt

/**
 * 将 data: URL 解码为二进制 Uint8Array
 */
function dataUrlToImageData(dataUrl: string): { bytes: Uint8Array; type: string } | null {
  try {
    const [header, b64] = dataUrl.split(",");
    if (!b64) return null;
    const mime = header.match(/:(.*?);/)?.[1] || "image/png";
    const rawType = mime.split("/")[1] || "png";
    // ImageRun 不接受 "jpeg"，统一为 "jpg"
    const type = rawType === "jpeg" ? "jpg" : rawType;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, type };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Inline 解析：DOM 文本节点 → TextRun / ExternalHyperlink            */
/* ------------------------------------------------------------------ */

function parseInlines(node: Node, base: RunStyle = {}): (TextRun | ExternalHyperlink)[] {
  const items: (TextRun | ExternalHyperlink)[] = [];

  function walk(n: Node, style: RunStyle) {
    // 文本节点（按换行拆分为多个 TextRun，保留换行）
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent || "";
      if (!text) return;
      const lines = text.split("\n");
      lines.forEach((line, idx) => {
        if (line) {
          items.push(new TextRun({ text: line, ...style } as Record<string, unknown>));
        }
        if (idx < lines.length - 1) {
          items.push(new TextRun({ break: 1, ...style } as Record<string, unknown>));
        }
      });
      return;
    }

    if (!(n instanceof HTMLElement)) return;

    const tag = n.tagName.toLowerCase();
    const next: RunStyle = { ...style };

    // 累积样式
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italics = true;
    if (tag === "s" || tag === "del" || tag === "strike") next.strike = true;
    if (tag === "u") next.underline = { type: UnderlineType.SINGLE };
    if (tag === "mark") next.highlight = "yellow";
    if (tag === "code") {
      next.font = "Consolas";
      next.size = CODE_SIZE;
    }
    if (tag === "sup") next.superScript = true;
    if (tag === "sub") next.subScript = true;

    if (tag === "br") {
      items.push(new TextRun({ break: 1 }));
    } else if (tag === "a") {
      // 超链接：先递归收集内部文本，再包装成 ExternalHyperlink
      const href = n.getAttribute("href") || "#";
      const before = items.length;
      n.childNodes.forEach(c => walk(c, next));
      const linkRuns = items.splice(before).filter(i => i instanceof TextRun) as TextRun[];
      if (linkRuns.length > 0) {
        items.push(new ExternalHyperlink({ children: linkRuns, link: href }));
      }
    } else if (tag === "span") {
      // 递归处理 span（如 highlight.js 的高亮 span）
      n.childNodes.forEach(c => walk(c, next));
    } else {
      n.childNodes.forEach(c => walk(c, next));
    }
  }

  walk(node, base);
  return items;
}

/* ------------------------------------------------------------------ */
/*  块级元素转换                                                        */
/* ------------------------------------------------------------------ */

/** 标题 h1-h6 → Heading Paragraph */
function heading(el: HTMLElement): Paragraph {
  const tag = el.tagName.toLowerCase();
  return new Paragraph({
    heading: HEADING_LEVEL[tag as keyof typeof HEADING_LEVEL] || HeadingLevel.HEADING_1,
    children: parseInlines(el, { bold: true, size: HEADING_SIZE[tag] || BODY_SIZE }),
    spacing: { before: 240, after: 120 },
  });
}

/** 普通段落 <p> → Paragraph */
function paragraph(el: HTMLElement, extra: Record<string, unknown> = {}): Paragraph {
  const children = parseInlines(el, { size: BODY_SIZE });
  if (children.length === 0) {
    return new Paragraph({ spacing: { after: 60 }, ...extra } as any);
  }
  return new Paragraph({ children, spacing: { after: 60 }, ...extra } as any);
}

/** 引用块 <blockquote> → 缩进 + 左边框 + 背景色的 Paragraph */
function blockquote(el: HTMLElement): Block[] {
  return Array.from(el.children).flatMap(child => {
    const childEl = child as HTMLElement;
    const tag = childEl.tagName?.toLowerCase();
    if (tag === "p") {
      return [
        new Paragraph({
          children: parseInlines(childEl),
          indent: { left: 720 },
          spacing: { after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 3, color: "CCCCCC" } },
          shading: { type: ShadingType.SOLID, fill: "F5F5F5" },
        }),
      ];
    }
    return elementToBlocks(childEl);
  });
}

/** 代码块 <pre><code> → 等宽字体 + 灰色背景的 Paragraph（每行一个 TextRun） */
function codeBlock(el: HTMLElement): Paragraph {
  const code = el.querySelector("code") || el;
  const text = code.textContent || "";
  const lines = text.split("\n");
  const children: TextRun[] = [];
  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        font: "Consolas",
        size: CODE_SIZE,
        break: idx > 0 ? 1 : 0,
      }),
    );
  });
  return new Paragraph({
    children,
    spacing: { after: 60 },
    shading: { type: ShadingType.SOLID, fill: "F0F0F0" },
    indent: { left: 360 },
  });
}

/** 水平线 <hr> → 带下边框的 Paragraph */
function horizontalRule(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } },
    spacing: { before: 120, after: 120 },
  });
}

/** 有序/无序/任务列表 */
function list(el: HTMLElement, ordered: boolean): Block[] {
  const blocks: Block[] = [];
  const isTask = el.getAttribute("data-type") === "taskList";
  let idx = 0;

  for (const li of Array.from(el.children)) {
    if (li.tagName.toLowerCase() !== "li") continue;
    const liEl = li as HTMLElement;
    idx++;

    // 任务列表的内容在 <div><p> 中
    let textEl = liEl;
    if (isTask) {
      const inner = liEl.querySelector("div > p") || liEl.querySelector("div");
      if (inner) textEl = inner as HTMLElement;
    }

    const checked = liEl.getAttribute("data-checked") === "true";
    let prefix: string;
    if (isTask) {
      prefix = checked ? "\u2611 " : "\u2610 "; // ☑ / ☐
    } else if (ordered) {
      prefix = `${idx}. `;
    } else {
      prefix = "\u2022 "; // •
    }

    const prefixRun = new TextRun({ text: prefix });
    const bodyRuns = parseInlines(textEl);
    blocks.push(
      new Paragraph({
        children: [prefixRun, ...bodyRuns],
        indent: { left: 360, hanging: 180 },
        spacing: { after: 40 },
      }),
    );
  }
  return blocks;
}

/** 表格 <table> → Table */
function buildTable(el: HTMLElement): Table {
  const rows: TableRow[] = [];

  el.querySelectorAll("tr").forEach(tr => {
    const cells: TableCell[] = [];
    tr.querySelectorAll("td, th").forEach(td => {
      const isHeader = td.tagName.toLowerCase() === "th";
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: parseInlines(td as HTMLElement, {
                bold: isHeader,
                size: BODY_SIZE,
              }),
            }),
          ],
          shading: isHeader
            ? { type: ShadingType.SOLID, fill: "E8E8E8" }
            : undefined,
        }),
      );
    });
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/** 标注块 Callout → 彩色边框 + 背景的 Paragraph */
function callout(el: HTMLElement): Block[] {
  const type =
    el.getAttribute("data-callout-type") ||
    (el.className?.match(/callout-(\w+)/) || [])[1] ||
    "";
  const fills: Record<string, string> = {
    info: "E3F2FD",
    warning: "FFF3E0",
    danger: "FFEBEE",
    success: "E8F5E9",
    tip: "F3E5F5",
    note: "FFFDE7",
  };
  const borders: Record<string, string> = {
    danger: "EF9A9A",
    warning: "FFCC80",
    info: "90CAF9",
    success: "A5D6A7",
    tip: "CE93D8",
    note: "FFF176",
  };
  const fill = fills[type] || "F5F5F5";
  const borderColor = borders[type] || "90CAF9";

  return Array.from(el.children).flatMap(child => {
    const childEl = child as HTMLElement;
    const tag = childEl.tagName?.toLowerCase();
    if (tag === "p") {
      return [
        new Paragraph({
          children: parseInlines(childEl),
          shading: { type: ShadingType.SOLID, fill },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: borderColor } },
          indent: { left: 360 },
          spacing: { after: 40 },
        }),
      ];
    }
    return elementToBlocks(childEl);
  });
}

/** 图片 → ImageRun Paragraph */
function imageBlock(el: HTMLElement): Paragraph | null {
  const img =
    el.tagName.toLowerCase() === "img"
      ? (el as HTMLImageElement)
      : el.querySelector("img");
  if (!img) return null;

  const src = img.getAttribute("src") || "";
  if (!src.startsWith("data:")) return null;

  const imgData = dataUrlToImageData(src);
  if (!imgData) return null;

  // 尺寸：用 HTML width/height 属性或 naturalWidth/Height 或默认值
  // 优先级：属性 > natural（避免未加载完成读到 0）
  const attrW = parseInt(img.getAttribute("width") || "", 10);
  const attrH = parseInt(img.getAttribute("height") || "", 10);
  const naturalW = img.naturalWidth || attrW || 400;
  const naturalH = img.naturalHeight || attrH || 300;

  // 防止比例失真：用属性中的宽高比（如果都有）
  let w = attrW || naturalW;
  let h = attrH || naturalH;
  if (!attrW && attrH) {
    w = Math.round((naturalW * attrH) / naturalH);
  } else if (attrW && !attrH) {
    h = Math.round((naturalH * attrW) / naturalW);
  }

  // A4 内容区宽度（扣除 Word 默认 2.54cm 左右边距），按 96 DPI 像素计
  // A4 210mm - 2*25.4mm = 159.2mm ≈ 6.27in ≈ 602px；留余量取 500px
  const PAGE_WIDTH_PX = 500;
  if (w > PAGE_WIDTH_PX) {
    h = Math.round((h * PAGE_WIDTH_PX) / w);
    w = PAGE_WIDTH_PX;
  }

  return new Paragraph({
    children: [
      new ImageRun({
        data: imgData.bytes,
        transformation: { width: w, height: h },
        type: imgData.type as "png" | "jpg" | "gif" | "bmp",
        altText: {
          title: img.alt || "",
          description: img.alt || "",
          name: "",
        },
      } as any),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  });
}

/* ------------------------------------------------------------------ */
/*  元素分发器                                                          */
/* ------------------------------------------------------------------ */

function elementToBlocks(el: Element): Block[] {
  const tag = el.tagName.toLowerCase();

  if (HEADING_TAGS.includes(tag)) return [heading(el as HTMLElement)];
  if (tag === "p") return [paragraph(el as HTMLElement)];
  if (tag === "blockquote") return blockquote(el as HTMLElement);
  if (tag === "pre") return [codeBlock(el as HTMLElement)];
  if (tag === "ul") return list(el as HTMLElement, false);
  if (tag === "ol") return list(el as HTMLElement, true);
  if (tag === "table") return [buildTable(el as HTMLElement)];
  if (tag === "hr") return [horizontalRule()];
  if (tag === "img" || tag === "figure") {
    const ib = imageBlock(el as HTMLElement);
    return ib ? [ib] : [];
  }

  // div：可能是 mermaid 图表 / callout / 普通容器
  if (tag === "div") {
    const dataType = el.getAttribute("data-type") || "";
    const cls = (el as HTMLElement).className || "";

    // mermaid 图表节点：提取栅格化后的 <img> 作为独立图片块
    if (dataType === "mermaid" || cls.includes("mermaid-node")) {
      const img = el.querySelector("img");
      if (img && img.getAttribute("src")?.startsWith("data:")) {
        const ib = imageBlock(el as HTMLElement);
        if (ib) return [ib];
      }
      // 如果没有栅格化成功（如没有 src），跳过该节点
      return [];
    }

    if (cls.includes("callout") || dataType === "callout") {
      return callout(el as HTMLElement);
    }
    // 普通 div 递归处理子元素
    return Array.from(el.children).flatMap(c => elementToBlocks(c));
  }

  // 其他未知元素：当作段落处理
  return [paragraph(el as HTMLElement)];
}

/* ------------------------------------------------------------------ */
/*  公开 API                                                           */
/* ------------------------------------------------------------------ */

/**
 * 将编辑器克隆的 DOM 节点转换为标准 .docx 二进制数据
 * @param raw - 包含导出内容的 HTMLElement（通常是 .export-page 内的内容）
 */
export async function exportDocxBytes(raw: HTMLElement): Promise<Uint8Array> {
  const blocks: Block[] = Array.from(raw.children).flatMap(c =>
    elementToBlocks(c),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: blocks,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const arrayBuf = await blob.arrayBuffer();
  return new Uint8Array(arrayBuf);
}
