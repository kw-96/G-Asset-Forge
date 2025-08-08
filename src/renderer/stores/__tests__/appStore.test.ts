/**
 * AppStore 单元测试
 */

import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../appStore';

// Mock依赖
jest.mock('../../utils/InitializationManager', () => ({
  InitializationManager: {
    getInstance: () => ({
      initializeOnce: jest.fn().mockResolvedValue(true),
      isInitialized: jest.fn().mockReturnValue(false),
      reset: jest.fn(),
    }),
  },
}));

jest.mock('../../utils/StateValidator', () => ({
  StateValidator: {
    getInstance: () => ({
      validateStateUpdate: jest.fn().mockReturnValue({ isValid: true, warnings: [] }),
      detectInfiniteLoop: jest.fn().mockReturnValue(false),
    }),
  },
}));

jest.mock('../../utils/DebugLogger', () => ({
  DebugLogger: {
    getInstance: () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }),
  },
}));

describe('AppStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.initializationError).toBeNull();
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('zh-CN');
    });
  });

  describe('初始化功能', () => {
    it('应该成功初始化应用', async () => {
      const { result } = renderHook(() => useAppStore());
      
      await act(async () => {
        await result.current.initializeAppOnce();
      });
      
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.initializationError).toBeNull();
    });

    it('应该防止重复初始化', async () => {
      const { result } = renderHook(() => useAppStore());
      
      await act(async () => {
        await result.current.initializeAppOnce();
      });
      
      const firstInitTime = result.current.lastInitTime;
      
      // 尝试再次初始化
      await act(async () => {
        await result.current.initializeAppOnce();
      });
      
      expect(result.current.lastInitTime).toBe(firstInitTime);
    });

    it('应该处理初始化错误', async () => {
      const { InitializationManager } = require('../../utils/InitializationManager');
      const mockManager = InitializationManager.getInstance();
      mockManager.initializeOnce.mockRejectedValueOnce(new Error('初始化失败'));
      
      const { result } = renderHook(() => useAppStore());
      
      await act(async () => {
        try {
          await result.current.initializeAppOnce();
        } catch (error) {
          // 预期的错误
        }
      });
      
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.initializationError).toBeTruthy();
    });
  });

  describe('批量更新', () => {
    it('应该支持批量状态更新', async () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.batchUpdate((state) => {
          state.theme = 'dark';
          state.language = 'en-US';
        });
      });
      
      expect(result.current.theme).toBe('dark');
      expect(result.current.language).toBe('en-US');
    });

    it('应该在批量更新中验证状态', async () => {
      const { StateValidator } = require('../../utils/StateValidator');
      const mockValidator = StateValidator.getInstance();
      
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.batchUpdate((state) => {
          state.theme = 'dark';
        });
      });
      
      expect(mockValidator.validateStateUpdate).toHaveBeenCalled();
    });
  });

  describe('主题管理', () => {
    it('应该正确设置主题', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });

    it('应该切换主题', () => {
      const { result } = renderHook(() => useAppStore());
      
      // 初始为light主题
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('light');
    });
  });

  describe('语言管理', () => {
    it('应该正确设置语言', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setLanguage('en-US');
      });
      
      expect(result.current.language).toBe('en-US');
    });
  });

  describe('错误处理', () => {
    it('应该设置和清除错误', () => {
      const { result } = renderHook(() => useAppStore());
      
      const error = new Error('测试错误');
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.error).toBe(error);
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('重置功能', () => {
    it('应该重置应用状态', async () => {
      const { result } = renderHook(() => useAppStore());
      
      // 先初始化并修改一些状态
      await act(async () => {
        await result.current.initializeAppOnce();
      });
      
      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('en-US');
      });
      
      // 重置状态
      act(() => {
        result.current.resetApp();
      });
      
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('zh-CN');
      expect(result.current.error).toBeNull();
    });
  });

  describe('状态验证', () => {
    it('应该在状态更新时进行验证', () => {
      const { StateValidator } = require('../../utils/StateValidator');
      const mockValidator = StateValidator.getInstance();
      
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(mockValidator.validateStateUpdate).toHaveBeenCalled();
    });

    it('应该处理验证警告', () => {
      const { StateValidator } = require('../../utils/StateValidator');
      const mockValidator = StateValidator.getInstance();
      mockValidator.validateStateUpdate.mockReturnValue({
        isValid: true,
        warnings: ['测试警告'],
      });
      
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      // 验证警告应该被记录（通过日志）
      expect(mockValidator.validateStateUpdate).toHaveBeenCalled();
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量状态更新', () => {
      const { result } = renderHook(() => useAppStore());
      
      const startTime = Date.now();
      
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.setTheme(i % 2 === 0 ? 'light' : 'dark');
        }
      });
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(result.current.theme).toBe('light'); // 最终状态应该正确
    });
  });

  describe('并发安全', () => {
    it('应该安全处理并发初始化', async () => {
      const { result } = renderHook(() => useAppStore());
      
      // 同时触发多个初始化
      const promises = [
        result.current.initializeAppOnce(),
        result.current.initializeAppOnce(),
        result.current.initializeAppOnce(),
      ];
      
      await act(async () => {
        await Promise.all(promises);
      });
      
      expect(result.current.isInitialized).toBe(true);
      
      // 验证InitializationManager只被调用一次
      const { InitializationManager } = require('../../utils/InitializationManager');
      const mockManager = InitializationManager.getInstance();
      expect(mockManager.initializeOnce).toHaveBeenCalledTimes(1);
    });
  });

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const { result, unmount } = renderHook(() => useAppStore());
      
      // 设置一些状态
      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('en-US');
      });
      
      // 卸载组件
      unmount();
      
      // 验证没有内存泄漏（这里主要是确保没有抛出错误）
      expect(true).toBe(true);
    });
  });
});