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
  maxStartupTime: number; // 5秒
  maxMemoryUsage: number; // 500MB
  minFPS: number; // 60fps
  maxCPUUsage: number; // 30%
  maxCanvasMemoryUsage: number; // 100MB
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private fpsCounter: number = 0;
  private lastFpsTime: number = 0;
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];

  private constructor() {
    this.thresholds = {
      maxStartupTime: 5000,
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      minFPS: 60,
      maxCPUUsage: 30,
      maxCanvasMemoryUsage: 100 * 1024 * 1024 // 100MB
    };

    this.metrics = {
      startupTime: 0,
      memoryUsage: 0,
      fps: 0,
      cpuUsage: 0,
      canvasMemoryUsage: 0
    };

    this.startMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始性能监控
   */
  private startMonitoring(): void {
    // 监控FPS
    this.monitorFPS();
    
    // 监控内存使用
    this.monitorMemoryUsage();
    
    // 监控CPU使用
    this.monitorCPUUsage();
  }

  /**
   * 监控FPS
   */
  private monitorFPS(): void {
    const measureFPS = () => {
      this.fpsCounter++;
      const now = performance.now();
      
      if (now - this.lastFpsTime >= 1000) {
        this.metrics.fps = this.fpsCounter;
        this.fpsCounter = 0;
        this.lastFpsTime = now;
        this.notifyObservers();
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * 监控内存使用
   */
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        this.notifyObservers();
      }, 1000);
    }
  }

  /**
   * 监控CPU使用
   */
  private monitorCPUUsage(): void {
    // 简单的CPU使用估算
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureCPU = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        // 基于帧率估算CPU使用
        this.metrics.cpuUsage = Math.min(100, (frameCount / 60) * 100);
        frameCount = 0;
        lastTime = now;
        this.notifyObservers();
      }
      
      requestAnimationFrame(measureCPU);
    };
    
    requestAnimationFrame(measureCPU);
  }

  /**
   * 设置启动时间
   */
  public setStartupTime(time: number): void {
    this.metrics.startupTime = time;
    this.checkThresholds();
  }

  /**
   * 设置画布内存使用
   */
  public setCanvasMemoryUsage(usage: number): void {
    this.metrics.canvasMemoryUsage = usage;
    this.checkThresholds();
  }

  /**
   * 获取当前性能指标
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(): void {
    const warnings: string[] = [];

    if (this.metrics.startupTime > this.thresholds.maxStartupTime) {
      warnings.push(`启动时间过长: ${this.metrics.startupTime}ms > ${this.thresholds.maxStartupTime}ms`);
    }

    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      warnings.push(`内存使用过高: ${this.formatBytes(this.metrics.memoryUsage)} > ${this.formatBytes(this.thresholds.maxMemoryUsage)}`);
    }

    if (this.metrics.fps < this.thresholds.minFPS) {
      warnings.push(`FPS过低: ${this.metrics.fps} < ${this.thresholds.minFPS}`);
    }

    if (this.metrics.cpuUsage > this.thresholds.maxCPUUsage) {
      warnings.push(`CPU使用过高: ${this.metrics.cpuUsage.toFixed(1)}% > ${this.thresholds.maxCPUUsage}%`);
    }

    if (this.metrics.canvasMemoryUsage > this.thresholds.maxCanvasMemoryUsage) {
      warnings.push(`画布内存使用过高: ${this.formatBytes(this.metrics.canvasMemoryUsage)} > ${this.formatBytes(this.thresholds.maxCanvasMemoryUsage)}`);
    }

    if (warnings.length > 0) {
      console.warn('性能警告:', warnings.join(', '));
    }
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 添加观察者
   */
  public addObserver(observer: (metrics: PerformanceMetrics) => void): void {
    this.observers.push(observer);
  }

  /**
   * 移除观察者
   */
  public removeObserver(observer: (metrics: PerformanceMetrics) => void): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * 通知观察者
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.getMetrics()));
  }

  /**
   * 获取性能报告
   */
  public getReport(): string {
    const metrics = this.getMetrics();
    return `
性能报告:
- 启动时间: ${metrics.startupTime}ms
- 内存使用: ${this.formatBytes(metrics.memoryUsage)}
- FPS: ${metrics.fps}
- CPU使用: ${metrics.cpuUsage.toFixed(1)}%
- 画布内存: ${this.formatBytes(metrics.canvasMemoryUsage)}
    `.trim();
  }
}

/**
 * 调试工具类
 */
export class DebugTools {
  private static instance: DebugTools;
  private isEnabled: boolean = false;

  private constructor() {}

  public static getInstance(): DebugTools {
    if (!DebugTools.instance) {
      DebugTools.instance = new DebugTools();
    }
    return DebugTools.instance;
  }

  /**
   * 启用调试模式
   */
  public enable(): void {
    this.isEnabled = true;
    console.log('调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  public disable(): void {
    this.isEnabled = false;
    console.log('调试模式已禁用');
  }

  /**
   * 调试日志
   */
  public log(message: string, data?: any): void {
    if (this.isEnabled) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * 调试警告
   */
  public warn(message: string, data?: any): void {
    if (this.isEnabled) {
      console.warn(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * 调试错误
   */
  public error(message: string, error?: any): void {
    if (this.isEnabled) {
      console.error(`[DEBUG] ${message}`, error || '');
    }
  }

  /**
   * 性能分析
   */
  public profile(name: string, fn: () => void): void {
    if (this.isEnabled) {
      console.time(`[PROFILE] ${name}`);
      fn();
      console.timeEnd(`[PROFILE] ${name}`);
    } else {
      fn();
    }
  }

  /**
   * 异步性能分析
   */
  public async profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (this.isEnabled) {
      console.time(`[PROFILE] ${name}`);
      try {
        const result = await fn();
        console.timeEnd(`[PROFILE] ${name}`);
        return result;
      } catch (error) {
        console.timeEnd(`[PROFILE] ${name}`);
        throw error;
      }
    } else {
      return await fn();
    }
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
export const debugTools = DebugTools.getInstance(); 