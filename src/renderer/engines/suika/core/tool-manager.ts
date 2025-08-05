// 工具管理器
import type { SuikaEditor } from './editor';

export enum ToolType {
  SELECT = 'select',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  PAN = 'pan'
}

export interface ITool {
  type: ToolType;
  onMouseDown?(event: MouseEvent): void;
  onMouseMove?(event: MouseEvent): void;
  onMouseUp?(event: MouseEvent): void;
  onKeyDown?(event: KeyboardEvent): void;
  onKeyUp?(event: KeyboardEvent): void;
  activate?(): void;
  deactivate?(): void;
}

export class ToolManager {
  private editor: SuikaEditor;
  private currentTool: ITool | null = null;
  private tools: Map<ToolType, ITool> = new Map();

  constructor(editor: SuikaEditor) {
    this.editor = editor;
    this.initializeTools();
    this.bindEvents();
  }

  private initializeTools(): void {
    // 选择工具
    this.tools.set(ToolType.SELECT, {
      type: ToolType.SELECT,
      onMouseDown: (event) => {
        console.log('Select tool mouse down');
      },
      onMouseMove: (event) => {
        // 处理选择框拖拽
      },
      onMouseUp: (event) => {
        console.log('Select tool mouse up');
      }
    });

    // 矩形工具
    this.tools.set(ToolType.RECTANGLE, {
      type: ToolType.RECTANGLE,
      onMouseDown: (event) => {
        const scenePos = this.editor.getSceneCursorXY(event);
        console.log('Rectangle tool mouse down at', scenePos);
      },
      onMouseMove: (event) => {
        // 处理矩形拖拽绘制
      },
      onMouseUp: (event) => {
        console.log('Rectangle tool mouse up');
      }
    });

    // 圆形工具
    this.tools.set(ToolType.CIRCLE, {
      type: ToolType.CIRCLE,
      onMouseDown: (event) => {
        const scenePos = this.editor.getSceneCursorXY(event);
        console.log('Circle tool mouse down at', scenePos);
      }
    });

    // 文本工具
    this.tools.set(ToolType.TEXT, {
      type: ToolType.TEXT,
      onMouseDown: (event) => {
        const scenePos = this.editor.getSceneCursorXY(event);
        console.log('Text tool mouse down at', scenePos);
      }
    });

    // 平移工具
    this.tools.set(ToolType.PAN, {
      type: ToolType.PAN,
      onMouseDown: (event) => {
        console.log('Pan tool mouse down');
      },
      onMouseMove: (event) => {
        // 处理画布平移
      }
    });

    // 默认激活选择工具
    this.setActiveTool(ToolType.SELECT);
  }

  private bindEvents(): void {
    const canvas = this.editor.canvasElement;

    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleMouseDown(event: MouseEvent): void {
    if (this.currentTool?.onMouseDown) {
      this.currentTool.onMouseDown(event);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.currentTool?.onMouseMove) {
      this.currentTool.onMouseMove(event);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.currentTool?.onMouseUp) {
      this.currentTool.onMouseUp(event);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.currentTool?.onKeyDown) {
      this.currentTool.onKeyDown(event);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (this.currentTool?.onKeyUp) {
      this.currentTool.onKeyUp(event);
    }
  }

  setActiveTool(toolType: ToolType): void {
    // 停用当前工具
    if (this.currentTool?.deactivate) {
      this.currentTool.deactivate();
    }

    // 激活新工具
    const newTool = this.tools.get(toolType);
    if (newTool) {
      this.currentTool = newTool;
      if (newTool.activate) {
        newTool.activate();
      }
    }
  }

  getActiveTool(): ITool | null {
    return this.currentTool;
  }

  getActiveToolType(): ToolType | null {
    return this.currentTool?.type || null;
  }
}