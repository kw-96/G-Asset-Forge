import { fabric } from 'fabric';
import { EventEmitter } from 'events';
export interface MemoryLimits {
    maxCanvasMemory: number;
    maxTotalMemory: number;
    warningThreshold: number;
    criticalThreshold: number;
    gcThreshold: number;
}
export interface MemoryStats {
    canvasMemory: number;
    totalMemory: number;
    objectCount: number;
    textureCount: number;
    cacheSize: number;
    lastGC: Date | null;
}
export declare enum MemoryEvent {
    MEMORY_WARNING = "memory:warning",
    MEMORY_CRITICAL = "memory:critical",
    GARBAGE_COLLECTED = "memory:gc",
    OBJECT_POOLED = "memory:pooled",
    CACHE_CLEARED = "memory:cache-cleared"
}
/**
 * Memory Manager for Canvas Operations
 * Handles memory monitoring, object pooling, and garbage collection
 */
export declare class MemoryManager extends EventEmitter {
    private limits;
    private stats;
    private objectPools;
    private textureCache;
    private monitoringInterval;
    private canvases;
    private isOptimizing;
    private lastOptimization;
    constructor(limits?: Partial<MemoryLimits>);
    /**
     * Register a canvas for memory monitoring
     */
    registerCanvas(canvasId: string, canvas: fabric.Canvas): void;
    /**
     * Unregister a canvas from memory monitoring
     */
    unregisterCanvas(canvasId: string): void;
    /**
     * Get current memory statistics
     */
    getMemoryStats(): MemoryStats;
    /**
     * Force garbage collection if available
     */
    forceGarbageCollection(): void;
    /**
     * Get object from pool or create new one
     */
    getPooledObject<T extends fabric.Object>(type: string, factory: () => T): T;
    /**
     * Return object to pool
     */
    returnToPool(type: string, object: fabric.Object): void;
    /**
     * Cache texture with size tracking
     */
    cacheTexture(key: string, texture: any, estimatedSize: number): void;
    /**
     * Get cached texture
     */
    getCachedTexture(key: string): any | null;
    /**
     * Clear all caches and pools
     */
    clearAll(): void;
    /**
     * Set memory limits
     */
    setMemoryLimits(limits: Partial<MemoryLimits>): void;
    /**
     * Destroy memory manager
     */
    destroy(): void;
    /**
     * Initialize object pools for common fabric objects
     */
    private initializeObjectPools;
    /**
     * Start memory monitoring interval
     */
    private startMemoryMonitoring;
    /**
     * Update memory statistics
     */
    private updateMemoryStats;
    /**
     * Estimate canvas memory usage
     */
    private estimateCanvasMemoryUsage;
    /**
     * Estimate memory usage of a fabric object
     */
    private estimateObjectMemory;
    /**
     * Update cache size calculation
     */
    private updateCacheSize;
    /**
     * Check memory thresholds and emit warnings
     */
    private checkMemoryThresholds;
    /**
     * Setup memory hooks for canvas events
     */
    private setupCanvasMemoryHooks;
    /**
     * Handle object removal for memory cleanup
     */
    private handleObjectRemoval;
    /**
     * Cleanup canvas memory when canvas is destroyed
     */
    private cleanupCanvasMemory;
    /**
     * Clean up object pools by removing old unused objects
     */
    private cleanupObjectPools;
    /**
     * Clean up texture cache
     */
    private cleanupTextureCache;
    /**
     * Reset object properties for pool reuse
     */
    private resetObjectForPool;
}
export declare const memoryManager: MemoryManager;
