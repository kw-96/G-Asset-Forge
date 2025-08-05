export declare class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
    private listeners;
    on<K extends keyof T>(eventName: K, listener: T[K]): void;
    off<K extends keyof T>(eventName: K, listener: T[K]): void;
    emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void;
    removeAllListeners(eventName?: keyof T): void;
}
//# sourceMappingURL=event-emitter.d.ts.map