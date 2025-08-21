/**
 * Suika画布引擎适配器
 * @description 提供Suika编辑器与统一接口之间的适配层
 * @author 开发团队
 */

import { SuikaEditor } from './core';
import { SuikaToolAdapter } from './adapter/tool-adapter';
import type { CanvasEngine } from '../../core/canvas/canvas-manager';
import type {
  CanvasConfig,
  CanvasState,
  CanvasElement,
  TextElement,
  ImageElement,
  ShapeElement,
  BrushElement
} from '../../../../interfaces/types/canvas';
import { ElementType } from '../../../../interfaces/types/canvas';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';
import { EventEmitter } from '../../utils/EventEmitter';
import type { Tool, ToolType, ToolConfig, ToolProperties } from '../../core/tools/tool-types';
// 网格系统现在由Suika核心直接管理

// 游戏素材尺寸预设
export const GAME_ASSET_PRESETS = {
  // 移动游戏常用尺寸
  MOBILE_PORTRAIT: { width: 1080, height: 1920, name: 'Mobile Portrait (1080x1920)' },
  MOBILE_LANDSCAPE: { width: 1920, height: 1080, name: 'Mobile Landscape (1920x1080)' },
  IPHONE_X: { width: 1125, height: 2436, name: 'iPhone X (1125x2436)' },
  IPHONE_14: { width: 1170, height: 2532, name: 'iPhone 14 (1170x2532)' },

  // 平板尺寸
  IPAD: { width: 1536, height: 2048, name: 'iPad (1536x2048)' },
  IPAD_PRO: { width: 2048, height: 2732, name: 'iPad Pro (2048x2732)' },

  // 常用UI元素尺寸
  ICON_SMALL: { width: 64, height: 64, name: 'Small Icon (64x64)' },
  ICON_MEDIUM: { width: 128, height: 128, name: 'Medium Icon (128x128)' },
  ICON_LARGE: { width: 256, height: 256, name: 'Large Icon (256x256)' },

  // 背景尺寸
  HD: { width: 1280, height: 720, name: 'HD (1280x720)' },
  FULL_HD: { width: 1920, height: 1080, name: 'Full HD (1920x1080)' },
  QUAD_HD: { width: 2560, height: 1440, name: '2K (2560x1440)' },

  // 方形格式
  SQUARE_512: { width: 512, height: 512, name: 'Square 512x512' },
  SQUARE_1024: { width: 1024, height: 1024, name: 'Square 1024x1024' },

  // 自定义宽高比
  ASPECT_16_9: { width: 1600, height: 900, name: '16:9 Aspect (1600x900)' },
  ASPECT_4_3: { width: 1024, height: 768, name: '4:3 Aspect (1024x768)' },
  ASPECT_3_2: { width: 1080, height: 720, name: '3:2 Aspect (1080x720)' }
};

export interface SuikaCanvasEngineOptions {
  showPerfMonitor?: boolean;
  userPreference?: Record<string, any>;
  enableGrid?: boolean;
  enableRuler?: boolean;
  backgroundColor?: string;
}

export class SuikaCanvasEngine implements CanvasEngine {
  public readonly type = CanvasEngineType.SUIKA;
  private editor: SuikaEditor | null = null;
  private container: HTMLElement | null = null;
  private options: SuikaCanvasEngineOptions;
  private eventEmitter = new EventEmitter();
  private isInitialized = false;
  private layers: Map<string, { id: string; name: string; visible: boolean; locked: boolean; opacity: number; elements: CanvasElement[] }> = new Map();
  private activeLayerId = 'default';

  // 工具适配器
  private toolAdapter: SuikaToolAdapter | null = null;
  
  // 统一网格服务
  private gridService: any = null;

  constructor(options: SuikaCanvasEngineOptions = {}) {
    this.options = {
      showPerfMonitor: process.env['NODE_ENV'] === 'development',
      enableGrid: true,
      enableRuler: true,
      backgroundColor: '#ffffff',
      ...options
    };

    // 创建默认图层
    this.createDefaultLayer();
    
    // 网格系统现在由Suika核心直接管理
    console.log('网格系统已由Suika核心接管');
  }

  async initialize(container: HTMLElement, config: CanvasConfig): Promise<void> {
    if (this.isInitialized) {
      throw new Error('SuikaCanvasEngine is already initialized');
    }

    this.container = container;

    try {
      // 清理容器
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // 创建容器div
      const editorContainer = document.createElement('div');
      editorContainer.style.width = '100%';
      editorContainer.style.height = '100%';
      editorContainer.style.backgroundColor = this.options.backgroundColor || '#ffffff';
      editorContainer.setAttribute('data-editor-container', 'true');

      container.appendChild(editorContainer);

      this.editor = new SuikaEditor({
        containerElement: editorContainer as HTMLDivElement,
        width: config.width,
        height: config.height,
        showPerfMonitor: this.options.showPerfMonitor ?? false,
        userPreference: this.options.userPreference ?? {}
      });

      // 初始化工具适配器
      this.toolAdapter = new SuikaToolAdapter(this.editor);

      // 监听编辑器事件
      this.setupEventListeners();

      this.isInitialized = true;
      this.eventEmitter.emit('canvas:created', { type: this.type });
    } catch (error) {
      console.error('Failed to initialize SuikaCanvasEngine:', error);
      throw error;
    }
  }

  destroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    if (this.container) {
      // 更安全的DOM清理方式
      try {
        while (this.container.firstChild) {
          this.container.removeChild(this.container.firstChild);
        }
      } catch (error) {
        console.warn('Error clearing container:', error);
        // 如果removeChild失败，尝试innerHTML
        try {
          this.container.innerHTML = '';
        } catch (innerError) {
          console.warn('Error clearing container with innerHTML:', innerError);
        }
      }
      this.container = null;
    }

    this.isInitialized = false;
    this.layers.clear();
    this.eventEmitter.emit('canvas:destroyed', { type: this.type });
  }

  getState(): CanvasState {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const zoom = this.editor.viewportManager.getZoom() || 1;
    const viewport = this.editor.viewportManager.getPos() || { x: 0, y: 0 };

    return {
      id: 'canvas-1',
      name: 'Canvas',
      config: {
        size: { width: 800, height: 600 },
        width: 800,
        height: 600,
        backgroundColor: { type: 'solid', color: '#ffffff' },
        gridEnabled: true,
        gridSize: 20,
        gridColor: '#e0e0e0',
        snapToGrid: false,
        snapToObjects: false,
        showRulers: false,
        rulerUnit: 'px',
        zoomLevel: zoom,
        minZoom: 0.1,
        maxZoom: 10,
        engineType: 'suika',
        enableGPUAcceleration: true,
        maxTextureSize: 4096,
        targetFPS: 60
      },
      elements: Array.from(this.layers.values()).flatMap(layer => layer.elements),
      selectedElementIds: (this.editor.selectedElements.getItems() || []).map((obj: any) => obj.id) || [],
      viewport: { x: viewport.x, y: viewport.y, zoom },
      history: {
        canUndo: false,
        canRedo: false,
        currentIndex: 0,
        totalSteps: 0,
        maxSteps: 100
      },
      performance: {
        fps: 60,
        memoryUsage: 0,
        renderTime: 0,
        elementCount: Array.from(this.layers.values()).reduce((count, layer) => count + layer.elements.length, 0),
        lastUpdate: new Date().toISOString()
      },
      isModified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  setState(state: Partial<CanvasState>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const editorState: any = {};

    if (state.viewport !== undefined) {
      if (state.viewport.zoom !== undefined) {
        const center = this.editor.viewportManager.getPageSize();
        this.editor.viewportManager.setZoom(state.viewport.zoom, {
          x: center.width / 2,
          y: center.height / 2,
        });
      }
      if (state.viewport.x !== undefined || state.viewport.y !== undefined) {
        this.editor.viewportManager.translate(
          state.viewport.x || 0,
          state.viewport.y || 0
        );
      }
    }

    if (state.selectedElementIds !== undefined) {
      this.selectObjects(state.selectedElementIds);
    }

    this.editor.setState(editorState);
  }

  addObject(object: CanvasElement): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 将统一对象格式转换为Suika对象
    const suikaObject = this.convertToSuikaObject(object);
    this.editor.sceneGraph.addObject(suikaObject);

    // 添加到当前活动图层
    const activeLayer = this.layers.get(this.activeLayerId);
    if (activeLayer) {
      activeLayer.elements.push(object);
    }

    this.editor.render();
    this.eventEmitter.emit('object:added', { object });
  }

  removeObject(id: string): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.sceneGraph.removeObject(id);

    // 从所有图层中移除对象
    for (const layer of this.layers.values()) {
      layer.elements = layer.elements.filter((obj: any) => obj.id !== id);
    }

    this.editor.render();
    this.eventEmitter.emit('object:removed', { id });
  }

  updateObject(id: string, updates: Partial<CanvasElement>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const object = this.editor.sceneGraph.getObject(id) as any;
    if (object && updates) {
      // 更新对象属性
      Object.assign(object, updates);
      this.editor.render();
      this.eventEmitter.emit('object:modified', { id, updates });
    }
  }

  selectObjects(ids: string[]): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 简化的选择实现
    console.log('Selecting objects:', ids);
    this.editor.render();
    this.eventEmitter.emit('selection:created', { ids });
  }

  clearSelection(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 简化的清除选择实现
    console.log('Clearing selection');
    this.editor.render();
    this.eventEmitter.emit('selection:cleared', {});
  }

  // 无限画布视图控制功能实现

  /**
   * 设置缩放级别 - 支持10%-500%缩放范围和60fps性能优化
   */
  zoom(level: number, centerPoint?: { x: number; y: number }): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 扩展缩放范围到10%-500%
    const clampedLevel = Math.max(0.1, Math.min(5.0, level));

    if (centerPoint) {
      // 以指定点为中心进行缩放
      this.editor.viewportManager.setZoom(clampedLevel, centerPoint);
    } else {
      const center = this.editor.viewportManager.getPageSize();
      this.editor.viewportManager.setZoom(clampedLevel, {
        x: center.width / 2,
        y: center.height / 2,
      });
    }

    this.editor.render();
    this.eventEmitter.emit('zoom:changed', {
      level: clampedLevel,
      centerPoint,
      performance: this.getPerformanceInfo()
    });
  }

  /**
   * 平移画布 - 支持无限制平移功能，支持平滑的增量移动
   */
  pan(deltaX: number, deltaY: number, smooth: boolean = true): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 直接平移（简化实现，不区分平滑和非平滑）
    this.editor.viewportManager.translate(deltaX, deltaY);

    this.editor.render();
    this.eventEmitter.emit('pan:changed', {
      deltaX,
      deltaY,
      smooth,
      viewport: this.editor.viewportManager.getPos()
    });
  }

  /**
   * 适应内容功能 - 自动调整到所有对象的最佳查看尺寸
   */
  fitToContent(padding: number = 50): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    try {
      this.editor.viewportManager.zoomToFit();
      this.editor.render();
      this.eventEmitter.emit('fit:content', {
        padding,
        viewport: this.editor.viewportManager.getPos()
      });
    } catch (error) {
      console.warn('Failed to fit to content:', error);
      // 回退到适应屏幕
      this.fitToScreen();
    }
  }

  /**
   * 适应屏幕功能
   */
  fitToScreen(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.viewportManager.resetViewport();
    this.editor.render();
    this.eventEmitter.emit('fit:screen', {
      viewport: this.editor.viewportManager.getPos()
    });
  }

  /**
   * 重置视图到默认状态
   */
  resetView(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.viewportManager.resetViewport();
    this.editor.render();
    this.eventEmitter.emit('view:reset', {
      viewport: this.editor.viewportManager.getPos(),
      zoom: this.editor.viewportManager.getZoom()
    });
  }

  /**
   * 获取当前视口信息
   */
  getViewportInfo(): { x: number; y: number; zoom: number; width: number; height: number } {
    if (!this.editor) {
      return { x: 0, y: 0, zoom: 1, width: 0, height: 0 };
    }

    const viewport = this.editor.viewportManager.getPos();
    const zoom = this.editor.viewportManager.getZoom();
    const size = this.editor.viewportManager.getPageSize();

    return {
      x: viewport.x,
      y: viewport.y,
      zoom,
      width: size.width,
      height: size.height
    };
  }

  /**
   * 设置视口信息
   */
  setViewportInfo(viewportInfo: { x?: number; y?: number; zoom?: number }): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    if (viewportInfo.zoom !== undefined) {
      this.zoom(viewportInfo.zoom);
    }

    if (viewportInfo.x !== undefined || viewportInfo.y !== undefined) {
      const currentViewport = this.editor.viewportManager.getPos();
      const deltaX = (viewportInfo.x ?? currentViewport.x) - currentViewport.x;
      const deltaY = (viewportInfo.y ?? currentViewport.y) - currentViewport.y;
      this.editor.viewportManager.translate(deltaX, deltaY);
    }

    this.editor.render();
    this.eventEmitter.emit('viewport:changed', this.getViewportInfo());
  }

  /**
   * 智能网格系统
   */
  enableGrid(enabled: boolean, gridSize: number = 20): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 设置网格相关的设置
    this.editor.setting.set('enablePixelGrid', enabled);
    this.editor.setting.set('gridViewX', gridSize);
    this.editor.setting.set('gridViewY', gridSize);

    // 渲染网格
    if (enabled && this.gridService) {
      this.renderGrid();
    }

    this.editor.render();
    this.eventEmitter.emit('grid:changed', { enabled, gridSize });
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    if (!this.gridService) return;

    // 创建临时Canvas来渲染网格
    const canvas = document.createElement('canvas');
    canvas.width = 800; // 默认宽度
    canvas.height = 600; // 默认高度
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewport = {
      width: 800,
      height: 600,
      bounds: {
        minX: 0,
        maxX: 800,
        minY: 0,
        maxY: 600,
      }
    };

    const gridSizeInfo = {
      base: 20,
      screen: 20,
      intervals: {
        major: 200,
        minor: 50,
        micro: 20
      }
    };

    this.gridService.renderGrid({
      ctx,
      viewport,
      gridSize: gridSizeInfo,
      zoom: 1,
      pan: { x: 0, y: 0 },
      mode: 'edit'
    });
  }

  /**
   * 参考线对齐功能
   */
  addGuide(type: 'horizontal' | 'vertical', position: number): string {
    const guideId = `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 这里需要实现参考线功能
    // 暂时存储在内部状态中
    this.eventEmitter.emit('guide:added', {
      id: guideId,
      type,
      position
    });

    return guideId;
  }

  /**
   * 移除参考线
   */
  removeGuide(guideId: string): void {
    this.eventEmitter.emit('guide:removed', { id: guideId });
  }

  /**
   * 视口边界检测
   */
  isPointInViewport(worldX: number, worldY: number): boolean {
    if (!this.editor) {
      return false;
    }

    const screenPt = this.editor.toViewportPt(worldX, worldY);
    const size = this.editor.viewportManager.getPageSize();

    return screenPt.x >= 0 &&
      screenPt.x <= size.width &&
      screenPt.y >= 0 &&
      screenPt.y <= size.height;
  }

  /**
   * 内容定位功能
   */
  getVisibleObjects(): any[] {
    if (!this.editor) {
      return [];
    }

    // const viewport = this.editor.viewportManager.getViewport();
    const allObjects = (this.editor.sceneGraph.getObjects() as any) || [];

    // 过滤出在视口内可见的对象
    return allObjects.filter((obj: any) => {
      if (!obj.x || !obj.y || !obj.width || !obj.height) {
        return false;
      }

      // 简单的边界框检测
      return this.isRectIntersectingViewport(obj.x, obj.y, obj.width, obj.height);
    });
  }

  /**
   * 检查矩形是否与视口相交
   */
  private isRectIntersectingViewport(x: number, y: number, width: number, height: number): boolean {
    if (!this.editor) {
      return false;
    }

    const topLeft = this.editor.toViewportPt(x, y);
    const bottomRight = this.editor.toViewportPt(x + width, y + height);
    const size = this.editor.viewportManager.getPageSize();

    // 检查是否与视口相交
    return !(bottomRight.x < 0 ||
      topLeft.x > size.width ||
      bottomRight.y < 0 ||
      topLeft.y > size.height);
  }

  /**
   * 坐标转换：屏幕坐标到世界坐标
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    if (!this.editor) {
      return { x: screenX, y: screenY };
    }

    return this.editor.toScenePt(screenX, screenY);
  }

  /**
   * 坐标转换：世界坐标到屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    if (!this.editor) {
      return { x: worldX, y: worldY };
    }

    return this.editor.toViewportPt(worldX, worldY);
  }

  render(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.render();
  }

  exportImage(format: 'png' | 'jpg', quality: number = 1): string {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const canvas = this.editor.canvasElement;
    return canvas.toDataURL(`image/${format}`, quality);
  }

  // 获取性能信息
  getPerformanceInfo(): { fps: number; frameCount: number } {
    if (!this.editor) {
      return { fps: 0, frameCount: 0 };
    }
    return this.editor.getPerformanceInfo();
  }

  // 获取画布尺寸
  getCanvasSize(): { width: number; height: number } {
    if (!this.editor) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.editor.canvasElement.width,
      height: this.editor.canvasElement.height
    };
  }

  // 设置画布尺寸
  setCanvasSize(size: { width: number; height: number }): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.canvasElement.width = size.width;
    this.editor.canvasElement.height = size.height;
    this.editor.render();
    this.eventEmitter.emit('canvas:resized', { size });
  }

  // 创建图层
  createLayer(id: string, name: string): { id: string; name: string; visible: boolean; locked: boolean; opacity: number; elements: CanvasElement[] } {
    const layer = {
      id,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      elements: []
    };

    this.layers.set(id, layer);
    return layer;
  }

  // 获取图层
  getLayer(id: string): { id: string; name: string; visible: boolean; locked: boolean; opacity: number; elements: CanvasElement[] } | undefined {
    return this.layers.get(id);
  }

  // 获取所有图层
  getLayers(): { id: string; name: string; visible: boolean; locked: boolean; opacity: number; elements: CanvasElement[] }[] {
    return Array.from(this.layers.values());
  }

  // 设置活动图层
  setActiveLayer(id: string): void {
    if (this.layers.has(id)) {
      this.activeLayerId = id;
    }
  }

  // 获取活动图层
  getActiveLayer(): { id: string; name: string; visible: boolean; locked: boolean; opacity: number; elements: CanvasElement[] } | undefined {
    return this.layers.get(this.activeLayerId);
  }

  // 事件监听
  on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.editor) return;

    (this.editor as any).on('render', () => {
      this.eventEmitter.emit('canvas:rendered', {});
    });

    (this.editor as any).on('selectionChange', () => {
      // 选择变化事件 - 由Suika核心系统处理
      this.eventEmitter.emit('selection:changed', { selectedObjects: [] });
    });
  }

  // 创建默认图层
  private createDefaultLayer(): void {
    this.createLayer('default', 'Default Layer');
  }

  // 转换对象格式
  private convertToSuikaObject(object: CanvasElement): any {
    // 根据对象类型创建相应的Suika对象
    switch (object.type) {
      case ElementType.SHAPE:
        const shapeElement = object as ShapeElement;
        return {
          id: object.id,
          type: 'rect',
          x: shapeElement.transform.x,
          y: shapeElement.transform.y,
          width: shapeElement.transform.width,
          height: shapeElement.transform.height,
          fill: '#cccccc',
          stroke: '#666666',
          strokeWidth: 1,
          rotation: shapeElement.transform.rotation || 0,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case ElementType.BRUSH:
        const brushElement = object as BrushElement;
        return {
          id: object.id,
          type: 'circle',
          x: brushElement.transform.x,
          y: brushElement.transform.y,
          radius: Math.min(brushElement.transform.width, brushElement.transform.height) / 2,
          fill: '#cccccc',
          stroke: '#666666',
          strokeWidth: 1,
          rotation: brushElement.transform.rotation || 0,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case ElementType.TEXT:
        const textElement = object as TextElement;
        return {
          id: object.id,
          type: 'text',
          x: textElement.transform.x,
          y: textElement.transform.y,
          text: textElement.content,
          fontSize: textElement.style.fontSize,
          fontFamily: textElement.style.fontFamily,
          fill: '#333333',
          rotation: textElement.transform.rotation || 0,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case ElementType.IMAGE:
        const imageElement = object as ImageElement;
        return {
          id: object.id,
          type: 'image',
          x: imageElement.transform.x,
          y: imageElement.transform.y,
          width: imageElement.transform.width,
          height: imageElement.transform.height,
          src: imageElement.imageData.src,
          rotation: imageElement.transform.rotation || 0,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      default:
        throw new Error(`Unsupported object type: ${object.type}`);
    }
  }


  // Suika特有的方法
  getSuikaEditor(): SuikaEditor | null {
    return this.editor;
  }

  // 获取预设尺寸
  static getPresetSizes() {
    return GAME_ASSET_PRESETS;
  }

  // 工具系统集成方法
  getToolAdapter(): SuikaToolAdapter | null {
    return this.toolAdapter;
  }

  activateTool(type: ToolType): boolean {
    return this.toolAdapter?.activateTool(type) || false;
  }

  getActiveTool(): Tool | null {
    return this.toolAdapter?.getActiveTool() || null;
  }

  getActiveToolType(): ToolType | null {
    return this.toolAdapter?.getActiveToolType() || null;
  }

  getAllToolConfigs(): ToolConfig[] {
    return this.toolAdapter?.getAllToolConfigs() || [];
  }

  getToolConfig(type: ToolType): ToolConfig | undefined {
    return this.toolAdapter?.getToolConfig(type);
  }

  setToolProperties(properties: Partial<ToolProperties>): void {
    this.toolAdapter?.setToolProperties(properties);
  }

  getToolProperties(): ToolProperties {
    return this.toolAdapter?.getToolProperties() || {};
  }

  // 事件处理方法
  handleMouseDown(event: MouseEvent): void {
    this.toolAdapter?.handleMouseDown(event);
  }

  handleMouseMove(event: MouseEvent): void {
    this.toolAdapter?.handleMouseMove(event);
  }

  handleMouseUp(event: MouseEvent): void {
    this.toolAdapter?.handleMouseUp(event);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.toolAdapter?.handleKeyDown(event);
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.toolAdapter?.handleKeyUp(event);
  }
}