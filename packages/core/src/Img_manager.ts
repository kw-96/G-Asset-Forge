import { EventEmitter } from '@g-asset-forge/common';

interface Events {
  added(img: HTMLImageElement): void;
  preloaded(url: string): void;
  error(url: string, error: Error): void;
  memoryWarning(usage: number): void;
}

interface ImageCacheEntry {
  img: HTMLImageElement;
  usageCount: number;
  lastUsed: number;
  size: number;
}

/**
 * 增强的图片管理器
 * 扩展现有的 ImgManager 实现资源预加载和内存管理
 */
export class ImgManager extends EventEmitter<Events> {
  private imgCache = new Map<string, ImageCacheEntry>();
  private loadingImgSet = new Set<string>();
  private preloadQueue: string[] = [];
  private maxCacheSize = 50 * 1024 * 1024; // 50MB缓存限制
  private currentCacheSize = 0;
  private preloadBatchSize = 3; // 同时预加载的图片数量

  async addImg(url: string): Promise<HTMLImageElement | null> {
    // 检查缓存
    const cached = this.imgCache.get(url);
    if (cached) {
      cached.usageCount++;
      cached.lastUsed = Date.now();
      return cached.img;
    }

    // 检查是否正在加载
    if (this.loadingImgSet.has(url)) {
      return this.waitForLoad(url);
    }

    return this.loadImage(url);
  }

  /**
   * 预加载图片列表
   */
  async preloadImages(urls: string[]): Promise<void> {
    this.preloadQueue.push(
      ...urls.filter(
        (url) => !this.imgCache.has(url) && !this.loadingImgSet.has(url),
      ),
    );
    await this.processPreloadQueue();
  }

  /**
   * 获取图片
   */
  getImg(url: string): HTMLImageElement | null {
    const cached = this.imgCache.get(url);
    if (cached) {
      cached.usageCount++;
      cached.lastUsed = Date.now();
      return cached.img;
    }
    return null;
  }

  /**
   * 释放图片资源
   */
  releaseImg(url: string): void {
    const cached = this.imgCache.get(url);
    if (cached) {
      cached.usageCount = Math.max(0, cached.usageCount - 1);

      // 如果使用计数为0，标记为可清理
      if (cached.usageCount === 0) {
        this.scheduleCleanup();
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return {
      totalImages: this.imgCache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      loadingCount: this.loadingImgSet.size,
      preloadQueueSize: this.preloadQueue.length,
    };
  }

  /**
   * 清理未使用的图片缓存
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5分钟未使用的图片可以清理

    for (const [url, entry] of this.imgCache.entries()) {
      if (entry.usageCount === 0 && now - entry.lastUsed > maxAge) {
        this.removeFromCache(url);
      }
    }
  }

  /**
   * 强制清理缓存以释放内存
   */
  forceClearCache(): void {
    // 按最后使用时间排序，清理最久未使用的
    const entries = Array.from(this.imgCache.entries()).sort(
      ([, a], [, b]) => a.lastUsed - b.lastUsed,
    );

    // 清理一半的缓存
    const clearCount = Math.floor(entries.length / 2);
    for (let i = 0; i < clearCount; i++) {
      this.removeFromCache(entries[i][0]);
    }
  }

  private async loadImage(url: string): Promise<HTMLImageElement | null> {
    this.loadingImgSet.add(url);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 支持跨域图片

      const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });

      img.src = url;
      const loadedImg = await loadPromise;

      // 计算图片大小（估算）
      const size = this.estimateImageSize(loadedImg);

      // 检查缓存大小限制
      if (this.currentCacheSize + size > this.maxCacheSize) {
        this.emit('memoryWarning', this.currentCacheSize + size);
        this.cleanup();

        // 如果清理后仍然超限，强制清理
        if (this.currentCacheSize + size > this.maxCacheSize) {
          this.forceClearCache();
        }
      }

      // 添加到缓存
      this.imgCache.set(url, {
        img: loadedImg,
        usageCount: 1,
        lastUsed: Date.now(),
        size,
      });

      this.currentCacheSize += size;
      this.loadingImgSet.delete(url);

      this.emit('added', loadedImg);
      return loadedImg;
    } catch (error) {
      this.loadingImgSet.delete(url);
      this.emit('error', url, error as Error);
      console.error(`Failed to load image: ${url}`, error);
      return null;
    }
  }

  private async waitForLoad(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const checkLoad = () => {
        const cached = this.imgCache.get(url);
        if (cached) {
          resolve(cached.img);
        } else if (!this.loadingImgSet.has(url)) {
          resolve(null);
        } else {
          setTimeout(checkLoad, 10);
        }
      };
      checkLoad();
    });
  }

  private async processPreloadQueue(): Promise<void> {
    const batch = this.preloadQueue.splice(0, this.preloadBatchSize);
    if (batch.length === 0) return;

    const loadPromises = batch.map((url) => this.loadImage(url));
    await Promise.allSettled(loadPromises);

    // 发送预加载完成事件
    batch.forEach((url) => {
      if (this.imgCache.has(url)) {
        this.emit('preloaded', url);
      }
    });

    // 继续处理剩余队列
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }

  private estimateImageSize(img: HTMLImageElement): number {
    // 估算图片内存占用：宽 × 高 × 4字节（RGBA）
    return img.naturalWidth * img.naturalHeight * 4;
  }

  private removeFromCache(url: string): void {
    const entry = this.imgCache.get(url);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.imgCache.delete(url);
    }
  }

  private scheduleCleanup = (() => {
    let timeoutId: number | undefined;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.cleanup();
        timeoutId = undefined;
      }, 30000); // 30秒后清理
    };
  })();

  /**
   * 销毁管理器，清理所有资源
   */
  destroy(): void {
    this.imgCache.clear();
    this.loadingImgSet.clear();
    this.preloadQueue.length = 0;
    this.currentCacheSize = 0;
    // 清理所有事件监听器
    (this as any).eventMap = {};
  }
}
