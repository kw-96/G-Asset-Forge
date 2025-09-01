/**
 * 节流 + raf - 扩展版本，优化高频渲染操作
 */
export const rafThrottle = (callback: (...args: any) => void) => {
  let requestId: number | undefined;

  const throttled = function (...args: unknown[]) {
    if (requestId === undefined) {
      requestId = requestAnimationFrame(() => {
        requestId = undefined;
        callback(args);
      });
    }
  };

  throttled.cancel = () => {
    if (requestId !== undefined) {
      cancelAnimationFrame(requestId);
    }
    requestId = undefined;
  };

  return throttled;
};

/**
 * 高性能节流器 - 支持优先级和批处理
 */
export class AdvancedThrottler {
  private highPriorityQueue: Array<() => void> = [];
  private normalPriorityQueue: Array<() => void> = [];
  private lowPriorityQueue: Array<() => void> = [];
  private rafId: number | undefined;
  private isProcessing = false;

  /**
   * 添加高优先级任务（如用户交互响应）
   */
  scheduleHigh(callback: () => void) {
    this.highPriorityQueue.push(callback);
    this.scheduleExecution();
  }

  /**
   * 添加普通优先级任务（如渲染更新）
   */
  scheduleNormal(callback: () => void) {
    this.normalPriorityQueue.push(callback);
    this.scheduleExecution();
  }

  /**
   * 添加低优先级任务（如后台处理）
   */
  scheduleLow(callback: () => void) {
    this.lowPriorityQueue.push(callback);
    this.scheduleExecution();
  }

  private scheduleExecution() {
    if (this.rafId === undefined && !this.isProcessing) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = undefined;
        this.processQueues();
      });
    }
  }

  private processQueues() {
    this.isProcessing = true;
    const startTime = performance.now();
    const maxExecutionTime = 16; // 保持60fps，每帧最多16ms

    try {
      // 优先处理高优先级任务
      while (
        this.highPriorityQueue.length > 0 &&
        performance.now() - startTime < maxExecutionTime
      ) {
        const task = this.highPriorityQueue.shift();
        task?.();
      }

      // 处理普通优先级任务
      while (
        this.normalPriorityQueue.length > 0 &&
        performance.now() - startTime < maxExecutionTime
      ) {
        const task = this.normalPriorityQueue.shift();
        task?.();
      }

      // 处理低优先级任务
      while (
        this.lowPriorityQueue.length > 0 &&
        performance.now() - startTime < maxExecutionTime
      ) {
        const task = this.lowPriorityQueue.shift();
        task?.();
      }

      // 如果还有任务未完成，继续调度
      if (this.hasRemainingTasks()) {
        this.scheduleExecution();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private hasRemainingTasks(): boolean {
    return (
      this.highPriorityQueue.length > 0 ||
      this.normalPriorityQueue.length > 0 ||
      this.lowPriorityQueue.length > 0
    );
  }

  /**
   * 清空所有队列
   */
  clear() {
    this.highPriorityQueue.length = 0;
    this.normalPriorityQueue.length = 0;
    this.lowPriorityQueue.length = 0;

    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      high: this.highPriorityQueue.length,
      normal: this.normalPriorityQueue.length,
      low: this.lowPriorityQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

/**
 * 全局高级节流器实例
 */
export const globalThrottler = new AdvancedThrottler();
