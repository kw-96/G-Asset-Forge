/**
 * useRadixUIPerformance Hook
 * 为Radix UI组件提供性能监控功能
 */
export interface UseRadixUIPerformanceOptions {
    componentName: string;
    enabled?: boolean;
    alertThreshold?: number;
    debugMode?: boolean;
}
export interface UseRadixUIPerformanceReturn {
    renderCount: number;
    startRenderMeasurement: () => void;
    endRenderMeasurement: () => void;
    resetMetrics: () => void;
    getMetrics: () => any;
}
/**
 * 监控Radix UI组件性能的Hook
 */
export declare const useRadixUIPerformance: (options: UseRadixUIPerformanceOptions) => UseRadixUIPerformanceReturn;
/**
 * 简化版的性能监控Hook，只监控渲染次数
 */
export declare const useRadixUIRenderCount: (componentName: string, enabled?: boolean) => number;
/**
 * 检测Radix UI组件异常渲染的Hook
 */
export declare const useRadixUIAnomalyDetection: (componentName: string, options?: {
    maxRenderCount?: number;
    timeWindow?: number;
    enabled?: boolean;
}) => {
    isAnomalyDetected: boolean;
    currentRenderCount: number;
    resetDetection: () => void;
};
//# sourceMappingURL=useRadixUIPerformance.d.ts.map