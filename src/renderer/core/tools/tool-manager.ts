// 工具管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ITool, ToolType, IToolConfig, IToolProperties } from './tool-types';
import type { SuikaToolAdapter } from '../../engines/suika/adapter/tool-adapter';

export interface IToolManagerEvents extends Record<string, (...args: any[]) => void> {
  toolChanged(tool: ITool): void;
  propertiesChanged(properties: IToolProperties): void;
}

export class ToolManager extends TypedEventEmitter<IToolManagerEvents> {
  private tools: Map<ToolType, ITool> = new Map();
  private activeTool: ITool | null = null;
  private properties: IToolProperties = {};
  
  // Suika工具适配器
  private suikaToolAdapter: SuikaToolAdapter | null = null;

  constructor() {
    super();
  }

  /**
   * 设置Suika工具适配器
   */
  setSuikaToolAdapter(adapter: SuikaToolAdapter): void {
    this.suikaToolAdapter = adapter;
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
    // 优先使用Suika工具适配器
    if (this.suikaToolAdapter) {
      const success = this.suikaToolAdapter.activateTool(type);
      if (success) {
        this.activeTool = this.suikaToolAdapter.getActiveTool();
        this.emit('toolChanged', this.activeTool!);
        return true;
      }
    }

    // 回退到本地工具
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
    // 优先从Suika适配器获取配置
    if (this.suikaToolAdapter) {
      return this.suikaToolAdapter.getAllToolConfigs();
    }
    
    return Array.from(this.tools.values()).map(tool => tool.config);
  }

  // 工具属性管理
  setProperties(properties: Partial<IToolProperties>): void {
    this.properties = { ...this.properties, ...properties };
    
    // 同步到Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.setToolProperties(properties);
    }
    
    this.emit('propertiesChanged', this.properties);
  }

  getProperties(): IToolProperties {
    // 优先从Suika适配器获取属性
    if (this.suikaToolAdapter) {
      return this.suikaToolAdapter.getToolProperties();
    }
    
    return { ...this.properties };
  }

  getProperty<T = any>(key: string): T | undefined {
    const properties = this.getProperties();
    return properties[key] as T;
  }

  setProperty(key: string, value: unknown): void {
    this.properties[key] = value;
    
    // 同步到Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.setToolProperties({ [key]: value });
    }
    
    this.emit('propertiesChanged', this.properties);
  }

  // 事件代理到活动工具
  handleMouseDown(event: MouseEvent): void {
    // 优先使用Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.handleMouseDown(event);
      return;
    }
    
    this.activeTool?.onMouseDown(event);
  }

  handleMouseMove(event: MouseEvent): void {
    // 优先使用Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.handleMouseMove(event);
      return;
    }
    
    this.activeTool?.onMouseMove(event);
  }

  handleMouseUp(event: MouseEvent): void {
    // 优先使用Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.handleMouseUp(event);
      return;
    }
    
    this.activeTool?.onMouseUp(event);
  }

  handleKeyDown(event: KeyboardEvent): void {
    // 优先使用Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.handleKeyDown(event);
      return;
    }
    
    this.activeTool?.onKeyDown(event);
  }

  handleKeyUp(event: KeyboardEvent): void {
    // 优先使用Suika适配器
    if (this.suikaToolAdapter) {
      this.suikaToolAdapter.handleKeyUp(event);
      return;
    }
    
    this.activeTool?.onKeyUp(event);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.activeTool?.render?.(ctx);
  }
}