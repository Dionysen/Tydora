import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./themes";
import { LanguageProvider } from "./i18n/LanguageContext";
import "./i18n"; // init i18next before first render
import "./themes.css";
import "./global.css";

// 按窗口代码分割：每个窗口只加载自身及其依赖的 chunk，
// 避免启动/打开窗口时解析全部窗口的代码（显著降低首屏与窗口打开耗时）
const App = lazy(() => import("./App"));
const Settings = lazy(() => import("./Settings"));
const VaultManagerWindow = lazy(() => import("./VaultManager/VaultManagerWindow"));
const MindmapWindow = lazy(() => import("./mindmap").then((m) => ({ default: m.MindmapWindow })));
const GraphWindow = lazy(() => import("./graph").then((m) => ({ default: m.GraphWindow })));
const CanvasWindow = lazy(() => import("./Canvas/CanvasWindow"));

// 屏蔽 ResizeObserver 循环警告（调整窗口/侧栏宽度时的良性警告）
// Chromium 的 ResizeObserver 错误走 window.onerror 和 console.error 两条路径
const RESIZE_OBSERVER_MSG = "ResizeObserver loop completed with undelivered notifications";
const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (typeof message === "string" && message.includes(RESIZE_OBSERVER_MSG)) return true;
  if (prevOnError) return prevOnError.call(window, message, source, lineno, colno, error);
  return false;
};
const _origConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = args[0];
  const text = msg instanceof Error ? msg.message : String(msg ?? "");
  if (text.includes(RESIZE_OBSERVER_MSG)) return;
  _origConsoleError(...args);
};

// 屏蔽 React DevTools 下载提示（Tauri 桌面应用无法使用浏览器扩展）
if (import.meta.env.DEV) {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("React DevTools")) return;
    originalLog(...args);
  };
}

function Root() {
  const urlParams = new URLSearchParams(window.location.search);
  const isSettingsWindow = urlParams.get("window") === "settings";
  const isVaultManagerWindow = urlParams.get("window") === "vault-manager";
  const isMindmapWindow = urlParams.get("window") === "mindmap";
  const isGraphWindow = urlParams.get("window") === "graph";
  const isCanvasWindow = urlParams.get("window") === "canvas";
  const initialFilePath = urlParams.get("window") === "editor"
    ? urlParams.get("file")?.replace(/\//g, "\\")
    : null;
  const initialVaultPath = urlParams.get("window") === "editor"
    ? urlParams.get("vault")?.replace(/\//g, "\\")
    : null;

  if (isSettingsWindow) {
    return <Settings />;
  }
  if (isVaultManagerWindow) {
    return <VaultManagerWindow />;
  }
  if (isMindmapWindow) {
    return <MindmapWindow />;
  }
  if (isGraphWindow) {
    return <GraphWindow />;
  }
  if (isCanvasWindow) {
    return <CanvasWindow />;
  }
  return <App initialFilePath={initialFilePath} initialVaultPath={initialVaultPath} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider>
    <LanguageProvider>
      <Suspense fallback={null}>
        <Root />
      </Suspense>
    </LanguageProvider>
  </ThemeProvider>,
);
