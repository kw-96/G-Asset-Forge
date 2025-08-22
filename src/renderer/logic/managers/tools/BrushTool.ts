/**
 * 画笔工具 - 提供画笔绘制功能
 * @description 支持压感、平滑度、混合模式等高级画笔功能
 * @author 开发团队
 */
import { BlendMode, ElementType, type CanvasElement } from '../../../../interfaces/types/canvas';
import { UnifiedPerformanceMonitor } from '../../utils/performance/UnifiedPerformanceMonitor';

/**
 * 画笔设置接口
 */
export interface BrushSettings {
  size: number;
  opacity: number;
  color: string;
  hardness: number;
  blendMode: BlendMode;
  pressure: boolean;
  smoothing: number;
}

/**
 * 画笔笔画接口
 */
export interface BrushStroke {
  id: string;
  points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;
  settings: BrushSettings;
  timestamp: number;
  duration: number;
}

/**
 * 画笔工具类
 * @description 提供完整的画笔绘制功能，支持压感和平滑处理
 */
export class BrushTool {
  private currentStroke: BrushStroke | null = null;
  private isDrawing = false;
  private settings: BrushSettings = {
    size: 10,
    opacity: 100,
    color: '#000000',
    hardness: 100,
    blendMode: BlendMode.NORMAL,
    pressure: false,
    smoothing: 50,
  };
  private smoothingBuffer: Array<{ x: number; y: number; pressure?: number }> = [];
  private lastPoint: { x: number; y: number } | null = null;
  private strokeStartTime = 0;

  constructor(initialSettings?: Partial<BrushSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  /**
   * 开始绘制
   */
  startDrawing(x: number, y: number, pressure = 1): void {
    UnifiedPerformanceMonitor.markStart('brush-drawing'); 

    this.isDrawing = true;
    this.strokeStartTime = Date.now();
    this.lastPoint = { x, y };
    this.smoothingBuffer = [];

    const point = { x, y, pressure, timestamp: Date.now() };
    
    this.currentStroke = {
      id: `brush_stroke_${this.strokeStartTime}`,
      points: [point],
      settings: { ...this.settings },
      timestamp: this.strokeStartTime,
      duration: 0,
    };

    // 添加到平滑缓冲区
    this.smoothingBuffer.push(point);

    console.debug('[brush-tool] 开始绘制', { x, y, pressure });
  }

  /**
   * 继续绘制
   */
  continueDrawing(x: number, y: number, pressure = 1): void {
    if (!this.isDrawing || !this.currentStroke || !this.lastPoint) return;

    // 计算距离，避免过于密集的点
    const distance = Math.sqrt(
      Math.pow(x - this.lastPoint.x, 2) + Math.pow(y - this.lastPoint.y, 2)
    );

    // 根据画笔大小调整最小距离
    const minDistance = Math.max(1, this.settings.size * 0.1);
    
    if (distance < minDistance) {
      return;
    }

    const point = { x, y, pressure, timestamp: Date.now() };
    
    // 添加到平滑缓冲区
    this.smoothingBuffer.push(point);

    // 应用平滑处理
    const smoothedPoint = this.applySmoothingFilter(point);
    this.currentStroke.points.push(smoothedPoint);

    this.lastPoint = { x, y };

    // 更新笔画持续时间
    this.currentStroke.duration = Date.now() - this.strokeStartTime;

    UnifiedPerformanceMonitor.recordMetric('brush-point-added');
  }

  /**
   * 结束绘制
   */
  finishDrawing(): BrushStroke | null {
    if (!this.currentStroke) return null;

    UnifiedPerformanceMonitor.markStart('brush-finish');

    // 更新最终持续时间
    this.currentStroke.duration = Date.now() - this.strokeStartTime;

    // 应用最终平滑处理
    this.currentStroke.points = this.applyFinalSmoothing(this.currentStroke.points);

    const stroke = this.currentStroke;
    this.currentStroke = null;
    this.isDrawing = false;
    this.smoothingBuffer = [];
    this.lastPoint = null;

    console.info('[brush-tool] 绘制完成', {
      id: stroke.id,
      pointCount: stroke.points.length,
      duration: stroke.duration,
    });

    UnifiedPerformanceMonitor.markEnd('brush-finish');
    return stroke;
  }

  /**
   * 取消当前绘制
   */
  cancelDrawing(): void {
    if (this.currentStroke) {
      console.info('[brush-tool] 取消绘制', { id: this.currentStroke.id });
    }

    this.currentStroke = null;
    this.isDrawing = false;
    this.smoothingBuffer = [];
    this.lastPoint = null;
    this.strokeStartTime = 0;
  }

  /**
   * 获取当前笔画
   */
  getCurrentStroke(): BrushStroke | null {
    return this.currentStroke ? { ...this.currentStroke } : null;
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings: Partial<BrushSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.debug('[brush-tool] 更新设置', { 
      updatedKeys: Object.keys(newSettings),
      newSettings: this.settings 
    });
  }

  /**
   * 获取设置
   */
  getSettings(): BrushSettings {
    return { ...this.settings };
  }

  /**
   * 将笔画转换为画布元素
   */
  strokeToCanvasElement(stroke: BrushStroke): CanvasElement {
    // 计算边界框
    const xs = stroke.points.map(p => p.x);
    const ys = stroke.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const padding = stroke.settings.size / 2;

    const element: CanvasElement = {
      id: stroke.id,
      name: `画笔笔画 ${new Date(stroke.timestamp).toLocaleTimeString()}`,
      type: ElementType.BRUSH,
      transform: {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + stroke.settings.size,
        height: maxY - minY + stroke.settings.size,
      },
      visible: true,
      locked: false,
      fill: {
        type: 'solid',
        color: stroke.settings.color
      },
      stroke: {
        color: 'transparent',
        width: 0,
        style: 'solid'
      },
      opacity: stroke.settings.opacity / 100,
      blendMode: stroke.settings.blendMode,
      createdAt: new Date(stroke.timestamp).toISOString(),
      updatedAt: new Date().toISOString(),
      // 存储画笔特定数据
      brushData: {
        points: stroke.points,
        settings: {
          size: stroke.settings.size,
          opacity: stroke.settings.opacity,
          color: stroke.settings.color,
          hardness: stroke.settings.hardness,
          blendMode: stroke.settings.blendMode as BlendMode,
        } as unknown as BrushSettings,
        svgPath: this.generateSVGPath(stroke)
      },
    };

    UnifiedPerformanceMonitor.recordMetric('brush-to-element');
    return element;
  }

  /**
   * 生成SVG路径
   */
  generateSVGPath(stroke: BrushStroke): string {
    UnifiedPerformanceMonitor.markStart('brush-svg-generation');

    if (!stroke || !stroke.points || stroke.points.length < 2) {
      UnifiedPerformanceMonitor.markEnd('brush-svg-generation');
      return '';
    }

    const points = stroke.points;
    const firstPoint = points[0];
    if (!firstPoint) {
      UnifiedPerformanceMonitor.markEnd('brush-svg-generation');
      return '';
    }

    let path = `M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`;

    // 使用二次贝塞尔曲线创建平滑路径
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prevPoint = points[i - 1];

      if (!point || !prevPoint) continue;

      if (i === 1) {
        // 第一段使用直线
        path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      } else {
        // 后续使用平滑曲线
        const nextPoint = points[i + 1];
        if (nextPoint) {
          const cpx = (point.x + nextPoint.x) / 2;
          const cpy = (point.y + nextPoint.y) / 2;
          path += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${cpx.toFixed(2)} ${cpy.toFixed(2)}`;
        } else {
          path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
        }
      }
    }

    UnifiedPerformanceMonitor.markEnd('brush-svg-generation');
    return path;
  }

  /**
   * 检查是否正在绘制
   */
  get drawing(): boolean {
    return this.isDrawing;
  }

  /**
   * 获取绘制统计信息
   */
  getDrawingStats() {
    return {
      isDrawing: this.isDrawing,
      currentStroke: this.currentStroke ? {
        id: this.currentStroke.id,
        pointCount: this.currentStroke.points.length,
        duration: this.currentStroke.duration,
      } : null,
      settings: this.settings,
    };
  }

  // 私有方法

  /**
   * 应用平滑滤波器
   */
  private applySmoothingFilter(point: { x: number; y: number; pressure?: number }): { x: number; y: number; pressure?: number; timestamp?: number } {
    if (this.settings.smoothing === 0 || this.smoothingBuffer.length < 2) {
      return { ...point, timestamp: Date.now() };
    }

    const bufferSize = Math.min(5, Math.ceil(this.settings.smoothing / 20));
    const recentPoints = this.smoothingBuffer.slice(-bufferSize);

    // 计算加权平均
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    let weightedPressure = 0;

    recentPoints.forEach((p, index) => {
      const weight = index + 1; // 越新的点权重越大
      totalWeight += weight;
      weightedX += p.x * weight;
      weightedY += p.y * weight;
      weightedPressure += (p.pressure || 1) * weight;
    });

    return {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
      pressure: weightedPressure / totalWeight,
      timestamp: Date.now(),
    };
  }

  /**
   * 应用最终平滑处理
   */
  private applyFinalSmoothing(points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>): Array<{ x: number; y: number; pressure?: number; timestamp?: number }> {
    if (points.length < 3 || this.settings.smoothing === 0) {
      return points;
    }

    const smoothedPoints = [points[0]]; // 保持第一个点不变

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];

      if (!prev || !current || !next) {
        smoothedPoints.push(current);
        continue;
      }

      // 使用三点平滑
      const smoothingFactor = this.settings.smoothing / 100;
      const smoothedPoint = {
        x: current.x + (prev.x + next.x - 2 * current.x) * smoothingFactor * 0.1,
        y: current.y + (prev.y + next.y - 2 * current.y) * smoothingFactor * 0.1,
        pressure: current.pressure || 0,
        timestamp: current.timestamp || 0
      };

      smoothedPoints.push(smoothedPoint as { x: number; y: number; pressure?: number; timestamp?: number });
    }

    smoothedPoints.push(points[points.length - 1]); // 保持最后一个点不变
    return smoothedPoints as Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;
  }
}

export default BrushTool;