// src/vim/settings/VimSettingsPanel.tsx
// 设置面板「Vim 模式」分组。Phase 0 仅含开关；后续 Phase 追加 Leader 键等配置。
//
// 设计：组件自包含，从 localStorage 直接读写（与 PublishSettings 同模式），
// 改动经 storage 事件跨窗口同步到主 App 的 VimProvider。

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadVimConfig, saveVimConfig, type VimConfig } from "../config/configLoader";

export function VimSettingsPanel() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<VimConfig>(() => loadVimConfig());

  // 跨窗口同步：外部改动 → 刷新本面板
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "zmd-vim-config") setConfig(loadVimConfig());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const update = (patch: Partial<VimConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      saveVimConfig(next);
      return next;
    });
  };

  return (
    <div className="canvas-settings-page">
      <div className="canvas-settings-card">
        <div className="canvas-settings-row">
          <div className="canvas-settings-row-label">
            <span className="canvas-settings-row-title">
              {t("settings.vim.enable", "启用 Vim 模式")}
            </span>
            <span className="canvas-settings-row-desc">
              {t(
                "settings.vim.enableDesc",
                "LazyVim 风格键盘操作。默认关闭，关闭时不影响任何现有功能。源码模式启用完整三态，所见即所得模式仅接入 Leader 菜单。"
              )}
            </span>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
            <span className="settings-switch-slider" />
          </label>
        </div>
      </div>

      {config.enabled && (
        <div className="canvas-settings-card">
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">
                {t("settings.vim.leaderKey", "Leader 键（源码模式）")}
              </span>
              <span className="canvas-settings-row-desc">
                {t(
                  "settings.vim.leaderKeyDesc",
                  "normal 模式下按此键弹出 Leader 菜单。默认空格。"
                )}
              </span>
            </div>
            <input
              type="text"
              className="settings-input"
              style={{ width: 80, textAlign: "center" }}
              value={config.leaderKey}
              maxLength={1}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= 1) update({ leaderKey: v || " " });
              }}
            />
          </div>
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">
                {t("settings.vim.tiptapLeaderKey", "Leader 触发键（所见即所得模式）")}
              </span>
              <span className="canvas-settings-row-desc">
                {t(
                  "settings.vim.tiptapLeaderKeyDesc",
                  "所见即所得模式无完整模态，用此键触发 Leader 菜单。默认分号。"
                )}
              </span>
            </div>
            <input
              type="text"
              className="settings-input"
              style={{ width: 80, textAlign: "center" }}
              value={config.tiptapLeaderKey}
              maxLength={1}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= 1) update({ tiptapLeaderKey: v || ";" });
              }}
            />
          </div>
          <div className="canvas-settings-row">
            <div className="canvas-settings-row-label">
              <span className="canvas-settings-row-title">
                {t("settings.vim.menuTimeout", "菜单超时自动关闭")}
              </span>
              <span className="canvas-settings-row-desc">
                {t("settings.vim.menuTimeoutDesc", "Leader 菜单无操作自动关闭的毫秒数。")}
              </span>
            </div>
            <div className="canvas-settings-row-control">
              <input
                type="range"
                className="canvas-settings-slider"
                min={1000}
                max={5000}
                step={500}
                value={config.menuTimeout}
                onChange={(e) => update({ menuTimeout: Number(e.target.value) })}
              />
              <span className="canvas-settings-unit">{config.menuTimeout}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
