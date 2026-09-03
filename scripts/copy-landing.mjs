/**
 * 将落地页写入 website/site/index.html 和 website/site/en/index.html
 * 复制落地页素材、注入文档站顶栏（Ink/Silver）、隐藏明暗切换
 * 在 markdown-publish 构建后运行此脚本
 */
import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "../website/site");
const landingDir = resolve(__dirname, "../website/landing");
const assetsSrc = resolve(__dirname, "../website/assets");

// Link prefix root. Default is /Inimark/ (GitHub Pages project page, see baseHref in
// markdown-publish config). For EdgeOne root-path deployment, set BASE_HREF=/ to skip prefixing.
const BASE_HREF = process.env.BASE_HREF || "/Inimark/";
const SKIP_PREFIX = BASE_HREF === "/";
const base = SKIP_PREFIX ? "/" : BASE_HREF.endsWith("/") ? BASE_HREF : `${BASE_HREF}/`;

mkdirSync(siteDir, { recursive: true });

// Copy app icon
const iconSrc = resolve(__dirname, "../src-tauri/icons/icon.png");
const iconDest = resolve(siteDir, "icon.png");
try {
  writeFileSync(iconDest, readFileSync(iconSrc));
} catch {
  console.log("⚠️ Icon file not found, skipping");
}

// Copy favicon (prefer PNG for browser tabs; keep SVG if present)
for (const name of ["favicon.png", "favicon.svg", "favicon.ico"]) {
  const src = resolve(landingDir, name);
  if (!existsSync(src)) continue;
  try {
    writeFileSync(resolve(siteDir, name), readFileSync(src));
    console.log(`✅ ${name} written to website/site/${name}`);
  } catch {
    console.log(`⚠️ Failed to copy ${name}`);
  }
}

// Copy landing screenshots used by zh/en landing pages
if (existsSync(assetsSrc)) {
  const assetsDest = resolve(siteDir, "assets");
  mkdirSync(assetsDest, { recursive: true });
  cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log("✅ Landing assets copied to website/site/assets/");
} else {
  console.log("⚠️ website/assets not found, skipping");
}

/**
 * Process a landing page: read, fix doc links, write to dest.
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

  if (!SKIP_PREFIX) {
    html = html.replace(
      /href="(\/(?!\/|Inimark\/|index\.html)[^"]*)"/g,
      (_match, path) => `href="${BASE_HREF.replace(/\/$/, "")}${path}"`
    );
  }

  writeFileSync(destPath, html, "utf-8");
  console.log(`✅ ${label} landing page written to ${destPath}`);
}

mkdirSync(resolve(siteDir, "en"), { recursive: true });
processLanding(
  resolve(landingDir, "index.html"),
  resolve(siteDir, "index.html"),
  "Chinese"
);
processLanding(
  resolve(landingDir, "en/index.html"),
  resolve(siteDir, "en/index.html"),
  "English"
);

const enImagesSrc = resolve(__dirname, "../website/images/en");
const enImagesDest = resolve(siteDir, "en/images");
if (existsSync(enImagesSrc)) {
  mkdirSync(enImagesDest, { recursive: true });
  cpSync(enImagesSrc, enImagesDest, { recursive: true });
  console.log("✅ English landing images copied to website/site/en/images/");
}

function fix404(path, label) {
  try {
    let notFound = readFileSync(path, "utf-8");
    notFound = notFound.replace(/\/index\b(?!\/)/g, "/index/");
    writeFileSync(path, notFound, "utf-8");
    console.log(`✅ ${label} redirect fixed`);
  } catch {
    console.log(`⚠️ ${label} not found, skipping redirect fix`);
  }
}
fix404(resolve(siteDir, "404.html"), "404.html");
fix404(resolve(siteDir, "en/404.html"), "en/404.html");

/** Recursively list .html files under dir */
function listHtmlFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) listHtmlFiles(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function buildTopbar({ isEn }) {
  const homeHref = isEn ? `${base}en/` : base;
  const docsHref = isEn ? `${base}en/index/` : `${base}index/`;
  const zhHref = base;
  const enHref = `${base}en/`;
  const iconHref = `${base}icon.png`;
  const homeLabel = isEn ? "Home" : "主页";
  const docsLabel = isEn ? "Docs" : "文档";
  const activeHome = "";
  const activeDocs = "active";

  return `<!-- inimark-site-chrome -->
<style id="inimark-site-chrome-css">
  app-theme-toggle, .theme-toggle { display: none !important; }
  html { color-scheme: light !important; }
  .inimark-topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10050;
    height: 56px;
    display: flex; align-items: center;
    background: rgba(250, 250, 250, 0.92);
    backdrop-filter: blur(14px) saturate(160%);
    -webkit-backdrop-filter: blur(14px) saturate(160%);
    border-bottom: 1px solid #e0e0e0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  .inimark-topbar-inner {
    width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 16px;
    display: flex; align-items: center; gap: 20px; height: 100%;
  }
  .inimark-topbar-logo {
    display: inline-flex; align-items: center; gap: 8px;
    font-weight: 700; font-size: 1.05rem; color: #0a0a0a; text-decoration: none;
    letter-spacing: -0.02em;
  }
  .inimark-topbar-logo img { width: 24px; height: 24px; border-radius: 6px; }
  .inimark-topbar-links { display: flex; gap: 4px; }
  .inimark-topbar-links a {
    padding: 6px 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
    color: #5c5c5c; text-decoration: none;
  }
  .inimark-topbar-links a:hover,
  .inimark-topbar-links a.active { color: #0a0a0a; background: #e8e8e8; }
  .inimark-topbar-right {
    margin-left: auto; display: flex; align-items: center; gap: 10px;
  }
  .inimark-topbar-lang {
    display: flex; gap: 2px; font-size: 0.82rem; color: #8a8a8a;
    padding-left: 10px; border-left: 1px solid #e0e0e0;
  }
  .inimark-topbar-lang a {
    padding: 3px 7px; border-radius: 6px; color: inherit; text-decoration: none; font-weight: 500;
  }
  .inimark-topbar-lang a.active,
  .inimark-topbar-lang a:hover { color: #0a0a0a; background: #e8e8e8; }
  .inimark-topbar-github {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid #e0e0e0; background: #fff;
    display: grid; place-items: center; color: #5c5c5c;
  }
  .inimark-topbar-github:hover { color: #0a0a0a; border-color: #c8c8c8; }
  .inimark-topbar-github svg { width: 16px; height: 16px; }
  body { padding-top: 56px !important; }
  .nav-toggle { top: 64px !important; }
</style>
<nav class="inimark-topbar" aria-label="Site">
  <div class="inimark-topbar-inner">
    <a class="inimark-topbar-logo" href="${homeHref}">
      <img src="${iconHref}" alt="" width="24" height="24"/>
      <span>Inimark</span>
    </a>
    <div class="inimark-topbar-links">
      <a href="${homeHref}" class="${activeHome}">${homeLabel}</a>
      <a href="${docsHref}" class="${activeDocs}">${docsLabel}</a>
    </div>
    <div class="inimark-topbar-right">
      <div class="inimark-topbar-lang">
        <a href="${zhHref}" class="${isEn ? "" : "active"}">中文</a>
        <a href="${enHref}" class="${isEn ? "active" : ""}">EN</a>
      </div>
      <a class="inimark-topbar-github" href="https://github.com/Dionysen/Inimark" target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>
    </div>
  </div>
</nav>
<script id="inimark-site-chrome-js">
(function () {
  try {
    localStorage.setItem("theme", "light");
    localStorage.setItem("color-scheme", "light");
    document.documentElement.classList.remove("theme-dark", "dark");
    document.documentElement.dataset.theme = "light";
  } catch (_) {}
})();
</script>
`;
}

function injectDocsChrome() {
  const landingPaths = new Set([
    resolve(siteDir, "index.html"),
    resolve(siteDir, "en/index.html"),
  ]);
  const files = listHtmlFiles(siteDir).filter((f) => !landingPaths.has(f));
  let injected = 0;

  for (const file of files) {
    let html = readFileSync(file, "utf-8");
    if (!html.includes("app-theme-toggle") && !html.includes("theme-toggle") && !html.includes("app-shell")) {
      continue;
    }
    // Fresh docs build — strip prior injection if re-run without rebuild
    html = html.replace(/<!-- inimark-site-chrome -->[\s\S]*?<script id="inimark-site-chrome-js">[\s\S]*?<\/script>\n?/g, "");

    const rel = relative(siteDir, file).replace(/\\/g, "/");
    const isEn = rel === "en" || rel.startsWith("en/");
    const chrome = buildTopbar({ isEn });

    if (/<body[^>]*>/i.test(html)) {
      html = html.replace(/<body([^>]*)>/i, `<body$1>\n${chrome}`);
    } else {
      html = chrome + html;
    }
    writeFileSync(file, html, "utf-8");
    injected += 1;
  }
  console.log(`✅ Docs topbar injected into ${injected} pages (theme toggle hidden, light fixed)`);
}

injectDocsChrome();
