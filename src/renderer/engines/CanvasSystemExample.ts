import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';
import { ViewControl } from './ViewControl';
import { CanvasHealthChecker } from './CanvasHealthChecker';
import { fabric } from 'fabric';

/**
 * Canvas System Usage Example
 * Demonstrates how to properly initialize and use the canvas system
 */
export class CanvasSystemExample {
  private canvasEngine: CanvasEngine;
  private memoryManager: MemoryManager;
  private viewControl: ViewControl | null = null;
  private healthChecker: CanvasHealthChecker;
  private canvas: fabric.Canvas | null = null;

  constructor() {
    // Initialize canvas engine
    this.canvasEngine = new CanvasEngine();

    // Initialize memory manager with appropriate limits
    this.memoryManager = new MemoryManager({
      maxCanvasMemory: 100, // 100MB per canvas
      maxTotalMemory: 500,  // 500MB total
      warningThreshold: 80, // Warning at 80MB
      criticalThreshold: 120, // Critical at 120MB
      gcThreshold: 150 // Force GC at 150MB
    });

    // Initialize health checker
    this.healthChecker = new CanvasHealthChecker(this.canvasEngine, this.memoryManager);

    this.setupEventHandlers();
  }

  /**
   * Initialize the canvas system
   */
  async initialize(containerId: string): Promise<void> {
    try {
      // Create canvas with game asset preset
      this.canvas = await this.canvasEngine.createCanvas(containerId, {
        width: 1920,
        height: 1080,
        backgroundColor: '#f0f0f0',
        preserveObjectStacking: true,
        selection: true
      });

      // Get container element for view control
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }

      // Initialize view control
      this.viewControl = new ViewControl(this.canvas, container, {
        minZoom: 0.1,
        maxZoom: 5.0,
        zoomStep: 0.1,
        panSensitivity: 1.0,
        smoothPanning: true,
        constrainPan: true
      });

      // Register canvas with memory manager
      this.memoryManager.registerCanvas(containerId, this.canvas);

      // Start health monitoring
      this.healthChecker.startMonitoring(5000); // Check every 5 seconds

      console.log('Canvas system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize canvas system:', error);
      throw error;
    }
  }

  /**
   * Add a text object to the canvas
   */
  addText(text: string, x: number = 100, y: number = 100): string | null {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return null;
    }

    const textObject = new fabric.Text(text, {
      left: x,
      top: y,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#333333'
    });

    return this.canvasEngine.addObject('canvas-container', textObject);
  }

  /**
   * Add a rectangle to the canvas
   */
  addRectangle(x: number = 200, y: number = 200, width: number = 100, height: number = 100): string | null {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return null;
    }

    const rectangle = new fabric.Rect({
      left: x,
      top: y,
      width: width,
      height: height,
      fill: '#ff6b6b',
      stroke: '#333333',
      strokeWidth: 2
    });

    return this.canvasEngine.addObject('canvas-container', rectangle);
  }

  /**
   * Add an image to the canvas
   */
  async addImage(imageUrl: string, x: number = 300, y: number = 300): Promise<string | null> {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return null;
    }

    return new Promise((resolve) => {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (img) {
          img.set({
            left: x,
            top: y,
            scaleX: 0.5,
            scaleY: 0.5
          });

          const objectId = this.canvasEngine.addObject('canvas-container', img);
          resolve(objectId);
        } else {
          console.error('Failed to load image:', imageUrl);
          resolve(null);
        }
      });
    });
  }

  /**
   * Zoom operations
   */
  zoomIn(): void {
    this.viewControl?.zoomIn();
  }

  zoomOut(): void {
    this.viewControl?.zoomOut();
  }

  fitToScreen(): void {
    this.viewControl?.fitToScreen();
  }

  resetView(): void {
    this.viewControl?.resetView();
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<any> {
    return await this.healthChecker.performHealthCheck();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    return this.canvasEngine.getPerformanceMetrics('canvas-container');
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): any {
    return this.memoryManager.getMemoryStats();
  }

  /**
   * Export canvas as image
   */
  exportAsImage(format: 'png' | 'jpeg' = 'png', quality: number = 1.0): string | null {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return null;
    }

    return this.canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: 1
    });
  }

  /**
   * Save canvas state
   */
  saveCanvasState(): string | null {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return null;
    }

    return JSON.stringify(this.canvas.toJSON());
  }

  /**
   * Load canvas state
   */
  async loadCanvasState(jsonState: string): Promise<void> {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      this.canvas!.loadFromJSON(jsonState, () => {
        this.canvas!.renderAll();
        console.log('Canvas state loaded successfully');
        resolve();
      }, (error: any) => {
        console.error('Failed to load canvas state:', error);
        reject(error);
      });
    });
  }

  /**
   * Clear canvas
   */
  clearCanvas(): void {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return;
    }

    this.canvas.clear();
    this.canvas.renderAll();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Canvas engine events
    this.canvasEngine.on('canvas:created', (event) => {
      console.log('Canvas created:', event.canvasId);
    });

    this.canvasEngine.on('object:added', (event) => {
      console.log('Object added to canvas:', event.canvasId);
    });

    this.canvasEngine.on('memory:warning', (event) => {
      console.warn('Memory warning:', event.usage, 'MB');
    });

    // Memory manager events
    this.memoryManager.on('memory:warning', (stats) => {
      console.warn('Memory usage warning:', stats);
    });

    this.memoryManager.on('memory:critical', (stats) => {
      console.error('Critical memory usage:', stats);
    });

    // Health checker events
    this.healthChecker.on('health:degraded', (event) => {
      console.warn('System health degraded:', event);
    });

    this.healthChecker.on('health:recovered', (event) => {
      console.log('System health recovered:', event);
    });
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    // Stop health monitoring
    this.healthChecker.destroy();

    // Destroy view control
    this.viewControl?.destroy();

    // Unregister canvas from memory manager
    if (this.canvas) {
      this.memoryManager.unregisterCanvas('canvas-container');
    }

    // Destroy canvas engine
    this.canvasEngine.destroy();

    // Destroy memory manager
    this.memoryManager.destroy();

    console.log('Canvas system destroyed');
  }
}

// Usage example
export async function initializeCanvasSystem(): Promise<CanvasSystemExample> {
  const canvasSystem = new CanvasSystemExample();
  
  try {
    await canvasSystem.initialize('canvas-container');
    
    // Add some sample content
    canvasSystem.addText('Hello, Canvas!', 50, 50);
    canvasSystem.addRectangle(200, 100, 150, 100);
    
    // Monitor system health
    const health = await canvasSystem.getSystemHealth();
    console.log('Initial system health:', health);
    
    return canvasSystem;
  } catch (error) {
    console.error('Failed to initialize canvas system:', error);
    canvasSystem.destroy();
    throw error;
  }
}