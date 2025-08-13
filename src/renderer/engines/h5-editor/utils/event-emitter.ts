// H5-Editor事件发射器工具类
export class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private listeners: Map<keyof T, Set<T[keyof T]>> = new Map();

  on<K extends keyof T>(eventName: K, listener: T[K]): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
  }

  off<K extends keyof T>(eventName: K, listener: T[K]): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in H5-Editor event listener for ${String(eventName)}:`, error);
        }
      });
    }
  }

  removeAllListeners(eventName?: keyof T): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}