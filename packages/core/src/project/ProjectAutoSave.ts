/**
 * 项目自动保存服务
 * 与AutoSaveGraphics配合工作：
 * - AutoSaveGraphics: 负责编辑器内容的本地缓存（用于崩溃恢复）
 * - ProjectAutoSave: 负责项目级别的持久化保存（用于项目管理）
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
  private debounceTimer: number | null = null;
  private isDirty = false;
  private autoSaveInterval = 3000; // 3秒
  private debounceDelay = 1000; // 1秒防抖延迟
  private isAutoSaving = false;
  private handleContentChange!: () => void;

  constructor(
    editor: GAssetForgeEditor,
    storageService?: ProjectStorageService,
  ) {
    super();
    this.editor = editor;
    this.storageService = storageService || new ProjectStorageService();

    console.log('ProjectAutoSave 初始化:', {
      hasEditor: !!this.editor,
      hasDoc: !!this.editor?.doc,
      hasCommandManager: !!this.editor?.commandManager,
      autoSaveInterval: this.autoSaveInterval,
    });

    // 简洁方案：直接检查并设置事件监听器
    this.setupEventListenersIfReady();
  }

  /**
   * 设置当前项目ID
   */
  setCurrentProject(projectId: string | null): void {
    console.log('设置当前项目:', {
      oldProjectId: this.currentProjectId,
      newProjectId: projectId,
      isDirty: this.isDirty,
    });

    if (this.currentProjectId === projectId) {
      console.log('项目ID相同，跳过设置');
      return;
    }

    // 保存当前项目（如果有未保存的更改）
    // 注意：只有在编辑器数据完全清理干净后才保存，避免数据污染
    if (this.currentProjectId && this.isDirty && this.editor) {
      console.log('保存当前项目的未保存更改');
      // 增加延迟时间，确保编辑器数据完全清理干净
      setTimeout(() => {
        // 再次检查编辑器状态，确保数据清理完成
        if (this.editor && this.editor.sceneGraph) {
          const dataCount = this.editor.doc.getAllGraphicsArr().length;
          console.log('延迟保存检查:', {
            dataCount,
            projectId: this.currentProjectId,
            isDirty: this.isDirty,
          });

          // 只有在数据量合理时才保存
          if (dataCount < 100) {
            // 设置合理的阈值
            this.saveCurrentProject();
          } else {
            console.warn('编辑器数据量异常，跳过保存:', dataCount);
          }
        }
      }, 200); // 增加延迟时间到200ms
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
   * 手动保存当前项目（用于关闭项目时）
   */
  manualSave(): Promise<boolean> {
    if (this.currentProjectId && this.isDirty) {
      console.log('手动保存项目:', this.currentProjectId);
      return this.saveProject(this.currentProjectId);
    } else if (this.currentProjectId) {
      console.log('项目没有未保存的更改，跳过手动保存:', this.currentProjectId);
      return Promise.resolve(true);
    } else {
      console.log('没有当前项目，跳过手动保存');
      return Promise.resolve(false);
    }
  }

  /**
   * 手动测试自动保存功能
   */
  testAutoSave(): void {
    console.log('手动测试自动保存功能:', {
      currentProjectId: this.currentProjectId,
      isDirty: this.isDirty,
      isAutoSaving: this.isAutoSaving,
      hasTimer: !!this.autoSaveTimer,
      hasEditor: !!this.editor,
      hasDoc: !!this.editor?.doc,
      hasCommandManager: !!this.editor?.commandManager,
    });

    // 手动标记为脏状态并触发保存
    if (this.currentProjectId) {
      this.markDirty();
      this.saveProject(this.currentProjectId);
    }
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
    console.log('开始自动保存项目:', projectId);

    try {
      // 获取当前编辑器内容
      const editorData = this.getEditorData();
      console.log('获取编辑器数据:', editorData);

      // 更新项目数据
      const success = await this.storageService.updateProject(projectId, {
        editorData,
      });

      if (success) {
        this.isDirty = false;
        this.emit('autoSaveSuccess', projectId);
        console.log('自动保存成功:', projectId);
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
   * 标记项目为已修改（防抖保存）
   */
  markDirty(): void {
    if (!this.isDirty && this.currentProjectId) {
      console.log('项目内容发生变化，标记为脏状态:', this.currentProjectId);
      this.isDirty = true;
      this.emit('projectDataChanged', this.currentProjectId);
    }

    // 清除之前的防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 设置新的防抖定时器，在用户停止编辑1秒后自动保存
    this.debounceTimer = setTimeout(() => {
      if (this.isDirty && this.currentProjectId) {
        console.log('用户停止编辑，触发防抖保存:', this.currentProjectId);
        this.saveProject(this.currentProjectId);
      }
    }, this.debounceDelay);
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

    // 清理防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // 清理事件监听器
    if (this.editor) {
      // 只移除我们设置的事件监听器
      if (this.editor.doc) {
        this.editor.doc.off('sceneChange', this.handleContentChange);
      }
      // 注意：不清理commandManager事件，因为AutoSaveGraphics在使用
    }
  }

  /**
   * 检查并设置事件监听器 - 事件驱动版本
   */
  private setupEventListenersIfReady(): void {
    // 检查编辑器是否完全就绪
    if (this.isEditorFullyReady()) {
      this.setupEventListeners();
    } else {
      console.log('编辑器未就绪，等待编辑器就绪事件');
      // 监听编辑器就绪事件，而不是重试
      this.waitForEditorReady();
    }
  }

  /**
   * 等待编辑器就绪事件
   */
  private waitForEditorReady(): void {
    // 监听应用级别的编辑器就绪事件
    import('../../../../apps/g-asset-forge/src/events').then(
      ({ appEventEmitter }) => {
        appEventEmitter.on('editorReady', () => {
          console.log('收到编辑器就绪事件，开始设置事件监听器');
          this.setupEventListeners();
        });
      },
    );
  }

  /**
   * 检查编辑器是否完全就绪
   */
  private isEditorFullyReady(): boolean {
    return !!(
      this.editor &&
      this.editor.doc &&
      this.editor.sceneGraph &&
      this.editor.toolManager &&
      this.editor.viewportManager
    );
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听编辑器的内容变化
    this.handleContentChange = () => {
      console.log('检测到内容变化事件');
      this.markDirty();
    };

    // 只监听文档的场景变化事件，避免与AutoSaveGraphics重复
    // AutoSaveGraphics已经监听了commandManager.on('change')
    this.editor!.doc!.on('sceneChange', this.handleContentChange);
    console.log('已设置 sceneChange 事件监听器');

    // 注意：不监听commandManager.on('change')，因为AutoSaveGraphics已经在处理
    console.log(
      'ProjectAutoSave 只监听 sceneChange 事件，避免与 AutoSaveGraphics 重复',
    );
  }

  /**
   * 重新启动自动保存定时器
   */
  private restartAutoSaveTimer(): void {
    // 防止重复启动定时器
    if (this.autoSaveTimer) {
      console.log('自动保存定时器已存在，跳过重复启动');
      return;
    }

    this.disableAutoSave();

    if (this.currentProjectId) {
      console.log('启动自动保存定时器:', {
        projectId: this.currentProjectId,
        interval: this.autoSaveInterval,
        isDirty: this.isDirty,
      });

      this.autoSaveTimer = setInterval(() => {
        console.log('自动保存定时器触发:', {
          isDirty: this.isDirty,
          currentProjectId: this.currentProjectId,
        });

        // 每3秒检查一次，如果有脏数据就保存
        if (this.isDirty && this.currentProjectId) {
          console.log('定时器触发自动保存:', this.currentProjectId);
          this.saveProject(this.currentProjectId);
        }
      }, this.autoSaveInterval);
    } else {
      console.log('没有当前项目，不启动自动保存定时器');
    }
  }

  /**
   * 获取编辑器数据
   */
  private getEditorData(): IEditorPaperData {
    // 确保编辑器状态完全清理后再获取数据
    if (!this.editor || !this.editor.sceneGraph) {
      console.warn('编辑器或场景图不存在，返回空数据');
      return {
        appVersion: 'g-asset-forge-editor_1.0.0',
        paperId: 'empty-paper',
        data: [],
      };
    }

    const editorData = JSON.parse(this.editor.sceneGraph.toJSON());
    console.log('获取编辑器数据:', {
      dataCount: editorData.data?.length || 0,
      projectId: this.currentProjectId,
    });

    return editorData;
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
