/**
 * 测试环境设置
 * @description 配置测试环境和全局设置
 * @author 开发团队
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 配置测试库
configure({
  testIdAttribute: 'data-testid',
});

// 设置全局变量
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Electron APIs
const electronMock = {
  ipcRenderer: {
    invoke: jest.fn(),
    send: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  app: {
    getPath: jest.fn(),
    getVersion: jest.fn(() => '1.0.0'),
  },
  dialog: {
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn(),
  },
};

// 模拟Electron模块
jest.mock('electron', () => electronMock);

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});