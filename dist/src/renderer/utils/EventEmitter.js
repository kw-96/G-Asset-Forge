/**
 * Browser-compatible EventEmitter implementation
 * Provides Node.js-like EventEmitter functionality in the browser
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    /**
     * Add an event listener
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    /**
     * Add a one-time event listener
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.removeListener(event, onceWrapper);
            listener(...args);
        };
        return this.on(event, onceWrapper);
    }
    /**
     * Emit an event
     */
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
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
        return true;
    }
    /**
     * Remove a specific event listener
     */
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
    /**
     * Alias for removeListener
     */
    off(event, listener) {
        return this.removeListener(event, listener);
    }
    /**
     * Remove all listeners for an event, or all listeners for all events
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
        return this;
    }
    /**
     * Get the number of listeners for an event
     */
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }
    /**
     * Get all event names that have listeners
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    /**
     * Get all listeners for an event
     */
    listeners(event) {
        const listeners = this.events.get(event);
        return listeners ? [...listeners] : [];
    }
}
//# sourceMappingURL=EventEmitter.js.map