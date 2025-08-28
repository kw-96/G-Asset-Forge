/**
 * 素材网格/列表视图组件
 */
import React, { useCallback } from 'react';

import { AssetCard } from './AssetCard';
import { type IAssetMetadata, type ViewMode } from './types';

interface IAssetGridProps {
  assets: IAssetMetadata[];
  viewMode: ViewMode;
  selectedAsset?: IAssetMetadata;
  selectedAssets?: IAssetMetadata[];
  isLoading?: boolean;
  onAssetSelect?: (asset: IAssetMetadata) => void;
  onAssetDoubleClick?: (asset: IAssetMetadata) => void;
  onToggleFavorite?: (asset: IAssetMetadata, e: React.MouseEvent) => void;
  onAssetDragStart?: (asset: IAssetMetadata, event: React.DragEvent) => void;
  onSelectionChange?: (selectedAssets: IAssetMetadata[]) => void;
  onContextMenu?: (asset: IAssetMetadata, event: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetGrid: React.FC<IAssetGridProps> = ({
  assets,
  viewMode,
  selectedAsset,
  selectedAssets = [],
  isLoading = false,
  onAssetSelect,
  onAssetDoubleClick,
  onToggleFavorite,
  onAssetDragStart,
  onSelectionChange,
  onContextMenu,
  className,
  style,
}) => {
  const handleAssetDragStart = useCallback(
    (asset: IAssetMetadata, event: React.DragEvent) => {
      onAssetDragStart?.(asset, event);
    },
    [onAssetDragStart],
  );

  const handleAssetClick = useCallback(
    (asset: IAssetMetadata, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // 多选模式
        const isSelected = selectedAssets.some((a) => a.id === asset.id);
        let newSelection: IAssetMetadata[];

        if (isSelected) {
          newSelection = selectedAssets.filter((a) => a.id !== asset.id);
        } else {
          newSelection = [...selectedAssets, asset];
        }

        onSelectionChange?.(newSelection);
      } else {
        // 单选模式
        onAssetSelect?.(asset);
        onSelectionChange?.([asset]);
      }
    },
    [selectedAssets, onAssetSelect, onSelectionChange],
  );

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#6c757d',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e9ecef',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            正在加载素材...
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#6c757d',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginBottom: '16px', opacity: 0.5 }}
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
          <div
            style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}
          >
            没有找到素材
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            尝试调整搜索条件或上传新的素材
          </div>
        </div>
      </div>
    );
  }

  const gridStyle =
    viewMode === 'grid'
      ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          padding: '16px',
        }
      : {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0',
          padding: '16px',
        };

  return (
    <div
      className={className}
      style={{
        ...gridStyle,
        ...style,
      }}
    >
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          viewMode={viewMode}
          isSelected={selectedAsset?.id === asset.id}
          isMultiSelected={selectedAssets.some((a) => a.id === asset.id)}
          onSelect={(asset) => handleAssetClick(asset, {} as React.MouseEvent)}
          onDoubleClick={onAssetDoubleClick}
          onToggleFavorite={onToggleFavorite}
          onDragStart={handleAssetDragStart}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
};
