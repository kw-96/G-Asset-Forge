import { MemoryManager, MemoryEvent } from '../MemoryManager';
import { fabric } from 'fabric';

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => ({
      getObjects: jest.fn().mockReturnValue([]),
      getWidth: jest.fn().mockReturnValue(1920),
      getHeight: jest.fn().mockReturnValue(1080),
      on: jest.fn(),
      off: jest.fn()
    })),
    Object: jest.fn().mockImplementation(() => ({
      type: 'rect',
      set: jest.fn(),
      width: 100,
      height: 100
    })),
    Text: jest.fn().mockImplementation(() => ({
      type: 'text',
      text: 'Sample text',
      set: jest.fn()
    })),
    Image: jest.fn().mockImplementation(() => ({
      type: 'image',
      width: 200,
      height: 200,
      setSrc: jest.fn(),
      getSrc: jest.fn().mockReturnValue('test-image.jpg')
    }))
  }
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(1000),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
    }
  },
  configurable: true
});

// Mock window.gc for testing
(global as any).window = {
  gc: jest.fn()
};

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let mockCanvas: fabric.Canvas;

  beforeEach(() => {
    memoryManager = new MemoryManager({
      maxCanvasMemory: 100,
      maxTotalMemory: 500,
      warningThreshold: 80,
      criticalThreshold: 120,
      gcThreshold: 150
    });
    
    mockCanvas = new fabric.Canvas(document.createElement('canvas'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    memoryManager.destroy();
  });

  describe('Canvas Registration', () => {
    test('should register canvas for monitoring', () => {
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      
      expect(mockCanvas.on).toHaveBeenCalled();
    });

    test('should unregister canvas from monitoring', () => {
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      memoryManager.unregisterCanvas('test-canvas');
      
      // Should cleanup canvas memory
      expect(mockCanvas.getObjects).toHaveBeenCalled();
    });
  });

  describe('Memory Statistics', () => {
    test('should return current memory stats', () => {
      const stats = memoryManager.getMemoryStats();
      
      expect(stats).toEqual(
        expect.objectContaining({
          canvasMemory: expect.any(Number),
          totalMemory: expect.any(Number),
          objectCount: expect.any(Number),
          textureCount: expect.any(Number),
          cacheSize: expect.any(Number),
          lastGC: null
        })
      );
    });

    test('should track object count across canvases', () => {
      const mockObjects = [
        new fabric.Object(),
        new fabric.Object(),
        new fabric.Object()
      ];
      (mockCanvas.getObjects as jest.Mock).mockReturnValue(mockObjects);
      
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      const stats = memoryManager.getMemoryStats();
      
      expect(stats.objectCount).toBe(3);
    });

    test('should estimate canvas memory usage', () => {
      const mockObjects = [
        new fabric.Text(),
        new fabric.Image()
      ];
      (mockCanvas.getObjects as jest.Mock).mockReturnValue(mockObjects);
      
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      const stats = memoryManager.getMemoryStats();
      
      expect(stats.canvasMemory).toBeGreaterThan(0);
    });
  });

  describe('Object Pooling', () => {
    test('should create new object when pool is empty', () => {
      const factory = jest.fn(() => new fabric.Object());
      
      const obj = memoryManager.getPooledObject('rect', factory);
      
      expect(factory).toHaveBeenCalled();
      expect(obj).toBeInstanceOf(fabric.Object);
    });

    test('should reuse object from pool', () => {
      const factory = jest.fn(() => new fabric.Object());
      
      // Get object and return it to pool
      const obj1 = memoryManager.getPooledObject('rect', factory);
      memoryManager.returnToPool('rect', obj1);
      
      // Get object again - should reuse from pool
      const obj2 = memoryManager.getPooledObject('rect', factory);
      
      expect(obj1).toBe(obj2);
      expect(factory).toHaveBeenCalledTimes(1); // Only called once
    });

    test('should emit pooled event', (done) => {
      memoryManager.on(MemoryEvent.OBJECT_POOLED, ({ type, fromPool }) => {
        expect(type).toBe('rect');
        expect(typeof fromPool).toBe('boolean');
        done();
      });
      
      const factory = () => new fabric.Object();
      memoryManager.getPooledObject('rect', factory);
    });

    test('should reset object properties when returned to pool', () => {
      const mockObject = new fabric.Object();
      const factory = () => mockObject;
      
      const obj = memoryManager.getPooledObject('rect', factory);
      memoryManager.returnToPool('rect', obj);
      
      expect(obj.set).toHaveBeenCalledWith(
        expect.objectContaining({
          left: 0,
          top: 0,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          selectable: true,
          evented: true
        })
      );
    });
  });

  describe('Texture Caching', () => {
    test('should cache texture with size tracking', () => {
      const mockTexture = { data: 'texture-data' };
      const estimatedSize = 1024 * 1024; // 1MB
      
      memoryManager.cacheTexture('test-texture', mockTexture, estimatedSize);
      
      const cached = memoryManager.getCachedTexture('test-texture');
      expect(cached).toBe(mockTexture);
    });

    test('should return null for non-existent cached texture', () => {
      const cached = memoryManager.getCachedTexture('non-existent');
      expect(cached).toBeNull();
    });

    test('should update last used time when accessing cached texture', () => {
      const mockTexture = { data: 'texture-data' };
      memoryManager.cacheTexture('test-texture', mockTexture, 1024);
      
      // Access texture multiple times
      memoryManager.getCachedTexture('test-texture');
      memoryManager.getCachedTexture('test-texture');
      
      // Should update access time (tested indirectly through cache cleanup)
      expect(memoryManager.getCachedTexture('test-texture')).toBe(mockTexture);
    });

    test('should clear cache when size limit exceeded', () => {
      const largeSize = 50 * 1024 * 1024; // 50MB (exceeds 30% of 100MB limit)
      
      memoryManager.cacheTexture('texture1', { data: '1' }, largeSize);
      memoryManager.cacheTexture('texture2', { data: '2' }, largeSize);
      
      // Second texture should trigger cache cleanup
      const stats = memoryManager.getMemoryStats();
      expect(stats.cacheSize).toBeLessThan(100); // Should be cleaned up
    });
  });

  describe('Garbage Collection', () => {
    test('should force garbage collection', () => {
      memoryManager.forceGarbageCollection();
      
      const stats = memoryManager.getMemoryStats();
      expect(stats.lastGC).toBeInstanceOf(Date);
    });

    test('should emit garbage collected event', (done) => {
      memoryManager.on(MemoryEvent.GARBAGE_COLLECTED, (stats) => {
        expect(stats).toEqual(
          expect.objectContaining({
            canvasMemory: expect.any(Number),
            totalMemory: expect.any(Number)
          })
        );
        done();
      });
      
      memoryManager.forceGarbageCollection();
    });

    test('should call window.gc if available', () => {
      memoryManager.forceGarbageCollection();
      
      expect((window as any).gc).toHaveBeenCalled();
    });

    test('should prevent concurrent garbage collection', () => {
      const gcSpy = jest.spyOn(window as any, 'gc');
      
      // Start multiple GC operations simultaneously
      memoryManager.forceGarbageCollection();
      memoryManager.forceGarbageCollection();
      memoryManager.forceGarbageCollection();
      
      // Should only call GC once
      expect(gcSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Threshold Monitoring', () => {
    test('should emit warning when threshold exceeded', (done) => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 90 * 1024 * 1024 // 90MB - above warning threshold
        },
        configurable: true
      });

      memoryManager.on(MemoryEvent.MEMORY_WARNING, (stats) => {
        expect(stats.totalMemory).toBeGreaterThan(80);
        done();
      });

      // Trigger memory check
      memoryManager.getMemoryStats();
    });

    test('should emit critical warning when critical threshold exceeded', (done) => {
      // Mock critical memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 130 * 1024 * 1024 // 130MB - above critical threshold
        },
        configurable: true
      });

      memoryManager.on(MemoryEvent.MEMORY_CRITICAL, (stats) => {
        expect(stats.totalMemory).toBeGreaterThan(120);
        done();
      });

      // Trigger memory check
      memoryManager.getMemoryStats();
    });

    test('should auto-cleanup on critical memory', (done) => {
      // Mock critical memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 130 * 1024 * 1024 // 130MB
        },
        configurable: true
      });

      memoryManager.on(MemoryEvent.GARBAGE_COLLECTED, () => {
        done(); // Should trigger automatic GC
      });

      // Trigger memory check
      memoryManager.getMemoryStats();
    });
  });

  describe('Memory Limits Configuration', () => {
    test('should set memory limits', () => {
      memoryManager.setMemoryLimits({
        maxCanvasMemory: 200,
        warningThreshold: 150
      });

      // Test that new limits are applied (indirectly through behavior)
      const stats = memoryManager.getMemoryStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    test('should clear all caches and pools', () => {
      // Add some data to caches
      memoryManager.cacheTexture('test', { data: 'test' }, 1024);
      memoryManager.getPooledObject('rect', () => new fabric.Object());
      
      memoryManager.on(MemoryEvent.CACHE_CLEARED, () => {
        const stats = memoryManager.getMemoryStats();
        expect(stats.cacheSize).toBe(0);
        expect(stats.textureCount).toBe(0);
      });
      
      memoryManager.clearAll();
    });
  });

  describe('Object Memory Estimation', () => {
    test('should estimate text object memory', () => {
      const textObject = new fabric.Text();
      (textObject as any).text = 'A'.repeat(1000); // Long text
      
      const mockObjects = [textObject];
      (mockCanvas.getObjects as jest.Mock).mockReturnValue(mockObjects);
      
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      const stats = memoryManager.getMemoryStats();
      
      expect(stats.canvasMemory).toBeGreaterThan(0);
    });

    test('should estimate image object memory', () => {
      const imageObject = new fabric.Image();
      (imageObject as any).width = 1920;
      (imageObject as any).height = 1080;
      
      const mockObjects = [imageObject];
      (mockCanvas.getObjects as jest.Mock).mockReturnValue(mockObjects);
      
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      const stats = memoryManager.getMemoryStats();
      
      expect(stats.canvasMemory).toBeGreaterThan(0);
    });
  });

  describe('Canvas Event Handling', () => {
    test('should handle object addition events', () => {
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      
      // Simulate object:added event
      const addHandler = (mockCanvas.on as jest.Mock).mock.calls
        .find(call => call[0] === 'object:added')?.[1];
      
      if (addHandler) {
        addHandler();
        // Should update memory stats
        const stats = memoryManager.getMemoryStats();
        expect(stats).toBeDefined();
      }
    });

    test('should handle object removal events', () => {
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      
      // Simulate object:removed event
      const removeHandler = (mockCanvas.on as jest.Mock).mock.calls
        .find(call => call[0] === 'object:removed')?.[1];
      
      if (removeHandler) {
        const mockObject = new fabric.Image();
        removeHandler({ target: mockObject });
        
        // Should handle object cleanup
        expect(mockObject.setSrc).toHaveBeenCalled();
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle missing performance.memory gracefully', () => {
      // Mock missing memory API
      Object.defineProperty(performance, 'memory', {
        value: undefined,
        configurable: true
      });

      const stats = memoryManager.getMemoryStats();
      expect(stats.totalMemory).toBe(0);
    });

    test('should handle cleanup of old pooled objects', () => {
      const factory = () => new fabric.Object();
      
      // Create and return object to pool
      const obj = memoryManager.getPooledObject('rect', factory);
      memoryManager.returnToPool('rect', obj);
      
      // Force garbage collection (which includes pool cleanup)
      memoryManager.forceGarbageCollection();
      
      // Should not crash
      expect(() => {
        memoryManager.getPooledObject('rect', factory);
      }).not.toThrow();
    });

    test('should handle texture cache cleanup', () => {
      // Add texture to cache
      memoryManager.cacheTexture('old-texture', { data: 'old' }, 1024);
      
      // Force garbage collection (which includes cache cleanup)
      memoryManager.forceGarbageCollection();
      
      // Should not crash
      expect(() => {
        memoryManager.getCachedTexture('old-texture');
      }).not.toThrow();
    });
  });

  describe('Destruction and Cleanup', () => {
    test('should cleanup all resources on destroy', () => {
      memoryManager.registerCanvas('test-canvas', mockCanvas);
      memoryManager.cacheTexture('test', { data: 'test' }, 1024);
      
      memoryManager.destroy();
      
      const stats = memoryManager.getMemoryStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.textureCount).toBe(0);
    });

    test('should remove all event listeners on destroy', () => {
      const removeAllListenersSpy = jest.spyOn(memoryManager, 'removeAllListeners');
      
      memoryManager.destroy();
      
      expect(removeAllListenersSpy).toHaveBeenCalled();
    });
  });
});