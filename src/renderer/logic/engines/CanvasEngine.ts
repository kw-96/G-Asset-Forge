import { fabric } from 'fabric';
import { EventEmitter } from '../utils/EventEmitter';

// Canvas configuration options
export interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  preserveObjectStacking?: boolean;
  selection?: boolean;
  renderOnAddRemove?: boolean;
}

// Canvas object interface
export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  properties: Record<string, any>;
}

// Canvas events
export enum CanvasEvent {
  CANVAS_CREATED = 'canvas:created',
  CANVAS_DESTROYED = 'canvas:destroyed',
  CANVAS_RESIZED = 'canvas:resized',
  OBJECT_ADDED = 'object:added',
  OBJECT_REMOVED = 'object:removed',
  OBJECT_MODIFIED = 'object:modified',
  SELECTION_CREATED = 'selection:created',
  SELECTION_CLEARED = 'selection:cleared',
  ZOOM_CHANGED = 'zoom:changed',
  PAN_CHANGED = 'pan:changed',
  PERFORMANCE_UPDATE = 'performance:update'
}

// Performance metrics
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  objectCount: number;
}

// Common game asset size presets
export const GAME_ASSET_PRESETS = {
  // Mobile game common sizes
  MOBILE_PORTRAIT: { width: 1080, height: 1920, name: 'Mobile Portrait (1080x1920)' },
  MOBILE_LANDSCAPE: { width: 1920, height: 1080, name: 'Mobile Landscape (1920x1080)' },
  IPHONE_X: { width: 1125, height: 2436, name: 'iPhone X (1125x2436)' },
  IPHONE_14: { width: 1170, height: 2532, name: 'iPhone 14 (1170x2532)' },
  
  // Tablet sizes
  IPAD: { width: 1536, height: 2048, name: 'iPad (1536x2048)' },
  IPAD_PRO: { width: 2048, height: 2732, name: 'iPad Pro (2048x2732)' },
  
  // Common UI element sizes
  ICON_SMALL: { width: 64, height: 64, name: 'Small Icon (64x64)' },
  ICON_MEDIUM: { width: 128, height: 128, name: 'Medium Icon (128x128)' },
  ICON_LARGE: { width: 256, height: 256, name: 'Large Icon (256x256)' },
  
  // Background sizes
  HD: { width: 1280, height: 720, name: 'HD (1280x720)' },
  FULL_HD: { width: 1920, height: 1080, name: 'Full HD (1920x1080)' },
  QUAD_HD: { width: 2560, height: 1440, name: '2K (2560x1440)' },
  
  // Square formats
  SQUARE_512: { width: 512, height: 512, name: 'Square 512x512' },
  SQUARE_1024: { width: 1024, height: 1024, name: 'Square 1024x1024' },
  
  // Custom aspect ratios
  ASPECT_16_9: { width: 1600, height: 900, name: '16:9 Aspect (1600x900)' },
  ASPECT_4_3: { width: 1024, height: 768, name: '4:3 Aspect (1024x768)' },
  ASPECT_3_2: { width: 1080, height: 720, name: '3:2 Aspect (1080x720)' }
};

export type EventCallback = (...args: any[]) => void;

/**
 * Core Canvas Engine for G-Asset Forge
 * Manages canvas lifecycle, events, and performance optimization
 */
export class CanvasEngine extends EventEmitter {
  private canvases: Map<string, any> = new Map();
  private performanceMonitor: PerformanceMonitor;
  private isDestroyed = false;
  private resizeTimeout?: NodeJS.Timeout;

  constructor() {
    super();
    this.performanceMonitor = new PerformanceMonitor();
    this.setupGlobalEventHandlers();
  }

  /**
   * Create a new canvas instance
   */
  async createCanvas(containerId: string, options: CanvasOptions): Promise<fabric.Canvas> {
    if (this.isDestroyed) {
      throw new Error('CanvasEngine has been destroyed');
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    // Create canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.id = `canvas-${containerId}`;
    container.appendChild(canvasElement);

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasElement, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || '#ffffff',
      preserveObjectStacking: options.preserveObjectStacking !== false,
      selection: options.selection !== false,
      renderOnAddRemove: options.renderOnAddRemove !== false,
      // Performance optimizations
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      skipTargetFind: false,
      perPixelTargetFind: true
    });

    // Store canvas reference
    this.canvases.set(containerId, canvas);

    // Setup canvas event handlers
    this.setupCanvasEventHandlers(canvas, containerId);

    // Start performance monitoring for this canvas
    this.performanceMonitor.startMonitoring(containerId, canvas);

    // Emit canvas created event
    this.emit(CanvasEvent.CANVAS_CREATED, { canvasId: containerId, canvas });

    return canvas;
  }

  /**
   * Destroy a canvas instance
   */
  destroyCanvas(canvasId: string): void {
    const canvas = this.canvases.get(canvasId);
    if (!canvas) {
      console.warn(`Canvas with id "${canvasId}" not found`);
      return;
    }

    // Stop performance monitoring
    this.performanceMonitor.stopMonitoring(canvasId);

    // Clean up canvas
    canvas.dispose();
    this.canvases.delete(canvasId);

    // Remove canvas element from DOM
    const canvasElement = document.getElementById(`canvas-${canvasId}`);
    if (canvasElement) {
      canvasElement.remove();
    }

    // Emit canvas destroyed event
    this.emit(CanvasEvent.CANVAS_DESTROYED, { canvasId });
  }

  /**
   * Resize canvas
   */
  resizeCanvas(canvasId: string, width: number, height: number): void {
    if (this.isDestroyed) {
      throw new Error('CanvasEngine has been destroyed');
    }

    const canvas = this.canvases.get(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    // Validate dimensions
    if (width <= 0 || height <= 0) {
      throw new Error('Canvas dimensions must be positive numbers');
    }

    if (width > 10000 || height > 10000) {
      throw new Error('Canvas dimensions too large (max 10000x10000)');
    }

    try {
      canvas.setDimensions({ width, height });
      canvas.renderAll();
      this.emit(CanvasEvent.CANVAS_RESIZED, { canvasId, width, height });
    } catch (error) {
      console.error('Failed to resize canvas:', error);
      throw new Error(`Failed to resize canvas: ${error}`);
    }
  }

  /**
   * Get canvas instance by ID
   */
  getCanvas(canvasId: string): fabric.Canvas | undefined {
    return this.canvases.get(canvasId);
  }

  /**
   * Get all canvas IDs
   */
  getCanvasIds(): string[] {
    return Array.from(this.canvases.keys());
  }

  /**
   * Add object to canvas
   */
  addObject(canvasId: string, object: any): string {
    if (this.isDestroyed) {
      throw new Error('CanvasEngine has been destroyed');
    }

    const canvas = this.canvases.get(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    if (!object) {
      throw new Error('Object cannot be null or undefined');
    }

    // Generate unique ID for the object
    const objectId = this.generateObjectId();
    (object as any).id = objectId;

    try {
      canvas.add(object);
      canvas.renderAll();
      this.emit(CanvasEvent.OBJECT_ADDED, { canvasId, objectId, object });
      return objectId;
    } catch (error) {
      console.error('Failed to add object to canvas:', error);
      throw new Error(`Failed to add object to canvas: ${error}`);
    }
  }

  /**
   * Remove object from canvas
   */
  removeObject(canvasId: string, objectId: string): void {
    const canvas = this.canvases.get(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    const object = canvas.getObjects().find((obj: any) => obj.id === objectId);
    if (object) {
      canvas.remove(object);
      canvas.renderAll();
      this.emit(CanvasEvent.OBJECT_REMOVED, { canvasId, objectId, object });
    }
  }

  /**
   * Update object properties
   */
  updateObject(canvasId: string, objectId: string, properties: any): void {
    const canvas = this.canvases.get(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    const object = canvas.getObjects().find((obj: any) => obj.id === objectId);
    if (object) {
      object.set(properties);
      canvas.renderAll();
      this.emit(CanvasEvent.OBJECT_MODIFIED, { canvasId, objectId, object, properties });
    }
  }

  /**
   * Get performance metrics for a canvas
   */
  getPerformanceMetrics(canvasId: string): PerformanceMetrics | null {
    return this.performanceMonitor.getMetrics(canvasId);
  }

  /**
   * Get all performance metrics
   */
  getAllPerformanceMetrics(): Map<string, PerformanceMetrics> {
    return this.performanceMonitor.getAllMetrics();
  }

  /**
   * Destroy the entire canvas engine
   */
  destroy(): void {
    if (this.isDestroyed) return;

    // Destroy all canvases
    for (const canvasId of this.canvases.keys()) {
      this.destroyCanvas(canvasId);
    }

    // Stop performance monitoring
    this.performanceMonitor.destroy();

    // Remove all event listeners
    this.removeAllListeners();

    this.isDestroyed = true;
  }

  /**
   * Setup canvas-specific event handlers
   */
  private setupCanvasEventHandlers(canvas: any, canvasId: string): void {
    // Object events
    canvas.on('object:added', (e: any) => {
      this.emit(CanvasEvent.OBJECT_ADDED, { canvasId, object: e.target });
    });

    canvas.on('object:removed', (e: any) => {
      this.emit(CanvasEvent.OBJECT_REMOVED, { canvasId, object: e.target });
    });

    canvas.on('object:modified', (e: any) => {
      this.emit(CanvasEvent.OBJECT_MODIFIED, { canvasId, object: e.target });
    });

    // Selection events
    canvas.on('selection:created', (e: any) => {
      this.emit(CanvasEvent.SELECTION_CREATED, { canvasId, selection: e.selected });
    });

    canvas.on('selection:cleared', () => {
      this.emit(CanvasEvent.SELECTION_CLEARED, { canvasId });
    });
  }

  /**
   * Setup global event handlers
   */
  private setupGlobalEventHandlers(): void {
    // Handle window resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));

    // Handle memory warnings
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 5000); // Check every 5 seconds
    }
  }

  /**
   * Handle window resize event
   */
  private handleWindowResize(): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.canvases.forEach((canvas) => {
        canvas.calcOffset();
        canvas.renderAll();
      });
    }, 100);
  }

  /**
   * Check memory usage and emit warnings if needed
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
      const memoryLimit = memoryInfo.jsHeapSizeLimit / (1024 * 1024); // MB
      
      // Dynamic threshold based on available memory
      const warningThreshold = Math.min(100, memoryLimit * 0.7);
      const criticalThreshold = Math.min(200, memoryLimit * 0.9);
      
      if (memoryUsage > criticalThreshold) {
        console.error(`Critical memory usage detected: ${memoryUsage.toFixed(2)}MB / ${memoryLimit.toFixed(2)}MB`);
        this.emit('memory:critical', { usage: memoryUsage, limit: memoryLimit });
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      } else if (memoryUsage > warningThreshold) {
        console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB / ${memoryLimit.toFixed(2)}MB`);
        this.emit('memory:warning', { usage: memoryUsage, limit: memoryLimit });
      }
    }
  }

  /**
   * Generate unique object ID
   */
  private generateObjectId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private frameCounters: Map<string, { count: number; lastTime: number }> = new Map();

  startMonitoring(canvasId: string, canvas: any): void {
    // Initialize metrics
    this.metrics.set(canvasId, {
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      objectCount: 0
    });

    // Initialize frame counter
    this.frameCounters.set(canvasId, { count: 0, lastTime: performance.now() });

    // Start monitoring interval
    const interval = setInterval(() => {
      this.updateMetrics(canvasId, canvas);
    }, 1000); // Update every second

    this.monitoringIntervals.set(canvasId, interval);

    // Hook into canvas render events for FPS calculation
    const originalRenderAll = canvas.renderAll.bind(canvas);
    canvas.renderAll = () => {
      const startTime = performance.now();
      const result = originalRenderAll();
      const endTime = performance.now();

      // Update frame counter
      const frameCounter = this.frameCounters.get(canvasId);
      if (frameCounter) {
        frameCounter.count++;
        const currentMetrics = this.metrics.get(canvasId);
        if (currentMetrics) {
          currentMetrics.renderTime = endTime - startTime;
        }
      }

      return result;
    };
  }

  stopMonitoring(canvasId: string): void {
    const interval = this.monitoringIntervals.get(canvasId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(canvasId);
    }

    this.metrics.delete(canvasId);
    this.frameCounters.delete(canvasId);
  }

  getMetrics(canvasId: string): PerformanceMetrics | null {
    return this.metrics.get(canvasId) || null;
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  destroy(): void {
    // Clear all intervals
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();
    this.metrics.clear();
    this.frameCounters.clear();
  }

  private updateMetrics(canvasId: string, canvas: any): void {
    const metrics = this.metrics.get(canvasId);
    const frameCounter = this.frameCounters.get(canvasId);
    
    if (!metrics || !frameCounter) return;

    const currentTime = performance.now();
    const timeDiff = currentTime - frameCounter.lastTime;

    // Calculate FPS
    if (timeDiff >= 1000) {
      metrics.fps = Math.round((frameCounter.count * 1000) / timeDiff);
      frameCounter.count = 0;
      frameCounter.lastTime = currentTime;
    }

    // Update object count
    metrics.objectCount = canvas.getObjects().length;

    // Update memory usage if available
    if ('memory' in performance && (performance as any).memory) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  }
}

// Export singleton instance
export const canvasEngine = new CanvasEngine();