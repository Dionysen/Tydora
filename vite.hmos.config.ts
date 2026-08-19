import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 鸿蒙打包专用构建配置：
//   vite build --config vite.hmos.config.ts --base=./
// 相对路径 base 适配 Web 组件加载 rawfile 资源；
// manualChunks 拆分 5.9MB 主 chunk，加快 Web 组件内解析启动。
function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return undefined;
  }
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
    return "vendor-react";
  }
  if (id.includes("@tiptap")) {
    return "vendor-tiptap";
  }
  if (/[\\/]node_modules[\\/]katex[\\/]/.test(id)) {
    return "vendor-katex";
  }
  if (/[\\/]node_modules[\\/](cytoscape|d3|webcola|cose-base)[\\/]/.test(id)) {
    return "vendor-graph";
  }
  if (/[\\/]node_modules[\\/](lucide-react|framer-motion)[\\/]/.test(id)) {
    return "vendor-ui";
  }
  return "vendor-misc";
}

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
