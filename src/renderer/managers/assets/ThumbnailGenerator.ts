// 缩略图生成器 - 负责生成和缓存素材缩略图
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';

export interface IThumbnailOptions {
  width: number;
  height: number;
  quality: number; // 0-1
  format: 'jpeg' | 'png' | 'webp';
  fit: 'cover' | 'contain' | 'fill';
  background?: string; // 背景色，用于透明图片
}

export interface IThumbnailResult {
  success: boolean;
  thumbnailUrl?: string;
  originalSize: { width: number; height: number };
  thumbnailSize: { width: number; height: number };
  fileSize: number;
  processingTime: number;
  error?: string;
}

export interface IThumbnailCache {
  url: string;
  size: { width: number; height: number };
  fileSize: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface IThumbnailGeneratorEvents extends Record<string, (...args: any[]) => void> {
  thumbnailGenerated(originalUrl: string, result: IThumbnailResult): void;
  cacheHit(originalUrl: string, thumbnailUrl: string): void;
  cacheMiss(originalUrl: string): void;
  cacheCleared(): void;
  error(error: Error): void;
}

/**
 * 缩略图生成器
 * 提供高效的缩略图生成和缓存功能
 */
export class ThumbnailGenerator {
  private emitter = new EventEmitter<IThumbnailGeneratorEvents>();
  private cache: Map<string, IThumbnailCache> = new Map();
  private processingQueue: Map<string, Promise<IThumbnailResult>> = new Map();
  private defaultOptions: IThumbnailOptions = {
    width: 200,
    height: 200,
    quality: 0.8,
    format: 'jpeg',
    fit: 'cover',
    background: '#ffffff'
  };
  private maxCacheSize = 1000; // 最大缓存数量
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7天
  private cacheKey = 'thumbnail-cache';

  constructor(options?: Partial<IThumbnailOptions>) {
    if (options) {
      this.defaultOptions = { ...this.defaultOptions, ...options };
    }
    this.loadCacheFromStorage();
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(
    originalUrl: string,
    options?: Partial<IThumbnailOptions>
  ): Promise<IThumbnailResult> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const cacheKey = this.getCacheKey(originalUrl, finalOptions);

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      // 更新访问信息
      cached.lastAccessed = new Date();
      cached.accessCount++;
      this.saveCacheToStorage();

      this.emitter.emit('cacheHit', originalUrl, cached.url);
      
      return {
        success: true,
        thumbnailUrl: cached.url,
        originalSize: { width: 0, height: 0 }, // 缓存中不存储原始尺寸
        thumbnailSize: cached.size,
        fileSize: cached.fileSize,
        processingTime: 0
      };
    }

    this.emitter.emit('cacheMiss', originalUrl);

    // 检查是否正在处理
    const existingProcess = this.processingQueue.get(cacheKey);
    if (existingProcess) {
      return existingProcess;
    }

    // 开始生成缩略图
    const processPromise = this.doGenerateThumbnail(originalUrl, finalOptions, cacheKey);
    this.processingQueue.set(cacheKey, processPromise);

    try {
      const result = await processPromise;
      return result;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }

  /**
   * 批量生成缩略图
   */
  async generateThumbnails(
    urls: string[],
    options?: Partial<IThumbnailOptions>
  ): Promise<Map<string, IThumbnailResult>> {
    const results = new Map<string, IThumbnailResult>();
    
    // 并发生成，但限制并发数量
    const concurrency = 5;
    const chunks = this.chunkArray(urls, concurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async url => {
        const result = await this.generateThumbnail(url, options);
        return { url, result };
      });
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ url, result }) => {
        results.set(url, result);
      });
    }
    
    return results;
  }

  /**
   * 实际生成缩略图的方法
   */
  private async doGenerateThumbnail(
    originalUrl: string,
    options: IThumbnailOptions,
    cacheKey: string
  ): Promise<IThumbnailResult> {
    const startTime = performance.now();

    try {
      // 加载原始图片
      const { image, originalSize } = await this.loadImage(originalUrl);
      
      // 创建画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // 计算缩略图尺寸
      const thumbnailSize = this.calculateThumbnailSize(originalSize, options);
      canvas.width = thumbnailSize.width;
      canvas.height = thumbnailSize.height;
      
      // 设置背景色（用于透明图片）
      if (options.background && options.format === 'jpeg') {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // 计算绘制参数
      const drawParams = this.calculateDrawParams(originalSize, thumbnailSize, options.fit);
      
      // 绘制图片
      ctx.drawImage(
        image,
        drawParams.sx,
        drawParams.sy,
        drawParams.sWidth,
        drawParams.sHeight,
        drawParams.dx,
        drawParams.dy,
        drawParams.dWidth,
        drawParams.dHeight
      );
      
      // 生成缩略图URL
      const mimeType = `image/${options.format}`;
      const thumbnailUrl = canvas.toDataURL(mimeType, options.quality);
      
      // 计算文件大小（估算）
      const fileSize = Math.round(thumbnailUrl.length * 0.75); // Base64编码大约增加33%
      
      const processingTime = performance.now() - startTime;
      
      const result: IThumbnailResult = {
        success: true,
        thumbnailUrl,
        originalSize,
        thumbnailSize,
        fileSize,
        processingTime
      };
      
      // 缓存结果
      this.cacheResult(cacheKey, thumbnailUrl, thumbnailSize, fileSize);
      
      // 发送事件
      this.emitter.emit('thumbnailGenerated', originalUrl, result);
      
      return result;
      
    } catch (error) {
      const processingTime = performance.now() - startTime;
      const result: IThumbnailResult = {
        success: false,
        originalSize: { width: 0, height: 0 },
        thumbnailSize: { width: 0, height: 0 },
        fileSize: 0,
        processingTime,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.emitter.emit('error', error as Error);
      return result;
    }
  }

  /**
   * 加载图片
   */
  private async loadImage(url: string): Promise<{ image: HTMLImageElement; originalSize: { width: number; height: number } }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        resolve({
          image,
          originalSize: { width: image.naturalWidth, height: image.naturalHeight }
        });
      };
      
      image.onerror = () => {
        reject(new Error(`无法加载图片: ${url}`));
      };
      
      // 设置跨域属性
      image.crossOrigin = 'anonymous';
      image.src = url;
    });
  }

  /**
   * 计算缩略图尺寸
   */
  private calculateThumbnailSize(
    originalSize: { width: number; height: number },
    options: IThumbnailOptions
  ): { width: number; height: number } {
    const { width: targetWidth, height: targetHeight, fit } = options;
    const { width: originalWidth, height: originalHeight } = originalSize;
    
    if (fit === 'fill') {
      return { width: targetWidth, height: targetHeight };
    }
    
    const aspectRatio = originalWidth / originalHeight;
    const targetAspectRatio = targetWidth / targetHeight;
    
    let width: number, height: number;
    
    if (fit === 'contain') {
      if (aspectRatio > targetAspectRatio) {
        width = targetWidth;
        height = targetWidth / aspectRatio;
      } else {
        width = targetHeight * aspectRatio;
        height = targetHeight;
      }
    } else { // cover
      if (aspectRatio > targetAspectRatio) {
        width = targetHeight * aspectRatio;
        height = targetHeight;
      } else {
        width = targetWidth;
        height = targetWidth / aspectRatio;
      }
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * 计算绘制参数
   */
  private calculateDrawParams(
    originalSize: { width: number; height: number },
    thumbnailSize: { width: number; height: number },
    fit: 'cover' | 'contain' | 'fill'
  ) {
    const { width: originalWidth, height: originalHeight } = originalSize;
    const { width: thumbnailWidth, height: thumbnailHeight } = thumbnailSize;
    
    if (fit === 'fill') {
      return {
        sx: 0,
        sy: 0,
        sWidth: originalWidth,
        sHeight: originalHeight,
        dx: 0,
        dy: 0,
        dWidth: thumbnailWidth,
        dHeight: thumbnailHeight
      };
    }
    
    const aspectRatio = originalWidth / originalHeight;
    const thumbnailAspectRatio = thumbnailWidth / thumbnailHeight;
    
    if (fit === 'contain') {
      if (aspectRatio > thumbnailAspectRatio) {
        // 原图更宽，以宽度为准
        const scaledHeight = thumbnailWidth / aspectRatio;
        const offsetY = (thumbnailHeight - scaledHeight) / 2;
        
        return {
          sx: 0,
          sy: 0,
          sWidth: originalWidth,
          sHeight: originalHeight,
          dx: 0,
          dy: offsetY,
          dWidth: thumbnailWidth,
          dHeight: scaledHeight
        };
      } else {
        // 原图更高，以高度为准
        const scaledWidth = thumbnailHeight * aspectRatio;
        const offsetX = (thumbnailWidth - scaledWidth) / 2;
        
        return {
          sx: 0,
          sy: 0,
          sWidth: originalWidth,
          sHeight: originalHeight,
          dx: offsetX,
          dy: 0,
          dWidth: scaledWidth,
          dHeight: thumbnailHeight
        };
      }
    } else { // cover
      if (aspectRatio > thumbnailAspectRatio) {
        // 原图更宽，裁剪宽度
        const scaledWidth = originalHeight * thumbnailAspectRatio;
        const offsetX = (originalWidth - scaledWidth) / 2;
        
        return {
          sx: offsetX,
          sy: 0,
          sWidth: scaledWidth,
          sHeight: originalHeight,
          dx: 0,
          dy: 0,
          dWidth: thumbnailWidth,
          dHeight: thumbnailHeight
        };
      } else {
        // 原图更高，裁剪高度
        const scaledHeight = originalWidth / thumbnailAspectRatio;
        const offsetY = (originalHeight - scaledHeight) / 2;
        
        return {
          sx: 0,
          sy: offsetY,
          sWidth: originalWidth,
          sHeight: scaledHeight,
          dx: 0,
          dy: 0,
          dWidth: thumbnailWidth,
          dHeight: thumbnailHeight
        };
      }
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(url: string, options: IThumbnailOptions): string {
    const optionsStr = JSON.stringify({
      width: options.width,
      height: options.height,
      quality: options.quality,
      format: options.format,
      fit: options.fit,
      background: options.background
    });
    
    return `${url}|${optionsStr}`;
  }

  /**
   * 缓存结果
   */
  private cacheResult(
    cacheKey: string,
    thumbnailUrl: string,
    size: { width: number; height: number },
    fileSize: number
  ): void {
    const cacheEntry: IThumbnailCache = {
      url: thumbnailUrl,
      size,
      fileSize,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1
    };
    
    this.cache.set(cacheKey, cacheEntry);
    
    // 清理过期缓存
    this.cleanupCache();
    
    // 保存到存储
    this.saveCacheToStorage();
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cache: IThumbnailCache): boolean {
    const now = Date.now();
    const age = now - cache.createdAt.getTime();
    return age < this.maxCacheAge;
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // 删除过期条目
    this.cache.forEach((cache, key) => {
      const age = now - cache.createdAt.getTime();
      if (age > this.maxCacheAge) {
        entriesToDelete.push(key);
      }
    });
    
    entriesToDelete.forEach(key => this.cache.delete(key));
    
    // 如果缓存仍然太大，删除最少使用的条目
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => {
        // 按访问次数和最后访问时间排序
        const scoreA = a[1].accessCount * a[1].lastAccessed.getTime();
        const scoreB = b[1].accessCount * b[1].lastAccessed.getTime();
        return scoreA - scoreB;
      });
      
      const deleteCount = this.cache.size - this.maxCacheSize;
      for (let i = 0; i < deleteCount; i++) {
        this.cache.delete(entries[i]![0]);
      }
    }
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 保存缓存到存储
   */
  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries()).map(([key, cache]) => [
        key,
        {
          ...cache,
          createdAt: cache.createdAt.toISOString(),
          lastAccessed: cache.lastAccessed.toISOString()
        }
      ]);
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('保存缩略图缓存失败:', error);
    }
  }

  /**
   * 从存储加载缓存
   */
  private loadCacheFromStorage(): void {
    try {
      const cacheDataStr = localStorage.getItem(this.cacheKey);
      if (!cacheDataStr) {
        return;
      }
      
      const cacheData = JSON.parse(cacheDataStr);
      if (Array.isArray(cacheData)) {
        cacheData.forEach(([key, cache]: [string, any]) => {
          this.cache.set(key, {
            ...cache,
            createdAt: new Date(cache.createdAt),
            lastAccessed: new Date(cache.lastAccessed)
          });
        });
      }
      
      // 清理过期缓存
      this.cleanupCache();
      
      console.log(`已加载 ${this.cache.size} 个缩略图缓存`);
    } catch (error) {
      console.error('加载缩略图缓存失败:', error);
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.cacheKey);
    this.emitter.emit('cacheCleared');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, cache) => sum + cache.fileSize, 0);
    
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, cache) => sum + cache.accessCount, 0);
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      totalAccess,
      hitRate: totalAccess > 0 ? (totalAccess / (totalAccess + 1)) : 0 // 简化的命中率计算
    };
  }

  /**
   * 预热缓存
   */
  async preloadThumbnails(urls: string[], options?: Partial<IThumbnailOptions>): Promise<void> {
    console.log(`开始预热 ${urls.length} 个缩略图...`);
    
    const results = await this.generateThumbnails(urls, options);
    const successCount = Array.from(results.values()).filter(r => r.success).length;
    
    console.log(`缩略图预热完成: ${successCount}/${urls.length} 成功`);
  }

  /**
   * 事件管理
   */
  on<T extends keyof IThumbnailGeneratorEvents>(eventName: T, listener: IThumbnailGeneratorEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IThumbnailGeneratorEvents>(eventName: T, listener: IThumbnailGeneratorEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁生成器
   */
  destroy(): void {
    this.processingQueue.clear();
    this.emitter.removeAllListeners();
  }
}