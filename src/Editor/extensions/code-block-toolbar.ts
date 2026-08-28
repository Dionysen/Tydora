import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeView } from "@tiptap/pm/view";
import hljs from "highlight.js/lib/common";

const LANGUAGES = [
  { value: "", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "less", label: "Less" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "xml", label: "XML" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "markdown", label: "Markdown" },
  { value: "mermaid", label: "Mermaid" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
  { value: "plaintext", label: "Plain Text" },
];

// ── 全局：当前活跃的 ProseMirror view 引用 ──
let pmView: any = null;

// ── 下拉菜单 portal ──
let dropdownState: {
  container: HTMLDivElement;
  input: HTMLInputElement;
  list: HTMLDivElement;
  wrapper: HTMLElement;
  docHandler: (e: MouseEvent) => void;
} | null = null;

function closeDropdown() {
  if (!dropdownState) return;
  dropdownState.wrapper?.classList.remove("toolbar-active");
  dropdownState.container.style.display = "none";
  document.removeEventListener("mousedown", dropdownState.docHandler, true);
  if (dropdownState.container.parentNode === document.body) {
    document.body.removeChild(dropdownState.container);
  }
  dropdownState = null;
}

function openDropdown(
  anchorRect: DOMRect,
  currentLang: string,
  wrapper: HTMLElement
) {
  closeDropdown();

  wrapper.classList.add("toolbar-active");

  const container = document.createElement("div");
  container.className = "code-block-lang-dropdown-portal";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "code-block-lang-search";
  input.placeholder = "搜索语言...";

  const list = document.createElement("div");
  list.className = "code-block-lang-list";

  container.appendChild(input);
  container.appendChild(list);

  // 渲染语言列表
  LANGUAGES.forEach((lang) => {
    const item = document.createElement("div");
    item.className = "code-block-lang-item";
    if (lang.value === currentLang) item.classList.add("active");
    item.textContent = lang.label;
    item.dataset.label = lang.label;

    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyLanguage(wrapper, lang.value);
      closeDropdown();
    });

    list.appendChild(item);
  });

  // 搜索过滤
  input.addEventListener("input", () => {
    const filter = input.value.toLowerCase();
    list.querySelectorAll<HTMLElement>(".code-block-lang-item").forEach((item) => {
      item.style.display = (item.dataset.label || "").toLowerCase().includes(filter) ? "" : "none";
    });
  });
  input.addEventListener("mousedown", (e) => e.stopPropagation());
  list.addEventListener("mousedown", (e) => e.stopPropagation());

  document.body.appendChild(container);

  // 定位
  container.style.display = "flex";
  container.style.position = "fixed";
  container.style.top = `${anchorRect.bottom + 4}px`;
  container.style.left = `${anchorRect.left}px`;
  container.style.zIndex = "10000";

  requestAnimationFrame(() => {
    const r = container.getBoundingClientRect();
    if (r.bottom > window.innerHeight) {
      container.style.top = `${anchorRect.top - r.height - 4}px`;
    }
    if (r.right > window.innerWidth) {
      container.style.left = `${window.innerWidth - r.width - 8}px`;
    }
  });

  input.value = "";
  setTimeout(() => input.focus(), 0);

  const docHandler = (e: MouseEvent) => {
    if (!container.contains(e.target as Node)) closeDropdown();
  };
  document.addEventListener("mousedown", docHandler, true);

  dropdownState = { container, input, list, wrapper, docHandler };
}

// ── 通过 ProseMirror 事务执行操作 ──

function findNodePos(wrapper: HTMLElement): number | null {
  // 优先使用 NodeView 存储的 getPos（最可靠）
  const storedGetPos = (wrapper as any)._getPos;
  if (typeof storedGetPos === "function") {
    try {
      const pos = storedGetPos();
      if (pos !== undefined) return pos;
    } catch { /* node 已被删除 */ }
  }
  // 回退：通过坐标查找
  if (!pmView) return null;
  const btn = wrapper.querySelector(".code-block-lang-button");
  if (!btn) return null;
  const rect = btn.getBoundingClientRect();
  const coords = pmView.posAtCoords({ left: rect.left + 1, top: rect.top + 1 });
  if (!coords) return null;
  const node = pmView.state.doc.nodeAt(coords.pos);
  if (node && node.type.name === "codeBlock") return coords.pos;
  return null;
}

function applyLanguage(wrapper: HTMLElement, lang: string) {
  const pos = findNodePos(wrapper);
  if (pos === null || !pmView) return;

  const nodeAtPos = pmView.state.doc.nodeAt(pos);
  if (!nodeAtPos) return;

  // Mermaid：将 codeBlock 节点替换为 Mermaid 节点
  if (lang === "mermaid") {
    const content = nodeAtPos.textContent;
    const nodeSize = nodeAtPos.nodeSize;
    const mermaidContent = content ? [pmView.state.schema.text(content)] : [];
    const mermaidNode = pmView.state.schema.nodes.mermaid?.create(
      null,
      mermaidContent,
    );
    if (mermaidNode) {
      pmView.dispatch(
        pmView.state.tr.replaceWith(pos, pos + nodeSize, mermaidNode),
      );
      return;
    }
  }

  // 先更新 DOM（立即反馈，不等 ProseMirror 重渲染）
  const label = LANGUAGES.find((l) => l.value === lang)?.label || "Plain Text";
  const langBtn = wrapper.querySelector(".code-block-lang-button");
  if (langBtn) langBtn.textContent = label;
  wrapper.setAttribute("data-language", lang);

  // dispatch 事务更新文档模型（ProseMirror 会调用 update() 再次同步）
  pmView.dispatch(
    pmView.state.tr.setNodeMarkup(pos, undefined, { language: lang })
  );

  // 重新高亮代码
  const nodeDOM = pmView.nodeDOM(pos) as HTMLElement | null;
  if (nodeDOM) {
    const codeEl = nodeDOM.querySelector("pre.code-block-content code");
    if (codeEl && nodeAtPos.textContent) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          codeEl.innerHTML = hljs.highlight(nodeAtPos.textContent, { language: lang }).value;
        } catch {
          codeEl.textContent = nodeAtPos.textContent;
        }
      } else {
        codeEl.textContent = nodeAtPos.textContent;
      }
    }
  }
}

// ── 全局捕获阶段事件拦截 ──

let globalHandlerInstalled = false;

function installGlobalHandler() {
  if (globalHandlerInstalled) return;
  globalHandlerInstalled = true;

  document.addEventListener(
    "mousedown",
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 语言选择按钮
      const langBtn = target.closest(".code-block-lang-button") as HTMLElement | null;
      if (langBtn) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = langBtn.closest(".code-block-toolbar-wrapper") as HTMLElement | null;
        if (!wrapper) return;
        if (dropdownState && dropdownState.container.style.display !== "none") {
          closeDropdown();
        } else {
          openDropdown(langBtn.getBoundingClientRect(), wrapper.getAttribute("data-language") || "", wrapper);
        }
      }
    },
    true
  );

  // 阻止 ProseMirror 在 click 阶段处理工具栏
  document.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".code-block-toolbar")) {
      e.stopPropagation();
    }
  }, true);
}

// ── ProseMirror 插件 ──

const pluginKey = new PluginKey("codeBlockToolbar.v2");

export const CodeBlockToolbar = Extension.create({
  name: "codeBlockToolbar",

  addProseMirrorPlugins() {
    installGlobalHandler();

    const plugin = new Plugin({
      key: pluginKey,
      view: (_view) => {
        pmView = _view;
        return {
          destroy() {
            if (pmView === _view) pmView = null;
          },
        };
      },
      props: {
        nodeViews: {
          codeBlock: (node, _view, getPos) => new CodeBlockToolbarView(node, getPos as () => number),
        },
      },
    });

    return [plugin];
  },
});

// ── NodeView：纯渲染 ──

class CodeBlockToolbarView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private node: any;
  private wrapper: HTMLElement;
  private toolbar: HTMLElement;

  constructor(node: any, getPos: () => number) {
    this.node = node;

    this.wrapper = document.createElement("div");
    this.wrapper.className = "code-block-toolbar-wrapper";
    this.wrapper.setAttribute("data-language", node.attrs.language || "");
    // 存储 getPos 供全局处理器使用
    (this.wrapper as any)._getPos = getPos;

    this.toolbar = document.createElement("div");
    this.toolbar.className = "code-block-toolbar";

    // 语言选择器按钮
    const langSelector = document.createElement("div");
    langSelector.className = "code-block-lang-selector";
    const langButton = document.createElement("button");
    langButton.className = "code-block-lang-button";
    langButton.textContent =
      LANGUAGES.find((l) => l.value === node.attrs.language)?.label || "Plain Text";
    langSelector.appendChild(langButton);
    this.toolbar.appendChild(langSelector);

    // 代码内容区
    this.contentDOM = document.createElement("pre");
    this.contentDOM.className = "code-block-content";
    const codeElement = document.createElement("code");
    this.contentDOM.appendChild(codeElement);

    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.contentDOM);
    this.dom = this.wrapper;
  }

  update(node: any) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.wrapper.setAttribute("data-language", node.attrs.language || "");
    const langBtn = this.toolbar.querySelector(".code-block-lang-button");
    if (langBtn) {
      langBtn.textContent =
        LANGUAGES.find((l) => l.value === node.attrs.language)?.label || "Plain Text";
    }
    return true;
  }

  stopEvent(event: Event) {
    if ((event.target as HTMLElement).closest(".code-block-toolbar")) {
      return true;
    }
    return false;
  }

  destroy() {
    closeDropdown();
  }
}
