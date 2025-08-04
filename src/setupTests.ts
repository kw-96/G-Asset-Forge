// Jest setup file for testing environment

// Mock Electron API
const mockElectronAPI = {
  fs: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    exists: jest.fn(),
    createDirectory: jest.fn(),
  },
  window: {
    minimize: jest.fn(),
    maximize: jest.fn(),
    close: jest.fn(),
    onMaximized: jest.fn(),
    onUnmaximized: jest.fn(),
    onEnterFullScreen: jest.fn(),
    onLeaveFullScreen: jest.fn(),
  },
  app: {
    getVersion: jest.fn().mockResolvedValue('1.0.0'),
    getPlatform: jest.fn().mockResolvedValue('test'),
  },
  menu: {
    onNewProject: jest.fn(),
    onOpenProject: jest.fn(),
    onSaveProject: jest.fn(),
    onExport: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onFitToScreen: jest.fn(),
  },
  removeAllListeners: jest.fn(),
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock Fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => ({
      setDimensions: jest.fn(),
      setBackgroundColor: jest.fn(),
      renderAll: jest.fn(),
      dispose: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      getZoom: jest.fn().mockReturnValue(1),
      setZoom: jest.fn(),
      zoomToPoint: jest.fn(),
      relativePan: jest.fn(),
      absolutePan: jest.fn(),
    })),
    Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
    Object: jest.fn(),
  },
}));

// Mock performance.memory for testing
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});