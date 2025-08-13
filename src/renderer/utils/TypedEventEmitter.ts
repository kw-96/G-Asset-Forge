// 类型安全的事件发射器
export class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private events: Map<keyof T, Array<T[keyof T]>> = new Map();

  on<K extends keyof T>(event: K, listener: T[K]): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  once<K extends keyof T>(event: K, listener: T[K]): this {
    const onceWrapper = ((...args: any[]) => {
      this.removeListener(event, onceWrapper as T[K]);
      listener(...args);
    }) as T[K];
    return this.on(event, onceWrapper);
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    });
    
    return true;
  }

  removeListener<K extends keyof T>(event: K, listener: T[K]): this {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  off<K extends keyof T>(event: K, listener: T[K]): this {
    return this.removeListener(event, listener);
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  listenerCount<K extends keyof T>(event: K): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  eventNames(): Array<keyof T> {
    return Array.from(this.events.keys());
  }

  listeners<K extends keyof T>(event: K): Array<T[K]> {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] as Array<T[K]> : [];
  }
}