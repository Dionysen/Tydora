/** 编辑器相关设置（与设置窗口 UI 解耦，避免主窗口/其他模块拖入整个 Settings.tsx） */

export interface EditorSettings {
  /** 编辑模式 */
  defaultMode: "ir" | "sv";
  /** 字数统计方式 */
  counterType: "markdown" | "text";
  /** 扩展功能 */
  callout: boolean;
  mermaid: boolean;
  math: boolean;
  wikiLink: boolean;
  frontmatter: boolean;
  tableToolbar: boolean;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  defaultMode: "ir",
  counterType: "text",
  callout: true,
  mermaid: true,
  math: true,
  wikiLink: true,
  frontmatter: true,
  tableToolbar: true,
};

export const EDITOR_SETTINGS_KEY = "inimark-editor-settings";

export function loadEditorSettings(): EditorSettings {
  try {
    const saved = localStorage.getItem(EDITOR_SETTINGS_KEY);
    return saved ? { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(saved) } : DEFAULT_EDITOR_SETTINGS;
  } catch {
    return DEFAULT_EDITOR_SETTINGS;
  }
}
