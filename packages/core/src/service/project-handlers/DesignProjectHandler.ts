/**
 * 设计项目处理器
 * 处理设计项目的初始化、数据加载、状态管理和生命周期
 */

import type { GAssetForgeEditor } from '../../editor';
import type { IEditorPaperData } from '../../type';
import { ProjectType } from '../ProjectTypeManager';
import { DesignStateManager } from '../state-managers/DesignStateManager';
import { BaseProjectHandler, type ProjectData } from './ProjectHandler';

/**
 * 设计项目数据格式
 */
export interface DesignProjectData extends ProjectData {
  type: ProjectType.DESIGN;
  data: IEditorPaperData;
  state?: any; // 设计项目状态
}

/**
 * 设计项目状态
 */
export interface DesignProjectState {
  selectedElements: string[];
  currentPage: string | null;
  viewport: {
    zoom: number;
    offset: { x: number; y: number };
  };
  toolSettings: Record<string, any>;
  uiState: {
    showPages: boolean;
    showLayers: boolean;
    showProperties: boolean;
  };
}

/**
 * 设计项目处理器
 * 负责设计项目的完整生命周期管理
 */
export class DesignProjectHandler extends BaseProjectHandler {
  private stateManager: DesignStateManager | null = null;
  private currentProjectData: DesignProjectData | null = null;

  constructor() {
    super();
  }

  /**
   * 获取处理器支持的项目类型
   */
  getSupportedProjectType(): ProjectType {
    return ProjectType.DESIGN;
  }

  /**
   * 初始化设计项目处理器
   */
  protected async onInitialize(editor: GAssetForgeEditor): Promise<void> {
    // 创建设计状态管理器
    this.stateManager = new DesignStateManager();
    await this.stateManager.initialize(editor);

    // 配置编辑器为设计模式
    this.configureDesignMode(editor);

    console.log('设计项目处理器初始化完成');
  }

  /**
   * 加载设计项目数据
   */
  protected async onLoadProjectData(
    projectData: DesignProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor || !this.stateManager) {
        throw new Error('处理器未正确初始化');
      }

      // 清理当前编辑器状态
      this.clearEditorState();

      // 加载项目数据到编辑器
      this.editor.setContents(projectData.data);

      // 恢复项目状态
      if (projectData.state) {
        await this.stateManager.restoreState(projectData.state);
      }

      // 保存当前项目数据引用
      this.currentProjectData = projectData;

      // 渲染编辑器
      this.editor.render();

      console.log('设计项目数据加载成功');
      return true;
    } catch (error) {
      console.error('设计项目数据加载失败:', error);
      return false;
    }
  }

  /**
   * 保存设计项目数据
   */
  protected async onSaveProjectData(): Promise<DesignProjectData> {
    if (!this.editor || !this.stateManager) {
      throw new Error('处理器未正确初始化');
    }

    // 获取编辑器数据
    const editorData = this.editor.getContents();

    // 获取当前状态
    const currentState = this.stateManager.getCurrentState();

    // 构建项目数据
    const projectData: DesignProjectData = {
      type: ProjectType.DESIGN,
      data: editorData,
      state: currentState,
      metadata: {
        ...this.currentProjectData?.metadata,
        updatedAt: new Date(),
        version: '1.0.0',
      },
    };

    // 更新当前项目数据引用
    this.currentProjectData = projectData;

    console.log('设计项目数据保存完成');
    return projectData;
  }

  /**
   * 验证设计项目数据
   */
  protected onValidateProjectData(projectData: any): boolean {
    // 检查基本结构
    if (!projectData.data) {
      console.warn('设计项目数据缺少data字段');
      return false;
    }

    // 检查编辑器数据格式
    if (!this.isValidEditorData(projectData.data)) {
      console.warn('设计项目数据格式无效');
      return false;
    }

    // 确保不包含H5特定元素
    if (this.containsH5Elements(projectData.data)) {
      console.warn('设计项目数据包含H5特定元素');
      return false;
    }

    return true;
  }

  /**
   * 获取设计项目状态
   */
  protected onGetProjectState(): DesignProjectState | null {
    if (!this.stateManager) {
      return null;
    }

    return this.stateManager.getCurrentState();
  }

  /**
   * 恢复设计项目状态
   */
  protected async onRestoreProjectState(
    state: DesignProjectState,
  ): Promise<void> {
    if (!this.stateManager) {
      throw new Error('状态管理器未初始化');
    }

    await this.stateManager.restoreState(state);
  }

  /**
   * 清理设计项目资源
   */
  protected async onCleanup(): Promise<void> {
    try {
      // 清理编辑器状态
      this.clearEditorState();

      // 清理状态管理器
      if (this.stateManager) {
        await this.stateManager.cleanup();
        this.stateManager = null;
      }

      // 清理项目数据引用
      this.currentProjectData = null;

      console.log('设计项目资源清理完成');
    } catch (error) {
      console.error('设计项目资源清理失败:', error);
      throw error;
    }
  }

  /**
   * 配置编辑器为设计模式
   */
  private configureDesignMode(_editor: GAssetForgeEditor): void {
    // 启用标准设计功能
    // 这里可以配置编辑器的特定设置

    // 设置默认工具
    // _editor.setActiveTool('select');

    // 配置画布设置
    // _editor.setCanvasSettings({ ... });

    console.log('编辑器已配置为设计模式');
  }

  /**
   * 清理编辑器状态
   */
  private clearEditorState(): void {
    if (!this.editor) return;

    try {
      // 清理画布上的所有元素
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (currentCanvas) {
        const children = currentCanvas.getChildren();
        children.forEach((child) => {
          currentCanvas.removeChild(child);
        });
      }

      // 清理选择状态
      if (this.editor.selectedElements) {
        this.editor.selectedElements.clear();
      }

      // 重置视口
      if (this.editor.viewportManager) {
        this.editor.viewportManager.setViewportSize({
          width: 800,
          height: 600,
        });
        this.editor.viewportManager.setZoom(1, { x: 0, y: 0 });
      }

      console.log('编辑器状态已清理');
    } catch (error) {
      console.warn('清理编辑器状态时出错:', error);
    }
  }

  /**
   * 验证编辑器数据格式
   */
  private isValidEditorData(data: any): boolean {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 检查是否有data数组
    if (!Array.isArray(data.data)) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否包含H5特定元素
   */
  private containsH5Elements(data: any): boolean {
    if (!data.data || !Array.isArray(data.data)) {
      return false;
    }

    return data.data.some((item: any) => {
      const type = item.type || item.attrs?.type;
      return (
        type === 'H5Container' ||
        type === 'H5TextBlock' ||
        type === 'H5ImageBlock' ||
        type === 'H5ButtonBlock'
      );
    });
  }

  /**
   * 获取当前项目数据
   */
  getCurrentProjectData(): DesignProjectData | null {
    return this.currentProjectData;
  }

  /**
   * 获取状态管理器
   */
  getStateManager(): DesignStateManager | null {
    return this.stateManager;
  }
}
