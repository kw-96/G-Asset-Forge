import { AssetCategory } from "@/interfaces/types/asset";
import { AssetMetadata } from "./AssetStorageManager";

/**
 * 素材库管理器
 */
export interface AssetCategoryInfo {
  id: string;
  name: string;
  icon: string;
  subcategories: AssetCategoryInfo[];
  count: number;
}


export interface AssetSearchResult {
  assets: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AssetSearchOptions {
  filter: any;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
}

/**
 * 素材库管理器 - 负责素材的事件监听与添加
 */
export class AssetLibraryManager {
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private assets: AssetMetadata[] = [];

  /**
   * 注册素材库事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数，参数为素材搜索结果
   */
  on(eventName: string, callback: (result: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(callback);
  }

  /**
   * 移除素材库事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback: (result: any) => void): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventName);
      }
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`AssetLibraryManager 事件处理错误 [${eventName}]:`, error);
        }
      });
    }
  }

  /**
   * 添加新素材到素材库
   * @param asset 素材信息对象
   */
  addAsset(asset: { 
    license: string; 
    isCustom: boolean; 
    previewUrl?: string; 
    name: string; 
    category: string; 
    tags: string[]; 
    fileType: string; 
    fileSize: number; 
    dimensions: string; 
    originalUrl: string; 
  }): void {
    const newAsset: AssetMetadata = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: asset.name,
      type: asset.fileType,
      size: asset.fileSize,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: asset.tags,
      category: asset.category,
      thumbnail: asset.previewUrl
    };

    this.assets.push(newAsset);
    
    // 触发素材添加事件
    this.emit('assetAdded', newAsset);
  }

  getAllAssets(): AssetMetadata[] {
    return [...this.assets];
  }

  batchDeleteAssets(assetIds: string[]): void {
    const deletedAssets = this.assets.filter(asset => assetIds.includes(asset.id));
    this.assets = this.assets.filter(asset => !assetIds.includes(asset.id));
    
    // 触发批量删除事件
    this.emit('assetsDeleted', { deletedAssets, remainingCount: this.assets.length });
  }

  batchUpdateAssets(assetIds: string[], updates: Partial<AssetMetadata>): void {
    const updatedAssets: AssetMetadata[] = [];
    
    this.assets = this.assets.map(asset => {
      if (assetIds.includes(asset.id)) {
        // 确保保留所有必需的属性，只更新提供的属性
        const updatedAsset: AssetMetadata = { 
          id: asset.id,
          name: asset.name,
          type: asset.type,
          size: asset.size,
          createdAt: asset.createdAt,
          updatedAt: new Date(),
          tags: asset.tags,
          category: asset.category,
          thumbnail: asset.thumbnail,
          ...updates // 覆盖需要更新的属性
        };
        updatedAssets.push(updatedAsset);
        return updatedAsset;
      }
      return asset;
    });
    
    // 触发批量更新事件
    this.emit('assetsUpdated', { updatedAssets });
  }

  getAsset(assetId: string): AssetMetadata | undefined {
    return this.assets.find(asset => asset.id === assetId);
  }

  updateAsset(assetId: string, updates: Partial<AssetMetadata>): void {
    const assetIndex = this.assets.findIndex(asset => asset.id === assetId);
    if (assetIndex !== -1) {
      const currentAsset = this.assets[assetIndex];
      if (currentAsset) {
        // 确保保留所有必需的属性，只更新提供的属性
        this.assets[assetIndex] = { 
          id: currentAsset.id,
          name: currentAsset.name,
          type: currentAsset.type,
          size: currentAsset.size,
          createdAt: currentAsset.createdAt,
          updatedAt: new Date(),
          tags: currentAsset.tags,
          category: currentAsset.category,
          thumbnail: currentAsset.thumbnail,
          ...updates // 覆盖需要更新的属性
        };
        
        // 触发单个素材更新事件
        this.emit('assetUpdated', this.assets[assetIndex]);
      }
    }
  }

  toggleFavorite(id: string): void {
    const asset = this.assets.find(a => a.id === id);
    if (asset) {
      // 注意：AssetMetadata 接口中没有 isFavorite 属性，这里只是触发事件
      // 实际应用中需要扩展接口或使用其他方式存储收藏状态
      asset.updatedAt = new Date();
      
      // 触发收藏状态变化事件
      this.emit('favoriteToggled', { assetId: id, isFavorite: true });
    }
  }

  /**
   * 搜索素材
   * @param options 搜索选项
   */
  searchAssets(options: AssetSearchOptions): AssetSearchResult {
    let filteredAssets = [...this.assets];
    
    // 应用搜索查询过滤
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query)) ||
        asset.category.toLowerCase().includes(query)
      );
    }
    
    // 应用分类过滤
    if (options.category) {
      filteredAssets = filteredAssets.filter(asset => asset.category === options.category);
    }
    
    // 应用子分类过滤
    if (options.subcategory) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.tags.includes(options.subcategory!)
      );
    }
    
    // 应用标签过滤
    if (options.tags && options.tags.length > 0) {
      filteredAssets = filteredAssets.filter(asset => 
        options.tags!.some(tag => asset.tags.includes(tag))
      );
    }
    
    // 应用排序
    if (options.sortBy) {
      filteredAssets.sort((a, b) => {
        const aValue = (a as any)[options.sortBy!];
        const bValue = (b as any)[options.sortBy!];
        
        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    // 应用分页
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
    
    const result: AssetSearchResult = {
      assets: paginatedAssets,
      totalCount: filteredAssets.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredAssets.length / pageSize),
      hasMore: endIndex < filteredAssets.length
    };
    
    // 触发搜索完成事件
    this.emit('searchCompleted', result);
    
    return result;
  }

  private categories: AssetCategory[] = [];

  getCategories(): AssetCategory[] {
    return this.categories;
  }

  addCategory(category: AssetCategory): void {
    this.categories.push(category);
  }
}
