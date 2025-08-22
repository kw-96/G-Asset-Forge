// 素材库面板组件
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  type IAssetMetadata, 
  type AssetCategory
} from './AssetBatchManager';
import { 
  type AssetSearchResult,
  type AssetSearchOptions,
  AssetCategoryInfo,
} from '../../../logic/managers/assets/AssetLibraryManager';
import { 
  AssetSearchEngine,
  type AdvancedFilter,
} from '../../../logic/managers/assets/AssetSearchEngine';
import { ThumbnailGenerator } from '../../../logic/managers/assets/ThumbnailGenerator';
import { AssetStorageManager } from '../../../logic/managers/assets/AssetStorageManager';
import { AssetSearchBar } from './AssetSearchBar';
import { AssetFilterPanel } from './AssetFilterPanel';
import { AdvancedSearchPanel } from './AdvancedSearchPanel';
import { AssetSearchResults } from './AssetSearchResults';
import { AssetUploadPanel, type UploadAssetData } from './AssetUploadPanel';
import { AssetFavoriteManager } from './AssetFavoriteManager';
import { AssetBatchManager, type IBatchOperation } from './AssetBatchManager';
import { FavoriteCollectionManager, type IFavoriteCollection } from '../../../logic/managers/assets/FavoriteCollectionManager';
import { AssetLibraryManager } from '../../../logic/managers/assets/AssetLibraryManager';

interface IAssetLibraryPanelProps {
  onAssetSelect?: (asset: IAssetMetadata) => void;
  onAssetDoubleClick?: (asset: IAssetMetadata) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetLibraryPanel: React.FC<IAssetLibraryPanelProps> = ({
  onAssetSelect,
  onAssetDoubleClick,
  className,
  style
}) => {
  const libraryManagerRef = useRef<AssetLibraryManager | null>(null);
  const searchEngineRef = useRef<AssetSearchEngine | null>(null);
  const thumbnailGeneratorRef = useRef<ThumbnailGenerator | null>(null);
  const storageManagerRef = useRef<AssetStorageManager | null>(null);
  const favoriteManagerRef = useRef<FavoriteCollectionManager | null>(null);
  
  // 状态管理
  const [searchResult, setSearchResult] = useState<AssetSearchResult>({
    assets: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    hasMore: false
  });
  const [categories, setCategories] = useState<AssetCategoryInfo[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [currentFilter, setCurrentFilter] = useState<AdvancedFilter>({} as AdvancedFilter);
  const [selectedAsset, setSelectedAsset] = useState<IAssetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showFavoriteManager, setShowFavoriteManager] = useState(false);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [favoriteCollections, setFavoriteCollections] = useState<IFavoriteCollection[]>([]);

  // 初始化管理器
  useEffect(() => {
    libraryManagerRef.current = new AssetLibraryManager();
    searchEngineRef.current = new AssetSearchEngine();
    thumbnailGeneratorRef.current = new ThumbnailGenerator();
    storageManagerRef.current = new AssetStorageManager();
    favoriteManagerRef.current = new FavoriteCollectionManager();

    // 绑定事件
    libraryManagerRef.current.on('searchCompleted', (result: AssetSearchResult) => {
      setSearchResult(result);
      setIsLoading(false);
    });

    libraryManagerRef.current.on('assetAdded', (asset: IAssetMetadata) => {
      // 添加到搜索引擎索引
      if (searchEngineRef.current) {
        searchEngineRef.current.addAsset(asset);
      }
      // 重新搜索以更新结果
      performSearch();
      // 更新可用标签和作者
      updateAvailableOptions();
    });

    libraryManagerRef.current.on('favoriteToggled', () => {
      // 重新搜索以更新收藏状态
      performSearch();
    });

    storageManagerRef.current.on('uploadCompleted', async (result: UploadAssetData) => {
      if (result.success && result.metadata && libraryManagerRef.current) {
        libraryManagerRef.current.addAsset({
          name: result.metadata.name || '未命名',
          category: result.metadata.category || 'ui',
          tags: result.metadata.tags || [],
          fileType: result.metadata.fileType || 'image/png',
          fileSize: result.metadata.fileSize || 0,
          dimensions: result.metadata.dimensions || { width: 0, height: 0 },
          originalUrl: result.originalUrl || '',
          ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
          license: 'custom',
          isCustom: true
        });
      }
      setIsUploading(false);
    });

    storageManagerRef.current.on('uploadFailed', async () => {
      setIsUploading(false);
    });

    // 获取分类信息
    setCategories(libraryManagerRef.current.getCategories() as unknown as AssetCategoryInfo[]);

    // 初始化收藏夹
    setFavoriteCollections(favoriteManagerRef.current.getAllCollections() as unknown as IFavoriteCollection[]);

    // 绑定收藏夹事件
    favoriteManagerRef.current.on('collectionCreated', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections() as unknown as IFavoriteCollection[]);
    });

    favoriteManagerRef.current.on('collectionUpdated', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections() as unknown as IFavoriteCollection[]);
    });

    favoriteManagerRef.current.on('collectionDeleted', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections() as unknown as IFavoriteCollection[]);
    });

    // 初始化搜索引擎
    initializeSearchEngine();

    // 执行初始搜索
    performSearch();

    return () => {
      libraryManagerRef.current = null;
      searchEngineRef.current = null;
      thumbnailGeneratorRef.current = null;
      storageManagerRef.current = null;
      favoriteManagerRef.current = null;
    };
  }, []);

  // 初始化搜索引擎
  const initializeSearchEngine = useCallback(async () => {
    if (!libraryManagerRef.current || !searchEngineRef.current) return;

    try {
      // 获取所有素材并建立索引
      const allAssets = libraryManagerRef.current.getAllAssets();
      searchEngineRef.current.rebuildIndex(allAssets);
      
      // 更新可用选项
      updateAvailableOptions();
    } catch (error) {
      console.error('初始化搜索引擎失败:', error);
    }
  }, []);

  // 更新可用选项
  const updateAvailableOptions = useCallback(async () => {
    if (!libraryManagerRef.current || !searchEngineRef.current) return;

    try {
      const allAssets = libraryManagerRef.current.getAllAssets();
      
      // 提取所有标签
      const allTags = new Set<string>();
      const allAuthors = new Set<string>();
      
      allAssets.forEach((asset: any) => {
        asset.tags.forEach((tag: string) => allTags.add(tag));
        if (asset.author) {
          allAuthors.add(asset.author);
        }
      });
      
      setAvailableTags(Array.from(allTags).sort());
      setAvailableAuthors(Array.from(allAuthors).sort());
      
      // 获取热门标签
      const popularTagsData = searchEngineRef.current.getPopularTags(20) as unknown as Array<{ tag: string; count: number }>;
      setPopularTags(popularTagsData);
    } catch (error) {
      console.error('更新可用选项失败:', error);
    }
  }, []);

  // 执行搜索
  const performSearch = useCallback((searchOptions?: AssetSearchOptions) => {
    if (!searchEngineRef.current) return;

    setIsLoading(true);

    const options: AssetSearchOptions = searchOptions || {
      filter: currentFilter,
      sortBy,
      sortOrder,
      page: 1,
      pageSize: 20
    };

    try {
      const result = searchEngineRef.current.search(options as any) as any;
      // 确保搜索结果有有效的结构
      if (result && typeof result === 'object' && result.assets) {
        setSearchResult({
          assets: result.assets || [],
          totalCount: result.totalCount || 0,
          page: result.page || 1,
          pageSize: result.pageSize || 20,
          totalPages: result.totalPages || 0,
          hasMore: result.hasMore || false
        });
      } else {
        // 如果搜索结果无效，设置为默认值
        setSearchResult({
          assets: [],
          totalCount: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          hasMore: false
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('搜索失败:', error);
      // 搜索失败时设置为默认值
      setSearchResult({
        assets: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        hasMore: false
      });
      setIsLoading(false);
    }
  }, [currentFilter, sortBy, sortOrder]);

  // 处理搜索
  const handleSearch = useCallback((searchOptions: Partial<AssetSearchOptions>) => {
    // 合并当前过滤器和新的搜索选项
    const mergedOptions: AssetSearchOptions = {
      ...searchOptions,
      filter: {
        ...currentFilter,
        ...searchOptions.filter
      },
      sortBy,
      sortOrder,
      page: 1,
      pageSize: 20
    };

    performSearch(mergedOptions);
  }, [currentFilter, sortBy, sortOrder, performSearch]);

  /**
   * 获取搜索建议
   * @param query 搜索关键词
   * @returns 搜索建议列表
   */
  const getSuggestions = useCallback(async (query: string): Promise<any[]> => {
    // NOTE: SearchSuggestion 类型未定义，临时使用 any[] 代替，待类型补全后修正
    if (!searchEngineRef.current) return [];
    return searchEngineRef.current.getSuggestions(query, 10);
  }, []);

  // 处理过滤器变化
  const handleFilterChange = useCallback((filter: AdvancedFilter) => {
    setCurrentFilter(filter);
    performSearch({ filter, sortBy, sortOrder, page: 1, pageSize: 20 });
  }, [sortBy, sortOrder, performSearch]);

  // 重置过滤器
  const handleResetFilter = useCallback(() => {
    setCurrentFilter({} as AdvancedFilter);
    performSearch({ filter: {}, sortBy, sortOrder, page: 1, pageSize: 20 });
  }, [sortBy, sortOrder, performSearch]);

  // 搜索参数变化时重新搜索
  useEffect(() => {
    const timer = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timer);
  }, [performSearch]);

  // 处理素材上传
  const handleAssetUpload = useCallback(async (uploadData: UploadAssetData[]) => {
    if (!libraryManagerRef.current || uploadData.length === 0) return;

    setIsUploading(true);

    try {
      for (const data of uploadData) {
        // 创建素材元数据
        libraryManagerRef.current.addAsset({
          name: data.name,
          category: data.category,
          tags: data.tags,
          fileType: data.file.type,
          fileSize: data.file.size,
          dimensions: '', // 实际应该从图片获取
          originalUrl: URL.createObjectURL(data.file), // 临时URL
          license: data.license,
          isCustom: true
        });
      }
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // 将文件列表转换为上传数据并提交
  const handleFileUpload = useCallback((files: FileList) => {
    const uploadList: any[] = Array.from(files).map((file: File) => ({
      name: file.name,
      description: '',
      category: 'ui' as AssetCategory,
      tags: [],
      file,
      license: 'custom',
      author: 'User'
    }));
    void handleAssetUpload(uploadList);
  }, [handleAssetUpload]);

  // 处理批量操作
  const handleBatchOperation = useCallback(async (operation: IBatchOperation) => {
    if (!libraryManagerRef.current) return;

    try {
      switch (operation.type) {
        case 'delete':
          libraryManagerRef.current.batchDeleteAssets(operation.assetIds);
          break;
        
        case 'updateCategory':
          libraryManagerRef.current.batchUpdateAssets(operation.assetIds, {
            category: operation.data.category
          });
          break;
        
        case 'updateTags':
          // 获取现有标签并添加新标签
          for (const assetId of operation.assetIds) {
            const asset = libraryManagerRef.current.getAsset(assetId);
            if (asset) {
              const newTags = [...new Set([...asset.tags, ...operation.data.tags])] as unknown as string[];
              libraryManagerRef.current.updateAsset(assetId, { tags: newTags });
            }
          }
          break;
        
        case 'updateLicense':
          // FIXME: IAssetMetadata 类型未包含 license 字段，需扩展类型或调整实现
          // 这里假设 batchUpdateAssets 支持 Partial<IAssetMetadata>，但 license 字段未定义
          // 推荐：如需支持 license 字段，需在 IAssetMetadata 类型中添加 license 字段
          // 临时方案：跳过此操作或抛出错误提示
          console.error('批量更新失败: license 字段不在 IAssetMetadata 类型中，请检查类型定义。');
          break;
        
        case 'toggleFavorite':
          for (const assetId of operation.assetIds) {
            await handleToggleFavorite({ assets: [{ id: assetId } as unknown as IAssetMetadata] } as unknown as AssetSearchResult, undefined as unknown as React.MouseEvent);
          }
          break;
        
        case 'export':
          // 导出功能暂时不实现
          console.log('批量导出:', operation.assetIds);
          break;
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      throw error;
    }
  }, []);

  // 处理收藏夹操作
  const handleCreateCollection = useCallback(async (collection: Omit<IFavoriteCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!favoriteManagerRef.current) return;
    // 直接传递collection名称，createCollection 只接受 string 类型参数
    favoriteManagerRef.current.createCollection(collection.name);
  }, []);

  const handleUpdateCollection = useCallback(async (id: string, updates: Partial<IFavoriteCollection>) => {
    if (!favoriteManagerRef.current) return;
    favoriteManagerRef.current.updateCollection(id, updates);
  }, []);

  const handleDeleteCollection = useCallback(async (id: string) => {
    if (!favoriteManagerRef.current) return;
    favoriteManagerRef.current.deleteCollection(id);
  }, []);

  const handleAddToCollection = useCallback(async (collectionId: string, assetIds: string[]) => {
    if (!favoriteManagerRef.current) return;
    favoriteManagerRef.current.addAssetsToCollection(collectionId, assetIds);
  }, []);

  const handleRemoveFromCollection = useCallback(async (collectionId: string, assetIds: string[]) => {
    if (!favoriteManagerRef.current) return;
    favoriteManagerRef.current.removeAssetsFromCollection(collectionId, assetIds);
  }, []);

  // 处理拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // 切换收藏状态
  const handleToggleFavorite = useCallback(async (asset: AssetSearchResult, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (libraryManagerRef.current) {
      libraryManagerRef.current.toggleFavorite(asset.assets[0].id);
    }
  }, []);

  // 选择素材
  const handleAssetClick = useCallback((asset: AssetSearchResult) => {
    setSelectedAsset(asset.assets[0]);
    onAssetSelect?.(asset.assets[0]);
  }, [onAssetSelect]);

  // 双击素材
  const handleAssetDoubleClick = useCallback((asset: AssetSearchResult) => {
    onAssetDoubleClick?.(asset.assets[0]);
  }, [onAssetDoubleClick]);

  // （移除未使用的 formatFileSize 以通过 noUnusedLocals 编译规则）

  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: style?.backgroundColor || '#f8f9fa',
        borderRadius: style?.borderRadius !== undefined ? style.borderRadius : '8px',
        overflow: 'hidden',
        ...style 
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 头部工具栏 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              发现和管理你的创作素材
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '8px 16px',
                border: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#495057',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              {viewMode === 'grid' ? '列表视图' : '网格视图'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              disabled={isUploading}
              style={{
                padding: '8px 16px',
                border: '1px solid #0066cc',
                backgroundColor: '#0066cc',
                color: 'white',
                borderRadius: '6px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isUploading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = '#0052a3';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = '#0066cc';
                }
              }}
            >
              {isUploading ? '上传中...' : '上传素材'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowFavoriteManager(true)}
              style={{
                padding: '8px 16px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#dc3545';
              }}
            >
              收藏管理
            </button>
            
            <button
              type="button"
              onClick={() => setShowBatchManager(!showBatchManager)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${showBatchManager ? '#28a745' : '#6c757d'}`,
                backgroundColor: showBatchManager ? '#28a745' : 'white',
                color: showBatchManager ? 'white' : '#6c757d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (!showBatchManager) {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!showBatchManager) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#6c757d';
                }
              }}
            >
              批量管理
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <AssetSearchBar
          onSearch={handleSearch}
          getSuggestions={getSuggestions}
          placeholder="搜索素材名称、标签或分类..."
          style={{ 
            marginBottom: '12px',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '2px'
          }}
        />

        {/* 过滤和排序工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${showFilterPanel ? '#007bff' : '#e9ecef'}`,
                backgroundColor: showFilterPanel ? '#007bff' : '#f8f9fa',
                color: showFilterPanel ? 'white' : '#495057',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              筛选
            </button>
            
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${showAdvancedSearch ? '#28a745' : '#e9ecef'}`,
                backgroundColor: showAdvancedSearch ? '#28a745' : '#f8f9fa',
                color: showAdvancedSearch ? 'white' : '#495057',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              高级搜索
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#6c757d', fontWeight: '500' }}>排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ 
                padding: '6px 10px', 
                border: '1px solid #e9ecef', 
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                fontSize: '12px',
                fontWeight: '500',
                color: '#495057'
              }}
            >
              <option value="createdAt">创建时间</option>
              <option value="name">名称</option>
              <option value="downloadCount">下载次数</option>
              <option value="rating">评分</option>
            </select>
            
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '6px 10px',
                border: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#495057',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
            >
              {sortOrder === 'asc' ? '↗️' : '↙️'}
            </button>
          </div>
        </div>
      </div>

      {/* 过滤器面板 */}
      {showFilterPanel && (
        <AssetFilterPanel
          categories={categories}
          availableTags={availableTags}
          availableAuthors={availableAuthors}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilter}
          style={{
            margin: '0 16px',
            marginBottom: '16px'
          }}
        />
      )}

      {/* 高级搜索面板 */}
      {showAdvancedSearch && (
        <div style={{ margin: '0 16px', marginBottom: '16px' }}>
          <AdvancedSearchPanel
            categories={categories}
            availableTags={availableTags}
            availableAuthors={availableAuthors}
            popularTags={popularTags}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilter}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </div>
      )}

      {/* 批量管理 */}
      {showBatchManager && (
        <div style={{ margin: '0 16px', marginBottom: '16px' }}>
          <AssetBatchManager
            assets={searchResult.assets}
            categories={categories}
            selectedAssets={selectedAssets}
            onBatchOperation={handleBatchOperation}
            onSelectionChange={setSelectedAssets}
          />
        </div>
      )}

      {/* 素材列表 */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '16px',
        minHeight: 0 // 关键：允许flex子项收缩
      }}>
        <AssetSearchResults
          assets={searchResult.assets}
          categories={categories}
          viewMode={viewMode}
          selectedAsset={selectedAsset as unknown as AssetSearchResult}
          isLoading={isLoading}
          onAssetClick={handleAssetClick}
          onAssetDoubleClick={handleAssetDoubleClick}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* 底部状态栏 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e9ecef',
        fontSize: '12px',
        color: '#6c757d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0, // 防止状态栏被压缩
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
      }}>
        <div>
          共 {searchResult.totalCount} 个素材
          {currentFilter.category && ` • ${categories.find(c => c.id === currentFilter.category)?.name}`}
          {currentFilter.isFavorite && ' • 仅收藏'}
          {currentFilter.isCustom && ' • 自定义'}
          {currentFilter.tags && currentFilter.tags.length > 0 && ` • ${currentFilter.tags.length}个标签`}
        </div>
        
        {searchResult.totalPages > 1 && (
          <div>
            第 {searchResult.page} / {searchResult.totalPages} 页
          </div>
        )}
      </div>

      {/* 上传面板弹窗 */}
      {showUploadPanel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ width: '90%', maxWidth: '800px', maxHeight: '90%' }}>
            <AssetUploadPanel
              categories={categories}
              onUpload={handleAssetUpload}
              onClose={() => setShowUploadPanel(false)}
            />
          </div>
        </div>
      )}

      {/* 收藏管理弹窗 */}
      {showFavoriteManager && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ width: '90%', maxWidth: '1000px', maxHeight: '90%', position: 'relative' }}>
            <AssetFavoriteManager
              assets={searchResult.assets}
              categories={categories}
              collections={favoriteCollections}
              onCreateCollection={handleCreateCollection}
              onUpdateCollection={handleUpdateCollection}
              onDeleteCollection={handleDeleteCollection}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
              onToggleFavorite={async (assetId) => {
                const asset = searchResult.assets.find(a => a.id === assetId);
                if (asset) {
                  await handleToggleFavorite(asset);
                }
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowFavoriteManager(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '30px',
                height: '30px',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLibraryPanel;