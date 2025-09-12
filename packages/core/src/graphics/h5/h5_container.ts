// H5 容器
import { LayoutUtils } from '../../layout';
import { type IPaint, PaintType } from '../../paint';
import { GraphicsType, type Optional } from '../../type';
import { GAssetForgeFrame } from '../frame';
import {
  type GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
} from '../graphics';
import { H5ContainerAttrsController } from './h5_container_attrs';

// H5 容器属性 - 继承Graphics的所有属性，添加H5特有的属性
export interface H5ContainerAttrs extends GraphicsAttrs {
  // H5特有属性
  mobileWidth?: number; // 移动端宽度，默认375px
  padding?: number; // 内边距
  gap?: number; // 内容块之间的间距
  autoLayout?: boolean; // 是否自动布局
  layoutType?: 'vertical' | 'horizontal' | 'grid' | 'smart'; // 布局类型
  gridColumns?: number; // 网格布局列数
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
  override type = GraphicsType.H5Container;

  // H5特有的属性
  private mobileWidth: number;
  private padding: number;
  private gap: number;
  private autoLayout: boolean;
  private layoutType: 'vertical' | 'horizontal' | 'grid' | 'smart';
  private gridColumns: number;
  private disableMove: boolean;

  constructor(
    attrs: Optional<H5ContainerAttrs, 'id' | 'transform'>,
    opts: IGraphicsOpts,
  ) {
    // 调用Frame的构造函数
    super(
      {
        ...attrs,
        type: GraphicsType.H5Container, // 使用H5Container类型，确保序列化/反序列化一致
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
    (this.attrs as any).padding = attrs.padding || 0; // 内边距
    (this.attrs as any).gap = attrs.gap || 0; // 间距
    (this.attrs as any).autoLayout = attrs.autoLayout !== false; // 默认开启自动布局
    (this.attrs as any).layoutType = attrs.layoutType || 'vertical'; // 默认垂直布局
    (this.attrs as any).gridColumns = attrs.gridColumns || 2; // 默认2列网格
    (this.attrs as any).disableMove = attrs.disableMove !== false; // 默认禁止移动

    // 同时设置私有变量，保持向后兼容
    this.mobileWidth = (this.attrs as any).mobileWidth;
    this.padding = (this.attrs as any).padding;
    this.gap = (this.attrs as any).gap;
    this.autoLayout = (this.attrs as any).autoLayout;
    this.layoutType = (this.attrs as any).layoutType;
    this.gridColumns = (this.attrs as any).gridColumns;
    this.disableMove = (this.attrs as any).disableMove;
  }

  // 重写图层图标路径 - H5容器使用sticky图标
  override getLayerIconPath() {
    // 返回图标名称，让LayerIcon组件处理图标导入
    return 'icon.24.sticky' as any;
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

  // 设置自动布局开关
  setAutoLayout(enabled: boolean): void {
    this.autoLayout = enabled;
    (this.attrs as any).autoLayout = enabled;

    // 如果启用了自动布局，立即执行布局
    if (enabled) {
      this.performAutoLayout();
    }
  }

  // 是否禁止移动
  isMoveDisabled(): boolean {
    return this.disableMove;
  }

  // 获取排序后的所有子元素（支持任意类型）
  getSortedChildren(): GAssetForgeGraphics[] {
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
    if (this.autoLayout) {
      this.performAutoLayout();
    }
  }

  // 重写insertChild方法，添加组件后自动布局
  override insertChild(graphics: GAssetForgeGraphics, sortIdx?: string): void {
    super.insertChild(graphics, sortIdx);

    // 检查是否正在进行文本编辑，如果是则延迟自动布局
    if (this.autoLayout) {
      // 获取编辑器实例（从doc中获取）
      const editor = (this.doc as any)?.editor;

      if (editor?.textEditor?.isActive()) {
        console.log('H5Container: 检测到文本编辑状态，延迟自动布局');
        // 延迟执行自动布局，等待文本编辑器完成初始化
        setTimeout(() => {
          if (this.autoLayout && !editor.textEditor.isActive()) {
            console.log('H5Container: 执行延迟的自动布局');
            this.performAutoLayout();
          }
        }, 50);
      } else {
        this.performAutoLayout();
      }
    }
  }

  // 自动布局功能
  private performAutoLayout(): void {
    const children = this.getSortedChildren();
    if (children.length === 0) return;

    // 根据布局类型选择不同的布局算法
    switch (this.layoutType) {
      case 'vertical':
        this.performVerticalLayout(children);
        break;
      case 'horizontal':
        this.performHorizontalLayout(children);
        break;
      case 'grid':
        this.performGridLayout(children);
        break;
      case 'smart':
        this.performSmartLayout(children);
        break;
      default:
        this.performVerticalLayout(children);
    }

    // 更新容器高度
    this.updateContainerHeight();
  }

  // 垂直布局
  private performVerticalLayout(children: GAssetForgeGraphics[]): void {
    let currentY = this.padding;
    const contentWidth = this.mobileWidth - this.padding * 2;

    children.forEach((child, index) => {
      // 直接设置transform来确保坐标正确
      const newTransform = [1, 0, 0, 1, this.padding, currentY];

      child.updateAttrs({
        width: contentWidth,
        transform: newTransform,
      } as any);

      // 计算下一个元素的Y位置
      const childHeight = (child.attrs as any).height || 0;
      currentY += childHeight + (index < children.length - 1 ? this.gap : 0);
    });
  }

  // 水平布局
  private performHorizontalLayout(children: GAssetForgeGraphics[]): void {
    LayoutUtils.horizontalLayout(children, {
      gap: this.gap,
      padding: this.padding,
      align: 'stretch',
      wrap: true, // 允许换行
    });

    // 设置所有子元素的高度为容器内容高度
    const contentHeight = this.attrs.height - this.padding * 2;
    children.forEach((child) => {
      child.updateAttrs({
        height: contentHeight,
      } as any);
    });
  }

  // 网格布局
  private performGridLayout(children: GAssetForgeGraphics[]): void {
    LayoutUtils.gridLayout(children, {
      columns: this.gridColumns,
      gap: this.gap,
      padding: this.padding,
    });

    // 计算每个网格项的尺寸
    const contentWidth = this.mobileWidth - this.padding * 2;
    const itemWidth =
      (contentWidth - this.gap * (this.gridColumns - 1)) / this.gridColumns;

    children.forEach((child) => {
      child.updateAttrs({
        width: itemWidth,
      } as any);
    });
  }

  // 智能布局
  private performSmartLayout(children: GAssetForgeGraphics[]): void {
    LayoutUtils.smartLayout(children, {
      maxWidth: this.mobileWidth - this.padding * 2,
      gap: this.gap,
      padding: this.padding,
    });

    // 根据布局结果调整尺寸
    const contentWidth = this.mobileWidth - this.padding * 2;
    children.forEach((child) => {
      const currentWidth = (child as any).attrs.width || 100;
      if (currentWidth > contentWidth) {
        child.updateAttrs({
          width: contentWidth,
        } as any);
      }
    });
  }

  // 更新容器高度
  private updateContainerHeight(): void {
    const children = this.getSortedChildren();
    if (children.length === 0) {
      this.updateAttrs({ height: 667 } as any);
      return;
    }

    // 计算总高度 - 从transform中获取正确的Y坐标
    let maxY = 0;
    children.forEach((child) => {
      const transform = (child.attrs as any).transform || [1, 0, 0, 1, 0, 0];
      const childY = transform[5]; // 从transform矩阵中获取Y坐标
      const childHeight = (child.attrs as any).height || 0;
      const childBottom = childY + childHeight;
      maxY = Math.max(maxY, childBottom);
    });

    const totalHeight = maxY + this.padding;
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
    if (this.autoLayout) {
      this.performAutoLayout();
    }
  }

  // 重新排序内容块（保持向后兼容）
  reorderContentBlocks(newOrder: string[]): void {
    this.reorderChildren(newOrder);
  }

  // 切换布局类型
  setLayoutType(
    layoutType: 'vertical' | 'horizontal' | 'grid' | 'smart',
  ): void {
    this.layoutType = layoutType;
    (this.attrs as any).layoutType = layoutType;

    if (this.autoLayout) {
      this.performAutoLayout();
    }
  }

  // 设置网格列数
  setGridColumns(columns: number): void {
    this.gridColumns = Math.max(1, columns);
    (this.attrs as any).gridColumns = this.gridColumns;

    if (this.autoLayout && this.layoutType === 'grid') {
      this.performAutoLayout();
    }
  }

  // 获取当前布局类型
  getLayoutType(): string {
    return this.layoutType;
  }

  // 获取网格列数
  getGridColumns(): number {
    return this.gridColumns;
  }

  // 重写updateAttrs方法，处理H5特有属性并禁止移动
  override updateAttrs(
    partialAttrs: Partial<GraphicsAttrs> & any,
    options?: { finishRecomputed?: boolean },
  ): void {
    // 使用H5容器属性控制器过滤属性
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

    // 处理H5特有属性变更
    const h5Attrs = partialAttrs as Partial<H5ContainerAttrs>;

    // 处理自动布局开关变更
    if (
      h5Attrs.autoLayout !== undefined &&
      h5Attrs.autoLayout !== this.autoLayout
    ) {
      this.autoLayout = h5Attrs.autoLayout;
      (this.attrs as any).autoLayout = h5Attrs.autoLayout;

      // 如果启用了自动布局，立即执行布局
      if (h5Attrs.autoLayout) {
        this.performAutoLayout();
      }
    }

    // 处理布局类型变更
    if (h5Attrs.layoutType && h5Attrs.layoutType !== this.layoutType) {
      this.layoutType = h5Attrs.layoutType;
      (this.attrs as any).layoutType = h5Attrs.layoutType;

      if (this.autoLayout) {
        this.performAutoLayout();
      }
    }

    // 处理网格列数变更
    if (
      h5Attrs.gridColumns !== undefined &&
      h5Attrs.gridColumns !== this.gridColumns
    ) {
      this.gridColumns = Math.max(1, h5Attrs.gridColumns);
      (this.attrs as any).gridColumns = this.gridColumns;

      if (this.autoLayout && this.layoutType === 'grid') {
        this.performAutoLayout();
      }
    }

    // 处理移动端宽度变更
    if (
      h5Attrs.mobileWidth !== undefined &&
      h5Attrs.mobileWidth !== this.mobileWidth
    ) {
      this.mobileWidth = h5Attrs.mobileWidth;
      (this.attrs as any).mobileWidth = h5Attrs.mobileWidth;

      if (this.autoLayout) {
        this.performAutoLayout();
      }
    }

    // 处理内边距变更
    if (h5Attrs.padding !== undefined && h5Attrs.padding !== this.padding) {
      this.padding = h5Attrs.padding;
      (this.attrs as any).padding = h5Attrs.padding;

      if (this.autoLayout) {
        this.performAutoLayout();
      }
    }

    // 处理间距变更
    if (h5Attrs.gap !== undefined && h5Attrs.gap !== this.gap) {
      this.gap = h5Attrs.gap;
      (this.attrs as any).gap = h5Attrs.gap;

      if (this.autoLayout) {
        this.performAutoLayout();
      }
    }

    // 调用父类的updateAttrs方法
    super.updateAttrs(filteredAttrs, options);
  }

  // 获取属性面板属性
  override getInfoPanelAttrs() {
    // 只返回基础属性，布局属性由H5LayoutCard单独处理
    return super.getInfoPanelAttrs() || [];
  }

  // 获取H5布局属性（供H5LayoutCard使用）
  getH5LayoutAttrs() {
    return [
      {
        label: '自动布局',
        key: 'autoLayout',
        value: this.autoLayout,
        uiType: 'switch',
      },
      {
        label: '布局类型',
        key: 'layoutType',
        value: this.layoutType,
        uiType: 'select',
        options: [
          { value: 'vertical', label: '垂直布局' },
          { value: 'horizontal', label: '水平布局' },
          { value: 'grid', label: '网格布局' },
          { value: 'smart', label: '智能布局' },
        ],
        disabled: !this.autoLayout, // 当自动布局关闭时禁用布局类型选择
      },
      {
        label: '网格列数',
        key: 'gridColumns',
        value: this.gridColumns,
        uiType: 'number',
        min: 1,
        max: 6,
        step: 1,
        visible: this.layoutType === 'grid',
      },
      {
        label: '移动端宽度',
        key: 'mobileWidth',
        value: this.mobileWidth,
        uiType: 'number',
        min: 320,
        max: 1920,
        step: 10,
      },
      {
        label: '内边距',
        key: 'padding',
        value: this.padding,
        uiType: 'number',
        min: 0,
        max: 100,
        step: 1,
      },
      {
        label: '间距',
        key: 'gap',
        value: this.gap,
        uiType: 'number',
        min: 0,
        max: 50,
        step: 1,
      },
    ];
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
