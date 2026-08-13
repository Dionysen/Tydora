/**
 * 将埋点片段注入 website/site/** 下所有 HTML 的 </head> 前
 * 在 copy-landing 之后运行，因此落地页与文档页都会覆盖到
 * 片段内容统一维护在 website/analytics/snippet.html（换统计服务只改这一个文件）
 * 幂等：页面已含 id="t-analytics" 则跳过，重复构建不会重复注入
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "../website/site");
const SNIPPET_FILE = resolve(__dirname, "../website/analytics/snippet.html");

let snippet = "";
try {
  snippet = readFileSync(SNIPPET_FILE, "utf-8").trim();
} catch {
  console.log("⚠️ website/analytics/snippet.html 不存在，跳过注入");
  process.exit(0);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith(".html")) inject(full);
  }
}

function inject(file) {
  const html = readFileSync(file, "utf-8");
  if (!html.includes("</head>") || html.includes('id="t-analytics"')) return;
  const out = html.replace("</head>", `  ${snippet}\n</head>`);
  writeFileSync(file, out, "utf-8");
  console.log(`✅ analytics injected → ${file.replace(siteDir, "site")}`);
}

walk(siteDir);
