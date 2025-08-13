// Sharp库集成工具 - 高性能图片处理
// 注意：在渲染进程中，Sharp通过IPC调用主进程处理

export interface ISharpProcessingOptions {
  format: 'png' | 'jpg' | 'webp';
  quality?: number; // 1-100，仅对jpg和webp有效
  compression?: 'none' | 'fast' | 'best';
  transparent?: boolean; // 是否保持透明通道
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    withoutEnlargement?: boolean;
  };
  optimize?: boolean; // 是否优化文件大小
  progressive?: boolean; // 是否使用渐进式编码（仅jpg）
  lossless?: boolean; // 是否使用无损压缩（仅webp）
}

export interface ISharpProcessingResult {
  success: boolean;
  buffer?: Buffer;
  info?: any; // 替代sharp.OutputInfo
  size: number;
  format: string;
  error?: string;
  processingTime: number;
}

/**
 * Sharp图片处理工具类
 * 提供高性能的图片格式转换、压缩和优化功能
 */
export class SharpImageProcessor {
  /**
   * 处理Canvas数据为指定格式
   */
  static async processCanvasData(
    canvas: HTMLCanvasElement,
    options: ISharpProcessingOptions
  ): Promise<ISharpProcessingResult> {
    const startTime = performance.now();

    try {
      // 将Canvas转换为Buffer
      const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
      const buffer = await this.imageDataToBuffer(imageData);

      // 使用Sharp处理
      const result = await this.processBuffer(buffer, canvas.width, canvas.height, options);
      
      return {
        ...result,
        processingTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        size: 0,
        format: options.format,
        error: error instanceof Error ? error.message : String(error),
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * 处理Buffer数据
   */
  static async processBuffer(
    _inputBuffer: Buffer,
    _width: number,
    _height: number,
    options: ISharpProcessingOptions
  ): Promise<Omit<ISharpProcessingResult, 'processingTime'>> {
    try {
      // 暂时禁用Sharp功能，直到IPC集成完成
      // 在渲染进程中，通过IPC调用主进程的Sharp功能
      // if (typeof window !== 'undefined' && window.electronAPI) {
      //   return await window.electronAPI.processImageBuffer(inputBuffer, width, height, options);
      // }
      
      // 如果没有IPC支持，返回错误
      return {
        success: false,
        size: 0,
        format: options.format,
        error: 'Sharp处理不可用：需要主进程支持'
      };
    } catch (error) {
      return {
        success: false,
        size: 0,
        format: options.format,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }



  /**
   * 将ImageData转换为Buffer
   */
  private static async imageDataToBuffer(imageData: ImageData): Promise<Buffer> {
    const { data } = imageData;
    
    // 创建RGBA Buffer
    const buffer = Buffer.from(data.buffer);
    
    return buffer;
  }

  /**
   * 批量处理多种格式
   */
  static async processMultipleFormats(
    canvas: HTMLCanvasElement,
    formats: Array<{ format: 'png' | 'jpg' | 'webp'; options?: Partial<ISharpProcessingOptions> }>
  ): Promise<ISharpProcessingResult[]> {
    const results: ISharpProcessingResult[] = [];
    
    // 预先获取Canvas数据以避免重复转换
    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const inputBuffer = await this.imageDataToBuffer(imageData);

    for (const formatConfig of formats) {
      const options: ISharpProcessingOptions = {
        format: formatConfig.format,
        quality: 90,
        compression: 'best',
        transparent: true,
        optimize: true,
        ...formatConfig.options
      };

      const result = await this.processBuffer(inputBuffer, canvas.width, canvas.height, options);
      results.push({
        ...result,
        processingTime: 0 // 批量处理时不单独计时
      });
    }

    return results;
  }

  /**
   * 获取图片信息
   */
  static async getImageInfo(_buffer: Buffer): Promise<any | null> {
    try {
      // 暂时禁用Sharp功能，直到IPC集成完成
      // 在渲染进程中，通过IPC调用主进程的Sharp功能
      // if (typeof window !== 'undefined' && window.electronAPI) {
      //   return await window.electronAPI.getImageInfo(buffer);
      // }
      return null;
    } catch (error) {
      console.error('获取图片信息失败:', error);
      return null;
    }
  }

  /**
   * 优化现有图片
   */
  static async optimizeImage(
    _inputBuffer: Buffer,
    _format: 'png' | 'jpg' | 'webp',
    _quality: number = 90
  ): Promise<Buffer | null> {
    try {
      // 暂时禁用Sharp功能，直到IPC集成完成
      // 在渲染进程中，通过IPC调用主进程的Sharp功能
      // if (typeof window !== 'undefined' && window.electronAPI) {
      //   return await window.electronAPI.optimizeImage(inputBuffer, format, quality);
      // }
      return null;
    } catch (error) {
      console.error('图片优化失败:', error);
      return null;
    }
  }

  /**
   * 创建缩略图
   */
  static async createThumbnail(
    _inputBuffer: Buffer,
    _width: number,
    _height: number,
    _format: 'png' | 'jpg' | 'webp' = 'jpg'
  ): Promise<Buffer | null> {
    try {
      // 暂时禁用Sharp功能，直到IPC集成完成
      // 在渲染进程中，通过IPC调用主进程的Sharp功能
      // if (typeof window !== 'undefined' && window.electronAPI) {
      //   return await window.electronAPI.createThumbnail(inputBuffer, width, height, format);
      // }
      return null;
    } catch (error) {
      console.error('创建缩略图失败:', error);
      return null;
    }
  }

  /**
   * 检查Sharp是否可用
   */
  static isAvailable(): boolean {
    try {
      // 暂时禁用Sharp功能，直到IPC集成完成
      return false;
      // 在渲染进程中，检查是否有IPC支持
      // return typeof window !== 'undefined' && 
      //        window.electronAPI && 
      //        typeof window.electronAPI.processImageBuffer === 'function';
    } catch {
      return false;
    }
  }

  /**
   * 获取支持的格式
   */
  static getSupportedFormats(): string[] {
    return ['png', 'jpg', 'jpeg', 'webp'];
  }
}