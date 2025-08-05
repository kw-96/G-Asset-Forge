import { CanvasInitializationChecker } from '../CanvasInitializationChecker';

// Mock DOM
Object.defineProperty(document, 'getElementById', {
  value: jest.fn().mockReturnValue({
    getBoundingClientRect: jest.fn().mockReturnValue({
      width: 800,
      height: 600,
      left: 0,
      top: 0
    }),
    style: {}
  }),
  writable: true
});

Object.defineProperty(document, 'readyState', {
  value: 'complete',
  writable: true
});

Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn().mockReturnValue({
    display: 'block',
    visibility: 'visible'
  }),
  writable: true
});

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    version: '5.2.4',
    Canvas: jest.fn()
  }
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(1000),
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
      jsHeapSizeLimit: 2147483648, // 2GB
      usedJSHeapSize: 50 * 1024 * 1024 // 50MB
    }
  },
  writable: true
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    maxTouchPoints: 0
  },
  writable: true
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    devicePixelRatio: 1,
    ...global.window
  },
  writable: true
});

describe('CanvasInitializationChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('performCheck', () => {
    test('should perform basic initialization check', async () => {
      const result = await CanvasInitializationChecker.performCheck();
      
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.systemInfo).toBeDefined();
    });

    test('should check browser support', async () => {
      const result = await CanvasInitializationChecker.performCheck();
      
      expect(result.systemInfo.browserSupport).toBeDefined();
      expect(result.systemInfo.browserSupport.canvas).toBe(true);
      expect(result.systemInfo.browserSupport.performance).toBe(true);
    });

    test('should check container when provided', async () => {
      const result = await CanvasInitializationChecker.performCheck('test-container');
      
      expect(result).toBeDefined();
      expect(document.getElementById).toHaveBeenCalledWith('test-container');
    });

    test('should detect missing container', async () => {
      (document.getElementById as jest.Mock).mockReturnValue(null);
      
      const result = await CanvasInitializationChecker.performCheck('missing-container');
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.type === 'error' && issue.message.includes('Container element not found')
      )).toBe(true);
    });

    test('should detect zero-dimension container', async () => {
      (document.getElementById as jest.Mock).mockReturnValue({
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 0,
          height: 0,
          left: 0,
          top: 0
        }),
        style: {}
      });
      
      const result = await CanvasInitializationChecker.performCheck('zero-container');
      
      expect(result.issues.some(issue => 
        issue.type === 'warning' && issue.message.includes('zero dimensions')
      )).toBe(true);
    });

    test('should check memory availability', async () => {
      const result = await CanvasInitializationChecker.performCheck();
      
      expect(result.systemInfo.availableMemory).toBeGreaterThan(0);
    });

    test('should handle missing performance API gracefully', async () => {
      // Mock missing performance API
      const originalPerformance = global.performance;
      (global as any).performance = undefined;
      
      const result = await CanvasInitializationChecker.performCheck();
      
      expect(result.systemInfo.browserSupport.performance).toBe(false);
      expect(result.issues.some(issue => 
        issue.component === 'performance'
      )).toBe(true);
      
      // Restore performance API
      global.performance = originalPerformance;
    });

    test('should detect mobile devices', async () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });
      
      const result = await CanvasInitializationChecker.performCheck();
      
      expect(result.issues.some(issue => 
        issue.message.includes('Mobile device detected')
      )).toBe(true);
    });
  });

  describe('generateReport', () => {
    test('should generate readable report', async () => {
      const result = await CanvasInitializationChecker.performCheck();
      const report = CanvasInitializationChecker.generateReport(result);
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Canvas Initialization Check Report');
      expect(report).toContain('System Information');
      expect(report).toContain('Browser Support');
    });

    test('should include issues in report', async () => {
      // Force an error by mocking missing canvas support
      const mockResult = {
        isValid: false,
        issues: [{
          type: 'error' as const,
          component: 'browser' as const,
          message: 'Canvas not supported',
          details: 'Test error'
        }],
        recommendations: ['Use modern browser'],
        systemInfo: {
          browserSupport: {
            canvas: false,
            webgl: false,
            performance: false,
            memory: false
          },
          fabricVersion: null,
          devicePixelRatio: 1,
          availableMemory: null,
          userAgent: 'test'
        }
      };
      
      const report = CanvasInitializationChecker.generateReport(mockResult);
      
      expect(report).toContain('FAILED');
      expect(report).toContain('Issues Found');
      expect(report).toContain('Canvas not supported');
      expect(report).toContain('Recommendations');
    });
  });
});