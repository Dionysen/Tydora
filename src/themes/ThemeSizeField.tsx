import { useCallback } from "react";
import type { ThemeSizeToken } from "./themeTokens";

interface ThemeSizeFieldProps {
  label: string;
  varName: string;
  value: string;
  meta: ThemeSizeToken;
  onChange: (value: string) => void;
}

function parsePx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function ThemeSizeField({ label, varName, value, meta, onChange }: ThemeSizeFieldProps) {
  const px = Math.min(meta.max, Math.max(meta.min, parsePx(value)));

  const commit = useCallback(
    (next: number) => {
      const clamped = Math.min(meta.max, Math.max(meta.min, Math.round(next)));
      onChange(`${clamped}px`);
    },
    [meta.max, meta.min, onChange],
  );

  return (
    <div className="theme-editor-row">
      <div className="theme-editor-label-block">
        <label className="theme-editor-label">{label}</label>
        <span className="theme-editor-var-name">{varName}</span>
      </div>
      <div className="theme-editor-control">
        <div className="theme-editor-size-group">
          <input
            type="range"
            className="settings-range"
            min={meta.min}
            max={meta.max}
            step={meta.step ?? 1}
            value={px}
            onChange={(e) => commit(Number(e.target.value))}
          />
          <input
            type="text"
            className="theme-editor-input theme-editor-size-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => commit(parsePx(value))}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
