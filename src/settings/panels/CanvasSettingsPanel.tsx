import { useTranslation } from "react-i18next";
import { SettingsSelect } from "../../components/SettingsSelect";
import type { CanvasSettings } from "../../Canvas/canvas-settings";

export function CanvasSettingsContent({
  settings,
  onChange,
}: {
  settings: CanvasSettings;
  onChange: (s: CanvasSettings) => void;
}) {
  const { t } = useTranslation();
  const handleChange = (key: keyof CanvasSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="canvas-settings-page">
      {/* Storage Location */}
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.defaultLocation")}</span>
          </div>
          <SettingsSelect
            value={settings.storageLocation}
            onChange={(v) => handleChange("storageLocation", v)}
            options={[
              { value: "vault-root", label: t("settings.canvas.vaultRoot") },
              { value: "current-folder", label: t("settings.canvas.currentFolder") },
              { value: "custom-folder", label: t("settings.canvas.attachmentFolder") },
            ]}
          />
        </div>
        {settings.storageLocation === 'custom-folder' && (
          <div className="canvas-settings-row canvas-settings-row-nested">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.canvas.attachmentPath")}</span>
              <span className="canvas-settings-row-desc">{t("settings.canvas.attachmentPathDesc")}</span>
            </div>
            <input
              type="text"
              className="settings-input"
              value={settings.customFolder}
              onChange={(e) => handleChange('customFolder', e.target.value)}
              placeholder="assets"
            />
          </div>
        )}
      </div>

      {/* Alignment Options */}
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.snapToGrid")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.snapToGridDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.snapToGrid}
              onChange={(e) => handleChange('snapToGrid', e.target.checked)}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        {settings.snapToGrid && (
          <div className="canvas-settings-row canvas-settings-row-nested">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.canvas.gridSize")}</span>
            </div>
            <div className="canvas-settings-row-control">
              <input
                type="number"
                className="settings-input-small"
                value={settings.gridSize}
                onChange={(e) => handleChange('gridSize', parseInt(e.target.value) || 15)}
                min="5"
                max="50"
              />
              <span className="canvas-settings-unit">px</span>
            </div>
          </div>
        )}
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.snapToObjects")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.snapToObjectsDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.snapToObjects}
              onChange={(e) => handleChange('snapToObjects', e.target.checked)}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      {/* Display Options */}
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.hideContentThreshold")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.hideContentThresholdDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              value={settings.hideContentZoomThreshold}
              onChange={(e) => handleChange('hideContentZoomThreshold', parseFloat(e.target.value))}
              min="0.1"
              max="1"
              step="0.1"
            />
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.enableMinimap")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.enableMinimapDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.minimapEnabled}
              onChange={(e) => handleChange('minimapEnabled', e.target.checked)}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        {settings.minimapEnabled && (
          <div className="canvas-settings-row canvas-settings-row-nested">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.canvas.minimapPosition")}</span>
            </div>
            <SettingsSelect
              value={settings.minimapPosition}
              onChange={(v) => handleChange("minimapPosition", v)}
              options={[
                { value: "top-left", label: t("settings.canvas.topLeft") },
                { value: "bottom-left", label: t("settings.canvas.bottomLeft") },
                { value: "bottom-right", label: t("settings.canvas.bottomRight") },
              ]}
            />
          </div>
        )}
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.minZoom")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.minZoomDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="number"
              className="settings-input-small"
              value={settings.minZoom}
              onChange={(e) => handleChange('minZoom', parseFloat(e.target.value) || 0.05)}
              min="0.01"
              max="1"
              step="0.01"
            />
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.maxZoom")}</span>
            <span className="canvas-settings-row-desc">{t("settings.canvas.maxZoomDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="number"
              className="settings-input-small"
              value={settings.maxZoom}
              onChange={(e) => handleChange('maxZoom', parseFloat(e.target.value) || 2)}
              min="1"
              max="10"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {/* Default Card Sizes */}
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.textCard")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultTextCardSize.width}
              onChange={(e) => handleChange('defaultTextCardSize', {
                ...settings.defaultTextCardSize,
                width: parseInt(e.target.value) || 400
              })}
            />
            <span className="canvas-settings-x">x</span>
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultTextCardSize.height}
              onChange={(e) => handleChange('defaultTextCardSize', {
                ...settings.defaultTextCardSize,
                height: parseInt(e.target.value) || 200
              })}
            />
            <span className="canvas-settings-unit">px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.noteCard")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultNoteCardSize.width}
              onChange={(e) => handleChange('defaultNoteCardSize', {
                ...settings.defaultNoteCardSize,
                width: parseInt(e.target.value) || 400
              })}
            />
            <span className="canvas-settings-x">x</span>
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultNoteCardSize.height}
              onChange={(e) => handleChange('defaultNoteCardSize', {
                ...settings.defaultNoteCardSize,
                height: parseInt(e.target.value) || 400
              })}
            />
            <span className="canvas-settings-unit">px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.canvas.mediaCard")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultMediaCardSize.width}
              onChange={(e) => handleChange('defaultMediaCardSize', {
                ...settings.defaultMediaCardSize,
                width: parseInt(e.target.value) || 400
              })}
            />
            <span className="canvas-settings-x">x</span>
            <input
              type="number"
              className="settings-input-small"
              value={settings.defaultMediaCardSize.height}
              onChange={(e) => handleChange('defaultMediaCardSize', {
                ...settings.defaultMediaCardSize,
                height: parseInt(e.target.value) || 300
              })}
            />
            <span className="canvas-settings-unit">px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
