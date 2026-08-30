/**
 * 文档站构建入口（替代 package.json 中 docs:build 直接调用 markdown-publish 的两条命令）
 *
 * - 默认行为与原命令完全一致：依次用 docs_zh / docs_en 的 config 构建
 * - 当环境变量 BASE_HREF 存在且不等于 "/Inimark/" 时，临时覆盖 config 的 baseHref
 *   （用于 EdgeOne 根路径部署，构建完成后临时 config 自动删除，不影响 GitHub Pages 默认构建）
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const baseHref = process.env.BASE_HREF;

const configPaths = [
  resolve(root, "website/docs_zh/markdown-publish.config.json"),
  resolve(root, "website/docs_en/markdown-publish.config.json"),
];

const tempFiles = [];
try {
  for (const abs of configPaths) {
    const cfg = JSON.parse(readFileSync(abs, "utf-8"));
    let configPath = abs;

    if (baseHref && baseHref !== "/Inimark/") {
      cfg.baseHref = baseHref;
      // 临时 config 放在原 config 同目录，保持 vaultDir/out 等相对路径解析不变
      const tmp = join(dirname(abs), ".markdown-publish.config.tmp.json");
      writeFileSync(tmp, JSON.stringify(cfg, null, 2), "utf-8");
      configPath = tmp;
      tempFiles.push(tmp);
      console.log(`🔧 baseHref 覆盖为 "${baseHref}"（${configPath}）`);
    }

    const result = spawnSync(
      "npx",
      ["markdown-publish", "build", "--config", configPath],
      { cwd: root, stdio: "inherit", shell: process.platform === "win32" }
    );
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
} finally {
  for (const f of tempFiles) rmSync(f, { force: true });
}
