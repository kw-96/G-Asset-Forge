/**
 * useRadixUIPerformance Hook
 * 为Radix UI组件提供性能监控功能
 */

import { useEffect, useRef, useCallback } from 'react';
import { radixUIPerformanceMonitor } from '../utils/RadixUIPerformanceMonitor';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';

export interface UseRadixUIPerformanceOptions {
  componentName: string;
  enabled?: boolean;
  alertThreshold?: number;
  debugMode?: boolean;
}

export interface UseRadixUIPerformanceReturn {
  renderCount: number;
  startRenderMeasurement: () => void;
  endRenderMeasurement: () => void;
  resetMetrics: () => void;
  getMetrics: () => any;
}

/**
 * 监控Radix UI组件性能的Hook
 */
export const useRadixUIPerformance = (
  options: UseRadixUIPerformanceOptions
): UseRadixUIPerformanceReturn => {
  const {
    componentName,
    enabled = true,
    alertThreshold = 50,
    debugMode = false,
  } = options;

  const renderCountRef = useRef(0);
  const measurementRef = useRef<(() => void) | null>(null);
  const lastRenderTimeRef = useRef(Date.now());

  // 开始渲染测量
  const startRenderMeasurement = useCallback(() => {
    if (!enabled) return;

    measurementRef.current = radixUIPerformanceMonitor.startMonitoring(componentName);
    
    if (debugMode) {
      reactLoopFixToolkit.debugLogger.debug(
        'radix-performance-hook',
        `开始测量${componentName}渲染性能`,
        { renderCount: renderCountRef.current },
        'useRadixUIPerformance'
      );
    }
  }, [componentName, enabled, debugMode]);

  // 结束渲染测量
  const endRenderMeasurement = useCallback(() => {
    if (!enabled || !measurementRef.current) return;

    measurementRef.current();
    measurementRef.current = null;
    renderCountRef.current += 1;

    // 检查渲染频率
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (timeSinceLastRender < 16 && renderCountRef.current > alertThreshold) {
      reactLoopFixToolkit.debugLogger.warn(
        'radix-performance-hook',
        `${componentName}渲染频率异常`,
        {
          renderCount: renderCountRef.current,
          timeSinceLastRender,
          alertThreshold,
        },
        'useRadixUIPerformance'
      );
    }

    lastRenderTimeRef.current = now;

    if (debugMode) {
      reactLoopFixToolkit.debugLogger.debug(
        'radix-performance-hook',
        `完成测量${componentName}渲染性能`,
        { 
          renderCount: renderCountRef.current,
          timeSinceLastRender,
        },
        'useRadixUIPerformance'
      );
    }
  }, [componentName, enabled, alertThreshold, debugMode]);

  // 重置指标
  const resetMetrics = useCallback(() => {
    renderCountRef.current = 0;
    radixUIPerformanceMonitor.resetComponentMetrics(componentName);
    
    if (debugMode) {
      reactLoopFixToolkit.debugLogger.info(
        'radix-performance-hook',
        `重置${componentName}性能指标`,
        {},
        'useRadixUIPerformance'
      );
    }
  }, [componentName, debugMode]);

  // 获取指标
  const getMetrics = useCallback(() => {
    return radixUIPerformanceMonitor.getComponentMetrics(componentName);
  }, [componentName]);

  // 组件挂载时开始监控
  useEffect(() => {
    if (!enabled) return;

    startRenderMeasurement();
    
    return () => {
      endRenderMeasurement();
    };
  }, []); // 空依赖数组，只在挂载和卸载时执行

  // 每次渲染时测量性能
  useEffect(() => {
    if (!enabled) return;

    startRenderMeasurement();
    
    // 使用微任务确保在渲染完成后执行
    Promise.resolve().then(() => {
      endRenderMeasurement();
    });
  });

  return {
    renderCount: renderCountRef.current,
    startRenderMeasurement,
    endRenderMeasurement,
    resetMetrics,
    getMetrics,
  };
};

/**
 * 简化版的性能监控Hook，只监控渲染次数
 */
export const useRadixUIRenderCount = (componentName: string, enabled: boolean = true) => {
  const renderCountRef = useRef(0);
  const lastLogTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCountRef.current += 1;
    const now = Date.now();

    // 每5秒记录一次渲染统计
    if (now - lastLogTimeRef.current > 5000) {
      reactLoopFixToolkit.debugLogger.info(
        'radix-render-count',
        `${componentName}渲染统计`,
        {
          renderCount: renderCountRef.current,
          timeSpan: now - lastLogTimeRef.current,
          averageRenderInterval: (now - lastLogTimeRef.current) / renderCountRef.current,
        },
        'useRadixUIRenderCount'
      );
      
      lastLogTimeRef.current = now;
      renderCountRef.current = 0;
    }
  });

  return renderCountRef.current;
};

/**
 * 检测Radix UI组件异常渲染的Hook
 */
export const useRadixUIAnomalyDetection = (
  componentName: string,
  options: {
    maxRenderCount?: number;
    timeWindow?: number;
    enabled?: boolean;
  } = {}
) => {
  const {
    maxRenderCount = 20,
    timeWindow = 1000,
    enabled = true,
  } = options;

  const renderTimesRef = useRef<number[]>([]);
  const anomalyDetectedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    renderTimesRef.current.push(now);

    // 清理超出时间窗口的记录
    renderTimesRef.current = renderTimesRef.current.filter(
      time => now - time <= timeWindow
    );

    // 检测异常渲染
    if (renderTimesRef.current.length > maxRenderCount && !anomalyDetectedRef.current) {
      anomalyDetectedRef.current = true;
      
      reactLoopFixToolkit.debugLogger.error(
        'radix-anomaly-detection',
        `${componentName}检测到异常渲染模式`,
        {
          renderCount: renderTimesRef.current.length,
          timeWindow,
          maxRenderCount,
          renderTimes: renderTimesRef.current.slice(-5), // 最近5次渲染时间
        },
        'useRadixUIAnomalyDetection'
      );

      // 尝试自动恢复
      setTimeout(() => {
        anomalyDetectedRef.current = false;
        renderTimesRef.current = [];
      }, timeWindow * 2);
    }
  });

  return {
    isAnomalyDetected: anomalyDetectedRef.current,
    currentRenderCount: renderTimesRef.current.length,
    resetDetection: () => {
      anomalyDetectedRef.current = false;
      renderTimesRef.current = [];
    },
  };
};