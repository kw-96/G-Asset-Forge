// 工具系统类型定义
export enum ToolType {
  SELECT = 'select',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  IMAGE = 'image',
  BRUSH = 'brush',
  CROP = 'crop',
  PAN = 'pan',
  ZOOM = 'zoom'
}

export interface IToolConfig {
  type: ToolType;
  name: string;
  icon: string;
  shortcut?: string;
  cursor?: string;
}

export interface IToolState {
  isActive: boolean;
  isDragging: boolean;
  startPoint?: { x: number; y: number };
  currentPoint?: { x: number; y: number };
  properties: Record<string, any>;
}

export interface ITool {
  type: ToolType;
  config: IToolConfig;
  state: IToolState;
  
  activate(): void;
  deactivate(): void;
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  render?(ctx: CanvasRenderingContext2D): void;
}

export interface IToolProperties {
  // 通用属性
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  
  // 文本属性
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // 画笔属性
  brushSize?: number;
  brushOpacity?: number;
  brushHardness?: number;
  
  // 形状属性
  cornerRadius?: number;
  
  // 图片属性
  imageFilter?: string;
  
  // 索引签名
  [key: string]: any;
}