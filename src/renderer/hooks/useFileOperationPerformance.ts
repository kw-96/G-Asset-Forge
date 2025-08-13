import { useState, useEffect, useCallback } from 'react';
import { fileOperationOptimizer, FileOperationMetrics } from '../utils/performance/FileOperationOptimizer';

interface FileOperationPerformanceHook {
  // 性能统计
  averageSaveTime: number;
  averageLoadTime: number;
  successRate: number;
  totalOperations: number;
  
  // 最近操作
  recentOperations: FileOperationMetrics[];
  
  // 性能状态
  isPerformanceHealthy: boolean;
  performanceWarnings: string[];
  
  // 操作方法
  clearCache: () => void;
  clearMetrics: () => void;
  
  // 实时监控
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * 文件操作性能监控Hook
 * 提供文件操作性能的实时监控和统计功能
 */
export const useFileOperationPerformance = (): FileOperationPerformanceHook => {
  const [stats, setStats] = useState({
    averageSaveTime: 0,
    averageLoadTime: 0,
    successRate: 100,
    totalOperations: 0,
    cacheHitRate: 0
  });
  
  const [recentOperations, setRecentOperations] = useState<FileOperationMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  // 更新性能统计
  const updateStats = useCallback(() => {
    const performanceStats = fileOperationOptimizer.getPerformanceStats();
    const history = fileOperationOptimizer.getOperationHistory();
    
    setStats(performanceStats);
    setRecentOperations(history.slice(-10)); // 保留最近10个操作
  }, []);

  // 开始监控
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    updateStats(); // 立即更新一次
    
    const interval = setInterval(updateStats, 2000); // 每2秒更新一次
    setMonitoringInterval(interval);
    
    console.log('文件操作性能监控已启动');
  }, [isMonitoring, updateStats]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    
    console.log('文件操作性能监控已停止');
  }, [isMonitoring, monitoringInterval]);

  // 清理缓存
  const clearCache = useCallback(() => {
    fileOperationOptimizer.clearCache();
    updateStats();
    console.log('文件操作缓存已清理');
  }, [updateStats]);

  // 清理指标
  const clearMetrics = useCallback(() => {
    // 注意：FileOperationOptimizer 没有 clearMetrics 方法
    // 这里我们可以通过重新创建实例或其他方式来清理
    console.log('文件操作指标清理功能待实现');
    updateStats();
  }, [updateStats]);

  // 计算性能健康状态
  const isPerformanceHealthy = stats.averageSaveTime <= 1000 && stats.successRate >= 95;

  // 生成性能警告
  const performanceWarnings: string[] = [];
  if (stats.averageSaveTime > 1000) {
    performanceWarnings.push(`平均保存时间过长: ${stats.averageSaveTime.toFixed(0)}ms (目标: ≤1000ms)`);
  }
  if (stats.successRate < 95) {
    performanceWarnings.push(`成功率过低: ${stats.successRate.toFixed(1)}% (目标: ≥95%)`);
  }
  if (stats.averageLoadTime > 2000) {
    performanceWarnings.push(`平均加载时间过长: ${stats.averageLoadTime.toFixed(0)}ms`);
  }

  // 组件挂载时开始监控
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  return {
    // 性能统计
    averageSaveTime: stats.averageSaveTime,
    averageLoadTime: stats.averageLoadTime,
    successRate: stats.successRate,
    totalOperations: stats.totalOperations,
    
    // 最近操作
    recentOperations,
    
    // 性能状态
    isPerformanceHealthy,
    performanceWarnings,
    
    // 操作方法
    clearCache,
    clearMetrics,
    
    // 实时监控
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};

export default useFileOperationPerformance;