// Suika编辑器核心类 - 从temp-suika提取并适配
import { EventEmitter } from '../utils/event-emitter';
import { genUuid } from '../utils/uuid';
import { ViewportManager } from './viewport-manager';
import { ZoomManager } from './zoom-manager';
import { SceneGraph } from './scene-graph';
import { ToolManager } from './tool-manager';
import { CommandManager } from './command-manager';

export interface ISuikaEditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  showPerfMonitor?: boolean;
  userPreference?: Record<string, any>;
}

export interface ISuikaEditorEvents extends Record<string, (...args: any[]) => void> {
  destroy(): void;
  render(): void;
  selectionChange(): void;
  objectAdded(): void;
  objectRemoved(): void;
  objectUpdated(): void;
  zoomChanged(zoom: number): void;
  panChanged(pan: { x: number; y: number }): void;
}

export class SuikaEditor {
  containerElement: HTMLDivElement;
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  private emitter = new EventEmitter<ISuikaEditorEvents>();
  
  // 核心管理器
  viewportManager: ViewportManager;
  zoomManager: ZoomManager;
  sceneGraph: SceneGraph;
  toolManager: ToolManager;
  commandManager: CommandManager;
  
  // 配置
  private options: ISuikaEditorOptions;
  paperId: string;
  
  // 性能监控
  private perfMonitor: any = null;
  private lastRenderTime: number = 0;
  
  constructor(options: ISuikaEditorOptions) {
    this.options = options;
    this.containerElement = options.containerElement;
    this.paperId = genUuid();
    
    // 清理容器元素
    while (this.containerElement.firstChild) {
      this.containerElement.removeChild(this.containerElement.firstChild);
    }
    
    // 创建canvas元素
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.setAttribute('data-suika-canvas', 'true');
    
    // 确保安全地添加到容器
    try {
      this.containerElement.appendChild(this.canvasElement);
    } catch (error) {
      console.error('Failed to append canvas to container:', error);
      throw error;
    }
    
    const context = this.canvasElement.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = context;
    
    // 设置canvas尺寸
    this.resizeCanvas();
    
    // 初始化管理器
    this.viewportManager = new ViewportManager(this);
    this.zoomManager = new ZoomManager(this);
    this.sceneGraph = new SceneGraph(this);
    this.toolManager = new ToolManager(this);
    this.commandManager = new CommandManager(this);
    
    // 设置初始视口
    this.viewportManager.setViewport({
      x: -options.width / 2,
      y: -options.height / 2,
      width: options.width,
      height: options.height,
    });
    
    // 初始化性能监控
    if (options.showPerfMonitor) {
      this.initPerfMonitor();
    }
    
    // 绑定事件
    this.bindEvents();
    
    // 异步渲染
    Promise.resolve().then(() => {
      this.render();
    });
  }
  
  // 调整canvas尺寸
  private resizeCanvas(): void {
    const rect = this.containerElement.getBoundingClientRect();
    this.canvasElement.width = rect.width;
    this.canvasElement.height = rect.height;
  }
  
  // 初始化性能监控
  private initPerfMonitor(): void {
    // 简单的性能监控实现
    this.perfMonitor = {
      startTime: 0,
      frameCount: 0,
      fps: 0
    };
  }
  
  // 存储事件处理函数的引用，用于后续清理
  private boundHandlers: {
    mouseDown: (event: MouseEvent) => void;
    mouseMove: (event: MouseEvent) => void;
    mouseUp: (event: MouseEvent) => void;
    wheel: (event: WheelEvent) => void;
  } | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 绑定事件
  private bindEvents(): void {
    // 存储绑定的事件处理函数
    this.boundHandlers = {
      mouseDown: this.handleMouseDown.bind(this),
      mouseMove: this.handleMouseMove.bind(this),
      mouseUp: this.handleMouseUp.bind(this),
      wheel: this.handleWheel.bind(this)
    };

    // 监听容器大小变化
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.render();
    });
    this.resizeObserver.observe(this.containerElement);
    
    // 监听鼠标事件
    this.canvasElement.addEventListener('mousedown', this.boundHandlers.mouseDown);
    this.canvasElement.addEventListener('mousemove', this.boundHandlers.mouseMove);
    this.canvasElement.addEventListener('mouseup', this.boundHandlers.mouseUp);
    this.canvasElement.addEventListener('wheel', this.boundHandlers.wheel);
  }
  
  // 鼠标事件处理
  private handleMouseDown(event: MouseEvent): void {
    const { x, y } = this.getSceneCursorXY(event);
    this.toolManager.handleMouseDown(x, y, event);
  }
  
  private handleMouseMove(event: MouseEvent): void {
    const { x, y } = this.getSceneCursorXY(event);
    this.toolManager.handleMouseMove(x, y, event);
  }
  
  private handleMouseUp(event: MouseEvent): void {
    const { x, y } = this.getSceneCursorXY(event);
    this.toolManager.handleMouseUp(x, y, event);
  }
  
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const { x, y } = this.getSceneCursorXY(event);
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomManager.zoomAt(x, y, delta);
  }
  
  // 坐标转换方法
  toScenePt(x: number, y: number): { x: number; y: number } {
    const zoom = this.zoomManager.getZoom();
    const viewport = this.viewportManager.getViewport();
    return {
      x: (x - viewport.x) / zoom,
      y: (y - viewport.y) / zoom
    };
  }
  
  toViewportPt(x: number, y: number): { x: number; y: number } {
    const zoom = this.zoomManager.getZoom();
    const viewport = this.viewportManager.getViewport();
    return {
      x: x * zoom + viewport.x,
      y: y * zoom + viewport.y
    };
  }
  
  // 获取鼠标坐标
  getCursorXY(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = this.canvasElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - (this.options.offsetX || 0),
      y: event.clientY - rect.top - (this.options.offsetY || 0)
    };
  }
  
  getSceneCursorXY(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const { x, y } = this.getCursorXY(event);
    return this.toScenePt(x, y);
  }
  
  // 渲染方法
  render(): void {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    
    // 应用视口变换
    const zoom = this.zoomManager.getZoom();
    const viewport = this.viewportManager.getViewport();
    
    this.ctx.save();
    this.ctx.translate(viewport.x, viewport.y);
    this.ctx.scale(zoom, zoom);
    
    // 渲染场景图
    this.sceneGraph.render(this.ctx);
    
    this.ctx.restore();
    
    // 渲染工具
    this.toolManager.render(this.ctx);
    
    // 性能监控
    if (this.perfMonitor) {
      const endTime = performance.now();
      this.perfMonitor.frameCount++;
      this.perfMonitor.fps = 1000 / (endTime - this.lastRenderTime);
      this.lastRenderTime = endTime;
    }
    
    this.emitter.emit('render');
  }
  
  // 获取性能信息
  getPerformanceInfo(): { fps: number; frameCount: number } {
    return {
      fps: this.perfMonitor?.fps || 0,
      frameCount: this.perfMonitor?.frameCount || 0
    };
  }
  
  // 销毁方法
  destroy(): void {
    try {
      // 1. 清理事件监听器
      this.unbindEvents();

      // 2. 清理管理器
      if (this.viewportManager) {
        this.viewportManager = undefined as any;
      }
      if (this.zoomManager) {
        this.zoomManager = undefined as any;
      }
      if (this.sceneGraph) {
        this.sceneGraph = undefined as any;
      }
      if (this.toolManager) {
        this.toolManager = undefined as any;
      }
      if (this.commandManager) {
        this.commandManager = undefined as any;
      }

      // 3. DOM清理 - 多级安全策略
      if (this.canvasElement) {
        try {
          // 第一级：检查父子关系并移除
          const parent = this.canvasElement.parentNode || this.canvasElement.parentElement;
          if (parent) {
            // 验证是否真的是子节点
            const children = Array.from(parent.childNodes);
            if (children.includes(this.canvasElement)) {
              parent.removeChild(this.canvasElement);
            }
          }
        } catch (removeError) {
          try {
            // 第二级：使用remove方法
            if (typeof this.canvasElement.remove === 'function') {
              this.canvasElement.remove();
            }
          } catch (finalError) {
            console.warn('Failed to remove canvas element:', finalError);
            // 第三级：强制清理引用
            if (this.containerElement && this.containerElement.contains(this.canvasElement)) {
              try {
                this.containerElement.innerHTML = '';
              } catch (innerHTMLError) {
                console.warn('Failed to clear container innerHTML:', innerHTMLError);
              }
            }
          }
        }
      }

      // 4. 清理容器内容（安全方式）
      if (this.containerElement) {
        try {
          // 逐个移除子节点
          while (this.containerElement.firstChild) {
            const child = this.containerElement.firstChild;
            if (child.parentNode === this.containerElement) {
              this.containerElement.removeChild(child);
            } else {
              // 如果父子关系不匹配，直接跳出循环避免死循环
              break;
            }
          }
        } catch (clearError) {
          console.warn('Failed to clear container children:', clearError);
          try {
            this.containerElement.innerHTML = '';
          } catch (innerHTMLError) {
            console.warn('Failed to clear container innerHTML:', innerHTMLError);
          }
        }
      }

      // 5. 清理引用
      this.canvasElement = null as any;
      this.ctx = null as any;
      this.containerElement = null as any;

      console.log('SuikaEditor destroyed successfully');
    } catch (error) {
      console.error('Error during SuikaEditor destruction:', error);
    }
  }

  private unbindEvents(): void {
    try {
      // 清理ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // 移除画布事件监听器
      if (this.canvasElement && this.boundHandlers) {
        this.canvasElement.removeEventListener('mousedown', this.boundHandlers.mouseDown);
        this.canvasElement.removeEventListener('mousemove', this.boundHandlers.mouseMove);
        this.canvasElement.removeEventListener('mouseup', this.boundHandlers.mouseUp);
        this.canvasElement.removeEventListener('wheel', this.boundHandlers.wheel);
      }
      
      // 清理绑定的处理器引用
      this.boundHandlers = null;
    } catch (error) {
      console.warn('Error unbinding events:', error);
    }
  }

  
  // 事件管理
  on<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void {
    this.emitter.on(eventName, listener);
  }
  
  off<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void {
    this.emitter.off(eventName, listener);
  }
  
  // 获取编辑器状态
  getState(): any {
    return {
      zoom: this.zoomManager.getZoom(),
      viewport: this.viewportManager.getViewport(),
      selectedObjects: this.toolManager.getSelectedObjects(),
      sceneObjects: this.sceneGraph.getObjects()
    };
  }
  
  // 设置编辑器状态
  setState(state: any): void {
    if (state.zoom !== undefined) {
      this.zoomManager.setZoom(state.zoom);
    }
    
    if (state.viewport !== undefined) {
      this.viewportManager.setViewport(state.viewport);
    }
    
    this.render();
  }
}