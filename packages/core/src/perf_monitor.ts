import Stats from 'stats.js';
import { EventEmitter } from '@g-asset-forge/common';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  canvasObjects: number;
}

interface PerfMonitorEvents {
  performanceUpdate(metrics: PerformanceMetrics): void;
  performanceWarning(type: string, value: number, threshold: number): void;
  memoryLeak(usage: number): void;
}

/**
 * 增强的性能监控器
 * 基于现有的 PerfMonitor 实现性能分析和监控
 */
export class PerfMonitor extends EventEmitter<PerfMonitorEvents> {
  private stats: Stats = new Stats();
  private rafId = 0;
  private isRunning = false;

  // 性能阈值配置
  private readonly thresholds = {
    minFps: 30,
    maxFrameTime: 33.33, // 30fps = 33.33ms per frame
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxRenderTime: 16.67, // 60fps = 16.67ms per frame
  };

  // 性能数据收集
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    canvasObjects: 0,
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private memoryBaseline = 0;
  private renderStartTime = 0;

  start(container: HTMLElement) {
    if (this.isRunning) return;

    const stats = this.stats;
    stats.showPanel(0);
    stats.dom.style.left = '300px';
    container.appendChild(stats.dom);

    // 记录内存基线
    this.memoryBaseline = this.getMemoryUsage();
    this.isRunning = true;

    const update = () => {
      if (!this.isRunning) return;

      stats.begin();

      // 更新性能指标
      this.updateMetrics();

      // 检查性能警告
      this.checkPerformanceThresholds();

      stats.end();
      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  /**
   * 标记渲染开始时间
   */
  markRenderStart() {
    this.renderStartTime = performance.now();
  }

  /**
   * 标记渲染结束并计算渲染时间
   */
  markRenderEnd() {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      this.renderStartTime = 0;
    }
  }

  /**
   * 更新画布对象数量
   */
  updateCanvasObjectCount(count: number) {
    this.metrics.canvasObjects = count;
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): string {
    const metrics = this.getMetrics();
    return `
性能报告:
- FPS: ${metrics.fps.toFixed(1)}
- 帧时间: ${metrics.frameTime.toFixed(2)}ms
- 内存使用: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
- 渲染时间: ${metrics.renderTime.toFixed(2)}ms
- 画布对象数: ${metrics.canvasObjects}
    `.trim();
  }

  private updateMetrics() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;

    this.frameCount++;

    // 每秒更新一次FPS
    if (deltaTime >= 1000) {
      this.metrics.fps = (this.frameCount * 1000) / deltaTime;
      this.metrics.frameTime = deltaTime / this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;

      // 更新内存使用
      this.metrics.memoryUsage = this.getMemoryUsage();

      // 发送性能更新事件
      this.emit('performanceUpdate', this.getMetrics());
    }
  }

  private checkPerformanceThresholds() {
    const metrics = this.metrics;

    // 检查FPS
    if (metrics.fps > 0 && metrics.fps < this.thresholds.minFps) {
      this.emit(
        'performanceWarning',
        'fps',
        metrics.fps,
        this.thresholds.minFps,
      );
    }

    // 检查帧时间
    if (metrics.frameTime > this.thresholds.maxFrameTime) {
      this.emit(
        'performanceWarning',
        'frameTime',
        metrics.frameTime,
        this.thresholds.maxFrameTime,
      );
    }

    // 检查内存使用
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      this.emit(
        'performanceWarning',
        'memory',
        metrics.memoryUsage,
        this.thresholds.maxMemoryUsage,
      );
    }

    // 检查内存泄漏（内存使用超过基线的3倍）
    if (metrics.memoryUsage > this.memoryBaseline * 3) {
      this.emit('memoryLeak', metrics.memoryUsage);
    }

    // 检查渲染时间
    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      this.emit(
        'performanceWarning',
        'renderTime',
        metrics.renderTime,
        this.thresholds.maxRenderTime,
      );
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  destroy() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.stats.dom.parentNode) {
      this.stats.dom.remove();
    }
    // 清理所有事件监听器
    (this as any).eventMap = {};
  }
}
