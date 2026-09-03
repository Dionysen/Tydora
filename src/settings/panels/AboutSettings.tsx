import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ask } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import {
  checkForUpdateAndStore,
  startUpdateDownload,
  formatUpdateProgressPercent,
  isStoreVersion,
  useUpdateStore,
} from "../../services";
import { isAnalyticsEnabled, setAnalyticsEnabled } from "../../analytics";
import appIcon from "../../assets/icon.png";

export function AboutSettingsContent() {
  const { t } = useTranslation();
  const { updateInfo, downloading, progress } = useUpdateStore();
  const [version, setVersion] = useState<string>("");
  const [storeVersion, setStoreVersion] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [checkedLatest, setCheckedLatest] = useState(false);
  const [analyticsEnabled, setAnalyticsState] = useState<boolean>(() => isAnalyticsEnabled());

  useEffect(() => {
    invoke<string>("get_app_version").then(setVersion).catch(() => setVersion(""));
    // 是否为微软商店版本：商店版检测 GitHub 更高版本，切换通道更新
    isStoreVersion().then(setStoreVersion).catch(() => setStoreVersion(false));
  }, []);

  const handleCheckUpdate = useCallback(async () => {
    setCheckingUpdate(true);
    setCheckedLatest(false);
    try {
      const info = await checkForUpdateAndStore();
      setCheckedLatest(!info);
    } catch {
      setCheckedLatest(true);
    }
    setCheckingUpdate(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!updateInfo) return;
    // 商店版切换到 GitHub 版会先卸载商店包（不可逆，之后改由 GitHub 更新），需确认
    if (storeVersion) {
      const ok = await ask(t("settings.about.switchConfirm"), { title: "Inimark", kind: "warning" });
      if (!ok) return;
    }
    try {
      await startUpdateDownload();
    } catch (e) {
      console.error(`${t("settings.about.updateFailed")}`, e);
    }
  }, [updateInfo, t, storeVersion]);

  return (
    <div className="settings-section">
      <div className="settings-about-header">
        <img src={appIcon} alt="Inimark" className="settings-about-icon" />
        <h2 className="settings-about-title">Inimark</h2>
        <p className="settings-about-subtitle">{t("settings.about.description")}<br />{t("settings.about.lightweight")}</p>
      </div>

      <div className="settings-item">
        <label className="settings-item-label">{t("settings.about.versionInfo")}</label>
        <span className="settings-about-value">{version ? `v${version}` : t("settings.about.loading")}</span>
      </div>

      {storeVersion && (
        <div className="settings-item">
          <label className="settings-item-label">{t("settings.about.storeSource")}</label>
          <span className="settings-about-value">{t("settings.about.storeVersionHint")}</span>
        </div>
      )}

      <div className="settings-item-vertical">
        <label className="settings-label">{t("settings.appearance.analytics")}</label>
        <div className="settings-item-inline">
          <span className="canvas-settings-row-desc">{t("settings.appearance.analyticsDesc")}</span>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setAnalyticsEnabled(enabled);
                setAnalyticsState(enabled);
              }}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      <div className="settings-item">
        <label className="settings-item-label">{t("settings.about.checkUpdate")}</label>
        {downloading ? (
          <span className="settings-about-value">
            {t("settings.about.downloading")}{formatUpdateProgressPercent(progress)}
          </span>
        ) : updateInfo ? (
          <button className="settings-button" onClick={handleDownload}>
            {t("settings.about.updateTo", { version: updateInfo.version })}
          </button>
        ) : (
          <button
            className="settings-button"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            {checkingUpdate ? t("settings.about.checking") : checkedLatest ? t("settings.about.alreadyLatest") : t("settings.about.checkUpdate")}
          </button>
        )}
      </div>

      <div className="settings-item">
        <label className="settings-item-label">{t("settings.about.github")}</label>
        <span
          className="settings-link"
          style={{ cursor: "pointer" }}
          onClick={() => invoke("open_url", { url: "https://github.com/Dionysen/Inimark" })}
        >
          {t("settings.about.visitRepo")}
        </span>
      </div>

      <div className="settings-item">
        <label className="settings-item-label">{t("settings.about.feedback")}</label>
        <span
          className="settings-link"
          style={{ cursor: "pointer" }}
          onClick={() => invoke("open_url", { url: "https://github.com/Dionysen/Inimark/issues" })}
        >
          Report an Issue
        </span>
      </div>
    </div>
  );
}
