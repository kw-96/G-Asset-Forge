/**
 * Utils 工具函数和类的统一导出
 * 
 * 组织结构：
 * - managers/    - 各种管理器类
 * - performance/ - 性能监控工具
 * - events/      - 事件系统
 * - DevTools.ts  - 开发调试工具
 */

// === 分类导出 ===
export * from './managers';
export * from './performance';
export * from './events';

// === 开发工具 ===
export * from './DevTools';

// === 向后兼容的直接导出 ===
// 专用性能监控
export { RadixUIPerformanceMonitor } from './RadixUIPerformanceMonitor';

// 性能监控系统 (从performance目录导出)
export { 
  unifiedPerformanceMonitor, 
  useUnifiedPerformanceMonitor,
  fileOperationOptimizer,
  performanceTestRunner,
  startupPerformanceMonitor,
  runtimePerformanceMonitor
} from './performance';

// 管理器
export * from './InitializationManager';
export * from './UIEnhancementManager';
export * from './FigmaBatchUpdateManager';

// 事件系统
export * from './EventEmitter';
export * from './TypedEventEmitter';