/**
 * Radix UI组件性能监控工具
 * 监控Radix UI组件的渲染性能，检测异常渲染和无限循环
 */
export interface ComponentPerformanceMetrics {
    componentName: string;
    renderCount: number;
    averageRenderTime: number;
    lastRenderTime: number;
    totalRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    suspiciousRenderCount: number;
    isPerformanceIssue: boolean;
}
export interface PerformanceAlert {
    type: 'excessive_renders' | 'slow_render' | 'memory_leak' | 'infinite_loop';
    componentName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metrics: ComponentPerformanceMetrics;
    timestamp: number;
    suggestions: string[];
}
export declare class RadixUIPerformanceMonitor {
    private static instance;
    private componentMetrics;
    private performanceAlerts;
    private monitoringEnabled;
    private alertThresholds;
    static getInstance(): RadixUIPerformanceMonitor;
    /**
     * 开始监控组件性能
     */
    startMonitoring(componentName: string): () => void;
    /**
     * 记录组件渲染
     */
    private recordRender;
    /**
     * 检测是否为可疑渲染
     */
    private isSuspiciousRender;
    /**
     * 检测性能问题
     */
    private detectPerformanceIssues;
    /**
     * 创建性能警报
     */
    private createAlert;
    /**
     * 尝试自动修复
     */
    private attemptAutoFix;
    /**
     * 判断是否有性能问题
     */
    private hasPerformanceIssue;
    /**
     * 获取组件性能指标
     */
    getComponentMetrics(componentName?: string): ComponentPerformanceMetrics | ComponentPerformanceMetrics[] | null;
    /**
     * 获取性能警报
     */
    getPerformanceAlerts(componentName?: string): PerformanceAlert[];
    /**
     * 重置组件指标
     */
    resetComponentMetrics(componentName?: string): void;
    /**
     * 清除性能警报
     */
    clearPerformanceAlerts(componentName?: string): void;
    /**
     * 启用/禁用监控
     */
    setMonitoringEnabled(enabled: boolean): void;
    /**
     * 获取监控状态
     */
    isMonitoringEnabled(): boolean;
    /**
     * 获取性能统计
     */
    getPerformanceStats(): {
        totalComponents: number;
        totalRenders: number;
        averageRenderTime: number;
        problemComponents: number;
        totalAlerts: number;
        criticalAlerts: number;
    };
    /**
     * 生成性能报告
     */
    generatePerformanceReport(): {
        summary: ReturnType<RadixUIPerformanceMonitor['getPerformanceStats']>;
        componentMetrics: ComponentPerformanceMetrics[];
        recentAlerts: PerformanceAlert[];
        recommendations: string[];
    };
}
export declare const radixUIPerformanceMonitor: RadixUIPerformanceMonitor;
//# sourceMappingURL=RadixUIPerformanceMonitor.d.ts.map