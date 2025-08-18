/**
 * 基础事件发射器
 * @description 简单的事件发射和监听功能
 */
export class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const eventListeners = this.events.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  /**
   * 发射事件
   */
  emit(event: string, ...args: any[]): void {
    const eventListeners = this.events.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    const eventListeners = this.events.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}