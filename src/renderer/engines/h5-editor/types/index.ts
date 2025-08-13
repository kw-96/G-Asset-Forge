// H5-Editor类型定义 - 增强版本
export interface IH5Point {
  x: number;
  y: number;
}

export interface IH5Size {
  width: number;
  height: number;
}

export interface IH5Bounds extends IH5Point, IH5Size {}

export interface IH5Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface IH5Style {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface IH5Animation {
  id: string;
  name: string;
  duration: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
  keyframes: Array<{
    time: number; // 0-1
    properties: Record<string, any>;
  }>;
}

export interface IH5Interaction {
  id: string;
  type: 'click' | 'hover' | 'scroll' | 'custom';
  trigger: {
    componentId: string;
    event: string;
  };
  action: {
    type: 'navigate' | 'animate' | 'show' | 'hide' | 'custom';
    target?: string;
    parameters?: Record<string, any>;
  };
}

export interface IH5ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number; // 0-1
  scale: number; // 0.1-5
  transparent: boolean;
  includeBackground: boolean;
  cropToContent: boolean;
  maxFileSize?: number; // bytes
}

export interface IH5ExportResult {
  success: boolean;
  dataUrl?: string;
  blob?: Blob;
  size: number;
  format: string;
  dimensions: { width: number; height: number };
  error?: string;
}

export interface IH5PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  pageCount: number;
  fps: number;
  lastUpdateTime: Date;
}

export interface IH5EditorState {
  currentPageId: string | null;
  selectedComponentIds: string[];
  clipboard: any[];
  zoom: number;
  pan: IH5Point;
  gridEnabled: boolean;
  snapToGrid: boolean;
  previewMode: boolean;
  isDirty: boolean;
}

export interface IH5ComponentConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  lockAspectRatio?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
}

export interface IH5LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  componentIds: string[];
  parentId?: string;
  childIds: string[];
}

// 导出核心类型和类
export {
  H5Editor,
  type IH5EditorOptions,
  type IH5Page,
  type IH5Component,
  type IH5Template,
  type IH5ComponentLibraryItem,
  type IH5EditorEvents
} from '../core/h5-editor';

export {
  H5EditorManager,
  type IH5EditorManagerOptions,
  type IH5EditorManagerEvents,
  type IH5Project
} from '../core/h5-editor-manager';

export {
  type IH5EditorCanvasProps,
  type IH5EditorCanvasRef
} from '../adapter/react-adapter';

export {
  type IVueComponentProps,
  type IVueToReactAdapterOptions
} from '../adapter/vue-to-react-adapter';