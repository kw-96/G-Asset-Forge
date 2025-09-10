/**
 * 设计项目处理器
 * 处理设计项目的初始化、数据加载、状态管理和生命周期
 */

import type { GAssetForgeEditor } from '../../editor';
import type { IEditorPaperData } from '../../type';
import { ProjectType } from '../ProjectTypeManager';
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
export type DesignProjectState = IEditorPaperData;

/**
 * 设计项目处理器
 * 负责设计项目的完整生命周期管理
 */
export class DesignProjectHandler extends BaseProjectHandler {
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
    // 状态管理已简化，直接使用编辑器

    // 配置编辑器为设计模式
    this.configureDesignMode(editor);
  }

  /**
   * 加载设计项目数据
   */
  protected async onLoadProjectData(
    projectData: DesignProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor) {
        throw new Error('处理器未正确初始化');
      }

      // 清理当前编辑器状态
      this.clearEditorState();

      // 加载项目数据到编辑器
      this.editor.setContents(projectData.data);

      // 项目状态通过编辑器内容自动恢复

      // 保存当前项目数据引用
      this.currentProjectData = projectData;

      // 渲染编辑器
      this.editor.render();

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
    if (!this.editor) {
      throw new Error('处理器未正确初始化');
    }

    // 获取编辑器数据
    const editorData = this.editor.getContents();

    // 获取当前状态（简化：直接使用编辑器内容）
    const currentState = this.editor.getContents();

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
    if (!this.editor) {
      return null;
    }

    // 简化：直接返回编辑器内容作为状态
    return this.editor.getContents();
  }

  /**
   * 恢复设计项目状态
   */
  protected async onRestoreProjectState(
    state: DesignProjectState,
  ): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器未初始化');
    }

    // 简化：直接设置编辑器内容
    this.editor.setContents(state);
  }

  /**
   * 清理设计项目资源
   */
  protected async onCleanup(): Promise<void> {
    try {
      // 清理编辑器状态
      this.clearEditorState();

      // 状态管理已简化，无需额外清理

      // 清理项目数据引用
      this.currentProjectData = null;

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

      // 重置视口（无限画布模式）
      if (this.editor.viewportManager) {
        // 获取容器实际尺寸，而不是固定尺寸
        const containerSize = this.editor.viewportManager.getPageSize();
        this.editor.viewportManager.setViewportSize(containerSize);
        this.editor.viewportManager.setZoom(1, { x: 0, y: 0 });
      }

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
   * 获取状态管理器（已简化，不再需要）
   */
  getStateManager(): null {
    return null;
  }
}
