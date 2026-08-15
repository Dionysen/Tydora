import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 防止 Vite 遮盖 Rust 的错误信息
  clearScreen: false,

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
