/**
 * 画布相关类型定义
 * @description 定义画布、元素、视口等相关的数据类型
 * @author 开发团队
 */

/**
 * 画布元素类型枚举
 */
export enum ElementType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  BRUSH = 'brush',
  GROUP = 'group',
  FRAME = 'frame',
}

/**
 * 形状类型枚举
 */
export enum ShapeType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  POLYGON = 'polygon',
  STAR = 'star',
  LINE = 'line',
  ARROW = 'arrow',
}

/**
 * 文本对齐方式枚举
 */
export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

/**
 * 混合模式枚举
 */
export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  SOFT_LIGHT = 'soft-light',
  HARD_LIGHT = 'hard-light',
  COLOR_DODGE = 'color-dodge',
  COLOR_BURN = 'color-burn',
  DARKEN = 'darken',
  LIGHTEN = 'lighten',
  DIFFERENCE = 'difference',
  EXCLUSION = 'exclusion',
}

/**
 * 基础变换接口
 */
export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
}

/**
 * 视口变换接口
 */
export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
}

/**
 * 颜色定义接口
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * 渐变停止点接口
 */
export interface GradientStop {
  offset: number;
  color: Color | string;
}

/**
 * 渐变定义接口
 */
export interface Gradient {
  type: 'linear' | 'radial' | 'conic';
  stops: GradientStop[];
  angle?: number;
  centerX?: number;
  centerY?: number;
  radiusX?: number;
  radiusY?: number;
}

/**
 * 阴影定义接口
 */
export interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread?: number;
  color: Color | string;
  inset?: boolean;
}

/**
 * 描边定义接口
 */
export interface Stroke {
  color: Color | string | Gradient;
  width: number;
  style?: 'solid' | 'dashed' | 'dotted';
  dashArray?: number[];
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
}

/**
 * 填充定义接口
 */
export interface Fill {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: Color | string;
  gradient?: Gradient;
  patternId?: string;
  imageUrl?: string;
  opacity?: number;
}

/**
 * 文本样式接口
 */
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | 'normal' | 'bold';
  fontStyle: 'normal' | 'italic' | 'oblique';
  textAlign: TextAlign;
  textDecoration: 'none' | 'underline' | 'overline' | 'line-through';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * 图片数据接口
 */
export interface ImageData {
  src: string;
  originalWidth: number;
  originalHeight: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: Array<{
    type: string;
    value: number;
  }>;
}

/**
 * 画笔数据接口
 */
export interface BrushData {
  points: Array<{
    x: number;
    y: number;
    pressure?: number;
    timestamp?: number;
  }>;
  settings: {
    size: number;
    opacity: number;
    hardness: number;
    color: string;
    blendMode: BlendMode;
  };
  svgPath?: string;
}

/**
 * 形状数据接口
 */
export interface ShapeData {
  type: ShapeType;
  points?: Array<{ x: number; y: number }>;
  radius?: number;
  sides?: number;
  innerRadius?: number;
  cornerRadius?: number;
}

/**
 * 画布元素基础接口
 */
export interface BaseCanvasElement {
  id: string;
  name: string;
  type: ElementType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  fill?: Fill | undefined;
  stroke?: Stroke | undefined;
  shadow?: Shadow[] | undefined;
  filters?: Array<{
    type: string;
    enabled: boolean;
    properties: Record<string, any>;
  }> | undefined;
  metadata?: Record<string, any> | undefined;
  createdAt: string;
  updatedAt: string;
}

/**
 * 文本元素接口
 */
export interface TextElement extends BaseCanvasElement {
  type: ElementType.TEXT;
  content: string;
  style: TextStyle;
  autoResize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 图片元素接口
 */
export interface ImageElement extends BaseCanvasElement {
  type: ElementType.IMAGE;
  imageData: ImageData;
  preserveAspectRatio?: boolean;
}

/**
 * 形状元素接口
 */
export interface ShapeElement extends BaseCanvasElement {
  type: ElementType.SHAPE;
  shapeData: ShapeData;
}

/**
 * 画笔元素接口
 */
export interface BrushElement extends BaseCanvasElement {
  type: ElementType.BRUSH;
  brushData: BrushData;
}

/**
 * 组合元素接口
 */
export interface GroupElement extends BaseCanvasElement {
  type: ElementType.GROUP;
  children: string[];
  clipToBounds?: boolean;
}

/**
 * 框架元素接口
 */
export interface FrameElement extends BaseCanvasElement {
  type: ElementType.FRAME;
  children: string[];
  clipToBounds: boolean;
  backgroundColor?: Fill;
  showBackground?: boolean;
}

/**
 * 画布元素联合类型
 */
export type CanvasElement = 
  | TextElement 
  | ImageElement 
  | ShapeElement 
  | BrushElement 
  | GroupElement 
  | FrameElement;

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  size: any;
  width: number;
  height: number;
  backgroundColor: Fill;
  gridEnabled: boolean;
  gridSize: number;
  gridColor: Color | string;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showRulers: boolean;
  rulerUnit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  engineType: 'suika' | 'h5-editor';
  enableGPUAcceleration: boolean;
  maxTextureSize: number;
  targetFPS: number;
}

/**
 * 画布状态接口
 */
export interface CanvasState {
  id: string;
  name: string;
  config: CanvasConfig;
  elements: CanvasElement[];
  selectedElementIds: string[];
  viewport: ViewportTransform;
  history: {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
    totalSteps: number;
    maxSteps: number;
  };
  performance: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    elementCount: number;
    lastUpdate: string;
  };
  isModified: boolean;
  lastSaved?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 画布事件数据接口
 */
export interface CanvasEventData {
  canvasId: string;
  timestamp: string;
  userId?: string;
}

/**
 * 元素事件数据接口
 */
export interface ElementEventData extends CanvasEventData {
  elementId: string;
  elementType: ElementType;
}

/**
 * 选择事件数据接口
 */
export interface SelectionEventData extends CanvasEventData {
  selectedIds: string[];
  previousSelectedIds: string[];
}

/**
 * 视口事件数据接口
 */
export interface ViewportEventData extends CanvasEventData {
  viewport: ViewportTransform;
  previousViewport: ViewportTransform;
}

/**
 * 历史事件数据接口
 */
export interface HistoryEventData extends CanvasEventData {
  action: 'undo' | 'redo' | 'clear';
  canUndo: boolean;
  canRedo: boolean;
  currentIndex: number;
}

/**
 * 性能事件数据接口
 */
export interface PerformanceEventData extends CanvasEventData {
  metric: 'fps' | 'memory' | 'renderTime';
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
}

/**
 * 类型守卫函数
 */
export function isTextElement(element: CanvasElement): element is TextElement {
  return element.type === ElementType.TEXT;
}

export function isImageElement(element: CanvasElement): element is ImageElement {
  return element.type === ElementType.IMAGE;
}

export function isShapeElement(element: CanvasElement): element is ShapeElement {
  return element.type === ElementType.SHAPE;
}

export function isBrushElement(element: CanvasElement): element is BrushElement {
  return element.type === ElementType.BRUSH;
}

export function isGroupElement(element: CanvasElement): element is GroupElement {
  return element.type === ElementType.GROUP;
}

export function isFrameElement(element: CanvasElement): element is FrameElement {
  return element.type === ElementType.FRAME;
}