/**
 * 批量更新Hook
 * 提供批量状态更新功能，减少不必要的重新渲染
 */

import { useCallback, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';

export interface UseBatchUpdateOptions {
  debounceMs?: number;
  maxBatchSize?: number;
  enableLogging?: boolean;
}

export function useBatchUpdate(options: UseBatchUpdateOptions = {}) {
  const {
    debounceMs = 16, // 约60fps
    maxBatchSize = 10,
    enableLogging = false
  } = options;

  const { batchUpdate } = useAppStore();
  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateCountRef = useRef(0);

  // 执行批量更新
  const flushUpdates = useCallback(() => {
    if (Object.keys(pendingUpdatesRef.current).length === 0) {
      return;
    }

    const updates = { ...pendingUpdatesRef.current };
    const updateCount = Object.keys(updates).length;
    
    if (enableLogging) {
      reactLoopFixToolkit.debugLogger.debug(
        'batch-update',
        '执行批量更新',
        { updateCount, updates },
        'useBatchUpdate'
      );
    }

    // 清空待更新队列
    pendingUpdatesRef.current = {};
    updateCountRef.current = 0;

    // 清除定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 执行批量更新
    batchUpdate(updates);
  }, [batchUpdate, enableLogging]);

  // 添加更新到批次
  const addToBatch = useCallback((key: string, value: any) => {
    // 添加到待更新队列
    pendingUpdatesRef.current[key] = value;
    updateCountRef.current++;

    if (enableLogging) {
      reactLoopFixToolkit.debugLogger.debug(
        'batch-update',
        `添加更新到批次: ${key}`,
        { value, queueSize: updateCountRef.current },
        'useBatchUpdate'
      );
    }

    // 如果达到最大批次大小，立即执行
    if (updateCountRef.current >= maxBatchSize) {
      if (enableLogging) {
        reactLoopFixToolkit.debugLogger.info(
          'batch-update',
          '达到最大批次大小，立即执行更新',
          { maxBatchSize, currentSize: updateCountRef.current },
          'useBatchUpdate'
        );
      }
      flushUpdates();
      return;
    }

    // 设置防抖定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      flushUpdates();
    }, debounceMs);
  }, [debounceMs, maxBatchSize, enableLogging, flushUpdates]);

  // 批量更新多个值
  const batchUpdateMultiple = useCallback((updates: Record<string, any>) => {
    Object.entries(updates).forEach(([key, value]) => {
      pendingUpdatesRef.current[key] = value;
    });

    updateCountRef.current += Object.keys(updates).length;

    if (enableLogging) {
      reactLoopFixToolkit.debugLogger.debug(
        'batch-update',
        '批量添加多个更新',
        { updateKeys: Object.keys(updates), queueSize: updateCountRef.current },
        'useBatchUpdate'
      );
    }

    // 如果达到最大批次大小，立即执行
    if (updateCountRef.current >= maxBatchSize) {
      flushUpdates();
      return;
    }

    // 设置防抖定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      flushUpdates();
    }, debounceMs);
  }, [maxBatchSize, enableLogging, flushUpdates, debounceMs]);

  // 立即执行所有待更新的更新
  const flushImmediately = useCallback(() => {
    if (enableLogging) {
      reactLoopFixToolkit.debugLogger.info(
        'batch-update',
        '立即执行所有待更新的更新',
        { queueSize: updateCountRef.current },
        'useBatchUpdate'
      );
    }
    flushUpdates();
  }, [enableLogging, flushUpdates]);

  // 清除所有待更新的更新
  const clearBatch = useCallback(() => {
    const clearedCount = updateCountRef.current;
    
    pendingUpdatesRef.current = {};
    updateCountRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (enableLogging) {
      reactLoopFixToolkit.debugLogger.info(
        'batch-update',
        '清除批量更新队列',
        { clearedCount },
        'useBatchUpdate'
      );
    }
  }, [enableLogging]);

  // 获取当前批次状态
  const getBatchStatus = useCallback(() => {
    return {
      pendingCount: updateCountRef.current,
      pendingKeys: Object.keys(pendingUpdatesRef.current),
      hasPendingUpdates: updateCountRef.current > 0,
      hasTimer: timeoutRef.current !== null,
    };
  }, []);

  return {
    // 主要方法
    addToBatch,
    batchUpdateMultiple,
    flushImmediately,
    clearBatch,
    
    // 状态查询
    getBatchStatus,
    
    // 便捷方法
    updateUI: (updates: {
      sidebarCollapsed?: boolean;
      toolbarCollapsed?: boolean;
      propertiesPanelCollapsed?: boolean;
      activeTool?: string;
      isLoading?: boolean;
    }) => batchUpdateMultiple(updates),
    
    updateCanvas: (updates: {
      canvasZoom?: number;
      canvasX?: number;
      canvasY?: number;
      showGrid?: boolean;
      showRulers?: boolean;
    }) => batchUpdateMultiple(updates),
    
    updateNavigation: (updates: {
      currentPage?: 'home' | 'editor' | 'settings';
      isFirstTime?: boolean;
    }) => batchUpdateMultiple(updates),
  };
}