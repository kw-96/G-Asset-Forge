import type { IEditorPaperData } from '../type';

/**
 * 模板类型枚举
 */
export enum TemplateType {
  /** 设计模式模板 */
  Design = 'design',
  /** H5长图模式模板 */
  H5 = 'h5',
}

/**
 * 模板变量类型枚举
 */
export enum TemplateVariableType {
  /** 文本变量 */
  Text = 'text',
  /** 图片变量 */
  Image = 'image',
  /** 颜色变量 */
  Color = 'color',
}

/**
 * 模板分类接口
 */
export interface TemplateCategory {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 父分类ID */
  parentId?: string;
  /** 模板类型 */
  templateType: TemplateType;
  /** 排序权重 */
  order: number;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 模板变量接口
 */
export interface TemplateVariable {
  /** 变量ID */
  id: string;
  /** 变量名称 */
  name: string;
  /** 变量类型 */
  type: TemplateVariableType;
  /** 默认值 */
  defaultValue: any;
  /** 目标对象ID列表 */
  targetObjectIds: string[];
  /** 目标属性名 */
  targetProperty: string;
  /** 变量描述 */
  description?: string;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  validation?: {
    /** 最小长度（文本） */
    minLength?: number;
    /** 最大长度（文本） */
    maxLength?: number;
    /** 正则表达式（文本） */
    pattern?: string;
    /** 允许的文件类型（图片） */
    allowedTypes?: string[];
    /** 最大文件大小（图片，字节） */
    maxFileSize?: number;
  };
}

/**
 * 模板数据接口
 */
export interface TemplateData {
  /** 模板唯一ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板类型 */
  type: TemplateType;
  /** 分类ID */
  categoryId: string;
  /** 标签列表 */
  tags: string[];

  // 预览信息
  /** 缩略图数据URL */
  thumbnail: string;
  /** 预览图片列表 */
  previewImages: string[];

  // 模板内容
  /** 编辑器数据 */
  editorData: IEditorPaperData;
  /** 可变参数列表 */
  variables: TemplateVariable[];

  // 版本信息
  /** 模板版本 */
  version: string;
  /** 兼容的最低版本 */
  minCompatibleVersion: string;

  // 元数据
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 使用次数 */
  usageCount: number;
  /** 最后使用时间 */
  lastUsed?: Date;

  // 可选的自定义属性
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 模板查询条件
 */
export interface TemplateQueryOptions {
  /** 关键词搜索 */
  keyword?: string;
  /** 模板类型筛选 */
  type?: TemplateType;
  /** 分类ID筛选 */
  categoryId?: string;
  /** 标签筛选 */
  tags?: string[];
  /** 排序字段 */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 分页偏移 */
  offset?: number;
  /** 分页大小 */
  limit?: number;
}

/**
 * 模板查询结果
 */
export interface TemplateQueryResult {
  /** 模板列表 */
  templates: TemplateData[];
  /** 总数量 */
  total: number;
  /** 当前偏移 */
  offset: number;
  /** 分页大小 */
  limit: number;
}

/**
 * 创建模板参数
 */
export interface CreateTemplateParams {
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板类型 */
  type: TemplateType;
  /** 分类ID */
  categoryId: string;
  /** 标签列表 */
  tags?: string[];
  /** 编辑器数据 */
  editorData: IEditorPaperData;
  /** 可变参数列表 */
  variables?: TemplateVariable[];
  /** 缩略图文件 */
  thumbnailFile?: File;
  /** 预览图片文件列表 */
  previewFiles?: File[];
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 更新模板参数
 */
export interface UpdateTemplateParams {
  /** 模板名称 */
  name?: string;
  /** 模板描述 */
  description?: string;
  /** 分类ID */
  categoryId?: string;
  /** 标签列表 */
  tags?: string[];
  /** 编辑器数据 */
  editorData?: IEditorPaperData;
  /** 可变参数列表 */
  variables?: TemplateVariable[];
  /** 缩略图文件 */
  thumbnailFile?: File;
  /** 预览图片文件列表 */
  previewFiles?: File[];
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 模板应用参数
 */
export interface ApplyTemplateParams {
  /** 模板ID */
  templateId: string;
  /** 变量值映射 */
  variableValues: Record<string, any>;
  /** 是否创建新项目 */
  createNewProject?: boolean;
  /** 新项目名称（如果创建新项目） */
  projectName?: string;
}

/**
 * 模板导出数据
 */
export interface TemplateExportData {
  /** 模板数据 */
  template: TemplateData;
  /** 导出版本 */
  exportVersion: string;
  /** 导出时间 */
  exportedAt: Date;
  /** 导出者信息 */
  exportedBy?: string;
}

/**
 * 模板导入结果
 */
export interface TemplateImportResult {
  /** 导入成功的模板 */
  success: TemplateData[];
  /** 导入失败的模板 */
  failed: Array<{
    /** 模板名称 */
    name: string;
    /** 失败原因 */
    reason: string;
  }>;
  /** 版本兼容性警告 */
  warnings: string[];
}
