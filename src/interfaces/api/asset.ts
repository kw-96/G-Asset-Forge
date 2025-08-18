/**
 * 素材API接口定义
 * @description 定义素材相关的所有API接口
 * @author 开发团队
 */
import type { 
  APIResponse, 
  QueryParams, 
  BatchOperationParams, 
  BatchOperationResponse,
  FileUploadParams
} from './base';
import type { Asset, AssetType, AssetCategory, AssetRecommendation, CreateAssetParams, UpdateAssetParams } from '../types/asset';





/**
 * 素材查询参数接口
 */
export interface AssetQueryParams extends QueryParams {
  filter?: {
    type?: AssetType;
    category?: AssetCategory;
    tags?: string[];
    sizeMin?: number;
    sizeMax?: number;
    createdAfter?: string;
    createdBefore?: string;
    isFavorite?: boolean;
  };
}

/**
 * 素材搜索参数接口
 */
export interface AssetSearchParams extends QueryParams {
  query: string;
  searchFields?: ('name' | 'description' | 'tags')[];
  fuzzy?: boolean;
  includeMetadata?: boolean;
}

/**
 * 素材上传选项接口
 */
export interface AssetUploadOptions extends FileUploadParams {
  generateThumbnail?: boolean;
  optimizeImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * 素材批量上传参数接口
 */
export interface BatchUploadParams {
  files: File[];
  category?: AssetCategory;
  tags?: string[];
  generateThumbnails?: boolean;
  optimizeImages?: boolean;
}

/**
 * 素材统计信息接口
 */
export interface AssetStats {
  totalCount: number;
  totalSize: number;
  typeDistribution: Record<AssetType, number>;
  categoryDistribution: Record<AssetCategory, number>;
  averageSize: number;
  mostUsedAssets: Array<{
    asset: Asset;
    usageCount: number;
  }>;
  recentlyAdded: Asset[];
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
}

/**
 * 素材使用信息接口
 */
export interface AssetUsage {
  assetId: string;
  usageCount: number;
  lastUsed: string;
  usedInProjects: Array<{
    projectId: string;
    projectName: string;
    usageCount: number;
  }>;
}

/**
 * 素材推荐参数接口
 */
export interface AssetRecommendationParams {
  baseAssetId?: string;
  projectId?: string;
  tags?: string[];
  type?: AssetType;
  category?: AssetCategory;
  limit?: number;
}



/**
 * 素材API接口
 */
export interface AssetAPI {
  /**
   * 创建素材
   */
  createAsset(params: CreateAssetParams): Promise<APIResponse<Asset>>;

  /**
   * 获取素材
   */
  getAsset(assetId: string): Promise<APIResponse<Asset>>;

  /**
   * 更新素材
   */
  updateAsset(params: UpdateAssetParams): Promise<APIResponse<Asset>>;

  /**
   * 删除素材
   */
  deleteAsset(assetId: string): Promise<APIResponse<void>>;

  /**
   * 查询素材列表
   */
  getAssets(params?: AssetQueryParams): Promise<APIResponse<Asset[]>>;

  /**
   * 搜索素材
   */
  searchAssets(params: AssetSearchParams): Promise<APIResponse<{
    assets: Asset[];
    total: number;
    searchTime: number;
    suggestions?: string[];
  }>>;

  /**
   * 上传素材
   */
  uploadAsset(options: AssetUploadOptions): Promise<APIResponse<Asset>>;

  /**
   * 批量上传素材
   */
  batchUploadAssets(
    params: BatchUploadParams
  ): Promise<APIResponse<{
    successful: Asset[];
    failed: Array<{
      filename: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }>>;

  /**
   * 复制素材
   */
  duplicateAsset(
    assetId: string,
    newName?: string
  ): Promise<APIResponse<Asset>>;

  /**
   * 移动素材到分类
   */
  moveAssetToCategory(
    assetId: string,
    category: AssetCategory
  ): Promise<APIResponse<Asset>>;

  /**
   * 添加/移除收藏
   */
  toggleFavorite(assetId: string): Promise<APIResponse<{ isFavorite: boolean }>>;

  /**
   * 获取素材缩略图
   */
  getAssetThumbnail(
    assetId: string,
    size?: { width: number; height: number }
  ): Promise<APIResponse<{ url: string; size: { width: number; height: number } }>>;

  /**
   * 生成素材缩略图
   */
  generateThumbnail(
    assetId: string,
    options?: { width?: number; height?: number; quality?: number }
  ): Promise<APIResponse<{ url: string }>>;

  /**
   * 获取素材统计信息
   */
  getAssetStats(): Promise<APIResponse<AssetStats>>;

  /**
   * 获取素材使用信息
   */
  getAssetUsage(assetId: string): Promise<APIResponse<AssetUsage>>;

  /**
   * 获取素材推荐
   */
  getAssetRecommendations(
    params: AssetRecommendationParams
  ): Promise<APIResponse<AssetRecommendation[]>>;

  /**
   * 获取分类列表
   */
  getCategories(): Promise<APIResponse<Array<{
    category: AssetCategory;
    name: string;
    description: string;
    count: number;
  }>>>;

  /**
   * 获取标签列表
   */
  getTags(params?: {
    popular?: boolean;
    limit?: number;
  }): Promise<APIResponse<Array<{
    tag: string;
    count: number;
  }>>>;

  /**
   * 批量操作素材
   */
  batchOperateAssets(
    params: BatchOperationParams<Asset>
  ): Promise<APIResponse<BatchOperationResponse<Asset>>>;

  /**
   * 导出素材
   */
  exportAssets(
    assetIds: string[],
    format?: 'zip' | 'tar'
  ): Promise<APIResponse<{ downloadUrl: string; size: number }>>;

  /**
   * 清理未使用的素材
   */
  cleanupUnusedAssets(
    olderThanDays?: number
  ): Promise<APIResponse<{
    deletedCount: number;
    freedSpace: number;
    deletedAssets: string[];
  }>>;

  /**
   * 优化素材存储
   */
  optimizeStorage(): Promise<APIResponse<{
    originalSize: number;
    optimizedSize: number;
    savedSpace: number;
    optimizedCount: number;
  }>>;

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): Promise<APIResponse<{
    used: number;
    available: number;
    total: number;
    percentage: number;
    breakdown: Record<AssetType, number>;
  }>>;
}

/**
 * 素材事件接口
 */
export interface AssetEvents {
  'asset:created': { asset: Asset };
  'asset:updated': { asset: Asset };
  'asset:deleted': { assetId: string };
  'asset:uploaded': { asset: Asset };
  'asset:favorited': { assetId: string; isFavorite: boolean };
  'asset:moved': { assetId: string; fromCategory: AssetCategory; toCategory: AssetCategory };
  'asset:thumbnail-generated': { assetId: string; thumbnailUrl: string };
  'asset:usage-tracked': { assetId: string; projectId: string };
  'storage:usage-warning': { used: number; available: number; percentage: number };
  'storage:cleanup-completed': { deletedCount: number; freedSpace: number };
}

/**
 * 素材错误代码
 */
export enum AssetErrorCode {
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  ASSET_NAME_EXISTS = 'ASSET_NAME_EXISTS',
  INVALID_ASSET_TYPE = 'INVALID_ASSET_TYPE',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  THUMBNAIL_GENERATION_FAILED = 'THUMBNAIL_GENERATION_FAILED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  ASSET_IN_USE = 'ASSET_IN_USE',
  OPTIMIZATION_FAILED = 'OPTIMIZATION_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
}

/**
 * 素材错误消息映射
 */
export const AssetErrorMessages: Record<AssetErrorCode, string> = {
  [AssetErrorCode.ASSET_NOT_FOUND]: '素材不存在',
  [AssetErrorCode.ASSET_NAME_EXISTS]: '素材名称已存在',
  [AssetErrorCode.INVALID_ASSET_TYPE]: '无效的素材类型',
  [AssetErrorCode.INVALID_FILE_FORMAT]: '不支持的文件格式',
  [AssetErrorCode.FILE_TOO_LARGE]: '文件过大',
  [AssetErrorCode.UPLOAD_FAILED]: '上传失败',
  [AssetErrorCode.THUMBNAIL_GENERATION_FAILED]: '缩略图生成失败',
  [AssetErrorCode.STORAGE_QUOTA_EXCEEDED]: '存储空间不足',
  [AssetErrorCode.CATEGORY_NOT_FOUND]: '分类不存在',
  [AssetErrorCode.ASSET_IN_USE]: '素材正在使用中',
  [AssetErrorCode.OPTIMIZATION_FAILED]: '优化失败',
  [AssetErrorCode.EXPORT_FAILED]: '导出失败',
};