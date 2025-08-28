/**
 * 项目库相关类型定义
 */

export interface IProjectMetadata {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'h5';
  category: ProjectCategory;
  tags: string[];

  // 文件信息
  filePath?: string;
  fileSize?: number;
  thumbnail?: string;

  // 元数据
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  usageCount?: number;
  isTemplate?: boolean;
  isFavorite?: boolean;
}

export type ProjectCategory = 'h5' | 'design' | 'demo' | 'other';

export interface IProjectCategoryInfo {
  id: ProjectCategory;
  name: string;
  description: string;
  icon?: string;
}

export interface IProjectSearchOptions {
  query?: string;
  type?: 'design' | 'h5';
  category?: ProjectCategory;
  tags?: string[];
  isFavorite?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastOpenedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface IProjectSearchResult {
  projects: IProjectMetadata[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export type ViewMode = 'grid' | 'list';

export interface IProjectLibraryPanelProps {
  onProjectSelect?: (project: IProjectMetadata) => void;
  onProjectOpen?: (project: IProjectMetadata) => void;
  onProjectCreate?: () => void;
  onProjectRename?: (project: IProjectMetadata, newName: string) => void;
  onProjectDelete?: (project: IProjectMetadata) => void;
  onProjectImport?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// 项目标签页相关类型
export interface IProjectTab {
  id: string;
  name: string;
  filePath: string;
  isActive: boolean;
  isDirty: boolean;
  isClosable: boolean;
}

export interface IProjectTabsProps {
  tabs: IProjectTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabsReorder?: (tabs: IProjectTab[]) => void;
  className?: string;
  style?: React.CSSProperties;
}
