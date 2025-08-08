/**
 * 错误恢复管理器
 * 提供多种错误恢复策略和自动恢复机制
 */
import { ErrorAnalysisResult } from './ErrorAnalyzer';
export declare enum RecoveryAction {
    RELOAD_PAGE = "reload_page",
    RESET_STATE = "reset_state",
    RETRY_OPERATION = "retry_operation",
    FALLBACK_UI = "fallback_ui",
    CLEAR_CACHE = "clear_cache",
    RESTART_COMPONENT = "restart_component",
    SAFE_MODE = "safe_mode"
}
export interface RecoveryStrategy {
    action: RecoveryAction;
    priority: number;
    description: string;
    estimatedTime: number;
    riskLevel: 'low' | 'medium' | 'high';
    prerequisites?: string[];
    sideEffects?: string[];
}
export interface RecoveryPlan {
    strategies: RecoveryStrategy[];
    recommendedStrategy: RecoveryStrategy;
    fallbackStrategy: RecoveryStrategy;
    autoRecoveryEnabled: boolean;
    maxRetries: number;
}
export interface RecoveryResult {
    success: boolean;
    action: RecoveryAction;
    duration: number;
    error?: Error;
    sideEffects?: string[];
}
export interface RecoveryOptions {
    enableAutoRecovery?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    enableFallback?: boolean;
    preserveUserData?: boolean;
    notifyUser?: boolean;
}
export declare class ErrorRecoveryManager {
    private static instance;
    private recoveryHistory;
    private activeRecoveries;
    private retryCounters;
    static getInstance(): ErrorRecoveryManager;
    /**
     * 创建恢复计划
     */
    createRecoveryPlan(errorAnalysis: ErrorAnalysisResult, options?: RecoveryOptions): RecoveryPlan;
    /**
     * 执行恢复策略
     */
    executeRecovery(strategy: RecoveryStrategy, errorId: string, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * 自动恢复
     */
    autoRecover(plan: RecoveryPlan, errorId: string, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * 生成恢复策略
     */
    private generateRecoveryStrategies;
    /**
     * 获取模式特定的策略
     */
    private getPatternSpecificStrategies;
    /**
     * 获取类别特定的策略
     */
    private getCategorySpecificStrategies;
    /**
     * 获取通用策略
     */
    private getGenericStrategies;
    /**
     * 选择推荐策略
     */
    private selectRecommendedStrategy;
    /**
     * 选择备用策略
     */
    private selectFallbackStrategy;
    /**
     * 执行恢复操作
     */
    private performRecoveryAction;
    /**
     * 记录恢复结果
     */
    private recordRecoveryResult;
    /**
     * 判断是否应该启用自动恢复
     */
    private shouldEnableAutoRecovery;
    /**
     * 获取默认最大重试次数
     */
    private getDefaultMaxRetries;
    /**
     * 获取恢复历史
     */
    getRecoveryHistory(errorId?: string): Map<string, RecoveryResult[]> | RecoveryResult[];
    /**
     * 清除恢复历史
     */
    clearRecoveryHistory(errorId?: string): void;
    /**
     * 获取恢复统计
     */
    getRecoveryStats(): {
        totalRecoveries: number;
        successRate: number;
        averageDuration: number;
        mostCommonAction: RecoveryAction;
    };
}
export declare const errorRecoveryManager: ErrorRecoveryManager;
//# sourceMappingURL=ErrorRecoveryManager.d.ts.map