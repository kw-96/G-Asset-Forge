/**
 * 项目处理器系统导出
 * 提供项目处理器相关的所有类型和实现
 */

// 基础接口和类型
export type {
  IProjectHandler,
  ProjectData,
  ProjectHandlerEvents,
} from './ProjectHandler';

// 具体处理器实现
export type { DesignProjectData } from './DesignProjectHandler';
export { DesignProjectHandler } from './DesignProjectHandler';
export type {
  H5ContainerData,
  H5ProjectData,
  IH5Service,
} from './H5ProjectHandler';
export { H5ProjectHandler } from './H5ProjectHandler';

// 工厂类
export {
  globalProjectHandlerFactory,
  ProjectHandlerFactory,
} from './ProjectHandlerFactory';
