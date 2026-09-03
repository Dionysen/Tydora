import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemeName, type ThemePair } from "../../themes";
import {
  mergeWithSchema,
  buildThemeEditorSections,
  getBuiltinColorMap,
  type ThemeEditorSectionView,
} from "../../themes/themeTokens";
import {
  CODE_THEME_COLOR_SCHEMA,
  CODE_THEME_SAMPLE_SNIPPETS,
  mergeCodeThemeWithSchema,
  codeThemeVarsToPreviewStyle,
} from "../../themes/codeThemeTokens";
import { ThemeColorField } from "../../themes/ThemeColorField";
import { ThemeSizeField } from "../../themes/ThemeSizeField";
import { syncAccentRgb } from "../../themes/colorUtils";
import { CODE_THEMES, type CustomCodeTheme } from "../../themes";
import {
  getCodeThemeCss,
  type ThemeVariable,
  type ThemeManifest,
  parseCssVariables,
  getCustomThemeCss,
  resolveThemePreviewColors,
} from "../../themes/CustomThemeManager";

export function getThemeSlotSelection(id: string, pair: ThemePair): "none" | "light" | "dark" | "both" {
  const light = pair.light === id;
  const dark = pair.dark === id;
  if (light && dark) return "both";
  if (light) return "light";
  if (dark) return "dark";
  return "none";
}

export function ThemeSettingsContent() {
  const { t } = useTranslation();
  const {
    theme,
    appearanceMode,
    setAppearanceMode,
    resolvedMode,
    preferredAppTheme,
    preferredCodeTheme,
    setPreferredAppTheme,
    setPreferredCodeTheme,
    customThemes,
    deleteTheme,
    updateThemeVariables,
    previewThemeVariables,
    createThemeFromBuiltin,
    createThemeFromTemplate,
    codeTheme,
    customCodeThemes,
    deleteCodeTheme,
    createCodeThemeFromBuiltin,
    updateCodeThemeVariables,
    previewCodeThemeVariables,
    renameAppTheme,
    renameCodeTheme,
    exportCurrentThemePack,
    importThemePack,
  } = useTheme();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeManifest | null>(null);
  const [editVariables, setEditVariables] = useState<ThemeVariable[]>([]);
  const [editPreview, setEditPreview] = useState<{
    bg: string;
    accent: string;
    text: string;
    strong: string;
    border: string;
    codeBg: string;
    codeText: string;
    radiusInline: string;
    paddingInlineY: string;
    paddingInlineX: string;
  }>({
    bg: "#ffffff",
    accent: "#4eb289",
    text: "#1e293b",
    strong: "#bd387d",
    border: "#a5cfc0",
    codeBg: "rgba(78, 178, 137, 0.08)",
    codeText: "#e83e8c",
    radiusInline: "4px",
    paddingInlineY: "3px",
    paddingInlineX: "6px",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<
    | { kind: "app"; name: string; id: string }
    | { kind: "code"; name: string; id: string }
    | null
  >(null);
  const [nameDialog, setNameDialog] = useState<{
    open: boolean;
    mode: "export-pack" | "rename-app" | "rename-code";
    id: string;
    defaultName: string;
  }>({ open: false, mode: "export-pack", id: "", defaultName: "" });
  const [themeName, setThemeName] = useState("");
  const [forking, setForking] = useState(false);
  const previewTimerRef = useRef<number | null>(null);

  const [editingCodeTheme, setEditingCodeTheme] = useState<CustomCodeTheme | null>(null);
  const [editCodeVariables, setEditCodeVariables] = useState<ThemeVariable[]>([]);
  const [codeSampleLang, setCodeSampleLang] = useState(CODE_THEME_SAMPLE_SNIPPETS[0].id);
  const [forkingCode, setForkingCode] = useState(false);
  const [themeKindTab, setThemeKindTab] = useState<"app" | "code">("app");
  const codePreviewTimerRef = useRef<number | null>(null);

  const [codeSampleHtml, setCodeSampleHtml] = useState("");
  useEffect(() => {
    let cancelled = false;
    const snippet =
      CODE_THEME_SAMPLE_SNIPPETS.find((s) => s.id === codeSampleLang) ?? CODE_THEME_SAMPLE_SNIPPETS[0];
    import("highlight.js")
      .then(({ default: hljs }) => {
        if (cancelled) return;
        try {
          setCodeSampleHtml(hljs.highlight(snippet.code, { language: snippet.language }).value);
        } catch {
          setCodeSampleHtml(hljs.highlightAuto(snippet.code).value);
        }
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [codeSampleLang]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
      if (codePreviewTimerRef.current) window.clearTimeout(codePreviewTimerRef.current);
    };
  }, []);

  const builtinThemes: { value: ThemeName; label: string; colors: string[] }[] = [
    { value: "white", label: t("settings.theme.white"), colors: ["#ffffff", "#2563eb", "#1e293b", "#d1d9e6"] },
    { value: "mint", label: "Mint", colors: ["#ffffff", "#4eb289", "#1e293b", "#a5cfc0"] },
    { value: "mint-dark", label: "Mint Dark", colors: ["#272729", "#4eb289", "#cccccc", "#39393a"] },
    { value: "modern-dark", label: "Modern Dark", colors: ["#1b1d24", "#74a7fe", "#cccccc", "#111217"] },
    { value: "claude-code", label: "Claude Code", colors: ["#faf8f5", "#c47a2a", "#1a1a1a", "#ddd6cc"] },
    { value: "purple", label: "Purple", colors: ["#faf5ff", "#7c3aed", "#1e1b2e", "#ddd6ee"] },
    { value: "hermes", label: "Hermes", colors: ["#f0f1ff", "#0000f2", "#1a1a4e", "rgba(0,0,242,0.12)"] },
    { value: "next", label: "NexT", colors: ["#fffef8", "#00796b", "#4a4a4a", "#e0ddd6"] },
    { value: "slate", label: "Slate", colors: ["#f8fafc", "#475569", "#0f172a", "#e2e8f0"] },
    { value: "ocean", label: "Ocean", colors: ["#f0f9ff", "#0891b2", "#0c4a6e", "#a5f3fc"] },
  ];

  const renderThemeSlotLabel = (id: string, pair: ThemePair) => {
    const slot = getThemeSlotSelection(id, pair);
    if (slot === "none") return null;
    const labelKey =
      slot === "both" ? "slotLabelBoth" : slot === "dark" ? "slotLabelDark" : "slotLabelLight";
    return (
      <span className={`settings-theme-slot-label slot-${slot}`}>
        {t(`settings.theme.${labelKey}`)}
      </span>
    );
  };

  const updateEditPreview = useCallback((vars: ThemeVariable[]) => {
    const get = (name: string, fallback: string) =>
      vars.find((v) => v.name === name)?.value || fallback;
    setEditPreview({
      bg: get("--bg-primary", "#ffffff"),
      accent: get("--accent", "#4eb289"),
      text: get("--text-primary", "#1e293b"),
      strong: get("--text-strong", "#bd387d"),
      border: get("--border", "#a5cfc0"),
      codeBg: get("--bg-code-inline", "rgba(78, 178, 137, 0.08)"),
      codeText: get("--text-code", "#e83e8c"),
      radiusInline: get("--radius-code-inline", "4px"),
      paddingInlineY: get("--padding-code-inline-y", "3px"),
      paddingInlineX: get("--padding-code-inline-x", "6px"),
    });
  }, []);

  const schedulePreview = useCallback((id: string, vars: ThemeVariable[]) => {
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(() => {
      previewThemeVariables(id, vars);
    }, 120);
  }, [previewThemeVariables]);

  const handleExportPack = useCallback(() => {
    const lightName =
      customThemes.find((m) => `custom-${m.id}` === preferredAppTheme.light)?.name
      || preferredAppTheme.light;
    setNameDialog({
      open: true,
      mode: "export-pack",
      id: "",
      defaultName: lightName,
    });
    setThemeName(lightName);
  }, [customThemes, preferredAppTheme.light]);

  const handleImportPack = useCallback(async () => {
    try {
      setImporting(true);
      const result = await importThemePack();
      if (!result) return;
    } catch (err) {
      console.error(t("settings.theme.importPackFailed"), err);
      alert(`${t("settings.theme.importPackFailed")} ${err instanceof Error ? err.message : t("settings.theme.unknownError")}`);
    } finally {
      setImporting(false);
    }
  }, [importThemePack, t]);

  const handleConfirmNameDialog = useCallback(async () => {
    const name = themeName.trim() || nameDialog.defaultName;
    try {
      if (nameDialog.mode === "export-pack") {
        setExporting(true);
        await exportCurrentThemePack(name);
        setNameDialog({ open: false, mode: "export-pack", id: "", defaultName: "" });
      } else if (nameDialog.mode === "rename-app") {
        await renameAppTheme(nameDialog.id, name);
        setNameDialog({ open: false, mode: "export-pack", id: "", defaultName: "" });
      } else if (nameDialog.mode === "rename-code") {
        await renameCodeTheme(nameDialog.id, name);
        setNameDialog({ open: false, mode: "export-pack", id: "", defaultName: "" });
      }
    } catch (err) {
      console.error(t("settings.theme.renameFailed"), err);
      alert(`${t("settings.theme.renameFailed")} ${err instanceof Error ? err.message : t("settings.theme.unknownError")}`);
    } finally {
      setExporting(false);
    }
  }, [themeName, nameDialog, exportCurrentThemePack, renameAppTheme, renameCodeTheme, t]);

  const handleRenameApp = useCallback((manifest: ThemeManifest) => {
    setNameDialog({ open: true, mode: "rename-app", id: manifest.id, defaultName: manifest.name });
    setThemeName(manifest.name);
  }, []);

  const handleRenameCode = useCallback((manifest: CustomCodeTheme) => {
    setNameDialog({ open: true, mode: "rename-code", id: manifest.id, defaultName: manifest.name });
    setThemeName(manifest.name);
  }, []);

  const handleDelete = useCallback(async (manifest: ThemeManifest) => {
    setDeleteConfirm({ kind: "app", name: manifest.name, id: manifest.id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.kind === "app") {
      await deleteTheme(deleteConfirm.id);
    } else {
      await deleteCodeTheme(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, deleteTheme, deleteCodeTheme]);

  const openEditor = useCallback((manifest: ThemeManifest, variables: ThemeVariable[]) => {
    const merged = syncAccentRgb(
      mergeWithSchema(variables, getBuiltinColorMap("mint") ?? undefined),
    ) as ThemeVariable[];
    setEditVariables(merged);
    updateEditPreview(merged);
    setEditingTheme(manifest);
    setPreferredAppTheme(resolvedMode, `custom-${manifest.id}`);
    previewThemeVariables(manifest.id, merged);
  }, [previewThemeVariables, resolvedMode, setPreferredAppTheme, updateEditPreview]);

  const handleStartEdit = useCallback(async (manifest: ThemeManifest) => {
    try {
      const css = await getCustomThemeCss(manifest.id);
      openEditor(manifest, parseCssVariables(css));
    } catch (err) {
      console.error(t("settings.theme.loadThemeFailed"), err);
    }
  }, [openEditor, t]);

  const handleForkBuiltin = useCallback(async (builtinId: string, label: string) => {
    try {
      setForking(true);
      const name = t("settings.theme.forkedName", { name: label });
      const manifest = await createThemeFromBuiltin(builtinId, name);
      await handleStartEdit(manifest);
    } catch (err) {
      console.error(t("settings.theme.forkFailed"), err);
    } finally {
      setForking(false);
    }
  }, [createThemeFromBuiltin, handleStartEdit, t]);

  const handleCreateBlank = useCallback(async (kind: "light" | "dark") => {
    try {
      setForking(true);
      const name = t("settings.theme.newTheme");
      const manifest = await createThemeFromTemplate(kind, name);
      await handleStartEdit(manifest);
    } catch (err) {
      console.error(t("settings.theme.forkFailed"), err);
    } finally {
      setForking(false);
    }
  }, [createThemeFromTemplate, handleStartEdit, t]);

  const handleVariableChange = useCallback((name: string, newValue: string) => {
    setEditVariables((prev) => {
      let next = prev.map((v) => (v.name === name ? { ...v, value: newValue } : v));
      if (name === "--accent") {
        next = syncAccentRgb(next) as ThemeVariable[];
      }
      updateEditPreview(next);
      if (editingTheme) {
        schedulePreview(editingTheme.id, next);
      }
      return next;
    });
  }, [editingTheme, schedulePreview, updateEditPreview]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingTheme) return;
    const synced = syncAccentRgb(editVariables) as ThemeVariable[];
    await updateThemeVariables(editingTheme.id, synced);
    setEditingTheme(null);
  }, [editingTheme, editVariables, updateThemeVariables]);

  const handleCancelEdit = useCallback(async () => {
    if (editingTheme) {
      try {
        const css = await getCustomThemeCss(editingTheme.id);
        previewThemeVariables(editingTheme.id, parseCssVariables(css));
      } catch {
        /* ignore */
      }
    }
    setEditingTheme(null);
  }, [editingTheme, previewThemeVariables]);

  const handleDeleteCodeTheme = useCallback((m: CustomCodeTheme) => {
    setDeleteConfirm({ kind: "code", name: m.name, id: m.id });
  }, []);

  const scheduleCodePreview = useCallback((id: string, vars: ThemeVariable[]) => {
    if (codePreviewTimerRef.current) window.clearTimeout(codePreviewTimerRef.current);
    codePreviewTimerRef.current = window.setTimeout(() => {
      previewCodeThemeVariables(id, vars);
    }, 80);
  }, [previewCodeThemeVariables]);

  const openCodeEditor = useCallback((manifest: CustomCodeTheme, variables: ThemeVariable[]) => {
    const merged = mergeCodeThemeWithSchema(variables);
    setEditCodeVariables(merged);
    setEditingCodeTheme(manifest);
    setPreferredCodeTheme(resolvedMode, manifest.id);
    previewCodeThemeVariables(manifest.id, merged);
  }, [previewCodeThemeVariables, resolvedMode, setPreferredCodeTheme]);

  const handleStartEditCodeTheme = useCallback(async (manifest: CustomCodeTheme) => {
    try {
      const css = await getCodeThemeCss(manifest.id);
      openCodeEditor(manifest, parseCssVariables(css));
    } catch (err) {
      console.error(t("settings.theme.loadThemeFailed"), err);
    }
  }, [openCodeEditor, t]);

  const handleForkCodeTheme = useCallback(async (builtinId: string, label: string) => {
    try {
      setForkingCode(true);
      const name = t("settings.theme.forkedName", { name: label });
      const manifest = await createCodeThemeFromBuiltin(builtinId, name);
      await handleStartEditCodeTheme(manifest);
    } catch (err) {
      console.error(t("settings.theme.forkFailed"), err);
    } finally {
      setForkingCode(false);
    }
  }, [createCodeThemeFromBuiltin, handleStartEditCodeTheme, t]);

  const handleCodeVariableChange = useCallback((name: string, newValue: string) => {
    setEditCodeVariables((prev) => {
      const next = prev.map((v) => (v.name === name ? { ...v, value: newValue } : v));
      if (editingCodeTheme) {
        scheduleCodePreview(editingCodeTheme.id, next);
      }
      return next;
    });
  }, [editingCodeTheme, scheduleCodePreview]);

  const handleSaveCodeEdit = useCallback(async () => {
    if (!editingCodeTheme) return;
    await updateCodeThemeVariables(editingCodeTheme.id, editCodeVariables);
    setEditingCodeTheme(null);
  }, [editingCodeTheme, editCodeVariables, updateCodeThemeVariables]);

  const handleCancelCodeEdit = useCallback(async () => {
    if (editingCodeTheme) {
      try {
        const css = await getCodeThemeCss(editingCodeTheme.id);
        previewCodeThemeVariables(editingCodeTheme.id, parseCssVariables(css));
      } catch {
        /* ignore */
      }
    }
    setEditingCodeTheme(null);
  }, [editingCodeTheme, previewCodeThemeVariables]);

  const editorSections: ThemeEditorSectionView[] | null = editingTheme
    ? buildThemeEditorSections(editVariables)
    : null;

  const codePreviewStyle = editingCodeTheme
    ? (codeThemeVarsToPreviewStyle(editCodeVariables) as CSSProperties)
    : undefined;

  if (editingCodeTheme) {
    return (
      <div className="settings-section theme-editor code-theme-editor">
        <div className="theme-editor-sticky">
          <div className="theme-editor-header">
            <button className="theme-editor-back" onClick={handleCancelCodeEdit}>
              {t("settings.theme.back")}
            </button>
            <h3 className="settings-section-title">
              {t("settings.theme.editCodeTheme", { name: editingCodeTheme.name })}
            </h3>
            <div className="theme-editor-actions">
              <button className="settings-button" onClick={handleSaveCodeEdit}>{t("settings.theme.save")}</button>
              <button className="settings-button theme-editor-cancel" onClick={handleCancelCodeEdit}>{t("settings.theme.cancel")}</button>
            </div>
          </div>

          <div className="settings-code-theme-preview code-theme-editor-preview">
            <div className="settings-code-theme-preview-toolbar">
              <div className="settings-code-theme-preview-title">{t("settings.theme.preview")}</div>
              <div className="settings-code-sample-tabs">
                {CODE_THEME_SAMPLE_SNIPPETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`settings-code-sample-tab${codeSampleLang === s.id ? " active" : ""}`}
                    onClick={() => setCodeSampleLang(s.id)}
                  >
                    {t(`settings.theme.${s.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>
            <pre
              className="settings-code-theme-preview-code"
              style={codePreviewStyle}
            >
              <code dangerouslySetInnerHTML={{ __html: codeSampleHtml }} />
            </pre>
          </div>
        </div>

        <div className="theme-editor-variables">
          <div className="theme-editor-group">
            <h4 className="theme-editor-group-title">{t("settings.theme.groupCodeHighlight")}</h4>
            {CODE_THEME_COLOR_SCHEMA.map((token) => {
              const variable = editCodeVariables.find((v) => v.name === token.name);
              if (!variable) return null;
              return (
                <ThemeColorField
                  key={token.name}
                  label={t(`settings.theme.token.${token.labelKey}`)}
                  varName={token.name}
                  value={variable.value}
                  onChange={(val) => handleCodeVariableChange(token.name, val)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (editingTheme && editorSections) {
    return (
      <div className="settings-section theme-editor">
        <div className="theme-editor-sticky">
          <div className="theme-editor-header">
            <button className="theme-editor-back" onClick={handleCancelEdit}>
              {t("settings.theme.back")}
            </button>
            <h3 className="settings-section-title">
              {t("settings.theme.editTheme", { name: editingTheme.name })}
            </h3>
            <div className="theme-editor-actions">
              <button className="settings-button" onClick={handleSaveEdit}>{t("settings.theme.save")}</button>
              <button className="settings-button theme-editor-cancel" onClick={handleCancelEdit}>{t("settings.theme.cancel")}</button>
            </div>
          </div>

          <div
            className="theme-editor-preview theme-editor-preview-rich"
            style={{ background: editPreview.bg, borderColor: editPreview.accent }}
          >
            <div className="theme-editor-preview-sidebar" style={{ background: editVariables.find((v) => v.name === "--bg-secondary")?.value }}>
              <div className="theme-editor-preview-line" style={{ background: editPreview.accent, width: "70%" }} />
              <div className="theme-editor-preview-line" style={{ background: editPreview.text, opacity: 0.35, width: "55%" }} />
            </div>
            <div className="theme-editor-preview-editor">
              <div className="theme-editor-preview-text" style={{ color: editPreview.text }}>
                {t("settings.theme.previewText")}
              </div>
              <div className="theme-editor-preview-text" style={{ color: editPreview.strong, fontWeight: 700 }}>
                {t("settings.theme.previewStrong")}
                {" "}
                <code
                  className="theme-editor-preview-inline-code"
                  style={{
                    background: editPreview.codeBg,
                    color: editPreview.codeText,
                    borderColor: editPreview.border,
                    borderRadius: editPreview.radiusInline,
                    padding: `${editPreview.paddingInlineY} ${editPreview.paddingInlineX}`,
                  }}
                >
                  {t("settings.theme.previewInlineCode")}
                </code>
              </div>
              <div className="theme-editor-preview-accent" style={{ background: editPreview.accent }}>
                {t("settings.theme.accent")}
              </div>
            </div>
          </div>
        </div>

        <div className="theme-editor-variables">
          {editorSections.map((section) => (
            <div key={section.id} className="theme-editor-group">
              <h4 className="theme-editor-group-title">
                {t(`settings.theme.${section.titleKey}`)}
              </h4>
              {section.fields.map((field) => {
                if (field.kind === "color") {
                  const label = t(`settings.theme.token.${field.meta.labelKey}`);
                  return (
                    <ThemeColorField
                      key={field.variable.name}
                      label={label}
                      varName={field.variable.name}
                      value={field.variable.value}
                      onChange={(val) => handleVariableChange(field.variable.name, val)}
                    />
                  );
                }
                return (
                  <ThemeSizeField
                    key={field.variable.name}
                    label={t(`settings.theme.token.${field.meta.labelKey}`)}
                    varName={field.variable.name}
                    value={field.variable.value}
                    meta={field.meta}
                    onChange={(val) => handleVariableChange(field.variable.name, val)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">{t("settings.theme.appearanceMode")}</h3>
      <p className="settings-hint" style={{ marginTop: -8, marginBottom: 12 }}>
        {t("settings.theme.appearanceModeHint")}
      </p>
      <div className="appearance-mode-toggle" role="radiogroup" aria-label={t("settings.theme.appearanceMode")}>
        {([
          ["system", "appearanceSystem"],
          ["light", "appearanceLight"],
          ["dark", "appearanceDark"],
        ] as const).map(([mode, labelKey]) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={appearanceMode === mode}
            className={`appearance-mode-btn${appearanceMode === mode ? " active" : ""}`}
            onClick={() => setAppearanceMode(mode)}
          >
            {t(`settings.theme.${labelKey}`)}
          </button>
        ))}
      </div>
      <p className="settings-hint appearance-mode-status">
        {t("settings.theme.appearanceStatus", {
          mode: t(`settings.theme.${resolvedMode === "dark" ? "appearanceDark" : "appearanceLight"}`),
          app: (() => {
            const builtin = builtinThemes.find((b) => b.value === theme);
            if (builtin) return builtin.label;
            if (theme.startsWith("custom-")) {
              const id = theme.replace("custom-", "");
              return customThemes.find((m) => m.id === id)?.name || theme;
            }
            return theme;
          })(),
          code: (() => {
            const builtin = CODE_THEMES.find((c) => c.id === codeTheme);
            if (builtin) return builtin.name;
            return customCodeThemes.find((m) => m.id === codeTheme)?.name || codeTheme;
          })(),
        })}
      </p>

      <div className="theme-kind-tabs" role="tablist" aria-label={t("settings.theme.appTheme")}>
        {([
          ["app", "appTheme"],
          ["code", "codeTheme"],
        ] as const).map(([tab, labelKey]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={themeKindTab === tab}
            className={`theme-kind-tab${themeKindTab === tab ? " active" : ""}`}
            onClick={() => setThemeKindTab(tab)}
          >
            {t(`settings.theme.${labelKey}`)}
          </button>
        ))}
      </div>
      <p className="settings-hint" style={{ marginTop: 8, marginBottom: 12 }}>
        {t("settings.theme.slotHint", {
          mode: t(`settings.theme.${resolvedMode === "dark" ? "appearanceDark" : "appearanceLight"}`),
        })}
      </p>

      {themeKindTab === "app" ? (
      <div className="settings-theme-grid">
        {builtinThemes.map((item) => {
            const preferred = theme === item.value;
            return (
              <div
                key={item.value}
                className={`settings-theme-card${preferred ? " active" : ""}`}
                onClick={() => setPreferredAppTheme(resolvedMode, item.value)}
              >
                <div className="settings-theme-preview" data-theme={item.value}>
                  <div className="theme-preview-mock">
                    <div className="mock-titlebar" style={{ background: item.colors[0] }}>
                      <div className="mock-dots">
                        <span style={{ background: item.colors[1] }} />
                        <span style={{ background: item.colors[3] }} />
                        <span style={{ background: item.colors[3] }} />
                      </div>
                    </div>
                    <div className="mock-body">
                      <div className="mock-sidebar" style={{ background: item.colors[3] }}>
                        <div className="mock-line" style={{ background: item.colors[1], width: "60%" }} />
                        <div className="mock-line" style={{ background: item.colors[2], opacity: 0.3, width: "80%" }} />
                        <div className="mock-line" style={{ background: item.colors[2], opacity: 0.3, width: "45%" }} />
                      </div>
                      <div className="mock-editor" style={{ background: item.colors[0] }}>
                        <div className="mock-line" style={{ background: item.colors[2], opacity: 0.2, width: "70%" }} />
                        <div className="mock-line" style={{ background: item.colors[2], opacity: 0.15, width: "55%" }} />
                        <div className="mock-accent-line" style={{ background: item.colors[1], width: "40%" }} />
                      </div>
                    </div>
                  </div>
                  {preferred && (
                    <div className="settings-theme-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="custom-theme-actions">
                    <button
                      className="custom-theme-edit-btn"
                      title={t("settings.theme.forkAndEdit")}
                      disabled={forking}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForkBuiltin(item.value, item.label);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="settings-theme-meta">
                  <span className="settings-theme-name">{item.label}</span>
                  {renderThemeSlotLabel(item.value, preferredAppTheme)}
                </div>
              </div>
            );
          })}

        <div className="settings-theme-divider" role="separator">
          {t("settings.theme.customThemes")}
        </div>

        {customThemes.map((m) => {
            const themeId = `custom-${m.id}`;
            const preferred = theme === themeId;
            const [c0, c1, c2, c3] = resolveThemePreviewColors(m);
            return (
              <div
                key={m.id}
                className={`settings-theme-card custom-theme-card${preferred ? " active" : ""}`}
                onClick={() => setPreferredAppTheme(resolvedMode, themeId)}
              >
                <div className="settings-theme-preview">
                  <div className="theme-preview-mock">
                    <div className="mock-titlebar" style={{ background: c0 }}>
                      <div className="mock-dots">
                        <span style={{ background: c1 }} />
                        <span style={{ background: c3 }} />
                        <span style={{ background: c3 }} />
                      </div>
                    </div>
                    <div className="mock-body">
                      <div className="mock-sidebar" style={{ background: c3 }}>
                        <div className="mock-line" style={{ background: c1, width: "60%" }} />
                        <div className="mock-line" style={{ background: c2, opacity: 0.3, width: "80%" }} />
                        <div className="mock-line" style={{ background: c2, opacity: 0.3, width: "45%" }} />
                      </div>
                      <div className="mock-editor" style={{ background: c0 }}>
                        <div className="mock-line" style={{ background: c2, opacity: 0.2, width: "70%" }} />
                        <div className="mock-line" style={{ background: c2, opacity: 0.15, width: "55%" }} />
                        <div className="mock-accent-line" style={{ background: c1, width: "40%" }} />
                      </div>
                    </div>
                  </div>
                  {preferred && (
                    <div className="settings-theme-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="custom-theme-actions">
                    <button
                      className="custom-theme-edit-btn"
                      title={t("settings.theme.edit")}
                      onClick={(e) => { e.stopPropagation(); handleStartEdit(m); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      className="custom-theme-delete-btn"
                      title={t("settings.theme.delete")}
                      onClick={(e) => { e.stopPropagation(); handleDelete(m); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="settings-theme-meta">
                  <div className="settings-theme-name-row">
                    <span className="settings-theme-name">{m.name}</span>
                    <button
                      type="button"
                      className="settings-theme-rename-btn"
                      title={t("settings.theme.rename")}
                      onClick={(e) => { e.stopPropagation(); handleRenameApp(m); }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                  {renderThemeSlotLabel(themeId, preferredAppTheme)}
                </div>
              </div>
            );
          })}

        <div
          className="settings-theme-card settings-theme-import-card"
          onClick={() => handleCreateBlank(resolvedMode)}
        >
          <div className="settings-theme-preview settings-theme-import-preview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="settings-theme-name">{t("settings.theme.newTheme")}</span>
        </div>
      </div>
      ) : (
      <>
      <div className="settings-theme-grid">
        {CODE_THEMES.map((ct) => {
            const colors = [
              ct.variables["--hljs-keyword"],
              ct.variables["--hljs-string"],
              ct.variables["--hljs-comment"],
              ct.variables["--hljs-number"],
              ct.variables["--hljs-built_in"],
            ];
            const preferred = codeTheme === ct.id;
            return (
              <div
                key={ct.id}
                className={`settings-theme-card${preferred ? " active" : ""}`}
                onClick={() => setPreferredCodeTheme(resolvedMode, ct.id)}
              >
                <div
                  className="settings-theme-preview code-theme-card-preview"
                  style={{ background: ct.isDark ? "#0d1117" : "#f6f8fa" }}
                >
                  <div className="code-theme-card-mock" aria-hidden>
                    {colors.map((c, i) => (
                      <span
                        key={i}
                        className="code-theme-card-line"
                        style={{ background: c, width: `${72 - i * 8}%` }}
                      />
                    ))}
                  </div>
                  {preferred && (
                    <div className="settings-theme-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="custom-theme-actions">
                    <button
                      className="custom-theme-edit-btn"
                      title={t("settings.theme.forkAndEdit")}
                      disabled={forkingCode}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForkCodeTheme(ct.id, ct.name);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="settings-theme-meta">
                  <span className="settings-theme-name">{ct.name}</span>
                  {renderThemeSlotLabel(ct.id, preferredCodeTheme)}
                </div>
              </div>
            );
          })}

        {customCodeThemes.length > 0 && (
          <div className="settings-theme-divider" role="separator">
            {t("settings.theme.customThemes")}
          </div>
        )}

        {customCodeThemes.map((m) => {
            const colors = m.previewColors ?? ["#d73a49", "#032f62", "#6a737d", "#005cc5", "#e36209"];
            const preferred = codeTheme === m.id;
            return (
              <div
                key={m.id}
                className={`settings-theme-card custom-theme-card${preferred ? " active" : ""}`}
                onClick={() => setPreferredCodeTheme(resolvedMode, m.id)}
              >
                <div
                  className="settings-theme-preview code-theme-card-preview"
                  style={{ background: m.isDark ? "#0d1117" : "#f6f8fa" }}
                >
                  <div className="code-theme-card-mock" aria-hidden>
                    {colors.slice(0, 5).map((c, i) => (
                      <span
                        key={i}
                        className="code-theme-card-line"
                        style={{ background: c, width: `${72 - i * 8}%` }}
                      />
                    ))}
                  </div>
                  {preferred && (
                    <div className="settings-theme-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="custom-theme-actions">
                    <button
                      className="custom-theme-edit-btn"
                      title={t("settings.theme.edit")}
                      onClick={(e) => { e.stopPropagation(); handleStartEditCodeTheme(m); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      className="custom-theme-delete-btn"
                      title={t("settings.theme.deleteBtn")}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCodeTheme(m); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="settings-theme-meta">
                  <div className="settings-theme-name-row">
                    <span className="settings-theme-name">{m.name}</span>
                    <button
                      type="button"
                      className="settings-theme-rename-btn"
                      title={t("settings.theme.rename")}
                      onClick={(e) => { e.stopPropagation(); handleRenameCode(m); }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                  {renderThemeSlotLabel(m.id, preferredCodeTheme)}
                </div>
              </div>
            );
          })}
      </div>

      <div className="settings-code-theme-preview" style={{ marginTop: 8 }}>
        <div className="settings-code-theme-preview-toolbar">
          <div className="settings-code-theme-preview-title">{t("settings.theme.preview")}</div>
          <div className="settings-code-sample-tabs">
            {CODE_THEME_SAMPLE_SNIPPETS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`settings-code-sample-tab${codeSampleLang === s.id ? " active" : ""}`}
                onClick={() => setCodeSampleLang(s.id)}
              >
                {t(`settings.theme.${s.labelKey}`)}
              </button>
            ))}
          </div>
        </div>
        <pre className="settings-code-theme-preview-code">
          <code dangerouslySetInnerHTML={{ __html: codeSampleHtml }} />
        </pre>
      </div>
      </>
      )}

      <div className="theme-pack-bar theme-pack-bar-footer">
        <div className="theme-pack-actions">
          <button
            type="button"
            className="theme-pack-btn"
            onClick={handleExportPack}
            disabled={exporting}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{exporting ? t("settings.theme.exportingPack") : t("settings.theme.exportPack")}</span>
          </button>
          <button
            type="button"
            className="theme-pack-btn"
            onClick={handleImportPack}
            disabled={importing}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{importing ? t("settings.theme.importing") : t("settings.theme.importPack")}</span>
          </button>
        </div>
        <p className="settings-hint theme-pack-hint">{t("settings.theme.packHint")}</p>
      </div>

      {nameDialog.open && (
        <div
          className="theme-name-dialog-overlay"
          onClick={() => setNameDialog({ open: false, mode: "export-pack", id: "", defaultName: "" })}
        >
          <div className="theme-name-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="theme-name-dialog-title">
              {nameDialog.mode === "export-pack"
                ? t("settings.theme.namePack")
                : t("settings.theme.renameTheme")}
            </h3>
            <input
              type="text"
              className="theme-name-dialog-input"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmNameDialog(); }}
              placeholder={
                nameDialog.mode === "export-pack"
                  ? t("settings.theme.namePackPlaceholder")
                  : t("settings.theme.nameThemePlaceholder")
              }
              autoFocus
            />
            <div className="theme-name-dialog-actions">
              <button
                className="settings-button theme-name-dialog-cancel"
                onClick={() => setNameDialog({ open: false, mode: "export-pack", id: "", defaultName: "" })}
              >
                {t("settings.theme.cancel")}
              </button>
              <button
                className="settings-button"
                onClick={handleConfirmNameDialog}
                disabled={exporting}
              >
                {exporting
                  ? t("settings.theme.exportingPack")
                  : nameDialog.mode === "export-pack"
                    ? t("settings.theme.exportPack")
                    : t("settings.theme.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="theme-name-dialog-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="theme-name-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="theme-name-dialog-title">
              {deleteConfirm.kind === "code"
                ? t("settings.theme.deleteCodeThemeTitle")
                : t("settings.theme.deleteThemeTitle")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px" }}>
              {deleteConfirm.kind === "code"
                ? t("settings.theme.deleteCodeThemeConfirm", { name: deleteConfirm.name })
                : t("settings.theme.deleteThemeConfirm", { name: deleteConfirm.name })}
            </p>
            <div className="theme-name-dialog-actions">
              <button className="settings-button theme-name-dialog-cancel" onClick={() => setDeleteConfirm(null)}>{t("settings.theme.cancel")}</button>
              <button className="settings-button warning" onClick={handleConfirmDelete}>{t("settings.theme.deleteBtn")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
