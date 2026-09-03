import {
  DEFAULT_MARKDOWN_FORMAT_OPTIONS,
  type MarkdownFormatOptions,
} from "../services";
import {
  normalizeCodeFontValue,
  normalizeEditorFontValue,
  normalizeUiFontValue,
} from "../utils/systemFonts";
import {
  normalizeMenuDensity,
  type MenuDensity,
} from "../utils/menuDensity";
import {
  DEFAULT_SIDEBAR_PANEL_SIDES,
  normalizeSidebarPanelSides,
  type SidebarPanelSides,
} from "../Sidebar/index";

/** 代码块工具栏样式：minimal = 右上角浮动语言选择；classic = 顶栏 + 复制/删除 */
export type CodeBlockToolbarStyle = "minimal" | "classic";

export interface GeneralSettings {
  appearance: "system" | "light" | "dark";
  fontSize: number;
  /** 界面 UI 字体（`system` 或系统字体族名 / 内置 id） */
  uiFont: string;
  editorFont: string;
  /** 代码 / 等宽字体（`system` 或系统字体族名） */
  codeFont: string;
  /** 代码 / 等宽字号（px） */
  codeFontSize: number;
  autoSave: boolean;
  autoHideTopbar: boolean;
  autoHideTopbarOnCollapse: boolean;
  /** 侧栏底部仓库切换条是否在鼠标移出时自动隐藏 */
  autoHideVaultFooter: boolean;
  previewMaxWidth: number;
  typewriterMode: boolean;
  lineHeight: number;
  /** 段落上下外边距（em） */
  paragraphSpacing: number;
  /** 代码块行高 */
  codeLineHeight: number;
  irLineNumbers: boolean;
  expandOutlineOnOpen: boolean;
  /** 各侧栏面板归属：左栏 / 右栏 / 隐藏 */
  sidebarPanelSides: SidebarPanelSides;
  /** 代码块工具栏样式 */
  codeBlockToolbarStyle: CodeBlockToolbarStyle;
  /** 菜单项高度密度 */
  menuDensity: MenuDensity;
  /** Markdown 格式化选项 */
  markdownFormat: MarkdownFormatOptions;
}

export const DEFAULT_GENERAL: GeneralSettings = {
  appearance: "system",
  fontSize: 16,
  uiFont: "system",
  editorFont: "system",
  codeFont: "system",
  codeFontSize: 14,
  autoSave: true,
  autoHideTopbar: true,
  autoHideTopbarOnCollapse: true,
  autoHideVaultFooter: true,
  previewMaxWidth: 800,
  typewriterMode: false,
  lineHeight: 1.6,
  paragraphSpacing: 0.5,
  codeLineHeight: 1.5,
  irLineNumbers: true,
  expandOutlineOnOpen: true,
  sidebarPanelSides: { ...DEFAULT_SIDEBAR_PANEL_SIDES },
  codeBlockToolbarStyle: "minimal",
  menuDensity: "compact",
  markdownFormat: { ...DEFAULT_MARKDOWN_FORMAT_OPTIONS },
};

export const GENERAL_SETTINGS_KEY = "inimark-general-settings";

export function loadGeneralSettings(): GeneralSettings {
  try {
    const saved = localStorage.getItem(GENERAL_SETTINGS_KEY);
    if (!saved) return DEFAULT_GENERAL;
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_GENERAL,
      ...parsed,
      editorFont: normalizeEditorFontValue(parsed.editorFont),
      uiFont: normalizeUiFontValue(parsed.uiFont),
      codeFont: normalizeCodeFontValue(parsed.codeFont),
      codeFontSize:
        typeof parsed.codeFontSize === "number"
          ? Math.min(24, Math.max(10, Math.round(parsed.codeFontSize)))
          : DEFAULT_GENERAL.codeFontSize,
      codeBlockToolbarStyle:
        parsed.codeBlockToolbarStyle === "classic" ? "classic" : "minimal",
      menuDensity: normalizeMenuDensity(parsed.menuDensity),
      paragraphSpacing:
        typeof parsed.paragraphSpacing === "number"
          ? Math.min(2, Math.max(0, Math.round(parsed.paragraphSpacing * 10) / 10))
          : DEFAULT_GENERAL.paragraphSpacing,
      codeLineHeight:
        typeof parsed.codeLineHeight === "number"
          ? Math.min(2.4, Math.max(1.2, Math.round(parsed.codeLineHeight * 10) / 10))
          : DEFAULT_GENERAL.codeLineHeight,
      markdownFormat: {
        ...DEFAULT_MARKDOWN_FORMAT_OPTIONS,
        ...(parsed.markdownFormat && typeof parsed.markdownFormat === "object"
          ? parsed.markdownFormat
          : {}),
      },
      sidebarPanelSides: normalizeSidebarPanelSides(parsed.sidebarPanelSides),
    };
  } catch {
    return DEFAULT_GENERAL;
  }
}

export function saveGeneralSettings(s: GeneralSettings): void {
  localStorage.setItem(GENERAL_SETTINGS_KEY, JSON.stringify(s));
}
