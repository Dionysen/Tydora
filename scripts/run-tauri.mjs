import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

/**
 * Load environment variables from a .env file
 */
function loadEnv(envPath) {
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const value = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch {
    // .env file not found, skip silently
  }
}

// Load .env for Tauri code signing keys
loadEnv(resolve(projectRoot, ".env"));

const args = process.argv.slice(2);

// 扩展命令：tauri build:msix → 调用 build-msix.ps1 打包 MSIX
// （Tauri CLI 原生不支持 msix 目标，这里用 MakeAppx 自行打包）
if (args[0] === "build:msix") {
  const ps1 = resolve(projectRoot, "scripts", "build-msix.ps1");
  const psArgs = ["-ExecutionPolicy", "Bypass", "-File", ps1, ...args.slice(1)];
  const result = spawnSync("powershell", psArgs, { shell: true, stdio: "inherit" });
  process.exit(result.status ?? 1);
}

// Run tauri CLI
const result = spawnSync("npx", ["tauri", ...args], {
  shell: true,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
