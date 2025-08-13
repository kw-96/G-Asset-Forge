// 素材库面板组件
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AssetLibraryManager, 
  type IAssetMetadata, 
  type IAssetSearchOptions, 
  type IAssetSearchResult,
  type AssetCategory,
  type IAssetCategoryInfo
} from '../../managers/assets/AssetLibraryManager';
import { 
  AssetSearchEngine,
  type IAdvancedFilter,
  type ISearchSuggestion
} from '../../managers/assets/AssetSearchEngine';
import { ThumbnailGenerator } from '../../managers/assets/ThumbnailGenerator';
import { AssetStorageManager } from '../../managers/assets/AssetStorageManager';
import { AssetSearchBar } from './AssetSearchBar';
import { AssetFilterPanel } from './AssetFilterPanel';
import { AdvancedSearchPanel } from './AdvancedSearchPanel';
import { AssetSearchResults } from './AssetSearchResults';
import { AssetUploadPanel, type IUploadAssetData } from './AssetUploadPanel';
import { AssetFavoriteManager } from './AssetFavoriteManager';
import { AssetBatchManager, type IBatchOperation } from './AssetBatchManager';
import { FavoriteCollectionManager, type IFavoriteCollection } from '../../managers/assets/FavoriteCollectionManager';

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
  const [searchResult, setSearchResult] = useState<IAssetSearchResult>({
    assets: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    hasMore: false
  });
  const [categories, setCategories] = useState<IAssetCategoryInfo[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [currentFilter, setCurrentFilter] = useState<IAdvancedFilter>({});
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
    libraryManagerRef.current.on('searchCompleted', (result) => {
      setSearchResult(result);
      setIsLoading(false);
    });

    libraryManagerRef.current.on('assetAdded', (asset) => {
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

    storageManagerRef.current.on('uploadCompleted', async (result) => {
      if (result.success && result.metadata && libraryManagerRef.current) {
        await libraryManagerRef.current.addAsset({
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

    storageManagerRef.current.on('uploadFailed', () => {
      setIsUploading(false);
    });

    // 获取分类信息
    setCategories(libraryManagerRef.current.getCategories());

    // 初始化收藏夹
    setFavoriteCollections(favoriteManagerRef.current.getAllCollections());

    // 绑定收藏夹事件
    favoriteManagerRef.current.on('collectionCreated', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections());
    });

    favoriteManagerRef.current.on('collectionUpdated', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections());
    });

    favoriteManagerRef.current.on('collectionDeleted', () => {
      setFavoriteCollections(favoriteManagerRef.current!.getAllCollections());
    });

    // 初始化搜索引擎
    initializeSearchEngine();

    // 执行初始搜索
    performSearch();

    return () => {
      libraryManagerRef.current?.destroy();
      searchEngineRef.current?.destroy();
      thumbnailGeneratorRef.current?.destroy();
      storageManagerRef.current?.destroy();
      favoriteManagerRef.current?.destroy();
    };
  }, []);

  // 初始化搜索引擎
  const initializeSearchEngine = useCallback(async () => {
    if (!libraryManagerRef.current || !searchEngineRef.current) return;

    try {
      // 获取所有素材并建立索引
      const allAssets = await libraryManagerRef.current.getAllAssets();
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
      const allAssets = await libraryManagerRef.current.getAllAssets();
      
      // 提取所有标签
      const allTags = new Set<string>();
      const allAuthors = new Set<string>();
      
      allAssets.forEach(asset => {
        asset.tags.forEach(tag => allTags.add(tag));
        if (asset.author) {
          allAuthors.add(asset.author);
        }
      });
      
      setAvailableTags(Array.from(allTags).sort());
      setAvailableAuthors(Array.from(allAuthors).sort());
      
      // 获取热门标签
      const popularTagsData = searchEngineRef.current.getPopularTags(20);
      setPopularTags(popularTagsData);
    } catch (error) {
      console.error('更新可用选项失败:', error);
    }
  }, []);

  // 执行搜索
  const performSearch = useCallback((searchOptions?: IAssetSearchOptions) => {
    if (!searchEngineRef.current) return;

    setIsLoading(true);

    const options: IAssetSearchOptions = searchOptions || {
      filter: currentFilter,
      sortBy,
      sortOrder,
      page: 1,
      pageSize: 20
    };

    try {
      const result = searchEngineRef.current.search(options);
      setSearchResult(result);
      setIsLoading(false);
    } catch (error) {
      console.error('搜索失败:', error);
      setIsLoading(false);
    }
  }, [currentFilter, sortBy, sortOrder]);

  // 处理搜索
  const handleSearch = useCallback((searchOptions: IAssetSearchOptions) => {
    // 合并当前过滤器和新的搜索选项
    const mergedOptions: IAssetSearchOptions = {
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

  // 获取搜索建议
  const getSuggestions = useCallback(async (query: string): Promise<ISearchSuggestion[]> => {
    if (!searchEngineRef.current) return [];
    return searchEngineRef.current.getSuggestions(query, 10);
  }, []);

  // 处理过滤器变化
  const handleFilterChange = useCallback((filter: IAdvancedFilter) => {
    setCurrentFilter(filter);
    performSearch({ filter, sortBy, sortOrder, page: 1, pageSize: 20 });
  }, [sortBy, sortOrder, performSearch]);

  // 重置过滤器
  const handleResetFilter = useCallback(() => {
    setCurrentFilter({});
    performSearch({ filter: {}, sortBy, sortOrder, page: 1, pageSize: 20 });
  }, [sortBy, sortOrder, performSearch]);

  // 搜索参数变化时重新搜索
  useEffect(() => {
    const timer = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timer);
  }, [performSearch]);

  // 处理素材上传
  const handleAssetUpload = useCallback(async (uploadData: IUploadAssetData[]) => {
    if (!libraryManagerRef.current || uploadData.length === 0) return;

    setIsUploading(true);

    try {
      for (const data of uploadData) {
        // 创建素材元数据
        await libraryManagerRef.current.addAsset({
          name: data.name,
          description: data.description ?? '',
          category: data.category,
          ...(data.subcategory ? { subcategory: data.subcategory } : {}),
          tags: data.tags,
          fileType: data.file.type,
          fileSize: data.file.size,
          dimensions: { width: 0, height: 0 }, // 实际应该从图片获取
          originalUrl: URL.createObjectURL(data.file), // 临时URL
          license: data.license,
          ...(data.author ? { author: data.author } : {}),
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
    const uploadList: IUploadAssetData[] = Array.from(files).map((file) => ({
      name: file.name,
      description: '',
      category: 'ui' as AssetCategory,
      tags: [],
      file,
      license: 'custom',
      author: 'User',
    }));
    void handleAssetUpload(uploadList);
  }, [handleAssetUpload]);

  // 处理批量操作
  const handleBatchOperation = useCallback(async (operation: IBatchOperation) => {
    if (!libraryManagerRef.current) return;

    try {
      switch (operation.type) {
        case 'delete':
          await libraryManagerRef.current.batchDeleteAssets(operation.assetIds);
          break;
        
        case 'updateCategory':
          await libraryManagerRef.current.batchUpdateAssets(operation.assetIds, {
            category: operation.data.category
          });
          break;
        
        case 'updateTags':
          // 获取现有标签并添加新标签
          for (const assetId of operation.assetIds) {
            const asset = await libraryManagerRef.current.getAsset(assetId);
            if (asset) {
              const newTags = [...new Set([...asset.tags, ...operation.data.tags])];
              await libraryManagerRef.current.updateAsset(assetId, { tags: newTags });
            }
          }
          break;
        
        case 'updateLicense':
          await libraryManagerRef.current.batchUpdateAssets(operation.assetIds, {
            license: operation.data.license
          });
          break;
        
        case 'toggleFavorite':
          for (const assetId of operation.assetIds) {
            await handleToggleFavorite({ id: assetId } as IAssetMetadata);
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
    await favoriteManagerRef.current.createCollection(collection);
  }, []);

  const handleUpdateCollection = useCallback(async (id: string, updates: Partial<IFavoriteCollection>) => {
    if (!favoriteManagerRef.current) return;
    await favoriteManagerRef.current.updateCollection(id, updates);
  }, []);

  const handleDeleteCollection = useCallback(async (id: string) => {
    if (!favoriteManagerRef.current) return;
    await favoriteManagerRef.current.deleteCollection(id);
  }, []);

  const handleAddToCollection = useCallback(async (collectionId: string, assetIds: string[]) => {
    if (!favoriteManagerRef.current) return;
    await favoriteManagerRef.current.addAssetsToCollection(collectionId, assetIds);
  }, []);

  const handleRemoveFromCollection = useCallback(async (collectionId: string, assetIds: string[]) => {
    if (!favoriteManagerRef.current) return;
    await favoriteManagerRef.current.removeAssetsFromCollection(collectionId, assetIds);
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
  const handleToggleFavorite = useCallback(async (asset: IAssetMetadata, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (libraryManagerRef.current) {
      await libraryManagerRef.current.toggleFavorite(asset.id);
    }
  }, []);

  // 选择素材
  const handleAssetClick = useCallback((asset: IAssetMetadata) => {
    setSelectedAsset(asset);
    onAssetSelect?.(asset);
  }, [onAssetSelect]);

  // 双击素材
  const handleAssetDoubleClick = useCallback((asset: IAssetMetadata) => {
    onAssetDoubleClick?.(asset);
  }, [onAssetDoubleClick]);

  // （移除未使用的 formatFileSize 以通过 noUnusedLocals 编译规则）

  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: '#f8f9fa',
        ...style 
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 头部工具栏 */}
      <div style={{
        padding: '16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            素材库
          </h3>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {viewMode === 'grid' ? '📋 列表' : '⊞ 网格'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              disabled={isUploading}
              style={{
                padding: '6px 12px',
                border: '1px solid #007bff',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isUploading ? '⏳ 上传中...' : '📤 上传'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowFavoriteManager(true)}
              style={{
                padding: '6px 12px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ❤️ 收藏
            </button>
            
            <button
              type="button"
              onClick={() => setShowBatchManager(!showBatchManager)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${showBatchManager ? '#28a745' : '#ddd'}`,
                backgroundColor: showBatchManager ? '#28a745' : 'white',
                color: showBatchManager ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚙️ 批量管理
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <AssetSearchBar
          onSearch={handleSearch}
          getSuggestions={getSuggestions}
          placeholder="搜索素材..."
          style={{ marginBottom: '8px' }}
        />

        {/* 过滤和排序工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${showFilterPanel ? '#007bff' : '#ddd'}`,
                backgroundColor: showFilterPanel ? '#007bff' : 'white',
                color: showFilterPanel ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍 过滤器
            </button>
            
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${showAdvancedSearch ? '#28a745' : '#ddd'}`,
                backgroundColor: showAdvancedSearch ? '#28a745' : 'white',
                color: showAdvancedSearch ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚙️ 高级搜索
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
            <span>排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
                padding: '4px 8px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
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
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <AssetSearchResults
          assets={searchResult.assets}
          categories={categories}
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          isLoading={isLoading}
          onAssetClick={handleAssetClick}
          onAssetDoubleClick={handleAssetDoubleClick}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* 底部状态栏 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
        fontSize: '12px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
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
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLibraryPanel;