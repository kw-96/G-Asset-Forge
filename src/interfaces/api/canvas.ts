/**
 * 画布API接口定义
 * @description 定义画布相关的所有API接口
 * @author 开发团队
 */
import type { 
  APIResponse, 
  QueryParams, 
  BatchOperationParams, 
  BatchOperationResponse,
  ExportParams,
  ExportResponse
} from './base';
import type { CanvasElement, ViewportTransform, CanvasConfig, CanvasState } from '../types/canvas';



/**
 * 元素创建参数接口
 */
export interface CreateElementParams {
  type: CanvasElement['type'];
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Partial<CanvasElement>;
}

/**
 * 元素更新参数接口
 */
export interface UpdateElementParams {
  id: string;
  updates: Partial<CanvasElement>;
}

/**
 * 元素查询参数接口
 */
export interface ElementQueryParams extends QueryParams {
  filter?: {
    type?: CanvasElement['type'];
    visible?: boolean;
    locked?: boolean;
    tags?: string[];
  };
}

/**
 * 画布导出选项接口
 */
export interface CanvasExportOptions extends ExportParams {
  includeBackground?: boolean;
  selectedOnly?: boolean;
  scale?: number;
  quality?: number;
  transparent?: boolean;
}

/**
 * 画布API接口
 */
export interface CanvasAPI {
  /**
   * 获取画布状态
   */
  getCanvasState(canvasId: string): Promise<APIResponse<CanvasState>>;

  /**
   * 更新画布配置
   */
  updateCanvasConfig(
    canvasId: string, 
    config: Partial<CanvasConfig>
  ): Promise<APIResponse<CanvasConfig>>;

  /**
   * 创建元素
   */
  createElement(
    canvasId: string, 
    params: CreateElementParams
  ): Promise<APIResponse<CanvasElement>>;

  /**
   * 获取元素
   */
  getElement(
    canvasId: string, 
    elementId: string
  ): Promise<APIResponse<CanvasElement>>;

  /**
   * 更新元素
   */
  updateElement(
    canvasId: string, 
    params: UpdateElementParams
  ): Promise<APIResponse<CanvasElement>>;

  /**
   * 删除元素
   */
  deleteElement(
    canvasId: string, 
    elementId: string
  ): Promise<APIResponse<void>>;

  /**
   * 查询元素列表
   */
  getElements(
    canvasId: string, 
    params?: ElementQueryParams
  ): Promise<APIResponse<CanvasElement[]>>;

  /**
   * 批量操作元素
   */
  batchOperateElements(
    canvasId: string,
    params: BatchOperationParams<CanvasElement>
  ): Promise<APIResponse<BatchOperationResponse<CanvasElement>>>;

  /**
   * 复制元素
   */
  duplicateElements(
    canvasId: string,
    elementIds: string[]
  ): Promise<APIResponse<CanvasElement[]>>;

  /**
   * 移动元素
   */
  moveElements(
    canvasId: string,
    elementIds: string[],
    deltaX: number,
    deltaY: number
  ): Promise<APIResponse<CanvasElement[]>>;

  /**
   * 调整元素层级
   */
  reorderElements(
    canvasId: string,
    elementIds: string[],
    direction: 'front' | 'back' | 'forward' | 'backward'
  ): Promise<APIResponse<CanvasElement[]>>;

  /**
   * 选择元素
   */
  selectElements(
    canvasId: string,
    elementIds: string[]
  ): Promise<APIResponse<void>>;

  /**
   * 清除选择
   */
  clearSelection(canvasId: string): Promise<APIResponse<void>>;

  /**
   * 设置视口变换
   */
  setViewport(
    canvasId: string,
    transform: ViewportTransform
  ): Promise<APIResponse<ViewportTransform>>;

  /**
   * 缩放到适合
   */
  zoomToFit(
    canvasId: string,
    elementIds?: string[]
  ): Promise<APIResponse<ViewportTransform>>;

  /**
   * 重置视图
   */
  resetView(canvasId: string): Promise<APIResponse<ViewportTransform>>;

  /**
   * 撤销操作
   */
  undo(canvasId: string): Promise<APIResponse<CanvasState>>;

  /**
   * 重做操作
   */
  redo(canvasId: string): Promise<APIResponse<CanvasState>>;

  /**
   * 清除历史记录
   */
  clearHistory(canvasId: string): Promise<APIResponse<void>>;

  /**
   * 导出画布
   */
  exportCanvas(
    canvasId: string,
    options: CanvasExportOptions
  ): Promise<APIResponse<ExportResponse>>;

  /**
   * 获取画布缩略图
   */
  getThumbnail(
    canvasId: string,
    size?: { width: number; height: number }
  ): Promise<APIResponse<{ url: string; size: { width: number; height: number } }>>;

  /**
   * 获取画布性能指标
   */
  getPerformanceMetrics(canvasId: string): Promise<APIResponse<{
    fps: number;
    memoryUsage: number;
    renderTime: number;
    elementCount: number;
    lastUpdate: string;
  }>>;

  /**
   * 切换引擎
   */
  switchEngine(
    canvasId: string,
    engineType: 'suika' // 已移除H5-editor引擎，仅保留Suika引擎
  ): Promise<APIResponse<CanvasState>>;
}

/**
 * 画布事件接口
 */
export interface CanvasEvents {
  'canvas:element-created': { canvasId: string; element: CanvasElement };
  'canvas:element-updated': { canvasId: string; element: CanvasElement };
  'canvas:element-deleted': { canvasId: string; elementId: string };
  'canvas:selection-changed': { canvasId: string; selectedIds: string[] };
  'canvas:viewport-changed': { canvasId: string; viewport: ViewportTransform };
  'canvas:config-changed': { canvasId: string; config: CanvasConfig };
  'canvas:history-changed': { canvasId: string; canUndo: boolean; canRedo: boolean };
  'canvas:performance-warning': { canvasId: string; metric: string; value: number };
  'canvas:engine-switched': { canvasId: string; engineType: string };
}

/**
 * 画布错误代码
 */
export enum CanvasErrorCode {
  CANVAS_NOT_FOUND = 'CANVAS_NOT_FOUND',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  INVALID_ELEMENT_TYPE = 'INVALID_ELEMENT_TYPE',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  SELECTION_EMPTY = 'SELECTION_EMPTY',
  OPERATION_NOT_SUPPORTED = 'OPERATION_NOT_SUPPORTED',
  ENGINE_SWITCH_FAILED = 'ENGINE_SWITCH_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  PERFORMANCE_THRESHOLD_EXCEEDED = 'PERFORMANCE_THRESHOLD_EXCEEDED',
}

/**
 * 画布错误消息映射
 */
export const CanvasErrorMessages: Record<CanvasErrorCode, string> = {
  [CanvasErrorCode.CANVAS_NOT_FOUND]: '画布不存在',
  [CanvasErrorCode.ELEMENT_NOT_FOUND]: '元素不存在',
  [CanvasErrorCode.INVALID_ELEMENT_TYPE]: '无效的元素类型',
  [CanvasErrorCode.INVALID_COORDINATES]: '无效的坐标',
  [CanvasErrorCode.INVALID_DIMENSIONS]: '无效的尺寸',
  [CanvasErrorCode.SELECTION_EMPTY]: '没有选中的元素',
  [CanvasErrorCode.OPERATION_NOT_SUPPORTED]: '不支持的操作',
  [CanvasErrorCode.ENGINE_SWITCH_FAILED]: '引擎切换失败',
  [CanvasErrorCode.EXPORT_FAILED]: '导出失败',
  [CanvasErrorCode.PERFORMANCE_THRESHOLD_EXCEEDED]: '性能阈值超限',
};