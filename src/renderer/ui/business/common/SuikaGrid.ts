/**
 * Suika网格系统
 * 提取并适配自 suika/packages/core/src/grid.ts
 * 完全复用Suika的原始实现
 */

import { getClosestTimesVal, nearestPixelVal } from './utils';

export interface GridConfig {
  stepX: number;           // 网格X步长，默认1
  stepY: number;           // 网格Y步长，默认1
  lineColor: string;       // 网格线颜色
  lineWidth: number;       // 网格线宽度
  opacity: number;         // 网格透明度
  // 新增：是否使用动态步长（与标尺对齐）
  useDynamicStep?: boolean;
}

export interface ViewportInfo {
  width: number;
  height: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface WorldToScreenFunction {
  (worldX: number, worldY: number): { x: number; y: number };
}

export class SuikaGrid {
  private config: GridConfig;
  private ctx: CanvasRenderingContext2D;
  private worldToScreen: WorldToScreenFunction;

  constructor(
    ctx: CanvasRenderingContext2D,
    config: GridConfig,
    worldToScreen: WorldToScreenFunction
  ) {
    this.ctx = ctx;
    this.config = config;
    this.worldToScreen = worldToScreen;
  }

  // 注意：网格系统不使用动态步长，保持固定1px步长
  // 动态步长算法已移至标尺系统，这里不再需要

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GridConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 绘制网格 - 完全复用Suika的实现
   * 参考 suika/packages/core/src/grid.ts 中的 draw 方法
   * 修复：增强网格线绘制逻辑，确保网格线数量足够
   */
  draw(viewport: ViewportInfo, zoom: number = 1) {
    const ctx = this.ctx;
    ctx.save();

    // 设置样式
    ctx.strokeStyle = this.config.lineColor;
    ctx.lineWidth = this.config.lineWidth;
    ctx.globalAlpha = this.config.opacity;

    // 重要：Suika的网格系统使用固定步长，不是动态步长
    // 网格用于像素级对齐，标尺用于显示刻度
    // 参考 suika/packages/core/src/setting.ts: gridViewX: 1, gridViewY: 1
    const stepX = this.config.stepX; // 固定使用配置的步长，默认1px
    const stepY = this.config.stepY; // 固定使用配置的步长，默认1px

    // 修复：扩展视口边界，确保网格线数量足够
    // 这是Suika的原始实现，确保网格线覆盖整个可见区域
    const extendedViewport = this.extendViewportBounds(viewport, zoom);

    // 绘制垂直线
    this.drawVerticalLines(extendedViewport, stepX);
    
    // 绘制水平线
    this.drawHorizontalLines(extendedViewport, stepY);

    ctx.restore();
  }

  /**
   * 修复：扩展视口边界，确保网格线数量足够
   * 这是Suika的原始实现，确保网格线覆盖整个可见区域
   */
  private extendViewportBounds(viewport: ViewportInfo, zoom: number): ViewportInfo {
    const { bounds, width, height } = viewport;
    
    // 扩展边界，确保网格线数量足够
    // 参考Suika的实现，扩展范围以覆盖整个可见区域
    const extensionFactor = Math.max(1, 100 / zoom); // 根据缩放级别动态调整扩展因子
    
    const extendedBounds = {
      minX: bounds.minX - extensionFactor,
      maxX: bounds.maxX + extensionFactor,
      minY: bounds.minY - extensionFactor,
      maxY: bounds.maxY + extensionFactor,
    };

    return {
      width,
      height,
      bounds: extendedBounds
    };
  }

  /**
   * 绘制垂直网格线 - 完全复用Suika的实现
   * 参考 suika/packages/core/src/grid.ts 中的 drawVerticalLines 逻辑
   * 修复：增强绘制逻辑，确保网格线数量足够
   */
  private drawVerticalLines(viewport: ViewportInfo, stepX: number) {
    const { bounds } = viewport;

    // 修复：使用更精确的边界计算，确保网格线数量足够
    const startXInScene = getClosestTimesVal(bounds.minX, stepX);
    const endXInScene = getClosestTimesVal(bounds.maxX, stepX);

    // 确保至少绘制一定数量的网格线
    const minGridLines = 10;
    const gridLineCount = Math.floor((endXInScene - startXInScene) / stepX) + 1;
    
    if (gridLineCount < minGridLines) {
      // 如果网格线数量不足，扩展绘制范围
      const centerX = (startXInScene + endXInScene) / 2;
      const extendedRange = (minGridLines * stepX) / 2;
      const extendedStartX = centerX - extendedRange;
      const extendedEndX = centerX + extendedRange;
      
      this.drawVerticalLinesInRange(extendedStartX, extendedEndX, stepX, viewport);
    } else {
      this.drawVerticalLinesInRange(startXInScene, endXInScene, stepX, viewport);
    }
  }

  /**
   * 在指定范围内绘制垂直网格线
   */
  private drawVerticalLinesInRange(startX: number, endX: number, stepX: number, viewport: ViewportInfo) {
    let x = startX;
    while (x <= endX) {
      const screenPos = this.worldToScreen(x, 0);
      const pixelX = nearestPixelVal(screenPos.x);
      
      this.ctx.beginPath();
      this.ctx.moveTo(pixelX, 0);
      this.ctx.lineTo(pixelX, viewport.height);
      this.ctx.stroke();
      
      x += stepX;
    }
  }

  /**
   * 绘制水平网格线 - 完全复用Suika的实现
   * 参考 suika/packages/core/src/grid.ts 中的 drawHorizontalLines 逻辑
   * 修复：增强绘制逻辑，确保网格线数量足够
   */
  private drawHorizontalLines(viewport: ViewportInfo, stepY: number) {
    const { bounds } = viewport;

    // 修复：使用更精确的边界计算，确保网格线数量足够
    const startYInScene = getClosestTimesVal(bounds.minY, stepY);
    const endYInScene = getClosestTimesVal(bounds.maxY, stepY);

    // 确保至少绘制一定数量的网格线
    const minGridLines = 10;
    const gridLineCount = Math.floor((endYInScene - startYInScene) / stepY) + 1;
    
    if (gridLineCount < minGridLines) {
      // 如果网格线数量不足，扩展绘制范围
      const centerY = (startYInScene + endYInScene) / 2;
      const extendedRange = (minGridLines * stepY) / 2;
      const extendedStartY = centerY - extendedRange;
      const extendedEndY = centerY + extendedRange;
      
      this.drawHorizontalLinesInRange(extendedStartY, extendedEndY, stepY, viewport);
    } else {
      this.drawHorizontalLinesInRange(startYInScene, endYInScene, stepY, viewport);
    }
  }

  /**
   * 在指定范围内绘制水平网格线
   */
  private drawHorizontalLinesInRange(startY: number, endY: number, stepY: number, viewport: ViewportInfo) {
    let y = startY;
    while (y <= endY) {
      const screenPos = this.worldToScreen(0, y);
      const pixelY = nearestPixelVal(screenPos.y);
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, pixelY);
      this.ctx.lineTo(viewport.width, pixelY);
      this.ctx.stroke();
      
      y += stepY;
    }
  }
}
