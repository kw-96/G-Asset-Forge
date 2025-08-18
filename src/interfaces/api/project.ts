/**
 * 项目API接口定义
 * @description 定义项目相关的所有API接口
 * @author 开发团队
 */
import type {
  APIResponse,
  QueryParams,
  BatchOperationParams,
  BatchOperationResponse,
  ExportResponse,
  FileUploadParams
} from './base';
import type { Project, ProjectTemplate, CreateProjectParams, ProjectExportOptions, UpdateProjectParams } from '../types/project';





/**
 * 项目查询参数接口
 */
export interface ProjectQueryParams extends QueryParams {
  filter?: {
    name?: string;
    tags?: string[];
    createdBy?: string;
    isShared?: boolean;
    lastModifiedAfter?: string;
    lastModifiedBefore?: string;
  };
}

/**
 * 项目导入参数接口
 */
export interface ImportProjectParams extends FileUploadParams {
  overwriteExisting?: boolean;
  mergeAssets?: boolean;
  validateFormat?: boolean;
}



/**
 * 项目备份选项接口
 */
export interface ProjectBackupOptions {
  includeAssets?: boolean;
  includeHistory?: boolean;
  compression?: 'none' | 'zip' | 'gzip';
  destination?: string;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
  };
}

/**
 * 项目统计信息接口
 */
export interface ProjectStats {
  elementCount: number;
  assetCount: number;
  totalSize: number;
  lastModified: string;
  createdAt: string;
  version: string;
  collaboratorCount: number;
  viewCount: number;
  exportCount: number;
}

/**
 * 项目协作信息接口
 */
export interface ProjectCollaboration {
  isShared: boolean;
  shareId?: string;
  permissions: {
    canEdit: boolean;
    canView: boolean;
    canComment: boolean;
    canShare: boolean;
    canExport: boolean;
  };
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer' | 'commenter';
    joinedAt: string;
    lastActive: string;
    permissions: {
      canEdit: boolean;
      canView: boolean;
      canComment: boolean;
      canShare: boolean;
      canExport: boolean;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: 'editor' | 'viewer' | 'commenter';
    invitedAt: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  }>;
}

/**
 * 项目版本信息接口
 */
export interface ProjectVersion {
  id: string;
  version: string;
  name?: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  changes: Array<{
    type: 'added' | 'modified' | 'deleted';
    target: 'element' | 'asset' | 'settings';
    targetId: string;
    description: string;
  }>;
  size: number;
  isAutoSave: boolean;
}

/**
 * 项目API接口
 */
export interface ProjectAPI {
  /**
   * 创建项目
   */
  createProject(params: CreateProjectParams): Promise<APIResponse<Project>>;

  /**
   * 获取项目
   */
  getProject(projectId: string): Promise<APIResponse<Project>>;

  /**
   * 更新项目
   */
  updateProject(params: UpdateProjectParams): Promise<APIResponse<Project>>;

  /**
   * 删除项目
   */
  deleteProject(projectId: string): Promise<APIResponse<void>>;

  /**
   * 查询项目列表
   */
  getProjects(params?: ProjectQueryParams): Promise<APIResponse<Project[]>>;

  /**
   * 复制项目
   */
  duplicateProject(
    projectId: string,
    newName?: string
  ): Promise<APIResponse<Project>>;

  /**
   * 导入项目
   */
  importProject(params: ImportProjectParams): Promise<APIResponse<Project>>;

  /**
   * 导出项目
   */
  exportProject(
    projectId: string,
    options: ProjectExportOptions
  ): Promise<APIResponse<ExportResponse>>;

  /**
   * 获取项目统计信息
   */
  getProjectStats(projectId: string): Promise<APIResponse<ProjectStats>>;

  /**
   * 获取项目协作信息
   */
  getProjectCollaboration(
    projectId: string
  ): Promise<APIResponse<ProjectCollaboration>>;

  /**
   * 更新项目协作设置
   */
  updateProjectCollaboration(
    projectId: string,
    collaboration: Partial<ProjectCollaboration>
  ): Promise<APIResponse<ProjectCollaboration>>;

  /**
   * 邀请协作者
   */
  inviteCollaborator(
    projectId: string,
    email: string,
    role: 'editor' | 'viewer' | 'commenter'
  ): Promise<APIResponse<{ invitationId: string }>>;

  /**
   * 移除协作者
   */
  removeCollaborator(
    projectId: string,
    collaboratorId: string
  ): Promise<APIResponse<void>>;

  /**
   * 创建项目备份
   */
  createBackup(
    projectId: string,
    options?: ProjectBackupOptions
  ): Promise<APIResponse<{ backupId: string; size: number }>>;

  /**
   * 恢复项目备份
   */
  restoreBackup(
    projectId: string,
    backupId: string
  ): Promise<APIResponse<Project>>;

  /**
   * 获取项目版本历史
   */
  getProjectVersions(
    projectId: string,
    params?: QueryParams
  ): Promise<APIResponse<ProjectVersion[]>>;

  /**
   * 创建项目版本
   */
  createProjectVersion(
    projectId: string,
    name?: string,
    description?: string
  ): Promise<APIResponse<ProjectVersion>>;

  /**
   * 恢复到指定版本
   */
  restoreProjectVersion(
    projectId: string,
    versionId: string
  ): Promise<APIResponse<Project>>;

  /**
   * 获取项目模板列表
   */
  getProjectTemplates(
    params?: QueryParams
  ): Promise<APIResponse<ProjectTemplate[]>>;

  /**
   * 创建项目模板
   */
  createProjectTemplate(
    projectId: string,
    name: string,
    description?: string
  ): Promise<APIResponse<ProjectTemplate>>;

  /**
   * 获取最近项目
   */
  getRecentProjects(limit?: number): Promise<APIResponse<Project[]>>;

  /**
   * 搜索项目
   */
  searchProjects(
    query: string,
    params?: QueryParams
  ): Promise<APIResponse<Project[]>>;

  /**
   * 批量操作项目
   */
  batchOperateProjects(
    params: BatchOperationParams<Project>
  ): Promise<APIResponse<BatchOperationResponse<Project>>>;
}

/**
 * 项目事件接口
 */
export interface ProjectEvents {
  'project:created': { project: Project };
  'project:updated': { project: Project };
  'project:deleted': { projectId: string };
  'project:opened': { project: Project };
  'project:closed': { projectId: string };
  'project:saved': { project: Project };
  'project:exported': { projectId: string; format: string };
  'project:imported': { project: Project };
  'project:shared': { projectId: string; shareId: string };
  'project:collaborator-added': { projectId: string; collaboratorId: string };
  'project:collaborator-removed': { projectId: string; collaboratorId: string };
  'project:backup-created': { projectId: string; backupId: string };
  'project:version-created': { projectId: string; version: ProjectVersion };
}

/**
 * 项目错误代码
 */
export enum ProjectErrorCode {
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_NAME_EXISTS = 'PROJECT_NAME_EXISTS',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',
  PROJECT_LOCKED = 'PROJECT_LOCKED',
  INVALID_PROJECT_FORMAT = 'INVALID_PROJECT_FORMAT',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  BACKUP_NOT_FOUND = 'BACKUP_NOT_FOUND',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
  COLLABORATOR_NOT_FOUND = 'COLLABORATOR_NOT_FOUND',
  INVITATION_EXPIRED = 'INVITATION_EXPIRED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  IMPORT_FAILED = 'IMPORT_FAILED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  RESTORE_FAILED = 'RESTORE_FAILED',
}

/**
 * 项目错误消息映射
 */
export const ProjectErrorMessages: Record<ProjectErrorCode, string> = {
  [ProjectErrorCode.PROJECT_NOT_FOUND]: '项目不存在',
  [ProjectErrorCode.PROJECT_NAME_EXISTS]: '项目名称已存在',
  [ProjectErrorCode.PROJECT_ACCESS_DENIED]: '没有访问权限',
  [ProjectErrorCode.PROJECT_LOCKED]: '项目已被锁定',
  [ProjectErrorCode.INVALID_PROJECT_FORMAT]: '无效的项目格式',
  [ProjectErrorCode.TEMPLATE_NOT_FOUND]: '模板不存在',
  [ProjectErrorCode.BACKUP_NOT_FOUND]: '备份不存在',
  [ProjectErrorCode.VERSION_NOT_FOUND]: '版本不存在',
  [ProjectErrorCode.COLLABORATOR_NOT_FOUND]: '协作者不存在',
  [ProjectErrorCode.INVITATION_EXPIRED]: '邀请已过期',
  [ProjectErrorCode.EXPORT_FAILED]: '导出失败',
  [ProjectErrorCode.IMPORT_FAILED]: '导入失败',
  [ProjectErrorCode.BACKUP_FAILED]: '备份失败',
  [ProjectErrorCode.RESTORE_FAILED]: '恢复失败',
};