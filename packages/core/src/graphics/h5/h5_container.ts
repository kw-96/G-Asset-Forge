// H5 容器
import { LayoutAttrsConfigManager, LayoutUtils } from '../../layout';
import { type IPaint } from '../../paint';
import { GraphicsType, type Optional } from '../../type';
import { GAssetForgeFrame } from '../frame';
import {
  type GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
} from '../graphics';
import { H5ContainerAttrsController } from './h5_container_attrs';

// H5 容器属性 - 继承Frame的所有属性，H5Container不添加任何特有属性
export interface H5ContainerAttrs extends GraphicsAttrs {
  resizeToFit: boolean; // 继承自Frame
  // 确保fill和stroke属性类型正确
  fill?: IPaint[];
  stroke?: IPaint[];
  strokeWidth?: number;
  // H5Container不定义特有属性，所有布局属性由通用系统管理
}

// H5 容器类 - 轻量级实现，继承自Frame
export class H5Container extends GAssetForgeFrame {
  override type = GraphicsType.H5Container;

  constructor(
    attrs: Optional<H5ContainerAttrs, 'id' | 'transform'>,
    opts: IGraphicsOpts,
  ) {
    // 调用Frame的构造函数，H5Container专注于H5业务特性
    super(
      {
        ...attrs,
        type: GraphicsType.H5Container, // H5Container类型，用于类型识别
        resizeToFit: false, // H5容器不自动调整尺寸
        objectName: attrs.objectName || 'H5长图容器',
        width: attrs.width || 1080, // H5长图标准宽度
        height: attrs.height || 2220, // H5长图标准高度
        // H5特有：强制设置位置为(0,0)，确保H5容器不可移动
        transform: [1, 0, 0, 1, 0, 0], // 单位矩阵，位置为(0,0)
        // H5特有：不设置任何填充和边框，导出时保持纯净
        // 编辑器中的可见性通过其他方式实现（如选中框、CSS样式等）
        fill: attrs.fill || [], // 空填充数组
        stroke: attrs.stroke || [], // 空边框数组
        strokeWidth: 0, // 无边框宽度
      },
      opts,
    );
  }

  // 重写图层图标路径 - H5容器使用sticky图标
  override getLayerIconPath() {
    // 返回图标名称，让LayerIcon组件处理图标导入
    return 'icon.24.sticky' as any;
  }

  // 检查是否应该在编辑器中显示边界
  shouldShowEditorBorder(): boolean {
    // 当容器为空或者没有子元素时，显示边界帮助用户识别
    const children = this.getChildren();
    return children.length === 0;
  }

  // H5特有：检查是否启用自动布局（从通用属性获取）
  isAutoLayoutEnabled(): boolean {
    return (this.attrs as any).autoLayout || false;
  }

  // 获取排序后的Frame子元素（自动布局仅作用于Frame）
  getSortedChildren(): GAssetForgeGraphics[] {
    const children = this.getChildren();
    // 只返回Frame类型的子元素，其他类型（文本、图片等）保持自由定位
    const frameChildren = children.filter((child) => {
      return (
        child.type === 'Frame' || child.constructor.name === 'GAssetForgeFrame'
      );
    });

    return frameChildren.sort((a, b) => {
      // 优先按order排序，如果没有order则按添加顺序
      const orderA = (a.attrs as any).order ?? 0;
      const orderB = (b.attrs as any).order ?? 0;
      return orderA - orderB;
    });
  }

  // 获取所有子元素（包括非Frame类型）
  getAllChildren(): GAssetForgeGraphics[] {
    const children = this.getChildren();
    return children.sort((a, b) => {
      // 优先按order排序，如果没有order则按添加顺序
      const orderA = (a.attrs as any).order ?? 0;
      const orderB = (b.attrs as any).order ?? 0;
      return orderA - orderB;
    });
  }

  // 触发自动布局（公共方法）
  public triggerAutoLayout(): void {
    if (this.isAutoLayoutEnabled()) {
      this.performAutoLayout();
    }
  }

  // 重写insertChild方法，添加组件后自动布局
  override insertChild(graphics: GAssetForgeGraphics, sortIdx?: string): void {
    super.insertChild(graphics, sortIdx);

    // 只有在自动布局开启且插入的是Frame类型时才执行布局
    if (this.isAutoLayoutEnabled()) {
      const isFrame =
        graphics.type === 'Frame' ||
        graphics.constructor.name === 'GAssetForgeFrame';

      if (isFrame) {
        // 直接执行自动布局，无需检查文本编辑器状态
        this.performAutoLayout();
      } else {
        console.log(
          'H5Container: 插入非Frame元素，跳过自动布局:',
          graphics.type,
        );
      }
    }

    // 更新编辑器选中状态
    const editor = (this.doc as any)?.editor;
    editor?.selectedElements?.setItems([graphics]);
  }

  // 自动布局功能 - H5Container的唯一特性：仅对Frame类型的直接子元素进行布局
  private performAutoLayout(): void {
    // 获取Frame类型的直接子元素（H5Container特有逻辑）
    const frameChildren = this.getSortedChildren();
    if (frameChildren.length === 0) return;

    // 从通用属性获取布局配置
    const containerWidth = this.attrs.width || 1080;
    const gap = (this.attrs as any).gap || 0;
    const padding = (this.attrs as any).padding || 0;
    const layoutType = (this.attrs as any).layoutType || 'vertical';
    const gridColumns = (this.attrs as any).gridColumns || 2;

    const layoutOptions = {
      gap,
      padding,
      maxWidth: containerWidth,
      containerWidth: containerWidth,
      containerHeight: this.attrs.height,
    };

    // 调用通用布局工具（H5特有：仅对Frame子元素布局）
    switch (layoutType) {
      case 'vertical':
        LayoutUtils.verticalLayout(frameChildren, {
          gap: layoutOptions.gap,
          padding: layoutOptions.padding,
          align: 'stretch',
        });
        break;
      case 'horizontal':
        LayoutUtils.horizontalLayout(frameChildren, {
          gap: layoutOptions.gap,
          padding: layoutOptions.padding,
          align: 'stretch',
          wrap: true,
        });
        break;
      case 'grid':
        LayoutUtils.gridLayout(frameChildren, {
          columns: gridColumns,
          gap: layoutOptions.gap,
          padding: layoutOptions.padding,
        });
        break;
      case 'smart':
        LayoutUtils.smartLayout(frameChildren, {
          maxWidth: layoutOptions.maxWidth - layoutOptions.padding * 2,
          gap: layoutOptions.gap,
          padding: layoutOptions.padding,
        });
        break;
      default:
        LayoutUtils.verticalLayout(frameChildren, {
          gap: layoutOptions.gap,
          padding: layoutOptions.padding,
          align: 'stretch',
        });
    }

    // 自动调整容器高度以适应内容
    this.adjustContainerHeight();
  }

  // 自动调整容器高度
  private adjustContainerHeight(): void {
    const frameChildren = this.getSortedChildren();
    if (frameChildren.length === 0) {
      this.updateAttrs({ height: 667 } as any);
      return;
    }

    const padding = (this.attrs as any).padding || 0;

    // 计算Frame子元素的最大Y坐标
    let maxY = 0;
    frameChildren.forEach((child) => {
      const transform = (child.attrs as any).transform || [1, 0, 0, 1, 0, 0];
      const childY = transform[5];
      const childHeight = (child.attrs as any).height || 0;
      const childBottom = childY + childHeight;
      maxY = Math.max(maxY, childBottom);
    });

    const totalHeight = maxY + padding;
    this.updateAttrs({ height: Math.max(totalHeight, 667) } as any);
  }

  // 重新排序子元素（支持任意类型）
  reorderChildren(newOrder: string[]): void {
    const children = this.getChildren();
    const childMap = new Map(children.map((child) => [child.attrs.id, child]));

    // 重新设置order
    newOrder.forEach((childId, index) => {
      const child = childMap.get(childId);
      if (child) {
        child.updateAttrs({ order: index } as any);
      }
    });

    // 触发自动布局
    if (this.isAutoLayoutEnabled()) {
      this.performAutoLayout();
    }
  }

  // 重新排序内容块（保持向后兼容）
  reorderContentBlocks(newOrder: string[]): void {
    this.reorderChildren(newOrder);
  }

  // H5特有：重写updateAttrs方法，实现不可移动特性，并在布局属性更新时触发布局
  override updateAttrs(
    partialAttrs: Partial<GraphicsAttrs> & any,
    options?: { finishRecomputed?: boolean },
  ): void {
    // H5特有：使用属性控制器过滤属性（主要是禁止移动）
    const filteredAttrs = H5ContainerAttrsController.filterAttrsForUpdate(
      partialAttrs,
      this.attrs.transform,
    );

    // 验证属性更新
    const validation =
      H5ContainerAttrsController.validateAttrsUpdate(partialAttrs);
    if (!validation.isValid) {
      return;
    }
    if (validation.warnings.length > 0) {
      console.warn('H5容器属性更新警告:', validation.warnings);
    }

    // 调用父类的updateAttrs方法更新属性
    super.updateAttrs(filteredAttrs, options);

    // H5特有：检查是否有布局相关属性更新，如果有则触发自动布局
    const layoutRelatedAttrs = [
      'autoLayout',
      'layoutType',
      'gridColumns',
      'padding',
      'gap',
      'mobileWidth',
    ];
    const hasLayoutUpdate = layoutRelatedAttrs.some(
      (attr) => partialAttrs[attr] !== undefined,
    );

    if (hasLayoutUpdate && this.isAutoLayoutEnabled()) {
      // 延迟执行布局，确保属性已经更新完成
      setTimeout(() => this.performAutoLayout(), 0);
    }
  }

  // 获取属性面板属性
  override getInfoPanelAttrs() {
    // 只返回基础属性，布局属性由H5LayoutCard单独处理
    return super.getInfoPanelAttrs() || [];
  }

  // 获取H5布局属性（供H5LayoutCard组件使用）- 使用通用配置管理器
  getH5LayoutAttrs() {
    return LayoutAttrsConfigManager.getElementLayoutAttrs(this);
  }

  // 获取H5特有属性（保持向后兼容）
  getH5SpecificAttrs() {
    return [];
  }

  // 销毁容器
  destroy(): void {
    // 清理所有子元素
    const children = this.getChildren();
    children.forEach((child) => {
      this.removeChild(child);
    });
  }
}
