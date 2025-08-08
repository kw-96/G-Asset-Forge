/**
 * 无限循环检测器
 * 检测和预防React组件的无限循环问题
 */
export interface LoopDetectionConfig {
    maxRenderCount: number;
    timeWindow: number;
    warningThreshold: number;
    criticalThreshold: number;
    autoFix: boolean;
}
export interface LoopDetectionResult {
    isLoop: boolean;
    severity: 'none' | 'warning' | 'critical';
    renderCount: number;
    timeSpan: number;
    suggestions: string[];
}
export declare class InfiniteLoopDetector {
    private static instance;
    private componentRenderTimes;
    private componentWarnings;
    private isEnabled;
    private defaultConfig;
    static getInstance(): InfiniteLoopDetector;
    /**
     * 启用/禁用检测器
     */
    setEnabled(enabled: boolean): void;
    /**
     * 记录组件渲染
     */
    recordRender(componentName: string, config?: Partial<LoopDetectionConfig>): LoopDetectionResult;
    /**
     * 分析渲染模式
     */
    private analyzeRenderPattern;
    /**
     * 检测规律性模式
     */
    private detectRegularPattern;
    /**
     * 处理检测结果
     */
    private handleDetectionResult;
    /**
     * 尝试自动修复
     */
    private attemptAutoFix;
    /**
     * 获取组件的检测统计
     */
    getComponentStats(componentName: string): {
        renderCount: number;
        warningCount: number;
        lastRenderTime: number;
        averageInterval: number;
    };
    /**
     * 获取所有组件的统计
     */
    getAllStats(): Map<string, ReturnType<typeof this.getComponentStats>>;
    /**
     * 清除组件的检测记录
     */
    clearComponentStats(componentName?: string): void;
    /**
     * 生成检测报告
     */
    generateReport(): {
        totalComponents: number;
        totalWarnings: number;
        criticalComponents: string[];
        warningComponents: string[];
        recommendations: string[];
    };
}
export declare const infiniteLoopDetector: InfiniteLoopDetector;
//# sourceMappingURL=InfiniteLoopDetector.d.ts.map