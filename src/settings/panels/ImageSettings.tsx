import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import { SettingsSelect } from "../../components/SettingsSelect";
import type { ImageSettings, StorageMode, FilenameFormat } from "../../services";

export function ImageSettingsContent({
  settings,
  onChange,
}: {
  settings: ImageSettings;
  onChange: (s: ImageSettings) => void;
}) {
  const { t } = useTranslation();
  const handleSelectDirectory = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      onChange({ ...settings, fixedDirectory: { ...settings.fixedDirectory, path: selected } });
    }
  };

  return (
    <div className="canvas-settings-page">
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.image.storageMode")}</span>
            <span className="canvas-settings-row-desc">{t("settings.image.storageModeDesc")}</span>
          </div>
          <SettingsSelect
            value={settings.storageMode}
            onChange={(v) => onChange({ ...settings, storageMode: v as StorageMode })}
            options={[
              { value: "vault-assets", label: t("settings.image.vaultAssets") },
              { value: "fixed-directory", label: t("settings.image.fixedLocal") },
              { value: "image-bed", label: t("settings.image.uploadLater") },
            ]}
          />
        </div>
      </div>

      {settings.storageMode === "vault-assets" && (
        <div className="canvas-settings-card">
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.image.filenameFormat")}</span>
              <span className="canvas-settings-row-desc">{t("settings.image.filenameFormatDesc")}</span>
            </div>
            <SettingsSelect
              value={settings.local.filenameFormat}
              onChange={(v) =>
                onChange({
                  ...settings,
                  local: { ...settings.local, filenameFormat: v as FilenameFormat },
                })
              }
              options={[
                { value: "original", label: t("settings.image.originalName") },
                { value: "timestamp", label: t("settings.image.timestamp") },
                { value: "both", label: t("settings.image.originalAndTimestamp") },
              ]}
            />
          </div>
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.image.autoCreateAssets")}</span>
              <span className="canvas-settings-row-desc">{t("settings.image.autoCreateAssetsDesc")}</span>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.local.autoCreateAssetsDir}
                onChange={(e) => onChange({
                  ...settings,
                  local: { ...settings.local, autoCreateAssetsDir: e.target.checked },
                })}
              />
              <span className="settings-switch-slider" />
            </label>
          </div>
        </div>
      )}

      {settings.storageMode === "fixed-directory" && (
        <div className="canvas-settings-card">
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.image.storagePath")}</span>
              <span className="canvas-settings-row-desc">{t("settings.image.storagePathDesc")}</span>
            </div>
            <div className="canvas-settings-row-control">
              <input
                type="text"
                className="settings-input"
                value={settings.fixedDirectory.path}
                placeholder={t("settings.image.selectDir")}
                readOnly
                style={{ maxWidth: 200 }}
              />
              <button className="settings-button" onClick={handleSelectDirectory}>
                {t("settings.image.select")}
              </button>
            </div>
          </div>
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">文件命名格式</span>
            </div>
            <SettingsSelect
              value={settings.local.filenameFormat}
              onChange={(v) =>
                onChange({
                  ...settings,
                  local: { ...settings.local, filenameFormat: v as FilenameFormat },
                })
              }
              options={[
                { value: "original", label: t("settings.image.originalName") },
                { value: "timestamp", label: t("settings.image.timestamp") },
                { value: "both", label: t("settings.image.originalAndTimestamp") },
              ]}
            />
          </div>
        </div>
      )}

      {settings.storageMode === "image-bed" && (
        <div className="canvas-settings-card">
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">{t("settings.image.uploadFeature")}</span>
              <span className="canvas-settings-row-desc">{t("settings.image.uploadFeatureDesc")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
