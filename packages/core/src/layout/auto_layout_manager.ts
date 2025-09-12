/**
 * 自动布局管理器
 * 提供通用的自动布局功能，支持多种布局算法
 */

import { type IPoint, type ISize } from '@g-asset-forge/geo';

import { type GAssetForgeGraphics } from '../graphics';

// 布局方向
export enum LayoutDirection {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Grid = 'grid',
}

// 对齐方式
export enum LayoutAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Stretch = 'stretch',
}

// 布局配置
export interface LayoutConfig {
  direction: LayoutDirection;
  align: LayoutAlign;
  gap: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  wrap?: boolean; // 是否换行（仅对水平布局有效）
  columns?: number; // 网格布局的列数
  autoSize?: boolean; // 是否自动调整容器尺寸
}

// 布局项配置
export interface LayoutItemConfig {
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // 宽高比
  flex?: number; // 弹性系数
}

// 布局结果
export interface LayoutResult {
  position: IPoint;
  size: ISize;
}

/**
 * 自动布局管理器
 */
export class AutoLayoutManager {
  private config: LayoutConfig;
  private items: Array<{
    graphics: GAssetForgeGraphics;
    config: LayoutItemConfig;
  }> = [];

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = {
      direction: LayoutDirection.Vertical,
      align: LayoutAlign.Start,
      gap: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      wrap: false,
      columns: 1,
      autoSize: true,
      ...config,
    };
  }

  /**
   * 添加布局项
   */
  addItem(
    graphics: GAssetForgeGraphics,
    itemConfig: LayoutItemConfig = {},
  ): void {
    this.items.push({ graphics, config: itemConfig });
  }

  /**
   * 移除布局项
   */
  removeItem(graphics: GAssetForgeGraphics): void {
    this.items = this.items.filter((item) => item.graphics !== graphics);
  }

  /**
   * 清空所有布局项
   */
  clearItems(): void {
    this.items = [];
  }

  /**
   * 更新布局配置
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 执行自动布局
   */
  performLayout(): LayoutResult[] {
    if (this.items.length === 0) return [];

    switch (this.config.direction) {
      case LayoutDirection.Vertical:
        return this.performVerticalLayout();
      case LayoutDirection.Horizontal:
        return this.performHorizontalLayout();
      case LayoutDirection.Grid:
        return this.performGridLayout();
      default:
        return this.performVerticalLayout();
    }
  }

  /**
   * 垂直布局
   */
  private performVerticalLayout(): LayoutResult[] {
    const results: LayoutResult[] = [];
    let currentY = this.config.padding.top;

    for (const item of this.items) {
      const marginTop = item.config.margin?.top || 0;
      const marginBottom = item.config.margin?.bottom || 0;
      const marginLeft = item.config.margin?.left || 0;

      // 计算尺寸
      const size = this.calculateItemSize(item);

      // 计算位置
      const x = this.config.padding.left + marginLeft;
      const y = currentY + marginTop;

      results.push({
        position: { x, y },
        size,
      });

      // 更新下一个元素的Y位置
      currentY += marginTop + size.height + marginBottom + this.config.gap;
    }

    return results;
  }

  /**
   * 水平布局
   */
  private performHorizontalLayout(): LayoutResult[] {
    const results: LayoutResult[] = [];
    let currentX = this.config.padding.left;
    let currentY = this.config.padding.top;
    let maxHeight = 0;

    for (const item of this.items) {
      const marginTop = item.config.margin?.top || 0;
      const marginBottom = item.config.margin?.bottom || 0;
      const marginLeft = item.config.margin?.left || 0;

      // 计算尺寸
      const size = this.calculateItemSize(item);

      // 计算位置
      const x = currentX + marginLeft;
      const y = currentY + marginTop;

      results.push({
        position: { x, y },
        size,
      });

      // 更新下一个元素的X位置
      currentX += marginLeft + size.width + this.config.gap;
      maxHeight = Math.max(maxHeight, marginTop + size.height + marginBottom);

      // 如果需要换行
      if (this.config.wrap && currentX > this.config.padding.left + 400) {
        // 假设容器宽度为400
        currentX = this.config.padding.left;
        currentY += maxHeight + this.config.gap;
        maxHeight = 0;
      }
    }

    return results;
  }

  /**
   * 网格布局
   */
  private performGridLayout(): LayoutResult[] {
    const results: LayoutResult[] = [];
    const columns = this.config.columns || 1;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const row = Math.floor(i / columns);
      const col = i % columns;

      const marginTop = item.config.margin?.top || 0;
      const marginLeft = item.config.margin?.left || 0;

      // 计算尺寸
      const size = this.calculateItemSize(item);

      // 计算位置
      const x =
        this.config.padding.left +
        marginLeft +
        col * (size.width + this.config.gap);
      const y =
        this.config.padding.top +
        marginTop +
        row * (size.height + this.config.gap);

      results.push({
        position: { x, y },
        size,
      });
    }

    return results;
  }

  /**
   * 计算布局项尺寸
   */
  private calculateItemSize(item: {
    graphics: GAssetForgeGraphics;
    config: LayoutItemConfig;
  }): ISize {
    const { graphics, config } = item;
    const currentAttrs = graphics.attrs;

    // 获取当前尺寸
    let width = currentAttrs.width || 100;
    let height = currentAttrs.height || 100;

    // 应用最小/最大尺寸限制
    if (config.minWidth !== undefined) {
      width = Math.max(width, config.minWidth);
    }
    if (config.maxWidth !== undefined) {
      width = Math.min(width, config.maxWidth);
    }
    if (config.minHeight !== undefined) {
      height = Math.max(height, config.minHeight);
    }
    if (config.maxHeight !== undefined) {
      height = Math.min(height, config.maxHeight);
    }

    // 应用宽高比
    if (config.aspectRatio !== undefined) {
      if (width / height > config.aspectRatio) {
        width = height * config.aspectRatio;
      } else {
        height = width / config.aspectRatio;
      }
    }

    return { width, height };
  }

  /**
   * 应用布局结果到图形元素
   */
  applyLayout(results: LayoutResult[]): void {
    for (let i = 0; i < results.length && i < this.items.length; i++) {
      const result = results[i];
      const item = this.items[i];

      item.graphics.updateAttrs({
        x: result.position.x,
        y: result.position.y,
        width: result.size.width,
        height: result.size.height,
      });
    }
  }

  /**
   * 执行完整的布局流程
   */
  layout(): void {
    const results = this.performLayout();
    this.applyLayout(results);
  }

  /**
   * 获取布局后的容器尺寸
   */
  getContainerSize(): ISize {
    if (this.items.length === 0) {
      return {
        width: this.config.padding.left + this.config.padding.right,
        height: this.config.padding.top + this.config.padding.bottom,
      };
    }

    const results = this.performLayout();
    let maxX = 0;
    let maxY = 0;

    for (const result of results) {
      maxX = Math.max(maxX, result.position.x + result.size.width);
      maxY = Math.max(maxY, result.position.y + result.size.height);
    }

    return {
      width: maxX + this.config.padding.right,
      height: maxY + this.config.padding.bottom,
    };
  }
}
