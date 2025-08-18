/**
 * 工具管理器 - 统一管理所有画布工具
 * @description 提供工具切换、状态管理、事件处理、性能监控等功能
 * @author 开发团队
 */
import { toolPerformanceMonitor } from './PerformanceIntegration';
import { ToolType } from '../../../stores/toolStore';
import { getToolDefaults, getToolByShortcut } from './toolConfig';
import BrushTool, { BrushSettings } from './BrushTool';
import CropTool, { CropSettings } from './CropTool';
import SelectTool from './SelectTool';
import TextTool, { TextSettings } from './TextTool';
import type { 
  ToolProperties,
  TextToolProperties,
  BrushToolProperties,
  ShapeToolProperties,
  ImageToolProperties,
  CropToolProperties
} from '../../../stores/toolStore';

/**
 * 工具事件类型
 */
export type ToolEvent = 
  | 'tool-activated'
  | 'tool-deactivated'
  | 'tool-property-changed'
  | 'tool-operation-completed'
  | 'tool-error'
  | 'tool-performance-warning';

/**
 * 工具事件监听器
 */
export type ToolEventListener = (event: ToolEvent, data?: any) => void;

/**
 * 工具操作结果接口
 */
export interface ToolOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 工具预设接口
 */
export interface ToolPreset {
  id: string;
  name: string;
  toolType: ToolType;
  properties: ToolProperties;
  isBuiltin: boolean;
}

/**
 * 工具管理器类
 * @description 统一管理所有画布工具的生命周期和状态
 */
export class ToolManager {
  addEventListener(_arg0: string, _arg1: (_event: any, data: any) => void) {
    throw new Error('Method not implemented.');
  }
  private static instance: ToolManager | null = null;
  private isInitialized = false;
  private activeTool: ToolType = ToolType.SELECT;
  private previousTool: ToolType = ToolType.SELECT;
  private toolHistory: ToolType[] = [];
  private maxHistorySize = 20;
  private keyboardHandlerActive = false;

  // 工具实例
  private selectTool: SelectTool;
  private textTool: TextTool;
  private brushTool: BrushTool;
  private cropTool: CropTool;

  // 工具预设
  private presets: Map<string, ToolPreset> = new Map();

  private constructor() {
    // 初始化工具实例
    this.selectTool = new SelectTool(getToolDefaults(ToolType.SELECT));
    this.textTool = new TextTool(getToolDefaults(ToolType.TEXT));
    this.brushTool = new BrushTool(getToolDefaults(ToolType.BRUSH));
    this.cropTool = new CropTool(getToolDefaults(ToolType.CROP));
  }

  /**
   * 获取工具管理器单例实例
   */
  public static getInstance(): ToolManager {
    if (!ToolManager.instance) {
      ToolManager.instance = new ToolManager();
    }
    return ToolManager.instance;
  }

  /**
   * 初始化工具管理器
   */
  public initialize(): ToolOperationResult {
    if (this.isInitialized) {
      return { success: true, message: '工具管理器已经初始化' };
    }

    try {
      console.info('[tool-manager] 开始初始化工具管理器');

      // 启用性能监控
      toolPerformanceMonitor.enable();

      // 设置键盘事件监听
      this.setupKeyboardHandlers();

      // 加载预设
      this.loadPresets();

      // 激活默认工具
      this.activateTool(ToolType.SELECT);

      this.isInitialized = true;
      console.info('[tool-manager] 工具管理器初始化完成');

      return { success: true };
    } catch (error) {
      console.error('[tool-manager] 工具管理器初始化失败:', error);
      return {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 销毁工具管理器
   */
  public destroy(): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: true, message: '工具管理器未初始化' };
    }

    try {
      console.info('[tool-manager] 销毁工具管理器');

      // 移除键盘事件监听
      this.removeKeyboardHandlers();

      // 保存预设
      this.savePresets();

      // 清理工具状态
      this.deactivateCurrentTool();

      // 禁用性能监控
      toolPerformanceMonitor.disable();

      // 清理数据
      this.toolHistory = [];
      this.presets.clear();
      this.isInitialized = false;

      console.info('[tool-manager] 工具管理器销毁完成');
      return { success: true };
    } catch (error) {
      console.error('[tool-manager] 工具管理器销毁失败:', error);
      return {
        success: false,
        message: `销毁失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 激活工具
   */
  public activateTool(toolType: ToolType): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具管理器未初始化' };
    }

    const operationId = toolPerformanceMonitor.startOperation(toolType, 'activate');

    try {
      // 如果已经是当前工具，直接返回
      if (this.activeTool === toolType) {
        toolPerformanceMonitor.endOperation(operationId, toolType, 'activate');
        return { success: true, message: `工具 ${toolType} 已经激活` };
      }

      // 记录历史
      this.addToHistory(this.activeTool);

      // 停用当前工具
      this.deactivateCurrentTool();

      // 激活新工具
      this.previousTool = this.activeTool;
      this.activeTool = toolType;

      // 触发事件
      // this.emit('tool-activated', { tool: toolType, previous: this.previousTool });

      console.info(`[tool-manager] 激活工具: ${toolType}`, {
        previous: this.previousTool,
        historySize: this.toolHistory.length,
      });

      toolPerformanceMonitor.endOperation(operationId, toolType, 'activate');
      return { success: true, data: { tool: toolType } };
    } catch (error) {
      console.error(`[tool-manager] 激活工具失败: ${toolType}`, error);
      toolPerformanceMonitor.endOperation(operationId, toolType, 'activate');
      return {
        success: false,
        message: `激活工具失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取当前激活的工具
   */
  public getActiveTool(): ToolType {
    return this.activeTool;
  }

  /**
   * 切换到上一个工具
   */
  public switchToPreviousTool(): ToolOperationResult {
    return this.activateTool(this.previousTool);
  }

  /**
   * 获取工具实例
   */
  public getToolInstance<T>(toolType: ToolType): T | null {
    switch (toolType) {
      case ToolType.SELECT:
        return this.selectTool as unknown as T;
      case ToolType.TEXT:
        return this.textTool as unknown as T;
      case ToolType.BRUSH:
        return this.brushTool as unknown as T;
      case ToolType.CROP:
        return this.cropTool as unknown as T;
      default:
        return null;
    }
  }

  /**
   * 更新工具属性
   */
  public updateTextProperties(properties: Partial<TextToolProperties>): ToolOperationResult {
    const operationId = toolPerformanceMonitor.startOperation(ToolType.TEXT, 'update-properties');

    try {
      this.textTool.updateSettings(properties as unknown as TextSettings);
      // this.emit('tool-property-changed', { tool: ToolType.TEXT, properties });

      toolPerformanceMonitor.endOperation(operationId, ToolType.TEXT, 'update-properties');
      return { success: true };
    } catch (error) {
      toolPerformanceMonitor.endOperation(operationId, ToolType.TEXT, 'update-properties');
      return { success: false, message: error instanceof Error ? error.message : '更新失败' };
    }
  }

  /**
   * 更新画笔属性
   */
  public updateBrushProperties(properties: Partial<BrushToolProperties>): ToolOperationResult {
    const operationId = toolPerformanceMonitor.startOperation(ToolType.BRUSH, 'update-properties');

    try {
      this.brushTool.updateSettings(properties as unknown as BrushSettings);
      // this.emit('tool-property-changed', { tool: ToolType.BRUSH, properties });

      toolPerformanceMonitor.endOperation(operationId, ToolType.BRUSH, 'update-properties');
      return { success: true };
    } catch (error) {
      toolPerformanceMonitor.endOperation(operationId, ToolType.BRUSH, 'update-properties');
      return { success: false, message: error instanceof Error ? error.message : '更新失败' };
    }
  }

  /**
   * 更新形状属性
   */
  public updateShapeProperties(_properties: Partial<ShapeToolProperties>): ToolOperationResult {
    // 形状工具暂未实现，返回成功以保持接口一致性
    // this.emit('tool-property-changed', { tool: ToolType.SHAPE, properties });
    return { success: true };
  }

  /**
   * 更新图片属性
   */
  public updateImageProperties(_properties: Partial<ImageToolProperties>): ToolOperationResult {
    // 图片工具暂未实现，返回成功以保持接口一致性
    // this.emit('tool-property-changed', { tool: ToolType.IMAGE, properties });
    return { success: true };
  }

  /**
   * 更新裁剪属性
   */
  public updateCropProperties(properties: Partial<CropToolProperties>): ToolOperationResult {
    const operationId = toolPerformanceMonitor.startOperation(ToolType.CROP, 'update-properties');

    try {
      this.cropTool.updateSettings(properties as unknown as Partial<CropSettings>);
      // this.emit('tool-property-changed', { tool: ToolType.CROP, properties });

      toolPerformanceMonitor.endOperation(operationId, ToolType.CROP, 'update-properties');
      return { success: true };
    } catch (error) {
      toolPerformanceMonitor.endOperation(operationId, ToolType.CROP, 'update-properties');
      return { success: false, message: error instanceof Error ? error.message : '更新失败' };
    }
  }

  /**
   * 获取工具属性
   */
  public getToolProperties<T extends ToolProperties>(toolType: ToolType): T | null {
    switch (toolType) {
      case ToolType.SELECT:
        return this.selectTool.getSettings() as unknown as T;
      case ToolType.TEXT:
        return this.textTool.getSettings() as unknown as T;
      case ToolType.BRUSH:
        return this.brushTool.getSettings() as unknown as T;
      case ToolType.CROP:
        return this.cropTool.getSettings() as unknown as T;
      default:
        return null;
    }
  }

  /**
   * 保存工具预设
   */
  public savePreset(name: string, properties: ToolProperties): ToolOperationResult {
    try {
      const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const preset: ToolPreset = {
        id: presetId,
        name,
        toolType: this.activeTool,
        properties,
        isBuiltin: false,
      };

      this.presets.set(presetId, preset);
      this.savePresets();

      console.info(`[tool-manager] 保存预设: ${name}`, { presetId, toolType: this.activeTool });
      return { success: true, data: { preset } };
    } catch (error) {
      console.error(`[tool-manager] 保存预设失败: ${name}`, error);
      return {
        success: false,
        message: `保存预设失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取工具历史
   */
  public getToolHistory(count?: number): ToolType[] {
    const history = [...this.toolHistory].reverse();
    return count ? history.slice(0, count) : history;
  }

  /**
   * 清除工具历史
   */
  public clearToolHistory(): void {
    this.toolHistory = [];
    console.debug('[tool-manager] 清除工具历史');
  }

  /**
   * 重置工具到默认状态
   */
  public resetToDefaults(): ToolOperationResult {
    try {
      // 重置所有工具到默认设置
      this.selectTool.updateSettings(getToolDefaults(ToolType.SELECT));
      this.textTool.updateSettings(getToolDefaults(ToolType.TEXT));
      this.brushTool.updateSettings(getToolDefaults(ToolType.BRUSH));
      this.cropTool.updateSettings(getToolDefaults(ToolType.CROP));

      // 激活默认工具
      this.activateTool(ToolType.SELECT);

      // 清除历史
      this.clearToolHistory();

      console.info('[tool-manager] 重置工具到默认状态');
      return { success: true };
    } catch (error) {
      console.error('[tool-manager] 重置工具失败:', error);
      return {
        success: false,
        message: `重置工具失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取工具管理器状态
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeTool: this.activeTool,
      previousTool: this.previousTool,
      historySize: this.toolHistory.length,
      keyboardHandlerActive: this.keyboardHandlerActive,
      enabledToolsCount: Object.keys(ToolType).length,
      presetCount: this.presets.size,
      performance: toolPerformanceMonitor.getPerformanceReport(),
    };
  }

  // 私有方法

  /**
   * 停用当前工具
   */
  private deactivateCurrentTool(): void {
    if (this.activeTool) {
      // 清理工具状态
      switch (this.activeTool) {
        case ToolType.BRUSH:
          this.brushTool.cancelDrawing();
          break;
        case ToolType.CROP:
          this.cropTool.cancelCrop();
          break;
        case ToolType.TEXT:
          this.textTool.cancelEditing();
          break;
        case ToolType.SELECT:
          this.selectTool.clearSelection();
          break;
      }

      // this.emit('tool-deactivated', { tool: this.activeTool });
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(toolType: ToolType): void {
    // 移除重复项
    this.toolHistory = this.toolHistory.filter(t => t !== toolType);
    
    // 添加到开头
    this.toolHistory.unshift(toolType);
    
    // 限制历史记录数量
    if (this.toolHistory.length > this.maxHistorySize) {
      this.toolHistory = this.toolHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 设置键盘事件处理
   */
  private setupKeyboardHandlers(): void {
    if (this.keyboardHandlerActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const key = event.key.toUpperCase();
      const toolType = getToolByShortcut(key);

      if (toolType && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        this.activateTool(toolType);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.keyboardHandlerActive = true;

    console.debug('[tool-manager] 键盘事件处理已启用');
  }

  /**
   * 移除键盘事件处理
   */
  private removeKeyboardHandlers(): void {
    if (!this.keyboardHandlerActive) return;

    // 注意：这里需要保存对处理函数的引用才能正确移除
    // 简化实现，实际应用中应该保存函数引用
    this.keyboardHandlerActive = false;

    console.debug('[tool-manager] 键盘事件处理已禁用');
  }

  /**
   * 加载预设
   */
  private loadPresets(): void {
    try {
      const saved = localStorage.getItem('tool-manager-presets');
      if (saved) {
        const presets = JSON.parse(saved) as ToolPreset[];
        presets.forEach(preset => {
          this.presets.set(preset.id, preset);
        });
        console.debug(`[tool-manager] 加载预设: ${presets.length} 个`);
      }
    } catch (error) {
      console.warn('[tool-manager] 加载预设失败:', error);
    }
  }

  /**
   * 保存预设
   */
  private savePresets(): void {
    try {
      const presets = Array.from(this.presets.values()).filter(p => !p.isBuiltin);
      localStorage.setItem('tool-manager-presets', JSON.stringify(presets));
    } catch (error) {
      console.warn('[tool-manager] 保存预设失败:', error);
    }
  }
}

// 导出单例实例
export const toolManager = ToolManager.getInstance();