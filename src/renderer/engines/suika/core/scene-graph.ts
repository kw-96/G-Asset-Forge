// 场景图管理器
import type { SuikaEditor } from './editor';

export interface ISceneObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  children?: ISceneObject[];
}

export class SceneGraph {
  private editor: SuikaEditor;
  private objects: Map<string, ISceneObject> = new Map();
  private rootObjects: ISceneObject[] = [];

  constructor(editor: SuikaEditor) {
    this.editor = editor;
  }

  addObject(object: ISceneObject, parent?: ISceneObject): void {
    this.objects.set(object.id, object);
    
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(object);
    } else {
      this.rootObjects.push(object);
    }
    
    this.editor.render();
  }

  removeObject(id: string): void {
    const object = this.objects.get(id);
    if (!object) return;

    // 从父对象中移除
    this.rootObjects = this.rootObjects.filter(obj => obj.id !== id);
    
    // 从所有父对象的children中移除
    this.objects.forEach(obj => {
      if (obj.children) {
        obj.children = obj.children.filter(child => child.id !== id);
      }
    });

    // 递归删除子对象
    if (object.children) {
      object.children.forEach(child => this.removeObject(child.id));
    }

    this.objects.delete(id);
    this.editor.render();
  }

  getObject(id: string): ISceneObject | undefined {
    return this.objects.get(id);
  }

  getAllObjects(): ISceneObject[] {
    return Array.from(this.objects.values());
  }

  getRootObjects(): ISceneObject[] {
    return [...this.rootObjects];
  }

  clear(): void {
    this.objects.clear();
    this.rootObjects = [];
    this.editor.render();
  }

  render(): void {
    const ctx = this.editor.ctx;
    const viewport = this.editor.viewportManager.getViewport();
    const zoom = this.editor.zoomManager.getZoom();

    // 清空画布
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // 设置变换矩阵
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-viewport.x / zoom, -viewport.y / zoom);

    // 渲染所有根对象
    this.rootObjects.forEach(obj => this.renderObject(ctx, obj));

    ctx.restore();
  }

  private renderObject(ctx: CanvasRenderingContext2D, object: ISceneObject): void {
    if (!object.visible) return;

    ctx.save();
    ctx.translate(object.x, object.y);

    // 根据对象类型进行渲染
    switch (object.type) {
      case 'rectangle':
        this.renderRectangle(ctx, object);
        break;
      case 'circle':
        this.renderCircle(ctx, object);
        break;
      case 'text':
        this.renderText(ctx, object);
        break;
      default:
        // 默认渲染为矩形
        this.renderRectangle(ctx, object);
    }

    // 渲染子对象
    if (object.children) {
      object.children.forEach(child => this.renderObject(ctx, child));
    }

    ctx.restore();
  }

  private renderRectangle(ctx: CanvasRenderingContext2D, object: ISceneObject): void {
    ctx.fillStyle = '#cccccc';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    
    ctx.fillRect(0, 0, object.width, object.height);
    ctx.strokeRect(0, 0, object.width, object.height);
  }

  private renderCircle(ctx: CanvasRenderingContext2D, object: ISceneObject): void {
    const radius = Math.min(object.width, object.height) / 2;
    const centerX = object.width / 2;
    const centerY = object.height / 2;

    ctx.fillStyle = '#cccccc';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private renderText(ctx: CanvasRenderingContext2D, object: ISceneObject): void {
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 这里应该从object的属性中获取文本内容
    const text = (object as any).text || 'Text';
    ctx.fillText(text, 0, 0);
  }
}