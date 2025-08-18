/**
 * 画布管理器 - 管理画布的生命周期和核心功能
 * @description 负责画布的创建、销毁、状态管理和事件协调
 * @author 开发团队
 */

import { useCanvasStore } from '../../../stores/canvasStore';
import { useAppStore } from '../../../stores/appStore';
import type { CanvasElement } from '../../../../interfaces/types/canvas';

/**
 * 画布事件类型
 */
export type CanvasEvent = 
  | 'element-added'
  | 'element-updated' 
  | 'element-removed'
  | 'selection-changed'
  | 'viewport-changed'
  | 'canvas-ready'
  | 'canvas-error';

/**
 * 画布事件监听器
 */
export type CanvasEventListener = (event: CanvasEvent, data?: any) => void;

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  enableGrid: boolean;
  enableRulers: boolean;
  enableSnapping: boolean;
  backgroundColor: string;
  gridSize: number;
  maxZoom: number;
  minZoom: number;
  enablePerformanceMonitoring: boolean;
}

/**
 * 画布管理器类
 * @description 提供画布的统一管理接口，协调各个子系统
 */
export class CanvasManager {
  private static instance: CanvasManager | null = null;
  private eventListeners: Map<CanvasEvent, Set<CanvasEventListener>> = new Map();
  private isInitialized = false;
  private config: CanvasConfig;
  private performanceTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableGrid: true,
      enableRulers: true,
      enableSnapping: false,
      backgroundColor: '#ffffff',
      gridSize: 20,
      maxZoom: 400,
      minZoom: 25,
      enablePerformanceMonitoring: true,
    };
  }

  /**
   * 获取画布管理器单例实例
   */
  public static getInstance(): CanvasManager {
    if (!CanvasManager.instance) {
      CanvasManager.instance = new CanvasManager();
    }
    return CanvasManager.instance;
  }

  /**
   * 初始化画布管理器
   */
  public async initialize(config?: Partial<CanvasConfig>): Promise<void> {
    if (this.isInitialized) {
      console.warn('[canvas-manager] 画布管理器已经初始化');
      return;
    }

    try {
      console.info('[canvas-manager] 开始初始化画布管理器');

      // 合并配置
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化画布存储
      const canvasStore = useCanvasStore.getState();
      await canvasStore.initializeCanvas();

      // 设置画布配置
      canvasStore.setShowGrid(this.config.enableGrid);
      canvasStore.setShowRuler(this.config.enableRulers);
      canvasStore.setSnapToGrid(this.config.enableSnapping);
      canvasStore.setBackgroundColor(this.config.backgroundColor);
      canvasStore.setGridSize(this.config.gridSize);

      // 启动性能监控
      if (this.config.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring();
      }

      this.isInitialized = true;
      this.emit('canvas-ready');

      console.info('[canvas-manager] 画布管理器初始化完成');

    } catch (error) {
      console.error('[canvas-manager] 画布管理器初始化失败:', error);
      this.emit('canvas-error', error);
      throw error;
    }
  }

  /**
   * 销毁画布管理器
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    console.info('[canvas-manager] 销毁画布管理器');

    // 停止性能监控
    this.stopPerformanceMonitoring();

    // 清除事件监听器
    this.eventListeners.clear();

    this.isInitialized = false;
  }

  /**
   * 添加元素到画布
   */
  public addElement(element: CanvasElement): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const appStore = useAppStore.getState();
    appStore.addElement(element);

    this.emit('element-added', element);

    console.debug(`[canvas-manager] 添加元素: ${element.name}`, { id: element.id });
  }

  /**
   * 更新画布元素
   */
  public updateElement(id: string, updates: Partial<CanvasElement>): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const appStore = useAppStore.getState();
    appStore.updateElement(id, updates);

    this.emit('element-updated', { id, updates });

    console.debug(`[canvas-manager] 更新元素: ${id}`, { updatedKeys: Object.keys(updates) });
  }

  /**
   * 删除画布元素
   */
  public removeElement(id: string): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const appStore = useAppStore.getState();
    const element = appStore.elements[id];

    if (!element) {
      console.warn(`[canvas-manager] 尝试删除不存在的元素: ${id}`);
      return;
    }

    appStore.deleteElement(id);

    this.emit('element-removed', { id, element });

    console.debug(`[canvas-manager] 删除元素: ${element.name}`, { id });
  }

  /**
   * 选择元素
   */
  public selectElements(elementIds: string[]): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const appStore = useAppStore.getState();
    appStore.selectElements(elementIds);

    this.emit('selection-changed', elementIds);

    console.debug(`[canvas-manager] 选择元素`, { count: elementIds.length, ids: elementIds });
  }

  /**
   * 清除选择
   */
  public clearSelection(): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const appStore = useAppStore.getState();
    appStore.clearSelection();

    this.emit('selection-changed', []);

    console.debug('[canvas-manager] 清除选择');
  }

  /**
   * 设置画布缩放
   */
  public setZoom(zoom: number): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const clampedZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    
    const canvasStore = useCanvasStore.getState();
    canvasStore.setZoom(clampedZoom);

    this.emit('viewport-changed', { zoom: clampedZoom });

    console.debug(`[canvas-manager] 设置缩放: ${clampedZoom}%`);
  }

  /**
   * 设置画布平移
   */
  public setPan(x: number, y: number): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const canvasStore = useCanvasStore.getState();
    canvasStore.setPan(x, y);

    this.emit('viewport-changed', { panX: x, panY: y });

    console.debug(`[canvas-manager] 设置平移: (${x}, ${y})`);
  }

  /**
   * 缩放到适合
   */
  public zoomToFit(): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const canvasStore = useCanvasStore.getState();
    canvasStore.zoomToFit();

    console.debug('[canvas-manager] 缩放到适合');
  }

  /**
   * 重置视图
   */
  public resetView(): void {
    if (!this.isInitialized) {
      throw new Error('画布管理器未初始化');
    }

    const canvasStore = useCanvasStore.getState();
    canvasStore.resetView();

    this.emit('viewport-changed', { zoom: 100, panX: 0, panY: 0 });

    console.debug('[canvas-manager] 重置视图');
  }

  /**
   * 获取画布状态
   */
  public getCanvasState() {
    const canvasStore = useCanvasStore.getState();
    const appStore = useAppStore.getState();

    return {
      zoom: canvasStore.zoom,
      panX: canvasStore.panX,
      panY: canvasStore.panY,
      showGrid: canvasStore.showGrid,
      showRuler: canvasStore.showRuler,
      snapToGrid: canvasStore.snapToGrid,
      backgroundColor: canvasStore.backgroundColor,
      gridSize: canvasStore.gridSize,
      elements: appStore.elements,
      selectedElements: appStore.selectedElements,
      elementCount: Object.keys(appStore.elements).length,
    };
  }

  /**
   * 更新画布配置
   */
  public updateConfig(updates: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...updates };

    const canvasStore = useCanvasStore.getState();

    // 应用配置更改
    if ('enableGrid' in updates) {
      canvasStore.setShowGrid(updates.enableGrid!);
    }

    if ('enableRulers' in updates) {
      canvasStore.setShowRuler(updates.enableRulers!);
    }

    if ('enableSnapping' in updates) {
      canvasStore.setSnapToGrid(updates.enableSnapping!);
    }

    if ('backgroundColor' in updates) {
      canvasStore.setBackgroundColor(updates.backgroundColor!);
    }

    if ('gridSize' in updates) {
      canvasStore.setGridSize(updates.gridSize!);
    }

    if ('enablePerformanceMonitoring' in updates) {
      if (updates.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring();
      } else {
        this.stopPerformanceMonitoring();
      }
    }

    console.debug('[canvas-manager] 更新画布配置', { updatedKeys: Object.keys(updates) });
  }

  /**
   * 获取画布配置
   */
  public getConfig(): CanvasConfig {
    return { ...this.config };
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(event: CanvasEvent, listener: CanvasEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: CanvasEvent, listener: CanvasEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: CanvasEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[canvas-manager] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 启动性能监控
   */
  private startPerformanceMonitoring(): void {
    if (this.performanceTimer) {
      return;
    }

    this.performanceTimer = setInterval(() => {
      const canvasStore = useCanvasStore.getState();
      const appStore = useAppStore.getState();

      // 模拟性能数据收集
      const fps = 60; // 实际应用中应该从渲染引擎获取
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      const objectCount = Object.keys(appStore.elements).length;

      canvasStore.updatePerformanceMetrics(fps, memoryUsage, objectCount);

    }, 1000); // 每秒更新一次

    console.debug('[canvas-manager] 启动性能监控');
  }

  /**
   * 停止性能监控
   */
  private stopPerformanceMonitoring(): void {
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
      console.debug('[canvas-manager] 停止性能监控');
    }
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats() {
    const canvasStore = useCanvasStore.getState();

    return {
      fps: canvasStore.fps,
      memoryUsage: canvasStore.memoryUsage,
      objectCount: canvasStore.objectCount,
      isMonitoring: this.performanceTimer !== null,
    };
  }

  /**
   * 检查管理器状态
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      eventListenerCount: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.size, 0),
      performanceMonitoring: this.performanceTimer !== null,
    };
  }
}

// 导出单例实例
export const canvasManager = CanvasManager.getInstance();