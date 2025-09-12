/**
 * H5Service - H5项目的精简服务
 * 只负责H5容器和内容块的核心管理功能
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../editor';
import type { IH5Service } from './project-handlers/H5ProjectHandler';

/**
 * H5Service事件接口
 */
interface H5ServiceEvents {
  componentsChanged: (components: any[]) => void;
  selectionChanged: (selectedComponents: string[]) => void;
  error: (error: Error) => void;
  healthCheck: (isHealthy: boolean, issues?: string[]) => void;
}

/**
 * H5Service核心功能
 */
export class H5Service
  extends EventEmitter<H5ServiceEvents>
  implements IH5Service
{
  private editor: GAssetForgeEditor | null = null;
  private currentContainer: any = null;

  constructor() {
    super();
  }

  /**
   * 初始化H5Service
   */
  async initialize(editor: GAssetForgeEditor): Promise<void> {
    this.editor = editor;
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;

    // 监听编辑器事件，自动初始化H5模式
    this.setupEditorEventListeners();

    // 立即尝试同步H5容器（不等待事件）
    this.autoInitializeH5Mode().catch(console.error);
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) {
      return;
    }

    // 监听画布准备完成事件
    this.editor.on('canvasReady', () => {
      this.autoInitializeH5Mode().catch(console.error);
    });
  }

  /**
   * 自动初始化H5模式
   */
  private async autoInitializeH5Mode(): Promise<void> {
    if (!this.editor) {
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      return;
    }

    // 检查是否已存在H5容器（兼容序列化后的Frame类型）
    const existingH5Container = currentCanvas
      .getChildren()
      .find((child: any) => {
        const type = child.type || child.attrs?.type;
        const id = child.attrs?.id || child.id;
        return (
          type === 'H5Container' ||
          (type === 'Frame' && id && id.includes('h5-container'))
        );
      });

    if (existingH5Container) {
      this.currentContainer = existingH5Container;
      this.syncH5Container();
    } else {
      try {
        await this.initializeH5Mode();
      } catch (error) {
        console.error('H5Service: 创建H5容器失败:', error);
      }
    }
  }

  /**
   * 同步H5容器状态
   */
  private syncH5Container(): void {
    if (!this.editor?.doc) {
      console.warn('H5Service: 编辑器或文档不存在，无法同步H5容器');
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      console.warn('H5Service: 当前画布不存在，无法同步H5容器');
      return;
    }

    // 查找H5容器（兼容序列化后的Frame类型）
    const h5Container = currentCanvas.getChildren().find((child: any) => {
      const type = child.type || child.attrs?.type;
      const id = child.attrs?.id || child.id;
      return (
        type === 'H5Container' ||
        (type === 'Frame' && id && id.includes('h5-container'))
      );
    });

    if (h5Container) {
      this.currentContainer = h5Container;
    } else {
      console.warn('H5Service: 未找到H5容器');
    }
  }

  /**
   * 添加H5容器到画布
   */
  private addH5ContainerToCanvas(): void {
    if (!this.editor || !this.currentContainer) {
      console.warn('H5Service: 无法添加H5容器：编辑器或容器不存在');
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      console.warn('H5Service: 画布不存在，H5容器添加失败');
      return;
    }

    // 检查是否已存在H5容器（兼容序列化后的Frame类型）
    const existingContainer = currentCanvas.getChildren().find((child: any) => {
      const type = child.type || child.attrs?.type;
      const id = child.attrs?.id || child.id;
      return (
        type === 'H5Container' ||
        (type === 'Frame' && id && id.includes('h5-container'))
      );
    });

    if (existingContainer) {
      this.currentContainer = existingContainer;
      return;
    }

    // 添加H5容器到画布
    if (
      this.currentContainer &&
      typeof this.currentContainer.insertInto === 'function'
    ) {
      this.currentContainer.insertInto(currentCanvas);
    } else {
      currentCanvas.insertChild(this.currentContainer);
    }
  }

  /**
   * 初始化H5模式
   */
  async initializeH5Mode(_projectData?: any): Promise<any> {
    if (!this.editor) {
      console.warn('H5Service: 编辑器不存在，无法初始化H5模式');
      return null;
    }

    // 创建默认H5容器
    const container = await this.createDefaultContainer();
    this.currentContainer = container;

    // 添加H5容器到画布
    this.addH5ContainerToCanvas();

    // 同步状态
    this.syncH5Container();

    return container;
  }

  /**
   * 创建默认H5容器
   */
  private async createDefaultContainer(): Promise<any> {
    if (!this.editor?.doc) {
      throw new Error('编辑器文档不存在，无法创建H5容器');
    }

    // 动态导入H5Container类
    const { H5Container } = await import('../graphics/h5/h5_container');

    return new H5Container(
      {
        id: 'h5-container-1',
        objectName: 'H5容器',
        width: 1080,
        height: 2220,
        resizeToFit: false,
        disableMove: true, // 禁止移动H5容器
      },
      { doc: this.editor.doc },
    );
  }

  /**
   * 添加任意组件到H5容器
   */
  addComponent(component: any): boolean {
    if (!this.currentContainer) {
      console.warn('H5Service: 无法添加组件：H5容器不存在');
      return false;
    }

    // 使用H5容器的insertChild方法添加组件
    if (typeof this.currentContainer.insertChild === 'function') {
      this.currentContainer.insertChild(component);
      return true;
    }

    console.warn('H5Service: H5容器不支持insertChild方法');
    return false;
  }

  /**
   * 获取当前H5容器
   */
  getCurrentContainer(): any {
    return this.currentContainer;
  }

  /**
   * 设置当前H5容器
   */
  setCurrentContainer(container: any): void {
    this.currentContainer = container;
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    this.editor = null;
    this.currentContainer = null;
  }

  /**
   * 移除组件
   */
  removeComponent(componentId: string): boolean {
    if (!this.currentContainer) {
      console.warn('H5Service: 无法移除组件：H5容器不存在');
      return false;
    }

    const children = this.currentContainer.getChildren();
    const component = children.find(
      (child: any) => child.attrs?.id === componentId,
    );

    if (component && typeof this.currentContainer.removeChild === 'function') {
      this.currentContainer.removeChild(component);
      return true;
    }

    return false;
  }

  /**
   * 获取所有组件
   */
  getAllComponents(): any[] {
    if (!this.currentContainer) {
      return [];
    }

    return this.currentContainer.getChildren();
  }

  /**
   * 导出H5容器数据
   */
  exportData(): { h5Container: any; components: any[] } {
    return {
      h5Container: this.currentContainer,
      components: this.getAllComponents(),
    };
  }

  // 简化的IH5Service接口实现（保持兼容性）
  restoreExistingH5Container(container: any): boolean {
    if (!container) {
      return false;
    }

    // 安全检查容器的ID属性
    const containerId = container.id || container.attrs?.id;
    if (!containerId) {
      return false;
    }

    this.currentContainer = container;
    return true;
  }

  destroy(): void {
    this.cleanup();
  }
}
