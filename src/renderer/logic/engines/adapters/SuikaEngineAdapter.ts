/**
 * Suika引擎适配器 - 将Suika引擎适配到统一接口
 * @description 提供Suika引擎与标准引擎接口之间的适配层
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
import type { CanvasElement } from '../../../../interfaces/types/canvas';
// 网格系统现在由Suika核心直接管理

/**
 * Suika引擎适配器类
 * @description 将Suika引擎适配到标准引擎接口
 */
export class SuikaEngineAdapter implements CanvasEngine, EngineAdapter {
  // 基础属性
  public readonly type: EngineType = 'suika';
  public readonly version: string = '1.0.0';
  public readonly engineType: EngineType = 'suika';

  // 状态管理
  private _status: EngineStatus = 'uninitialized';
  private _config: EngineConfig;
  private _isInitialized: boolean = false;

  // 引擎实例和容器
  private suikaEngine: any = null;

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
      enableGPUAcceleration: true,
      maxTextureSize: 4096,
      targetFPS: 60,
      enableGrid: true,
      enableRulers: true,
      enableSnapping: false,
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
      fps: 60,
      frameTime: 16.67,
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
      console.warn('[suika-adapter] 引擎已经初始化');
      return;
    }

    try {
      this._status = 'initializing';

      // 合并配置
      this._config = { ...this._config, ...config };

      console.info('[suika-adapter] 开始初始化Suika引擎');

      // 这里应该初始化实际的Suika引擎
      // 现在使用模拟实现
      await this.initializeSuikaEngine();

      this._isInitialized = true;
      this._status = 'ready';

      // 启动性能监控
      if (this._config.showPerformanceStats) {
        this.enablePerformanceMonitoring(true);
      }

      this.emit('initialized');
      this.emit('ready');

      console.info('[suika-adapter] Suika引擎初始化完成');

    } catch (error) {
      this._status = 'error';
      console.error('[suika-adapter] Suika引擎初始化失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      console.info('[suika-adapter] 销毁Suika引擎');

      this._status = 'destroyed';

      // 停止性能监控
      this.enablePerformanceMonitoring(false);

      // 清理资源
      this.elements.clear();
      this.selectedElements.clear();
      this.eventListeners.clear();

      // 销毁Suika引擎实例
      if (this.suikaEngine && this.suikaEngine.destroy) {
        await this.suikaEngine.destroy();
      }

      this.suikaEngine = null;
      this._isInitialized = false;

      this.emit('destroyed');

      console.info('[suika-adapter] Suika引擎销毁完成');

    } catch (error) {
      console.error('[suika-adapter] Suika引擎销毁失败:', error);
      throw error;
    }
  }

  // 配置管理
  public updateConfig(updates: Partial<EngineConfig>): void {
    this._config = { ...this._config, ...updates };

    // 应用配置更改到Suika引擎
    if (this.suikaEngine) {
      this.applySuikaConfig(updates);
    }

    console.debug('[suika-adapter] 更新引擎配置', { updatedKeys: Object.keys(updates) });
  }

  public getConfig(): EngineConfig {
    return { ...this._config };
  }

  // 元素管理
  public async addElement(element: CanvasElement): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      // 适配元素到Suika格式
      const suikaElement = this.adaptElement(element);

      // 添加到Suika引擎
      if (this.suikaEngine && this.suikaEngine.addElement) {
        await this.suikaEngine.addElement(suikaElement);
      }

      // 存储元素
      this.elements.set(element.id, element);

      this.emit('element-added', element);
      this.requestRender();

      console.debug(`[suika-adapter] 添加元素: ${element.name}`, { id: element.id });

    } catch (error) {
      console.error(`[suika-adapter] 添加元素失败: ${element.id}`, error);
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
      const updatedElement = { ...element, ...updates };

      // 适配更新到Suika格式
      const suikaUpdates = this.adaptElement(updatedElement as CanvasElement);

      // 更新Suika引擎中的元素
      if (this.suikaEngine && this.suikaEngine.updateElement) {
        await this.suikaEngine.updateElement(id, suikaUpdates);
      }

      // 更新存储的元素
      this.elements.set(id, updatedElement as CanvasElement);

      this.emit('element-updated', { id, updates, element: updatedElement });
      this.requestRender();

      console.debug(`[suika-adapter] 更新元素: ${id}`, { updatedKeys: Object.keys(updates) });

    } catch (error) {
      console.error(`[suika-adapter] 更新元素失败: ${id}`, error);
      throw error;
    }
  }

  public async removeElement(id: string): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    const element = this.elements.get(id);
    if (!element) {
      console.warn(`[suika-adapter] 尝试删除不存在的元素: ${id}`);
      return;
    }

    try {
      // 从Suika引擎中删除
      if (this.suikaEngine && this.suikaEngine.removeElement) {
        await this.suikaEngine.removeElement(id);
      }

      // 从存储中删除
      this.elements.delete(id);
      this.selectedElements.delete(id);

      this.emit('element-removed', { id, element });
      this.requestRender();

      console.debug(`[suika-adapter] 删除元素: ${element.name}`, { id });

    } catch (error) {
      console.error(`[suika-adapter] 删除元素失败: ${id}`, error);
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

    // 更新Suika引擎的选择
    if (this.suikaEngine && this.suikaEngine.selectElements) {
      this.suikaEngine.selectElements(validIds);
    }

    this.emit('selection-changed', validIds);

    console.debug('[suika-adapter] 选择元素', { count: validIds.length });
  }

  public getSelectedElements(): string[] {
    return Array.from(this.selectedElements);
  }

  public clearSelection(): void {
    this.selectedElements.clear();

    if (this.suikaEngine && this.suikaEngine.clearSelection) {
      this.suikaEngine.clearSelection();
    }

    this.emit('selection-changed', []);

    console.debug('[suika-adapter] 清除选择');
  }

  // 视口控制
  public setViewport(transform: ViewportTransform): void {
    this.viewport = { ...transform };

    if (this.suikaEngine && this.suikaEngine.setViewport) {
      this.suikaEngine.setViewport(transform);
    }

    this.emit('viewport-changed', transform);
    this.requestRender();

    console.debug('[suika-adapter] 设置视口', transform);
  }

  public getViewport(): ViewportTransform {
    return { ...this.viewport };
  }

  public zoomToFit(elementIds?: string[]): void {
    const targetElements = elementIds
      ? elementIds.map(id => this.elements.get(id)).filter(Boolean) as CanvasElement[]
      : this.getAllElements();

    if (targetElements.length === 0) {
      return;
    }

    // 计算边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    targetElements.forEach(element => {
      minX = Math.min(minX, element.transform.x);
      minY = Math.min(minY, element.transform.y);
      maxX = Math.max(maxX, element.transform.x + element.transform.width);
      maxY = Math.max(maxY, element.transform.y + element.transform.height);
    });

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // 计算适合的缩放和平移
    const padding = 50;
    const scaleX = (this._config.width - padding * 2) / bounds.width;
    const scaleY = (this._config.height - padding * 2) / bounds.height;
    const zoom = Math.min(scaleX, scaleY, 2); // 限制最大缩放

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const panX = this._config.width / 2 - centerX * zoom;
    const panY = this._config.height / 2 - centerY * zoom;

    this.setViewport({ zoom, panX, panY });

    console.debug('[suika-adapter] 缩放到适合', { elementCount: targetElements.length, zoom });
  }

  public resetView(): void {
    this.setViewport({ zoom: 1, panX: 0, panY: 0 });
    console.debug('[suika-adapter] 重置视图');
  }

  // 渲染控制
  public async render(options?: Partial<RenderOptions>): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      this._status = 'rendering';

      const renderOptions = {
        quality: 'high' as const,
        antialiasing: true,
        shadows: false,
        effects: true,
        ...options,
      };

      // 调用Suika引擎渲染
      if (this.suikaEngine && this.suikaEngine.render) {
        await this.suikaEngine.render(renderOptions);
      }

      this._status = 'ready';
      this.emit('render-complete');

    } catch (error) {
      this._status = 'error';
      console.error('[suika-adapter] 渲染失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public requestRender(): void {
    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
      this.render().catch(error => {
        console.error('[suika-adapter] 请求渲染失败:', error);
      });
    });
  }

  public setRenderQuality(quality: RenderOptions['quality']): void {
    // 更新渲染质量设置
    console.debug(`[suika-adapter] 设置渲染质量: ${quality}`);
  }

  // 导出功能
  public async exportToImage(options: ExportOptions): Promise<Blob> {
    if (!this._isInitialized) {
      throw new Error('引擎未初始化');
    }

    try {
      console.info(`[suika-adapter] 导出图片: ${options.format}`);

      // 模拟导出过程
      const canvas = document.createElement('canvas');
      canvas.width = this._config.width * (options.scale || 1);
      canvas.height = this._config.height * (options.scale || 1);

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = options.backgroundColor || this._config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${options.format}`, options.quality / 100);
      });

    } catch (error) {
      console.error('[suika-adapter] 导出图片失败:', error);
      throw error;
    }
  }

  public async exportToSVG(_options?: Partial<ExportOptions>): Promise<string> {
    console.info('[suika-adapter] 导出SVG');

    // 模拟SVG导出
    const svg = `
      <svg width="${this._config.width}" height="${this._config.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${this._config.backgroundColor}"/>
        <!-- 这里应该包含实际的元素 -->
      </svg>
    `;

    return svg.trim();
  }

  public async exportToPDF(_options?: Partial<ExportOptions>): Promise<Blob> {
    console.info('[suika-adapter] 导出PDF');

    // PDF导出需要额外的库支持
    throw new Error('PDF导出功能尚未实现');
  }  // 事件系统

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

  // 性能监控
  public getPerformanceStats(): EnginePerformanceStats {
    return { ...this.performanceStats };
  }

  public enablePerformanceMonitoring(enabled: boolean): void {
    if (enabled && !this.performanceTimer) {
      this.performanceTimer = setInterval(() => {
        this.updatePerformanceStats();
      }, 1000);
      console.debug('[suika-adapter] 启用性能监控');
    } else if (!enabled && this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
      console.debug('[suika-adapter] 禁用性能监控');
    }
  }

  // 工具集成
  public setActiveTool(toolType: string): void {
    this.activeTool = toolType;

    if (this.suikaEngine && this.suikaEngine.setActiveTool) {
      this.suikaEngine.setActiveTool(toolType);
    }

    console.debug(`[suika-adapter] 设置活动工具: ${toolType}`);
  }

  public getActiveTool(): string | null {
    return this.activeTool;
  }

  // 网格和标尺
  public setGridVisible(visible: boolean): void {
    this._config.enableGrid = visible;

    if (this.suikaEngine && this.suikaEngine.setGridVisible) {
      this.suikaEngine.setGridVisible(visible);
    }

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

  public setRulersVisible(visible: boolean): void {
    this._config.enableRulers = visible;

    if (this.suikaEngine && this.suikaEngine.setRulersVisible) {
      this.suikaEngine.setRulersVisible(visible);
    }

    this.requestRender();
  }

  public setSnapToGrid(enabled: boolean): void {
    this._config.enableSnapping = enabled;

    if (this.suikaEngine && this.suikaEngine.setSnapToGrid) {
      this.suikaEngine.setSnapToGrid(enabled);
    }
  }

  // 背景设置
  public setBackgroundColor(color: string): void {
    this._config.backgroundColor = color;

    if (this.suikaEngine && this.suikaEngine.setBackgroundColor) {
      this.suikaEngine.setBackgroundColor(color);
    }

    this.requestRender();
  }

  public setBackgroundImage(imageUrl: string): void {
    if (this.suikaEngine && this.suikaEngine.setBackgroundImage) {
      this.suikaEngine.setBackgroundImage(imageUrl);
    }

    this.requestRender();
  }

  // 图层管理
  public setElementOrder(elementIds: string[]): void {
    if (this.suikaEngine && this.suikaEngine.setElementOrder) {
      this.suikaEngine.setElementOrder(elementIds);
    }

    this.requestRender();
  }

  public bringToFront(elementId: string): void {
    if (this.suikaEngine && this.suikaEngine.bringToFront) {
      this.suikaEngine.bringToFront(elementId);
    }

    this.requestRender();
  }

  public sendToBack(elementId: string): void {
    if (this.suikaEngine && this.suikaEngine.sendToBack) {
      this.suikaEngine.sendToBack(elementId);
    }

    this.requestRender();
  }

  // 历史记录
  public undo(): boolean {
    if (this.suikaEngine && this.suikaEngine.undo) {
      const result = this.suikaEngine.undo();
      if (result) {
        this.requestRender();
      }
      return result;
    }
    return false;
  }

  public redo(): boolean {
    if (this.suikaEngine && this.suikaEngine.redo) {
      const result = this.suikaEngine.redo();
      if (result) {
        this.requestRender();
      }
      return result;
    }
    return false;
  }

  public canUndo(): boolean {
    return this.suikaEngine?.canUndo?.() || false;
  }

  public canRedo(): boolean {
    return this.suikaEngine?.canRedo?.() || false;
  }

  // 剪贴板
  public async copy(elementIds: string[]): Promise<void> {
    const elements = elementIds.map(id => this.elements.get(id)).filter(Boolean);

    if (elements.length > 0) {
      // 将元素数据复制到剪贴板
      const data = JSON.stringify(elements);
      await navigator.clipboard.writeText(data);
      console.debug(`[suika-adapter] 复制元素: ${elements.length} 个`);
    }
  }

  public async paste(): Promise<string[]> {
    try {
      const data = await navigator.clipboard.readText();
      const elements = JSON.parse(data) as CanvasElement[];
      const newIds: string[] = [];

      for (const element of elements) {
        const newId = `${element.id}_copy_${Date.now()}`;
        const newElement = {
          ...element,
          id: newId,
          transform: {
            x: element.transform.x + 20,
            y: element.transform.y + 20,
            width: element.transform.width,
            height: element.transform.height,
          },
        };

        await this.addElement(newElement);
        newIds.push(newId);
      }

      console.debug(`[suika-adapter] 粘贴元素: ${newIds.length} 个`);
      return newIds;

    } catch (error) {
      console.error('[suika-adapter] 粘贴失败:', error);
      return [];
    }
  }

  public async cut(elementIds: string[]): Promise<void> {
    await this.copy(elementIds);

    for (const id of elementIds) {
      await this.removeElement(id);
    }

    console.debug(`[suika-adapter] 剪切元素: ${elementIds.length} 个`);
  }

  // 查找和过滤
  public findElements(predicate: (element: CanvasElement) => boolean): CanvasElement[] {
    return this.getAllElements().filter(predicate);
  }

  public getElementsInBounds(bounds: { x: number; y: number; width: number; height: number }): CanvasElement[] {
    return this.findElements(element => {
      return element.transform.x < bounds.x + bounds.width &&
        element.transform.x + element.transform.width > bounds.x &&
        element.transform.y < bounds.y + bounds.height &&
        element.transform.y + element.transform.height > bounds.y;
    });
  }

  // 测量和计算
  public measureText(text: string, style: any): { width: number; height: number } {
    // 创建临时canvas来测量文本
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
    const metrics = ctx.measureText(text);

    return {
      width: metrics.width,
      height: style.fontSize || 16,
    };
  }

  public getElementBounds(elementId: string): { x: number; y: number; width: number; height: number } | null {
    const element = this.elements.get(elementId);

    if (!element) {
      return null;
    }

    return {
      x: element.transform.x,
      y: element.transform.y,
      width: element.transform.width,
      height: element.transform.height,
    };
  }

  // 碰撞检测
  public hitTest(x: number, y: number): string | null {
    // 从上到下检测元素
    const elements = this.getAllElements().reverse();

    for (const element of elements) {
      if (x >= element.transform.x && x <= element.transform.x + element.transform.width &&
        y >= element.transform.y && y <= element.transform.y + element.transform.height) {
        return element.id;
      }
    }

    return null;
  }

  public intersectionTest(bounds: { x: number; y: number; width: number; height: number }): string[] {
    return this.getElementsInBounds(bounds).map(element => element.id);
  }

  // 调试功能
  public enableDebugMode(enabled: boolean): void {
    this._config.enableDebugMode = enabled;

    if (this.suikaEngine && this.suikaEngine.enableDebugMode) {
      this.suikaEngine.enableDebugMode(enabled);
    }

    console.debug(`[suika-adapter] 调试模式: ${enabled ? '启用' : '禁用'}`);
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

  // 扩展接口
  public getCapabilities(): string[] {
    return [
      'high-performance',
      'webgl-rendering',
      'gpu-acceleration',
      'vector-graphics',
      'text-rendering',
      'image-processing',
      'animation',
      'layers',
      'selection',
      'transformation',
      'export-png',
      'export-jpg',
      'export-svg',
      'undo-redo',
      'clipboard',
      'hit-testing',
      'performance-monitoring',
    ];
  }

  public supportsFeature(feature: string): boolean {
    return this.getCapabilities().includes(feature);
  }

  // 资源管理
  public async preloadAssets(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    });

    try {
      await Promise.all(promises);
      console.debug(`[suika-adapter] 预加载资源完成: ${urls.length} 个`);
    } catch (error) {
      console.warn('[suika-adapter] 部分资源预加载失败:', error);
    }
  }

  public clearAssetCache(): void {
    // 清除资源缓存
    console.debug('[suika-adapter] 清除资源缓存');
  }

  // 状态序列化
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

    // 清除现有数据
    this.elements.clear();
    this.selectedElements.clear();

    // 恢复配置
    if (data.config) {
      this.updateConfig(data.config);
    }

    // 恢复元素
    if (data.elements) {
      for (const element of data.elements) {
        await this.addElement(element);
      }
    }

    // 恢复选择
    if (data.selectedElements) {
      this.selectElements(data.selectedElements);
    }

    // 恢复视口
    if (data.viewport) {
      this.setViewport(data.viewport);
    }

    // 恢复工具
    if (data.activeTool) {
      this.setActiveTool(data.activeTool);
    }

    console.info('[suika-adapter] 状态反序列化完成');
  }

  // IEngineAdapter 接口实现
  public async initialize(engine: any): Promise<void> {
    this.suikaEngine = engine;
    console.debug('[suika-adapter] 适配器初始化完成');
  }

  public adaptElement(element: CanvasElement): any {
    // 将标准元素格式适配为Suika格式
    return {
      id: element.id,
      type: element.type,
      name: element.name,
      x: element.transform.x,
      y: element.transform.y,
      width: element.transform.width,
      height: element.transform.height,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.stroke?.width || 0,
      opacity: element.opacity,
      visible: element.visible,
      locked: element.locked,
      // Suika特定属性
      suikaSpecific: {
        borderRadius: '0',
        // 其他Suika特定属性
      },
    };
  }

  public adaptConfig(config: Partial<EngineConfig>): any {
    // 将标准配置适配为Suika配置
    return {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      enableGPU: config.enableGPUAcceleration,
      // 其他Suika特定配置
    };
  }

  public adaptEvent(event: any): { type: EngineEvent; data?: any } {
    // 将Suika事件适配为标准事件
    const eventMap: Record<string, EngineEvent> = {
      'suika:initialized': 'initialized',
      'suika:ready': 'ready',
      'suika:element-added': 'element-added',
      'suika:element-updated': 'element-updated',
      'suika:element-removed': 'element-removed',
      'suika:selection-changed': 'selection-changed',
      'suika:viewport-changed': 'viewport-changed',
      'suika:render-complete': 'render-complete',
      'suika:error': 'error',
    };

    return {
      type: eventMap[event.type] || 'error',
      data: event.data,
    };
  }

  public optimizeForEngine(elements: CanvasElement[]): CanvasElement[] {
    // 为Suika引擎优化元素
    return elements.map(element => ({
      ...element,
      // Suika优化
    }));
  }

  public getBestPractices(): string[] {
    return [
      '使用GPU加速以获得最佳性能',
      '避免频繁的小幅更新，批量处理变更',
      '合理使用图层以减少重绘',
      '启用性能监控以识别瓶颈',
      '预加载常用资源以减少延迟',
    ];
  }

  // 私有方法
  private async initializeSuikaEngine(): Promise<void> {
    // 这里应该初始化实际的Suika引擎
    // 现在使用模拟实现
    this.suikaEngine = {
      // 模拟的Suika引擎接口
      initialized: true,
    };

    console.debug('[suika-adapter] Suika引擎实例创建完成');
  }

  private applySuikaConfig(config: Partial<EngineConfig>): void {
    // 将配置应用到Suika引擎
    if (this.suikaEngine && this.suikaEngine.updateConfig) {
      const suikaConfig = this.adaptConfig(config);
      this.suikaEngine.updateConfig(suikaConfig);
    }
  }

  private updatePerformanceStats(): void {
    // 更新性能统计
    this.performanceStats = {
      fps: 60, // 从实际引擎获取
      frameTime: 16.67,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      drawCalls: this.elements.size,
      triangleCount: this.elements.size * 2, // 估算
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
          console.error(`[suika-adapter] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }
}