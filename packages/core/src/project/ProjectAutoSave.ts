/**
 * 项目自动保存服务
 * 扩展现有的AutoSaveGraphics功能，支持项目级别的自动保存
 */
import { EventEmitter } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import { type IEditorPaperData } from '../type';
import { ProjectStorageService } from './ProjectStorageService';

interface ProjectAutoSaveEvents {
  autoSaveStart: (projectId: string) => void;
  autoSaveSuccess: (projectId: string) => void;
  autoSaveError: (data: { projectId: string; error: any }) => void;
  projectDataChanged: (projectId: string) => void;
}

/**
 * 项目自动保存类
 * 扩展现有的AutoSaveGraphics功能，支持项目级别的自动保存
 */
export class ProjectAutoSave extends EventEmitter<ProjectAutoSaveEvents> {
  private editor: GAssetForgeEditor;
  private storageService: ProjectStorageService;
  private currentProjectId: string | null = null;
  private autoSaveTimer: number | null = null;
  private isDirty = false;
  private autoSaveInterval = 30000; // 30秒
  private isAutoSaving = false;
  private handleContentChange!: () => void;

  constructor(
    editor: GAssetForgeEditor,
    storageService?: ProjectStorageService,
  ) {
    super();
    this.editor = editor;
    this.storageService = storageService || new ProjectStorageService();

    this.setupEventListeners();
  }

  /**
   * 设置当前项目ID
   */
  setCurrentProject(projectId: string | null): void {
    if (this.currentProjectId === projectId) {
      return;
    }

    // 保存当前项目（如果有未保存的更改）
    if (this.currentProjectId && this.isDirty) {
      this.saveCurrentProject();
    }

    this.currentProjectId = projectId;
    this.isDirty = false;

    // 重新启动自动保存定时器
    this.restartAutoSaveTimer();
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 设置自动保存间隔
   */
  setAutoSaveInterval(interval: number): void {
    this.autoSaveInterval = interval;
    this.restartAutoSaveTimer();
  }

  /**
   * 手动保存当前项目
   */
  async saveCurrentProject(): Promise<boolean> {
    if (!this.currentProjectId) {
      return false;
    }

    return this.saveProject(this.currentProjectId);
  }

  /**
   * 保存指定项目
   */
  async saveProject(projectId: string): Promise<boolean> {
    if (this.isAutoSaving) {
      return false;
    }

    this.isAutoSaving = true;
    this.emit('autoSaveStart', projectId);

    try {
      // 获取当前编辑器内容
      const editorData = this.getEditorData();

      // 更新项目数据
      const success = await this.storageService.updateProject(projectId, {
        editorData,
      });

      if (success) {
        this.isDirty = false;
        this.emit('autoSaveSuccess', projectId);
        return true;
      } else {
        throw new Error('更新项目数据失败');
      }
    } catch (error) {
      console.error('保存项目失败:', error);
      this.emit('autoSaveError', { projectId, error });
      return false;
    } finally {
      this.isAutoSaving = false;
    }
  }

  /**
   * 标记项目为已修改
   */
  markDirty(): void {
    if (!this.isDirty && this.currentProjectId) {
      this.isDirty = true;
      this.emit('projectDataChanged', this.currentProjectId);
    }
  }

  /**
   * 检查是否有未保存的更改
   */
  isDirtyProject(): boolean {
    return this.isDirty;
  }

  /**
   * 启用自动保存
   */
  enableAutoSave(): void {
    this.restartAutoSaveTimer();
  }

  /**
   * 禁用自动保存
   */
  disableAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 销毁自动保存服务
   */
  destroy(): void {
    this.disableAutoSave();
    // 清理事件监听器
    if (this.editor && this.editor.commandManager) {
      this.editor.commandManager.off('change', this.handleContentChange);
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听编辑器的内容变化
    this.handleContentChange = () => {
      this.markDirty();
    };

    this.editor.commandManager.on('change', this.handleContentChange);
  }

  /**
   * 重新启动自动保存定时器
   */
  private restartAutoSaveTimer(): void {
    this.disableAutoSave();

    if (this.currentProjectId) {
      this.autoSaveTimer = setInterval(() => {
        if (this.isDirty && this.currentProjectId) {
          this.saveProject(this.currentProjectId);
        }
      }, this.autoSaveInterval);
    }
  }

  /**
   * 获取编辑器数据
   */
  private getEditorData(): IEditorPaperData {
    return JSON.parse(this.editor.sceneGraph.toJSON());
  }

  /**
   * 创建项目备份
   */
  async createBackup(description: string): Promise<boolean> {
    if (!this.currentProjectId) {
      return false;
    }

    try {
      const backup = await this.storageService.createBackup(
        this.currentProjectId,
        description,
      );
      return backup !== null;
    } catch (error) {
      console.error('创建备份失败:', error);
      return false;
    }
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(): Promise<any> {
    if (!this.currentProjectId) {
      return null;
    }

    try {
      const project = await this.storageService.loadProject(
        this.currentProjectId,
      );
      if (!project) {
        return null;
      }

      return {
        projectId: this.currentProjectId,
        lastModified: project.updatedAt,
        autoSaveEnabled: this.autoSaveTimer !== null,
        isDirty: this.isDirty,
        autoSaveInterval: this.autoSaveInterval,
      };
    } catch (error) {
      console.error('获取项目统计信息失败:', error);
      return null;
    }
  }
}
