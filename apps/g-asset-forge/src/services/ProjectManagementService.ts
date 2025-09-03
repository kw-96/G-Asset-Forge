/**
 * 项目管理服务
 */
import { EventEmitter } from '@g-asset-forge/common';
import {
  type GAssetForgeEditor,
  ProjectAutoSave,
  type ProjectData,
  type ProjectMetadata,
  ProjectStorageService,
} from '@g-asset-forge/core';

interface ProjectManagementEvents {
  projectOpened: (project: ProjectData) => void;
  projectClosed: (projectId: string) => void;
  projectSaved: (project: ProjectData) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectDeleted: (projectId: string) => void;
}

export class ProjectManagementService extends EventEmitter<ProjectManagementEvents> {
  private storageService: ProjectStorageService;
  private autoSaveService: ProjectAutoSave | null = null;
  private editor: GAssetForgeEditor | null = null;
  private currentProjectId: string | null = null;

  constructor() {
    super();
    this.storageService = new ProjectStorageService();
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    console.log('ProjectManagementService.setEditor 被调用');

    // 如果编辑器已经设置过，先保存当前项目
    if (this.editor && this.currentProjectId) {
      console.log('编辑器重新设置，先保存当前项目:', this.currentProjectId);
      this.saveProject();
    }

    this.editor = editor;

    // 保存当前项目ID，用于重新设置自动保存服务
    const currentProjectId = this.currentProjectId;

    // 初始化自动保存服务
    this.autoSaveService = new ProjectAutoSave(editor, this.storageService);
    console.log('自动保存服务已初始化:', !!this.autoSaveService);

    // 如果之前有项目，重新设置项目ID
    if (currentProjectId) {
      console.log('重新设置项目ID到新的自动保存服务:', currentProjectId);
      this.autoSaveService.setCurrentProject(currentProjectId);
    }

    console.log('编辑器实例已设置');
  }

  /**
   * 创建新项目
   */
  async createProject(params: {
    name: string;
    type: 'design' | 'h5';
    settings?: any;
  }): Promise<ProjectData> {
    try {
      const projectData = await this.storageService.createProject({
        name: params.name,
        type: params.type,
        settings: params.settings,
      });

      console.log('项目创建成功:', projectData.name);
      return projectData;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  /**
   * 打开项目 - 简化版本
   */
  async openProject(projectId: string): Promise<boolean> {
    try {
      console.log('打开项目:', projectId);

      // 加载项目数据
      const projectData = await this.storageService.loadProject(projectId);
      if (!projectData) {
        console.error('项目不存在:', projectId);
        return false;
      }

      console.log('项目数据加载成功:', projectData.name);
      console.log('编辑器数据:', projectData.editorData);

      // 先更新当前项目ID和自动保存服务，避免在设置内容时触发自动保存
      this.currentProjectId = projectId;

      // 更新自动保存服务的当前项目
      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(projectId);
      }

      // 直接设置编辑器内容，无需复杂的数据隔离
      if (this.editor) {
        console.log('设置编辑器内容...');
        this.editor.setContents(projectData.editorData);
        console.log('编辑器内容设置完成');

        // 同步项目设置到编辑器设置
        if (projectData.settings) {
          // 同步标尺设置
          if (projectData.settings.showRuler !== undefined) {
            this.editor.setting.set(
              'enableRuler',
              projectData.settings.showRuler,
            );
          }

          // 同步网格设置
          if (projectData.settings.showGrid !== undefined) {
            this.editor.setting.set(
              'enablePixelGrid',
              projectData.settings.showGrid,
            );
          }

          // 触发重新渲染以应用设置
          this.editor.render();
        }
      }

      // 发射事件
      this.emit('projectOpened', projectData);

      console.log('项目打开完成:', projectId);
      return true;
    } catch (error) {
      console.error('打开项目失败:', error);
      return false;
    }
  }

  /**
   * 保存当前项目
   */
  async saveProject(): Promise<boolean> {
    if (!this.currentProjectId || !this.editor) {
      console.warn('没有当前项目或编辑器实例');
      return false;
    }

    try {
      // 获取当前编辑器数据
      const editorData = this.editor.sceneGraph.toJSON();
      console.log('保存编辑器数据:', editorData);

      // 加载项目数据
      const projectData = await this.storageService.loadProject(
        this.currentProjectId,
      );
      if (!projectData) {
        console.error('项目不存在:', this.currentProjectId);
        return false;
      }

      // 更新编辑器数据 - 直接使用解析后的数据
      projectData.editorData = JSON.parse(editorData);
      projectData.updatedAt = new Date();

      console.log('更新后的项目数据:', projectData);

      // 同步编辑器设置到项目设置
      if (projectData.settings) {
        // 同步标尺设置
        projectData.settings.showRuler = this.editor.setting.get('enableRuler');

        // 同步网格设置
        projectData.settings.showGrid =
          this.editor.setting.get('enablePixelGrid');
      }

      // 保存项目
      await this.storageService.saveProject(projectData);

      console.log('项目保存成功:', projectData.name);
      this.emit('projectSaved', projectData);
      return true;
    } catch (error) {
      console.error('保存项目失败:', error);
      return false;
    }
  }

  /**
   * 重命名项目
   */
  async renameProject(projectId: string, newName: string): Promise<boolean> {
    try {
      const projectData = await this.storageService.loadProject(projectId);
      if (!projectData) {
        return false;
      }

      projectData.name = newName;
      projectData.updatedAt = new Date();

      await this.storageService.saveProject(projectData);

      console.log('项目重命名成功:', newName);
      this.emit('projectRenamed', projectId, newName);
      return true;
    } catch (error) {
      console.error('重命名项目失败:', error);
      return false;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      await this.storageService.softDeleteProject(projectId);

      // 如果删除的是当前项目，清空编辑器
      if (this.currentProjectId === projectId) {
        this.currentProjectId = null;
        if (this.editor) {
          // 清空编辑器内容
          this.editor.setContents({
            appVersion: 'g-asset-forge-editor_1.0.0',
            paperId: '',
            data: [],
          });
        }
      }

      console.log('项目删除成功:', projectId);
      this.emit('projectDeleted', projectId);
      return true;
    } catch (error) {
      console.error('删除项目失败:', error);
      return false;
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    try {
      return await this.storageService.getProjectsList();
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 获取当前项目数据
   */
  async getCurrentProject(): Promise<ProjectData | null> {
    if (!this.currentProjectId) {
      return null;
    }

    try {
      return await this.storageService.loadProject(this.currentProjectId);
    } catch (error) {
      console.error('获取当前项目失败:', error);
      return null;
    }
  }

  /**
   * 关闭当前项目
   */
  closeProject(projectId: string): void {
    if (this.currentProjectId === projectId) {
      console.log('关闭项目:', projectId);

      // 先保存项目（如果有未保存的更改）
      if (this.autoSaveService) {
        this.autoSaveService.manualSave();
      }

      this.emit('projectClosed', projectId);

      // 先清空自动保存服务，避免setContents触发自动保存
      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(null);
      }

      // 清空编辑器内容
      if (this.editor) {
        this.editor.setContents({
          appVersion: 'g-asset-forge-editor_1.0.0',
          paperId: '',
          data: [],
        });
      }

      // 最后清空当前项目ID
      this.currentProjectId = null;

      // 清理全局状态
      if (typeof window !== 'undefined') {
        // 清理全局编辑器实例
        (window as any).editor = null;
        // 清理全局项目管理服务引用
        (window as any).__PROJECT_MANAGEMENT_SERVICE__ = null;
      }
    }
  }

  /**
   * 手动保存当前项目（用于关闭项目时）
   */
  async manualSave(): Promise<boolean> {
    if (this.autoSaveService) {
      return await this.autoSaveService.manualSave();
    } else {
      console.error('自动保存服务未初始化');
      return false;
    }
  }

  /**
   * 测试自动保存功能
   */
  testAutoSave(): void {
    if (this.autoSaveService) {
      this.autoSaveService.testAutoSave();
    } else {
      console.error('自动保存服务未初始化');
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    // 保存当前项目（使用手动保存，只在有未保存更改时才保存）
    if (this.currentProjectId) {
      this.manualSave();
    }

    // 清理资源
    this.autoSaveService = null;
    this.editor = null;
    this.currentProjectId = null;

    console.log('项目管理服务已销毁');
  }
}
