/**
 * H5Service - H5项目的核心服务
 * 负责H5容器和内容块的管理、生命周期控制和状态监控
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../editor';
import { H5Container } from '../graphics/h5/h5_container';
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
  removeAllListeners: any;

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
  async initialize(editor: GAssetForgeEditor): Promise<void> {
    if (this.state !== H5ServiceState.IDLE) {
      throw new Error(`无法初始化H5Service，当前状态: ${this.state}`);
    }

    this.setState(H5ServiceState.INITIALIZING);

    try {
      this.editor = editor;

      // 初始化H5模式
      this.initializeH5Mode();

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

    // 将内容块添加到H5容器
    if (typeof h5Container.addContentBlock === 'function') {
      h5Container.addContentBlock(block).catch((error: any) => {
        console.error('添加内容块到容器失败:', error);
      });
    } else {
      console.warn('H5容器不支持addContentBlock方法');
    }
  }

  /**
   * 添加H5容器到画布
   */
  private addH5ContainerToCanvas(): void {
    if (!this.editor || !this.currentContainer) {
      console.warn('无法添加H5容器：编辑器或容器不存在');
      return;
    }

    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      console.warn('无法添加H5容器：当前画布不存在');
      return;
    }

    // 检查是否已经存在H5容器
    const existingContainer = currentCanvas
      .getChildren()
      .find((child: any) => child.type === 'H5Container');

    if (existingContainer) {
      console.log('H5容器已存在，跳过添加');
      return;
    }

    // 保存现有的内容块数据，避免丢失子元素
    const savedContentBlocks = Array.from(this.contentBlocks.values());
    console.log('保存现有内容块数据:', savedContentBlocks.length, '个');

    // 创建H5Container图形对象
    const h5Container = new H5Container(
      {
        id: this.currentContainer.id,
        objectName: 'H5长图容器',
        width: this.currentContainer.width,
        height: this.currentContainer.height,
        mobileWidth: this.currentContainer.width,
        padding: this.currentContainer.padding,
        gap: this.currentContainer.gap,
        autoLayout: this.currentContainer.autoLayout,
        resizeToFit: false,
      },
      { doc: this.editor.doc },
    );

    // 添加到画布
    currentCanvas.insertChild(h5Container);

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
              await h5Container.addContentBlock(blockData);
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

    console.log('H5容器已添加到画布');
  }

  /**
   * 初始化H5模式
   */
  initializeH5Mode(): any {
    const startTime = performance.now();

    try {
      if (!this.editor) {
        throw new Error('编辑器实例不存在');
      }

      // 创建默认H5容器
      const container = this.createDefaultContainer();
      this.currentContainer = container;

      // 延迟添加H5容器，确保在setContents完成后执行
      setTimeout(() => {
        this.addH5ContainerToCanvas();
      }, 100);

      console.log('H5模式初始化完成');

      // 清空内容块
      this.contentBlocks.clear();
      this.selectedBlocks.clear();

      // 触发事件
      this.emit('containerChanged', container);
      this.emit('contentBlocksChanged', []);

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

      // 恢复内容块
      if (container.childrenIds && Array.isArray(container.childrenIds)) {
        this.restoreContentBlocks(container.childrenIds);
      }

      // 触发事件
      this.emit('containerChanged', container);

      this.recordPerformance(
        'restoreExistingH5Container',
        performance.now() - startTime,
      );
      console.log('H5容器恢复成功:', container.id);

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
        id: `text_block_${Date.now()}`,
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
        id: `image_block_${Date.now()}`,
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
        id: `button_block_${Date.now()}`,
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
    return Array.from(this.contentBlocks.values()).sort(
      (a, b) => a.order - b.order,
    );
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

      // 清理所有事件监听器
      this.removeAllListeners();

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
      id: `h5_container_${Date.now()}`,
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
    return (
      container &&
      typeof container.id === 'string' &&
      container.type === 'H5Container' &&
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
