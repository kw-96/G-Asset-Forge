// 类型安全的事件发射器
export class TypedEventEmitter {
    constructor() {
        this.events = new Map();
    }
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    once(event, listener) {
        const onceWrapper = ((...args) => {
            this.removeListener(event, onceWrapper);
            listener(...args);
        });
        return this.on(event, onceWrapper);
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners || listeners.length === 0) {
            return false;
        }
        listeners.forEach(listener => {
            try {
                listener(...args);
            }
            catch (error) {
                console.error(`Error in event listener for "${String(event)}":`, error);
            }
        });
        return true;
    }
    removeListener(event, listener) {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
    off(event, listener) {
        return this.removeListener(event, listener);
    }
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
        return this;
    }
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }
    eventNames() {
        return Array.from(this.events.keys());
    }
    listeners(event) {
        const listeners = this.events.get(event);
        return listeners ? [...listeners] : [];
    }
}
//# sourceMappingURL=TypedEventEmitter.js.map