// @ts-nocheck
import { fabric } from 'fabric';
import { EventEmitter } from '../utils/EventEmitter';

// Memory thresholds and limits
export interface MemoryLimits {
  maxCanvasMemory: number; // MB
  maxTotalMemory: number; // MB
  warningThreshold: number; // MB
  criticalThreshold: number; // MB
  gcThreshold: number; // MB
}

// Memory usage statistics
export interface MemoryStats {
  canvasMemory: number; // MB
  totalMemory: number; // MB
  objectCount: number;
  textureCount: number;
  cacheSize: number; // MB
  lastGC: Date | null;
}

// Object pool for reusing fabric objects
interface PooledObject {
  object: any;
  lastUsed: number;
  inUse: boolean;
}

// Memory events
export enum MemoryEvent {
  MEMORY_WARNING = 'memory:warning',
  MEMORY_CRITICAL = 'memory:critical',
  GARBAGE_COLLECTED = 'memory:gc',
  OBJECT_POOLED = 'memory:pooled',
  CACHE_CLEARED = 'memory:cache-cleared'
}

/**
 * Memory Manager for Canvas Operations
 * Handles memory monitoring, object pooling, and garbage collection
 */
export class MemoryManager extends EventEmitter {
  private limits: MemoryLimits;
  private stats: MemoryStats;
  private objectPools: Map<string, PooledObject[]> = new Map();
  private textureCache: Map<string, { texture: any; size: number; lastUsed: number }> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private canvases: Map<string, any> = new Map();

  // Performance optimization flags
  private isOptimizing = false;
  private lastOptimization = 0;

  constructor(limits?: Partial<MemoryLimits>) {
    super();
    
    this.limits = {
      maxCanvasMemory: 100, // 100MB per canvas
      maxTotalMemory: 500, // 500MB total
      warningThreshold: 80, // 80MB warning
      criticalThreshold: 120, // 120MB critical
      gcThreshold: 150, // 150MB trigger GC
      ...limits
    };

    this.stats = {
      canvasMemory: 0,
      totalMemory: 0,
      objectCount: 0,
      textureCount: 0,
      cacheSize: 0,
      lastGC: null
    };

    this.initializeObjectPools();
    this.startMemoryMonitoring();
  }

  /**
   * Register a canvas for memory monitoring
   */
  registerCanvas(canvasId: string, canvas: any): void {
    this.canvases.set(canvasId, canvas);
    this.setupCanvasMemoryHooks(canvas);
  }

  /**
   * Unregister a canvas from memory monitoring
   */
  unregisterCanvas(canvasId: string): void {
    const canvas = this.canvases.get(canvasId);
    if (canvas) {
      this.cleanupCanvasMemory(canvas);
      this.canvases.delete(canvasId);
    }
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats {
    this.updateMemoryStats();
    return { ...this.stats };
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): void {
    if (this.isOptimizing) return;
    
    this.isOptimizing = true;
    
    try {
      // Clear unused objects from pools
      this.cleanupObjectPools();
      
      // Clear old texture cache entries
      this.cleanupTextureCache();
      
      // Force browser GC if available (Chrome DevTools)
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
      
      // Update stats
      this.updateMemoryStats();
      this.stats.lastGC = new Date();
      
      this.emit(MemoryEvent.GARBAGE_COLLECTED, this.stats);
      
    } finally {
      this.isOptimizing = false;
      this.lastOptimization = Date.now();
    }
  }

  /**
   * Get object from pool or create new one
   */
  getPooledObject<T extends any>(type: string, factory: () => T): T {
    const pool = this.objectPools.get(type) || [];
    
    // Find available object in pool
    const pooledItem = pool.find(item => !item.inUse);
    
    if (pooledItem) {
      pooledItem.inUse = true;
      pooledItem.lastUsed = Date.now();
      this.emit(MemoryEvent.OBJECT_POOLED, { type, fromPool: true });
      return pooledItem.object as T;
    }
    
    // Create new object if pool is empty
    const newObject = factory();
    pool.push({
      object: newObject,
      lastUsed: Date.now(),
      inUse: true
    });
    
    this.objectPools.set(type, pool);
    this.emit(MemoryEvent.OBJECT_POOLED, { type, fromPool: false });
    
    return newObject;
  }

  /**
   * Return object to pool
   */
  returnToPool(type: string, object: any): void {
    const pool = this.objectPools.get(type);
    if (!pool) return;
    
    const pooledItem = pool.find(item => item.object === object);
    if (pooledItem) {
      pooledItem.inUse = false;
      pooledItem.lastUsed = Date.now();
      
      // Reset object properties for reuse
      this.resetObjectForPool(object);
    }
  }

  /**
   * Cache texture with size tracking
   */
  cacheTexture(key: string, texture: any, estimatedSize: number): void {
    // Check if we need to clear cache first
    if (this.stats.cacheSize + estimatedSize > this.limits.maxCanvasMemory * 0.3) {
      this.cleanupTextureCache(true);
    }
    
    this.textureCache.set(key, {
      texture,
      size: estimatedSize,
      lastUsed: Date.now()
    });
    
    this.updateCacheSize();
  }

  /**
   * Get cached texture
   */
  getCachedTexture(key: string): any | null {
    const cached = this.textureCache.get(key);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.texture;
    }
    return null;
  }

  /**
   * Clear all caches and pools
   */
  clearAll(): void {
    this.objectPools.clear();
    this.textureCache.clear();
    this.stats.cacheSize = 0;
    this.emit(MemoryEvent.CACHE_CLEARED);
  }

  /**
   * Set memory limits
   */
  setMemoryLimits(limits: Partial<MemoryLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  /**
   * Destroy memory manager
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.clearAll();
    this.canvases.clear();
    this.removeAllListeners();
  }

  /**
   * Initialize object pools for common fabric objects
   */
  private initializeObjectPools(): void {
    const commonTypes = ['rect', 'circle', 'text', 'image', 'line', 'polygon'];
    commonTypes.forEach(type => {
      this.objectPools.set(type, []);
    });
  }

  /**
   * Start memory monitoring interval
   */
  private startMemoryMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMemoryStats();
      this.checkMemoryThresholds();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Update memory statistics
   */
  private updateMemoryStats(): void {
    // Update object count
    this.stats.objectCount = 0;
    this.canvases.forEach(canvas => {
      this.stats.objectCount += canvas.getObjects().length;
    });

    // Update texture count
    this.stats.textureCount = this.textureCache.size;

    // Update memory usage if available
    if ('memory' in performance && (performance as any).memory) {
      this.stats.totalMemory = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }

    // Estimate canvas memory usage
    this.stats.canvasMemory = this.estimateCanvasMemoryUsage();
    
    // Update cache size
    this.updateCacheSize();
  }

  /**
   * Estimate canvas memory usage
   */
  private estimateCanvasMemoryUsage(): number {
    let totalMemory = 0;
    
    this.canvases.forEach(canvas => {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        // Estimate memory based on object type and properties
        totalMemory += this.estimateObjectMemory(obj);
      });
      
      // Add canvas buffer memory
      const canvasSize = canvas.getWidth() * canvas.getHeight() * 4; // RGBA
      totalMemory += canvasSize / (1024 * 1024); // Convert to MB
    });
    
    return totalMemory;
  }

  /**
   * Estimate memory usage of a fabric object
   */
  private estimateObjectMemory(obj: any): number {
    let memory = 0.01; // Base object memory (10KB)
    
    if (obj.type === 'image') {
      const img = obj as any;
      if (img.width && img.height) {
        memory += (img.width * img.height * 4) / (1024 * 1024); // RGBA
      }
    } else if (obj.type === 'text') {
      const text = obj as any;
      memory += (text.text?.length || 0) * 0.001; // Rough estimate
    } else if (obj.type === 'path') {
      const path = obj as any;
      memory += (path.path?.length || 0) * 0.0001; // Path data
    }
    
    return memory;
  }

  /**
   * Update cache size calculation
   */
  private updateCacheSize(): void {
    this.stats.cacheSize = 0;
    this.textureCache.forEach(cached => {
      this.stats.cacheSize += cached.size / (1024 * 1024); // Convert to MB
    });
  }

  /**
   * Check memory thresholds and emit warnings
   */
  private checkMemoryThresholds(): void {
    const { canvasMemory, totalMemory } = this.stats;
    
    if (canvasMemory > this.limits.criticalThreshold || totalMemory > this.limits.criticalThreshold) {
      this.emit(MemoryEvent.MEMORY_CRITICAL, this.stats);
      
      // Auto-cleanup on critical memory
      if (Date.now() - this.lastOptimization > 5000) { // Don't optimize too frequently
        this.forceGarbageCollection();
      }
    } else if (canvasMemory > this.limits.warningThreshold || totalMemory > this.limits.warningThreshold) {
      this.emit(MemoryEvent.MEMORY_WARNING, this.stats);
    }
    
    // Trigger GC if over threshold
    if (totalMemory > this.limits.gcThreshold) {
      this.forceGarbageCollection();
    }
  }

  /**
   * Setup memory hooks for canvas events
   */
  private setupCanvasMemoryHooks(canvas: any): void {
    // Hook into object addition
    canvas.on('object:added', () => {
      this.updateMemoryStats();
    });
    
    // Hook into object removal
    canvas.on('object:removed', (e) => {
      if (e.target) {
        this.handleObjectRemoval(e.target);
      }
      this.updateMemoryStats();
    });
    
    // Hook into canvas clearing
    canvas.on('canvas:cleared', () => {
      this.updateMemoryStats();
    });
  }

  /**
   * Handle object removal for memory cleanup
   */
  private handleObjectRemoval(obj: any): void {
    // Return object to pool if applicable
    const objectType = obj.type || 'unknown';
    if (objectType !== 'unknown' && this.objectPools.has(objectType)) {
      this.returnToPool(objectType, obj);
    }
    
    // Clear any cached textures related to this object
    if (obj.type === 'image') {
      const img = obj as any;
      const src = (img as any).getSrc ? (img as any).getSrc() : undefined;
      if (src) {
        this.textureCache.delete(src);
      }
    }
  }

  /**
   * Cleanup canvas memory when canvas is destroyed
   */
  private cleanupCanvasMemory(canvas: any): void {
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      this.handleObjectRemoval(obj);
    });
  }

  /**
   * Clean up object pools by removing old unused objects
   */
  private cleanupObjectPools(): void {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    this.objectPools.forEach((pool, type) => {
      const cleaned = pool.filter(item => {
        if (!item.inUse && (now - item.lastUsed) > maxAge) {
          return false; // Remove old unused objects
        }
        return true;
      });
      
      this.objectPools.set(type, cleaned);
    });
  }

  /**
   * Clean up texture cache
   */
  private cleanupTextureCache(aggressive = false): void {
    const maxAge = aggressive ? 2 * 60 * 1000 : 10 * 60 * 1000; // 2 or 10 minutes
    const now = Date.now();
    
    const toDelete: string[] = [];
    this.textureCache.forEach((cached, key) => {
      if ((now - cached.lastUsed) > maxAge) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => {
      this.textureCache.delete(key);
    });
    
    this.updateCacheSize();
  }

  /**
   * Reset object properties for pool reuse
   */
  private resetObjectForPool(obj: any): void {
    obj.set({
      left: 0,
      top: 0,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      selectable: true,
      evented: true
    });
    
    // Type-specific resets
    if (obj.type === 'text') {
      (obj as any).set({ text: '' });
    } else if (obj.type === 'image') {
      const img = obj as any;
      if ((img as any).setSrc) {
        (img as unknown).setSrc('', () => {});
      }
    }
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();