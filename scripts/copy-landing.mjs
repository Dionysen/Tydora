/**
 * 将落地页写入 website/site/index.html 和 website/site/en/index.html
 * 从 website/landing/index.html 与 website/landing/en/index.html 读取最新 HTML
 * 在 markdown-publish 构建后运行此脚本
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "../website/site");
const landingDir = resolve(__dirname, "../website/landing");

// Ensure the site directory exists
mkdirSync(siteDir, { recursive: true });

// Copy icon files to site directory
const iconSrc = resolve(__dirname, "../src-tauri/icons/icon.png");
const iconDest = resolve(siteDir, "icon.png");
try {
  writeFileSync(iconDest, readFileSync(iconSrc));
} catch (e) {
  console.log("⚠️ Icon file not found, skipping");
}

// Copy favicon to site directory
const faviconSrc = resolve(__dirname, "../dist/favicon.svg");
const faviconDest = resolve(siteDir, "favicon.svg");
try {
  writeFileSync(faviconDest, readFileSync(faviconSrc));
} catch (e) {
  console.log("⚠️ Favicon file not found, skipping");
}

// Copy zjm.png (English landing page hero screenshot)
const zjmSrc = resolve(landingDir, "zjm.png");
const zjmDest = resolve(siteDir, "zjm.png");
try {
  writeFileSync(zjmDest, readFileSync(zjmSrc));
  console.log("✅ zjm.png written to website/site/zjm.png");
} catch (e) {
  console.log("⚠️ zjm.png not found, skipping");
}

/**
 * Process a landing page: read, fix doc links for GitHub Pages, write to dest.
 * GitHub Pages deploys under /Tydora/ path (baseHref in markdown-publish config).
 * Links like /index/ or /知识管理/wiki链接/ need /Tydora/ prefix.
 * But we must NOT modify:
 *   - External URLs (starting with https://)
 *   - Anchor links (starting with #)
 *   - Protocol-relative URLs (starting with //)
 *   - Already-prefixed paths (starting with /Tydora/)
 */
function processLanding(srcPath, destPath, label) {
  let html;
  try {
    html = readFileSync(srcPath, "utf-8");
  } catch (e) {
    console.error(`❌ Failed to read ${label} landing page from:`, srcPath);
    console.error(e.message);
    return;
  }

  html = html.replace(
    /href="(\/(?!\/|Tydora\/|index\.html)[^"]*)"/g,
    (match, path) => `href="/Tydora${path}"`
  );

  writeFileSync(destPath, html, "utf-8");
  console.log(`✅ ${label} landing page written to ${destPath}`);
}

// Chinese landing page → site root
mkdirSync(resolve(siteDir, "en"), { recursive: true });
processLanding(
  resolve(landingDir, "index.html"),
  resolve(siteDir, "index.html"),
  "Chinese"
);

// English landing page → site/en
processLanding(
  resolve(landingDir, "en/index.html"),
  resolve(siteDir, "en/index.html"),
  "English"
);

// Fix 404.html redirect: /index -> /index/ (trailing slash for GitHub Pages)
const notFoundPath = resolve(siteDir, "404.html");
try {
  let notFound = readFileSync(notFoundPath, "utf-8");
  notFound = notFound.replace(/\/index\b(?!\/)/g, "/index/");
  writeFileSync(notFoundPath, notFound, "utf-8");
  console.log("✅ 404.html redirect fixed to /index/");
} catch {
  console.log("⚠️ 404.html not found, skipping redirect fix");
}

// Fix English 404.html redirect (from en docs build).
// The en 404 template points to /Tydora/en/index, the same
// /index -> /index/ rule produces /Tydora/en/index/ correctly.
const enNotFoundPath = resolve(siteDir, "en/404.html");
try {
  let notFound = readFileSync(enNotFoundPath, "utf-8");
  notFound = notFound.replace(/\/index\b(?!\/)/g, "/index/");
  writeFileSync(enNotFoundPath, notFound, "utf-8");
  console.log("✅ en/404.html redirect fixed to /en/index/");
} catch {
  console.log("⚠️ en/404.html not found, skipping redirect fix");
}
