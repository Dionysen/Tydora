import { useTranslation } from "react-i18next";
import { useLanguage } from "../../i18n/LanguageContext";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../../i18n";
import { SettingsSelect } from "../../components/SettingsSelect";

export function GeneralSettingsContent() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="canvas-settings-page">
      <div className="settings-section-title">{t("settings.general.groupLanguage")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.language")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.languageDesc")}</span>
          </div>
          <SettingsSelect
            value={language}
            onChange={(v) => setLanguage(v as SupportedLanguage)}
            options={SUPPORTED_LANGUAGES.map((lang) => ({
              value: lang.code,
              label: lang.label,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
