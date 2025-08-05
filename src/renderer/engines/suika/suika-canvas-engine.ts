// Suika画布引擎适配器
import { SuikaEditor } from './core/editor';
import { SuikaToolAdapter } from './adapter/tool-adapter';
import type { ICanvasEngine } from '../../core/canvas/canvas-manager';
import type { 
  ICanvasConfig, 
  ICanvasState, 
  ICanvasObject,
  ICanvasLayer,
  ICanvasSize
} from '../../core/canvas/canvas-types';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';
import { EventEmitter } from '../../utils/EventEmitter';
import type { ITool, ToolType, IToolConfig, IToolProperties } from '../../core/tools/tool-types';

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

export interface ISuikaCanvasEngineOptions {
  showPerfMonitor?: boolean;
  userPreference?: Record<string, any>;
  enableGrid?: boolean;
  enableRuler?: boolean;
  backgroundColor?: string;
}

export class SuikaCanvasEngine implements ICanvasEngine {
  public readonly type = CanvasEngineType.SUIKA;
  private editor: SuikaEditor | null = null;
  private container: HTMLElement | null = null;
  private options: ISuikaCanvasEngineOptions;
  private eventEmitter = new EventEmitter();
  private isInitialized = false;
  private layers: Map<string, ICanvasLayer> = new Map();
  private activeLayerId = 'default';
  
  // 工具适配器
  private toolAdapter: SuikaToolAdapter | null = null;

  constructor(options: ISuikaCanvasEngineOptions = {}) {
    this.options = {
      showPerfMonitor: process.env['NODE_ENV'] === 'development',
      enableGrid: true,
      enableRuler: true,
      backgroundColor: '#ffffff',
      ...options
    };
    
    // 创建默认图层
    this.createDefaultLayer();
  }

  async initialize(container: HTMLElement, config: ICanvasConfig): Promise<void> {
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
        width: config.size.width,
        height: config.size.height,
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

  getState(): ICanvasState {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const editorState = this.editor.getState();
    const zoom = editorState.zoom;
    const viewport = editorState.viewport;
    
    return {
      layers: Array.from(this.layers.values()),
      selectedObjects: editorState.selectedObjects.map((obj: any) => obj.id),
      activeLayer: this.activeLayerId,
      zoom,
      pan: { x: viewport.x, y: viewport.y }
    };
  }

  setState(state: Partial<ICanvasState>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const editorState: any = {};
    
    if (state.zoom !== undefined) {
      editorState.zoom = state.zoom;
    }

    if (state.pan !== undefined) {
      const currentViewport = this.editor.viewportManager.getViewport();
      editorState.viewport = {
        ...currentViewport,
        x: state.pan.x,
        y: state.pan.y
      };
    }

    if (state.activeLayer !== undefined) {
      this.activeLayerId = state.activeLayer;
    }

    this.editor.setState(editorState);
  }

  addObject(object: ICanvasObject): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 将统一对象格式转换为Suika对象
    const suikaObject = this.convertToSuikaObject(object);
    this.editor.sceneGraph.addObject(suikaObject);
    
    // 添加到当前活动图层
    const activeLayer = this.layers.get(this.activeLayerId);
    if (activeLayer) {
      activeLayer.objects.push(object);
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
      layer.objects = layer.objects.filter(obj => obj.id !== id);
    }
    
    this.editor.render();
    this.eventEmitter.emit('object:removed', { id });
  }

  updateObject(id: string, updates: Partial<ICanvasObject>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    const object = this.editor.sceneGraph.getObject(id);
    if (object) {
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

    this.editor.toolManager.selectObjects(ids);
    this.editor.render();
    this.eventEmitter.emit('selection:created', { ids });
  }

  clearSelection(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.toolManager.clearSelection();
    this.editor.render();
    this.eventEmitter.emit('selection:cleared', {});
  }

  zoom(level: number): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 限制缩放范围在50%-200%
    const clampedLevel = Math.max(0.5, Math.min(2.0, level));
    this.editor.zoomManager.setZoom(clampedLevel);
    this.editor.render();
    this.eventEmitter.emit('zoom:changed', { level: clampedLevel });
  }

  pan(x: number, y: number): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.viewportManager.pan(x, y);
    this.editor.render();
    this.eventEmitter.emit('pan:changed', { x, y });
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
  getCanvasSize(): ICanvasSize {
    if (!this.editor) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.editor.canvasElement.width,
      height: this.editor.canvasElement.height
    };
  }

  // 设置画布尺寸
  setCanvasSize(size: ICanvasSize): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }
    
    this.editor.canvasElement.width = size.width;
    this.editor.canvasElement.height = size.height;
    this.editor.render();
    this.eventEmitter.emit('canvas:resized', { size });
  }

  // 创建图层
  createLayer(id: string, name: string): ICanvasLayer {
    const layer: ICanvasLayer = {
      id,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      objects: []
    };
    
    this.layers.set(id, layer);
    return layer;
  }

  // 获取图层
  getLayer(id: string): ICanvasLayer | undefined {
    return this.layers.get(id);
  }

  // 获取所有图层
  getLayers(): ICanvasLayer[] {
    return Array.from(this.layers.values());
  }

  // 设置活动图层
  setActiveLayer(id: string): void {
    if (this.layers.has(id)) {
      this.activeLayerId = id;
    }
  }

  // 获取活动图层
  getActiveLayer(): ICanvasLayer | undefined {
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

    this.editor.on('render', () => {
      this.eventEmitter.emit('canvas:rendered', {});
    });

    this.editor.on('selectionChange', () => {
      const selectedObjects = this.editor!.toolManager.getSelectedObjects();
      this.eventEmitter.emit('selection:changed', { selectedObjects });
    });
  }

  // 创建默认图层
  private createDefaultLayer(): void {
    this.createLayer('default', 'Default Layer');
  }

  // 转换对象格式
  private convertToSuikaObject(object: ICanvasObject): any {
    // 根据对象类型创建相应的Suika对象
    switch (object.type) {
      case 'rectangle':
        return {
          id: object.id,
          type: 'rect',
          x: object.position.x,
          y: object.position.y,
          width: object.size.width,
          height: object.size.height,
          fill: '#cccccc',
          stroke: '#666666',
          strokeWidth: 1,
          rotation: object.rotation,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case 'circle':
        return {
          id: object.id,
          type: 'circle',
          x: object.position.x,
          y: object.position.y,
          radius: Math.min(object.size.width, object.size.height) / 2,
          fill: '#cccccc',
          stroke: '#666666',
          strokeWidth: 1,
          rotation: object.rotation,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case 'text':
        return {
          id: object.id,
          type: 'text',
          x: object.position.x,
          y: object.position.y,
          text: 'Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#333333',
          rotation: object.rotation,
          opacity: object.opacity,
          visible: object.visible,
          locked: object.locked
        };
      case 'image':
        return {
          id: object.id,
          type: 'image',
          x: object.position.x,
          y: object.position.y,
          width: object.size.width,
          height: object.size.height,
          src: '',
          rotation: object.rotation,
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

  getActiveTool(): ITool | null {
    return this.toolAdapter?.getActiveTool() || null;
  }

  getActiveToolType(): ToolType | null {
    return this.toolAdapter?.getActiveToolType() || null;
  }

  getAllToolConfigs(): IToolConfig[] {
    return this.toolAdapter?.getAllToolConfigs() || [];
  }

  getToolConfig(type: ToolType): IToolConfig | undefined {
    return this.toolAdapter?.getToolConfig(type);
  }

  setToolProperties(properties: Partial<IToolProperties>): void {
    this.toolAdapter?.setToolProperties(properties);
  }

  getToolProperties(): IToolProperties {
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