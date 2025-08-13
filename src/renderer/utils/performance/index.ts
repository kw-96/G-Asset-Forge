/**
 * 性能监控工具统一导出
 */

// 统一性能监控系统 (合并了基础、Figma风格和运行时监控)
export { UnifiedPerformanceMonitor, unifiedPerformanceMonitor, useUnifiedPerformanceMonitor } from './UnifiedPerformanceMonitor';
export type { 
  UnifiedPerformanceMetrics, 
  PerformanceThresholds, 
  PerformanceAlert, 
  PerformanceReport, 
  DeviceInfo 
} from './UnifiedPerformanceMonitor';

// 专用性能监控
export { RadixUIPerformanceMonitor } from '../RadixUIPerformanceMonitor';

// 启动性能监控
export { StartupPerformanceMonitor, startupPerformanceMonitor } from './StartupPerformanceMonitor';
export type { StartupMetrics, StartupPhase } from './StartupPerformanceMonitor';

// 运行时性能监控
export { RuntimePerformanceMonitor, runtimePerformanceMonitor, useRuntimePerformance } from './RuntimePerformanceMonitor';
export type { RuntimeMetrics } from './RuntimePerformanceMonitor';

// 文件操作性能优化
export { FileOperationOptimizer, fileOperationOptimizer } from './FileOperationOptimizer';
export type { FileOperationMetrics, FileOperationConfig } from './FileOperationOptimizer';

// 性能测试
export { PerformanceTestRunner, performanceTestRunner } from './PerformanceTestRunner';
export type { PerformanceTestResult, PerformanceTestSuite } from './PerformanceTestRunner';