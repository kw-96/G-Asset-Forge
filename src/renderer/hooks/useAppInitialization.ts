/**
 * 应用初始化Hook
 * 提供安全的应用初始化功能，防止重复初始化
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
// 已移除ReactLoopFix依赖

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
        
        console.info(
          '[app-init] 开始自动初始化应用',
          { enableAutoInit },
          'useAppInitialization'
        );

        await initializeAppOnce();

        if (onInitialized) {
          onInitialized();
        }

        console.info(
          '[app-init] 应用自动初始化完成',
          {},
          'useAppInitialization'
        );

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        console.error(
          '[app-init] 应用自动初始化失败',
          { error: err.message },
          'useAppInitialization'
        );

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
      console.warn(
        '[app-init] 尝试手动初始化已初始化的应用',
        { isInitialized, isInitializing },
        'useAppInitialization'
      );
      return;
    }

    try {
      console.info(
        '[app-init] 开始手动初始化应用',
        {},
        'useAppInitialization'
      );

      await initializeAppOnce();

      if (onInitialized) {
        onInitialized();
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error(
        '[app-init] 应用手动初始化失败',
        { error: err.message },
        'useAppInitialization'
      );

      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  };

  // 重置初始化状态（主要用于测试）
  const resetInitialization = () => {
    setHasAttemptedInit(false);
    console.info(
      '[app-init] 重置初始化状态',
      {},
      'useAppInitialization'
    );
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