/**
 * 工具配置 - 定义所有工具的默认设置和快捷键
 * @description 提供工具的配置管理和默认值
 * @author 开发团队
 */
import { BlendMode } from '../../../../interfaces/types/canvas';
import type { BrushSettings } from './BrushTool';
import type { CropSettings } from './CropTool';
import type { SelectToolSettings } from './SelectTool';
import type { TextSettings } from './TextTool';
import { ToolType } from '../../../stores/toolStore';

/**
 * 工具类型 - 使用字符串字面量类型避免与stores层冲突
 */
type LocalToolType = 
  | 'select' | 'text' | 'brush' | 'shape' | 'image' | 'crop' | 'eraser' | 'eyedropper'
  | 'hand' | 'rectangle' | 'ellipse' | 'triangle' | 'star' | 'frame';

/**
 * 工具快捷键映射
 */
export const TOOL_SHORTCUTS: Record<LocalToolType, string> = {
  select: 'V',
  text: 'T',
  brush: 'B',
  shape: 'R',
  image: 'I',
  crop: 'C',
  eraser: 'E',
  eyedropper: 'P',
  hand: 'H',
  rectangle: 'R',
  ellipse: 'E',
  triangle: 'T',
  star: 'S',
  frame: 'F',
};

/**
 * 工具显示名称
 */
export const TOOL_NAMES: Record<LocalToolType, string> = {
  select: '选择工具',
  text: '文本工具',
  brush: '画笔工具',
  shape: '形状工具',
  image: '图片工具',
  crop: '裁剪工具',
  eraser: '橡皮擦',
  eyedropper: '取色器',
  hand: '抓手工具',
  rectangle: '矩形工具',
  ellipse: '椭圆工具',
  triangle: '三角形工具',
  star: '星形工具',
  frame: '框架工具',
};

/**
 * 工具描述
 */
export const TOOL_DESCRIPTIONS: Record<LocalToolType, string> = {
  select: '选择、移动和变换元素',
  text: '创建和编辑文本',
  brush: '自由绘制和涂鸦',
  shape: '创建几何形状',
  image: '插入和编辑图片',
  crop: '裁剪图片和元素',
  eraser: '擦除画布内容',
  eyedropper: '提取颜色',
  hand: '移动和缩放元素',
  rectangle: '创建矩形',
  ellipse: '创建椭圆',
  triangle: '创建三角形',
  star: '创建星形',
  frame: '创建框架',
};

/**
 * 工具图标
 */
export const TOOL_ICONS: Record<LocalToolType, string> = {
  select: 'cursor-arrow',
  text: 'text',
  brush: 'pencil-1',
  shape: 'square',
  image: 'image',
  crop: 'crop',
  eraser: 'eraser',
  eyedropper: 'eyedropper',
  hand: 'hand',
  rectangle: 'rectangle',
  ellipse: 'ellipse',
  triangle: 'triangle',
  star: 'star',
  frame: 'frame',
};

/**
 * 选择工具默认设置
 */
export const DEFAULT_SELECT_SETTINGS: SelectToolSettings = {
  selectionMode: 'single' as any,
  showBounds: true,
  showHandles: true,
  snapToGrid: false,
  gridSize: 10,
  multiSelectKey: 'ctrl',
  enableRotation: true,
  constrainProportions: false,
};

/**
 * 文本工具默认设置
 */
export const DEFAULT_TEXT_SETTINGS: TextSettings = {
  fontSize: 16,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 400,
  fontStyle: 'normal',
  textAlign: 'left',
  textDecoration: 'none',
  lineHeight: 1.5,
  letterSpacing: 0,
  color: '#000000',
  padding: {
    top: 8,
    right: 12,
    bottom: 8,
    left: 12,
  },
};

/**
 * 画笔工具默认设置
 */
export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  size: 10,
  opacity: 100,
  color: '#000000',
  hardness: 100,
  blendMode: BlendMode.NORMAL as BlendMode,
  pressure: false,
  smoothing: 50,
};

/**
 * 裁剪工具默认设置
 */
export const DEFAULT_CROP_SETTINGS: CropSettings = {
  maintainAspectRatio: false,
  minWidth: 10,
  minHeight: 10,
  snapToGrid: false,
  gridSize: 10,
  showGuides: true,
  previewMode: false,
};

/**
 * 形状工具默认设置
 */
export interface ShapeSettings {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'star' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  sides: number; // 用于多边形和星形
}

export const DEFAULT_SHAPE_SETTINGS: ShapeSettings = {
  shapeType: 'rectangle',
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
  cornerRadius: 0,
  sides: 6,
};

/**
 * 图片工具默认设置
 */
export interface ImageSettings {
  maintainAspectRatio: boolean;
  allowResize: boolean;
  quality: number;
  format: 'png' | 'jpg' | 'webp';
  maxWidth: number;
  maxHeight: number;
}

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  maintainAspectRatio: true,
  allowResize: true,
  quality: 90,
  format: 'png',
  maxWidth: 2048,
  maxHeight: 2048,
};

/**
 * 橡皮擦工具默认设置
 */
export interface EraserSettings {
  size: number;
  hardness: number;
  opacity: number;
  mode: 'pixel' | 'object';
}

export const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  size: 20,
  hardness: 100,
  opacity: 100,
  mode: 'pixel',
};

/**
 * 取色器工具默认设置
 */
export interface EyedropperSettings {
  sampleSize: 1 | 3 | 5 | 11;
  showPreview: boolean;
  copyToClipboard: boolean;
  includeAlpha: boolean;
}

export const DEFAULT_EYEDROPPER_SETTINGS: EyedropperSettings = {
  sampleSize: 1,
  showPreview: true,
  copyToClipboard: true,
  includeAlpha: true,
};

/**
 * 所有工具的默认设置
 */
export const TOOL_DEFAULTS = {
  [ToolType.SELECT]: DEFAULT_SELECT_SETTINGS,
  [ToolType.TEXT]: DEFAULT_TEXT_SETTINGS,
  [ToolType.BRUSH]: DEFAULT_BRUSH_SETTINGS,
  [ToolType.SHAPE]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.IMAGE]: DEFAULT_IMAGE_SETTINGS,
  [ToolType.CROP]: DEFAULT_CROP_SETTINGS,
  [ToolType.ERASER]: DEFAULT_ERASER_SETTINGS,
  [ToolType.EYEDROPPER]: DEFAULT_EYEDROPPER_SETTINGS,
  [ToolType.HAND]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.RECTANGLE]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.ELLIPSE]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.TRIANGLE]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.STAR]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.FRAME]: DEFAULT_SHAPE_SETTINGS,
  [ToolType.PEN]: DEFAULT_SHAPE_SETTINGS,
} as const;

/**
 * 工具分组
 */
export const TOOL_GROUPS = {
  selection: [ToolType.SELECT],
  drawing: [ToolType.BRUSH, ToolType.ERASER],
  content: [ToolType.TEXT, ToolType.IMAGE, ToolType.SHAPE],
  editing: [ToolType.CROP, ToolType.EYEDROPPER],
} as const;

/**
 * 工具组显示名称
 */
export const TOOL_GROUP_NAMES = {
  selection: '选择工具',
  drawing: '绘图工具',
  content: '内容工具',
  editing: '编辑工具',
} as const;

/**
 * 获取工具默认设置
 */
export function getToolDefaults<T extends keyof typeof TOOL_DEFAULTS>(toolType: T): typeof TOOL_DEFAULTS[T] {
  return TOOL_DEFAULTS[toolType] as typeof TOOL_DEFAULTS[T];
}

/**
 * 获取工具信息
 */
export function getToolInfo(toolType: ToolType) {
  return {
    type: toolType,
    name: TOOL_NAMES[toolType as LocalToolType],
    description: TOOL_DESCRIPTIONS[toolType as LocalToolType],
    icon: TOOL_ICONS[toolType as keyof typeof TOOL_ICONS],
    shortcut: TOOL_SHORTCUTS[toolType as keyof typeof TOOL_SHORTCUTS],
    defaults: TOOL_DEFAULTS[toolType as keyof typeof TOOL_DEFAULTS],
  };
}

export function getAllToolsInfo() {
  return Object.values(ToolType).map(toolType => getToolInfo(toolType));
}

/**
 * 根据快捷键获取工具类型
 */
export function getToolByShortcut(key: string): ToolType | null {
  const upperKey = key.toUpperCase();
  for (const [toolType, shortcut] of Object.entries(TOOL_SHORTCUTS)) {
    if (shortcut === upperKey) {
      return toolType as ToolType;
    }
  }
  return null;
}

/**
 * 检查工具是否支持某个功能
 */
export function toolSupportsFeature(toolType: ToolType, feature: string): boolean {
  const featureMap: Record<string, ToolType[]> = {
    selection: [ToolType.SELECT],
    drawing: [ToolType.BRUSH, ToolType.ERASER],
    text: [ToolType.TEXT],
    shapes: [ToolType.SHAPE],
    images: [ToolType.IMAGE, ToolType.CROP],
    colors: [ToolType.BRUSH, ToolType.SHAPE, ToolType.TEXT, ToolType.EYEDROPPER],
    transform: [ToolType.SELECT, ToolType.CROP],
    keyboard: Object.values(ToolType),
  };

  return featureMap[feature]?.includes(toolType) ?? false;
}

/**
 * 工具兼容性检查
 */
export function areToolsCompatible(tool1: ToolType, tool2: ToolType): boolean {
  // 定义不兼容的工具组合
  const incompatiblePairs: Array<[ToolType, ToolType]> = [
    [ToolType.BRUSH, ToolType.ERASER], // 画笔和橡皮擦不能同时使用
    [ToolType.SELECT, ToolType.BRUSH], // 选择和画笔不能同时使用
    [ToolType.TEXT, ToolType.CROP],    // 文本编辑和裁剪不能同时使用
  ];

  return !incompatiblePairs.some(
    ([t1, t2]) => (t1 === tool1 && t2 === tool2) || (t1 === tool2 && t2 === tool1)
  );
}

/**
 * 获取工具的推荐设置
 */
export function getRecommendedSettings(toolType: ToolType, context?: 'beginner' | 'advanced' | 'performance') {
  const baseSettings = getToolDefaults(toolType as keyof typeof TOOL_DEFAULTS);
  
  if (!context) return baseSettings;

  // 根据上下文调整设置
  switch (context) {
    case 'beginner':
      if (toolType === ToolType.BRUSH) {
        return { ...baseSettings, size: 15, smoothing: 70 };
      }
      if (toolType === ToolType.SELECT) {
        return { ...baseSettings, snapToGrid: true, showHandles: true };
      }
      break;
      
    case 'advanced':
      if (toolType === ToolType.BRUSH) {
        return { ...baseSettings, pressure: true, smoothing: 30 };
      }
      if (toolType === ToolType.SELECT) {
        return { ...baseSettings, enableRotation: true, constrainProportions: false };
      }
      break;
      
    case 'performance':
      if (toolType === ToolType.BRUSH) {
        return { ...baseSettings, smoothing: 20 };
      }
      break;
  }

  return baseSettings;
}

