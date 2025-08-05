import { SuikaEditor } from './editor';
export interface ISuikaMemoryLimits {
    maxCanvasMemory: number;
    maxTotalMemory: number;
    warningThreshold: number;
    criticalThreshold: number;
    gcThreshold: number;
    objectPoolSize: number;
    textureCacheSize: number;
}
export interface ISuikaMemoryStats {
    canvasMemory: number;
    totalMemory: number;
    objectCount: number;
    textureCount: number;
    cacheSize: number;
    lastGC: Date | null;
    fps: number;
    renderTime: number;
}
export declare enum SuikaMemoryEvent {
    MEMORY_WARNING = "memory:warning",
    MEMORY_CRITICAL = "memory:critical",
    GARBAGE_COLLECTED = "memory:gc",
    OBJECT_POOLED = "memory:pooled",
    CACHE_CLEARED = "memory:cache-cleared",
    PERFORMANCE_UPDATE = "performance:update"
}
export declare class SuikaMemoryManager {
    private events;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    private editor;
    private limits;
    private stats;
    private objectPools;
    private textureCache;
    private monitoringInterval;
    private performanceMonitor;
    constructor(editor: SuikaEditor, limits?: Partial<ISuikaMemoryLimits>);
    getMemoryStats(): ISuikaMemoryStats;
    forceGarbageCollection(): void;
    getPooledObject<T>(type: string, factory: () => T): T;
    returnToPool(type: string, object: any): void;
    cacheTexture(key: string, texture: any, estimatedSize: number): void;
    getCachedTexture(key: string): any | null;
    clearAll(): void;
    setMemoryLimits(limits: Partial<ISuikaMemoryLimits>): void;
    destroy(): void;
    private initializeObjectPools;
    private startMemoryMonitoring;
    private updateMemoryStats;
    private updatePerformanceStats;
    private setupPerformanceMonitoring;
    private estimateCanvasMemoryUsage;
    private estimateTotalMemoryUsage;
    private estimateObjectMemory;
    private countObjects;
    private updateCacheSize;
    private checkMemoryThresholds;
    private cleanupObjectPools;
    private cleanupTextureCache;
    private cleanupSceneGraph;
    private resetObjectForPool;
    getPerformanceInfo(): {
        fps: number;
        memoryUsage: number;
        renderTime: number;
    };
}
//# sourceMappingURL=memory-manager.d.ts.map