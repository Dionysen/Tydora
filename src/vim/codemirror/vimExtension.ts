// src/vim/codemirror/vimExtension.ts
// 封装 @replit/codemirror-vim。enabled=false 时返回空数组（零侵入）。
//
// 设计：
// - vim() 扩展自带 normal/insert/visual 三态、hjkl/d/c/y 等操作符
// - 模式切换通过 getCM().on("vim-mode-change", ...) 回调到 React Context
// - 显式 ESC keymap 确保从 insert 返回 normal（Vim.exitInsertMode）
// - Leader/m/g/z 前缀菜单由 useLeader hook 接管，此处只管 vim 扩展

import { Prec } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { vim, getCM, Vim } from "@replit/codemirror-vim";
import type { VimMode } from "../types";

export interface VimAdapterOptions {
  enabled: boolean;
  leaderKey: string;
  onModeChange?: (mode: VimMode) => void;
}

/** cm-vim 的模式字符串到 VimMode 的映射 */
function mapVimMode(mode: string): VimMode {
  if (mode === "insert") return "insert";
  if (mode === "visual") return "visual";
  return "normal";
}

/**
 * CodeMirror Vim 扩展工厂。
 * - enabled=false：返回空数组，不注入任何扩展（零侵入）
 * - enabled=true：返回 [vim() + 模式监听 + 显式 ESC handler]
 */
export function createVimExtension(options: VimAdapterOptions): Extension[] {
  if (!options.enabled) return [];

  const extensions: Extension[] = [
    vim({
      status: false,
    }),

    // 显式 ESC 处理：确保从 insert/visual 返回 normal
    // @replit/codemirror-vim 内置了 ESC 绑定，但某些场景下可能被其他 keymap 截获。
    // 这里用 Prec.highest 确保优先级最高，直接调用 Vim.exitInsertMode。
    Prec.highest(
      keymap.of([
        {
          key: "Escape",
          run: (view: EditorView): boolean => {
            try {
              const cm = getCM(view);
              if (!cm) return false;
              const vimState = (cm as unknown as { state?: { vim?: { mode?: string } } }).state;
              const mode = vimState?.vim?.mode;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cmAny = cm as any;
              if (mode === "insert") {
                Vim.exitInsertMode(cmAny);
                return true;
              }
              if (mode === "visual") {
                Vim.exitVisualMode(cmAny);
                return true;
              }
              // normal 态不拦截，让其他 handler 处理（如关闭 Leader 菜单）
              if (mode === "normal") {
                return false;
              }
              // 未知模式也尝试退出 insert
              Vim.exitInsertMode(cmAny);
              return true;
            } catch {
              return false;
            }
          },
          preventDefault: true,
        },
      ])
    ),

    // 模式监听：cm-vim 通过 CodeMirror 事件系统派发 vim-mode-change
    EditorView.updateListener.of((viewUpdate) => {
      if (!viewUpdate.view.dom.dataset.vimModeListenerAttached) {
        viewUpdate.view.dom.dataset.vimModeListenerAttached = "1";
        try {
          const cm = getCM(viewUpdate.view);
          if (cm && options.onModeChange) {
            cm.on("vim-mode-change", (e: { mode: string }) => {
              options.onModeChange?.(mapVimMode(e.mode));
            });
            options.onModeChange("normal");
          }
        } catch {
          // getCM 在非 vim 扩展环境下会抛错，安全忽略
        }
      }
    }),
  ];

  return extensions;
}
