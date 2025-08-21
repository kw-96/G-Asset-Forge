/**
 * 画布业务组件导出 - 画布相关的业务组件
 * @description 导出画布工作区、工具栏、性能监控等画布相关组件
 * @author 开发团队
 */

// 画布核心组件
export { CanvasWorkspace } from './CanvasWorkspace';
export { default as FloatingToolbar } from './FloatingToolbar';
export { default as CanvasPerformanceOverlay } from './CanvasPerformanceOverlay';
export { default as CanvasMinimap } from './CanvasMinimap';
export { default as CanvasToolbar } from './CanvasToolbar';

// 画布辅助组件
export { default as CanvasInitializationChecker } from './CanvasInitializationChecker';
export { default as InfiniteCanvasGuide } from './InfiniteCanvasGuide';

// 画布通用组件
export { ZoomPanContainer } from '../common/ZoomPanContainer';
// RulerGuides和ZoomPanContext已删除，使用Suika核心系统

// 新的Suika画布组件
export { SuikaCanvasComponent } from './SuikaCanvasComponent';
// export { SuikaCanvasDemo } from './SuikaCanvasDemo';