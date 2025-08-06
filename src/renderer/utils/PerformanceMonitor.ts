// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // 监控长任务
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('longTask', entry.duration);
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }

      // 监控导航性能
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', entry.duration);
        }
      });
      
      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation monitoring not supported');
      }

      // 监控资源加载
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('resource', entry.duration);
        }
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource monitoring not supported');
      }
    }

    // 监控内存使用
    this.startMemoryMonitoring();
    
    // 监控FPS
    this.startFPSMonitoring();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memoryUsed', memory.usedJSHeapSize / 1024 / 1024); // MB
        this.recordMetric('memoryTotal', memory.totalJSHeapSize / 1024 / 1024); // MB
        this.recordMetric('memoryLimit', memory.jsHeapSizeLimit / 1024 / 1024); // MB
        
        // 警告内存使用过高
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }
    };

    checkMemory();
    setInterval(checkMemory, 5000); // 每5秒检查一次
  }

  private startFPSMonitoring(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.recordMetric('fps', fps);
        
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 保持最近100个值
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; latest: number }> {
    const result: Record<string, { avg: number; min: number; max: number; latest: number }> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const latest = values[values.length - 1] || 0;
        
        result[name] = { avg, min, max, latest };
      }
    }
    
    return result;
  }

  // 标记性能点
  mark(name: string): void {
    performance.mark(name);
  }

  // 测量两个标记之间的时间
  measure(name: string, startMark: string, endMark?: string): number {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }
    
    const entries = performance.getEntriesByName(name, 'measure');
    return entries.length > 0 ? (entries[entries.length - 1]?.duration || 0) : 0;
  }

  // 清除性能标记
  clearMarks(name?: string): void {
    if (name) {
      performance.clearMarks(name);
    } else {
      performance.clearMarks();
    }
  }

  // 获取性能报告
  getPerformanceReport(): string {
    const metrics = this.getMetrics();
    let report = '=== Performance Report ===\n';
    
    for (const [name, data] of Object.entries(metrics)) {
      report += `${name}:\n`;
      report += `  Latest: ${data.latest.toFixed(2)}\n`;
      report += `  Average: ${data.avg.toFixed(2)}\n`;
      report += `  Min: ${data.min.toFixed(2)}\n`;
      report += `  Max: ${data.max.toFixed(2)}\n\n`;
    }
    
    return report;
  }
}