import { TypedEventEmitter } from '../TypedEventEmitter';

export type CanvasEvents = {
  fitToContent: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
} & Record<string, (...args: any[]) => void>;

export const canvasEvents = new TypedEventEmitter<CanvasEvents>();


