import type { ThemeName } from "../themes";
import type { ImageSettings } from "../services";
import type { EditorSettings } from "../Settings";

export interface EditorHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  /** 将焦点移入编辑器（IR 模式聚焦 TipTap view，SV 模式聚焦源码编辑器） */
  focus: () => void;
  insertTextAtCursor: (text: string) => void;
  replaceRangeWithWikiLink: (fromPos: number, noteName: string, heading?: string, display?: string) => void;
  replaceRangeWithTag: (fromPos: number, tag: string) => void;
  resize: () => void;
  highlightSearch: (query: string) => void;
  clearHighlight: () => void;
  executeCommand: (name: string) => void;
  scrollToHeading: (text: string, line: number) => void;
  scrollToLine: (line: number) => void;
  getCursorOffset: () => number;
  isSourceMode: () => boolean;
  /** 克隆当前渲染内容元素（用于导出）；源码模式下返回 null */
  getContentElement: () => HTMLElement | null;
  /** 全文搜索，返回所有匹配位置 */
  findMatches: (query: string) => Array<{ from: number; to: number }>;
  /** 选中指定范围并滚动到可见位置（不聚焦编辑器，用于搜索高亮） */
  selectMatch: (from: number, to: number) => void;
  /** 选中指定范围并滚动到可见位置（同时聚焦编辑器，用于导航跳转） */
  selectAndScroll: (from: number, to: number) => void;
  /** 替换指定范围内容 */
  replaceAt: (from: number, to: number, replacement: string) => void;
}

export type EditorMode = "ir" | "sv";

export const MODE_LABELS: Record<EditorMode, string> = {
  ir: "IR",
  sv: "SV",
};

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: EditorMode;
  theme: ThemeName;
  typewriterMode?: boolean;
  previewMaxWidth?: number;
  lineHeight?: number;
  irLineNumbers?: boolean;
  editorSettings?: EditorSettings;
  imageSettings?: ImageSettings;
  currentFilePath?: string | null;
  activeVaultPath?: string | null;
  onWordCount?: (count: number) => void;
}
