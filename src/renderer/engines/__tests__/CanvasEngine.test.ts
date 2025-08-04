import { CanvasEngine, CanvasEvent, GAME_ASSET_PRESETS } from '../CanvasEngine';
import { fabric } from 'fabric';

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => ({
      setDimensions: jest.fn(),
      renderAll: jest.fn(),
      dispose: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
      getObjects: jest.fn().mockReturnValue([]),
      setBackgroundColor: jest.fn((color, callback) => callback && callback()),
      on: jest.fn(),
      off: jest.fn(),
      getWidth: jest.fn().mockReturnValue(1920),
      getHeight: jest.fn().mockReturnValue(1080)
    })),
    Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
    Object: jest.fn()
  }
}));

// Mock DOM
(global as any).document = {
  getElementById: jest.fn().mockReturnValue({
    appendChild: jest.fn()
  }),
  createElement: jest.fn().mockReturnValue({
    id: '',
    remove: jest.fn()
  })
};

Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(1000),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
    }
  }
});

(global as any).window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

describe('CanvasEngine', () => {
  let canvasEngine: CanvasEngine;

  beforeEach(() => {
    canvasEngine = new CanvasEngine();
    jest.clearAllMocks();
  });

  afterEach(() => {
    canvasEngine.destroy();
  });

  describe('Canvas Creation', () => {
    test('should create canvas with specified dimensions', async () => {
      const options = {
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff'
      };

      const canvas = await canvasEngine.createCanvas('test-container', options);

      expect(fabric.Canvas).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          width: 1920,
          height: 1080,
          backgroundColor: '#ffffff'
        })
      );
      expect(canvas).toBeDefined();
    });

    test('should emit canvas created event', async () => {
      const eventSpy = jest.fn();
      canvasEngine.on(CanvasEvent.CANVAS_CREATED, eventSpy);

      await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      expect(eventSpy).toHaveBeenCalledWith({
        canvasId: 'test-container',
        canvas: expect.any(Object)
      });
    });

    test('should throw error if container not found', async () => {
      (document.getElementById as jest.Mock).mockReturnValue(null);

      await expect(
        canvasEngine.createCanvas('non-existent', { width: 800, height: 600 })
      ).rejects.toThrow('Container with id "non-existent" not found');
    });
  });

  describe('Canvas Management', () => {
    test('should resize canvas', async () => {
      const canvas = await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      canvasEngine.resizeCanvas('test-container', 1920, 1080);

      expect(canvas.setDimensions).toHaveBeenCalledWith({
        width: 1920,
        height: 1080
      });
      expect(canvas.renderAll).toHaveBeenCalled();
    });

    test('should get canvas by ID', async () => {
      const canvas = await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      const retrievedCanvas = canvasEngine.getCanvas('test-container');
      expect(retrievedCanvas).toBe(canvas);
    });

    test('should return undefined for non-existent canvas', () => {
      const canvas = canvasEngine.getCanvas('non-existent');
      expect(canvas).toBeUndefined();
    });

    test('should get all canvas IDs', async () => {
      await canvasEngine.createCanvas('canvas1', { width: 800, height: 600 });
      await canvasEngine.createCanvas('canvas2', { width: 800, height: 600 });

      const canvasIds = canvasEngine.getCanvasIds();
      expect(canvasIds).toEqual(['canvas1', 'canvas2']);
    });
  });

  describe('Object Management', () => {
    let canvas: fabric.Canvas;
    let mockObject: fabric.Object;

    beforeEach(async () => {
      canvas = await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });
      mockObject = new fabric.Object();
    });

    test('should add object to canvas', () => {
      const objectId = canvasEngine.addObject('test-container', mockObject);

      expect(objectId).toMatch(/^obj_\d+_[a-z0-9]+$/);
      expect(mockObject.set).toHaveBeenCalledWith('id', objectId);
      expect(canvas.add).toHaveBeenCalledWith(mockObject);
      expect(canvas.renderAll).toHaveBeenCalled();
    });

    test('should remove object from canvas', () => {
      const objectId = 'test-object-id';
      const mockObjects = [{ id: objectId }];
      (canvas.getObjects as jest.Mock).mockReturnValue(mockObjects);

      canvasEngine.removeObject('test-container', objectId);

      expect(canvas.remove).toHaveBeenCalledWith(mockObjects[0]);
      expect(canvas.renderAll).toHaveBeenCalled();
    });

    test('should update object properties', () => {
      const objectId = 'test-object-id';
      const mockObjects = [{ id: objectId, set: jest.fn() }];
      (canvas.getObjects as jest.Mock).mockReturnValue(mockObjects);

      const properties = { left: 100, top: 50 };
      canvasEngine.updateObject('test-container', objectId, properties);

      expect(mockObjects[0].set).toHaveBeenCalledWith(properties);
      expect(canvas.renderAll).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', async () => {
      await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      // Wait for performance monitoring to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = canvasEngine.getPerformanceMetrics('test-container');
      expect(metrics).toEqual(
        expect.objectContaining({
          fps: expect.any(Number),
          memoryUsage: expect.any(Number),
          renderTime: expect.any(Number),
          objectCount: expect.any(Number)
        })
      );
    });

    test('should return null for non-existent canvas metrics', () => {
      const metrics = canvasEngine.getPerformanceMetrics('non-existent');
      expect(metrics).toBeNull();
    });
  });

  describe('Canvas Destruction', () => {
    test('should destroy canvas and cleanup', async () => {
      const canvas = await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      const eventSpy = jest.fn();
      canvasEngine.on(CanvasEvent.CANVAS_DESTROYED, eventSpy);

      canvasEngine.destroyCanvas('test-container');

      expect(canvas.dispose).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith({
        canvasId: 'test-container'
      });
      expect(canvasEngine.getCanvas('test-container')).toBeUndefined();
    });

    test('should handle destroying non-existent canvas gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      canvasEngine.destroyCanvas('non-existent');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Canvas with id "non-existent" not found'
      );
      
      consoleSpy.mockRestore();
    });

    test('should destroy all canvases when engine is destroyed', async () => {
      const canvas1 = await canvasEngine.createCanvas('canvas1', {
        width: 800,
        height: 600
      });
      const canvas2 = await canvasEngine.createCanvas('canvas2', {
        width: 800,
        height: 600
      });

      canvasEngine.destroy();

      expect(canvas1.dispose).toHaveBeenCalled();
      expect(canvas2.dispose).toHaveBeenCalled();
      expect(canvasEngine.getCanvasIds()).toEqual([]);
    });
  });

  describe('Game Asset Presets', () => {
    test('should have mobile portrait preset', () => {
      expect(GAME_ASSET_PRESETS.MOBILE_PORTRAIT).toEqual({
        width: 1080,
        height: 1920,
        name: 'Mobile Portrait (1080x1920)'
      });
    });

    test('should have HD preset', () => {
      expect(GAME_ASSET_PRESETS.HD).toEqual({
        width: 1280,
        height: 720,
        name: 'HD (1280x720)'
      });
    });

    test('should have icon presets', () => {
      expect(GAME_ASSET_PRESETS.ICON_SMALL).toEqual({
        width: 64,
        height: 64,
        name: 'Small Icon (64x64)'
      });
    });
  });

  describe('Memory Management Integration', () => {
    test('should emit memory warning when threshold exceeded', async () => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 150 * 1024 * 1024 // 150MB
        },
        configurable: true
      });

      const warningSpy = jest.fn();
      canvasEngine.on('memory:warning', warningSpy);

      await canvasEngine.createCanvas('test-container', {
        width: 800,
        height: 600
      });

      // Trigger memory check
      await new Promise(resolve => setTimeout(resolve, 6000));

      expect(warningSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle canvas creation errors', async () => {
      (fabric.Canvas as jest.Mock).mockImplementation(() => {
        throw new Error('Canvas creation failed');
      });

      await expect(
        canvasEngine.createCanvas('test-container', { width: 800, height: 600 })
      ).rejects.toThrow('Canvas creation failed');
    });

    test('should not allow operations on destroyed engine', async () => {
      canvasEngine.destroy();

      await expect(
        canvasEngine.createCanvas('test-container', { width: 800, height: 600 })
      ).rejects.toThrow('CanvasEngine has been destroyed');
    });
  });
});