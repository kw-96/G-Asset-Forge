// H5 容器
import { type IPaint, PaintType } from '../../paint';
import { type Optional } from '../../type';
import { GAssetForgeFrame } from '../frame';
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
import { H5ContainerAttrsController } from './h5_container_attrs';

// H5 容器属性 - 继承Graphics的所有属性，添加H5特有的属性
export interface H5ContainerAttrs extends GraphicsAttrs {
  // H5特有属性
  mobileWidth?: number; // 移动端宽度，默认375px
  padding?: number; // 内边距
  gap?: number; // 内容块之间的间距
  autoLayout?: boolean; // 是否自动布局
  resizeToFit: boolean; // 继承自Frame
  // 确保fill和stroke属性类型正确
  fill?: IPaint[];
  stroke?: IPaint[];
  strokeWidth?: number;
  // 子元素数据，用于序列化/反序列化
  children?: any[];
}

// H5 容器类 - 轻量级实现，继承自Frame
export class H5Container extends GAssetForgeFrame {
  override type = 'H5Container' as any;

  // H5特有的属性
  private mobileWidth: number;
  private padding: number;
  private gap: number;
  private autoLayout: boolean;

  constructor(
    attrs: Optional<H5ContainerAttrs, 'id' | 'transform'>,
    opts: IGraphicsOpts,
  ) {
    // 调用Frame的构造函数
    super(
      {
        ...attrs,
        type: 'H5Container' as any, // 使用H5Container类型，确保序列化/反序列化一致
        resizeToFit: false, // H5容器不自动调整尺寸
        objectName: attrs.objectName || 'H5长图容器',
        width: attrs.width || 1080,
        height: attrs.height || 2220,
        // 强制设置位置为(0,0)，确保H5容器不可移动
        transform: [1, 0, 0, 1, 0, 0], // 单位矩阵，位置为(0,0)
        // 添加默认的填充和边框，确保容器可见
        fill: attrs.fill || [
          {
            type: PaintType.Solid,
            attrs: { r: 255, g: 255, b: 255, a: 1 },
            visible: true,
          } as IPaint,
        ],
        stroke: attrs.stroke || [
          {
            type: PaintType.Solid,
            attrs: { r: 200, g: 200, b: 200, a: 1 },
            visible: true,
          } as IPaint,
        ],
        strokeWidth: attrs.strokeWidth || 1,
        // 不设置lock，通过重写方法控制移动行为
      },
      opts,
    );

    // 设置H5特有属性
    this.mobileWidth = attrs.mobileWidth || 1080;
    this.padding = attrs.padding || 16;
    this.gap = attrs.gap || 12;
    this.autoLayout = attrs.autoLayout !== false; // 默认开启自动布局

    // 反序列化子元素
    if ((attrs as any).children && Array.isArray((attrs as any).children)) {
      console.log('H5Container: 开始反序列化子元素', {
        containerId: this.attrs.id,
        childrenCount: (attrs as any).children.length,
        children: (attrs as any).children.map((child: any) => ({
          id: child.id,
          type: child.type,
        })),
      });
      this.deserializeChildren((attrs as any).children);
    } else {
      console.log('H5Container: 没有找到子元素数据', {
        containerId: this.attrs.id,
        hasChildren: !!(attrs as any).children,
        childrenType: typeof (attrs as any).children,
      });
    }
  }

  // 反序列化子元素
  private deserializeChildren(childrenData: any[]): void {
    console.log('H5Container.deserializeChildren: 开始反序列化', {
      containerId: this.attrs.id,
      childrenCount: childrenData.length,
    });

    for (const childData of childrenData) {
      try {
        console.log('H5Container.deserializeChildren: 处理子元素', {
          containerId: this.attrs.id,
          childId: childData.id,
          childType: childData.type,
        });

        let child: H5ContentBlock | GAssetForgeGraphics;

        // 根据类型创建子元素
        if (childData.type === 'H5TextBlock') {
          child = new H5TextBlock(childData, { doc: this.doc });
        } else if (childData.type === 'H5ImageBlock') {
          child = new H5ImageBlock(childData, { doc: this.doc });
        } else if (childData.type === 'H5ButtonBlock') {
          child = new H5ButtonBlock(childData, { doc: this.doc });
        } else {
          // 对于其他类型的图形（如矩形），需要从图形构造函数映射中创建
          const graphCtorMap = (this.doc as any).editor?.sceneGraph
            ?.graphCtorMap;
          if (graphCtorMap && graphCtorMap[childData.type]) {
            const Ctor = graphCtorMap[childData.type];
            child = new Ctor(childData, { doc: this.doc });
          } else {
            console.warn(
              'H5Container: 无法反序列化子元素类型:',
              childData.type,
            );
            continue;
          }
        }

        // 添加到容器中
        this.insertChild(child as any);
        console.log('H5Container.deserializeChildren: 子元素添加成功', {
          containerId: this.attrs.id,
          childId: childData.id,
          childType: childData.type,
        });
      } catch (error) {
        console.error('H5Container: 反序列化子元素失败:', error, childData);
      }
    }

    console.log('H5Container.deserializeChildren: 反序列化完成', {
      containerId: this.attrs.id,
      finalChildrenCount: this.getChildren().length,
    });
  }

  // 重写updateAttrs方法，禁止移动但允许调整尺寸
  override updateAttrs(
    partialAttrs: Partial<GraphicsAttrs> & any,
    options?: { finishRecomputed?: boolean },
  ) {
    // 使用H5容器属性控制器过滤属性
    const filteredAttrs = H5ContainerAttrsController.filterAttrsForUpdate(
      partialAttrs,
      this.attrs.transform,
    );

    // 验证属性更新
    const validation =
      H5ContainerAttrsController.validateAttrsUpdate(partialAttrs);
    if (!validation.isValid) {
      console.warn(
        'H5容器属性更新被阻止，包含禁止的属性:',
        validation.forbiddenKeys,
      );
    }
    if (validation.warnings.length > 0) {
      console.warn('H5容器属性更新警告:', validation.warnings);
    }

    // 调用父类的updateAttrs方法
    super.updateAttrs(filteredAttrs, options);
  }

  // 获取移动端宽度
  getMobileWidth(): number {
    return this.mobileWidth;
  }

  // 获取内边距
  getPadding(): number {
    return this.padding;
  }

  // 获取间距
  getGap(): number {
    return this.gap;
  }

  // 是否启用自动布局
  isAutoLayoutEnabled(): boolean {
    return this.autoLayout;
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
      x: this.padding,
      y: 0, // 将在自动布局中计算
      width: this.mobileWidth - this.padding * 2,
      transform: [1, 0, 0, 1, 0, 0],
    } as H5ContentBlockAttrs;

    // 根据块类型创建相应的实例
    let contentBlock: H5ContentBlock;

    switch (blockAttrs.blockType) {
      case 'text':
        contentBlock = new H5TextBlock(
          newBlockAttrs as any,
          { doc: this.doc } as any,
        );
        break;
      case 'image':
        contentBlock = new H5ImageBlock(
          newBlockAttrs as any,
          { doc: this.doc } as any,
        );
        break;
      case 'button':
        contentBlock = new H5ButtonBlock(
          newBlockAttrs as any,
          { doc: this.doc } as any,
        );
        break;
      default:
        throw new Error(`不支持的内容块类型: ${blockAttrs.blockType}`);
    }

    this.insertChild(contentBlock as any);

    // 触发自动布局
    if (this.autoLayout) {
      this.performAutoLayout();
    }

    return contentBlock;
  }

  // 删除内容块
  removeContentBlock(blockId: string): boolean {
    const children = this.getChildren() as H5ContentBlock[];
    const blockIndex = children.findIndex(
      (child) => child.attrs.id === blockId,
    );

    if (blockIndex === -1) return false;

    const block = children[blockIndex];
    this.removeChild(block);

    // 重新计算剩余块的order
    const remainingBlocks = this.getChildren() as H5ContentBlock[];
    remainingBlocks.forEach((child, index) => {
      child.updateAttrs({ order: index } as any);
    });

    // 触发自动布局
    if (this.autoLayout) {
      this.performAutoLayout();
    }

    return true;
  }

  // 获取所有内容块
  getAllContentBlocks(): H5ContentBlock[] {
    return this.getChildren() as H5ContentBlock[];
  }

  // 获取排序后的内容块
  getSortedContentBlocks(): H5ContentBlock[] {
    const children = this.getChildren() as H5ContentBlock[];
    return children.sort((a, b) => a.attrs.order - b.attrs.order);
  }

  // 选择内容块
  selectContentBlock(blockId: string): boolean {
    const block = this.getChildren().find(
      (child) => child.attrs.id === blockId,
    );
    if (block) {
      // 使用编辑器的选择系统
      (this as any).editor?.selectedElements?.setItems([block]);
      return true;
    }
    return false;
  }

  // 清除选择
  clearSelection(): void {
    (this as any).editor?.selectedElements?.clear();
  }

  // 自动布局功能
  private performAutoLayout(): void {
    const children = this.getSortedContentBlocks();
    if (children.length === 0) return;

    let currentY = this.padding;
    const contentWidth = this.mobileWidth - this.padding * 2;

    children.forEach((child) => {
      // 设置子元素的位置和宽度
      child.updateAttrs({
        x: this.padding,
        y: currentY + (child.attrs.marginTop || 0),
        width: contentWidth,
      } as any);

      // 计算子元素的实际高度
      const childHeight = this.calculateChildHeight(child);
      child.updateAttrs({ height: childHeight } as any);

      // 更新下一个元素的Y位置
      currentY +=
        (child.attrs.marginTop || 0) +
        childHeight +
        (child.attrs.marginBottom || 0) +
        this.gap;
    });

    // 更新容器高度
    const totalHeight = currentY + this.padding - this.gap;
    this.updateAttrs({ height: Math.max(totalHeight, 667) } as any);
  }

  // 计算子元素高度
  private calculateChildHeight(child: H5ContentBlock): number {
    const blockStyle = child.getBlockStyle();
    const contentPadding = blockStyle.paddingTop + blockStyle.paddingBottom;

    switch (child.attrs.blockType) {
      case 'text': {
        // 文本块高度基于内容和字体大小
        const fontSize = child.attrs.fontSize || 16;
        const content = child.attrs.content || '';
        const lines = Math.ceil(content.length / 30); // 估算每行30个字符
        return Math.max(fontSize * lines, 40) + contentPadding;
      }
      case 'image': {
        // 图片块高度基于宽高比
        const aspectRatio = 16 / 9; // 默认16:9比例
        const contentWidth = this.mobileWidth - this.padding * 2;
        return contentWidth / aspectRatio + contentPadding;
      }
      case 'button': {
        // 按钮块固定高度
        return 48 + contentPadding;
      }
      default:
        return 100 + contentPadding;
    }
  }

  // 重新排序内容块
  reorderContentBlocks(newOrder: string[]): void {
    const children = this.getChildren() as H5ContentBlock[];
    const blockMap = new Map(children.map((child) => [child.attrs.id, child]));

    // 重新设置order
    newOrder.forEach((blockId, index) => {
      const block = blockMap.get(blockId);
      if (block) {
        block.updateAttrs({ order: index } as any);
      }
    });

    // 触发自动布局
    if (this.autoLayout) {
      this.performAutoLayout();
    }
  }

  // 序列化为JSON，包含子元素
  override toJSON(): any {
    console.log('H5Container.toJSON: 方法被调用', {
      containerId: this.attrs.id,
      type: this.type,
    });

    const baseData = super.toJSON();
    const children = this.getChildren();

    console.log('H5Container.toJSON: 开始序列化', {
      containerId: this.attrs.id,
      childrenCount: children.length,
      children: children.map((child) => ({
        id: child.attrs?.id,
        type: child.type,
      })),
    });

    const result = {
      ...baseData,
      children: children.map((child) => {
        // 如果子元素有toJSON方法，使用它；否则使用attrs
        if (typeof child.toJSON === 'function') {
          return child.toJSON();
        } else {
          return child.attrs;
        }
      }),
    };

    console.log('H5Container.toJSON: 序列化完成', {
      containerId: this.attrs.id,
      resultChildrenCount: result.children.length,
      resultChildren: result.children.map((child) => ({
        id: child.id,
        type: child.type,
      })),
    });

    return result;
  }

  // 销毁容器
  destroy(): void {
    // 清理所有子元素
    const children = this.getChildren();
    children.forEach((child) => {
      this.removeChild(child);
    });

    // Frame类没有destroy方法，不需要调用super.destroy()
  }
}
