// H5编辑器图片导出面板组件
import React, { useState, useRef, useCallback } from 'react';
import { ImageExportEngine, type IImageExportOptions, type IImageExportResult, type IImageExportProgress } from '../export/ImageExportEngine';
import { ExportOptimizer, type IExportOptimizationSuggestion, type IExportPerformanceMetrics } from '../export/ExportOptimizer';
import { ExportProgressPanel } from './ExportProgressPanel';
import { ExportPreviewPanel } from './ExportPreviewPanel';
import { type IH5Page } from '../types';

interface IImageExportPanelProps {
  sourceCanvas?: HTMLCanvasElement | null;
  currentPage?: IH5Page | null;
  onExportComplete?: (result: IImageExportResult) => void;
  onExportError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageExportPanel: React.FC<IImageExportPanelProps> = ({
  sourceCanvas,
  currentPage,
  onExportComplete,
  onExportError,
  className,
  style
}) => {
  const exportEngineRef = useRef<ImageExportEngine | null>(null);
  const optimizerRef = useRef<ExportOptimizer | null>(null);
  
  // 导出设置状态
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(true);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [cropToContent, setCropToContent] = useState(false);
  const [compression, setCompression] = useState<'none' | 'fast' | 'best'>('best');
  const [maxFileSize, setMaxFileSize] = useState<number | undefined>(undefined);
  const [enableFileSizeLimit, setEnableFileSizeLimit] = useState(false);
  const [dpi, setDpi] = useState(72);
  const [useSharp, setUseSharp] = useState(true);
  const [progressive, setProgressive] = useState(true);
  const [lossless, setLossless] = useState(false);
  const [optimize, setOptimize] = useState(true);
  
  // 导出状态
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<IImageExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<IImageExportResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // 优化相关状态
  const [suggestions, setSuggestions] = useState<IExportOptimizationSuggestion[]>([]);
  const [metrics, setMetrics] = useState<IExportPerformanceMetrics | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showProgress, setShowProgress] = useState(true);

  // 预设用途
  const [selectedPurpose, setSelectedPurpose] = useState<'web' | 'print' | 'social' | 'icon' | 'custom'>('custom');

  // 初始化导出引擎和优化器
  const initializeEngines = useCallback(() => {
    // 初始化导出引擎
    if (!exportEngineRef.current) {
      exportEngineRef.current = new ImageExportEngine();
      
      // 绑定导出引擎事件
      exportEngineRef.current.on('exportStart', () => {
        setIsExporting(true);
        setExportResult(null);
        setExportProgress(null);
      });
      
      exportEngineRef.current.on('exportProgress', (progress) => {
        setExportProgress(progress);
      });
      
      exportEngineRef.current.on('exportComplete', (result) => {
        setIsExporting(false);
        setExportResult(result);
        setExportProgress(null);
        
        if (result.success && result.dataUrl) {
          setPreviewUrl(result.dataUrl);
        }
        
        onExportComplete?.(result);
      });
      
      exportEngineRef.current.on('exportError', (error) => {
        setIsExporting(false);
        setExportProgress(null);
        onExportError?.(error);
      });
      
      exportEngineRef.current.on('exportWarning', (warning) => {
        console.warn('导出警告:', warning);
      });
    }
    
    // 初始化优化器
    if (!optimizerRef.current) {
      optimizerRef.current = new ExportOptimizer();
      
      // 绑定优化器事件
      optimizerRef.current.on('optimizationSuggestions', (newSuggestions) => {
        setSuggestions(newSuggestions);
      });
      
      optimizerRef.current.on('previewReady', (url, previewMetrics) => {
        setPreviewUrl(url);
        setMetrics(previewMetrics);
      });
      
      optimizerRef.current.on('performanceWarning', (metric, value, threshold) => {
        console.warn(`性能警告: ${metric} = ${value} 超过阈值 ${threshold}`);
      });
      
      optimizerRef.current.on('fileSizeWarning', (size, threshold) => {
        console.warn(`文件大小警告: ${formatFileSize(size)} 超过阈值 ${formatFileSize(threshold)}`);
      });
    }
    
    return { exportEngine: exportEngineRef.current, optimizer: optimizerRef.current };
  }, [onExportComplete, onExportError]);

  // 应用预设设置
  const applyPresetSettings = useCallback((purpose: 'web' | 'print' | 'social' | 'icon') => {
    const { exportEngine } = initializeEngines();
    const settings = exportEngine.getRecommendedSettings(purpose);
    
    if (settings.format) setFormat(settings.format as 'png' | 'jpg' | 'webp');
    if (settings.quality !== undefined) setQuality(Math.round(settings.quality * 100));
    if (settings.scale !== undefined) setScale(settings.scale);
    if (settings.transparent !== undefined) setTransparent(settings.transparent);
    if (settings.compression) setCompression(settings.compression);
    if (settings.maxFileSize !== undefined) {
      setMaxFileSize(settings.maxFileSize);
      setEnableFileSizeLimit(true);
    }
    if (settings.dpi !== undefined) setDpi(settings.dpi);
    if (settings.cropToContent !== undefined) setCropToContent(settings.cropToContent);
    if (settings.useSharp !== undefined) setUseSharp(settings.useSharp);
    if (settings.progressive !== undefined) setProgressive(settings.progressive);
    if (settings.lossless !== undefined) setLossless(settings.lossless);
    if (settings.optimize !== undefined) setOptimize(settings.optimize);
    
    setSelectedPurpose(purpose);
    
    // 生成优化建议
    if (sourceCanvas && optimizerRef.current) {
      const currentOptions: IImageExportOptions = {
        format,
        quality: quality / 100,
        scale,
        transparent: transparent && format === 'png',
        includeBackground,
        cropToContent,
        compression,
        ...(enableFileSizeLimit && maxFileSize ? { maxFileSize } : {}),
        dpi,
        useSharp,
        progressive: progressive && (format === 'jpg'),
        lossless: lossless && (format === 'webp'),
        optimize
      };
      
      const newSuggestions = optimizerRef.current.analyzeExportOptions(
        { ...currentOptions, ...settings },
        { width: sourceCanvas.width, height: sourceCanvas.height },
        currentPage || undefined
      );
      setSuggestions(newSuggestions);
    }
  }, [initializeEngines, sourceCanvas, currentPage]);

  // 执行导出
  const handleExport = useCallback(async () => {
    if (!sourceCanvas || !currentPage) {
      alert('没有可导出的内容');
      return;
    }

    const { exportEngine } = initializeEngines();
    
    const options: Partial<IImageExportOptions> = {
      format,
      quality: quality / 100,
      scale,
      transparent: transparent && format === 'png',
      includeBackground,
      cropToContent,
      compression,
      ...(enableFileSizeLimit && maxFileSize ? { maxFileSize } : {}),
      dpi,
      useSharp,
      progressive: progressive && (format === 'jpg'),
      lossless: lossless && (format === 'webp'),
      optimize
    };

    try {
      await exportEngine.exportImage(sourceCanvas, currentPage, options);
    } catch (error) {
      console.error('导出失败:', error);
    }
  }, [sourceCanvas, currentPage, format, quality, scale, transparent, includeBackground, cropToContent, compression, enableFileSizeLimit, maxFileSize, dpi, useSharp, progressive, lossless, optimize, initializeEngines]);

  // 下载导出的图片
  const handleDownload = useCallback(() => {
    if (!exportResult || !exportResult.success || !exportResult.blob) {
      return;
    }

    const url = URL.createObjectURL(exportResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${exportResult.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportResult]);

  // 取消导出
  const handleCancel = useCallback(() => {
    if (exportEngineRef.current) {
      exportEngineRef.current.cancelExport();
    }
  }, []);

  // 应用优化建议
  const handleApplySuggestion = useCallback((suggestion: IExportOptimizationSuggestion) => {
    if (suggestion.autoFix) {
      const fixes = suggestion.autoFix();
      
      // 应用修复建议
      if (fixes.format) setFormat(fixes.format as 'png' | 'jpg' | 'webp');
      if (fixes.quality !== undefined) setQuality(Math.round(fixes.quality * 100));
      if (fixes.scale !== undefined) setScale(fixes.scale);
      if (fixes.compression) setCompression(fixes.compression);
      if (fixes.useSharp !== undefined) setUseSharp(fixes.useSharp);
      
      // 移除已应用的建议
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    }
  }, []);

  // 重试导出
  const handleRetry = useCallback(() => {
    handleExport();
  }, [handleExport]);

  // 生成优化建议
  const generateSuggestions = useCallback(() => {
    if (!sourceCanvas || !optimizerRef.current) return;
    
    const options: IImageExportOptions = {
      format,
      quality: quality / 100,
      scale,
      transparent: transparent && format === 'png',
      includeBackground,
      cropToContent,
      compression,
      ...(enableFileSizeLimit && maxFileSize ? { maxFileSize } : {}),
      dpi,
      useSharp,
      progressive: progressive && (format === 'jpg'),
      lossless: lossless && (format === 'webp'),
      optimize
    };
    
    const newSuggestions = optimizerRef.current.analyzeExportOptions(
      options,
      { width: sourceCanvas.width, height: sourceCanvas.height },
      currentPage || undefined
    );
    setSuggestions(newSuggestions);
  }, [sourceCanvas, currentPage, format, quality, scale, transparent, includeBackground, cropToContent, compression, enableFileSizeLimit, maxFileSize, dpi, useSharp, progressive, lossless, optimize]);

  // 当导出选项变化时生成建议
  React.useEffect(() => {
    const timer = setTimeout(generateSuggestions, 500);
    return () => clearTimeout(timer);
  }, [generateSuggestions]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className} style={{ padding: '16px', ...style }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
        图片导出设置
      </h3>

      {/* 面板切换标签 */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '16px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button
          onClick={() => setShowPreview(true)}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: showPreview ? '#007bff' : '#666',
            borderBottom: showPreview ? '2px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: showPreview ? 'bold' : 'normal'
          }}
        >
          预览设置
        </button>
        <button
          onClick={() => setShowProgress(true)}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: showProgress ? '#007bff' : '#666',
            borderBottom: showProgress ? '2px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: showProgress ? 'bold' : 'normal'
          }}
        >
          进度状态
        </button>
      </div>

      {/* 预览面板 */}
      {showPreview && (
        <div style={{ marginBottom: '16px' }}>
          <ExportPreviewPanel
            sourceCanvas={sourceCanvas || null}
            currentPage={currentPage || null}
            exportOptions={{
              format,
              quality: quality / 100,
              scale,
              transparent: transparent && format === 'png',
              includeBackground,
              cropToContent,
              compression,
              ...(enableFileSizeLimit && maxFileSize ? { maxFileSize } : {}),
              dpi,
              useSharp,
              progressive: progressive && (format === 'jpg'),
              lossless: lossless && (format === 'webp'),
              optimize
            }}
            onOptionsChange={(newOptions) => {
              if (newOptions.format) setFormat(newOptions.format as 'png' | 'jpg' | 'webp');
              if (newOptions.quality !== undefined) setQuality(Math.round(newOptions.quality * 100));
              if (newOptions.scale !== undefined) setScale(newOptions.scale);
              if (newOptions.transparent !== undefined) setTransparent(newOptions.transparent);
              if (newOptions.includeBackground !== undefined) setIncludeBackground(newOptions.includeBackground);
              if (newOptions.cropToContent !== undefined) setCropToContent(newOptions.cropToContent);
              if (newOptions.compression) setCompression(newOptions.compression);
              if (newOptions.dpi !== undefined) setDpi(newOptions.dpi);
              if (newOptions.useSharp !== undefined) setUseSharp(newOptions.useSharp);
              if (newOptions.progressive !== undefined) setProgressive(newOptions.progressive);
              if (newOptions.lossless !== undefined) setLossless(newOptions.lossless);
              if (newOptions.optimize !== undefined) setOptimize(newOptions.optimize);
            }}
          />
        </div>
      )}

      {/* 进度面板 */}
      {showProgress && (
        <div style={{ marginBottom: '16px' }}>
          <ExportProgressPanel
            isExporting={isExporting}
            progress={exportProgress}
            result={exportResult}
            suggestions={suggestions}
            metrics={metrics}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onApplySuggestion={handleApplySuggestion}
          />
        </div>
      )}

      {/* 预设用途选择 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
          导出用途
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { key: 'web', label: 'Web使用', desc: 'WebP, 80%质量' },
            { key: 'print', label: '打印', desc: 'PNG, 300DPI' },
            { key: 'social', label: '社交媒体', desc: 'JPG, 90%质量' },
            { key: 'icon', label: '图标', desc: 'PNG, 透明' }
          ].map(purpose => (
            <button
              key={purpose.key}
              onClick={() => applyPresetSettings(purpose.key as any)}
              style={{
                padding: '8px',
                border: selectedPurpose === purpose.key ? '2px solid #007bff' : '1px solid #ddd',
                backgroundColor: selectedPurpose === purpose.key ? '#e3f2fd' : 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{purpose.label}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{purpose.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 格式设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          图片格式
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'png' | 'jpg' | 'webp')}
          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="png">PNG (支持透明)</option>
          <option value="jpg">JPG (较小文件)</option>
          <option value="webp">WebP (最佳压缩)</option>
        </select>
      </div>

      {/* 质量设置 */}
      {(format === 'jpg' || format === 'webp') && (
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="export-quality" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            图片质量: {quality}%
          </label>
          <input
            id="export-quality"
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            aria-label="图片质量"
            title="图片质量"
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* 缩放设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="export-scale" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          缩放倍数: {scale}x
        </label>
        <input
          id="export-scale"
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          aria-label="缩放倍数"
          title="缩放倍数"
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
          <span>0.1x</span>
          <span>1x</span>
          <span>5x</span>
        </div>
      </div>

      {/* 透明通道设置 */}
      {format === 'png' && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            保持透明通道
          </label>
        </div>
      )}

      {/* 背景设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={includeBackground}
            onChange={(e) => setIncludeBackground(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          包含背景
        </label>
      </div>

      {/* 裁剪设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={cropToContent}
            onChange={(e) => setCropToContent(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          裁剪到内容区域
        </label>
      </div>

      {/* 压缩设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          压缩级别
        </label>
        <select
          value={compression}
          onChange={(e) => setCompression(e.target.value as 'none' | 'fast' | 'best')}
          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="none">无压缩</option>
          <option value="fast">快速压缩</option>
          <option value="best">最佳压缩</option>
        </select>
      </div>

      {/* DPI设置 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          DPI设置
        </label>
        <select
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value={72}>72 DPI (屏幕显示)</option>
          <option value={150}>150 DPI (高质量屏幕)</option>
          <option value={300}>300 DPI (打印质量)</option>
        </select>
      </div>

      {/* 文件大小限制 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={enableFileSizeLimit}
            onChange={(e) => setEnableFileSizeLimit(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          限制文件大小
        </label>
        {enableFileSizeLimit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="max-file-size-input" style={{ fontSize: '12px' }}>目标大小</label>
            <input
              id="max-file-size-input"
              type="number"
              value={maxFileSize ? Math.round(maxFileSize / 1024) : 500}
              onChange={(e) => setMaxFileSize(Number(e.target.value) * 1024)}
              min="1"
              max="10240"
              aria-label="目标大小(KB)"
              title="目标大小(KB)"
              placeholder="单位KB"
              style={{ flex: 1, padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '12px' }}>KB</span>
          </div>
        )}
      </div>

      {/* 导出按钮 */}
      <div style={{ marginBottom: '16px' }}>
        {!isExporting ? (
          <button
            onClick={handleExport}
            disabled={!sourceCanvas || !currentPage}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              backgroundColor: sourceCanvas && currentPage ? '#007bff' : '#ccc',
              color: 'white',
              borderRadius: '4px',
              cursor: sourceCanvas && currentPage ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            导出图片
          </button>
        ) : (
          <div>
            <button
              onClick={handleCancel}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '8px'
              }}
            >
              取消导出
            </button>
            
            {exportProgress && (
              <div>
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  {exportProgress.message}
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${exportProgress.progress}%`,
                    height: '100%',
                    backgroundColor: '#007bff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  {Math.round(exportProgress.progress)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 导出结果 */}
      {exportResult && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: exportResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${exportResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {exportResult.success ? (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#155724', marginBottom: '8px' }}>
                ✅ 导出成功
              </div>
              <div style={{ fontSize: '11px', color: '#155724' }}>
                <div>格式: {exportResult.format.toUpperCase()}</div>
                <div>尺寸: {exportResult.dimensions.width} × {exportResult.dimensions.height}</div>
                <div>文件大小: {formatFileSize(exportResult.size)}</div>
                <div>处理时间: {Math.round(exportResult.processingTime)}ms</div>
                {exportResult.actualQuality && exportResult.actualQuality < 1 && (
                  <div>实际质量: {Math.round(exportResult.actualQuality * 100)}%</div>
                )}
              </div>
              
              {exportResult.warnings && exportResult.warnings.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#856404' }}>警告:</div>
                  {exportResult.warnings.map((warning, index) => (
                    <div key={index} style={{ fontSize: '10px', color: '#856404' }}>
                      • {warning}
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleDownload}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  border: '1px solid #28a745',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                下载图片
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#721c24', marginBottom: '4px' }}>
                ❌ 导出失败
              </div>
              <div style={{ fontSize: '11px', color: '#721c24' }}>
                {exportResult.error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 预览 */}
      {previewUrl && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>预览</div>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <img
              src={previewUrl}
              alt="导出预览"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

      {/* Sharp高性能处理选项 */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          高性能处理选项 (Sharp)
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={useSharp}
              onChange={(e) => setUseSharp(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            启用Sharp高性能处理
          </label>
          <div style={{ fontSize: '10px', color: '#666', marginLeft: '20px' }}>
            提供更好的压缩效果和处理速度
          </div>
        </div>

        {useSharp && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={optimize}
                  onChange={(e) => setOptimize(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                优化文件大小
              </label>
            </div>

            {format === 'jpg' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={progressive}
                    onChange={(e) => setProgressive(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  渐进式编码 (JPG)
                </label>
                <div style={{ fontSize: '10px', color: '#666', marginLeft: '20px' }}>
                  支持逐步加载显示
                </div>
              </div>
            )}

            {format === 'webp' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={lossless}
                    onChange={(e) => setLossless(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  无损压缩 (WebP)
                </label>
                <div style={{ fontSize: '10px', color: '#666', marginLeft: '20px' }}>
                  保持完美画质，文件较大
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>使用说明:</div>
        <div>• PNG格式支持透明通道，适合图标和UI元素</div>
        <div>• JPG格式文件较小，适合照片和复杂图像</div>
        <div>• WebP格式提供最佳压缩比，现代浏览器支持</div>
        <div>• 打印用途建议使用300 DPI和PNG格式</div>
        <div>• 启用文件大小限制会自动调整质量</div>
        <div>• Sharp处理提供更好的压缩效果和速度</div>
      </div>
    </div>
  );
};

export default ImageExportPanel;