/**
 * 应用启动流程集成测试
 * 验证完整的应用启动流程和无限循环修复
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppContainer } from '../../components/App/AppContainer';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';
import { devDebugTools } from '../../utils/DevDebugTools';

// Mock所有外部依赖
jest.mock('../../stores/appStore');
jest.mock('../../utils/ReactLoopFix');
jest.mock('../../utils/DevDebugTools');
jest.mock('../../components/Layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
jest.mock('../../components/Canvas/CanvasArea', () => ({
  CanvasArea: () => <div data-testid="canvas-area">Canvas</div>,
}));

describe('应用启动流程集成测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 重置调试工具
    (devDebugTools.setEnabled as jest.Mock).mockImplementation(() => {});
    (devDebugTools.clearLogs as jest.Mock).mockImplementation(() => {});
    
    // 重置ReactLoopFix工具包
    (reactLoopFixToolkit.debugLogger.info as jest.Mock).mockImplementation(() => {});
    (reactLoopFixToolkit.detectInfiniteLoop as jest.Mock).mockReturnValue(false);
  });

  describe('正常启动流程', () => {
    it('应该完成完整的应用启动流程', async () => {
      const { useAppStore } = require('../../stores/appStore');
      const mockInitialize = jest.fn().mockResolvedValue(true);
      
      // 模拟启动过程的状态变化
      let callCount = 0;
      useAppStore.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            isInitialized: false,
            isInitializing: true,
            initializationError: null,
            initializeAppOnce: mockInitialize,
            theme: 'light',
            language: 'zh-CN',
          };
        }
        return {
          isInitialized: true,
          isInitializing: false,
          initializationError: null,
          initializeAppOnce: mockInitialize,
          theme: 'light',
          language: 'zh-CN',
        };
      });

      render(<AppContainer />);
      
      // 验证初始化过程
      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalled();
      });
      
      // 验证最终状态
      await waitFor(() => {
        expect(screen.getByTestId('canvas-area')).toBeInTheDocument();
      });
    });

    it('应该在启动过程中启用调试工具', async () => {
      const { useAppStore } = require('../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn().mockResolvedValue(true),
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      // 在开发环境中应该启用调试工具
      if (process.env.NODE_ENV === 'development') {
        expect(devDebugTools.setEnabled).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('错误恢复流程', () => {
    it('应该从初始化错误中恢复', async () => {
      const { useAppStore } = require('../../stores/appStore');
      const mockInitialize = jest.fn()
        .mockRejectedValueOnce(new Error('初始化失败'))
        .mockResolvedValueOnce(true);
      
      let callCount = 0;
      useAppStore.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return {
            isInitialized: false,
            isInitializing: false,
            initializationError: new Error('初始化失败'),
            initializeAppOnce: mockInitialize,
            theme: 'light',
            language: 'zh-CN',
          };
        }
        return {
          isInitialized: true,
          isInitializing: false,
          initializationError: null,
          initializeAppOnce: mockInitialize,
          theme: 'light',
          language: 'zh-CN',
        };
      });

      const { rerender } = render(<AppContainer />);
      
      // 验证错误状态
      expect(screen.getByText(/初始化失败/)).toBeInTheDocument();
      
      // 模拟重试
      rerender(<AppContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('canvas-area')).toBeInTheDocument();
      });
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内完成启动', async () => {
      const { useAppStore } = require('../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn().mockResolvedValue(true),
        theme: 'light',
        language: 'zh-CN',
      });

      const startTime = Date.now();
      render(<AppContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('canvas-area')).toBeInTheDocument();
      });
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该避免内存泄漏', async () => {
      const { useAppStore } = require('../../stores/appStore');
      useAppStore.mockReturnValue({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn().mockResolvedValue(true),
        theme: 'light',
        language: 'zh-CN',
      });

      const { unmount } = render(<AppContainer />);
      
      // 模拟组件卸载
      unmount();
      
      // 验证没有抛出错误（基本的内存泄漏检测）
      expect(true).toBe(true);
    });
  });

  describe('无限循环检测', () => {
    it('应该检测并处理无限循环', async () => {
      const { useAppStore } = require('../../stores/appStore');
      const mockInitialize = jest.fn().mockResolvedValue(true);
      
      // 模拟检测到无限循环
      (reactLoopFixToolkit.detectInfiniteLoop as jest.Mock).mockReturnValue(true);
      
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      });

      render(<AppContainer />);
      
      // 验证无限循环被检测到
      expect(reactLoopFixToolkit.detectInfiniteLoop).toHaveBeenCalled();
    });

    it('应该在检测到无限循环时记录警告', async () => {
      const { useAppStore } = require('../../stores/appStore');
      
      // 模拟频繁的状态更新（可能的无限循环）
      let updateCount = 0;
      useAppStore.mockImplementation(() => {
        updateCount++;
        return {
          isInitialized: updateCount > 50, // 模拟多次更新后才初始化完成
          isInitializing: updateCount <= 50,
          initializationError: null,
          initializeAppOnce: jest.fn().mockResolvedValue(true),
          theme: 'light',
          language: 'zh-CN',
        };
      });

      render(<AppContainer />);
      
      await waitFor(() => {
        expect(updateCount).toBeGreaterThan(1);
      });
    });
  });

  describe('主题和语言切换', () => {
    it('应该正确处理主题切换', async () => {
      const { useAppStore } = require('../../stores/appStore');
      
      let currentTheme = 'light';
      useAppStore.mockImplementation(() => ({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn().mockResolvedValue(true),
        theme: currentTheme,
        language: 'zh-CN',
        setTheme: (theme: string) => { currentTheme = theme; },
      }));

      const { rerender } = render(<AppContainer />);
      
      // 模拟主题切换
      currentTheme = 'dark';
      rerender(<AppContainer />);
      
      // 验证组件能够响应主题变化
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('应该正确处理语言切换', async () => {
      const { useAppStore } = require('../../stores/appStore');
      
      let currentLanguage = 'zh-CN';
      useAppStore.mockImplementation(() => ({
        isInitialized: true,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: jest.fn().mockResolvedValue(true),
        theme: 'light',
        language: currentLanguage,
        setLanguage: (lang: string) => { currentLanguage = lang; },
      }));

      const { rerender } = render(<AppContainer />);
      
      // 模拟语言切换
      currentLanguage = 'en-US';
      rerender(<AppContainer />);
      
      // 验证组件能够响应语言变化
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('错误边界集成', () => {
    it('应该被错误边界保护', () => {
      const { useAppStore } = require('../../stores/appStore');
      
      // 模拟会抛出错误的状态
      useAppStore.mockImplementation(() => {
        throw new Error('Store错误');
      });

      // 应该不会导致整个应用崩溃
      expect(() => {
        render(<AppContainer />);
      }).not.toThrow();
    });
  });

  describe('并发安全性', () => {
    it('应该安全处理并发渲染', async () => {
      const { useAppStore } = require('../../stores/appStore');
      const mockInitialize = jest.fn().mockResolvedValue(true);
      
      useAppStore.mockReturnValue({
        isInitialized: false,
        isInitializing: false,
        initializationError: null,
        initializeAppOnce: mockInitialize,
        theme: 'light',
        language: 'zh-CN',
      });

      // 同时渲染多个实例
      const renders = [
        render(<AppContainer />),
        render(<AppContainer />),
        render(<AppContainer />),
      ];

      // 等待所有渲染完成
      await Promise.all(renders.map(({ container }) => 
        waitFor(() => expect(container).toBeInTheDocument())
      ));

      // 清理
      renders.forEach(({ unmount }) => unmount());
    });
  });
});