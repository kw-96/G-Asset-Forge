// 素材搜索结果组件
import React, { useCallback } from 'react';
import { type AssetSearchResult, type AssetCategoryInfo } from '../../../logic/managers/assets/AssetLibraryManager';

interface IAssetSearchResultsProps {
  assets: AssetSearchResult[];
  categories: AssetCategoryInfo[];
  viewMode: 'grid' | 'list';
  selectedAsset?: AssetSearchResult | null;
  isLoading?: boolean;
  onAssetClick?: (asset: AssetSearchResult) => void;
  onAssetDoubleClick?: (asset: AssetSearchResult) => void;
  onToggleFavorite?: (asset: AssetSearchResult, e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetSearchResults: React.FC<IAssetSearchResultsProps> = ({
  assets,
  categories,
  viewMode,
  selectedAsset,
  isLoading = false,
  onAssetClick,
  onAssetDoubleClick,
  onToggleFavorite,
  className,
  style
}) => {
  // 格式化文件大小
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // 获取分类名称
  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }, [categories]);

  // 处理素材点击
  const handleAssetClick = useCallback((asset: AssetSearchResult) => {
    onAssetClick?.(asset);
  }, [onAssetClick]);

  // 处理素材双击
  const handleAssetDoubleClick = useCallback((asset: AssetSearchResult) => {
    onAssetDoubleClick?.(asset);
  }, [onAssetDoubleClick]);

  // 处理收藏切换
  const handleToggleFavorite = useCallback((asset: AssetSearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(asset, e);
  }, [onToggleFavorite]);

  // 安全检查：确保 assets 是数组
  if (!assets || !Array.isArray(assets)) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '14px',
          color: '#666',
          ...style 
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <div>素材数据加载中...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '14px',
          color: '#666',
          ...style 
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div>正在搜索素材...</div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '14px',
          color: '#666',
          ...style 
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>没有找到匹配的素材</div>
        <div style={{ fontSize: '12px', textAlign: 'center', maxWidth: '300px' }}>
          尝试调整搜索关键词或过滤条件，或者上传新的素材
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className} 
      style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        flexDirection: viewMode === 'list' ? 'column' : undefined,
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : undefined,
        gap: '12px',
        ...style
      }}
    >
      {assets.map(asset => (
        <div
          key={asset.assets[0].id}
          onClick={() => handleAssetClick(asset)}
          onDoubleClick={() => handleAssetDoubleClick(asset)}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            border: selectedAsset?.assets[0].id === asset.assets[0].id ? '2px solid #007bff' : '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: viewMode === 'grid' ? '12px' : '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: viewMode === 'grid' ? 'column' : 'row',
            alignItems: viewMode === 'list' ? 'center' : 'stretch',
            gap: viewMode === 'list' ? '16px' : '8px'
          }}
          onMouseEnter={(e) => {
            if (selectedAsset?.assets[0].id !== asset.assets[0].id) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedAsset?.assets[0].id !== asset.assets[0].id) {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {/* 缩略图 */}
          <div style={{
            width: viewMode === 'grid' ? '100%' : '80px',
            height: viewMode === 'grid' ? '120px' : '80px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative'
          }}>
            {asset.assets[0].thumbnailUrl || asset.assets[0].originalUrl ? (
              <img
                src={asset.assets[0].thumbnailUrl || asset.assets[0].originalUrl}
                alt={asset.assets[0].name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div style={{
              display: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              fontSize: '32px',
              color: '#ccc'
            }}>
              🖼️
            </div>
            
            {/* 文件类型标识 */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '8px',
              padding: '2px 4px',
              borderRadius: '2px',
              textTransform: 'uppercase'
            }}>
              {asset.assets[0].fileType.split('/')[1]}
            </div>
          </div>

          {/* 信息区域 */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: viewMode === 'grid' ? '80px' : 'auto',
            gap: '4px'
          }}>
            {/* 标题和基本信息 */}
            <div>
              <div style={{
                fontSize: viewMode === 'grid' ? '13px' : '14px',
                fontWeight: 'bold',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#333'
              }}>
                {asset.assets[0].name}
              </div>
              
              {asset.assets[0].description && viewMode === 'list' && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {asset.assets[0].description}
                </div>
              )}
              
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                {getCategoryName(asset.assets[0].category)}
                {asset.assets[0].subcategory && ` • ${asset.assets[0].subcategory}`}
              </div>
            </div>

            {/* 详细信息 */}
            <div style={{ fontSize: '10px', color: '#666' }}>
              <div style={{ marginBottom: '2px' }}>
                {asset.assets[0].dimensions.width} × {asset.assets[0].dimensions.height}
                {viewMode === 'list' && ` • ${formatFileSize(asset.assets[0].fileSize)}`}
              </div>
              
              {viewMode === 'list' && (
                <div style={{ marginBottom: '2px' }}>
                  评分: {'⭐'.repeat(Math.floor(asset.assets[0].rating))} {asset.assets[0].rating.toFixed(1)} • 
                  下载: {asset.assets[0].downloadCount}
                  {asset.assets[0].author && ` • ${asset.assets[0].author}`}
                </div>
              )}
              
              {viewMode === 'grid' && (
                <div>
                  {formatFileSize(asset.assets[0].fileSize)}
                </div>
              )}
            </div>

            {/* 标签 */}
            {asset.assets[0].tags.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '2px',
                marginTop: '4px'
              }}>
                {asset.assets[0].tags.slice(0, viewMode === 'grid' ? 3 : 5).map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      padding: '1px 4px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '6px',
                      fontSize: '8px',
                      color: '#495057'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {asset.assets[0].tags.length > (viewMode === 'grid' ? 3 : 5) && (
                  <span style={{
                    padding: '1px 4px',
                    backgroundColor: '#dee2e6',
                    borderRadius: '6px',
                    fontSize: '8px',
                    color: '#6c757d'
                  }}>
                    +{asset.assets[0].tags.length - (viewMode === 'grid' ? 3 : 5)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 收藏按钮 */}
          <button
            type="button"
            onClick={(e) => handleToggleFavorite(asset, e)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {asset.assets[0].isFavorite ? '❤️' : '🤍'}
          </button>

          {/* 许可证标识 */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            display: 'flex',
            gap: '4px'
          }}>
            {asset.assets[0].license === 'premium' && (
              <span style={{
                backgroundColor: '#ffc107',
                color: 'white',
                fontSize: '8px',
                padding: '2px 4px',
                borderRadius: '2px',
                fontWeight: 'bold'
              }}>
                💎
              </span>
            )}
            
            {asset.assets[0].isCustom && (
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                fontSize: '8px',
                padding: '2px 4px',
                borderRadius: '2px',
                fontWeight: 'bold'
              }}>
                自定义
              </span>
            )}
          </div>

          {/* 评分显示（仅网格模式） */}
          {viewMode === 'grid' && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              fontSize: '10px',
              color: '#666',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 4px',
              borderRadius: '2px'
            }}>
              ⭐ {asset.assets[0].rating.toFixed(1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssetSearchResults;