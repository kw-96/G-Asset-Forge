// 缩放管理器
import type { SuikaEditor } from './editor';

export class ZoomManager {
  private editor: SuikaEditor;
  private zoom: number = 1;
  private minZoom: number = 0.1;
  private maxZoom: number = 10;

  constructor(editor: SuikaEditor) {
    this.editor = editor;
  }

  getZoom(): number {
    return this.zoom;
  }

  setZoom(zoom: number, centerX?: number, centerY?: number): void {
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    
    if (newZoom === this.zoom) return;

    const oldZoom = this.zoom;
    this.zoom = newZoom;

    // 如果提供了中心点，调整视口以保持该点在屏幕上的位置
    if (centerX !== undefined && centerY !== undefined) {
      const viewport = this.editor.viewportManager.getViewport();
      const zoomRatio = newZoom / oldZoom;
      
      const newX = centerX - (centerX - viewport.x) * zoomRatio;
      const newY = centerY - (centerY - viewport.y) * zoomRatio;
      
      this.editor.viewportManager.setViewport({
        ...viewport,
        x: newX,
        y: newY
      });
    }

    this.editor.render();
  }

  zoomIn(centerX?: number, centerY?: number): void {
    this.setZoom(this.zoom * 1.2, centerX, centerY);
  }

  zoomOut(centerX?: number, centerY?: number): void {
    this.setZoom(this.zoom / 1.2, centerX, centerY);
  }

  zoomToFit(padding: number = 50): void {
    const viewport = this.editor.viewportManager.getViewport();
    const canvasBounds = this.getCanvasBounds();
    
    if (!canvasBounds) {
      this.setZoom(1);
      this.editor.viewportManager.centerView();
      return;
    }

    const scaleX = (viewport.width - padding * 2) / canvasBounds.width;
    const scaleY = (viewport.height - padding * 2) / canvasBounds.height;
    const scale = Math.min(scaleX, scaleY, 1);

    this.setZoom(scale);

    // 居中显示
    const centerX = canvasBounds.x + canvasBounds.width / 2;
    const centerY = canvasBounds.y + canvasBounds.height / 2;
    
    this.editor.viewportManager.setViewport({
      ...viewport,
      x: viewport.width / 2 - centerX * scale,
      y: viewport.height / 2 - centerY * scale
    });
  }

  private getCanvasBounds(): { x: number; y: number; width: number; height: number } | null {
    // 这里应该从场景图获取所有对象的边界框
    // 暂时返回一个默认值
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  resetZoom(): void {
    this.setZoom(1);
    this.editor.viewportManager.centerView();
  }
}