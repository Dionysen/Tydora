import { useTranslation } from "react-i18next";
import { FontPicker } from "../../components/FontPicker";
import { SettingsSelect } from "../../components/SettingsSelect";
import {
  normalizeCodeFontValue,
  normalizeEditorFontValue,
} from "../../utils/systemFonts";
import type { EditorSettings, GeneralSettings, CodeBlockToolbarStyle } from "../../settings-store";

export function EditorSettingsContent({
  generalSettings,
  onGeneralChange,
  editorSettings,
  onEditorChange,
}: {
  generalSettings: GeneralSettings;
  onGeneralChange: (s: GeneralSettings) => void;
  editorSettings: EditorSettings;
  onEditorChange: (s: EditorSettings) => void;
}) {
  const { t } = useTranslation();
  const updateEditor = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
    onEditorChange({ ...editorSettings, [key]: value });

  return (
    <div className="canvas-settings-page">
      <div className="settings-section-title">{t("settings.editor.groupExperience")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.defaultMode")}</span>
            <span className="canvas-settings-row-desc">{t("settings.editor.defaultModeDesc")}</span>
          </div>
          <SettingsSelect
            value={editorSettings.defaultMode}
            onChange={(v) => updateEditor("defaultMode", v as EditorSettings["defaultMode"])}
            options={[
              { value: "ir", label: t("settings.editor.instantRender") },
              { value: "sv", label: t("settings.editor.source") },
            ]}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.editor.wordCountType")}</span>
          </div>
          <SettingsSelect
            value={editorSettings.counterType}
            onChange={(v) => updateEditor("counterType", v as EditorSettings["counterType"])}
            options={[
              { value: "markdown", label: t("settings.editor.markdown") },
              { value: "text", label: t("settings.editor.plainText") },
            ]}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.typewriterMode")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.typewriterModeDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.typewriterMode}
              onChange={(e) => onGeneralChange({ ...generalSettings, typewriterMode: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.showLineNumbers")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.showLineNumbersDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.irLineNumbers}
              onChange={(e) => onGeneralChange({ ...generalSettings, irLineNumbers: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.codeBlockToolbarStyle")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.codeBlockToolbarStyleDesc")}</span>
          </div>
          <SettingsSelect
            value={generalSettings.codeBlockToolbarStyle}
            onChange={(v) =>
              onGeneralChange({
                ...generalSettings,
                codeBlockToolbarStyle: v as CodeBlockToolbarStyle,
              })
            }
            options={[
              { value: "minimal", label: t("settings.appearance.codeBlockToolbarMinimal") },
              { value: "classic", label: t("settings.appearance.codeBlockToolbarClassic") },
            ]}
          />
        </div>
      </div>

      <div className="settings-section-title">{t("settings.editor.groupTypography")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.editorFont")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.editorFontDesc")}</span>
          </div>
          <FontPicker
            mode="editor"
            value={normalizeEditorFontValue(generalSettings.editorFont)}
            onChange={(editorFont) => onGeneralChange({ ...generalSettings, editorFont })}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.codeFont")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.codeFontDesc")}</span>
          </div>
          <FontPicker
            mode="code"
            value={normalizeCodeFontValue(generalSettings.codeFont)}
            onChange={(codeFont) => onGeneralChange({ ...generalSettings, codeFont })}
          />
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.fontSize")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.fontSizeDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="10"
              max="24"
              value={generalSettings.fontSize}
              onChange={(e) => onGeneralChange({ ...generalSettings, fontSize: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{generalSettings.fontSize}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.codeFontSize")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.codeFontSizeDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min="10"
              max="24"
              value={generalSettings.codeFontSize}
              onChange={(e) => onGeneralChange({ ...generalSettings, codeFontSize: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{generalSettings.codeFontSize}px</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.lineHeight")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.lineHeightDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min={14}
              max={28}
              step={1}
              value={Math.round(generalSettings.lineHeight * 10)}
              onChange={(e) => onGeneralChange({ ...generalSettings, lineHeight: Number(e.target.value) / 10 })}
            />
            <span className="canvas-settings-unit">{generalSettings.lineHeight.toFixed(1)}</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.paragraphSpacing")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.paragraphSpacingDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min={0}
              max={20}
              step={1}
              value={Math.round(generalSettings.paragraphSpacing * 10)}
              onChange={(e) =>
                onGeneralChange({ ...generalSettings, paragraphSpacing: Number(e.target.value) / 10 })
              }
            />
            <span className="canvas-settings-unit">{generalSettings.paragraphSpacing.toFixed(1)}</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.codeLineHeight")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.codeLineHeightDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min={12}
              max={24}
              step={1}
              value={Math.round(generalSettings.codeLineHeight * 10)}
              onChange={(e) =>
                onGeneralChange({ ...generalSettings, codeLineHeight: Number(e.target.value) / 10 })
              }
            />
            <span className="canvas-settings-unit">{generalSettings.codeLineHeight.toFixed(1)}</span>
          </div>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.previewMaxWidth")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.previewMaxWidthDesc")}</span>
          </div>
          <div className="canvas-settings-row-control">
            <input
              type="range"
              className="canvas-settings-slider"
              min={600}
              max={1200}
              step={20}
              value={generalSettings.previewMaxWidth}
              onChange={(e) => onGeneralChange({ ...generalSettings, previewMaxWidth: Number(e.target.value) })}
            />
            <span className="canvas-settings-unit">{generalSettings.previewMaxWidth}px</span>
          </div>
        </div>
      </div>

      <div className="settings-section-title">{t("settings.appearance.groupTitleSave")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.autoSave")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.autoSaveDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.autoSave}
              onChange={(e) => onGeneralChange({ ...generalSettings, autoSave: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.formatOnSave")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.formatOnSaveDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.markdownFormat.formatOnSave}
              onChange={(e) =>
                onGeneralChange({
                  ...generalSettings,
                  markdownFormat: { ...generalSettings.markdownFormat, formatOnSave: e.target.checked },
                })
              }
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      <div className="settings-section-title">{t("settings.appearance.groupTitleMarkdownFormat")}</div>
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.formatCjkSpacing")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.formatCjkSpacingDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.markdownFormat.cjkSpacing}
              onChange={(e) =>
                onGeneralChange({
                  ...generalSettings,
                  markdownFormat: { ...generalSettings.markdownFormat, cjkSpacing: e.target.checked },
                })
              }
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.formatTrimTrailing")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.formatTrimTrailingDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.markdownFormat.trimTrailingWhitespace}
              onChange={(e) =>
                onGeneralChange({
                  ...generalSettings,
                  markdownFormat: { ...generalSettings.markdownFormat, trimTrailingWhitespace: e.target.checked },
                })
              }
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.formatEnsureNewline")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.formatEnsureNewlineDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.markdownFormat.ensureFinalNewline}
              onChange={(e) =>
                onGeneralChange({
                  ...generalSettings,
                  markdownFormat: { ...generalSettings.markdownFormat, ensureFinalNewline: e.target.checked },
                })
              }
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">{t("settings.appearance.formatNormalizeBlank")}</span>
            <span className="canvas-settings-row-desc">{t("settings.appearance.formatNormalizeBlankDesc")}</span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={generalSettings.markdownFormat.normalizeBlankLines}
              onChange={(e) =>
                onGeneralChange({
                  ...generalSettings,
                  markdownFormat: { ...generalSettings.markdownFormat, normalizeBlankLines: e.target.checked },
                })
              }
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

    </div>
  );
}
