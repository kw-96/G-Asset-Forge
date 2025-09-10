/**
 * 项目管理模块入口文件
 * 统一导出所有项目管理相关的类和类型
 */

// 导出管理器类
export { AutoSaveExportManager } from './managers/AutoSaveExportManager';
export { EditorIntegrationManager } from './managers/EditorIntegrationManager';
export { ProjectDataManager } from './managers/ProjectDataManager';
export { ProjectLifecycleManager } from './managers/ProjectLifecycleManager';
export { ProjectListManager } from './managers/ProjectListManager';

// 导出类型定义
export type {
  AutoExportConfig,
  AutoSaveConfig,
  ProjectInitConfig,
  ProjectManagementEvents,
  ProjectOperationResult,
  ProjectStateInfo,
} from './types/ProjectManagementTypes';

// 导出枚举
export { ProjectLifecycleState } from './types/ProjectManagementTypes';
