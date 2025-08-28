import { type Optional } from '../../type';
import {
  GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
} from '../graphics';
import {
  H5ButtonBlock,
  type H5ContentBlock,
  type H5ContentBlockAttrs,
  H5ImageBlock,
  H5TextBlock,
} from './content_block';

// H5 容器属性
export interface H5ContainerAttrs extends GraphicsAttrs {
  backgroundColor?: string;
  padding?: number;
  gap?: number; // 内容块之间的间距
  autoLayout?: boolean; // 是否自动布局
  mobileWidth?: number; // 移动端宽度，默认375px
}

// H5 容器类 - 管理长图布局
export class H5Container extends GAssetForgeGraphics<H5ContainerAttrs> {
  override type = 'H5Container' as any;
  protected override isContainer = true;

  constructor(attrs: Optional<H5ContainerAttrs, 'type'>, opts: IGraphicsOpts) {
    super(
      {
        ...attrs,
        type: 'H5Container' as any,
        backgroundColor: attrs.backgroundColor || '#ffffff',
        padding: attrs.padding || 16,
        gap: attrs.gap || 12,
        autoLayout: attrs.autoLayout !== false, // 默认开启自动布局
        mobileWidth: attrs.mobileWidth || 375,
        width: attrs.width || 375,
        height: attrs.height || 667, // 初始高度，会根据内容自动调整
      },
      opts,
    );
  }

  render(
    ctx: CanvasRenderingContext2D,
    renderingState: { scaleX: number; scaleY: number },
  ): void {
    ctx.save();

    // 绘制容器背景
    ctx.fillStyle = this.attrs.backgroundColor || '#ffffff';
    ctx.fillRect(
      (this.attrs as any).x || 0,
      (this.attrs as any).y || 0,
      this.attrs.width || 375,
      this.attrs.height || 667,
    );

    // 如果启用自动布局，重新计算子元素位置
    if (this.attrs.autoLayout) {
      this.performAutoLayout();
    }

    ctx.restore();

    // 渲染子元素
    const children = this.getChildren();
    children.forEach((child) => {
      if ((child as any).render) {
        (child as any).render(ctx, renderingState);
      }
    });
  }

  // 自动布局功能
  private performAutoLayout(): void {
    const children = this.getChildren() as H5ContentBlock[];
    if (children.length === 0) return;

    // 按 order 排序
    const sortedChildren = children.sort(
      (a, b) => a.attrs.order - b.attrs.order,
    );

    let currentY = this.attrs.padding || 16;
    const containerWidth = this.attrs.mobileWidth || 375;
    const contentWidth = containerWidth - (this.attrs.padding || 16) * 2;

    sortedChildren.forEach((child) => {
      // 设置子元素的位置和宽度
      child.updateAttrs({
        x: this.attrs.padding || 16,
        y: currentY + (child.attrs.marginTop || 0),
        width: contentWidth,
      });

      // 计算子元素的实际高度
      const childHeight = this.calculateChildHeight(child);
      child.updateAttrs({ height: childHeight });

      // 更新下一个元素的Y位置
      currentY +=
        (child.attrs.marginTop || 0) +
        childHeight +
        (child.attrs.marginBottom || 0) +
        (this.attrs.gap || 12);
    });

    // 更新容器高度
    const totalHeight =
      currentY + (this.attrs.padding || 16) - (this.attrs.gap || 12);
    this.updateAttrs({ height: Math.max(totalHeight, 667) });
  }

  // 计算子元素高度
  private calculateChildHeight(child: H5ContentBlock): number {
    const blockStyle = child.getBlockStyle();
    const contentPadding = blockStyle.paddingTop + blockStyle.paddingBottom;

    switch (child.attrs.blockType) {
      case 'text': {
        // 文本块高度基于内容和字体大小
        const fontSize = child.attrs.fontSize || 16;
        const lineHeight = child.attrs.lineHeight || fontSize * 1.2;
        const lines = this.estimateTextLines(
          child.attrs.content || '',
          child.attrs.width || 300,
        );
        return lines * lineHeight + contentPadding;
      }

      case 'image':
        // 图片块使用固定高度或根据宽高比计算
        return (child.attrs.height || 200) + contentPadding;

      case 'button':
        // 按钮块使用固定高度
        return 44 + contentPadding;

      default:
        return 60 + contentPadding;
    }
  }

  // 估算文本行数
  private estimateTextLines(text: string, width: number): number {
    if (!text) return 1;

    // 简单估算：假设每个字符平均宽度为8px
    const avgCharWidth = 8;
    const charsPerLine = Math.floor(width / avgCharWidth);
    return Math.ceil(text.length / charsPerLine);
  }

  // 添加内容块
  async addContentBlock(
    blockAttrs: Partial<H5ContentBlockAttrs>,
  ): Promise<H5ContentBlock> {
    const children = this.getChildren() as H5ContentBlock[];
    const maxOrder = children.reduce(
      (max, child) => Math.max(max, child.attrs.order),
      -1,
    );

    const newBlockAttrs = {
      ...blockAttrs,
      id: blockAttrs.id || `block_${Date.now()}`,
      objectName: blockAttrs.objectName || `内容块 ${maxOrder + 2}`,
      order: blockAttrs.order !== undefined ? blockAttrs.order : maxOrder + 1,
      x: this.attrs.padding || 16,
      y: 0, // 将在自动布局中计算
      width: (this.attrs.mobileWidth || 375) - (this.attrs.padding || 16) * 2,
      transform: [1, 0, 0, 1, 0, 0], // 添加必需的 transform 属性
    } as H5ContentBlockAttrs;

    // 根据块类型创建相应的实例
    let contentBlock: H5ContentBlock;

    // Use imported H5 content block classes

    switch (blockAttrs.blockType) {
      case 'text':
        contentBlock = new H5TextBlock(
          newBlockAttrs as any,
          {
            editor: (this as any).editor,
          } as any,
        );
        break;
      case 'image':
        contentBlock = new H5ImageBlock(
          newBlockAttrs as any,
          {
            editor: (this as any).editor,
          } as any,
        );
        break;
      case 'button':
        contentBlock = new H5ButtonBlock(
          newBlockAttrs as any,
          {
            editor: (this as any).editor,
          } as any,
        );
        break;
      default:
        throw new Error(`不支持的内容块类型: ${blockAttrs.blockType}`);
    }

    this.insertChild(contentBlock as any);

    // 触发自动布局
    if (this.attrs.autoLayout) {
      this.performAutoLayout();
    }

    return contentBlock;
  }

  // 删除内容块
  removeContentBlock(blockId: string): boolean {
    const children = this.getChildren() as H5ContentBlock[];
    const targetBlock = children.find((child) => child.attrs.id === blockId);

    if (targetBlock) {
      this.removeChild(targetBlock as any);

      // 重新排序剩余的块
      this.reorderContentBlocks();

      // 触发自动布局
      if (this.attrs.autoLayout) {
        this.performAutoLayout();
      }

      return true;
    }

    return false;
  }

  // 重新排序内容块
  reorderContentBlocks(newOrder?: string[]): void {
    const children = this.getChildren() as H5ContentBlock[];

    if (newOrder) {
      // 根据提供的顺序重新排序
      newOrder.forEach((blockId, index) => {
        const block = children.find((child) => child.attrs.id === blockId);
        if (block) {
          block.updateAttrs({ order: index } as any);
        }
      });
    } else {
      // 重新分配连续的order值
      const sortedChildren = children.sort(
        (a, b) => a.attrs.order - b.attrs.order,
      );
      sortedChildren.forEach((child, index) => {
        child.updateAttrs({ order: index } as any);
      });
    }

    // 触发自动布局
    if (this.attrs.autoLayout) {
      this.performAutoLayout();
    }
  }

  // 获取排序后的内容块
  getSortedContentBlocks(): H5ContentBlock[] {
    const children = this.getChildren() as H5ContentBlock[];
    return children.sort((a, b) => a.attrs.order - b.attrs.order);
  }

  // 导出为H5数据
  exportToH5Data(): any {
    const sortedBlocks = this.getSortedContentBlocks();

    return {
      container: {
        width: this.attrs.mobileWidth || 375,
        height: this.attrs.height || 667,
        backgroundColor: this.attrs.backgroundColor || '#ffffff',
        padding: this.attrs.padding || 16,
        gap: this.attrs.gap || 12,
      },
      blocks: sortedBlocks.map((block) => ({
        id: block.attrs.id,
        type: block.attrs.blockType,
        order: block.attrs.order,
        attrs: block.attrs,
        style: block.getBlockStyle(),
      })),
    };
  }

  // 从H5数据导入
  static fromH5Data(data: any, opts: IGraphicsOpts): H5Container {
    const container = new H5Container(
      {
        id: data.container.id || `h5_container_${Date.now()}`,
        objectName: data.container.objectName || 'H5长图容器',
        width: data.container.width || 375,
        height: data.container.height || 667,
        backgroundColor: data.container.backgroundColor || '#ffffff',
        padding: data.container.padding || 16,
        gap: data.container.gap || 12,
        mobileWidth: data.container.width || 375,
        transform: [1, 0, 0, 1, 0, 0], // 添加必需的 transform 属性
      },
      opts,
    );

    // 添加内容块
    if (data.blocks && Array.isArray(data.blocks)) {
      data.blocks
        .sort((a: any, b: any) => a.order - b.order)
        .forEach((blockData: any) => {
          container.addContentBlock({
            ...blockData.attrs,
            blockType: blockData.type,
            order: blockData.order,
          });
        });
    }

    return container;
  }
}
