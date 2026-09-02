import { useCallback, type ReactNode } from "react";
import type { ColumnLayout, PanelId } from "./columnLayout";
import { activatePanel } from "./columnLayout";
import { panelIcon } from "./panelIcons";

interface SidebarTabsProps {
  layout: ColumnLayout;
  pool: readonly PanelId[];
  onLayoutChange: (layout: ColumnLayout) => void;
  titles?: Partial<Record<PanelId, string>>;
}

export function SidebarTabs({
  layout,
  pool,
  onLayoutChange,
  titles,
}: SidebarTabsProps) {
  const handleSelect = useCallback(
    (panel: PanelId) => {
      onLayoutChange(activatePanel(layout, pool, panel));
    },
    [layout, onLayoutChange, pool],
  );

  // 仅一个（或没有）面板时不显示 Tab 条
  if (pool.length <= 1) return null;

  return (
    <div className="sidebar-slot-header">
      <div className="sidebar-tabs-wrapper sidebar-slot-tabs">
        {pool.map((panel) => (
          <button
            key={panel}
            type="button"
            className={`sidebar-tab${layout.active === panel ? " active" : ""}`}
            title={titles?.[panel]}
            onClick={() => handleSelect(panel)}
          >
            {panelIcon(panel)}
          </button>
        ))}
      </div>
    </div>
  );
}

export type RenderPanel = (panel: PanelId) => ReactNode;
