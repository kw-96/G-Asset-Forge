// H5-Editor类型定义 - 增强版本
export interface H5Point {
  x: number;
  y: number;
}

export interface H5Size {
  width: number;
  height: number;
}

export interface H5Bounds extends H5Point, H5Size {}

export interface H5Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface H5Style {
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

export interface H5Animation {
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

export interface H5Interaction {
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

export interface H5ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number; // 0-1
  scale: number; // 0.1-5
  transparent: boolean;
  includeBackground: boolean;
  cropToContent: boolean;
  maxFileSize?: number; // bytes
}

export interface H5ExportResult {
  success: boolean;
  dataUrl?: string;
  blob?: Blob;
  size: number;
  format: string;
  dimensions: { width: number; height: number };
  error?: string;
}

export interface H5PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  pageCount: number;
  fps: number;
  lastUpdateTime: Date;
}

export interface H5EditorState {
  currentPageId: string | null;
  selectedComponentIds: string[];
  clipboard: any[];
  zoom: number;
  pan: H5Point;
  gridEnabled: boolean;
  snapToGrid: boolean;
  previewMode: boolean;
  isDirty: boolean;
}

export interface H5ComponentConstraints {
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

export interface H5LayerInfo {
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
  type H5EditorOptions,
  type H5Page,
  type H5Component,
  type H5Template,
  type H5ComponentLibraryItem,
  type H5EditorEvents
} from '../core/h5-editor';

export {
  H5EditorManager,
  type H5EditorManagerOptions,
  type H5EditorManagerEvents,
  type H5Project
} from '../core/h5-editor-manager';

export {
  type H5EditorCanvasProps,
  type H5EditorCanvasRef
} from '../adapter/react-adapter';

export {
  type VueComponentProps,
  type VueToReactAdapterOptions
} from '../adapter/vue-to-react-adapter';