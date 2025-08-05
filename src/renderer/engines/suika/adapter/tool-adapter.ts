// Suika工具适配器 - 将Suika工具系统适配到我们的接口
// 注释掉不存在的模块导入
// import { ToolManager } from '@suika/core/tools/tool_manager';
// import { SelectTool } from '@suika/core/tools/tool_select';
// import { DrawTextTool } from '@suika/core/tools/tool_draw_text';
// import { DrawImgTool } from '@suika/core/tools/tool_draw_img';
// import { DrawRectTool } from '@suika/core/tools/tool_draw_rect';
// import { DrawEllipseTool } from '@suika/core/tools/tool_draw_ellipse';
// import { PencilTool } from '@suika/core/tools/tool_pencil';
// import { DragCanvasTool } from '@suika/core/tools/tool_drag_canvas';
// import { DrawLineTool } from '@suika/core/tools/tool_draw_line';
// import { DrawRegularPolygonTool } from '@suika/core/tools/tool_draw_regular_polygon';
// import { DrawStarTool } from '@suika/core/tools/tool_draw_star';

import { ITool, ToolType, IToolConfig, IToolProperties } from '../../../core/tools/tool-types';
import { SuikaEditor } from '../core/editor';

// 工具类型映射表 - 暂时注释掉未使用的映射表
// const TOOL_MAPPING = {
//   [ToolType.SELECT]: 'select',
//   [ToolType.TEXT]: 'drawText',
//   [ToolType.IMAGE]: 'drawImg',
//   [ToolType.RECTANGLE]: 'drawRect',
//   [ToolType.CIRCLE]: 'drawEllipse',
//   [ToolType.BRUSH]: 'pencil',
//   [ToolType.PAN]: 'dragCanvas',
//   [ToolType.LINE]: 'drawLine',
//   [ToolType.POLYGON]: 'drawRegularPolygon',
//   [ToolType.STAR]: 'drawStar',
//   [ToolType.CROP]: undefined
// } as const;

// // 反向映射表
// const REVERSE_TOOL_MAPPING = {
//   'select': ToolType.SELECT,
//   'drawText': ToolType.TEXT,
//   'drawImg': ToolType.IMAGE,
//   'drawRect': ToolType.RECTANGLE,
//   'drawEllipse': ToolType.CIRCLE,
//   'pencil': ToolType.BRUSH,
//   'dragCanvas': ToolType.PAN,
//   'drawLine': ToolType.LINE,
//   'drawRegularPolygon': ToolType.POLYGON,
//   'drawStar': ToolType.STAR
// } as const;

// 工具配置映射
const TOOL_CONFIGS: Record<string, IToolConfig> = {
  [ToolType.SELECT]: {
    type: ToolType.SELECT,
    name: '选择',
    icon: 'select',
    shortcut: 'V',
    cursor: 'default'
  },
  [ToolType.TEXT]: {
    type: ToolType.TEXT,
    name: '文本',
    icon: 'text',
    shortcut: 'T',
    cursor: 'text'
  },
  [ToolType.IMAGE]: {
    type: ToolType.IMAGE,
    name: '图片',
    icon: 'image',
    shortcut: 'I',
    cursor: 'crosshair'
  },
  [ToolType.RECTANGLE]: {
    type: ToolType.RECTANGLE,
    name: '矩形',
    icon: 'rectangle',
    shortcut: 'R',
    cursor: 'crosshair'
  },
  [ToolType.CIRCLE]: {
    type: ToolType.CIRCLE,
    name: '圆形',
    icon: 'circle',
    shortcut: 'C',
    cursor: 'crosshair'
  },
  [ToolType.BRUSH]: {
    type: ToolType.BRUSH,
    name: '画笔',
    icon: 'brush',
    shortcut: 'B',
    cursor: 'crosshair'
  },
  [ToolType.PAN]: {
    type: ToolType.PAN,
    name: '平移',
    icon: 'pan',
    shortcut: 'H',
    cursor: 'grab'
  },
  [ToolType.LINE]: {
    type: ToolType.LINE,
    name: '直线',
    icon: 'line',
    shortcut: 'L',
    cursor: 'crosshair'
  },
  [ToolType.POLYGON]: {
    type: ToolType.POLYGON,
    name: '多边形',
    icon: 'polygon',
    shortcut: 'P',
    cursor: 'crosshair'
  },
  [ToolType.STAR]: {
    type: ToolType.STAR,
    name: '星形',
    icon: 'star',
    shortcut: 'S',
    cursor: 'crosshair'
  },
  [ToolType.CROP]: {
    type: ToolType.CROP,
    name: '裁剪',
    icon: 'crop',
    shortcut: 'O',
    cursor: 'crosshair'
  },
  [ToolType.ZOOM]: {
    type: ToolType.ZOOM,
    name: '缩放',
    icon: 'zoom',
    shortcut: 'Z',
    cursor: 'zoom-in'
  }
};

/**
 * Suika工具适配器
 * 将Suika的工具系统适配到我们的工具接口
 */
export class SuikaToolAdapter {
  // private suikaToolManager: any;
  private activeTool: ITool | null = null;
  private toolProperties: IToolProperties = {};

  constructor(_editor: SuikaEditor) {
    // this.suikaToolManager = new ToolManager(_editor);
    
    // 设置可用的工具
    // this.setupAvailableTools();
  }

  /**
   * 设置可用的工具
   */
  /*
  private setupAvailableTools(): void {
    // 配置Suika工具管理器支持的工具
    // this.suikaToolManager.setEnableHotKeyTools([
    //   SelectTool.type,
    //   DrawTextTool.type,
    //   DrawImgTool.type,
    //   DrawRectTool.type,
    //   DrawEllipseTool.type,
    //   PencilTool.type,
    //   DragCanvasTool.type,
    //   DrawLineTool.type,
    //   DrawRegularPolygonTool.type,
    //   DrawStarTool.type
    // ]);


    // 设置默认工具
    // this.suikaToolManager.setActiveTool(SelectTool.type);
  }
  */

  /**
   * 激活工具
   */
  activateTool(type: ToolType): boolean {
    // 创建工具包装器
    const tool = this.createToolWrapper(type);
    if (tool) {
      this.activeTool = tool;
      return true;
    }
    
    console.warn(`Failed to create tool for type: ${type}`);
    return false;
  }

  /**
   * 停用当前工具
   */
  deactivateTool(): void {
    this.activeTool = null;
  }

  /**
   * 获取当前活动工具
   */
  getActiveTool(): ITool | null {
    return this.activeTool;
  }

  /**
   * 获取当前活动工具类型
   */
  getActiveToolType(): ToolType | null {
    // const suikaToolType = this.suikaToolManager.getActiveToolName();
    // return REVERSE_TOOL_MAPPING[suikaToolType as keyof typeof REVERSE_TOOL_MAPPING] || null;
    return null;
  }

  /**
   * 获取所有可用工具配置
   */
  getAllToolConfigs(): IToolConfig[] {
    return Object.values(TOOL_CONFIGS);
  }

  /**
   * 获取工具配置
   */
  getToolConfig(type: ToolType): IToolConfig | undefined {
    const config = TOOL_CONFIGS[type];
    return config;
  }

  /**
   * 设置工具属性
   */
  setToolProperties(properties: Partial<IToolProperties>): void {
    this.toolProperties = { ...this.toolProperties, ...properties };
    
    // 将属性同步到Suika编辑器
    this.syncPropertiesToSuika(properties);
  }

  /**
   * 获取工具属性
   */
  getToolProperties(): IToolProperties {
    return { ...this.toolProperties };
  }

  /**
   * 处理鼠标事件
   */
  handleMouseDown(_event: MouseEvent): void {
    // 将DOM事件转换为PointerEvent
    // const pointerEvent = this.convertToPointerEvent(event);
    // this.suikaToolManager.onStart(pointerEvent);
    // TODO: 实现鼠标按下事件处理
  }

  handleMouseMove(_event: MouseEvent): void {
    // const pointerEvent = this.convertToPointerEvent(event);
    // this.suikaToolManager.onDrag(pointerEvent);
    // TODO: 实现鼠标移动事件处理
  }

  handleMouseUp(_event: MouseEvent): void {
    // const pointerEvent = this.convertToPointerEvent(event);
    // this.suikaToolManager.onEnd(pointerEvent, this.suikaToolManager.isDragging());
    // TODO: 实现鼠标抬起事件处理
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event: KeyboardEvent): void {
    // 处理快捷键
    this.handleShortcut(event);
  }

  handleKeyUp(_event: KeyboardEvent): void {
    // TODO: 处理按键释放
  }

  /**
   * 渲染工具
   */
  render(_ctx: CanvasRenderingContext2D): void {
    // Suika工具管理器会自动处理渲染
    // 这里可以添加额外的渲染逻辑
    // TODO: 实现渲染逻辑
  }

  /**
   * 创建工具包装器
   */
  private createToolWrapper(type: ToolType): ITool | null {
    const config = TOOL_CONFIGS[type];
    
    if (!config) {
      console.error(`No config found for tool type: ${type}`);
      return null;
    }
    
    return {
      type,
      config,
      state: {
        isActive: true,
        isDragging: false,
        properties: this.toolProperties
      },
      
      activate: () => {
        this.activateTool(type);
      },
      
      deactivate: () => {
        this.deactivateTool();
      },
      
      onMouseDown: this.handleMouseDown.bind(this),
      onMouseMove: this.handleMouseMove.bind(this),
      onMouseUp: this.handleMouseUp.bind(this),
      onKeyDown: this.handleKeyDown.bind(this),
      onKeyUp: this.handleKeyUp.bind(this),
      render: this.render.bind(this)
    };
  }

  /**
   * 将DOM事件转换为PointerEvent
   * TODO: 当实现事件处理逻辑时会用到此方法
   */
  /*
  private convertToPointerEvent(event: MouseEvent): PointerEvent {
    // 创建PointerEvent
    const pointerEvent = new PointerEvent(event.type, {
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      buttons: event.buttons,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
    
    return pointerEvent;
  }
  */

  /**
   * 处理快捷键
   */
  private handleShortcut(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    
    // 检查是否是工具快捷键
    for (const [toolType, config] of Object.entries(TOOL_CONFIGS)) {
      if (config.shortcut && config.shortcut.toLowerCase() === key) {
        event.preventDefault();
        this.activateTool(toolType as ToolType);
        return;
      }
    }
  }

  /**
   * 将属性同步到Suika编辑器
   */
  private syncPropertiesToSuika(_properties: Partial<IToolProperties>): void {
    // TODO: 根据工具类型同步相应的属性
    // const activeToolType = this.getActiveToolType();
    
    // if (!activeToolType) return;

    // switch (activeToolType) {
    //   case ToolType.TEXT:
    //     // 同步文本属性
    //     if (properties.fontSize !== undefined) {
    //       // 设置字体大小
    //     }
    //     if (properties.fontFamily !== undefined) {
    //       // 设置字体系列
    //     }
    //     if (properties.fontWeight !== undefined) {
    //       // 设置字体粗细
    //     }
    //     break;
        
    //   case ToolType.RECTANGLE:
    //   case ToolType.CIRCLE:
    //     // 同步形状属性
    //     if (properties.fill !== undefined) {
    //       // 设置填充色
    //     }
    //     if (properties.stroke !== undefined) {
    //       // 设置描边色
    //     }
    //     if (properties.strokeWidth !== undefined) {
    //       // 设置描边宽度
    //     }
    //     break;
        
    //   case ToolType.BRUSH:
    //     // 同步画笔属性
    //     if (properties.brushSize !== undefined) {
    //       // 设置画笔大小
    //     }
    //     if (properties.brushOpacity !== undefined) {
    //       // 设置画笔透明度
    //     }
    //     break;
    // }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    // this.suikaToolManager.unbindEvent();
    this.activeTool = null;
  }
}