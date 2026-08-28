import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  normalizeColorToHex,
  pickColorWithEyeDropper,
  supportsEyeDropper,
} from "./colorUtils";

interface ThemeColorFieldProps {
  label: string;
  varName: string;
  value: string;
  onChange: (value: string) => void;
}

export function ThemeColorField({ label, varName, value, onChange }: ThemeColorFieldProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const showDropper = supportsEyeDropper();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }, [value]);

  const handleEyeDropper = useCallback(async () => {
    const hex = await pickColorWithEyeDropper();
    if (hex) onChange(hex);
  }, [onChange]);

  return (
    <div className="theme-editor-row">
      <div className="theme-editor-label-block">
        <label className="theme-editor-label">{label}</label>
        <span className="theme-editor-var-name">{varName}</span>
      </div>
      <div className="theme-editor-control">
        <div className="theme-editor-color-group">
          <input
            type="color"
            className="theme-editor-color-picker"
            value={normalizeColorToHex(value)}
            onChange={(e) => onChange(e.target.value)}
            title={t("settings.theme.pickColor")}
            aria-label={t("settings.theme.pickColor")}
          />
          <input
            type="text"
            className="theme-editor-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            className="theme-editor-icon-btn"
            onClick={handleCopy}
            title={copied ? t("settings.theme.copied") : t("settings.theme.copyColor")}
            aria-label={t("settings.theme.copyColor")}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
          {showDropper && (
            <button
              type="button"
              className="theme-editor-icon-btn"
              onClick={handleEyeDropper}
              title={t("settings.theme.eyedropper")}
              aria-label={t("settings.theme.eyedropper")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 22 1-1h3l9-9" />
                <path d="M3 21v-3l9-9" />
                <path d="m15 5 3 3" />
                <path d="M18 2c.5.5 2 2.5 2 4 0 1-.5 2-2 2s-2-.5-2-2 1.5-3.5 2-4Z" />
                <path d="m15 8 4-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
