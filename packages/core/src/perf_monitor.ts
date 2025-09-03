import Stats from 'stats.js';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  canvasObjects: number;
}

export class PerfMonitor {
  private stats: Stats = new Stats();
  private rafId = 0;

  start(container: HTMLElement) {
    const stats = this.stats;
    stats.showPanel(0);
    stats.dom.style.left = '300px';
    container.appendChild(stats.dom);

    const update = () => {
      stats.begin();
      stats.end();
      this.rafId = requestAnimationFrame(update);
    };
    this.rafId = requestAnimationFrame(update);
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.stats.dom.remove();
  }

  // 为了保持兼容性，添加空的方法
  markRenderStart() {
    // 简化版本不需要实现
  }

  markRenderEnd() {
    // 简化版本不需要实现
  }

  updateCanvasObjectCount(count: number) {
    // 简化版本不需要实现，但保持参数以避免警告
    void count;
  }

  getMetrics(): PerformanceMetrics {
    // 简化版本不需要实现
    return {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      canvasObjects: 0,
    };
  }
}
