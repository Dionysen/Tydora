// src/vim/types.ts
// Vim 模块类型定义。仅模块内部使用，不对外导出（对外入口见 index.ts）。

/** Vim 三态模式。TipTap 编辑器恒为 insert。 */
export type VimMode = "normal" | "insert" | "visual";

/** Vim 模块运行时状态 */
export interface VimState {
  /** 是否启用 Vim 模式（默认 false，关闭时模块零开销） */
  enabled: boolean;
  /** 当前模式（仅 CodeMirror 源码模式有效；TipTap 恒为 insert） */
  mode: VimMode;
  /** Leader 键（默认 " " 空格，仅 normal 态触发） */
  leaderKey: string;
  /** TipTap 下触发 Leader 菜单的键（默认 ";"，避免与空格冲突） */
  tiptapLeaderKey: string;
  /** Leader 菜单超时自动关闭（ms） */
  menuTimeout: number;
}

/** Vim 设置（持久化在 localStorage["zmd-vim-config"]） */
export interface VimConfig {
  enabled: boolean;
  leaderKey: string;
  tiptapLeaderKey: string;
  menuTimeout: number;
}

/** Leader 菜单项 */
export interface LeaderItem {
  /** 触发键（单字符，如 "b"） */
  key: string;
  /** 显示名 */
  label: string;
  /** 动作 id（命名空间：editor.* / app.* / vim.*） */
  action?: string;
  /** 子菜单（与 action 互斥） */
  children?: LeaderItem[];
}

/** Leader 菜单根配置 */
export interface LeaderConfig {
  leader: string;
  timeout: number;
  items: LeaderItem[];
}
