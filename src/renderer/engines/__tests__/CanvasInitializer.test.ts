import { CanvasInitializer, canvasInitializer } from '../CanvasInitializer';
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
      selection: true,
      getElement: jest.fn().mockReturnValue({
        style: {},
        id: 'mock-canvas-element'
      }),
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      skipTargetFind: false,
      perPixelTargetFind: true,
      renderOnAddRemove: true,
      stateful: true
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
  clientHeight: 800,
  id: ''
};

Object.defineProperty(document, 'getElementById', {
  value: jest.fn().mockReturnValue(mockContainer),
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue({
    id: '',
    remove: jest.fn(),
    style: {}
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

describe('CanvasInitializer', () => {
  let initializer: CanvasInitializer;

  beforeEach(() => {
    initializer = CanvasInitializer.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up all canvas systems
    initializer.destroyAllCanvasSystems();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = CanvasInitializer.getInstance();
      const instance2 = CanvasInitializer.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should use exported singleton', () => {
      expect(canvasInitializer).toBe(CanvasInitializer.getInstance());
    });
  });

  describe('Canvas System Initialization', () => {
    test('should initialize canvas system successfully', async () => {
      const containerId = 'test-container';
      const options = {
        containerId,
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      };

      const system = await initializer.initializeCanvasSystem(options);

      expect(system).toBeDefined();
      expect(system.canvas).toBeDefined();
      expect(system.canvasEngine).toBeDefined();
      expect(system.memoryManager).toBeDefined();
      expect(system.viewControl).toBeDefined();
      expect(system.healthChecker).toBeDefined();
      expect(system.container).toBeDefined();
    });

    test('should throw error if container not found', async () => {
      (document.getElementById as jest.Mock).mockReturnValue(null);

      const options = {
        containerId: 'non-existent-container',
        width: 800,
        height: 600
      };

      await expect(initializer.initializeCanvasSystem(options)).rejects.toThrow(
        'Container with id "non-existent-container" not found'
      );
    });

    test('should not initialize same container twice', async () => {
      const containerId = 'duplicate-container';
      const options = {
        containerId,
        width: 800,
        height: 600
      };

      const system1 = await initializer.initializeCanvasSystem(options);
      const system2 = await initializer.initializeCanvasSystem(options);

      expect(system1).toBe(system2);
    });

    test('should initialize with custom options', async () => {
      const containerId = 'custom-container';
      const options = {
        containerId,
        width: 1920,
        height: 1080,
        backgroundColor: '#f0f0f0',
        enablePerformanceMonitoring: false,
        enableHealthChecking: false,
        memoryLimits: {
          maxCanvasMemory: 200,
          maxTotalMemory: 1000,
          warningThreshold: 150,
          criticalThreshold: 250,
          gcThreshold: 300
        },
        viewControlOptions: {
          minZoom: 0.05,
          maxZoom: 10.0,
          zoomStep: 0.2,
          panSensitivity: 2.0,
          smoothPanning: false,
          constrainPan: false
        }
      };

      const system = await initializer.initializeCanvasSystem(options);

      expect(system).toBeDefined();
      expect(fabric.Canvas).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          width: 1920,
          height: 1080,
          backgroundColor: '#f0f0f0'
        })
      );
    });
  });

  describe('Canvas System Management', () => {
    test('should get initialized canvas system', async () => {
      const containerId = 'get-test-container';
      const options = {
        containerId,
        width: 800,
        height: 600
      };

      await initializer.initializeCanvasSystem(options);
      const system = initializer.getCanvasSystem(containerId);

      expect(system).toBeDefined();
      expect(system!.canvas).toBeDefined();
    });

    test('should return null for non-existent system', () => {
      const system = initializer.getCanvasSystem('non-existent');
      expect(system).toBeNull();
    });

    test('should destroy canvas system', async () => {
      const containerId = 'destroy-test-container';
      const options = {
        containerId,
        width: 800,
        height: 600
      };

      const system = await initializer.initializeCanvasSystem(options);
      expect(system).toBeDefined();

      initializer.destroyCanvasSystem(containerId);
      const destroyedSystem = initializer.getCanvasSystem(containerId);
      expect(destroyedSystem).toBeNull();
    });

    test('should handle destroying non-existent system gracefully', () => {
      expect(() => {
        initializer.destroyCanvasSystem('non-existent');
      }).not.toThrow();
    });

    test('should destroy all canvas systems', async () => {
      const containers = ['container1', 'container2', 'container3'];
      
      // Initialize multiple systems
      for (const containerId of containers) {
        await initializer.initializeCanvasSystem({
          containerId,
          width: 800,
          height: 600
        });
      }

      // Verify all are initialized
      containers.forEach(containerId => {
        expect(initializer.getCanvasSystem(containerId)).toBeDefined();
      });

      // Destroy all
      initializer.destroyAllCanvasSystems();

      // Verify all are destroyed
      containers.forEach(containerId => {
        expect(initializer.getCanvasSystem(containerId)).toBeNull();
      });
    });
  });

  describe('System Health Monitoring', () => {
    test('should get system health for all canvases', async () => {
      const containers = ['health1', 'health2'];
      
      // Initialize systems
      for (const containerId of containers) {
        await initializer.initializeCanvasSystem({
          containerId,
          width: 800,
          height: 600,
          enableHealthChecking: true
        });
      }

      const healthResults = await initializer.getSystemHealth();

      expect(Object.keys(healthResults)).toHaveLength(2);
      expect(healthResults['health1']).toBeDefined();
      expect(healthResults['health2']).toBeDefined();
    });

    test('should handle health check errors gracefully', async () => {
      const containerId = 'error-health-container';
      
      await initializer.initializeCanvasSystem({
        containerId,
        width: 800,
        height: 600
      });

      // Mock health checker to throw error
      const system = initializer.getCanvasSystem(containerId);
      if (system) {
        jest.spyOn(system.healthChecker, 'performHealthCheck').mockRejectedValue(
          new Error('Health check failed')
        );
      }

      const healthResults = await initializer.getSystemHealth();
      
      expect(healthResults[containerId]).toEqual({
        status: 'error',
        error: 'Health check failed'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle canvas creation errors', async () => {
      // Mock Canvas constructor to throw error
      (fabric.Canvas as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Canvas creation failed');
      });

      const options = {
        containerId: 'error-container',
        width: 800,
        height: 600
      };

      await expect(initializer.initializeCanvasSystem(options)).rejects.toThrow(
        'Canvas creation failed'
      );
    });

    test('should validate initialization options', async () => {
      // Test missing container ID
      await expect(initializer.initializeCanvasSystem({
        containerId: '',
        width: 800,
        height: 600
      } as any)).rejects.toThrow();

      // Test invalid dimensions
      await expect(initializer.initializeCanvasSystem({
        containerId: 'test',
        width: 0,
        height: 600
      })).rejects.toThrow();

      await expect(initializer.initializeCanvasSystem({
        containerId: 'test',
        width: 800,
        height: -100
      })).rejects.toThrow();
    });

    test('should handle memory manager initialization errors', async () => {
      const options = {
        containerId: 'memory-error-container',
        width: 800,
        height: 600,
        memoryLimits: {
          maxCanvasMemory: -1, // Invalid
          maxTotalMemory: 500,
          warningThreshold: 80,
          criticalThreshold: 120,
          gcThreshold: 150
        }
      };

      // Should handle gracefully and not throw
      const system = await initializer.initializeCanvasSystem(options);
      expect(system).toBeDefined();
    });
  });

  describe('Performance Optimizations', () => {
    test('should apply initial optimizations to canvas', async () => {
      const containerId = 'optimization-container';
      const system = await initializer.initializeCanvasSystem({
        containerId,
        width: 800,
        height: 600
      });

      const canvas = system.canvas;
      expect(canvas.enableRetinaScaling).toBe(true);
      expect(canvas.imageSmoothingEnabled).toBe(true);
      expect(canvas.skipTargetFind).toBe(false);
      expect(canvas.perPixelTargetFind).toBe(true);
      expect(canvas.renderOnAddRemove).toBe(true);
      expect(canvas.stateful).toBe(true);
    });

    test('should apply CSS optimizations to canvas element', async () => {
      const containerId = 'css-optimization-container';
      const system = await initializer.initializeCanvasSystem({
        containerId,
        width: 800,
        height: 600
      });

      const canvasElement = system.canvas.getElement();
      expect(canvasElement).toBeDefined();
      expect(canvasElement.style).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    test('should setup system event handlers', async () => {
      const containerId = 'event-container';
      const system = await initializer.initializeCanvasSystem({
        containerId,
        width: 800,
        height: 600
      });

      // Verify event handlers are set up by checking if events can be emitted
      expect(system.canvasEngine.listenerCount('canvas:created')).toBeGreaterThan(0);
      expect(system.memoryManager.listenerCount('memory:warning')).toBeGreaterThan(0);
      expect(system.healthChecker.listenerCount('health:degraded')).toBeGreaterThan(0);
    });
  });
});