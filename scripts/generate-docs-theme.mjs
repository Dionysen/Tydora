/**
 * Generate website/landing/site-docs-theme.css from docs-theme.config.json
 * Maps Inimark app theme tokens → markdown-publish CSS variables.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const configPath = resolve(root, "website/docs-theme.config.json");
const builtinPath = resolve(root, "website/shared/builtin-theme-colors.json");
const outPath = resolve(root, "website/landing/site-docs-theme.css");

/** Ink/Silver — aligned with website/landing/index.html */
const LANDING_THEMES = {
  light: {
    "--bg-primary": "#fafafa",
    "--bg-surface": "#ffffff",
    "--bg-secondary": "#f0f0f0",
    "--bg-hover": "rgba(10, 10, 10, 0.06)",
    "--text-primary": "#0a0a0a",
    "--text-secondary": "#5c5c5c",
    "--text-tertiary": "#8a8a8a",
    "--accent": "#0a0a0a",
    "--accent-hover": "#2a2a2a",
    "--accent-rgb": "10, 10, 10",
    "--border": "#e0e0e0",
    "--bg-code": "#f4f4f4",
    "--blockquote-border": "#c8c8c8",
    "--font-ui":
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  dark: {
    "--bg-primary": "#0a0a0a",
    "--bg-surface": "#161616",
    "--bg-secondary": "#111111",
    "--bg-hover": "rgba(255, 255, 255, 0.06)",
    "--text-primary": "#f0f0f0",
    "--text-secondary": "#a3a3a3",
    "--text-tertiary": "#737373",
    "--accent": "#f0f0f0",
    "--accent-hover": "#d8d8d8",
    "--accent-rgb": "240, 240, 240",
    "--border": "#2a2a2a",
    "--bg-code": "#1c1c1c",
    "--blockquote-border": "#3d3d3d",
    "--font-ui":
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
};

function ensureBuiltinColors() {
  if (existsSync(builtinPath)) return;
  console.log("ℹ️  builtin-theme-colors.json missing, syncing from themeTokens.ts…");
  const r = spawnSync("node", [resolve(__dirname, "sync-builtin-theme-colors.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function loadConfig() {
  const raw = JSON.parse(readFileSync(configPath, "utf-8"));
  return {
    light: raw.light ?? "landing",
    dark: raw.dark ?? "landing",
    themePack: raw.themePack ?? null,
  };
}

function loadBuiltinColors() {
  return JSON.parse(readFileSync(builtinPath, "utf-8"));
}

function loadThemePack(relPath) {
  const abs = resolve(root, relPath);
  if (!existsSync(abs)) {
    throw new Error(`themePack not found: ${relPath}`);
  }
  const pack = JSON.parse(readFileSync(abs, "utf-8"));
  if (pack.format !== "inimark-theme-pack") {
    throw new Error(`Invalid theme pack format in ${relPath}`);
  }
  return {
    light: pack.app?.light?.variables ?? {},
    dark: pack.app?.dark?.variables ?? {},
    name: pack.name ?? "theme pack",
  };
}

function resolveInimarkColors(config, mode, builtin) {
  if (config.themePack) {
    const pack = loadThemePack(config.themePack);
    return { colors: pack[mode], source: `${pack.name} (${mode})` };
  }
  const id = mode === "light" ? config.light : config.dark;
  if (id === "landing") {
    return { colors: LANDING_THEMES[mode], source: `landing (${mode})` };
  }
  const colors = builtin[id];
  if (!colors) {
    throw new Error(
      `Unknown theme "${id}" for ${mode}. Use landing or one of: ${Object.keys(builtin).join(", ")}`,
    );
  }
  return { colors, source: `${id} (${mode})` };
}

function navActiveBg(c) {
  // Ink/Silver: accent === text → use plate-like secondary bg
  if (c["--accent"] === c["--text-primary"]) {
    return c["--bg-secondary"] ?? c["--bg-hover"] ?? "#e8e8e8";
  }
  const accentRgb = c["--accent-rgb"];
  if (accentRgb) return `rgba(${accentRgb}, 0.15)`;
  return c["--bg-hover"] ?? "#e8e8e8";
}

function mapToDocsVars(c) {
  const accentRgb = c["--accent-rgb"] ?? "10, 10, 10";
  const border = c["--border"] ?? "#e0e0e0";
  return {
    "--background-primary": c["--bg-primary"],
    "--background-primary-alt": c["--bg-surface"] ?? c["--bg-primary"],
    "--background-secondary": c["--bg-secondary"] ?? c["--bg-tertiary"] ?? c["--bg-primary"],
    "--background-modifier-border": border,
    "--background-modifier-hover": c["--bg-hover"] ?? "rgba(0, 0, 0, 0.06)",
    "--text-normal": c["--text-primary"],
    "--text-muted": c["--text-secondary"],
    "--text-faint": c["--text-tertiary"],
    "--text-on-accent": "#ffffff",
    "--text-accent": c["--accent"],
    "--text-accent-hover": c["--accent-hover"] ?? c["--accent"],
    "--interactive-accent": c["--accent"],
    "--graph-line": border,
    "--graph-node": c["--text-secondary"],
    "--graph-node-focused": c["--accent"],
    "--graph-node-unresolved": c["--text-tertiary"],
    "--graph-text": c["--text-primary"],
    "--nav-item-background-active": navActiveBg(c),
    "--indentation-guide": c["--accent-rgb"]
      ? `rgba(${accentRgb}, 0.12)`
      : "rgba(0, 0, 0, 0.12)",
    "--code-background": c["--bg-code"] ?? c["--bg-secondary"],
    "--hr-color": border,
    "--table-border": border,
    "--blockquote-border": c["--blockquote-border"] ?? border,
    "--callout-default-rgb": accentRgb,
  };
}

function cssBlock(selector, vars) {
  const lines = Object.entries(vars)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function buildCss(config, builtin) {
  const light = resolveInimarkColors(config, "light", builtin);
  const dark = resolveInimarkColors(config, "dark", builtin);
  const font =
    light.colors["--font-ui"] ??
    dark.colors["--font-ui"] ??
    LANDING_THEMES.light["--font-ui"];

  const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: website/docs-theme.config.json
 * Light: ${light.source}
 * Dark: ${dark.source}
 * Regenerate: npm run generate:docs-theme
 */`;

  const blocks = [
    cssBlock("body.inimark-docs.theme-light", mapToDocsVars(light.colors)),
    cssBlock("body.inimark-docs.theme-dark", mapToDocsVars(dark.colors)),
    `body.inimark-docs {
  font-family: ${font};
}`,
    `/* Sidebar / TOC use accent-derived nav color; ink-style themes override to neutral */
body.inimark-docs.theme-light .tree-item-self.is-active,
body.inimark-docs.theme-dark .tree-item-self.is-active {
  color: var(--text-normal);
  font-weight: 600;
}

body.inimark-docs .toc-active {
  color: var(--text-normal);
}

body.inimark-docs .note-body a.tag {
  color: var(--text-muted);
  background: var(--background-modifier-hover);
}

body.inimark-docs .note-body a.tag:hover {
  color: var(--text-normal);
}

body.inimark-docs .suggestion-detail mark {
  background: rgba(10, 10, 10, 0.12);
  color: inherit;
}

body.inimark-docs.theme-dark .suggestion-detail mark {
  background: rgba(255, 255, 255, 0.14);
}`,
  ];

  return `${header}\n\n${blocks.join("\n\n")}\n`;
}

function main() {
  ensureBuiltinColors();
  const config = loadConfig();
  const builtin = loadBuiltinColors();
  const css = buildCss(config, builtin);
  writeFileSync(outPath, css, "utf-8");
  console.log(`✅ site-docs-theme.css generated (${config.themePack ? "theme pack" : `${config.light} / ${config.dark}`})`);
}

main();
