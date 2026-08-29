// src/vim/filetree/FileTreeVim.tsx
// 文件树 nvim-tree 风格快捷键 HOC。
//
// 设计：
// - 不修改原 FileTree 组件，通过全局 keydown 监听拦截
// - 仅在 Vim enabled 且文件树被点击聚焦时生效
// - 导航（j/k/h/l/Enter）走 DOM 模拟 click
// - 文件操作（a/A/r/d/y）打开右键菜单后自动点击对应项
//
// 快捷键参考 nvim-tree:
// j/k    下上移动
// l/Enter 打开文件 / 展开目录
// h       折叠目录 / 跳到父目录
// a       新建文件
// A       新建文件夹
// r       重命名
// d       删除
// y       复制路径
// q       退出文件树（焦点回到编辑器）

import { useEffect, useRef, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { useVim } from "../VimProvider";

export function FileTreeVim<P extends object>(Wrapped: ComponentType<P>): ComponentType<P> {
  return function VimFileTreeWrapper(props: P) {
    const { enabled } = useVim();
    const { t } = useTranslation();
    const treeActiveRef = useRef(false);
    // 用 ref 持有最新的 t 函数，避免 effect 依赖变化频繁重注册
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
      if (!enabled) return;

      // 点击文件树区域时标记为 active，点击其他区域时取消
      const handleClick = (e: MouseEvent) => {
        const tree = document.querySelector(".sidebar-tree");
        treeActiveRef.current = !!tree && tree.contains(e.target as Node);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!treeActiveRef.current) return;

        // 重命名输入框中不拦截
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.isContentEditable) return;

        // 右键菜单已打开时不拦截（让用户操作菜单）
        if (document.querySelector(".context-menu")) return;

        const tree = document.querySelector(".sidebar-tree");
        if (!tree) return;

        const allItems = Array.from(
          tree.querySelectorAll<HTMLElement>(".tree-node[data-path]")
        );
        // 排除根容器自身（它也有 data-path）
        const items = allItems.filter((el) => !el.classList.contains("sidebar-tree"));
        if (items.length === 0) return;

        const activeItem = items.find((el) => el.classList.contains("active"));
        const currentIdx = activeItem ? items.indexOf(activeItem) : -1;

        let handled = false;

        switch (e.key) {
          case "j": {
            handled = true;
            const next = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, items.length - 1);
            items[next]?.click();
            break;
          }
          case "k": {
            handled = true;
            const prev = currentIdx < 0 ? 0 : Math.max(currentIdx - 1, 0);
            items[prev]?.click();
            break;
          }
          case "l":
          case "Enter": {
            handled = true;
            activeItem?.click();
            break;
          }
          case "h": {
            handled = true;
            if (activeItem) {
              const isDir = activeItem.dataset.isDir === "1";
              const chevron = activeItem.querySelector(".tree-chevron");
              const isExpanded = chevron?.classList.contains("expanded");

              if (isDir && isExpanded) {
                // 折叠当前目录
                activeItem.click();
              } else {
                // 跳到父目录节点
                const branch = activeItem.closest(".tree-branch");
                const parentChildren = branch?.parentElement;
                const parentBranch = parentChildren?.closest(".tree-branch");
                const parentNode = parentBranch?.querySelector(
                  ":scope > .tree-node"
                ) as HTMLElement | null;
                parentNode?.click();
              }
            }
            break;
          }
          case "a": {
            handled = true;
            const ctxTarget = activeItem || (tree as HTMLElement);
            triggerContextAction(ctxTarget, tRef.current("sidebar.contextMenu.newFile"));
            break;
          }
          case "A": {
            handled = true;
            const ctxTarget = activeItem || (tree as HTMLElement);
            triggerContextAction(ctxTarget, tRef.current("sidebar.contextMenu.newFolder"));
            break;
          }
          case "r": {
            handled = true;
            if (activeItem) {
              triggerContextAction(activeItem, tRef.current("sidebar.contextMenu.rename"));
            }
            break;
          }
          case "d": {
            handled = true;
            if (activeItem) {
              triggerContextAction(activeItem, tRef.current("sidebar.contextMenu.delete"));
            }
            break;
          }
          case "y": {
            handled = true;
            if (activeItem) {
              const path = activeItem.getAttribute("data-path") || "";
              navigator.clipboard?.writeText(path).catch(() => {});
            }
            break;
          }
          case "q": {
            handled = true;
            treeActiveRef.current = false;
            const editor = document.querySelector(
              ".editor-container, .codemirror-editor"
            ) as HTMLElement | null;
            editor?.focus();
            break;
          }
        }

        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("click", handleClick, true);
      window.addEventListener("keydown", handleKeyDown, true);
      return () => {
        document.removeEventListener("click", handleClick, true);
        window.removeEventListener("keydown", handleKeyDown, true);
      };
    }, [enabled]);

    return <Wrapped {...props} />;
  };
}

/**
 * 在元素位置触发右键菜单，等 React 渲染后按标签文本点击对应菜单项。
 */
function triggerContextAction(element: HTMLElement, label: string): void {
  const rect = element.getBoundingClientRect();
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + 8,
    clientY: rect.top + 8,
  });
  element.dispatchEvent(event);

  // 等 React 渲染 context-menu 后查找并点击
  requestAnimationFrame(() => {
    const menu = document.querySelector(".context-menu");
    if (!menu) return;
    const menuItems = menu.querySelectorAll<HTMLElement>(".context-menu-item");
    for (const item of menuItems) {
      const labelEl = item.querySelector(".context-menu-label");
      if (labelEl && labelEl.textContent === label) {
        item.click();
        return;
      }
    }
  });
}
