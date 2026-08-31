import shortcutsConfig from "../config/shortcuts.json";

export interface ShortcutItem {
  id: string;
  label: string;
  keys: string[];
  group?: string;
}

/** 默认快捷键统一从 src/config/shortcuts.json 读取（设置面板中的自定义仍存 localStorage） */
export const DEFAULT_SHORTCUTS: ShortcutItem[] = shortcutsConfig.editor as ShortcutItem[];

export const SHORTCUTS_KEY = "inimark-shortcuts";
