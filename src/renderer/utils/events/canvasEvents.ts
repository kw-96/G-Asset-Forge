import { TypedEventEmitter } from '../TypedEventEmitter';

export interface CanvasEvents {
  fitToContent: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const canvasEvents = new TypedEventEmitter<CanvasEvents>();


