// 画布元素基础类型
export interface CanvasElement {
  id: string;
  name: string;
  type: 'rectangle' | 'ellipse' | 'text' | 'image' | 'frame' | 'brush' | 'crop' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  opacity?: number;
  
  // 文本特有属性
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  
  // 图片特有属性
  imageData?: {
    src: string;
    originalWidth: number;
    originalHeight: number;
    cropArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  
  // 画笔特有属性
  brushData?: {
    points: Array<{ x: number; y: number; pressure?: number }>;
    settings: {
      size: number;
      opacity: number;
      color: string;
      hardness: number;
    };
  };
}

// 工具类型
export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'rectangle' 
  | 'ellipse' 
  | 'triangle'
  | 'star'
  | 'text' 
  | 'image' 
  | 'frame'
  | 'brush'
  | 'crop';

// 画布状态
export interface CanvasState {
  elements: Record<string, CanvasElement>;
  selectedElements: string[];
  activeTool: ToolType;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRuler: boolean;
  snapToGrid: boolean;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  timestamp: number;
  action: string;
  data: any;
  elements: Record<string, CanvasElement>;
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg';
  quality: number; // 1-100
  scale: number;
  transparent: boolean;
  selectedOnly: boolean;
}

// 画布配置
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  snapThreshold: number;
}