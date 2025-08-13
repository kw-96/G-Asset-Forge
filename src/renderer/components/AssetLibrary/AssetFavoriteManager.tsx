/**
 * 素材收藏管理组件
 * 管理素材的收藏夹和收藏状态
 */
import React, { useState, useCallback } from 'react';
import type { AssetCategory } from '../../managers/assets/AssetLibraryManager';
import {
  Container,
  Header,
  HeaderLeft,
  Title,
  HeaderActions,
  Tabs,
  TabButton,
  PrimaryButton,
  Badge,
  CreateFormWrapper,
  FormColumn,
  Label,
  TextInput,
  TextArea,
  FormActions,
  Button,
  ButtonPrimary,
  Toolbar,
  Select,
  Flex1,
  Content,
  Section,
  Empty,
  Collections,
  CollectionCard,
  CardHeader,
  CardTitle,
  CardDesc,
  CardMeta,
  IconButton,
  PreviewRow,
  Thumb,
  MoreThumb,
  Grid,
  AssetCard,
  ThumbLarge,
  AssetName,
  CategoryText,
  SelectionIndicator,
  FavButton,
  // FooterBar,
  // ModalOverlay,
  // ModalContent,
  // CloseButton,
  ToolbarRow,
  ToolbarLeft,
  OutlineButton,
  HiddenLabel
} from './AssetFavoriteManager.styles';
import {
  type IAssetMetadata,
  type IAssetCategoryInfo
} from '../../managers/assets/AssetLibraryManager';

export interface IFavoriteCollection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean; // 默认收藏夹
}

interface IAssetFavoriteManagerProps {
  assets: IAssetMetadata[];
  categories: IAssetCategoryInfo[];
  collections: IFavoriteCollection[];
  onCreateCollection: (collection: Omit<IFavoriteCollection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateCollection: (id: string, updates: Partial<IFavoriteCollection>) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onAddToCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  onRemoveFromCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  onToggleFavorite: (assetId: string) => Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetFavoriteManager: React.FC<IAssetFavoriteManagerProps> = ({
  assets,
  categories,
  collections,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onAddToCollection,
  onToggleFavorite,
  className,
  style
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'collections' | 'assets'>('collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');

  // 获取默认收藏夹
  // const defaultCollection = collections.find(c => c.isDefault);

  // 获取收藏的素材
  const favoriteAssets = assets.filter(asset => asset.isFavorite);

  // 获取当前选中收藏夹的素材
  const getCollectionAssets = useCallback((collectionId: string): IAssetMetadata[] => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];

    return assets.filter(asset => collection.assetIds.includes(asset.id));
  }, [assets, collections]);

  // 过滤素材
  const getFilteredAssets = useCallback((assetsToFilter: IAssetMetadata[]): IAssetMetadata[] => {
    let filtered = assetsToFilter;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === filterCategory);
    }

    return filtered;
  }, [searchQuery, filterCategory]);

  // 创建收藏夹
  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) return;

    try {
      await onCreateCollection({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() ?? undefined,
        assetIds: []
      });

      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('创建收藏夹失败:', error);
    }
  }, [newCollectionName, newCollectionDescription, onCreateCollection]);

  // 更新收藏夹
  const handleUpdateCollection = useCallback(async (id: string, name: string, description?: string) => {
    try {
      await onUpdateCollection(id, {
        name: name.trim(),
        description: description?.trim() || '',
        updatedAt: new Date()
      });
      setEditingCollection(null);
    } catch (error) {
      console.error('更新收藏夹失败:', error);
    }
  }, [onUpdateCollection]);

  // 删除收藏夹
  const handleDeleteCollection = useCallback(async (id: string) => {
    const collection = collections.find(c => c.id === id);
    if (!collection || collection.isDefault) return;

    if (confirm(`确定要删除收藏夹"${collection.name}"吗？`)) {
      try {
        await onDeleteCollection(id);
        if (selectedCollection === id) {
          setSelectedCollection('');
        }
      } catch (error) {
        console.error('删除收藏夹失败:', error);
      }
    }
  }, [collections, selectedCollection, onDeleteCollection]);

  // 添加到收藏夹
  const handleAddToCollection = useCallback(async (collectionId: string) => {
    if (selectedAssets.size === 0) return;

    try {
      await onAddToCollection(collectionId, Array.from(selectedAssets));
      setSelectedAssets(new Set());
    } catch (error) {
      console.error('添加到收藏夹失败:', error);
    }
  }, [selectedAssets, onAddToCollection]);

  // 从收藏夹移除（内部使用时直接在选择框操作中调用 onRemoveFromCollection）
  // const handleRemoveFromCollection = useCallback(async (_collectionId: string) => {
  //   // 保留定义以便未来扩展；当前未直接使用
  //   return;
  // }, []);

  // 切换素材选择
  const toggleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback((assetsToSelect: IAssetMetadata[]) => {
    const allSelected = assetsToSelect.every(asset => selectedAssets.has(asset.id));

    if (allSelected) {
      // 取消全选
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        assetsToSelect.forEach(asset => newSet.delete(asset.id));
        return newSet;
      });
    } else {
      // 全选
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        assetsToSelect.forEach(asset => newSet.add(asset.id));
        return newSet;
      });
    }
  }, [selectedAssets]);

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取分类名称
  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }, [categories]);

  return (
    <Container className={className} style={style}>
      {/* 头部 */}
      <Header>
        <HeaderLeft>
          <Title>❤️ 收藏管理</Title>
          <Tabs role="tablist" aria-label="视图切换">
            <TabButton
              type="button"
              active={viewMode === 'collections'}
              onClick={() => setViewMode('collections')}
              aria-pressed={viewMode === 'collections'}
              aria-label="切换到收藏夹视图"
            >
              收藏夹
            </TabButton>
            <TabButton
              type="button"
              active={viewMode === 'assets'}
              onClick={() => setViewMode('assets')}
              aria-pressed={viewMode === 'assets'}
              aria-label="切换到收藏素材视图"
            >
              收藏素材
            </TabButton>
          </Tabs>
        </HeaderLeft>

        <HeaderActions>
          {viewMode === 'collections' && (
            <PrimaryButton type="button" onClick={() => setShowCreateForm(true)} aria-label="新建收藏夹">
              + 新建收藏夹
            </PrimaryButton>
          )}
          {selectedAssets.size > 0 && (
            <Badge aria-live="polite">已选择 {selectedAssets.size} 个</Badge>
          )}
        </HeaderActions>
      </Header>

      {/* 创建收藏夹表单 */}
      {showCreateForm && (
        <CreateFormWrapper>
          <FormColumn>
            <Label htmlFor="collection-name">收藏夹名称</Label>
            <TextInput
              id="collection-name"
              type="text"
              placeholder="收藏夹名称"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <Label htmlFor="collection-desc">描述（可选）</Label>
            <TextArea
              id="collection-desc"
              placeholder="描述（可选）"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
            />
            <FormActions>
              <ButtonPrimary
                type="button"
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                aria-disabled={!newCollectionName.trim()}
                aria-label="创建收藏夹"
              >
                创建
              </ButtonPrimary>
              <Button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
                aria-label="取消创建收藏夹"
              >
                取消
              </Button>
            </FormActions>
          </FormColumn>
        </CreateFormWrapper>
      )}

      {/* 搜索和过滤 */}
      {viewMode === 'assets' && (
        <Toolbar>
          <Flex1>
            <Label htmlFor="fav-search" className="sr-only">
              <HiddenLabel>搜索收藏的素材</HiddenLabel>
            </Label>
            <TextInput
              id="fav-search"
              type="text"
              placeholder="搜索收藏的素材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="搜索收藏的素材"
            />
          </Flex1>
          <Label htmlFor="fav-filter" className="sr-only">
            <HiddenLabel>筛选分类</HiddenLabel>
          </Label>
          <Select
            id="fav-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AssetCategory | 'all')}
            aria-label="筛选分类"
          >
            <option value="all">所有分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>
        </Toolbar>
      )}

      {/* 内容区域 */}
      <Content>
        {viewMode === 'collections' ? (
          /* 收藏夹列表 */
          <Section>
            {collections.length === 0 ? (
              <Empty>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>还没有收藏夹</div>
                <div style={{ fontSize: '12px' }}>点击"新建收藏夹"开始整理你的收藏</div>
              </Empty>
            ) : (
              <Collections>
                {collections.map(collection => {
                  const collectionAssets = getCollectionAssets(collection.id);
                  const isEditing = editingCollection === collection.id;

                  return (
                    <CollectionCard key={collection.id} selected={selectedCollection === collection.id}>
                      <CardHeader>
                        <div style={{ flex: 1 }}>
                          {isEditing ? (
                            <FormColumn>
                              <TextInput
                                type="text"
                                defaultValue={collection.name}
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== collection.name) {
                                    handleUpdateCollection(collection.id, e.target.value, collection.description);
                                  } else {
                                    setEditingCollection(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  } else if (e.key === 'Escape') {
                                    setEditingCollection(null);
                                  }
                                }}
                                autoFocus
                                aria-label="编辑收藏夹名称"
                              />
                            </FormColumn>
                          ) : (
                            <div
                              onClick={() => setSelectedCollection(collection.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <CardTitle>
                                {collection.isDefault && '⭐ '}
                                {collection.name}
                              </CardTitle>
                              {collection.description && (
                                <CardDesc>{collection.description}</CardDesc>
                              )}
                              <CardMeta>{collectionAssets.length} 个素材 • 创建于 {formatDate(collection.createdAt)}</CardMeta>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          {!collection.isDefault && (
                            <>
                              <IconButton type="button" onClick={() => setEditingCollection(collection.id)} aria-label="编辑收藏夹">
                                ✏️
                              </IconButton>
                              <IconButton type="button" onClick={() => handleDeleteCollection(collection.id)} color="#dc3545" aria-label="删除收藏夹">
                                🗑️
                              </IconButton>
                            </>
                          )}
                        </div>
                      </CardHeader>

                      {/* 收藏夹预览 */}
                      {collectionAssets.length > 0 && (
                        <PreviewRow>
                          {collectionAssets.slice(0, 5).map(asset => (
                            <Thumb key={asset.id}>
                              {asset.thumbnailUrl && (
                                <img
                                  src={asset.thumbnailUrl}
                                  alt={asset.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}
                            </Thumb>
                          ))}
                          {collectionAssets.length > 5 && (
                            <MoreThumb>+{collectionAssets.length - 5}</MoreThumb>
                          )}
                        </PreviewRow>
                      )}
                    </CollectionCard>
                  );
                })}
              </Collections>
            )}
          </Section>
        ) : (
          /* 收藏素材列表 */
          <Section>
            {favoriteAssets.length === 0 ? (
              <Empty>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💔</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>还没有收藏的素材</div>
                <div style={{ fontSize: '12px' }}>在素材库中点击❤️来收藏你喜欢的素材</div>
              </Empty>
            ) : (
              <>
                {/* 批量操作工具栏 */}
                <ToolbarRow>
                  <ToolbarLeft>
                    <OutlineButton
                      type="button"
                      onClick={() => toggleSelectAll(getFilteredAssets(favoriteAssets))}
                      aria-label={getFilteredAssets(favoriteAssets).every(asset => selectedAssets.has(asset.id)) ? '取消全选' : '全选'}
                    >
                      {getFilteredAssets(favoriteAssets).every(asset => selectedAssets.has(asset.id)) ? '取消全选' : '全选'}
                    </OutlineButton>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      共 {getFilteredAssets(favoriteAssets).length} 个收藏素材
                    </span>
                  </ToolbarLeft>
                  {selectedAssets.size > 0 && collections.length > 0 && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddToCollection(e.target.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        aria-label="添加到收藏夹"
                      >
                        <option value="">添加到收藏夹...</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </ToolbarRow>

                {/* 素材网格 */}
                <Grid>
                  {getFilteredAssets(favoriteAssets).map(asset => (
                    <AssetCard key={asset.id} onClick={() => toggleAssetSelection(asset.id)} selected={selectedAssets.has(asset.id)}>
                      {/* 缩略图 */}
                      <ThumbLarge>
                        {asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ fontSize: '24px', color: '#ccc' }}>🖼️</div>
                        )}
                      </ThumbLarge>

                      {/* 信息 */}
                      <AssetName>{asset.name}</AssetName>
                      <CategoryText>{getCategoryName(asset.category)}</CategoryText>

                      {/* 选择指示器 */}
                      {selectedAssets.has(asset.id) && (
                        <SelectionIndicator aria-hidden>✓</SelectionIndicator>
                      )}

                      {/* 收藏按钮 */}
                      <FavButton
                        type="button"
                        aria-label="切换收藏"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(asset.id);
                        }}
                      >
                        ❤️
                      </FavButton>
                    </AssetCard>
                  ))}
                </Grid>
              </>
            )}
          </Section>
        )}
      </Content>
    </Container>
  );
};

export default AssetFavoriteManager;