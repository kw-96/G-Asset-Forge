// 画布管理器 - 统一管理不同引擎的画布
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { 
  ICanvasConfig, 
  ICanvasState, 
  ICanvasEvent, 
  CanvasEventType,
  ICanvasObject 
} from './canvas-types';

export enum CanvasEngineType {
  SUIKA = 'suika',
  H5_EDITOR = 'h5-editor',
  FABRIC = 'fabric'
}

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

export interface ICanvasManagerEvents extends Record<string, (...args: any[]) => void> {
  engineSwitched(data: { type: CanvasEngineType }): void;
}

export class CanvasManager extends TypedEventEmitter<ICanvasManagerEvents> {
  private currentEngine: ICanvasEngine | null = null;
  private container: HTMLElement | null = null;
  private config: ICanvasConfig | null = null;

  constructor() {
    super();
  }

  async switchEngine(engineType: CanvasEngineType, container: HTMLElement, config: ICanvasConfig): Promise<void> {
    // 销毁当前引擎
    if (this.currentEngine) {
      this.currentEngine.destroy();
    }

    // 动态加载新引擎
    const engine = await this.loadEngine(engineType);
    
    // 初始化新引擎
    await engine.initialize(container, config);
    
    this.currentEngine = engine;
    this.container = container;
    this.config = config;

    this.emit('engineSwitched', { type: engineType });
  }

  private async loadEngine(type: CanvasEngineType): Promise<ICanvasEngine> {
    switch (type) {
      case CanvasEngineType.SUIKA:
        const { SuikaCanvasEngine } = await import('../../engines/suika/suika-canvas-engine');
        return new SuikaCanvasEngine();
      
      case CanvasEngineType.H5_EDITOR:
        const { H5EditorCanvasEngine } = await import('../../engines/h5-editor/h5-editor-canvas-engine');
        return new H5EditorCanvasEngine();
      
      case CanvasEngineType.FABRIC:
        throw new Error('Fabric.js engine is temporarily disabled');
      
      default:
        throw new Error(`Unsupported canvas engine: ${type}`);
    }
  }

  getCurrentEngine(): ICanvasEngine | null {
    return this.currentEngine;
  }

  getEngineType(): CanvasEngineType | null {
    return this.currentEngine?.type || null;
  }

  // 代理方法到当前引擎
  getState(): ICanvasState | null {
    return this.currentEngine?.getState() || null;
  }

  setState(state: Partial<ICanvasState>): void {
    this.currentEngine?.setState(state);
  }

  addObject(object: ICanvasObject): void {
    this.currentEngine?.addObject(object);
  }

  removeObject(id: string): void {
    this.currentEngine?.removeObject(id);
  }

  updateObject(id: string, updates: Partial<ICanvasObject>): void {
    this.currentEngine?.updateObject(id, updates);
  }

  selectObjects(ids: string[]): void {
    this.currentEngine?.selectObjects(ids);
  }

  clearSelection(): void {
    this.currentEngine?.clearSelection();
  }

  zoom(level: number): void {
    this.currentEngine?.zoom(level);
  }

  pan(x: number, y: number): void {
    this.currentEngine?.pan(x, y);
  }

  render(): void {
    this.currentEngine?.render();
  }

  exportImage(format: 'png' | 'jpg' = 'png', quality: number = 1): string | null {
    return this.currentEngine?.exportImage(format, quality) || null;
  }

  destroy(): void {
    if (this.currentEngine) {
      this.currentEngine.destroy();
      this.currentEngine = null;
    }
    this.container = null;
    this.config = null;
  }
}