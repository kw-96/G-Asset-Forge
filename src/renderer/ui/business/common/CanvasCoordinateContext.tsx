/**
 * 统一画布坐标系统上下文
 * - 管理缩放、平移状态
 * - 提供世界坐标 ↔ 屏幕坐标转换
 * - 管理网格系统、标尺系统、辅助线系统
 * - 统一所有组件的坐标计算逻辑
 */

import { createContext, useContext } from 'react';

// 坐标系统状态
export interface CanvasCoordinateState {
  // 基础变换
  zoom: number;  // 缩放倍数 (1 = 100%, 0.1 = 10%, 32 = 3200%)
  pan: { x: number; y: number };  // 平移偏移
  
  // 网格系统
  gridSize: number;  // 基础网格大小 (1px)
  showGrid: boolean;  // 是否显示网格
  snapToGridEnabled: boolean;  // 是否启用网格吸附
  
  // 标尺系统
  showRuler: boolean;  // 是否显示标尺
  
  // 辅助线系统
  showGuides: boolean;  // 是否显示辅助线
  guides: Array<{
    id: string;
    type: 'vertical' | 'horizontal';
    position: number;  // 世界坐标位置
    active?: boolean;   // 是否激活
  }>;
  snapToGuidesEnabled: boolean;  // 是否启用辅助线吸附
  
  // 拖拽模式管理
  dragMode: 'none' | 'canvas-pan' | 'object-drag' | 'guide-drag';
  
  // 视口信息
  viewport: {
    width: number;
    height: number;
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    };
  };
}

// 坐标系统操作
export interface CanvasCoordinateActions {
  // 基础变换操作
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  
  // 网格操作
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  
  // 标尺操作
  setShowRuler: (show: boolean) => void;
  
  // 辅助线操作
  setShowGuides: (show: boolean) => void;
  addGuide: (guide: { id: string; type: 'vertical' | 'horizontal'; position: number }) => void;
  removeGuide: (id: string) => void;
  updateGuidePosition: (id: string, position: number) => void;
  setSnapToGuides: (snap: boolean) => void;
  
  // 拖拽模式控制
  setDragMode: (mode: 'none' | 'canvas-pan' | 'object-drag' | 'guide-drag') => void;
  canStartDrag: (mode: 'canvas-pan' | 'object-drag' | 'guide-drag') => boolean;
  
  // 视口操作
  setViewportSize: (width: number, height: number) => void;
}

// 坐标转换方法
export interface CanvasCoordinateTransforms {
  // 世界坐标 ↔ 屏幕坐标转换
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  
  // 网格相关计算
  getGridOffset: () => { x: number; y: number };
  snapToGrid: (x: number, y: number) => { x: number; y: number };
  getGridSize: () => { base: number; screen: number };
  shouldShowGrid: () => boolean;
  
  // 标尺相关计算
  getRulerTicks: (isHorizontal: boolean, containerSize: number) => Array<{
    position: number;
    worldValue: number;
    type: 'major' | 'minor' | 'micro';
    height: number;
    showLabel: boolean;
  }>;
  
  // 辅助线相关计算
  getGuidePositions: (type: 'vertical' | 'horizontal') => number[];
  snapToGuide: (x: number, y: number, type: 'vertical' | 'horizontal') => { x: number; y: number };
  
  // 视口相关计算
  getVisibleBounds: () => { minX: number; maxX: number; minY: number; maxY: number };
  isInViewport: (worldX: number, worldY: number) => boolean;
}

// 完整的坐标系统上下文值
export interface CanvasCoordinateContextValue extends 
  CanvasCoordinateState, 
  CanvasCoordinateActions, 
  CanvasCoordinateTransforms {}

// 创建上下文
export const CanvasCoordinateContext = createContext<CanvasCoordinateContextValue | null>(null);

// 默认值 - 用于测试和文档
// const defaultState: CanvasCoordinateState = {
//   zoom: 1,
//   pan: { x: 0, y: 0 },
//   gridSize: 1,
//   showGrid: true,
//   snapToGridEnabled: false,
//   showRuler: true,
//   viewport: {
//     width: 0,
//     height: 0,
//     bounds: {
//       minX: -10000,
//       maxX: 10000,
//       minY: -10000,
//       maxY: 10000
//     }
//   }
// };

// 主Hook
export const useCanvasCoordinate = (): CanvasCoordinateContextValue => {
  const context = useContext(CanvasCoordinateContext);
  if (!context) {
    throw new Error('useCanvasCoordinate must be used within a CanvasCoordinateProvider');
  }
  return context;
};

// 便捷Hooks
export const useCanvasViewport = () => {
  const context = useCanvasCoordinate();
  return {
    zoom: context.zoom,
    pan: context.pan,
    viewport: context.viewport,
    setZoom: context.setZoom,
    setPan: context.setPan,
    resetView: context.resetView,
    zoomIn: context.zoomIn,
    zoomOut: context.zoomOut,
    zoomToFit: context.zoomToFit,
    worldToScreen: context.worldToScreen,
    screenToWorld: context.screenToWorld,
    getVisibleBounds: context.getVisibleBounds,
    isInViewport: context.isInViewport
  };
};

export const useCanvasGrid = () => {
  const context = useCanvasCoordinate();
  return {
    gridSize: context.gridSize,
    showGrid: context.showGrid,
    snapToGridEnabled: context.snapToGridEnabled,
    setGridSize: context.setGridSize,
    setShowGrid: context.setShowGrid,
    setSnapToGrid: context.setSnapToGrid,
    getGridOffset: context.getGridOffset,
    snapToGrid: context.snapToGrid,
    getGridSize: context.getGridSize,
    shouldShowGrid: context.shouldShowGrid,
    worldToScreen: context.worldToScreen
  };
};

export const useCanvasRuler = () => {
  const context = useCanvasCoordinate();
  return {
    showRuler: context.showRuler,
    setShowRuler: context.setShowRuler,
    getRulerTicks: context.getRulerTicks
  };
};

export const useCanvasGuides = () => {
  const context = useCanvasCoordinate();
  return {
    showGuides: context.showGuides,
    guides: context.guides,
    snapToGuidesEnabled: context.snapToGuidesEnabled,
    setShowGuides: context.setShowGuides,
    addGuide: context.addGuide,
    removeGuide: context.removeGuide,
    updateGuidePosition: context.updateGuidePosition,
    setSnapToGuides: context.setSnapToGuides,
    getGuidePositions: context.getGuidePositions,
    snapToGuide: context.snapToGuide
  };
};

export const useCanvasGuide = () => {
  const context = useCanvasCoordinate();
  return {
    // 向后兼容的旧接口
    zoom: context.zoom,
    pan: context.pan,
    worldToScreen: context.worldToScreen,
    screenToWorld: context.screenToWorld,
    snapToGrid: context.snapToGrid,
    
    // 新的辅助线功能
    showGuides: context.showGuides,
    guides: context.guides,
    snapToGuidesEnabled: context.snapToGuidesEnabled,
    setShowGuides: context.setShowGuides,
    addGuide: context.addGuide,
    removeGuide: context.removeGuide,
    updateGuidePosition: context.updateGuidePosition,
    setSnapToGuides: context.setSnapToGuides,
    getGuidePositions: context.getGuidePositions,
    snapToGuide: context.snapToGuide,
    
    // 拖拽模式控制
    dragMode: context.dragMode,
    setDragMode: context.setDragMode,
    canStartDrag: context.canStartDrag
  };
};
