/**
 * 本地预览文档站（website/site）
 *
 * - 从 website/docs_zh/markdown-publish.config.json 读取 baseHref（可用 BASE_HREF 覆盖）
 * - 按 GitHub Pages 子路径规则提供静态文件（默认 /Inimark/）
 * - 未知路径回退到 404.html，与线上 Pages 行为一致
 *
 * 用法：
 *   npm run docs:serve
 *   npm run docs:serve -- --port=8080
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const siteDir = resolve(root, "website/site");
const zhConfigPath = resolve(root, "website/docs_zh/markdown-publish.config.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webp": "image/webp",
};

function readArg(key) {
  const prefix = `--${key}=`;
  const arg = process.argv.slice(2).find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function normalizeBaseHref(raw) {
  let href = String(raw ?? "/").trim() || "/";
  if (!href.startsWith("/")) href = `/${href}`;
  if (!href.endsWith("/")) href += "/";
  return href;
}

/** "/Inimark/" → "/Inimark"；"/" → "" */
function basePathFromHref(baseHref) {
  return baseHref === "/" ? "" : baseHref.slice(0, -1);
}

function loadBaseHref() {
  if (process.env.BASE_HREF) return normalizeBaseHref(process.env.BASE_HREF);
  if (!existsSync(zhConfigPath)) return "/Inimark/";
  const cfg = JSON.parse(readFileSync(zhConfigPath, "utf-8"));
  return normalizeBaseHref(cfg.baseHref);
}

async function tryFile(path) {
  try {
    const info = await stat(path);
    if (info.isFile()) return path;
  } catch {
    // not found
  }
  return null;
}

function resolveSitePath(urlPath, basePath) {
  let relative = urlPath;
  if (basePath && (relative === basePath || relative.startsWith(`${basePath}/`))) {
    relative = relative.slice(basePath.length) || "/";
  }
  const segments = relative.split("/").filter(Boolean);
  if (segments.length === 0) return join(siteDir, "index.html");
  const filePath = join(siteDir, ...segments);
  if (!filePath.startsWith(siteDir)) return null;
  return filePath;
}

async function resolveFile(urlPath, basePath) {
  const sitePath = resolveSitePath(urlPath, basePath);
  if (!sitePath) return null;

  const direct = await tryFile(sitePath);
  if (direct) return direct;

  const asDir = await tryFile(join(sitePath, "index.html"));
  if (asDir) return asDir;

  return (await tryFile(join(siteDir, "404.html"))) ?? join(siteDir, "index.html");
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

const baseHref = loadBaseHref();
const basePath = basePathFromHref(baseHref);
const port = Number(readArg("port") ?? process.env.PORT ?? 8080);
const entryPath = join(siteDir, "index.html");

if (!existsSync(entryPath)) {
  console.error("❌ 未找到构建产物 website/site/index.html");
  console.error("   请先运行：npm run docs:build");
  process.exit(1);
}

const previewUrl =
  basePath === "" ? `http://localhost:${port}/` : `http://localhost:${port}${baseHref}`;

createServer(async (req, res) => {
  const rawUrl = req.url ?? "/";
  const urlPath = decodeURIComponent(rawUrl.split("?")[0].split("#")[0]) || "/";

  if (basePath) {
    if (urlPath === "/") {
      redirect(res, baseHref);
      return;
    }
    if (urlPath === basePath) {
      redirect(res, baseHref);
      return;
    }
    if (!urlPath.startsWith(`${basePath}/`)) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }
  }

  const file = await resolveFile(urlPath, basePath);
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
}).listen(port, () => {
  console.log(`📖 文档站预览：${previewUrl}`);
  console.log(`   目录：${siteDir}`);
  console.log(`   baseHref：${baseHref}`);
  console.log("   按 Ctrl+C 停止");
});
