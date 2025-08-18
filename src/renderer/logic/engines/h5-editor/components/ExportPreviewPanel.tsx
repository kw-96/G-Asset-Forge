// H5编辑器导出预览面板组件
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ExportOptimizer, 
  type ExportPreviewOptions, 
  type ExportPerformanceMetrics 
} from '../export/ExportOptimizer';
import { type ImageExportOptions } from '../export/ImageExportEngine';
import { type H5Page } from '../types';

interface IExportPreviewPanelProps {
  sourceCanvas?: HTMLCanvasElement | null;
  currentPage?: H5Page | null;
  exportOptions: ImageExportOptions;
  onOptionsChange?: (options: ImageExportOptions) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ExportPreviewPanel: React.FC<IExportPreviewPanelProps> = ({
  sourceCanvas,
  currentPage,
  exportOptions,
  onOptionsChange: _onOptionsChange,
  className,
  style
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [metrics, setMetrics] = useState<ExportPerformanceMetrics | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');
  const [showMetrics, setShowMetrics] = useState(false);
  const [previewOptions, setPreviewOptions] = useState<ExportPreviewOptions>({
    enableRealTimePreview: true,
    previewQuality: 0.7,
    previewScale: 0.5,
    maxPreviewSize: 300,
    debounceDelay: 300
  });

  const optimizerRef = useRef<ExportOptimizer | null>(null);

  // 初始化优化器
  useEffect(() => {
    optimizerRef.current = new ExportOptimizer(previewOptions);

    // 绑定事件
    optimizerRef.current.on('previewReady', (url, previewMetrics) => {
      setPreviewUrl(url);
      setMetrics(previewMetrics);
      setIsGeneratingPreview(false);
      setPreviewError('');
    });

    optimizerRef.current.on('performanceWarning', (metric, value, threshold) => {
      console.warn(`性能警告: ${metric} = ${value} 超过阈值 ${threshold}`);
    });

    optimizerRef.current.on('fileSizeWarning', (size, threshold) => {
      console.warn(`文件大小警告: ${formatFileSize(size)} 超过阈值 ${formatFileSize(threshold)}`);
    });

    return () => {
      optimizerRef.current?.destroy();
    };
  }, []);

  // 更新预览选项
  useEffect(() => {
    if (optimizerRef.current) {
      optimizerRef.current.updatePreviewOptions(previewOptions);
    }
  }, [previewOptions]);

  // 生成预览
  const generatePreview = useCallback(async () => {
    if (!sourceCanvas || !optimizerRef.current || !previewOptions.enableRealTimePreview) {
      return;
    }

    setIsGeneratingPreview(true);
    setPreviewError('');

    try {
      await optimizerRef.current.generatePreview(sourceCanvas, exportOptions, currentPage || undefined);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : '预览生成失败');
      setIsGeneratingPreview(false);
    }
  }, [sourceCanvas, exportOptions, currentPage, previewOptions.enableRealTimePreview]);

  // 当导出选项或画布变化时生成预览
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 处理预览选项变化
  const handlePreviewOptionChange = (key: keyof ExportPreviewOptions, value: any) => {
    setPreviewOptions(prev => ({ ...prev, [key]: value }));
  };

  // 手动刷新预览
  const handleRefreshPreview = () => {
    generatePreview();
  };

  // 下载预览图片
  const handleDownloadPreview = () => {
    if (!previewUrl) return;

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `preview.${exportOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 复制预览到剪贴板
  const handleCopyPreview = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('预览图片已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动保存图片');
    }
  };

  return (
    <div className={className} style={{ padding: '16px', ...style }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          导出预览
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRefreshPreview}
            disabled={isGeneratingPreview}
            style={{
              padding: '4px 8px',
              border: '1px solid #007bff',
              backgroundColor: 'white',
              color: '#007bff',
              borderRadius: '4px',
              cursor: isGeneratingPreview ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              opacity: isGeneratingPreview ? 0.6 : 1
            }}
          >
            {isGeneratingPreview ? '生成中...' : '刷新'}
          </button>
          
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            style={{
              padding: '4px 8px',
              border: '1px solid #6c757d',
              backgroundColor: 'white',
              color: '#6c757d',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showMetrics ? '隐藏指标' : '显示指标'}
          </button>
        </div>
      </div>

      {/* 预览设置 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={previewOptions.enableRealTimePreview}
              onChange={(e) => handlePreviewOptionChange('enableRealTimePreview', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            启用实时预览
          </label>
        </div>

        {previewOptions.enableRealTimePreview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
            <div>
              <label htmlFor="preview-quality" style={{ display: 'block', marginBottom: '2px' }}>预览质量</label>
              <input
                id="preview-quality"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={previewOptions.previewQuality}
                onChange={(e) => handlePreviewOptionChange('previewQuality', Number(e.target.value))}
                aria-label="预览质量"
                title="预览质量"
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                {Math.round(previewOptions.previewQuality * 100)}%
              </div>
            </div>
            
            <div>
              <label htmlFor="preview-scale" style={{ display: 'block', marginBottom: '2px' }}>预览缩放</label>
              <input
                id="preview-scale"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={previewOptions.previewScale}
                onChange={(e) => handlePreviewOptionChange('previewScale', Number(e.target.value))}
                aria-label="预览缩放"
                title="预览缩放"
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                {Math.round(previewOptions.previewScale * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 预览区域 */}
      <div style={{
        border: '2px dashed #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        marginBottom: '12px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {isGeneratingPreview ? (
          <div>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e0e0e0',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '8px'
            }} />
            <div style={{ fontSize: '12px', color: '#666' }}>正在生成预览...</div>
          </div>
        ) : previewError ? (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
            <div style={{ fontSize: '12px', color: '#dc3545', marginBottom: '8px' }}>
              预览生成失败
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {previewError}
            </div>
          </div>
        ) : previewUrl ? (
          <div style={{ width: '100%' }}>
            <img
              src={previewUrl}
              alt="导出预览"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            />
            
            {/* 预览操作按钮 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              marginTop: '8px' 
            }}>
              <button
                onClick={handleDownloadPreview}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #28a745',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                下载预览
              </button>
              
              <button
                onClick={handleCopyPreview}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #17a2b8',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                复制图片
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {!sourceCanvas ? '等待画布数据...' : '等待预览生成...'}
            </div>
          </div>
        )}
      </div>

      {/* 性能指标 */}
      {showMetrics && metrics && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          marginBottom: '12px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            预览性能指标
          </h4>
          
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
                color: metrics.renderTime > 500 ? '#ffc107' : '#28a745'
              }}>
                {formatTime(metrics.renderTime)}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#666' }}>总时间:</span>
              <span style={{ 
                marginLeft: '4px',
                color: metrics.totalTime > 1000 ? '#ffc107' : '#28a745'
              }}>
                {formatTime(metrics.totalTime)}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#666' }}>预览大小:</span>
              <span style={{ marginLeft: '4px' }}>
                {formatFileSize(metrics.fileSize)}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#666' }}>压缩比:</span>
              <span style={{ marginLeft: '4px' }}>
                {Math.round(metrics.compressionRatio * 100)}%
              </span>
            </div>
            
            <div>
              <span style={{ color: '#666' }}>像素数:</span>
              <span style={{ marginLeft: '4px' }}>
                {(metrics.pixelCount / 1000).toFixed(1)}K
              </span>
            </div>
            
            <div>
              <span style={{ color: '#666' }}>内存使用:</span>
              <span style={{ marginLeft: '4px' }}>
                {formatFileSize(metrics.memoryUsage)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 预览信息 */}
      {previewUrl && (
        <div style={{ fontSize: '11px', color: '#666' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>预览信息:</div>
          <div>• 格式: {exportOptions.format.toUpperCase()}</div>
          <div>• 质量: {Math.round(exportOptions.quality * 100)}%</div>
          <div>• 缩放: {exportOptions.scale}x</div>
          {exportOptions.transparent && (
            <div>• 透明通道: 启用</div>
          )}
          <div>• 预览质量: {Math.round(previewOptions.previewQuality * 100)}%</div>
          <div>• 预览缩放: {Math.round(previewOptions.previewScale * 100)}%</div>
        </div>
      )}

      {/* CSS动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportPreviewPanel;