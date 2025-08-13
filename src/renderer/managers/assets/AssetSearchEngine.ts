// 素材搜索引擎 - 高性能搜索和过滤功能
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';
import { 
  type IAssetMetadata, 
  type IAssetFilter, 
  type IAssetSearchOptions, 
  type IAssetSearchResult,
  type AssetCategory 
} from './AssetLibraryManager';

export interface ISearchIndex {
  // 倒排索引：词 -> 素材ID集合
  termIndex: Map<string, Set<string>>;
  // 标签索引：标签 -> 素材ID集合
  tagIndex: Map<string, Set<string>>;
  // 分类索引：分类 -> 素材ID集合
  categoryIndex: Map<AssetCategory, Set<string>>;
  // 尺寸索引：尺寸范围 -> 素材ID集合
  sizeIndex: Map<string, Set<string>>;
  // 许可证索引：许可证类型 -> 素材ID集合
  licenseIndex: Map<string, Set<string>>;
  // 作者索引：作者 -> 素材ID集合
  authorIndex: Map<string, Set<string>>;
}

export interface ISearchSuggestion {
  type: 'keyword' | 'tag' | 'category' | 'author';
  text: string;
  count: number;
  score: number;
}

export interface ISearchAnalytics {
  totalSearches: number;
  popularQueries: Map<string, number>;
  popularTags: Map<string, number>;
  popularCategories: Map<AssetCategory, number>;
  averageResultCount: number;
  searchPerformance: {
    averageTime: number;
    slowQueries: Array<{ query: string; time: number }>;
  };
}

export interface IAdvancedFilter extends IAssetFilter {
  // 高级过滤选项
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  fileSizeRange?: {
    min?: number;
    max?: number;
  };
  dimensionRatio?: {
    min?: number; // 宽高比最小值
    max?: number; // 宽高比最大值
  };
  hasPreview?: boolean;
  hasThumbnail?: boolean;
  downloadCountRange?: {
    min?: number;
    max?: number;
  };
  ratingRange?: {
    min?: number;
    max?: number;
  };
}

export interface ISearchEngineEvents extends Record<string, (...args: any[]) => void> {
  searchStarted(query: string, options: IAssetSearchOptions): void;
  searchCompleted(result: IAssetSearchResult, duration: number): void;
  indexUpdated(assetId: string): void;
  indexRebuilt(totalAssets: number): void;
  suggestionGenerated(query: string, suggestions: ISearchSuggestion[]): void;
  slowQueryDetected(query: string, duration: number): void;
}

/**
 * 高性能素材搜索引擎
 * 提供智能搜索、过滤、排序和分页功能
 */
export class AssetSearchEngine {
  private emitter = new EventEmitter<ISearchEngineEvents>();
  private assets: Map<string, IAssetMetadata> = new Map();
  private searchIndex: ISearchIndex;
  private analytics: ISearchAnalytics;
  private stopWords = new Set(['的', '了', '和', '是', '在', '有', '不', '这', '那', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  private slowQueryThreshold = 100; // 100ms

  constructor() {
    this.searchIndex = {
      termIndex: new Map(),
      tagIndex: new Map(),
      categoryIndex: new Map(),
      sizeIndex: new Map(),
      licenseIndex: new Map(),
      authorIndex: new Map()
    };

    this.analytics = {
      totalSearches: 0,
      popularQueries: new Map(),
      popularTags: new Map(),
      popularCategories: new Map(),
      averageResultCount: 0,
      searchPerformance: {
        averageTime: 0,
        slowQueries: []
      }
    };
  }

  /**
   * 添加素材到索引
   */
  addAsset(asset: IAssetMetadata): void {
    this.assets.set(asset.id, asset);
    this.updateIndex(asset);
    this.emitter.emit('indexUpdated', asset.id);
  }

  /**
   * 更新素材索引
   */
  updateAsset(asset: IAssetMetadata): void {
    const oldAsset = this.assets.get(asset.id);
    if (oldAsset) {
      this.removeFromIndex(oldAsset);
    }
    
    this.assets.set(asset.id, asset);
    this.updateIndex(asset);
    this.emitter.emit('indexUpdated', asset.id);
  }

  /**
   * 从索引中移除素材
   */
  removeAsset(assetId: string): void {
    const asset = this.assets.get(assetId);
    if (asset) {
      this.removeFromIndex(asset);
      this.assets.delete(assetId);
      this.emitter.emit('indexUpdated', assetId);
    }
  }

  /**
   * 执行搜索
   */
  search(options: IAssetSearchOptions = {}): IAssetSearchResult {
    const startTime = performance.now();
    
    this.emitter.emit('searchStarted', options.query || '', options);
    
    const {
      query = '',
      filter = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20
    } = options;

    // 记录搜索分析
    this.recordSearch(query);

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
    matchingAssets = this.applyAdvancedFilters(matchingAssets, filter as IAdvancedFilter);

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

    const duration = performance.now() - startTime;
    
    // 记录性能分析
    this.recordPerformance(query, duration, totalCount);
    
    // 检测慢查询
    if (duration > this.slowQueryThreshold) {
      this.emitter.emit('slowQueryDetected', query, duration);
    }

    this.emitter.emit('searchCompleted', result, duration);
    return result;
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, limit: number = 10): ISearchSuggestion[] {
    const suggestions: ISearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // 关键词建议
    this.searchIndex.termIndex.forEach((assetIds, term) => {
      if (term.includes(queryLower) && term !== queryLower) {
        suggestions.push({
          type: 'keyword',
          text: term,
          count: assetIds.size,
          score: this.calculateSuggestionScore(term, queryLower, assetIds.size)
        });
      }
    });

    // 标签建议
    this.searchIndex.tagIndex.forEach((assetIds, tag) => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'tag',
          text: tag,
          count: assetIds.size,
          score: this.calculateSuggestionScore(tag, queryLower, assetIds.size)
        });
      }
    });

    // 分类建议
    this.searchIndex.categoryIndex.forEach((assetIds, category) => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'category',
          text: category,
          count: assetIds.size,
          score: this.calculateSuggestionScore(category, queryLower, assetIds.size)
        });
      }
    });

    // 作者建议
    this.searchIndex.authorIndex.forEach((assetIds, author) => {
      if (author.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'author',
          text: author,
          count: assetIds.size,
          score: this.calculateSuggestionScore(author, queryLower, assetIds.size)
        });
      }
    });

    // 按分数排序并限制数量
    const sortedSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    this.emitter.emit('suggestionGenerated', query, sortedSuggestions);
    return sortedSuggestions;
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    return Array.from(this.searchIndex.tagIndex.entries())
      .map(([tag, assetIds]) => ({ tag, count: assetIds.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取分类统计
   */
  getCategoryStats(): Map<AssetCategory, number> {
    const stats = new Map<AssetCategory, number>();
    this.searchIndex.categoryIndex.forEach((assetIds, category) => {
      stats.set(category, assetIds.size);
    });
    return stats;
  }

  /**
   * 重建索引
   */
  rebuildIndex(assets: IAssetMetadata[]): void {
    // 清空现有索引
    this.searchIndex = {
      termIndex: new Map(),
      tagIndex: new Map(),
      categoryIndex: new Map(),
      sizeIndex: new Map(),
      licenseIndex: new Map(),
      authorIndex: new Map()
    };

    this.assets.clear();

    // 重建索引
    assets.forEach(asset => {
      this.assets.set(asset.id, asset);
      this.updateIndex(asset);
    });

    this.emitter.emit('indexRebuilt', assets.length);
  }

  /**
   * 更新索引
   */
  private updateIndex(asset: IAssetMetadata): void {
    // 更新词汇索引
    this.updateTermIndex(asset);
    
    // 更新标签索引
    this.updateTagIndex(asset);
    
    // 更新分类索引
    this.updateCategoryIndex(asset);
    
    // 更新尺寸索引
    this.updateSizeIndex(asset);
    
    // 更新许可证索引
    this.updateLicenseIndex(asset);
    
    // 更新作者索引
    this.updateAuthorIndex(asset);
  }

  /**
   * 更新词汇索引
   */
  private updateTermIndex(asset: IAssetMetadata): void {
    const searchableText = [
      asset.name,
      asset.description || '',
      asset.subcategory || '',
      ...asset.tags
    ].join(' ').toLowerCase();

    // 分词并建立索引
    const terms = this.tokenize(searchableText);
    terms.forEach(term => {
      if (!this.searchIndex.termIndex.has(term)) {
        this.searchIndex.termIndex.set(term, new Set());
      }
      this.searchIndex.termIndex.get(term)!.add(asset.id);
    });
  }

  /**
   * 更新标签索引
   */
  private updateTagIndex(asset: IAssetMetadata): void {
    asset.tags.forEach(tag => {
      if (!this.searchIndex.tagIndex.has(tag)) {
        this.searchIndex.tagIndex.set(tag, new Set());
      }
      this.searchIndex.tagIndex.get(tag)!.add(asset.id);
    });
  }

  /**
   * 更新分类索引
   */
  private updateCategoryIndex(asset: IAssetMetadata): void {
    if (!this.searchIndex.categoryIndex.has(asset.category)) {
      this.searchIndex.categoryIndex.set(asset.category, new Set());
    }
    this.searchIndex.categoryIndex.get(asset.category)!.add(asset.id);
  }

  /**
   * 更新尺寸索引
   */
  private updateSizeIndex(asset: IAssetMetadata): void {
    const sizeCategory = this.getSizeCategory(asset.dimensions);
    if (!this.searchIndex.sizeIndex.has(sizeCategory)) {
      this.searchIndex.sizeIndex.set(sizeCategory, new Set());
    }
    this.searchIndex.sizeIndex.get(sizeCategory)!.add(asset.id);
  }

  /**
   * 更新许可证索引
   */
  private updateLicenseIndex(asset: IAssetMetadata): void {
    if (!this.searchIndex.licenseIndex.has(asset.license)) {
      this.searchIndex.licenseIndex.set(asset.license, new Set());
    }
    this.searchIndex.licenseIndex.get(asset.license)!.add(asset.id);
  }

  /**
   * 更新作者索引
   */
  private updateAuthorIndex(asset: IAssetMetadata): void {
    if (asset.author) {
      if (!this.searchIndex.authorIndex.has(asset.author)) {
        this.searchIndex.authorIndex.set(asset.author, new Set());
      }
      this.searchIndex.authorIndex.get(asset.author)!.add(asset.id);
    }
  }

  /**
   * 从索引中移除素材
   */
  private removeFromIndex(asset: IAssetMetadata): void {
    // 从所有索引中移除
    this.searchIndex.termIndex.forEach((assetIds, term) => {
      assetIds.delete(asset.id);
      if (assetIds.size === 0) {
        this.searchIndex.termIndex.delete(term);
      }
    });

    this.searchIndex.tagIndex.forEach((assetIds, tag) => {
      assetIds.delete(asset.id);
      if (assetIds.size === 0) {
        this.searchIndex.tagIndex.delete(tag);
      }
    });

    this.searchIndex.categoryIndex.forEach((assetIds) => {
      assetIds.delete(asset.id);
    });

    this.searchIndex.sizeIndex.forEach((assetIds, size) => {
      assetIds.delete(asset.id);
      if (assetIds.size === 0) {
        this.searchIndex.sizeIndex.delete(size);
      }
    });

    this.searchIndex.licenseIndex.forEach((assetIds) => {
      assetIds.delete(asset.id);
    });

    this.searchIndex.authorIndex.forEach((assetIds, author) => {
      assetIds.delete(asset.id);
      if (assetIds.size === 0) {
        this.searchIndex.authorIndex.delete(author);
      }
    });
  }

  /**
   * 根据查询搜索
   */
  private searchByQuery(query: string): Set<string> {
    const terms = this.tokenize(query.toLowerCase());
    const matchingAssetIds = new Set<string>();

    terms.forEach(term => {
      // 精确匹配
      if (this.searchIndex.termIndex.has(term)) {
        this.searchIndex.termIndex.get(term)!.forEach(id => matchingAssetIds.add(id));
      }

      // 前缀匹配
      this.searchIndex.termIndex.forEach((assetIds, indexTerm) => {
        if (indexTerm.startsWith(term) && indexTerm !== term) {
          assetIds.forEach(id => matchingAssetIds.add(id));
        }
      });

      // 模糊匹配（包含关系）
      this.searchIndex.termIndex.forEach((assetIds, indexTerm) => {
        if (indexTerm.includes(term) && indexTerm !== term && !indexTerm.startsWith(term)) {
          assetIds.forEach(id => matchingAssetIds.add(id));
        }
      });
    });

    return matchingAssetIds;
  }

  /**
   * 应用高级过滤器
   */
  private applyAdvancedFilters(assets: IAssetMetadata[], filter: IAdvancedFilter): IAssetMetadata[] {
    return assets.filter(asset => {
      // 基础过滤器
      if (filter.category && asset.category !== filter.category) return false;
      if (filter.subcategory && asset.subcategory !== filter.subcategory) return false;
      if (filter.license && filter.license.length > 0 && !filter.license.includes(asset.license)) return false;
      if (filter.fileType && filter.fileType.length > 0 && !filter.fileType.includes(asset.fileType)) return false;
      if (filter.isFavorite !== undefined && asset.isFavorite !== filter.isFavorite) return false;
      if (filter.isCustom !== undefined && asset.isCustom !== filter.isCustom) return false;
      if (filter.author && asset.author !== filter.author) return false;

      // 标签过滤
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => asset.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // 尺寸过滤
      if (filter.minWidth && asset.dimensions.width < filter.minWidth) return false;
      if (filter.maxWidth && asset.dimensions.width > filter.maxWidth) return false;
      if (filter.minHeight && asset.dimensions.height < filter.minHeight) return false;
      if (filter.maxHeight && asset.dimensions.height > filter.maxHeight) return false;

      // 高级过滤器
      if (filter.dateRange) {
        if (filter.dateRange.start && asset.createdAt < filter.dateRange.start) return false;
        if (filter.dateRange.end && asset.createdAt > filter.dateRange.end) return false;
      }

      if (filter.fileSizeRange) {
        if (filter.fileSizeRange.min && asset.fileSize < filter.fileSizeRange.min) return false;
        if (filter.fileSizeRange.max && asset.fileSize > filter.fileSizeRange.max) return false;
      }

      if (filter.dimensionRatio) {
        const ratio = asset.dimensions.width / asset.dimensions.height;
        if (filter.dimensionRatio.min && ratio < filter.dimensionRatio.min) return false;
        if (filter.dimensionRatio.max && ratio > filter.dimensionRatio.max) return false;
      }

      if (filter.hasPreview !== undefined && !!asset.previewUrl !== filter.hasPreview) return false;
      if (filter.hasThumbnail !== undefined && !!asset.thumbnailUrl !== filter.hasThumbnail) return false;

      if (filter.downloadCountRange) {
        if (filter.downloadCountRange.min && asset.downloadCount < filter.downloadCountRange.min) return false;
        if (filter.downloadCountRange.max && asset.downloadCount > filter.downloadCountRange.max) return false;
      }

      if (filter.ratingRange) {
        if (filter.ratingRange.min && asset.rating < filter.ratingRange.min) return false;
        if (filter.ratingRange.max && asset.rating > filter.ratingRange.max) return false;
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
        case 'relevance':
          // 相关性排序（可以基于搜索匹配度）
          comparison = 0; // 暂时不实现
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * 分词
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
      .split(/\s+/)
      .filter(term => term.length > 0 && !this.stopWords.has(term));
  }

  /**
   * 获取尺寸分类
   */
  private getSizeCategory(dimensions: { width: number; height: number }): string {
    const area = dimensions.width * dimensions.height;
    
    if (area < 10000) return 'small'; // < 100x100
    if (area < 250000) return 'medium'; // < 500x500
    if (area < 1000000) return 'large'; // < 1000x1000
    return 'xlarge'; // >= 1000x1000
  }

  /**
   * 计算建议分数
   */
  private calculateSuggestionScore(suggestion: string, query: string, count: number): number {
    const suggestionLower = suggestion.toLowerCase();
    const queryLower = query.toLowerCase();
    
    let score = 0;
    
    // 精确匹配得分最高
    if (suggestionLower === queryLower) {
      score += 100;
    }
    // 前缀匹配
    else if (suggestionLower.startsWith(queryLower)) {
      score += 80;
    }
    // 包含匹配
    else if (suggestionLower.includes(queryLower)) {
      score += 60;
    }
    
    // 根据素材数量调整分数
    score += Math.min(count / 10, 20);
    
    // 根据长度调整分数（较短的建议得分更高）
    score -= suggestion.length * 0.5;
    
    return Math.max(0, score);
  }

  /**
   * 记录搜索
   */
  private recordSearch(query: string): void {
    this.analytics.totalSearches++;
    
    if (query.trim()) {
      const count = this.analytics.popularQueries.get(query) || 0;
      this.analytics.popularQueries.set(query, count + 1);
    }
  }

  /**
   * 记录性能
   */
  private recordPerformance(query: string, duration: number, resultCount: number): void {
    // 更新平均时间
    const totalTime = this.analytics.searchPerformance.averageTime * (this.analytics.totalSearches - 1) + duration;
    this.analytics.searchPerformance.averageTime = totalTime / this.analytics.totalSearches;
    
    // 更新平均结果数
    const totalResults = this.analytics.averageResultCount * (this.analytics.totalSearches - 1) + resultCount;
    this.analytics.averageResultCount = totalResults / this.analytics.totalSearches;
    
    // 记录慢查询
    if (duration > this.slowQueryThreshold) {
      this.analytics.searchPerformance.slowQueries.push({ query, time: duration });
      
      // 只保留最近的10个慢查询
      if (this.analytics.searchPerformance.slowQueries.length > 10) {
        this.analytics.searchPerformance.slowQueries.shift();
      }
    }
  }

  /**
   * 获取搜索分析
   */
  getAnalytics(): ISearchAnalytics {
    return { ...this.analytics };
  }

  /**
   * 清空分析数据
   */
  clearAnalytics(): void {
    this.analytics = {
      totalSearches: 0,
      popularQueries: new Map(),
      popularTags: new Map(),
      popularCategories: new Map(),
      averageResultCount: 0,
      searchPerformance: {
        averageTime: 0,
        slowQueries: []
      }
    };
  }

  /**
   * 获取索引统计
   */
  getIndexStats() {
    return {
      totalAssets: this.assets.size,
      totalTerms: this.searchIndex.termIndex.size,
      totalTags: this.searchIndex.tagIndex.size,
      totalCategories: this.searchIndex.categoryIndex.size,
      totalAuthors: this.searchIndex.authorIndex.size,
      indexSize: this.calculateIndexSize()
    };
  }

  /**
   * 计算索引大小
   */
  private calculateIndexSize(): number {
    let size = 0;
    
    this.searchIndex.termIndex.forEach((assetIds, term) => {
      size += term.length + assetIds.size * 36; // 估算字符串和Set的大小
    });
    
    this.searchIndex.tagIndex.forEach((assetIds, tag) => {
      size += tag.length + assetIds.size * 36;
    });
    
    return size;
  }

  /**
   * 事件管理
   */
  on<T extends keyof ISearchEngineEvents>(eventName: T, listener: ISearchEngineEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof ISearchEngineEvents>(eventName: T, listener: ISearchEngineEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁搜索引擎
   */
  destroy(): void {
    this.emitter.removeAllListeners();
  }
}