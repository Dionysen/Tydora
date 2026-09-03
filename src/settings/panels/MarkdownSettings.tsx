import { useTranslation } from "react-i18next";
import type { EditorSettings } from "../../settings-store";

export function MarkdownSettingsContent({
  settings,
  onChange,
}: {
  settings: EditorSettings;
  onChange: (s: EditorSettings) => void;
}) {
  const { t } = useTranslation();
  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="canvas-settings-page">
      <div className="settings-section-title">{t("settings.markdown.groupFeatures")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.callout")}</span>
            <span className="canvas-settings-row-desc">{'> [!NOTE]'}</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.callout} onChange={(e) => update("callout", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.mermaid")}</span>
            <span className="canvas-settings-row-desc">flowchart / sequence / ...</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.mermaid} onChange={(e) => update("mermaid", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.math")}</span>
            <span className="canvas-settings-row-desc">$LaTeX$</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.math} onChange={(e) => update("math", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.wikilink")}</span>
            <span className="canvas-settings-row-desc">[[note]]</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.wikiLink} onChange={(e) => update("wikiLink", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.yaml")}</span>
            <span className="canvas-settings-row-desc">--- 元数据 ---</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.frontmatter} onChange={(e) => update("frontmatter", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.tableToolbar")}</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.tableToolbar} onChange={(e) => update("tableToolbar", e.target.checked)} />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-desc">{t("settings.editor.restartNotice")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
