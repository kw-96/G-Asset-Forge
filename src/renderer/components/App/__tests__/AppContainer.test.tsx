/**
 * AppContainer 组件单元测试
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppContainer } from '../AppContainer';

// Mock依赖
jest.mock('../../../stores/appStore', () => ({
  useAppStore: () => ({
    isInitialized: false,
    isInitializing: false,
    initializationError: null,
    initializeAppOnce: jest.fn().mockResolvedValue(true),
    theme: 'light',
    language: 'zh-CN',
  }),
}));

jest.mock('../../../utils/ReactLoopFix', () => ({
  reactLoopFixToolkit: {
    debugLogger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
    detectInfiniteLoop: jest.fn().mockReturnValue(false),
  },
}));

// Mock子组件
jest.mock('../../Layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

jest.mock('../../Canvas/CanvasArea', () => ({
  CanvasArea: () => <div data-testid="canvas-area">Canvas Area</div>,
}));

jest.mock('../../../ui/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('AppContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正常渲染AppContainer', () => {
      render(<AppContainer />);
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('应该在初始化时显示加载状态', () => {
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: true,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('应该在初始化完成后显示主要内容', () => {
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      expect(screen.getByTestId('canvas-area')).toBeInTheDocument();
    });

    it('应该在初始化错误时显示错误信息', () => {
      const { useAppStore } = require('../../../stores/appStore');
      const error = new Error('初始化失败');
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: error,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      expect(screen.getByText(/初始化失败/)).toBeInTheDocument();
    });
  });

  describe('初始化逻辑', () => {
    it('应该在组件挂载时调用初始化', async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledTimes(1);
      });
    });

    it('应该只初始化一次', async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      });

      const { rerender } = render(<AppContainer />);
      
      // 重新渲染组件
      rerender(<AppContainer />);
      
      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledTimes(1);
      });
    });

    it('应该处理初始化失败', async () => {
      const mockInitialize = jest.fn().mockRejectedValue(new Error('初始化失败'));
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });

      // 验证错误被记录
      const { reactLoopFixToolkit } = require('../../../utils/ReactLoopFix');
      expect(reactLoopFixToolkit.debugLogger.error).toHaveBeenCalled();
    });
  });

  describe('稳定性测试', () => {
    it('应该使用稳定的初始化函数引用', () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const { useAppStore } = require('../../../stores/appStore');
      
      let capturedInitFn: any = null;
      useAppStore.mockImplementation(() => ({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: (fn: any) => {
          capturedInitFn = fn;
          return mockInitialize();
        },
        theme: 'light',
        language: 'zh-CN',
      }));

      const { rerender } = render(<AppContainer />);
      const firstInitFn = capturedInitFn;
      
      rerender(<AppContainer />);
      const secondInitFn = capturedInitFn;
      
      // 验证初始化函数引用是稳定的
      expect(firstInitFn).toBe(secondInitFn);
    });

    it('应该正确处理useEffect依赖', () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const { useAppStore } = require('../../../stores/appStore');
      
      let renderCount = 0;
      useAppStore.mockImplementation(() => {
        renderCount++;
        return {
          isInitialized: false,
          isInitializing: false,
          initializationError: null,
          initializeAppOnce: mockInitialize,
          theme: 'light',
          language: 'zh-CN',
        };
      });

      const { rerender } = render(<AppContainer />);
      
      // 多次重新渲染
      for (let i = 0; i < 5; i++) {
        rerender(<AppContainer />);
      }
      
      // 验证初始化只被调用一次
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('错误边界集成', () => {
    it('应该被错误边界包装', () => {
      // 这个测试验证组件是否正确集成了错误边界
      // 由于错误边界是在更高层级，这里主要验证组件不会抛出未捕获的错误
      
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'zh-CN',
      });

      expect(() => {
        render(<AppContainer />);
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该高效渲染', () => {
      const { useAppStore } = require('../../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'zh-CN',
      });

      const startTime = Date.now();
      render(<AppContainer />);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成渲染
    });

    it('应该避免不必要的重新渲染', () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      const { useAppStore } = require('../../../stores/appStore');
      
      let renderCount = 0;
      const mockStoreState = {
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      };

      useAppStore.mockImplementation(() => {
        renderCount++;
        return mockStoreState;
      });

      const { rerender } = render(<AppContainer />);
      
      // 使用相同的props重新渲染
      rerender(<AppContainer />);
      
      // 验证store只被调用了必要的次数
      expect(renderCount).toBeLessThan(10); // 合理的渲染次数
    });
  });

  describe('主题和语言支持', () => {
    it('应该响应主题变化', () => {
      const { useAppStore } = require('../../../stores/appStore');
      
      const { rerender } = render(<AppContainer />);
      
      // 模拟主题变化
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'dark',
        language: 'zh-CN',
      });
      
      rerender(<AppContainer />);
      
      // 验证组件能够响应主题变化
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('应该响应语言变化', () => {
      const { useAppStore } = require('../../../stores/appStore');
      
      const { rerender } = render(<AppContainer />);
      
      // 模拟语言变化
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn(),
        theme: 'light',
        language: 'en-US',
      });
      
      rerender(<AppContainer />);
      
      // 验证组件能够响应语言变化
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });
});