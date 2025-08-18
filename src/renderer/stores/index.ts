/**
 * 状态管理统一导出 - Zustand状态存储集合
 * @description 导出所有状态管理Hook和相关类型定义
 * @author 开发团队
 */

// 应用状态管理
export { useAppStore } from './appStore';
export type { AppState } from './appStore';

// 画布状态管理
export { useCanvasStore } from './canvasStore';
export type { CanvasState } from './canvasStore';

// 工具状态管理
export { useToolStore, ToolType } from './toolStore';
export type { 
  ToolState,
  ShapeType,
  TextToolProperties,
  BrushToolProperties,
  ShapeToolProperties,
  ImageToolProperties,
  CropToolProperties,
  ToolProperties,
  ToolConfig,
  ToolHistory
} from './toolStore';

// 素材状态管理
export { useAssetStore } from './assetStore';
export type {
  AssetState,
  AssetType,
  AssetFormat,
  Asset,
  AssetCategory,
  AssetSubcategory,
  AssetFilter,
  AssetTag,
  AssetMetadata,
  SortOption,
  UploadProgress
} from './assetStore';

// 项目状态管理
export { useProjectStore } from './projectStore';
export type {
  ProjectState,
  Project,
  ProjectMetadata,
  ProjectSettings,
  ProjectStatus,
  ProjectType,
  ProjectHistory,
  RecentProject,
  ProjectTemplate,
  ExportFormat
} from './projectStore';