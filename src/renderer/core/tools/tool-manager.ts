// 工具管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ITool, ToolType, IToolConfig, IToolProperties } from './tool-types';

export interface IToolManagerEvents extends Record<string, (...args: any[]) => void> {
  toolChanged(tool: ITool): void;
  propertiesChanged(properties: IToolProperties): void;
}

export class ToolManager extends TypedEventEmitter<IToolManagerEvents> {
  private tools: Map<ToolType, ITool> = new Map();
  private activeTool: ITool | null = null;
  private properties: IToolProperties = {};

  constructor() {
    super();
  }

  registerTool(tool: ITool): void {
    this.tools.set(tool.type, tool);
  }

  unregisterTool(type: ToolType): void {
    const tool = this.tools.get(type);
    if (tool && tool === this.activeTool) {
      this.deactivateTool();
    }
    this.tools.delete(type);
  }

  activateTool(type: ToolType): boolean {
    const tool = this.tools.get(type);
    if (!tool) {
      console.warn(`Tool ${type} not found`);
      return false;
    }

    // 停用当前工具
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // 激活新工具
    this.activeTool = tool;
    tool.activate();

    this.emit('toolChanged', tool);
    return true;
  }

  deactivateTool(): void {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
  }

  getActiveTool(): ITool | null {
    return this.activeTool;
  }

  getActiveToolType(): ToolType | null {
    return this.activeTool?.type || null;
  }

  getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  getToolConfigs(): IToolConfig[] {
    return Array.from(this.tools.values()).map(tool => tool.config);
  }

  // 工具属性管理
  setProperties(properties: Partial<IToolProperties>): void {
    this.properties = { ...this.properties, ...properties };
    this.emit('propertiesChanged', this.properties);
  }

  getProperties(): IToolProperties {
    return { ...this.properties };
  }

  getProperty<T = any>(key: string): T | undefined {
    return this.properties[key] as T;
  }

  setProperty(key: string, value: unknown): void {
    this.properties[key] = value;
    this.emit('propertiesChanged', this.properties);
  }

  // 事件代理到活动工具
  handleMouseDown(event: MouseEvent): void {
    this.activeTool?.onMouseDown(event);
  }

  handleMouseMove(event: MouseEvent): void {
    this.activeTool?.onMouseMove(event);
  }

  handleMouseUp(event: MouseEvent): void {
    this.activeTool?.onMouseUp(event);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.activeTool?.onKeyDown(event);
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.activeTool?.onKeyUp(event);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.activeTool?.render?.(ctx);
  }
}