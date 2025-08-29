/**
 * H5 服务
 * 实现 H5 服务的逻辑
 * 提供了 H5 服务的初始化、激活、禁用、移动、结束等功能
 * 提供了 H5 服务的性能监控、调试工具等功能
 */

import { type GAssetForgeEditor } from '../editor';
import {
  H5ButtonBlock,
  H5ContentBlock,
  type H5ContentBlockAttrs,
  H5ImageBlock,
  H5TextBlock,
} from '../graphics/h5/content_block';
import { H5Container } from '../graphics/h5/h5_container';
import { type IPaint, PaintType } from '../paint';
import { type IEditorPaperData } from '../type';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../utils/canvasStateManager';

/**
 * H5 服务 - 管理H5编辑模式的容器和内容块
 */
export class H5Service {
  private editor: GAssetForgeEditor;
  private currentContainer: H5Container | null = null;
  private containerMonitorInterval: number | null = null;

  // 画布状态管理器
  private canvasStateManager: CanvasStateManager;

  constructor(editor: GAssetForgeEditor) {
    this.editor = editor;

    // 初始化画布状态管理器
    this.canvasStateManager = createCanvasStateManager();
    this.canvasStateManager.setEditor(editor);

    // 启动容器状态监控
    this.startContainerMonitoring();
  }

  /**
   * 启动容器状态监控
   */
  private startContainerMonitoring(): void {
    // 每5秒检查一次容器状态
    this.containerMonitorInterval = setInterval(() => {
      if (this.currentContainer) {
        this.getCurrentContainer(); // 这会触发状态检查
      }
    }, 5000);
  }

  /**
   * 停止容器状态监控
   */
  private stopContainerMonitoring(): void {
    if (this.containerMonitorInterval) {
      clearInterval(this.containerMonitorInterval);
      this.containerMonitorInterval = null;
    }
  }

  /**
   * 初始化H5模式
   * 在现有画布中插入H5容器，固定在画布中心
   */
  initializeH5Mode(): H5Container {
    const currentCanvas = this.canvasStateManager.getCurrentCanvas();
    if (!currentCanvas) {
      throw new Error('无法获取当前画布');
    }

    // 获取画布尺寸
    const canvasWidth = this.editor.canvasElement?.width || 1200;
    const canvasHeight = this.editor.canvasElement?.height || 800;

    // 计算H5容器在画布中心的位置
    const containerWidth = 375;
    const containerHeight = 667;
    const centerX = (canvasWidth - containerWidth) / 2;
    const centerY = (canvasHeight - containerHeight) / 2;

    console.log('H5Service: 初始化H5模式', {
      canvasWidth,
      canvasHeight,
      containerWidth,
      containerHeight,
      centerX,
      centerY,
    });

    // 创建轻量级H5容器，固定在画布中心
    this.currentContainer = new H5Container(
      {
        id: `h5_container_${Date.now()}`,
        objectName: 'H5长图容器',
        width: containerWidth,
        height: containerHeight,
        mobileWidth: containerWidth,
        padding: 16,
        gap: 12,
        autoLayout: true,
        resizeToFit: false,
        // 设置初始位置在画布中心
        transform: [1, 0, 0, 1, centerX, centerY],
        // 确保容器可见 - 添加填充色和边框
        fill: [
          {
            type: PaintType.Solid,
            attrs: { r: 255, g: 255, b: 255, a: 1 },
            visible: true,
          } as IPaint,
        ],
        stroke: [
          {
            type: PaintType.Solid,
            attrs: { r: 100, g: 100, b: 100, a: 1 },
            visible: true,
          } as IPaint,
        ],
        strokeWidth: 2,
      },
      { doc: this.editor.doc } as any,
    );

    console.log('H5Service: H5容器创建成功', this.currentContainer);

    // 将容器插入到现有画布中
    currentCanvas.insertChild(this.currentContainer as any);

    console.log('H5Service: H5容器已添加到画布', {
      canvasChildrenCount: currentCanvas.getChildren().length,
      containerId: this.currentContainer.attrs.id,
    });

    // 调整视口以聚焦到H5容器，确保容器在视口中心
    this.centerViewportOnContainer();

    // 渲染编辑器
    this.editor.render();

    console.log('H5Service: H5模式初始化完成');

    return this.currentContainer;
  }

  /**
   * 将视口中心聚焦到H5容器
   */
  private centerViewportOnContainer(): void {
    if (!this.currentContainer) return;

    try {
      console.log('H5Service: 开始调整视口到容器中心');

      // 获取容器的边界框
      const containerBbox = this.currentContainer.getLocalBbox();
      console.log('H5Service: 容器边界框', containerBbox);

      // 计算容器的中心点 - IBox使用minX, minY, maxX, maxY
      const containerCenterX = (containerBbox.minX + containerBbox.maxX) / 2;
      const containerCenterY = (containerBbox.minY + containerBbox.maxY) / 2;

      // 获取当前视口尺寸
      const viewportWidth = this.editor.canvasElement?.width || 1200;
      const viewportHeight = this.editor.canvasElement?.height || 800;

      console.log('H5Service: 视口尺寸', { viewportWidth, viewportHeight });
      console.log('H5Service: 容器中心点', {
        containerCenterX,
        containerCenterY,
      });

      // 计算视口中心点
      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;

      // 计算需要移动的距离
      const deltaX = viewportCenterX - containerCenterX;
      const deltaY = viewportCenterY - containerCenterY;

      console.log('H5Service: 视口移动距离', { deltaX, deltaY });

      // 移动视口到容器中心 - 使用translate方法
      this.editor.viewportManager.translate(deltaX, deltaY);

      // 调整缩放比例，确保容器完全可见
      const containerWidth = containerBbox.maxX - containerBbox.minX;
      const containerHeight = containerBbox.maxY - containerBbox.minY;
      const scaleX = viewportWidth / (containerWidth + 100); // 留100px边距
      const scaleY = viewportHeight / (containerHeight + 100);
      const scale = Math.min(scaleX, scaleY, 1); // 不超过100%缩放

      console.log('H5Service: 缩放计算', {
        containerWidth,
        containerHeight,
        scaleX,
        scaleY,
        scale,
      });

      if (scale < 1) {
        this.editor.viewportManager.setZoom(scale, {
          x: viewportCenterX,
          y: viewportCenterY,
        });
      }

      console.log('H5Service: 视口调整完成');
    } catch (error) {
      console.warn('H5Service: 调整视口到容器中心失败:', error);
      // 如果失败，使用默认的zoomToFit
      this.editor.viewportManager.zoomToFit(1);
    }
  }

  /**
   * 获取当前H5容器
   */
  getCurrentContainer(): H5Container | null {
    // 检查容器是否仍然有效
    if (this.currentContainer) {
      try {
        // 验证容器是否还在画布中
        const currentCanvas = this.canvasStateManager.getCurrentCanvas();
        if (currentCanvas) {
          const containerExists = currentCanvas
            .getChildren()
            .some(
              (child) => child.attrs.id === this.currentContainer?.attrs.id,
            );

          if (!containerExists) {
            console.warn('H5Service: 容器已从画布中丢失，尝试恢复');
            // 尝试重新添加容器到画布
            this.restoreContainer();
          }
        }
      } catch (error) {
        console.warn('H5Service: 检查容器状态时出错', error);
      }
    }

    return this.currentContainer;
  }

  /**
   * 恢复丢失的容器
   */
  private restoreContainer(): void {
    if (!this.currentContainer) return;

    try {
      console.log('H5Service: 尝试恢复丢失的H5容器');

      const currentCanvas = this.canvasStateManager.getCurrentCanvas();
      if (currentCanvas) {
        // 重新添加容器到画布
        currentCanvas.insertChild(this.currentContainer as any);

        // 重新调整视口
        this.centerViewportOnContainer();

        // 重新渲染
        this.editor.render();

        console.log('H5Service: H5容器恢复成功');
      }
    } catch (error) {
      console.error('H5Service: 恢复H5容器失败', error);
      // 如果恢复失败，清空引用
      this.currentContainer = null;
    }
  }

  // 添加文本块
  addTextBlock(content: string = '请输入文本内容'): H5TextBlock | null {
    if (!this.currentContainer) return null;

    const textBlock = this.currentContainer.addContentBlock({
      blockType: 'text',
      content,
      fontSize: 16,
      textAlign: 'left',
      textColor: '#333333',
      marginTop: 8,
      marginBottom: 8,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
    }) as unknown as H5TextBlock;

    this.editor.render();
    return textBlock;
  }

  // 添加图片块
  addImageBlock(src: string = '', alt: string = '图片'): H5ImageBlock | null {
    if (!this.currentContainer) return null;

    const imageBlock = this.currentContainer.addContentBlock({
      blockType: 'image',
      src,
      alt,
      objectFit: 'cover',
      marginTop: 8,
      marginBottom: 8,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
    }) as unknown as H5ImageBlock;

    this.editor.render();
    return imageBlock;
  }

  // 添加按钮块
  addButtonBlock(text: string = '点击按钮'): H5ButtonBlock | null {
    if (!this.currentContainer) return null;

    const buttonBlock = this.currentContainer.addContentBlock({
      blockType: 'button',
      text,
      backgroundColor: '#007AFF',
      textColor: '#FFFFFF',
      borderRadius: 8,
      fontSize: 16,
      marginTop: 12,
      marginBottom: 12,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
    }) as unknown as H5ButtonBlock;

    this.editor.render();
    return buttonBlock;
  }

  // 删除内容块
  removeContentBlock(blockId: string): boolean {
    if (!this.currentContainer) return false;

    const success = this.currentContainer.removeContentBlock(blockId);
    if (success) {
      this.editor.render();
    }
    return success;
  }

  // 重新排序内容块
  reorderContentBlocks(newOrder: string[]): void {
    if (!this.currentContainer) return;

    this.currentContainer.reorderContentBlocks(newOrder);
    this.editor.render();
  }

  // 更新内容块属性
  updateContentBlock(
    blockId: string,
    attrs: Partial<H5ContentBlockAttrs>,
  ): boolean {
    if (!this.currentContainer) return false;

    const blocks = this.currentContainer.getSortedContentBlocks();
    const targetBlock = blocks.find((block) => block.attrs.id === blockId);

    if (targetBlock) {
      // 更新属性
      targetBlock.updateAttrs(attrs as any);

      // 检查是否需要重新布局
      const layoutAffectingProps = [
        'marginTop',
        'marginBottom',
        'paddingTop',
        'paddingBottom',
        'height',
      ];
      const shouldRelayout = Object.keys(attrs).some((key) =>
        layoutAffectingProps.includes(key),
      );

      if (shouldRelayout && this.currentContainer.isAutoLayoutEnabled()) {
        // 触发重新布局 - 使用编辑器的渲染系统
        this.editor.render();
      }

      this.editor.render();
      return true;
    }

    return false;
  }

  // 更新文本块内容
  updateTextBlockContent(blockId: string, content: string): boolean {
    return this.updateContentBlock(blockId, { content });
  }

  // 更新图片块源
  updateImageBlockSrc(blockId: string, src: string): boolean {
    const success = this.updateContentBlock(blockId, { src });

    if (success) {
      // 找到图片块并重新加载图片
      const blocks = this.currentContainer?.getSortedContentBlocks() || [];
      const imageBlock = blocks.find(
        (block) => block.attrs.id === blockId,
      ) as unknown as H5ImageBlock;
      if (imageBlock && imageBlock.updateImageSrc) {
        imageBlock.updateImageSrc(src);
      }
    }

    return success;
  }

  // 更新按钮块文本
  updateButtonBlockText(blockId: string, text: string): boolean {
    return this.updateContentBlock(blockId, { text });
  }

  // 获取所有内容块
  getAllContentBlocks(): H5ContentBlock[] {
    if (!this.currentContainer) return [];
    return this.currentContainer.getSortedContentBlocks();
  }

  // 选择内容块
  selectContentBlock(blockId: string): void {
    if (!this.currentContainer) return;

    // 使用容器的选择方法
    this.currentContainer.selectContentBlock(blockId);
    this.editor.render();
  }

  // 取消选择
  clearSelection(): void {
    if (!this.currentContainer) return;

    // 使用容器的清除选择方法
    this.currentContainer.clearSelection();
    this.editor.render();
  }

  // 导出 H5 数据 - 简化版本
  exportH5Data(): any {
    if (!this.currentContainer) return null;

    const blocks = this.currentContainer.getSortedContentBlocks();
    return {
      container: {
        id: this.currentContainer.attrs.id,
        objectName: this.currentContainer.attrs.objectName,
        width: this.currentContainer.attrs.width,
        height: this.currentContainer.attrs.height,
        mobileWidth: this.currentContainer.getMobileWidth(),
        padding: this.currentContainer.getPadding(),
        gap: this.currentContainer.getGap(),
        autoLayout: this.currentContainer.isAutoLayoutEnabled(),
      },
      blocks: blocks.map((block) => ({
        id: block.attrs.id,
        type: block.attrs.blockType,
        order: block.attrs.order,
        attrs: block.attrs,
      })),
    };
  }

  // 导出为多种分辨率的图片
  async exportToImages(
    resolutions: { width: number; height: number; name: string }[],
  ): Promise<{ [key: string]: Blob }> {
    if (!this.currentContainer) {
      throw new Error('没有可导出的H5内容');
    }

    const results: { [key: string]: Blob } = {};

    try {
      for (const resolution of resolutions) {
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = resolution.width;
        tempCanvas.height = resolution.height;
        const tempCtx = tempCanvas.getContext('2d')!;

        // 计算缩放比例
        const scaleX =
          resolution.width / (this.currentContainer.attrs.width || 375);
        const scaleY =
          resolution.height / (this.currentContainer.attrs.height || 667);

        // 应用缩放
        tempCtx.scale(scaleX, scaleY);

        // 使用编辑器的渲染系统而不是容器的render方法
        // 这里需要重新设计导出逻辑，暂时跳过
        console.warn('图片导出功能需要重新设计');

        // 转换为 Blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          tempCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('导出图片失败'));
              }
            },
            'image/png',
            1.0,
          );
        });

        results[resolution.name] = blob;
      }

      return results;
    } catch (error) {
      console.error('导出图片失败:', error);
      throw error;
    }
  }

  // 从编辑器数据加载 H5 内容 - 简化版本
  loadFromEditorData(data: IEditorPaperData): boolean {
    try {
      // 查找 H5 容器
      const h5ContainerData = data.data.find(
        (item) => (item.type as any) === 'H5Container',
      );

      if (!h5ContainerData) {
        console.warn('未找到H5容器数据');
        return false;
      }

      // 创建新的H5容器
      this.currentContainer = new H5Container(
        {
          id: h5ContainerData.id || `h5_container_${Date.now()}`,
          objectName: h5ContainerData.objectName || 'H5长图容器',
          width: h5ContainerData.width || 375,
          height: h5ContainerData.height || 667,
          mobileWidth: (h5ContainerData as any).mobileWidth || 375,
          padding: (h5ContainerData as any).padding || 16,
          gap: (h5ContainerData as any).gap || 12,
          autoLayout: (h5ContainerData as any).autoLayout !== false,
          resizeToFit: false,
        },
        { doc: this.editor.doc } as any,
      );

      // 将容器添加到画布
      const currentCanvas = this.canvasStateManager.getCurrentCanvas();
      if (currentCanvas) {
        // 清空子元素
        const children = currentCanvas.getChildren();
        children.forEach((child) => {
          currentCanvas.removeChild(child);
        });
        currentCanvas.insertChild(this.currentContainer as any);
      }

      this.editor.render();
      return true;
    } catch (error) {
      console.error('加载H5数据失败:', error);
      return false;
    }
  }

  // 切换自动布局
  toggleAutoLayout(): void {
    if (!this.currentContainer) return;

    // const currentAutoLayout = this.currentContainer.isAutoLayoutEnabled();
    // 这里需要重新设计，暂时跳过
    console.warn('自动布局切换功能需要重新设计');

    this.editor.render();
  }

  // 设置容器样式
  updateContainerStyle(style: {
    padding?: number;
    gap?: number;
    mobileWidth?: number;
  }): boolean {
    if (!this.currentContainer) return false;

    try {
      // 更新容器属性
      if (style.padding !== undefined) {
        (this.currentContainer as any).padding = style.padding;
      }
      if (style.gap !== undefined) {
        (this.currentContainer as any).gap = style.gap;
      }
      if (style.mobileWidth !== undefined) {
        (this.currentContainer as any).mobileWidth = style.mobileWidth;
      }

      // 重新渲染
      this.editor.render();
      return true;
    } catch (error) {
      console.error('更新容器样式失败:', error);
      return false;
    }
  }

  // 预览功能 - 生成预览数据
  generatePreviewData(): any {
    if (!this.currentContainer) return null;

    const blocks = this.currentContainer.getSortedContentBlocks();

    return {
      container: {
        width: this.currentContainer.getMobileWidth() || 375,
        height: this.currentContainer.attrs.height || 667,
        backgroundColor: '#ffffff', // 使用默认背景色
      },
      blocks: blocks.map((block) => ({
        id: block.attrs.id,
        type: block.attrs.blockType,
        content: this.getBlockPreviewContent(block),
        style: this.getBlockPreviewStyle(block),
      })),
    };
  }

  private getBlockPreviewContent(block: H5ContentBlock): any {
    switch (block.attrs.blockType) {
      case 'text':
        return {
          text: block.attrs.content || '',
          fontSize: block.attrs.fontSize || 16,
          color: block.attrs.textColor || '#333333',
          textAlign: block.attrs.textAlign || 'left',
        };
      case 'image':
        return {
          src: block.attrs.src || '',
          alt: block.attrs.alt || '图片',
          objectFit: block.attrs.objectFit || 'cover',
        };
      case 'button':
        return {
          text: block.attrs.text || '按钮',
          backgroundColor: block.attrs.backgroundColor || '#007AFF',
          textColor: block.attrs.textColor || '#FFFFFF',
          borderRadius: block.attrs.borderRadius || 8,
          href: block.attrs.href,
          target: block.attrs.target,
        };
      default:
        return {};
    }
  }

  private getBlockPreviewStyle(block: H5ContentBlock): any {
    const style = block.getBlockStyle();
    return {
      ...style,
      width: block.attrs.width,
      height: block.attrs.height,
    };
  }

  /**
   * 销毁H5服务
   */
  destroy(): void {
    // 停止容器状态监控
    this.stopContainerMonitoring();

    if (this.currentContainer) {
      try {
        const currentCanvas = this.canvasStateManager.getCurrentCanvas();
        if (currentCanvas) {
          // 检查容器是否还在画布中
          const containerExists = currentCanvas
            .getChildren()
            .some(
              (child) => child.attrs.id === this.currentContainer?.attrs.id,
            );

          if (containerExists) {
            // 从画布中移除容器
            currentCanvas.removeChild(this.currentContainer);
          }
        }

        // 清理容器引用
        this.currentContainer = null;

        // 重新渲染编辑器
        this.editor.render();
      } catch (error) {
        console.warn('H5Service销毁过程中出现警告:', error);
        this.currentContainer = null;
      }
    }
  }
}
