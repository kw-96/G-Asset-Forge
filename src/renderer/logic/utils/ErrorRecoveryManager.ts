import { ErrorAnalysisResult } from './ErrorAnalyzer';

export interface RecoveryStrategy {
  action: 'reload_page' | 'reset_state' | 'retry_operation' | 'fallback_ui';
  description: string;
  estimatedTime: number; // ms
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RecoveryPlan {
  recommendedStrategy: RecoveryStrategy;
  fallbackStrategy: RecoveryStrategy;
  strategies: RecoveryStrategy[];
  autoRecoveryEnabled: boolean;
}

class ErrorRecoveryManagerImpl {
  createRecoveryPlan(analysis: ErrorAnalysisResult, options?: { enableAutoRecovery?: boolean; maxRetries?: number; retryDelay?: number; }): RecoveryPlan {
    const recommended: RecoveryStrategy = analysis.category === 'react_error'
      ? { action: 'reset_state', description: '重置组件状态并重试', estimatedTime: options?.retryDelay ?? 1000, riskLevel: 'low' }
      : { action: 'retry_operation', description: '重试最近的操作', estimatedTime: options?.retryDelay ?? 1000, riskLevel: 'low' };

    const fallback: RecoveryStrategy = { action: 'reload_page', description: '重新加载应用', estimatedTime: 2000, riskLevel: 'medium' };

    return {
      recommendedStrategy: recommended,
      fallbackStrategy: fallback,
      strategies: [recommended, fallback, { action: 'fallback_ui', description: '展示后备 UI', estimatedTime: 500, riskLevel: 'low' }],
      autoRecoveryEnabled: !!options?.enableAutoRecovery,
    };
  }

  async autoRecover(plan: RecoveryPlan, _errorId: string, _options?: any): Promise<{ success: boolean; action: string; duration: number; }> {
    const start = performance.now();
    await new Promise(res => setTimeout(res, plan.recommendedStrategy.estimatedTime));
    return { success: true, action: plan.recommendedStrategy.action, duration: performance.now() - start };
  }

  async executeRecovery(strategy: RecoveryStrategy, _errorId: string, _options?: any): Promise<{ success: boolean; action: string; duration: number; }> {
    const start = performance.now();
    await new Promise(res => setTimeout(res, strategy.estimatedTime));
    return { success: true, action: strategy.action, duration: performance.now() - start };
  }
}

export const errorRecoveryManager = new ErrorRecoveryManagerImpl();


