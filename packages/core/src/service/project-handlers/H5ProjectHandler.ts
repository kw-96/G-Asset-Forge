/**
 * H5项目处理器
 * 处理H5项目的初始化、数据加载、状态管理和生命周期
 */

import type { GAssetForgeEditor } from '../../editor';
import { GAssetForgeCanvas } from '../../graphics/canvas';
import { type IPaint, PaintType } from '../../paint';
import { GraphicsType, type IEditorPaperData } from '../../type';
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

    console.log('H5项目处理器初始化完成');
  }

  /**
   * 加载H5项目数据
   */
  protected async onLoadProjectData(
    projectData: H5ProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor || !this.h5Service) {
        throw new Error('处理器未正确初始化');
      }

      // 清理当前编辑器状态
      this.clearEditorState();

      // 设置项目加载标记，防止H5EditorMode重新创建容器
      (window as any).__isProjectLoading = true;

      // 检查项目数据格式
      console.log('H5项目数据格式检查:', {
        hasData: !!projectData.data,
        dataType: typeof projectData.data,
        dataKeys: projectData.data ? Object.keys(projectData.data) : [],
        hasH5Container: !!projectData.h5Container,
        hasContentBlocks: !!projectData.contentBlocks,
      });

      // 加载项目数据到编辑器
      if (projectData.data) {
        console.log('加载H5项目数据到编辑器:', projectData.data);
        this.editor.setContents(projectData.data);
      } else {
        console.warn('H5项目数据中缺少data字段，使用默认数据');
        // 如果没有data，使用默认的H5数据结构
        const defaultData = this.createDefaultH5Data();
        this.editor.setContents(defaultData);
      }

      // 等待编辑器数据加载完成
      await this.waitForEditorReady();

      // 确保H5项目有可用的画布
      await this.ensureH5CanvasExists();

      // 恢复H5容器
      const success = await this.restoreH5Container(projectData);
      if (!success) {
        console.warn('H5容器恢复失败，创建新容器');
        this.h5Service.initializeH5Mode();
      }

      // 等待H5容器完全恢复后再恢复项目状态
      await this.waitForH5ContainerReady();

      // 项目状态通过编辑器内容自动恢复

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
   * 创建默认H5数据
   */
  private createDefaultH5Data(): IEditorPaperData {
    return {
      appVersion: 'g-asset-forge-editor_1.0.0',
      paperId: 'h5-default-paper',
      data: [
        // 添加默认的H5画布（不可编辑，仅作为背景容器）
        {
          id: 'h5-canvas-1',
          type: GraphicsType.Canvas,
          objectName: 'Page 1',
          width: 0,
          height: 0,
          transform: [1, 0, 0, 1, 0, 0],
          fill: [
            { type: PaintType.Solid, attrs: { r: 255, g: 255, b: 255, a: 1 } },
          ],
          lock: true, // 锁定画布，不可编辑
        },
        // 添加默认的H5容器
        {
          id: 'h5-container-1',
          type: 'H5Container' as any,
          objectName: 'H5长图容器',
          width: 1080, // H5长图标准宽度
          height: 2220, // H5长图标准高度
          transform: [1, 0, 0, 1, 0, 0],
          fill: [
            { type: PaintType.Solid, attrs: { r: 248, g: 249, b: 250, a: 1 } },
          ],
          parentIndex: {
            guid: 'h5-canvas-1',
            position: '0',
          },
        },
      ],
    };
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
    const h5Service = new H5Service({
      autoHealthCheck: true,
      healthCheckInterval: 30000,
      containerRecoveryTimeout: 3000, // 减少等待时间
      enablePerformanceMonitoring: true,
    });

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

      // 重置视口（无限画布模式）
      if (this.editor.viewportManager) {
        // 获取容器实际尺寸，而不是固定尺寸
        const containerSize = this.editor.viewportManager.getPageSize();
        this.editor.viewportManager.setViewportSize(containerSize);
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
   * 确保H5项目有可用的画布
   */
  private async ensureH5CanvasExists(): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器实例不存在');
    }

    try {
      // 检查当前画布是否存在
      let currentCanvas = this.editor.doc.getCurrentCanvas();

      if (!currentCanvas) {
        console.log('H5项目：当前画布不存在，尝试创建或设置画布');

        // 检查是否有画布项目
        const canvasItems =
          this.editor.doc.graphicsStoreManager.getCanvasItems();

        if (canvasItems.length > 0) {
          // 如果有画布项目，设置第一个为当前画布
          const firstCanvas = canvasItems[0];
          if (firstCanvas && firstCanvas.attrs && firstCanvas.attrs.id) {
            console.log(
              'H5项目：设置现有画布为当前画布:',
              firstCanvas.attrs.id,
            );
            this.editor.doc.setCurrentCanvas(firstCanvas.attrs.id);
            currentCanvas = this.editor.doc.getCurrentCanvas();
          }
        } else {
          // 如果没有画布项目，创建一个
          console.log('H5项目：创建新的画布项目');
          await this.createH5Canvas();
          currentCanvas = this.editor.doc.getCurrentCanvas();
        }
      }

      if (!currentCanvas) {
        throw new Error('无法确保H5项目画布存在');
      }

      console.log('H5项目画布确保成功:', {
        canvasId: currentCanvas.attrs?.id,
        canvasName: currentCanvas.attrs?.objectName,
        childrenCount: currentCanvas.getChildren?.()?.length || 0,
      });
    } catch (error) {
      console.error('确保H5项目画布存在失败:', error);
      throw error;
    }
  }

  /**
   * 创建H5画布
   */
  private async createH5Canvas(): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器实例不存在');
    }

    try {
      // 创建无限画布图形对象（使用固定ID）
      const canvasData = {
        id: 'h5-canvas-1', // 固定ID，确保每次打开都一致
        objectName: 'Page 1',
        width: 0, // 0表示无限宽度
        height: 0, // 0表示无限高度
        transform: [1, 0, 0, 1, 0, 0] as [
          number,
          number,
          number,
          number,
          number,
          number,
        ],
        fill: [
          {
            type: PaintType.Solid,
            attrs: { r: 255, g: 255, b: 255, a: 1 },
            visible: true,
          } as IPaint,
        ],
        lock: true, // 锁定画布，不可编辑
      };

      // 创建画布图形对象
      const canvasGraphics = new GAssetForgeCanvas(canvasData, {
        doc: this.editor.doc,
      });

      // 添加到文档
      this.editor.doc.addGraphics(canvasGraphics);

      // 设置为当前画布
      this.editor.doc.setCurrentCanvas(canvasData.id);

      console.log('H5画布创建成功:', canvasData.id);
    } catch (error) {
      console.error('创建H5画布失败:', error);
      throw error;
    }
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

          const success =
            this.h5Service.restoreExistingH5Container(latestContainer);
          if (success) {
            // 发射H5容器恢复事件，通知H5EditorMode
            this.emitH5ContainerRestored(latestContainer.attrs?.id);
            console.log('H5ProjectHandler: H5容器恢复成功，发射恢复事件');
          }
          return success;
        }
      }

      // 如果项目数据中有H5容器信息，尝试恢复
      if (projectData.h5Container) {
        console.log('从项目数据恢复H5容器:', projectData.h5Container.id);
        const success = this.h5Service.restoreExistingH5Container(
          projectData.h5Container,
        );
        if (success) {
          // 发射H5容器恢复事件，通知H5EditorMode
          this.emitH5ContainerRestored(projectData.h5Container.id);
          console.log(
            'H5ProjectHandler: 从项目数据恢复H5容器成功，发射恢复事件',
          );
        }
        return success;
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
