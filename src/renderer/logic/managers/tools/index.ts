/**
 * 工具管理器统一导出
 * @description 提供工具系统的统一入口
 * @author 开发团队
 */

// 导出工具类
export { BrushTool } from './BrushTool';
export { CropTool } from './CropTool';
export { SelectTool } from './SelectTool';
export { TextTool } from './TextTool';

// 导出工具管理器
export { ToolManager, toolManager } from './ToolManager';

// 导出工具配置
export * from './toolConfig';

// 导出性能监控
export { ToolPerformanceMonitor } from './PerformanceIntegration';

// 导出类型定义
export type { 
  ToolEvent, 
  ToolEventListener, 
  ToolOperationResult,
  ToolPreset
} from './ToolManager';

export type {
  BrushSettings,
  BrushStroke
} from './BrushTool';

export type {
  CropArea,
  CropSettings,
  CropHandleType,
  CropHandle,
  CropHistory
} from './CropTool';

export type {
  SelectionMode,
  TransformHandleType,
  TransformHandle,
  SelectionBox,
  TransformState,
  SelectToolSettings
} from './SelectTool';

export type {
  TextAlign,
  TextDecoration,
  FontStyle,
  FontWeight,
  TextSettings,
  TextEditState,
  TextMetrics
} from './TextTool';

export type {
  ToolPerformanceMetrics,
  ToolPerformanceStats,
  PerformanceThresholds
} from './PerformanceIntegration';

export type {
  ShapeSettings,
  ImageSettings,
  EraserSettings,
  EyedropperSettings
} from './toolConfig';