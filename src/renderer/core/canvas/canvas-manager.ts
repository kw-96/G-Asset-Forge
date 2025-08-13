// 画布管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { 
  ICanvasConfig, 
  ICanvasState, 
  ICanvasObject 
} from './canvas-types';
// import { EventEmitter } from '../../utils/EventEmitter';
// import { HistoryManager } from '../history/history-manager';
import { ToolManager } from '../tools/tool-manager';
import type { ITool, ToolType, IToolConfig, IToolProperties } from '../tools/tool-types';
import { SuikaCanvasEngine } from '../../engines/suika/suika-canvas-engine';

// 定义画布引擎接口
export interface ICanvasEngine {
  type: CanvasEngineType;
  initialize(container: HTMLElement, config: ICanvasConfig): Promise<void>;
  destroy(): void;
  getState(): ICanvasState;
  setState(state: Partial<ICanvasState>): void;
  addObject(object: ICanvasObject): void;
  removeObject(id: string): void;
  updateObject(id: string, updates: Partial<ICanvasObject>): void;
  selectObjects(ids: string[]): void;
  clearSelection(): void;
  zoom(level: number): void;
  pan(x: number, y: number): void;
  render(): void;
  exportImage(format: 'png' | 'jpg', quality?: number): string;
}

export enum CanvasEngineType {
  FABRIC = 'fabric',
  SUIKA = 'suika',
  H5_EDITOR = 'h5-editor'
}

export interface ICanvasManagerEvents extends Record<string, (...args: any[]) => void> {
  engineSwitched(engine: { type: CanvasEngineType }): void;
  stateChanged(state: ICanvasState): void;
  objectAdded(object: ICanvasObject): void;
  objectRemoved(id: string): void;
  objectUpdated(id: string, updates: Partial<ICanvasObject>): void;
  selectionChanged(ids: string[]): void;
  zoomChanged(level: number): void;
  panChanged(x: number, y: number): void;
  renderComplete(): void;
}

export class CanvasManager extends TypedEventEmitter<ICanvasManagerEvents> {
  private engine: ICanvasEngine | null = null;
  private toolManager: ToolManager;
  // TODO: 实现历史管理功能
  // private historyManager: HistoryManager;
  // TODO: 实现事件发射器功能  
  // private eventEmitter = new EventEmitter();

  constructor() {
    super();
    this.toolManager = new ToolManager();
    // TODO: 实现历史管理功能
    // this.historyManager = new HistoryManager();
  }

  async initialize(container: HTMLElement, config: ICanvasConfig): Promise<void> {
    // 创建画布引擎
    this.engine = new SuikaCanvasEngine();
    await this.engine.initialize(container, config);

    // 设置工具适配器
    if (this.engine instanceof SuikaCanvasEngine) {
      const toolAdapter = this.engine.getToolAdapter();
      if (toolAdapter) {
        this.toolManager.setSuikaToolAdapter(toolAdapter);
      }
    }

    // 设置事件监听
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.engine && 'on' in this.engine) {
      (this.engine as any).on('stateChanged', (state: ICanvasState) => this.emit('stateChanged', state));
      (this.engine as any).on('objectAdded', (object: ICanvasObject) => this.emit('objectAdded', object));
      (this.engine as any).on('objectRemoved', (id: string) => this.emit('objectRemoved', id));
      (this.engine as any).on('objectUpdated', (id: string, updates: Partial<ICanvasObject>) => this.emit('objectUpdated', id, updates));
      (this.engine as any).on('selectionChanged', (ids: string[]) => this.emit('selectionChanged', ids));
      (this.engine as any).on('zoomChanged', (level: number) => this.emit('zoomChanged', level));
      (this.engine as any).on('panChanged', (x: number, y: number) => this.emit('panChanged', x, y));
      (this.engine as any).on('renderComplete', () => this.emit('renderComplete'));
    }
  }

  async switchEngine(engineType: CanvasEngineType, container: HTMLElement, config: ICanvasConfig): Promise<void> {
    // 销毁当前引擎
    if (this.engine) {
      this.engine.destroy();
    }

    // 创建新引擎
    let engine: ICanvasEngine;
    switch (engineType) {
      case CanvasEngineType.SUIKA:
        engine = new SuikaCanvasEngine();
        break;
      default:
        throw new Error(`Unsupported engine type: ${engineType}`);
    }

    await engine.initialize(container, config);
    
    this.engine = engine;
    this.emit('engineSwitched', { type: engineType });
  }

  getCurrentEngine(): ICanvasEngine | null {
    return this.engine;
  }

  getEngineType(): CanvasEngineType | null {
    return this.engine?.type || null;
  }

  // 代理方法到当前引擎
  getState(): ICanvasState | null {
    return this.engine?.getState() || null;
  }

  setState(state: Partial<ICanvasState>): void {
    this.engine?.setState(state);
  }

  addObject(object: ICanvasObject): void {
    this.engine?.addObject(object);
  }

  removeObject(id: string): void {
    this.engine?.removeObject(id);
  }

  updateObject(id: string, updates: Partial<ICanvasObject>): void {
    this.engine?.updateObject(id, updates);
  }

  selectObjects(ids: string[]): void {
    this.engine?.selectObjects(ids);
  }

  clearSelection(): void {
    this.engine?.clearSelection();
  }

  zoom(level: number): void {
    this.engine?.zoom(level);
  }

  pan(x: number, y: number): void {
    this.engine?.pan(x, y);
  }

  render(): void {
    this.engine?.render();
  }

  exportImage(format: 'png' | 'jpg' = 'png', quality: number = 1): string | null {
    return this.engine?.exportImage(format, quality) || null;
  }

  // 工具系统方法
  activateTool(type: ToolType): boolean {
    return this.toolManager.activateTool(type);
  }

  getActiveTool(): ITool | null {
    return this.toolManager.getActiveTool();
  }

  getActiveToolType(): ToolType | null {
    return this.toolManager.getActiveToolType();
  }

  getAllToolConfigs(): IToolConfig[] {
    return this.toolManager.getToolConfigs();
  }

  getToolConfig(type: ToolType): IToolConfig | undefined {
    return this.toolManager.getToolConfigs().find((config: IToolConfig) => config.type === type);
  }

  setToolProperties(properties: Partial<IToolProperties>): void {
    this.toolManager.setProperties(properties);
  }

  getToolProperties(): IToolProperties {
    return this.toolManager.getProperties();
  }

  // 事件处理方法
  handleMouseDown(event: MouseEvent): void {
    this.toolManager.handleMouseDown(event);
  }

  handleMouseMove(event: MouseEvent): void {
    this.toolManager.handleMouseMove(event);
  }

  handleMouseUp(event: MouseEvent): void {
    this.toolManager.handleMouseUp(event);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.toolManager.handleKeyDown(event);
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.toolManager.handleKeyUp(event);
  }

  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
    // 注意：ToolManager和HistoryManager没有destroy方法，需要检查
  }
}