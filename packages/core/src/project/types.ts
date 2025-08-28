import { type IEditorPaperData } from '../type';

/**
 * 项目数据接口
 */
export interface ProjectData {
  /** 项目唯一标识符 */
  id: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目类型：设计模式或H5模式 */
  type: 'design' | 'h5';

  /** 编辑器数据 */
  editorData: IEditorPaperData;

  /** 项目设置 */
  settings: ProjectSettings;

  /** 元数据 */
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;

  /** 关联资源 */
  usedAssets: string[];
  usedTemplates: string[];

  /** 项目版本信息 */
  version: string;
  appVersion: string;
}

/**
 * 项目设置接口
 */
export interface ProjectSettings {
  /** 画布宽度 */
  canvasWidth: number;
  /** 画布高度 */
  canvasHeight: number;
  /** 背景颜色 */
  backgroundColor: string;
  /** 导出格式列表 */
  exportFormat: string[];
  /** 导出质量 */
  exportQuality: number;
  /** 网格显示 */
  showGrid: boolean;
  /** 网格大小 */
  gridSize: number;
  /** 标尺显示 */
  showRuler: boolean;
}

/**
 * 项目元数据接口（用于项目列表显示）
 */
export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'h5';
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
  fileSize: number;
}

/**
 * 项目备份数据接口
 */
export interface ProjectBackup {
  id: string;
  projectId: string;
  name: string;
  data: ProjectData;
  createdAt: Date;
  isAutoBackup: boolean;
}

/**
 * 项目存储配置接口
 */
export interface ProjectStorageConfig {
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: number;
  /** 最大备份数量 */
  maxBackupCount: number;
  /** 是否启用自动备份 */
  enableAutoBackup: boolean;
  /** 自动备份间隔（毫秒） */
  autoBackupInterval: number;
}

/**
 * 项目创建参数接口
 */
export interface CreateProjectParams {
  name: string;
  description?: string;
  type: 'design' | 'h5';
  settings?: Partial<ProjectSettings>;
  templateId?: string;
}

/**
 * 项目更新参数接口
 */
export interface UpdateProjectParams {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
  editorData?: IEditorPaperData;
  usedAssets?: string[];
  usedTemplates?: string[];
}
