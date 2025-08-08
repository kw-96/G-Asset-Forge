// 事件发射器工具类
export class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    on(eventName, listener) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(listener);
    }
    off(eventName, listener) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.delete(listener);
            if (eventListeners.size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }
    emit(eventName, ...args) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(...args);
                }
                catch (error) {
                    console.error(`Error in event listener for ${String(eventName)}:`, error);
                }
            });
        }
    }
    removeAllListeners(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        }
        else {
            this.listeners.clear();
        }
    }
}
//# sourceMappingURL=event-emitter.js.map