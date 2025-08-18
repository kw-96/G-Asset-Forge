/**
 * 应用初始化Hook
 * 提供安全的应用初始化功能，防止重复初始化
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';

export interface UseAppInitializationOptions {
  enableAutoInit?: boolean;
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

export function useAppInitialization(options: UseAppInitializationOptions = {}) {
  const {
    enableAutoInit = true,
    onInitialized,
    onError
  } = options;

  const {
    isInitialized,
    isInitializing,
    initializationError,
    initializeAppOnce
  } = useAppStore();

  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  // 自动初始化
  useEffect(() => {
    if (!enableAutoInit || hasAttemptedInit || isInitialized || isInitializing) {
      return;
    }

    const performInitialization = async () => {
      try {
        setHasAttemptedInit(true);

        await initializeAppOnce();

        if (onInitialized) {
          onInitialized();
        }

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (onError) {
          onError(err);
        }
      }
    };

    performInitialization();
  }, [enableAutoInit, hasAttemptedInit, isInitialized, isInitializing, initializeAppOnce, onInitialized, onError]);

  // 手动初始化方法
  const manualInit = async () => {
    if (isInitialized || isInitializing) {
      return;
    }

    try {
      await initializeAppOnce();

      if (onInitialized) {
        onInitialized();
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  };

  // 重置初始化状态（主要用于测试）
  const resetInitialization = () => {
    setHasAttemptedInit(false);
  };

  return {
    // 状态
    isInitialized,
    isInitializing,
    initializationError,
    hasAttemptedInit,
    
    // 方法
    manualInit,
    resetInitialization,
    
    // 计算属性
    canInitialize: !isInitialized && !isInitializing,
    hasError: !!initializationError,
  };
}