// H5编辑器导出优化器 - 性能优化和预览功能
import { EventEmitter } from '../utils/event-emitter';
import { type ImageExportOptions } from './ImageExportEngine';
import { type H5Page } from '../types';

export interface ExportOptimizationSuggestion {
  type: 'warning' | 'info' | 'error';
  category: 'fileSize' | 'performance' | 'quality' | 'compatibility';
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  autoFix?: () => Partial<ImageExportOptions>;
}

export interface ExportPreviewOptions {
  enableRealTimePreview: boolean;
  previewQuality: number; // 0.1-1，预览质量
  previewScale: number; // 0.1-1，预览缩放
  maxPreviewSize: number; // 最大预览尺寸（像素）
  debounceDelay: number; // 防抖延迟（毫秒）
}

export interface ExportPerformanceMetrics {
  renderTime: number; // 渲染时间
  processTime: number; // 处理时间
  totalTime: number; // 总时间
  memoryUsage: number; // 内存使用量
  fileSize: number; // 文件大小
  compressionRatio: number; // 压缩比
  pixelCount: number; // 像素数量
}

export interface ExportOptimizerEvents extends Record<string, (...args: any[]) => void> {
  previewReady(previewUrl: string, metrics: ExportPerformanceMetrics): void;
  optimizationSuggestions(suggestions: ExportOptimizationSuggestion[]): void;
  performanceWarning(metric: string, value: number, threshold: number): void;
  fileSizeWarning(size: number, threshold: number): void;
}

/**
 * 导出优化器 - 提供性能优化、实时预览和智能建议
 */
export class ExportOptimizer {
  private emitter = new EventEmitter<ExportOptimizerEvents>();
  private previewOptions: ExportPreviewOptions;
  private previewDebounceTimer: NodeJS.Timeout | null = null;
  private lastPreviewOptions: string = '';
  private performanceThresholds = {
    maxRenderTime: 1000, // 1秒
    maxProcessTime: 2000, // 2秒
    maxTotalTime: 3000, // 3秒
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minCompressionRatio: 0.1 // 最小压缩比
  };

  constructor(previewOptions?: Partial<ExportPreviewOptions>) {
    this.previewOptions = {
      enableRealTimePreview: true,
      previewQuality: 0.7,
      previewScale: 0.5,
      maxPreviewSize: 400,
      debounceDelay: 300,
      ...previewOptions
    };
  }

  /**
   * 分析导出选项并提供优化建议
   */
  analyzeExportOptions(
    options: ImageExportOptions,
    canvasSize: { width: number; height: number },
    page?: H5Page
  ): ExportOptimizationSuggestion[] {
    const suggestions: ExportOptimizationSuggestion[] = [];
    
    // 计算预估文件大小
    const estimatedSize = this.estimateFileSize(options, canvasSize);
    
    // 文件大小检查
    if (estimatedSize > this.performanceThresholds.maxFileSize) {
      suggestions.push({
        type: 'warning',
        category: 'fileSize',
        message: `预估文件大小 ${this.formatFileSize(estimatedSize)} 超过建议的 ${this.formatFileSize(this.performanceThresholds.maxFileSize)}`,
        suggestion: '建议降低质量、缩放或启用压缩来减小文件大小',
        impact: 'high',
        autoFix: () => ({
          quality: Math.max(0.6, options.quality * 0.8),
          compression: 'best'
        })
      });
    }

    // 性能检查
    const pixelCount = canvasSize.width * canvasSize.height * (options.scale || 1) ** 2;
    if (pixelCount > 4000000) { // 4MP
      suggestions.push({
        type: 'info',
        category: 'performance',
        message: `高分辨率导出 (${Math.round(pixelCount / 1000000)}MP) 可能需要较长处理时间`,
        suggestion: '考虑使用较小的缩放比例或启用Sharp高性能处理',
        impact: 'medium',
        autoFix: () => ({
          useSharp: true,
          scale: Math.min(options.scale || 1, 2)
        })
      });
    }

    // 格式兼容性检查
    if (options.format === 'webp') {
      suggestions.push({
        type: 'info',
        category: 'compatibility',
        message: 'WebP格式在某些旧版浏览器中可能不被支持',
        suggestion: '如需最大兼容性，建议同时导出PNG或JPG格式',
        impact: 'low'
      });
    }

    // 透明通道检查
    if (options.format === 'jpg' && options.transparent) {
      suggestions.push({
        type: 'warning',
        category: 'quality',
        message: 'JPG格式不支持透明通道，透明区域将显示为白色背景',
        suggestion: '如需透明通道，请使用PNG或WebP格式',
        impact: 'medium',
        autoFix: () => ({
          format: 'png' as const
        })
      });
    }

    // 质量设置检查
    if (options.quality < 0.5 && (options.format === 'jpg' || options.format === 'webp')) {
      suggestions.push({
        type: 'info',
        category: 'quality',
        message: `当前质量设置 ${Math.round(options.quality * 100)}% 较低，可能影响图像质量`,
        suggestion: '建议质量设置不低于60%以保证良好的视觉效果',
        impact: 'low'
      });
    }

    // 页面内容检查
    if (page && page.components.length === 0) {
      suggestions.push({
        type: 'warning',
        category: 'quality',
        message: '当前页面没有任何内容',
        suggestion: '请添加设计元素后再进行导出',
        impact: 'high'
      });
    }

    return suggestions;
  }

  /**
   * 生成实时预览
   */
  async generatePreview(
    canvas: HTMLCanvasElement,
    options: ImageExportOptions,
    page?: H5Page
  ): Promise<void> {
    if (!this.previewOptions.enableRealTimePreview) {
      return;
    }

    // 创建选项的唯一标识符
    const optionsKey = JSON.stringify({
      format: options.format,
      quality: options.quality,
      scale: options.scale,
      transparent: options.transparent,
      includeBackground: options.includeBackground
    });

    // 如果选项没有变化，跳过预览生成
    if (optionsKey === this.lastPreviewOptions) {
      return;
    }

    // 清除之前的防抖定时器
    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
    }

    // 设置防抖
    this.previewDebounceTimer = setTimeout(async () => {
      try {
        const startTime = performance.now();
        
        // 创建预览画布
        const previewCanvas = await this.createPreviewCanvas(canvas, options);
        
        // 生成预览URL
        const previewUrl = previewCanvas.toDataURL('image/jpeg', this.previewOptions.previewQuality);
        
        // 计算性能指标
        const metrics: ExportPerformanceMetrics = {
          renderTime: performance.now() - startTime,
          processTime: 0,
          totalTime: performance.now() - startTime,
          memoryUsage: this.estimateMemoryUsage(previewCanvas),
          fileSize: this.estimateFileSizeFromDataUrl(previewUrl),
          compressionRatio: this.calculateCompressionRatio(previewCanvas, previewUrl),
          pixelCount: previewCanvas.width * previewCanvas.height
        };

        // 发送预览就绪事件
        this.emitter.emit('previewReady', previewUrl, metrics);
        
        // 检查性能警告
        this.checkPerformanceWarnings(metrics);
        
        // 生成优化建议
        const suggestions = this.analyzeExportOptions(
          options, 
          { width: canvas.width, height: canvas.height }, 
          page
        );
        
        if (suggestions.length > 0) {
          this.emitter.emit('optimizationSuggestions', suggestions);
        }

        this.lastPreviewOptions = optionsKey;
        
      } catch (error) {
        console.error('预览生成失败:', error);
      }
    }, this.previewOptions.debounceDelay);
  }

  /**
   * 创建预览画布
   */
  private async createPreviewCanvas(
    sourceCanvas: HTMLCanvasElement,
    options: ImageExportOptions
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // 计算预览尺寸
    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;
    const aspectRatio = sourceWidth / sourceHeight;
    
    let previewWidth = Math.min(sourceWidth, this.previewOptions.maxPreviewSize);
    let previewHeight = previewWidth / aspectRatio;
    
    if (previewHeight > this.previewOptions.maxPreviewSize) {
      previewHeight = this.previewOptions.maxPreviewSize;
      previewWidth = previewHeight * aspectRatio;
    }
    
    // 应用预览缩放
    previewWidth *= this.previewOptions.previewScale;
    previewHeight *= this.previewOptions.previewScale;
    
    canvas.width = Math.round(previewWidth);
    canvas.height = Math.round(previewHeight);
    
    // 设置背景
    if (!options.includeBackground || !options.transparent) {
      ctx.fillStyle = options.format === 'jpg' ? '#ffffff' : '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 绘制源画布内容
    ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
    
    return canvas;
  }

  /**
   * 估算文件大小
   */
  private estimateFileSize(
    options: ImageExportOptions,
    canvasSize: { width: number; height: number }
  ): number {
    const pixelCount = canvasSize.width * canvasSize.height * (options.scale || 1) ** 2;
    
    let bytesPerPixel: number;
    
    switch (options.format) {
      case 'png':
        // PNG: 4字节/像素 * 压缩比
        bytesPerPixel = 4 * (options.compression === 'none' ? 1 : 
                           options.compression === 'fast' ? 0.7 : 0.5);
        break;
      case 'jpg':
        // JPG: 基于质量的估算
        bytesPerPixel = 3 * (options.quality || 0.9) * 0.3;
        break;
      case 'webp':
        // WebP: 比JPG更高效
        bytesPerPixel = options.lossless ? 4 * 0.6 : 3 * (options.quality || 0.9) * 0.25;
        break;
      default:
        bytesPerPixel = 3;
    }
    
    return Math.round(pixelCount * bytesPerPixel);
  }

  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(canvas: HTMLCanvasElement): number {
    // 画布内存使用 = 宽度 * 高度 * 4字节 (RGBA)
    return canvas.width * canvas.height * 4;
  }

  /**
   * 从DataURL估算文件大小
   */
  private estimateFileSizeFromDataUrl(dataUrl: string): number {
    // Base64编码大约增加33%的大小
    const base64Data = dataUrl.split(',')[1] || '';
    return Math.round(base64Data.length * 0.75);
  }

  /**
   * 计算压缩比
   */
  private calculateCompressionRatio(canvas: HTMLCanvasElement, dataUrl: string): number {
    const uncompressedSize = canvas.width * canvas.height * 4; // RGBA
    const compressedSize = this.estimateFileSizeFromDataUrl(dataUrl);
    return compressedSize / uncompressedSize;
  }

  /**
   * 检查性能警告
   */
  private checkPerformanceWarnings(metrics: ExportPerformanceMetrics): void {
    if (metrics.renderTime > this.performanceThresholds.maxRenderTime) {
      this.emitter.emit('performanceWarning', 'renderTime', metrics.renderTime, this.performanceThresholds.maxRenderTime);
    }
    
    if (metrics.totalTime > this.performanceThresholds.maxTotalTime) {
      this.emitter.emit('performanceWarning', 'totalTime', metrics.totalTime, this.performanceThresholds.maxTotalTime);
    }
    
    if (metrics.fileSize > this.performanceThresholds.maxFileSize) {
      this.emitter.emit('fileSizeWarning', metrics.fileSize, this.performanceThresholds.maxFileSize);
    }
    
    if (metrics.memoryUsage > this.performanceThresholds.maxMemoryUsage) {
      this.emitter.emit('performanceWarning', 'memoryUsage', metrics.memoryUsage, this.performanceThresholds.maxMemoryUsage);
    }
  }

  /**
   * 应用自动优化
   */
  applyAutoOptimization(
    options: ImageExportOptions,
    suggestions: ExportOptimizationSuggestion[]
  ): ImageExportOptions {
    let optimizedOptions = { ...options };
    
    // 应用所有可自动修复的建议
    suggestions.forEach(suggestion => {
      if (suggestion.autoFix && suggestion.impact === 'high') {
        const fixes = suggestion.autoFix();
        optimizedOptions = { ...optimizedOptions, ...fixes };
      }
    });
    
    return optimizedOptions;
  }

  /**
   * 获取性能基准测试结果
   */
  async benchmarkExportPerformance(
    canvas: HTMLCanvasElement,
    options: ImageExportOptions
  ): Promise<ExportPerformanceMetrics> {
    const startTime = performance.now();
    
    // 模拟导出过程
    const testCanvas = document.createElement('canvas');
    testCanvas.width = canvas.width;
    testCanvas.height = canvas.height;
    const ctx = testCanvas.getContext('2d')!;
    
    const renderStart = performance.now();
    ctx.drawImage(canvas, 0, 0);
    const renderTime = performance.now() - renderStart;
    
    const processStart = performance.now();
    const dataUrl = testCanvas.toDataURL(`image/${options.format}`, options.quality);
    const processTime = performance.now() - processStart;
    
    const totalTime = performance.now() - startTime;
    
    return {
      renderTime,
      processTime,
      totalTime,
      memoryUsage: this.estimateMemoryUsage(testCanvas),
      fileSize: this.estimateFileSizeFromDataUrl(dataUrl),
      compressionRatio: this.calculateCompressionRatio(testCanvas, dataUrl),
      pixelCount: testCanvas.width * testCanvas.height
    };
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 更新预览选项
   */
  updatePreviewOptions(options: Partial<ExportPreviewOptions>): void {
    this.previewOptions = { ...this.previewOptions, ...options };
  }

  /**
   * 更新性能阈值
   */
  updatePerformanceThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds = { ...this.performanceThresholds, ...thresholds };
  }

  /**
   * 事件管理
   */
  on<T extends keyof ExportOptimizerEvents>(eventName: T, listener: ExportOptimizerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof ExportOptimizerEvents>(eventName: T, listener: ExportOptimizerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁优化器
   */
  destroy(): void {
    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
    }
    this.emitter.removeAllListeners();
  }
}