export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private observers;
    private isMonitoring;
    static getInstance(): PerformanceMonitor;
    startMonitoring(): void;
    stopMonitoring(): void;
    private startMemoryMonitoring;
    private startFPSMonitoring;
    private recordMetric;
    getMetrics(): Record<string, {
        avg: number;
        min: number;
        max: number;
        latest: number;
    }>;
    mark(name: string): void;
    measure(name: string, startMark: string, endMark?: string): number;
    clearMarks(name?: string): void;
    getPerformanceReport(): string;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map