import { TypedEventEmitter } from '../TypedEventEmitter';

export type CanvasEvents = {
  fitToContent: () => void;
  toggleGrid: () => void;
  toggleRuler: () => void;
  toggleGuides: () => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  addGuide: { type: 'horizontal' | 'vertical'; position: number };
  moveGuide: { id: string; position: number };
  removeGuide: { id: string };
} & Record<string, any>;

export const canvasEvents = new TypedEventEmitter<CanvasEvents>();


