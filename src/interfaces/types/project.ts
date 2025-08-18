/**
 * 项目相关类型定义
 * @description 定义项目、模板、设置等相关的数据类型
 * @author 开发团队
 */
import type { CanvasElement, CanvasConfig } from './canvas';
import type { Asset } from './asset';

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

/**
 * 项目可见性枚举
 */
export enum ProjectVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
}

/**
 * 协作者角色枚举
 */
export enum CollaboratorRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
}

/**
 * 项目设置接口
 */
export interface ProjectSettings {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showRulers: boolean;
  rulerUnit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  autoSave: boolean;
  autoSaveInterval: number;
  maxHistorySteps: number;
  enableVersionControl: boolean;
  enableCollaboration: boolean;
  defaultZoom: number;
  quality: {
    renderQuality: 'low' | 'medium' | 'high';
    exportQuality: number;
    thumbnailQuality: number;
  };
  performance: {
    enableGPUAcceleration: boolean;
    maxTextureSize: number;
    targetFPS: number;
    memoryLimit: number;
  };
  security: {
    allowExternalAssets: boolean;
    requireAuthentication: boolean;
    enableWatermark: boolean;
  };
}

/**
 * 项目元数据接口
 */
export interface ProjectMetadata {
  version: string;
  author: string;
  description?: string;
  tags: string[];
  category: string;
  license?: string;
  keywords?: string[];
  thumbnail?: string;
  previewImages?: string[];
  customFields?: Record<string, any>;
}

/**
 * 项目统计信息接口
 */
export interface ProjectStatistics {
  elementCount: number;
  assetCount: number;
  totalSize: number;
  canvasCount: number;
  collaboratorCount: number;
  viewCount: number;
  editCount: number;
  exportCount: number;
  shareCount: number;
  commentCount: number;
  versionCount: number;
  lastActivity: string;
  creationTime: number;
  editingTime: number;
}

/**
 * 项目历史记录接口
 */
export interface ProjectHistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'copy' | 'import' | 'export';
  target: 'project' | 'canvas' | 'element' | 'asset' | 'settings';
  targetId: string;
  description: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: Record<string, any>;
}

/**
 * 项目备份信息接口
 */
export interface ProjectBackup {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  size: number;
  createdAt: string;
  createdBy: string;
  type: 'manual' | 'auto' | 'scheduled';
  status: 'creating' | 'completed' | 'failed' | 'expired';
  expiresAt?: string;
  downloadUrl?: string;
  metadata: {
    elementCount: number;
    assetCount: number;
    version: string;
    compression: 'none' | 'zip' | 'gzip';
  };
}

/**
 * 项目版本信息接口
 */
export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  name?: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  isAutoSave: boolean;
  isMajor: boolean;
  parentVersionId?: string;
  changes: Array<{
    type: 'added' | 'modified' | 'deleted' | 'moved';
    target: 'element' | 'asset' | 'canvas' | 'settings';
    targetId: string;
    description: string;
    diff?: any;
  }>;
  statistics: {
    elementCount: number;
    assetCount: number;
    size: number;
    changeCount: number;
  };
  metadata?: Record<string, any>;
}

/**
 * 项目协作者接口
 */
export interface ProjectCollaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: CollaboratorRole;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canExport: boolean;
    canManageCollaborators: boolean;
    canManageSettings: boolean;
  };
  joinedAt: string;
  lastActive: string;
  invitedBy: string;
  status: 'active' | 'inactive' | 'pending' | 'declined';
  metadata?: Record<string, any>;
}

/**
 * 项目邀请接口
 */
export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  role: CollaboratorRole;
  permissions: ProjectCollaborator['permissions'];
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  message?: string;
  acceptedAt?: string;
  declinedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * 项目评论接口
 */
export interface ProjectComment {
  id: string;
  projectId: string;
  elementId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  position?: { x: number; y: number };
  parentCommentId?: string;
  replies?: ProjectComment[];
  createdAt: string;
  updatedAt?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  reactions?: Array<{
    type: 'like' | 'dislike' | 'heart' | 'laugh' | 'confused' | 'hooray';
    userId: string;
    createdAt: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  metadata?: Record<string, any>;
}

/**
 * 项目模板接口
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  previewImages: string[];
  settings: ProjectSettings;
  elements: CanvasElement[];
  assets: Asset[];
  isBuiltin: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  metadata?: Record<string, any>;
}

/**
 * 项目导出选项接口
 */
export interface ProjectExportOptions {
  format: 'json' | 'zip' | 'pdf' | 'png' | 'jpg' | 'svg';
  includeAssets: boolean;
  includeHistory: boolean;
  includeComments: boolean;
  includeMetadata: boolean;
  compression?: 'none' | 'zip' | 'gzip';
  quality?: number;
  scale?: number;
  selectedElementsOnly?: boolean;
  password?: string;
  watermark?: {
    enabled: boolean;
    text?: string;
    image?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
}

/**
 * 项目导入选项接口
 */
export interface ProjectImportOptions {
  overwriteExisting: boolean;
  mergeAssets: boolean;
  preserveIds: boolean;
  validateFormat: boolean;
  backupOriginal: boolean;
  importSettings: boolean;
  importHistory: boolean;
  importComments: boolean;
  conflictResolution: 'skip' | 'overwrite' | 'rename' | 'merge';
}

/**
 * 项目主接口
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  statistics: ProjectStatistics;
  
  // 内容数据
  canvases: Array<{
    id: string;
    name: string;
    config: CanvasConfig;
    elements: CanvasElement[];
    isDefault: boolean;
  }>;
  assets: Asset[];
  
  // 协作数据
  collaborators: ProjectCollaborator[];
  comments: ProjectComment[];
  
  // 版本控制
  currentVersion: string;
  versions: ProjectVersion[];
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  lastModifiedBy: string;
  
  // 共享信息
  shareId?: string;
  shareUrl?: string;
  shareSettings?: {
    allowComments: boolean;
    allowDownload: boolean;
    allowCopy: boolean;
    expiresAt?: string;
    password?: string;
  };
  
  // 其他
  parentProjectId?: string;
  templateId?: string;
  isTemplate: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  
  // 扩展字段
  customFields?: Record<string, any>;
}

/**
 * 项目创建参数接口
 */
export interface CreateProjectParams {
  name: string;
  description?: string;
  templateId?: string;
  settings?: Partial<ProjectSettings>;
  metadata?: Partial<ProjectMetadata>;
  visibility?: ProjectVisibility;
  initialCanvas?: {
    width: number;
    height: number;
    backgroundColor: string;
  };
}

/**
 * 项目更新参数接口
 */
export interface UpdateProjectParams {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  settings?: Partial<ProjectSettings>;
  metadata?: Partial<ProjectMetadata>;
  isFavorite?: boolean;
  customFields?: Record<string, any>;
}

/**
 * 项目查询过滤器接口
 */
export interface ProjectFilter {
  status?: ProjectStatus[];
  visibility?: ProjectVisibility[];
  tags?: string[];
  category?: string;
  createdBy?: string;
  collaboratorId?: string;
  isFavorite?: boolean;
  isTemplate?: boolean;
  isArchived?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  sizeMin?: number;
  sizeMax?: number;
}

/**
 * 项目排序选项接口
 */
export interface ProjectSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'lastOpenedAt' | 'size' | 'elementCount' | 'viewCount';
  order: 'asc' | 'desc';
}

/**
 * 类型守卫函数
 */
export function isProjectTemplate(item: Project | ProjectTemplate): item is ProjectTemplate {
  return 'isBuiltin' in item && 'usageCount' in item;
}

export function isActiveProject(project: Project): boolean {
  return project.status === ProjectStatus.ACTIVE;
}

export function isSharedProject(project: Project): boolean {
  return project.visibility === ProjectVisibility.SHARED || project.visibility === ProjectVisibility.PUBLIC;
}

export function canUserEdit(project: Project, userId: string): boolean {
  if (project.metadata.author === userId) {
    return true;
  }
  
  const collaborator = project.collaborators.find(c => c.userId === userId);
  return collaborator?.permissions.canEdit ?? false;
}

export function canUserView(project: Project, userId: string): boolean {
  if (project.visibility === ProjectVisibility.PUBLIC) {
    return true;
  }
  
  if (project.metadata.author === userId) {
    return true;
  }
  
  const collaborator = project.collaborators.find(c => c.userId === userId);
  return collaborator?.permissions.canView ?? false;
}