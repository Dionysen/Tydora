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
const publicIconPath = path.join(__dirname, '../public/icon.png');

// macOS Dock: full-bleed icons look oversized next to system apps.
const DOCK_OPTICAL_SCALE = 0.82;
const CANVAS_SIZE = 1024;
// Apple continuous-corner approx (~22.37% of side). Close to iOS/macOS squircle.
const CORNER_RATIO = 0.2237;

/**
 * Rounded-rect mask approximating Apple's continuous corner.
 * Transparent outside the shape = "裁剪" into the platform icon look.
 */
function cornerMaskSvg(size) {
  const r = Math.round(size * CORNER_RATIO * 1000) / 1000;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>` +
      `</svg>`
  );
}

/** Square PNG → same size with Apple-like rounded corners (alpha outside). */
async function applyAppleCorners(input, size = CANVAS_SIZE) {
  const squared = await sharp(input)
    .ensureAlpha()
    .resize(size, size, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toBuffer();

  return sharp(squared)
    .composite([
      {
        input: cornerMaskSvg(size),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
}

/** Windows / Linux: full-bleed + rounded corners. */
async function createDesktopSource(src) {
  const outPath = path.join(tmpdir(), `inimark-icon-desktop-${Date.now()}.png`);
  const masked = await applyAppleCorners(src, CANVAS_SIZE);
  await sharp(masked).toFile(outPath);
  return outPath;
}

/**
 * macOS: same rounded glyph, scaled to ~82% and centered on a transparent canvas
 * so Dock optical size matches system icons.
 */
async function createMacSource(src) {
  const contentSize = Math.round(CANVAS_SIZE * DOCK_OPTICAL_SCALE);
  const offset = Math.round((CANVAS_SIZE - contentSize) / 2);
  const outPath = path.join(tmpdir(), `inimark-icon-mac-${Date.now()}.png`);

  const masked = await applyAppleCorners(src, contentSize);

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: masked, left: offset, top: offset }])
    .png()
    .toFile(outPath);

  return outPath;
}

function runTauriIcon(input, output) {
  fs.mkdirSync(output, { recursive: true });
  execSync(`npx tauri icon "${input}" --output "${output}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source icon not found: ${sourcePath}`);
  console.error('Place a square PNG at src/assets/icon.png and retry.');
  process.exit(1);
}

console.log(`Using source image: ${sourcePath}`);
console.log(
  `Corners: ${(CORNER_RATIO * 100).toFixed(2)}% radius | macOS content: ${Math.round(DOCK_OPTICAL_SCALE * 100)}%`
);

const desktopSource = await createDesktopSource(sourcePath);
const macSource = await createMacSource(sourcePath);
const desktopOut = path.join(tmpdir(), `inimark-icons-desktop-${Date.now()}`);
const macOut = path.join(tmpdir(), `inimark-icons-mac-${Date.now()}`);

try {
  console.log('\n[1/2] Generating Windows / Linux icons (full-bleed + corners)...');
  runTauriIcon(desktopSource, desktopOut);

  console.log('\n[2/2] Generating macOS icons (82% + same corners)...');
  runTauriIcon(macSource, macOut);

  // Base set from desktop (Windows .ico, Linux PNGs, Store tiles, Android…)
  copyDir(desktopOut, iconsDir);

  // Swap in macOS-only assets from the optically scaled source
  // Only .icns uses the 82% source. iOS/Android stay on the full-bleed set
  // (those platforms apply their own masks at install/runtime).
  const macIcns = path.join(macOut, 'icon.icns');
  if (fs.existsSync(macIcns)) {
    copyFile(macIcns, path.join(iconsDir, 'icon.icns'));
  }

  // Dev / web favicon
  const generatedPng = path.join(iconsDir, 'icon.png');
  if (fs.existsSync(generatedPng)) {
    copyFile(generatedPng, publicIconPath);
  }

  console.log('\nIcons written to src-tauri/icons/');
  console.log('  Windows / Linux: full size + Apple-like corners');
  console.log('  macOS (.icns):   82% optical scale + same corners');
  console.log(`  Favicon:        ${publicIconPath}`);
} catch (error) {
  console.error('Failed to generate icons:', error.message);
  process.exit(1);
} finally {
  fs.rmSync(desktopSource, { force: true });
  fs.rmSync(macSource, { force: true });
  fs.rmSync(desktopOut, { recursive: true, force: true });
  fs.rmSync(macOut, { recursive: true, force: true });
}

console.log('Done!');
