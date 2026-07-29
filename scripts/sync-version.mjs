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

// 更新文档关于页版本号
const aboutPath = join(root, "website", "docs", "关于.md");
let aboutMd = readFileSync(aboutPath, "utf-8");
aboutMd = aboutMd.replace(
  /当前版本：\d+\.\d+\.\d+/,
  `当前版本：${version}`
);
writeFileSync(aboutPath, aboutMd);
console.log(`Updated docs/关于.md`);

console.log(`All versions synced to ${version}`);
