export type PanelId = "files" | "openFiles" | "search" | "outline" | "bookmarks";
export type Side = "left" | "right";
export type PanelSide = Side | "hidden";

/** Per-column layout: one active panel at a time (no vertical stack). */
export interface ColumnLayout {
  active: PanelId;
}

export const ALL_PANELS: readonly PanelId[] = [
  "files",
  "openFiles",
  "search",
  "outline",
  "bookmarks",
];

/** @deprecated Prefer panelsForSide() from user settings; kept as default pools. */
export const LEFT_PANELS: readonly PanelId[] = ["files", "openFiles", "search"];
/** @deprecated Prefer panelsForSide() from user settings; kept as default pools. */
export const RIGHT_PANELS: readonly PanelId[] = ["outline", "bookmarks"];

export type SidebarPanelSides = Record<PanelId, PanelSide>;

export const DEFAULT_SIDEBAR_PANEL_SIDES: SidebarPanelSides = {
  files: "left",
  openFiles: "left",
  search: "left",
  outline: "right",
  bookmarks: "right",
};

export const DEFAULT_LEFT_LAYOUT: ColumnLayout = { active: "files" };
export const DEFAULT_RIGHT_LAYOUT: ColumnLayout = { active: "outline" };

export const LEFT_LAYOUT_KEY = "inimark-left-sidebar-layout";
export const RIGHT_LAYOUT_KEY = "inimark-right-sidebar-layout";
export const RIGHT_SIDEBAR_WIDTH_KEY = "inimark-right-sidebar-width";
export const RIGHT_SIDEBAR_OPEN_KEY = "inimark-right-sidebar-open";
export const LEFT_SIDEBAR_OPEN_KEY = "inimark-sidebar-open";

const PANEL_IDS = new Set<PanelId>(ALL_PANELS);

function isPanelId(value: unknown): value is PanelId {
  return typeof value === "string" && PANEL_IDS.has(value as PanelId);
}

function isPanelSide(value: unknown): value is PanelSide {
  return value === "left" || value === "right" || value === "hidden";
}

export function normalizeSidebarPanelSides(raw: unknown): SidebarPanelSides {
  const next: SidebarPanelSides = { ...DEFAULT_SIDEBAR_PANEL_SIDES };
  if (!raw || typeof raw !== "object") return next;
  const obj = raw as Record<string, unknown>;
  for (const id of ALL_PANELS) {
    if (isPanelSide(obj[id])) next[id] = obj[id];
  }
  return next;
}

export function panelsForSide(
  sides: SidebarPanelSides,
  side: Side,
): PanelId[] {
  return ALL_PANELS.filter((id) => sides[id] === side);
}

export function sideOfPanel(
  sides: SidebarPanelSides,
  panel: PanelId,
): PanelSide {
  return sides[panel] ?? "hidden";
}

/**
 * Normalize persisted layout. Accepts the current `{ active }` shape and the
 * legacy stack shape `{ top: { active }, focus, ... }` so old localStorage still works.
 */
export function normalizeColumnLayout(
  raw: unknown,
  pool: readonly PanelId[],
  fallback: ColumnLayout,
): ColumnLayout {
  const fallbackActive =
    pool.length > 0
      ? (pool.includes(fallback.active) ? fallback.active : pool[0])
      : fallback.active;

  if (!raw || typeof raw !== "object") return { active: fallbackActive };

  const obj = raw as Record<string, unknown>;

  if (isPanelId(obj.active) && (pool.length === 0 || pool.includes(obj.active))) {
    return { active: obj.active };
  }

  // Legacy stack format
  const focus = obj.focus === "bottom" ? "bottom" : "top";
  const slot = (obj[focus] ?? obj.top) as { active?: unknown } | undefined;
  if (isPanelId(slot?.active) && (pool.length === 0 || pool.includes(slot.active))) {
    return { active: slot.active };
  }

  return { active: fallbackActive };
}

export function loadColumnLayout(
  key: string,
  pool: readonly PanelId[],
  fallback: ColumnLayout,
): ColumnLayout {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return normalizeColumnLayout(null, pool, fallback);
    return normalizeColumnLayout(JSON.parse(raw), pool, fallback);
  } catch {
    return normalizeColumnLayout(null, pool, fallback);
  }
}

export function saveColumnLayout(key: string, layout: ColumnLayout): void {
  try {
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // ignore quota / private mode
  }
}

export function clampLayoutToPool(
  layout: ColumnLayout,
  pool: readonly PanelId[],
  fallback: PanelId,
): ColumnLayout {
  if (pool.length === 0) return { active: fallback };
  if (pool.includes(layout.active)) return layout;
  return { active: pool[0] };
}

export function activatePanel(
  layout: ColumnLayout,
  pool: readonly PanelId[],
  panel: PanelId,
): ColumnLayout {
  if (!pool.includes(panel)) return layout;
  if (layout.active === panel) return layout;
  return { active: panel };
}
