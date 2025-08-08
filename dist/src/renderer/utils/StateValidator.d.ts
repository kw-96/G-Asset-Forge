/**
 * 状态验证器
 * 检测和防止React组件状态更新的无限循环
 */
export interface StateUpdate {
    timestamp: number;
    statePath: string;
    prevValue: any;
    nextValue: any;
    componentName?: string | undefined;
    stackTrace?: string | undefined;
}
export interface SuspiciousPattern {
    type: 'rapid_updates' | 'circular_dependency' | 'infinite_loop';
    detectedAt: number;
    affectedPaths: string[];
    severity: 'low' | 'medium' | 'high';
    description: string;
    updateCount: number;
}
export interface StateValidationOptions {
    maxHistorySize?: number;
    rapidUpdateThreshold?: number;
    rapidUpdateWindow?: number;
    circularDependencyDepth?: number;
    enableStackTrace?: boolean;
    enableLogging?: boolean;
}
/**
 * 状态验证器类
 * 监控状态更新，检测潜在的无限循环模式
 */
export declare class StateValidator {
    private updateHistory;
    private suspiciousPatterns;
    private options;
    private warningCallbacks;
    constructor(options?: StateValidationOptions);
    /**
     * 验证状态更新
     * 在状态更新前调用此方法进行验证
     */
    validateStateUpdate(statePath: string, prevValue: any, nextValue: any, componentName?: string): boolean;
    /**
     * 检测无限循环
     * 分析更新历史，查找循环模式
     */
    detectInfiniteLoop(updateHistory?: StateUpdate[]): boolean;
    /**
     * 记录可疑的状态更新
     */
    logSuspiciousUpdates(updates: StateUpdate[]): void;
    /**
     * 获取状态更新历史
     */
    getUpdateHistory(): StateUpdate[];
    /**
     * 获取可疑模式列表
     */
    getSuspiciousPatterns(): SuspiciousPattern[];
    /**
     * 清除历史记录
     */
    clearHistory(): void;
    /**
     * 添加警告回调
     */
    onWarning(callback: (pattern: SuspiciousPattern) => void): void;
    /**
     * 移除警告回调
     */
    removeWarning(callback: (pattern: SuspiciousPattern) => void): void;
    /**
     * 生成状态验证报告
     */
    generateReport(): {
        totalUpdates: number;
        suspiciousPatterns: number;
        recentUpdates: StateUpdate[];
        recommendations: string[];
    };
    /**
     * 记录状态更新
     */
    private recordUpdate;
    /**
     * 检测可疑模式
     */
    private detectSuspiciousPatterns;
    /**
     * 检测快速连续更新
     */
    private detectRapidUpdates;
    /**
     * 检测循环依赖
     */
    private detectCircularDependencies;
    /**
     * 检测无限循环模式
     */
    private detectInfiniteLoopPattern;
    /**
     * 添加可疑模式
     */
    private addSuspiciousPattern;
    /**
     * 比较两个值是否相等
     */
    private isValueEqual;
    /**
     * 克隆值（用于历史记录）
     */
    private cloneValue;
    /**
     * 获取调用栈
     */
    private getStackTrace;
    /**
     * 日志输出
     */
    private log;
}
export declare const stateValidator: StateValidator;
//# sourceMappingURL=StateValidator.d.ts.map