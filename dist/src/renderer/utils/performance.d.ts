/**
 * 性能监控工具
 * 用于监控画笔绘制和其他操作的性能
 */
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private constructor();
    static getInstance(): PerformanceMonitor;
    startTiming(operation: string): void;
    endTiming(operation: string): number;
    getAverageTime(operation: string): number;
    getMaxTime(operation: string): number;
    getMinTime(operation: string): number;
    getAllMetrics(): Record<string, {
        avg: number;
        max: number;
        min: number;
        count: number;
    }>;
    clearMetrics(): void;
    getMemoryUsage(): any | null;
    checkPerformanceThreshold(operation: string, threshold: number): boolean;
}
export declare function measurePerformance<T>(operation: string, fn: () => T): T;
export default PerformanceMonitor;
//# sourceMappingURL=performance.d.ts.map