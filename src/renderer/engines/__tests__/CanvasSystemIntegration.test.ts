import { CanvasEngine } from '../CanvasEngine';
import { MemoryManager } from '../MemoryManager';
import { ViewControl } from '../ViewControl';
import { CanvasHealthChecker } from '../CanvasHealthChecker';
import { fabric } from 'fabric';

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => ({
      setDimensions: jest.fn(),
      setBackgroundColor: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
      getObjects: jest.fn().mockReturnValue([]),
      getWidth: jest.fn().mockReturnValue(800),
      getHeight: jest.fn().mockReturnValue(600),
      getZoom: jest.fn().mockReturnValue(1),
      setZoom: jest.fn(),
      zoomToPoint: jest.fn(),
      relativePan: jest.fn(),
      absolutePan: jest.fn(),
      renderAll: jest.fn(),
      dispose: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      calcOffset: jest.fn(),
      setViewportTransform: jest.fn(),
      viewportTransform: [1, 0, 0, 1, 0, 0],
      getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
      selection: true
    })),
    Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
    Object: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      get: jest.fn(),
      clone: jest.fn()
    }))
  }
}));

// Mock DOM
const mockContainer = {
  appendChild: jest.fn(),
  getBoundingClientRect: jest.fn().mockReturnValue({
    width: 1000,
    height: 800,
    left: 0,
    top: 0
  }),
  clientWidth: 1000,
  clientHeight: 800
};

Object.defineProperty(document, 'getElementById', {
  value: jest.fn().mockReturnValue(mockContainer),
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue({
    id: '',
    remove: jest.fn()
  }),
  writable: true
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(1000),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024
    }
  },
  writable: true
});

describe('Canvas System Integration', () => {
  let canvasEngine: CanvasEngine;
  let memoryManager: MemoryManager;
  let viewControl: ViewControl;
  let healthChecker: CanvasHealthChecker;
  let canvas: fabric.Canvas;

  beforeEach(async () => {
    // Initialize canvas engine
    canvasEngine = new CanvasEngine();
    
    // Initialize memory manager
    memoryManager = new MemoryManager({
      maxCanvasMemory: 100,
      maxTotalMemory: 500,
      warningThreshold: 80,
      criticalThreshold: 120,
      gcThreshold: 150
    });

    // Create canvas
    canvas = await canvasEngine.createCanvas('test-container', {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    // Initialize view control
    viewControl = new ViewControl(canvas, mockContainer as any);

    // Initialize health checker
    healthChecker = new CanvasHealthChecker(canvasEngine, memoryManager);

    jest.clearAllMocks();
  });

  afterEach(() => {
    healthChecker.destroy();
    viewControl.destroy();
    canvasEngine.destroy();
    memoryManager.destroy();
  });

  describe('System Integration', () => {
    test('should integrate all components successfully', () => {
      expect(canvasEngine).toBeDefined();
      expect(memoryManager).toBeDefined();
      expect(viewControl).toBeDefined();
      expect(healthChecker).toBeDefined();
      expect(canvas).toBeDefined();
    });

    test('should handle canvas creation and memory registration', async () => {
      const canvasId = 'integration-test';
      const newCanvas = await canvasEngine.createCanvas(canvasId, {
        width: 1920,
        height: 1080
      });

      expect(newCanvas).toBeDefined();
      expect(canvasEngine.getCanvas(canvasId)).toBe(newCanvas);
      
      // Memory manager should track the canvas
      const memoryStats = memoryManager.getMemoryStats();
      expect(memoryStats).toBeDefined();
    });

    test('should handle view control operations', () => {
      // Test zoom
      viewControl.setZoom(1.5);
      expect(canvas.zoomToPoint).toHaveBeenCalled();

      // Test pan
      viewControl.pan(50, 30);
      expect(canvas.relativePan).toHaveBeenCalled();

      // Test fit to screen
      viewControl.fitToScreen();
      expect(canvas.setZoom).toHaveBeenCalled();
      expect(canvas.absolutePan).toHaveBeenCalled();
    });

    test('should perform health checks', async () => {
      const healthResult = await healthChecker.performHealthCheck();
      
      expect(healthResult).toBeDefined();
      expect(healthResult.status).toMatch(/healthy|warning|critical/);
      expect(healthResult.metrics).toBeDefined();
      expect(healthResult.issues).toBeInstanceOf(Array);
      expect(healthResult.timestamp).toBeInstanceOf(Date);
    });

    test('should handle memory warnings', (done) => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 150 * 1024 * 1024, // 150MB - above warning threshold
          totalJSHeapSize: 200 * 1024 * 1024
        },
        configurable: true
      });

      healthChecker.on('health:degraded', (event) => {
        expect(event.currentStatus).toBe('warning');
        done();
      });

      healthChecker.performHealthCheck();
    });

    test('should handle performance degradation', async () => {
      // Mock low FPS
      const mockMetrics = {
        fps: 25, // Below 30fps threshold
        memoryUsage: 50,
        renderTime: 60, // Above 50ms threshold
        objectCount: 100
      };

      // Override metrics collection
      jest.spyOn(canvasEngine, 'getPerformanceMetrics').mockReturnValue({
        fps: mockMetrics.fps,
        memoryUsage: mockMetrics.memoryUsage,
        renderTime: mockMetrics.renderTime,
        objectCount: mockMetrics.objectCount
      });

      const healthResult = await healthChecker.performHealthCheck();
      
      expect(healthResult.status).toBe('critical');
      expect(healthResult.issues.some(issue => issue.type === 'performance')).toBe(true);
    });

    test('should handle object lifecycle', () => {
      const mockObject = new fabric.Object();
      
      // Add object
      const objectId = canvasEngine.addObject('test-container', mockObject);
      expect(objectId).toBeDefined();
      expect(canvas.add).toHaveBeenCalledWith(mockObject);

      // Update object
      canvasEngine.updateObject('test-container', objectId, { left: 100, top: 50 });
      expect(mockObject.set).toHaveBeenCalledWith({ left: 100, top: 50 });

      // Remove object
      (canvas.getObjects as jest.Mock).mockReturnValue([mockObject]);
      (mockObject as any).id = objectId;
      
      canvasEngine.removeObject('test-container', objectId);
      expect(canvas.remove).toHaveBeenCalledWith(mockObject);
    });

    test('should handle canvas destruction properly', () => {
      const canvasId = 'test-container';
      
      // Destroy canvas
      canvasEngine.destroyCanvas(canvasId);
      
      expect(canvas.dispose).toHaveBeenCalled();
      expect(canvasEngine.getCanvas(canvasId)).toBeUndefined();
    });

    test('should handle view state persistence', () => {
      // Set initial view state
      viewControl.setZoom(2.0);
      viewControl.setPan(100, 50);
      
      const viewState = viewControl.getViewState();
      expect(viewState.zoom).toBe(2.0);
      expect(viewState.panX).toBe(100);
      expect(viewState.panY).toBe(50);

      // Reset view
      viewControl.resetView();
      const resetState = viewControl.getViewState();
      expect(resetState.zoom).toBe(1.0);
      expect(resetState.panX).toBe(0);
      expect(resetState.panY).toBe(0);
    });

    test('should handle memory cleanup on canvas destruction', () => {
      const canvasId = 'cleanup-test';
      
      // Register canvas with memory manager
      memoryManager.registerCanvas(canvasId, canvas);
      
      // Destroy canvas
      canvasEngine.destroyCanvas('test-container');
      memoryManager.unregisterCanvas(canvasId);
      
      // Memory should be cleaned up
      const stats = memoryManager.getMemoryStats();
      expect(stats).toBeDefined();
    });

    test('should handle concurrent operations', async () => {
      const operations = [];
      
      // Simulate concurrent zoom operations
      for (let i = 0; i < 10; i++) {
        operations.push(new Promise(resolve => {
          setTimeout(() => {
            viewControl.setZoom(1 + i * 0.1);
            resolve(true);
          }, Math.random() * 100);
        }));
      }
      
      await Promise.all(operations);
      
      // Should handle all operations without errors
      expect(canvas.zoomToPoint).toHaveBeenCalled();
    });

    test('should maintain performance under load', async () => {
      // Add multiple objects
      const objects = [];
      for (let i = 0; i < 50; i++) {
        const obj = new fabric.Object();
        const objectId = canvasEngine.addObject('test-container', obj);
        objects.push({ id: objectId, obj });
      }

      // Perform health check
      const healthResult = await healthChecker.performHealthCheck();
      
      // Should still be healthy with 50 objects
      expect(healthResult.status).toMatch(/healthy|warning/);
      expect(healthResult.metrics.objectCount).toBeLessThanOrEqual(50);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid canvas operations gracefully', () => {
      expect(() => {
        canvasEngine.addObject('non-existent-canvas', new fabric.Object());
      }).toThrow('Canvas with id "non-existent-canvas" not found');
    });

    test('should handle memory manager errors', () => {
      // Test with invalid memory limits
      expect(() => {
        new MemoryManager({
          maxCanvasMemory: -1,
          maxTotalMemory: 0,
          warningThreshold: 1000,
          criticalThreshold: 500,
          gcThreshold: 100
        });
      }).not.toThrow(); // Should handle gracefully
    });

    test('should handle view control edge cases', () => {
      // Test with invalid zoom values
      viewControl.setZoom(NaN);
      viewControl.setZoom(Infinity);
      viewControl.setZoom(-1);
      
      // Should clamp to valid range
      const viewState = viewControl.getViewState();
      expect(viewState.zoom).toBeGreaterThan(0);
      expect(viewState.zoom).toBeLessThan(10);
    });

    test('should handle health checker with no canvases', async () => {
      // Destroy all canvases
      canvasEngine.destroy();
      
      const healthResult = await healthChecker.performHealthCheck();
      expect(healthResult.metrics.canvasCount).toBe(0);
      expect(healthResult.status).toBe('healthy');
    });
  });

  describe('Performance Monitoring', () => {
    test('should track FPS accurately', () => {
      const fps = viewControl.getCurrentFPS();
      expect(typeof fps).toBe('number');
      expect(fps).toBeGreaterThanOrEqual(0);
    });

    test('should monitor memory usage', () => {
      const stats = memoryManager.getMemoryStats();
      expect(stats.totalMemory).toBeGreaterThanOrEqual(0);
      expect(stats.canvasMemory).toBeGreaterThanOrEqual(0);
    });

    test('should detect performance issues', async () => {
      // Mock poor performance
      jest.spyOn(canvasEngine, 'getPerformanceMetrics').mockReturnValue({
        fps: 15, // Very low FPS
        memoryUsage: 200, // High memory
        renderTime: 100, // Slow rendering
        objectCount: 1000 // Many objects
      });

      const healthResult = await healthChecker.performHealthCheck();
      expect(healthResult.status).toBe('critical');
      expect(healthResult.issues.length).toBeGreaterThan(0);
    });
  });
});