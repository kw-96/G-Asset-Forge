/**
 * Suika视口管理器 - 管理画布的视口变换、缩放和平移
 * @description 提供视口矩阵管理、缩放控制、平移控制和坐标转换功能
 * @author Suika团队
 */

import { EventEmitter, getDevicePixelRatio } from '../common';
import {
  boxToRect,
  type IBox,
  type IPoint,
  type IRect,
  type ISize,
  Matrix,
} from '../geo';

interface Events {
  xOrYChange(x: number | undefined, y: number): void;
  viewMatrixChange(viewMatrix: Matrix): void;
  zoomChange(zoom: number): void;
}

export class ViewportManager {
  getViewportState(): {
    bounds: any; panX: number; panY: number; zoom: number;
} {
    return {
  panX: this.viewMatrix.tx,
  panY: this.viewMatrix.ty,
  zoom: this.getZoom(),
  bounds: {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  },
};
  }
  getViewport(): { panX: number; panY: number; zoom: number } {
    return {
      panX: this.viewMatrix.tx,
      panY: this.viewMatrix.ty,
      zoom: this.getZoom(),
    };
  }
  private viewMatrix = new Matrix();
  private eventEmitter = new EventEmitter<Events>();

  constructor(private editor: any) {}

  /**
   * 获取视图矩阵副本
   */
  getViewMatrix() {
    return this.viewMatrix.clone();
  }

  /**
   * 设置视图矩阵
   */
  setViewMatrix(viewMatrix: Matrix) {
    const prevX = this.viewMatrix.tx;
    const prevY = this.viewMatrix.ty;
    const prevZoom = this.getZoom();
    this.viewMatrix = viewMatrix;
    this.eventEmitter.emit('viewMatrixChange', viewMatrix);

    if (prevZoom !== this.getZoom()) {
      this.eventEmitter.emit('zoomChange', this.getZoom());
    }
    if (prevX !== viewMatrix.tx || prevY !== viewMatrix.ty) {
      this.eventEmitter.emit('xOrYChange', viewMatrix.tx, viewMatrix.ty);
    }
  }

  /**
   * 获取当前缩放级别
   */
  getZoom() {
    return this.viewMatrix.a;
  }

  /**
   * 放大
   */
  zoomIn(opts?: { center?: IPoint; isLevelZoom?: boolean; deltaY?: number }) {
    const prevZoom = this.getZoom();

    let zoom: number;
    if (opts?.isLevelZoom) {
      const levels = this.editor.setting.get('zoomLevels');
      const [, right] = this.getNearestVals(levels, prevZoom);
      zoom = right;
    } else {
      const zoomStep = opts?.deltaY
        ? this.deltaYToZoomStep(opts.deltaY)
        : this.editor.setting.get('zoomStep');
      zoom = Math.min(
        prevZoom * (1 + zoomStep),
        this.editor.setting.get('zoomMax'),
      );
    }

    const center = opts?.center ?? this.getViewportCenter();
    this.setZoom(zoom, center);
  }

  /**
   * 缩小
   */
  zoomOut(opts?: { center?: IPoint; isLevelZoom?: boolean; deltaY?: number }) {
    const prevZoom = this.getZoom();
    let zoom: number;
    if (opts?.isLevelZoom) {
      const levels = this.editor.setting.get('zoomLevels');
      const [left] = this.getNearestVals(levels, prevZoom);
      zoom = left;
    } else {
      const zoomStep = opts?.deltaY
        ? this.deltaYToZoomStep(opts.deltaY)
        : this.editor.setting.get('zoomStep');
      zoom = Math.max(
        prevZoom / (1 + zoomStep),
        this.editor.setting.get('zoomMin'),
      );
    }
    const center = opts?.center ?? this.getViewportCenter();
    this.setZoom(zoom, center);
  }

  /**
   * 设置缩放级别
   */
  setZoom(zoom: number, center: IPoint) {
    const deltaZoom = zoom / this.getZoom();
    const newViewMatrix = this.viewMatrix
      .clone()
      .translate(-center.x, -center.y)
      .scale(deltaZoom, deltaZoom)
      .translate(center.x, center.y);

    this.setViewMatrix(newViewMatrix);
    this.eventEmitter.emit('zoomChange', this.getZoom());
  }

  /**
   * 缩放以适应所有元素
   */
  zoomToFit(maxZoom?: number) {
    const canvasBbox = this.editor.getCanvasChildrenBbox();
    if (!canvasBbox) {
      this.resetViewport();
      return;
    }
    this.zoomRectToFit(boxToRect(canvasBbox), maxZoom);
  }

  /**
   * 缩放以适应选中元素
   */
  zoomToSelection() {
    const selectedBoundingRect = this.editor.selectedElements.getBoundingRect();
    if (!selectedBoundingRect) {
      this.zoomToFit();
    } else {
      this.zoomRectToFit(selectedBoundingRect);
    }
  }

  /**
   * 缩放以适应指定矩形
   */
  private zoomRectToFit(targetRect: IRect, maxZoom?: number) {
    const padding = this.editor.setting.get('zoomToFixPadding');
    const rulerWidth = this.editor.setting.get('enableRuler')
      ? this.editor.setting.get('rulerWidth')
      : 0;

    const pageSize = this.getPageSize();
    const viewRect = boxToRect({
      minX: 0,
      minY: 0,
      maxX: pageSize.width,
      maxY: pageSize.height,
    });

    const zoomX =
      (viewRect.width - padding * 2 - rulerWidth) / targetRect.width;
    const zoomY =
      (viewRect.height - padding * 2 - rulerWidth) / targetRect.height;
    let zoom = Math.min(zoomX, zoomY);

    if (maxZoom) {
      zoom = Math.min(zoom, maxZoom);
    }

    const newViewMatrix = new Matrix()
      .translate(
        -(targetRect.x + targetRect.width / 2),
        -(targetRect.y + targetRect.height / 2),
      )
      .translate(viewRect.width / 2, viewRect.height / 2)
      .translate(-pageSize.width / 2, -pageSize.height / 2)
      .scale(zoom, zoom)
      .translate(pageSize.width / 2, pageSize.height / 2)
      .translate(rulerWidth / 2, rulerWidth / 2);

    this.setViewMatrix(newViewMatrix);
  }

  /**
   * 重置视口到默认状态
   */
  resetViewport() {
    const center = this.getViewportCenter();
    const newViewMatrix = new Matrix().clone().translate(center.x, center.y);
    this.setViewMatrix(newViewMatrix);
  }

  /**
   * 获取视口中心点
   */
  private getViewportCenter() {
    const { width, height } = this.getPageSize();
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  /**
   * 获取视口位置
   */
  getPos() {
    return {
      x: this.viewMatrix.tx,
      y: this.viewMatrix.ty,
    };
  }

  /**
   * 获取页面尺寸
   */
  getPageSize() {
    return {
      width: parseFloat(this.editor.canvasElement.style.width),
      height: parseFloat(this.editor.canvasElement.style.height),
    };
  }

  /**
   * 设置视口尺寸
   */
  setViewportSize({ width, height }: ISize) {
    const dpr = getDevicePixelRatio();

    this.editor.canvasElement.width = width * dpr;
    this.editor.canvasElement.style.width = width + 'px';

    this.editor.canvasElement.height = height * dpr;
    this.editor.canvasElement.style.height = height + 'px';
  }

  /**
   * 获取场景中心点
   */
  getSceneCenter() {
    const size = this.getPageSize();
    return this.viewMatrix.applyInverse({
      x: size.width / 2,
      y: size.height / 2,
    });
  }

  /**
   * 平移视口
   */
  translate(dx: number, dy: number) {
    const newViewMatrix = this.viewMatrix.clone().translate(dx, dy);
    this.setViewMatrix(newViewMatrix);
  }

  /**
   * 设置缩放并更新视口
   */
  setZoomAndUpdateViewport(zoom: number) {
    const size = this.getPageSize();
    this.setZoom(zoom, {
      x: size.width / 2,
      y: size.height / 2,
    });
  }

  /**
   * 获取场景边界框
   */
  getSceneBbox(): IBox {
    const { width, height } = this.getPageSize();
    const { x: minX, y: minY } = this.viewMatrix.applyInverse({ x: 0, y: 0 });
    const { x: maxX, y: maxY } = this.viewMatrix.applyInverse({
      x: width,
      y: height,
    });
    return { minX, minY, maxX, maxY };
  }

  /**
   * 监听事件
   */
  on<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.on(eventName, handler);
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.off(eventName, handler);
  }

  /**
   * 二分查找最近的值
   */
  private getNearestVals<T>(arr: T[], target: T): [T, T] {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === target) {
        right = mid - 1;
        left = mid + 1;
        break;
      } else if (arr[mid]! < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (right < 0) right = 0;
    if (left >= arr.length) left = arr.length - 1;
    return [arr[right]!, arr[left]!];
  }

  /**
   * 将deltaY转换为缩放步长
   */
  private deltaYToZoomStep(deltaY: number) {
    return Math.max(0.05, 0.12937973 * Math.log(Math.abs(deltaY)) - 0.33227472);
  }
}