import React, { useState, useEffect } from 'react';
import { fileOperationOptimizer, FileOperationMetrics } from '../../utils/performance/FileOperationOptimizer';

interface FileOperationMonitorProps {
  className?: string;
}

interface PerformanceStats {
  averageSaveTime: number;
  averageLoadTime: number;
  successRate: number;
  totalOperations: number;
  cacheHitRate: number;
}

/**
 * 文件操作性能监控组件
 * 显示文件保存/加载的性能统计信息
 */
export const FileOperationMonitor: React.FC<FileOperationMonitorProps> = ({ className }) => {
  const [stats, setStats] = useState<PerformanceStats>({
    averageSaveTime: 0,
    averageLoadTime: 0,
    successRate: 100,
    totalOperations: 0,
    cacheHitRate: 0
  });
  
  const [recentOperations, setRecentOperations] = useState<FileOperationMetrics[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const performanceStats = fileOperationOptimizer.getPerformanceStats();
      const history = fileOperationOptimizer.getOperationHistory();
      
      setStats(performanceStats);
      setRecentOperations(history.slice(-5)); // 显示最近5个操作
    };

    // 初始加载
    updateStats();

    // 每5秒更新一次统计
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (success: boolean, duration: number): string => {
    if (!success) return 'text-red-500';
    if (duration > 1000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPerformanceStatus = (): { status: string; color: string } => {
    if (stats.averageSaveTime > 1000) {
      return { status: '需要优化', color: 'text-red-500' };
    } else if (stats.averageSaveTime > 500) {
      return { status: '良好', color: 'text-yellow-500' };
    } else {
      return { status: '优秀', color: 'text-green-500' };
    }
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div 
        className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">文件操作性能</span>
          <span className={`text-xs ${performanceStatus.color}`}>
            {performanceStatus.status}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>保存: {formatDuration(stats.averageSaveTime)}</span>
          <span>成功率: {stats.successRate.toFixed(1)}%</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* 性能统计 */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">平均保存时间:</span>
                <span className={stats.averageSaveTime > 1000 ? 'text-red-500' : 'text-green-500'}>
                  {formatDuration(stats.averageSaveTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均加载时间:</span>
                <span className="text-gray-900">{formatDuration(stats.averageLoadTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总操作数:</span>
                <span className="text-gray-900">{stats.totalOperations}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">成功率:</span>
                <span className={stats.successRate < 95 ? 'text-red-500' : 'text-green-500'}>
                  {stats.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">缓存命中率:</span>
                <span className="text-gray-900">{stats.cacheHitRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">性能目标:</span>
                <span className={stats.averageSaveTime <= 1000 ? 'text-green-500' : 'text-red-500'}>
                  {stats.averageSaveTime <= 1000 ? '已达成' : '未达成'}
                </span>
              </div>
            </div>
          </div>

          {/* 最近操作 */}
          {recentOperations.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">最近操作</div>
              <div className="space-y-1">
                {recentOperations.map((op, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-1 h-1 rounded-full ${op.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-600 truncate max-w-32">
                        {op.operationType === 'save' ? '保存' : '加载'}: {op.filePath.split('/').pop()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={getStatusColor(op.success, op.duration)}>
                        {formatDuration(op.duration)}
                      </span>
                      {op.retryCount > 0 && (
                        <span className="text-yellow-500">({op.retryCount}次重试)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => fileOperationOptimizer.clearCache()}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              清理缓存
            </button>
            <button
              type="button"
              onClick={() => {
                const cacheStatus = fileOperationOptimizer.getCacheStatus();
                alert(`缓存状态:\n大小: ${(cacheStatus.size / 1024 / 1024).toFixed(1)}MB\n项目数: ${cacheStatus.itemCount}\n使用率: ${cacheStatus.utilizationRate.toFixed(1)}%`);
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              缓存状态
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileOperationMonitor;