/**
 * H5Editor引擎适配器 - 将H5Editor引擎适配到统一接口
 * @description 提供H5Editor引擎与标准引擎接口之间的适配层
 * @author 开发团队
 */

import type { 
  CanvasEngine, 
  EngineAdapter,
  EngineType, 
  EngineStatus, 
  EngineConfig,
  EnginePerformanceStats,
  EngineEvent,
  EngineEventListener,
  ViewportTransform,
  RenderOptions,
  ExportOptions
} from '../core/EngineInterface';
import { type CanvasElement } from '../../../../interfaces/types/canvas';
// 网格系统现在由Suika核心直接管理

/**
 * H5Editor引擎适配器类
 * @description 将H5Editor引擎适配到标准引擎接口
 */
export class H5EditorEngineAdapter implements CanvasEngine, EngineAdapter {
  // 基础属性
  public readonly type: EngineType = 'h5-editor';
  public readonly version: string = '1.0.0';
  public readonly engineType: EngineType = 'h5-editor';
  
  // 状态管理
  private _status: EngineStatus = 'uninitialized';
  private _config: EngineConfig;
  private _isInitialized: boolean = false;
  
  // 引擎实例和容器
  private h5EditorEngine: any = null;
  
  // 数据管理
  private elements: Map<string, CanvasElement> = new Map();
  private selectedElements: Set<string> = new Set();
  private eventListeners: Map<EngineEvent, Set<EngineEventListener>> = new Map();
  
  // 性能监控
  private performanceStats: EnginePerformanceStats;
  private performanceTimer: NodeJS.Timeout | null = null;
  
  // 工具和状态
  private activeTool: string | null = null;
  private viewport: ViewportTransform;
  
  // 统一网格服务
  private gridService: any = null;

  constructor() {
    // 默认配置
    this._config = {
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
      enableGPUAcceleration: false, // H5Editor主要使用Canvas2D
      maxTextureSize: 2048,
      targetFPS: 30, // H5Editor通常不需要高帧率
      enableGrid: true,
      enableRulers: true,
      enableSnapping: true,
      enableDebugMode: false,
      showPerformanceStats: false,
    };

    // 默认视口
    this.viewport = {
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
    };

    // 默认性能统计
    this.performanceStats = {
      fps: 30,
      frameTime: 33.33,
      memoryUsage: 0,
      drawCalls: 0,
      triangleCount: 0,
      textureCount: 0,
      lastUpdateTime: Date.now(),
    };
    
    // 网格系统现在由Suika核心直接管理
    console.log('网格系统已由Suika核心接管');
  }

  // 基础属性访问器
  public get status(): EngineStatus {
    return this._status;
  }

  public get config(): EngineConfig {
    return { ...this._config };
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  // 生命周期方法
  public async initializeEngine(config: Partial<EngineConfig>): Promise<void> {
    if (this._isInitialized) {
      console.warn('[h5editor-adapter] 引擎已经初始化');
      return;
    }

    try {
      this._status = 'initializing';
      
      // 合并配置
      this._config = { ...this._config, ...config };
      
      console.info('[h5editor-adapter] 开始初始化H5Editor引擎');

      // 初始化H5Editor引擎
      await this.initializeH5EditorEngine();

      this._isInitialized = true;
      this._status = 'ready';
      
      // 启动性能监控
      if (this._config.showPerformanceStats) {
        this.enablePerformanceMonitoring(true);
      }

      this.emit('initialized');
      this.emit('ready');

      console.info('[h5editor-adapter] H5Editor引擎初始化完成');

    } catch (error) {
      this._status = 'error';
      console.error('[h5editor-adapter] H5Editor引擎初始化失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      console.info('[h5editor-adapter] 销毁H5Editor引擎');

      this._status = 'destroyed';
      
      // 停止性能监控
      this.enablePerformanceMonitoring(false);
      
      // 清理资源
      this.elements.clear();
      this.selectedElements.clear();
      this.eventListeners.clear();
      
      // 销毁H5Editor引擎实例
      if (this.h5EditorEngine && this.h5EditorEngine.destroy) {
        await this.h5EditorEngine.destroy();
      }
      
      this.h5EditorEngine = null;
      this._isInitialized = false;

      this.emit('destroyed');

      console.info('[h5editor-adapter] H5Editor引擎销毁完成');

    } catch (error) {
      console.error('[h5editor-adapter] H5Editor引擎销毁失败:', error);
      throw error;
    }
  }

  // 配置管理
  public updateConfig(updates: Partial<EngineConfig>): void {
    this._config = { ...this._config, ...updates };
    
    // 应用配置更改到H5Editor引擎
    if (this.h5EditorEngine) {
      this.applyH5EditorConfig(updates);
    }
    
    console.debug('[h5editor-adapter] 更新引擎配置', { updatedKeys: Object.keys(updates) });
  }

  public getConfig(): EngineConfig {
    return { ...this._config };
  }

  // 元素管理 - H5Editor特化实现
  public async addElement(element: CanvasElement): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      // 适配元素到H5Editor格式
      const h5EditorElement = this.adaptElement(element);
      
      // 添加到H5Editor引擎
      if (this.h5EditorEngine && this.h5EditorEngine.addComponent) {
        await this.h5EditorEngine.addComponent(h5EditorElement);
      }
      
      // 存储元素
      this.elements.set(element.id, element);
      
      this.emit('element-added', element);
      this.requestRender();

      console.debug(`[h5editor-adapter] 添加元素: ${element.name}`, { id: element.id });

    } catch (error) {
      console.error(`[h5editor-adapter] 添加元素失败: ${element.id}`, error);
      throw error;
    }
  }

  public async updateElement(id: string, updates: Partial<CanvasElement>): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    const element = this.elements.get(id);
    if (!element) {
      throw new Error(`元素不存在: ${id}`);
    }

    try {
      // 类型安全的更新
      const updatedElement = { ...element, ...updates } as CanvasElement;
      
      // 适配更新到H5Editor格式
      const h5EditorUpdates = this.adaptElement(updatedElement);
      
      // 更新H5Editor引擎中的元素
      if (this.h5EditorEngine && this.h5EditorEngine.updateComponent) {
        await this.h5EditorEngine.updateComponent(id, h5EditorUpdates);
      }
      
      // 更新存储的元素
      this.elements.set(id, updatedElement);
      
      this.emit('element-updated', { id, updates, element: updatedElement });
      this.requestRender();

      console.debug(`[h5editor-adapter] 更新元素: ${id}`, { updatedKeys: Object.keys(updates) });

    } catch (error) {
      console.error(`[h5editor-adapter] 更新元素失败: ${id}`, error);
      throw error;
    }
  }

  public async removeElement(id: string): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    const element = this.elements.get(id);
    if (!element) {
      console.warn(`[h5editor-adapter] 尝试删除不存在的元素: ${id}`);
      return;
    }

    try {
      // 从H5Editor引擎中删除
      if (this.h5EditorEngine && this.h5EditorEngine.removeComponent) {
        await this.h5EditorEngine.removeComponent(id);
      }
      
      // 从存储中删除
      this.elements.delete(id);
      this.selectedElements.delete(id);
      
      this.emit('element-removed', { id, element });
      this.requestRender();

      console.debug(`[h5editor-adapter] 删除元素: ${element.name}`, { id });

    } catch (error) {
      console.error(`[h5editor-adapter] 删除元素失败: ${id}`, error);
      throw error;
    }
  }

  public getElement(id: string): CanvasElement | null {
    return this.elements.get(id) || null;
  }

  public getAllElements(): CanvasElement[] {
    return Array.from(this.elements.values());
  }

  // 选择管理
  public selectElements(elementIds: string[]): void {
    const validIds = elementIds.filter(id => this.elements.has(id));
    
    this.selectedElements.clear();
    validIds.forEach(id => this.selectedElements.add(id));
    
    // 更新H5Editor引擎的选择
    if (this.h5EditorEngine && this.h5EditorEngine.selectComponents) {
      this.h5EditorEngine.selectComponents(validIds);
    }
    
    this.emit('selection-changed', validIds);
    
    console.debug('[h5editor-adapter] 选择元素', { count: validIds.length });
  }

  public getSelectedElements(): string[] {
    return Array.from(this.selectedElements);
  }

  public clearSelection(): void {
    this.selectedElements.clear();
    
    if (this.h5EditorEngine && this.h5EditorEngine.clearSelection) {
      this.h5EditorEngine.clearSelection();
    }
    
    this.emit('selection-changed', []);
    
    console.debug('[h5editor-adapter] 清除选择');
  }

  // 视口控制
  public setViewport(transform: ViewportTransform): void {
    this.viewport = { ...transform };
    
    if (this.h5EditorEngine && this.h5EditorEngine.setViewport) {
      this.h5EditorEngine.setViewport(transform);
    }
    
    this.emit('viewport-changed', transform);
    this.requestRender();
    
    console.debug('[h5editor-adapter] 设置视口', transform);
  }

  public getViewport(): ViewportTransform {
    return { ...this.viewport };
  }

  public zoomToFit(elementIds?: string[]): void {
    // H5Editor的缩放到适合实现
    const targetElements = elementIds 
      ? elementIds.map(id => this.elements.get(id)).filter(Boolean) as CanvasElement[]
      : this.getAllElements();

    if (targetElements.length === 0) {
      return;
    }

    // 计算边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    targetElements.forEach(element => {
      const transform = this.getElementTransform(element);
      minX = Math.min(minX, transform.x);
      minY = Math.min(minY, transform.y);
      maxX = Math.max(maxX, transform.x + transform.width);
      maxY = Math.max(maxY, transform.y + transform.height);
    });

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // H5Editor适合的缩放计算
    const padding = 100; // H5Editor通常需要更多边距
    const scaleX = (this._config.width - padding * 2) / bounds.width;
    const scaleY = (this._config.height - padding * 2) / bounds.height;
    const zoom = Math.min(scaleX, scaleY, 1.5); // H5Editor限制最大缩放

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const panX = this._config.width / 2 - centerX * zoom;
    const panY = this._config.height / 2 - centerY * zoom;

    this.setViewport({ zoom, panX, panY });
    
    console.debug('[h5editor-adapter] 缩放到适合', { elementCount: targetElements.length, zoom });
  }

  public resetView(): void {
    this.setViewport({ zoom: 1, panX: 0, panY: 0 });
    console.debug('[h5editor-adapter] 重置视图');
  }

  // 渲染控制 - H5Editor特化
  public async render(options?: Partial<RenderOptions>): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      this._status = 'rendering';
      
      const renderOptions = {
        quality: 'medium' as const, // H5Editor默认中等质量
        antialiasing: false, // H5Editor通常不需要抗锯齿
        shadows: false,
        effects: false,
        ...options,
      };

      // 调用H5Editor引擎渲染
      if (this.h5EditorEngine && this.h5EditorEngine.render) {
        await this.h5EditorEngine.render(renderOptions);
      }

      this._status = 'ready';
      this.emit('render-complete');

    } catch (error) {
      this._status = 'error';
      console.error('[h5editor-adapter] 渲染失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public requestRender(): void {
    // H5Editor使用较低频率的渲染更新
    setTimeout(() => {
      this.render().catch(error => {
        console.error('[h5editor-adapter] 请求渲染失败:', error);
      });
    }, 50); // 20fps更新频率
  }

  public setRenderQuality(quality: RenderOptions['quality']): void {
    console.debug(`[h5editor-adapter] 设置渲染质量: ${quality}`);
  }

  // 导出功能 - H5Editor的强项
  public async exportToImage(options: ExportOptions): Promise<Blob> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      console.info(`[h5editor-adapter] 导出图片: ${options.format}`);

      // H5Editor的专业导出功能
      if (this.h5EditorEngine && this.h5EditorEngine.exportToImage) {
        return await this.h5EditorEngine.exportToImage(options);
      }

      // 回退到基础实现
      const canvas = document.createElement('canvas');
      canvas.width = this._config.width * (options.scale || 1);
      canvas.height = this._config.height * (options.scale || 1);
      
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = options.backgroundColor || this._config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 渲染所有元素（避免直接迭代 Map 迭代器以兼容较低 target）
      for (const element of Array.from(this.elements.values())) {
        await this.renderElementToCanvas(ctx, element, options.scale || 1);
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${options.format}`, options.quality / 100);
      });

    } catch (error) {
      console.error('[h5editor-adapter] 导出图片失败:', error);
      throw error;
    }
  }

  public async exportToSVG(options?: Partial<ExportOptions>): Promise<string> {
    console.info('[h5editor-adapter] 导出SVG');
    
    // H5Editor的SVG导出
    if (this.h5EditorEngine && this.h5EditorEngine.exportToSVG) {
      return await this.h5EditorEngine.exportToSVG(options);
    }

    // 基础SVG导出实现
    const elements = this.getAllElements();
    const svgElements = elements.map(element => this.adaptElement(element)).join('\n');
    
    const svg = `
      <svg width="${this._config.width}" height="${this._config.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${this._config.backgroundColor}"/>
        ${svgElements}
      </svg>
    `;
    
    return svg.trim();
  }

  public async exportToPDF(options?: Partial<ExportOptions>): Promise<Blob> {
    console.info('[h5editor-adapter] 导出PDF');
    
    // H5Editor的PDF导出功能
    if (this.h5EditorEngine && this.h5EditorEngine.exportToPDF) {
      return await this.h5EditorEngine.exportToPDF(options);
    }

    throw new Error('PDF导出功能需要H5Editor引擎支持');
  }

  // 其他接口方法的简化实现
  public addEventListener(event: EngineEvent, listener: EngineEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  public removeEventListener(event: EngineEvent, listener: EngineEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  public getPerformanceStats(): EnginePerformanceStats {
    return { ...this.performanceStats };
  }

  public enablePerformanceMonitoring(enabled: boolean): void {
    if (enabled && !this.performanceTimer) {
      this.performanceTimer = setInterval(() => {
        this.updatePerformanceStats();
      }, 2000); // H5Editor使用较低频率的性能监控
      console.debug('[h5editor-adapter] 启用性能监控');
    } else if (!enabled && this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
      console.debug('[h5editor-adapter] 禁用性能监控');
    }
  }

  // 简化的其他方法实现
  public setActiveTool(toolType: string): void { this.activeTool = toolType; }
  public getActiveTool(): string | null { return this.activeTool; }
  public setGridVisible(visible: boolean): void { 
    this._config.enableGrid = visible; 
    
    // 渲染网格
    if (visible && this.gridService) {
      this.renderGrid();
    }
    
    this.requestRender(); 
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    if (!this.gridService) return;

    // 创建临时Canvas来渲染网格
    const canvas = document.createElement('canvas');
    canvas.width = this._config.width;
    canvas.height = this._config.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewport = {
      width: this._config.width,
      height: this._config.height,
      bounds: {
        minX: 0,
        maxX: this._config.width,
        minY: 0,
        maxY: this._config.height,
      }
    };

    const gridSize = {
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
      gridSize,
      zoom: this.viewport.zoom,
      pan: { x: this.viewport.panX, y: this.viewport.panY },
      mode: 'edit'
    });
  }
  public setRulersVisible(visible: boolean): void { this._config.enableRulers = visible; this.requestRender(); }
  public setSnapToGrid(enabled: boolean): void { this._config.enableSnapping = enabled; }
  public setBackgroundColor(color: string): void { this._config.backgroundColor = color; this.requestRender(); }
  public setBackgroundImage(_imageUrl: string): void { this.requestRender(); }
  public setElementOrder(_elementIds: string[]): void { this.requestRender(); }
  public bringToFront(_elementId: string): void { this.requestRender(); }
  public sendToBack(_elementId: string): void { this.requestRender(); }
  public undo(): boolean { return false; }
  public redo(): boolean { return false; }
  public canUndo(): boolean { return false; }
  public canRedo(): boolean { return false; }

  public async copy(elementIds: string[]): Promise<void> {
    const elements = elementIds.map(id => this.elements.get(id)).filter(Boolean);
    if (elements.length > 0) {
      const data = JSON.stringify(elements);
      await navigator.clipboard.writeText(data);
    }
  }

  public async paste(): Promise<string[]> {
    try {
      const data = await navigator.clipboard.readText();
      const elements = JSON.parse(data) as CanvasElement[];
      const newIds: string[] = [];

      for (const element of elements) {
        const newId = `${element.id}_copy_${Date.now()}`;
        const transform = this.getElementTransform(element);
        const newElement = { 
          ...element, 
          id: newId, 
          transform: { ...transform, x: transform.x + 20, y: transform.y + 20 }
        };
        await this.addElement(newElement);
        newIds.push(newId);
      }

      return newIds;
    } catch (error) {
      return [];
    }
  }

  public async cut(elementIds: string[]): Promise<void> {
    await this.copy(elementIds);
    for (const id of elementIds) {
      await this.removeElement(id);
    }
  }

  public findElements(predicate: (element: CanvasElement) => boolean): CanvasElement[] {
    return this.getAllElements().filter(predicate);
  }

  public getElementsInBounds(bounds: { x: number; y: number; width: number; height: number }): CanvasElement[] {
    return this.findElements(element => {
      const transform = this.getElementTransform(element);
      return transform.x < bounds.x + bounds.width &&
             transform.x + transform.width > bounds.x &&
             transform.y < bounds.y + bounds.height &&
             transform.y + transform.height > bounds.y;
    });
  }

  public measureText(text: string, style: any): { width: number; height: number } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
    const metrics = ctx.measureText(text);
    return { width: metrics.width, height: style.fontSize || 16 };
  }

  public getElementBounds(elementId: string): { x: number; y: number; width: number; height: number } | null {
    const element = this.elements.get(elementId);
    if (!element) return null;
    const transform = this.getElementTransform(element);
    return { 
      x: transform.x, 
      y: transform.y, 
      width: transform.width, 
      height: transform.height 
    };
  }

  public hitTest(x: number, y: number): string | null {
    const elements = this.getAllElements().reverse();
    for (const element of elements) {
      const transform = this.getElementTransform(element);
      if (x >= transform.x && x <= transform.x + transform.width &&
          y >= transform.y && y <= transform.y + transform.height) {
        return element.id;
      }
    }
    return null;
  }

  public intersectionTest(bounds: { x: number; y: number; width: number; height: number }): string[] {
    return this.getElementsInBounds(bounds).map(element => element.id);
  }

  public enableDebugMode(enabled: boolean): void {
    this._config.enableDebugMode = enabled;
  }

  public getDebugInfo(): any {
    return {
      type: this.type,
      version: this.version,
      status: this.status,
      config: this.config,
      elementCount: this.elements.size,
      selectedCount: this.selectedElements.size,
      performanceStats: this.performanceStats,
      viewport: this.viewport,
      activeTool: this.activeTool,
    };
  }

  public getCapabilities(): string[] {
    return [
      'layout-engine',
      'professional-export',
      'template-system',
      'component-library',
      'responsive-design',
      'css-styling',
      'html-export',
      'pdf-export',
      'print-optimization',
      'text-rendering',
      'image-processing',
      'layers',
      'selection',
      'transformation',
      'export-png',
      'export-jpg',
      'export-svg',
      'export-pdf',
    ];
  }

  public supportsFeature(feature: string): boolean {
    return this.getCapabilities().includes(feature);
  }

  public async preloadAssets(urls: string[]): Promise<void> {
    // H5Editor的资源预加载
    console.debug(`[h5editor-adapter] 预加载资源: ${urls.length} 个`);
  }

  public clearAssetCache(): void {
    console.debug('[h5editor-adapter] 清除资源缓存');
  }

  public serialize(): any {
    return {
      type: this.type,
      version: this.version,
      config: this.config,
      elements: Array.from(this.elements.values()),
      selectedElements: Array.from(this.selectedElements),
      viewport: this.viewport,
      activeTool: this.activeTool,
    };
  }

  public async deserialize(data: any): Promise<void> {
    if (data.type !== this.type) {
      throw new Error(`数据类型不匹配: 期望 ${this.type}, 实际 ${data.type}`);
    }

    this.elements.clear();
    this.selectedElements.clear();

    if (data.config) this.updateConfig(data.config);
    if (data.elements) {
      for (const element of data.elements) {
        await this.addElement(element);
      }
    }
    if (data.selectedElements) this.selectElements(data.selectedElements);
    if (data.viewport) this.setViewport(data.viewport);
    if (data.activeTool) this.setActiveTool(data.activeTool);
  }

  // IEngineAdapter 接口实现
  public async initialize(engine: any): Promise<void> {
    this.h5EditorEngine = engine;
  }

  public adaptElement(element: CanvasElement): any {
    // 将标准元素格式适配为H5Editor格式
    const transform = this.getElementTransform(element);
    return {
      id: element.id,
      type: this.mapElementType(element.type),
      name: element.name,
      style: {
        position: 'absolute',
        left: `${transform.x}px`,
        top: `${transform.y}px`,
        width: `${transform.width}px`,
        height: `${transform.height}px`,
        backgroundColor: element.fill?.color || '#ffffff',
        border: element.stroke ? `${element.stroke.width}px solid ${element.stroke.color}` : 'none',
        opacity: element.opacity,
        visibility: element.visible ? 'visible' : 'hidden',
        borderRadius: '0',
      },
      // H5Editor特定属性
      h5EditorSpecific: {
        locked: element.locked,
        zIndex: 1,
      },
    };
  }

  public adaptConfig(config: Partial<EngineConfig>): any {
    return {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      enableGrid: config.enableGrid,
      enableRulers: config.enableRulers,
      enableSnapping: config.enableSnapping,
    };
  }

  public adaptEvent(event: any): { type: EngineEvent; data?: any } {
    const eventMap: Record<string, EngineEvent> = {
      'h5editor:initialized': 'initialized',
      'h5editor:ready': 'ready',
      'h5editor:component-added': 'element-added',
      'h5editor:component-updated': 'element-updated',
      'h5editor:component-removed': 'element-removed',
      'h5editor:selection-changed': 'selection-changed',
      'h5editor:viewport-changed': 'viewport-changed',
      'h5editor:render-complete': 'render-complete',
      'h5editor:error': 'error',
    };

    return {
      type: eventMap[event.type] || 'error',
      data: event.data,
    };
  }

  public optimizeForEngine(elements: CanvasElement[]): CanvasElement[] {
    // 为H5Editor引擎优化元素
    return elements.map(element => ({
      ...element,
      // H5Editor优化：确保元素适合CSS布局
      transform: {
        x: Math.round(element.transform.x),
        y: Math.round(element.transform.y),
        width: Math.round(element.transform.width),
        height: Math.round(element.transform.height),
        rotation: element.transform.rotation || 0,
      },
    })) as CanvasElement[];
  }

  public getBestPractices(): string[] {
    return [
      '使用整数像素值以获得清晰的渲染效果',
      '合理使用CSS样式以提高导出质量',
      '避免过度复杂的嵌套结构',
      '使用模板系统提高工作效率',
      '定期保存项目以防止数据丢失',
    ];
  }

  // 私有辅助方法
  private getElementTransform(element: CanvasElement) {
    return element.transform || { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
  }

  private async initializeH5EditorEngine(): Promise<void> {
    // 初始化H5Editor引擎实例
    this.h5EditorEngine = {
      initialized: true,
      // 模拟的H5Editor引擎接口
    };
  }

  private applyH5EditorConfig(config: Partial<EngineConfig>): void {
    if (this.h5EditorEngine && this.h5EditorEngine.updateConfig) {
      const h5EditorConfig = this.adaptConfig(config);
      this.h5EditorEngine.updateConfig(h5EditorConfig);
    }
  }

  private updatePerformanceStats(): void {
    this.performanceStats = {
      fps: 30, // H5Editor通常30fps
      frameTime: 33.33,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      drawCalls: this.elements.size,
      triangleCount: 0, // H5Editor不使用三角形
      textureCount: this.elements.size,
      lastUpdateTime: Date.now(),
    };

    this.emit('performance-update', this.performanceStats);
  }

  private emit(event: EngineEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[h5editor-adapter] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }

  private mapElementType(type: string): string {
    // 将标准元素类型映射为H5Editor类型
    const typeMap: Record<string, string> = {
      'rectangle': 'div',
      'circle': 'div',
      'text': 'text',
      'image': 'img',
    };
    return typeMap[type] || 'div';
  }

  private async renderElementToCanvas(ctx: CanvasRenderingContext2D, element: CanvasElement, scale: number): Promise<void> {
    const transform = this.getElementTransform(element);
    const x = transform.x * scale;
    const y = transform.y * scale;
    const width = transform.width * scale;
    const height = transform.height * scale;

    ctx.save();
    ctx.globalAlpha = element.opacity;

    if (element.fill) {
      ctx.fillStyle = element.fill.color as string || '#ffffff';
      ctx.fillRect(x, y, width, height);
    }

    if (element.stroke && element.stroke.width) {
      ctx.strokeStyle = element.stroke.color as string || '#000000';
      ctx.lineWidth = element.stroke.width * scale;
      ctx.strokeRect(x, y, width, height);
    }

    ctx.restore();
  }

}