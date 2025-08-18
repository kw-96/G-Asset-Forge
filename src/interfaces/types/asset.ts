/**
 * 素材相关类型定义
 * @description 定义素材、分类、标签等相关的数据类型
 * @author 开发团队
 */

/**
 * 素材类型枚举
 */
export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FONT = 'font',
  ICON = 'icon',
  TEXTURE = 'texture',
  PATTERN = 'pattern',
  BRUSH = 'brush',
  TEMPLATE = 'template',
  DOCUMENT = 'document',
}

/**
 * 素材分类枚举
 */
export enum AssetCategory {
  BACKGROUNDS = 'backgrounds',
  CHARACTERS = 'characters',
  UI_ELEMENTS = 'ui-elements',
  ICONS = 'icons',
  EFFECTS = 'effects',
  TEXTURES = 'textures',
  PATTERNS = 'patterns',
  FONTS = 'fonts',
  AUDIO = 'audio',
  VIDEO = 'video',
  TEMPLATES = 'templates',
  DOCUMENTS = 'documents',
  UNCATEGORIZED = 'uncategorized',
}

/**
 * 素材状态枚举
 */
export enum AssetStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

/**
 * 素材许可证类型枚举
 */
export enum AssetLicense {
  PUBLIC_DOMAIN = 'public-domain',
  CC0 = 'cc0',
  CC_BY = 'cc-by',
  CC_BY_SA = 'cc-by-sa',
  CC_BY_NC = 'cc-by-nc',
  CC_BY_NC_SA = 'cc-by-nc-sa',
  PROPRIETARY = 'proprietary',
  CUSTOM = 'custom',
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  encoding?: string;
}

/**
 * 图片元数据接口
 */
export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  colorSpace: string;
  hasAlpha: boolean;
  dpi?: number;
  exif?: Record<string, any>;
  dominantColors?: string[];
  averageColor?: string;
}

/**
 * 音频元数据接口
 */
export interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  codec?: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
}

/**
 * 视频元数据接口
 */
export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  hasAudio: boolean;
  audioCodec?: string;
  aspectRatio: number;
  thumbnails?: string[];
}

/**
 * 字体元数据接口
 */
export interface FontMetadata {
  family: string;
  style: string;
  weight: number;
  format: string;
  glyphCount: number;
  languages: string[];
  features: string[];
  preview?: string;
}

/**
 * 素材使用统计接口
 */
export interface AssetUsageStats {
  totalUsage: number;
  recentUsage: number;
  projectUsage: Array<{
    projectId: string;
    projectName: string;
    usageCount: number;
    lastUsed: string;
  }>;
  userUsage: Array<{
    userId: string;
    userName: string;
    usageCount: number;
    lastUsed: string;
  }>;
  popularityScore: number;
  trendingScore: number;
}

/**
 * 素材版本信息接口
 */
export interface AssetVersion {
  id: string;
  version: string;
  description?: string;
  fileInfo: FileInfo;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  changes?: string[];
  metadata?: Record<string, any>;
}

/**
 * 素材评分接口
 */
export interface AssetRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  userRating?: number;
}

/**
 * 素材评论接口
 */
export interface AssetComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: string;
  replies?: AssetComment[];
  isHelpful?: boolean;
  helpfulCount: number;
  reportCount: number;
}

/**
 * 素材收藏夹接口
 */
export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  thumbnail?: string;
  collaborators?: Array<{
    userId: string;
    role: 'viewer' | 'editor';
    addedAt: string;
  }>;
}

/**
 * 素材主接口
 */
export interface Asset {
  id: string;
  name: string;
  description?: string;
  type: AssetType;
  category: AssetCategory;
  status: AssetStatus;
  
  // 文件信息
  fileInfo: FileInfo;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // 元数据
  metadata: ImageMetadata | AudioMetadata | VideoMetadata | FontMetadata | Record<string, any>;
  
  // 分类和标签
  tags: string[];
  keywords: string[];
  
  // 许可证和版权
  license: AssetLicense;
  licenseDetails?: string;
  copyright?: string;
  attribution?: string;
  
  // 版本控制
  currentVersion: string;
  versions: AssetVersion[];
  
  // 使用统计
  usageStats: AssetUsageStats;
  
  // 评分和评论
  rating: AssetRating;
  comments: AssetComment[];
  
  // 收藏和分享
  isFavorite: boolean;
  favoriteCount: number;
  downloadCount: number;
  viewCount: number;
  shareCount: number;
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  
  // 创建者信息
  createdBy: string;
  creatorName?: string;
  creatorAvatar?: string;
  
  // 可见性和权限
  isPublic: boolean;
  isVerified: boolean;
  isPremium: boolean;
  
  // 技术信息
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingProgress?: number;
  processingError?: string;
  
  // 关联信息
  relatedAssets?: string[];
  collections?: string[];
  projectIds?: string[];
  
  // 扩展字段
  customFields?: Record<string, any>;
}

/**
 * 素材创建参数接口
 */
export interface CreateAssetParams {
  name: string;
  description?: string;
  type: AssetType;
  category: AssetCategory;
  file?: File;
  url?: string;
  tags?: string[];
  keywords?: string[];
  license?: AssetLicense;
  licenseDetails?: string;
  copyright?: string;
  attribution?: string;
  isPublic?: boolean;
  customFields?: Record<string, any>;
}

/**
 * 素材更新参数接口
 */
export interface UpdateAssetParams {
  id: string;
  name?: string;
  description?: string;
  category?: AssetCategory;
  tags?: string[];
  keywords?: string[];
  license?: AssetLicense;
  licenseDetails?: string;
  copyright?: string;
  attribution?: string;
  isPublic?: boolean;
  customFields?: Record<string, any>;
}

/**
 * 素材查询过滤器接口
 */
export interface AssetFilter {
  type?: AssetType[];
  category?: AssetCategory[];
  status?: AssetStatus[];
  license?: AssetLicense[];
  tags?: string[];
  keywords?: string[];
  createdBy?: string;
  isPublic?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isFavorite?: boolean;
  hasComments?: boolean;
  ratingMin?: number;
  ratingMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  durationMin?: number;
  durationMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  lastUsedAfter?: string;
  lastUsedBefore?: string;
}

/**
 * 素材排序选项接口
 */
export interface AssetSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'size' | 'rating' | 'downloadCount' | 'viewCount' | 'popularity' | 'trending';
  order: 'asc' | 'desc';
}

/**
 * 素材搜索结果接口
 */
export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  searchTime: number;
  facets?: {
    types: Array<{ type: AssetType; count: number }>;
    categories: Array<{ category: AssetCategory; count: number }>;
    tags: Array<{ tag: string; count: number }>;
    licenses: Array<{ license: AssetLicense; count: number }>;
  };
  suggestions?: string[];
  relatedQueries?: string[];
}

/**
 * 素材推荐结果接口
 */
export interface AssetRecommendation {
  asset: Asset;
  score: number;
  reasons: Array<{
    type: 'similar_tags' | 'same_category' | 'same_type' | 'popular' | 'trending' | 'collaborative_filtering';
    description: string;
    weight: number;
  }>;
  similarity?: number;
}

/**
 * 素材统计信息接口
 */
export interface AssetStatistics {
  totalCount: number;
  totalSize: number;
  averageSize: number;
  typeDistribution: Record<AssetType, number>;
  categoryDistribution: Record<AssetCategory, number>;
  licenseDistribution: Record<AssetLicense, number>;
  statusDistribution: Record<AssetStatus, number>;
  uploadTrend: Array<{
    date: string;
    count: number;
    size: number;
  }>;
  popularAssets: Asset[];
  trendingAssets: Asset[];
  recentAssets: Asset[];
  topCreators: Array<{
    userId: string;
    userName: string;
    assetCount: number;
    totalDownloads: number;
    averageRating: number;
  }>;
  storageUsage: {
    used: number;
    available: number;
    total: number;
    percentage: number;
    breakdown: Record<AssetType, number>;
  };
}

/**
 * 类型守卫函数
 */
export function isImageAsset(asset: Asset): asset is Asset & { metadata: ImageMetadata } {
  return asset.type === AssetType.IMAGE;
}

export function isAudioAsset(asset: Asset): asset is Asset & { metadata: AudioMetadata } {
  return asset.type === AssetType.AUDIO;
}

export function isVideoAsset(asset: Asset): asset is Asset & { metadata: VideoMetadata } {
  return asset.type === AssetType.VIDEO;
}

export function isFontAsset(asset: Asset): asset is Asset & { metadata: FontMetadata } {
  return asset.type === AssetType.FONT;
}

export function isPublicAsset(asset: Asset): boolean {
  return asset.isPublic && asset.status === AssetStatus.READY;
}

export function canUserDownload(asset: Asset, userId?: string): boolean {
  if (asset.isPublic) {
    return true;
  }
  
  return asset.createdBy === userId;
}

export function canUserEdit(asset: Asset, userId?: string): boolean {
  return asset.createdBy === userId;
}

export function getAssetDisplayName(asset: Asset): string {
  return asset.name || asset.fileInfo.originalName || asset.fileInfo.name;
}

export function getAssetFileSize(asset: Asset): string {
  const size = asset.fileInfo.size;
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let fileSize = size;
  
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }
  
  return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
}

export function getAssetDimensions(asset: Asset): string | null {
  if (isImageAsset(asset) || isVideoAsset(asset)) {
    return `${asset.metadata.width} × ${asset.metadata.height}`;
  }
  
  return null;
}

export function getAssetDuration(asset: Asset): string | null {
  if (isAudioAsset(asset) || isVideoAsset(asset)) {
    const duration = asset.metadata.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return null;
}