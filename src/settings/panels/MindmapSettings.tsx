import { useTranslation } from "react-i18next";
import type { MindmapSettings } from "../../settings-store";

export function MindmapSettingsContent({
  settings,
  onChange,
}: {
  settings: MindmapSettings;
  onChange: (s: MindmapSettings) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="canvas-settings-page">
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.maxNodeWidth")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.maxNodeWidthDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="0"
              max="500"
              step="10"
              value={settings.maxWidth}
              onChange={(e) => onChange({ ...settings, maxWidth: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.maxWidth}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.horizontalSpacing")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.horizontalSpacingDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="20"
              max="200"
              step="5"
              value={settings.spacingHorizontal}
              onChange={(e) => onChange({ ...settings, spacingHorizontal: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.spacingHorizontal}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.verticalSpacing")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.verticalSpacingDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="1"
              max="30"
              value={settings.spacingVertical}
              onChange={(e) => onChange({ ...settings, spacingVertical: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.spacingVertical}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.edgeWidth")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.edgeWidthDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="0.5"
              max="4"
              step="0.5"
              value={settings.lineWidth}
              onChange={(e) => onChange({ ...settings, lineWidth: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.lineWidth}px</span>
          </div>
        </div>
      </div>

      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.initialExpandLevel")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.initialExpandLevelDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="-1"
              max="10"
              value={settings.initialExpandLevel}
              onChange={(e) => onChange({ ...settings, initialExpandLevel: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.initialExpandLevel === -1 ? t("settings.mindmap.all") : t("settings.mindmap.expandLevel", { level: settings.initialExpandLevel })}</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.animationDuration")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.animationDurationDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="0"
              max="1000"
              step="50"
              value={settings.duration}
              onChange={(e) => onChange({ ...settings, duration: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.duration}ms</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.mindmap.colorFreezeLevel")}</span>
            <span className="canvas-settings-row-desc">{t("settings.mindmap.colorFreezeLevelDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="0"
              max="10"
              value={settings.colorFreezeLevel}
              onChange={(e) => onChange({ ...settings, colorFreezeLevel: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{settings.colorFreezeLevel === 0 ? "不冻结" : settings.colorFreezeLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
