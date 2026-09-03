import { useTranslation } from "react-i18next";
import { FontPicker } from "../../components/FontPicker";
import { SettingsSelect } from "../../components/SettingsSelect";
import { normalizeUiFontValue } from "../../utils/systemFonts";
import type { MenuDensity } from "../../utils/menuDensity";
import { ALL_PANELS, type PanelSide } from "../../Sidebar/index";
import type { GeneralSettings } from "../../settings-store";

export function AppearanceSettingsContent({
  settings,
  onChange,
}: {
  settings: GeneralSettings;
  onChange: (s: GeneralSettings) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="canvas-settings-page">
      <div className="settings-section-title">{t("settings.appearance.groupInterface")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.uiFont")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.uiFontDesc")}</span>
          </div>
          <FontPicker
            mode="editor"
            value={normalizeUiFontValue(settings.uiFont)}
            onChange={(uiFont) => onChange({ ...settings, uiFont })}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.menuDensity")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.menuDensityDesc")}</span>
          </div>
          <SettingsSelect
            value={settings.menuDensity}
            onChange={(v) =>
              onChange({
                ...settings,
                menuDensity: v as MenuDensity,
              })
            }
            options={[
              { value: "compact", label: t("settings.appearance.menuDensityCompact") },
              { value: "normal", label: t("settings.appearance.menuDensityNormal") },
              { value: "comfortable", label: t("settings.appearance.menuDensityComfortable") },
            ]}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.autoHideTopbar")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.autoHideTopbarDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.autoHideTopbar}
              onChange={(e) => onChange({ ...settings, autoHideTopbar: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.autoHideTopbarOnCollapse")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.autoHideTopbarOnCollapseDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.autoHideTopbarOnCollapse}
              onChange={(e) => onChange({ ...settings, autoHideTopbarOnCollapse: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      <div className="settings-section-title">{t("settings.appearance.groupTitleSidebar")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.autoHideVaultFooter")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.autoHideVaultFooterDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.autoHideVaultFooter}
              onChange={(e) => onChange({ ...settings, autoHideVaultFooter: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.expandOutlineOnOpen")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.expandOutlineOnOpenDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.expandOutlineOnOpen}
              onChange={(e) => onChange({ ...settings, expandOutlineOnOpen: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row canvas-settings-row--block">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.sidebarPanels")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.sidebarPanelsDesc")}</span>
          </div>
        </div>
        {ALL_PANELS.map((panel) => (
          <div key={panel} className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">
                {panel === "openFiles" ? t("openFiles.tabTitle") : t(`sidebar.tabs.${panel}`)}
              </span>
            </div>
            <SettingsSelect
              value={settings.sidebarPanelSides[panel]}
              onChange={(v) =>
                onChange({
                  ...settings,
                  sidebarPanelSides: {
                    ...settings.sidebarPanelSides,
                    [panel]: v as PanelSide,
                  },
                })
              }
              options={[
                { value: "left", label: t("settings.appearance.sidebarPanelLeft") },
                { value: "right", label: t("settings.appearance.sidebarPanelRight") },
                { value: "hidden", label: t("settings.appearance.sidebarPanelHidden") },
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
