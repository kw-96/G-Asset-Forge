/**
 * 主进程服务层统一导出
 * @description 提供所有主进程服务的统一入口
 * @author 开发团队
 */

// 导出IPC服务
export { IPCService } from './IPCService';
export type { 
  IPCHandler, 
  IPCInvokeHandler, 
  IPCRoute, 
  IPCServiceConfig 
} from './IPCService';

// 导出日志服务
export { 
  LoggingService, 
  loggingService, 
  logger,
  LogLevel,
  LOG_LEVEL_NAMES 
} from './LoggingService';
export type { 
  LogEntry, 
  LoggingServiceConfig 
} from './LoggingService';

// 导出文件服务
export { FileService, fileService } from './FileService';
export type { 
  FileOperationResult, 
  FileInfo, 
  FileWatchConfig, 
  FileServiceConfig 
} from './FileService';