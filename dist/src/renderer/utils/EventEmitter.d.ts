/**
 * Browser-compatible EventEmitter implementation
 * Provides Node.js-like EventEmitter functionality in the browser
 */
export declare class EventEmitter {
    private events;
    /**
     * Add an event listener
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * Add a one-time event listener
     */
    once(event: string, listener: (...args: any[]) => void): this;
    /**
     * Emit an event
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * Remove a specific event listener
     */
    removeListener(event: string, listener: (...args: any[]) => void): this;
    /**
     * Alias for removeListener
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event, or all listeners for all events
     */
    removeAllListeners(event?: string): this;
    /**
     * Get the number of listeners for an event
     */
    listenerCount(event: string): number;
    /**
     * Get all event names that have listeners
     */
    eventNames(): string[];
    /**
     * Get all listeners for an event
     */
    listeners(event: string): Array<(...args: any[]) => void>;
}
//# sourceMappingURL=EventEmitter.d.ts.map