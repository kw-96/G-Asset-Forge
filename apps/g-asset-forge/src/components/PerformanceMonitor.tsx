import React, { useEffect, useState } from 'react';
import { performanceService } from '@g-asset-forge/core';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  canvasObjects: number;
}

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * 性能监控显示组件
 * 显示实时性能指标和优化建议
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible = false,
  position = 'top-right',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    canvasObjects: 0,
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => {
      const report = performanceService.getPerformanceReport();
      setMetrics(report.metrics);
      setSuggestions(performanceService.getOptimizationSuggestions());
    };

    // 初始更新
    updateMetrics();

    // 定期更新
    const interval = setInterval(updateMetrics, 1000);

    // 监听性能事件
    const handleOptimization = () => {
      setIsOptimizing(true);
      setTimeout(() => setIsOptimizing(false), 2000);
    };

    performanceService.on('performanceOptimized', handleOptimization);

    return () => {
      clearInterval(interval);
      performanceService.off('performanceOptimized', handleOptimization);
    };
  }, [visible]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await performanceService.optimizePerformance();
    } catch (error) {
      console.error('性能优化失败:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      minWidth: '200px',
      maxWidth: '300px',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '10px', left: '10px' };
      case 'top-right':
        return { ...baseStyles, top: '10px', right: '10px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '10px', left: '10px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '10px', right: '10px' };
      default:
        return { ...baseStyles, top: '10px', right: '10px' };
    }
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return '#4CAF50'; // 绿色
    if (fps >= 30) return '#FF9800'; // 橙色
    return '#F44336'; // 红色
  };

  if (!visible) return null;

  return (
    <div style={getPositionStyles()}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        性能监控 {isOptimizing && '🔄'}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: getFpsColor(metrics.fps) }}>
          FPS: {metrics.fps.toFixed(1)}
        </div>
        <div>帧时间: {metrics.frameTime.toFixed(1)}ms</div>
        <div>内存: {formatMemory(metrics.memoryUsage)}</div>
        <div>渲染: {metrics.renderTime.toFixed(1)}ms</div>
        <div>对象: {metrics.canvasObjects}</div>
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            优化建议:
          </div>
          {suggestions.slice(0, 2).map((suggestion, index) => (
            <div key={index} style={{ fontSize: '10px', opacity: 0.8 }}>
              • {suggestion}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleOptimize}
        disabled={isOptimizing}
        style={{
          backgroundColor: isOptimizing ? '#666' : '#2196F3',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          cursor: isOptimizing ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {isOptimizing ? '优化中...' : '立即优化'}
      </button>
    </div>
  );
};
