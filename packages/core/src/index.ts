export * from './asset';
export * from './commands';
export * from './editor';
export * from './graphics';
export * from './guide_lines';
export * from './paint';
export * from './project';
// 显式导出service模块，避免ProjectData冲突
// 导出所有service模块内容，但排除ProjectData以避免冲突
export * from './service/advanced_export_tool';
export * from './service/align_and_record';
export * from './service/arrange_and_record';
export * from './service/auto_export_service';
export * from './service/batch_export_manager';
export * from './service/enhanced_export_service';
export * from './service/export_preview_manager';
export * from './service/export_quality_optimizer';
export * from './service/export_service';
export * from './service/file_read_service';
export * from './service/file_system_access_service';
export * from './service/flip_and_record';
export * from './service/group_and_record';
export * from './service/import_service';
export * from './service/mutate_graphs_and_record';
export * from './service/page_service';
export * from './service/project_data_service';
export * from './service/project_recovery_service';
export type { ValidationError as ProjectValidationError } from './service/ProjectDataValidator';
export {
  type DataSchema,
  ProjectDataValidator,
  type RepairOptions,
  type ValidationResult,
  type ValidationWarning,
} from './service/ProjectDataValidator';
export * from './service/ProjectTypeManager';
export * from './service/remove_service';
export * from './service/ungroup_and_record';
// 显式导出project-handlers，避免ProjectData冲突
export {
  type ContentBlockData,
  type DesignProjectData,
  DesignProjectHandler,
  globalProjectHandlerFactory,
  type H5ContainerData,
  type H5ProjectData,
  H5ProjectHandler,
  type IH5Service,
  type IProjectHandler,
  ProjectHandlerFactory,
} from './service/project-handlers';
export type { SettingValue } from './setting';
export * from './template';
export * from './transaction';
export * from './type';

// H5 编辑功能
export * from './graphics/h5/content_block';
export * from './graphics/h5/h5_container';
export * from './service/h5_service';

// 性能优化和稳定性功能
export * from './error_handler';
export * from './Img_manager';
export * from './offline_manager';
export * from './perf_monitor';
export * from './performance_service';
export * from './utils/raf_throttle';
