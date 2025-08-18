/**
 * 类型定义统一导出
 * @description 提供所有类型定义的统一入口
 * @author 开发团队
 */

// 导出画布相关类型
export * from './canvas';

// 导出项目相关类型（排除有歧义的函数）
export {
  ProjectStatus,
  ProjectVisibility,
  CollaboratorRole,
  type ProjectSettings,
  type ProjectMetadata,
  type ProjectStatistics,
  type ProjectHistoryEntry,
  type ProjectBackup,
  type ProjectVersion,
  type ProjectCollaborator,
  type ProjectInvitation,
  type ProjectComment,
  type ProjectTemplate,
  type ProjectExportOptions,
  type ProjectImportOptions,
  type Project,
  type CreateProjectParams,
  type UpdateProjectParams,
  type ProjectFilter,
  type ProjectSortOptions,
  isProjectTemplate,
  isActiveProject,
  isSharedProject,
  canUserView,
} from './project';

// 导出素材相关类型（排除有歧义的函数）
export {
  AssetType,
  AssetCategory,
  AssetStatus,
  AssetLicense,
  // type FileInfo,
  type ImageMetadata,
  type AudioMetadata,
  type VideoMetadata,
  type FontMetadata,
  type AssetUsageStats,
  type AssetVersion,
  type AssetRating,
  type AssetComment,
  type AssetCollection,
  type Asset,
  type CreateAssetParams,
  type UpdateAssetParams,
  type AssetFilter,
  type AssetSortOptions,
  type AssetSearchResult,
  type AssetRecommendation,
  type AssetStatistics,
  isImageAsset,
  isAudioAsset,
  isVideoAsset,
  isFontAsset,
  isPublicAsset,
  canUserDownload,
  getAssetDisplayName,
  getAssetFileSize,
  getAssetDimensions,
  getAssetDuration,
} from './asset';

// 显式导出有歧义的函数，使用不同的名称
export { canUserEdit as canUserEditProject } from './project';
export { canUserEdit as canUserEditAsset } from './asset';

// 重新导出主要类型
// export type { CanvasElement, CanvasState, CanvasConfig } from './canvas';
// export type { Project, ProjectTemplate, ProjectSettings } from './project';
// export type { Asset, AssetFilter, AssetSearchResult } from './asset';

/**
 * 通用ID类型
 */
export type ID = string;

/**
 * 时间戳类型
 */
export type Timestamp = string;

/**
 * 用户ID类型
 */
export type UserID = string;

/**
 * 项目ID类型
 */
export type ProjectID = string;

/**
 * 画布ID类型
 */
export type CanvasID = string;

/**
 * 元素ID类型
 */
export type ElementID = string;

/**
 * 素材ID类型
 */
export type AssetID = string;

/**
 * 通用实体接口
 */
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 可命名实体接口
 */
export interface NamedEntity extends BaseEntity {
  name: string;
  description?: string;
}

/**
 * 可标记实体接口
 */
export interface TaggableEntity {
  tags: string[];
}

/**
 * 可搜索实体接口
 */
export interface SearchableEntity extends NamedEntity, TaggableEntity {
  keywords?: string[];
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: UserID;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 排序信息接口
 */
export interface SortInfo {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 查询参数接口
 */
export interface QueryParams {
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: SortInfo[];
  filter?: Record<string, any>;
  search?: string;
}

/**
 * 操作结果接口
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult<T = any> {
  successful: T[];
  failed: Array<{
    item: T;
    error: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * 上传进度接口
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  remainingTime?: number;
}

/**
 * 权限接口
 */
export interface Permissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canComment: boolean;
  canExport: boolean;
}

/**
 * 活动日志接口
 */
export interface ActivityLog {
  id: ID;
  userId: UserID;
  userName: string;
  action: string;
  target: string;
  targetId: ID;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

/**
 * 通知接口
 */
export interface Notification {
  id: ID;
  userId: UserID;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * 系统设置接口
 */
export interface SystemSettings {
  general: {
    appName: string;
    version: string;
    language: string;
    timezone: string;
  };
  performance: {
    enableGPUAcceleration: boolean;
    maxMemoryUsage: number;
    targetFPS: number;
    enableCaching: boolean;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableAuditLog: boolean;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    storageQuota: number;
    enableCompression: boolean;
  };
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Timestamp;
  userId?: UserID;
  requestId?: string;
  stack?: string;
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  networkLatency: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: Timestamp;
}

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    message?: string;
  }>;
  metrics: PerformanceMetrics;
  timestamp: Timestamp;
}