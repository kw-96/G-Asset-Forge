/**
 * Radix UI组件性能监控工具
 * 监控Radix UI组件的渲染性能，检测异常渲染和无限循环
 */

import { reactLoopFixToolkit } from './ReactLoopFix';

export interface ComponentPerformanceMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  suspiciousRenderCount: number;
  isPerformanceIssue: boolean;
}

export interface PerformanceAlert {
  type: 'excessive_renders' | 'slow_render' | 'memory_leak' | 'infinite_loop';
  componentName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: ComponentPerformanceMetrics;
  timestamp: number;
  suggestions: string[];
}

export class RadixUIPerformanceMonitor {
  private static instance: RadixUIPerformanceMonitor | null = null;
  private componentMetrics: Map<string, ComponentPerformanceMetrics> = new Map();
  private performanceAlerts: PerformanceAlert[] = [];
  private monitoringEnabled: boolean = true;
  private alertThresholds = {
    excessiveRenders: 50,        // 50次渲染内
    fastRenderInterval: 16,      // 16ms内
    slowRenderTime: 100,         // 100ms
    suspiciousRenderRatio: 0.8,  // 80%的渲染被认为是可疑的
  };

  public static getInstance(): RadixUIPerformanceMonitor {
    if (!RadixUIPerformanceMonitor.instance) {
      RadixUIPerformanceMonitor.instance = new RadixUIPerformanceMonitor();
    }
    return RadixUIPerformanceMonitor.instance;
  }

  /**
   * 开始监控组件性能
   */
  public startMonitoring(componentName: string): () => void {
    if (!this.monitoringEnabled) {
      return () => {};
    }

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordRender(componentName, renderTime);
    };
  }

  /**
   * 记录组件渲染
   */
  private recordRender(componentName: string, renderTime: number): void {
    let metrics = this.componentMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: Infinity,
        suspiciousRenderCount: 0,
        isPerformanceIssue: false,
      };
      this.componentMetrics.set(componentName, metrics);
    }

    // 更新指标
    metrics.renderCount += 1;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);
    metrics.minRenderTime = Math.min(metrics.minRenderTime, renderTime);

    // 检测可疑渲染
    if (this.isSuspiciousRender(renderTime, metrics)) {
      metrics.suspiciousRenderCount += 1;
    }

    // 检测性能问题
    this.detectPerformanceIssues(metrics);

    // 记录调试信息
    reactLoopFixToolkit.debugLogger.debug(
      'radix-performance',
      `${componentName}渲染完成`,
      {
        renderTime: Math.round(renderTime * 100) / 100,
        renderCount: metrics.renderCount,
        averageTime: Math.round(metrics.averageRenderTime * 100) / 100,
      },
      'RadixUIPerformanceMonitor'
    );
  }

  /**
   * 检测是否为可疑渲染
   */
  private isSuspiciousRender(renderTime: number, metrics: ComponentPerformanceMetrics): boolean {
    // 渲染时间过长
    if (renderTime > this.alertThresholds.slowRenderTime) {
      return true;
    }

    // 渲染频率过高
    if (metrics.renderCount > 10) {
      const recentRenderInterval = Date.now() - (performance.now() - renderTime);
      if (recentRenderInterval < this.alertThresholds.fastRenderInterval) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检测性能问题
   */
  private detectPerformanceIssues(metrics: ComponentPerformanceMetrics): void {
    const { componentName, renderCount, suspiciousRenderCount, averageRenderTime } = metrics;
    
    // 检测过度渲染
    if (renderCount > this.alertThresholds.excessiveRenders) {
      const suspiciousRatio = suspiciousRenderCount / renderCount;
      
      if (suspiciousRatio > this.alertThresholds.suspiciousRenderRatio) {
        this.createAlert({
          type: 'excessive_renders',
          componentName,
          severity: 'high',
          message: `${componentName}组件渲染次数过多 (${renderCount}次)，可能存在无限循环`,
          metrics,
          timestamp: Date.now(),
          suggestions: [
            '检查useEffect的依赖数组是否正确',
            '使用useCallback和useMemo稳定化引用',
            '避免在渲染过程中创建新对象',
            '检查props是否频繁变化',
          ],
        });
      }
    }

    // 检测渲染性能问题
    if (averageRenderTime > this.alertThresholds.slowRenderTime) {
      this.createAlert({
        type: 'slow_render',
        componentName,
        severity: 'medium',
        message: `${componentName}组件平均渲染时间过长 (${Math.round(averageRenderTime)}ms)`,
        metrics,
        timestamp: Date.now(),
        suggestions: [
          '优化组件渲染逻辑',
          '使用React.memo减少不必要的渲染',
          '分割大型组件为更小的组件',
          '使用虚拟化处理大量数据',
        ],
      });
    }

    // 检测潜在的无限循环
    if (renderCount > 100 && suspiciousRenderCount > 80) {
      this.createAlert({
        type: 'infinite_loop',
        componentName,
        severity: 'critical',
        message: `${componentName}组件可能陷入无限循环`,
        metrics,
        timestamp: Date.now(),
        suggestions: [
          '立即检查useEffect依赖数组',
          '检查状态更新逻辑',
          '使用React DevTools Profiler分析',
          '考虑添加错误边界',
        ],
      });
    }

    // 更新性能问题标记
    metrics.isPerformanceIssue = this.hasPerformanceIssue(metrics);
  }

  /**
   * 创建性能警报
   */
  private createAlert(alert: PerformanceAlert): void {
    this.performanceAlerts.push(alert);
    
    // 限制警报数量
    if (this.performanceAlerts.length > 100) {
      this.performanceAlerts = this.performanceAlerts.slice(-50);
    }

    // 记录警报
    reactLoopFixToolkit.debugLogger.warn(
      'radix-performance-alert',
      alert.message,
      {
        type: alert.type,
        severity: alert.severity,
        componentName: alert.componentName,
        renderCount: alert.metrics.renderCount,
        averageRenderTime: alert.metrics.averageRenderTime,
      },
      'RadixUIPerformanceMonitor'
    );

    // 严重问题时尝试自动修复
    if (alert.severity === 'critical') {
      this.attemptAutoFix(alert);
    }
  }

  /**
   * 尝试自动修复
   */
  private attemptAutoFix(alert: PerformanceAlert): void {
    switch (alert.type) {
      case 'infinite_loop':
        reactLoopFixToolkit.debugLogger.error(
          'radix-auto-fix',
          `尝试修复${alert.componentName}的无限循环问题`,
          { alert },
          'RadixUIPerformanceMonitor'
        );
        
        // 重置组件指标
        this.resetComponentMetrics(alert.componentName);
        
        // 触发状态重置
        reactLoopFixToolkit.resetAll();
        break;
        
      default:
        break;
    }
  }

  /**
   * 判断是否有性能问题
   */
  private hasPerformanceIssue(metrics: ComponentPerformanceMetrics): boolean {
    const { renderCount, suspiciousRenderCount, averageRenderTime } = metrics;
    
    return (
      renderCount > this.alertThresholds.excessiveRenders ||
      averageRenderTime > this.alertThresholds.slowRenderTime ||
      (suspiciousRenderCount / renderCount) > this.alertThresholds.suspiciousRenderRatio
    );
  }

  /**
   * 获取组件性能指标
   */
  public getComponentMetrics(componentName?: string): ComponentPerformanceMetrics | ComponentPerformanceMetrics[] | null {
    if (componentName) {
      return this.componentMetrics.get(componentName) || null;
    }
    return Array.from(this.componentMetrics.values());
  }

  /**
   * 获取性能警报
   */
  public getPerformanceAlerts(componentName?: string): PerformanceAlert[] {
    if (componentName) {
      return this.performanceAlerts.filter(alert => alert.componentName === componentName);
    }
    return [...this.performanceAlerts];
  }

  /**
   * 重置组件指标
   */
  public resetComponentMetrics(componentName?: string): void {
    if (componentName) {
      this.componentMetrics.delete(componentName);
    } else {
      this.componentMetrics.clear();
    }
  }

  /**
   * 清除性能警报
   */
  public clearPerformanceAlerts(componentName?: string): void {
    if (componentName) {
      this.performanceAlerts = this.performanceAlerts.filter(
        alert => alert.componentName !== componentName
      );
    } else {
      this.performanceAlerts = [];
    }
  }

  /**
   * 启用/禁用监控
   */
  public setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    
    reactLoopFixToolkit.debugLogger.info(
      'radix-monitoring',
      `Radix UI性能监控${enabled ? '启用' : '禁用'}`,
      { enabled },
      'RadixUIPerformanceMonitor'
    );
  }

  /**
   * 获取监控状态
   */
  public isMonitoringEnabled(): boolean {
    return this.monitoringEnabled;
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): {
    totalComponents: number;
    totalRenders: number;
    averageRenderTime: number;
    problemComponents: number;
    totalAlerts: number;
    criticalAlerts: number;
  } {
    const metrics = Array.from(this.componentMetrics.values());
    const totalComponents = metrics.length;
    const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
    const totalRenderTime = metrics.reduce((sum, m) => sum + m.totalRenderTime, 0);
    const averageRenderTime = totalRenders > 0 ? totalRenderTime / totalRenders : 0;
    const problemComponents = metrics.filter(m => m.isPerformanceIssue).length;
    const totalAlerts = this.performanceAlerts.length;
    const criticalAlerts = this.performanceAlerts.filter(a => a.severity === 'critical').length;

    return {
      totalComponents,
      totalRenders,
      averageRenderTime,
      problemComponents,
      totalAlerts,
      criticalAlerts,
    };
  }

  /**
   * 生成性能报告
   */
  public generatePerformanceReport(): {
    summary: ReturnType<RadixUIPerformanceMonitor['getPerformanceStats']>;
    componentMetrics: ComponentPerformanceMetrics[];
    recentAlerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const summary = this.getPerformanceStats();
    const componentMetrics = Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderCount - a.renderCount);
    const recentAlerts = this.performanceAlerts
      .slice(-10)
      .sort((a, b) => b.timestamp - a.timestamp);

    const recommendations: string[] = [];
    
    if (summary.problemComponents > 0) {
      recommendations.push('存在性能问题的组件需要优化');
    }
    
    if (summary.criticalAlerts > 0) {
      recommendations.push('存在严重的性能问题，建议立即处理');
    }
    
    if (summary.averageRenderTime > 50) {
      recommendations.push('整体渲染性能较慢，建议优化渲染逻辑');
    }

    return {
      summary,
      componentMetrics,
      recentAlerts,
      recommendations,
    };
  }
}

// 导出单例实例
export const radixUIPerformanceMonitor = RadixUIPerformanceMonitor.getInstance();