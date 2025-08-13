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

  onKeyDown(_event: KeyboardEvent): void {
    // 默认实现，子类可以重写
  }

  onKeyUp(_event: KeyboardEvent): void {
    // 默认实现，子类可以重写
  }

  render?(_ctx: CanvasRenderingContext2D): void;
}

// 选择工具
export class SelectTool extends BaseTool {
  private selectedObjects: Set<string> = new Set();
  private selectionBox: { x: number; y: number; width: number; height: number } | null = null;
  private isDragging = false;
  private isResizing = false;
  private resizeHandle: string | null = null;
  private originalObjectStates: Map<string, any> = new Map();

  constructor() {
    super(ToolType.SELECT, {
      type: ToolType.SELECT,
      name: '选择',
      icon: 'select',
      shortcut: 'V',
      cursor: 'default'
    });
  }

  override onMouseDown(event: MouseEvent): void {
    const canvasPoint = this.getCanvasPoint(event);
    
    // 检查是否点击了变换手柄
    const handle = this.getResizeHandleAt(canvasPoint);
    if (handle) {
      this.startResize(handle, canvasPoint);
      return;
    }

    // 检查是否点击了对象
    const clickedObject = this.getObjectAt(canvasPoint);
    if (clickedObject) {
      this.handleObjectClick(clickedObject, event.shiftKey);
    } else {
      this.startSelectionBox(canvasPoint);
    }

    this.state.isDragging = true;
    this.state.startPoint = canvasPoint;
  }

  override onMouseMove(event: MouseEvent): void {
    const canvasPoint = this.getCanvasPoint(event);
    this.state.currentPoint = canvasPoint;

    if (this.isResizing) {
      this.handleResize(canvasPoint);
    } else if (this.isDragging && this.selectedObjects.size > 0) {
      this.handleDrag(canvasPoint);
    } else if (this.selectionBox) {
      this.updateSelectionBox(canvasPoint);
    }

    // 更新光标
    this.updateCursor(canvasPoint);
  }

  override onMouseUp(_event: MouseEvent): void {
    if (this.selectionBox) {
      this.finalizeSelectionBox();
    }

    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.state.isDragging = false;
    this.state.startPoint = undefined;
    this.state.currentPoint = undefined;
  }

  // 对象选择功能
  private handleObjectClick(objectId: string, isMultiSelect: boolean): void {
    if (isMultiSelect) {
      // 多选模式
      if (this.selectedObjects.has(objectId)) {
        this.selectedObjects.delete(objectId);
      } else {
        this.selectedObjects.add(objectId);
      }
    } else {
      // 单选模式
      this.selectedObjects.clear();
      this.selectedObjects.add(objectId);
    }

    this.saveObjectStates();
    this.emitSelectionChanged();
  }

  // 框选功能
  private startSelectionBox(point: { x: number; y: number }): void {
    this.selectionBox = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    };
  }

  private updateSelectionBox(point: { x: number; y: number }): void {
    if (!this.selectionBox || !this.state.startPoint) return;

    this.selectionBox.width = point.x - this.state.startPoint.x;
    this.selectionBox.height = point.y - this.state.startPoint.y;
  }

  private finalizeSelectionBox(): void {
    if (!this.selectionBox) return;

    // 获取框选区域内的对象
    const objectsInBox = this.getObjectsInBox(this.selectionBox);
    
    // 更新选择状态
    this.selectedObjects.clear();
    objectsInBox.forEach(obj => this.selectedObjects.add(obj.id));

    this.selectionBox = null;
    this.saveObjectStates();
    this.emitSelectionChanged();
  }

  // 对象变换功能
  private startResize(handle: string, _point: { x: number; y: number }): void {
    this.isResizing = true;
    this.resizeHandle = handle;
    this.saveObjectStates();
  }

  private handleResize(point: { x: number; y: number }): void {
    if (!this.resizeHandle || !this.state.startPoint) return;

    const deltaX = point.x - this.state.startPoint.x;
    const deltaY = point.y - this.state.startPoint.y;

    this.selectedObjects.forEach(objectId => {
      const object = this.getObjectById(objectId);
      if (object) {
        this.resizeObject(object, this.resizeHandle!, deltaX, deltaY);
      }
    });
  }

  private handleDrag(point: { x: number; y: number }): void {
    if (!this.state.startPoint) return;

    const deltaX = point.x - this.state.startPoint.x;
    const deltaY = point.y - this.state.startPoint.y;

    this.selectedObjects.forEach(objectId => {
      const object = this.getObjectById(objectId);
      if (object) {
        this.moveObject(object, deltaX, deltaY);
      }
    });

    // 更新起始点
    this.state.startPoint = point;
  }

  // 批量操作功能
  deleteSelectedObjects(): void {
    this.selectedObjects.forEach(objectId => {
      this.removeObject(objectId);
    });
    this.selectedObjects.clear();
    this.emitSelectionChanged();
  }

  duplicateSelectedObjects(): void {
    const newObjects: string[] = [];
    
    this.selectedObjects.forEach(objectId => {
      const object = this.getObjectById(objectId);
      if (object) {
        const duplicatedObject = this.duplicateObject(object);
        newObjects.push(duplicatedObject.id);
      }
    });

    // 更新选择状态
    this.selectedObjects.clear();
    newObjects.forEach(id => this.selectedObjects.add(id));
    this.emitSelectionChanged();
  }

  // 选择状态管理
  clearSelection(): void {
    this.selectedObjects.clear();
    this.selectionBox = null;
    this.emitSelectionChanged();
  }

  selectAll(): void {
    const allObjects = this.getAllObjects();
    this.selectedObjects.clear();
    allObjects.forEach(obj => this.selectedObjects.add(obj.id));
    this.emitSelectionChanged();
  }

  // 渲染选择状态
  override render(ctx: CanvasRenderingContext2D): void {
    // 渲染选择框
    if (this.selectionBox) {
      ctx.save();
      ctx.strokeStyle = '#007AFF';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        this.selectionBox.x,
        this.selectionBox.y,
        this.selectionBox.width,
        this.selectionBox.height
      );
      ctx.restore();
    }

    // 渲染选中对象的边框和变换手柄
    this.selectedObjects.forEach(objectId => {
      const object = this.getObjectById(objectId);
      if (object) {
        this.renderSelectionBorder(ctx, object);
        this.renderTransformHandles(ctx, object);
      }
    });
  }

  private renderSelectionBorder(ctx: CanvasRenderingContext2D, object: any): void {
    const bounds = this.getObjectBounds(object);
    
    ctx.save();
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
  }

  private renderTransformHandles(ctx: CanvasRenderingContext2D, object: any): void {
    const bounds = this.getObjectBounds(object);
    const handles = this.getTransformHandles(bounds);
    
    handles.forEach(handle => {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#007AFF';
      ctx.lineWidth = 2;
      ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.strokeRect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.restore();
    });
  }

  // 辅助方法
  private getCanvasPoint(event: MouseEvent): { x: number; y: number } {
    // 这里需要与画布引擎集成，获取正确的画布坐标
    return { x: event.clientX, y: event.clientY };
  }

  private getObjectAt(_point: { x: number; y: number }): string | null {
    // 与画布引擎集成，获取指定点的对象
    return null;
  }

  private getObjectById(_id: string): any {
    // 与画布引擎集成，获取对象
    return null;
  }

  private getAllObjects(): any[] {
    // 与画布引擎集成，获取所有对象
    return [];
  }

  private getObjectsInBox(_box: { x: number; y: number; width: number; height: number }): any[] {
    // 与画布引擎集成，获取框选区域内的对象
    return [];
  }

  private getObjectBounds(_object: any): { x: number; y: number; width: number; height: number } {
    // 获取对象边界
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  private getTransformHandles(bounds: { x: number; y: number; width: number; height: number }): Array<{ x: number; y: number; type: string }> {
    return [
      { x: bounds.x, y: bounds.y, type: 'top-left' },
      { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'top-center' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'top-right' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'right-center' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'bottom-right' },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 'bottom-center' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'bottom-left' },
      { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'left-center' }
    ];
  }

  private getResizeHandleAt(_point: { x: number; y: number }): string | null {
    // 检查是否点击了变换手柄
    return null;
  }

  private moveObject(object: any, deltaX: number, deltaY: number): void {
    // 移动对象
    if (object.x !== undefined) object.x += deltaX;
    if (object.y !== undefined) object.y += deltaY;
  }

  private resizeObject(object: any, handle: string, deltaX: number, deltaY: number): void {
    // 根据手柄类型调整对象大小
    switch (handle) {
      case 'top-left':
        if (object.x !== undefined) object.x += deltaX;
        if (object.y !== undefined) object.y += deltaY;
        if (object.width !== undefined) object.width -= deltaX;
        if (object.height !== undefined) object.height -= deltaY;
        break;
      case 'top-right':
        if (object.y !== undefined) object.y += deltaY;
        if (object.width !== undefined) object.width += deltaX;
        if (object.height !== undefined) object.height -= deltaY;
        break;
      // 其他手柄类型...
    }
  }

  private duplicateObject(object: any): any {
    // 复制对象
    return { ...object, id: this.generateId() };
  }

  private removeObject(_objectId: string): void {
    // 移除对象
  }

  private saveObjectStates(): void {
    this.originalObjectStates.clear();
    this.selectedObjects.forEach(objectId => {
      const object = this.getObjectById(objectId);
      if (object) {
        this.originalObjectStates.set(objectId, { ...object });
      }
    });
  }

  private updateCursor(point: { x: number; y: number }): void {
    const handle = this.getResizeHandleAt(point);
    if (handle) {
      this.setCursor(this.getCursorForHandle(handle));
    } else {
      this.setCursor('default');
    }
  }

  private getCursorForHandle(handle: string): string {
    switch (handle) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      case 'top-center':
      case 'bottom-center':
        return 'ns-resize';
      case 'left-center':
      case 'right-center':
        return 'ew-resize';
      default:
        return 'default';
    }
  }

  private setCursor(_cursor: string): void {
    // 设置光标样式
  }

  private generateId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitSelectionChanged(): void {
    // 发出选择变化事件
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

  override onMouseDown(event: MouseEvent): void {
    this.state.isDragging = true;
    this.state.startPoint = { x: event.clientX, y: event.clientY };
  }

  override onMouseMove(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.currentPoint = { x: event.clientX, y: event.clientY };
    }
  }

  override onMouseUp(_event: MouseEvent): void {
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

  override render(ctx: CanvasRenderingContext2D): void {
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

  override onMouseDown(event: MouseEvent): void {
    this.state.isDragging = true;
    this.state.startPoint = { x: event.clientX, y: event.clientY };
  }

  override onMouseMove(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.currentPoint = { x: event.clientX, y: event.clientY };
    }
  }

  override onMouseUp(_event: MouseEvent): void {
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

  override onMouseDown(event: MouseEvent): void {
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

    console.log('Created text:', text);
  }

  override onMouseMove(_event: MouseEvent): void {
    // 文本工具通常不需要拖拽
  }

  override onMouseUp(_event: MouseEvent): void {
    // 文本工具通常不需要拖拽
  }
}