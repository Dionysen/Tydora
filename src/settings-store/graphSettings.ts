export interface GraphSettings {
  openInNewWindow: boolean;
  nodeSize: number;
  linkDistance: number;
  chargeStrength: number;
  edgeOpacity: number;
  labelFontSize: number;
}

export const DEFAULT_GRAPH: GraphSettings = {
  openInNewWindow: false,
  nodeSize: 15,
  linkDistance: 160,
  chargeStrength: -200,
  edgeOpacity: 0.8,
  labelFontSize: 11,
};

export const GRAPH_SETTINGS_KEY = "inimark-graph-settings";
