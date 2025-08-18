/**
 * UI增强集成组件统一导出
 */

export { UIIntegrationProvider, useUIIntegration, UIFeature } from './UIIntegrationProvider';
export type { 
  UIIntegrationConfig, 
  UIIntegrationState 
} from './UIIntegrationProvider';

export { UIEnhancementErrorBoundary } from './UIEnhancementErrorBoundary';

// 已移除的临时调试组件:
// - UIIntegrationTest (测试组件)
// - UIIntegrationValidator (验证组件)

export { UIEnhancementManager } from '../../../logic/utils/UIEnhancementManager';
export type { PerformanceMetrics } from '../../../logic/utils/UIEnhancementManager';