import type { ReactNode } from "react";
import type { ColumnLayout, PanelId } from "./columnLayout";
import { SidebarTabs, type RenderPanel } from "./SidebarTabs";

interface SidebarPanelHostProps {
  layout: ColumnLayout;
  pool: readonly PanelId[];
  onLayoutChange: (layout: ColumnLayout) => void;
  renderPanel: RenderPanel;
  bodyClassName?: string;
  panelTitles?: Partial<Record<PanelId, string>>;
  footer?: ReactNode;
}

/** Single-panel column body: tab strip + one active panel (+ optional footer). */
export function SidebarPanelHost({
  layout,
  pool,
  onLayoutChange,
  renderPanel,
  bodyClassName,
  panelTitles,
  footer,
}: SidebarPanelHostProps) {
  const showTabs = pool.length > 1;

  return (
    <div className="sidebar-stack">
      <div
        className={`sidebar-slot is-focused${showTabs ? "" : " sidebar-slot--no-tabs"}`}
        style={{ minHeight: 0, flex: 1 }}
      >
        <SidebarTabs
          layout={layout}
          pool={pool}
          onLayoutChange={onLayoutChange}
          titles={panelTitles}
        />
        <div className={`sidebar-slot-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
          {renderPanel(layout.active)}
        </div>
      </div>
      {footer}
    </div>
  );
}
