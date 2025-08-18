/**
 * 视口管理器 - 管理画布视口的缩放、平移和视图控制
 * @description 提供精确的视口控制功能，包括缩放、平移、适配等操作
 * @author 开发团队
 */

import { useCanvasStore } from '../../../stores/canvasStore';
import { useAppStore } from '../../../stores/appStore';
import type { CanvasElement } from '../../../../interfaces/types/canvas';

/**
 * 视口边界接口
 */
export interface ViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * 视口状态接口
 */
export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  bounds: ViewportBounds;
  center: { x: number; y: number };
}

/**
 * 缩放选项接口
 */
export interface ZoomOptions {
  centerX?: number;
  centerY?: number;
  animate?: boolean;
  duration?: number;
}

/**
 * 适配选项接口
 */
export interface FitOptions {
  padding?: number;
  maxZoom?: number;
  minZoom?: number;
  animate?: boolean;
  duration?: number;
}

/**
 * 视口管理器类
 * @description 提供画布视口的精确控制和管理功能
 */
export class ViewportManager {
  private static instance: ViewportManager | null = null;
  private readonly ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  private readonly MIN_ZOOM = 25;
  private readonly MAX_ZOOM = 400;
  private readonly DEFAULT_ZOOM = 100;
  
  // 视口尺寸（应该从实际画布容器获取）
  private viewportWidth = 1920;
  private viewportHeight = 1080;

  private constructor() {}

  /**
   * 获取视口管理器单例实例
   */
  public static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  /**
   * 设置视口尺寸
   */
  public setViewportSize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    
    console.debug(`[viewport-manager] 设置视口尺寸: ${width}x${height}`);
  }

  /**
   * 获取当前视口状态
   */
  public getViewportState(): ViewportState {
    const canvasStore = useCanvasStore.getState();
    
    const bounds = this.calculateViewportBounds(
      canvasStore.zoom,
      canvasStore.panX,
      canvasStore.panY
    );

    return {
      zoom: canvasStore.zoom,
      panX: canvasStore.panX,
      panY: canvasStore.panY,
      bounds,
      center: {
        x: canvasStore.panX + this.viewportWidth / 2,
        y: canvasStore.panY + this.viewportHeight / 2,
      },
    };
  }

  /**
   * 设置缩放级别
   */
  public setZoom(zoom: number, options: ZoomOptions = {}): void {
    const clampedZoom = this.clampZoom(zoom);
    const canvasStore = useCanvasStore.getState();

    if (canvasStore.zoom === clampedZoom) {
      return; // 缩放级别没有变化
    }

    // 如果指定了中心点，调整平移以保持中心点位置
    if (options.centerX !== undefined && options.centerY !== undefined) {
      const zoomRatio = clampedZoom / canvasStore.zoom;
      const newPanX = options.centerX - (options.centerX - canvasStore.panX) * zoomRatio;
      const newPanY = options.centerY - (options.centerY - canvasStore.panY) * zoomRatio;

      canvasStore.setPan(newPanX, newPanY);
    }

    canvasStore.setZoom(clampedZoom);

    console.debug(`[viewport-manager] 设置缩放: ${clampedZoom}%`, {
      previous: canvasStore.zoom,
      center: options.centerX !== undefined ? { x: options.centerX, y: options.centerY } : null,
    });
  }

  /**
   * 放大
   */
  public zoomIn(options: ZoomOptions = {}): void {
    const canvasStore = useCanvasStore.getState();
    const currentIndex = this.ZOOM_LEVELS.findIndex(level => level >= canvasStore.zoom);
    const nextIndex = Math.min(currentIndex + 1, this.ZOOM_LEVELS.length - 1);
    const nextZoom = this.ZOOM_LEVELS[nextIndex];

    if (nextZoom !== undefined && nextZoom !== canvasStore.zoom) {
      this.setZoom(nextZoom, options);
    }
  }

  /**
   * 缩小
   */
  public zoomOut(options: ZoomOptions = {}): void {
    const canvasStore = useCanvasStore.getState();
    const currentIndex = this.ZOOM_LEVELS.findIndex(level => level >= canvasStore.zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevZoom = this.ZOOM_LEVELS[prevIndex];

    if (prevZoom !== undefined && prevZoom !== canvasStore.zoom) {
      this.setZoom(prevZoom, options);
    }
  }

  /**
   * 重置缩放到100%
   */
  public resetZoom(): void {
    this.setZoom(this.DEFAULT_ZOOM);
  }

  /**
   * 设置平移位置
   */
  public setPan(x: number, y: number): void {
    const canvasStore = useCanvasStore.getState();

    if (canvasStore.panX === x && canvasStore.panY === y) {
      return; // 位置没有变化
    }

    canvasStore.setPan(x, y);

    console.debug(`[viewport-manager] 设置平移: (${x}, ${y})`);
  }

  /**
   * 相对平移
   */
  public pan(deltaX: number, deltaY: number): void {
    const canvasStore = useCanvasStore.getState();
    this.setPan(canvasStore.panX + deltaX, canvasStore.panY + deltaY);
  }

  /**
   * 居中视图
   */
  public centerView(): void {
    this.setPan(0, 0);
    console.debug('[viewport-manager] 居中视图');
  }

  /**
   * 重置视图（缩放和平移）
   */
  public resetView(): void {
    const canvasStore = useCanvasStore.getState();
    canvasStore.resetView();
    console.debug('[viewport-manager] 重置视图');
  }

  /**
   * 缩放到适合所有元素
   */
  public zoomToFitAll(options: FitOptions = {}): void {
    const appStore = useAppStore.getState();
    const elements = Object.values(appStore.elements);

    if (elements.length === 0) {
      this.resetView();
      return;
    }

    const bounds = this.calculateElementsBounds(elements);
    this.zoomToFitBounds(bounds, options);

    console.debug('[viewport-manager] 缩放到适合所有元素', { elementCount: elements.length });
  }

  /**
   * 缩放到适合选中元素
   */
  public zoomToFitSelected(options: FitOptions = {}): void {
    const appStore = useAppStore.getState();
    const selectedElements = appStore.selectedElements
      .map(id => appStore.elements[id])
      .filter(Boolean);

    if (selectedElements.length === 0) {
      console.warn('[viewport-manager] 没有选中的元素可适配');
      return;
    }

    const bounds = this.calculateElementsBounds(selectedElements as unknown as CanvasElement[]);
    this.zoomToFitBounds(bounds, options);

    console.debug('[viewport-manager] 缩放到适合选中元素', { elementCount: selectedElements.length });
  }

  /**
   * 缩放到适合指定边界
   */
  public zoomToFitBounds(bounds: ViewportBounds, options: FitOptions = {}): void {
    const padding = options.padding || 50;
    const maxZoom = options.maxZoom || this.MAX_ZOOM;
    const minZoom = options.minZoom || this.MIN_ZOOM;

    // 计算需要的缩放级别
    const scaleX = (this.viewportWidth - padding * 2) / bounds.width;
    const scaleY = (this.viewportHeight - padding * 2) / bounds.height;
    const scale = Math.min(scaleX, scaleY);

    // 转换为百分比并限制范围
    const targetZoom = this.clampZoom(scale * 100, minZoom, maxZoom);

    // 计算居中位置
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const panX = this.viewportWidth / 2 - centerX * (targetZoom / 100);
    const panY = this.viewportHeight / 2 - centerY * (targetZoom / 100);

    // 应用缩放和平移
    const canvasStore = useCanvasStore.getState();
    canvasStore.setZoom(targetZoom);
    canvasStore.setPan(panX, panY);

    console.debug('[viewport-manager] 缩放到适合边界', {
      bounds,
      targetZoom,
      pan: { x: panX, y: panY },
    });
  }

  /**
   * 将屏幕坐标转换为画布坐标
   */
  public screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    const canvasStore = useCanvasStore.getState();
    const scale = canvasStore.zoom / 100;

    return {
      x: (screenX - canvasStore.panX) / scale,
      y: (screenY - canvasStore.panY) / scale,
    };
  }

  /**
   * 将画布坐标转换为屏幕坐标
   */
  public canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    const canvasStore = useCanvasStore.getState();
    const scale = canvasStore.zoom / 100;

    return {
      x: canvasX * scale + canvasStore.panX,
      y: canvasY * scale + canvasStore.panY,
    };
  }

  /**
   * 检查点是否在视口内
   */
  public isPointInViewport(x: number, y: number): boolean {
    const screenPoint = this.canvasToScreen(x, y);
    
    return (
      screenPoint.x >= 0 &&
      screenPoint.x <= this.viewportWidth &&
      screenPoint.y >= 0 &&
      screenPoint.y <= this.viewportHeight
    );
  }

  /**
   * 检查矩形是否与视口相交
   */
  public isRectIntersectingViewport(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const topLeft = this.canvasToScreen(x, y);
    const bottomRight = this.canvasToScreen(x + width, y + height);

    return !(
      bottomRight.x < 0 ||
      topLeft.x > this.viewportWidth ||
      bottomRight.y < 0 ||
      topLeft.y > this.viewportHeight
    );
  }

  /**
   * 获取可见的元素
   */
  public getVisibleElements(): CanvasElement[] {
    const appStore = useAppStore.getState();
    const elements = Object.values(appStore.elements);

    return elements.filter(element => {
      if (!element.visible) {
        return false;
      }

      return this.isRectIntersectingViewport(
        element.transform.x,
        element.transform.y,
        element.transform.width,
        element.transform.height
      );
    });
  }

  /**
   * 获取下一个缩放级别
   */
  public getNextZoomLevel(direction: 'in' | 'out'): number {
    const canvasStore = useCanvasStore.getState();
    const currentZoom = canvasStore.zoom;

    if (direction === 'in') {
      const nextLevel = this.ZOOM_LEVELS.find(level => level > currentZoom);
      return nextLevel || this.MAX_ZOOM;
    } else {
      const prevLevel = [...this.ZOOM_LEVELS].reverse().find(level => level < currentZoom);
      return prevLevel || this.MIN_ZOOM;
    }
  }

  /**
   * 获取所有可用的缩放级别
   */
  public getZoomLevels(): number[] {
    return [...this.ZOOM_LEVELS];
  }

  /**
   * 限制缩放级别在有效范围内
   */
  private clampZoom(zoom: number, min = this.MIN_ZOOM, max = this.MAX_ZOOM): number {
    return Math.max(min, Math.min(max, zoom));
  }

  /**
   * 计算视口边界
   */
  private calculateViewportBounds(zoom: number, panX: number, panY: number): ViewportBounds {
    const scale = zoom / 100;
    const left = -panX / scale;
    const top = -panY / scale;
    const width = this.viewportWidth / scale;
    const height = this.viewportHeight / scale;

    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
    };
  }

  /**
   * 计算元素集合的边界
   */
  private calculateElementsBounds(elements: CanvasElement[]): ViewportBounds {
    if (elements.length === 0) {
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      minX = Math.min(minX, element.transform.x);
      minY = Math.min(minY, element.transform.y);
      maxX = Math.max(maxX, element.transform.x + element.transform.width);
      maxY = Math.max(maxY, element.transform.y + element.transform.height);
    });

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 获取视口管理器状态
   */
  public getStatus() {
    const state = this.getViewportState();
    
    return {
      ...state,
      viewportSize: {
        width: this.viewportWidth,
        height: this.viewportHeight,
      },
      zoomLevels: this.ZOOM_LEVELS,
      zoomRange: {
        min: this.MIN_ZOOM,
        max: this.MAX_ZOOM,
        default: this.DEFAULT_ZOOM,
      },
    };
  }
}

// 导出单例实例
export const viewportManager = ViewportManager.getInstance();