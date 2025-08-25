/**
 * 画布业务组件导出 - 基于Suika引擎的统一画布系统
 * @description 导出基于Suika引擎的画布组件和相关工具
 * @author 开发团队
 */

// 主要画布组件 - 基于Suika引擎
export { SuikaCanvasComponent } from './SuikaCanvasComponent';
export { SuikaCanvasComponent as UnifiedCanvas } from './SuikaCanvasComponent'; // 别名

// 兼容性组件已移除，请直接使用SuikaCanvasComponent

// 画布工具栏和UI组件
// export { default as FloatingToolbar } from './FloatingToolbar';
// export { default as CanvasPerformanceOverlay } from './CanvasPerformanceOverlay';
export { default as CanvasMinimap } from './CanvasMinimap';
export { default as CanvasToolbar } from './CanvasToolbar';

// 画布辅助组件
export { default as CanvasInitializationChecker } from './CanvasInitializationChecker';
export { default as InfiniteCanvasGuide } from './InfiniteCanvasGuide';

// 缩放平移容器已废弃，现在由SuikaCanvasComponent统一处理
// export { ZoomPanContainer } from '../common/ZoomPanContainer'; // 已废弃

// 重新导出类型定义
export type { SuikaEditor } from '../../../logic/engines/suika';