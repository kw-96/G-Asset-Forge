import { EventEmitter } from '@g-asset-forge/common';
import { PerfMonitor } from './perf_monitor';
import { AdvancedThrottler } from './utils/raf_throttle';
import { ImgManager } from './Img_manager';
import { globalErrorHandler, ErrorType } from './error_handler';
import { offlineManager } from './offline_manager';

interface PerformanceServiceEvents {
  performanceOptimized(optimization: string): void;
  memoryWarning(usage: number): void;
  performanceDegraded(reason: string): void;
  optimizationApplied(type: string, improvement: number): void;
}

interface PerformanceConfig {
  enableAutoOptimization: boolean;
  targetFps: number;
  memoryThreshold: number;
  renderOptimization: boolean;
  imagePreloading: boolean;
  offlineSupport: boolean;
}

/**
 * 性能优化服务
 * 集成所有性能优化组件，提供统一的性能管理接口
 */
export class PerformanceService extends EventEmitter<PerformanceServiceEvents> {
  private perfMonitor: PerfMonitor;
  private throttler: AdvancedThrottler;
  private imgManager: ImgManager;
  private config: PerformanceConfig;
  private isInitialized = false;
  private optimizationHistory: Array<{
    type: string;
    timestamp: number;
    improvement: number;
  }> = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    super();

    this.config = {
      enableAutoOptimization: true,
      targetFps: 60,
      memoryThreshold: 100 * 1024 * 1024, // 100MB
      renderOptimization: true,
      imagePreloading: true,
      offlineSupport: true,
      ...config,
    };

    this.perfMonitor = new PerfMonitor();
    this.throttler = new AdvancedThrottler();
    this.imgManager = new ImgManager();
  }

  /**
   * 初始化性能服务
   */
  initialize(container: HTMLElement): void {
    if (this.isInitialized) return;

    // 初始化性能监控
    this.perfMonitor.start(container);
    this.setupPerformanceMonitoring();

    // 初始化错误处理
    globalErrorHandler.initialize();
    this.setupErrorHandling();

    // 初始化离线支持
    if (this.config.offlineSupport) {
      this.setupOfflineSupport();
    }

    // 初始化图片管理
    this.setupImageManagement();

    this.isInitialized = true;
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    metrics: any;
    cacheStats: any;
    errorStats: any;
    networkInfo: any;
    optimizations: any[];
  } {
    return {
      metrics: this.perfMonitor.getMetrics(),
      cacheStats: this.imgManager.getCacheStats(),
      errorStats: globalErrorHandler.getErrorStats(),
      networkInfo: offlineManager.getNetworkInfo(),
      optimizations: this.optimizationHistory.slice(-10),
    };
  }

  /**
   * 手动触发性能优化
   */
  async optimizePerformance(): Promise<void> {
    const startTime = performance.now();

    try {
      // 内存优化
      await this.optimizeMemory();

      // 渲染优化
      if (this.config.renderOptimization) {
        this.optimizeRendering();
      }

      // 图片缓存优化
      if (this.config.imagePreloading) {
        this.optimizeImageCache();
      }

      // 清理错误日志
      this.cleanupErrorLog();

      const endTime = performance.now();
      const optimizationTime = endTime - startTime;

      this.recordOptimization('manual', optimizationTime);
      this.emit('performanceOptimized', 'manual optimization completed');
    } catch (error) {
      globalErrorHandler.handleError(
        error as Error,
        'performance-optimization',
      );
    }
  }

  /**
   * 设置性能配置
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * 预加载资源
   */
  async preloadResources(urls: string[]): Promise<void> {
    if (!this.config.imagePreloading) return;

    try {
      await this.imgManager.preloadImages(urls);

      if (this.config.offlineSupport) {
        await offlineManager.precacheResources(urls);
      }
    } catch (error) {
      globalErrorHandler.handleError(error as Error, 'resource-preloading');
    }
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const metrics = this.perfMonitor.getMetrics();
    const cacheStats = this.imgManager.getCacheStats();

    // FPS优化建议
    if (metrics.fps < this.config.targetFps) {
      suggestions.push('考虑减少画布对象数量或简化渲染逻辑以提高FPS');
    }

    // 内存优化建议
    if (metrics.memoryUsage > this.config.memoryThreshold) {
      suggestions.push('内存使用过高，建议清理未使用的资源');
    }

    // 缓存优化建议
    const cacheUsage = (cacheStats.totalSize / cacheStats.maxSize) * 100;
    if (cacheUsage > 80) {
      suggestions.push('图片缓存使用率过高，建议清理旧缓存');
    }

    // 渲染时间优化建议
    if (metrics.renderTime > 16.67) {
      suggestions.push('渲染时间过长，建议优化绘制逻辑或使用离屏渲染');
    }

    return suggestions;
  }

  /**
   * 销毁性能服务
   */
  destroy(): void {
    this.perfMonitor.destroy();
    this.throttler.clear();
    this.imgManager.destroy();
    // 清理所有事件监听器
    (this as any).eventMap = {};
    this.isInitialized = false;
  }

  private setupPerformanceMonitoring(): void {
    this.perfMonitor.on('performanceWarning', (type) => {
      if (this.config.enableAutoOptimization) {
        this.handlePerformanceWarning(type);
      }
    });

    this.perfMonitor.on('memoryLeak', (usage) => {
      this.emit('memoryWarning', usage);
      if (this.config.enableAutoOptimization) {
        this.optimizeMemory();
      }
    });
  }

  private setupErrorHandling(): void {
    globalErrorHandler.on('error', (errorInfo) => {
      // 根据错误类型进行相应的优化
      if (errorInfo.type === ErrorType.PERFORMANCE) {
        this.emit('performanceDegraded', errorInfo.message);
      }
    });

    globalErrorHandler.on('criticalError', () => {
      // 关键错误时进行紧急优化
      this.optimizePerformance();
    });
  }

  private setupOfflineSupport(): void {
    offlineManager.on('offline', () => {
      // 离线时启用更激进的缓存策略
      this.config.imagePreloading = true;
    });

    offlineManager.on('online', () => {
      // 在线时同步数据
      offlineManager.syncOfflineData().catch((error) => {
        globalErrorHandler.handleError(error, 'offline-sync');
      });
    });
  }

  private setupImageManagement(): void {
    this.imgManager.on('memoryWarning', (usage) => {
      this.emit('memoryWarning', usage);
      if (this.config.enableAutoOptimization) {
        this.imgManager.cleanup();
      }
    });

    this.imgManager.on('error', (url, error) => {
      globalErrorHandler.handleError(error, 'image-loading', { url });
    });
  }

  private handlePerformanceWarning(type: string): void {
    switch (type) {
      case 'fps':
        this.optimizeRendering();
        break;
      case 'memory':
        this.optimizeMemory();
        break;
      case 'renderTime':
        this.optimizeRenderingPipeline();
        break;
    }
  }

  private async optimizeMemory(): Promise<void> {
    const startUsage = this.perfMonitor.getMetrics().memoryUsage;

    // 清理图片缓存
    this.imgManager.cleanup();

    // 清理节流器队列
    this.throttler.clear();

    // 触发垃圾回收（如果可用）
    if ('gc' in window) {
      (window as any).gc();
    }

    const endUsage = this.perfMonitor.getMetrics().memoryUsage;
    const improvement = startUsage - endUsage;

    if (improvement > 0) {
      this.recordOptimization('memory', improvement);
    }
  }

  private optimizeRendering(): void {
    // 降低渲染质量以提高性能
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    }

    this.recordOptimization('rendering', 0);
  }

  private optimizeRenderingPipeline(): void {
    // 使用高优先级队列处理关键渲染任务
    this.throttler.scheduleHigh(() => {
      // 关键渲染逻辑
    });

    this.recordOptimization('render-pipeline', 0);
  }

  private optimizeImageCache(): void {
    const stats = this.imgManager.getCacheStats();
    const usage = (stats.totalSize / stats.maxSize) * 100;

    if (usage > 70) {
      this.imgManager.cleanup();
      this.recordOptimization('image-cache', stats.totalSize * 0.3);
    }
  }

  private cleanupErrorLog(): void {
    const errorCount = globalErrorHandler.getErrorLog().length;
    if (errorCount > 50) {
      globalErrorHandler.clearErrorLog();
      this.recordOptimization('error-log', errorCount);
    }
  }

  private recordOptimization(type: string, improvement: number): void {
    const optimization = {
      type,
      timestamp: Date.now(),
      improvement,
    };

    this.optimizationHistory.push(optimization);

    // 保持历史记录大小
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory.shift();
    }

    this.emit('optimizationApplied', type, improvement);
  }
}

// 导出默认实例
export const performanceService = new PerformanceService();
