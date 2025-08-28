/**
 * 素材卡片组件 - 基于现有的BaseCard组件实现
 */
import React, { useCallback, useState } from 'react';

import { BaseCard } from '../Cards/BaseCard';
import { type IAssetMetadata, type ViewMode } from './types';

interface IAssetCardProps {
  asset: IAssetMetadata;
  viewMode: ViewMode;
  isSelected?: boolean;
  isMultiSelected?: boolean;
  onSelect?: (asset: IAssetMetadata) => void;
  onDoubleClick?: (asset: IAssetMetadata) => void;
  onToggleFavorite?: (asset: IAssetMetadata, e: React.MouseEvent) => void;
  onDragStart?: (asset: IAssetMetadata, event: React.DragEvent) => void;
  onContextMenu?: (asset: IAssetMetadata, event: React.MouseEvent) => void;
}

export const AssetCard: React.FC<IAssetCardProps> = ({
  asset,
  viewMode,
  isSelected = false,
  isMultiSelected = false,
  onSelect,
  onDoubleClick,
  onToggleFavorite,
  onDragStart,
  onContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onSelect?.(asset);
  }, [asset, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(asset);
  }, [asset, onDoubleClick]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(asset, e);
    },
    [asset, onToggleFavorite],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart?.(asset, e);
    },
    [asset, onDragStart],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(asset, e);
    },
    [asset, onContextMenu],
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      ui: '#007bff',
      icon: '#28a745',
      background: '#6f42c1',
      decoration: '#fd7e14',
      character: '#dc3545',
      effect: '#20c997',
      texture: '#6c757d',
    };
    return colors[category] || '#6c757d';
  }, []);

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          backgroundColor:
            isSelected || isMultiSelected
              ? '#e3f2fd'
              : isHovered
              ? '#f8f9fa'
              : '#ffffff',
          border: `1px solid ${
            isSelected || isMultiSelected ? '#2196f3' : '#e9ecef'
          }`,
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '8px',
        }}
      >
        {/* 缩略图 */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            overflow: 'hidden',
            border: '1px solid #e9ecef',
          }}
        >
          {asset.thumbnail && !imageError ? (
            <img
              src={asset.thumbnail}
              alt={asset.name}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#6c757d">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          )}
        </div>

        {/* 信息区域 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '500',
                color: '#212529',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {asset.name}
            </h4>
            <button
              type="button"
              onClick={handleFavoriteClick}
              style={{
                marginLeft: '8px',
                padding: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                color: asset.isFavorite ? '#dc3545' : '#6c757d',
                fontSize: '16px',
              }}
            >
              {asset.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#6c757d',
            }}
          >
            <span
              style={{
                padding: '2px 6px',
                backgroundColor: getCategoryColor(asset.category),
                color: 'white',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
              }}
            >
              {asset.category}
            </span>
            <span>{formatFileSize(asset.fileSize)}</span>
            <span>
              {asset.dimensions.width} × {asset.dimensions.height}
            </span>
            {asset.tags.length > 0 && (
              <span>
                标签: {asset.tags.slice(0, 2).join(', ')}
                {asset.tags.length > 2 ? '...' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <BaseCard>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        style={{
          position: 'relative',
          backgroundColor:
            isSelected || isMultiSelected ? '#e3f2fd' : '#ffffff',
          border: `2px solid ${
            isSelected || isMultiSelected
              ? '#2196f3'
              : isHovered
              ? '#dee2e6'
              : '#e9ecef'
          }`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 收藏按钮 */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 2,
            padding: '4px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            cursor: 'pointer',
            color: asset.isFavorite ? '#dc3545' : '#6c757d',
            fontSize: '14px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered || asset.isFavorite ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {asset.isFavorite ? '❤️' : '🤍'}
        </button>

        {/* 缩略图区域 */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {asset.thumbnail && !imageError ? (
            <img
              src={asset.thumbnail}
              alt={asset.name}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#6c757d">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          )}
        </div>

        {/* 信息区域 */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e9ecef',
          }}
        >
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '13px',
              fontWeight: '500',
              color: '#212529',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {asset.name}
          </h4>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                padding: '2px 6px',
                backgroundColor: getCategoryColor(asset.category),
                color: 'white',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
              }}
            >
              {asset.category}
            </span>
            <span style={{ fontSize: '11px', color: '#6c757d' }}>
              {formatFileSize(asset.fileSize)}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#6c757d' }}>
            {asset.dimensions.width} × {asset.dimensions.height}
          </div>

          {asset.tags.length > 0 && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '10px',
                color: '#6c757d',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {asset.tags.slice(0, 3).join(', ')}
              {asset.tags.length > 3 ? '...' : ''}
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};
