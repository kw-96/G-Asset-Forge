import { type GAssetForgeEditor } from '../editor';
import { H5Container } from '../graphics/h5/h5_container';
import {
  H5ContentBlock,
  H5TextBlock,
  H5ImageBlock,
  H5ButtonBlock,
  type H5ContentBlockAttrs,
} from '../graphics/h5/content_block';
import { type IEditorPaperData } from '../type';

// H5 编辑服务
export class H5Service {
  private editor: GAssetForgeEditor;
  private currentContainer: H5Container | null = null;

  constructor(editor: GAssetForgeEditor) {
    this.editor = editor;
  }

  // 初始化 H5 编辑模式
  initializeH5Mode(): H5Container {
    // 清空当前画布
    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (currentCanvas) {
      // 清空子元素
      const children = currentCanvas.getChildren();
      children.forEach((child) => {
        currentCanvas.removeChild(child);
      });
    }

    // 创建 H5 容器
    this.currentContainer = new H5Container(
      {
        id: `h5_container_${Date.now()}`,
        objectName: 'H5长图容器',
        width: 375,
        height: 667,
        mobileWidth: 375,
        backgroundColor: '#ffffff',
        padding: 16,
        gap: 12,
        autoLayout: true,
        transform: [1, 0, 0, 1, 0, 0],
      },
      { editor: this.editor } as any,
    );

    // 将容器添加到画布
    if (currentCanvas) {
      currentCanvas.insertChild(this.currentContainer as any);
    }

    // 调整视口以适应移动端尺寸
    this.editor.viewportManager.setViewportSize({
      width: 375 + 100, // 留一些边距
      height: 667 + 100,
    });

    // 设置画布背景色
    if (currentCanvas) {
      currentCanvas.updateAttrs({
        backgroundColor: '#f5f5f5', // 浅灰色背景，突出显示手机容器
      } as any);
    }

    this.editor.render();
    return this.currentContainer;
  }

  // 获取当前 H5 容器
  getCurrentContainer(): H5Container | null {
    return this.currentContainer;
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
      targetBlock.updateAttrs(attrs as any);

      // 如果更新了影响布局的属性，触发自动布局
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

      if (shouldRelayout && this.currentContainer.attrs.autoLayout) {
        // 触发重新布局
        this.currentContainer.render(this.editor.ctx, { scaleX: 1, scaleY: 1 });
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
    const blocks = this.getAllContentBlocks();
    const targetBlock = blocks.find((block) => block.attrs.id === blockId);

    if (targetBlock) {
      // 清除当前选择
      this.editor.selectedElements.clear();

      // 选择目标块
      (this.editor.selectedElements as any).setElements([targetBlock as any]);
      this.editor.render();
    }
  }

  // 取消选择
  clearSelection(): void {
    this.editor.selectedElements.clear();
    this.editor.render();
  }

  // 导出 H5 数据
  exportH5Data(): any {
    if (!this.currentContainer) return null;
    return this.currentContainer.exportToH5Data();
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

        // 渲染容器到临时画布
        this.currentContainer.render(tempCtx, { scaleX, scaleY });

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

  // 从编辑器数据加载 H5 内容
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

      // 重建 H5 容器
      this.currentContainer = H5Container.fromH5Data(
        {
          container: h5ContainerData,
          blocks: data.data.filter(
            (item) =>
              (item.type as any)?.startsWith('H5') &&
              (item.type as any) !== 'H5Container',
          ),
        },
        { editor: this.editor } as any,
      );

      // 将容器添加到画布
      const currentCanvas = this.editor.doc.getCurrentCanvas();
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

    const currentAutoLayout = this.currentContainer.attrs.autoLayout;
    this.currentContainer.updateAttrs({
      autoLayout: !currentAutoLayout,
    } as any);

    if (!currentAutoLayout) {
      // 如果开启自动布局，立即执行一次布局
      this.currentContainer.render(this.editor.ctx, { scaleX: 1, scaleY: 1 });
    }

    this.editor.render();
  }

  // 设置容器样式
  updateContainerStyle(style: {
    backgroundColor?: string;
    padding?: number;
    gap?: number;
  }): void {
    if (!this.currentContainer) return;

    this.currentContainer.updateAttrs(style as any);

    // 如果更改了padding或gap，需要重新布局
    if (style.padding !== undefined || style.gap !== undefined) {
      this.currentContainer.render(this.editor.ctx, { scaleX: 1, scaleY: 1 });
    }

    this.editor.render();
  }

  // 预览功能 - 生成预览数据
  generatePreviewData(): any {
    if (!this.currentContainer) return null;

    const blocks = this.currentContainer.getSortedContentBlocks();

    return {
      container: {
        width: this.currentContainer.attrs.mobileWidth || 375,
        height: this.currentContainer.attrs.height || 667,
        backgroundColor:
          this.currentContainer.attrs.backgroundColor || '#ffffff',
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

  // 销毁服务
  destroy(): void {
    this.currentContainer = null;
  }
}
