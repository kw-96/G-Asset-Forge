/**
 * H5Service - H5项目的精简服务
 * 只负责H5容器和内容块的核心管理功能
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../editor';
import type {
  ContentBlockData,
  IH5Service,
} from './project-handlers/H5ProjectHandler';

/**
 * H5Service事件接口
 */
interface H5ServiceEvents {
  contentBlocksChanged: (blocks: ContentBlockData[]) => void;
  selectionChanged: (selectedBlocks: string[]) => void;
  error: (error: Error) => void;
  healthCheck: (isHealthy: boolean, issues?: string[]) => void;
}

/**
 * 精简的H5Service实现
 * 只保留核心功能，移除复杂的监控和状态管理
 */
export class H5Service
  extends EventEmitter<H5ServiceEvents>
  implements IH5Service
{
  private editor: GAssetForgeEditor | null = null;
  private currentContainer: any = null;
  private contentBlocks: Map<string, ContentBlockData> = new Map();

  constructor() {
    super();
  }

  /**
   * 初始化H5Service
   */
  async initialize(
    editor: GAssetForgeEditor,
    _projectData?: any,
  ): Promise<void> {
    this.editor = editor;
    console.log('H5Service初始化完成');
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;
    console.log('H5Service: 编辑器实例已设置');

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
      console.log('H5Service: 检测到画布准备完成事件，自动初始化H5模式');
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
      console.log('H5Service: 画布不存在，等待画布创建');
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
      console.log('H5Service: 发现现有H5容器，同步状态');
      this.currentContainer = existingH5Container;
      this.syncH5Container();
    } else {
      console.log('H5Service: 未发现H5容器，创建新容器');
      try {
        await this.initializeH5Mode();
        console.log('H5Service: 新H5容器创建完成');
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
      console.log('H5Service: 同步H5容器状态', h5Container.attrs?.id);
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
      console.log('H5Service: H5容器已存在，跳过添加');
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
    console.log('H5Service: H5容器已添加到画布');
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

    console.log('H5Service: H5模式初始化完成');
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
   * 添加内容块到H5容器
   */
  addContentBlock(block: ContentBlockData): void {
    if (!this.currentContainer) {
      console.warn('H5Service: 无法添加内容块：H5容器不存在');
      return;
    }

    this.contentBlocks.set(block.id, block);
    console.log('H5Service: 内容块已添加', block.id);
  }

  /**
   * 获取所有内容块
   */
  getContentBlocks(): ContentBlockData[] {
    return Array.from(this.contentBlocks.values());
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
    this.contentBlocks.clear();
    console.log('H5Service: 资源已清理');
  }

  // 实现IH5Service接口的其他方法（简化版）
  getContentBlock(blockId: string): ContentBlockData | null {
    return this.contentBlocks.get(blockId) || null;
  }

  removeContentBlock(blockId: string): boolean {
    return this.contentBlocks.delete(blockId);
  }

  updateContentBlock(blockId: string, attrs: any): boolean {
    const block = this.contentBlocks.get(blockId);
    if (block) {
      Object.assign(block, attrs);
      return true;
    }
    return false;
  }

  getSelectedBlocks(): string[] {
    return [];
  }

  setSelectedBlocks(_blockIds: string[]): void {
    // 简化版，不实现选择功能
  }

  clearSelection(): void {
    // 简化版，不实现选择功能
  }

  // 实现IH5Service接口的其他必需方法（简化版）
  restoreExistingH5Container(container: any): boolean {
    if (!container || !container.id) {
      return false;
    }
    this.currentContainer = container;
    return true;
  }

  async addTextBlock(content?: string): Promise<any> {
    const block: ContentBlockData = {
      id: `text-${Date.now()}`,
      type: 'H5TextBlock',
      order: this.contentBlocks.size,
      parentId: this.currentContainer?.id || '',
      style: {},
      content: { text: content || '文本内容' },
    };
    this.addContentBlock(block);
    return block;
  }

  async addImageBlock(src?: string, alt?: string): Promise<any> {
    const block: ContentBlockData = {
      id: `image-${Date.now()}`,
      type: 'H5ImageBlock',
      order: this.contentBlocks.size,
      parentId: this.currentContainer?.id || '',
      style: {},
      content: { src: src || '', alt: alt || '' },
    };
    this.addContentBlock(block);
    return block;
  }

  async addButtonBlock(text?: string): Promise<any> {
    const block: ContentBlockData = {
      id: `button-${Date.now()}`,
      type: 'H5ButtonBlock',
      order: this.contentBlocks.size,
      parentId: this.currentContainer?.id || '',
      style: {},
      content: { text: text || '按钮' },
    };
    this.addContentBlock(block);
    return block;
  }

  getContentBlockCount(): number {
    return this.contentBlocks.size;
  }

  getAllContentBlocks(): ContentBlockData[] {
    return this.getContentBlocks();
  }

  getSelectedContentBlocks(): any[] {
    return [];
  }

  exportData(): { h5Container: any; contentBlocks: any[] } {
    return {
      h5Container: this.currentContainer,
      contentBlocks: this.getContentBlocks(),
    };
  }

  destroy(): void {
    this.cleanup();
  }
}
