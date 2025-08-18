/**
 * 运行时性能监控器
 * 监控应用运行时的内存、CPU使用率和性能指标
 */

export interface RuntimeMetrics {
  memoryUsage: number; // MB
  memoryPeak: number; // MB
  memoryLimit: number; // MB
  cpuUsage: number; // 百分比
  heapUsed: number; // MB
  heapTotal: number; // MB
  fps: number;
  frameDrops: number;
  longTasks: number;
  gcCount: number;
  gcTime: number;
  timestamp: number;
}

export interface PerformanceAlert {
  type: 'memory' | 'cpu' | 'fps' | 'gc';
  level: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  suggestions: string[];
}

export interface PerformanceThresholds {
  memoryWarning: number; // MB
  memoryCritical: number; // MB
  cpuWarning: number; // %
  cpuCritical: number; // %
  fpsWarning: number;
  fpsCritical: number;
  longTaskThreshold: number; // ms
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  memoryWarning: 300, // 300MB
  memoryCritical: 500, // 500MB
  cpuWarning: 70, // 70%
  cpuCritical: 90, // 90%
  fpsWarning: 45,
  fpsCritical: 25,
  longTaskThreshold: 50 // 50ms
};

export class RuntimePerformanceMonitor {
  private static instance: RuntimePerformanceMonitor;
  private isMonitoring: boolean = false;
  private metrics: RuntimeMetrics;
  private thresholds: PerformanceThresholds;
  private alerts: PerformanceAlert[] = [];
  private listeners: Set<(metrics: RuntimeMetrics) => void> = new Set();
  private alertListeners: Set<(alert: PerformanceAlert) => void> = new Set();
  
  // 监控定时器
  private memoryTimer: NodeJS.Timeout | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;
  
  // FPS监控
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsStartTime = 0;
  
  // 性能观察器
  private longTaskObserver: PerformanceObserver | null = null;
  private gcObserver: PerformanceObserver | null = null;
  
  // 历史数据
  private metricsHistory: RuntimeMetrics[] = [];
  private maxHistorySize = 100;

  private constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.metrics = this.createEmptyMetrics();
    this.setupPerformanceObservers();
  }

  static getInstance(thresholds?: Partial<PerformanceThresholds>): RuntimePerformanceMonitor {
    if (!RuntimePerformanceMonitor.instance) {
      RuntimePerformanceMonitor.instance = new RuntimePerformanceMonitor(thresholds);
    }
    return RuntimePerformanceMonitor.instance;
  }

  /**
   * 开始运行时性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.fpsStartTime = performance.now();
    
    // 启动内存监控 (每2秒检查一次)
    this.memoryTimer = setInterval(() => {
      this.updateMemoryMetrics();
    }, 2000);
    
    // 启动综合指标监控 (每5秒更新一次)
    this.metricsTimer = setInterval(() => {
      this.updateAllMetrics();
      this.checkThresholds();
      this.notifyListeners();
    }, 5000);
    
    // 启动FPS监控
    this.startFPSMonitoring();
    
    console.log('运行时性能监控已启动');
  }

  /**
   * 停止运行时性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.memoryTimer) {
      clearInterval(this.memoryTimer);
      this.memoryTimer = null;
    }
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    this.stopFPSMonitoring();
    this.cleanupObservers();
    
    console.log('运行时性能监控已停止');
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): RuntimeMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能指标历史
   */
  getMetricsHistory(): RuntimeMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * 获取当前告警
   */
  getCurrentAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * 清除告警
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * 添加指标监听器
   */
  addMetricsListener(listener: (metrics: RuntimeMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 添加告警监听器
   */
  addAlertListener(listener: (alert: PerformanceAlert) => void): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  /**
   * 手动触发垃圾回收 (如果可用)
   */
  triggerGC(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      console.log('手动触发垃圾回收');
    } else {
      console.warn('垃圾回收功能不可用');
    }
  }

  /**
   * 获取性能建议
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getCurrentMetrics();

    if (metrics.memoryUsage > this.thresholds.memoryCritical) {
      recommendations.push('内存使用过高，建议重启应用或清理缓存');
    } else if (metrics.memoryUsage > this.thresholds.memoryWarning) {
      recommendations.push('内存使用较高，建议关闭不必要的功能');
    }

    if (metrics.fps < this.thresholds.fpsCritical) {
      recommendations.push('帧率过低，建议降低画质或关闭动画');
    } else if (metrics.fps < this.thresholds.fpsWarning) {
      recommendations.push('帧率偏低，建议优化渲染性能');
    }

    if (metrics.longTasks > 10) {
      recommendations.push('检测到大量长任务，建议优化代码执行效率');
    }

    if (metrics.gcTime > 100) {
      recommendations.push('垃圾回收时间过长，建议优化内存使用模式');
    }

    return recommendations;
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): {
    current: RuntimeMetrics;
    average: Partial<RuntimeMetrics>;
    peak: Partial<RuntimeMetrics>;
    alerts: PerformanceAlert[];
    recommendations: string[];
    healthScore: number;
  } {
    const current = this.getCurrentMetrics();
    const history = this.getMetricsHistory();
    const alerts = this.getCurrentAlerts();
    const recommendations = this.getPerformanceRecommendations();

    // 计算平均值和峰值
    const average = this.calculateAverageMetrics(history);
    const peak = this.calculatePeakMetrics(history);
    
    // 计算健康评分
    const healthScore = this.calculateHealthScore(current);

    return {
      current,
      average,
      peak,
      alerts,
      recommendations,
      healthScore
    };
  }

  /**
   * 创建空的指标对象
   */
  private createEmptyMetrics(): RuntimeMetrics {
    return {
      memoryUsage: 0,
      memoryPeak: 0,
      memoryLimit: 0,
      cpuUsage: 0,
      heapUsed: 0,
      heapTotal: 0,
      fps: 0,
      frameDrops: 0,
      longTasks: 0,
      gcCount: 0,
      gcTime: 0,
      timestamp: Date.now()
    };
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // 长任务观察器
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > this.thresholds.longTaskThreshold) {
            this.metrics.longTasks++;
          }
        }
      });
      this.longTaskObserver.observe({ entryTypes: ['longtask'] });

      // GC观察器 (如果支持)
      try {
        this.gcObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.includes('gc')) {
              this.metrics.gcCount++;
              this.metrics.gcTime += entry.duration;
            }
          }
        });
        this.gcObserver.observe({ entryTypes: ['measure'] });
      } catch (e) {
        // GC观察器可能不被支持
      }
    } catch (error) {
      console.warn('无法设置性能观察器:', error);
    }
  }

  /**
   * 清理观察器
   */
  private cleanupObservers(): void {
    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
      this.longTaskObserver = null;
    }
    if (this.gcObserver) {
      this.gcObserver.disconnect();
      this.gcObserver = null;
    }
  }

  /**
   * 开始FPS监控
   */
  private startFPSMonitoring(): void {
    this.fpsStartTime = performance.now();
    this.frameCount = 0;
    this.measureFrame();
  }

  /**
   * 停止FPS监控
   */
  private stopFPSMonitoring(): void {
    // FPS监控通过requestAnimationFrame自然停止
  }

  /**
   * 测量帧率
   */
  private measureFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // 每秒计算一次FPS
    if (currentTime - this.fpsStartTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsStartTime = currentTime;
    }

    // 检测帧丢失
    if (this.lastFrameTime > 0) {
      const frameDelta = currentTime - this.lastFrameTime;
      if (frameDelta > 33) { // 超过33ms表示帧丢失
        this.metrics.frameDrops++;
      }
    }

    this.lastFrameTime = currentTime;
    requestAnimationFrame(this.measureFrame);
  };

  /**
   * 更新内存指标
   */
  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.metrics.heapUsed = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.metrics.heapTotal = memory.totalJSHeapSize / 1024 / 1024; // MB
      this.metrics.memoryLimit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
      
      // 更新峰值
      if (this.metrics.memoryUsage > this.metrics.memoryPeak) {
        this.metrics.memoryPeak = this.metrics.memoryUsage;
      }
    }
  }

  /**
   * 更新所有指标
   */
  private updateAllMetrics(): void {
    this.updateMemoryMetrics();
    this.metrics.timestamp = Date.now();
    
    // 添加到历史记录
    this.metricsHistory.push({ ...this.metrics });
    
    // 限制历史记录大小
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  /**
   * 检查阈值并生成告警
   */
  private checkThresholds(): void {
    const metrics = this.metrics;
    
    // 内存告警
    if (metrics.memoryUsage > this.thresholds.memoryCritical) {
      this.addAlert({
        type: 'memory',
        level: 'critical',
        message: `内存使用严重过高: ${metrics.memoryUsage.toFixed(2)}MB`,
        value: metrics.memoryUsage,
        threshold: this.thresholds.memoryCritical,
        timestamp: Date.now(),
        suggestions: ['立即重启应用', '清理缓存数据', '关闭不必要的功能']
      });
    } else if (metrics.memoryUsage > this.thresholds.memoryWarning) {
      this.addAlert({
        type: 'memory',
        level: 'warning',
        message: `内存使用偏高: ${metrics.memoryUsage.toFixed(2)}MB`,
        value: metrics.memoryUsage,
        threshold: this.thresholds.memoryWarning,
        timestamp: Date.now(),
        suggestions: ['关闭不必要的功能', '清理临时数据']
      });
    }

    // FPS告警
    if (metrics.fps < this.thresholds.fpsCritical) {
      this.addAlert({
        type: 'fps',
        level: 'critical',
        message: `帧率严重过低: ${metrics.fps}fps`,
        value: metrics.fps,
        threshold: this.thresholds.fpsCritical,
        timestamp: Date.now(),
        suggestions: ['启用性能模式', '降低画质设置', '关闭动画效果']
      });
    } else if (metrics.fps < this.thresholds.fpsWarning) {
      this.addAlert({
        type: 'fps',
        level: 'warning',
        message: `帧率偏低: ${metrics.fps}fps`,
        value: metrics.fps,
        threshold: this.thresholds.fpsWarning,
        timestamp: Date.now(),
        suggestions: ['优化渲染设置', '减少复杂操作']
      });
    }
  }

  /**
   * 添加告警
   */
  private addAlert(alert: PerformanceAlert): void {
    // 避免重复告警
    const existingAlert = this.alerts.find(a => 
      a.type === alert.type && 
      a.level === alert.level && 
      Date.now() - a.timestamp < 30000 // 30秒内不重复
    );
    
    if (!existingAlert) {
      this.alerts.push(alert);
      
      // 限制告警数量
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }
      
      // 通知告警监听器
      this.alertListeners.forEach(listener => {
        try {
          listener(alert);
        } catch (error) {
          console.error('告警监听器错误:', error);
        }
      });
    }
  }

  /**
   * 通知指标监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics);
      } catch (error) {
        console.error('指标监听器错误:', error);
      }
    });
  }

  /**
   * 计算平均指标
   */
  private calculateAverageMetrics(history: RuntimeMetrics[]): Partial<RuntimeMetrics> {
    if (history.length === 0) return {};

    const sum = history.reduce((acc, metrics) => ({
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      fps: acc.fps + metrics.fps,
      longTasks: acc.longTasks + metrics.longTasks,
      gcTime: acc.gcTime + metrics.gcTime
    }), { memoryUsage: 0, fps: 0, longTasks: 0, gcTime: 0 });

    const count = history.length;
    return {
      memoryUsage: sum.memoryUsage / count,
      fps: sum.fps / count,
      longTasks: sum.longTasks / count,
      gcTime: sum.gcTime / count
    };
  }

  /**
   * 计算峰值指标
   */
  private calculatePeakMetrics(history: RuntimeMetrics[]): Partial<RuntimeMetrics> {
    if (history.length === 0) return {};

    return history.reduce((peak, metrics) => ({
      memoryUsage: Math.max(peak.memoryUsage || 0, metrics.memoryUsage),
      memoryPeak: Math.max(peak.memoryPeak || 0, metrics.memoryPeak),
      frameDrops: Math.max(peak.frameDrops || 0, metrics.frameDrops),
      longTasks: Math.max(peak.longTasks || 0, metrics.longTasks),
      gcTime: Math.max(peak.gcTime || 0, metrics.gcTime)
    }), {
      memoryUsage: 0,
      memoryPeak: 0,
      frameDrops: 0,
      longTasks: 0,
      gcTime: 0
    });
  }

  /**
   * 计算健康评分
   */
  private calculateHealthScore(metrics: RuntimeMetrics): number {
    let score = 100;

    // 内存评分 (30%)
    const memoryRatio = metrics.memoryUsage / this.thresholds.memoryCritical;
    if (memoryRatio > 1) score -= 30;
    else if (memoryRatio > 0.6) score -= 15;

    // FPS评分 (40%)
    const fpsRatio = metrics.fps / 60;
    if (fpsRatio < 0.4) score -= 40;
    else if (fpsRatio < 0.7) score -= 20;

    // 长任务评分 (20%)
    if (metrics.longTasks > 20) score -= 20;
    else if (metrics.longTasks > 10) score -= 10;

    // GC评分 (10%)
    if (metrics.gcTime > 200) score -= 10;
    else if (metrics.gcTime > 100) score -= 5;

    return Math.max(0, score);
  }
}

// 创建全局实例
export const runtimePerformanceMonitor = RuntimePerformanceMonitor.getInstance();

// React Hook
export const useRuntimePerformance = () => {
  return {
    startMonitoring: runtimePerformanceMonitor.startMonitoring.bind(runtimePerformanceMonitor),
    stopMonitoring: runtimePerformanceMonitor.stopMonitoring.bind(runtimePerformanceMonitor),
    getCurrentMetrics: runtimePerformanceMonitor.getCurrentMetrics.bind(runtimePerformanceMonitor),
    getMetricsHistory: runtimePerformanceMonitor.getMetricsHistory.bind(runtimePerformanceMonitor),
    getCurrentAlerts: runtimePerformanceMonitor.getCurrentAlerts.bind(runtimePerformanceMonitor),
    clearAlerts: runtimePerformanceMonitor.clearAlerts.bind(runtimePerformanceMonitor),
    addMetricsListener: runtimePerformanceMonitor.addMetricsListener.bind(runtimePerformanceMonitor),
    addAlertListener: runtimePerformanceMonitor.addAlertListener.bind(runtimePerformanceMonitor),
    triggerGC: runtimePerformanceMonitor.triggerGC.bind(runtimePerformanceMonitor),
    getPerformanceRecommendations: runtimePerformanceMonitor.getPerformanceRecommendations.bind(runtimePerformanceMonitor),
    generatePerformanceReport: runtimePerformanceMonitor.generatePerformanceReport.bind(runtimePerformanceMonitor)
  };
};