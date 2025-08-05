// 具体工具实现
import type { ITool, IToolConfig, IToolState } from './tool-types';
import { ToolType } from './tool-types';

export abstract class BaseTool implements ITool {
  public type: ToolType;
  public config: IToolConfig;
  public state: IToolState;

  constructor(type: ToolType, config: IToolConfig) {
    this.type = type;
    this.config = config;
    this.state = {
      isActive: false,
      isDragging: false,
      properties: {}
    };
  }

  activate(): void {
    this.state.isActive = true;
    this.onActivate();
  }

  deactivate(): void {
    this.state.isActive = false;
    this.state.isDragging = false;
    this.state.startPoint = undefined;
    this.state.currentPoint = undefined;
    this.onDeactivate();
  }

  protected onActivate(): void {
    // 子类可以重写
  }

  protected onDeactivate(): void {
    // 子类可以重写
  }

  abstract onMouseDown(event: MouseEvent): void;
  abstract onMouseMove(event: MouseEvent): void;
  abstract onMouseUp(event: MouseEvent): void;

  onKeyDown(event: KeyboardEvent): void {
    // 默认实现，子类可以重写
  }

  onKeyUp(event: KeyboardEvent): void {
    // 默认实现，子类可以重写
  }

  render?(ctx: CanvasRenderingContext2D): void;
}

// 选择工具
export class SelectTool extends BaseTool {
  constructor() {
    super(ToolType.SELECT, {
      type: ToolType.SELECT,
      name: '选择',
      icon: 'select',
      shortcut: 'V',
      cursor: 'default'
    });
  }

  onMouseDown(event: MouseEvent): void {
    this.state.isDragging = true;
    this.state.startPoint = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.currentPoint = { x: event.clientX, y: event.clientY };
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.state.isDragging = false;
    this.state.startPoint = undefined;
    this.state.currentPoint = undefined;
  }
}

// 矩形工具
export class RectangleTool extends BaseTool {
  constructor() {
    super(ToolType.RECTANGLE, {
      type: ToolType.RECTANGLE,
      name: '矩形',
      icon: 'rectangle',
      shortcut: 'R',
      cursor: 'crosshair'
    });
  }

  onMouseDown(event: MouseEvent): void {
    this.state.isDragging = true;
    this.state.startPoint = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.currentPoint = { x: event.clientX, y: event.clientY };
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.state.startPoint && this.state.currentPoint) {
      // 创建矩形对象
      const rect = {
        id: `rect_${Date.now()}`,
        type: 'rectangle',
        position: {
          x: Math.min(this.state.startPoint.x, this.state.currentPoint.x),
          y: Math.min(this.state.startPoint.y, this.state.currentPoint.y)
        },
        size: {
          width: Math.abs(this.state.currentPoint.x - this.state.startPoint.x),
          height: Math.abs(this.state.currentPoint.y - this.state.startPoint.y)
        },
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0
      };

      // TODO: 通过画布管理器添加对象
      console.log('Created rectangle:', rect);
    }

    this.state.isDragging = false;
    this.state.startPoint = undefined;
    this.state.currentPoint = undefined;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.state.isDragging && this.state.startPoint && this.state.currentPoint) {
      const x = Math.min(this.state.startPoint.x, this.state.currentPoint.x);
      const y = Math.min(this.state.startPoint.y, this.state.currentPoint.y);
      const width = Math.abs(this.state.currentPoint.x - this.state.startPoint.x);
      const height = Math.abs(this.state.currentPoint.y - this.state.startPoint.y);

      ctx.save();
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.restore();
    }
  }
}

// 圆形工具
export class CircleTool extends BaseTool {
  constructor() {
    super(ToolType.CIRCLE, {
      type: ToolType.CIRCLE,
      name: '圆形',
      icon: 'circle',
      shortcut: 'C',
      cursor: 'crosshair'
    });
  }

  onMouseDown(event: MouseEvent): void {
    this.state.isDragging = true;
    this.state.startPoint = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.currentPoint = { x: event.clientX, y: event.clientY };
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.state.startPoint && this.state.currentPoint) {
      const radius = Math.sqrt(
        Math.pow(this.state.currentPoint.x - this.state.startPoint.x, 2) +
        Math.pow(this.state.currentPoint.y - this.state.startPoint.y, 2)
      );

      const circle = {
        id: `circle_${Date.now()}`,
        type: 'circle',
        position: {
          x: this.state.startPoint.x - radius,
          y: this.state.startPoint.y - radius
        },
        size: {
          width: radius * 2,
          height: radius * 2
        },
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0
      };

      console.log('Created circle:', circle);
    }

    this.state.isDragging = false;
    this.state.startPoint = undefined;
    this.state.currentPoint = undefined;
  }
}

// 文本工具
export class TextTool extends BaseTool {
  constructor() {
    super(ToolType.TEXT, {
      type: ToolType.TEXT,
      name: '文本',
      icon: 'text',
      shortcut: 'T',
      cursor: 'text'
    });
  }

  onMouseDown(event: MouseEvent): void {
    const text = {
      id: `text_${Date.now()}`,
      type: 'text',
      position: { x: event.clientX, y: event.clientY },
      size: { width: 100, height: 30 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0
    };

    
  }

  onMouseMove(event: MouseEvent): void {
    // 文本工具通常不需要拖拽
  }

  onMouseUp(event: MouseEvent): void {
    // 文本工具通常不需要拖拽
  }
}