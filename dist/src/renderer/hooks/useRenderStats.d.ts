/**
 * 渲染统计Hook
 * 统计组件渲染次数和性能指标
 */
export interface RenderStatsOptions {
    componentName: string;
    enabled?: boolean;
    logThreshold?: number;
    performanceThreshold?: number;
}
export interface RenderStats {
    renderCount: number;
    totalRenderTime: number;
    averageRenderTime: number;
    lastRenderTime: number;
    isPerformanceIssue: boolean;
}
export declare const useRenderStats: (options: RenderStatsOptions) => {
    renderCount: number;
    getStats: () => RenderStats;
    resetStats: () => void;
    startRenderMeasurement: () => void;
    endRenderMeasurement: () => void;
};
//# sourceMappingURL=useRenderStats.d.ts.map