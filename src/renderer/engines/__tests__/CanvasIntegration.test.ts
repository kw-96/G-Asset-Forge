import { CanvasEngine, GAME_ASSET_PRESETS } from '../CanvasEngine';
import { MemoryManager } from '../MemoryManager';

// Simple integration test to verify the core functionality
describe('Canvas System Integration', () => {
  test('should have game asset presets', () => {
    expect(GAME_ASSET_PRESETS.MOBILE_PORTRAIT).toEqual({
      width: 1080,
      height: 1920,
      name: 'Mobile Portrait (1080x1920)'
    });
    
    expect(GAME_ASSET_PRESETS.HD).toEqual({
      width: 1280,
      height: 720,
      name: 'HD (1280x720)'
    });
  });

  test('should create canvas engine instance', () => {
    const engine = new CanvasEngine();
    expect(engine).toBeDefined();
    expect(typeof engine.getCanvasIds).toBe('function');
    expect(typeof engine.destroy).toBe('function');
    engine.destroy();
  });

  test('should create memory manager instance', () => {
    const memoryManager = new MemoryManager();
    expect(memoryManager).toBeDefined();
    expect(typeof memoryManager.getMemoryStats).toBe('function');
    expect(typeof memoryManager.forceGarbageCollection).toBe('function');
    memoryManager.destroy();
  });

  test('should have proper memory limits', () => {
    const memoryManager = new MemoryManager({
      maxCanvasMemory: 100,
      warningThreshold: 80,
      criticalThreshold: 120
    });
    
    const stats = memoryManager.getMemoryStats();
    expect(stats).toEqual(
      expect.objectContaining({
        canvasMemory: expect.any(Number),
        totalMemory: expect.any(Number),
        objectCount: expect.any(Number),
        textureCount: expect.any(Number),
        cacheSize: expect.any(Number)
      })
    );
    
    memoryManager.destroy();
  });

  test('should handle performance monitoring', () => {
    const engine = new CanvasEngine();
    const canvasIds = engine.getCanvasIds();
    expect(Array.isArray(canvasIds)).toBe(true);
    
    const allMetrics = engine.getAllPerformanceMetrics();
    expect(allMetrics instanceof Map).toBe(true);
    
    engine.destroy();
  });
});