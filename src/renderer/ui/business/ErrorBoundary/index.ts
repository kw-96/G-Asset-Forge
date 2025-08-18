/**
 * 错误边界组件统一导出
 */

export { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
export type {
  EnhancedErrorBoundaryProps,
  EnhancedErrorInfo,
  ErrorRecoveryStrategy,
  ErrorType,
  ErrorSeverity,
} from './EnhancedErrorBoundary';

// 导出默认的增强错误边界
export { EnhancedErrorBoundary as default } from './EnhancedErrorBoundary';