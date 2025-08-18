/**
 * 测试工具函数
 * @description 提供测试中常用的工具函数和组件
 * @author 开发团队
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../src/renderer/ui/theme/tokens';

/**
 * 测试提供者组件
 */
interface TestProvidersProps {
  children: React.ReactNode;
}

export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

/**
 * 自定义渲染函数
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders>{children}</TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * 创建模拟画布元素
 */
export const createMockCanvasElement = (overrides = {}) => ({
  id: 'test-element-1',
  type: 'rectangle',
  name: '测试元素',
  transform: {
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    rotation: 0,
  },
  opacity: 1,
  visible: true,
  locked: false,
  fill: {
    type: 'solid',
    color: '#3b82f6',
  },
  stroke: {
    color: '#1e40af',
    width: 2,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * 创建模拟项目数据
 */
export const createMockProject = (overrides = {}) => ({
  id: 'test-project-1',
  name: '测试项目',
  description: '这是一个测试项目',
  canvasSettings: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
  },
  elements: [createMockCanvasElement()],
  metadata: {
    version: '1.0.0',
    tags: ['测试', '项目'],
    thumbnail: null,
  },
  statistics: {
    elementCount: 1,
    fileSize: 1024,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * 创建模拟素材数据
 */
export const createMockAsset = (overrides = {}) => ({
  id: 'test-asset-1',
  name: '测试素材',
  type: 'image',
  category: 'backgrounds',
  url: '/test-image.png',
  metadata: {
    width: 400,
    height: 300,
    fileSize: 2048,
    format: 'png',
  },
  tags: ['测试', '背景'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * 等待异步操作完成
 */
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 模拟用户交互事件
 */
export const mockUserEvent = {
  click: (element: Element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },
  
  type: (element: Element, text: string) => {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },
  
  keyDown: (element: Element, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
  
  mouseMove: (element: Element, clientX = 0, clientY = 0) => {
    element.dispatchEvent(new MouseEvent('mousemove', { 
      clientX, 
      clientY, 
      bubbles: true 
    }));
  },
};

/**
 * 断言工具
 */
export const expectElement = {
  toBeInDocument: (element: Element | null) => {
    expect(element).toBeInTheDocument();
  },
  
  toHaveText: (element: Element | null, text: string) => {
    expect(element).toHaveTextContent(text);
  },
  
  toBeVisible: (element: Element | null) => {
    expect(element).toBeVisible();
  },
  
  toHaveClass: (element: Element | null, className: string) => {
    expect(element).toHaveClass(className);
  },
};

/**
 * 性能测试工具
 */
export const performanceUtils = {
  measureTime: async (fn: () => Promise<any> | any): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  },
  
  measureMemory: (): NodeJS.MemoryUsage => {
    return process.memoryUsage();
  },
};

// 重新导出常用的测试工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';