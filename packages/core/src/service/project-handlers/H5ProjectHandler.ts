/**
 * H5项目处理器
 * 处理H5项目的初始化、数据加载、状态管理和生命周期
 */

import type { GAssetForgeEditor } from '../../editor';
import type { IEditorPaperData } from '../../type';
import { ProjectType } from '../ProjectTypeManager';
import { H5StateManager } from '../state-managers/H5StateManager';
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
export interface H5ProjectState {
  selectedBlocks: string[];
  currentContainer: string | null;
  viewport: {
    zoom: number;
    offset: { x: number; y: number };
  };
  layoutSettings: {
    autoLayout: boolean;
    padding: number;
    gap: number;
  };
  uiState: {
    showContentBlocks: boolean;
    showLayers: boolean;
    showProperties: boolean;
  };
}

/**
 * H5Service接口定义
 * 定义H5Service必须实现的方法
 */
export interface IH5Service {
  initializeH5Mode(): any;
  restoreExistingH5Container(container: any): boolean;
  getCurrentContainer(): any;
  setCurrentContainer(container: any): void;
  addTextBlock(content?: string): any;
  addImageBlock(src?: string, alt?: string): any;
  addButtonBlock(text?: string): any;
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
  private stateManager: H5StateManager | null = null;
  private h5Service: IH5Service | null = null;
  private currentProjectData: H5ProjectData | null = null;

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
    // 创建H5状态管理器
    this.stateManager = new H5StateManager();

    // 创建H5Service实例
    this.h5Service = await this.createH5Service(editor);

    // 初始化状态管理器
    await this.stateManager.initialize(editor, this.h5Service);

    // 配置编辑器为H5模式
    this.configureH5Mode();

    console.log('H5项目处理器初始化完成');
  }

  /**
   * 加载H5项目数据
   */
  protected async onLoadProjectData(
    projectData: H5ProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor || !this.stateManager || !this.h5Service) {
        throw new Error('处理器未正确初始化');
      }

      // 清理当前编辑器状态
      this.clearEditorState();

      // 设置项目加载标记，防止H5EditorMode重新创建容器
      (window as any).__isProjectLoading = true;

      // 加载项目数据到编辑器
      this.editor.setContents(projectData.data);

      // 等待编辑器数据加载完成
      await this.waitForEditorReady();

      // 恢复H5容器
      const success = await this.restoreH5Container(projectData);
      if (!success) {
        console.warn('H5容器恢复失败，创建新容器');
        this.h5Service.initializeH5Mode();
      }

      // 等待H5容器完全恢复后再恢复项目状态
      await this.waitForH5ContainerReady();

      // 恢复项目状态
      if (projectData.state) {
        await this.stateManager.restoreState(projectData.state);
      }

      // 保存当前项目数据引用
      this.currentProjectData = projectData;

      // 渲染编辑器
      this.editor.render();

      // 清除项目加载标记
      (window as any).__isProjectLoading = false;

      console.log('H5项目数据加载成功');
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
    if (!this.editor || !this.stateManager || !this.h5Service) {
      throw new Error('处理器未正确初始化');
    }

    // 获取编辑器数据
    const editorData = this.editor.getContents();

    // 获取H5数据
    const h5Data = this.h5Service.exportData();

    // 获取当前状态
    const currentState = this.stateManager.getCurrentState();

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

    console.log('H5项目数据保存完成');
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
    if (!this.stateManager) {
      return null;
    }

    return this.stateManager.getCurrentState();
  }

  /**
   * 恢复H5项目状态
   */
  protected async onRestoreProjectState(state: H5ProjectState): Promise<void> {
    if (!this.stateManager) {
      throw new Error('状态管理器未初始化');
    }

    await this.stateManager.restoreState(state);
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

      // 清理状态管理器
      if (this.stateManager) {
        await this.stateManager.cleanup();
        this.stateManager = null;
      }

      // 清理编辑器状态
      this.clearEditorState();

      // 清理项目数据引用
      this.currentProjectData = null;

      console.log('H5项目资源清理完成');
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
    try {
      // 动态导入H5Service，避免循环依赖
      const { H5Service } = await import('../h5_service');

      // 创建H5Service实例
      const h5Service = new H5Service({
        autoHealthCheck: true,
        healthCheckInterval: 30000,
        containerRecoveryTimeout: 3000, // 减少等待时间
        enablePerformanceMonitoring: true,
      });

      // 初始化H5Service
      await h5Service.initialize(editor);

      console.log('H5Service实例创建成功');
      return h5Service;
    } catch (error) {
      console.error('创建H5Service实例失败:', error);

      // 如果创建失败，返回一个基础的模拟实现
      return this.createFallbackH5Service();
    }
  }

  /**
   * 创建备用H5Service实现
   */
  private createFallbackH5Service(): IH5Service {
    console.warn('使用备用H5Service实现');

    return {
      initializeH5Mode: () => {
        console.log('备用H5Service: 初始化H5模式');
        return null;
      },
      restoreExistingH5Container: (container: any) => {
        console.log('备用H5Service: 恢复H5容器', container);
        return true;
      },
      getCurrentContainer: () => null,
      setCurrentContainer: (container: any) => {
        console.log('备用H5Service: 设置当前容器', container);
      },
      addTextBlock: (content?: string) => {
        console.log('备用H5Service: 添加文本块', content);
        return null;
      },
      addImageBlock: (src?: string, alt?: string) => {
        console.log('备用H5Service: 添加图片块', src, alt);
        return null;
      },
      addButtonBlock: (text?: string) => {
        console.log('备用H5Service: 添加按钮块', text);
        return null;
      },
      removeContentBlock: (blockId: string) => {
        console.log('备用H5Service: 删除内容块', blockId);
        return true;
      },
      updateContentBlock: (blockId: string, attrs: any) => {
        console.log('备用H5Service: 更新内容块', blockId, attrs);
        return true;
      },
      getContentBlocks: () => [],
      getSelectedContentBlocks: () => [],
      exportData: () => ({ h5Container: null, contentBlocks: [] }),
      cleanup: async () => {
        console.log('备用H5Service: 清理资源');
      },
      destroy: () => {
        console.log('备用H5Service: 销毁服务');
      },
    };
  }

  /**
   * 配置编辑器为H5模式
   */
  private configureH5Mode(): void {
    // 启用H5特定功能
    // 这里可以配置编辑器的H5模式设置

    console.log('编辑器已配置为H5模式');
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
          width: 1080,
          height: 2220,
        });
        this.editor.viewportManager.setZoom(1, { x: 0, y: 0 });
      }

      console.log('编辑器状态已清理');
    } catch (error) {
      console.warn('清理编辑器状态时出错:', error);
    }
  }

  /**
   * 等待编辑器准备就绪
   */
  private async waitForEditorReady(): Promise<void> {
    return new Promise((resolve) => {
      // 简单的延迟等待，实际实现中可以监听编辑器事件
      setTimeout(resolve, 200);
    });
  }

  /**
   * 等待H5容器准备就绪
   */
  private async waitForH5ContainerReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkContainer = () => {
        if (this.h5Service?.getCurrentContainer()) {
          console.log('H5容器已准备就绪');
          resolve();
        } else {
          setTimeout(checkContainer, 100);
        }
      };
      checkContainer();
    });
  }

  /**
   * 恢复H5容器
   */
  private async restoreH5Container(
    projectData: H5ProjectData,
  ): Promise<boolean> {
    if (!this.h5Service) {
      return false;
    }

    try {
      // 从编辑器数据中查找H5容器
      const currentCanvas = this.editor?.doc.getCurrentCanvas();
      const editorData = currentCanvas?.getChildren();

      if (editorData && editorData.length > 0) {
        // 查找所有H5容器
        const h5Containers = editorData.filter(
          (child: any) => child && child.type === 'H5Container',
        );

        console.log('找到H5容器数量:', h5Containers.length);

        if (h5Containers.length > 0) {
          // 选择最新的H5容器（通常是最后一个）
          const latestContainer = h5Containers[h5Containers.length - 1];
          console.log('选择最新的H5容器:', latestContainer.attrs?.id);

          // 删除其他H5容器，只保留最新的
          h5Containers.forEach((container, index) => {
            if (index < h5Containers.length - 1) {
              console.log('删除旧的H5容器:', container.attrs?.id);
              currentCanvas?.removeChild(container);
            }
          });

          return this.h5Service.restoreExistingH5Container(latestContainer);
        }
      }

      // 如果项目数据中有H5容器信息，尝试恢复
      if (projectData.h5Container) {
        console.log('从项目数据恢复H5容器:', projectData.h5Container.id);
        return this.h5Service.restoreExistingH5Container(
          projectData.h5Container,
        );
      }

      return false;
    } catch (error) {
      console.error('恢复H5容器失败:', error);
      return false;
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
   * 获取状态管理器
   */
  getStateManager(): H5StateManager | null {
    return this.stateManager;
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
