// Suika缩放管理器
import { SuikaEditor } from './editor';

export interface IZoomOptions {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  smoothZoom: boolean;
  zoomDuration: number;
}

export class ZoomManager {
  private editor: SuikaEditor;
  private currentZoom: number = 1;
  private targetZoom: number = 1;
  private isAnimating: boolean = false;
  private animationStartTime: number = 0;
  private animationDuration: number = 300;
  private options: IZoomOptions;

  constructor(editor: SuikaEditor) {
    this.editor = editor;
    
    this.options = {
      minZoom: 0.1,      // 10% 最小缩放 - 支持更大的缩放范围
      maxZoom: 5.0,      // 500% 最大缩放 - 支持更大的缩放范围
      zoomStep: 0.1,     // 缩放步长
      smoothZoom: true,   // 平滑缩放
      zoomDuration: 300   // 缩放动画持续时间
    };
  }

  // 设置缩放级别
  setZoom(zoom: number): void {
    const clampedZoom = this.clampZoom(zoom);
    
    if (this.options.smoothZoom && Math.abs(clampedZoom - this.currentZoom) > 0.01) {
      this.animateZoom(clampedZoom);
    } else {
      this.currentZoom = clampedZoom;
      this.editor.render();
    }
  }

  // 获取当前缩放级别
  getZoom(): number {
    return this.currentZoom;
  }

  // 缩放到指定点
  zoomAt(x: number, y: number, zoomDelta: number): void {
    const newZoom = this.clampZoom(this.currentZoom * zoomDelta);
    
    if (newZoom !== this.currentZoom) {
      // 计算缩放中心点
      const zoomCenterX = x;
      const zoomCenterY = y;

      // 计算新的视口位置
      const zoomRatio = newZoom / this.currentZoom;
      const viewport = this.editor.viewportManager.getViewport();
      
      const newViewportX = zoomCenterX - (zoomCenterX - viewport.x) * zoomRatio;
      const newViewportY = zoomCenterY - (zoomCenterY - viewport.y) * zoomRatio;

      // 同时更新视口和缩放
      this.editor.viewportManager.setViewport({
        x: newViewportX,
        y: newViewportY
      });
      
      this.setZoom(newZoom);
    }
  }

  // 缩放到适应屏幕
  zoomToFit(): void {
    const canvas = this.editor.canvasElement;
    const container = this.editor.containerElement;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 计算缩放比例
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, this.options.maxZoom);

    this.setZoom(scale);
  }

  // 缩放到适应内容
  zoomToContent(): void {
    const bounds = this.editor.sceneGraph.getAllBounds();
    if (!bounds) return;

    const container = this.editor.containerElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 添加边距
    const padding = 50;
    const contentWidth = bounds.width + padding * 2;
    const contentHeight = bounds.height + padding * 2;

    // 计算缩放比例
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, this.options.maxZoom);

    this.setZoom(scale);
  }

  // 放大
  zoomIn(step: number = this.options.zoomStep): void {
    this.setZoom(this.currentZoom + step);
  }

  // 缩小
  zoomOut(step: number = this.options.zoomStep): void {
    this.setZoom(this.currentZoom - step);
  }

  // 重置缩放
  resetZoom(): void {
    this.setZoom(1);
  }

  // 获取缩放变换矩阵
  getZoomTransform(): { scaleX: number; scaleY: number } {
    return {
      scaleX: this.currentZoom,
      scaleY: this.currentZoom
    };
  }

  // 坐标转换：视口坐标到场景坐标
  viewportToScene(x: number, y: number): { x: number; y: number } {
    const viewport = this.editor.viewportManager.getViewport();
    return {
      x: (x - viewport.x) / this.currentZoom,
      y: (y - viewport.y) / this.currentZoom
    };
  }

  // 坐标转换：场景坐标到视口坐标
  sceneToViewport(x: number, y: number): { x: number; y: number } {
    const viewport = this.editor.viewportManager.getViewport();
    return {
      x: x * this.currentZoom + viewport.x,
      y: y * this.currentZoom + viewport.y
    };
  }

  // 尺寸转换：视口尺寸到场景尺寸
  viewportToSceneSize(size: number): number {
    return size / this.currentZoom;
  }

  // 尺寸转换：场景尺寸到视口尺寸
  sceneToViewportSize(size: number): number {
    return size * this.currentZoom;
  }

  // 动画缩放
  private animateZoom(targetZoom: number): void {
    if (this.isAnimating) {
      // 如果正在动画，更新目标缩放
      this.targetZoom = targetZoom;
      return;
    }

    this.isAnimating = true;
    this.targetZoom = targetZoom;
    this.animationStartTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - this.animationStartTime;
      const progress = Math.min(elapsed / this.animationDuration, 1);
      
      // 使用缓动函数
      const easeProgress = this.easeOutCubic(progress);
      
      this.currentZoom = this.currentZoom + (this.targetZoom - this.currentZoom) * easeProgress;
      
      this.editor.render();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.currentZoom = this.targetZoom;
      }
    };

    requestAnimationFrame(animate);
  }

  // 限制缩放范围
  private clampZoom(zoom: number): number {
    return Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
  }

  // 缓动函数
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  // 获取缩放选项
  getOptions(): IZoomOptions {
    return { ...this.options };
  }

  // 设置缩放选项
  setOptions(options: Partial<IZoomOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // 获取缩放状态
  getZoomState(): { currentZoom: number; targetZoom: number; isAnimating: boolean } {
    return {
      currentZoom: this.currentZoom,
      targetZoom: this.targetZoom,
      isAnimating: this.isAnimating
    };
  }

  // 检查是否在缩放范围内
  isZoomInRange(zoom: number): boolean {
    return zoom >= this.options.minZoom && zoom <= this.options.maxZoom;
  }

  // 获取缩放百分比
  getZoomPercentage(): number {
    return Math.round(this.currentZoom * 100);
  }

  // 设置缩放百分比
  setZoomPercentage(percentage: number): void {
    this.setZoom(percentage / 100);
  }
}