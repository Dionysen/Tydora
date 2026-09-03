import type { ReactNode } from "react";

export type SettingsTab =
  | "general"
  | "editor"
  | "markdown"
  | "appearance"
  | "theme"
  | "shortcuts"
  | "mindmap"
  | "graph"
  | "image"
  | "canvas"
  | "about";

export interface NavItem {
  id: SettingsTab;
  label: string;
  icon: ReactNode;
  searchTerms?: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}
