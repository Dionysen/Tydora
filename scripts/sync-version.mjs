import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// 读取版本号
const version = readFileSync(join(root, "VERSION"), "utf-8").trim();
console.log(`Syncing version: ${version}`);

// 更新 tauri.conf.json
const tauriConfPath = join(root, "src-tauri", "tauri.conf.json");
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`Updated tauri.conf.json`);

// 更新 Cargo.toml
const cargoTomlPath = join(root, "src-tauri", "Cargo.toml");
let cargoToml = readFileSync(cargoTomlPath, "utf-8");
cargoToml = cargoToml.replace(/^version\s*=\s*".*"/m, `version = "${version}"`);
writeFileSync(cargoTomlPath, cargoToml);
console.log(`Updated Cargo.toml`);

// 更新 package.json
const packageJsonPath = join(root, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
packageJson.version = version;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
console.log(`Updated package.json`);

// 更新落地页版本号
const landingPath = join(root, "website", "landing", "index.html");
let landingHtml = readFileSync(landingPath, "utf-8");
landingHtml = landingHtml.replace(
  /v\d+\.\d+\.\d+\s*—\s*跨平台支持/,
  `v${version} — 跨平台支持`
);
writeFileSync(landingPath, landingHtml);
console.log(`Updated landing page`);

// 更新文档关于页版本号（中文）
const aboutPathZh = join(root, "website", "docs_zh", "01-开始使用", "02-关于.md");
let aboutMdZh = readFileSync(aboutPathZh, "utf-8");
aboutMdZh = aboutMdZh.replace(
  /(\|\s*当前版本\s*\|\s*)\d+\.\d+\.\d+(\s*\|)/,
  `$1${version}$2`
);
writeFileSync(aboutPathZh, aboutMdZh);
console.log(`Updated docs_zh/01-开始使用/02-关于.md`);

// 更新文档关于页版本号（英文）
const aboutPathEn = join(root, "website", "docs_en", "01-Getting-Started", "02-About.md");
let aboutMdEn = readFileSync(aboutPathEn, "utf-8");
aboutMdEn = aboutMdEn.replace(
  /(\|\s*Current Version\s*\|\s*)\d+\.\d+\.\d+(\s*\|)/,
  `$1${version}$2`
);
writeFileSync(aboutPathEn, aboutMdEn);
console.log(`Updated docs_en/01-Getting-Started/02-About.md`);

console.log(`All versions synced to ${version}`);
