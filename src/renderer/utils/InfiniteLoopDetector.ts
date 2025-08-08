/**
 * 无限循环检测器
 * 检测和预防React组件的无限循环问题
 */

import { reactLoopFixToolkit } from './ReactLoopFix';
import { devDebugTools } from './DevDebugTools';

export interface LoopDetectionConfig {
  maxRenderCount: number;
  timeWindow: number;
  warningThreshold: number;
  criticalThreshold: number;
  autoFix: boolean;
}

export interface LoopDetectionResult {
  isLoop: boolean;
  severity: 'none' | 'warning' | 'critical';
  renderCount: number;
  timeSpan: number;
  suggestions: string[];
}

export class InfiniteLoopDetector {
  private static instance: InfiniteLoopDetector | null = null;
  private componentRenderTimes: Map<string, number[]> = new Map();
  private componentWarnings: Map<string, number> = new Map();
  private isEnabled: boolean = true;
  
  private defaultConfig: LoopDetectionConfig = {
    maxRenderCount: 50,
    timeWindow: 1000, // 1秒
    warningThreshold: 20,
    criticalThreshold: 50,
    autoFix: true,
  };

  public static getInstance(): InfiniteLoopDetector {
    if (!InfiniteLoopDetector.instance) {
      InfiniteLoopDetector.instance = new InfiniteLoopDetector();
    }
    return InfiniteLoopDetector.instance;
  }

  /**
   * 启用/禁用检测器
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.componentRenderTimes.clear();
      this.componentWarnings.clear();
    }

    reactLoopFixToolkit.debugLogger.info(
      'loop-detector',
      `无限循环检测器${enabled ? '启用' : '禁用'}`,
      { enabled },
      'InfiniteLoopDetector'
    );
  }

  /**
   * 记录组件渲染
   */
  public recordRender(componentName: string, config?: Partial<LoopDetectionConfig>): LoopDetectionResult {
    if (!this.isEnabled) {
      return {
        isLoop: false,
        severity: 'none',
        renderCount: 0,
        timeSpan: 0,
        suggestions: [],
      };
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    
    // 获取或创建组件的渲染时间记录
    let renderTimes = this.componentRenderTimes.get(componentName);
    if (!renderTimes) {
      renderTimes = [];
      this.componentRenderTimes.set(componentName, renderTimes);
    }

    // 添加当前渲染时间
    renderTimes.push(now);

    // 清理超出时间窗口的记录
    const cutoffTime = now - finalConfig.timeWindow;
    const filteredTimes = renderTimes.filter(time => time >= cutoffTime);
    this.componentRenderTimes.set(componentName, filteredTimes);

    // 分析渲染模式
    const result = this.analyzeRenderPattern(componentName, filteredTimes, finalConfig);

    // 处理检测结果
    this.handleDetectionResult(componentName, result, finalConfig);

    return result;
  }

  /**
   * 分析渲染模式
   */
  private analyzeRenderPattern(
    _componentName: string,
    renderTimes: number[],
    config: LoopDetectionConfig
  ): LoopDetectionResult {
    const renderCount = renderTimes.length;
    const timeSpan = renderTimes.length > 1 
      ? renderTimes[renderTimes.length - 1]! - renderTimes[0]! 
      : 0;

    let severity: LoopDetectionResult['severity'] = 'none';
    let isLoop = false;
    const suggestions: string[] = [];

    // 判断严重程度
    if (renderCount >= config.criticalThreshold) {
      severity = 'critical';
      isLoop = true;
      suggestions.push(
        '立即检查组件的useEffect依赖数组',
        '使用React DevTools Profiler分析渲染原因',
        '考虑添加错误边界保护',
        '检查是否存在状态更新循环'
      );
    } else if (renderCount >= config.warningThreshold) {
      severity = 'warning';
      suggestions.push(
        '检查useEffect、useMemo、useCallback的依赖数组',
        '避免在渲染过程中创建新对象或函数',
        '使用React.memo优化组件渲染',
        '检查props是否频繁变化'
      );
    }

    // 检测渲染频率
    if (renderCount > 10 && timeSpan < 100) {
      severity = severity === 'none' ? 'warning' : severity;
      suggestions.push('渲染频率过高，检查是否存在快速连续的状态更新');
    }

    // 检测规律性渲染
    if (this.detectRegularPattern(renderTimes)) {
      suggestions.push('检测到规律性渲染，可能存在定时器或动画导致的循环');
    }

    return {
      isLoop,
      severity,
      renderCount,
      timeSpan,
      suggestions: [...new Set(suggestions)], // 去重
    };
  }

  /**
   * 检测规律性模式
   */
  private detectRegularPattern(renderTimes: number[]): boolean {
    if (renderTimes.length < 5) return false;

    const intervals: number[] = [];
    for (let i = 1; i < renderTimes.length; i++) {
      intervals.push(renderTimes[i]! - renderTimes[i - 1]!);
    }

    // 检查间隔是否相似（允许10%的误差）
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const tolerance = avgInterval * 0.1;
    
    const regularIntervals = intervals.filter(interval => 
      Math.abs(interval - avgInterval) <= tolerance
    );

    return regularIntervals.length / intervals.length > 0.8; // 80%的间隔相似
  }

  /**
   * 处理检测结果
   */
  private handleDetectionResult(
    componentName: string,
    result: LoopDetectionResult,
    config: LoopDetectionConfig
  ): void {
    if (result.severity === 'none') return;

    // 记录警告次数
    const warningCount = (this.componentWarnings.get(componentName) || 0) + 1;
    this.componentWarnings.set(componentName, warningCount);

    // 创建调试工具警告
    devDebugTools.createInfiniteLoopWarning(
      componentName,
      `${componentName}可能存在无限循环 (${result.renderCount}次渲染/${result.timeSpan}ms)`,
      result.severity === 'critical' ? 'critical' : 'medium',
      result.suggestions
    );

    // 记录详细日志
    reactLoopFixToolkit.debugLogger.warn(
      'loop-detection',
      `${componentName}无限循环检测`,
      {
        componentName,
        severity: result.severity,
        renderCount: result.renderCount,
        timeSpan: result.timeSpan,
        warningCount,
        suggestions: result.suggestions,
      },
      'InfiniteLoopDetector'
    );

    // 自动修复
    if (config.autoFix && result.severity === 'critical') {
      this.attemptAutoFix(componentName, result);
    }
  }

  /**
   * 尝试自动修复
   */
  private attemptAutoFix(componentName: string, result: LoopDetectionResult): void {
    reactLoopFixToolkit.debugLogger.error(
      'loop-auto-fix',
      `尝试自动修复${componentName}的无限循环`,
      { componentName, result },
      'InfiniteLoopDetector'
    );

    // 清除该组件的渲染记录
    this.componentRenderTimes.delete(componentName);
    this.componentWarnings.delete(componentName);

    // 触发全局状态重置
    try {
      reactLoopFixToolkit.resetAll();
    } catch (error) {
      reactLoopFixToolkit.debugLogger.error(
        'loop-auto-fix',
        '自动修复失败',
        { componentName, error: error instanceof Error ? error.message : String(error) },
        'InfiniteLoopDetector'
      );
    }
  }

  /**
   * 获取组件的检测统计
   */
  public getComponentStats(componentName: string): {
    renderCount: number;
    warningCount: number;
    lastRenderTime: number;
    averageInterval: number;
  } {
    const renderTimes = this.componentRenderTimes.get(componentName) || [];
    const warningCount = this.componentWarnings.get(componentName) || 0;
    const lastRenderTime = renderTimes.length > 0 ? renderTimes[renderTimes.length - 1]! : 0;
    
    let averageInterval = 0;
    if (renderTimes.length > 1) {
      const intervals = [];
      for (let i = 1; i < renderTimes.length; i++) {
        intervals.push(renderTimes[i]! - renderTimes[i - 1]!);
      }
      averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    return {
      renderCount: renderTimes.length,
      warningCount,
      lastRenderTime,
      averageInterval,
    };
  }

  /**
   * 获取所有组件的统计
   */
  public getAllStats(): Map<string, ReturnType<typeof this.getComponentStats>> {
    const stats = new Map();
    
    for (const componentName of this.componentRenderTimes.keys()) {
      stats.set(componentName, this.getComponentStats(componentName));
    }

    return stats;
  }

  /**
   * 清除组件的检测记录
   */
  public clearComponentStats(componentName?: string): void {
    if (componentName) {
      this.componentRenderTimes.delete(componentName);
      this.componentWarnings.delete(componentName);
    } else {
      this.componentRenderTimes.clear();
      this.componentWarnings.clear();
    }

    reactLoopFixToolkit.debugLogger.info(
      'loop-detector',
      `清除${componentName || '所有'}组件的检测记录`,
      { componentName },
      'InfiniteLoopDetector'
    );
  }

  /**
   * 生成检测报告
   */
  public generateReport(): {
    totalComponents: number;
    totalWarnings: number;
    criticalComponents: string[];
    warningComponents: string[];
    recommendations: string[];
  } {
    const allStats = this.getAllStats();
    const criticalComponents: string[] = [];
    const warningComponents: string[] = [];
    let totalWarnings = 0;

    for (const [componentName, stats] of allStats) {
      totalWarnings += stats.warningCount;
      
      if (stats.warningCount > 0) {
        if (stats.renderCount > this.defaultConfig.criticalThreshold) {
          criticalComponents.push(componentName);
        } else if (stats.renderCount > this.defaultConfig.warningThreshold) {
          warningComponents.push(componentName);
        }
      }
    }

    const recommendations: string[] = [];
    if (criticalComponents.length > 0) {
      recommendations.push(`${criticalComponents.length}个组件存在严重的渲染问题，需要立即处理`);
    }
    if (warningComponents.length > 0) {
      recommendations.push(`${warningComponents.length}个组件存在潜在的性能问题`);
    }
    if (totalWarnings > 10) {
      recommendations.push('检测到大量渲染警告，建议全面检查组件优化');
    }

    return {
      totalComponents: allStats.size,
      totalWarnings,
      criticalComponents,
      warningComponents,
      recommendations,
    };
  }
}

// 导出单例实例
export const infiniteLoopDetector = InfiniteLoopDetector.getInstance();