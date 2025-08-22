/**
 * 画布引擎接口定义 - 提供统一的画布引擎接口
 * @description 定义画布引擎的标准接口，供Suika引擎实现
 * @author 开发团队
 */

import type {
  CanvasConfig,
  CanvasState,
  CanvasElement
} from '../../../../interfaces/types/canvas';

// 定义画布引擎接口
export interface CanvasEngine { 
  type: CanvasEngineType;
  initialize(container: HTMLElement, config: CanvasConfig): Promise<void>;
  destroy(): void;
  getState(): CanvasState;
  setState(state: Partial<CanvasState>): void;
  addObject(object: CanvasElement): void;
  removeObject(id: string): void;
  updateObject(id: string, updates: Partial<CanvasElement>): void;
  selectObjects(ids: string[]): void;
  clearSelection(): void;
  zoom(level: number): void;
  pan(x: number, y: number): void;
  render(): void;
  exportImage(format: 'png' | 'jpg', quality?: number): string;
}

export enum CanvasEngineType {
  FABRIC = 'fabric',
  SUIKA = 'suika',
  // H5_EDITOR = 'h5-editor' // 已移除H5-editor引擎
}

// 保留双模式支持
export type CanvasMode = 'design' | 'h5';

export interface CanvasManagerEvents {
  engineSwitched: { type: CanvasEngineType };
  stateChanged: CanvasState;
  objectAdded: CanvasElement;
  objectRemoved: string;
  objectUpdated: { id: string; updates: Partial<CanvasElement> };
  selectionChanged: string[];
  zoomChanged: number;
  panChanged: { x: number; y: number };
  renderComplete: void;
}