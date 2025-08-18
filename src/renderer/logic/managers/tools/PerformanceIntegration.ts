/**
 * 工具性能监控集成 - 为工具系统提供性能监控功能
 * @description 集成现有的性能监控系统，为工具操作提供性能分析
 * @author 开发团队
 */
import { UnifiedPerformanceMonitor } from '../../utils/performance/UnifiedPerformanceMonitor';
import { ToolType } from '../../../stores/toolStore';

/**
 * 工具性能指标接口
 */
export interface ToolPerformanceMetrics {
  toolType: ToolType;
  operationType: string;
  duration: number;
  memoryUsage: number;
  timestamp: number;
  metadata: Record<string, any>;
}

/**
 * 工具性能统计接口
 */
export interface ToolPerformanceStats {
  toolType: ToolType;
  totalOperations: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  totalMemoryUsage: number;
  averageMemoryUsage: number;
  errorCount: number;
  lastUsed: number;
}

/**
 * 性能阈值配置接口
 */
export interface PerformanceThresholds {
  maxOperationDuration: number; // 最大操作时长 (ms)
  maxMemoryUsage: number;       // 最大内存使用 (bytes)
  maxFPS: number;               // 最大帧率
  warningThreshold: number;     // 警告阈值 (ms)
}

/**
 * 工具性能监控类
 * @description 为工具系统提供专门的性能监控功能
 */
export class ToolPerformanceMonitor {
  private static instance: ToolPerformanceMonitor | null = null;
  private isEnabled = true;
  private metrics: Map<string, ToolPerformanceMetrics[]> = new Map();
  private stats: Map<ToolType, ToolPerformanceStats> = new Map();
  private activeOperations: Map<string, { startTime: number; startMemory: number }> = new Map();
  private maxMetricsPerTool = 1000;

  private thresholds: PerformanceThresholds = {
    maxOperationDuration: 100,  // 100ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxFPS: 60,
    warningThreshold: 50,       // 50ms
  };

  private constructor() {
    this.initializeStats();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ToolPerformanceMonitor {
    if (!ToolPerformanceMonitor.instance) {
      ToolPerformanceMonitor.instance = new ToolPerformanceMonitor();
    }
    return ToolPerformanceMonitor.instance;
  }

  /**
   * 启用性能监控
   */
  public enable(): void {
    this.isEnabled = true;
    console.info('[tool-performance] 启用工具性能监控');
  }

  /**
   * 禁用性能监控
   */
  public disable(): void {
    this.isEnabled = false;
    console.info('[tool-performance] 禁用工具性能监控');
  }

  /**
   * 开始监控操作
   */
  public startOperation(toolType: ToolType, operationType: string, metadata?: Record<string, any>): string {
    if (!this.isEnabled) return '';

    const operationId = `${toolType}_${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    this.activeOperations.set(operationId, {
      startTime,
      startMemory,
    });

    // 同时使用统一性能监控器
    UnifiedPerformanceMonitor.markStart(`tool-${toolType}-${operationType}`, startTime);

    console.debug('[tool-performance] 开始监控操作', {
      operationId,
      toolType,
      operationType,
      metadata,
    });

    return operationId;
  }

  /**
   * 结束监控操作
   */
  public endOperation(operationId: string, toolType: ToolType, operationType: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled || !operationId) return;

    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      console.warn('[tool-performance] 未找到操作记录', { operationId });
      return;
    }

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    const duration = endTime - operation.startTime;
    const memoryUsage = endMemory - operation.startMemory;

    // 创建性能指标
    const metric: ToolPerformanceMetrics = {
      toolType,
      operationType,
      duration,
      memoryUsage,
      timestamp: Date.now(),
      metadata: metadata || {},
    };

    // 记录指标
    this.recordMetric(metric);

    // 更新统计信息
    this.updateStats(metric);

    // 检查性能阈值
    this.checkThresholds(metric);

    // 清理活动操作
    this.activeOperations.delete(operationId);

    // 结束统一性能监控器标记
    UnifiedPerformanceMonitor.markEnd(`tool-${toolType}-${operationType}`, operation.startTime);

    console.debug('[tool-performance] 结束监控操作', {
      operationId,
      toolType,
      operationType,
      duration: `${duration.toFixed(2)}ms`,
      memoryUsage: `${(memoryUsage / 1024).toFixed(2)}KB`,
    });
  }

  /**
   * 记录即时指标
   */
  public recordInstantMetric(toolType: ToolType, operationType: string, duration: number, metadata: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: ToolPerformanceMetrics = {
      toolType,
      operationType,
      duration,
      memoryUsage: 0,
      timestamp: Date.now(),
      metadata,
    };

    this.recordMetric(metric);
    this.updateStats(metric);
    this.checkThresholds(metric);

    // 同时记录到统一性能监控器
    UnifiedPerformanceMonitor.recordMetric(`tool-${toolType}-${operationType}`, duration);
  }

  /**
   * 获取工具性能统计
   */
  public getToolStats(toolType: ToolType): ToolPerformanceStats | null {
    return this.stats.get(toolType) || null;
  }

  /**
   * 获取所有工具统计
   */
  public getAllStats(): Map<ToolType, ToolPerformanceStats> {
    return new Map(this.stats);
  }

  /**
   * 获取工具指标历史
   */
  public getToolMetrics(toolType: ToolType, operationType?: string): ToolPerformanceMetrics[] {
    const key = operationType ? `${toolType}_${operationType}` : toolType;
    const allMetrics = this.metrics.get(key) || [];
    
    if (operationType) {
      return allMetrics;
    }

    // 返回该工具的所有操作指标
    const toolMetrics: ToolPerformanceMetrics[] = [];
    for (const [metricKey, metrics] of Array.from(this.metrics.entries())) {
      if (metricKey.startsWith(toolType)) {
        toolMetrics.push(...metrics);
      }
    }

    return toolMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): {
    summary: {
      totalOperations: number;
      averageDuration: number;
      totalMemoryUsage: number;
      slowestTool: ToolType | null;
      fastestTool: ToolType | null;
    };
    toolStats: Map<ToolType, ToolPerformanceStats>;
    issues: Array<{
      type: 'warning' | 'error';
      message: string;
      toolType: ToolType;
      metric?: ToolPerformanceMetrics;
    }>;
  } {
    const allStats = Array.from(this.stats.values());
    const totalOperations = allStats.reduce((sum, stat) => sum + stat.totalOperations, 0);
    const averageDuration = allStats.reduce((sum, stat) => sum + stat.averageDuration * stat.totalOperations, 0) / totalOperations || 0;
    const totalMemoryUsage = allStats.reduce((sum, stat) => sum + stat.totalMemoryUsage, 0);

    // 找出最慢和最快的工具
    let slowestTool: ToolType | null = null;
    let fastestTool: ToolType | null = null;
    let maxDuration = 0;
    let minDuration = Infinity;

    for (const [toolType, stat] of Array.from(this.stats.entries())) {
      if (stat.averageDuration > maxDuration) {
        maxDuration = stat.averageDuration;
        slowestTool = toolType;
      }
      if (stat.averageDuration < minDuration && stat.totalOperations > 0) {
        minDuration = stat.averageDuration;
        fastestTool = toolType;
      }
    }

    // 检查性能问题
    const issues: Array<{
      type: 'warning' | 'error';
      message: string;
      toolType: ToolType;
      metric?: ToolPerformanceMetrics;
    }> = [];

    for (const [toolType, stat] of Array.from(this.stats.entries())) {
      if (stat.averageDuration > this.thresholds.warningThreshold) {
        issues.push({
          type: 'warning',
          message: `工具 ${toolType} 平均响应时间过长: ${stat.averageDuration.toFixed(2)}ms`,
          toolType,
        });
      }

      if (stat.maxDuration > this.thresholds.maxOperationDuration) {
        issues.push({
          type: 'error',
          message: `工具 ${toolType} 最大响应时间超过阈值: ${stat.maxDuration.toFixed(2)}ms`,
          toolType,
        });
      }

      if (stat.errorCount > 0) {
        issues.push({
          type: 'error',
          message: `工具 ${toolType} 发生 ${stat.errorCount} 次错误`,
          toolType,
        });
      }
    }

    return {
      summary: {
        totalOperations,
        averageDuration,
        totalMemoryUsage,
        slowestTool,
        fastestTool,
      },
      toolStats: new Map(this.stats),
      issues,
    };
  }

  /**
   * 清除指标数据
   */
  public clearMetrics(toolType?: ToolType): void {
    if (toolType) {
      // 清除特定工具的指标
      const keysToDelete: string[] = [];
      for (const key of Array.from(this.metrics.keys())) {
        if (key.startsWith(toolType)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.metrics.delete(key));
      
      // 重置统计信息
      this.stats.delete(toolType);
      this.initializeToolStats(toolType);
      
      console.info('[tool-performance] 清除工具指标', { toolType });
    } else {
      // 清除所有指标
      this.metrics.clear();
      this.stats.clear();
      this.initializeStats();
      
      console.info('[tool-performance] 清除所有指标');
    }
  }

  /**
   * 更新性能阈值
   */
  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.info('[tool-performance] 更新性能阈值', { thresholds: this.thresholds });
  }

  /**
   * 获取当前阈值
   */
  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  // 私有方法

  /**
   * 初始化统计信息
   */
  private initializeStats(): void {
    Object.values(ToolType).forEach(toolType => {
      this.initializeToolStats(toolType);
    });
  }

  /**
   * 初始化单个工具的统计信息
   */
  private initializeToolStats(toolType: ToolType): void {
    this.stats.set(toolType, {
      toolType,
      totalOperations: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      totalMemoryUsage: 0,
      averageMemoryUsage: 0,
      errorCount: 0,
      lastUsed: 0,
    });
  }

  /**
   * 记录指标
   */
  private recordMetric(metric: ToolPerformanceMetrics): void {
    const key = `${metric.toolType}_${metric.operationType}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metrics = this.metrics.get(key)!;
    metrics.push(metric);

    // 限制指标数量
    if (metrics.length > this.maxMetricsPerTool) {
      metrics.splice(0, metrics.length - this.maxMetricsPerTool);
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(metric: ToolPerformanceMetrics): void {
    const stats = this.stats.get(metric.toolType);
    if (!stats) return;

    stats.totalOperations++;
    stats.totalMemoryUsage += metric.memoryUsage;
    stats.lastUsed = metric.timestamp;

    // 更新持续时间统计
    const totalDuration = stats.averageDuration * (stats.totalOperations - 1) + metric.duration;
    stats.averageDuration = totalDuration / stats.totalOperations;
    stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    stats.minDuration = Math.min(stats.minDuration, metric.duration);

    // 更新内存使用统计
    stats.averageMemoryUsage = stats.totalMemoryUsage / stats.totalOperations;
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(metric: ToolPerformanceMetrics): void {
    if (metric.duration > this.thresholds.maxOperationDuration) {
      console.warn('[tool-performance] 操作时长超过阈值', {
        toolType: metric.toolType,
        operationType: metric.operationType,
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${this.thresholds.maxOperationDuration}ms`,
      });
    }

    if (metric.memoryUsage > this.thresholds.maxMemoryUsage) {
      console.warn('[tool-performance] 内存使用超过阈值', {
        toolType: metric.toolType,
        operationType: metric.operationType,
        memoryUsage: `${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        threshold: `${(this.thresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }

  /**
   * 获取当前内存使用量
   */
  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// 导出单例实例
export const toolPerformanceMonitor = ToolPerformanceMonitor.getInstance();