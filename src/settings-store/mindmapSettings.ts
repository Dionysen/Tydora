export interface MindmapSettings {
  maxWidth: number;
  duration: number;
  initialExpandLevel: number;
  spacingHorizontal: number;
  spacingVertical: number;
  lineWidth: number;
  colorFreezeLevel: number;
}

export const DEFAULT_MINDMAP: MindmapSettings = {
  maxWidth: 200,
  duration: 300,
  initialExpandLevel: 2,
  spacingHorizontal: 80,
  spacingVertical: 5,
  lineWidth: 1.5,
  colorFreezeLevel: 0,
};

export const MINDMAP_SETTINGS_KEY = "inimark-mindmap-settings";
