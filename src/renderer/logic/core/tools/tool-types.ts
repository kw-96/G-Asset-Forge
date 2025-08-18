/**
 * 工具系统类型定义
 * @description 定义工具类型、配置、状态等核心功能
 * @author 开发团队
 */

export enum ToolType {
  SELECT = 'select',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  IMAGE = 'image',
  BRUSH = 'brush',
  CROP = 'crop',
  PAN = 'pan',
  ZOOM = 'zoom',
  LINE = 'line',
  POLYGON = 'polygon',
  STAR = 'star'
}

export interface ToolConfig {
  type: ToolType;
  name: string;
  icon: string;
  shortcut?: string;
  cursor?: string;
}

export interface ToolState {
  isActive: boolean;
  isDragging: boolean;
  startPoint?: { x: number; y: number } | undefined;
  currentPoint?: { x: number; y: number } | undefined;
  properties: Record<string, any>;
}

export interface Tool {
  type: ToolType;
  config: ToolConfig;
  state: ToolState;
  
  activate(): void;
  deactivate(): void;
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  render?(ctx: CanvasRenderingContext2D): void;
}

export interface ToolProperties {
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