/**
 * Suika工具适配器 - 将Suika工具系统适配到统一的工具接口
 * @description 提供工具激活、属性管理、事件处理等功能的适配
 * @author 开发团队
 */

import type { Tool, ToolType, ToolConfig, ToolProperties } from '../../../core/tools/tool-types';
import type { SuikaEditor } from '../core/editor';

export class SuikaToolAdapter {
  private activeTool: Tool | null = null;
  private activeToolType: ToolType | null = null;

  constructor(_editor: SuikaEditor) {}

  /**
   * 激活工具
   */
  activateTool(type: ToolType): boolean {
    try {
      // 简化的工具激活实现
      this.activeToolType = type;
      this.activeTool = this.createTool(type);
      return true;
    } catch (error) {
      console.error('Failed to activate tool:', error);
      return false;
    }
  }

  /**
   * 获取当前激活的工具
   */
  getActiveTool(): Tool | null {
    return this.activeTool;
  }

  /**
   * 获取当前激活的工具类型
   */
  getActiveToolType(): ToolType | null {
    return this.activeToolType;
  }

  /**
   * 获取所有工具配置
   */
  getAllToolConfigs(): ToolConfig[] {
    return [
      {
        type: 'select' as ToolType,
        name: '选择工具',
        icon: 'select',
        shortcut: 'V',
      },
      {
        type: 'text' as ToolType,
        name: '文本工具',
        icon: 'text',
        shortcut: 'T',
      },
      {
        type: 'shape' as ToolType,
        name: '形状工具',
        icon: 'shape',
        shortcut: 'R',
      },
      {
        type: 'brush' as ToolType,
        name: '画笔工具',
        icon: 'brush',
        shortcut: 'B',
      },
    ];
  }

  /**
   * 获取工具配置
   */
  getToolConfig(type: ToolType): ToolConfig | undefined {
    return this.getAllToolConfigs().find(config => config.type === type);
  }

  /**
   * 设置工具属性
   */
  setToolProperties(properties: Partial<ToolProperties>): void {
    if (this.activeTool) {
      Object.assign(this.activeTool, properties as any);
    }
  }

  /**
   * 获取工具属性
   */
  getToolProperties(): ToolProperties {
    return this.activeTool || {};
  }

  /**
   * 处理鼠标按下事件
   */
  handleMouseDown(event: MouseEvent): void {
    if (this.activeTool && this.activeTool.onMouseDown) {
      this.activeTool.onMouseDown(event);
    }
  }

  /**
   * 处理鼠标移动事件
   */
  handleMouseMove(event: MouseEvent): void {
    if (this.activeTool && this.activeTool.onMouseMove) {
      this.activeTool.onMouseMove(event);
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  handleMouseUp(event: MouseEvent): void {
    if (this.activeTool && this.activeTool.onMouseUp) {
      this.activeTool.onMouseUp(event);
    }
  }

  /**
   * 处理键盘按下事件
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (this.activeTool && this.activeTool.onKeyDown) {
      this.activeTool.onKeyDown(event);
    }
  }

  /**
   * 处理键盘抬起事件
   */
  handleKeyUp(event: KeyboardEvent): void {
    if (this.activeTool && this.activeTool.onKeyUp) {
      this.activeTool.onKeyUp(event);
    }
  }

  /**
   * 创建工具实例
   */
  private createTool(type: ToolType): Tool {
    const baseProperties: ToolProperties = {
      strokeWidth: 1,
      strokeColor: '#000000',
      fillColor: '#ffffff',
      opacity: 1,
    };

    return {
      type,
      config: this.getToolConfig(type) || { type,
        name: 'tool',
        icon: 'tool',
        shortcut: 'T',
      },
      state: {
        isActive: false,
        isDragging: false,
        properties: baseProperties,
      },
      activate: () => {
        console.log(`${type} tool activate`);
      },
      deactivate: () => {
        console.log(`${type} tool deactivate`);
      },
      onMouseDown: (event: MouseEvent) => {
        console.log(`${type} tool mouse down`, event);
      },
      onMouseMove: (event: MouseEvent) => {
        console.log(`${type} tool mouse move`, event);
      },
      onMouseUp: (event: MouseEvent) => {
        console.log(`${type} tool mouse up`, event);
      },
      onKeyDown: (event: KeyboardEvent) => {
        console.log(`${type} tool key down`, event);
      },
      onKeyUp: (event: KeyboardEvent) => {
        console.log(`${type} tool key up`, event);
      },
    };
  }
}