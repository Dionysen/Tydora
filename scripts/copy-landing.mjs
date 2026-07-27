/**
 * 将落地页复制到 website/site/index.html
 * 在 markdown-publish 构建后运行此脚本
 */
import { copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "../website/landing/index.html");
const dest = resolve(__dirname, "../website/site/index.html");

copyFileSync(src, dest);
console.log("✅ Landing page copied to website/site/index.html");
