import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Side } from "./columnLayout";

interface SidebarColumnProps {
  side: Side;
  collapsed: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  children: ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
}

export function SidebarColumn({
  side,
  collapsed,
  width,
  onWidthChange,
  children,
  className,
  minWidth = 180,
  maxWidth = 800,
}: SidebarColumnProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setStartX(e.clientX);
      setStartWidth(width);
    },
    [width],
  );

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = side === "left" ? e.clientX - startX : startX - e.clientX;
      const clamped = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      onWidthChange(clamped);
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onWidthChange, startX, startWidth, side, minWidth, maxWidth]);

  return (
    <div
      className={`sidebar sidebar-column sidebar-column--${side}${collapsed ? " collapsed" : ""}${isResizing ? " resizing" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: collapsed ? 0 : width }}
    >
      <div className="sidebar-topbar" data-tauri-drag-region="deep" />
      {children}
      {!collapsed && (
        <div
          className={`sidebar-resize-handle sidebar-resize-handle--${side}`}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
}
