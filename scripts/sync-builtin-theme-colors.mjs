/**
 * Sync BUILTIN_THEME_COLORS from src/themes/themeTokens.ts → website/shared/builtin-theme-colors.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outPath = resolve(root, "website/shared/builtin-theme-colors.json");

const snippet = `
import { BUILTIN_THEME_COLORS } from './src/themes/themeTokens.ts';
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('website/shared', { recursive: true });
writeFileSync('${outPath.replace(/\\/g, "/")}', JSON.stringify(BUILTIN_THEME_COLORS, null, 2));
console.log('✅ synced builtin-theme-colors.json (' + Object.keys(BUILTIN_THEME_COLORS).length + ' themes)');
`;

const result = spawnSync("npx", ["--yes", "tsx", "-e", snippet], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error("⚠️ Failed to sync theme colors from themeTokens.ts (is tsx available?)");
  process.exit(result.status ?? 1);
}
