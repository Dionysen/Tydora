import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 防止 Vite 遮盖 Rust 的错误信息
  clearScreen: false,

  build: {
    rollupOptions: {
      output: {
        // 将重型 vendor 库拆入独立 chunk。
        // 注意：必须先把 React 等共享运行时固定到独立 chunk，
        // 否则 Rollup 可能把它们塞进 tiptap/mermaid vendor，
        // 导致设置等轻量窗口也被迫加载数 MB 无关代码。
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // 共享运行时：绝不能落进 feature vendor
          if (
            /node_modules\/(react-dom|react|scheduler|use-sync-external-store)\//.test(
              id
            )
          ) {
            return "react-vendor";
          }

          // 注意：不要把 mermaid 放进 manualChunks。
          // mermaid 内部大量 dynamic import，会把 Vite 的 __vitePreload
          // 吸进该 vendor；入口的 lazy() 再从那里导入 preload，
          // 导致设置等轻量窗口也静态依赖整包 mermaid（~3MB）。
          // 让 Rollup 按 TipTapEditor 的依赖自动拆分即可。

          if (/node_modules\/katex\//.test(id)) {
            return "katex-vendor";
          }
          if (/node_modules\/(@tiptap\/|prosemirror-)/.test(id)) {
            return "tiptap-vendor";
          }
          if (/node_modules\/(lowlight|highlight\.js)\//.test(id)) {
            return "lowlight-vendor";
          }
          if (/node_modules\/(@codemirror\/|@lezer\/)/.test(id)) {
            return "codemirror-vendor";
          }
          if (/node_modules\/@tauri-apps\//.test(id)) {
            return "tauri-vendor";
          }
          // markdown-it 被 WikiLink 预览与 TipTap 共用，单独成块以免绑死 tiptap-vendor
          if (
            /node_modules\/(markdown-it|linkify-it|mdurl|uc\.micro|entities)\//.test(
              id
            )
          ) {
            return "markdown-vendor";
          }
        },
      },
    },
  },

  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 监听 src-tauri 目录变化会触发不必要的重建
      ignored: [
        "**/src-tauri/**",
        // website 目录仅用于文档与 README 图片，
        // Windows 下被外部程序锁定的图片（EBUSY）会导致 fs.watch 崩溃
        "**/website/**",
      ],
    },
  },
});
