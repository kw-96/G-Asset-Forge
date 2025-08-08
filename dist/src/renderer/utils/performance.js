/**
 * 性能监控工具
 * 用于监控画笔绘制和其他操作的性能
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    // 开始计时
    startTiming(operation) {
        performance.mark(`${operation}-start`);
    }
    // 结束计时并记录
    endTiming(operation) {
        const endMark = `${operation}-end`;
        const startMark = `${operation}-start`;
        performance.mark(endMark);
        performance.measure(operation, startMark, endMark);
        const measure = performance.getEntriesByName(operation, 'measure').pop();
        const duration = measure?.duration || 0;
        // 记录到指标中
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        const operationMetrics = this.metrics.get(operation);
        operationMetrics.push(duration);
        // 只保留最近100次记录
        if (operationMetrics.length > 100) {
            operationMetrics.shift();
        }
        // 清理性能标记
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(operation);
        return duration;
    }
    // 获取操作的平均耗时
    getAverageTime(operation) {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0)
            return 0;
        const sum = metrics.reduce((acc, time) => acc + time, 0);
        return sum / metrics.length;
    }
    // 获取操作的最大耗时
    getMaxTime(operation) {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0)
            return 0;
        return Math.max(...metrics);
    }
    // 获取操作的最小耗时
    getMinTime(operation) {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0)
            return 0;
        return Math.min(...metrics);
    }
    // 获取所有性能指标
    getAllMetrics() {
        const result = {};
        for (const [operation, metrics] of this.metrics.entries()) {
            if (metrics.length > 0) {
                result[operation] = {
                    avg: this.getAverageTime(operation),
                    max: this.getMaxTime(operation),
                    min: this.getMinTime(operation),
                    count: metrics.length
                };
            }
        }
        return result;
    }
    // 清除所有指标
    clearMetrics() {
        this.metrics.clear();
    }
    // 内存使用监控
    getMemoryUsage() {
        if ('memory' in performance) {
            return performance.memory;
        }
        return null;
    }
    // 检查是否超过性能阈值
    checkPerformanceThreshold(operation, threshold) {
        const avgTime = this.getAverageTime(operation);
        return avgTime > threshold;
    }
}
// 性能测量辅助函数
export function measurePerformance(operation, fn) {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming(operation);
    try {
        const result = fn();
        // 如果是Promise，等待完成后再结束计时
        if (result instanceof Promise) {
            return result.finally(() => {
                monitor.endTiming(operation);
            });
        }
        monitor.endTiming(operation);
        return result;
    }
    catch (error) {
        monitor.endTiming(operation);
        throw error;
    }
}
export default PerformanceMonitor;
//# sourceMappingURL=performance.js.map