/**
 * 性能监控工具
 * 用于监控画笔绘制和其他操作的性能
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始计时
  public startTiming(operation: string): void {
    performance.mark(`${operation}-start`);
  }

  // 结束计时并记录
  public endTiming(operation: string): number {
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
    
    const operationMetrics = this.metrics.get(operation)!;
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
  public getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, time) => acc + time, 0);
    return sum / metrics.length;
  }

  // 获取操作的最大耗时
  public getMaxTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    return Math.max(...metrics);
  }

  // 获取操作的最小耗时
  public getMinTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    return Math.min(...metrics);
  }

  // 获取所有性能指标
  public getAllMetrics(): Record<string, { avg: number; max: number; min: number; count: number }> {
    const result: Record<string, { avg: number; max: number; min: number; count: number }> = {};
    
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
  public clearMetrics(): void {
    this.metrics.clear();
  }

  // 内存使用监控
  public getMemoryUsage(): any | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  // 检查是否超过性能阈值
  public checkPerformanceThreshold(operation: string, threshold: number): boolean {
    const avgTime = this.getAverageTime(operation);
    return avgTime > threshold;
  }
}

// 性能测量辅助函数
export function measurePerformance<T>(operation: string, fn: () => T): T {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startTiming(operation);
  
  try {
    const result = fn();
    
    // 如果是Promise，等待完成后再结束计时
    if (result instanceof Promise) {
      return result.finally(() => {
        monitor.endTiming(operation);
      }) as T;
    }
    
    monitor.endTiming(operation);
    return result;
  } catch (error) {
    monitor.endTiming(operation);
    throw error;
  }
}

export default PerformanceMonitor;