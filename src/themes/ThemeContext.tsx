import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { bootStart, bootEnd, bootStamp } from "../boot-timing";
import { emit, listen } from "@tauri-apps/api/event";
import { isBuiltinTheme } from "./ThemeManager";
import { getCodeThemeVariables, getDefaultCodeTheme } from "./codeThemes";
import {
  loadManifest,
  importTheme as importThemeManager,
  deleteTheme as deleteThemeManager,
  getCustomThemeCss,
  buildThemeCss,
  createThemeFromVariables as createThemeFromVariablesFs,
  persistThemeVariables,
  loadCodeThemeManifest,
  importCodeThemeFile,
  deleteCodeThemeFile,
  getCodeThemeCss,
  buildCodeThemeCss,
  createCodeThemeFromVariables as createCodeThemeFromVariablesFs,
  persistCodeThemeVariables,
  extractCodeThemePreviewColors,
  parseCssVariables,
  type ThemeManifest,
  type ThemeVariable,
} from "./CustomThemeManager";
import { type CustomCodeTheme } from "./codeThemes";
import { getBuiltinThemeVariables, getTemplateVariables } from "./themeTokens";
import {
  getBuiltinCodeThemeVariables,
  getBuiltinCodeThemeIsDark,
} from "./codeThemeTokens";

export type ThemeName = string;

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  customThemes: ThemeManifest[];
  importTheme: (filePath: string, name: string) => Promise<ThemeManifest>;
  deleteTheme: (id: string) => Promise<void>;
  updateThemeVariables: (id: string, variables: ThemeVariable[]) => Promise<void>;
  previewThemeVariables: (id: string, variables: ThemeVariable[]) => void;
  createThemeFromBuiltin: (builtinId: string, name: string) => Promise<ThemeManifest>;
  createThemeFromTemplate: (kind: "light" | "dark", name: string) => Promise<ThemeManifest>;
  refreshCustomThemes: () => Promise<void>;
  codeTheme: string;
  setCodeTheme: (id: string) => void;
  customCodeThemes: CustomCodeTheme[];
  importCodeTheme: (filePath: string, name: string) => Promise<CustomCodeTheme>;
  deleteCodeTheme: (id: string) => Promise<void>;
  createCodeThemeFromBuiltin: (builtinId: string, name: string) => Promise<CustomCodeTheme>;
  updateCodeThemeVariables: (id: string, variables: ThemeVariable[], isDark?: boolean) => Promise<void>;
  previewCodeThemeVariables: (id: string, variables: ThemeVariable[]) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "mint",
  setTheme: () => {},
  customThemes: [],
  importTheme: async () => ({ id: "", name: "", fileName: "", importedAt: "" }),
  deleteTheme: async () => {},
  updateThemeVariables: async () => {},
  previewThemeVariables: () => {},
  createThemeFromBuiltin: async () => ({ id: "", name: "", fileName: "", importedAt: "" }),
  createThemeFromTemplate: async () => ({ id: "", name: "", fileName: "", importedAt: "" }),
  refreshCustomThemes: async () => {},
  codeTheme: "github-light",
  setCodeTheme: () => {},
  customCodeThemes: [],
  importCodeTheme: async () => ({ id: "", name: "", fileName: "", importedAt: "", isDark: false }),
  deleteCodeTheme: async () => {},
  createCodeThemeFromBuiltin: async () => ({ id: "", name: "", fileName: "", importedAt: "", isDark: false }),
  updateCodeThemeVariables: async () => {},
  previewCodeThemeVariables: () => {},
});
const STORAGE_KEY = "zmd-theme";
const EVENT_NAME = "theme-changed";
/** 跨窗口同步自定义主题 CSS（设置窗预览/保存时主窗口也要更新） */
const THEME_CSS_EVENT = "theme-css-updated";
/** 跨窗口同步代码高亮主题选择 */
const CODE_THEME_EVENT = "code-theme-changed";
/** 跨窗口同步自定义代码主题 CSS */
const CODE_THEME_CSS_EVENT = "code-theme-css-updated";

type ThemeCssPayload = { id: string; css: string; enable: boolean };
type CodeThemeCssPayload = { id: string; css: string; enable: boolean };

export function ThemeProvider({ children }: { children: ReactNode }) {
  bootStart("theme_provider_init");
  bootStamp("theme_before_init");
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || "mint";
    } catch {
      return "mint";
    }
  });

  const [customThemes, setCustomThemes] = useState<ThemeManifest[]>([]);
  const styleElementsRef = useRef<Map<string, HTMLStyleElement>>(new Map());
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const CODE_THEME_KEY = "zmd-code-theme";

  const [codeTheme, setCodeThemeState] = useState<string>(() => {
    try {
      return localStorage.getItem(CODE_THEME_KEY) || "github-light";
    } catch {
      return "github-light";
    }
  });

  const [customCodeThemes, setCustomCodeThemes] = useState<CustomCodeTheme[]>([]);

  // ── Load custom themes on mount ──
  const refreshCustomThemes = useCallback(async () => {
    try {
      const manifests = await loadManifest();
      setCustomThemes(manifests);

      // Inject <style> elements for each custom theme
      for (const m of manifests) {
        if (!styleElementsRef.current.has(m.id)) {
          try {
            const css = await getCustomThemeCss(m.id);
            const style = document.createElement("style");
            style.id = `custom-theme-${m.id}`;
            style.textContent = css;
            style.disabled = true;
            document.head.appendChild(style);
            styleElementsRef.current.set(m.id, style);
          } catch {}
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    // 延迟 500ms 加载自定义主题，避免启动时 FS IPC 阻塞首屏
    bootStamp("theme_custom_load_scheduled");
    const timer = setTimeout(() => {
      bootStart("theme_custom_themes_load");
      refreshCustomThemes()
        .catch(() => {})
        .finally(() => bootEnd("theme_custom_themes_load"));
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshCustomThemes]);

  // ── Load custom code themes on mount ──
  const refreshCustomCodeThemes = useCallback(async () => {
    try {
      const manifests = await loadCodeThemeManifest();
      const enriched: CustomCodeTheme[] = [];
      for (const m of manifests) {
        let next = m;
        if (!m.previewColors || m.previewColors.length === 0) {
          try {
            const css = await getCodeThemeCss(m.id);
            next = {
              ...m,
              previewColors: extractCodeThemePreviewColors(parseCssVariables(css)),
            };
          } catch {
            /* ignore */
          }
        }
        enriched.push(next);

        const existing = document.getElementById(`code-theme-${next.id}`);
        if (!existing) {
          const css = await getCodeThemeCss(next.id);
          if (css) {
            const style = document.createElement("style");
            style.id = `code-theme-${next.id}`;
            style.textContent = css;
            (style as HTMLStyleElement).disabled = true;
            document.head.appendChild(style);
          }
        }
      }
      setCustomCodeThemes(enriched);
    } catch {}
  }, []);

  useEffect(() => {
    // 延迟 500ms 加载自定义代码主题，避免启动时 FS IPC 阻塞首屏
    bootStamp("theme_custom_code_load_scheduled");
    const timer = setTimeout(() => {
      bootStart("theme_custom_code_themes_load");
      refreshCustomCodeThemes()
        .catch(() => {})
        .finally(() => bootEnd("theme_custom_code_themes_load"));
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshCustomCodeThemes]);

  // ── Apply theme ──
  useEffect(() => {
    bootStamp("theme_apply_effect_run");
    localStorage.setItem(STORAGE_KEY, theme);

    if (isBuiltinTheme(theme)) {
      document.documentElement.dataset.theme = theme;
      // Disable all custom theme style elements
      styleElementsRef.current.forEach((style) => {
        style.disabled = true;
      });
    } else if (theme.startsWith("custom-")) {
      // Custom theme: extract id from "custom-{id}"
      const id = theme.replace("custom-", "");
      const style = styleElementsRef.current.get(id);
      if (style) {
        // Disable all custom theme style elements first
        styleElementsRef.current.forEach((s) => {
          s.disabled = true;
        });
        // Enable the active one
        style.disabled = false;
      }
      document.documentElement.dataset.theme = theme;
    } else {
      // Unknown theme, fallback to mint
      document.documentElement.dataset.theme = "mint";
    }
  }, [theme]);

  // ── Apply code theme CSS variables ──
  useEffect(() => {
    localStorage.setItem(CODE_THEME_KEY, codeTheme);

    // Disable all custom code theme styles
    customCodeThemes.forEach((m) => {
      const style = document.getElementById(`code-theme-${m.id}`) as HTMLStyleElement | null;
      if (style) style.disabled = true;
    });

    // Remove built-in code theme style
    const existing = document.getElementById("code-theme-vars");
    if (existing) existing.remove();

    // Determine which theme to use
    let actualThemeId = codeTheme;
    if (codeTheme === "auto") {
      const isDark = document.documentElement.dataset.theme?.includes("dark") ||
                     document.documentElement.dataset.theme === "mint-dark";
      actualThemeId = getDefaultCodeTheme(isDark);
    }

    if (actualThemeId.startsWith("custom-")) {
      const style = document.getElementById(`code-theme-${actualThemeId}`) as HTMLStyleElement | null;
      if (style) style.disabled = false;
    } else {
      // Get variables and inject as CSS
      const vars = getCodeThemeVariables(actualThemeId);
      if (Object.keys(vars).length > 0) {
        const css = `:root { ${Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(" ")} }`;
        const style = document.createElement("style");
        style.id = "code-theme-vars";
        style.textContent = css;
        document.head.appendChild(style);
      }
    }

    // 通知编辑器代码主题已变化
    window.dispatchEvent(new CustomEvent("code-theme-changed"));
  }, [codeTheme, theme, customCodeThemes]);

  const injectOrUpdateStyle = useCallback((id: string, css: string, enable: boolean) => {
    let style = styleElementsRef.current.get(id);
    if (!style) {
      style = document.createElement("style");
      style.id = `custom-theme-${id}`;
      document.head.appendChild(style);
      styleElementsRef.current.set(id, style);
    }
    style.textContent = css;
    if (enable) {
      styleElementsRef.current.forEach((s, key) => {
        s.disabled = key !== id;
      });
      style.disabled = false;
    }
  }, []);

  // ── Listen for theme / code-theme changes from other windows ──
  useEffect(() => {
    let unlistenTheme: (() => void) | undefined;
    let unlistenCss: (() => void) | undefined;
    let unlistenCodeTheme: (() => void) | undefined;
    let unlistenCodeCss: (() => void) | undefined;

    listen<ThemeName>(EVENT_NAME, async (event) => {
      const newTheme = event.payload;
      // 其它窗口切到新自定义主题时，本窗口可能还没有对应 <style>（例如刚 fork）
      if (newTheme.startsWith("custom-")) {
        const id = newTheme.replace("custom-", "");
        if (!styleElementsRef.current.has(id)) {
          try {
            const css = await getCustomThemeCss(id);
            injectOrUpdateStyle(id, css, true);
          } catch {
            /* 文件尚未就绪时由后续 theme-css-updated 补上 */
          }
        }
      }
      setThemeState(newTheme);
    }).then((fn) => {
      unlistenTheme = fn;
    });

    listen<ThemeCssPayload>(THEME_CSS_EVENT, (event) => {
      const { id, css, enable } = event.payload;
      injectOrUpdateStyle(id, css, enable);
    }).then((fn) => {
      unlistenCss = fn;
    });

    listen<string>(CODE_THEME_EVENT, async (event) => {
      const id = event.payload;
      if (id.startsWith("custom-")) {
        const existing = document.getElementById(`code-theme-${id}`);
        if (!existing) {
          try {
            const css = await getCodeThemeCss(id);
            if (css) {
              const style = document.createElement("style");
              style.id = `code-theme-${id}`;
              style.textContent = css;
              style.disabled = true;
              document.head.appendChild(style);
            }
          } catch {
            /* ignore */
          }
        }
      }
      setCodeThemeState(id);
    }).then((fn) => {
      unlistenCodeTheme = fn;
    });

    listen<CodeThemeCssPayload>(CODE_THEME_CSS_EVENT, (event) => {
      const { id, css, enable } = event.payload;
      let style = document.getElementById(`code-theme-${id}`) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = `code-theme-${id}`;
        document.head.appendChild(style);
      }
      style.textContent = css;
      if (enable) {
        document.querySelectorAll<HTMLStyleElement>("[id^='code-theme-custom-']").forEach((s) => {
          s.disabled = s.id !== `code-theme-${id}`;
        });
        const builtin = document.getElementById("code-theme-vars");
        if (builtin) builtin.remove();
        style.disabled = false;
        window.dispatchEvent(new CustomEvent("code-theme-changed"));
      } else {
        style.disabled = true;
      }
    }).then((fn) => {
      unlistenCodeCss = fn;
    });

    return () => {
      unlistenTheme?.();
      unlistenCss?.();
      unlistenCodeTheme?.();
      unlistenCodeCss?.();
    };
  }, [injectOrUpdateStyle]);

  // ── Theme actions ──
  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    emit(EVENT_NAME, t).catch(() => {});
  }, []);

  const setCodeTheme = useCallback((id: string) => {
    setCodeThemeState(id);
    emit(CODE_THEME_EVENT, id).catch(() => {});
  }, []);

  const importCodeTheme = useCallback(async (filePath: string, name: string): Promise<CustomCodeTheme> => {
    const manifest = await importCodeThemeFile(filePath, name);
    const css = await getCodeThemeCss(manifest.id);
    if (css) {
      const style = document.createElement("style");
      style.id = `code-theme-${manifest.id}`;
      style.textContent = css;
      style.disabled = true;
      document.head.appendChild(style);
      emit(CODE_THEME_CSS_EVENT, { id: manifest.id, css, enable: false } satisfies CodeThemeCssPayload).catch(() => {});
    }
    setCustomCodeThemes((prev) => [...prev, manifest]);
    return manifest;
  }, []);

  const deleteCodeTheme = useCallback(async (id: string) => {
    await deleteCodeThemeFile(id);
    const style = document.getElementById(`code-theme-${id}`);
    if (style) style.remove();
    setCustomCodeThemes((prev) => prev.filter((m) => m.id !== id));
    if (codeTheme === id) {
      setCodeThemeState("auto");
      emit(CODE_THEME_EVENT, "auto").catch(() => {});
    }
  }, [codeTheme]);

  const injectOrUpdateCodeThemeStyle = useCallback((id: string, css: string, enable: boolean) => {
    let style = document.getElementById(`code-theme-${id}`) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = `code-theme-${id}`;
      document.head.appendChild(style);
    }
    style.textContent = css;
    if (enable) {
      document.querySelectorAll<HTMLStyleElement>("[id^='code-theme-custom-']").forEach((s) => {
        s.disabled = s.id !== `code-theme-${id}`;
      });
      const builtin = document.getElementById("code-theme-vars");
      if (builtin) builtin.remove();
      style.disabled = false;
      window.dispatchEvent(new CustomEvent("code-theme-changed"));
    }
    emit(CODE_THEME_CSS_EVENT, { id, css, enable } satisfies CodeThemeCssPayload).catch(() => {});
  }, []);

  const previewCodeThemeVariables = useCallback((id: string, variables: ThemeVariable[]) => {
    const css = buildCodeThemeCss(variables);
    injectOrUpdateCodeThemeStyle(id, css, true);
  }, [injectOrUpdateCodeThemeStyle]);

  const updateCodeThemeVariables = useCallback(async (
    id: string,
    variables: ThemeVariable[],
    isDark?: boolean,
  ) => {
    const manifest = await persistCodeThemeVariables(id, variables, isDark);
    const css = buildCodeThemeCss(variables);
    injectOrUpdateCodeThemeStyle(id, css, codeTheme === id);
    if (manifest) {
      setCustomCodeThemes((prev) => prev.map((m) => (m.id === id ? manifest : m)));
    }
  }, [codeTheme, injectOrUpdateCodeThemeStyle]);

  const createCodeThemeFromBuiltin = useCallback(async (builtinId: string, name: string) => {
    const vars = getBuiltinCodeThemeVariables(builtinId);
    if (!vars) throw new Error(`Unknown builtin code theme: ${builtinId}`);
    const isDark = getBuiltinCodeThemeIsDark(builtinId);
    const manifest = await createCodeThemeFromVariablesFs(name, vars, isDark);
    const css = await getCodeThemeCss(manifest.id);
    if (css) {
      injectOrUpdateCodeThemeStyle(manifest.id, css, false);
    }
    setCustomCodeThemes((prev) => [...prev, manifest]);
    return manifest;
  }, [injectOrUpdateCodeThemeStyle]);

  const importTheme = useCallback(async (filePath: string, name: string): Promise<ThemeManifest> => {
    const manifest = await importThemeManager(filePath, name);
    // Inject the new style element
    const css = await getCustomThemeCss(manifest.id);
    injectOrUpdateStyle(manifest.id, css, false);
    emit(THEME_CSS_EVENT, { id: manifest.id, css, enable: false } satisfies ThemeCssPayload).catch(() => {});
    // Update state
    setCustomThemes((prev) => [...prev, manifest]);
    return manifest;
  }, [injectOrUpdateStyle]);

  const deleteTheme = useCallback(async (id: string) => {
    await deleteThemeManager(id);
    // Remove style element
    const style = styleElementsRef.current.get(id);
    if (style) {
      style.remove();
      styleElementsRef.current.delete(id);
    }
    // Update state
    setCustomThemes((prev) => prev.filter((m) => m.id !== id));
    // If the deleted theme was active, switch to mint
    if (theme === `custom-${id}`) {
      setTheme("mint");
    }
  }, [theme, setTheme]);

  const previewThemeVariables = useCallback((id: string, variables: ThemeVariable[]) => {
    const css = buildThemeCss(id, variables);
    injectOrUpdateStyle(id, css, true);
    emit(THEME_CSS_EVENT, { id, css, enable: true } satisfies ThemeCssPayload).catch(() => {});
  }, [injectOrUpdateStyle]);

  const updateThemeVariables = useCallback(async (id: string, variables: ThemeVariable[]) => {
    const manifest = await persistThemeVariables(id, variables);
    const css = buildThemeCss(id, variables);
    const enable = themeRef.current === `custom-${id}`;
    injectOrUpdateStyle(id, css, enable);
    emit(THEME_CSS_EVENT, { id, css, enable } satisfies ThemeCssPayload).catch(() => {});
    if (manifest) {
      setCustomThemes((prev) => prev.map((m) => (m.id === id ? manifest : m)));
    }
  }, [injectOrUpdateStyle]);

  const registerNewTheme = useCallback(async (manifest: ThemeManifest) => {
    const css = await getCustomThemeCss(manifest.id);
    injectOrUpdateStyle(manifest.id, css, false);
    emit(THEME_CSS_EVENT, { id: manifest.id, css, enable: false } satisfies ThemeCssPayload).catch(() => {});
    setCustomThemes((prev) => [...prev, manifest]);
    return manifest;
  }, [injectOrUpdateStyle]);

  const createThemeFromBuiltin = useCallback(async (builtinId: string, name: string) => {
    const vars = getBuiltinThemeVariables(builtinId);
    if (!vars) throw new Error(`Unknown builtin theme: ${builtinId}`);
    const manifest = await createThemeFromVariablesFs(name, vars);
    await registerNewTheme(manifest);
    return manifest;
  }, [registerNewTheme]);

  const createThemeFromTemplate = useCallback(async (kind: "light" | "dark", name: string) => {
    const vars = getTemplateVariables(kind);
    const manifest = await createThemeFromVariablesFs(name, vars);
    await registerNewTheme(manifest);
    return manifest;
  }, [registerNewTheme]);

  bootStamp("theme_provider_render_children");
  bootEnd("theme_provider_init");
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        customThemes,
        importTheme,
        deleteTheme,
        updateThemeVariables,
        previewThemeVariables,
        createThemeFromBuiltin,
        createThemeFromTemplate,
        refreshCustomThemes,
        codeTheme,
        setCodeTheme,
        customCodeThemes,
        importCodeTheme,
        deleteCodeTheme,
        createCodeThemeFromBuiltin,
        updateCodeThemeVariables,
        previewCodeThemeVariables,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
