/**
 * 缩放平移上下文 - 兼容性接口
 * - 为了保持向后兼容性，提供与原有ZoomPanContext相同的接口
 * - 内部使用统一坐标系统
 * - 建议新代码直接使用CanvasCoordinateContext
 */

import React, { useContext } from 'react';
import { CanvasCoordinateContext, CanvasCoordinateContextValue } from './CanvasCoordinateContext';

// 兼容性接口 - 保持与原有代码的兼容性
export interface ZoomPanState {
  zoom: number;  // 缩放倍数 (1 = 100%, 0.1 = 10%, 32 = 3200%)
  pan: { x: number; y: number };
}

export interface ZoomPanActions {
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
}

export interface ZoomPanContextValue extends ZoomPanState, ZoomPanActions {}

// 兼容性上下文 - 使用统一坐标系统
export const ZoomPanContext = React.createContext<CanvasCoordinateContextValue | null>(null);

// 兼容性Hook - 使用统一坐标系统
export const useZoomPan = (): CanvasCoordinateContextValue => {
  const context = useContext(CanvasCoordinateContext);
  if (!context) {
    throw new Error('useZoomPan must be used within a CanvasCoordinateProvider');
  }
  return context;
};

// 导出统一坐标系统的类型，方便迁移
export type { CanvasCoordinateContextValue } from './CanvasCoordinateContext';


