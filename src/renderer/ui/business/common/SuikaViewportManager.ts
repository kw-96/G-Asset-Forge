/**
 * Suika视口管理器
 * 提取并适配自 suika/packages/core/src/viewport_manager.ts
 */

import { getDevicePixelRatio } from './utils';

export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Events {
  xOrYChange(x: number | undefined, y: number): void;
  viewMatrixChange(viewMatrix: Matrix): void;
  zoomChange(zoom: number): void;
}

/**
 * 简单的矩阵类，用于视口变换
 */
export class Matrix {
  a: number = 1; // scaleX
  b: number = 0; // skewY
  c: number = 0; // skewX
  d: number = 1; // scaleY
  tx: number = 0; // translateX
  ty: number = 0; // translateY

  constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number) {
    if (a !== undefined) this.a = a;
    if (b !== undefined) this.b = b;
    if (c !== undefined) this.c = c;
    if (d !== undefined) this.d = d;
    if (tx !== undefined) this.tx = tx;
    if (ty !== undefined) this.ty = ty;
  }

  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  translate(dx: number, dy: number): Matrix {
    this.tx += dx;
    this.ty += dy;
    return this;
  }

  scale(sx: number, sy: number): Matrix {
    this.a *= sx;
    this.d *= sy;
    return this;
  }

  applyInverse(point: IPoint): IPoint {
    const det = this.a * this.d - this.b * this.c;
    if (Math.abs(det) < 1e-10) {
      return { x: 0, y: 0 };
    }
    
    const invA = this.d / det;
    const invB = -this.b / det;
    const invC = -this.c / det;
    const invD = this.a / det;
    
    const x = point.x - this.tx;
    const y = point.y - this.ty;
    
    return {
      x: invA * x + invC * y,
      y: invB * x + invD * y
    };
  }
}

/**
 * 简单的事件发射器
 */
class EventEmitter<T> {
  private events: Map<keyof T, Array<(...args: any[]) => void>> = new Map();

  on<K extends keyof T>(eventName: K, handler: T[K]) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(handler as any);
  }

  off<K extends keyof T>(eventName: K, handler: T[K]) {
    const handlers = this.events.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler as any);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<K extends keyof T>(eventName: K, ...args: any[]) {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
}

export interface ViewportManagerConfig {
  zoomMin: number;
  zoomMax: number;
  zoomStep: number;
  zoomLevels: number[];
  zoomToFixPadding: number;
  enableRuler: boolean;
  rulerWidth: number;
}

export class SuikaViewportManager {
  private viewMatrix = new Matrix();
  private eventEmitter = new EventEmitter<Events>();
  private config: ViewportManagerConfig;
  private canvasElement: HTMLCanvasElement;

  constructor(canvasElement: HTMLCanvasElement, config: ViewportManagerConfig) {
    this.canvasElement = canvasElement;
    this.config = config;
  }

  /* get view matrix clone */
  getViewMatrix() {
    return this.viewMatrix.clone();
  }

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

  getZoom() {
    return this.viewMatrix.a;
  }

  /**
   * 放大
   * @param center 缩放中心
   * @param isLevelZoom 是否按级别缩放
   * @param deltaY 鼠标滚轮deltaY
   */
  zoomIn(opts?: { center?: IPoint; isLevelZoom?: boolean; deltaY?: number }) {
    const prevZoom = this.getZoom();

    let zoom: number;
    if (opts?.isLevelZoom) {
      const levels = this.config.zoomLevels;
      const [, right] = getNearestVals(levels, prevZoom);
      zoom = right;
    } else {
      const zoomStep = opts?.deltaY
        ? deltaYToZoomStep(opts.deltaY)
        : this.config.zoomStep;
      zoom = Math.min(
        prevZoom * (1 + zoomStep),
        this.config.zoomMax,
      );
    }

    const center = opts?.center ?? this.getViewportCenter();
    this.setZoom(zoom, center);
  }

  /**
   * 缩小
   * @param center 缩放中心
   * @param isLevelZoom 是否按级别缩放
   * @param deltaY 鼠标滚轮deltaY
   */
  zoomOut(opts?: { center?: IPoint; isLevelZoom?: boolean; deltaY?: number }) {
    const prevZoom = this.getZoom();
    let zoom: number;
    if (opts?.isLevelZoom) {
      const levels = this.config.zoomLevels;
      const [left] = getNearestVals(levels, prevZoom);
      zoom = left;
    } else {
      const zoomStep = opts?.deltaY
        ? deltaYToZoomStep(opts.deltaY)
        : this.config.zoomStep;
      zoom = Math.max(
        prevZoom / (1 + zoomStep),
        this.config.zoomMin,
      );
    }
    const center = opts?.center ?? this.getViewportCenter();
    this.setZoom(zoom, center);
  }

  setZoom(zoom: number, center: IPoint) {
    const deltaZoom = zoom / this.getZoom();
    const newViewMatrix = this.viewMatrix
      .clone()
      .translate(-center.x, -center.y)
      .scale(deltaZoom, deltaZoom)
      .translate(center.x, center.y);

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

  private getViewportCenter() {
    const { width, height } = this.getPageSize();
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  getPos() {
    return {
      x: this.viewMatrix.tx,
      y: this.viewMatrix.ty,
    };
  }

  getPageSize() {
    return {
      width: parseFloat(this.canvasElement.style.width) || this.canvasElement.width,
      height: parseFloat(this.canvasElement.style.height) || this.canvasElement.height,
    };
  }

  setViewportSize({ width, height }: ISize) {
    const dpr = getDevicePixelRatio();

    this.canvasElement.width = width * dpr;
    this.canvasElement.style.width = width + 'px';

    this.canvasElement.height = height * dpr;
    this.canvasElement.style.height = height + 'px';
  }

  getSceneCenter() {
    const size = this.getPageSize();
    return this.viewMatrix.applyInverse({
      x: size.width / 2,
      y: size.height / 2,
    });
  }

  translate(dx: number, dy: number) {
    const newViewMatrix = this.viewMatrix.clone().translate(dx, dy);
    this.setViewMatrix(newViewMatrix);
  }

  setZoomAndUpdateViewport(zoom: number) {
    const size = this.getPageSize();
    this.setZoom(zoom, {
      x: size.width / 2,
      y: size.height / 2,
    });
  }

  getSceneBbox(): IBox {
    const { width, height } = this.getPageSize();
    const { x: minX, y: minY } = this.viewMatrix.applyInverse({ x: 0, y: 0 });
    const { x: maxX, y: maxY } = this.viewMatrix.applyInverse({
      x: width,
      y: height,
    });
    return { minX, minY, maxX, maxY };
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.on(eventName, handler);
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.off(eventName, handler);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ViewportManagerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * 二分查找找到目标值的左右索引
 */
const getNearestVals = <T>(arr: T[], target: T): [T, T] => {
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
};

/**
 * 根据鼠标滚轮deltaY计算缩放步长
 * 这是Suika的核心算法，提供平滑的缩放体验
 */
const deltaYToZoomStep = (deltaY: number) => {
  return Math.max(0.05, 0.12937973 * Math.log(Math.abs(deltaY)) - 0.33227472);
};
