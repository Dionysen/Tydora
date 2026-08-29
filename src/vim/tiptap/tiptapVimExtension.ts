// src/vim/tiptap/tiptapVimExtension.ts
// vim-prose 与 TipTap 编辑器的集成封装。
//
// 职责：
// - 条件性注入 vim-prose 的 VimMode 扩展（enabled=false 时返回空数组）
// - 监听 editor transaction，同步 vim-prose 模式到 VimProvider
// - 将 vim-prose 的 5 种模式映射到应用的 3 态 VimMode
//
// 设计要点：
// - vim-prose 在 insert 模式只拦截 Esc/Ctrl-c，其余按键透传给 ProseMirror 原生处理
// - Leader 键（Space）由 useLeader 在 capture 阶段拦截，vim-prose 收不到
// - g/z 前缀用 passive 模式，which-key 仅作视觉引导，按键由 vim-prose 原生处理

import type { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { VimMode, getVimMode } from "vim-prose/tiptap";
import type { VimMode as AppVimMode } from "../types";

/**
 * vim-prose 模式 → 应用 VimMode 类型。
 * vim-prose 有 5 种模式，应用只需 3 态：
 * - normal → normal
 * - insert → insert
 * - visual / visual-line / replace → visual
 */
export function mapVimMode(mode: string): AppVimMode {
  if (mode === "normal" || mode === "insert") return mode;
  return "visual";
}

/**
 * 条件性返回 vim-prose 的 VimMode 扩展。
 * enabled=false 时返回空数组（不注入任何扩展，零侵入）。
 * enabled=true 时返回 [VimMode]（TipTap Editor 通过 useEditor deps 重建时注入）。
 */
export function createTiptapVimExtensions(enabled: boolean): Extension[] {
  return enabled ? [VimMode] : [];
}

/**
 * 监听 editor transaction，将 vim-prose 模式同步到 VimProvider。
 * 返回清理函数（取消监听）。
 */
export function syncVimMode(
  editor: Editor,
  setMode: (mode: AppVimMode) => void
): () => void {
  const handler = () => {
    const mode = getVimMode(editor);
    setMode(mapVimMode(mode));
  };
  editor.on("transaction", handler);
  // 初始同步
  handler();
  return () => {
    editor.off("transaction", handler);
  };
}
