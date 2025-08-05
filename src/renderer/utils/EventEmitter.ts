/**
 * Browser-compatible EventEmitter implementation
 * Provides Node.js-like EventEmitter functionality in the browser
 */
export class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  /**
   * Add an event listener
   */
  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  /**
   * Add a one-time event listener
   */
  once(event: string, listener: (...args: any[]) => void): this {
    const onceWrapper = (...args: any[]) => {
      this.removeListener(event, onceWrapper);
      listener(...args);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
    
    return true;
  }

  /**
   * Remove a specific event listener
   */
  removeListener(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  /**
   * Alias for removeListener
   */
  off(event: string, listener: (...args: any[]) => void): this {
    return this.removeListener(event, listener);
  }

  /**
   * Remove all listeners for an event, or all listeners for all events
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Get all listeners for an event
   */
  listeners(event: string): Array<(...args: any[]) => void> {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }
}