import { appDataDir } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, mkdir, remove, readDir } from "@tauri-apps/plugin-fs";

// ── Types ────────────────────────────────────────────────────────────

export interface ThemeManifest {
  id: string;
  name: string;
  fileName: string;
  importedAt: string;
  previewBg?: string;
  previewAccent?: string;
}

export interface ThemeVariable {
  name: string;
  value: string;
  type: "color" | "font" | "size" | "text";
}

// ── Constants ────────────────────────────────────────────────────────

const MANIFEST_FILE = "manifest.json";

// Variables that should be detected as color pickers
const COLOR_PATTERNS = [
  /^--bg-/, /^--text-/, /^--accent/, /^--border$/, /^--danger$/,
  /^--scrollbar-/, /^--metadata-/, /^--blockquote-/, /^--table-/, /^--tag-/,
  /^--ring$/, /^--card/, /^--popover/, /^--primary/, /^--secondary/,
  /^--muted/, /^--destructive$/, /^--input$/, /^--sidebar/,
  /^--breathe/, /^--highlight/, /^--hljs-/,
];

// Variables that are font families
const FONT_PATTERNS = [/^--font-/, /^--editor-font$/];

// Variables that are sizes
const SIZE_PATTERNS = [
  /^--editor-font-size$/,
  /^--font-mono-size$/,
  /^--radius/,
  /^--padding-/,
  /^--scrollbar-size$/,
  /^--blockquote-border-width$/,
];

// ── Path Helpers ─────────────────────────────────────────────────────

let cachedThemesDir: string | null = null;

async function getThemesDir(): Promise<string> {
  if (cachedThemesDir) return cachedThemesDir;
  const baseDir = await appDataDir();
  const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
  const dir = `${baseDir}${sep}themes`;
  cachedThemesDir = dir;
  return dir;
}

async function ensureThemesDir(): Promise<string> {
  const dir = await getThemesDir();
  try {
    await readDir(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

function joinPath(parent: string, child: string): string {
  const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
  const clean = parent.endsWith("/") || parent.endsWith("\\") ? parent.slice(0, -1) : parent;
  return `${clean}${sep}${child}`;
}

// ── Manifest ─────────────────────────────────────────────────────────

export async function loadManifest(): Promise<ThemeManifest[]> {
  try {
    const dir = await ensureThemesDir();
    const content = await readTextFile(joinPath(dir, MANIFEST_FILE));
    return JSON.parse(content) as ThemeManifest[];
  } catch {
    return [];
  }
}

export async function saveManifest(manifests: ThemeManifest[]): Promise<void> {
  const dir = await ensureThemesDir();
  await writeTextFile(joinPath(dir, MANIFEST_FILE), JSON.stringify(manifests, null, 2));
}

// ── Theme ID ─────────────────────────────────────────────────────────

function generateThemeId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ── CSS Parsing ──────────────────────────────────────────────────────

export function parseCssVariables(css: string): ThemeVariable[] {
  const variables: ThemeVariable[] = [];
  const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(css)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    const type = detectVariableType(name, value);
    variables.push({ name, value, type });
  }

  return variables;
}

function detectVariableType(name: string, value: string): ThemeVariable["type"] {
  // Check if it's explicitly a size
  if (SIZE_PATTERNS.some((p) => p.test(name))) return "size";

  // Check if it's explicitly a font
  if (FONT_PATTERNS.some((p) => p.test(name))) return "font";

  // Check if it's explicitly a color
  if (COLOR_PATTERNS.some((p) => p.test(name))) return "color";

  // Heuristic: if it looks like a color value
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return "color";
  if (/^rgba?\(/.test(value)) return "color";
  if (/^oklch\(/.test(value)) return "color";
  if (/^hsla?\(/.test(value)) return "color";
  if (/^color-mix\(/.test(value)) return "text";

  // Heuristic: if it looks like a font stack
  if (/^["']?[A-Z]/.test(value) && /[,\s]/.test(value)) return "font";
  if (/system-ui|sans-serif|serif|monospace/.test(value)) return "font";

  // Heuristic: size values
  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(value)) return "size";

  return "text";
}

// ── CSS Selector Conversion ──────────────────────────────────────────

export function convertSelectorsToDataTheme(css: string, themeId: string): string {
  const dataThemeSelector = `[data-theme="custom-${themeId}"]`;

  // Case 1: :root { ... } → [data-theme="custom-{id}"] { ... }
  let result = css.replace(/:root\s*\{/g, `${dataThemeSelector} {`);

  // Case 2: .dark { ... } → [data-theme="custom-{id}-dark"] { ... }
  result = result.replace(/\.dark\s*\{/g, `[data-theme="custom-${themeId}-dark"] {`);

  // Case 3: [data-theme="xxx"] { ... } → [data-theme="custom-{id}"] { ... }
  result = result.replace(/\[data-theme="[^"]*"\]\s*\{/g, `${dataThemeSelector} {`);

  // Case 4: .dark [data-theme="xxx"] { ... } compound selectors
  result = result.replace(/\.dark\s+\[data-theme="[^"]*"\]\s*\{/g, `[data-theme="custom-${themeId}-dark"] {`);

  return result;
}

// ── Build CSS from Variables ─────────────────────────────────────────

export function buildThemeCss(id: string, variables: ThemeVariable[]): string {
  const lines = variables.map((v) => `  ${v.name}: ${v.value};`);
  return `[data-theme="custom-${id}"] {\n${lines.join("\n")}\n}`;
}

// ── Theme Operations ─────────────────────────────────────────────────

export async function importTheme(
  filePath: string,
  displayName: string,
): Promise<ThemeManifest> {
  const dir = await ensureThemesDir();

  // Read source file
  const css = await readTextFile(filePath);

  // Generate ID and convert selectors
  const id = generateThemeId();
  const processedCss = convertSelectorsToDataTheme(css, id);

  // Validate: must have at least --bg-primary
  if (!processedCss.includes("--bg-primary")) {
    throw new Error("主题文件缺少必要的 --bg-primary 变量");
  }

  // Save CSS file
  const fileName = `${id}.css`;
  await writeTextFile(joinPath(dir, fileName), processedCss);

  // Extract preview colors
  const { bg, accent } = extractPreviewColors(processedCss);

  // Update manifest
  const manifests = await loadManifest();
  const manifest: ThemeManifest = {
    id,
    name: displayName,
    fileName,
    importedAt: new Date().toISOString(),
    previewBg: bg,
    previewAccent: accent,
  };
  manifests.push(manifest);
  await saveManifest(manifests);

  return manifest;
}

export async function deleteTheme(id: string): Promise<void> {
  const dir = await ensureThemesDir();
  const manifests = await loadManifest();
  const manifest = manifests.find((m) => m.id === id);

  if (manifest) {
    try {
      await remove(joinPath(dir, manifest.fileName));
    } catch {}
  }

  const updated = manifests.filter((m) => m.id !== id);
  await saveManifest(updated);
}

export async function getCustomThemeCss(id: string): Promise<string> {
  const dir = await ensureThemesDir();
  return await readTextFile(joinPath(dir, `${id}.css`));
}

export async function saveThemeCss(id: string, css: string): Promise<void> {
  const dir = await ensureThemesDir();
  await writeTextFile(joinPath(dir, `${id}.css`), css);
}

/** Create a custom theme from a full variable list (fork / template). */
export async function createThemeFromVariables(
  displayName: string,
  variables: ThemeVariable[],
): Promise<ThemeManifest> {
  const dir = await ensureThemesDir();
  const id = generateThemeId();
  const css = buildThemeCss(id, variables);
  const fileName = `${id}.css`;
  await writeTextFile(joinPath(dir, fileName), css);

  const { bg, accent } = extractPreviewColors(css);
  const manifests = await loadManifest();
  const manifest: ThemeManifest = {
    id,
    name: displayName,
    fileName,
    importedAt: new Date().toISOString(),
    previewBg: bg,
    previewAccent: accent,
  };
  manifests.push(manifest);
  await saveManifest(manifests);
  return manifest;
}

export async function renameTheme(id: string, name: string): Promise<ThemeManifest | null> {
  const manifests = await loadManifest();
  const idx = manifests.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  manifests[idx] = { ...manifests[idx], name: name.trim() || manifests[idx].name };
  await saveManifest(manifests);
  return manifests[idx];
}

/** Persist variables and refresh manifest preview colors. */
export async function persistThemeVariables(
  id: string,
  variables: ThemeVariable[],
): Promise<ThemeManifest | null> {
  const css = buildThemeCss(id, variables);
  await saveThemeCss(id, css);
  const { bg, accent } = extractPreviewColors(css);
  const manifests = await loadManifest();
  const idx = manifests.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  manifests[idx] = {
    ...manifests[idx],
    previewBg: bg,
    previewAccent: accent,
  };
  await saveManifest(manifests);
  return manifests[idx];
}

// ── Preview Color Extraction ─────────────────────────────────────────

export function extractPreviewColors(css: string): { bg: string; accent: string } {
  const vars = parseCssVariables(css);
  const bg = vars.find((v) => v.name === "--bg-primary")?.value || "#ffffff";
  const accent = vars.find((v) => v.name === "--accent")?.value || "#4eb289";
  return { bg, accent };
}

// ── Code Theme Operations ──────────────────────────────────────

import { type CustomCodeTheme } from "./codeThemes";

const CODE_THEMES_DIR = "code-themes";

async function getCodeThemesDir(): Promise<string> {
  const baseDir = await appDataDir();
  const sep = navigator.platform?.toLowerCase().includes("win") ? "\\" : "/";
  return `${baseDir}${sep}${CODE_THEMES_DIR}`;
}

async function ensureCodeThemesDir(): Promise<string> {
  const dir = await getCodeThemesDir();
  try {
    await readDir(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export async function loadCodeThemeManifest(): Promise<CustomCodeTheme[]> {
  try {
    const dir = await ensureCodeThemesDir();
    const content = await readTextFile(joinPath(dir, "manifest.json"));
    return JSON.parse(content) as CustomCodeTheme[];
  } catch {
    return [];
  }
}

export async function saveCodeThemeManifest(manifests: CustomCodeTheme[]): Promise<void> {
  const dir = await ensureCodeThemesDir();
  await writeTextFile(joinPath(dir, "manifest.json"), JSON.stringify(manifests, null, 2));
}

export function buildCodeThemeCss(variables: ThemeVariable[]): string {
  const hljsVars = variables.filter((v) => v.name.startsWith("--hljs-"));
  const lines = hljsVars.map((v) => `  ${v.name}: ${v.value};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export function extractCodeThemePreviewColors(variables: ThemeVariable[]): string[] {
  const get = (name: string, fallback: string) =>
    variables.find((v) => v.name === name)?.value.trim() || fallback;
  return [
    get("--hljs-keyword", "#d73a49"),
    get("--hljs-string", "#032f62"),
    get("--hljs-comment", "#6a737d"),
    get("--hljs-number", "#005cc5"),
    get("--hljs-built_in", "#e36209"),
  ];
}

/** Infer dark/light from average luminance of highlight colors. */
export function inferCodeThemeIsDark(variables: ThemeVariable[]): boolean {
  const colors = variables
    .filter((v) => v.name.startsWith("--hljs-"))
    .map((v) => v.value.trim())
    .filter((v) => /^#[0-9a-fA-F]{3,8}$/.test(v));
  if (colors.length === 0) return false;

  let sum = 0;
  for (const hex of colors) {
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4) {
      h = h.split("").map((c) => c + c).join("");
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    // Relative luminance (sRGB approx)
    sum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  // Token colors on dark themes tend to be brighter (pastel-ish)
  return sum / colors.length > 0.45;
}

export async function createCodeThemeFromVariables(
  displayName: string,
  variables: ThemeVariable[],
  isDark: boolean,
): Promise<CustomCodeTheme> {
  const dir = await ensureCodeThemesDir();
  const id = generateThemeId();
  const css = buildCodeThemeCss(variables);
  const fileName = `${id}.css`;
  await writeTextFile(joinPath(dir, fileName), css);

  const manifests = await loadCodeThemeManifest();
  const manifest: CustomCodeTheme = {
    id: `custom-${id}`,
    name: displayName,
    fileName,
    importedAt: new Date().toISOString(),
    isDark,
    previewColors: extractCodeThemePreviewColors(variables),
  };
  manifests.push(manifest);
  await saveCodeThemeManifest(manifests);
  return manifest;
}

export async function persistCodeThemeVariables(
  id: string,
  variables: ThemeVariable[],
  isDark?: boolean,
): Promise<CustomCodeTheme | null> {
  const dir = await ensureCodeThemesDir();
  const manifests = await loadCodeThemeManifest();
  const idx = manifests.findIndex((m) => m.id === id);
  if (idx < 0) return null;

  const css = buildCodeThemeCss(variables);
  await writeTextFile(joinPath(dir, manifests[idx].fileName), css);

  manifests[idx] = {
    ...manifests[idx],
    previewColors: extractCodeThemePreviewColors(variables),
    ...(typeof isDark === "boolean" ? { isDark } : {}),
  };
  await saveCodeThemeManifest(manifests);
  return manifests[idx];
}

export async function importCodeThemeFile(
  filePath: string,
  displayName: string,
): Promise<CustomCodeTheme> {
  const css = await readTextFile(filePath);
  const variables = parseCssVariables(css).filter((v) => v.name.startsWith("--hljs-"));
  if (variables.length === 0) {
    throw new Error("代码主题文件缺少 --hljs-* 变量");
  }
  const isDark = inferCodeThemeIsDark(variables);
  return createCodeThemeFromVariables(displayName, variables, isDark);
}

export async function deleteCodeThemeFile(id: string): Promise<void> {
  const dir = await ensureCodeThemesDir();
  const manifests = await loadCodeThemeManifest();
  const manifest = manifests.find((m) => m.id === id);

  if (manifest) {
    try {
      await remove(joinPath(dir, manifest.fileName));
    } catch {}
  }

  const updated = manifests.filter((m) => m.id !== id);
  await saveCodeThemeManifest(updated);
}

export async function getCodeThemeCss(id: string): Promise<string> {
  const dir = await ensureCodeThemesDir();
  const manifests = await loadCodeThemeManifest();
  const manifest = manifests.find((m) => m.id === id);
  if (!manifest) return "";
  return await readTextFile(joinPath(dir, manifest.fileName));
}
