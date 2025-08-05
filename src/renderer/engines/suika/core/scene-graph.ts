// Suika场景图管理器
import { SuikaEditor } from './editor';

export interface ISuikaObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  visible?: boolean;
  locked?: boolean;
  name?: string;
}

export class SceneGraph {
  private objects: Map<string, ISuikaObject> = new Map();
  private renderOrder: string[] = [];

  constructor(_editor: SuikaEditor) {
  }

  // 添加对象
  addObject(object: ISuikaObject): void {
    if (this.objects.has(object.id)) {
      throw new Error(`Object with id ${object.id} already exists`);
    }

    this.objects.set(object.id, object);
    this.renderOrder.push(object.id);
  }

  // 移除对象
  removeObject(id: string): void {
    if (!this.objects.has(id)) {
      throw new Error(`Object with id ${id} not found`);
    }

    this.objects.delete(id);
    const index = this.renderOrder.indexOf(id);
    if (index > -1) {
      this.renderOrder.splice(index, 1);
    }
  }

  // 获取对象
  getObject(id: string): ISuikaObject | undefined {
    return this.objects.get(id);
  }

  // 获取所有对象
  getObjects(): ISuikaObject[] {
    return this.renderOrder.map(id => this.objects.get(id)!);
  }

  // 更新对象
  updateObject(id: string, updates: Partial<ISuikaObject>): void {
      const object = this.objects.get(id);
    if (!object) {
      throw new Error(`Object with id ${id} not found`);
    }

    Object.assign(object, updates);
  }

  // 渲染场景
  render(ctx: CanvasRenderingContext2D): void {
    // 按渲染顺序绘制对象
    for (const id of this.renderOrder) {
      if (!id) continue;
      const object = this.objects.get(id);
      if (object && object.visible !== false) {
        this.renderObject(ctx, object);
      }
    }
  }

  // 渲染单个对象
  private renderObject(ctx: CanvasRenderingContext2D, object: ISuikaObject): void {
    ctx.save();

    switch (object.type) {
      case 'rect':
        this.renderRect(ctx, object);
        break;
      case 'circle':
        this.renderCircle(ctx, object);
        break;
      case 'text':
        this.renderText(ctx, object);
        break;
      case 'image':
        this.renderImage(ctx, object);
        break;
      default:
        console.warn(`Unknown object type: ${object.type}`);
    }

    ctx.restore();
  }

  // 渲染矩形
  private renderRect(ctx: CanvasRenderingContext2D, object: ISuikaObject): void {
    if (object.fill) {
      ctx.fillStyle = object.fill;
      ctx.fillRect(object.x, object.y, object.width || 0, object.height || 0);
    }

    if (object.stroke && object.strokeWidth) {
      ctx.strokeStyle = object.stroke;
      ctx.lineWidth = object.strokeWidth;
      ctx.strokeRect(object.x, object.y, object.width || 0, object.height || 0);
    }
  }

  // 渲染圆形
  private renderCircle(ctx: CanvasRenderingContext2D, object: ISuikaObject): void {
    const radius = object.radius || 0;
    
    ctx.beginPath();
    ctx.arc(object.x, object.y, radius, 0, 2 * Math.PI);

    if (object.fill) {
      ctx.fillStyle = object.fill;
      ctx.fill();
    }

    if (object.stroke && object.strokeWidth) {
      ctx.strokeStyle = object.stroke;
      ctx.lineWidth = object.strokeWidth;
      ctx.stroke();
    }
  }

  // 渲染文本
  private renderText(ctx: CanvasRenderingContext2D, object: ISuikaObject): void {
    if (!object.text) return;

    ctx.font = `${object.fontSize || 16}px ${object.fontFamily || 'Arial'}`;
    
    if (object.fill) {
      ctx.fillStyle = object.fill;
      ctx.fillText(object.text, object.x, object.y);
    }

    if (object.stroke && object.strokeWidth) {
      ctx.strokeStyle = object.stroke;
      ctx.lineWidth = object.strokeWidth;
      ctx.strokeText(object.text, object.x, object.y);
    }
  }

  // 渲染图片
  private renderImage(ctx: CanvasRenderingContext2D, object: ISuikaObject): void {
    if (!object.src) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, object.x, object.y, object.width || img.width, object.height || img.height);
    };
    img.src = object.src;
  }

  // 获取对象边界框
  getObjectBounds(id: string): { x: number; y: number; width: number; height: number } | null {
    const object = this.objects.get(id);
    if (!object) return null;

    switch (object.type) {
      case 'rect':
        return {
          x: object.x,
          y: object.y,
          width: object.width || 0,
          height: object.height || 0
        };
      case 'circle':
        const radius = object.radius || 0;
        return {
          x: object.x - radius,
          y: object.y - radius,
          width: radius * 2,
          height: radius * 2
        };
      case 'text':
        // 文本边界框需要计算文本尺寸
        const canvas = document.createElement('canvas');
        const tempCtx = canvas.getContext('2d')!;
        const fontSize = object.fontSize || 16;
        const fontFamily = object.fontFamily || 'Arial';
        tempCtx.font = `${fontSize}px ${fontFamily}`;
        const text = object.text || '';
        const metrics = tempCtx.measureText(text);
        return {
          x: object.x,
          y: object.y - (object.fontSize || 16),
          width: metrics.width,
          height: object.fontSize || 16
        };
      case 'image':
        return {
          x: object.x,
          y: object.y,
          width: object.width || 0,
          height: object.height || 0
        };
      default:
        return null;
    }
  }

  // 获取所有对象的边界框
  getAllBounds(): { x: number; y: number; width: number; height: number } | null {
    if (this.objects.size === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const id of this.renderOrder) {
      const bounds = this.getObjectBounds(id);
      if (bounds) {
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    }

    if (minX === Infinity) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // 查找点击的对象
  findObjectAtPoint(x: number, y: number): ISuikaObject | null {
    // 从后往前检查（最上层的对象优先）
    for (let i = this.renderOrder.length - 1; i >= 0; i--) {
      const id = this.renderOrder[i];
      if (!id) continue;
      const object = this.objects.get(id);
      if (object && object.visible !== false) {
        const bounds = this.getObjectBounds(object.id);
        if (bounds && this.pointInBounds(x, y, bounds)) {
          return object;
        }
      }
    }
    return null;
  }

  // 检查点是否在边界框内
  private pointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  // 清空场景
  clear(): void {
    this.objects.clear();
    this.renderOrder = [];
  }

  // 获取场景统计信息
  getStats(): { objectCount: number; visibleCount: number; lockedCount: number } {
    let visibleCount = 0;
    let lockedCount = 0;

    for (const object of this.objects.values()) {
      if (object.visible !== false) visibleCount++;
      if (object.locked === true) lockedCount++;
    }

    return {
      objectCount: this.objects.size,
      visibleCount,
      lockedCount
    };
  }
}