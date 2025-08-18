/**
 * 项目数据验证模式
 * @description 定义项目相关数据的验证规则
 * @author 开发团队
 */
import { ValidationSchema, CommonRules, ValidationResult, Validator } from './base';
import { ProjectStatus, ProjectVisibility, CollaboratorRole } from '../types/project';

/**
 * 项目设置验证模式
 */
export const ProjectSettingsSchema: ValidationSchema = {
  rules: [
    CommonRules.size('canvasWidth'),
    CommonRules.size('canvasHeight'),
    {
      field: 'backgroundColor',
      required: true,
      type: 'string',
      pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    {
      field: 'gridEnabled',
      required: true,
      type: 'boolean',
    },
    {
      field: 'gridSize',
      required: true,
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      field: 'snapToGrid',
      required: true,
      type: 'boolean',
    },
    {
      field: 'showRulers',
      required: true,
      type: 'boolean',
    },
    {
      field: 'autoSave',
      required: true,
      type: 'boolean',
    },
    {
      field: 'autoSaveInterval',
      required: true,
      type: 'number',
      min: 10,
      max: 3600,
    },
    {
      field: 'maxHistorySteps',
      required: true,
      type: 'number',
      min: 10,
      max: 1000,
    },
    {
      field: 'enableVersionControl',
      required: true,
      type: 'boolean',
    },
    {
      field: 'enableCollaboration',
      required: true,
      type: 'boolean',
    },
  ],
};

/**
 * 项目元数据验证模式
 */
export const ProjectMetadataSchema: ValidationSchema = {
  rules: [
    {
      field: 'version',
      required: true,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
    {
      field: 'author',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    CommonRules.description(false),
    CommonRules.tags(false),
    {
      field: 'category',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    {
      field: 'license',
      required: false,
      type: 'string',
      maxLength: 100,
    },
    {
      field: 'keywords',
      required: false,
      type: 'array',
      maxLength: 20,
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(keyword => typeof keyword === 'string' && keyword.length <= 50);
      },
    },
    {
      field: 'thumbnail',
      required: false,
      type: 'string',
      pattern: /^https?:\/\/.+/,
    },
  ],
};

/**
 * 项目统计信息验证模式
 */
export const ProjectStatisticsSchema: ValidationSchema = {
  rules: [
    {
      field: 'elementCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'assetCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'totalSize',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'collaboratorCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'viewCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'editCount',
      required: true,
      type: 'number',
      min: 0,
    },
    CommonRules.timestamp('lastActivity'),
  ],
};

/**
 * 项目协作者验证模式
 */
export const ProjectCollaboratorSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'userId',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'userName',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    {
      field: 'userEmail',
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    {
      field: 'role',
      required: true,
      type: 'string',
      enum: Object.values(CollaboratorRole),
    },
    {
      field: 'permissions',
      required: true,
      type: 'object',
      nested: {
        rules: [
          {
            field: 'canView',
            required: true,
            type: 'boolean',
          },
          {
            field: 'canEdit',
            required: true,
            type: 'boolean',
          },
          {
            field: 'canComment',
            required: true,
            type: 'boolean',
          },
          {
            field: 'canShare',
            required: true,
            type: 'boolean',
          },
          {
            field: 'canExport',
            required: true,
            type: 'boolean',
          },
        ],
      },
    },
    CommonRules.timestamp('joinedAt'),
    CommonRules.timestamp('lastActive'),
    {
      field: 'status',
      required: true,
      type: 'string',
      enum: ['active', 'inactive', 'pending', 'declined'],
    },
  ],
};

/**
 * 项目邀请验证模式
 */
export const ProjectInvitationSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'projectId',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'email',
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    {
      field: 'role',
      required: true,
      type: 'string',
      enum: ['editor', 'viewer', 'commenter'],
    },
    {
      field: 'invitedBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
    CommonRules.timestamp('invitedAt'),
    CommonRules.timestamp('expiresAt'),
    {
      field: 'status',
      required: true,
      type: 'string',
      enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
    },
    {
      field: 'message',
      required: false,
      type: 'string',
      maxLength: 500,
    },
  ],
};

/**
 * 项目评论验证模式
 */
export const ProjectCommentSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'projectId',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'elementId',
      required: false,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'userId',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'userName',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    {
      field: 'content',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 2000,
    },
    {
      field: 'position',
      required: false,
      type: 'object',
      nested: {
        rules: [
          CommonRules.coordinate('x'),
          CommonRules.coordinate('y'),
        ],
      },
    },
    {
      field: 'isResolved',
      required: true,
      type: 'boolean',
    },
    CommonRules.timestamp('createdAt'),
  ],
};

/**
 * 项目版本验证模式
 */
export const ProjectVersionSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'projectId',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'version',
      required: true,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
    {
      field: 'name',
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s_-]+$/,
    },
    CommonRules.description(false),
    CommonRules.timestamp('createdAt'),
    {
      field: 'createdBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'isAutoSave',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isMajor',
      required: true,
      type: 'boolean',
    },
    {
      field: 'changes',
      required: true,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '变更记录必须是数组';
        return value.every(change =>
          typeof change === 'object' &&
          ['added', 'modified', 'deleted', 'moved'].includes(change.type) &&
          ['element', 'asset', 'canvas', 'settings'].includes(change.target) &&
          typeof change.targetId === 'string' &&
          typeof change.description === 'string'
        ) || '变更记录格式不正确';
      },
    },
  ],
};

/**
 * 项目模板验证模式
 */
export const ProjectTemplateSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(),
    CommonRules.description(),
    {
      field: 'category',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    CommonRules.tags(),
    {
      field: 'thumbnail',
      required: true,
      type: 'string',
      pattern: /^https?:\/\/.+/,
    },
    {
      field: 'settings',
      required: true,
      type: 'object',
      nested: ProjectSettingsSchema,
    },
    {
      field: 'elements',
      required: true,
      type: 'array',
    },
    {
      field: 'assets',
      required: true,
      type: 'array',
    },
    {
      field: 'isBuiltin',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isPublic',
      required: true,
      type: 'boolean',
    },
    {
      field: 'createdBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
    CommonRules.timestamp('createdAt'),
    CommonRules.timestamp('updatedAt'),
    {
      field: 'usageCount',
      required: true,
      type: 'number',
      min: 0,
    },
  ],
};

/**
 * 项目主验证模式
 */
export const ProjectSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(),
    CommonRules.description(false),
    {
      field: 'status',
      required: true,
      type: 'string',
      enum: Object.values(ProjectStatus),
    },
    {
      field: 'visibility',
      required: true,
      type: 'string',
      enum: Object.values(ProjectVisibility),
    },
    {
      field: 'settings',
      required: true,
      type: 'object',
      nested: ProjectSettingsSchema,
    },
    {
      field: 'metadata',
      required: true,
      type: 'object',
      nested: ProjectMetadataSchema,
    },
    {
      field: 'statistics',
      required: true,
      type: 'object',
      nested: ProjectStatisticsSchema,
    },
    {
      field: 'canvases',
      required: true,
      type: 'array',
      minLength: 1,
    },
    {
      field: 'assets',
      required: true,
      type: 'array',
    },
    {
      field: 'collaborators',
      required: true,
      type: 'array',
    },
    {
      field: 'currentVersion',
      required: true,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
    {
      field: 'isTemplate',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isFavorite',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isArchived',
      required: true,
      type: 'boolean',
    },
    CommonRules.timestamp('createdAt'),
    CommonRules.timestamp('updatedAt'),
    {
      field: 'lastModifiedBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
  ],
};

/**
 * 项目创建参数验证模式
 */
export const CreateProjectParamsSchema: ValidationSchema = {
  rules: [
    CommonRules.name(),
    CommonRules.description(false),
    {
      field: 'templateId',
      required: false,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'settings',
      required: false,
      type: 'object',
    },
    {
      field: 'metadata',
      required: false,
      type: 'object',
    },
    {
      field: 'visibility',
      required: false,
      type: 'string',
      enum: Object.values(ProjectVisibility),
    },
    {
      field: 'initialCanvas',
      required: false,
      type: 'object',
      nested: {
        rules: [
          CommonRules.size('width'),
          CommonRules.size('height'),
          {
            field: 'backgroundColor',
            required: true,
            type: 'string',
            pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          },
        ],
      },
    },
  ],
};

/**
 * 项目更新参数验证模式
 */
export const UpdateProjectParamsSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'name',
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s_-]+$/,
    },
    CommonRules.description(false),
    {
      field: 'status',
      required: false,
      type: 'string',
      enum: Object.values(ProjectStatus),
    },
    {
      field: 'visibility',
      required: false,
      type: 'string',
      enum: Object.values(ProjectVisibility),
    },
    {
      field: 'settings',
      required: false,
      type: 'object',
    },
    {
      field: 'metadata',
      required: false,
      type: 'object',
    },
    {
      field: 'isFavorite',
      required: false,
      type: 'boolean',
    },
  ],
};

/**
 * 项目导出选项验证模式
 */
export const ProjectExportOptionsSchema: ValidationSchema = {
  rules: [
    {
      field: 'format',
      required: true,
      type: 'string',
      enum: ['json', 'zip', 'pdf', 'png', 'jpg', 'svg'],
    },
    {
      field: 'includeAssets',
      required: true,
      type: 'boolean',
    },
    {
      field: 'includeHistory',
      required: true,
      type: 'boolean',
    },
    {
      field: 'includeComments',
      required: true,
      type: 'boolean',
    },
    {
      field: 'includeMetadata',
      required: true,
      type: 'boolean',
    },
    {
      field: 'compression',
      required: false,
      type: 'string',
      enum: ['none', 'zip', 'gzip'],
    },
    {
      field: 'quality',
      required: false,
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      field: 'scale',
      required: false,
      type: 'number',
      min: 0.1,
      max: 10,
    },
  ],
};

/**
 * 验证项目数据
 */
export function validateProject(project: any): ValidationResult {
  return Validator.validate(project, ProjectSchema);
}

/**
 * 验证项目创建参数
 */
export function validateCreateProjectParams(params: any): ValidationResult {
  return Validator.validate(params, CreateProjectParamsSchema);
}

/**
 * 验证项目更新参数
 */
export function validateUpdateProjectParams(params: any): ValidationResult {
  return Validator.validate(params, UpdateProjectParamsSchema);
}

/**
 * 验证项目设置
 */
export function validateProjectSettings(settings: any): ValidationResult {
  return Validator.validate(settings, ProjectSettingsSchema);
}

/**
 * 验证项目模板
 */
export function validateProjectTemplate(template: any): ValidationResult {
  return Validator.validate(template, ProjectTemplateSchema);
}

/**
 * 验证项目导出选项
 */
export function validateProjectExportOptions(options: any): ValidationResult {
  return Validator.validate(options, ProjectExportOptionsSchema);
}