/**
 * 事件发射器 - 发布订阅设计模式实现
 * @description 提供类型安全的事件发射和监听功能
 * @author Suika团队
 */

export class EventEmitter<T extends Record<string | symbol, any>> {
  private eventMap: Record<keyof T, Array<(...args: any[]) => void>> =
    {} as any;

  on<K extends keyof T>(eventName: K, listener: T[K]) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = [];
    }
    this.eventMap[eventName].push(listener);
    return this;
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>) {
    const listeners = this.eventMap[eventName];
    if (!listeners || listeners.length === 0) return false;
    listeners.forEach((listener) => {
      listener(...args);
    });
    return true;
  }

  off<K extends keyof T>(eventName: K, listener: T[K]) {
    if (this.eventMap[eventName]) {
      this.eventMap[eventName] = this.eventMap[eventName].filter(
        (item) => item !== listener,
      );
    }
    return this;
  }
}

export default EventEmitter;