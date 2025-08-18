/**
 * 项目服务 - 提供项目相关的业务逻辑服务
 * @description 封装项目操作的业务逻辑，协调项目管理器和存储
 * @author 开发团队
 */
import { projectManager } from '../managers/project/ProjectManager';
import { canvasService } from './CanvasService';
import { assetService } from './AssetService';
import type { 
  Project, 
  ProjectTemplate, 
  ProjectSettings,
  ProjectType,
} from '../../stores/projectStore';

/**
 * 项目操作结果接口
 */
export interface ProjectOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 项目创建选项接口
 */
export interface ProjectCreateOptions {
  template?: ProjectTemplate;
  settings?: Partial<ProjectSettings>;
  initializeCanvas?: boolean;
  loadAssets?: boolean;
}

/**
 * 项目导入选项接口
 */
export interface ProjectImportOptions {
  overwriteExisting?: boolean;
  mergeAssets?: boolean;
  validateFormat?: boolean;
  backupOriginal?: boolean;
}

/**
 * 项目备份选项接口
 */
export interface ProjectBackupOptions {
  includeAssets?: boolean;
  includeHistory?: boolean;
  compression?: 'none' | 'zip' | 'gzip';
  destination?: string;
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
  };
  collaborators: Array<{
    id: string;
    name: string;
    role: 'owner' | 'editor' | 'viewer';
    lastActive: string;
  }>;
}

/**
 * 项目服务类
 * @description 提供项目相关的高级业务服务
 */
export class ProjectService {
  private static instance: ProjectService | null = null;
  private isInitialized = false;
  private recentProjects: string[] = [];
  private maxRecentProjects = 10;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private autoSaveEnabled = true;
  private autoSaveIntervalMs = 30000; // 30秒

  private constructor() {}

  /**
   * 获取项目服务单例实例
   */
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * 初始化项目服务
   */
  public async initialize(): Promise<ProjectOperationResult> {
    if (this.isInitialized) {
      return { success: true, message: '项目服务已经初始化' };
    }

    try {
      console.info('[project-service] 开始初始化项目服务');

      // 初始化项目管理器
      await projectManager.initialize();

      // 加载最近项目列表
      this.loadRecentProjects();

      // 设置事件监听
      this.setupEventListeners();

      // 启动自动保存
      if (this.autoSaveEnabled) {
        this.startAutoSave();
      }

      this.isInitialized = true;
      console.info('[project-service] 项目服务初始化完成');

      return { success: true };
    } catch (error) {
      console.error('[project-service] 项目服务初始化失败:', error);
      return {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 销毁项目服务
   */
  public destroy(): ProjectOperationResult {
    if (!this.isInitialized) {
      return { success: true, message: '项目服务未初始化' };
    }

    try {
      console.info('[project-service] 销毁项目服务');

      // 停止自动保存
      this.stopAutoSave();

      // 保存最近项目列表
      this.saveRecentProjects();

      // 销毁项目管理器
      projectManager.destroy();

      // 清理数据
      this.recentProjects = [];
      this.isInitialized = false;

      console.info('[project-service] 项目服务销毁完成');
      return { success: true };
    } catch (error) {
      console.error('[project-service] 项目服务销毁失败:', error);
      return {
        success: false,
        message: `销毁失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 创建新项目
   */
  public async createProject(
    name: string,
    options?: ProjectCreateOptions
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 创建项目: ${name}`);

      // 创建项目数据
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        // name: '', // 移除不存在的属性
        // description: '', // 移除不存在的属性
        settings: {
          canvasWidth: 800,
          canvasHeight: 600,
          backgroundColor: '#ffffff',
          gridEnabled: true,
          gridColor: '#e0e0e0', // 默认网格颜色，确保必填
          gridSize: 20,
          snapToGrid: true,
          rulersEnabled: true,
          rulerUnits: 'px',
          defaultExportFormat: 'png', // 添加缺失的必填属性
          exportQuality: 90,
          exportScale: 1,
          autoSaveEnabled: true,
          autoSaveInterval: 30,
          maxHistorySteps: 100,
          enableGPUAcceleration: true,
          maxTextureSize: 4096,
          ...options?.settings,
        },
        metadata: {
          version: '1.0.0',
          author: '',
          tags: [],
          id: '',
          name: '',
          description: '',
          type: 'game-asset',
          appVersion: '',
          createdAt: '',
          updatedAt: '',
          collaborators: [],
          fileSize: 0,
          elementCount: 0,
          layerCount: 0,
          assetCount: 0,
          assets: (assets: any) => assets // 修复类型错误
        },
        // assets: [], // 移除不存在的属性
        elements: {},
        layers: [],
        selectedElements: [],
        status: 'active' as any, // 添加缺失的属性
        hasUnsavedChanges: false,
        exportHistory: [],
      };

      // 应用模板
      if (options?.template) {
        this.applyTemplate(projectData, options.template);
      }

      // 通过项目管理器创建项目
      const result = await projectManager.createProject(name, 'general' as ProjectType);

      if (result.success && result.data?.project) {
        const project = result.data.project;

        // 添加到最近项目
        this.addToRecentProjects(project.id);

        // 初始化画布
        if (options?.initializeCanvas) {
          await this.initializeProjectCanvas(project);
        }

        // 加载素材
        if (options?.loadAssets) {
          await this.loadProjectAssets(project);
        }

        console.info(`[project-service] 项目创建完成: ${name}`, { id: project.id });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 创建项目失败: ${name}`, error);
      return {
        success: false,
        message: `创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 打开项目
   */
  public async openProject(projectId: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 打开项目: ${projectId}`);

      // 通过项目管理器打开项目
      const result = await projectManager.openProject(projectId);

      if (result.success && result.data?.project) {
        const project = result.data.project;

        // 添加到最近项目
        this.addToRecentProjects(projectId);

        // 初始化画布
        await this.initializeProjectCanvas(project);

        // 加载项目素材
        await this.loadProjectAssets(project);

        console.info(`[project-service] 项目打开完成: ${project.name}`, { id: projectId });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 打开项目失败: ${projectId}`, error);
      return {
        success: false,
        message: `打开项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 保存项目
   */
  public async saveProject(projectId?: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      const targetProjectId = projectId || projectManager.getCurrentProject()?.metadata.id;
      if (!targetProjectId) {
        return { success: false, message: '没有可保存的项目' };
      }

      console.info(`[project-service] 保存项目: ${targetProjectId}`);

      // 获取当前画布状态
      // const canvasState = canvasService.getCanvasState();
      
      // 通过项目管理器保存项目
      const result = await projectManager.saveProject(targetProjectId);

      if (result.success) {
        console.info(`[project-service] 项目保存完成: ${targetProjectId}`);
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 保存项目失败: ${projectId}`, error);
      return {
        success: false,
        message: `保存项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 导出项目
   */
  public async exportProject(
    projectId: string,
    options: any
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 导出项目: ${projectId}`, { format: options.format });

      // 通过项目管理器导出项目
      const result = await projectManager.exportProject(options.format, options);

      if (result.success) {
        console.info(`[project-service] 项目导出完成: ${projectId}`, { 
          format: options.format,
          size: result.data?.size 
        });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 导出项目失败: ${projectId}`, error);
      return {
        success: false,
        message: `导出项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 导入项目
   */
  public async importProject(
    file: File,
    options?: ProjectImportOptions
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 导入项目: ${file.name}`);

      // 格式验证
      if (options?.validateFormat && !this.isValidProjectFile(file)) {
        return { success: false, message: '项目文件格式无效' };
      }

      // 通过项目管理器导入项目
      const result = await projectManager.openProject(file.name);

      if (result.success && result.data?.project) {
        const project = result.data.project;

        // 添加到最近项目
        this.addToRecentProjects(project.id);

        console.info(`[project-service] 项目导入完成: ${project.name}`, { id: project.id });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 导入项目失败: ${file.name}`, error);
      return {
        success: false,
        message: `导入项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 复制项目
   */
  public async duplicateProject(
    projectId: string,
    _newName?: string
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 复制项目: ${projectId}`);

      // 通过项目管理器复制项目
      const result = await projectManager.exportProject('json', { projectId });

      if (result.success && result.data?.project) {
        const project = result.data.project;

        // 添加到最近项目
        this.addToRecentProjects(project.id);

        console.info(`[project-service] 项目复制完成: ${project.name}`, { 
          originalId: projectId,
          newId: project.id 
        });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 复制项目失败: ${projectId}`, error);
      return {
        success: false,
        message: `复制项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 删除项目
   */
  public async deleteProject(projectId: string): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 删除项目: ${projectId}`);

      // 通过项目管理器删除项目
      const result = await projectManager.exportProject('json', { projectId });

      if (result.success) {
        // 从最近项目中移除
        this.removeFromRecentProjects(projectId);

        console.info(`[project-service] 项目删除完成: ${projectId}`);
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 删除项目失败: ${projectId}`, error);
      return {
        success: false,
        message: `删除项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 创建项目备份
   */
  public async createBackup(
    projectId: string,
    _options?: ProjectBackupOptions
  ): Promise<ProjectOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '项目服务未初始化' };
    }

    try {
      console.info(`[project-service] 创建备份: ${projectId}`);

      // 通过项目管理器创建备份
      const result = await projectManager.exportProject('zip', { projectId });

      if (result.success) {
        console.info(`[project-service] 备份创建完成: ${projectId}`, {
          backupId: result.data?.backupId,
          size: result.data?.size,
        });
      }

      return result;
    } catch (error) {
      console.error(`[project-service] 创建备份失败: ${projectId}`, error);
      return {
        success: false,
        message: `创建备份失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取最近项目列表
   */
  public getRecentProjects(): string[] {
    return [...this.recentProjects];
  }

  /**
   * 获取项目统计信息
   */
  public getProjectStats(projectId?: string): any | null {
    if (!this.isInitialized) {
      return null;
    }

    const targetProjectId = projectId || projectManager.getCurrentProject()?.metadata.id;
    if (!targetProjectId) {
      return null;
    }

    return projectManager.getStatus();
  }

  /**
   * 获取项目协作信息
   */
  public getProjectCollaboration(_projectId: string): ProjectCollaboration | null {
    if (!this.isInitialized) {
      return null;
    }

    // 简单实现，实际应该从服务器获取
    return {
      isShared: false,
      permissions: {
        canEdit: true,
        canView: true,
        canComment: true,
        canShare: true,
      },
      collaborators: [],
    };
  }

  /**
   * 设置自动保存
   */
  public setAutoSave(enabled: boolean, intervalMs?: number): ProjectOperationResult {
    try {
      this.autoSaveEnabled = enabled;
      
      if (intervalMs && intervalMs > 0) {
        this.autoSaveIntervalMs = intervalMs;
      }

      if (enabled) {
        this.startAutoSave();
      } else {
        this.stopAutoSave();
      }

      console.info(`[project-service] 自动保存设置: ${enabled ? '启用' : '禁用'}`, {
        interval: this.autoSaveIntervalMs,
      });

      return { success: true };
    } catch (error) {
      console.error('[project-service] 设置自动保存失败:', error);
      return {
        success: false,
        message: `设置自动保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取服务状态
   */
  public getStatus() {
    const projectStatus = projectManager.getStatus();
    return {
      isInitialized: this.isInitialized,
      project: projectStatus,
      recent: {
        count: this.recentProjects.length,
        maxCount: this.maxRecentProjects,
      },
      autoSave: {
        enabled: this.autoSaveEnabled,
        interval: this.autoSaveIntervalMs,
        isRunning: this.autoSaveInterval !== null,
      },
    };
  }

  /**
   * 检查服务健康状态
   */
  public checkHealth() {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!this.isInitialized) {
      issues.push('项目服务未初始化');
      return { isHealthy: false, issues, warnings };
    }

         const projectStatus = projectManager.getStatus();
     // 检查项目加载状态（如果存在）
     if ((projectStatus as any).isLoading && Date.now() - ((projectStatus as any).loadingStartTime || 0) > 30000) {
       issues.push('项目加载超时');
     }

    if (!this.autoSaveEnabled) {
      warnings.push('自动保存已禁用');
    }

    if (this.autoSaveEnabled && !this.autoSaveInterval) {
      issues.push('自动保存配置错误');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }

  // 私有方法
  private setupEventListeners(): void {
    // 监听项目变更事件
    projectManager.addEventListener('project-modified', (_event, data) => {
      console.debug(`[project-service] 项目已变更: ${data?.projectId}`);
    });

    // 监听项目保存事件
    projectManager.addEventListener('project-saved', (_event, data) => {
      console.debug(`[project-service] 项目已保存: ${data?.projectId}`);
    });
  }

  private async initializeProjectCanvas(project: Project): Promise<void> {
    try {
      await canvasService.initialize();
      canvasService.updateCanvasConfig({
        size: { width: project.settings.canvasWidth, height: project.settings.canvasHeight },
        backgroundColor: { type: 'solid', color: project.settings.backgroundColor },
        gridEnabled: project.settings.gridEnabled,
        gridSize: project.settings.gridSize,
        gridColor: project.settings.gridColor,
        snapToGrid: project.settings.snapToGrid,
      });

             // 加载项目元素到画布
       for (const element of Object.values(project.elements)) {
         // 只处理文本元素
         if (element.type === 'text' && 'content' in element && 'style' in element) {
           canvasService.createTextElement(
             (element as any).content || '', 
             element.transform, 
             (element as any).style || {}, 
             (element as any).options || {}
           );
         }
       }
    } catch (error) {
      console.warn(`[project-service] 初始化项目画布失败: ${project.id}`, error);
    }
  }

  private async loadProjectAssets(project: Project): Promise<void> {
    try {
      // 加载项目素材到素材服务
      for (const asset of Object.values(project.metadata.assets)) {
        await assetService.addAsset(asset);
      }
    } catch (error) {
      console.warn(`[project-service] 加载项目素材失败: ${project.id}`, error);
    }
  }

  private applyTemplate(projectData: any, template: ProjectTemplate): void {
    // 应用模板设置
    if (template.settings) {
      projectData.settings = { ...projectData.settings, ...template.settings };
    }

         // 应用模板元素
     if (template.elements) {
       projectData.elements = { ...template.elements };
     }

    // 应用模板素材
    if (template.assets) {
      projectData.assets = [...template.assets];
    }
  }

  private addToRecentProjects(projectId: string): void {
    // 移除已存在的项目ID
    this.recentProjects = this.recentProjects.filter(id => id !== projectId);
    
    // 添加到开头
    this.recentProjects.unshift(projectId);
    
    // 限制数量
    if (this.recentProjects.length > this.maxRecentProjects) {
      this.recentProjects = this.recentProjects.slice(0, this.maxRecentProjects);
    }

    // 保存到本地存储
    this.saveRecentProjects();
  }

  private removeFromRecentProjects(projectId: string): void {
    this.recentProjects = this.recentProjects.filter(id => id !== projectId);
    this.saveRecentProjects();
  }

  private loadRecentProjects(): void {
    try {
      const saved = localStorage.getItem('project-service-recent-projects');
      if (saved) {
        this.recentProjects = JSON.parse(saved);
        console.debug(`[project-service] 加载最近项目: ${this.recentProjects.length} 个`);
      }
    } catch (error) {
      console.warn('[project-service] 加载最近项目失败:', error);
      this.recentProjects = [];
    }
  }

  private saveRecentProjects(): void {
    try {
      localStorage.setItem('project-service-recent-projects', JSON.stringify(this.recentProjects));
    } catch (error) {
      console.warn('[project-service] 保存最近项目失败:', error);
    }
  }

  private startAutoSave(): void {
    this.stopAutoSave(); // 先停止现有的定时器

    this.autoSaveInterval = setInterval(async () => {
      const currentProjectId = projectManager.getCurrentProject()?.metadata.id;
      if (currentProjectId) {
        try {
          await this.saveProject(currentProjectId);
          console.debug(`[project-service] 自动保存完成: ${currentProjectId}`);
        } catch (error) {
          console.warn(`[project-service] 自动保存失败: ${currentProjectId}`, error);
        }
      }
    }, this.autoSaveIntervalMs);
  }

  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private isValidProjectFile(file: File): boolean {
    const validExtensions = ['.gaf', '.json'];
    const validTypes = ['application/json', 'application/octet-stream'];

    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    const hasValidType = validTypes.includes(file.type);

    return hasValidExtension || hasValidType;
  }
}

// 导出单例实例
export const projectService = ProjectService.getInstance();