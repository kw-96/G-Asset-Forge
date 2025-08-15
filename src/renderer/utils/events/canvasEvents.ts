import { TypedEventEmitter } from '../TypedEventEmitter';

export type CanvasEvents = {
  fitToContent: () => void;
  toggleGrid: () => void;
  toggleRuler: () => void;
  toggleGuides: () => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  addGuide: (type: 'horizontal' | 'vertical', position: number) => void;
  moveGuide: (id: string, position: number) => void;
  removeGuide: (id: string) => void;
} & Record<string, (...args: any[]) => void>;

export const canvasEvents = new TypedEventEmitter<CanvasEvents>();


