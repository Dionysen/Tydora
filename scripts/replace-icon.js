import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, '../src/assets/icon.png');
const iconsDir = path.join(__dirname, '../src-tauri/icons');

// macOS Dock: full-bleed squircle assets look oversized next to system icons.
// Scale content to ~82% with transparent margins for optical parity.
const DOCK_OPTICAL_SCALE = 0.82;
const CANVAS_SIZE = 1024;

async function createDockSource(src) {
  const contentSize = Math.round(CANVAS_SIZE * DOCK_OPTICAL_SCALE);
  const offset = Math.round((CANVAS_SIZE - contentSize) / 2);
  const outPath = path.join(tmpdir(), `inimark-icon-dock-${Date.now()}.png`);

  const resized = await sharp(src)
    .ensureAlpha()
    .resize(contentSize, contentSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(outPath);

  return outPath;
}

console.log(`Using source image: ${sourcePath}`);

const dockSource = await createDockSource(sourcePath);
console.log(
  `Dock-optimized canvas: ${CANVAS_SIZE}px @ ${Math.round(DOCK_OPTICAL_SCALE * 100)}% content`
);

try {
  execSync(`npx tauri icon "${dockSource}" --output "${iconsDir}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Failed to generate icons:', error.message);
  process.exit(1);
} finally {
  fs.rmSync(dockSource, { force: true });
}

console.log('Done!');
