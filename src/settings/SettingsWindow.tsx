import { useState, useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { PhysicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { availableMonitors } from "@tauri-apps/api/window";
import { clampWindowToMonitor } from "../services/windowState";
import { useTranslation } from "react-i18next";
import { loadImageSettings, saveImageSettings, type ImageSettings } from "../services";
import { PublishSettings } from "../publish";
import { loadCanvasSettings, saveCanvasSettings, type CanvasSettings } from "../Canvas/canvas-settings";
import {
  applyFontSettings,
} from "../utils/systemFonts";
import {
  applyMenuDensity,
  applyEditorSpacingFromSettings,
} from "../utils/menuDensity";
import { matchShortcut, loadShortcuts, getShortcutKeys } from "../Editor/shortcuts";
import { track, trackPageview, ANALYTICS_EVENTS } from "../analytics";
import shortcutsConfig from "../config/shortcuts.json";
import {
  loadEditorSettings,
  type EditorSettings,
  EDITOR_SETTINGS_KEY,
  DEFAULT_MINDMAP,
  MINDMAP_SETTINGS_KEY,
  type MindmapSettings,
  DEFAULT_GRAPH,
  GRAPH_SETTINGS_KEY,
  type GraphSettings,
  loadGeneralSettings,
  saveGeneralSettings,
  type GeneralSettings,
} from "../settings-store";
import type { NavGroup, SettingsTab } from "./types";
import { GeneralSettingsContent } from "./panels/GeneralSettings";
import { EditorSettingsContent } from "./panels/EditorSettings";
import { MarkdownSettingsContent } from "./panels/MarkdownSettings";
import { AppearanceSettingsContent } from "./panels/AppearanceSettings";
import { ThemeSettingsContent } from "./panels/ThemeSettings";
import { ShortcutsSettingsContent } from "./panels/ShortcutsSettings";
import { MindmapSettingsContent } from "./panels/MindmapSettings";
import { GraphSettingsContent } from "./panels/GraphSettings";
import { ImageSettingsContent } from "./panels/ImageSettings";
import { CanvasSettingsContent } from "./panels/CanvasSettingsPanel";
import { AboutSettingsContent } from "./panels/AboutSettings";
import "../Settings.css";

const SETTINGS_WINDOW_STATE_KEY = "inimark-settings-window-state";
const SETTINGS_NAV_WIDTH_KEY = "inimark-settings-nav-width";
const SETTINGS_NAV_WIDTH_DEFAULT = 260;
const SETTINGS_NAV_WIDTH_MIN = 180;
const SETTINGS_NAV_WIDTH_MAX = 420;
const SETTINGS_TABS: SettingsTab[] = [
  "general", "editor", "markdown", "appearance", "theme", "shortcuts", "mindmap", "graph", "image", "canvas", "publish", "about",
];

function consumeInitialSettingsTab(): SettingsTab | null {
  try {
    const raw = localStorage.getItem("inimark-settings-initial-tab");
    localStorage.removeItem("inimark-settings-initial-tab");
    if (!raw) return null;
    const saved = raw as SettingsTab;
    if (SETTINGS_TABS.includes(saved)) {
      return saved;
    }
  } catch { }
  return null;
}

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => consumeInitialSettingsTab() ?? "general");
  const [navWidth, setNavWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(SETTINGS_NAV_WIDTH_KEY));
      if (Number.isFinite(saved)) {
        return Math.max(SETTINGS_NAV_WIDTH_MIN, Math.min(SETTINGS_NAV_WIDTH_MAX, saved));
      }
    } catch { }
    return SETTINGS_NAV_WIDTH_DEFAULT;
  });
  const [isNavResizing, setIsNavResizing] = useState(false);
  const navResizeStartRef = useRef({ x: 0, width: SETTINGS_NAV_WIDTH_DEFAULT });

  useEffect(() => {
    localStorage.setItem(SETTINGS_NAV_WIDTH_KEY, String(navWidth));
  }, [navWidth]);

  const handleNavResizeMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    navResizeStartRef.current = { x: e.clientX, width: navWidth };
    setIsNavResizing(true);
  }, [navWidth]);

  useEffect(() => {
    if (!isNavResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - navResizeStartRef.current.x;
      const next = navResizeStartRef.current.width + delta;
      setNavWidth(Math.max(SETTINGS_NAV_WIDTH_MIN, Math.min(SETTINGS_NAV_WIDTH_MAX, next)));
    };
    const handleMouseUp = () => setIsNavResizing(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isNavResizing]);

  // 统计：设置窗口打开（所有入口最终都会挂载此窗口，窗口已打开时只聚焦不重复上报）
  useEffect(() => {
    track(ANALYTICS_EVENTS.SETTINGS_OPEN);
    trackPageview("/app/settings");
  }, []);

  // hide 复用后再次打开：切换到命令面板指定的 tab
  useEffect(() => {
    const win = getCurrentWebviewWindow();
    const unlisten = win.listen("settings-reactivate", () => {
      const tab = consumeInitialSettingsTab();
      if (tab) setActiveTab(tab);
      track(ANALYTICS_EVENTS.SETTINGS_OPEN);
    });
    return () => {
      unlisten.then((fn) => fn()).catch(() => { });
    };
  }, []);

  // ── 窗口位置/大小记忆（先尽快 show，避免等 monitor IPC；关闭改为 hide 复用 WebView）──
  const saveWindowStateRef = useRef<() => Promise<void>>(async () => { });
  useEffect(() => {
    const win = getCurrentWebviewWindow();

    const saveWindowState = async () => {
      try {
        const maximized = await win.isMaximized();
        const state: Record<string, unknown> = { maximized };
        if (!maximized) {
          const pos = await win.outerPosition();
          const size = await win.outerSize();
          state.x = pos.x;
          state.y = pos.y;
          state.width = size.width;
          state.height = size.height;
        }
        localStorage.setItem(SETTINGS_WINDOW_STATE_KEY, JSON.stringify(state));
      } catch { }
    };
    saveWindowStateRef.current = saveWindowState;

    (async () => {
      // 1) 同步读 localStorage，尽快还原几何并显示（不等 availableMonitors）
      let pendingClamp: { x: number; y: number; width: number; height: number } | null = null;
      try {
        const saved = localStorage.getItem(SETTINGS_WINDOW_STATE_KEY);
        if (saved) {
          const state = JSON.parse(saved) as {
            x: number; y: number; width: number; height: number; maximized: boolean;
          };
          if (state.width && state.height) {
            pendingClamp = {
              x: state.x ?? 0,
              y: state.y ?? 0,
              width: state.width,
              height: state.height,
            };
            await win.setSize(new PhysicalSize(pendingClamp.width, pendingClamp.height));
            await win.setPosition(new PhysicalPosition(pendingClamp.x, pendingClamp.y));
          }
          if (state.maximized) {
            await win.maximize();
          }
        }
      } catch { }

      await win.show();
      await win.setFocus().catch(() => { });

      // 2) 显示后再用显示器信息微调，避免首开被 IPC 堵住
      if (pendingClamp) {
        try {
          const monitors = await availableMonitors();
          if (monitors && monitors.length > 0) {
            const clamped = clampWindowToMonitor(pendingClamp, monitors);
            if (
              clamped.x !== pendingClamp.x ||
              clamped.y !== pendingClamp.y ||
              clamped.width !== pendingClamp.width ||
              clamped.height !== pendingClamp.height
            ) {
              await win.setSize(new PhysicalSize(clamped.width, clamped.height));
              await win.setPosition(new PhysicalPosition(clamped.x, clamped.y));
            }
          }
        } catch { }
      }
    })();

    let moveTimer: ReturnType<typeof setTimeout>;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const unlistenMove = win.onMoved(() => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(saveWindowState, 300);
    });

    const unlistenResize = win.onResized(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(saveWindowState, 300);
    });

    // 系统关闭（红绿灯 / Alt+F4）改为隐藏，保留 WebView 以便下次瞬时打开
    const unlistenClose = win.onCloseRequested(async (event) => {
      event.preventDefault();
      try {
        await saveWindowStateRef.current();
      } catch { }
      await win.hide().catch(() => { });
    });

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(resizeTimer);
      unlistenMove.then((fn) => fn()).catch(() => { });
      unlistenResize.then((fn) => fn()).catch(() => { });
      unlistenClose.then((fn) => fn()).catch(() => { });
    };
  }, []);

  // 通用设置状态
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => loadGeneralSettings());

  // 保存通用设置到 localStorage，并立即应用菜单密度 / 间距 / 字体相关 CSS 变量
  useEffect(() => {
    saveGeneralSettings(generalSettings);
    applyMenuDensity(generalSettings.menuDensity);
    applyEditorSpacingFromSettings(generalSettings);
    applyFontSettings({
      uiFont: generalSettings.uiFont,
      editorFont: generalSettings.editorFont,
      codeFont: generalSettings.codeFont,
      codeFontSize: generalSettings.codeFontSize,
    });
    document.documentElement.style.setProperty(
      "--editor-font-size",
      generalSettings.fontSize + "px",
    );
  }, [generalSettings]);

  // 思维导图设置状态
  const [mindmapSettings, setMindmapSettings] = useState<MindmapSettings>(() => {
    try {
      const saved = localStorage.getItem(MINDMAP_SETTINGS_KEY);
      return saved ? { ...DEFAULT_MINDMAP, ...JSON.parse(saved) } : DEFAULT_MINDMAP;
    } catch {
      return DEFAULT_MINDMAP;
    }
  });

  // 保存思维导图设置到 localStorage
  useEffect(() => {
    localStorage.setItem(MINDMAP_SETTINGS_KEY, JSON.stringify(mindmapSettings));
  }, [mindmapSettings]);

  // 关系图谱设置状态
  const [graphSettings, setGraphSettings] = useState<GraphSettings>(() => {
    try {
      const saved = localStorage.getItem(GRAPH_SETTINGS_KEY);
      return saved ? { ...DEFAULT_GRAPH, ...JSON.parse(saved) } : DEFAULT_GRAPH;
    } catch {
      return DEFAULT_GRAPH;
    }
  });

  // 保存关系图谱设置到 localStorage
  useEffect(() => {
    localStorage.setItem(GRAPH_SETTINGS_KEY, JSON.stringify(graphSettings));
  }, [graphSettings]);

  // 图像设置状态
  const [imageSettings, setImageSettings] = useState<ImageSettings>(() => loadImageSettings());

  // 保存图像设置到 localStorage
  useEffect(() => {
    saveImageSettings(imageSettings);
  }, [imageSettings]);

  // 编辑器设置状态
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => loadEditorSettings());

  // 保存编辑器设置到 localStorage
  useEffect(() => {
    localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(editorSettings));
  }, [editorSettings]);

  // 白板设置状态
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(() => loadCanvasSettings());

  // 保存白板设置到 localStorage
  useEffect(() => {
    saveCanvasSettings(canvasSettings);
  }, [canvasSettings]);

  const handleClose = useCallback(async () => {
    const win = getCurrentWebviewWindow();
    try {
      await saveWindowStateRef.current();
    } catch { }
    // 隐藏而非销毁，下次打开直接 show（避免重建 WebView）
    await win.hide().catch(() => { });
  }, []);

  // Ctrl+W / Ctrl+,（macOS：⌘）关闭设置窗口
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        handleClose();
        return;
      }
      const keys = getShortcutKeys(loadShortcuts(), "open-settings");
      const fallback = shortcutsConfig.app["open-settings"] ?? ["Ctrl", ","];
      if (matchShortcut(e, keys.length ? keys : fallback)) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation groups with search terms
  const navGroups: NavGroup[] = [
    {
      title: t("settings.tabs.groupGeneral"),
      items: [
        {
          id: "general", label: t("settings.tabs.general"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ), searchTerms: ["通用", "general", "语言", "language"]
        },
        {
          id: "editor", label: t("settings.tabs.editor"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          ), searchTerms: ["编辑器", "editor", "打字机", "行号", "字体", "保存", "格式化", "CJK", "默认模式", "字数"]
        },
        {
          id: "markdown", label: t("settings.tabs.markdown"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M9 13l2 2 4-4" />
            </svg>
          ), searchTerms: ["Markdown", "markdown", "Callout", "Mermaid", "数学", "LaTeX", "WikiLink", "Frontmatter", "YAML", "表格工具栏", "扩展"]
        },
        {
          id: "appearance", label: t("settings.tabs.appearance"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          ), searchTerms: ["外观", "appearance", "界面", "侧栏", "顶栏", "菜单", "UI字体", "窗口"]
        },
        {
          id: "theme", label: t("settings.tabs.theme"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
              <circle cx="6.5" cy="12" r="0.5" fill="currentColor" stroke="none" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          ), searchTerms: ["主题", "theme", "颜色", "自定义主题", "代码主题", "外观模式"]
        },
        {
          id: "shortcuts", label: t("settings.tabs.shortcuts"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
            </svg>
          ), searchTerms: ["快捷键", "shortcuts", "键盘", "热键"]
        },
        {
          id: "image", label: t("settings.tabs.image"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          ), searchTerms: ["图像", "image", "图片", "上传", "存储"]
        },
      ]
    },
    {
      title: t("settings.tabs.groupFeatures"),
      items: [
        {
          id: "mindmap", label: t("settings.tabs.mindmap"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4a1 1 0 0 1 0 2h-2.7a7.4 7.4 0 0 0-7.2 6H20a1 1 0 0 1 0 2h-9.9a7.4 7.4 0 0 0 7.2 6H20a1 1 0 0 1 0 2h-2.7a9.4 9.4 0 0 1-9.2-8H4a1 1 0 0 1 0-2h4.1a9.4 9.4 0 0 1 9.2-8H20z" />
            </svg>
          ), searchTerms: ["思维导图", "mindmap", "脑图", "布局", "节点"]
        },
        {
          id: "graph", label: t("settings.tabs.graph"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <circle cx="5" cy="19" r="3" />
              <circle cx="19" cy="19" r="3" />
              <line x1="9.5" y1="7" x2="6.5" y2="16.5" />
              <line x1="14.5" y1="7" x2="17.5" y2="16.5" />
              <line x1="7.5" y1="19" x2="16.5" y2="19" />
            </svg>
          ), searchTerms: ["关系图谱", "graph", "知识图谱", "链接图"]
        },
        {
          id: "canvas", label: t("settings.tabs.canvas"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          ), searchTerms: ["白板", "canvas", "画布", "卡片"]
        },
        {
          id: "publish", label: t("settings.tabs.publish"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          ), searchTerms: ["发布", "publish", "导出", "部署", "网站"]
        },
      ]
    },
    {
      title: t("settings.tabs.groupAbout"),
      items: [
        {
          id: "about", label: t("settings.tabs.about"), icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ), searchTerms: ["关于", "about", "版本", "更新", "GitHub"]
        },
      ]
    }
  ];

  // Filter navigation based on search query
  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return item.label.toLowerCase().includes(query) ||
        item.searchTerms?.some(term => term.toLowerCase().includes(query));
    })
  })).filter(group => group.items.length > 0);

  // Flatten for checking if any results
  const hasResults = filteredGroups.some(group => group.items.length > 0);

  return (
    <div className="settings-window">
      {/* 主内容 */}
      <div className="settings-body">
        {/* 左侧菜单 */}
        <nav
          className={`settings-nav${isNavResizing ? " resizing" : ""}`}
          style={{ width: navWidth }}
        >
          {/* 顶部透明拖拽区域：deep 使整条顶栏（含子节点）可拖 */}
          <div className="settings-nav-topbar" data-tauri-drag-region="deep" />
          <div className="settings-nav-content">
            {/* 搜索框 */}
            <div className="settings-nav-search">
              <svg className="settings-nav-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="settings-nav-search-input"
                placeholder={t("settings.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="settings-nav-search-clear"
                  onClick={() => setSearchQuery('')}
                  title={t("settings.searchClear")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* 导航分组 */}
            {hasResults ? (
              filteredGroups.map((group) => (
                <div key={group.title} className="settings-nav-group">
                  <div className="settings-nav-group-title">{group.title}</div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      className={`settings-nav-item${activeTab === item.id ? " active" : ""}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="settings-nav-empty">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
                <span>{t("settings.noResults")}</span>
              </div>
            )}
          </div>
          <div
            className="settings-nav-resize-handle"
            onMouseDown={handleNavResizeMouseDown}
          />
        </nav>

        {/* 右侧内容 */}
        <div className="settings-main-wrapper">
          {/* 内容区域顶部栏 */}
          <div className="settings-main-topbar" data-tauri-drag-region="deep">
            <div className="settings-main-topbar-drag" data-tauri-drag-region="deep" />
            <div className="settings-titlebar-controls" data-tauri-drag-region="false">
              <button
                className="settings-titlebar-btn settings-titlebar-close"
                onClick={handleClose}
                title={t("settings.close")}
              >
                <svg width="14" height="14" viewBox="0 0 10 10">
                  <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.4" />
                  <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>
          </div>
          <main className="settings-main">
            {activeTab === "general" && (
              <GeneralSettingsContent />
            )}
            {activeTab === "editor" && (
              <EditorSettingsContent
                generalSettings={generalSettings}
                onGeneralChange={setGeneralSettings}
                editorSettings={editorSettings}
                onEditorChange={setEditorSettings}
              />
            )}
            {activeTab === "markdown" && (
              <MarkdownSettingsContent
                settings={editorSettings}
                onChange={setEditorSettings}
              />
            )}
            {activeTab === "appearance" && (
              <AppearanceSettingsContent settings={generalSettings} onChange={setGeneralSettings} />
            )}
            {activeTab === "theme" && <ThemeSettingsContent />}
            {activeTab === "shortcuts" && <ShortcutsSettingsContent />}
            {activeTab === "mindmap" && (
              <MindmapSettingsContent settings={mindmapSettings} onChange={setMindmapSettings} />
            )}
            {activeTab === "graph" && (
              <GraphSettingsContent settings={graphSettings} onChange={setGraphSettings} />
            )}
            {activeTab === "image" && (
              <ImageSettingsContent settings={imageSettings} onChange={setImageSettings} />
            )}
            {activeTab === "canvas" && (
              <CanvasSettingsContent settings={canvasSettings} onChange={setCanvasSettings} />
            )}
            {activeTab === "publish" && (
              <PublishSettings />
            )}
            {activeTab === "about" && <AboutSettingsContent />}
          </main>
        </div>
      </div>
    </div>
  );
}
