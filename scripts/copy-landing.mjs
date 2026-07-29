/**
 * 将落地页写入 website/site/index.html
 * 从 website/landing/index.html 读取最新 HTML
 * 在 markdown-publish 构建后运行此脚本
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = resolve(__dirname, "../website/site/index.html");
const landingHtmlPath = resolve(__dirname, "../website/landing/index.html");

// Ensure the site directory exists
mkdirSync(resolve(__dirname, "../website/site"), { recursive: true });

// Copy icon files to site directory
const iconSrc = resolve(__dirname, "../src-tauri/icons/icon.png");
const iconDest = resolve(__dirname, "../website/site/icon.png");
try {
  writeFileSync(iconDest, readFileSync(iconSrc));
} catch (e) {
  console.log("⚠️ Icon file not found, skipping");
}

// Copy favicon to site directory
const faviconSrc = resolve(__dirname, "../dist/favicon.svg");
const faviconDest = resolve(__dirname, "../website/site/favicon.svg");
try {
  writeFileSync(faviconDest, readFileSync(faviconSrc));
} catch (e) {
  console.log("⚠️ Favicon file not found, skipping");
}

// Read the landing page HTML from external file
let html;
try {
  html = readFileSync(landingHtmlPath, "utf-8");
} catch (e) {
  console.error("❌ Failed to read landing page from:", landingHtmlPath);
  console.error(e.message);
  process.exit(1);
}

// Replace landing page paths for site context
// The landing page uses relative paths (./) which should work in both contexts
// but we need to adjust navigation links for the site

// Write the landing page as the site's index.html
writeFileSync(dest, html, "utf-8");
console.log("✅ Landing page written to website/site/index.html");

// Fix 404.html redirect: /index -> /index/ (trailing slash for GitHub Pages)
const notFoundPath = resolve(__dirname, "../website/site/404.html");
try {
  let notFound = readFileSync(notFoundPath, "utf-8");
  notFound = notFound.replace(/\/index\b(?!\/)/g, "/index/");
  writeFileSync(notFoundPath, notFound, "utf-8");
  console.log("✅ 404.html redirect fixed to /index/");
} catch {
  console.log("⚠️ 404.html not found, skipping redirect fix");
}