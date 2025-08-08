/**
 * 开发调试工具
 * 提供开发模式下的状态更新日志、性能监控和调试面板
 */
export interface StateUpdateLog {
    id: string;
    timestamp: number;
    component: string;
    action: string;
    oldState: any;
    newState: any;
    stackTrace: string;
    renderCount: number;
}
export interface PerformanceMetrics {
    componentName: string;
    renderCount: number;
    totalRenderTime: number;
    averageRenderTime: number;
    lastRenderTime: number;
    memoryUsage: number;
    isPerformanceIssue: boolean;
}
export interface InfiniteLoopWarning {
    id: string;
    timestamp: number;
    component: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    stackTrace: string;
    renderCount: number;
    suggestions: string[];
}
export declare class DevDebugTools {
    private static instance;
    private isEnabled;
    private stateUpdateLogs;
    private performanceMetrics;
    private infiniteLoopWarnings;
    private maxLogSize;
    private renderCounters;
    static getInstance(): DevDebugTools;
    /**
     * 启用/禁用调试工具
     */
    setEnabled(enabled: boolean): void;
    /**
     * 记录状态更新
     */
    logStateUpdate(component: string, action: string, oldState: any, newState: any): void;
    /**
     * 记录性能指标
     */
    recordPerformanceMetrics(componentName: string, renderTime: number): void;
    /**
     * 创建无限循环警告
     */
    createInfiniteLoopWarning(component: string, message: string, severity: InfiniteLoopWarning['severity'], suggestions?: string[]): void;
    /**
     * 获取状态更新日志
     */
    getStateUpdateLogs(component?: string): StateUpdateLog[];
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(component?: string): PerformanceMetrics | PerformanceMetrics[] | null;
    /**
     * 获取无限循环警告
     */
    getInfiniteLoopWarnings(component?: string): InfiniteLoopWarning[];
    /**
     * 生成调试报告
     */
    generateDebugReport(): {
        summary: {
            totalStateUpdates: number;
            totalComponents: number;
            totalWarnings: number;
            criticalWarnings: number;
            performanceIssues: number;
        };
        recentStateUpdates: StateUpdateLog[];
        performanceMetrics: PerformanceMetrics[];
        recentWarnings: InfiniteLoopWarning[];
        recommendations: string[];
    };
    /**
     * 清除所有日志
     */
    clearLogs(): void;
    /**
     * 初始化调试工具
     */
    private initializeDebugTools;
    /**
     * 清理调试工具
     */
    private cleanupDebugTools;
    /**
     * 处理全局错误
     */
    private handleGlobalError;
    /**
     * 处理未捕获的Promise拒绝
     */
    private handleUnhandledRejection;
    /**
     * 设置性能监控
     */
    private setupPerformanceMonitoring;
    /**
     * 增加渲染计数
     */
    private incrementRenderCount;
    /**
     * 检测可疑的状态更新模式
     */
    private detectSuspiciousStateUpdates;
    /**
     * 检测性能问题
     */
    private detectPerformanceIssue;
    /**
     * 净化状态数据
     */
    private sanitizeState;
    /**
     * 获取堆栈跟踪
     */
    private getStackTrace;
    /**
     * 获取内存使用情况
     */
    private getMemoryUsage;
}
export declare const devDebugTools: DevDebugTools;
//# sourceMappingURL=DevDebugTools.d.ts.map