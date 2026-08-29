// src/vim/navigation/useWindowNavigation.ts
// Vim 风格窗口导航。
//
// Ctrl+h/j/k/l → 焦点切换（左/下/上/右）
// Ctrl+H/J/K/L → 移动当前窗格到最左/最下/最上/最右
//
// 所有动作通过 vim-app-action 事件分发到 App.tsx 统一处理，
// 与 <Leader>h/j/k/l、<Leader>H/J/K/L 走同一路径。

import { useEffect } from "react";
import { useVim } from "../VimProvider";

export function useWindowNavigation(): void {
  const { enabled } = useVim();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 仅拦截 Ctrl+h/j/k/l 和 Ctrl+H/J/K/L（无 Alt/Meta）
      if (!e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key;
      const isLower = ["h", "j", "k", "l"].includes(key);
      const isUpper = ["H", "J", "K", "L"].includes(key);
      if (!isLower && !isUpper) return;

      // 不拦截输入框中的 Ctrl+h/j/k/l（如搜索框、终端）
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // 终端 xterm 特殊处理：允许 Ctrl+h/j/k/l 在终端中生效
        if (!target.closest(".xterm") && !target.closest(".terminal-container")) return;
        else return; // 终端中也不拦截
      }

      e.preventDefault();
      e.stopPropagation();

      const dirMap: Record<string, "left" | "down" | "up" | "right"> = {
        h: "left", j: "down", k: "up", l: "right",
        H: "left", J: "down", K: "up", L: "right",
      };
      const dir = dirMap[key];
      const action = isLower ? `app.focus-${dir}` : `app.move-pane-${dir}`;

      window.dispatchEvent(new CustomEvent("vim-app-action", { detail: { action } }));
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled]);
}
