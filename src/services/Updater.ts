import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch, exit } from "@tauri-apps/plugin-process";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface UpdateInfo {
  version: string;
  body: string;
  date: string;
  /** GitHub 版 NSIS 安装包下载地址（仅商店版切换通道返回） */
  url?: string | null;
}

let cachedUpdate: Update | null = null;
let storeUpdateUrl: string | null = null;

/** 当前是否为微软商店（MSIX）版本。商店版本需要走自定义 GitHub 切换通道。 */
export async function isStoreVersion(): Promise<boolean> {
  try {
    return await invoke<boolean>("is_store_version");
  } catch {
    return false;
  }
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  // 商店版（MSIX）：检测 GitHub 是否有更高版本。Rust 端已比较版本号，
  // 只返回更高的版本。之后通过"下载 GitHub 安装包 → 卸载商店版 → 安装"
  // 的切换通道更新，保证重新打开应用就是新版本。
  if (await isStoreVersion()) {
    cachedUpdate = null;
    storeUpdateUrl = null;
    try {
      const info = await invoke<UpdateInfo | null>("check_github_update");
      storeUpdateUrl = info?.url ?? null;
      return info;
    } catch {
      return null;
    }
  }
  // 非商店版（NSIS）：走内置 updater
  try {
    const update = await check();
    if (update) {
      cachedUpdate = update;
      return {
        version: update.version,
        body: update.body || "",
        date: update.date || "",
      };
    }
    cachedUpdate = null;
    return null;
  } catch {
    cachedUpdate = null;
    return null;
  }
}

export async function downloadAndInstall(
  onProgress?: (downloaded: number, contentLength: number | null) => void
): Promise<void> {
  // 商店版：下载 GitHub 安装包并启动后台切换脚本（卸载商店版 + 静默安装）
  if (await isStoreVersion()) {
    if (!storeUpdateUrl) throw new Error("No update available");
    const unlisten = await listen<{ downloaded: number; total: number | null }>(
      "github-update-progress",
      (e) => {
        onProgress?.(e.payload.downloaded, e.payload.total);
      }
    );
    try {
      await invoke("switch_to_github_update", { url: storeUpdateUrl });
    } finally {
      unlisten();
    }
    storeUpdateUrl = null;
    return;
  }
  if (!cachedUpdate) throw new Error("No update available");
  let downloaded = 0;
  let contentLength: number | null = null;
  await cachedUpdate.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        contentLength = event.data.contentLength ?? null;
        break;
      case "Progress":
        downloaded += event.data.chunkLength;
        onProgress?.(downloaded, contentLength);
        break;
      case "Finished":
        break;
    }
  });
  cachedUpdate = null;
}

export async function relaunchApp(): Promise<void> {
  await relaunch();
}

/** 退出应用。商店版切换完成后调用：后台脚本随后卸载商店版并安装 GitHub 版。 */
export async function exitApp(): Promise<void> {
  await exit(0);
}
