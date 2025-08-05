/**
 * 性能监控工具
 * 用于监控应用启动时间、内存使用、FPS等关键指标
 */
export interface PerformanceMetrics {
    startupTime: number;
    memoryUsage: number;
    fps: number;
    cpuUsage: number;
    canvasMemoryUsage: number;
}
export interface PerformanceThresholds {
    maxStartupTime: number;
    maxMemoryUsage: number;
    minFPS: number;
    maxCPUUsage: number;
    maxCanvasMemoryUsage: number;
}
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private thresholds;
    private fpsCounter;
    private lastFpsTime;
    private observers;
    private constructor();
    static getInstance(): PerformanceMonitor;
    /**
     * 开始性能监控
     */
    private startMonitoring;
    /**
     * 监控FPS
     */
    private monitorFPS;
    /**
     * 监控内存使用
     */
    private monitorMemoryUsage;
    /**
     * 监控CPU使用
     */
    private monitorCPUUsage;
    /**
     * 设置启动时间
     */
    setStartupTime(time: number): void;
    /**
     * 设置画布内存使用
     */
    setCanvasMemoryUsage(usage: number): void;
    /**
     * 获取当前性能指标
     */
    getMetrics(): PerformanceMetrics;
    /**
     * 检查性能阈值
     */
    private checkThresholds;
    /**
     * 格式化字节数
     */
    private formatBytes;
    /**
     * 添加观察者
     */
    addObserver(observer: (metrics: PerformanceMetrics) => void): void;
    /**
     * 移除观察者
     */
    removeObserver(observer: (metrics: PerformanceMetrics) => void): void;
    /**
     * 通知观察者
     */
    private notifyObservers;
    /**
     * 获取性能报告
     */
    getReport(): string;
}
/**
 * 调试工具类
 */
export declare class DebugTools {
    private static instance;
    private isEnabled;
    private constructor();
    static getInstance(): DebugTools;
    /**
     * 启用调试模式
     */
    enable(): void;
    /**
     * 禁用调试模式
     */
    disable(): void;
    /**
     * 调试日志
     */
    log(message: string, data?: any): void;
    /**
     * 调试警告
     */
    warn(message: string, data?: any): void;
    /**
     * 调试错误
     */
    error(message: string, error?: any): void;
    /**
     * 性能分析
     */
    profile(name: string, fn: () => void): void;
    /**
     * 异步性能分析
     */
    profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
export declare const performanceMonitor: PerformanceMonitor;
export declare const debugTools: DebugTools;
//# sourceMappingURL=performance.d.ts.map