// H5 容器
import { type IPaint, PaintType } from '../../paint';
import { type Optional } from '../../type';
import { GAssetForgeFrame } from '../frame';
import { type GraphicsAttrs, type IGraphicsOpts } from '../graphics';
// 移除graphCtorMap导入，避免循环依赖
// import { graphCtorMap } from '../graphics_ctor_map';
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
  disableMove?: boolean; // 是否禁止移动
  resizeToFit: boolean; // 继承自Frame
  // 确保fill和stroke属性类型正确
  fill?: IPaint[];
  stroke?: IPaint[];
  strokeWidth?: number;
  // 移除children属性，子元素由SceneGraph统一管理
}

// H5 容器类 - 轻量级实现，继承自Frame
export class H5Container extends GAssetForgeFrame {
  override type = 'H5Container' as any;

  // H5特有的属性
  private mobileWidth: number;
  private padding: number;
  private gap: number;
  private autoLayout: boolean;
  private disableMove: boolean;

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
        width: attrs.width || 1080, // H5长图标准宽度
        height: attrs.height || 2220, // H5长图标准高度
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

    // 设置H5特有属性到attrs中，确保序列化时能保存
    (this.attrs as any).mobileWidth = attrs.mobileWidth || 1080; // H5长图标准宽度
    (this.attrs as any).padding = attrs.padding || 16;
    (this.attrs as any).gap = attrs.gap || 12;
    (this.attrs as any).autoLayout = attrs.autoLayout !== false; // 默认开启自动布局
    (this.attrs as any).disableMove = attrs.disableMove !== false; // 默认禁止移动

    // 同时设置私有变量，保持向后兼容
    this.mobileWidth = (this.attrs as any).mobileWidth;
    this.padding = (this.attrs as any).padding;
    this.gap = (this.attrs as any).gap;
    this.autoLayout = (this.attrs as any).autoLayout;
    this.disableMove = (this.attrs as any).disableMove;
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

  // 是否禁止移动
  isMoveDisabled(): boolean {
    return this.disableMove;
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
      id: blockAttrs.id || `block_${maxOrder + 1}`, // 使用序号ID
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

  // 移除自定义序列化方法，由 SceneGraph 统一处理
  // 子元素会作为独立的图形对象被序列化

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
