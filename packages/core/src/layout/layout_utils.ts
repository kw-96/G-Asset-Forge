/**
 * 布局工具类
 * 提供各种布局算法的实现
 */

import { type GAssetForgeGraphics } from '../graphics';
import { AutoLayoutManager, type LayoutConfig } from './auto_layout_manager';

/**
 * 布局工具类
 */
export class LayoutUtils {
  /**
   * 为图形元素创建自动布局
   */
  static createAutoLayout(
    children: GAssetForgeGraphics[],
    config: Partial<LayoutConfig> = {},
  ): AutoLayoutManager {
    const layoutManager = new AutoLayoutManager(config);

    // 添加所有子元素
    children.forEach((child) => {
      layoutManager.addItem(child);
    });

    return layoutManager;
  }

  /**
   * 快速垂直布局
   */
  static verticalLayout(
    children: GAssetForgeGraphics[],
    options: {
      gap?: number;
      padding?: number;
      align?: 'start' | 'center' | 'end' | 'stretch';
    } = {},
  ): void {
    const config: Partial<LayoutConfig> = {
      direction: 'vertical' as any,
      gap: options.gap || 0,
      padding: {
        top: options.padding || 0,
        right: options.padding || 0,
        bottom: options.padding || 0,
        left: options.padding || 0,
      },
      align: (options.align as any) || 'start',
    };

    const layoutManager = this.createAutoLayout(children, config);
    layoutManager.layout();
  }

  /**
   * 快速水平布局
   */
  static horizontalLayout(
    children: GAssetForgeGraphics[],
    options: {
      gap?: number;
      padding?: number;
      align?: 'start' | 'center' | 'end' | 'stretch';
      wrap?: boolean;
    } = {},
  ): void {
    const config: Partial<LayoutConfig> = {
      direction: 'horizontal' as any,
      gap: options.gap || 0,
      padding: {
        top: options.padding || 0,
        right: options.padding || 0,
        bottom: options.padding || 0,
        left: options.padding || 0,
      },
      align: (options.align as any) || 'start',
      wrap: options.wrap || false,
    };

    const layoutManager = this.createAutoLayout(children, config);
    layoutManager.layout();
  }

  /**
   * 网格布局
   */
  static gridLayout(
    children: GAssetForgeGraphics[],
    options: {
      columns: number;
      gap?: number;
      padding?: number;
    } = { columns: 1 },
  ): void {
    const config: Partial<LayoutConfig> = {
      direction: 'grid' as any,
      columns: options.columns,
      gap: options.gap || 0,
      padding: {
        top: options.padding || 0,
        right: options.padding || 0,
        bottom: options.padding || 0,
        left: options.padding || 0,
      },
    };

    const layoutManager = this.createAutoLayout(children, config);
    layoutManager.layout();
  }

  /**
   * 智能布局 - 根据内容自动选择最佳布局方式
   */
  static smartLayout(
    children: GAssetForgeGraphics[],
    options: {
      maxWidth?: number;
      gap?: number;
      padding?: number;
    } = {},
  ): void {
    if (children.length === 0) return;

    const maxWidth = options.maxWidth || 400;
    const gap = options.gap || 10;
    const padding = options.padding || 10;

    // 计算所有子元素的总宽度
    const totalWidth = children.reduce((sum, child) => {
      return sum + (child.attrs.width || 100) + gap;
    }, padding * 2);

    // 如果总宽度超过最大宽度，使用垂直布局
    if (totalWidth > maxWidth) {
      this.verticalLayout(children, { gap, padding });
    } else {
      this.horizontalLayout(children, { gap, padding });
    }
  }

  /**
   * 等分布局 - 将子元素等分容器宽度
   */
  static equalDistributionLayout(
    container: GAssetForgeGraphics,
    children: GAssetForgeGraphics[],
    options: {
      gap?: number;
      padding?: number;
      direction?: 'horizontal' | 'vertical';
    } = {},
  ): void {
    if (children.length === 0) return;

    const gap = options.gap || 10;
    const padding = options.padding || 10;
    const direction = options.direction || 'horizontal';

    const containerWidth = container.attrs.width || 400;
    const containerHeight = container.attrs.height || 300;

    if (direction === 'horizontal') {
      const availableWidth = containerWidth - padding * 2;
      const itemWidth =
        (availableWidth - gap * (children.length - 1)) / children.length;

      children.forEach((child, index) => {
        const x = padding + index * (itemWidth + gap);
        const y = padding;
        const height = containerHeight - padding * 2;

        child.updateAttrs({
          x,
          y,
          width: itemWidth,
          height,
        });
      });
    } else {
      const availableHeight = containerHeight - padding * 2;
      const itemHeight =
        (availableHeight - gap * (children.length - 1)) / children.length;

      children.forEach((child, index) => {
        const x = padding;
        const y = padding + index * (itemHeight + gap);
        const width = containerWidth - padding * 2;

        child.updateAttrs({
          x,
          y,
          width,
          height: itemHeight,
        });
      });
    }
  }

  /**
   * 居中对齐布局
   */
  static centerAlignLayout(
    container: GAssetForgeGraphics,
    children: GAssetForgeGraphics[],
    options: {
      gap?: number;
      direction?: 'horizontal' | 'vertical';
    } = {},
  ): void {
    if (children.length === 0) return;

    const gap = options.gap || 10;
    const direction = options.direction || 'horizontal';

    const containerWidth = container.attrs.width || 400;
    const containerHeight = container.attrs.height || 300;

    if (direction === 'horizontal') {
      // 计算总宽度
      const totalWidth =
        children.reduce((sum, child) => {
          return sum + (child.attrs.width || 100);
        }, 0) +
        gap * (children.length - 1);

      // 计算起始X位置
      const startX = (containerWidth - totalWidth) / 2;

      children.forEach((child, index) => {
        const x = startX + index * ((child.attrs.width || 100) + gap);
        const y = (containerHeight - (child.attrs.height || 100)) / 2;

        child.updateAttrs({ x, y });
      });
    } else {
      // 计算总高度
      const totalHeight =
        children.reduce((sum, child) => {
          return sum + (child.attrs.height || 100);
        }, 0) +
        gap * (children.length - 1);

      // 计算起始Y位置
      const startY = (containerHeight - totalHeight) / 2;

      children.forEach((child, index) => {
        const x = (containerWidth - (child.attrs.width || 100)) / 2;
        const y = startY + index * ((child.attrs.height || 100) + gap);

        child.updateAttrs({ x, y });
      });
    }
  }
}
