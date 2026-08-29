/** 菜单项密度：影响右键菜单、下拉菜单等条目的内边距与行高 */
export type MenuDensity = "comfortable" | "normal" | "compact";

export function normalizeMenuDensity(value: unknown): MenuDensity {
  if (value === "comfortable" || value === "normal" || value === "compact") {
    return value;
  }
  return "compact";
}

export function applyMenuDensity(density: MenuDensity): void {
  document.documentElement.dataset.menuDensity = density;
}

/** 从 localStorage 读取并应用到当前窗口（供各窗口入口尽早调用） */
export function applyMenuDensityFromStorage(): void {
  try {
    const raw = localStorage.getItem("zmd-general-settings");
    const settings = raw ? JSON.parse(raw) : {};
    applyMenuDensity(normalizeMenuDensity(settings.menuDensity));
  } catch {
    applyMenuDensity("compact");
  }
}
