/**
 * 统一坐标系统导出文件
 * - 提供所有坐标系统相关的组件和hooks
 * - 方便其他组件统一导入使用
 * - 包含兼容性接口，支持原有代码平滑迁移
 */

// 核心上下文和Provider
export { CanvasCoordinateContext, useCanvasCoordinate } from './CanvasCoordinateContext';
export { CanvasCoordinateProvider } from './CanvasCoordinateProvider';

// 便捷Hooks
export { useCanvasViewport, useCanvasGrid, useCanvasRuler, useCanvasGuide } from './CanvasCoordinateContext';

// 统一组件
export { CanvasContainer } from './CanvasContainer';
export { CanvasGrid } from './CanvasGrid';
export { CanvasRulers } from './CanvasRuler';

// 兼容性接口 - 支持原有代码平滑迁移
export { ZoomPanContainer } from './ZoomPanContainer';
export { useZoomPan, ZoomPanContext } from './ZoomPanContext';
export { RulerGuides } from './RulerGuides';

// 类型导出
export type { 
  CanvasCoordinateContextValue,
  CanvasCoordinateState,
  CanvasCoordinateActions,
  CanvasCoordinateTransforms
} from './CanvasCoordinateContext';

export type {
  ZoomPanState,
  ZoomPanActions,
  ZoomPanContextValue
} from './ZoomPanContext';
