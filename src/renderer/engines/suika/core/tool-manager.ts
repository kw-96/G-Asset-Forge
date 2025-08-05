// Suika工具管理器
import { SuikaEditor } from './editor';
// import { SceneGraph } from './scene-graph'; // 注释掉未使用的导入

export interface ITool {
  name: string;
  type: string;
  activate(): void;
  deactivate(): void;
  handleMouseDown(x: number, y: number, event: MouseEvent): void;
  handleMouseMove(x: number, y: number, event: MouseEvent): void;
  handleMouseUp(x: number, y: number, event: MouseEvent): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class SelectTool implements ITool {
  name = 'select';
  type = 'select';
  private editor: SuikaEditor;
  private isActive = false;
  private selectedObjects: string[] = [];
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragOffset = { x: 0, y: 0 };

  constructor(editor: SuikaEditor) {
    this.editor = editor;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
    this.clearSelection();
  }

  handleMouseDown(x: number, y: number, event: MouseEvent): void {
    if (!this.isActive) return;

    const sceneGraph = this.editor.sceneGraph;
    const clickedObject = sceneGraph.findObjectAtPoint(x, y);

    if (clickedObject) {
      // 选择对象
      if (!event.ctrlKey && !event.metaKey) {
        this.clearSelection();
      }
      this.selectObject(clickedObject.id);
      
      // 开始拖拽
      this.isDragging = true;
      this.dragStart = { x, y };
      this.dragOffset = { x: 0, y: 0 };
    } else {
      // 点击空白区域，清除选择
      if (!event.ctrlKey && !event.metaKey) {
        this.clearSelection();
      }
    }
  }

  handleMouseMove(x: number, y: number, _event: MouseEvent): void {
    if (!this.isActive || !this.isDragging) return;

    // 计算拖拽偏移
    this.dragOffset = {
      x: x - this.dragStart.x,
      y: y - this.dragStart.y
    };

    // 移动选中的对象
    this.moveSelectedObjects(this.dragOffset.x, this.dragOffset.y);
    
    // 更新拖拽起始点
    this.dragStart = { x, y };
  }

  handleMouseUp(_x: number, _y: number, _event: MouseEvent): void {
    if (!this.isActive) return;

    this.isDragging = false;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    // 渲染选择框
    this.renderSelectionBoxes(ctx);
  }

  // 选择对象
  selectObject(id: string): void {
    if (!this.selectedObjects.includes(id)) {
      this.selectedObjects.push(id);
    }
  }

  // 取消选择对象
  deselectObject(id: string): void {
    const index = this.selectedObjects.indexOf(id);
    if (index > -1) {
      this.selectedObjects.splice(index, 1);
    }
  }

  // 清除所有选择
  clearSelection(): void {
    this.selectedObjects = [];
  }

  // 获取选中的对象
  getSelectedObjects(): string[] {
    return [...this.selectedObjects];
  }

  // 移动选中的对象
  private moveSelectedObjects(dx: number, dy: number): void {
    const sceneGraph = this.editor.sceneGraph;
    
    for (const id of this.selectedObjects) {
      const object = sceneGraph.getObject(id);
      if (object) {
        sceneGraph.updateObject(id, {
          x: object.x + dx,
          y: object.y + dy
        });
      }
    }
  }

  // 渲染选择框
  private renderSelectionBoxes(ctx: CanvasRenderingContext2D): void {
    const sceneGraph = this.editor.sceneGraph;
    
    ctx.save();
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    for (const id of this.selectedObjects) {
      const bounds = sceneGraph.getObjectBounds(id);
      if (bounds) {
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    }

    ctx.restore();
  }
}

export class ToolManager {
  private editor: SuikaEditor;
  private tools: Map<string, ITool> = new Map();
  private activeTool: ITool | null = null;

  constructor(editor: SuikaEditor) {
    this.editor = editor;
    this.initializeTools();
  }

  // 初始化工具
  private initializeTools(): void {
    const selectTool = new SelectTool(this.editor);
    this.tools.set('select', selectTool);
    
    // 默认激活选择工具
    this.setActiveTool('select');
  }

  // 设置活动工具
  setActiveTool(toolName: string): void {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`Tool ${toolName} not found`);
      return;
    }

    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    this.activeTool = tool;
    this.activeTool.activate();
  }

  // 获取活动工具
  getActiveTool(): ITool | null {
    return this.activeTool;
  }

  // 获取所有工具
  getTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  // 鼠标事件处理
  handleMouseDown(x: number, y: number, event: MouseEvent): void {
    if (this.activeTool) {
      this.activeTool.handleMouseDown(x, y, event);
    }
  }

  handleMouseMove(x: number, y: number, event: MouseEvent): void {
    if (this.activeTool) {
      this.activeTool.handleMouseMove(x, y, event);
    }
  }

  handleMouseUp(x: number, y: number, event: MouseEvent): void {
    if (this.activeTool) {
      this.activeTool.handleMouseUp(x, y, event);
    }
  }

  // 渲染工具
  render(ctx: CanvasRenderingContext2D): void {
    if (this.activeTool) {
      this.activeTool.render(ctx);
    }
  }

  // 选择对象
  selectObjects(ids: string[]): void {
    const selectTool = this.tools.get('select') as SelectTool;
    if (selectTool) {
      selectTool.clearSelection();
      ids.forEach(id => selectTool.selectObject(id));
    }
  }

  // 清除选择
  clearSelection(): void {
    const selectTool = this.tools.get('select') as SelectTool;
    if (selectTool) {
      selectTool.clearSelection();
    }
  }

  // 获取选中的对象
  getSelectedObjects(): string[] {
    const selectTool = this.tools.get('select') as SelectTool;
    return selectTool ? selectTool.getSelectedObjects() : [];
  }

  // 键盘事件处理（可选）
  handleKeyDown?(event: KeyboardEvent): void {
    // 默认为空，子类可以重写
    if (this.activeTool && typeof (this.activeTool as any).handleKeyDown === 'function') {
      (this.activeTool as any).handleKeyDown(event);
    }
  }

  handleKeyUp?(event: KeyboardEvent): void {
    // 默认为空，子类可以重写
    if (this.activeTool && typeof (this.activeTool as any).handleKeyUp === 'function') {
      (this.activeTool as any).handleKeyUp(event);
    }
  }

  // 添加工具
  addTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  // 移除工具
  removeTool(toolName: string): void {
    if (this.activeTool && this.activeTool.name === toolName) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
    this.tools.delete(toolName);
  }
}
