/**
 * 工具状态管理 - 管理画布工具的状态和配置
 * @description 管理当前激活的工具、工具属性、工具历史等状态
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 工具类型枚举
 * @description 定义所有可用的画布工具类型
 */
export enum ToolType {
  SELECT = 'select',
  TEXT = 'text',
  BRUSH = 'brush',
  SHAPE = 'shape',
  IMAGE = 'image',
  CROP = 'crop',
  ERASER = 'eraser',
  EYEDROPPER = 'eyedropper',
  FRAME = "FRAME",
  PEN = "PEN",
  HAND = "HAND",
  ZOOM = "ZOOM",
  RECTANGLE = "RECTANGLE",
  ELLIPSE = "ELLIPSE",
  TRIANGLE = "TRIANGLE",
  STAR = "STAR",
}

/**
 * 形状类型枚举
 * @description 定义形状工具支持的形状类型
 */
export type ShapeType = 
  | 'rectangle'   // 矩形
  | 'circle'      // 圆形
  | 'ellipse'     // 椭圆
  | 'triangle'    // 三角形
  | 'polygon'     // 多边形
  | 'star'        // 星形
  | 'arrow'       // 箭头
  | 'line'        // 直线
  | 'curve'       // 曲线
  | 'diamond';    // 菱形

/**
 * 文本工具属性接口
 * @description 定义文本工具的属性配置
 */
export interface TextToolProperties {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through';
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

/**
 * 画笔工具属性接口
 * @description 定义画笔工具的属性配置
 */
export interface BrushToolProperties {
  size: number;
  opacity: number;
  hardness: number;
  color: string;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  pressure: boolean;
  smoothing: number;
}

/**
 * 形状工具属性接口
 * @description 定义形状工具的属性配置
 */
export interface ShapeToolProperties {
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  borderRadius: number;
  opacity: number;
  sides?: number; // 用于多边形和星形
}

/**
 * 图片工具属性接口
 * @description 定义图片工具的属性配置
 */
export interface ImageToolProperties {
  quality: number;
  format: 'png' | 'jpg' | 'webp' | 'svg';
  maintainAspectRatio: boolean;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sepia: number;
    grayscale: number;
  };
}

/**
 * 裁剪工具属性接口
 * @description 定义裁剪工具的属性配置
 */
export interface CropToolProperties {
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:2' | 'custom';
  customRatio?: { width: number; height: number };
  showGrid: boolean;
  snapToGrid: boolean;
  precision: number;
}

/**
 * 工具属性联合类型
 * @description 所有工具属性的联合类型
 */
export type ToolProperties = 
  | TextToolProperties
  | BrushToolProperties
  | ShapeToolProperties
  | ImageToolProperties
  | CropToolProperties;

/**
 * 工具配置接口
 * @description 定义单个工具的完整配置
 */
export interface ToolConfig {
  id: ToolType;
  name: string;
  icon: string;
  shortcut: string;
  category: 'selection' | 'drawing' | 'text' | 'shape' | 'image' | 'navigation';
  enabled: boolean;
  properties?: ToolProperties;
}

/**
 * 工具历史记录接口
 * @description 记录工具使用历史
 */
export interface ToolHistory {
  toolId: ToolType;
  timestamp: number;
  duration: number;
  properties?: ToolProperties | undefined;
}

/**
 * 工具状态接口
 * @description 定义工具状态管理的完整接口
 */
export interface ToolState {
  // 当前状态
  activeTool: ToolType;
  previousTool: ToolType | null;
  isToolActive: boolean;
  
  // 工具配置
  tools: Record<ToolType, ToolConfig>;
  
  // 工具属性
  textProperties: TextToolProperties;
  brushProperties: BrushToolProperties;
  shapeProperties: ShapeToolProperties;
  imageProperties: ImageToolProperties;
  cropProperties: CropToolProperties;
  
  // 工具历史
  toolHistory: ToolHistory[];
  maxHistorySize: number;
  
  // 快捷键映射
  shortcuts: Record<string, ToolType>;
  
  // 工具操作方法
  setActiveTool: (tool: ToolType) => void;
  switchToPreviousTool: () => void;
  setToolActive: (active: boolean) => void;
  
  // 属性更新方法
  updateTextProperties: (properties: Partial<TextToolProperties>) => void;
  updateBrushProperties: (properties: Partial<BrushToolProperties>) => void;
  updateShapeProperties: (properties: Partial<ShapeToolProperties>) => void;
  updateImageProperties: (properties: Partial<ImageToolProperties>) => void;
  updateCropProperties: (properties: Partial<CropToolProperties>) => void;
  
  // 工具配置方法
  updateToolConfig: (toolId: ToolType, config: Partial<ToolConfig>) => void;
  enableTool: (toolId: ToolType) => void;
  disableTool: (toolId: ToolType) => void;
  
  // 历史记录方法
  addToHistory: (toolId: ToolType, duration: number, properties?: ToolProperties) => void;
  clearHistory: () => void;
  getRecentTools: (count?: number) => ToolHistory[];
  
  // 快捷键方法
  updateShortcut: (key: string, toolId: ToolType) => void;
  getToolByShortcut: (key: string) => ToolType | null;
  
  // 预设方法
  savePreset: (name: string, properties: ToolProperties) => void;
  loadPreset: (name: string) => void;
  getPresets: () => Record<string, ToolProperties>;
  
  // 初始化方法
  initializeTools: () => void;
  resetToDefaults: () => void;
}

/**
 * 默认工具配置
 * @description 定义所有工具的默认配置
 */
const DEFAULT_TOOLS: Record<ToolType, ToolConfig> = {
  [ToolType.SELECT]: {
    id: ToolType.SELECT,
    name: '选择工具',
    icon: 'cursor-arrow',
    shortcut: 'V',
    category: 'selection',
    enabled: true,
  },
  [ToolType.TEXT]: {
    id: ToolType.TEXT,
    name: '文本工具',
    icon: 'type',
    shortcut: 'T',
    category: 'text',
    enabled: true,
  },
  [ToolType.IMAGE]: {
    id: ToolType.IMAGE,
    name: '图片工具',
    icon: 'image',
    shortcut: 'I',
    category: 'image',
    enabled: true,
  },
  [ToolType.SHAPE]: {
    id: ToolType.SHAPE,
    name: '形状工具',
    icon: 'square',
    shortcut: 'R',
    category: 'shape',
    enabled: true,
  },
  [ToolType.BRUSH]: {
    id: ToolType.BRUSH,
    name: '画笔工具',
    icon: 'brush',
    shortcut: 'B',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.CROP]: {
    id: ToolType.CROP,
    name: '裁剪工具',
    icon: 'crop',
    shortcut: 'C',
    category: 'image',
    enabled: true,
  },
  [ToolType.ERASER]: {
    id: ToolType.ERASER,
    name: '橡皮擦',
    icon: 'eraser',
    shortcut: 'E',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.EYEDROPPER]: {
    id: ToolType.EYEDROPPER,
    name: '取色器',
    icon: 'eyedropper',
    shortcut: 'P',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.FRAME]: {
    id: ToolType.FRAME,
    name: '框架工具',
    icon: 'frame',
    shortcut: 'F',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.PEN]: {
    id: ToolType.PEN,
    name: '钢笔工具',
    icon: 'pen',
    shortcut: 'P',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.HAND]: {
    id: ToolType.HAND,
    name: '手工具',
    icon: 'hand',
    shortcut: 'H',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.ZOOM]: {
    id: ToolType.ZOOM,
    name: '缩放工具',
    icon: 'zoom',
    shortcut: 'Z',
    category: 'drawing',
    enabled: true,
  },
  [ToolType.RECTANGLE]: {
    id: ToolType.RECTANGLE,
    name: '矩形工具',
    icon: 'rectangle',
    shortcut: 'R',
    category: 'shape',
    enabled: true,
  },
  [ToolType.ELLIPSE]: {
    id: ToolType.ELLIPSE,
    name: '椭圆工具',
    icon: 'ellipse',
    shortcut: 'E',
    category: 'shape',
    enabled: true,
  },
    [ToolType.TRIANGLE]: {
    id: ToolType.TRIANGLE,
    name: '三角形工具',
    icon: 'triangle',
    shortcut: 'T',
    category: 'shape',
    enabled: true,
  },
  [ToolType.STAR]: {
    id: ToolType.STAR,
    name: '星形工具',
    icon: 'star',
    shortcut: 'S',
    category: 'shape',
    enabled: true,
  },
};

/**
 * 默认文本属性
 */
const DEFAULT_TEXT_PROPERTIES: TextToolProperties = {
  fontSize: 16,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 400,
  fontStyle: 'normal',
  textAlign: 'left',
  textDecoration: 'none',
  lineHeight: 1.5,
  letterSpacing: 0,
  color: '#000000',
};

/**
 * 默认画笔属性
 */
const DEFAULT_BRUSH_PROPERTIES: BrushToolProperties = {
  size: 10,
  opacity: 100,
  hardness: 100,
  color: '#000000',
  blendMode: 'normal',
  pressure: false,
  smoothing: 50,
};

/**
 * 默认形状属性
 */
const DEFAULT_SHAPE_PROPERTIES: ShapeToolProperties = {
  shapeType: 'rectangle',
  fill: '#3b82f6',
  stroke: '#e5e7eb',
  strokeWidth: 1,
  strokeDashArray: [],
  borderRadius: 0,
  opacity: 100,
  sides: 6,
};

/**
 * 默认图片属性
 */
const DEFAULT_IMAGE_PROPERTIES: ImageToolProperties = {
  quality: 90,
  format: 'png',
  maintainAspectRatio: true,
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  },
};

/**
 * 默认裁剪属性
 */
const DEFAULT_CROP_PROPERTIES: CropToolProperties = {
  aspectRatio: 'free',
  showGrid: true,
  snapToGrid: false,
  precision: 1,
};

/**
 * 工具状态存储Hook
 * @description 创建并导出工具状态管理Hook
 * @returns 工具状态存储实例
 * @example
 * const { activeTool, setActiveTool, textProperties } = useToolStore();
 */
export const useToolStore = create<ToolState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      activeTool: ToolType.SELECT,
      previousTool: null,
      isToolActive: false,
      
      tools: DEFAULT_TOOLS,
      
      textProperties: DEFAULT_TEXT_PROPERTIES,
      brushProperties: DEFAULT_BRUSH_PROPERTIES,
      shapeProperties: DEFAULT_SHAPE_PROPERTIES,
      imageProperties: DEFAULT_IMAGE_PROPERTIES,
      cropProperties: DEFAULT_CROP_PROPERTIES,
      
      toolHistory: [],
      maxHistorySize: 50,
      
      shortcuts: {
        'V': ToolType.SELECT,
        'T': ToolType.TEXT,
        'I': ToolType.IMAGE,
        'R': ToolType.SHAPE,
        'B': ToolType.BRUSH,
        'C': ToolType.CROP,
        'F': ToolType.FRAME,
        'P': ToolType.PEN,
        'H': ToolType.HAND,
        'Z': ToolType.ZOOM,
      },
      
      // 工具操作方法
      setActiveTool: (tool: ToolType) => {
        const state = get();
        
        if (state.activeTool === tool) {
          return; // 工具没有变化
        }
        
        // 记录工具使用历史
        if (state.activeTool && state.isToolActive) {
          const now = Date.now();
          const lastHistory = state.toolHistory[state.toolHistory.length - 1];
          const duration = lastHistory ? now - lastHistory.timestamp : 0;
          
          get().addToHistory(state.activeTool, duration);
        }
        
        console.info(`[tool-store] 切换工具: ${state.activeTool} -> ${tool}`);
        
        set({
          previousTool: state.activeTool,
          activeTool: tool,
          isToolActive: true,
        });
      },
      
      switchToPreviousTool: () => {
        const state = get();
        
        if (state.previousTool) {
          console.info(`[tool-store] 切换到上一个工具: ${state.previousTool}`);
          get().setActiveTool(state.previousTool);
        }
      },
      
      setToolActive: (active: boolean) => {
        const state = get();
        
        if (state.isToolActive !== active) {
          set({ isToolActive: active });
        }
      },
      
      // 属性更新方法
      updateTextProperties: (properties: Partial<TextToolProperties>) => {
        const state = get();
        const newProperties = { ...state.textProperties, ...properties };
        
        if (JSON.stringify(state.textProperties) !== JSON.stringify(newProperties)) {
          console.debug('[tool-store] 更新文本属性', { updatedKeys: Object.keys(properties) });
          set({ textProperties: newProperties });
        }
      },
      
      updateBrushProperties: (properties: Partial<BrushToolProperties>) => {
        const state = get();
        const newProperties = { ...state.brushProperties, ...properties };
        
        if (JSON.stringify(state.brushProperties) !== JSON.stringify(newProperties)) {
          console.debug('[tool-store] 更新画笔属性', { updatedKeys: Object.keys(properties) });
          set({ brushProperties: newProperties });
        }
      },
      
      updateShapeProperties: (properties: Partial<ShapeToolProperties>) => {
        const state = get();
        const newProperties = { ...state.shapeProperties, ...properties };
        
        if (JSON.stringify(state.shapeProperties) !== JSON.stringify(newProperties)) {
          console.debug('[tool-store] 更新形状属性', { updatedKeys: Object.keys(properties) });
          set({ shapeProperties: newProperties });
        }
      },
      
      updateImageProperties: (properties: Partial<ImageToolProperties>) => {
        const state = get();
        const newProperties = { ...state.imageProperties, ...properties };
        
        if (JSON.stringify(state.imageProperties) !== JSON.stringify(newProperties)) {
          console.debug('[tool-store] 更新图片属性', { updatedKeys: Object.keys(properties) });
          set({ imageProperties: newProperties });
        }
      },
      
      updateCropProperties: (properties: Partial<CropToolProperties>) => {
        const state = get();
        const newProperties = { ...state.cropProperties, ...properties };
        
        if (JSON.stringify(state.cropProperties) !== JSON.stringify(newProperties)) {
          console.debug('[tool-store] 更新裁剪属性', { updatedKeys: Object.keys(properties) });
          set({ cropProperties: newProperties });
        }
      },
      
      // 工具配置方法
      updateToolConfig: (toolId: ToolType, config: Partial<ToolConfig>) => {
        const state = get();
        const currentConfig = state.tools[toolId];
        
        if (!currentConfig) {
          console.warn(`[tool-store] 尝试更新不存在的工具配置: ${toolId}`);
          return;
        }
        
        const newConfig = { ...currentConfig, ...config };
        const newTools = { ...state.tools, [toolId]: newConfig };
        
        console.debug(`[tool-store] 更新工具配置: ${toolId}`, { updatedKeys: Object.keys(config) });
        
        set({ tools: newTools });
      },
      
      enableTool: (toolId: ToolType) => {
        get().updateToolConfig(toolId, { enabled: true });
      },
      
      disableTool: (toolId: ToolType) => {
        get().updateToolConfig(toolId, { enabled: false });
      },
      
      // 历史记录方法
      addToHistory: (toolId: ToolType, duration: number, properties?: ToolProperties) => {
        const state = get();
        
        const historyEntry: ToolHistory = {
          toolId,
          timestamp: Date.now(),
          duration,
          properties: properties || (undefined as unknown as ToolProperties),
        };
        
        const newHistory = [...state.toolHistory, historyEntry];
        
        // 限制历史记录大小
        if (newHistory.length > state.maxHistorySize) {
          newHistory.splice(0, newHistory.length - state.maxHistorySize);
        }
        
        set({ toolHistory: newHistory });
      },
      
      clearHistory: () => {
        console.info('[tool-store] 清除工具历史记录');
        set({ toolHistory: [] });
      },
      
      getRecentTools: (count = 5) => {
        const state = get();
        return state.toolHistory
          .slice(-count)
          .reverse();
      },
      
      // 快捷键方法
      updateShortcut: (key: string, toolId: ToolType) => {
        const state = get();
        const newShortcuts = { ...state.shortcuts, [key]: toolId };
        
        console.debug(`[tool-store] 更新快捷键: ${key} -> ${toolId}`);
        
        set({ shortcuts: newShortcuts });
      },
      
      getToolByShortcut: (key: string) => {
        const state = get();
        return state.shortcuts[key] || null;
      },
      
      // 预设方法
      savePreset: (name: string, properties: ToolProperties) => {
        try {
          const presets = JSON.parse(localStorage.getItem('tool-presets') || '{}');
          presets[name] = properties;
          localStorage.setItem('tool-presets', JSON.stringify(presets));
          
          console.info(`[tool-store] 保存工具预设: ${name}`);
        } catch (error) {
          console.error('[tool-store] 保存预设失败:', error);
        }
      },
      
      loadPreset: (name: string) => {
        try {
          const presets = JSON.parse(localStorage.getItem('tool-presets') || '{}');
          const preset = presets[name];
          
          if (preset) {
            // 根据预设类型更新对应的属性
            // 这里需要根据预设的结构来判断类型
            console.info(`[tool-store] 加载工具预设: ${name}`);
          } else {
            console.warn(`[tool-store] 预设不存在: ${name}`);
          }
        } catch (error) {
          console.error('[tool-store] 加载预设失败:', error);
        }
      },
      
      getPresets: () => {
        try {
          return JSON.parse(localStorage.getItem('tool-presets') || '{}');
        } catch (error) {
          console.error('[tool-store] 获取预设失败:', error);
          return {};
        }
      },
      
      // 初始化方法
      initializeTools: () => {
        console.info('[tool-store] 初始化工具系统');
        
        // 从本地存储加载用户配置
        try {
          const savedConfig = localStorage.getItem('tool-config');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            
            // 合并保存的配置
            set({
              textProperties: { ...DEFAULT_TEXT_PROPERTIES, ...config.textProperties },
              brushProperties: { ...DEFAULT_BRUSH_PROPERTIES, ...config.brushProperties },
              shapeProperties: { ...DEFAULT_SHAPE_PROPERTIES, ...config.shapeProperties },
              imageProperties: { ...DEFAULT_IMAGE_PROPERTIES, ...config.imageProperties },
              cropProperties: { ...DEFAULT_CROP_PROPERTIES, ...config.cropProperties },
              shortcuts: { ...get().shortcuts, ...config.shortcuts },
            });
            
            console.info('[tool-store] 加载用户工具配置');
          }
        } catch (error) {
          console.warn('[tool-store] 加载用户配置失败，使用默认配置:', error);
        }
      },
      
      resetToDefaults: () => {
        console.info('[tool-store] 重置工具配置到默认值');
        
        set({
          activeTool: ToolType.SELECT,
          previousTool: null,
          isToolActive: false,
          tools: DEFAULT_TOOLS,
          textProperties: DEFAULT_TEXT_PROPERTIES,
          brushProperties: DEFAULT_BRUSH_PROPERTIES,
          shapeProperties: DEFAULT_SHAPE_PROPERTIES,
          imageProperties: DEFAULT_IMAGE_PROPERTIES,
          cropProperties: DEFAULT_CROP_PROPERTIES,
          toolHistory: [],
          shortcuts: {
            'V': ToolType.SELECT,
            'T': ToolType.TEXT,
            'I': ToolType.IMAGE,
            'R': ToolType.SHAPE,
            'B': ToolType.BRUSH,
            'C': ToolType.CROP,
            'F': ToolType.FRAME,
            'P': ToolType.PEN,
            'H': ToolType.HAND,
            'Z': ToolType.ZOOM,
          },
        });
        
        // 清除本地存储的配置
        localStorage.removeItem('tool-config');
        localStorage.removeItem('tool-presets');
      },
    }),
    {
      name: 'gaf-tool-store',
    }
  )
);