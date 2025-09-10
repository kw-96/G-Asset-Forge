/**
 * H5项目处理器
 * 处理H5项目的初始化、数据加载、状态管理和生命周期
 */

import type { GAssetForgeEditor } from '../../editor';
import type { IEditorPaperData } from '../../type';
import { ProjectType } from '../ProjectTypeManager';
import { BaseProjectHandler, type ProjectData } from './ProjectHandler';

/**
 * H5容器数据
 */
export interface H5ContainerData {
  id: string;
  type: 'H5Container';
  width: number;
  height: number;
  backgroundColor?: string;
  padding?: number;
  gap?: number;
  autoLayout?: boolean;
  disableMove?: boolean; // 是否禁止移动
  childrenIds?: string[];
  children?: any[]; // 添加子元素数组
}

/**
 * 内容块数据
 */
export interface ContentBlockData {
  id: string;
  type: 'H5TextBlock' | 'H5ImageBlock' | 'H5ButtonBlock';
  parentId: string;
  order: number;
  content: any;
  style: any;
}

/**
 * H5项目数据格式
 */
export interface H5ProjectData extends ProjectData {
  type: ProjectType.H5;
  data: IEditorPaperData;
  h5Container?: H5ContainerData;
  contentBlocks?: ContentBlockData[];
  state?: any; // H5项目状态
}

/**
 * H5项目状态
 */
export type H5ProjectState = IEditorPaperData;

/**
 * H5Service接口定义
 * 定义H5Service必须实现的方法
 */
export interface IH5Service {
  initializeH5Mode(): any;
  restoreExistingH5Container(container: any): boolean;
  getCurrentContainer(): any;
  setCurrentContainer(container: any): void;
  addTextBlock(content?: string): Promise<any>;
  addImageBlock(src?: string, alt?: string): Promise<any>;
  addButtonBlock(text?: string): Promise<any>;
  removeContentBlock(blockId: string): boolean;
  updateContentBlock(blockId: string, attrs: any): boolean;
  getContentBlocks(): any[];
  getSelectedContentBlocks(): any[];
  exportData(): { h5Container: any; contentBlocks: any[] };
  cleanup(): Promise<void>;
  destroy(): void;
}

/**
 * H5项目处理器
 * 负责H5项目的完整生命周期管理
 */
export class H5ProjectHandler extends BaseProjectHandler {
  private h5Service: IH5Service | null = null;
  private currentProjectData: H5ProjectData | null = null;

  // 添加H5容器恢复事件
  emitH5ContainerRestored(containerId: string): void {
    this.emitEvent('h5ContainerRestored', { containerId });
  }

  constructor() {
    super();
  }

  /**
   * 获取处理器支持的项目类型
   */
  getSupportedProjectType(): ProjectType {
    return ProjectType.H5;
  }

  /**
   * 初始化H5项目处理器
   */
  protected async onInitialize(editor: GAssetForgeEditor): Promise<void> {
    // 创建H5Service实例
    this.h5Service = await this.createH5Service(editor);

    // 配置编辑器为H5模式
    this.configureH5Mode();
  }

  /**
   * 加载H5项目数据（简化版，和设计项目一样简单）
   */
  protected async onLoadProjectData(
    projectData: H5ProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor) {
        throw new Error('处理器未正确初始化');
      }

      // 清理当前编辑器状态
      this.clearEditorState();

      // 加载项目数据到编辑器（编辑器会自动处理H5容器）
      this.editor.setContents(projectData.data);

      // 项目状态通过编辑器内容自动恢复

      // 保存当前项目数据引用
      this.currentProjectData = projectData;

      // 渲染编辑器
      this.editor.render();

      return true;
    } catch (error) {
      console.error('H5项目数据加载失败:', error);
      return false;
    }
  }

  /**
   * 保存H5项目数据
   */
  protected async onSaveProjectData(): Promise<H5ProjectData> {
    if (!this.editor || !this.h5Service) {
      throw new Error('处理器未正确初始化');
    }

    // 获取编辑器数据
    const editorData = this.editor.getContents();

    // 获取H5数据
    const h5Data = this.h5Service.exportData();

    // 获取当前状态（简化：直接使用编辑器内容）
    const currentState = this.editor.getContents();

    // 构建项目数据
    const projectData: H5ProjectData = {
      type: ProjectType.H5,
      data: editorData,
      h5Container: h5Data.h5Container,
      contentBlocks: h5Data.contentBlocks,
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
   * 验证H5项目数据
   */
  protected onValidateProjectData(projectData: any): boolean {
    // 检查基本结构
    if (!projectData.data) {
      console.warn('H5项目数据缺少data字段');
      return false;
    }

    // 检查H5特定字段
    const hasH5Container =
      projectData.h5Container || this.containsH5Container(projectData.data);

    if (!hasH5Container) {
      console.warn('H5项目数据缺少H5Container');
      return false;
    }

    // 检查编辑器数据格式
    if (!this.isValidEditorData(projectData.data)) {
      console.warn('H5项目数据格式无效');
      return false;
    }

    return true;
  }

  /**
   * 获取H5项目状态
   */
  protected onGetProjectState(): H5ProjectState | null {
    if (!this.editor) {
      return null;
    }

    // 简化：直接返回编辑器内容作为状态
    return this.editor.getContents();
  }

  /**
   * 恢复H5项目状态
   */
  protected async onRestoreProjectState(state: H5ProjectState): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器未初始化');
    }

    // 简化：直接设置编辑器内容
    this.editor.setContents(state);
  }

  /**
   * 清理H5项目资源
   */
  protected async onCleanup(): Promise<void> {
    try {
      // 执行H5Service健康检查
      if (
        this.h5Service &&
        typeof (this.h5Service as any).performHealthCheck === 'function'
      ) {
        const healthResult = await (this.h5Service as any).performHealthCheck();
        if (!healthResult.isHealthy) {
          console.warn('H5Service健康检查发现问题:', healthResult.issues);
        }
      }

      // 清理H5Service
      if (this.h5Service) {
        await this.h5Service.cleanup();

        // 如果是完整的H5Service实例，调用destroy方法
        if (typeof (this.h5Service as any).destroy === 'function') {
          (this.h5Service as any).destroy();
        }

        this.h5Service = null;
      }

      // 状态管理已简化，无需额外清理

      // 清理编辑器状态
      this.clearEditorState();

      // 清理项目数据引用
      this.currentProjectData = null;
    } catch (error) {
      console.error('H5项目资源清理失败:', error);
      throw error;
    }
  }

  /**
   * 创建H5Service实例
   */
  private async createH5Service(
    editor: GAssetForgeEditor,
  ): Promise<IH5Service> {
    // 动态导入H5Service，避免循环依赖
    const { H5Service } = await import('../h5_service');

    // 创建H5Service实例
    const h5Service = new H5Service();

    // 初始化H5Service
    await h5Service.initialize(editor);

    return h5Service;
  }

  /**
   * 配置编辑器为H5模式
   */
  private configureH5Mode(): void {
    // 启用H5特定功能
    // 这里可以配置编辑器的H5模式设置

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
   * 检查是否包含H5容器
   */
  private containsH5Container(data: any): boolean {
    if (!data.data || !Array.isArray(data.data)) {
      return false;
    }

    return data.data.some((item: any) => {
      const type = item.type || item.attrs?.type;
      return type === 'H5Container';
    });
  }

  /**
   * 获取当前项目数据
   */
  getCurrentProjectData(): H5ProjectData | null {
    return this.currentProjectData;
  }

  /**
   * 获取状态管理器（已简化，不再需要）
   */
  getStateManager(): null {
    return null;
  }

  /**
   * 获取H5Service
   */
  getH5Service(): IH5Service | null {
    return this.h5Service;
  }

  /**
   * 设置H5Service（用于依赖注入）
   */
  setH5Service(h5Service: IH5Service): void {
    this.h5Service = h5Service;
  }

  /**
   * 获取H5Service健康状态
   */
  async getH5ServiceHealth(): Promise<any> {
    if (!this.h5Service) {
      return {
        isHealthy: false,
        issues: ['H5Service实例不存在'],
        timestamp: Date.now(),
      };
    }

    // 如果是完整的H5Service实例，执行健康检查
    if (typeof (this.h5Service as any).performHealthCheck === 'function') {
      return await (this.h5Service as any).performHealthCheck();
    }

    // 基础健康检查
    return {
      isHealthy: true,
      issues: [],
      timestamp: Date.now(),
    };
  }

  /**
   * 获取H5Service性能指标
   */
  getH5ServiceMetrics(): any {
    if (!this.h5Service) {
      return null;
    }

    // 如果是完整的H5Service实例，获取性能指标
    if (typeof (this.h5Service as any).getPerformanceMetrics === 'function') {
      return (this.h5Service as any).getPerformanceMetrics();
    }

    return null;
  }
}
