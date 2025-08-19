
/**
 * 素材搜索引擎
 */
export interface AdvancedFilter {
  subcategory: any;
  ratingRange: any;
  license: never[];
  fileType: never[];
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  author: string;
  fileSizeRange: any;
  dimensionRatio: any;
  isFavorite: boolean;
  isCustom: boolean;
  hasPreview: boolean;
  hasThumbnail: boolean;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class AssetSearchEngine {
  private assets: any[] = [];
  private searchIndex: Map<string, any[]> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private authorIndex: Map<string, Set<string>> = new Map();

  /**
   * 添加素材到搜索引擎
   */
  addAsset(asset: any) {
    if (!asset || !asset.id) return;
    
    // 添加到素材列表
    this.assets.push(asset);
    
    // 更新索引
    this.updateIndexes(asset);
  }

  /**
   * 重建搜索索引
   */
  rebuildIndex(allAssets: any[]) {
    if (!Array.isArray(allAssets)) {
      console.warn('重建索引失败：素材数据不是数组');
      return;
    }

    // 清空现有索引
    this.assets = [];
    this.searchIndex.clear();
    this.tagIndex.clear();
    this.categoryIndex.clear();
    this.authorIndex.clear();

    // 重新添加所有素材
    allAssets.forEach(asset => {
      if (asset && asset.id) {
        this.assets.push(asset);
        this.updateIndexes(asset);
      }
    });

    console.log(`搜索引擎索引重建完成，共索引 ${this.assets.length} 个素材`);
  }

  /**
   * 更新索引
   */
  private updateIndexes(asset: any) {
    // 更新标签索引
    if (asset.tags && Array.isArray(asset.tags)) {
      asset.tags.forEach((tag: string) => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(asset.id);
      });
    }

    // 更新分类索引
    if (asset.category) {
      if (!this.categoryIndex.has(asset.category)) {
        this.categoryIndex.set(asset.category, new Set());
      }
      this.categoryIndex.get(asset.category)!.add(asset.id);
    }

    // 更新作者索引
    if (asset.author) {
      if (!this.authorIndex.has(asset.author)) {
        this.authorIndex.set(asset.author, new Set());
      }
      this.authorIndex.get(asset.author)!.add(asset.id);
    }
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    this.tagIndex.forEach((assetIds, tag) => {
      tagCounts.set(tag, assetIds.size);
    });

    return Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, limit: number = 10): any[] {
    if (!query || query.trim().length === 0) return [];

    const suggestions: any[] = [];
    const lowerQuery = query.toLowerCase();

    // 标签建议
    this.tagIndex.forEach((assetIds, tag) => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: tag,
          type: 'tag' as const,
          icon: '🏷️',
          description: `${assetIds.size} 个素材使用此标签`
        });
      }
    });

    // 分类建议
    this.categoryIndex.forEach((assetIds, category) => {
      if (category.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: category,
          type: 'category' as const,
          icon: '📁',
          description: `${assetIds.size} 个素材在此分类`
        });
      }
    });

    // 作者建议
    this.authorIndex.forEach((assetIds, author) => {
      if (author.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: author,
          type: 'author' as const,
          icon: '👤',
          description: `${assetIds.size} 个素材来自此作者`
        });
      }
    });

    return suggestions.slice(0, limit);
  }

  /**
   * 搜索素材
   */
  search(options: any): any {
    if (!options || !options.filter) {
      return {
        assets: this.assets,
        totalCount: this.assets.length,
        page: 1,
        pageSize: this.assets.length,
        totalPages: 1,
        hasMore: false
      };
    }

    let filteredAssets = [...this.assets];
    const filter = options.filter;

    // 应用分类过滤
    if (filter.category) {
      const categoryAssets = this.categoryIndex.get(filter.category);
      if (categoryAssets) {
        filteredAssets = filteredAssets.filter(asset => 
          categoryAssets.has(asset.id)
        );
      }
    }

    // 应用标签过滤
    if (filter.tags && filter.tags.length > 0) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.tags && filter.tags.some((tag: string) => 
          asset.tags.includes(tag)
        )
      );
    }

    // 应用收藏过滤
    if (filter.isFavorite) {
      filteredAssets = filteredAssets.filter(asset => asset.isFavorite);
    }

    // 应用自定义过滤
    if (filter.isCustom) {
      filteredAssets = filteredAssets.filter(asset => asset.isCustom);
    }

    // 应用搜索查询
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        (asset.description && asset.description.toLowerCase().includes(query)) ||
        (asset.tags && asset.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    // 排序
    if (options.sortBy) {
      filteredAssets.sort((a, b) => {
        let aValue = a[options.sortBy];
        let bValue = b[options.sortBy];

        if (options.sortBy === 'createdAt' || options.sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (options.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // 分页
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    return {
      assets: paginatedAssets,
      totalCount: filteredAssets.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredAssets.length / pageSize),
      hasMore: endIndex < filteredAssets.length
    };
  }
}

export class AssetSearchOptions {
  filter: AdvancedFilter = {} as AdvancedFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  searchQuery: string = '';
  category?: string;
  subcategory?: string;
  tags?: string[];
}

export class AssetSearchSuggestion {
  text: string = '';
  type: 'keyword' | 'tag' | 'category' | 'author' = 'keyword';
  icon: string = '';
  description: string = '';
}

export interface SearchAnalytics {
  popularQueries: Map<string, number>;
  popularTags: Map<string, number>;
  popularCategories: Map<string, number>;
  popularAuthors: Map<string, number>;
  searchTimes: Map<string, number>;
  searchResults: Map<string, number>;
  searchErrors: Map<string, number>;
}