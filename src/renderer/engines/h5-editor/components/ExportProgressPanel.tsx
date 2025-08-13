// H5编辑器导出进度面板组件
import React, { useState, useEffect, useRef } from 'react';
import { 
  type IExportOptimizationSuggestion, 
  type IExportPerformanceMetrics 
} from '../export/ExportOptimizer';
import { type IImageExportProgress, type IImageExportResult } from '../export/ImageExportEngine';

interface IExportProgressPanelProps {
  isExporting: boolean;
  progress?: IImageExportProgress | null;
  result?: IImageExportResult | null;
  suggestions?: IExportOptimizationSuggestion[];
  metrics?: IExportPerformanceMetrics | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onApplySuggestion?: (suggestion: IExportOptimizationSuggestion) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ExportProgressPanel: React.FC<IExportProgressPanelProps> = ({
  isExporting,
  progress,
  result,
  suggestions = [],
  metrics,
  onCancel,
  onRetry,
  onApplySuggestion,
  className,
  style
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number>();

  // 进度条动画
  useEffect(() => {
    if (isExporting && progress) {
      const animate = () => {
        setAnimationProgress(prev => {
          const target = progress.progress;
          const diff = target - prev;
          const step = diff * 0.1;
          return Math.abs(step) < 0.1 ? target : prev + step;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isExporting, progress]);

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取建议的图标和颜色
  const getSuggestionStyle = (suggestion: IExportOptimizationSuggestion) => {
    switch (suggestion.type) {
      case 'error':
        return { icon: '❌', color: '#dc3545', bgColor: '#f8d7da' };
      case 'warning':
        return { icon: '⚠️', color: '#856404', bgColor: '#fff3cd' };
      case 'info':
        return { icon: 'ℹ️', color: '#0c5460', bgColor: '#d1ecf1' };
      default:
        return { icon: 'ℹ️', color: '#6c757d', bgColor: '#f8f9fa' };
    }
  };

  // 获取影响级别的颜色
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className={className} style={{ padding: '16px', ...style }}>
      {/* 导出进行中 */}
      {isExporting && progress && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              正在导出...
            </h3>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #dc3545',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                取消
              </button>
            )}
          </div>

          {/* 进度条 */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${animationProgress}%`,
              height: '100%',
              backgroundColor: '#007bff',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* 进度信息 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
            <span>{progress.message}</span>
            <span>{Math.round(animationProgress)}%</span>
          </div>

          {/* 阶段指示器 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '12px',
            fontSize: '10px'
          }}>
            {['preparing', 'rendering', 'processing', 'compressing', 'complete'].map((stage) => (
              <div
                key={stage}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: progress.stage === stage ? 1 : 0.5
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: progress.stage === stage ? '#007bff' : '#e0e0e0',
                  marginBottom: '4px'
                }} />
                <span style={{ textTransform: 'capitalize' }}>
                  {stage === 'preparing' ? '准备' :
                   stage === 'rendering' ? '渲染' :
                   stage === 'processing' ? '处理' :
                   stage === 'compressing' ? '压缩' : '完成'}
                </span>
              </div>
            ))}
          </div>

          {/* 预计剩余时间 */}
          {progress.estimatedTimeRemaining && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '11px', 
              color: '#666',
              textAlign: 'center'
            }}>
              预计剩余时间: {formatTime(progress.estimatedTimeRemaining)}
            </div>
          )}
        </div>
      )}

      {/* 导出结果 */}
      {result && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 'bold',
                color: result.success ? '#155724' : '#721c24'
              }}>
                {result.success ? '✅ 导出成功' : '❌ 导出失败'}
              </h3>
              
              {!result.success && onRetry && (
                <button
                  onClick={onRetry}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #007bff',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  重试
                </button>
              )}
            </div>

            {result.success ? (
              <div style={{ fontSize: '11px', color: '#155724' }}>
                <div>格式: {result.format.toUpperCase()}</div>
                <div>尺寸: {result.dimensions.width} × {result.dimensions.height}</div>
                <div>文件大小: {formatFileSize(result.size)}</div>
                <div>处理时间: {formatTime(result.processingTime)}</div>
                {result.actualQuality && result.actualQuality < 1 && (
                  <div>实际质量: {Math.round(result.actualQuality * 100)}%</div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#721c24' }}>
                {result.error}
              </div>
            )}

            {/* 警告信息 */}
            {result.warnings && result.warnings.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#856404' }}>警告:</div>
                {result.warnings.map((warning, index) => (
                  <div key={index} style={{ fontSize: '10px', color: '#856404' }}>
                    • {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 性能指标 */}
      {metrics && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              性能指标
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                padding: '2px 6px',
                border: '1px solid #6c757d',
                backgroundColor: 'white',
                color: '#6c757d',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {showDetails ? '隐藏' : '详情'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: '#666' }}>渲染时间:</span>
              <span style={{ 
                marginLeft: '4px',
                color: metrics.renderTime > 1000 ? '#dc3545' : '#28a745'
              }}>
                {formatTime(metrics.renderTime)}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>总时间:</span>
              <span style={{ 
                marginLeft: '4px',
                color: metrics.totalTime > 3000 ? '#dc3545' : '#28a745'
              }}>
                {formatTime(metrics.totalTime)}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>文件大小:</span>
              <span style={{ 
                marginLeft: '4px',
                color: metrics.fileSize > 10 * 1024 * 1024 ? '#dc3545' : '#28a745'
              }}>
                {formatFileSize(metrics.fileSize)}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>压缩比:</span>
              <span style={{ marginLeft: '4px' }}>
                {Math.round(metrics.compressionRatio * 100)}%
              </span>
            </div>
          </div>

          {showDetails && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <div>处理时间: {formatTime(metrics.processTime)}</div>
              <div>内存使用: {formatFileSize(metrics.memoryUsage)}</div>
              <div>像素数量: {(metrics.pixelCount / 1000000).toFixed(1)}MP</div>
            </div>
          )}
        </div>
      )}

      {/* 优化建议 */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            优化建议 ({suggestions.length})
          </h4>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {suggestions.map((suggestion, index) => {
              const style = getSuggestionStyle(suggestion);
              return (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    backgroundColor: style.bgColor,
                    border: `1px solid ${style.color}`,
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '4px' }}>{style.icon}</span>
                      <span style={{ fontWeight: 'bold', color: style.color }}>
                        {suggestion.category}
                      </span>
                      <span style={{
                        marginLeft: '8px',
                        padding: '1px 4px',
                        backgroundColor: getImpactColor(suggestion.impact),
                        color: 'white',
                        borderRadius: '2px',
                        fontSize: '9px'
                      }}>
                        {suggestion.impact === 'high' ? '高' :
                         suggestion.impact === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    
                    {suggestion.autoFix && onApplySuggestion && (
                      <button
                        onClick={() => onApplySuggestion(suggestion)}
                        style={{
                          padding: '2px 6px',
                          border: `1px solid ${style.color}`,
                          backgroundColor: 'white',
                          color: style.color,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '9px'
                        }}
                      >
                        应用
                      </button>
                    )}
                  </div>
                  
                  <div style={{ color: style.color, marginBottom: '4px' }}>
                    {suggestion.message}
                  </div>
                  
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    💡 {suggestion.suggestion}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div style={{ fontSize: '10px', color: '#666', lineHeight: '1.4' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>提示:</div>
        <div>• 标准画布导出目标时间: 3秒内</div>
        <div>• 文件大小超过10MB时会显示警告</div>
        <div>• 点击"应用"按钮可自动应用优化建议</div>
        <div>• 性能指标帮助您了解导出效率</div>
      </div>
    </div>
  );
};

export default ExportProgressPanel;