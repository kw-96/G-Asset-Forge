/**
 * Store监控Hook
 * 监控AppStore的状态变化，检测潜在的性能问题
 */

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';

export interface UseStoreMonitorOptions {
  enableRenderTracking?: boolean;
  enableStateChangeLogging?: boolean;
  renderThreshold?: number;
  stateChangeThreshold?: number;
  monitorInterval?: number;
}

export interface StoreMonitorStats {
  renderCount: number;
  stateChangeCount: number;
  lastStateChange: number;
  averageRenderInterval: number;
  suspiciousActivity: boolean;
}

export function useStoreMonitor(options: UseStoreMonitorOptions = {}) {
  const {
    enableRenderTracking = true,
    enableStateChangeLogging = false,
    renderThreshold = 20,
    stateChangeThreshold = 50,
    monitorInterval = 5000, // 5秒
  } = options;

  const store = useAppStore();
  const renderCountRef = useRef(0);
  const stateChangeCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const renderTimesRef = useRef<number[]>([]);
  const lastStateRef = useRef(store);
  const [stats, setStats] = useState<StoreMonitorStats>({
    renderCount: 0,
    stateChangeCount: 0,
    lastStateChange: Date.now(),
    averageRenderInterval: 0,
    suspiciousActivity: false,
  });

  // 跟踪渲染次数
  useEffect(() => {
    if (!enableRenderTracking) return;

    renderCountRef.current++;
    const now = Date.now();
    const interval = now - lastRenderTimeRef.current;
    
    renderTimesRef.current.push(interval);
    // 只保留最近20次渲染的时间间隔
    if (renderTimesRef.current.length > 20) {
      renderTimesRef.current = renderTimesRef.current.slice(-20);
    }

    lastRenderTimeRef.current = now;

    // 记录渲染日志
    reactLoopFixToolkit.debugLogger.logRender(
      'AppStore',
      renderCountRef.current,
      undefined,
      'store state change'
    );

    // 检查是否渲染过于频繁
    if (renderCountRef.current > renderThreshold) {
      reactLoopFixToolkit.debugLogger.warn(
        'store-monitor',
        `AppStore渲染次数过多: ${renderCountRef.current}`,
        { threshold: renderThreshold, interval },
        'useStoreMonitor'
      );
    }
  });

  // 监控状态变化
  useEffect(() => {
    const currentState = store;
    const hasStateChanged = JSON.stringify(currentState) !== JSON.stringify(lastStateRef.current);

    if (hasStateChanged) {
      stateChangeCountRef.current++;
      
      if (enableStateChangeLogging) {
        // 找出变化的字段
        const changedFields: string[] = [];
        Object.keys(currentState).forEach(key => {
          if ((currentState as any)[key] !== (lastStateRef.current as any)[key]) {
            changedFields.push(key);
          }
        });

        reactLoopFixToolkit.debugLogger.debug(
          'store-monitor',
          'AppStore状态变化',
          { 
            changedFields, 
            changeCount: stateChangeCountRef.current,
            stateSnapshot: currentState
          },
          'useStoreMonitor'
        );
      }

      // 检查状态变化是否过于频繁
      if (stateChangeCountRef.current > stateChangeThreshold) {
        reactLoopFixToolkit.debugLogger.warn(
          'store-monitor',
          `AppStore状态变化过于频繁: ${stateChangeCountRef.current}`,
          { threshold: stateChangeThreshold },
          'useStoreMonitor'
        );
      }

      lastStateRef.current = currentState;
    }
  });

  // 定期更新统计信息
  useEffect(() => {
    const interval = setInterval(() => {
      const averageRenderInterval = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length
        : 0;

      const suspiciousActivity = 
        renderCountRef.current > renderThreshold ||
        stateChangeCountRef.current > stateChangeThreshold ||
        averageRenderInterval < 16; // 小于16ms表示超过60fps

      const newStats: StoreMonitorStats = {
        renderCount: renderCountRef.current,
        stateChangeCount: stateChangeCountRef.current,
        lastStateChange: Date.now(),
        averageRenderInterval,
        suspiciousActivity,
      };

      setStats(newStats);

      // 如果检测到可疑活动，记录警告
      if (suspiciousActivity) {
        reactLoopFixToolkit.debugLogger.warn(
          'store-monitor',
          'AppStore检测到可疑活动',
          newStats,
          'useStoreMonitor'
        );

        // 检查是否存在无限循环
        const hasInfiniteLoop = reactLoopFixToolkit.detectInfiniteLoop();
        if (hasInfiniteLoop) {
          reactLoopFixToolkit.debugLogger.error(
            'store-monitor',
            'AppStore可能存在无限循环',
            { stats: newStats },
            'useStoreMonitor'
          );
        }
      }
    }, monitorInterval);

    return () => clearInterval(interval);
  }, [renderThreshold, stateChangeThreshold, monitorInterval]);

  // 重置统计信息
  const resetStats = () => {
    renderCountRef.current = 0;
    stateChangeCountRef.current = 0;
    renderTimesRef.current = [];
    lastRenderTimeRef.current = Date.now();
    
    setStats({
      renderCount: 0,
      stateChangeCount: 0,
      lastStateChange: Date.now(),
      averageRenderInterval: 0,
      suspiciousActivity: false,
    });

    reactLoopFixToolkit.debugLogger.info(
      'store-monitor',
      'AppStore监控统计已重置',
      {},
      'useStoreMonitor'
    );
  };

  // 生成监控报告
  const generateReport = () => {
    const report = {
      ...stats,
      renderTimes: [...renderTimesRef.current],
      monitoringOptions: {
        enableRenderTracking,
        enableStateChangeLogging,
        renderThreshold,
        stateChangeThreshold,
        monitorInterval,
      },
      recommendations: [] as string[],
    };

    // 生成建议
    if (stats.renderCount > renderThreshold) {
      report.recommendations.push(`渲染次数过多 (${stats.renderCount})，考虑优化组件或使用memo`);
    }

    if (stats.stateChangeCount > stateChangeThreshold) {
      report.recommendations.push(`状态变化过于频繁 (${stats.stateChangeCount})，考虑批量更新或防抖`);
    }

    if (stats.averageRenderInterval < 16) {
      report.recommendations.push(`渲染间隔过短 (${stats.averageRenderInterval.toFixed(2)}ms)，可能影响性能`);
    }

    if (stats.suspiciousActivity) {
      report.recommendations.push('检测到可疑活动，建议检查是否存在无限循环');
    }

    return report;
  };

  // 检查特定状态字段的变化频率
  const checkFieldChangeFrequency = (fieldName: string, timeWindow: number = 1000) => {
    // 这里可以实现更详细的字段级监控
    // 暂时返回基本信息
    return {
      fieldName,
      changeCount: stateChangeCountRef.current,
      timeWindow,
      frequency: stateChangeCountRef.current / (timeWindow / 1000),
    };
  };

  return {
    // 统计信息
    stats,
    
    // 方法
    resetStats,
    generateReport,
    checkFieldChangeFrequency,
    
    // 便捷属性
    isHealthy: !stats.suspiciousActivity,
    renderFrequency: stats.averageRenderInterval > 0 ? 1000 / stats.averageRenderInterval : 0,
    
    // 警告标志
    hasExcessiveRenders: stats.renderCount > renderThreshold,
    hasExcessiveStateChanges: stats.stateChangeCount > stateChangeThreshold,
    hasHighRenderFrequency: stats.averageRenderInterval < 16,
  };
}