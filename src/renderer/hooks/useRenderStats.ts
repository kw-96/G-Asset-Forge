/**
 * 渲染统计Hook
 * 统计组件渲染次数和性能指标
 */

import { useRef, useEffect, useCallback } from 'react';
import { devDebugTools } from '../utils/DevDebugTools';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';

export interface RenderStatsOptions {
  componentName: string;
  enabled?: boolean;
  logThreshold?: number;
  performanceThreshold?: number;
}

export interface RenderStats {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  isPerformanceIssue: boolean;
}

export const useRenderStats = (options: RenderStatsOptions) => {
  const {
    componentName,
    enabled = process.env['NODE_ENV'] === 'development',
    logThreshold = 50,
    performanceThreshold = 16, // 60fps = 16.67ms per frame
  } = options;

  const renderCountRef = useRef(0);
  const totalRenderTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const renderStartTimeRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  // 开始渲染测量
  const startRenderMeasurement = useCallback(() => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  }, [enabled]);

  // 结束渲染测量
  const endRenderMeasurement = useCallback(() => {
    if (!enabled || renderStartTimeRef.current === 0) return;

    const renderTime = performance.now() - renderStartTimeRef.current;
    renderCountRef.current += 1;
    totalRenderTimeRef.current += renderTime;
    lastRenderTimeRef.current = renderTime;

    // 记录性能指标
    devDebugTools.recordPerformanceMetrics(componentName, renderTime);

    // 检查性能问题
    if (renderTime > performanceThreshold) {
      reactLoopFixToolkit.debugLogger.warn(
        'render-performance',
        `${componentName}渲染时间过长: ${renderTime.toFixed(2)}ms`,
        {
          componentName,
          renderTime,
          renderCount: renderCountRef.current,
          threshold: performanceThreshold,
        },
        'useRenderStats'
      );
    }

    // 检查渲染次数
    if (renderCountRef.current % logThreshold === 0) {
      const averageTime = totalRenderTimeRef.current / renderCountRef.current;
      reactLoopFixToolkit.debugLogger.info(
        'render-stats',
        `${componentName}渲染统计`,
        {
          componentName,
          renderCount: renderCountRef.current,
          averageRenderTime: averageTime,
          lastRenderTime: renderTime,
          totalTime: totalRenderTimeRef.current,
        },
        'useRenderStats'
      );
    }

    renderStartTimeRef.current = 0;
  }, [enabled, componentName, performanceThreshold, logThreshold]);

  // 获取当前统计信息
  const getStats = useCallback((): RenderStats => {
    const averageRenderTime = renderCountRef.current > 0 
      ? totalRenderTimeRef.current / renderCountRef.current 
      : 0;

    return {
      renderCount: renderCountRef.current,
      totalRenderTime: totalRenderTimeRef.current,
      averageRenderTime,
      lastRenderTime: lastRenderTimeRef.current,
      isPerformanceIssue: averageRenderTime > performanceThreshold || renderCountRef.current > 100,
    };
  }, [performanceThreshold]);

  // 重置统计
  const resetStats = useCallback(() => {
    renderCountRef.current = 0;
    totalRenderTimeRef.current = 0;
    lastRenderTimeRef.current = 0;
    mountTimeRef.current = Date.now();

    reactLoopFixToolkit.debugLogger.info(
      'render-stats',
      `重置${componentName}渲染统计`,
      { componentName },
      'useRenderStats'
    );
  }, [componentName]);

  // 每次渲染时测量
  useEffect(() => {
    startRenderMeasurement();
    
    // 使用微任务确保在渲染完成后执行
    Promise.resolve().then(() => {
      endRenderMeasurement();
    });
  });

  // 组件挂载时记录
  useEffect(() => {
    if (!enabled) return;

    reactLoopFixToolkit.debugLogger.info(
      'render-stats',
      `${componentName}组件挂载`,
      { componentName, mountTime: mountTimeRef.current },
      'useRenderStats'
    );

    return () => {
      const stats = getStats();
      reactLoopFixToolkit.debugLogger.info(
        'render-stats',
        `${componentName}组件卸载`,
        {
          componentName,
          finalStats: stats,
          lifeTime: Date.now() - mountTimeRef.current,
        },
        'useRenderStats'
      );
    };
  }, [enabled, componentName, getStats]);

  return {
    renderCount: renderCountRef.current,
    getStats,
    resetStats,
    startRenderMeasurement,
    endRenderMeasurement,
  };
};