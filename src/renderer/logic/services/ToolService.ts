/**
 * 工具服务 - 提供工具相关的业务逻辑服务
 * @description 封装工具操作的业务逻辑，协调工具管理器和引擎
 * @author 开发团队
 */
import { toolManager } from '../managers/tools/ToolManager';
import { toolPerformanceMonitor } from '../managers/tools/PerformanceIntegration';
import { engineManager } from '../engines/core/EngineManager';
import { ToolType } from '../../stores/toolStore';
import type { 
  ToolProperties,
  TextToolProperties,
  BrushToolProperties,
  ShapeToolProperties,
  ImageToolProperties,
  CropToolProperties
} from '../../stores/toolStore';
import type { ToolPerformanceStats } from '../managers/tools';

/**
 * 工具操作结果接口
 */
export interface ToolOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 工具使用统计接口
 */
export interface ToolUsageStats {
  toolType: ToolType;
  usageCount: number;
  totalTime: number;
  averageTime: number;
  lastUsed: string;
}

/**
 * 工具服务类
 * @description 提供工具相关的高级业务服务
 */
export class ToolService {
  private static instance: ToolService | null = null;
  private isInitialized = false;
  private usageStats: Map<ToolType, ToolUsageStats> = new Map();

  private constructor() {}

  /**
   * 获取工具服务单例实例
   */
  public static getInstance(): ToolService {
    if (!ToolService.instance) {
      ToolService.instance = new ToolService();
    }
    return ToolService.instance;
  }

  /**
   * 初始化工具服务
   */
  public async initialize(): Promise<ToolOperationResult> {
    if (this.isInitialized) {
      return { success: true, message: '工具服务已经初始化' };
    }

    try {
      console.info('[tool-service] 开始初始化工具服务');

      // 初始化工具管理器
      const initResult = toolManager.initialize();
      if (!initResult.success) {
        return initResult;
      }

      // 加载使用统计
      await this.loadUsageStats();

      // 设置事件监听
      this.setupEventListeners();

      this.isInitialized = true;
      console.info('[tool-service] 工具服务初始化完成');

      return { success: true };
    } catch (error) {
      console.error('[tool-service] 工具服务初始化失败:', error);
      return {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 销毁工具服务
   */
  public destroy(): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: true, message: '工具服务未初始化' };
    }

    try {
      console.info('[tool-service] 销毁工具服务');

      // 保存数据
      this.saveUsageStats();

      // 销毁工具管理器
      toolManager.destroy();

      // 清理数据
      this.usageStats.clear();
      this.isInitialized = false;

      console.info('[tool-service] 工具服务销毁完成');
      return { success: true };
    } catch (error) {
      console.error('[tool-service] 工具服务销毁失败:', error);
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
      return { success: false, message: '工具服务未初始化' };
    }

    try {
      // 记录使用开始时间
      const startTime = Date.now();

      // 通过工具管理器激活工具
      const result = toolManager.activateTool(toolType);

      if (result.success) {
        // 同时设置引擎工具
        const engine = engineManager.getCurrentEngine();
        if (engine) {
          engine.setActiveTool(toolType);
        }

        // 更新使用统计
        this.updateUsageStats(toolType, startTime);

        console.info(`[tool-service] 激活工具: ${toolType}`);
      }

      return result;
    } catch (error) {
      console.error(`[tool-service] 激活工具失败: ${toolType}`, error);
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
    return toolManager.getActiveTool();
  }

  /**
   * 切换到上一个工具
   */
  public switchToPreviousTool(): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具服务未初始化' };
    }
    return toolManager.switchToPreviousTool();
  }

  /**
   * 更新工具属性
   */
  public updateToolProperties<T extends ToolProperties>(
    toolType: ToolType,
    properties: Partial<T>
  ): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具服务未初始化' };
    }

    try {
      let result: ToolOperationResult;

      switch (toolType) {
        case ToolType.TEXT:
          result = toolManager.updateTextProperties(properties as Partial<TextToolProperties>);
          break;
        case ToolType.BRUSH:
          result = toolManager.updateBrushProperties(properties as Partial<BrushToolProperties>);
          break;
        case ToolType.SHAPE:
          result = toolManager.updateShapeProperties(properties as Partial<ShapeToolProperties>);
          break;
        case ToolType.IMAGE:
          result = toolManager.updateImageProperties(properties as Partial<ImageToolProperties>);
          break;
        case ToolType.CROP:
          result = toolManager.updateCropProperties(properties as Partial<CropToolProperties>);
          break;
        default:
          return { success: false, message: `工具 ${toolType} 不支持属性更新` };
      }

      if (result.success) {
        console.debug(`[tool-service] 更新工具属性: ${toolType}`, { 
          updatedKeys: Object.keys(properties) 
        });
      }

      return result;
    } catch (error) {
      console.error(`[tool-service] 更新工具属性失败: ${toolType}`, error);
      return {
        success: false,
        message: `更新属性失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取工具属性
   */
  public getToolProperties<T extends ToolProperties>(toolType: ToolType): T | null {
    return toolManager.getToolProperties<T>(toolType);
  }

  /**
   * 创建工具预设
   */
  public createPreset(
    name: string,
    toolType: ToolType
  ): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具服务未初始化' };
    }

    try {
      const properties = this.getToolProperties(toolType);
      if (!properties) {
        return { success: false, message: `工具 ${toolType} 没有可保存的属性` };
      }

      // 通过工具管理器保存预设
      const result = toolManager.savePreset(name, properties);

      if (result.success) {
        console.info(`[tool-service] 创建工具预设: ${name}`, { toolType });
      }

      return result;
    } catch (error) {
      console.error(`[tool-service] 创建预设失败: ${name}`, error);
      return {
        success: false,
        message: `创建预设失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取工具使用统计
   */
  public getUsageStats(toolType?: ToolType): ToolUsageStats[] {
    const allStats = Array.from(this.usageStats.values());
    if (toolType) {
      const stats = this.usageStats.get(toolType);
      return stats ? [stats] : [];
    }
    return allStats.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 获取最常用的工具
   */
  public getMostUsedTools(count: number = 5): ToolUsageStats[] {
    return this.getUsageStats()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, count);
  }

  /**
   * 获取工具历史记录
   */
  public getToolHistory(count?: number) {
    return toolManager.getToolHistory(count);
  }

  /**
   * 清除工具历史记录
   */
  public clearToolHistory(): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具服务未初始化' };
    }

    try {
      toolManager.clearToolHistory();
      console.info('[tool-service] 清除工具历史记录');
      return { success: true };
    } catch (error) {
      console.error('[tool-service] 清除历史记录失败:', error);
      return {
        success: false,
        message: `清除历史记录失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 重置工具到默认状态
   */
  public resetToDefaults(): ToolOperationResult {
    if (!this.isInitialized) {
      return { success: false, message: '工具服务未初始化' };
    }

    try {
      const result = toolManager.resetToDefaults();
      
      if (result.success) {
        // 清除使用统计
        this.usageStats.clear();
        this.saveUsageStats();
        console.info('[tool-service] 重置工具到默认状态');
      }

      return result;
    } catch (error) {
      console.error('[tool-service] 重置工具失败:', error);
      return {
        success: false,
        message: `重置工具失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): Record<string, ToolPerformanceStats> {
    const stats: Record<string, ToolPerformanceStats> = {};
    
    Object.values(ToolType).forEach(toolType => {
      const toolStats = toolPerformanceMonitor.getToolStats(toolType);
      if (toolStats) {
        // NOTE: 由于 TypeScript 不允许 unknown 作为索引类型，这里将 toolType 显式转换为 string
        stats[String(toolType)] = toolStats as ToolPerformanceStats;
      }
    });

    return stats;
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport() {
    return toolPerformanceMonitor.getPerformanceReport();
  }

  /**
   * 清除性能数据
   */
  public clearPerformanceData(toolType?: ToolType): ToolOperationResult {
    try {
      toolPerformanceMonitor.clearMetrics(toolType);
      console.info('[tool-service] 清除性能数据', { toolType: toolType || 'all' });
      return { success: true };
    } catch (error) {
      console.error('[tool-service] 清除性能数据失败:', error);
      return {
        success: false,
        message: `清除性能数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取工具服务状态
   */
  public getStatus() {
    const toolStatus = toolManager.getStatus();
    return {
      isInitialized: this.isInitialized,
      tool: toolStatus,
      usage: {
        totalStats: this.usageStats.size,
        mostUsed: this.getMostUsedTools(3).map(s => ({ tool: s.toolType, count: s.usageCount })),
      },
      performance: this.getPerformanceReport(),
    };
  }

  /**
   * 检查服务健康状态
   */
  public checkHealth() {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!this.isInitialized) {
      issues.push('工具服务未初始化');
      return { isHealthy: false, issues, warnings };
    }

    const toolStatus = toolManager.getStatus();
    if (!toolStatus.isInitialized) {
      issues.push('工具管理器未初始化');
    }

    if (toolStatus.enabledToolsCount === 0) {
      issues.push('没有可用的工具');
    }

    if (!toolStatus.keyboardHandlerActive) {
      warnings.push('键盘快捷键处理未激活');
    }

    // 检查性能问题
    const performanceReport = this.getPerformanceReport();
    if (performanceReport.issues.length > 0) {
      performanceReport.issues.forEach(issue => {
        if (issue.type === 'error') {
          issues.push(issue.message);
        } else {
          warnings.push(issue.message);
        }
      });
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }

  // 私有方法

  private setupEventListeners(): void {
    // 监听工具激活事件
    toolManager.addEventListener('tool-activated', (_event: any, data: any) => {
      if (data?.tool) {
        this.updateUsageStats(data.tool, Date.now());
      }
    });

    // 监听属性变更事件
    toolManager.addEventListener('tool-property-changed', (_event: any, data: any) => {
      if (data?.tool) {
        console.debug(`[tool-service] 工具属性变更: ${data.tool}`);
      }
    });
  }

  private updateUsageStats(toolType: ToolType, startTime: number): void {
    const now = Date.now();
    const duration = now - startTime;

    let stats = this.usageStats.get(toolType);
    if (!stats) {
      stats = {
        toolType,
        usageCount: 0,
        totalTime: 0,
        averageTime: 0,
        lastUsed: new Date().toISOString(),
      };
    }

    stats.usageCount++;
    stats.totalTime += duration;
    stats.averageTime = stats.totalTime / stats.usageCount;
    stats.lastUsed = new Date().toISOString();

    this.usageStats.set(toolType, stats);

    // 定期保存统计数据
    if (stats.usageCount % 10 === 0) {
      this.saveUsageStats();
    }
  }

  private async loadUsageStats(): Promise<void> {
    try {
      const saved = localStorage.getItem('tool-service-usage-stats');
      if (saved) {
        const stats = JSON.parse(saved) as ToolUsageStats[];
        stats.forEach(stat => {
          this.usageStats.set(stat.toolType, stat);
        });
        console.debug(`[tool-service] 加载使用统计: ${stats.length} 个`);
      }
    } catch (error) {
      console.warn('[tool-service] 加载使用统计失败:', error);
    }
  }

  private saveUsageStats(): void {
    try {
      const stats = Array.from(this.usageStats.values());
      localStorage.setItem('tool-service-usage-stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('[tool-service] 保存使用统计失败:', error);
    }
  }
}

// 导出单例实例
export const toolService = ToolService.getInstance();