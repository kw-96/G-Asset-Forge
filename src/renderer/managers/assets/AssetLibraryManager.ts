// 素材库管理器 - 负责素材分类、存储和管理
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';

export type AssetCategory = 'background' | 'character' | 'ui' | 'icon' | 'effect';

export interface IAssetMetadata {
  id: string;
  name: string;
  description?: string;
  category: AssetCategory;
  subcategory?: string;
  tags: string[];
  fileType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  thumbnailUrl?: string;
  previewUrl?: string;
  originalUrl: string;
  license: 'free' | 'premium' | 'custom';
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  rating: number;
  isFavorite: boolean;
  isCustom: boolean; // 用户上传的素材
}

export interface IAssetCategoryInfo {
  id: AssetCategory;
  name: string;
  description: string;
  icon: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  defaultTags: string[];
}

export interface IAssetFilter {
  category?: AssetCategory;
  subcategory?: string;
  tags?: string[];
  fileType?: string[];
  license?: ('free' | 'premium' | 'custom')[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  isFavorite?: boolean;
  isCustom?: boolean;
  author?: string;
  minRating?: number;
}

export interface IAssetSearchOptions {
  query?: string;
  filter?: IAssetFilter;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface IAssetSearchResult {
  assets: IAssetMetadata[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IAssetLibraryEvents extends Record<string, (...args: any[]) => void> {
  assetAdded(asset: IAssetMetadata): void;
  assetUpdated(asset: IAssetMetadata): void;
  assetRemoved(assetId: string): void;
  categoryChanged(category: AssetCategory, count: number): void;
  searchCompleted(result: IAssetSearchResult): void;
  thumbnailGenerated(assetId: string, thumbnailUrl: string): void;
  favoriteToggled(assetId: string, isFavorite: boolean): void;
  downloadStarted(assetId: string): void;
  downloadCompleted(assetId: string): void;
  error(error: Error): void;
}

/**
 * 素材库管理器
 * 负责素材的分类、存储、搜索和管理
 */
export class AssetLibraryManager {
  private emitter = new EventEmitter<IAssetLibraryEvents>();
  private assets: Map<string, IAssetMetadata> = new Map();
  private categories: Map<AssetCategory, IAssetCategoryInfo> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // 关键词 -> 素材ID集合
  private tagIndex: Map<string, Set<string>> = new Map(); // 标签 -> 素材ID集合
  private categoryIndex: Map<AssetCategory, Set<string>> = new Map(); // 分类 -> 素材ID集合
  private favorites: Set<string> = new Set(); // 收藏的素材ID
  private storageKey = 'asset-library-data';

  constructor() {
    this.initializeCategories();
    this.loadFromStorage();
  }

  /**
   * 初始化分类信息
   */
  private initializeCategories(): void {
    const categories: IAssetCategoryInfo[] = [
      {
        id: 'background',
        name: '背景',
        description: '游戏场景背景图片',
        icon: '🖼️',
        subcategories: [
          { id: 'sci-fi', name: '科幻', description: '科幻风格背景' },
          { id: 'fantasy', name: '魔幻', description: '魔幻风格背景' },
          { id: 'modern', name: '现代', description: '现代风格背景' },
          { id: 'pixel', name: '像素', description: '像素风格背景' },
          { id: 'nature', name: '自然', description: '自然风景背景' }
        ],
        defaultTags: ['背景', '场景', '环境', '风景']
      },
      {
        id: 'character',
        name: '角色',
        description: '游戏角色和人物素材',
        icon: '👤',
        subcategories: [
          { id: 'hero', name: '英雄', description: '主角和英雄角色' },
          { id: 'npc', name: 'NPC', description: '非玩家角色' },
          { id: 'enemy', name: '敌人', description: '敌对角色' },
          { id: 'animal', name: '动物', description: '动物角色' },
          { id: 'monster', name: '怪物', description: '怪物和生物' }
        ],
        defaultTags: ['角色', '人物', '精灵', '动画']
      },
      {
        id: 'ui',
        name: 'UI元素',
        description: '用户界面元素',
        icon: '🎛️',
        subcategories: [
          { id: 'button', name: '按钮', description: '各种按钮样式' },
          { id: 'panel', name: '面板', description: '对话框和面板' },
          { id: 'progress', name: '进度条', description: '进度和状态条' },
          { id: 'icon', name: '图标', description: 'UI图标元素' },
          { id: 'decoration', name: '装饰', description: '装饰性元素' }
        ],
        defaultTags: ['UI', '界面', '按钮', '图标']
      },
      {
        id: 'icon',
        name: '图标',
        description: '各种功能图标',
        icon: '⭐',
        subcategories: [
          { id: 'action', name: '动作', description: '动作和操作图标' },
          { id: 'item', name: '物品', description: '游戏物品图标' },
          { id: 'skill', name: '技能', description: '技能和魔法图标' },
          { id: 'status', name: '状态', description: '状态和属性图标' },
          { id: 'navigation', name: '导航', description: '导航和方向图标' }
        ],
        defaultTags: ['图标', '符号', '标识', '功能']
      },
      {
        id: 'effect',
        name: '特效',
        description: '视觉特效素材',
        icon: '✨',
        subcategories: [
          { id: 'particle', name: '粒子', description: '粒子特效' },
          { id: 'explosion', name: '爆炸', description: '爆炸特效' },
          { id: 'magic', name: '魔法', description: '魔法特效' },
          { id: 'fire', name: '火焰', description: '火焰特效' },
          { id: 'water', name: '水流', description: '水流特效' }
        ],
        defaultTags: ['特效', '动画', '粒子', '光效']
      }
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
      this.categoryIndex.set(category.id, new Set());
    });
  }

  /**
   * 添加素材
   */
  async addAsset(assetData: Omit<IAssetMetadata, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating' | 'isFavorite'>): Promise<IAssetMetadata> {
    const asset: IAssetMetadata = {
      ...assetData,
      id: this.generateAssetId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadCount: 0,
      rating: 0,
      isFavorite: false
    };

    // 存储素材
    this.assets.set(asset.id, asset);

    // 更新索引
    this.updateSearchIndex(asset);
    this.updateTagIndex(asset);
    this.updateCategoryIndex(asset);

    // 生成缩略图
    if (!asset.thumbnailUrl) {
      this.generateThumbnail(asset);
    }

    // 保存到存储
    this.saveToStorage();

    // 发送事件
    this.emitter.emit('assetAdded', asset);
    this.emitter.emit('categoryChanged', asset.category, this.getCategoryCount(asset.category));

    return asset;
  }

  /**
   * 更新素材
   */
  async updateAsset(assetId: string, updates: Partial<IAssetMetadata>): Promise<IAssetMetadata | null> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return null;
    }

    // 移除旧索引
    this.removeFromSearchIndex(asset);
    this.removeFromTagIndex(asset);
    this.removeFromCategoryIndex(asset);

    // 更新素材
    const updatedAsset: IAssetMetadata = {
      ...asset,
      ...updates,
      id: assetId, // 确保ID不被修改
      updatedAt: new Date()
    };

    this.assets.set(assetId, updatedAsset);

    // 更新索引
    this.updateSearchIndex(updatedAsset);
    this.updateTagIndex(updatedAsset);
    this.updateCategoryIndex(updatedAsset);

    // 保存到存储
    this.saveToStorage();

    // 发送事件
    this.emitter.emit('assetUpdated', updatedAsset);

    return updatedAsset;
  }

  /**
   * 删除素材
   */
  async removeAsset(assetId: string): Promise<boolean> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return false;
    }

    // 移除索引
    this.removeFromSearchIndex(asset);
    this.removeFromTagIndex(asset);
    this.removeFromCategoryIndex(asset);

    // 移除收藏
    this.favorites.delete(assetId);

    // 删除素材
    this.assets.delete(assetId);

    // 保存到存储
    this.saveToStorage();

    // 发送事件
    this.emitter.emit('assetRemoved', assetId);
    this.emitter.emit('categoryChanged', asset.category, this.getCategoryCount(asset.category));

    return true;
  }

  /**
   * 获取素材
   */
  getAsset(assetId: string): IAssetMetadata | null {
    return this.assets.get(assetId) || null;
  }

  /**
   * 获取所有素材
   */
  async getAllAssets(): Promise<IAssetMetadata[]> {
    return Array.from(this.assets.values());
  }

  /**
   * 批量更新素材
   */
  async batchUpdateAssets(assetIds: string[], updates: Partial<IAssetMetadata>): Promise<void> {
    const updatedAssets: IAssetMetadata[] = [];
    
    for (const assetId of assetIds) {
      const asset = this.assets.get(assetId);
      if (asset) {
        // 移除旧索引
        this.removeFromSearchIndex(asset);
        this.removeFromTagIndex(asset);
        this.removeFromCategoryIndex(asset);

        // 更新素材
        const updatedAsset: IAssetMetadata = {
          ...asset,
          ...updates,
          id: assetId, // 确保ID不被修改
          updatedAt: new Date()
        };

        this.assets.set(assetId, updatedAsset);
        updatedAssets.push(updatedAsset);

        // 重建索引
        this.updateSearchIndex(updatedAsset);
        this.updateTagIndex(updatedAsset);
        this.updateCategoryIndex(updatedAsset);
      }
    }

    // 保存到存储
    this.saveToStorage();

    // 发送事件
    updatedAssets.forEach(asset => {
      this.emitter.emit('assetUpdated', asset);
    });
  }

  /**
   * 批量删除素材
   */
  async batchDeleteAssets(assetIds: string[]): Promise<void> {
    const deletedAssets: IAssetMetadata[] = [];
    
    for (const assetId of assetIds) {
      const asset = this.assets.get(assetId);
      if (asset) {
        // 移除索引
        this.removeFromSearchIndex(asset);
        this.removeFromTagIndex(asset);
        this.removeFromCategoryIndex(asset);

        // 删除素材
        this.assets.delete(assetId);
        deletedAssets.push(asset);
      }
    }

    // 保存到存储
    this.saveToStorage();

    // 发送事件
    deletedAssets.forEach(asset => {
      this.emitter.emit('assetDeleted', asset);
      this.emitter.emit('categoryChanged', asset.category, this.getCategoryCount(asset.category));
    });
  }

  /**
   * 搜索素材
   */
  searchAssets(options: IAssetSearchOptions = {}): IAssetSearchResult {
    const {
      query = '',
      filter = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20
    } = options;

    let matchingAssets: IAssetMetadata[] = [];

    // 如果有搜索查询，使用搜索索引
    if (query.trim()) {
      const queryAssetIds = this.searchByQuery(query);
      matchingAssets = Array.from(queryAssetIds)
        .map(id => this.assets.get(id))
        .filter((asset): asset is IAssetMetadata => asset !== undefined);
    } else {
      // 否则获取所有素材
      matchingAssets = Array.from(this.assets.values());
    }

    // 应用过滤器
    matchingAssets = this.applyFilters(matchingAssets, filter);

    // 排序
    matchingAssets = this.sortAssets(matchingAssets, sortBy, sortOrder);

    // 分页
    const totalCount = matchingAssets.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssets = matchingAssets.slice(startIndex, endIndex);

    const result: IAssetSearchResult = {
      assets: paginatedAssets,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages
    };

    // 发送搜索完成事件
    this.emitter.emit('searchCompleted', result);

    return result;
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(assetId: string): Promise<boolean> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return false;
    }

    const isFavorite = !asset.isFavorite;
    
    if (isFavorite) {
      this.favorites.add(assetId);
    } else {
      this.favorites.delete(assetId);
    }

    // 更新素材
    await this.updateAsset(assetId, { isFavorite });

    // 发送事件
    this.emitter.emit('favoriteToggled', assetId, isFavorite);

    return isFavorite;
  }

  /**
   * 获取分类信息
   */
  getCategories(): IAssetCategoryInfo[] {
    return Array.from(this.categories.values());
  }

  /**
   * 获取分类下的素材数量
   */
  getCategoryCount(category: AssetCategory): number {
    return this.categoryIndex.get(category)?.size || 0;
  }

  /**
   * 获取所有标签
   */
  getAllTags(): string[] {
    return Array.from(this.tagIndex.keys()).sort();
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    return Array.from(this.tagIndex.entries())
      .map(([tag, assetIds]) => ({ tag, count: assetIds.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 生成素材ID
   */
  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新搜索索引
   */
  private updateSearchIndex(asset: IAssetMetadata): void {
    const searchableText = [
      asset.name,
      asset.description || '',
      asset.category,
      asset.subcategory || '',
      asset.author || '',
      ...asset.tags
    ].join(' ').toLowerCase();

    // 分词并建立索引
    const words = searchableText.split(/\s+/).filter(word => word.length > 0);
    words.forEach(word => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(asset.id);
    });
  }

  /**
   * 移除搜索索引
   */
  private removeFromSearchIndex(asset: IAssetMetadata): void {
    this.searchIndex.forEach((assetIds, word) => {
      assetIds.delete(asset.id);
      if (assetIds.size === 0) {
        this.searchIndex.delete(word);
      }
    });
  }

  /**
   * 更新标签索引
   */
  private updateTagIndex(asset: IAssetMetadata): void {
    asset.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(asset.id);
    });
  }

  /**
   * 移除标签索引
   */
  private removeFromTagIndex(asset: IAssetMetadata): void {
    asset.tags.forEach(tag => {
      const assetIds = this.tagIndex.get(tag);
      if (assetIds) {
        assetIds.delete(asset.id);
        if (assetIds.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
  }

  /**
   * 更新分类索引
   */
  private updateCategoryIndex(asset: IAssetMetadata): void {
    const categoryAssets = this.categoryIndex.get(asset.category);
    if (categoryAssets) {
      categoryAssets.add(asset.id);
    }
  }

  /**
   * 移除分类索引
   */
  private removeFromCategoryIndex(asset: IAssetMetadata): void {
    const categoryAssets = this.categoryIndex.get(asset.category);
    if (categoryAssets) {
      categoryAssets.delete(asset.id);
    }
  }

  /**
   * 根据查询搜索
   */
  private searchByQuery(query: string): Set<string> {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const matchingAssetIds = new Set<string>();

    queryWords.forEach(word => {
      // 精确匹配
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word)!.forEach(id => matchingAssetIds.add(id));
      }

      // 模糊匹配
      this.searchIndex.forEach((assetIds, indexWord) => {
        if (indexWord.includes(word) || word.includes(indexWord)) {
          assetIds.forEach(id => matchingAssetIds.add(id));
        }
      });
    });

    return matchingAssetIds;
  }

  /**
   * 应用过滤器
   */
  private applyFilters(assets: IAssetMetadata[], filter: IAssetFilter): IAssetMetadata[] {
    return assets.filter(asset => {
      // 分类过滤
      if (filter.category && asset.category !== filter.category) {
        return false;
      }

      // 子分类过滤
      if (filter.subcategory && asset.subcategory !== filter.subcategory) {
        return false;
      }

      // 标签过滤
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => asset.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 文件类型过滤
      if (filter.fileType && filter.fileType.length > 0) {
        if (!filter.fileType.includes(asset.fileType)) {
          return false;
        }
      }

      // 许可证过滤
      if (filter.license && filter.license.length > 0) {
        if (!filter.license.includes(asset.license)) {
          return false;
        }
      }

      // 尺寸过滤
      if (filter.minWidth && asset.dimensions.width < filter.minWidth) {
        return false;
      }
      if (filter.maxWidth && asset.dimensions.width > filter.maxWidth) {
        return false;
      }
      if (filter.minHeight && asset.dimensions.height < filter.minHeight) {
        return false;
      }
      if (filter.maxHeight && asset.dimensions.height > filter.maxHeight) {
        return false;
      }

      // 收藏过滤
      if (filter.isFavorite !== undefined && asset.isFavorite !== filter.isFavorite) {
        return false;
      }

      // 自定义素材过滤
      if (filter.isCustom !== undefined && asset.isCustom !== filter.isCustom) {
        return false;
      }

      // 作者过滤
      if (filter.author && asset.author !== filter.author) {
        return false;
      }

      // 评分过滤
      if (filter.minRating && asset.rating < filter.minRating) {
        return false;
      }

      return true;
    });
  }

  /**
   * 排序素材
   */
  private sortAssets(assets: IAssetMetadata[], sortBy: string, sortOrder: 'asc' | 'desc'): IAssetMetadata[] {
    return assets.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'downloadCount':
          comparison = a.downloadCount - b.downloadCount;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * 生成缩略图
   */
  private async generateThumbnail(asset: IAssetMetadata): Promise<void> {
    try {
      // 这里应该实现实际的缩略图生成逻辑
      // 暂时使用原图作为缩略图
      const thumbnailUrl = asset.originalUrl;
      
      // 更新素材
      await this.updateAsset(asset.id, { thumbnailUrl });
      
      // 发送事件
      this.emitter.emit('thumbnailGenerated', asset.id, thumbnailUrl);
    } catch (error) {
      console.error('生成缩略图失败:', error);
      this.emitter.emit('error', error as Error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data = {
        assets: Array.from(this.assets.entries()),
        favorites: Array.from(this.favorites),
        version: '1.0.0',
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存素材库数据失败:', error);
      this.emitter.emit('error', error as Error);
    }
  }

  /**
   * 初始化示例数据
   */
  private initializeDemoAssets(): void {
    const demoAssets: Omit<IAssetMetadata, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '科幻城市背景',
        description: '未来感十足的科幻城市背景，适合科幻主题游戏',
        category: 'background',
        subcategory: 'sci-fi',
        tags: ['科幻', '城市', '背景', '未来'],
        fileType: 'image/png',
        fileSize: 2048000,
        dimensions: { width: 1920, height: 1080 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPHN2ZxradGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNTFhNSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDNkN2EiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
        license: 'free',
        author: 'G-Asset Forge',
        downloadCount: 156,
        rating: 4.8,
        isFavorite: true,
        isCustom: false
      },
      {
        name: '战士角色',
        description: '勇敢的战士角色，适合RPG和动作游戏',
        category: 'character',
        subcategory: 'hero',
        tags: ['角色', '战士', '英雄', 'RPG'],
        fileType: 'image/png',
        fileSize: 512000,
        dimensions: { width: 256, height: 256 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjY0IiB5PSI2NCIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiM2MzY2ZjEiLz4KPHRleHQgeD0iMTI4IiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPuaImOWjqzwvdGV4dD4KPC9zdmc+',
        license: 'free',
        author: 'G-Asset Forge',
        downloadCount: 89,
        rating: 4.5,
        isFavorite: false,
        isCustom: false
      },
      {
        name: '游戏按钮',
        description: '通用游戏UI按钮，支持多种状态',
        category: 'ui',
        subcategory: 'button',
        tags: ['UI', '按钮', '界面', '交互'],
        fileType: 'image/png',
        fileSize: 32000,
        dimensions: { width: 200, height: 60 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iMTAiIGZpbGw9IiMzZjgxZjQiLz4KPHR0ZXh0IHg9IjEwMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkNsaWNrIE1lPC90ZXh0Pgo8L3N2Zz4K',
        license: 'free',
        author: 'UI Designer',
        downloadCount: 234,
        rating: 4.2,
        isFavorite: true,
        isCustom: false
      },
      {
        name: '设置图标',
        description: '齿轮样式的设置图标，适用于各类设置界面',
        category: 'icon',
        subcategory: 'system',
        tags: ['图标', '设置', '齿轮', '系统'],
        fileType: 'image/svg+xml',
        fileSize: 4096,
        dimensions: { width: 64, height: 64 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiM2YzY1N2QiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzNyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmM3NTdkIj7orr7nva48L3RleHQ+Cjwvc3ZnPg==',
        license: 'free',
        author: 'Icon Pack',
        downloadCount: 178,
        rating: 4.6,
        isFavorite: false,
        isCustom: false
      },
      {
        name: '爆炸特效',
        description: '动态爆炸特效动画，适合战斗和破坏场景',
        category: 'effect',
        subcategory: 'explosion',
        tags: ['特效', '爆炸', '动画', '战斗'],
        fileType: 'image/gif',
        fileSize: 1024000,
        dimensions: { width: 128, height: 128 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjQ4IiBmaWxsPSJ1cmwoI2V4cGxvc2lvbikiLz4KPGR0ZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9ImV4cGxvc2lvbiI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmI4MDAiLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTI2MDAiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojN2Y4MzAwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPHR0ZXh0IHg9IjY0IiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+SUtBTTwvdGV4dD4KPC9zdmc+',
        license: 'premium',
        author: 'VFX Studio',
        downloadCount: 67,
        rating: 4.9,
        isFavorite: false,
        isCustom: false
      },
      {
        name: '魔法森林',
        description: '神秘的魔法森林背景，充满奇幻色彩',
        category: 'background',
        subcategory: 'fantasy',
        tags: ['魔幻', '森林', '自然', '神秘'],
        fileType: 'image/png',
        fileSize: 3072000,
        dimensions: { width: 1920, height: 1080 },
        originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI2ZvcmVzdCkiLz4KPGR0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImZvcmVzdCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MWQ1ZmYiLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0YWY0NTkiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDM3MzE5Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHR0ZXh0IHg9Ijk2MCIgeT0iNTQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj7prpTms5XmoK7mnpE8L3RleHQ+Cjwvc3ZnPg==',
        license: 'free',
        author: 'Fantasy Arts',
        downloadCount: 203,
        rating: 4.7,
        isFavorite: true,
        isCustom: false
      }
    ];

    // 添加示例数据
    demoAssets.forEach(demoAsset => {
      this.addAsset(demoAsset);
    });

    console.log('已初始化', demoAssets.length, '个示例素材');
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const dataStr = localStorage.getItem(this.storageKey);
      if (!dataStr) {
        // 首次使用，添加示例数据
        this.initializeDemoAssets();
        return;
      }

      const data = JSON.parse(dataStr);
      
      // 恢复素材数据
      if (data.assets && Array.isArray(data.assets)) {
        data.assets.forEach(([id, assetData]: [string, any]) => {
          // 转换日期字符串为Date对象
          const asset: IAssetMetadata = {
            ...assetData,
            createdAt: new Date(assetData.createdAt),
            updatedAt: new Date(assetData.updatedAt)
          };
          
          this.assets.set(id, asset);
          
          // 重建索引
          this.updateSearchIndex(asset);
          this.updateTagIndex(asset);
          this.updateCategoryIndex(asset);
        });
      }

      // 恢复收藏数据
      if (data.favorites && Array.isArray(data.favorites)) {
        data.favorites.forEach((assetId: string) => {
          this.favorites.add(assetId);
        });
      }

      console.log(`已加载 ${this.assets.size} 个素材`);
    } catch (error) {
      console.error('加载素材库数据失败:', error);
      this.emitter.emit('error', error as Error);
    }
  }

  /**
   * 清空素材库
   */
  async clearLibrary(): Promise<void> {
    this.assets.clear();
    this.searchIndex.clear();
    this.tagIndex.clear();
    this.favorites.clear();
    
    // 重置分类索引
    this.categories.forEach((_, category) => {
      this.categoryIndex.set(category, new Set());
    });

    this.saveToStorage();
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const totalAssets = this.assets.size;
    const categoryStats = new Map<AssetCategory, number>();
    
    this.categories.forEach((_, category) => {
      categoryStats.set(category, this.getCategoryCount(category));
    });

    return {
      totalAssets,
      totalFavorites: this.favorites.size,
      totalTags: this.tagIndex.size,
      categoryStats: Object.fromEntries(categoryStats),
      customAssets: Array.from(this.assets.values()).filter(asset => asset.isCustom).length
    };
  }

  /**
   * 事件管理
   */
  on<T extends keyof IAssetLibraryEvents>(eventName: T, listener: IAssetLibraryEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IAssetLibraryEvents>(eventName: T, listener: IAssetLibraryEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.emitter.removeAllListeners();
  }
}