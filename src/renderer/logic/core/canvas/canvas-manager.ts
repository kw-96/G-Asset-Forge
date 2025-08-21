/**
 * 画布管理器 - 负责画布的创建、初始化、切换和事件处理
 * @description 管理画布引擎、工具系统、状态同步等核心功能
 * @author 开发团队
 */

import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type {
  CanvasConfig,
  CanvasState,
  CanvasElement
} from '../../../../interfaces/types/canvas';
// import { EventEmitter } from '../../utils/EventEmitter.ts';
// import { HistoryManager } from '../../managers/history/history-manager.ts';
import { ToolManager } from '../../engines/suika/core/tools/tool_manager';
// 暂时移除工具类型导入，因为路径不存在
// import type { ITool, ToolType, IToolConfig, IToolProperties } from '../tools/tool-types';
import { SuikaCanvasEngine } from '../../engines/suika/suika-canvas-engine';

// 定义画布引擎接口
export interface CanvasEngine { 
  type: CanvasEngineType;
  initialize(container: HTMLElement, config: CanvasConfig): Promise<void>;
  destroy(): void;
  getState(): CanvasState;
  setState(state: Partial<CanvasState>): void;
  addObject(object: CanvasElement): void;
  removeObject(id: string): void;
  updateObject(id: string, updates: Partial<CanvasElement>): void;
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

export interface CanvasManagerEvents {
  engineSwitched: { type: CanvasEngineType };
  stateChanged: CanvasState;
  objectAdded: CanvasElement;
  objectRemoved: string;
  objectUpdated: { id: string; updates: Partial<CanvasElement> };
  selectionChanged: string[];
  zoomChanged: number;
  panChanged: { x: number; y: number };
  renderComplete: void;
}

export class CanvasManager extends TypedEventEmitter<CanvasManagerEvents> {
  private engine: CanvasEngine | null = null;
  private toolManager: ToolManager | null = null;
  // TODO: 实现历史管理功能
  // private historyManager: HistoryManager;
  // TODO: 实现事件发射器功能  
  // private eventEmitter = new EventEmitter();

  constructor() {
    super();
    // ToolManager需要在有editor实例时才能创建
    // this.toolManager = new ToolManager();
    // TODO: 实现历史管理功能
    // this.historyManager = new HistoryManager();
  }

  async initialize(container: HTMLElement, config: CanvasConfig): Promise<void> {
    // 创建画布引擎
    this.engine = new SuikaCanvasEngine();
    await this.engine.initialize(container, config);

    // 创建工具管理器（需要editor实例）
    if (this.engine instanceof SuikaCanvasEngine) {
      const editor = (this.engine as any).editor;
      if (editor) {
        this.toolManager = new ToolManager(editor);
      }
    }

    // 设置事件监听
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.engine && 'on' in this.engine) {
      (this.engine as any).on('stateChanged', (state: CanvasState) => this.emit('stateChanged', state));
      (this.engine as any).on('objectAdded', (object: CanvasElement) => this.emit('objectAdded', object));
      (this.engine as any).on('objectRemoved', (id: string) => this.emit('objectRemoved', id));
      (this.engine as any).on('objectUpdated', (id: string, updates: Partial<CanvasElement>) =>
        this.emit('objectUpdated', { id, updates }));
      (this.engine as any).on('selectionChanged', (ids: string[]) => this.emit('selectionChanged', ids));
      (this.engine as any).on('zoomChanged', (level: number) => this.emit('zoomChanged', level));
      (this.engine as any).on('panChanged', (x: number, y: number) => this.emit('panChanged', { x, y }));
      (this.engine as any).on('renderComplete', () => this.emit('renderComplete', undefined));
    }
  }

  async switchEngine(engineType: CanvasEngineType, container: HTMLElement, config: CanvasConfig): Promise<void> {
    // 销毁当前引擎
    if (this.engine) {
      this.engine.destroy();
    }

    // 创建新引擎
    let engine: CanvasEngine;
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

  getCurrentEngine(): CanvasEngine | null {
    return this.engine;
  }

  getEngineType(): CanvasEngineType | null {
    return this.engine?.type || null;
  }

  // 代理方法到当前引擎
  getState(): CanvasState | null {
    return this.engine?.getState() || null;
  }

  setState(state: Partial<CanvasState>): void {
    this.engine?.setState(state);
  }

  addObject(object: CanvasElement): void {
    this.engine?.addObject(object);
  }

  removeObject(id: string): void {
    this.engine?.removeObject(id);
  }

  updateObject(id: string, updates: Partial<CanvasElement>): void {
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
  activateTool(_type: string): boolean {
    if (!this.toolManager) return false;
    // 暂时简化实现，等待工具系统完善
    return true;
  }

  getActiveTool(): any | null {
    return this.toolManager?.getActiveToolName() || null;
  }

  getActiveToolType(): string | null {
    // 暂时返回null，等待工具系统完善
    return null;
  }

  getAllToolConfigs(): any[] {
    // 暂时返回空数组，等待工具系统完善
    return [];
  }

  getToolConfig(_type: string): any | undefined {
    // 暂时返回undefined，等待工具系统完善
    return undefined;
  }

  setToolProperties(_properties: any): void {
    // 暂时空实现，等待工具系统完善
  }

  getToolProperties(): any {
    // 暂时返回空对象，等待工具系统完善
    return {};
  }

  // 事件处理方法
  handleMouseDown(_event: MouseEvent): void {
    // ToolManager已经通过事件系统处理鼠标事件，这里不需要额外处理
    // 如果需要处理，应该通过editor的事件系统
  }

  handleMouseMove(_event: MouseEvent): void {
    // ToolManager已经通过事件系统处理鼠标事件，这里不需要额外处理
    // 如果需要处理，应该通过editor的事件系统
  }

  handleMouseUp(_event: MouseEvent): void {
    // ToolManager已经通过事件系统处理鼠标事件，这里不需要额外处理
    // 如果需要处理，应该通过editor的事件系统
  }

  handleKeyDown(_event: KeyboardEvent): void {
    // ToolManager可能没有键盘事件处理，暂时空实现
  }

  handleKeyUp(_event: KeyboardEvent): void {
    // ToolManager可能没有键盘事件处理，暂时空实现
  }

  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
    // 注意：ToolManager和HistoryManager没有destroy方法，需要检查
  }
}