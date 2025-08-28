/**
 * 模板库相关类型定义
 */

export interface ITemplateMetadata {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'h5';
  category: TemplateCategory;
  tags: string[];

  // 预览信息
  thumbnail?: string;
  previewImages: string[];

  // 模板内容 - 基于设计文档中的数据模型
  editorData?: any; // 实际使用时为 IEditorPaperData

  // 可变参数
  variables: ITemplateVariable[];

  // 元数据
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating?: number;
  author?: string;
  license: 'free' | 'premium' | 'custom';
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface ITemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'image' | 'color';
  defaultValue: any;
  targetObjectIds: string[];
  targetProperty: string;
}

export type TemplateCategory =
  | 'game'
  | 'ui'
  | 'icon'
  | 'background'
  | 'general'
  | 'activity'
  | 'poster'
  | 'banner';

export interface ITemplateCategoryInfo {
  id: TemplateCategory;
  name: string;
  description: string;
  icon?: string;
}

export interface ITemplateSearchOptions {
  query?: string;
  type?: 'design' | 'h5';
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  license?: string[];
  isFavorite?: boolean;
  isCustom?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ITemplateSearchResult {
  templates: ITemplateMetadata[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export type ViewMode = 'grid' | 'list';

export interface ITemplateLibraryPanelProps {
  onTemplateSelect?: (template: ITemplateMetadata) => void;
  onTemplatePreview?: (template: ITemplateMetadata) => void;
  onTemplateApply?: (template: ITemplateMetadata, result?: any) => void;
  onTemplateEdit?: (template: ITemplateMetadata) => void;
  onTemplateSave?: (template: Partial<ITemplateMetadata>) => void;
  onTemplateDelete?: (template: ITemplateMetadata) => void;
  onTemplateExport?: (template: ITemplateMetadata) => void;
  onTemplateDuplicate?: (template: ITemplateMetadata) => void;
  onBatchApply?: (template: ITemplateMetadata) => void;
  className?: string;
  style?: React.CSSProperties;
}
