import { CanvasElement } from '../types/canvas';
import { PerformanceMonitor } from '../utils/performance';

export interface BrushSettings {
  size: number;
  opacity: number;
  color: string;
  hardness: number;
}

export interface BrushStroke {
  id: string;
  points: Array<{ x: number; y: number; pressure?: number }>;
  settings: BrushSettings;
  timestamp: number;
}

export class BrushTool {
  private currentStroke: BrushStroke | null = null;
  private isDrawing = false;
  private settings: BrushSettings = {
    size: 10,
    opacity: 1,
    color: '#000000',
    hardness: 0.8
  };

  constructor(initialSettings?: Partial<BrushSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  // 开始绘制
  startDrawing(x: number, y: number, pressure = 1): void {
    this.isDrawing = true;
    this.currentStroke = {
      id: `brush_stroke_${Date.now()}`,
      points: [{ x, y, pressure }],
      settings: { ...this.settings },
      timestamp: Date.now()
    };
  }

  // 继续绘制
  continueDrawing(x: number, y: number, pressure = 1): void {
    if (!this.isDrawing || !this.currentStroke) return;
    
    this.currentStroke.points.push({ x, y, pressure });
  }

  // 结束绘制
  finishDrawing(): BrushStroke | null {
    if (!this.currentStroke) return null;
    
    const stroke = this.currentStroke;
    this.currentStroke = null;
    this.isDrawing = false;
    
    return stroke;
  }

  // 取消当前绘制
  cancelDrawing(): void {
    this.currentStroke = null;
    this.isDrawing = false;
  }

  // 获取当前笔画
  getCurrentStroke(): BrushStroke | null {
    return this.currentStroke;
  }

  // 更新设置
  updateSettings(newSettings: Partial<BrushSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // 获取设置
  getSettings(): BrushSettings {
    return { ...this.settings };
  }

  // 将笔画转换为画布元素
  strokeToCanvasElement(stroke: BrushStroke): CanvasElement {
    // 计算边界框
    const xs = stroke.points.map(p => p.x);
    const ys = stroke.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
      id: stroke.id,
      name: `Brush Stroke ${stroke.timestamp}`,
      type: 'brush',
      x: minX - stroke.settings.size / 2,
      y: minY - stroke.settings.size / 2,
      width: maxX - minX + stroke.settings.size,
      height: maxY - minY + stroke.settings.size,
      visible: true,
      locked: false,
      fill: stroke.settings.color,
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
      opacity: stroke.settings.opacity,
      // 存储笔画数据
      brushData: {
        points: stroke.points,
        settings: stroke.settings
      }
    };
  }

  // 生成SVG路径
  generateSVGPath(stroke: BrushStroke): string {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('brush-svg-generation');
    
    if (!stroke || !stroke.points || stroke.points.length < 2) {
      monitor.endTiming('brush-svg-generation');
      return '';
    }

    const points = stroke.points;
    const firstPoint = points[0];
    if (!firstPoint) {
      monitor.endTiming('brush-svg-generation');
      return '';
    }
    
    let path = `M ${firstPoint.x} ${firstPoint.y}`;

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prevPoint = points[i - 1];
      
      if (!point || !prevPoint) continue;
      
      // 使用二次贝塞尔曲线平滑路径
      const cpx = (prevPoint.x + point.x) / 2;
      const cpy = (prevPoint.y + point.y) / 2;
      
      if (i === 1) {
        path += ` Q ${prevPoint.x} ${prevPoint.y} ${cpx} ${cpy}`;
      } else {
        path += ` T ${cpx} ${cpy}`;
      }
    }

    monitor.endTiming('brush-svg-generation');
    return path;
  }

  // 检查是否正在绘制
  get drawing(): boolean {
    return this.isDrawing;
  }
}

export default BrushTool;