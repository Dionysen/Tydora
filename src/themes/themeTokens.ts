import type { ThemeVariable } from "./CustomThemeManager";
import type { BuiltinThemeName } from "./ThemeManager";
import { BUILTIN_THEMES } from "./ThemeManager";

export type ThemeColorGroup = "background" | "text" | "accent" | "border";

export interface ThemeColorToken {
  name: string;
  group: ThemeColorGroup;
  /** i18n key under settings.theme.token.* */
  labelKey: string;
  /** Hidden from color editor UI (auto-derived) */
  hidden?: boolean;
}

/** Canonical editable color tokens for the theme editor. */
export const THEME_COLOR_SCHEMA: ThemeColorToken[] = [
  { name: "--bg-primary", group: "background", labelKey: "bgPrimary" },
  { name: "--bg-secondary", group: "background", labelKey: "bgSecondary" },
  { name: "--bg-surface", group: "background", labelKey: "bgSurface" },
  { name: "--bg-hover", group: "background", labelKey: "bgHover" },
  { name: "--bg-tertiary", group: "background", labelKey: "bgTertiary" },
  { name: "--bg-code", group: "background", labelKey: "bgCode" },
  { name: "--bg-code-inline", group: "background", labelKey: "bgCodeInline" },
  { name: "--bg-input", group: "background", labelKey: "bgInput" },
  { name: "--text-primary", group: "text", labelKey: "textPrimary" },
  { name: "--text-secondary", group: "text", labelKey: "textSecondary" },
  { name: "--text-tertiary", group: "text", labelKey: "textTertiary" },
  { name: "--text-strong", group: "text", labelKey: "textStrong" },
  { name: "--text-code", group: "text", labelKey: "textCode" },
  { name: "--accent", group: "accent", labelKey: "accent" },
  { name: "--accent-hover", group: "accent", labelKey: "accentHover" },
  { name: "--accent-rgb", group: "accent", labelKey: "accentRgb", hidden: true },
  { name: "--danger", group: "accent", labelKey: "danger" },
  { name: "--border", group: "border", labelKey: "border" },
];

export const THEME_COLOR_GROUPS: ThemeColorGroup[] = [
  "background",
  "text",
  "accent",
  "border",
];

/** Non-color vars preserved when forking / rebuilding CSS. */
const PRESERVED_NON_COLOR = [
  "--font-mono",
  "--font-ui",
  "--editor-font",
  "--editor-font-size",
] as const;

const LIGHT_DEFAULTS: Record<string, string> = {
  "--bg-primary": "#ffffff",
  "--bg-secondary": "#d9ede5",
  "--bg-surface": "#ecf6f2",
  "--bg-hover": "rgba(78, 178, 137, 0.12)",
  "--bg-tertiary": "#c5e3d7",
  "--bg-code": "#f0f7f4",
  "--bg-code-inline": "rgba(78, 178, 137, 0.08)",
  "--bg-input": "#ffffff",
  "--text-primary": "#1e293b",
  "--text-secondary": "#6B6B6B",
  "--text-tertiary": "#9ca3af",
  "--text-strong": "#bd387d",
  "--text-code": "#e83e8c",
  "--accent": "#4eb289",
  "--accent-rgb": "78, 178, 137",
  "--accent-hover": "#3a9e6e",
  "--danger": "#e06c75",
  "--border": "#a5cfc0",
};

const DARK_DEFAULTS: Record<string, string> = {
  "--bg-primary": "#272729",
  "--bg-secondary": "#232325",
  "--bg-surface": "#333336",
  "--bg-hover": "rgba(255, 255, 255, 0.08)",
  "--bg-tertiary": "#2e2e31",
  "--bg-code": "#2d2d30",
  "--bg-code-inline": "rgba(78, 178, 137, 0.12)",
  "--bg-input": "#272729",
  "--text-primary": "#cccccc",
  "--text-secondary": "#818286",
  "--text-tertiary": "#5c5e63",
  "--text-strong": "#bd387d",
  "--text-code": "#f5c2e7",
  "--accent": "#4eb289",
  "--accent-rgb": "78, 178, 137",
  "--accent-hover": "#5fc99e",
  "--danger": "#e06c75",
  "--border": "#39393a",
};

/** Full color maps for each built-in theme (for fork). Keep in sync with themes.css. */
export const BUILTIN_THEME_COLORS: Record<BuiltinThemeName, Record<string, string>> = {
  white: {
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f5f7fa",
    "--bg-surface": "#f1f5f9",
    "--bg-hover": "rgba(0, 0, 0, 0.06)",
    "--bg-tertiary": "#e8ecf1",
    "--bg-code": "#f6f8fa",
    "--bg-code-inline": "rgba(0, 0, 0, 0.06)",
    "--bg-input": "#ffffff",
    "--text-primary": "#1e293b",
    "--text-secondary": "#64748b",
    "--text-tertiary": "#94a3b8",
    "--text-strong": "#bd387d",
    "--text-code": "#e83e8c",
    "--accent": "#2563eb",
    "--accent-rgb": "37, 99, 235",
    "--accent-hover": "#1d4ed8",
    "--danger": "#dc2626",
    "--border": "#d1d9e6",
  },
  mint: { ...LIGHT_DEFAULTS },
  "mint-dark": { ...DARK_DEFAULTS },
  "claude-code": {
    "--bg-primary": "#faf8f5",
    "--bg-secondary": "#f0ece6",
    "--bg-surface": "#f5f1eb",
    "--bg-hover": "rgba(196, 122, 42, 0.1)",
    "--bg-tertiary": "#e8e2d8",
    "--bg-code": "#f0ece6",
    "--bg-code-inline": "rgba(196, 122, 42, 0.08)",
    "--bg-input": "#faf8f5",
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#6b6560",
    "--text-tertiary": "#9a948c",
    "--text-strong": "#bd387d",
    "--text-code": "#c47a2a",
    "--accent": "#c47a2a",
    "--accent-rgb": "196, 122, 42",
    "--accent-hover": "#a86420",
    "--danger": "#c94432",
    "--border": "#ddd6cc",
  },
  purple: {
    "--bg-primary": "#faf5ff",
    "--bg-secondary": "#f3e8ff",
    "--bg-surface": "#f5f0ff",
    "--bg-hover": "rgba(124, 58, 237, 0.1)",
    "--bg-tertiary": "#ebe0ff",
    "--bg-code": "#f3f0ff",
    "--bg-code-inline": "rgba(124, 58, 237, 0.08)",
    "--bg-input": "#faf5ff",
    "--text-primary": "#1e1b2e",
    "--text-secondary": "#6b6580",
    "--text-tertiary": "#9b95b0",
    "--text-strong": "#bd387d",
    "--text-code": "#7c3aed",
    "--accent": "#7c3aed",
    "--accent-rgb": "124, 58, 237",
    "--accent-hover": "#6d28d9",
    "--danger": "#dc2626",
    "--border": "#ddd6ee",
  },
  hermes: {
    "--bg-primary": "#f0f1ff",
    "--bg-secondary": "#e4e6ff",
    "--bg-surface": "#eaeaFF",
    "--bg-hover": "rgba(0, 0, 242, 0.08)",
    "--bg-tertiary": "#d8dbff",
    "--bg-code": "#eaeaFF",
    "--bg-code-inline": "rgba(0, 0, 242, 0.08)",
    "--bg-input": "#f0f1ff",
    "--text-primary": "#1a1a4e",
    "--text-secondary": "#5a5a8a",
    "--text-tertiary": "#8a8ab0",
    "--text-strong": "#bd387d",
    "--text-code": "#0000f2",
    "--accent": "#0000f2",
    "--accent-rgb": "0, 0, 242",
    "--accent-hover": "#2020ff",
    "--danger": "#dc2626",
    "--border": "rgba(0, 0, 242, 0.12)",
  },
  next: {
    "--bg-primary": "#fffef8",
    "--bg-secondary": "#f8f7f2",
    "--bg-surface": "#f3f2ed",
    "--bg-hover": "rgba(0, 121, 107, 0.08)",
    "--bg-tertiary": "#ebeae4",
    "--bg-code": "#f3f2ed",
    "--bg-code-inline": "rgba(0, 121, 107, 0.08)",
    "--bg-input": "#fffef8",
    "--text-primary": "#4a4a4a",
    "--text-secondary": "#8a8a8a",
    "--text-tertiary": "#b0b0b0",
    "--text-strong": "#bd387d",
    "--text-code": "#00796b",
    "--accent": "#00796b",
    "--accent-rgb": "0, 121, 107",
    "--accent-hover": "#00695c",
    "--danger": "#d32f2f",
    "--border": "#e0ddd6",
  },
  slate: {
    "--bg-primary": "#f8fafc",
    "--bg-secondary": "#f1f5f9",
    "--bg-surface": "#f8fafc",
    "--bg-hover": "rgba(71, 85, 105, 0.08)",
    "--bg-tertiary": "#e2e8f0",
    "--bg-code": "#f1f5f9",
    "--bg-code-inline": "rgba(100, 116, 139, 0.08)",
    "--bg-input": "#f8fafc",
    "--text-primary": "#0f172a",
    "--text-secondary": "#64748b",
    "--text-tertiary": "#94a3b8",
    "--text-strong": "#bd387d",
    "--text-code": "#e83e8c",
    "--accent": "#475569",
    "--accent-rgb": "71, 85, 105",
    "--accent-hover": "#334155",
    "--danger": "#dc2626",
    "--border": "#e2e8f0",
  },
  ocean: {
    "--bg-primary": "#f0f9ff",
    "--bg-secondary": "#e0f2fe",
    "--bg-surface": "#f0f9ff",
    "--bg-hover": "rgba(8, 145, 178, 0.1)",
    "--bg-tertiary": "#bae6fd",
    "--bg-code": "#f0f9ff",
    "--bg-code-inline": "rgba(8, 145, 178, 0.08)",
    "--bg-input": "#f0f9ff",
    "--text-primary": "#0c4a6e",
    "--text-secondary": "#64748b",
    "--text-tertiary": "#94a3b8",
    "--text-strong": "#bd387d",
    "--text-code": "#0891b2",
    "--accent": "#0891b2",
    "--accent-rgb": "8, 145, 178",
    "--accent-hover": "#0e7490",
    "--danger": "#dc2626",
    "--border": "#a5f3fc",
  },
};

const DEFAULT_FONTS: ThemeVariable[] = [
  {
    name: "--font-mono",
    value: '"Cascadia Code", "JetBrains Mono", "Fira Code", "Consolas", monospace',
    type: "font",
  },
  {
    name: "--font-ui",
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    type: "font",
  },
  {
    name: "--editor-font",
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    type: "font",
  },
  { name: "--editor-font-size", value: "16px", type: "size" },
];

export function getBuiltinColorMap(builtinId: string): Record<string, string> | null {
  if (!(BUILTIN_THEMES as readonly string[]).includes(builtinId)) return null;
  return BUILTIN_THEME_COLORS[builtinId as BuiltinThemeName];
}

export function colorMapToVariables(colors: Record<string, string>): ThemeVariable[] {
  return THEME_COLOR_SCHEMA.map((token) => ({
    name: token.name,
    value: colors[token.name] ?? LIGHT_DEFAULTS[token.name] ?? "#ffffff",
    type: "color" as const,
  }));
}

export function getBuiltinThemeVariables(builtinId: string): ThemeVariable[] | null {
  const colors = getBuiltinColorMap(builtinId);
  if (!colors) return null;
  return [...colorMapToVariables(colors), ...DEFAULT_FONTS];
}

export function getTemplateVariables(kind: "light" | "dark"): ThemeVariable[] {
  const colors = kind === "dark" ? DARK_DEFAULTS : LIGHT_DEFAULTS;
  return [...colorMapToVariables(colors), ...DEFAULT_FONTS];
}

/**
 * Merge parsed CSS vars with the canonical color schema.
 * Missing color tokens get defaults from `fallback` or light template.
 * Non-schema vars (fonts, extras from imports) are preserved after schema colors.
 */
export function mergeWithSchema(
  parsed: ThemeVariable[],
  fallback?: Record<string, string>,
): ThemeVariable[] {
  const byName = new Map(parsed.map((v) => [v.name, v]));
  const defaults = fallback ?? LIGHT_DEFAULTS;

  const colors: ThemeVariable[] = THEME_COLOR_SCHEMA.map((token) => {
    const existing = byName.get(token.name);
    if (existing) {
      byName.delete(token.name);
      return { ...existing, type: "color" as const };
    }
    return {
      name: token.name,
      value: defaults[token.name] ?? LIGHT_DEFAULTS[token.name] ?? "#ffffff",
      type: "color" as const,
    };
  });

  // Keep remaining non-color / extra vars (fonts etc.)
  const rest: ThemeVariable[] = [];
  for (const name of PRESERVED_NON_COLOR) {
    const v = byName.get(name);
    if (v) {
      rest.push(v);
      byName.delete(name);
    }
  }
  // Defaults fonts if missing
  for (const def of DEFAULT_FONTS) {
    if (!rest.some((v) => v.name === def.name) && !colors.some((v) => v.name === def.name)) {
      rest.push(def);
    }
  }
  // Any other leftover vars from imported CSS
  for (const v of byName.values()) {
    if (!THEME_COLOR_SCHEMA.some((t) => t.name === v.name)) {
      rest.push(v);
    }
  }

  return [...colors, ...rest];
}

export function getEditableColorVariables(variables: ThemeVariable[]): ThemeVariable[] {
  const hidden = new Set(
    THEME_COLOR_SCHEMA.filter((t) => t.hidden).map((t) => t.name),
  );
  const schemaNames = new Set(THEME_COLOR_SCHEMA.map((t) => t.name));
  return variables.filter((v) => schemaNames.has(v.name) && !hidden.has(v.name));
}

export function groupEditableColors(
  variables: ThemeVariable[],
): Record<ThemeColorGroup, ThemeVariable[]> {
  const editable = getEditableColorVariables(variables);
  const byName = new Map(editable.map((v) => [v.name, v]));
  const result: Record<ThemeColorGroup, ThemeVariable[]> = {
    background: [],
    text: [],
    accent: [],
    border: [],
  };
  for (const token of THEME_COLOR_SCHEMA) {
    if (token.hidden) continue;
    const v = byName.get(token.name);
    if (v) result[token.group].push(v);
  }
  return result;
}

export function getTokenMeta(name: string): ThemeColorToken | undefined {
  return THEME_COLOR_SCHEMA.find((t) => t.name === name);
}
