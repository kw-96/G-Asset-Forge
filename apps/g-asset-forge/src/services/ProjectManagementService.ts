/**
 * 重构后的项目管理服务
 * 整合所有管理器，提供统一的项目管理接口
 */

import { EventEmitter } from '@g-asset-forge/common';
import {
  type GAssetForgeEditor,
  globalProjectHandlerFactory,
  type IProjectHandler,
  type ProjectData,
  type ProjectMetadata,
  ProjectType,
  ProjectTypeManager,
} from '@g-asset-forge/core';

import { appEventEmitter } from '../events';
import {
  AutoSaveExportManager,
  EditorIntegrationManager,
  ProjectDataManager,
  ProjectLifecycleManager,
  ProjectListManager,
  type ProjectManagementEvents,
} from './project-management';

// 扩展事件接口以包含H5相关事件
interface ExtendedProjectManagementEvents extends ProjectManagementEvents {
  h5ContainerRestored: (event: { containerId: string }) => void;
  ready: () => void;
  error: (error: any) => void;
}
import { ErrorType, ProjectErrorHandler } from './ProjectErrorHandler';

export class ProjectManagementService extends EventEmitter<ExtendedProjectManagementEvents> {
  private lifecycleManager: ProjectLifecycleManager;
  private dataManager: ProjectDataManager;
  private editorManager: EditorIntegrationManager;
  private autoSaveExportManager: AutoSaveExportManager;
  private listManager: ProjectListManager;
  private errorHandler: ProjectErrorHandler;

  // 新增：原始服务的关键组件
  private projectTypeManager: ProjectTypeManager;
  private currentProjectHandler: IProjectHandler | null = null;
  private currentProjectId: string | null = null;
  private isOpeningProject = false;
  private eventsSetup = false;

  constructor() {
    super();
    this.errorHandler = new ProjectErrorHandler();

    // 初始化所有管理器
    this.lifecycleManager = new ProjectLifecycleManager(this.errorHandler);
    this.dataManager = new ProjectDataManager(this.errorHandler);
    this.editorManager = new EditorIntegrationManager(this.errorHandler);
    this.autoSaveExportManager = new AutoSaveExportManager(this.errorHandler);
    this.listManager = new ProjectListManager(this.errorHandler);

    // 初始化原始服务的关键组件
    this.projectTypeManager = new ProjectTypeManager();

    // 设置事件监听器（防重复）
    if (!this.eventsSetup) {
      this.setupEventForwarding();
      this.setupProjectTypeManagerListeners();
      this.setupEditorReadyListener();
      this.eventsSetup = true;
    }
  }

  /**
   * 设置编辑器就绪事件监听
   */
  private setupEditorReadyListener(): void {
    appEventEmitter.on('editorReady' as any, () => {
      console.log('ProjectManagementService: 收到编辑器就绪事件');
      this.handleEditorReady();
    });
  }

  /**
   * 处理编辑器就绪事件
   */
  private async handleEditorReady(): Promise<void> {
    // 检查是否有待处理的项目数据
    if (this.pendingProjectData) {
      await this.loadProjectDataToEditor(
        this.pendingProjectData.projectData,
        this.pendingProjectData.projectId,
      );
      this.pendingProjectData = null;
    }
  }

  /**
   * 设置项目类型管理器事件监听
   */
  private setupProjectTypeManagerListeners(): void {
    this.projectTypeManager.on('typeChanged', (oldType, newType) => {
      if (this.currentProjectId) {
        this.emit(
          'projectTypeChanged',
          this.currentProjectId,
          oldType,
          newType,
        );
      }
    });

    this.projectTypeManager.on('typeIdentified', (result) => {
      if (this.currentProjectId) {
        this.emit('projectTypeIdentified', this.currentProjectId, result);
      }
    });
  }

  /**
   * 设置事件转发
   */
  private setupEventForwarding(): void {
    // 转发生命周期事件
    this.lifecycleManager.on('projectOpened', (project) =>
      this.emit('projectOpened', project),
    );
    this.lifecycleManager.on('projectClosed', (projectId) =>
      this.emit('projectClosed', projectId),
    );
    this.lifecycleManager.on('projectSaved', (project) =>
      this.emit('projectSaved', project),
    );
    this.lifecycleManager.on('projectRenamed', (projectId, newName) =>
      this.emit('projectRenamed', projectId, newName),
    );
    this.lifecycleManager.on('projectDeleted', (projectId) =>
      this.emit('projectDeleted', projectId),
    );

    // 转发项目列表事件
    this.listManager.on('projectCreated', (project) =>
      this.emit('projectCreated', project),
    );
    this.listManager.on('projectDeleted', (projectId) =>
      this.emit('projectDeleted', projectId),
    );
    this.listManager.on('projectRenamed', (projectId, newName) =>
      this.emit('projectRenamed', projectId, newName),
    );
    this.listManager.on('projectsListLoaded', (projects) =>
      this.emit('projectsListUpdated', projects),
    );

    // 转发编辑器事件
    this.editorManager.on(
      'editorContentInitialized',
      (projectData, projectType) => {
        this.emit('projectTypeIdentified', projectData.id, {
          type: projectType,
          confidence: 1.0,
          evidence: ['editor_content_analysis'],
        });
      },
    );

    // 转发自动保存导出事件
    this.autoSaveExportManager.on('projectAutoExported', (project) =>
      this.emit('projectAutoExported', project),
    );
    this.autoSaveExportManager.on('autoExportError', (projectId, error) =>
      this.emit('autoExportError', projectId, error),
    );

    // H5项目处理器事件转发将在项目处理器设置时动态添加
  }

  /**
   * 打开项目 - 简洁防重复方案
   */
  async openProject(projectId: string): Promise<boolean> {
    // 简洁的防重复检查
    if (this.isOpeningProject) {
      return false;
    }

    if (this.currentProjectId === projectId) {
      return true;
    }

    try {
      this.isOpeningProject = true;
      this.currentProjectId = projectId;

      // 1. 清理当前状态
      await this.clearCurrentState();

      // 2. 加载项目数据
      const projectData = await this.dataManager.loadProjectData(projectId);
      if (!projectData) {
        console.error('项目数据不存在:', projectId);
        return false;
      }

      // 3. 设置项目模式和状态
      this.setProjectMode(projectData.type);
      this.emit('projectModeChanged', projectData.type);

      // 4. 确保编辑器实例存在后再加载数据
      const editor = this.editorManager.getEditor();
      if (!editor) {
        // 等待编辑器就绪事件
        await this.waitForEditorReady();
        // 重新获取编辑器实例
        const readyEditor = this.editorManager.getEditor();
        if (!readyEditor) {
          console.error('等待编辑器就绪后仍无法获取编辑器实例');
          return false;
        }
      }

      console.log('开始加载项目数据到编辑器:', projectData.name);
      await this.loadProjectDataToEditor(projectData, projectId);
      console.log('项目数据加载到编辑器完成:', projectData.name);

      console.log('openProject 即将返回 true:', projectId);
      return true;
    } catch (error) {
      console.error('openProject 发生异常:', error);
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );
      this.emit('error', new Error(projectError.userMessage));
      console.log('openProject 返回 false 由于异常:', projectId);
      return false;
    } finally {
      this.isOpeningProject = false;
    }
  }

  /**
   * 等待编辑器就绪事件
   */
  private async waitForEditorReady(): Promise<void> {
    return new Promise((resolve) => {
      // 如果编辑器已经就绪，直接返回
      if (this.editorManager.getEditor()) {
        resolve();
        return;
      }

      // 监听编辑器就绪事件
      const handleEditorReady = () => {
        appEventEmitter.off('editorReady' as any, handleEditorReady);
        resolve();
      };

      appEventEmitter.on('editorReady' as any, handleEditorReady);
    });
  }

  /**
   * 检查编辑器是否完全就绪 - 复用 editorInitializer 的验证逻辑
   */
  private isEditorFullyReady(editor: any): boolean {
    return !!(
      editor &&
      editor.doc &&
      editor.sceneGraph &&
      editor.toolManager &&
      editor.viewportManager &&
      editor.commandManager &&
      editor.canvasElement &&
      editor.ctx
    );
  }

  /**
   * 设置项目处理器
   */
  private async setupProjectHandler(projectType: ProjectType): Promise<void> {
    try {
      const editor = this.editorManager.getEditor();
      if (!editor) return;

      // 清理现有处理器
      if (this.currentProjectHandler) {
        await this.currentProjectHandler.destroy();
        this.currentProjectHandler = null; // 清空引用，确保创建新实例
      }

      // 创建新的项目处理器
      this.currentProjectHandler =
        await globalProjectHandlerFactory.createHandler(projectType);
      if (!this.currentProjectHandler) {
        throw new Error(`无法创建项目处理器: ${projectType}`);
      }

      // 初始化项目处理器
      await this.currentProjectHandler.initialize(editor);

      // 设置H5项目处理器事件转发
      if (projectType === 'h5' && this.currentProjectHandler) {
        // 使用项目处理器的自定义事件系统
        if (
          typeof (this.currentProjectHandler as any).addEventListener ===
          'function'
        ) {
          (this.currentProjectHandler as any).addEventListener(
            'h5ContainerRestored',
            (event: { containerId: string }) => {
              this.emit('h5ContainerRestored', event);
            },
          );
        }
      }
    } catch (error) {
      console.error('设置项目处理器失败:', error);
      throw error; // 重新抛出错误，让上层处理
    }
  }

  /**
   * 保存项目
   */
  async saveProject(): Promise<boolean> {
    try {
      const currentProject = await this.getCurrentProject();
      if (!currentProject) {
        console.warn('没有当前项目可保存');
        return false;
      }

      const result = await this.lifecycleManager.saveProject(
        currentProject,
        async (data) => {
          const saveResult = await this.dataManager.saveProjectData(data);
          if (!saveResult.success) {
            throw new Error(saveResult.error?.message || '保存项目数据失败');
          }
        },
      );

      return result.success;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_SAVE_FAILED,
        {},
      );
      this.emit('error', new Error(projectError.userMessage));
      return false;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const result = await this.lifecycleManager.deleteProject(
      projectId,
      async (id) => {
        // 删除项目数据
        const dataResult = await this.dataManager.deleteProjectData(id);
        if (!dataResult.success) {
          throw new Error(dataResult.error?.message || '删除项目数据失败');
        }

        // 删除项目列表项
        const listResult = await this.listManager.deleteProject(id);
        if (!listResult.success) {
          throw new Error(listResult.error?.message || '删除项目列表项失败');
        }
      },
    );

    // 如果删除成功，清理当前状态
    if (result.success) {
      await this.clearCurrentState();
    }

    return result.success;
  }

  /**
   * 重命名项目
   */
  async renameProject(projectId: string, newName: string): Promise<boolean> {
    const result = await this.lifecycleManager.renameProject(
      projectId,
      newName,
      async (id, name) => {
        const renameResult = await this.dataManager.renameProjectData(id, name);
        if (!renameResult.success) {
          throw new Error(renameResult.error?.message || '重命名项目数据失败');
        }
      },
    );
    return result.success;
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    return await this.listManager.getProjectsList();
  }

  /**
   * 获取当前项目
   */
  async getCurrentProject(): Promise<ProjectData | null> {
    if (!this.currentProjectId) {
      return null;
    }

    try {
      return await this.dataManager.loadProjectData(this.currentProjectId);
    } catch (error) {
      console.error('获取当前项目失败:', error);
      return null;
    }
  }

  /**
   * 设置编辑器
   */
  setEditor(editor: GAssetForgeEditor | null): void {
    this.editorManager.setEditor(editor);
  }

  getEditorManager(): EditorIntegrationManager {
    return this.editorManager;
  }

  /**
   * 设置项目模式（简洁高效方案）
   */
  private setProjectMode(projectType: string): void {
    if (projectType === 'h5') {
      // 设置H5模式
      (window as any).__isH5Project = true;
    } else {
      // 设置设计模式
      (window as any).__isH5Project = false;
    }
  }

  /**
   * 清理当前状态（简洁高效方案）
   */
  private async clearCurrentState(): Promise<void> {
    // 清理项目处理器
    if (this.currentProjectHandler) {
      await this.currentProjectHandler.destroy();
      this.currentProjectHandler = null;
    }

    // 清理编辑器状态
    if (this.editorManager.getEditor()) {
      await this.editorManager.clearEditorState();
    }

    // 清理全局状态
    (window as any).__isH5Project = false;
    (window as any).__h5Service = null;
  }

  /**
   * 存储待加载的项目数据（事件驱动方案）
   */
  private storePendingProjectData(projectData: any, projectId: string): void {
    this.pendingProjectData = { projectData, projectId };
  }

  /**
   * 检查是否有待加载的项目数据
   */
  get hasPendingProjectData(): boolean {
    return !!this.pendingProjectData;
  }

  /**
   * 加载待处理的项目数据（事件驱动方案）
   */
  async loadPendingProjectData(editor: any): Promise<void> {
    if (!this.pendingProjectData) {
      return;
    }

    const { projectData, projectId } = this.pendingProjectData;

    try {
      // 加载数据到编辑器
      await this.editorManager.loadProjectData(projectData);

      // 设置项目处理器
      const projectType =
        projectData.type === 'h5' ? ProjectType.H5 : ProjectType.DESIGN;
      await this.setupProjectHandler(projectType);

      // 设置自动保存
      this.autoSaveExportManager.setupAutoSave(editor, projectId);

      // 清除待处理数据
      this.pendingProjectData = null;
    } catch (error) {
      console.error('加载待处理的项目数据失败:', error);
      this.pendingProjectData = null;
    }
  }

  // 添加待处理项目数据的属性
  private pendingProjectData: { projectData: any; projectId: string } | null =
    null;
  private isLoadingProject = false; // 防止重复加载

  /**
   * 加载项目数据到编辑器
   */
  private async loadProjectDataToEditor(
    projectData: any,
    projectId: string,
  ): Promise<void> {
    if (this.isLoadingProject) {
      return;
    }

    this.isLoadingProject = true;

    try {
      // 加载数据到编辑器
      console.log('EditorIntegrationManager.loadProjectData 开始');
      await this.editorManager.loadProjectData(projectData);
      console.log('EditorIntegrationManager.loadProjectData 完成');

      // 设置项目处理器
      console.log('设置项目处理器开始:', projectData.type);
      const projectType =
        projectData.type === 'h5' ? ProjectType.H5 : ProjectType.DESIGN;
      await this.setupProjectHandler(projectType);
      console.log('设置项目处理器完成');

      // 设置自动保存
      const editor = this.editorManager.getEditor();
      if (editor) {
        this.autoSaveExportManager.setupAutoSave(editor, projectId);
        console.log('自动保存设置完成');
      }
    } catch (error) {
      console.error('loadProjectDataToEditor 失败:', error);
      throw error; // 重新抛出错误，让上层处理
    } finally {
      this.isLoadingProject = false;
    }
  }

  /**
   * 手动保存
   */
  async manualSave(): Promise<boolean> {
    const currentProject = await this.getCurrentProject();
    if (!currentProject) {
      return false;
    }

    const result = await this.autoSaveExportManager.manualSave(currentProject);
    return result.success;
  }

  /**
   * 触发自动导出
   */
  async triggerAutoExport(): Promise<boolean> {
    const currentProject = await this.getCurrentProject();
    if (!currentProject) {
      return false;
    }

    const result = await this.autoSaveExportManager.triggerAutoExport(
      currentProject,
    );
    return result.success;
  }

  /**
   * 请求文件系统权限
   */
  async requestFileSystemPermission(): Promise<boolean> {
    try {
      // 使用AutoExportService的文件系统权限请求
      return await this.autoSaveExportManager.requestFileSystemPermission();
    } catch (error) {
      console.error('文件系统权限请求失败:', error);
      return false;
    }
  }

  /**
   * 验证项目状态
   */
  async validateProjectState(): Promise<boolean> {
    try {
      return await this.dataManager.validateProjectState();
    } catch (error) {
      console.error('项目状态验证失败:', error);
      return false;
    }
  }

  /**
   * 重新加载当前项目数据到编辑器
   */
  private async reloadCurrentProject(): Promise<void> {
    if (!this.currentProjectId || !this.editorManager.getEditor()) {
      console.warn('reloadCurrentProject: 没有当前项目或编辑器未初始化');
      return;
    }

    try {
      const currentProject = await this.getCurrentProject();
      if (!currentProject) {
        console.warn('reloadCurrentProject: 无法获取当前项目数据');
        return;
      }

      // 重新初始化编辑器内容
      const projectType = this.projectTypeManager.getCurrentProjectType();
      if (projectType) {
        await this.editorManager.initializeEditorContent(
          currentProject,
          projectType,
        );
      }
    } catch (error) {
      console.error('重新加载项目数据失败:', error);
    }
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(): Promise<any> {
    return await this.listManager.getProjectStats();
  }

  /**
   * 关闭项目
   */
  async closeProject(projectId: string): Promise<void> {
    try {
      // 停止自动保存
      this.autoSaveExportManager.disableAutoExport();

      // 清理项目处理器
      if (this.currentProjectHandler) {
        await this.currentProjectHandler.destroy();
        this.currentProjectHandler = null;
      }

      // 清理状态
      this.currentProjectId = null;
      this.projectTypeManager.resetCurrentProject();

      // 触发事件
      this.emit('projectClosed', projectId);
    } catch (error) {
      console.error('关闭项目失败:', error);
    }
  }

  /**
   * 启用自动导出
   */
  enableAutoExport(): void {
    this.autoSaveExportManager.enableAutoExport();
  }

  /**
   * 禁用自动导出
   */
  disableAutoExport(): void {
    this.autoSaveExportManager.disableAutoExport();
  }

  /**
   * 获取自动导出信息
   */
  getAutoExportInfo(): any {
    return this.autoSaveExportManager.getAutoExportInfo();
  }

  /**
   * 创建项目
   */
  async createProject(options: {
    name: string;
    type: 'h5' | 'design';
  }): Promise<{ id: string; name: string } | null> {
    try {
      const result = await this.listManager.createProject(
        options.name,
        options.type,
      );
      if (result.success && result.data) {
        return {
          id: result.data.id,
          name: result.data.name,
        };
      }
      return null;
    } catch (error) {
      console.error('创建项目失败:', error);
      return null;
    }
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 销毁服务
   */
  async destroy(): Promise<void> {
    try {
      // 清理项目处理器
      if (this.currentProjectHandler) {
        await this.currentProjectHandler.destroy();
        this.currentProjectHandler = null;
      }

      // 清理其他管理器
      this.autoSaveExportManager.destroy();
      this.lifecycleManager.reset();

      // 重置状态
      this.currentProjectId = null;
      this.projectTypeManager.resetCurrentProject();

      console.log('ProjectManagementService 已销毁');
    } catch (error) {
      console.error('销毁服务时发生错误:', error);
    }
  }
}

export default ProjectManagementService;
