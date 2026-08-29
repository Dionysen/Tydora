// src/vim/config/configLoader.ts
// Vim 配置加载与持久化。独立 localStorage 键，绝不读写 zmd-shortcuts。

import type { VimConfig } from "../types";
export type { VimConfig };

/** Vim 配置的 localStorage 键（独立于 zmd-shortcuts） */
export const VIM_CONFIG_KEY = "zmd-vim-config";

/** 默认配置：默认关闭，零侵入 */
export const DEFAULT_VIM_CONFIG: VimConfig = {
  enabled: false,
  leaderKey: " ",
  menuTimeout: 3000,
};

/** 从 localStorage 加载 Vim 配置，合并默认值 */
export function loadVimConfig(): VimConfig {
  try {
    const saved = localStorage.getItem(VIM_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<VimConfig>;
      return { ...DEFAULT_VIM_CONFIG, ...parsed };
    }
  } catch {
    // 损坏的配置回退默认值
  }
  return { ...DEFAULT_VIM_CONFIG };
}

/** 保存 Vim 配置到 localStorage */
export function saveVimConfig(config: VimConfig): void {
  try {
    localStorage.setItem(VIM_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // 忽略写入失败（隐私模式等）
  }
}
