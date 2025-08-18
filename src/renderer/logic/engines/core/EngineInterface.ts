/**
 * 引擎接口定义 - 统一的画布引擎接口
 * @description 定义所有画布引擎必须实现的标准接口
 * @author 开发团队
 */

import type { CanvasElement } from '../../../../interfaces/types/canvas';

/**
 * 引擎类型枚举
 */
export type EngineType = 'suika' | 'h5-editor' | 'custom';

/**
 * 引擎状态枚举
 */
export type EngineStatus = 
  | 'uninitialized'   // 未初始化
  | 'initializing'    // 初始化中
  | 'ready'           // 就绪
  | 'rendering'       // 渲染中
  | 'error'           // 错误状态
  | 'destroyed';      // 已销毁

/**
 * 引擎配置接口
 */
export interface EngineConfig {
  // 基础配置
  width: number;
  height: number;
  backgroundColor: string;
  
  // 性能配置
  enableGPUAcceleration: boolean;
  maxTextureSize: number;
  targetFPS: number;
  
  // 功能配置
  enableGrid: boolean;
  enableRulers: boolean;
  enableSnapping: boolean;
  
  // 调试配置
  enableDebugMode: boolean;
  showPerformanceStats: boolean;
}

/**
 * 引擎性能统计接口
 */
export interface EnginePerformanceStats {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangleCount: number;
  textureCount: number;
  lastUpdateTime: number;
}

/**
 * 引擎事件类型
 */
export type EngineEvent = 
  | 'initialized'
  | 'ready'
  | 'element-added'
  | 'element-updated'
  | 'element-removed'
  | 'selection-changed'
  | 'viewport-changed'
  | 'render-complete'
  | 'performance-update'
  | 'error'
  | 'destroyed';

/**
 * 引擎事件监听器
 */
export type EngineEventListener = (event: EngineEvent, data?: any) => void;

/**
 * 视口变换接口
 */
export interface ViewportTransform {
  zoom: number;
  panX: number;
  panY: number;
  rotation?: number;
}

/**
 * 渲染选项接口
 */
export interface RenderOptions {
  quality: 'low' | 'medium' | 'high';
  antialiasing: boolean;
  shadows: boolean;
  effects: boolean;
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality: number;
  scale: number;
  backgroundColor?: string;
  transparent?: boolean;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 画布引擎接口
 * @description 所有画布引擎必须实现的标准接口
 */
export interface CanvasEngine {
  // 基础属性
  readonly type: EngineType;
  readonly version: string;
  readonly status: EngineStatus;
  readonly config: EngineConfig;
  
  // 生命周期方法
  initializeEngine(config: Partial<EngineConfig>): Promise<void>;
  destroy(): Promise<void>;
  
  // 配置管理
  updateConfig(updates: Partial<EngineConfig>): void;
  getConfig(): EngineConfig;
  
  // 元素管理
  addElement(element: CanvasElement): Promise<void>;
  updateElement(id: string, updates: Partial<CanvasElement>): Promise<void>;
  removeElement(id: string): Promise<void>;
  getElement(id: string): CanvasElement | null;
  getAllElements(): CanvasElement[];
  
  // 选择管理
  selectElements(elementIds: string[]): void;
  getSelectedElements(): string[];
  clearSelection(): void;
  
  // 视口控制
  setViewport(transform: ViewportTransform): void;
  getViewport(): ViewportTransform;
  zoomToFit(elementIds?: string[]): void;
  resetView(): void;
  
  // 渲染控制
  render(options?: Partial<RenderOptions>): Promise<void>;
  requestRender(): void;
  setRenderQuality(quality: RenderOptions['quality']): void;
  
  // 导出功能
  exportToImage(options: ExportOptions): Promise<Blob>;
  exportToSVG(options?: Partial<ExportOptions>): Promise<string>;
  exportToPDF(options?: Partial<ExportOptions>): Promise<Blob>;
  
  // 事件系统
  addEventListener(event: EngineEvent, listener: EngineEventListener): void;
  removeEventListener(event: EngineEvent, listener: EngineEventListener): void;
  
  // 性能监控
  getPerformanceStats(): EnginePerformanceStats;
  enablePerformanceMonitoring(enabled: boolean): void;
  
  // 工具集成
  setActiveTool(toolType: string): void;
  getActiveTool(): string | null;
  
  // 网格和标尺
  setGridVisible(visible: boolean): void;
  setRulersVisible(visible: boolean): void;
  setSnapToGrid(enabled: boolean): void;
  
  // 背景设置
  setBackgroundColor(color: string): void;
  setBackgroundImage(imageUrl: string): void;
  
  // 图层管理
  setElementOrder(elementIds: string[]): void;
  bringToFront(elementId: string): void;
  sendToBack(elementId: string): void;
  
  // 历史记录
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // 剪贴板
  copy(elementIds: string[]): Promise<void>;
  paste(): Promise<string[]>;
  cut(elementIds: string[]): Promise<void>;
  
  // 查找和过滤
  findElements(predicate: (element: CanvasElement) => boolean): CanvasElement[];
  getElementsInBounds(bounds: { x: number; y: number; width: number; height: number }): CanvasElement[];
  
  // 测量和计算
  measureText(text: string, style: any): { width: number; height: number };
  getElementBounds(elementId: string): { x: number; y: number; width: number; height: number } | null;
  
  // 碰撞检测
  hitTest(x: number, y: number): string | null;
  intersectionTest(bounds: { x: number; y: number; width: number; height: number }): string[];
  
  // 调试功能
  enableDebugMode(enabled: boolean): void;
  getDebugInfo(): any;
  
  // 扩展接口
  getCapabilities(): string[];
  supportsFeature(feature: string): boolean;
  
  // 资源管理
  preloadAssets(urls: string[]): Promise<void>;
  clearAssetCache(): void;
  
  // 状态序列化
  serialize(): any;
  deserialize(data: any): Promise<void>;
}

/**
 * 引擎工厂接口
 * @description 引擎创建工厂的接口定义
 */
export interface EngineFactory {
  getStatus(): unknown;
  createEngine(type: EngineType, container: HTMLElement, config: Partial<EngineConfig>): Promise<CanvasEngine>;
  getSupportedEngines(): EngineType[];
  getEngineInfo(type: EngineType): {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
  };
}

/**
 * 引擎适配器接口
 * @description 引擎适配器的基础接口
 */
export interface EngineAdapter {
  readonly engineType: EngineType;
  readonly isInitialized: boolean;
  
  initialize(engine: any): Promise<void>;
  destroy(): Promise<void>;
  
  // 适配器特定的方法
  adaptElement(element: CanvasElement): any;
  adaptConfig(config: Partial<EngineConfig>): any;
  adaptEvent(event: any): { type: EngineEvent; data?: any };
  
  // 性能优化
  optimizeForEngine(elements: CanvasElement[]): CanvasElement[];
  getBestPractices(): string[];
}

/**
 * 引擎比较结果接口
 */
export interface EngineComparison {
  performance: {
    renderSpeed: number;
    memoryUsage: number;
    startupTime: number;
  };
  features: {
    supported: string[];
    missing: string[];
    experimental: string[];
  };
  compatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

/**
 * 引擎切换选项接口
 */
export interface EngineSwitchOptions {
  preserveState: boolean;
  migrateElements: boolean;
  validateCompatibility: boolean;
  fallbackOnError: boolean;
}

/**
 * 引擎管理器接口
 * @description 管理多个引擎实例的接口
 */
export interface EngineManager {
  // 引擎管理
  registerEngine(type: EngineType, factory: () => Promise<CanvasEngine>): void;
  unregisterEngine(type: EngineType): void;
  
  // 引擎切换
  switchEngine(type: EngineType, options?: EngineSwitchOptions): Promise<void>;
  getCurrentEngine(): CanvasEngine | null;
  getCurrentEngineType(): EngineType | null;
  
  // 引擎比较
  compareEngines(types: EngineType[]): Promise<Record<EngineType, EngineComparison>>;
  recommendEngine(requirements: string[]): EngineType;
  
  // 性能监控
  getEnginePerformance(type?: EngineType): EnginePerformanceStats;
  benchmarkEngine(type: EngineType): Promise<EngineComparison>;
  
  // 兼容性检查
  checkCompatibility(type: EngineType, elements: CanvasElement[]): {
    compatible: boolean;
    issues: string[];
    suggestions: string[];
  };
}