export declare class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
    private events;
    on<K extends keyof T>(event: K, listener: T[K]): this;
    once<K extends keyof T>(event: K, listener: T[K]): this;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
    removeListener<K extends keyof T>(event: K, listener: T[K]): this;
    off<K extends keyof T>(event: K, listener: T[K]): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
    listenerCount<K extends keyof T>(event: K): number;
    eventNames(): Array<keyof T>;
    listeners<K extends keyof T>(event: K): Array<T[K]>;
}
//# sourceMappingURL=TypedEventEmitter.d.ts.map