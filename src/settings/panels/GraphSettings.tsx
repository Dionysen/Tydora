import { useTranslation } from "react-i18next";
import type { GraphSettings } from "../../settings-store";

export function GraphSettingsContent({
  settings,
  onChange,
}: {
  settings: GraphSettings;
  onChange: (s: GraphSettings) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="canvas-settings-page">
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.openInNewWindow")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.openInNewWindowDesc")}</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={settings.openInNewWindow} onChange={(e) => onChange({ ...settings, openInNewWindow: e.target.checked })} />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.maxNodeSize")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.maxNodeSizeDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="5"
              max="30"
              value={settings.nodeSize}
              onChange={(e) => onChange({ ...settings, nodeSize: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.nodeSize}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.labelFontSize")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.labelFontSizeDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="8"
              max="18"
              value={settings.labelFontSize}
              onChange={(e) => onChange({ ...settings, labelFontSize: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.labelFontSize}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.edgeDistance")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.edgeDistanceDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="60"
              max="300"
              step="10"
              value={settings.linkDistance}
              onChange={(e) => onChange({ ...settings, linkDistance: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.linkDistance}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.repulsion")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.repulsionDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="-500"
              max="-50"
              step="10"
              value={settings.chargeStrength}
              onChange={(e) => onChange({ ...settings, chargeStrength: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.chargeStrength}</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.graph.edgeOpacity")}</span>
            <span className="canvas-settings-row-desc">{t("settings.graph.edgeOpacityDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.edgeOpacity}
              onChange={(e) => onChange({ ...settings, edgeOpacity: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{Math.round(settings.edgeOpacity * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
