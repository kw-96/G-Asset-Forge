/**
 * 统一性能监控系统
 * 合并了基础性能监控、Figma风格监控和运行时监控的功能
 */

// 统一的性能指标接口
export interface UnifiedPerformanceMetrics {
  // 基础性能指标
  fps: number;
  memoryUsage: number; // MB
  memoryPeak: number; // MB
  cpuUsage: number; // %
  
  // 渲染性能
  canvasRenderTime: number; // ms
  canvasFrameDrops: number;
  
  // 交互性能
  toolSwitchTime: number; // ms
  panelSwitchTime: number; // ms
  userInteractionDelay: number; // ms
  firstInteractionTime: number; // ms
  timeToInteractive: number; // ms
  
  // 网络性能
  assetLoadTime: number; // ms
  networkLatency: number; // ms
  
  // 设备信息
  devicePixelRatio: number;
  hardwareConcurrency: number;
  connectionType: string;
  
  // 长任务监控
  longTaskCount: number;
  longTaskDuration: number; // ms
  
  // 导航性能
  navigationTime: number; // ms
  resourceLoadTime: number; // ms
}

// 性能阈值配置
export interface PerformanceThresholds {
  fps: { good: number; poor: number };
  memoryUsage: { good: number; poor: number };
  canvasRenderTime: { good: number; poor: number };
  toolSwitchTime: { good: number; poor: number };
  userInteractionDelay: { good: number; poor: number };
  longTaskDuration: { good: number; poor: number };
}

// 性能警告类型
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'rendering' | 'memory' | 'interaction' | 'network' | 'system';
  message: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: number;
  value?: number;
  threshold?: number;
}

// 性能报告接口
export interface PerformanceReport {
  timestamp: number;
  metrics: UnifiedPerformanceMetrics;
  alerts: PerformanceAlert[];
  healthScore: number; // 0-100
  recommendations: string[];
  deviceInfo: DeviceInfo;
}

// 设备信息接口
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceMemory?: number;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  screenResolution: string;
  colorDepth: number;
  connectionType?: string;
  connectionSpeed?: string;
}

// 默认阈值
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fps: { good: 55, poor: 25 },
  memoryUsage: { good: 100, poor: 500 }, // MB
  canvasRenderTime: { good: 16, poor: 33 }, // ms (60fps vs 30fps)
  toolSwitchTime: { good: 100, poor: 300 }, // ms
  userInteractionDelay: { good: 50, poor: 200 }, // ms
  longTaskDuration: { good: 50, poor: 100 } // ms
};

/**
 * 统一性能监控器类
 */
export class UnifiedPerformanceMonitor {
  static markStart(_arg0: string, _startTime: number) {
    throw new Error('Method not implemented.');
  }
  static recordMetric(_arg0: string, _arg1: number) {
    throw new Error('Method not implemented.');
  }
  static markEnd(_arg0: string, _startTime: number) {
    throw new Error('Method not implemented.');
  }
  private static instance: UnifiedPerformanceMonitor;
  
  // 监控状态
  private isMonitoring = false;
  private thresholds: PerformanceThresholds;
  
  // 性能指标
  private metrics: Partial<UnifiedPerformanceMetrics> = {};
  private alerts: PerformanceAlert[] = [];
  private maxAlertsHistory = 50;
  
  // 监控器和观察器
  private observers: Map<string, PerformanceObserver> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Set<(report: PerformanceReport) => void> = new Set();
  
  // FPS监控
  private fpsStartTime = 0;
  private frameCount = 0;
  private lastFrameTime = 0;
  private animationFrameId: number | null = null;
  
  // 内存监控
  private memoryBaseline = 0;
  private memoryPeak = 0;
  
  // 长任务监控
  private longTaskCount = 0;
  private longTaskTotalDuration = 0;

  private constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.bindMethods();
  }

  static getInstance(thresholds?: Partial<PerformanceThresholds>): UnifiedPerformanceMonitor {
    if (!UnifiedPerformanceMonitor.instance) {
      UnifiedPerformanceMonitor.instance = new UnifiedPerformanceMonitor(thresholds);
    }
    return UnifiedPerformanceMonitor.instance;
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.initializeBaseline();
    this.setupObservers();
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
    this.startReporting();
    
    // console.log('统一性能监控已启动');
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.cleanupObservers();
    this.stopFPSMonitoring();
    this.stopMemoryMonitoring();
    this.stopReporting();
    
    console.log('统一性能监控已停止');
  }

  /**
   * 测量画布渲染时间
   */
  measureCanvasRender<T>(callback: () => T): T {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    this.metrics.canvasRenderTime = renderTime;
    
    // 检查是否需要警告
    if (renderTime > this.thresholds.canvasRenderTime.poor) {
      this.addAlert({
        type: 'error',
        category: 'rendering',
        message: `画布渲染时间过长: ${renderTime.toFixed(2)}ms`,
        suggestion: '考虑降低画布质量或减少复杂图形元素',
        impact: 'high',
        value: renderTime,
        threshold: this.thresholds.canvasRenderTime.poor
      });
    }
    
    return result;
  }

  /**
   * 测量工具切换时间
   */
  measureToolSwitch<T>(_toolName: string, callback: () => T): T {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    
    const switchTime = endTime - startTime;
    this.metrics.toolSwitchTime = switchTime;
    
    // 检查是否需要警告
    if (switchTime > this.thresholds.toolSwitchTime.poor) {
      this.addAlert({
        type: 'warning',
        category: 'interaction',
        message: `工具切换时间过长: ${switchTime.toFixed(2)}ms`,
        suggestion: '优化工具切换逻辑或启用批量更新',
        impact: 'medium',
        value: switchTime,
        threshold: this.thresholds.toolSwitchTime.poor
      });
    }
    
    return result;
  }

  /**
   * 测量用户交互延迟
   */
  measureInteractionDelay(_interactionType: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const delay = endTime - startTime;
      
      this.metrics.userInteractionDelay = delay;
      
      // 检查是否需要警告
      if (delay > this.thresholds.userInteractionDelay.poor) {
        this.addAlert({
          type: 'warning',
          category: 'interaction',
          message: `用户交互延迟过高: ${delay.toFixed(2)}ms`,
          suggestion: '优化事件处理逻辑或启用批量更新',
          impact: 'high',
          value: delay,
          threshold: this.thresholds.userInteractionDelay.poor
        });
      }
    };
  }

  /**
   * 记录首次交互时间
   */
  recordFirstInteraction(): void {
    if (!this.metrics.firstInteractionTime) {
      this.metrics.firstInteractionTime = performance.now();
    }
  }

  /**
   * 记录可交互时间
   */
  recordTimeToInteractive(): void {
    this.metrics.timeToInteractive = performance.now();
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): UnifiedPerformanceMetrics {
    return {
      fps: this.metrics.fps || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      memoryPeak: this.metrics.memoryPeak || 0,
      cpuUsage: this.metrics.cpuUsage || 0,
      canvasRenderTime: this.metrics.canvasRenderTime || 0,
      canvasFrameDrops: this.metrics.canvasFrameDrops || 0,
      toolSwitchTime: this.metrics.toolSwitchTime || 0,
      panelSwitchTime: this.metrics.panelSwitchTime || 0,
      userInteractionDelay: this.metrics.userInteractionDelay || 0,
      firstInteractionTime: this.metrics.firstInteractionTime || 0,
      timeToInteractive: this.metrics.timeToInteractive || 0,
      assetLoadTime: this.metrics.assetLoadTime || 0,
      networkLatency: this.metrics.networkLatency || 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      connectionType: this.getConnectionType(),
      longTaskCount: this.longTaskCount,
      longTaskDuration: this.longTaskTotalDuration,
      navigationTime: this.metrics.navigationTime || 0,
      resourceLoadTime: this.metrics.resourceLoadTime || 0
    };
  }

  /**
   * 获取当前警告
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * 清除警告
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const metrics = this.getMetrics();
    const alerts = this.getAlerts();
    const healthScore = this.calculateHealthScore(metrics);
    const recommendations = this.generateRecommendations(metrics, alerts);
    const deviceInfo = this.getDeviceInfo();

    return {
      timestamp: Date.now(),
      metrics,
      alerts,
      healthScore,
      recommendations,
      deviceInfo
    };
  }

  /**
   * 添加报告监听器
   */
  addReportListener(listener: (report: PerformanceReport) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 获取自适应设置
   */
  getAdaptiveSettings(): {
    enableAnimations: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
    canvasQuality: 'high' | 'medium' | 'low';
    maxFPS: number;
  } {
    const metrics = this.getMetrics();
    const deviceInfo = this.getDeviceInfo();
    
    const isLowEndDevice = deviceInfo.hardwareConcurrency <= 2 || 
                          (deviceInfo.deviceMemory && deviceInfo.deviceMemory <= 4);
    
    const hasPerformanceIssues = metrics.fps < 30 || metrics.canvasRenderTime > 33;
    
    if (isLowEndDevice || hasPerformanceIssues) {
      return {
        enableAnimations: false,
        enableShadows: false,
        enableBlur: false,
        canvasQuality: 'low',
        maxFPS: 30
      };
    }
    
    if (metrics.fps < 50) {
      return {
        enableAnimations: true,
        enableShadows: false,
        enableBlur: false,
        canvasQuality: 'medium',
        maxFPS: 45
      };
    }
    
    return {
      enableAnimations: true,
      enableShadows: true,
      enableBlur: true,
      canvasQuality: 'high',
      maxFPS: 60
    };
  }

  /**
   * 强制垃圾回收（如果支持）
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      console.log('强制垃圾回收已执行');
    } else {
      console.warn('当前环境不支持强制垃圾回收');
    }
  }

  /**
   * 清除性能标记
   */
  clearMarks(name?: string): void {
    if (name) {
      performance.clearMarks(name);
    } else {
      performance.clearMarks();
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopMonitoring();
    this.listeners.clear();
    this.alerts = [];
  }

  // ========== 私有方法 ==========

  private bindMethods(): void {
    this.measureFrame = this.measureFrame.bind(this);
    this.checkMemory = this.checkMemory.bind(this);
  }

  private initializeBaseline(): void {
    this.memoryBaseline = this.getCurrentMemoryUsage();
    this.memoryPeak = this.memoryBaseline;
    this.fpsStartTime = performance.now();
    this.longTaskCount = 0;
    this.longTaskTotalDuration = 0;
  }

  private setupObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    // 长任务观察器
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTaskCount++;
          this.longTaskTotalDuration += entry.duration;
          
          if (entry.duration > this.thresholds.longTaskDuration.poor) {
            this.addAlert({
              type: 'warning',
              category: 'system',
              message: `检测到长任务: ${entry.duration.toFixed(2)}ms`,
              suggestion: '优化代码逻辑，避免阻塞主线程',
              impact: 'high',
              value: entry.duration,
              threshold: this.thresholds.longTaskDuration.poor
            });
          }
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (error) {
      console.warn('长任务监控不支持:', error);
    }

    // 导航观察器
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.navigationTime = navEntry.loadEventEnd - navEntry.fetchStart;
            this.metrics.timeToInteractive = navEntry.domInteractive;
          }
        }
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    } catch (error) {
      console.warn('导航监控不支持:', error);
    }

    // 资源观察器
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        let totalResourceTime = 0;
        let resourceCount = 0;
        
        for (const entry of list.getEntries()) {
          totalResourceTime += entry.duration;
          resourceCount++;
        }
        
        if (resourceCount > 0) {
          this.metrics.resourceLoadTime = totalResourceTime / resourceCount;
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('资源监控不支持:', error);
    }
  }

  private cleanupObservers(): void {
    for (const observer of Array.from(this.observers.values())) {
      observer.disconnect();
    }
    this.observers.clear();
  }

  private startFPSMonitoring(): void {
    this.fpsStartTime = performance.now();
    this.frameCount = 0;
    this.measureFrame();
  }

  private stopFPSMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private measureFrame(): void {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    this.frameCount++;
    
    // 每秒计算一次FPS
    if (currentTime - this.fpsStartTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsStartTime = currentTime;
      
      // 检查FPS警告
      if (this.metrics.fps < this.thresholds.fps.poor) {
        this.addAlert({
          type: 'error',
          category: 'rendering',
          message: `帧率过低: ${this.metrics.fps}fps`,
          suggestion: '启用性能模式或关闭动画效果',
          impact: 'high',
          value: this.metrics.fps,
          threshold: this.thresholds.fps.poor
        });
      }
    }
    
    // 检测帧丢失
    if (this.lastFrameTime > 0) {
      const frameDelta = currentTime - this.lastFrameTime;
      if (frameDelta > 33) { // 超过33ms表示帧丢失
        this.metrics.canvasFrameDrops = (this.metrics.canvasFrameDrops || 0) + 1;
      }
    }
    
    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.measureFrame);
  }

  private startMemoryMonitoring(): void {
    const memoryInterval = setInterval(this.checkMemory, 5000); // 每5秒检查
    this.intervals.set('memory', memoryInterval);
  }

  private stopMemoryMonitoring(): void {
    const memoryInterval = this.intervals.get('memory');
    if (memoryInterval) {
      clearInterval(memoryInterval);
      this.intervals.delete('memory');
    }
  }

  private checkMemory(): void {
    const currentMemory = this.getCurrentMemoryUsage();
    this.metrics.memoryUsage = currentMemory;
    
    if (currentMemory > this.memoryPeak) {
      this.memoryPeak = currentMemory;
      this.metrics.memoryPeak = this.memoryPeak;
    }
    
    // 检查内存警告
    if (currentMemory > this.thresholds.memoryUsage.poor) {
      this.addAlert({
        type: 'error',
        category: 'memory',
        message: `内存使用过高: ${currentMemory.toFixed(2)}MB`,
        suggestion: '清理未使用的资源或重启应用',
        impact: 'high',
        value: currentMemory,
        threshold: this.thresholds.memoryUsage.poor
      });
    } else if (currentMemory > this.thresholds.memoryUsage.good) {
      this.addAlert({
        type: 'warning',
        category: 'memory',
        message: `内存使用较高: ${currentMemory.toFixed(2)}MB`,
        suggestion: '考虑清理缓存或优化内存使用',
        impact: 'medium',
        value: currentMemory,
        threshold: this.thresholds.memoryUsage.good
      });
    }
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // 转换为MB
    }
    return 0;
  }

  private startReporting(): void {
    const reportInterval = setInterval(() => {
      const report = this.generateReport();
      this.notifyListeners(report);
    }, 5000); // 每5秒报告一次
    
    this.intervals.set('report', reportInterval);
  }

  private stopReporting(): void {
    const reportInterval = this.intervals.get('report');
    if (reportInterval) {
      clearInterval(reportInterval);
      this.intervals.delete('report');
    }
  }

  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    this.alerts.push(newAlert);
    
    // 限制警告数量
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts.shift();
    }
  }

  private calculateHealthScore(metrics: UnifiedPerformanceMetrics): number {
    let score = 100;
    
    // FPS评分 (30%)
    const fpsScore = this.calculateMetricScore(
      metrics.fps,
      this.thresholds.fps.good,
      this.thresholds.fps.poor,
      false // 越大越好
    );
    score -= (100 - fpsScore) * 0.3;
    
    // 内存评分 (25%)
    const memoryScore = this.calculateMetricScore(
      metrics.memoryUsage,
      this.thresholds.memoryUsage.good,
      this.thresholds.memoryUsage.poor,
      true // 越小越好
    );
    score -= (100 - memoryScore) * 0.25;
    
    // 渲染评分 (25%)
    const renderScore = this.calculateMetricScore(
      metrics.canvasRenderTime,
      this.thresholds.canvasRenderTime.good,
      this.thresholds.canvasRenderTime.poor,
      true // 越小越好
    );
    score -= (100 - renderScore) * 0.25;
    
    // 交互评分 (20%)
    const interactionScore = this.calculateMetricScore(
      metrics.userInteractionDelay,
      this.thresholds.userInteractionDelay.good,
      this.thresholds.userInteractionDelay.poor,
      true // 越小越好
    );
    score -= (100 - interactionScore) * 0.2;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateMetricScore(value: number, good: number, poor: number, lowerIsBetter: boolean): number {
    if (lowerIsBetter) {
      if (value <= good) return 100;
      if (value >= poor) return 0;
      return 100 - ((value - good) / (poor - good)) * 100;
    } else {
      if (value >= good) return 100;
      if (value <= poor) return 0;
      return ((value - poor) / (good - poor)) * 100;
    }
  }

  private generateRecommendations(metrics: UnifiedPerformanceMetrics, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.fps < this.thresholds.fps.poor) {
      recommendations.push('帧率过低，考虑降低画布质量或减少复杂图形元素');
    }
    
    if (metrics.memoryUsage > this.thresholds.memoryUsage.poor) {
      recommendations.push('内存使用过高，建议清理未使用的资源或重启应用');
    }
    
    if (metrics.canvasRenderTime > this.thresholds.canvasRenderTime.poor) {
      recommendations.push('画布渲染时间过长，考虑优化渲染逻辑');
    }
    
    if (metrics.userInteractionDelay > this.thresholds.userInteractionDelay.poor) {
      recommendations.push('用户交互延迟过高，优化事件处理逻辑');
    }
    
    if (metrics.longTaskCount > 10) {
      recommendations.push('长任务过多，优化代码逻辑避免阻塞主线程');
    }
    
    if (alerts.length === 0 && metrics.fps >= this.thresholds.fps.good && 
        metrics.memoryUsage <= this.thresholds.memoryUsage.good) {
      recommendations.push('性能状态良好，继续保持');
    }
    
    return recommendations;
  }

  private getDeviceInfo(): DeviceInfo {
    const nav = navigator as any;
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      devicePixelRatio: window.devicePixelRatio || 1,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      connectionType: this.getConnectionType(),
      connectionSpeed: nav.connection?.downlink ? `${nav.connection.downlink}Mbps` : 'unknown'
    };
  }

  private getConnectionType(): string {
    const nav = navigator as any;
    return nav.connection?.effectiveType || 'unknown';
  }

  private notifyListeners(report: PerformanceReport): void {
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(report);
      } catch (error) {
        console.error('性能报告监听器错误:', error);
      }
    }
  }
}

// 创建全局实例
export const unifiedPerformanceMonitor = UnifiedPerformanceMonitor.getInstance();

// React Hook
export const useUnifiedPerformanceMonitor = () => {
  return {
    startMonitoring: unifiedPerformanceMonitor.startMonitoring.bind(unifiedPerformanceMonitor),
    stopMonitoring: unifiedPerformanceMonitor.stopMonitoring.bind(unifiedPerformanceMonitor),
    measureCanvasRender: unifiedPerformanceMonitor.measureCanvasRender.bind(unifiedPerformanceMonitor),
    measureToolSwitch: unifiedPerformanceMonitor.measureToolSwitch.bind(unifiedPerformanceMonitor),
    measureInteractionDelay: unifiedPerformanceMonitor.measureInteractionDelay.bind(unifiedPerformanceMonitor),
    getMetrics: unifiedPerformanceMonitor.getMetrics.bind(unifiedPerformanceMonitor),
    getAlerts: unifiedPerformanceMonitor.getAlerts.bind(unifiedPerformanceMonitor),
    clearAlerts: unifiedPerformanceMonitor.clearAlerts.bind(unifiedPerformanceMonitor),
    generateReport: unifiedPerformanceMonitor.generateReport.bind(unifiedPerformanceMonitor),
    getAdaptiveSettings: unifiedPerformanceMonitor.getAdaptiveSettings.bind(unifiedPerformanceMonitor),
    forceGarbageCollection: unifiedPerformanceMonitor.forceGarbageCollection.bind(unifiedPerformanceMonitor),
    addReportListener: unifiedPerformanceMonitor.addReportListener.bind(unifiedPerformanceMonitor)
  };
};

export default UnifiedPerformanceMonitor;