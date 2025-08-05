// 视口管理器
import type { SuikaEditor } from './editor';

export interface IViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ViewportManager {
  private editor: SuikaEditor;
  private viewport: IViewport = { x: 0, y: 0, width: 0, height: 0 };

  constructor(editor: SuikaEditor) {
    this.editor = editor;
  }

  setViewport(viewport: IViewport): void {
    this.viewport = { ...viewport };
    this.updateCanvasSize();
  }

  getViewport(): IViewport {
    return { ...this.viewport };
  }

  private updateCanvasSize(): void {
    const canvas = this.editor.canvasElement;
    const dpr = window.devicePixelRatio || 1;
    
    // 设置canvas的实际尺寸
    canvas.width = this.viewport.width * dpr;
    canvas.height = this.viewport.height * dpr;
    
    // 设置canvas的显示尺寸
    canvas.style.width = `${this.viewport.width}px`;
    canvas.style.height = `${this.viewport.height}px`;
    
    // 缩放上下文以适应设备像素比
    this.editor.ctx.scale(dpr, dpr);
  }

  pan(deltaX: number, deltaY: number): void {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    this.editor.render();
  }

  centerView(): void {
    this.viewport.x = -this.viewport.width / 2;
    this.viewport.y = -this.viewport.height / 2;
    this.editor.render();
  }
}