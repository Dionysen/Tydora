import { useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, Decoration, ViewPlugin, placeholder, ViewUpdate } from "@codemirror/view";
import { EditorState, Compartment, RangeSetBuilder } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { syntaxHighlighting, bracketMatching, foldGutter, indentOnInput, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { useVim, createVimExtension, useLeader, LeaderMenu, executeCodeMirrorAction } from "../vim";
import { prefixMConfig } from "../vim/config/prefixM";
import { prefixGConfig } from "../vim/config/prefixG";
import { prefixZConfig } from "../vim/config/prefixZ";


// 判断是否为 Markdown 文件
function isMarkdownFile(filePath: string | null | undefined): boolean {
  if (!filePath) return false;
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  return ["md", "markdown", "mdx"].includes(ext);
}

// 根据文件扩展名获取 CodeMirror 语言扩展
function getLanguageExtension(filePath: string | null | undefined) {
  if (!filePath) return markdown({ base: markdownLanguage });

  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return javascript({ jsx: ext === "jsx" });
    case "ts":
    case "mts":
    case "cts":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "py":
    case "pyw":
      return python();
    case "rs":
      return rust();
    case "java":
      return java();
    case "c":
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return cpp();
    case "html":
    case "htm":
    case "vue":
    case "svelte":
    case "astro":
      return html();
    case "css":
    case "scss":
    case "less":
      return css();
    case "json":
    case "jsonc":
    case "geojson":
      return json();
    case "xml":
    case "svg":
    case "xsd":
      return xml();
    case "yml":
    case "yaml":
      return yaml();
    default:
      return markdown({ base: markdownLanguage });
  }
}

// 自定义 Markdown 主题
const markdownTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--bg-primary, #fff)",
    color: "var(--text-primary, #333)",
    fontFamily: "var(--editor-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
    fontSize: "var(--editor-font-size, 16px)",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "inherit",   // 覆盖 CodeMirror 默认的 monospace，继承 & 中设置的 CSS 变量字体
    fontSize: "inherit",
  },
  ".cm-content": {
    caretColor: "var(--text-primary, #333)",
    padding: "20px 0",
    // 文末留白：允许滚动到文末后继续下滚，把最后一行放到窗口中间附近
    paddingBottom: "calc(20px + var(--editor-end-scroll-space, 0px))",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--text-primary, #333)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "rgba(0, 122, 255, 0.3)",
  },
  ".cm-panels": {
    backgroundColor: "var(--bg-secondary, #f5f5f5)",
    color: "var(--text-primary, #333)",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid var(--border, #e0e0e0)",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid var(--border, #e0e0e0)",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--bg-search-highlight, #fff3b0)",
    outline: "1px solid var(--border, #d0d0d0)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "var(--bg-search-active, #ffeb3b)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--bg-hover, rgba(0, 0, 0, 0.03))",
  },
  ".cm-selectionMatch": {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
  },
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "rgba(0, 122, 255, 0.2)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--bg-primary, #fff)",
    color: "var(--text-secondary, #999)",
    border: "none",
    borderRight: "1px solid var(--border, #e0e0e0)",
    minWidth: "50px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--bg-hover, rgba(0, 0, 0, 0.05))",
    color: "var(--text-primary, #333)",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--bg-secondary, #f0f0f0)",
    border: "1px solid var(--border, #d0d0d0)",
    color: "var(--text-secondary, #666)",
  },
  // LaTeX 数学高亮
  ".cm-math-inline": {
    backgroundColor: "var(--bg-math, rgba(74, 158, 255, 0.08))",
    borderRadius: "3px",
  },
  ".cm-math-block": {
    backgroundColor: "var(--bg-math, rgba(74, 158, 255, 0.06))",
    borderRadius: "3px",
  },
  ".cm-math-dollars": {
    color: "var(--text-math-delim, #7a5af5)",
    fontWeight: "bold",
  },
  ".cm-tooltip": {
    border: "1px solid var(--border, #d0d0d0)",
    backgroundColor: "var(--bg-primary, #fff)",
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: "var(--bg-primary, #fff)",
    borderBottomColor: "var(--bg-primary, #fff)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "var(--bg-active, #e3f2fd)",
      color: "var(--text-primary, #333)",
    },
  },
});

// Markdown 语法高亮（使用 CSS 变量引用，浏览器自动响应变化）
const markdownHighlighting = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.heading1, color: "var(--text-heading, #1a1a1a)", fontSize: "1.5em", fontWeight: "bold" },
    { tag: tags.heading2, color: "var(--text-heading, #1a1a1a)", fontSize: "1.3em", fontWeight: "bold" },
    { tag: tags.heading3, color: "var(--text-heading, #1a1a1a)", fontSize: "1.1em", fontWeight: "bold" },
    { tag: tags.heading4, color: "var(--text-heading, #1a1a1a)", fontSize: "1em", fontWeight: "bold" },
    { tag: tags.heading5, color: "var(--text-heading, #1a1a1a)", fontSize: "0.9em", fontWeight: "bold" },
    { tag: tags.heading6, color: "var(--text-heading, #1a1a1a)", fontSize: "0.85em", fontWeight: "bold" },
    { tag: tags.emphasis, fontStyle: "italic", color: "var(--text-emphasis, #666)" },
    { tag: tags.strong, fontWeight: "bold", color: "var(--text-strong, #333)" },
    { tag: tags.strikethrough, textDecoration: "line-through", color: "var(--text-secondary, #999)" },
    { tag: tags.link, color: "var(--text-link, #0969da)" },
    { tag: tags.url, color: "var(--text-url, #0969da)", textDecoration: "underline" },
    { tag: tags.string, color: "var(--hljs-string, #0a3069)" },
    { tag: tags.keyword, color: "var(--hljs-keyword, #cf222e)" },
    { tag: tags.atom, color: "var(--hljs-built_in, #0550ae)" },
    { tag: tags.bool, color: "var(--hljs-keyword, #0550ae)" },
    { tag: tags.number, color: "var(--hljs-number, #005cc5)" },
    { tag: tags.comment, color: "var(--hljs-comment, #6e7781)", fontStyle: "italic" },
    { tag: tags.monospace, fontFamily: "var(--font-mono, 'Fira Code', 'Consolas', monospace)", fontSize: "var(--font-mono-size, 14px)" },
    { tag: tags.processingInstruction, color: "var(--hljs-keyword, #cf222e)" },
    { tag: tags.special(tags.string), color: "var(--hljs-string, #0a3069)" },
    { tag: tags.contentSeparator, color: "var(--text-secondary, #999)" },
    { tag: tags.meta, color: "var(--hljs-comment, #6e7781)" },
  ])
);

// 代码文件语法高亮（使用 CSS 变量引用）
const codeHighlighting = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.string, color: "var(--hljs-string, #0a3069)" },
    { tag: tags.keyword, color: "var(--hljs-keyword, #cf222e)" },
    { tag: tags.atom, color: "var(--hljs-built_in, #0550ae)" },
    { tag: tags.bool, color: "var(--hljs-keyword, #0550ae)" },
    { tag: tags.number, color: "var(--hljs-number, #005cc5)" },
    { tag: tags.comment, color: "var(--hljs-comment, #6e7781)", fontStyle: "italic" },
    { tag: tags.monospace, fontFamily: "var(--font-mono, 'Fira Code', 'Consolas', monospace)", fontSize: "var(--font-mono-size, 14px)" },
    { tag: tags.processingInstruction, color: "var(--hljs-keyword, #cf222e)" },
    { tag: tags.special(tags.string), color: "var(--hljs-string, #0a3069)" },
    { tag: tags.meta, color: "var(--hljs-comment, #6e7781)" },
    { tag: tags.function(tags.variableName), color: "var(--hljs-built_in, #6f42c1)" },
    { tag: tags.definition(tags.variableName), color: "var(--hljs-built_in, #005cc5)" },
    { tag: tags.typeName, color: "var(--hljs-built_in, #22863a)" },
    { tag: tags.className, color: "var(--hljs-built_in, #6f42c1)" },
    { tag: tags.propertyName, color: "var(--hljs-string, #005cc5)" },
  ])
);

// ── LaTeX 数学高亮（$...$ 行内 / $$...$$ 块级） ──
const mathInlineMark = Decoration.mark({ class: "cm-math-inline" });
const mathBlockMark = Decoration.mark({ class: "cm-math-block" });
const mathDollarMark = Decoration.mark({ class: "cm-math-dollars" });

/** 判断 pos 处是否为合法开分隔符：后一位不能是空格/制表符（行内 $ 也不能是换行或数字） */
function canOpenMath(text: string, pos: number, isBlock: boolean) {
  const next = text[pos + (isBlock ? 2 : 1)];
  if (next === undefined || next === " " || next === "\t") return false;
  if (!isBlock && (next === "\n" || (next >= "0" && next <= "9"))) return false;
  return true;
}

/** 查找不以奇数个反斜杠转义的闭合 $ / $$ */
function findClosingDollar(text: string, from: number, isBlock: boolean) {
  const target = isBlock ? "$$" : "$";
  let i = from;
  while (i < text.length) {
    const idx = text.indexOf(target, i);
    if (idx === -1) return -1;
    let bs = 0;
    let k = idx - 1;
    while (k >= 0 && text[k] === "\\") {
      bs++;
      k--;
    }
    if (bs % 2 === 0) return idx;
    i = idx + target.length;
  }
  return -1;
}

/** 构建数学高亮装饰集（跳过代码围栏内的内容） */
function buildMathDecorations(view: EditorView) {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  const fullText = doc.toString();
  const len = fullText.length;

  // 计算代码围栏区间，围栏内的 $ 不做数学高亮
  const fenceRanges: Array<[number, number]> = [];
  for (let lineNo = 1; lineNo <= doc.lines; ) {
    const line = doc.line(lineNo);
    if (/^(```|~~~)/.test(line.text.trim())) {
      const from = line.from;
      let closeLine = lineNo + 1;
      while (closeLine <= doc.lines && !/^(```|~~~)/.test(doc.line(closeLine).text.trim())) {
        closeLine++;
      }
      const to = closeLine <= doc.lines ? doc.line(closeLine).to : doc.length;
      fenceRanges.push([from, to]);
      lineNo = closeLine + 1;
    } else {
      lineNo++;
    }
  }
  const inFence = (pos: number) => fenceRanges.some(([a, b]) => pos >= a && pos < b);

  let i = 0;
  while (i < len) {
    if (fullText[i] !== "$" || inFence(i)) {
      i++;
      continue;
    }
    const isBlock = fullText[i + 1] === "$";
    if (!canOpenMath(fullText, i, isBlock)) {
      i++;
      continue;
    }

    const openEnd = i + (isBlock ? 2 : 1);
    const closeStart = findClosingDollar(fullText, openEnd, isBlock);
    if (closeStart === -1) {
      i++;
      continue;
    }
    const content = fullText.slice(openEnd, closeStart);
    if (!content.trim()) {
      i++;
      continue;
    }
    // 行内数学不能跨行，且闭合符前不能是空格
    if (!isBlock && (content.includes("\n") || content[content.length - 1] === " " || content[content.length - 1] === "\t")) {
      i++;
      continue;
    }

    const innerFrom = openEnd;
    const innerTo = closeStart;
    // RangeSetBuilder 要求按 from 位置升序添加，否则会抛 "Ranges must be added sorted" 错误
    builder.add(i, innerFrom, mathDollarMark);
    builder.add(innerFrom, innerTo, isBlock ? mathBlockMark : mathInlineMark);
    builder.add(innerTo, innerTo + (isBlock ? 2 : 1), mathDollarMark);
    i = innerTo + (isBlock ? 2 : 1);
  }
  return builder.finish();
}

const mathHighlighter = ViewPlugin.fromClass(
  class {
    decorations: ReturnType<typeof buildMathDecorations>;
    constructor(view: EditorView) {
      this.decorations = buildMathDecorations(view);
    }
    update(update: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildMathDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onWordCount?: (count: number) => void;
  filePath?: string | null;
  /** 选区（Markdown 源码偏移）变化时回调，用于跨模式保留光标位置 */
  onSelectionChange?: (selection: { anchor: number; head: number }) => void;
  pendingViewRestoreRef?: React.MutableRefObject<import("./types").EditorViewState | null>;
}

export interface CodeMirrorEditorHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  /** 设置选区（Markdown 源码偏移）并将焦点移入编辑器 */
  setSelectionAndFocus: (anchor: number, head: number) => void;
  getViewState: () => import("./types").EditorViewState | null;
  restoreViewState: (state: import("./types").EditorViewState) => void;
}

const highlightCompartment = new Compartment();
// Vim 扩展独立 Compartment：动态开关 vim 时不重建整个 editor
const vimCompartment = new Compartment();

const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, CodeMirrorEditorProps>(
  ({ value, onChange, onWordCount, filePath, onSelectionChange, pendingViewRestoreRef }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onWordCountRef = useRef(onWordCount);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const isInternalRef = useRef(false);
    const filePathRef = useRef(filePath);
    filePathRef.current = filePath;
    const prevFilePathForScrollRef = useRef(filePath);

    onChangeRef.current = onChange;
    onWordCountRef.current = onWordCount;
    onSelectionChangeRef.current = onSelectionChange;

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (!viewRef.current) return "";
        return viewRef.current.state.doc.toString();
      },
      setValue: (val: string) => {
        if (!viewRef.current) return;
        isInternalRef.current = true;
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: val,
          },
        });
      },
      focus: () => {
        viewRef.current?.focus();
      },
      setSelectionAndFocus: (anchor: number, head: number) => {
        const view = viewRef.current;
        if (!view) return;
        const len = view.state.doc.length;
        const a = Math.max(0, Math.min(anchor, len));
        const h = Math.max(0, Math.min(head, len));
        view.dispatch({ selection: { anchor: a, head: h } });
        view.focus();
      },
      getViewState: () => {
        const view = viewRef.current;
        if (!view) return null;
        const scroller = view.scrollDOM;
        const { anchor, head } = view.state.selection.main;
        return {
          scrollTop: scroller.scrollTop,
          scrollLeft: scroller.scrollLeft,
          cursorOffset: anchor,
          selectionHead: head,
        };
      },
      restoreViewState: (state) => {
        const view = viewRef.current;
        if (!view) return;
        const len = view.state.doc.length;
        const anchor = Math.max(0, Math.min(state.cursorOffset, len));
        const head = Math.max(0, Math.min(state.selectionHead, len));
        view.dispatch({ selection: { anchor, head } });
        requestAnimationFrame(() => {
          const scroller = view.scrollDOM;
          scroller.scrollTop = state.scrollTop;
          scroller.scrollLeft = state.scrollLeft;
        });
      },
    }));

    // 根据 filePath 获取语言扩展
    const languageExtension = useMemo(() => getLanguageExtension(filePath), [filePath]);

    // Vim 模式状态（默认 enabled=false，关闭时零开销）
    const { enabled: vimEnabled, leaderKey, mode: vimMode, menuTimeout, setMode: onModeChange } = useVim();

    // Leader 菜单：normal 态按 Space 触发，匹配动作后按命名空间分发
    const dispatchAction = useCallback((action: string) => {
      if (action.startsWith("editor.")) {
        const view = viewRef.current;
        if (!view) return false;
        return executeCodeMirrorAction(action.slice("editor.".length), view);
      }
      if (action.startsWith("app.")) {
        // app.* 动作通过全局事件分发到 App.tsx，Vim 模块不依赖 App 内部 handler
        window.dispatchEvent(new CustomEvent("vim-app-action", {
          detail: { action: action.slice("app.".length) }
        }));
        return true;
      }
      return false;
    }, []);

    const leader = useLeader({
      enabled: vimEnabled,
      triggerKey: leaderKey,
      timeout: menuTimeout,
      active: vimMode === "normal",
      dispatchAction,
    });

    // m 前缀键：normal 态按 m 弹出 Markdown 格式化菜单（mb=加粗, mi=斜体…）
    const prefixM = useLeader({
      enabled: vimEnabled,
      triggerKey: "m",
      timeout: menuTimeout,
      active: vimMode === "normal" && !leader.open,
      dispatchAction,
      initialItems: prefixMConfig.items,
    });

    // g 前缀键：被动模式，弹窗仅作视觉引导，按键由 vim 扩展原生处理
    const prefixG = useLeader({
      enabled: vimEnabled,
      triggerKey: "g",
      timeout: menuTimeout,
      active: vimMode === "normal" && !leader.open && !prefixM.open,
      dispatchAction,
      initialItems: prefixGConfig.items,
      passive: true,
    });

    // z 前缀键：被动模式，弹窗仅作视觉引导，按键由 vim 扩展原生处理
    const prefixZ = useLeader({
      enabled: vimEnabled,
      triggerKey: "z",
      timeout: menuTimeout,
      active: vimMode === "normal" && !leader.open && !prefixM.open && !prefixG.open,
      dispatchAction,
      initialItems: prefixZConfig.items,
      passive: true,
    });

    useEffect(() => {
      if (!containerRef.current) return;

      const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
        const main = update.state.selection.main;
        onSelectionChangeRef.current?.({ anchor: main.anchor, head: main.head });
        if (update.docChanged) {
          if (isInternalRef.current) {
            isInternalRef.current = false;
            return;
          }
          const newValue = update.state.doc.toString();
          onChangeRef.current(newValue);
          const count = newValue.replace(/\s/g, "").length;
          onWordCountRef.current?.(count);
        }
      });

      // 根据语言类型选择高亮主题
      const useMarkdownHighlighting = isMarkdownFile(filePathRef.current);

      // Markdown 文件启用 LaTeX 数学高亮
      const mathExtensions = useMarkdownHighlighting ? [mathHighlighter] : [];

      const state = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          foldGutter(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightSelectionMatches(),
          // Markdown 文件空内容时提示输入 @ 插入 wiki-link
          ...(useMarkdownHighlighting ? [placeholder("输入@插入")] : []),
          languageExtension,
          markdownTheme,
          ...mathExtensions,
          // 使用 Compartment 包装高亮，支持动态切换
          highlightCompartment.of(
            useMarkdownHighlighting ? markdownHighlighting : codeHighlighting
          ),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...completionKeymap,
            ...closeBracketsKeymap,
            indentWithTab,
          ]),
          updateListener,
          EditorView.lineWrapping,
          // Vim 扩展通过独立 Compartment 动态开关（enabled=false 时为空数组，零影响）
          vimCompartment.of([]),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;
      onSelectionChangeRef.current?.({
        anchor: view.state.selection.main.anchor,
        head: view.state.selection.main.head,
      });

      // 文末留白：到达文末后仍可继续向下滚动，让最后一行能滚到窗口中间附近（手动滚动）
      const wrapper = containerRef.current.closest(".editor-wrapper") as HTMLElement | null;
      const updateEndScrollSpace = () => {
        if (!wrapper) return;
        const space = Math.max(120, Math.round(view.scrollDOM.clientHeight / 2));
        wrapper.style.setProperty("--editor-end-scroll-space", `${space}px`);
      };
      updateEndScrollSpace();
      const endSpaceObserver = new ResizeObserver(updateEndScrollSpace);
      endSpaceObserver.observe(view.scrollDOM);

      return () => {
        endSpaceObserver.disconnect();
        view.destroy();
        viewRef.current = null;
      };
    }, [languageExtension]);

    // 外部 value 同步
    useEffect(() => {
      if (!viewRef.current) return;
      if (isInternalRef.current) {
        isInternalRef.current = false;
        return;
      }
      const fileChanged = prevFilePathForScrollRef.current !== filePath;
      prevFilePathForScrollRef.current = filePath;
      const currentContent = viewRef.current.state.doc.toString();
      if (value !== currentContent) {
        isInternalRef.current = true;
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: value,
          },
        });
        // 文件切换时重置滚动位置到顶部
        if (fileChanged) {
          requestAnimationFrame(() => {
            const restore = pendingViewRestoreRef?.current;
            const scroller = viewRef.current?.scrollDOM;
            if (restore && scroller && viewRef.current) {
              const view = viewRef.current;
              const len = view.state.doc.length;
              const anchor = Math.max(0, Math.min(restore.cursorOffset, len));
              const head = Math.max(0, Math.min(restore.selectionHead, len));
              view.dispatch({ selection: { anchor, head } });
              scroller.scrollTop = restore.scrollTop;
              scroller.scrollLeft = restore.scrollLeft;
              if (pendingViewRestoreRef) pendingViewRestoreRef.current = null;
            } else if (scroller) {
              scroller.scrollTop = 0;
              scroller.scrollLeft = 0;
            }
          });
        }
      }
    }, [value, filePath]);

    // 监听代码主题变化，通过 Compartment reconfigure 实时切换高亮
    useEffect(() => {
      const handleCodeThemeChanged = () => {
        if (!viewRef.current) return;
        const useMarkdownHighlighting = isMarkdownFile(filePathRef.current);
        viewRef.current.dispatch({
          effects: highlightCompartment.reconfigure(
            useMarkdownHighlighting ? markdownHighlighting : codeHighlighting
          ),
        });
      };
      window.addEventListener("code-theme-changed", handleCodeThemeChanged);
      return () => window.removeEventListener("code-theme-changed", handleCodeThemeChanged);
    }, [markdownHighlighting, codeHighlighting]);

    // Vim 扩展动态注入：enabled 切换或 leaderKey 变化时通过 Compartment reconfigure
    // enabled=false 时 reconfigure 为空数组 → 完全移除 vim 行为，零残留
    useEffect(() => {
      if (!viewRef.current) return;
      viewRef.current.dispatch({
        effects: vimCompartment.reconfigure(
          createVimExtension({
            enabled: vimEnabled,
            leaderKey,
            onModeChange,
          })
        ),
      });
    }, [vimEnabled, leaderKey, onModeChange]);

    return (
      <div className="editor-wrapper">
        <div className="codemirror-editor-container">
          <div ref={containerRef} className="codemirror-editor" />
        </div>
        <LeaderMenu
          open={leader.open || prefixM.open || prefixG.open || prefixZ.open}
          items={
            leader.open ? leader.items
            : prefixM.open ? prefixM.items
            : prefixG.open ? prefixG.items
            : prefixZ.items
          }
          path={
            leader.open ? leader.path
            : prefixM.open ? prefixM.path
            : prefixG.open ? prefixG.path
            : prefixZ.path
          }
        />
      </div>
    );
  }
);

CodeMirrorEditor.displayName = "CodeMirrorEditor";

export default CodeMirrorEditor;
