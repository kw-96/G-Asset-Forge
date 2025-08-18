/**
 * 项目管理器 - 统一管理项目的创建、保存、加载等功能
 * @description 协调项目存储、历史记录、模板管理等功能
 * @author 开发团队
 */

import { useProjectStore } from '../../../stores/projectStore';
import { useAppStore } from '../../../stores/appStore';
import type { 
  Project, 
  ProjectType, 
  ProjectStatus,
  ProjectMetadata,
  ProjectSettings,
  RecentProject,
  ProjectTemplate,
  ExportFormat
} from '../../../stores/projectStore';
import type { CanvasElement } from '../../../../interfaces/types/canvas';

// 重新导出类型以供UI组件使用
export type { 
  Project,
  ProjectSettings,
  ProjectTemplate,
  ProjectType,
  RecentProject,
  ExportFormat,
  ProjectMetadata,
  ProjectStatus
};

/**
 * 项目事件类型
 */
export type ProjectEvent = 
  | 'project-created'
  | 'project-opened'
  | 'project-saved'
  | 'project-closed'
  | 'project-modified'
  | 'project-exported'
  | 'template-applied'
  | 'auto-save-completed'
  | 'project-error';

/**
 * 项目事件监听器
 */
export type ProjectEventListener = (event: ProjectEvent, data?: any) => void;

/**
 * 项目操作结果接口
 */
export interface ProjectOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 项目数据接口（兼容UI组件）
 */
export interface ProjectData extends Project {
  // 兼容UI组件的额外属性
}

/**
 * 项目元数据兼容接口（用于UI组件）
 */
export interface ProjectItemMeta {
  id: string;
  name: string;
  description?: string;
  category?: string;
  updatedAt: string;
  createdAt?: string;
  lastOpenedAt?: string;
  thumbnail?: string;
  tags?: string[];
  filePath?: string;
  isTemplate?: boolean;
}

/**
 * 项目创建选项接口
 */
export interface ProjectCreateOptions {
  name: string;
  description?: string;
  template?: string | undefined;
  settings?: Partial<ProjectSettings>;
}

/**
 * 项目验证结果接口
 */
export interface ProjectValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 项目管理器类
 * @description 提供项目系统的统一管理接口
 */
export class ProjectManager {
  /**
   * 加载项目
   */
  public async loadProject(projectId: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    if (!projectId.trim()) {
      return { success: false, message: '项目ID不能为空' };
    }

    try {
      const projectStore = useProjectStore.getState();
      
      // 如果有当前项目且有未保存更改，需要先处理
      if (projectStore.currentProject?.hasUnsavedChanges) {
        const shouldContinue = await this.handleUnsavedChanges();
        if (!shouldContinue) {
          return { success: false, message: '用户取消了操作' };
        }
      }

      // 使用 openProject 方法，传入项目ID作为文件路径
      await projectStore.openProject(projectId);
      
      const project = projectStore.currentProject;
      if (!project) {
        return { success: false, message: `项目加载失败: ${projectId}` };
      }

      // 同步项目元素到应用状态
      this.syncProjectToApp(project as Project);

      this.emit('project-opened', { 
        project, 
        projectId 
      });

      console.info(`[project-manager] 加载项目: ${projectId}`, { 
        projectName: (project as unknown as Project).metadata.name 
      });

      return { 
        success: true, 
        data: { project } 
      };

    } catch (error) {
      const message = `加载项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'load', error });
      
      return { success: false, message };
    }
  }
  private static instance: ProjectManager | null = null;
  private eventListeners: Map<ProjectEvent, Set<ProjectEventListener>> = new Map();
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取项目管理器单例实例
   */
  public static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  /**
   * 初始化项目管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[project-manager] 项目管理器已经初始化');
      return;
    }

    try {
      console.info('[project-manager] 开始初始化项目管理器');

      // 初始化项目存储
      const projectStore = useProjectStore.getState();
      await projectStore.initializeProjects();

      this.isInitialized = true;

      console.info('[project-manager] 项目管理器初始化完成');

    } catch (error) {
      console.error('[project-manager] 项目管理器初始化失败:', error);
      this.emit('project-error', error);
      throw error;
    }
  }

  /**
   * 销毁项目管理器
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    console.info('[project-manager] 销毁项目管理器');

    // 清除事件监听器
    this.eventListeners.clear();

    this.isInitialized = false;
  }

  /**
   * 创建新项目
   */
  public async createProject(
    options: ProjectCreateOptions | string, 
    type?: ProjectType, 
    templateId?: string
  ): Promise<ProjectOperationResult> {
    // 兼容旧的API调用方式
    let projectOptions: ProjectCreateOptions;
    if (typeof options === 'string') {
      projectOptions = { 
        name: options, 
        template: templateId,
        settings: {} 
      };
    } else {
      projectOptions = options;
    }
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    if (!projectOptions.name.trim()) {
      return { success: false, message: '项目名称不能为空' };
    }

    try {
      const projectStore = useProjectStore.getState();
      
      // 如果有当前项目且有未保存更改，需要先处理
      if (projectStore.currentProject?.hasUnsavedChanges) {
        const shouldContinue = await this.handleUnsavedChanges();
        if (!shouldContinue) {
          return { success: false, message: '用户取消了操作' };
        }
      }

      await projectStore.createProject(projectOptions.name, type || 'other', projectOptions.template);

      const currentProject = projectStore.currentProject;
      
      this.emit('project-created', { 
        project: currentProject, 
        templateId: projectOptions.template 
      });

      console.info(`[project-manager] 创建项目: ${projectOptions.name}`, { 
        type: type || 'other', 
        templateId: projectOptions.template,
        projectId: currentProject?.metadata.id 
      });

      return { 
        success: true, 
        data: { project: currentProject } 
      };

    } catch (error) {
      const message = `创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'create', error });
      
      return { success: false, message };
    }
  }

  /**
   * 打开项目
   */
  public async openProject(filePath: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    if (!filePath.trim()) {
      return { success: false, message: '文件路径不能为空' };
    }

    try {
      const projectStore = useProjectStore.getState();
      
      // 如果有当前项目且有未保存更改，需要先处理
      if (projectStore.currentProject?.hasUnsavedChanges) {
        const shouldContinue = await this.handleUnsavedChanges();
        if (!shouldContinue) {
          return { success: false, message: '用户取消了操作' };
        }
      }

      await projectStore.openProject(filePath);

      const currentProject = projectStore.currentProject;
      
      // 同步项目元素到应用状态
      if (currentProject) {
        this.syncProjectToApp(currentProject);
      }

      this.emit('project-opened', { 
        project: currentProject, 
        filePath 
      });

      console.info(`[project-manager] 打开项目: ${filePath}`, { 
        projectId: currentProject?.metadata.id 
      });

      return { 
        success: true, 
        data: { project: currentProject } 
      };

    } catch (error) {
      const message = `打开项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'open', error });
      
      return { success: false, message };
    }
  }

  /**
   * 保存项目
   */
  public async saveProject(filePath?: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可保存' };
    }

    try {
      // 同步应用状态到项目
      this.syncAppToProject();

      await projectStore.saveProject(filePath);

      const currentProject = projectStore.currentProject;
      
      this.emit('project-saved', { 
        project: currentProject, 
        filePath: filePath || currentProject?.metadata.filePath 
      });

      console.info(`[project-manager] 保存项目`, { 
        projectId: currentProject?.metadata.id,
        filePath: filePath || currentProject?.metadata.filePath
      });

      return { 
        success: true, 
        data: { project: currentProject } 
      };

    } catch (error) {
      const message = `保存项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'save', error });
      
      return { success: false, message };
    }
  }

  /**
   * 另存为项目
   */
  public async saveProjectAs(filePath: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    if (!filePath.trim()) {
      return { success: false, message: '文件路径不能为空' };
    }

    return this.saveProject(filePath);
  }

  /**
   * 关闭项目
   */
  public async closeProject(): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: true, message: '没有项目需要关闭' };
    }

    try {
      const project = projectStore.currentProject;
      
      // 如果有未保存更改，需要先处理
      if (project.hasUnsavedChanges) {
        const shouldContinue = await this.handleUnsavedChanges();
        if (!shouldContinue) {
          return { success: false, message: '用户取消了操作' };
        }
      }

      const success = await projectStore.closeProject();
      
      if (success) {
        // 清除应用状态中的元素
        const appStore = useAppStore.getState();
        appStore.batchUpdate({
          elements: {},
          selectedElements: [],
          selectedElement: null,
        });

        this.emit('project-closed', { project });

        console.info(`[project-manager] 关闭项目`, { 
          projectId: project.metadata.id 
        });

        return { success: true, data: { project } };
      } else {
        return { success: false, message: '用户取消了关闭操作' };
      }

    } catch (error) {
      const message = `关闭项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'close', error });
      
      return { success: false, message };
    }
  }

  /**
   * 更新项目元数据
   */
  public updateProjectMetadata(updates: Partial<ProjectMetadata>): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可更新' };
    }

    projectStore.updateProjectMetadata(updates);

    const currentProject = projectStore.currentProject;
    
    this.emit('project-modified', { 
      project: currentProject, 
      type: 'metadata', 
      updates 
    });

    console.debug(`[project-manager] 更新项目元数据`, { 
      updatedKeys: Object.keys(updates) 
    });

    return { success: true, data: { project: currentProject } };
  }

  /**
   * 更新项目设置
   */
  public updateProjectSettings(updates: Partial<ProjectSettings>): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可更新' };
    }

    projectStore.updateProjectSettings(updates);

    const currentProject = projectStore.currentProject;
    
    this.emit('project-modified', { 
      project: currentProject, 
      type: 'settings', 
      updates 
    });

    console.debug(`[project-manager] 更新项目设置`, { 
      updatedKeys: Object.keys(updates) 
    });

    return { success: true, data: { project: currentProject } };
  }

  /**
   * 添加元素到项目
   */
  public addElementToProject(element: CanvasElement): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可添加元素' };
    }

    // 同时添加到项目和应用状态
    projectStore.addElementToProject(element);
    
    const appStore = useAppStore.getState();
    appStore.addElement(element);

    console.debug(`[project-manager] 添加元素到项目: ${element.name}`, { 
      id: element.id 
    });

    return { success: true, data: { element } };
  }

  /**
   * 从项目中删除元素
   */
  public removeElementFromProject(id: string): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可删除元素' };
    }

    const element = projectStore.currentProject.elements[id];
    
    if (!element) {
      return { success: false, message: `元素不存在: ${id}` };
    }

    // 同时从项目和应用状态中删除
    projectStore.removeElementFromProject(id);
    
    const appStore = useAppStore.getState();
    appStore.deleteElement(id);

    console.debug(`[project-manager] 从项目删除元素: ${element.name}`, { 
      id 
    });

    return { success: true, data: { id, element } };
  }

  /**
   * 应用模板
   */
  public applyTemplate(templateId: string): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可应用模板' };
    }

    const template = projectStore.templates[templateId];
    
    if (!template) {
      return { success: false, message: `模板不存在: ${templateId}` };
    }

    projectStore.applyTemplate(templateId);

    // 同步到应用状态
    const currentProject = projectStore.currentProject;
    if (currentProject) {
      this.syncProjectToApp(currentProject);
    }

    this.emit('template-applied', { 
      project: currentProject, 
      template 
    });

    console.info(`[project-manager] 应用模板: ${template.name}`, { 
      templateId 
    });

    return { 
      success: true, 
      data: { project: currentProject, template } 
    };
  }

  /**
   * 导出项目
   */
  public async exportProject(
    format: ExportFormat, 
    options: any = {}
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可导出' };
    }

    try {
      await projectStore.exportProject(format, options);

      const currentProject = projectStore.currentProject;
      
      this.emit('project-exported', { 
        project: currentProject, 
        format, 
        options 
      });

      console.info(`[project-manager] 导出项目: ${format}`, { 
        projectId: currentProject?.metadata.id,
        options 
      });

      return { 
        success: true, 
        data: { project: currentProject, format, options } 
      };

    } catch (error) {
      const message = `导出项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      this.emit('project-error', { action: 'export', error });
      
      return { success: false, message };
    }
  }

  /**
   * 验证项目
   */
  public validateProject(project?: Project): ProjectValidationResult {
    const projectStore = useProjectStore.getState();
    const targetProject = project || projectStore.currentProject;

    if (!targetProject) {
      return {
        isValid: false,
        errors: ['没有项目可验证'],
        warnings: [],
      };
    }

    const validation = projectStore.validateProject(targetProject);
    const warnings: string[] = [];

    // 添加警告检查
    if (targetProject.metadata.elementCount === 0) {
      warnings.push('项目中没有任何元素');
    }

    if (!targetProject.metadata.description.trim()) {
      warnings.push('项目缺少描述信息');
    }

    if (targetProject.metadata.tags.length === 0) {
      warnings.push('项目没有设置标签');
    }

    return {
      ...validation,
      warnings,
    };
  }

  /**
   * 获取最近项目
   */
  public getRecentProjects(): RecentProject[] {
    const projectStore = useProjectStore.getState();
    return projectStore.getRecentProjects();
  }

  /**
   * 获取项目模板
   */
  public getProjectTemplates(): ProjectTemplate[] {
    const projectStore = useProjectStore.getState();
    return Object.values(projectStore.templates);
  }

  /**
   * 获取项目模板（别名方法，兼容UI组件）
   */
  public getTemplates(): ProjectTemplate[] {
    return this.getProjectTemplates();
  }

  /**
   * 创建项目模板
   */
  public async createTemplate(name: string, description: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目管理器未初始化' };
    }

    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return { success: false, message: '没有当前项目可创建模板' };
    }

    if (!name.trim()) {
      return { success: false, message: '模板名称不能为空' };
    }

    try {
      // 同步应用状态到项目
      this.syncAppToProject();

      const templateId = await projectStore.createTemplate(name, description);

      const template = projectStore.templates[templateId];

      console.info(`[project-manager] 创建模板: ${name}`, { 
        templateId 
      });

      return { 
        success: true, 
        data: { templateId, template } 
      };

    } catch (error) {
      const message = `创建模板失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[project-manager] ${message}`, error);
      
      return { success: false, message };
    }
  }

  /**
   * 获取当前项目
   */
  public getCurrentProject(): Project | null {
    const projectStore = useProjectStore.getState();
    return projectStore.currentProject;
  }

  /**
   * 获取项目状态
   */
  public getProjectStatus(): ProjectStatus | null {
    const projectStore = useProjectStore.getState();
    return projectStore.currentProject?.status || null;
  }

  /**
   * 检查是否有未保存的更改
   */
  public hasUnsavedChanges(): boolean {
    const projectStore = useProjectStore.getState();
    return projectStore.currentProject?.hasUnsavedChanges || false;
  }

  /**
   * 启用自动保存
   */
  public enableAutoSave(): void {
    if (!this.isInitialized) {
      return;
    }

    const projectStore = useProjectStore.getState();
    projectStore.enableAutoSave();

    console.info('[project-manager] 启用自动保存');
  }

  /**
   * 禁用自动保存
   */
  public disableAutoSave(): void {
    if (!this.isInitialized) {
      return;
    }

    const projectStore = useProjectStore.getState();
    projectStore.disableAutoSave();

    console.info('[project-manager] 禁用自动保存');
  }

  /**
   * 处理未保存的更改
   */
  private async handleUnsavedChanges(): Promise<boolean> {
    // 这里应该显示确认对话框
    // 现在简单返回true，表示继续操作
    console.warn('[project-manager] 检测到未保存的更改，需要用户确认');
    return true;
  }

  /**
   * 同步项目状态到应用状态
   */
  private syncProjectToApp(project: Project): void {
    const appStore = useAppStore.getState();
    
    appStore.batchUpdate({
      elements: project.elements,
      selectedElements: project.selectedElements,
      selectedElement: project.selectedElements.length === 1 
        ? project.elements[project.selectedElements[0]!] || null   
        : null,
    });

    console.debug('[project-manager] 同步项目状态到应用状态', {
      elementCount: Object.keys(project.elements).length,
      selectedCount: project.selectedElements.length,
    });
  }

  /**
   * 同步应用状态到项目状态
   */
  private syncAppToProject(): void {
    const appStore = useAppStore.getState();
    const projectStore = useProjectStore.getState();
    
    if (!projectStore.currentProject) {
      return;
    }

    // 更新项目中的元素
    Object.values(appStore.elements).forEach(element => {
      projectStore.updateElementInProject(element.id, element);
    });

    // 更新选择状态
    projectStore.selectElementsInProject(appStore.selectedElements);

    console.debug('[project-manager] 同步应用状态到项目状态', {
      elementCount: Object.keys(appStore.elements).length,
      selectedCount: appStore.selectedElements.length,
    });
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(event: ProjectEvent, listener: ProjectEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: ProjectEvent, listener: ProjectEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: ProjectEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[project-manager] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 从最近项目中移除
   */
  public removeFromRecentProjects(projectId: string): void {
    const projectStore = useProjectStore.getState();
    projectStore.removeFromRecentProjects(projectId);
    
    console.info(`[project-manager] 从最近项目中移除: ${projectId}`);
  }

  /**
   * 清空最近项目列表
   */
  public clearRecentProjects(): void {
    const projectStore = useProjectStore.getState();
    projectStore.clearRecentProjects();
    
    console.info('[project-manager] 清空最近项目列表');
  }

  /**
   * 添加事件监听器（兼容UI组件的方法名）
   */
  public on(event: ProjectEvent, listener: ProjectEventListener): void {
    this.addEventListener(event, listener);
  }

  /**
   * 移除事件监听器（兼容UI组件的方法名）
   */
  public off(event: ProjectEvent, listener: ProjectEventListener): void {
    this.removeEventListener(event, listener);
  }

  /**
   * 获取项目管理器状态
   */
  public getStatus() {
    const projectStore = useProjectStore.getState();
    const stats = projectStore.getProjectStats();
    
    return {
      isInitialized: this.isInitialized,
      hasCurrentProject: !!projectStore.currentProject,
      currentProjectId: projectStore.currentProject?.metadata.id,
      currentProjectName: projectStore.currentProject?.metadata.name,
      projectStatus: projectStore.currentProject?.status,
      hasUnsavedChanges: projectStore.currentProject?.hasUnsavedChanges || false,
      isAutoSaveEnabled: projectStore.currentProject?.settings.autoSaveEnabled || false,
      ...stats,
      templatesCount: Object.keys(projectStore.templates).length,
      eventListenerCount: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.size, 0),
    };
  }
}

// 导出单例实例
export const projectManager = ProjectManager.getInstance();