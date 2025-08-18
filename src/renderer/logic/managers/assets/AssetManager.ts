/**
 * 素材管理器 - 统一管理素材的加载、搜索、分类等功能
 * @description 协调素材存储、搜索引擎、缩略图生成等子系统
 * @author 开发团队
 */

import { useAssetStore } from '../../../stores/assetStore';
import type { 
  Asset, 
  AssetType, 
  AssetFilter, 
  SortOption,
  AssetCategory,
  AssetTag
} from '../../../stores/assetStore';

/**
 * 素材事件类型
 */
export type AssetEvent = 
  | 'asset-added'
  | 'asset-updated'
  | 'asset-removed'
  | 'asset-selected'
  | 'category-changed'
  | 'search-completed'
  | 'upload-progress'
  | 'upload-completed'
  | 'asset-error';

/**
 * 素材事件监听器
 */
export type AssetEventListener = (event: AssetEvent, data?: any) => void;

/**
 * 素材操作结果接口
 */
export interface AssetOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  assets: Asset[];
  totalCount: number;
  searchTime: number;
  query: string;
  filters: AssetFilter;
}

/**
 * 素材统计接口
 */
export interface AssetStats {
  totalAssets: number;
  assetsByType: Record<AssetType, number>;
  assetsBySource: Record<string, number>;
  totalSize: number;
  averageRating: number;
  favoritesCount: number;
  recentCount: number;
}

/**
 * 素材管理器类
 * @description 提供素材系统的统一管理接口
 */
export class AssetManager {
  private static instance: AssetManager | null = null;
  private eventListeners: Map<AssetEvent, Set<AssetEventListener>> = new Map();
  private isInitialized = false;
  private searchCache: Map<string, SearchResult> = new Map();
  private readonly CACHE_SIZE = 50;

  private constructor() {}

  /**
   * 获取素材管理器单例实例
   */
  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * 初始化素材管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[asset-manager] 素材管理器已经初始化');
      return;
    }

    try {
      console.info('[asset-manager] 开始初始化素材管理器');

      // 初始化素材存储
      const assetStore = useAssetStore.getState();
      await assetStore.initializeAssets();

      this.isInitialized = true;

      console.info('[asset-manager] 素材管理器初始化完成');

    } catch (error) {
      console.error('[asset-manager] 素材管理器初始化失败:', error);
      this.emit('asset-error', error);
      throw error;
    }
  }

  /**
   * 销毁素材管理器
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    console.info('[asset-manager] 销毁素材管理器');

    // 清除搜索缓存
    this.searchCache.clear();

    // 清除事件监听器
    this.eventListeners.clear();

    this.isInitialized = false;
  }

  /**
   * 添加素材
   */
  public async addAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    try {
      const assetStore = useAssetStore.getState();
      const assetId = await assetStore.addAsset(assetData);

      const asset = assetStore.assets[assetId];
      
      this.emit('asset-added', asset);
      this.clearSearchCache(); // 清除搜索缓存

      console.info(`[asset-manager] 添加素材: ${assetData.name}`, { id: assetId });

      return { 
        success: true, 
        data: { id: assetId, asset } 
      };

    } catch (error) {
      const message = `添加素材失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[asset-manager] ${message}`, error);
      this.emit('asset-error', { action: 'add', error });
      
      return { success: false, message };
    }
  }

  /**
   * 更新素材
   */
  public updateAsset(id: string, updates: Partial<Asset>): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    const asset = assetStore.assets[id];

    if (!asset) {
      return { success: false, message: `素材不存在: ${id}` };
    }

    assetStore.updateAsset(id, updates);

    const updatedAsset = assetStore.assets[id];
    
    this.emit('asset-updated', { id, updates, asset: updatedAsset });
    this.clearSearchCache(); // 清除搜索缓存

    console.debug(`[asset-manager] 更新素材: ${asset.name}`, { 
      id, 
      updatedKeys: Object.keys(updates) 
    });

    return { success: true, data: { id, asset: updatedAsset } };
  }

  /**
   * 删除素材
   */
  public deleteAsset(id: string): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    const asset = assetStore.assets[id];

    if (!asset) {
      return { success: false, message: `素材不存在: ${id}` };
    }

    assetStore.deleteAsset(id);

    this.emit('asset-removed', { id, asset });
    this.clearSearchCache(); // 清除搜索缓存

    console.info(`[asset-manager] 删除素材: ${asset.name}`, { id });

    return { success: true, data: { id, asset } };
  }

  /**
   * 复制素材
   */
  public async duplicateAsset(id: string): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    try {
      const assetStore = useAssetStore.getState();
      const newId = await assetStore.duplicateAsset(id);

      if (!newId) {
        return { success: false, message: '复制素材失败' };
      }

      const newAsset = assetStore.assets[newId];
      
      this.emit('asset-added', newAsset);
      this.clearSearchCache(); // 清除搜索缓存

      console.info(`[asset-manager] 复制素材`, { originalId: id, newId });

      return { 
        success: true, 
        data: { originalId: id, newId, asset: newAsset } 
      };

    } catch (error) {
      const message = `复制素材失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[asset-manager] ${message}`, error);
      
      return { success: false, message };
    }
  }

  /**
   * 选择素材
   */
  public selectAsset(id: string): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    const asset = assetStore.assets[id];

    if (!asset) {
      return { success: false, message: `素材不存在: ${id}` };
    }

    assetStore.selectAsset(id);

    this.emit('asset-selected', { id, asset });

    console.debug(`[asset-manager] 选择素材: ${asset.name}`, { id });

    return { success: true, data: { id, asset } };
  }

  /**
   * 选择多个素材
   */
  public selectMultipleAssets(ids: string[]): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    const validIds = ids.filter(id => assetStore.assets[id]);

    if (validIds.length === 0) {
      return { success: false, message: '没有有效的素材可选择' };
    }

    assetStore.selectMultipleAssets(validIds);

    const assets = validIds.map(id => assetStore.assets[id]);
    
    this.emit('asset-selected', { ids: validIds, assets });

    console.debug(`[asset-manager] 选择多个素材`, { count: validIds.length });

    return { success: true, data: { ids: validIds, assets } };
  }

  /**
   * 清除选择
   */
  public clearSelection(): void {
    if (!this.isInitialized) {
      return;
    }

    const assetStore = useAssetStore.getState();
    assetStore.clearSelection();

    this.emit('asset-selected', { ids: [], assets: [] });

    console.debug('[asset-manager] 清除素材选择');
  }

  /**
   * 搜索素材
   */
  public async searchAssets(
    query: string, 
    filters: Partial<AssetFilter> = {},
    sortBy: SortOption = 'relevance'
  ): Promise<SearchResult> {
    if (!this.isInitialized) {
      throw new Error('素材管理器未初始化');
    }

    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(query, filters, sortBy);

    // 检查缓存
    if (this.searchCache.has(cacheKey)) {
      const cachedResult = this.searchCache.get(cacheKey)!;
      console.debug('[asset-manager] 使用缓存的搜索结果', { query, cacheKey });
      return cachedResult;
    }

    try {
      const assetStore = useAssetStore.getState();

      // 更新搜索状态
      assetStore.setSearchQuery(query);
      assetStore.updateFilters(filters);
      assetStore.setSortBy(sortBy);

      // 应用过滤器
      assetStore.applyFilters();

      // 获取过滤后的结果
      const filteredAssetIds = assetStore.filteredAssets;
      const assets = filteredAssetIds.map(id => assetStore.assets[id]).filter((asset): asset is Asset => asset !== undefined);

      const searchTime = performance.now() - startTime;

      const result: SearchResult = {
        assets,
        totalCount: assets.length,
        searchTime,
        query,
        filters: { ...assetStore.activeFilters, ...filters },
      };

      // 缓存结果
      this.cacheSearchResult(cacheKey, result);

      this.emit('search-completed', result);

      console.debug(`[asset-manager] 搜索完成`, {
        query,
        resultCount: assets.length,
        searchTime: `${searchTime.toFixed(2)}ms`,
      });

      return result;

    } catch (error) {
      console.error('[asset-manager] 搜索失败:', error);
      this.emit('asset-error', { action: 'search', error });
      throw error;
    }
  }

  /**
   * 设置当前分类
   */
  public setCurrentCategory(categoryId: string | null): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    
    if (categoryId && !assetStore.categories[categoryId]) {
      return { success: false, message: `分类不存在: ${categoryId}` };
    }

    assetStore.setCurrentCategory(categoryId);

    this.emit('category-changed', { categoryId });
    this.clearSearchCache(); // 清除搜索缓存

    console.debug(`[asset-manager] 设置当前分类: ${categoryId}`);

    return { success: true, data: { categoryId } };
  }

  /**
   * 切换收藏状态
   */
  public toggleFavorite(id: string): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    const assetStore = useAssetStore.getState();
    const asset = assetStore.assets[id];

    if (!asset) {
      return { success: false, message: `素材不存在: ${id}` };
    }

    const wasFavorite = asset.isFavorite;
    assetStore.toggleFavorite(id);

    const updatedAsset = assetStore.assets[id];

    if (!updatedAsset) {
      return { success: false, message: `更新后的素材不存在: ${id}` };
    }

    console.debug(`[asset-manager] 切换收藏状态: ${asset.name}`, { 
      id, 
      wasFavorite, 
      isFavorite: updatedAsset.isFavorite 
    });

    return { 
      success: true, 
      data: { 
        id, 
        asset: updatedAsset, 
        wasFavorite, 
        isFavorite: updatedAsset.isFavorite 
      } 
    };
  }

  /**
   * 上传素材文件
   */
  public async uploadAssets(files: File[]): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    if (files.length === 0) {
      return { success: false, message: '没有文件可上传' };
    }

    try {
      const assetStore = useAssetStore.getState();
      
      // 监听上传进度
      this.emit('upload-progress', { queue: assetStore.uploadQueue });

      // 开始上传
      const assetIds = await assetStore.uploadAssets(files);

      this.emit('upload-completed', { assetIds, fileCount: files.length });
      this.clearSearchCache(); // 清除搜索缓存

      console.info(`[asset-manager] 上传完成`, { 
        fileCount: files.length, 
        assetCount: assetIds.length 
      });

      return { 
        success: true, 
        data: { assetIds, fileCount: files.length } 
      };

    } catch (error) {
      const message = `上传失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[asset-manager] ${message}`, error);
      this.emit('asset-error', { action: 'upload', error });
      
      return { success: false, message };
    }
  }

  /**
   * 导出素材
   */
  public async exportAssets(assetIds: string[]): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    if (assetIds.length === 0) {
      return { success: false, message: '没有素材可导出' };
    }

    try {
      const assetStore = useAssetStore.getState();
      await assetStore.exportAssets(assetIds);

      console.info(`[asset-manager] 导出素材`, { count: assetIds.length });

      return { 
        success: true, 
        data: { assetIds, count: assetIds.length } 
      };

    } catch (error) {
      const message = `导出失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[asset-manager] ${message}`, error);
      
      return { success: false, message };
    }
  }

  /**
   * 导入素材
   */
  public async importAssets(data: any): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材管理器未初始化' };
    }

    try {
      const assetStore = useAssetStore.getState();
      const assetIds = await assetStore.importAssets(data);

      this.clearSearchCache(); // 清除搜索缓存

      console.info(`[asset-manager] 导入素材`, { count: assetIds.length });

      return { 
        success: true, 
        data: { assetIds, count: assetIds.length } 
      };

    } catch (error) {
      const message = `导入失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[asset-manager] ${message}`, error);
      
      return { success: false, message };
    }
  }

  /**
   * 获取素材统计信息
   */
  public getAssetStats(): AssetStats {
    const assetStore = useAssetStore.getState();
    const baseStats = assetStore.getAssetStats();

    return {
      ...baseStats,
      favoritesCount: assetStore.favorites.length,
      recentCount: assetStore.recentAssets.length,
    };
  }

  /**
   * 获取收藏的素材
   */
  public getFavoriteAssets(): Asset[] {
    const assetStore = useAssetStore.getState();
    return assetStore.getFavorites();
  }

  /**
   * 获取最近使用的素材
   */
  public getRecentAssets(count?: number): Asset[] {
    const assetStore = useAssetStore.getState();
    return assetStore.getRecentAssets(count);
  }

  /**
   * 获取分类列表
   */
  public getCategories(): AssetCategory[] {
    const assetStore = useAssetStore.getState();
    return Object.values(assetStore.categories);
  }

  /**
   * 获取标签列表
   */
  public getTags(): AssetTag[] {
    const assetStore = useAssetStore.getState();
    return Object.values(assetStore.tags);
  }

  /**
   * 预加载素材缩略图
   */
  public async preloadThumbnails(assetIds: string[]): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const assetStore = useAssetStore.getState();
    
    const promises = assetIds.map(id => assetStore.preloadThumbnail(id));
    
    try {
      await Promise.all(promises);
      console.debug(`[asset-manager] 预加载缩略图完成`, { count: assetIds.length });
    } catch (error) {
      console.warn('[asset-manager] 部分缩略图预加载失败:', error);
    }
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.clearSearchCache();
    
    if (this.isInitialized) {
      const assetStore = useAssetStore.getState();
      assetStore.clearThumbnailCache();
    }

    console.info('[asset-manager] 清除所有缓存');
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(event: AssetEvent, listener: AssetEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: AssetEvent, listener: AssetEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: AssetEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[asset-manager] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 生成搜索缓存键
   */
  private generateCacheKey(query: string, filters: Partial<AssetFilter>, sortBy: SortOption): string {
    return JSON.stringify({ query, filters, sortBy });
  }

  /**
   * 缓存搜索结果
   */
  private cacheSearchResult(key: string, result: SearchResult): void {
    // 如果缓存已满，删除最旧的条目
    if (this.searchCache.size >= this.CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      if (typeof firstKey === 'string') {
        this.searchCache.delete(firstKey);
      }
    }

    this.searchCache.set(key, result);
  }
  /**
   * 清除搜索缓存
   */
  private clearSearchCache(): void {
    this.searchCache.clear();
  }

  /**
   * 获取素材管理器状态
   */
  public getStatus() {
    const assetStore = useAssetStore.getState();
    const stats = this.getAssetStats();
    
    return {
      isInitialized: this.isInitialized,
      ...stats,
      selectedAssetsCount: assetStore.selectedAssets.length,
      currentCategory: assetStore.currentCategory ?? null,
      searchQuery: assetStore.searchQuery,
      isLoading: assetStore.isLoading,
      isUploading: assetStore.isUploading,
      uploadQueueSize: assetStore.uploadQueue.length,
      cacheSize: this.searchCache.size,
      eventListenerCount: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.size, 0),
    };
  }
}

// 导出单例实例
export const assetManager = AssetManager.getInstance();