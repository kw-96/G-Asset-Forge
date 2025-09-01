import { EventEmitter } from '@g-asset-forge/common';

interface OfflineManagerEvents {
  online(): void;
  offline(): void;
  networkChange(isOnline: boolean): void;
  cacheUpdate(resource: string): void;
  syncComplete(): void;
  syncError(error: Error): void;
}

interface CacheEntry {
  url: string;
  data: string | ArrayBuffer;
  timestamp: number;
  mimeType: string;
  size: number;
}

/**
 * 离线模式和内网支持管理器
 * 优化离线模式和内网支持，确保应用在无网络环境下正常运行
 */
export class OfflineManager extends EventEmitter<OfflineManagerEvents> {
  private static instance: OfflineManager;
  private isOnline = navigator.onLine;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests: Array<{
    url: string;
    options?: RequestInit;
    resolve: Function;
    reject: Function;
  }> = [];
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  private constructor() {
    super();
    this.initializeNetworkListeners();
    this.loadCacheFromStorage();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * 检查是否在线
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * 获取网络类型信息
   */
  getNetworkInfo(): {
    type: string;
    effectiveType?: string;
    downlink?: number;
  } {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
      };
    }

    return { type: 'unknown' };
  }

  /**
   * 智能fetch - 支持离线缓存
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    // 如果在线，尝试网络请求
    if (this.isOnline) {
      try {
        const response = await fetch(url, options);

        // 缓存成功的GET请求
        if (response.ok && (!options?.method || options.method === 'GET')) {
          await this.cacheResponse(url, response.clone());
        }

        return response;
      } catch (error) {
        console.warn('网络请求失败，尝试使用缓存:', url);
        // 网络请求失败，尝试使用缓存
        return this.getFromCache(url);
      }
    }

    // 离线模式，使用缓存
    return this.getFromCache(url);
  }

  /**
   * 预缓存资源
   */
  async precacheResources(urls: string[]): Promise<void> {
    const promises = urls.map((url) => this.cacheResource(url));
    await Promise.allSettled(promises);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number;
    count: number;
    maxSize: number;
    usage: number;
  } {
    return {
      size: this.currentCacheSize,
      count: this.cache.size,
      maxSize: this.maxCacheSize,
      usage: (this.currentCacheSize / this.maxCacheSize) * 100,
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    this.saveCacheToStorage();
  }

  /**
   * 同步离线数据
   */
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('无法在离线状态下同步数据');
    }

    try {
      // 处理待处理的请求
      const pendingPromises = this.pendingRequests.map(async (request) => {
        try {
          const response = await fetch(request.url, request.options);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      });

      await Promise.allSettled(pendingPromises);
      this.pendingRequests.length = 0;

      this.emit('syncComplete');
    } catch (error) {
      this.emit('syncError', error as Error);
      throw error;
    }
  }

  /**
   * 检查资源是否已缓存
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * 获取缓存的资源列表
   */
  getCachedResources(): string[] {
    return Array.from(this.cache.keys());
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.emit('networkChange', true);

      // 在线时尝试同步数据
      this.syncOfflineData().catch((error) => {
        console.error('同步离线数据失败:', error);
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
      this.emit('networkChange', false);
    });

    // 监听网络连接变化
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.emit('networkChange', this.isOnline);
      });
    }
  }

  private async cacheResource(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await this.cacheResponse(url, response);
      }
    } catch (error) {
      console.warn('缓存资源失败:', url, error);
    }
  }

  private async cacheResponse(url: string, response: Response): Promise<void> {
    try {
      const data = await response.arrayBuffer();
      const mimeType =
        response.headers.get('content-type') || 'application/octet-stream';
      const size = data.byteLength;

      // 检查缓存大小限制
      if (this.currentCacheSize + size > this.maxCacheSize) {
        this.evictOldEntries(size);
      }

      const entry: CacheEntry = {
        url,
        data,
        timestamp: Date.now(),
        mimeType,
        size,
      };

      this.cache.set(url, entry);
      this.currentCacheSize += size;

      this.emit('cacheUpdate', url);
      this.saveCacheToStorage();
    } catch (error) {
      console.error('缓存响应失败:', url, error);
    }
  }

  private getFromCache(url: string): Response {
    const entry = this.cache.get(url);

    if (!entry) {
      throw new Error(`资源未缓存: ${url}`);
    }

    // 更新访问时间
    entry.timestamp = Date.now();

    return new Response(entry.data, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': entry.mimeType,
        'Content-Length': entry.size.toString(),
      },
    });
  }

  private evictOldEntries(requiredSize: number): void {
    // 按时间戳排序，删除最旧的条目
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp,
    );

    let freedSize = 0;
    for (const [url, entry] of entries) {
      this.cache.delete(url);
      this.currentCacheSize -= entry.size;
      freedSize += entry.size;

      if (freedSize >= requiredSize) {
        break;
      }
    }
  }

  private saveCacheToStorage(): void {
    try {
      // 只保存缓存元数据，不保存实际数据（太大）
      const metadata = Array.from(this.cache.entries()).map(([url, entry]) => ({
        url,
        timestamp: entry.timestamp,
        mimeType: entry.mimeType,
        size: entry.size,
      }));

      localStorage.setItem('offline-cache-metadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('保存缓存元数据失败:', error);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      const metadataStr = localStorage.getItem('offline-cache-metadata');
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr);
        // 这里只是加载元数据，实际数据需要重新获取
        console.log('加载缓存元数据:', metadata.length, '个条目');
      }
    } catch (error) {
      console.error('加载缓存元数据失败:', error);
    }
  }
}

// 导出单例实例
export const offlineManager = OfflineManager.getInstance();
