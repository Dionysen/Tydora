import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ask } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import {
  checkForUpdate,
  downloadAndInstall,
  relaunchApp,
  exitApp,
  isStoreVersion,
  isPortableVersion,
  type UpdateInfo,
} from "../../services";
import { isAnalyticsEnabled, setAnalyticsEnabled } from "../../analytics";
import appIcon from "../../assets/icon.png";

export function AboutSettingsContent() {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");
  const [storeVersion, setStoreVersion] = useState(false);
  const [portableVersion, setPortableVersion] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ available: boolean; info?: UpdateInfo } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ downloaded: number; total: number | null }>({ downloaded: 0, total: null });
  const [analyticsEnabled, setAnalyticsState] = useState<boolean>(() => isAnalyticsEnabled());

  useEffect(() => {
    invoke<string>("get_app_version").then(setVersion).catch(() => setVersion(""));
    // 是否为微软商店版本：商店版检测 GitHub 更高版本，切换通道更新
    isStoreVersion().then(setStoreVersion).catch(() => setStoreVersion(false));
    // 是否为便携版：便携版走 GitHub 便携 zip 通道更新
    isPortableVersion().then(setPortableVersion).catch(() => setPortableVersion(false));
  }, []);

  const handleCheckUpdate = useCallback(async () => {
    setCheckingUpdate(true);
    setUpdateResult(null);
    try {
      const info = await checkForUpdate();
      setUpdateResult(info ? { available: true, info } : { available: false });
    } catch {
      setUpdateResult({ available: false });
    }
    setCheckingUpdate(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!updateResult?.info) return;
    // 商店版切换到 GitHub 版会先卸载商店包（不可逆，之后改由 GitHub 更新），需确认
    if (storeVersion) {
      const ok = await ask(t("settings.about.switchConfirm"), { title: "Inimark", kind: "warning" });
      if (!ok) return;
    }
    setDownloading(true);
    setDownloadProgress({ downloaded: 0, total: null });
    try {
      await downloadAndInstall((downloaded, total) => {
        setDownloadProgress({ downloaded, total });
      });
      if (storeVersion) {
        // 切换完成：应用退出，后台脚本随后卸载商店版并安装 GitHub 版
        await exitApp();
      } else if (portableVersion) {
        // 便携版：退出，后台 cmd 脚本已替换 exe 并接管重启
        await exitApp();
      } else {
        await relaunchApp();
      }
    } catch (e) {
      console.error(`${t("settings.about.updateFailed")}`, e);
      setDownloading(false);
    }
  }, [updateResult, t, storeVersion, portableVersion]);

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
            {t("settings.about.downloading")}{downloadProgress.total ? ` ${Math.round(downloadProgress.downloaded / downloadProgress.total * 100)}%` : ""}
          </span>
        ) : updateResult?.available && updateResult.info ? (
          <button className="settings-button" onClick={handleDownload}>
            {t("settings.about.updateTo", { version: updateResult.info.version })}
          </button>
        ) : (
          <button
            className="settings-button"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            {checkingUpdate ? t("settings.about.checking") : updateResult && !updateResult.available ? t("settings.about.alreadyLatest") : t("settings.about.checkUpdate")}
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
