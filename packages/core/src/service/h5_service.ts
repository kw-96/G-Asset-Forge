/**
 * H5Service - H5项目的核心服务
 * 负责H5容器和内容块的管理、生命周期控制和状态监控
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../editor';
import { H5Container } from '../graphics/h5/h5_container';
// import { GraphicsType } from '../type'; // 暂时未使用
import type {
  ContentBlockData,
  H5ContainerData,
  IH5Service,
} from './project-handlers/H5ProjectHandler';

/**
 * H5Service状态枚举
 */
export enum H5ServiceState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  LOADING = 'loading',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

/**
 * H5Service事件接口
 */
interface H5ServiceEvents {
  stateChanged: (oldState: H5ServiceState, newState: H5ServiceState) => void;
  containerChanged: (container: any) => void;
  contentBlocksChanged: (blocks: ContentBlockData[]) => void;
  contentBlockAdded: (block: ContentBlockData) => void;
  contentBlockRemoved: (blockId: string) => void;
  contentBlockUpdated: (blockId: string, attrs: any) => void;
  selectionChanged: (selectedBlocks: string[]) => void;
  error: (error: Error) => void;
  healthCheck: (isHealthy: boolean, issues?: string[]) => void;
}

/**
 * H5Service健康检查结果
 */
interface HealthCheckResult {
  isHealthy: boolean;
  issues: string[];
  timestamp: number;
}

/**
 * H5Service配置选项
 */
interface H5ServiceOptions {
  autoHealthCheck: boolean;
  healthCheckInterval: number;
  containerRecoveryTimeout: number;
  enablePerformanceMonitoring: boolean;
}

/**
 * H5Service实现
 * 提供H5项目的完整生命周期管理和状态监控
 */
export class H5Service
  extends EventEmitter<H5ServiceEvents>
  implements IH5Service
{
  private editor: GAssetForgeEditor | null = null;
  private state: H5ServiceState = H5ServiceState.IDLE;
  private currentContainer: any = null;
  private contentBlocks: Map<string, ContentBlockData> = new Map();
  private selectedBlocks: Set<string> = new Set();
  private options: H5ServiceOptions;
  private healthCheckTimer: ReturnType<typeof setTimeout> | null = null;
  private performanceMetrics: Map<string, number> = new Map();
  private lastHealthCheck: HealthCheckResult | null = null;
  private dataRecoveryTimer: ReturnType<typeof setInterval> | null = null;
  private dataRecoveryCleanup: (() => void) | null = null;

  constructor(options: Partial<H5ServiceOptions> = {}) {
    super();

    this.options = {
      autoHealthCheck: true,
      healthCheckInterval: 30000, // 30秒
      containerRecoveryTimeout: 5000, // 5秒
      enablePerformanceMonitoring: true,
      ...options,
    };

    this.setupPerformanceMonitoring();
  }

  /**
   * 初始化H5Service
   */
  async initialize(
    editor: GAssetForgeEditor,
    projectData?: any,
  ): Promise<void> {
    if (this.state !== H5ServiceState.IDLE) {
      throw new Error(`无法初始化H5Service，当前状态: ${this.state}`);
    }

    this.setState(H5ServiceState.INITIALIZING);

    try {
      this.editor = editor;

      // 初始化H5模式，传递项目数据
      this.initializeH5Mode(projectData);

      // 启动健康检查
      if (this.options.autoHealthCheck) {
        this.startHealthCheck();
      }

      this.setState(H5ServiceState.READY);
      console.log('H5Service初始化完成');
    } catch (error) {
      this.setState(H5ServiceState.ERROR);
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 将内容块添加到H5容器的图形对象中
   */
  private addBlockToContainer(block: ContentBlockData): void {
    if (!this.editor) {
      console.warn('无法添加内容块：编辑器不存在');
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      console.warn('无法添加内容块：当前画布不存在');
      return;
    }

    // 查找H5容器
    const h5Container = currentCanvas
      .getChildren()
      .find((child: any) => child.type === 'H5Container');

    if (!h5Container) {
      console.warn('无法添加内容块：H5容器不存在');
      return;
    }

    // 将ContentBlockData转换为H5ContentBlockAttrs
    const blockAttrs = this.convertContentBlockDataToAttrs(block);

    // 将内容块添加到H5容器
    if (typeof (h5Container as any).addContentBlock === 'function') {
      (h5Container as any)
        .addContentBlock(blockAttrs)
        .then((addedBlock: any) => {
          console.log('内容块已成功添加到H5容器:', addedBlock?.attrs?.id);

          // 触发内容块变化事件，确保UI同步
          this.emit('contentBlocksChanged', this.getContentBlocks());
        })
        .catch((error: any) => {
          console.error('添加内容块到容器失败:', error);
        });
    } else {
      console.warn('H5容器不支持addContentBlock方法');
    }
  }

  /**
   * 将ContentBlockData转换为H5ContentBlockAttrs
   */
  private convertContentBlockDataToAttrs(block: ContentBlockData): any {
    // 根据ContentBlockData的type字段映射到blockType
    let blockType: 'text' | 'image' | 'button';
    switch (block.type) {
      case 'H5TextBlock':
        blockType = 'text';
        break;
      case 'H5ImageBlock':
        blockType = 'image';
        break;
      case 'H5ButtonBlock':
        blockType = 'button';
        break;
      default:
        console.warn('未知的内容块类型:', block.type);
        blockType = 'text';
    }

    // 构建H5ContentBlockAttrs对象
    const attrs: any = {
      id: block.id,
      blockType: blockType,
      order: block.order,
      objectName: `内容块 ${block.order + 1}`,
      // 基础图形属性
      width: 200, // 默认宽度，H5Container会自动调整
      height: 50, // 默认高度，H5Container会自动调整
      visible: true,
      locked: false,
    };

    // 根据内容块类型设置特定属性
    switch (blockType) {
      case 'text':
        attrs.content = block.content?.text || '文本内容';
        attrs.fontSize = block.style?.fontSize || 16;
        attrs.textColor = block.style?.color || '#333333';
        attrs.textAlign = block.style?.textAlign || 'left';
        attrs.fontFamily = block.style?.fontFamily || 'Arial, sans-serif';
        attrs.lineHeight = block.style?.lineHeight || 1.5;
        break;
      case 'image':
        attrs.src = block.content?.src || '';
        attrs.alt = block.content?.alt || '图片';
        attrs.objectFit = block.style?.objectFit || 'cover';
        attrs.borderRadius = block.style?.borderRadius || 4;
        break;
      case 'button':
        attrs.text = block.content?.text || '按钮';
        attrs.backgroundColor = block.style?.backgroundColor || '#007bff';
        attrs.textColor = block.style?.textColor || '#ffffff';
        attrs.borderRadius = block.style?.borderRadius || 4;
        attrs.fontSize = block.style?.fontSize || 14;
        attrs.paddingTop = 12;
        attrs.paddingBottom = 12;
        attrs.paddingLeft = 24;
        attrs.paddingRight = 24;
        break;
    }

    // 合并样式属性
    if (block.style) {
      Object.assign(attrs, block.style);
    }

    console.log('转换内容块数据:', {
      original: block,
      converted: attrs,
    });

    return attrs;
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;
    console.log('H5Service: 编辑器实例已设置');

    // 设置editor后立即同步H5容器
    this.syncH5Container();
  }

  /**
   * 同步H5容器状态
   */
  private syncH5Container(): void {
    if (!this.editor?.doc) {
      console.warn('H5Service: 编辑器或文档不存在，无法同步H5容器');
      return;
    }

    try {
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (!currentCanvas) {
        console.warn('H5Service: 当前画布不存在，无法同步H5容器');
        return;
      }

      // 查找画布中的H5容器
      const children = currentCanvas.getChildren();
      const h5Container = children.find((child: any) => {
        // 使用与canvas.ts相同的识别逻辑
        return (
          child.type === 'H5Container' ||
          child.constructor?.name === 'H5Container' ||
          (child.attrs &&
            child.attrs.id &&
            child.attrs.id.includes('h5_container')) ||
          (child.attrs &&
            child.attrs.id &&
            child.attrs.id.includes('h5-container'))
        );
      });

      if (h5Container) {
        console.log(
          'H5Service: 同步H5容器状态',
          h5Container.attrs.id,
          '类型:',
          h5Container.type,
        );
        this.currentContainer = h5Container;
        this.emit('containerChanged', this.currentContainer);
        return;
      }

      console.log(
        'H5Service: 画布中未找到H5容器，当前子元素数量:',
        children.length,
      );
      console.log(
        'H5Service: 子元素详情:',
        children.map((child: any) => ({
          type: child.type,
          id: child.attrs?.id,
          constructor: child.constructor?.name,
        })),
      );
    } catch (error) {
      console.error('H5Service: 同步H5容器失败', error);
    }
  }

  /**
   * 添加H5容器到画布
   */
  private addH5ContainerToCanvas(containerData?: any): void {
    if (!this.editor || !this.currentContainer) {
      console.warn('无法添加H5容器：编辑器或容器不存在');
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      console.warn('无法添加H5容器：当前画布不存在，尝试等待画布创建');
      // 延迟重试，等待画布创建
      setTimeout(() => {
        this.addH5ContainerToCanvas(containerData);
      }, 500);
      return;
    }

    // 检查是否已经存在H5容器
    const existingContainer = currentCanvas
      .getChildren()
      .find((child: any) => child.type === 'H5Container');

    if (existingContainer) {
      console.log('H5容器已存在，跳过添加:', existingContainer.attrs?.id);
      // 更新当前容器引用，确保使用现有的容器
      this.currentContainer = existingContainer;
      // 设置恢复标记，防止重复添加
      (window as any).__h5ContainerRestored = true;
      return;
    }

    // 保存现有的内容块数据，避免丢失子元素
    const savedContentBlocks = Array.from(this.contentBlocks.values());
    console.log('保存现有内容块数据:', savedContentBlocks.length, '个');

    // 使用固定的容器ID，避免重复创建时ID变化
    const containerId = this.currentContainer.id || 'h5-container-1'; // 使用固定ID

    // 创建H5Container图形对象
    const h5Container = new H5Container(
      {
        id: containerId,
        objectName: 'H5长图容器',
        width: this.currentContainer.width,
        height: this.currentContainer.height,
        mobileWidth: this.currentContainer.width,
        padding: this.currentContainer.padding,
        gap: this.currentContainer.gap,
        autoLayout: this.currentContainer.autoLayout,
        resizeToFit: false,
        // 传递子元素数据 - 优先使用传入的容器数据
        children:
          containerData?.children || this.currentContainer.children || [],
      },
      { doc: this.editor.doc },
    );

    // 添加到画布，使用正确的排序索引
    currentCanvas.insertChild(h5Container, 'a0');

    // 注册到图形管理器
    if (this.editor && this.editor.doc) {
      // 检查是否已经存在，避免重复添加
      const existingGraphics = this.editor.doc.graphicsStoreManager.get(
        h5Container.attrs.id,
      );
      if (!existingGraphics) {
        this.editor.doc.addGraphics(h5Container);
        console.log('H5容器已添加到图形管理器:', h5Container.attrs.id);
      } else {
        console.log(
          'H5容器已存在于图形管理器中，跳过添加:',
          h5Container.attrs.id,
        );
      }
    }

    // 更新当前容器引用
    this.currentContainer = h5Container;

    // 恢复内容块数据
    if (savedContentBlocks.length > 0) {
      console.log('恢复内容块数据:', savedContentBlocks.length, '个');

      // 异步恢复内容块
      setTimeout(async () => {
        try {
          for (const blockData of savedContentBlocks) {
            if (
              h5Container &&
              typeof h5Container.addContentBlock === 'function'
            ) {
              // 将 ContentBlockData 转换为 H5ContentBlockAttrs
              const blockAttrs = this.convertContentBlockDataToAttrs(blockData);
              await h5Container.addContentBlock(blockAttrs);
            }
          }
          console.log('内容块恢复完成');
        } catch (error) {
          console.warn('恢复内容块时出错:', error);
        }
      }, 50);
    }

    // 触发重新渲染
    this.editor.render();

    // 设置H5容器恢复标记
    if (typeof window !== 'undefined') {
      (window as any).__h5ContainerRestored = true;
    }

    console.log('H5容器已添加到画布');
  }

  /**
   * 设置数据恢复监听器
   */
  private setupDataRecoveryListener(): void {
    if (!this.editor) {
      return;
    }

    // 先清理现有的监听器
    this.cleanupDataRecoveryListener();

    // 完全禁用H5容器检查，简化系统
    // const checkH5Container = () => { ... };

    // 完全禁用所有恢复机制，简化系统
    // this.dataRecoveryTimer = setInterval(checkH5Container, 30000);
    // this.editor.on('canvasChanged' as any, checkH5Container);
    // this.editor.on('graphicsChanged' as any, checkH5Container);

    // 保存清理函数
    this.dataRecoveryCleanup = () => {
      if (this.dataRecoveryTimer) {
        clearInterval(this.dataRecoveryTimer);
        this.dataRecoveryTimer = null;
      }
      // 所有事件监听器已被禁用，无需清理
    };

    console.log('数据恢复监听器已设置');
  }

  /**
   * 清理数据恢复监听器
   */
  private cleanupDataRecoveryListener(): void {
    if (this.dataRecoveryCleanup) {
      this.dataRecoveryCleanup();
      this.dataRecoveryCleanup = null;
    }
    console.log('数据恢复监听器已清理');
  }

  /**
   * 初始化H5模式
   */
  initializeH5Mode(projectData?: any): any {
    const startTime = performance.now();

    try {
      if (!this.editor) {
        throw new Error('编辑器实例不存在');
      }

      // 如果有项目数据且不是新建项目，尝试恢复现有的H5容器
      if (projectData?.h5Container && !projectData.isNewProject) {
        console.log('尝试恢复现有H5容器:', projectData.h5Container.id);
        const restored = this.restoreExistingH5Container(
          projectData.h5Container,
        );
        if (restored) {
          console.log('H5容器恢复成功');
          // 设置数据恢复监听器，但不清空现有数据
          this.setupDataRecoveryListener();
          return this.currentContainer;
        }
      }

      // 如果没有项目数据或恢复失败，创建默认H5容器
      const container = this.createDefaultContainer();
      this.currentContainer = container;

      // 直接添加H5容器，避免延迟操作导致重复setContents
      this.addH5ContainerToCanvas();
      // 设置数据恢复监听器
      this.setupDataRecoveryListener();

      // 添加H5容器后立即同步状态
      this.syncH5Container();

      console.log('H5模式初始化完成');

      // 只有在没有项目数据时才清空内容块
      if (!projectData?.h5Container) {
        this.contentBlocks.clear();
        this.selectedBlocks.clear();
      }

      // 触发事件
      this.emit('containerChanged', this.currentContainer);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance('initializeH5Mode', performance.now() - startTime);
      console.log('H5模式初始化完成');

      return container;
    } catch (error) {
      console.error('H5模式初始化失败:', error);
      this.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 恢复现有H5容器
   */
  restoreExistingH5Container(container: any): boolean {
    const startTime = performance.now();

    try {
      if (!container || !container.id) {
        console.warn('无效的容器数据');
        return false;
      }

      // 验证容器数据
      if (!this.validateContainerData(container)) {
        console.warn('容器数据验证失败');
        return false;
      }

      // 设置当前容器
      this.currentContainer = container;

      // 如果容器是图形对象（已经在画布上），直接使用
      if (container.attrs && container.type === 'H5Container') {
        console.log('H5容器已在画布上，直接使用:', container.attrs.id);

        // 恢复内容块
        if (container.childrenIds && Array.isArray(container.childrenIds)) {
          this.restoreContentBlocks(container.childrenIds);
        }

        // 如果有内容块数据，也恢复它们
        if (container.contentBlocks && Array.isArray(container.contentBlocks)) {
          console.log('恢复内容块数据:', container.contentBlocks.length, '个');
          this.contentBlocks.clear();
          container.contentBlocks.forEach((block: any) => {
            if (block && block.id) {
              this.contentBlocks.set(block.id, block);
            }
          });
        }

        // 设置H5容器恢复标记，防止H5EditorMode重新创建
        (window as any).__h5ContainerRestored = true;

        // 确保H5Service的currentContainer引用正确
        this.currentContainer = container;
      } else {
        // 如果容器是数据对象，需要重新创建
        console.log('H5容器是数据对象，需要重新创建:', container.id);

        // 清空现有内容块
        this.contentBlocks.clear();
        this.selectedBlocks.clear();

        // 如果有内容块数据，恢复它们
        if (container.contentBlocks && Array.isArray(container.contentBlocks)) {
          console.log('恢复内容块数据:', container.contentBlocks.length, '个');
          container.contentBlocks.forEach((block: any) => {
            if (block && block.id) {
              this.contentBlocks.set(block.id, block);
            }
          });
        }

        // 重新创建H5容器到画布，并传递子元素数据
        this.addH5ContainerToCanvas(container);
      }

      // 触发事件
      this.emit('containerChanged', this.currentContainer);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance(
        'restoreExistingH5Container',
        performance.now() - startTime,
      );
      console.log(
        'H5容器恢复成功:',
        this.currentContainer.attrs?.id || this.currentContainer.id,
        '内容块数量:',
        this.contentBlocks.size,
      );

      return true;
    } catch (error) {
      console.error('H5容器恢复失败:', error);
      this.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 获取当前容器
   */
  getCurrentContainer(): any {
    return this.currentContainer;
  }

  /**
   * 设置当前容器
   */
  setCurrentContainer(container: any): void {
    if (container && container.id !== this.currentContainer?.id) {
      this.currentContainer = container;
      this.emit('containerChanged', container);
      console.log('当前容器已更新:', container.id);
    }
  }

  /**
   * 根据ID获取容器
   */
  getContainerById(containerId: string): any {
    if (this.currentContainer?.id === containerId) {
      return this.currentContainer;
    }
    return null;
  }

  /**
   * 添加文本块
   */
  addTextBlock(content: string = '文本内容'): any {
    const startTime = performance.now();

    try {
      const block: ContentBlockData = {
        id: `text_block_${this.contentBlocks.size + 1}`, // 使用序号ID
        type: 'H5TextBlock',
        parentId: this.currentContainer?.id || '',
        order: this.contentBlocks.size,
        content: { text: content },
        style: {
          fontSize: 16,
          color: '#333333',
          textAlign: 'left',
          padding: 12,
        },
      };

      // 保存到内容块Map
      this.contentBlocks.set(block.id, block);

      // 添加到H5容器的图形对象中
      this.addBlockToContainer(block);

      this.emit('contentBlockAdded', block);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance('addTextBlock', performance.now() - startTime);
      console.log('文本块已添加:', block.id);

      return block;
    } catch (error) {
      console.error('添加文本块失败:', error);
      this.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 添加图片块
   */
  addImageBlock(src: string = '', alt: string = '图片'): any {
    const startTime = performance.now();

    try {
      const block: ContentBlockData = {
        id: `image_block_${this.contentBlocks.size + 1}`, // 使用序号ID
        type: 'H5ImageBlock',
        parentId: this.currentContainer?.id || '',
        order: this.contentBlocks.size,
        content: { src, alt },
        style: {
          width: 200,
          height: 150,
          objectFit: 'cover',
          borderRadius: 4,
        },
      };

      // 保存到内容块Map
      this.contentBlocks.set(block.id, block);

      // 添加到H5容器的图形对象中
      this.addBlockToContainer(block);

      this.emit('contentBlockAdded', block);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance('addImageBlock', performance.now() - startTime);
      console.log('图片块已添加:', block.id);

      return block;
    } catch (error) {
      console.error('添加图片块失败:', error);
      this.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 添加按钮块
   */
  addButtonBlock(text: string = '按钮'): any {
    const startTime = performance.now();

    try {
      const block: ContentBlockData = {
        id: `button_block_${this.contentBlocks.size + 1}`, // 使用序号ID
        type: 'H5ButtonBlock',
        parentId: this.currentContainer?.id || '',
        order: this.contentBlocks.size,
        content: { text },
        style: {
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 4,
          border: 'none',
          fontSize: 14,
        },
      };

      // 保存到内容块Map
      this.contentBlocks.set(block.id, block);

      // 添加到H5容器的图形对象中
      this.addBlockToContainer(block);

      this.emit('contentBlockAdded', block);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance('addButtonBlock', performance.now() - startTime);
      console.log('按钮块已添加:', block.id);

      return block;
    } catch (error) {
      console.error('添加按钮块失败:', error);
      this.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 删除内容块
   */
  removeContentBlock(blockId: string): boolean {
    const startTime = performance.now();

    try {
      if (!this.contentBlocks.has(blockId)) {
        console.warn('内容块不存在:', blockId);
        return false;
      }

      // 从H5容器中删除内容块
      if (this.editor) {
        const currentCanvas = this.editor.doc.getCurrentCanvas();
        if (currentCanvas) {
          const h5Container = currentCanvas
            .getChildren()
            .find((child: any) => child.type === 'H5Container');

          if (
            h5Container &&
            typeof (h5Container as any).removeContentBlock === 'function'
          ) {
            const success = (h5Container as any).removeContentBlock(blockId);
            if (!success) {
              console.warn('从H5容器删除内容块失败:', blockId);
            }
          }
        }
      }

      this.contentBlocks.delete(blockId);
      this.selectedBlocks.delete(blockId);

      // 重新排序剩余的块
      this.reorderContentBlocks();

      this.emit('contentBlockRemoved', blockId);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance(
        'removeContentBlock',
        performance.now() - startTime,
      );
      console.log('内容块已删除:', blockId);

      return true;
    } catch (error) {
      console.error('删除内容块失败:', error);
      this.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 更新内容块
   */
  updateContentBlock(blockId: string, attrs: any): boolean {
    const startTime = performance.now();

    try {
      const block = this.contentBlocks.get(blockId);
      if (!block) {
        console.warn('内容块不存在:', blockId);
        return false;
      }

      // 更新块属性
      const updatedBlock = {
        ...block,
        ...attrs,
        id: blockId, // 确保ID不被覆盖
      };

      this.contentBlocks.set(blockId, updatedBlock);

      // 同步更新H5容器中的内容块
      if (this.editor) {
        const currentCanvas = this.editor.doc.getCurrentCanvas();
        if (currentCanvas) {
          const h5Container = currentCanvas
            .getChildren()
            .find((child: any) => child.type === 'H5Container');

          if (
            h5Container &&
            typeof (h5Container as any).updateContentBlock === 'function'
          ) {
            const blockAttrs =
              this.convertContentBlockDataToAttrs(updatedBlock);
            const success = (h5Container as any).updateContentBlock(
              blockId,
              blockAttrs,
            );
            if (!success) {
              console.warn('更新H5容器中的内容块失败:', blockId);
            }
          }
        }
      }

      this.emit('contentBlockUpdated', blockId, attrs);
      this.emit(
        'contentBlocksChanged',
        Array.from(this.contentBlocks.values()),
      );

      this.recordPerformance(
        'updateContentBlock',
        performance.now() - startTime,
      );
      console.log('内容块已更新:', blockId);

      return true;
    } catch (error) {
      console.error('更新内容块失败:', error);
      this.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 更新内容块属性
   */
  updateContentBlockAttrs(blockId: string, attrs: any): boolean {
    return this.updateContentBlock(blockId, attrs);
  }

  /**
   * 获取所有内容块
   */
  getContentBlocks(): ContentBlockData[] {
    // 首先尝试从H5容器中获取实际的内容块
    if (this.editor) {
      try {
        const currentCanvas = this.editor.doc.getCurrentCanvas();
        if (currentCanvas) {
          const h5Container = currentCanvas
            .getChildren()
            .find((child: any) => child.type === 'H5Container');

          if (
            h5Container &&
            typeof (h5Container as any).getAllContentBlocks === 'function'
          ) {
            const containerBlocks = (h5Container as any).getAllContentBlocks();
            console.log('从H5容器获取内容块:', containerBlocks.length, '个');

            // 将H5ContentBlock转换为ContentBlockData格式
            const convertedBlocks = containerBlocks.map((block: any) => {
              const blockData: ContentBlockData = {
                id: block.attrs.id,
                type: this.mapBlockTypeToContentBlockType(
                  block.attrs.blockType,
                ),
                parentId: this.currentContainer?.id || '',
                order: block.attrs.order || 0,
                content: this.extractBlockContent(block),
                style: this.extractBlockStyle(block),
              };
              return blockData;
            });

            // 更新内存中的内容块Map，但保留现有的数据作为备份
            const existingBlocks = new Map(this.contentBlocks);
            this.contentBlocks.clear();
            convertedBlocks.forEach((block: ContentBlockData) => {
              this.contentBlocks.set(block.id, block);
            });

            // 如果容器中的块数量为0，但内存中有数据，可能是时序问题
            if (convertedBlocks.length === 0 && existingBlocks.size > 0) {
              console.warn(
                'H5容器中无内容块，但内存中有数据，可能存在时序问题',
              );
              // 暂时返回内存中的数据
              existingBlocks.forEach((block, id) => {
                this.contentBlocks.set(id, block);
              });
              return Array.from(existingBlocks.values()).sort(
                (a, b) => a.order - b.order,
              );
            }

            return convertedBlocks.sort(
              (a: ContentBlockData, b: ContentBlockData) => a.order - b.order,
            );
          }
        }
      } catch (error) {
        console.warn('从H5容器获取内容块失败，使用内存数据:', error);
      }
    }

    // 如果无法从容器获取，则返回内存中的数据
    return Array.from(this.contentBlocks.values()).sort(
      (a, b) => a.order - b.order,
    );
  }

  /**
   * 将H5ContentBlock的blockType映射到ContentBlockData的type
   */
  private mapBlockTypeToContentBlockType(
    blockType: string,
  ): 'H5TextBlock' | 'H5ImageBlock' | 'H5ButtonBlock' {
    switch (blockType) {
      case 'text':
        return 'H5TextBlock';
      case 'image':
        return 'H5ImageBlock';
      case 'button':
        return 'H5ButtonBlock';
      default:
        return 'H5TextBlock';
    }
  }

  /**
   * 从H5ContentBlock中提取内容
   */
  private extractBlockContent(block: any): any {
    switch (block.attrs.blockType) {
      case 'text':
        return {
          text: block.attrs.content || '文本内容',
        };
      case 'image':
        return {
          src: block.attrs.src || '',
          alt: block.attrs.alt || '图片',
        };
      case 'button':
        return {
          text: block.attrs.text || '按钮',
        };
      default:
        return {};
    }
  }

  /**
   * 从H5ContentBlock中提取样式
   */
  private extractBlockStyle(block: any): any {
    const style: any = {};

    // 基础样式属性
    if (block.attrs.fontSize !== undefined)
      style.fontSize = block.attrs.fontSize;
    if (block.attrs.textColor !== undefined)
      style.color = block.attrs.textColor;
    if (block.attrs.textAlign !== undefined)
      style.textAlign = block.attrs.textAlign;
    if (block.attrs.fontFamily !== undefined)
      style.fontFamily = block.attrs.fontFamily;
    if (block.attrs.lineHeight !== undefined)
      style.lineHeight = block.attrs.lineHeight;
    if (block.attrs.backgroundColor !== undefined)
      style.backgroundColor = block.attrs.backgroundColor;
    if (block.attrs.borderRadius !== undefined)
      style.borderRadius = block.attrs.borderRadius;
    if (block.attrs.objectFit !== undefined)
      style.objectFit = block.attrs.objectFit;

    // 边距和内边距
    if (block.attrs.marginTop !== undefined)
      style.marginTop = block.attrs.marginTop;
    if (block.attrs.marginBottom !== undefined)
      style.marginBottom = block.attrs.marginBottom;
    if (block.attrs.paddingTop !== undefined)
      style.paddingTop = block.attrs.paddingTop;
    if (block.attrs.paddingBottom !== undefined)
      style.paddingBottom = block.attrs.paddingBottom;
    if (block.attrs.paddingLeft !== undefined)
      style.paddingLeft = block.attrs.paddingLeft;
    if (block.attrs.paddingRight !== undefined)
      style.paddingRight = block.attrs.paddingRight;

    return style;
  }

  /**
   * 根据ID获取内容块
   */
  getContentBlockById(blockId: string): ContentBlockData | null {
    return this.contentBlocks.get(blockId) || null;
  }

  /**
   * 获取选中的内容块
   */
  getSelectedContentBlocks(): ContentBlockData[] {
    return Array.from(this.selectedBlocks)
      .map((id) => this.contentBlocks.get(id))
      .filter((block) => block !== undefined) as ContentBlockData[];
  }

  /**
   * 选择内容块
   */
  selectContentBlocks(blockIds: string[]): void {
    this.selectedBlocks.clear();
    blockIds.forEach((id) => {
      if (this.contentBlocks.has(id)) {
        this.selectedBlocks.add(id);
      }
    });

    this.emit('selectionChanged', Array.from(this.selectedBlocks));
    console.log('内容块选择已更新:', blockIds);
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    this.selectedBlocks.clear();
    this.emit('selectionChanged', []);
    console.log('内容块选择已清除');
  }

  /**
   * 更新容器配置
   */
  updateContainerConfig(config: Partial<H5ContainerData>): void {
    if (this.currentContainer) {
      this.currentContainer = {
        ...this.currentContainer,
        ...config,
      };
      this.emit('containerChanged', this.currentContainer);
      console.log('容器配置已更新');
    }
  }

  /**
   * 更新布局设置
   */
  updateLayoutSettings(settings: any): void {
    if (this.currentContainer) {
      this.currentContainer.autoLayout = settings.autoLayout;
      this.currentContainer.padding = settings.padding;
      this.currentContainer.gap = settings.gap;

      this.emit('containerChanged', this.currentContainer);
      console.log('布局设置已更新');
    }
  }

  /**
   * 设置预览模式
   */
  setPreviewMode(enabled: boolean): void {
    // 这里可以添加预览模式的逻辑
    console.log('预览模式:', enabled ? '启用' : '禁用');
  }

  /**
   * 设置移动端宽度
   */
  setMobileWidth(width: number): void {
    if (this.currentContainer) {
      this.currentContainer.width = width;
      this.emit('containerChanged', this.currentContainer);
      console.log('移动端宽度已设置:', width);
    }
  }

  /**
   * 导出数据
   */
  exportData(): { h5Container: any; contentBlocks: ContentBlockData[] } {
    return {
      h5Container: this.currentContainer,
      contentBlocks: this.getContentBlocks(),
    };
  }

  /**
   * 获取服务状态
   */
  getState(): H5ServiceState {
    return this.state;
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const issues: string[] = [];
    let isHealthy = true;

    try {
      // 检查编辑器实例
      if (!this.editor) {
        issues.push('编辑器实例不存在');
        isHealthy = false;
      }

      // 检查服务状态
      if (
        this.state === H5ServiceState.ERROR ||
        this.state === H5ServiceState.DESTROYED
      ) {
        issues.push(`服务状态异常: ${this.state}`);
        isHealthy = false;
      }

      // 检查容器状态
      if (!this.currentContainer) {
        issues.push('当前容器不存在');
        isHealthy = false;
      } else if (!this.validateContainerData(this.currentContainer)) {
        issues.push('当前容器数据无效');
        isHealthy = false;
      }

      // 检查内容块完整性
      const invalidBlocks = Array.from(this.contentBlocks.values()).filter(
        (block) => !this.validateContentBlockData(block),
      );
      if (invalidBlocks.length > 0) {
        issues.push(`发现 ${invalidBlocks.length} 个无效的内容块`);
        isHealthy = false;
      }

      // 检查性能指标
      if (this.options.enablePerformanceMonitoring) {
        const avgInitTime =
          this.performanceMetrics.get('initializeH5Mode') || 0;
        if (avgInitTime > 1000) {
          // 超过1秒
          issues.push('H5模式初始化性能较慢');
        }
      }

      const result: HealthCheckResult = {
        isHealthy,
        issues,
        timestamp: Date.now(),
      };

      this.lastHealthCheck = result;
      this.emit('healthCheck', isHealthy, issues);

      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        isHealthy: false,
        issues: [`健康检查异常: ${(error as Error).message}`],
        timestamp: Date.now(),
      };

      this.lastHealthCheck = result;
      this.emit('healthCheck', false, result.issues);

      return result;
    }
  }

  /**
   * 获取最后一次健康检查结果
   */
  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck;
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      console.log('开始清理H5Service资源');

      // 停止健康检查
      this.stopHealthCheck();

      // 清理数据恢复监听器
      this.cleanupDataRecoveryListener();

      // 清理选择状态
      this.clearSelection();

      // 清理内容块
      this.contentBlocks.clear();

      // 清理容器
      this.currentContainer = null;

      // 清理性能指标
      this.performanceMetrics.clear();

      console.log('H5Service资源清理完成');
    } catch (error) {
      console.error('H5Service资源清理失败:', error);
      throw error;
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.state === H5ServiceState.DESTROYED) {
      return;
    }

    try {
      // 清理资源
      this.cleanup();

      // 清理编辑器引用
      this.editor = null;

      // 清理所有事件监听器 - EventEmitter 没有 removeAllListeners 方法
      // 由于 EventEmitter 没有提供清理所有监听器的方法，这里跳过

      // 设置状态
      this.setState(H5ServiceState.DESTROYED);

      console.log('H5Service已销毁');
    } catch (error) {
      console.error('H5Service销毁失败:', error);
    }
  }

  // 私有方法

  /**
   * 设置服务状态
   */
  private setState(newState: H5ServiceState): void {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChanged', oldState, newState);
  }

  /**
   * 创建默认容器
   */
  private createDefaultContainer(): H5ContainerData {
    return {
      id: 'h5-container-1', // 使用固定ID
      type: 'H5Container',
      width: 1080,
      height: 2220,
      backgroundColor: '#ffffff',
      padding: 16,
      gap: 12,
      autoLayout: true,
      childrenIds: [],
    };
  }

  /**
   * 验证容器数据
   */
  private validateContainerData(container: any): boolean {
    if (!container) {
      return false;
    }

    // 如果是图形对象，检查其属性
    if (container.attrs) {
      const attrs = container.attrs;
      // H5Container继承自Frame，所以type是'Frame'，但可以通过id识别
      const isH5Container =
        container.type === 'H5Container' ||
        (container.type === 'Frame' &&
          (attrs.id?.includes('h5-container') ||
            attrs.id?.includes('h5_container')));

      return (
        typeof attrs.id === 'string' &&
        isH5Container &&
        typeof attrs.width === 'number' &&
        typeof attrs.height === 'number' &&
        attrs.width > 0 &&
        attrs.height > 0
      );
    }

    // 如果是数据对象，直接检查
    const isH5Container =
      container.type === 'H5Container' ||
      (container.type === 'Frame' &&
        (container.id?.includes('h5-container') ||
          container.id?.includes('h5_container')));

    return (
      typeof container.id === 'string' &&
      isH5Container &&
      typeof container.width === 'number' &&
      typeof container.height === 'number' &&
      container.width > 0 &&
      container.height > 0
    );
  }

  /**
   * 验证内容块数据
   */
  private validateContentBlockData(block: ContentBlockData): boolean {
    return (
      block &&
      typeof block.id === 'string' &&
      ['H5TextBlock', 'H5ImageBlock', 'H5ButtonBlock'].includes(block.type) &&
      typeof block.parentId === 'string' &&
      typeof block.order === 'number' &&
      block.order >= 0
    );
  }

  /**
   * 恢复内容块
   */
  private restoreContentBlocks(blockIds: string[]): void {
    // 这里应该从编辑器或数据源恢复内容块
    // 目前只是清空现有的内容块
    this.contentBlocks.clear();
    console.log('内容块恢复完成，块数量:', blockIds.length);
  }

  /**
   * 重新排序内容块
   */
  private reorderContentBlocks(): void {
    const blocks = Array.from(this.contentBlocks.values()).sort(
      (a, b) => a.order - b.order,
    );

    blocks.forEach((block, index) => {
      if (block.order !== index) {
        block.order = index;
        this.contentBlocks.set(block.id, block);
      }
    });
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    if (!this.options.enablePerformanceMonitoring) {
      return;
    }

    // 这里可以添加更多的性能监控逻辑
    console.log('性能监控已启用');
  }

  /**
   * 记录性能指标
   */
  private recordPerformance(operation: string, duration: number): void {
    if (!this.options.enablePerformanceMonitoring) {
      return;
    }

    this.performanceMetrics.set(operation, duration);

    if (duration > 100) {
      // 超过100ms的操作记录警告
      console.warn(`性能警告: ${operation} 耗时 ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckInterval);

    console.log(`健康检查已启动，间隔: ${this.options.healthCheckInterval}ms`);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('健康检查已停止');
    }
  }
}

/**
 * 创建H5Service实例的工厂函数
 */
export function createH5Service(
  options?: Partial<H5ServiceOptions>,
): H5Service {
  return new H5Service(options);
}
