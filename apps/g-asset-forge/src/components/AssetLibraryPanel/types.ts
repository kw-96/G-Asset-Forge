/**
 * 素材库相关类型定义
 */

export interface IAssetMetadata {
  id: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  fileType: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  thumbnail?: string;
  previewUrl?: string;
  originalUrl: string;
  license: 'free' | 'premium' | 'custom';
  isCustom?: boolean;
  isFavorite?: boolean;
  author?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount?: number;
  rating?: number;
}

export type AssetCategory =
  | 'ui'
  | 'icon'
  | 'background'
  | 'decoration'
  | 'character'
  | 'effect'
  | 'texture';

export interface IAssetCategoryInfo {
  id: AssetCategory;
  name: string;
  description: string;
  icon?: string;
}

export interface IAssetSearchOptions {
  query?: string;
  category?: AssetCategory;
  tags?: string[];
  author?: string;
  license?: string[];
  isFavorite?: boolean;
  isCustom?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
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

export type ViewMode = 'grid' | 'list';

export interface IAssetLibraryPanelProps {
  onAssetSelect?: (asset: IAssetMetadata) => void;
  onAssetDoubleClick?: (asset: IAssetMetadata) => void;
  onAssetDragStart?: (asset: IAssetMetadata, event: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}
