/**
 * 项目状态管理 - 管理项目的创建、保存、加载等操作
 * @description 管理项目文件、项目历史、项目设置等状态
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CanvasElement } from '../../interfaces/types/canvas';

/**
 * 项目状态枚举
 * @description 定义项目的各种状态
 */
export type ProjectStatus = 
  | 'new'         // 新建项目
  | 'saved'       // 已保存
  | 'modified'    // 已修改
  | 'saving'      // 保存中
  | 'loading'     // 加载中
  | 'error';      // 错误状态

/**
 * 项目类型枚举
 * @description 定义项目的类型分类
 */
export type ProjectType = 
  | 'game-asset'    // 游戏素材
  | 'ui-design'     // UI设计
  | 'icon-set'      // 图标集
  | 'illustration'  // 插画
  | 'template'      // 模板
  | 'other';        // 其他

/**
 * 导出格式枚举
 * @description 定义支持的导出格式
 */
export type ExportFormat = 
  | 'png' | 'jpg' | 'webp' | 'svg'  // 图片格式
  | 'pdf'                           // PDF格式
  | 'json'                          // JSON数据
  | 'zip';                          // 压缩包

/**
 * 项目设置接口
 * @description 定义项目的配置设置
 */
export interface ProjectSettings {
  // 画布设置
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  
  // 网格设置
  gridEnabled: boolean;
  gridSize: number;
  gridColor: string;
  snapToGrid: boolean;
  
  // 标尺设置
  rulersEnabled: boolean;
  rulerUnits: 'px' | 'mm' | 'cm' | 'in';
  
  // 导出设置
  defaultExportFormat: ExportFormat;
  exportQuality: number;
  exportScale: number;
  
  // 自动保存设置
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // 分钟
  
  // 历史记录设置
  maxHistorySteps: number;
  
  // 性能设置
  enableGPUAcceleration: boolean;
  maxTextureSize: number;
}

/**
 * 项目元数据接口
 * @description 定义项目的元数据信息
 */
export interface ProjectMetadata {
  assets(assets: any): unknown;
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  tags: string[];
  
  // 版本信息
  version: string;
  appVersion: string;
  
  // 时间信息
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  
  // 作者信息
  author: string;
  collaborators: string[];
  
  // 文件信息
  filePath?: string;
  fileSize: number;
  
  // 统计信息
  elementCount: number;
  layerCount: number;
  assetCount: number;
  
  // 缩略图
  thumbnailUrl?: string;
}

/**
 * 项目历史记录接口
 * @description 定义项目的历史版本记录
 */
export interface ProjectHistory {
  id: string;
  projectId: string;
  timestamp: string;
  action: string;
  description: string;
  elementCount: number;
  fileSize: number;
  thumbnailUrl?: string;
}

/**
 * 项目接口
 * @description 定义完整的项目数据结构
 */
export interface Project {
  id: any;
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  elements: Record<string, CanvasElement>;
  layers: string[]; // 图层顺序
  selectedElements: string[];
  
  // 项目状态
  status: ProjectStatus;
  hasUnsavedChanges: boolean;
  lastSavedAt?: string;
  
  // 导出历史
  exportHistory: {
    timestamp: string;
    format: ExportFormat;
    settings: any;
    filePath: string;
  }[];
}

/**
 * 最近项目接口
 * @description 定义最近打开的项目信息
 */
export interface RecentProject {
  createdAt: string | number | Date;
  description: string;
  id: string;
  name: string;
  filePath: string;
  lastOpenedAt: string;
  thumbnailUrl?: string;
  type: ProjectType;
}

/**
 * 项目模板接口
 * @description 定义项目模板的结构
 */
export interface ProjectTemplate {
  assets: any;
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  category: string;
  thumbnailUrl: string;
  previewImages: string[];
  settings: ProjectSettings;
  elements: Record<string, CanvasElement>;
  tags: string[];
  isBuiltin: boolean;
  downloadCount: number;
  rating: number;
}

/**
 * 项目状态接口
 * @description 定义项目状态管理的完整接口
 */
export interface ProjectState {
  loadProject(projectId: string): unknown;
  // 当前项目
  currentProject: Project | null;
  
  // 项目列表
  recentProjects: RecentProject[];
  maxRecentCount: number;
  
  // 项目模板
  templates: Record<string, ProjectTemplate>;
  
  // 项目历史
  projectHistory: ProjectHistory[];
  
  // UI状态
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  showUnsavedWarning: boolean;
  
  // 自动保存
  autoSaveTimer: ReturnType<typeof setInterval> | null;
  lastAutoSave?: string;
  
  // 项目操作方法
  createProject: (name: string, type: ProjectType, template?: string) => Promise<void>;
  openProject: (filePath: string) => Promise<void>;
  saveProject: (filePath?: string) => Promise<void>;
  saveProjectAs: (filePath: string) => Promise<void>;
  closeProject: () => Promise<boolean>; // 返回是否成功关闭
  
  // 项目信息更新
  updateProjectMetadata: (updates: Partial<ProjectMetadata>) => void;
  updateProjectSettings: (updates: Partial<ProjectSettings>) => void;
  setProjectStatus: (status: ProjectStatus) => void;
  markAsModified: () => void;
  
  // 元素管理
  addElementToProject: (element: CanvasElement) => void;
  updateElementInProject: (id: string, updates: Partial<CanvasElement>) => void;
  removeElementFromProject: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  
  // 选择管理
  selectElementsInProject: (elementIds: string[]) => void;
  clearProjectSelection: () => void;
  
  // 最近项目管理
  addToRecentProjects: (project: RecentProject) => void;
  removeFromRecentProjects: (projectId: string) => void;
  clearRecentProjects: () => void;
  getRecentProjects: () => RecentProject[];
  
  // 模板管理
  loadTemplates: () => Promise<void>;
  createTemplate: (name: string, description: string) => Promise<string>;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string) => void;
  
  // 导出功能
  exportProject: (format: ExportFormat, options?: any) => Promise<void>;
  exportElements: (elementIds: string[], format: ExportFormat, options?: any) => Promise<void>;
  getExportHistory: () => Project['exportHistory'];
  
  // 历史记录
  addToProjectHistory: (action: string, description: string) => void;
  getProjectHistory: (projectId?: string) => ProjectHistory[];
  clearProjectHistory: (projectId?: string) => void;
  
  // 自动保存
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  performAutoSave: () => Promise<void>;
  
  // 项目验证
  validateProject: (project: Project) => { isValid: boolean; errors: string[] };
  
  // 项目统计
  getProjectStats: () => {
    totalProjects: number;
    projectsByType: Record<ProjectType, number>;
    totalElements: number;
    totalFileSize: number;
    averageElementsPerProject: number;
  };
  
  // 初始化和重置
  initializeProjects: () => Promise<void>;
  resetProjectStore: () => void;
}

/**
 * 默认项目设置
 */
const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  canvasWidth: 1920,
  canvasHeight: 1080,
  backgroundColor: '#ffffff',
  gridEnabled: true,
  gridSize: 20,
  gridColor: '#e5e7eb',
  snapToGrid: false,
  rulersEnabled: true,
  rulerUnits: 'px',
  defaultExportFormat: 'png',
  exportQuality: 90,
  exportScale: 1,
  autoSaveEnabled: true,
  autoSaveInterval: 5,
  maxHistorySteps: 50,
  enableGPUAcceleration: true,
  maxTextureSize: 4096,
};

/**
 * 内置项目模板
 */
const BUILTIN_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'mobile-game-ui',
    name: '手机游戏UI',
    description: '适用于手机游戏的UI界面模板',
    type: 'ui-design',
    category: 'game',
    thumbnailUrl: '/templates/mobile-game-ui-thumb.jpg',
    previewImages: ['/templates/mobile-game-ui-preview.jpg'],
    settings: {
      ...DEFAULT_PROJECT_SETTINGS,
      canvasWidth: 1080,
      canvasHeight: 1920,
    },
    elements: {},
    tags: ['mobile', 'game', 'ui', 'portrait'],
    isBuiltin: true,
    downloadCount: 0,
    rating: 4.5,
    assets: (assets: any) => assets,
  },
  {
    id: 'icon-set-template',
    name: '图标集模板',
    description: '用于创建一致风格图标集的模板',
    type: 'icon-set',
    category: 'icon',
    thumbnailUrl: '/templates/icon-set-thumb.jpg',
    previewImages: ['/templates/icon-set-preview.jpg'],
    settings: {
      ...DEFAULT_PROJECT_SETTINGS,
      canvasWidth: 1024,
      canvasHeight: 1024,
      gridSize: 32,
    },
    elements: {},
    tags: ['icon', 'set', 'grid', 'consistent'],
    isBuiltin: true,
    downloadCount: 0,
    rating: 4.2,
    assets: (assets: any) => assets,
  },
  {
    id: 'game-character-sheet',
    name: '游戏角色表',
    description: '游戏角色设计和动画帧模板',
    type: 'game-asset',
    category: 'character',
    thumbnailUrl: '/templates/character-sheet-thumb.jpg',
    previewImages: ['/templates/character-sheet-preview.jpg'],
    settings: {
      ...DEFAULT_PROJECT_SETTINGS,
      canvasWidth: 2048,
      canvasHeight: 1024,
      backgroundColor: '#f0f0f0',
    },
    elements: {},
    tags: ['character', 'animation', 'sprite', 'game'],
    isBuiltin: true,
    downloadCount: 0,
    rating: 4.7,
    assets: (assets: any) => assets,
  },
];

/**
 * 项目状态存储Hook
 * @description 创建并导出项目状态管理Hook
 * @returns 项目状态存储实例
 * @example
 * const { currentProject, createProject, saveProject } = useProjectStore();
 */
export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      currentProject: null,
      recentProjects: [],
      maxRecentCount: 10,
      templates: BUILTIN_TEMPLATES.reduce((acc, template) => {
        acc[template.id] = template;
        return acc;
      }, {} as Record<string, ProjectTemplate>),
      projectHistory: [],
      isLoading: false,
      isSaving: false,
      isExporting: false,
      showUnsavedWarning: false,
      autoSaveTimer: null,
      
      // 项目操作方法
      createProject: async (name: string, type: ProjectType, templateId?: string) => {
        set({ isLoading: true });
        
        try {
          const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          // 获取模板设置
          let settings = DEFAULT_PROJECT_SETTINGS;
          let elements: Record<string, CanvasElement> = {};
          
          if (templateId) {
            const template = get().templates[templateId];
            if (template) {
              settings = { ...template.settings };
              elements = { ...template.elements };
              console.info(`[project-store] 使用模板创建项目: ${template.name}`);
            }
          }
          
          const project: Project = {
            id: projectId,
            metadata: {
              id: projectId,
              name,
              description: '',
              type,
              tags: [],
              version: '1.0.0',
              appVersion: '1.0.0',
              createdAt: now,
              updatedAt: now,
              author: 'User',
              collaborators: [],
              fileSize: 0,
              elementCount: Object.keys(elements).length,
              layerCount: 1,
              assetCount: 0,
              assets: (assets: any) => assets,
            },
            settings,
            elements,
            layers: Object.keys(elements),
            selectedElements: [],
            status: 'new',
            hasUnsavedChanges: false,
            exportHistory: [],
          };
          
          set({
            currentProject: project,
            isLoading: false,
          });
          
          // 启用自动保存
          if (settings.autoSaveEnabled) {
            get().enableAutoSave();
          }
          
          // 添加到历史记录
          get().addToProjectHistory('create', `创建项目: ${name}`);
          
          console.info(`[project-store] 创建项目: ${name}`, { id: projectId, type, templateId });
          
        } catch (error) {
          console.error('[project-store] 创建项目失败:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      openProject: async (filePath: string) => {
        set({ isLoading: true });
        
        try {
          console.info(`[project-store] 打开项目: ${filePath}`);
          
          // 模拟文件加载
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 这里应该从文件系统加载项目数据
          // 现在使用模拟数据
          const projectId = `project-${Date.now()}`;
          const now = new Date().toISOString();
          
          const project: Project = {
            id: projectId,
            metadata: {
              id: projectId,
              name: '示例项目',
              description: '从文件加载的示例项目',
              type: 'game-asset',
              tags: ['example', 'loaded'],
              version: '1.0.0',
              appVersion: '1.0.0',
              createdAt: now,
              updatedAt: now,
              lastOpenedAt: now,
              author: 'User',
              collaborators: [],
              filePath,
              fileSize: 1024000,
              elementCount: 0,
              layerCount: 1,
              assetCount: 0,
              assets: (assets: any) => assets,
            },
            settings: DEFAULT_PROJECT_SETTINGS,
            elements: {},
            layers: [],
            selectedElements: [],
            status: 'saved',
            hasUnsavedChanges: false,
            exportHistory: [],
          };
          
          set({
            currentProject: project,
            isLoading: false,
          });
          
          // 添加到最近项目
          get().addToRecentProjects({
            id: projectId,
            name: project.metadata.name,
            filePath,
            lastOpenedAt: now,
            type: project.metadata.type,
            createdAt: new Date().toISOString(),
            description: ''
          });
          
          // 启用自动保存
          if (project.settings.autoSaveEnabled) {
            get().enableAutoSave();
          }
          
          // 添加到历史记录
          get().addToProjectHistory('open', `打开项目: ${project.metadata.name}`);
          
          console.info(`[project-store] 项目打开成功: ${project.metadata.name}`);
          
        } catch (error) {
          console.error('[project-store] 打开项目失败:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      loadProject: async (projectId: string) => {
        set({ isLoading: true });
        
        try {
          console.info(`[project-store] 加载项目: ${projectId}`);
          
          // 模拟文件加载过程
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 这里应该从文件系统或数据库加载项目数据
          // 现在使用模拟数据
          const now = new Date().toISOString();
          
          const project: Project = {
            id: projectId,
            metadata: {
              id: projectId,
              name: '加载的项目',
              description: '通过loadProject方法加载的项目',
              type: 'game-asset',
              tags: ['loaded', 'example'],
              version: '1.0.0',
              appVersion: '1.0.0',
              createdAt: now,
              updatedAt: now,
              lastOpenedAt: now,
              author: 'User',
              collaborators: [],
              filePath: `./projects/${projectId}.gaf`,
              fileSize: 2048000,
              elementCount: 0,
              layerCount: 1,
              assetCount: 0,
              assets: (assets: any) => assets,
            },
            settings: DEFAULT_PROJECT_SETTINGS,
            elements: {},
            layers: [],
            selectedElements: [],
            status: 'saved',
            hasUnsavedChanges: false,
            exportHistory: [],
          };
          
          set({
            currentProject: project,
            isLoading: false,
          });
          
          // 添加到最近项目
          get().addToRecentProjects({
            id: projectId,
            name: project.metadata.name,
            filePath: project.metadata.filePath || '',
            lastOpenedAt: now,
            type: project.metadata.type,
            createdAt: project.metadata.createdAt,
            description: project.metadata.description
          });
          
          // 启用自动保存
          if (project.settings.autoSaveEnabled) {
            get().enableAutoSave();
          }
          
          // 添加到历史记录
          get().addToProjectHistory('load', `加载项目: ${project.metadata.name}`);
          
          console.info(`[project-store] 项目加载成功: ${project.metadata.name}`);
          
          return project;
          
        } catch (error) {
          console.error('[project-store] 加载项目失败:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      saveProject: async (filePath?: string) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可保存');
          return;
        }
        
        set({ isSaving: true });
        
        try {
          const saveFilePath = filePath || project.metadata.filePath;
          
          if (!saveFilePath) {
            throw new Error('没有指定保存路径');
          }
          
          console.info(`[project-store] 保存项目: ${saveFilePath}`);
          
          // 模拟保存过程
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const now = new Date().toISOString();
          const updatedProject: Project = {
            ...project,
            metadata: {
              ...project.metadata,
              filePath: saveFilePath,
              updatedAt: now,
              fileSize: JSON.stringify(project).length,
            },
            status: 'saved',
            hasUnsavedChanges: false,
            lastSavedAt: now,
          };
          
          set({
            currentProject: updatedProject,
            isSaving: false,
          });
          
          // 更新最近项目
          get().addToRecentProjects({
            id: project.metadata.id,
            name: project.metadata.name,
            filePath: saveFilePath,
            lastOpenedAt: now,
            type: project.metadata.type,
            createdAt: new Date().toISOString(),
            description: ''
          });
          
          // 添加到历史记录
          get().addToProjectHistory('save', `保存项目: ${project.metadata.name}`);
          
          console.info(`[project-store] 项目保存成功: ${project.metadata.name}`);
          
        } catch (error) {
          console.error('[project-store] 保存项目失败:', error);
          set({ isSaving: false });
          throw error;
        }
      },
      
      saveProjectAs: async (filePath: string) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可另存为');
          return;
        }
        
        await get().saveProject(filePath);
      },
      
      closeProject: async () => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return true; // 没有项目，直接返回成功
        }
        
        // 检查是否有未保存的更改
        if (project.hasUnsavedChanges) {
          set({ showUnsavedWarning: true });
          
          // 这里应该显示确认对话框
          // 现在直接返回false，表示用户取消了关闭操作
          console.warn('[project-store] 项目有未保存的更改，需要用户确认');
          return false;
        }
        
        // 禁用自动保存
        get().disableAutoSave();
        
        // 清除当前项目
        set({
          currentProject: null,
          showUnsavedWarning: false,
        });
        
        // 添加到历史记录
        get().addToProjectHistory('close', `关闭项目: ${project.metadata.name}`);
        
        console.info(`[project-store] 项目关闭: ${project.metadata.name}`);
        
        return true;
      },
      
      // 项目信息更新
      updateProjectMetadata: (updates: Partial<ProjectMetadata>) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可更新元数据');
          return;
        }
        
        const updatedProject: Project = {
          ...project,
          metadata: {
            ...project.metadata,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.debug('[project-store] 更新项目元数据', { updatedKeys: Object.keys(updates) });
      },
      
      updateProjectSettings: (updates: Partial<ProjectSettings>) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可更新设置');
          return;
        }
        
        const updatedProject: Project = {
          ...project,
          settings: {
            ...project.settings,
            ...updates,
          },
          metadata: {
            ...project.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        // 如果自动保存设置发生变化，更新自动保存状态
        if ('autoSaveEnabled' in updates) {
          if (updates.autoSaveEnabled) {
            get().enableAutoSave();
          } else {
            get().disableAutoSave();
          }
        }
        
        console.debug('[project-store] 更新项目设置', { updatedKeys: Object.keys(updates) });
      },
      
      setProjectStatus: (status: ProjectStatus) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return;
        }
        
        if (project.status !== status) {
          const updatedProject: Project = {
            ...project,
            status,
          };
          
          set({ currentProject: updatedProject });
          
          console.debug(`[project-store] 项目状态变更: ${project.status} -> ${status}`);
        }
      },
      
      markAsModified: () => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return;
        }
        
        if (!project.hasUnsavedChanges) {
          const updatedProject: Project = {
            ...project,
            hasUnsavedChanges: true,
            status: 'modified',
            metadata: {
              ...project.metadata,
              updatedAt: new Date().toISOString(),
            },
          };
          
          set({ currentProject: updatedProject });
          
          console.debug('[project-store] 项目标记为已修改');
        }
      },
      
      // 元素管理
      addElementToProject: (element: CanvasElement) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可添加元素');
          return;
        }
        
        const updatedProject: Project = {
          ...project,
          elements: {
            ...project.elements,
            [element.id]: element,
          },
          layers: [...project.layers, element.id],
          metadata: {
            ...project.metadata,
            elementCount: project.metadata.elementCount + 1,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.debug(`[project-store] 添加元素到项目: ${element.name}`, { id: element.id });
      },
      
      updateElementInProject: (id: string, updates: Partial<CanvasElement>) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project || !project.elements[id]) {
          console.warn(`[project-store] 尝试更新不存在的项目元素: ${id}`);
          return;
        }
        
        const updatedElement = { ...project.elements[id], ...updates };
        const updatedElements: Record<string, CanvasElement> = {
          ...project.elements,
          [id]: updatedElement as CanvasElement,
        };
        const updatedProject: Project = {
          ...project,
          elements: updatedElements,
          metadata: {
            ...project.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.debug(`[project-store] 更新项目元素: ${id}`, { updatedKeys: Object.keys(updates) });
      },
      
      removeElementFromProject: (id: string) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project || !project.elements[id]) {
          console.warn(`[project-store] 尝试删除不存在的项目元素: ${id}`);
          return;
        }
        
        const newElements = { ...project.elements };
        delete newElements[id];
        
        const updatedProject: Project = {
          ...project,
          elements: newElements,
          layers: project.layers.filter(layerId => layerId !== id),
          selectedElements: project.selectedElements.filter(selectedId => selectedId !== id),
          metadata: {
            ...project.metadata,
            elementCount: project.metadata.elementCount - 1,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.debug(`[project-store] 从项目删除元素: ${id}`);
      },
      
      reorderElements: (elementIds: string[]) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可重新排序元素');
          return;
        }
        
        // 验证所有元素ID都存在
        const validIds = elementIds.filter(id => project.elements[id]);
        
        if (validIds.length !== elementIds.length) {
          console.warn('[project-store] 重新排序包含不存在的元素ID');
        }
        
        const updatedProject: Project = {
          ...project,
          layers: validIds,
          metadata: {
            ...project.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.debug('[project-store] 重新排序项目元素', { count: validIds.length });
      },
      
      // 选择管理
      selectElementsInProject: (elementIds: string[]) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return;
        }
        
        // 验证所有元素ID都存在
        const validIds = elementIds.filter(id => project.elements[id]);
        
        if (JSON.stringify(project.selectedElements) !== JSON.stringify(validIds)) {
          const updatedProject: Project = {
            ...project,
            selectedElements: validIds,
          };
          
          set({ currentProject: updatedProject });
          
          console.debug('[project-store] 选择项目元素', { count: validIds.length });
        }
      },
      
      clearProjectSelection: () => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return;
        }
        
        if (project.selectedElements.length > 0) {
          const updatedProject: Project = {
            ...project,
            selectedElements: [],
          };
          
          set({ currentProject: updatedProject });
          
          console.debug('[project-store] 清除项目选择');
        }
      },
      
      // 最近项目管理
      addToRecentProjects: (project: RecentProject) => {
        const state = get();
        
        // 移除已存在的相同项目
        const filteredRecent = state.recentProjects.filter(p => p.id !== project.id);
        
        // 添加到开头
        const newRecentProjects = [project, ...filteredRecent]
          .slice(0, state.maxRecentCount);
        
        set({ recentProjects: newRecentProjects });
        
        // 保存到本地存储
        try {
          localStorage.setItem('recent-projects', JSON.stringify(newRecentProjects));
        } catch (error) {
          console.warn('[project-store] 保存最近项目到本地存储失败:', error);
        }
        
        console.debug(`[project-store] 添加到最近项目: ${project.name}`);
      },
      
      removeFromRecentProjects: (projectId: string) => {
        const state = get();
        
        const newRecentProjects = state.recentProjects.filter(p => p.id !== projectId);
        
        set({ recentProjects: newRecentProjects });
        
        // 保存到本地存储
        try {
          localStorage.setItem('recent-projects', JSON.stringify(newRecentProjects));
        } catch (error) {
          console.warn('[project-store] 保存最近项目到本地存储失败:', error);
        }
        
        console.debug(`[project-store] 从最近项目移除: ${projectId}`);
      },
      
      clearRecentProjects: () => {
        set({ recentProjects: [] });
        
        // 清除本地存储
        try {
          localStorage.removeItem('recent-projects');
        } catch (error) {
          console.warn('[project-store] 清除本地存储的最近项目失败:', error);
        }
        
        console.info('[project-store] 清除所有最近项目');
      },
      
      getRecentProjects: () => {
        const state = get();
        return state.recentProjects;
      },
      
      // 模板管理
      loadTemplates: async () => {
        try {
          console.info('[project-store] 加载项目模板');
          
          // 这里可以从服务器或本地文件加载更多模板
          // 现在使用内置模板
          
          const templates = BUILTIN_TEMPLATES.reduce((acc, template) => {
            acc[template.id] = template;
            return acc;
          }, {} as Record<string, ProjectTemplate>);
          
          set({ templates });
          
          console.info(`[project-store] 模板加载完成`, { count: Object.keys(templates).length });
          
        } catch (error) {
          console.error('[project-store] 加载模板失败:', error);
        }
      },
      
      createTemplate: async (name: string, description: string) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          throw new Error('没有当前项目可创建模板');
        }
        
        const templateId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const template: ProjectTemplate = {
          id: templateId,
          name,
          description,
          type: project.metadata.type,
          category: 'custom',
          thumbnailUrl: '',
          previewImages: [],
          settings: { ...project.settings },
          elements: { ...project.elements },
          tags: [...project.metadata.tags],
          isBuiltin: false,
          downloadCount: 0,
          rating: 0,
          assets: (assets: any) => assets
        };
        
        const newTemplates = {
          ...state.templates,
          [templateId]: template,
        };
        
        set({ templates: newTemplates });
        
        console.info(`[project-store] 创建模板: ${name}`, { id: templateId });
        
        return templateId;
      },
      
      deleteTemplate: (templateId: string) => {
        const state = get();
        const template = state.templates[templateId];
        
        if (!template) {
          console.warn(`[project-store] 尝试删除不存在的模板: ${templateId}`);
          return;
        }
        
        if (template.isBuiltin) {
          console.warn(`[project-store] 不能删除内置模板: ${templateId}`);
          return;
        }
        
        const newTemplates = { ...state.templates };
        delete newTemplates[templateId];
        
        set({ templates: newTemplates });
        
        console.info(`[project-store] 删除模板: ${template.name}`, { id: templateId });
      },
      
      applyTemplate: (templateId: string) => {
        const state = get();
        const template = state.templates[templateId];
        const project = state.currentProject;
        
        if (!template) {
          console.warn(`[project-store] 尝试应用不存在的模板: ${templateId}`);
          return;
        }
        
        if (!project) {
          console.warn('[project-store] 没有当前项目可应用模板');
          return;
        }
        
        const updatedProject: Project = {
          ...project,
          settings: { ...template.settings },
          elements: { ...template.elements },
          layers: Object.keys(template.elements),
          selectedElements: [],
          metadata: {
            ...project.metadata,
            elementCount: Object.keys(template.elements).length,
            updatedAt: new Date().toISOString(),
          },
        };
        
        set({ currentProject: updatedProject });
        get().markAsModified();
        
        console.info(`[project-store] 应用模板: ${template.name}`, { templateId });
      },
      
      // 导出功能
      exportProject: async (format: ExportFormat, options: any = {}) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          throw new Error('没有当前项目可导出');
        }
        
        set({ isExporting: true });
        
        try {
          console.info(`[project-store] 导出项目: ${format}`, { options });
          
          // 模拟导出过程
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const exportRecord = {
            timestamp: new Date().toISOString(),
            format,
            settings: options,
            filePath: `${project.metadata.name}.${format}`,
          };
          
          const updatedProject: Project = {
            ...project,
            exportHistory: [...project.exportHistory, exportRecord],
          };
          
          set({
            currentProject: updatedProject,
            isExporting: false,
          });
          
          // 添加到历史记录
          get().addToProjectHistory('export', `导出项目为 ${format.toUpperCase()}`);
          
          console.info(`[project-store] 项目导出完成: ${format}`);
          
        } catch (error) {
          console.error('[project-store] 项目导出失败:', error);
          set({ isExporting: false });
          throw error;
        }
      },
      
      exportElements: async (elementIds: string[], format: ExportFormat, options: any = {}) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          throw new Error('没有当前项目可导出元素');
        }
        
        const validIds = elementIds.filter(id => project.elements[id]);
        
        if (validIds.length === 0) {
          throw new Error('没有有效的元素可导出');
        }
        
        set({ isExporting: true });
        
        try {
          console.info(`[project-store] 导出元素: ${format}`, { count: validIds.length, options });
          
          // 模拟导出过程
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ isExporting: false });
          
          // 添加到历史记录
          get().addToProjectHistory('export-elements', `导出 ${validIds.length} 个元素为 ${format.toUpperCase()}`);
          
          console.info(`[project-store] 元素导出完成: ${format}`);
          
        } catch (error) {
          console.error('[project-store] 元素导出失败:', error);
          set({ isExporting: false });
          throw error;
        }
      },
      
      getExportHistory: () => {
        const state = get();
        const project = state.currentProject;
        
        return project ? project.exportHistory : [];
      },
      
      // 历史记录
      addToProjectHistory: (action: string, description: string) => {
        const state = get();
        const project = state.currentProject;
        
        if (!project) {
          return;
        }
        
        const historyEntry: ProjectHistory = {
          id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: project.metadata.id,
          timestamp: new Date().toISOString(),
          action,
          description,
          elementCount: project.metadata.elementCount,
          fileSize: JSON.stringify(project).length,
        };
        
        const newHistory = [...state.projectHistory, historyEntry];
        
        // 限制历史记录数量
        const maxHistory = 100;
        if (newHistory.length > maxHistory) {
          newHistory.splice(0, newHistory.length - maxHistory);
        }
        
        set({ projectHistory: newHistory });
        
        console.debug(`[project-store] 添加项目历史记录: ${action}`);
      },
      
      getProjectHistory: (projectId?: string) => {
        const state = get();
        
        if (projectId) {
          return state.projectHistory.filter(entry => entry.projectId === projectId);
        }
        
        return state.projectHistory;
      },
      
      clearProjectHistory: (projectId?: string) => {
        const state = get();
        
        if (projectId) {
          const filteredHistory = state.projectHistory.filter(entry => entry.projectId !== projectId);
          set({ projectHistory: filteredHistory });
          console.info(`[project-store] 清除项目历史记录: ${projectId}`);
        } else {
          set({ projectHistory: [] });
          console.info('[project-store] 清除所有项目历史记录');
        }
      },
      
      // 自动保存
      enableAutoSave: () => {
        const state = get();
        
        // 清除现有定时器
        if (state.autoSaveTimer) {
          clearInterval(state.autoSaveTimer);
        }
        
        const project = state.currentProject;
        if (!project || !project.settings.autoSaveEnabled) {
          return;
        }
        
        const interval = project.settings.autoSaveInterval * 60 * 1000; // 转换为毫秒
        
        const timer = setInterval(() => {
          get().performAutoSave();
        }, interval);
        
        set({ autoSaveTimer: timer });
        
        console.info(`[project-store] 启用自动保存，间隔: ${project.settings.autoSaveInterval} 分钟`);
      },
      
      disableAutoSave: () => {
        const state = get();
        
        if (state.autoSaveTimer) {
          clearInterval(state.autoSaveTimer);
          set({ autoSaveTimer: null });
          console.info('[project-store] 禁用自动保存');
        }
      },
      
      performAutoSave: async () => {
        const state = get();
        const project = state.currentProject;
        
        if (!project || !project.hasUnsavedChanges || state.isSaving) {
          return;
        }
        
        try {
          console.debug('[project-store] 执行自动保存');
          
          await get().saveProject();
          
          set({ lastAutoSave: new Date().toISOString() });
          
        } catch (error) {
          console.error('[project-store] 自动保存失败:', error);
        }
      },
      
      // 项目验证
      validateProject: (project: Project) => {
        const errors: string[] = [];
        
        // 验证基本信息
        if (!project.metadata.name.trim()) {
          errors.push('项目名称不能为空');
        }
        
        if (!project.metadata.id) {
          errors.push('项目ID不能为空');
        }
        
        // 验证设置
        if (project.settings.canvasWidth <= 0 || project.settings.canvasHeight <= 0) {
          errors.push('画布尺寸必须大于0');
        }
        
        if (project.settings.exportQuality < 1 || project.settings.exportQuality > 100) {
          errors.push('导出质量必须在1-100之间');
        }
        
        // 验证元素
        // const elementIds = Object.keys(project.elements);
        const layerIds = project.layers;
        
        // 检查图层中的元素是否都存在
        const missingElements = layerIds.filter(id => !project.elements[id]);
        if (missingElements.length > 0) {
          errors.push(`图层中包含不存在的元素: ${missingElements.join(', ')}`);
        }
        
        // 检查选中的元素是否都存在
        const missingSelected = project.selectedElements.filter(id => !project.elements[id]);
        if (missingSelected.length > 0) {
          errors.push(`选中的元素不存在: ${missingSelected.join(', ')}`);
        }
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      },
      
      // 项目统计
      getProjectStats: () => {
        const state = get();
        const recentProjects = state.recentProjects;
        
        const projectsByType = recentProjects.reduce((acc, project) => {
          acc[project.type] = (acc[project.type] || 0) + 1;
          return acc;
        }, {} as Record<ProjectType, number>);
        
        let totalElements = 0;
        let totalFileSize = 0;
        
        if (state.currentProject) {
          totalElements = state.currentProject.metadata.elementCount;
          totalFileSize = state.currentProject.metadata.fileSize;
        }
        
        const averageElementsPerProject = recentProjects.length > 0 
          ? totalElements / recentProjects.length 
          : 0;
        
        return {
          totalProjects: recentProjects.length,
          projectsByType,
          totalElements,
          totalFileSize,
          averageElementsPerProject,
        };
      },
      
      // 初始化和重置
      initializeProjects: async () => {
        console.info('[project-store] 初始化项目系统');
        
        try {
          // 从本地存储加载最近项目
          const savedRecentProjects = localStorage.getItem('recent-projects');
          if (savedRecentProjects) {
            const recentProjects = JSON.parse(savedRecentProjects);
            set({ recentProjects });
            console.info(`[project-store] 加载最近项目: ${recentProjects.length} 个`);
          }
          
          // 加载模板
          await get().loadTemplates();
          
        } catch (error) {
          console.error('[project-store] 项目系统初始化失败:', error);
        }
      },
      
      resetProjectStore: () => {
        console.info('[project-store] 重置项目存储');
        
        // 禁用自动保存
        get().disableAutoSave();
        
        set({
          currentProject: null,
          recentProjects: [],
          templates: BUILTIN_TEMPLATES.reduce((acc, template) => {
            acc[template.id] = template;
            return acc;
          }, {} as Record<string, ProjectTemplate>),
          projectHistory: [],
          isLoading: false,
          isSaving: false,
          isExporting: false,
          showUnsavedWarning: false,
          autoSaveTimer: null,
          lastAutoSave: '',
        });
        
        // 清除本地存储
        localStorage.removeItem('recent-projects');
      },
    }),
    {
      name: 'gaf-project-store',
    }
  )
);