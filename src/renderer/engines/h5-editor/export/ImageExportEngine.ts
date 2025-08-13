// H5编辑器图片导出引擎 - 高性能图片处理和导出
import { EventEmitter } from '../utils/event-emitter';
import { SharpImageProcessor, type ISharpProcessingOptions } from '../utils/sharp-integration';
import { type IH5Page } from '../types';

export interface IImageExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 0-1，仅对jpg和webp有效
  scale: number; // 0.1-5，缩放倍数
  transparent: boolean; // 是否保持透明通道（仅PNG）
  includeBackground: boolean; // 是否包含背景
  cropToContent: boolean; // 是否裁剪到内容区域
  maxFileSize?: number; // 最大文件大小（字节）
  compression?: 'none' | 'fast' | 'best'; // 压缩级别
  dpi?: number; // DPI设置，默认72
  useSharp?: boolean; // 是否使用Sharp进行高性能处理
  progressive?: boolean; // 是否使用渐进式编码（仅jpg）
  lossless?: boolean; // 是否使用无损压缩（仅webp）
  optimize?: boolean; // 是否优化文件大小
}

export interface IImageExportResult {
  success: boolean;
  dataUrl?: string;
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  size: number;
  format: string;
  dimensions: { width: number; height: number };
  actualQuality?: number; // 实际使用的质量（可能因文件大小限制而调整）
  processingTime: number; // 处理时间（毫秒）
  error?: string;
  warnings?: string[];
}

export interface IImageExportProgress {
  stage: 'preparing' | 'rendering' | 'processing' | 'compressing' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // 毫秒
}

export interface IImageExportEngineEvents extends Record<string, (...args: any[]) => void> {
  exportStart(options: IImageExportOptions): void;
  exportProgress(progress: IImageExportProgress): void;
  exportComplete(result: IImageExportResult): void;
  exportError(error: Error): void;
  exportWarning(warning: string): void;
}

/**
 * 高性能图片导出引擎
 * 支持多种格式、质量控制、透明通道、内容裁剪等功能
 */
export class ImageExportEngine {
  private emitter = new EventEmitter<IImageExportEngineEvents>();
  private isExporting = false;
  private abortController: AbortController | null = null;

  constructor() {}

  /**
   * 导出图片
   */
  async exportImage(
    sourceCanvas: HTMLCanvasElement,
    page: IH5Page,
    options: Partial<IImageExportOptions> = {}
  ): Promise<IImageExportResult> {
    const startTime = performance.now();
    
    // 设置默认选项
    const exportOptions: IImageExportOptions = {
      format: 'png',
      quality: 1,
      scale: 1,
      transparent: true,
      includeBackground: true,
      cropToContent: false,
      compression: 'best',
      dpi: 72,
      useSharp: SharpImageProcessor.isAvailable(),
      progressive: true,
      lossless: false,
      optimize: true,
      ...options
    };

    // 验证选项
    this.validateOptions(exportOptions);

    if (this.isExporting) {
      throw new Error('导出正在进行中，请等待完成');
    }

    this.isExporting = true;
    this.abortController = new AbortController();

    try {
      this.emitter.emit('exportStart', exportOptions);
      
      // 阶段1: 准备
      this.emitProgress('preparing', 0, '准备导出...');
      
      // 计算最终尺寸
      const dimensions = this.calculateDimensions(page, exportOptions);
      
      // 阶段2: 渲染
      this.emitProgress('rendering', 20, '渲染画布内容...');
      
      const renderCanvas = await this.renderToCanvas(sourceCanvas, page, dimensions, exportOptions);
      
      // 阶段3: 处理
      this.emitProgress('processing', 60, '处理图片数据...');
      
      const processedCanvas = await this.processCanvas(renderCanvas, exportOptions);
      
      // 阶段4: 压缩和导出
      this.emitProgress('compressing', 80, '压缩和导出...');
      
      const result = await this.generateOutput(processedCanvas, exportOptions, startTime);
      
      // 阶段5: 完成
      this.emitProgress('complete', 100, '导出完成');
      
      this.emitter.emit('exportComplete', result);
      return result;
      
    } catch (error) {
      const errorResult: IImageExportResult = {
        success: false,
        size: 0,
        format: exportOptions.format,
        dimensions: { width: 0, height: 0 },
        processingTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.emitter.emit('exportError', error as Error);
      return errorResult;
    } finally {
      this.isExporting = false;
      this.abortController = null;
    }
  }

  /**
   * 批量导出多种格式
   */
  async exportMultipleFormats(
    sourceCanvas: HTMLCanvasElement,
    page: IH5Page,
    formats: Array<{ format: 'png' | 'jpg' | 'webp'; quality?: number; scale?: number }>
  ): Promise<IImageExportResult[]> {
    const results: IImageExportResult[] = [];
    
    // 如果启用Sharp且可用，使用Sharp的批量处理
    if (SharpImageProcessor.isAvailable() && formats.length > 1) {
      return await this.exportMultipleFormatsWithSharp(sourceCanvas, page, formats);
    }
    
    // 使用传统方法逐个处理
    for (const formatConfig of formats) {
      const options: Partial<IImageExportOptions> = {
        format: formatConfig.format,
        quality: formatConfig.quality || 1,
        scale: formatConfig.scale || 1
      };
      
      const result = await this.exportImage(sourceCanvas, page, options);
      results.push(result);
      
      // 如果有错误，记录警告但继续处理其他格式
      if (!result.success) {
        this.emitter.emit('exportWarning', `格式 ${formatConfig.format} 导出失败: ${result.error}`);
      }
    }
    
    return results;
  }

  /**
   * 使用Sharp批量导出多种格式
   */
  private async exportMultipleFormatsWithSharp(
    sourceCanvas: HTMLCanvasElement,
    page: IH5Page,
    formats: Array<{ format: 'png' | 'jpg' | 'webp'; quality?: number; scale?: number }>
  ): Promise<IImageExportResult[]> {
    const startTime = performance.now();
    
    try {
      this.emitter.emit('exportStart', { format: 'png', quality: 1, scale: 1 } as IImageExportOptions);
      this.emitProgress('preparing', 0, '准备批量导出...');
      
      // 准备渲染画布
      const dimensions = this.calculateDimensions(page, { scale: 1 } as IImageExportOptions);
      const renderCanvas = await this.renderToCanvas(sourceCanvas, page, dimensions, {
        scale: 1,
        includeBackground: true,
        transparent: true
      } as IImageExportOptions);
      
      this.emitProgress('processing', 30, '批量处理多种格式...');
      
      // 准备Sharp批量处理配置
      const sharpFormats = formats.map(formatConfig => ({
        format: formatConfig.format,
        options: {
          format: formatConfig.format,
          quality: Math.round((formatConfig.quality || 1) * 100),
          compression: 'best' as const,
          transparent: formatConfig.format === 'png',
          optimize: true,
          progressive: formatConfig.format === 'jpg',
          lossless: formatConfig.format === 'webp' && (formatConfig.quality || 1) === 1
        }
      }));
      
      // 使用Sharp批量处理
      const sharpResults = await SharpImageProcessor.processMultipleFormats(renderCanvas, sharpFormats);
      
      this.emitProgress('compressing', 80, '生成最终结果...');
      
      // 转换Sharp结果为导出结果
      const results: IImageExportResult[] = sharpResults.map((sharpResult, index) => {
        const formatConfig = formats[index]!;
        const processingTime = performance.now() - startTime;
        
        if (!sharpResult.success || !sharpResult.buffer) {
          return {
            success: false,
            size: 0,
            format: formatConfig.format,
            dimensions: { width: renderCanvas.width, height: renderCanvas.height },
            processingTime,
            error: sharpResult.error || '批量处理失败'
          };
        }
        
        // 创建Blob和DataURL
        const buffer = sharpResult.buffer!;
        const blob = new Blob([new Uint8Array(buffer)], { type: `image/${formatConfig.format}` });
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        ) as ArrayBuffer;
        const dataUrl = `data:image/${formatConfig.format};base64,${buffer.toString('base64')}`;
        
        return {
          success: true,
          dataUrl,
          blob,
          arrayBuffer,
          size: sharpResult.size,
          format: formatConfig.format,
          dimensions: { width: renderCanvas.width, height: renderCanvas.height },
          actualQuality: (formatConfig.quality || 1),
          processingTime,
          warnings: [`使用Sharp批量处理 - 格式: ${sharpResult.format || formatConfig.format}`]
        };
      });
      
      this.emitProgress('complete', 100, '批量导出完成');
      
      // 发送完成事件（使用第一个成功的结果）
      const firstSuccess = results.find(r => r.success);
      if (firstSuccess) {
        this.emitter.emit('exportComplete', firstSuccess);
      }
      
      return results;
      
    } catch (error) {
      const errorResults: IImageExportResult[] = formats.map(formatConfig => ({
        success: false,
        size: 0,
        format: formatConfig.format,
        dimensions: { width: 0, height: 0 },
        processingTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }));
      
      this.emitter.emit('exportError', error as Error);
      return errorResults;
    }
  }

  /**
   * 导出为文件
   */
  async exportAsFile(
    sourceCanvas: HTMLCanvasElement,
    page: IH5Page,
    filename: string,
    options: Partial<IImageExportOptions> = {}
  ): Promise<File | null> {
    const result = await this.exportImage(sourceCanvas, page, options);
    
    if (!result.success || !result.blob) {
      return null;
    }
    
    return new File([result.blob], filename, { type: result.blob.type });
  }

  /**
   * 取消导出
   */
  cancelExport(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * 验证导出选项
   */
  private validateOptions(options: IImageExportOptions): void {
    if (options.quality < 0 || options.quality > 1) {
      throw new Error('质量参数必须在0-1之间');
    }
    
    if (options.scale < 0.1 || options.scale > 5) {
      throw new Error('缩放参数必须在0.1-5之间');
    }
    
    if (options.maxFileSize && options.maxFileSize < 1024) {
      throw new Error('最大文件大小不能小于1KB');
    }
    
    if (options.format === 'jpg' && options.transparent) {
      this.emitter.emit('exportWarning', 'JPG格式不支持透明通道，将自动设置为不透明');
      options.transparent = false;
    }
  }

  /**
   * 计算最终尺寸
   */
  private calculateDimensions(page: IH5Page, options: IImageExportOptions): { width: number; height: number } {
    let width = page.width;
    let height = page.height;
    
    // 应用缩放
    width *= options.scale;
    height *= options.scale;
    
    // 如果需要裁剪到内容，计算内容边界
    if (options.cropToContent) {
      const contentBounds = this.calculateContentBounds(page);
      if (contentBounds) {
        width = contentBounds.width * options.scale;
        height = contentBounds.height * options.scale;
      }
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * 计算内容边界
   */
  private calculateContentBounds(page: IH5Page): { x: number; y: number; width: number; height: number } | null {
    if (page.components.length === 0) {
      return null;
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    page.components.forEach(component => {
      if (component.visible !== false) {
        minX = Math.min(minX, component.x);
        minY = Math.min(minY, component.y);
        maxX = Math.max(maxX, component.x + component.width);
        maxY = Math.max(maxY, component.y + component.height);
      }
    });
    
    if (minX === Infinity) {
      return null;
    }
    
    // 添加一些边距
    const padding = 10;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };
  }

  /**
   * 渲染到画布
   */
  private async renderToCanvas(
    sourceCanvas: HTMLCanvasElement,
    page: IH5Page,
    dimensions: { width: number; height: number },
    options: IImageExportOptions
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // 设置高DPI支持
    if (options.dpi && options.dpi !== 72) {
      const dpiScale = options.dpi / 72;
      canvas.width *= dpiScale;
      canvas.height *= dpiScale;
      ctx.scale(dpiScale, dpiScale);
    }
    
    // 如果不包含背景且支持透明，设置透明背景
    if (!options.includeBackground && options.transparent && options.format === 'png') {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    } else {
      // 设置背景色
      ctx.fillStyle = options.format === 'jpg' ? '#ffffff' : (page.background?.value || '#ffffff');
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    }
    
    // 应用缩放
    if (options.scale !== 1) {
      ctx.scale(options.scale, options.scale);
    }
    
    // 如果需要裁剪到内容
    if (options.cropToContent) {
      const contentBounds = this.calculateContentBounds(page);
      if (contentBounds) {
        ctx.translate(-contentBounds.x, -contentBounds.y);
      }
    }
    
    // 绘制源画布内容
    ctx.drawImage(sourceCanvas, 0, 0);
    
    return canvas;
  }

  /**
   * 处理画布（应用滤镜、优化等）
   */
  private async processCanvas(
    canvas: HTMLCanvasElement,
    options: IImageExportOptions
  ): Promise<HTMLCanvasElement> {
    // 如果不需要特殊处理，直接返回
    if (options.compression === 'none') {
      return canvas;
    }
    
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // 根据压缩级别应用不同的优化
    switch (options.compression) {
      case 'fast':
        // 快速压缩：简单的颜色量化
        this.applyFastCompression(imageData);
        break;
      case 'best':
        // 最佳压缩：高质量优化
        this.applyBestCompression(imageData);
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * 快速压缩
   */
  private applyFastCompression(imageData: ImageData): void {
    const data = imageData.data;
    
    // 简单的颜色量化：将颜色值舍入到最近的8的倍数
    for (let i = 0; i < data.length; i += 4) {
      data[i]! = Math.round(data[i]! / 8) * 8;     // R
      data[i + 1]! = Math.round(data[i + 1]! / 8) * 8; // G
      data[i + 2]! = Math.round(data[i + 2]! / 8) * 8; // B
      // Alpha通道保持不变
    }
  }

  /**
   * 最佳压缩
   */
  private applyBestCompression(imageData: ImageData): void {
    const data = imageData.data;
    
    // 高质量颜色量化：将颜色值舍入到最近的4的倍数
    for (let i = 0; i < data.length; i += 4) {
      data[i]! = Math.round(data[i]! / 4) * 4;     // R
      data[i + 1]! = Math.round(data[i + 1]! / 4) * 4; // G
      data[i + 2]! = Math.round(data[i + 2]! / 4) * 4; // B
      // Alpha通道保持不变
    }
  }

  /**
   * 生成输出
   */
  private async generateOutput(
    canvas: HTMLCanvasElement,
    options: IImageExportOptions,
    startTime: number
  ): Promise<IImageExportResult> {
    let quality = options.quality;
    let dataUrl: string;
    let blob: Blob;
    let arrayBuffer: ArrayBuffer;
    let attempts = 0;
    const maxAttempts = 5;
    
    // 如果启用Sharp且可用，使用Sharp进行高性能处理
    if (options.useSharp && SharpImageProcessor.isAvailable()) {
      return await this.generateOutputWithSharp(canvas, options, startTime);
    }
    
    // 使用传统Canvas方法
    do {
      attempts++;
      dataUrl = canvas.toDataURL(`image/${options.format}`, quality);
      blob = this.dataURLToBlob(dataUrl);
      
      // 如果没有设置最大文件大小限制，或者文件大小符合要求，跳出循环
      if (!options.maxFileSize || blob.size <= options.maxFileSize) {
        break;
      }
      
      // 如果文件太大且还有尝试次数，降低质量
      if (attempts < maxAttempts) {
        quality *= 0.8; // 每次降低20%的质量
        this.emitter.emit('exportWarning', `文件大小超出限制，降低质量到 ${Math.round(quality * 100)}%`);
      }
    } while (attempts < maxAttempts);
    
    // 生成ArrayBuffer
    arrayBuffer = await blob.arrayBuffer();
    
    const result: IImageExportResult = {
      success: true,
      dataUrl,
      blob,
      arrayBuffer,
      size: blob.size,
      format: options.format,
      dimensions: { width: canvas.width, height: canvas.height },
      actualQuality: quality,
      processingTime: performance.now() - startTime,
      warnings: []
    };
    
    // 添加警告信息
    if (options.maxFileSize && blob.size > options.maxFileSize) {
      result.warnings!.push(`文件大小 ${this.formatFileSize(blob.size)} 超出限制 ${this.formatFileSize(options.maxFileSize)}`);
    }
    
    if (quality < options.quality) {
      result.warnings!.push(`质量已从 ${Math.round(options.quality * 100)}% 降低到 ${Math.round(quality * 100)}%`);
    }
    
    return result;
  }

  /**
   * 使用Sharp生成高性能输出
   */
  private async generateOutputWithSharp(
    canvas: HTMLCanvasElement,
    options: IImageExportOptions,
    startTime: number
  ): Promise<IImageExportResult> {
    let quality = Math.round(options.quality * 100); // Sharp使用1-100的质量范围
    let attempts = 0;
    const maxAttempts = 5;
    
    const sharpOptions: ISharpProcessingOptions = {
      format: options.format,
      quality,
      compression: options.compression || 'best',
      transparent: options.transparent || false,
      progressive: options.progressive || false,
      lossless: options.lossless || false,
      optimize: options.optimize || false
    };
    
    let sharpResult;
    
    // 如果设置了最大文件大小，尝试调整质量
    do {
      attempts++;
      sharpResult = await SharpImageProcessor.processCanvasData(canvas, {
        ...sharpOptions,
        quality
      });
      
      if (!sharpResult.success) {
        return {
          success: false,
          size: 0,
          format: options.format,
          dimensions: { width: canvas.width, height: canvas.height },
          processingTime: performance.now() - startTime,
          error: sharpResult.error || '使用Sharp处理失败'
        };
      }
      
      // 如果没有设置最大文件大小限制，或者文件大小符合要求，跳出循环
      if (!options.maxFileSize || sharpResult.size <= options.maxFileSize) {
        break;
      }
      
      // 如果文件太大且还有尝试次数，降低质量
      if (attempts < maxAttempts) {
        quality = Math.round(quality * 0.8); // 每次降低20%的质量
        this.emitter.emit('exportWarning', `文件大小超出限制，降低质量到 ${quality}%`);
      }
    } while (attempts < maxAttempts);
    
    if (!sharpResult.buffer) {
      return {
        success: false,
        size: 0,
        format: options.format,
        dimensions: { width: canvas.width, height: canvas.height },
        processingTime: performance.now() - startTime,
        error: 'Sharp处理结果无效'
      };
    }
    
    // 创建Blob和DataURL
    const buffer = sharpResult.buffer!;
    const blob = new Blob([new Uint8Array(buffer)], { type: `image/${options.format}` });
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    
    // 创建DataURL用于预览
    const dataUrl = `data:image/${options.format};base64,${buffer.toString('base64')}`;
    
    const result: IImageExportResult = {
      success: true,
      dataUrl,
      blob,
      arrayBuffer,
      size: sharpResult.size,
      format: options.format,
      dimensions: { width: canvas.width, height: canvas.height },
      actualQuality: quality / 100,
      processingTime: performance.now() - startTime,
      warnings: []
    };
    
    // 添加警告信息
    if (options.maxFileSize && sharpResult.size > options.maxFileSize) {
      result.warnings!.push(`文件大小 ${this.formatFileSize(sharpResult.size)} 超出限制 ${this.formatFileSize(options.maxFileSize)}`);
    }
    
    if (quality < Math.round(options.quality * 100)) {
      result.warnings!.push(`质量已从 ${Math.round(options.quality * 100)}% 降低到 ${quality}%`);
    }
    
    // 添加Sharp处理信息
    if (sharpResult.info) {
      result.warnings!.push(`使用Sharp高性能处理 - 格式: ${sharpResult.info.format || options.format}, 通道: ${sharpResult.info.channels || 4}`);
    }
    
    return result;
  }

  /**
   * 将DataURL转换为Blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0] ? arr[0].match(/:(.*?);/) : null;
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = arr[1] ? atob(arr[1]) : '';
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime || 'image/png' });
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
   * 发送进度事件
   */
  private emitProgress(stage: IImageExportProgress['stage'], progress: number, message: string): void {
    this.emitter.emit('exportProgress', {
      stage,
      progress,
      message
    });
  }

  /**
   * 获取支持的格式
   */
  getSupportedFormats(): Array<{ format: string; name: string; extensions: string[]; supportsTransparency: boolean }> {
    return [
      {
        format: 'png',
        name: 'PNG',
        extensions: ['.png'],
        supportsTransparency: true
      },
      {
        format: 'jpg',
        name: 'JPEG',
        extensions: ['.jpg', '.jpeg'],
        supportsTransparency: false
      },
      {
        format: 'webp',
        name: 'WebP',
        extensions: ['.webp'],
        supportsTransparency: true
      }
    ];
  }

  /**
   * 获取推荐的导出设置
   */
  getRecommendedSettings(purpose: 'web' | 'print' | 'social' | 'icon'): Partial<IImageExportOptions> {
    const useSharp = SharpImageProcessor.isAvailable();
    
    switch (purpose) {
      case 'web':
        return {
          format: 'webp',
          quality: 0.8,
          scale: 1,
          compression: 'best',
          maxFileSize: 500 * 1024, // 500KB
          useSharp,
          optimize: true,
          progressive: false,
          lossless: false
        };
      case 'print':
        return {
          format: 'png',
          quality: 1,
          scale: 2,
          dpi: 300,
          compression: 'none',
          useSharp,
          optimize: false,
          transparent: true
        };
      case 'social':
        return {
          format: 'jpg',
          quality: 0.9,
          scale: 1,
          compression: 'fast',
          maxFileSize: 1024 * 1024, // 1MB
          useSharp,
          optimize: true,
          progressive: true
        };
      case 'icon':
        return {
          format: 'png',
          quality: 1,
          transparent: true,
          cropToContent: true,
          compression: 'best',
          useSharp,
          optimize: true
        };
      default:
        return {
          format: 'png',
          quality: 1,
          scale: 1,
          useSharp,
          optimize: true
        };
    }
  }

  /**
   * 事件管理
   */
  on<T extends keyof IImageExportEngineEvents>(eventName: T, listener: IImageExportEngineEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IImageExportEngineEvents>(eventName: T, listener: IImageExportEngineEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁导出引擎
   */
  destroy(): void {
    this.cancelExport();
    this.emitter.removeAllListeners();
  }
}