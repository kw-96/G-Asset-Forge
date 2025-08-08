/**
 * 错误恢复管理器
 * 提供多种错误恢复策略和自动恢复机制
 */
import { reactLoopFixToolkit } from './ReactLoopFix';
import { ErrorPattern, ErrorCategory } from './ErrorAnalyzer';
export var RecoveryAction;
(function (RecoveryAction) {
    RecoveryAction["RELOAD_PAGE"] = "reload_page";
    RecoveryAction["RESET_STATE"] = "reset_state";
    RecoveryAction["RETRY_OPERATION"] = "retry_operation";
    RecoveryAction["FALLBACK_UI"] = "fallback_ui";
    RecoveryAction["CLEAR_CACHE"] = "clear_cache";
    RecoveryAction["RESTART_COMPONENT"] = "restart_component";
    RecoveryAction["SAFE_MODE"] = "safe_mode";
})(RecoveryAction || (RecoveryAction = {}));
export class ErrorRecoveryManager {
    constructor() {
        this.recoveryHistory = new Map();
        this.activeRecoveries = new Set();
        this.retryCounters = new Map();
    }
    static getInstance() {
        if (!ErrorRecoveryManager.instance) {
            ErrorRecoveryManager.instance = new ErrorRecoveryManager();
        }
        return ErrorRecoveryManager.instance;
    }
    /**
     * 创建恢复计划
     */
    createRecoveryPlan(errorAnalysis, options = {}) {
        const strategies = this.generateRecoveryStrategies(errorAnalysis);
        const recommendedStrategy = this.selectRecommendedStrategy(strategies, errorAnalysis);
        const fallbackStrategy = this.selectFallbackStrategy(strategies);
        const plan = {
            strategies,
            recommendedStrategy,
            fallbackStrategy,
            autoRecoveryEnabled: options.enableAutoRecovery ?? this.shouldEnableAutoRecovery(errorAnalysis),
            maxRetries: options.maxRetries ?? this.getDefaultMaxRetries(errorAnalysis),
        };
        reactLoopFixToolkit.debugLogger.info('recovery-manager', '创建恢复计划', {
            errorPattern: errorAnalysis.pattern,
            strategiesCount: strategies.length,
            recommendedAction: recommendedStrategy.action,
            autoRecovery: plan.autoRecoveryEnabled,
        }, 'ErrorRecoveryManager');
        return plan;
    }
    /**
     * 执行恢复策略
     */
    async executeRecovery(strategy, errorId, options = {}) {
        const startTime = Date.now();
        // 防止重复恢复
        if (this.activeRecoveries.has(errorId)) {
            throw new Error(`恢复操作已在进行中: ${errorId}`);
        }
        this.activeRecoveries.add(errorId);
        try {
            reactLoopFixToolkit.debugLogger.info('recovery-manager', `开始执行恢复策略: ${strategy.action}`, { errorId, strategy }, 'ErrorRecoveryManager');
            await this.performRecoveryAction(strategy, options);
            const duration = Date.now() - startTime;
            const recoveryResult = {
                success: true,
                action: strategy.action,
                duration,
                ...(strategy.sideEffects && { sideEffects: strategy.sideEffects }),
            };
            // 记录恢复历史
            this.recordRecoveryResult(errorId, recoveryResult);
            reactLoopFixToolkit.debugLogger.info('recovery-manager', `恢复策略执行成功: ${strategy.action}`, { errorId, duration, action: strategy.action }, 'ErrorRecoveryManager');
            return recoveryResult;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const recoveryResult = {
                success: false,
                action: strategy.action,
                duration,
                error: error instanceof Error ? error : new Error(String(error)),
            };
            this.recordRecoveryResult(errorId, recoveryResult);
            reactLoopFixToolkit.debugLogger.error('recovery-manager', `恢复策略执行失败: ${strategy.action}`, { errorId, duration, error: recoveryResult.error?.message }, 'ErrorRecoveryManager');
            throw error;
        }
        finally {
            this.activeRecoveries.delete(errorId);
        }
    }
    /**
     * 自动恢复
     */
    async autoRecover(plan, errorId, options = {}) {
        if (!plan.autoRecoveryEnabled) {
            throw new Error('自动恢复未启用');
        }
        const retryCount = this.retryCounters.get(errorId) || 0;
        if (retryCount >= plan.maxRetries) {
            throw new Error(`已达到最大重试次数: ${plan.maxRetries}`);
        }
        // 增加重试计数
        this.retryCounters.set(errorId, retryCount + 1);
        try {
            // 首先尝试推荐策略
            return await this.executeRecovery(plan.recommendedStrategy, errorId, options);
        }
        catch (error) {
            reactLoopFixToolkit.debugLogger.warn('recovery-manager', '推荐策略失败，尝试备用策略', { errorId, retryCount }, 'ErrorRecoveryManager');
            // 如果推荐策略失败，尝试备用策略
            return await this.executeRecovery(plan.fallbackStrategy, errorId, options);
        }
    }
    /**
     * 生成恢复策略
     */
    generateRecoveryStrategies(errorAnalysis) {
        const strategies = [];
        // 基于错误模式生成策略
        if (errorAnalysis.pattern) {
            strategies.push(...this.getPatternSpecificStrategies(errorAnalysis.pattern));
        }
        // 基于错误类别生成策略
        strategies.push(...this.getCategorySpecificStrategies(errorAnalysis.category));
        // 通用策略
        strategies.push(...this.getGenericStrategies());
        // 按优先级排序
        return strategies.sort((a, b) => b.priority - a.priority);
    }
    /**
     * 获取模式特定的策略
     */
    getPatternSpecificStrategies(pattern) {
        switch (pattern) {
            case ErrorPattern.INFINITE_LOOP:
                return [
                    {
                        action: RecoveryAction.RESET_STATE,
                        priority: 9,
                        description: '重置应用状态，清除可能导致无限循环的状态',
                        estimatedTime: 1000,
                        riskLevel: 'medium',
                        sideEffects: ['用户数据可能丢失', '需要重新登录'],
                    },
                    {
                        action: RecoveryAction.RESTART_COMPONENT,
                        priority: 7,
                        description: '重启出问题的组件',
                        estimatedTime: 500,
                        riskLevel: 'low',
                    },
                ];
            case ErrorPattern.MEMORY_LEAK:
                return [
                    {
                        action: RecoveryAction.CLEAR_CACHE,
                        priority: 8,
                        description: '清理缓存和内存泄漏',
                        estimatedTime: 2000,
                        riskLevel: 'low',
                    },
                    {
                        action: RecoveryAction.RELOAD_PAGE,
                        priority: 6,
                        description: '重新加载页面释放内存',
                        estimatedTime: 3000,
                        riskLevel: 'medium',
                        sideEffects: ['页面状态丢失'],
                    },
                ];
            case ErrorPattern.RENDER_THRASHING:
                return [
                    {
                        action: RecoveryAction.SAFE_MODE,
                        priority: 8,
                        description: '进入安全模式，禁用可能导致渲染问题的功能',
                        estimatedTime: 1000,
                        riskLevel: 'low',
                    },
                    {
                        action: RecoveryAction.RESTART_COMPONENT,
                        priority: 7,
                        description: '重启渲染异常的组件',
                        estimatedTime: 500,
                        riskLevel: 'low',
                    },
                ];
            case ErrorPattern.ASYNC_RACE_CONDITION:
                return [
                    {
                        action: RecoveryAction.RETRY_OPERATION,
                        priority: 8,
                        description: '重试异步操作',
                        estimatedTime: 1000,
                        riskLevel: 'low',
                    },
                    {
                        action: RecoveryAction.RESET_STATE,
                        priority: 6,
                        description: '重置相关状态',
                        estimatedTime: 500,
                        riskLevel: 'medium',
                    },
                ];
            default:
                return [];
        }
    }
    /**
     * 获取类别特定的策略
     */
    getCategorySpecificStrategies(category) {
        switch (category) {
            case ErrorCategory.REACT_ERROR:
                return [
                    {
                        action: RecoveryAction.RESTART_COMPONENT,
                        priority: 7,
                        description: '重启React组件',
                        estimatedTime: 500,
                        riskLevel: 'low',
                    },
                ];
            case ErrorCategory.NETWORK_ERROR:
                return [
                    {
                        action: RecoveryAction.RETRY_OPERATION,
                        priority: 8,
                        description: '重试网络请求',
                        estimatedTime: 2000,
                        riskLevel: 'low',
                    },
                ];
            case ErrorCategory.PERFORMANCE_ERROR:
                return [
                    {
                        action: RecoveryAction.SAFE_MODE,
                        priority: 7,
                        description: '进入性能安全模式',
                        estimatedTime: 1000,
                        riskLevel: 'low',
                    },
                ];
            default:
                return [];
        }
    }
    /**
     * 获取通用策略
     */
    getGenericStrategies() {
        return [
            {
                action: RecoveryAction.FALLBACK_UI,
                priority: 5,
                description: '显示备用UI',
                estimatedTime: 100,
                riskLevel: 'low',
            },
            {
                action: RecoveryAction.RELOAD_PAGE,
                priority: 3,
                description: '重新加载页面',
                estimatedTime: 3000,
                riskLevel: 'high',
                sideEffects: ['所有页面状态丢失', '用户需要重新操作'],
            },
        ];
    }
    /**
     * 选择推荐策略
     */
    selectRecommendedStrategy(strategies, _errorAnalysis) {
        // 优先选择高优先级、低风险的策略
        const lowRiskStrategies = strategies.filter(s => s.riskLevel === 'low');
        if (lowRiskStrategies.length > 0) {
            return lowRiskStrategies[0];
        }
        const mediumRiskStrategies = strategies.filter(s => s.riskLevel === 'medium');
        if (mediumRiskStrategies.length > 0) {
            return mediumRiskStrategies[0];
        }
        return strategies[0];
    }
    /**
     * 选择备用策略
     */
    selectFallbackStrategy(strategies) {
        // 备用策略通常是重新加载页面
        const reloadStrategy = strategies.find(s => s.action === RecoveryAction.RELOAD_PAGE);
        if (reloadStrategy) {
            return reloadStrategy;
        }
        // 如果没有重新加载策略，选择最后一个策略
        return strategies[strategies.length - 1];
    }
    /**
     * 执行恢复操作
     */
    async performRecoveryAction(strategy, options) {
        switch (strategy.action) {
            case RecoveryAction.RELOAD_PAGE:
                window.location.reload();
                break;
            case RecoveryAction.RESET_STATE:
                reactLoopFixToolkit.resetAll();
                // 清除localStorage中的状态
                if (!options.preserveUserData) {
                    localStorage.clear();
                }
                break;
            case RecoveryAction.RETRY_OPERATION:
                // 这里需要具体的重试逻辑，通常由调用方提供
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case RecoveryAction.CLEAR_CACHE:
                // 清理各种缓存
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                }
                // 清理内存
                if (global.gc) {
                    global.gc();
                }
                break;
            case RecoveryAction.RESTART_COMPONENT:
                // 这个需要在组件级别实现
                // 这里只是标记需要重启
                break;
            case RecoveryAction.SAFE_MODE:
                // 进入安全模式，禁用某些功能
                localStorage.setItem('safe-mode', 'true');
                break;
            case RecoveryAction.FALLBACK_UI:
                // 显示备用UI，这个通常在组件级别处理
                break;
            default:
                throw new Error(`未知的恢复操作: ${strategy.action}`);
        }
    }
    /**
     * 记录恢复结果
     */
    recordRecoveryResult(errorId, result) {
        if (!this.recoveryHistory.has(errorId)) {
            this.recoveryHistory.set(errorId, []);
        }
        this.recoveryHistory.get(errorId).push(result);
    }
    /**
     * 判断是否应该启用自动恢复
     */
    shouldEnableAutoRecovery(errorAnalysis) {
        // 高置信度且可恢复的错误启用自动恢复
        return errorAnalysis.confidence > 0.7 && errorAnalysis.isRecoverable;
    }
    /**
     * 获取默认最大重试次数
     */
    getDefaultMaxRetries(errorAnalysis) {
        switch (errorAnalysis.recoveryComplexity) {
            case 'low': return 3;
            case 'medium': return 2;
            case 'high': return 1;
            default: return 1;
        }
    }
    /**
     * 获取恢复历史
     */
    getRecoveryHistory(errorId) {
        if (errorId) {
            return this.recoveryHistory.get(errorId) || [];
        }
        return this.recoveryHistory;
    }
    /**
     * 清除恢复历史
     */
    clearRecoveryHistory(errorId) {
        if (errorId) {
            this.recoveryHistory.delete(errorId);
            this.retryCounters.delete(errorId);
        }
        else {
            this.recoveryHistory.clear();
            this.retryCounters.clear();
        }
    }
    /**
     * 获取恢复统计
     */
    getRecoveryStats() {
        let totalRecoveries = 0;
        let successfulRecoveries = 0;
        let totalDuration = 0;
        const actionCounts = new Map();
        for (const results of this.recoveryHistory.values()) {
            for (const result of results) {
                totalRecoveries++;
                totalDuration += result.duration;
                if (result.success) {
                    successfulRecoveries++;
                }
                actionCounts.set(result.action, (actionCounts.get(result.action) || 0) + 1);
            }
        }
        const mostCommonAction = Array.from(actionCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || RecoveryAction.RELOAD_PAGE;
        return {
            totalRecoveries,
            successRate: totalRecoveries > 0 ? successfulRecoveries / totalRecoveries : 0,
            averageDuration: totalRecoveries > 0 ? totalDuration / totalRecoveries : 0,
            mostCommonAction,
        };
    }
}
ErrorRecoveryManager.instance = null;
// 导出单例实例
export const errorRecoveryManager = ErrorRecoveryManager.getInstance();
//# sourceMappingURL=ErrorRecoveryManager.js.map