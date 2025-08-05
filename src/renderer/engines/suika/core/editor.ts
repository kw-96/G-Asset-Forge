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
}

export interface ISuikaEditorEvents extends Record<string, (...args: any[]) => void> {
  destroy(): void;
  render(): void;
  selectionChange(): void;
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
  
  constructor(options: ISuikaEditorOptions) {
    this.options = options;
    this.containerElement = options.containerElement;
    this.paperId = genUuid();
    
    // 创建canvas元素
    this.canvasElement = document.createElement('canvas');
    this.containerElement.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;
    
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
    
    // 异步渲染
    Promise.resolve().then(() => {
      this.render();
    });
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
    this.sceneGraph.render();
    this.emitter.emit('render');
  }
  
  // 销毁方法
  destroy(): void {
    if (this.canvasElement && this.containerElement.contains(this.canvasElement)) {
      this.containerElement.removeChild(this.canvasElement);
    }
    this.emitter.emit('destroy');
  }
  
  // 事件管理
  on<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void {
    this.emitter.on(eventName, listener);
  }
  
  off<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void {
    this.emitter.off(eventName, listener);
  }
}