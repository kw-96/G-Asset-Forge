/**
 * useAppInitialization Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react';
import { useAppInitialization } from '../useAppInitialization';

// Mock useAppStore
const mockInitializeAppOnce = jest.fn();
const mockAppStore = {
  isInitialized: false,
  isInitializing: false,
  initializationError: null,
  initializeAppOnce: mockInitializeAppOnce,
};

jest.mock('../../stores/appStore', () => ({
  useAppStore: () => mockAppStore,
}));

// Mock ReactLoopFixToolkit
jest.mock('../../utils/ReactLoopFix', () => ({
  reactLoopFixToolkit: {
    debugLogger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppStore.isInitialized = false;
    mockAppStore.isInitializing = false;
    mockAppStore.initializationError = null;
    mockInitializeAppOnce.mockResolvedValue(undefined);
  });

  describe('自动初始化', () => {
    it('应该在启用自动初始化时自动初始化应用', async () => {
      const onInitialized = jest.fn();
      
      const { result } = renderHook(() => 
        useAppInitialization({ 
          enableAutoInit: true,
          onInitialized 
        })
      );

      // 等待异步初始化完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializeAppOnce).toHaveBeenCalledTimes(1);
      expect(result.current.hasAttemptedInit).toBe(true);
    });

    it('应该在禁用自动初始化时不自动初始化', async () => {
      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializeAppOnce).not.toHaveBeenCalled();
      expect(result.current.hasAttemptedInit).toBe(false);
    });

    it('应该在已初始化时跳过自动初始化', async () => {
      mockAppStore.isInitialized = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializeAppOnce).not.toHaveBeenCalled();
      expect(result.current.hasAttemptedInit).toBe(false);
    });

    it('应该在正在初始化时跳过自动初始化', async () => {
      mockAppStore.isInitializing = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializeAppOnce).not.toHaveBeenCalled();
      expect(result.current.hasAttemptedInit).toBe(false);
    });

    it('应该处理自动初始化错误', async () => {
      const error = new Error('初始化失败');
      const onError = jest.fn();
      mockInitializeAppOnce.mockRejectedValue(error);

      const { result } = renderHook(() => 
        useAppInitialization({ 
          enableAutoInit: true,
          onError 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(onError).toHaveBeenCalledWith(error);
      expect(result.current.hasAttemptedInit).toBe(true);
    });
  });

  describe('手动初始化', () => {
    it('应该支持手动初始化', async () => {
      const onInitialized = jest.fn();
      
      const { result } = renderHook(() => 
        useAppInitialization({ 
          enableAutoInit: false,
          onInitialized 
        })
      );

      await act(async () => {
        await result.current.manualInit();
      });

      expect(mockInitializeAppOnce).toHaveBeenCalledTimes(1);
      expect(onInitialized).toHaveBeenCalledTimes(1);
    });

    it('应该在已初始化时跳过手动初始化', async () => {
      mockAppStore.isInitialized = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      await act(async () => {
        await result.current.manualInit();
      });

      expect(mockInitializeAppOnce).not.toHaveBeenCalled();
    });

    it('应该在正在初始化时跳过手动初始化', async () => {
      mockAppStore.isInitializing = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      await act(async () => {
        await result.current.manualInit();
      });

      expect(mockInitializeAppOnce).not.toHaveBeenCalled();
    });

    it('应该处理手动初始化错误', async () => {
      const error = new Error('手动初始化失败');
      const onError = jest.fn();
      mockInitializeAppOnce.mockRejectedValue(error);

      const { result } = renderHook(() => 
        useAppInitialization({ 
          enableAutoInit: false,
          onError 
        })
      );

      await act(async () => {
        try {
          await result.current.manualInit();
        } catch (e) {
          // 预期的错误
        }
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('状态属性', () => {
    it('应该正确反映初始化状态', () => {
      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.initializationError).toBeNull();
      expect(result.current.canInitialize).toBe(true);
      expect(result.current.hasError).toBe(false);
    });

    it('应该正确反映已初始化状态', () => {
      mockAppStore.isInitialized = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.canInitialize).toBe(false);
    });

    it('应该正确反映正在初始化状态', () => {
      mockAppStore.isInitializing = true;

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      expect(result.current.isInitializing).toBe(true);
      expect(result.current.canInitialize).toBe(false);
    });

    it('应该正确反映错误状态', () => {
      mockAppStore.initializationError = '初始化错误';

      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: false })
      );

      expect(result.current.initializationError).toBe('初始化错误');
      expect(result.current.hasError).toBe(true);
    });
  });

  describe('重置功能', () => {
    it('应该重置初始化状态', async () => {
      const { result } = renderHook(() => 
        useAppInitialization({ enableAutoInit: true })
      );

      // 等待自动初始化尝试
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasAttemptedInit).toBe(true);

      // 重置状态
      act(() => {
        result.current.resetInitialization();
      });

      expect(result.current.hasAttemptedInit).toBe(false);
    });
  });
});