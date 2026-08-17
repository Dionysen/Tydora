/**
 * 一键部署到 EdgeOne Makers（方案 A：本地构建 + CLI 直接部署）
 *
 * 用法：
 *   npm run deploy:edgeone -- --name=<项目名> [--token=<API Token>] [--env=production|preview] [--area=global|overseas]
 *
 * 说明：
 * - 以根路径 baseHref（/）构建文档站 + 落地页（与 GitHub Pages 的 /Tydora/ 构建互不影响）
 * - 将 website/site 产物直接部署到 EdgeOne Makers
 * - --area 区域：
 *     global   = 全球含中国大陆节点，国内加速好，但绑定自定义域名需工信部备案
 *     overseas = 不含中国大陆节点，绑定免费域名（如 is-a.dev / eu.org）无需备案
 *   ⚠️ 注意：EdgeOne 的"含中国大陆"区域强制要求自定义域名已备案（免费域名无法备案）。
 *     因此绑定免费域名时必须使用 --area=overseas，代价是国内访问无加速（海外节点绕路）。
 * - 若未传 --token 且未执行过 `edgeone login`，CLI 会触发交互式浏览器登录
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const args = process.argv.slice(2);
const readArg = (key) => {
  const arg = args.find((a) => a.startsWith(`--${key}=`));
  return arg ? arg.slice(`--${key}=`.length) : undefined;
};

const projectName = readArg("name");
const token = readArg("token") || process.env.EDGEONE_API_TOKEN;
const env = readArg("env") || "production";
const area = readArg("area") || "global";

if (!projectName) {
  console.error("❌ 缺少项目名。用法：npm run deploy:edgeone -- --name=<项目名> [--token=<API Token>]");
  process.exit(1);
}

// 1. 以根路径构建（BASE_HREF=/ 同时作用于 markdown-publish 的 baseHref 与落地页链接前缀）
process.env.BASE_HREF = "/";
console.log("\n🚀 [1/2] 构建文档站（baseHref=/）...\n");
const build = spawnSync("npm", ["run", "docs:build"], { cwd: root, stdio: "inherit", shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

// 2. 部署到 EdgeOne Makers（区域由 --area 决定，global 含国内节点；overseas 绑定免费域名无需备案）
const deployArgs = ["makers", "deploy", "website/site", "-n", projectName, "-a", area, "-e", env];
if (token) deployArgs.push("-t", token);
console.log(`\n🚀 [2/2] 部署到 EdgeOne Makers（项目: ${projectName}, 区域: ${area}, 环境: ${env}）...\n`);
const deploy = spawnSync("edgeone", deployArgs, { cwd: root, stdio: "inherit", shell: true });
process.exit(deploy.status ?? 1);
