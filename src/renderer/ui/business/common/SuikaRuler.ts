/**
 * Suika标尺系统
 * 直接复用Suika原版逻辑 - 简单高效
 */

import { getClosestTimesVal, nearestPixelVal } from './utils';

export interface RulerConfig {
  width: number;               // 标尺宽度
  bgColor: string;            // 背景色
  markStroke: string;         // 刻度线颜色
  markSize: number;           // 刻度线长度
  selectedBgColor: string;    // 选中区域背景色
  borderColor: string;        // 边框颜色
  textColor: string;          // 文字颜色
  fontSize: number;           // 字体大小
  fontFamily: string;         // 字体
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

export interface ScreenToWorldFunction {
  (screenX: number, screenY: number): { x: number; y: number };
}

/**
 * 根据缩放级别计算标尺步长
 * 直接复用Suika原版算法 - 简单高效
 */
const getStepByZoom = (zoom: number): number => {
  /**
   * 步长研究，参考 figma
   * 1
   * 2
   * 5
   * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
   * 25（对应 200% 往上）
   * 50（对应 100% 往上）
   * 100（对应 50% 往上）
   * 250
   * 500
   * 1000
   * 2500
   * 5000
   */
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  const step = 50 / zoom;
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i]! >= step) return steps[i]!;
  }
  return steps[0]!;
};

export class SuikaRuler {
  private config: RulerConfig;
  private ctx: CanvasRenderingContext2D;
  private worldToScreen: WorldToScreenFunction;
  private zoom: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    config: RulerConfig,
    worldToScreen: WorldToScreenFunction,
    zoom: number
  ) {
    this.ctx = ctx;
    this.config = config;
    this.worldToScreen = worldToScreen;
    this.zoom = zoom;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RulerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 更新缩放级别
   */
  updateZoom(zoom: number) {
    this.zoom = zoom;
  }

  /**
   * 绘制标尺
   */
  draw(viewport: ViewportInfo, selectedAreas?: Array<{minX: number, maxX: number, minY: number, maxY: number}>) {
    const ctx = this.ctx;
    ctx.save();

    // 绘制背景
    this.drawBackground(viewport);

    // 绘制选中区域（如果有）
    if (selectedAreas && selectedAreas.length > 0) {
      this.drawSelectedAreas(viewport, selectedAreas);
    }

    // 绘制X轴标尺
    this.drawXRuler(viewport);

    // 绘制Y轴标尺
    this.drawYRuler(viewport);

    // 绘制左上角矩形覆盖
    this.drawCornerCover();

    // 绘制边框
    this.drawBorders(viewport);

    ctx.restore();
  }

  /**
   * 绘制背景
   */
  private drawBackground(viewport: ViewportInfo) {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.bgColor;
    
    // 水平标尺背景
    ctx.fillRect(0, 0, viewport.width, this.config.width);
    
    // 垂直标尺背景
    ctx.fillRect(0, 0, this.config.width, viewport.height);
  }

  /**
   * 绘制选中区域
   */
  private drawSelectedAreas(_viewport: ViewportInfo, selectedAreas: Array<{minX: number, maxX: number, minY: number, maxY: number}>) {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.selectedBgColor;

    selectedAreas.forEach(area => {
      // X轴选中区域
      const startX = this.worldToScreen(area.minX, 0).x;
      const endX = this.worldToScreen(area.maxX, 0).x;
      ctx.fillRect(startX, 0, endX - startX, this.config.width);

      // Y轴选中区域
      const startY = this.worldToScreen(0, area.minY).y;
      const endY = this.worldToScreen(0, area.maxY).y;
      ctx.fillRect(0, startY, this.config.width, endY - startY);
    });
  }

  /**
   * 绘制X轴标尺 - 直接复用Suika原版逻辑
   */
  private drawXRuler(viewport: ViewportInfo) {
    const stepInScene = getStepByZoom(this.zoom);
    const { bounds } = viewport;

    const startXInScene = getClosestTimesVal(bounds.minX, stepInScene);
    const endXInScene = getClosestTimesVal(bounds.maxX, stepInScene);

    this.ctx.strokeStyle = this.config.markStroke;
    this.ctx.fillStyle = this.config.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;

    const y = this.config.width - this.config.markSize;
    let x = startXInScene;
    
    while (x <= endXInScene) {
      const screenPos = this.worldToScreen(x, 0);
      const pixelX = nearestPixelVal(screenPos.x);
      
      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(pixelX, y);
      this.ctx.lineTo(pixelX, y + this.config.markSize);
      this.ctx.stroke();
      
      // 绘制刻度值
      this.ctx.fillText(String(x), pixelX, y - 4);
      
      x += stepInScene;
    }
  }

  /**
   * 绘制Y轴标尺 - 直接复用Suika原版逻辑
   */
  private drawYRuler(viewport: ViewportInfo) {
    const stepInScene = getStepByZoom(this.zoom);
    const { bounds } = viewport;

    const startYInScene = getClosestTimesVal(bounds.minY, stepInScene);
    const endYInScene = getClosestTimesVal(bounds.maxY, stepInScene);

    this.ctx.strokeStyle = this.config.markStroke;
    this.ctx.fillStyle = this.config.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;

    const x = this.config.width - this.config.markSize;
    let y = startYInScene;
    
    while (y <= endYInScene) {
      const screenPos = this.worldToScreen(0, y);
      const pixelY = nearestPixelVal(screenPos.y);
      
      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(x, pixelY);
      this.ctx.lineTo(x + this.config.markSize, pixelY);
      this.ctx.stroke();
      
      // 绘制垂直文字（旋转）
      this.ctx.save();
      this.ctx.translate(x, pixelY);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.fillText(String(y), 0, -3);
      this.ctx.restore();
      
      y += stepInScene;
    }
  }

  /**
   * 绘制左上角覆盖矩形
   */
  private drawCornerCover() {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.bgColor;
    ctx.fillRect(0, 0, this.config.width, this.config.width);
  }

  /**
   * 绘制边框
   */
  private drawBorders(viewport: ViewportInfo) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.config.borderColor;
    ctx.lineWidth = 1;

    // 水平边框
    ctx.beginPath();
    ctx.moveTo(0, this.config.width + 0.5);
    ctx.lineTo(viewport.width, this.config.width + 0.5);
    ctx.stroke();

    // 垂直边框
    ctx.beginPath();
    ctx.moveTo(this.config.width + 0.5, 0);
    ctx.lineTo(this.config.width + 0.5, viewport.height);
    ctx.stroke();
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<RulerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): RulerConfig {
    return { ...this.config };
  }
}