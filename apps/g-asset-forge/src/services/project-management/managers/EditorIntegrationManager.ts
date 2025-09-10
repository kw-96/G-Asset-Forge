/**
 * 编辑器集成管理器
 * 负责编辑器实例的管理、内容初始化、状态清理等编辑器相关操作
 */

import { EventEmitter } from '@g-asset-forge/common';
import {
  type GAssetForgeEditor,
  type IEditorPaperData,
  type ProjectData,
  ProjectType,
} from '@g-asset-forge/core';

import { ErrorType, ProjectErrorHandler } from '../../ProjectErrorHandler';
import type { ProjectOperationResult } from '../types/ProjectManagementTypes';

export class EditorIntegrationManager extends EventEmitter<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editorReset: (_editor: GAssetForgeEditor) => void;
  editorCleared: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editorSet: (_editor: GAssetForgeEditor) => void;
  editorContentInitialized: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _projectData: ProjectData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _projectType: ProjectType,
  ) => void;
  editorStateCleared: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectReloaded: (_projectData: ProjectData) => void;
}> {
  private editor: GAssetForgeEditor | null = null;
  private errorHandler: ProjectErrorHandler;
  private isLoadingContent = false;
  private lastLoadedProjectId: string | null = null;

  constructor(errorHandler: ProjectErrorHandler) {
    super();
    this.errorHandler = errorHandler;
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor | null): void {
    // 如果编辑器已经设置过，先保存当前项目
    if (this.editor && editor) {
      this.emit('editorReset', this.editor);
    }

    // 如果传入 null，清理编辑器状态
    if (editor === null) {
      this.editor = null;
      this.emit('editorCleared');
      return;
    }

    this.editor = editor;
    this.emit('editorSet', editor);
  }

  /**
   * 获取当前编辑器实例
   */
  getEditor(): GAssetForgeEditor | null {
    return this.editor;
  }

  /**
   * 初始化编辑器内容
   */
  async initializeEditorContent(
    projectData: ProjectData,
    projectType: ProjectType,
  ): Promise<ProjectOperationResult> {
    try {
      if (!this.editor) {
        const error = this.errorHandler.handleError(
          new Error('编辑器实例未设置'),
          ErrorType.EDITOR_INITIALIZATION_FAILED,
          { projectName: projectData.name },
        );
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 在初始化新项目内容之前，先清理编辑器状态
      // 这确保前一个项目的数据不会影响新项目
      if (this.editor) {
        await this.clearEditorState();

        // 等待数据清理完成，确保编辑器状态完全重置
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 验证数据清理是否完成
        const remainingData = this.editor.doc?.getAllGraphicsArr() || [];
        if (remainingData.length > 0) {
          console.warn('数据清理不完整，仍有数据残留:', remainingData.length);
          // 强制清理残留数据
          this.editor.sceneGraph?.clear();
        }
      }

      // 根据项目类型进行不同的初始化
      if (projectType === ProjectType.H5) {
        await this.initializeH5Content(projectData);
      } else {
        await this.initializeDesignContent(projectData);
      }

      this.emit('editorContentInitialized', projectData, projectType);

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.EDITOR_INITIALIZATION_FAILED,
        { projectName: projectData.name, projectType },
      );
      console.error('初始化编辑器内容失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 初始化H5项目内容
   */
  private async initializeH5Content(projectData: ProjectData): Promise<void> {
    // H5项目特殊初始化逻辑
    if (this.editor) {
      // 设置H5相关状态
      (window as any).__isH5Project = true;

      // 检查项目数据格式
      if (
        projectData.editorData &&
        typeof projectData.editorData === 'object'
      ) {
        // 数据加载由loadH5ProjectData处理，避免重复调用setContents
      } else {
        console.warn('H5项目数据格式不正确，使用默认数据');
        // 默认数据加载由H5ProjectHandler.createDefaultH5Data()处理，避免重复调用setContents
      }
    }
  }

  /**
   * 初始化设计项目内容
   */
  private async initializeDesignContent(
    projectData: ProjectData,
  ): Promise<void> {
    // 设计项目初始化逻辑
    if (this.editor) {
      // 清理H5相关状态
      (window as any).__isH5Project = false;

      // 加载设计项目数据到编辑器
      this.editor.setContents(projectData.editorData as IEditorPaperData);
    }
  }

  /**
   * 加载项目数据（事件驱动版本）
   */
  async loadProjectData(projectData: ProjectData): Promise<void> {
    if (!this.editor) {
      console.error('编辑器实例不存在，无法加载项目数据');
      return;
    }

    // 简洁的防重复加载检查
    if (this.lastLoadedProjectId === projectData.id) {
      console.warn('项目数据已加载，忽略重复请求:', projectData.id);
      return;
    }

    if (!this.isEditorFullyReady()) {
      // 等待编辑器就绪事件，而不是直接返回
      await this.waitForEditorReady();
    }

    // 编辑器已经初始化完成，不需要重新清理状态

    // 根据项目类型加载数据
    if (projectData.type === 'h5') {
      await this.loadH5ProjectData(projectData);
    } else {
      await this.loadDesignProjectData(projectData);
    }

    // 记录已加载的项目ID
    this.lastLoadedProjectId = projectData.id;
  }

  /**
   * 加载H5项目数据
   */
  private async loadH5ProjectData(projectData: ProjectData): Promise<void> {
    try {
      // 确保H5相关状态正确设置（模式切换已在openProject时完成）
      (window as any).__isH5Project = true;

      // 检查项目数据格式
      if (
        projectData.editorData &&
        typeof projectData.editorData === 'object'
      ) {
        this.editor!.setContents(projectData.editorData);
      } else {
        console.warn('H5项目数据格式不正确，使用默认数据');
        // 默认数据加载由H5ProjectHandler.createDefaultH5Data()处理
      }
    } catch (error) {
      console.error('H5项目数据加载失败:', error);
      throw error; // 重新抛出错误，让上层处理
    }
  }

  /**
   * 加载设计项目数据
   */
  private async loadDesignProjectData(projectData: ProjectData): Promise<void> {
    // 确保H5相关状态正确清理（模式切换已在openProject时完成）
    (window as any).__isH5Project = false;

    // 加载设计项目数据到编辑器
    this.editor!.setContents(projectData.editorData as IEditorPaperData);

    // 项目数据加载完成后，尝试加载缓存数据
    if ((window as any).autoSaveGraphics) {
      (window as any).autoSaveGraphics.loadCachedData();
    }
  }

  /**
   * 清理编辑器状态
   */
  async clearEditorState(): Promise<void> {
    if (this.editor) {
      try {
        // 清理场景图数据（这会清理所有图形对象）
        this.editor.sceneGraph?.clear();

        // 确保完全清理图形存储管理器
        if (this.editor.doc?.graphicsStoreManager) {
          this.editor.doc.graphicsStoreManager.clear();

          // 验证清理是否完全
          const remainingGraphics = this.editor.doc.getAllGraphicsArr();
          if (remainingGraphics.length > 0) {
            console.warn('清理后仍有残留图形对象:', remainingGraphics.length);
            // 强制清理残留数据
            this.editor.doc.graphicsStoreManager.clear();
          }
        }

        // 清理选择状态
        if (this.editor.selectedElements) {
          this.editor.selectedElements.clear();
        }

        // 重置视口（使用容器实际尺寸）
        if (this.editor.viewportManager) {
          const containerSize = this.editor.viewportManager.getPageSize();
          this.editor.viewportManager.setViewportSize(containerSize);
          this.editor.viewportManager.setZoom(1, { x: 0, y: 0 });
        }

        // 清理命令历史
        if (this.editor.commandManager) {
          this.editor.commandManager.clearRecords();
        }

        // 清理H5Service相关状态
        if ((window as any).__h5Service) {
          try {
            if (typeof (window as any).__h5Service.cleanup === 'function') {
              await (window as any).__h5Service.cleanup();
            }
            if (typeof (window as any).__h5Service.destroy === 'function') {
              (window as any).__h5Service.destroy();
            }
            (window as any).__h5Service = null;
          } catch (error) {
            console.error('清理全局H5Service失败:', error);
          }
        }

        // 清理全局状态
        (window as any).__isH5Project = false;
        (window as any).__h5ContainerRestored = false;
        (window as any).__h5WaitStartTime = null;

        // 重置项目加载状态，允许重新加载项目
        this.lastLoadedProjectId = null;

        // 清理 AutoSaveGraphics 缓存
        try {
          const STORE_KEY = 'g-asset-forge-auto-save-graphics';
          const VERSION_KEY = 'g-asset-forge-auto-save-version-';
          localStorage.removeItem(STORE_KEY);
          localStorage.removeItem(VERSION_KEY + 'current');
        } catch (error) {
          console.warn('清理 AutoSaveGraphics 缓存失败:', error);
        }

        // 清理 g-asset-forge-paper 数据
        try {
          localStorage.removeItem('g-asset-forge-paper');
        } catch (error) {
          console.warn('清理 g-asset-forge-paper 数据失败:', error);
        }

        this.emit('editorStateCleared');
      } catch (error) {
        console.error('清理编辑器状态时出错:', error);
      }
    }
  }

  /**
   * 重新加载当前项目
   */
  async reloadCurrentProject(
    projectData: ProjectData,
  ): Promise<ProjectOperationResult> {
    try {
      if (!this.editor) {
        const error = this.errorHandler.handleError(
          new Error('编辑器实例未设置'),
          ErrorType.EDITOR_INITIALIZATION_FAILED,
          { projectName: projectData.name },
        );
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 重新加载项目数据
      this.editor.setContents(projectData.editorData as IEditorPaperData);
      this.emit('projectReloaded', projectData);

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.EDITOR_INITIALIZATION_FAILED,
        { projectName: projectData.name },
      );
      console.error('重新加载当前项目失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 检查编辑器是否可用
   */
  isEditorAvailable(): boolean {
    return this.editor !== null;
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
   * 等待编辑器就绪事件
   */
  private async waitForEditorReady(): Promise<void> {
    return new Promise((resolve) => {
      import('../../../events').then(({ appEventEmitter }) => {
        const handleEditorReady = () => {
          appEventEmitter.off('editorReady', handleEditorReady);
          resolve();
        };

        appEventEmitter.on('editorReady', handleEditorReady);
      });
    });
  }

  /**
   * 获取编辑器状态信息
   */
  getEditorState(): {
    isAvailable: boolean;
    hasContent: boolean;
    projectType: string | null;
  } {
    return {
      isAvailable: this.isEditorAvailable(),
      hasContent: this.editor
        ? this.editor.doc?.graphicsStoreManager.getCanvasItems().length > 0
        : false,
      projectType: (window as any).__isH5Project ? 'H5' : 'Design',
    };
  }
}
