/**
 * 开发调试工具
 * 提供开发模式下的状态更新日志、性能监控和调试面板
 */

import { reactLoopFixToolkit } from './ReactLoopFix';

export interface StateUpdateLog {
  id: string;
  timestamp: number;
  component: string;
  action: string;
  oldState: any;
  newState: any;
  stackTrace: string;
  renderCount: number;
}

export interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryUsage: number;
  isPerformanceIssue: boolean;
}

export interface InfiniteLoopWarning {
  id: string;
  timestamp: number;
  component: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stackTrace: string;
  renderCount: number;
  suggestions: string[];
}

export class DevDebugTools {
  private static instance: DevDebugTools | null = null;
  private isEnabled: boolean = false;
  private stateUpdateLogs: StateUpdateLog[] = [];
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private infiniteLoopWarnings: InfiniteLoopWarning[] = [];
  private maxLogSize: number = 1000;
  private renderCounters: Map<string, number> = new Map();

  public static getInstance(): DevDebugTools {
    if (!DevDebugTools.instance) {
      DevDebugTools.instance = new DevDebugTools();
    }
    return DevDebugTools.instance;
  }

  /**
   * 启用/禁用调试工具
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.initializeDebugTools();
    } else {
      this.cleanupDebugTools();
    }

    reactLoopFixToolkit.debugLogger.info(
      'dev-debug-tools',
      `开发调试工具${enabled ? '启用' : '禁用'}`,
      { enabled },
      'DevDebugTools'
    );
  }

  /**
   * 记录状态更新
   */
  public logStateUpdate(
    component: string,
    action: string,
    oldState: any,
    newState: any
  ): void {
    if (!this.isEnabled) return;

    const renderCount = this.incrementRenderCount(component);
    const log: StateUpdateLog = {
      id: `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      component,
      action,
      oldState: this.sanitizeState(oldState),
      newState: this.sanitizeState(newState),
      stackTrace: this.getStackTrace(),
      renderCount,
    };

    this.stateUpdateLogs.push(log);
    
    // 限制日志大小
    if (this.stateUpdateLogs.length > this.maxLogSize) {
      this.stateUpdateLogs = this.stateUpdateLogs.slice(-this.maxLogSize / 2);
    }

    // 检测可疑的状态更新模式
    this.detectSuspiciousStateUpdates(component, renderCount);

    reactLoopFixToolkit.debugLogger.debug(
      'state-update',
      `${component}状态更新: ${action}`,
      {
        component,
        action,
        renderCount,
        hasStateChange: JSON.stringify(oldState) !== JSON.stringify(newState),
      },
      'DevDebugTools'
    );
  }

  /**
   * 记录性能指标
   */
  public recordPerformanceMetrics(
    componentName: string,
    renderTime: number
  ): void {
    if (!this.isEnabled) return;

    let metrics = this.performanceMetrics.get(componentName);
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        memoryUsage: this.getMemoryUsage(),
        isPerformanceIssue: false,
      };
      this.performanceMetrics.set(componentName, metrics);
    }

    metrics.renderCount += 1;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.lastRenderTime = renderTime;
    metrics.memoryUsage = this.getMemoryUsage();

    // 检测性能问题
    metrics.isPerformanceIssue = this.detectPerformanceIssue(metrics);

    if (metrics.isPerformanceIssue) {
      this.createInfiniteLoopWarning(
        componentName,
        `${componentName}组件性能异常`,
        'medium',
        [
          '检查组件渲染逻辑',
          '使用React.memo优化',
          '检查useEffect依赖数组',
        ]
      );
    }
  }

  /**
   * 创建无限循环警告
   */
  public createInfiniteLoopWarning(
    component: string,
    message: string,
    severity: InfiniteLoopWarning['severity'],
    suggestions: string[] = []
  ): void {
    if (!this.isEnabled) return;

    const renderCount = this.renderCounters.get(component) || 0;
    const warning: InfiniteLoopWarning = {
      id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      component,
      message,
      severity,
      stackTrace: this.getStackTrace(),
      renderCount,
      suggestions,
    };

    this.infiniteLoopWarnings.push(warning);

    // 限制警告数量
    if (this.infiniteLoopWarnings.length > 100) {
      this.infiniteLoopWarnings = this.infiniteLoopWarnings.slice(-50);
    }

    reactLoopFixToolkit.debugLogger.warn(
      'infinite-loop-warning',
      message,
      {
        component,
        severity,
        renderCount,
        suggestions,
      },
      'DevDebugTools'
    );
  }

  /**
   * 获取状态更新日志
   */
  public getStateUpdateLogs(component?: string): StateUpdateLog[] {
    if (component) {
      return this.stateUpdateLogs.filter(log => log.component === component);
    }
    return [...this.stateUpdateLogs];
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(component?: string): PerformanceMetrics | PerformanceMetrics[] | null {
    if (component) {
      return this.performanceMetrics.get(component) || null;
    }
    return Array.from(this.performanceMetrics.values());
  }

  /**
   * 获取无限循环警告
   */
  public getInfiniteLoopWarnings(component?: string): InfiniteLoopWarning[] {
    if (component) {
      return this.infiniteLoopWarnings.filter(warning => warning.component === component);
    }
    return [...this.infiniteLoopWarnings];
  }

  /**
   * 生成调试报告
   */
  public generateDebugReport(): {
    summary: {
      totalStateUpdates: number;
      totalComponents: number;
      totalWarnings: number;
      criticalWarnings: number;
      performanceIssues: number;
    };
    recentStateUpdates: StateUpdateLog[];
    performanceMetrics: PerformanceMetrics[];
    recentWarnings: InfiniteLoopWarning[];
    recommendations: string[];
  } {
    const performanceMetricsArray = Array.from(this.performanceMetrics.values());
    const performanceIssues = performanceMetricsArray.filter(m => m.isPerformanceIssue).length;
    const criticalWarnings = this.infiniteLoopWarnings.filter(w => w.severity === 'critical').length;

    const recommendations: string[] = [];
    if (performanceIssues > 0) {
      recommendations.push(`发现${performanceIssues}个组件存在性能问题，建议优化`);
    }
    if (criticalWarnings > 0) {
      recommendations.push(`发现${criticalWarnings}个严重警告，需要立即处理`);
    }
    if (this.stateUpdateLogs.length > 500) {
      recommendations.push('状态更新频繁，建议检查是否存在不必要的更新');
    }

    return {
      summary: {
        totalStateUpdates: this.stateUpdateLogs.length,
        totalComponents: this.performanceMetrics.size,
        totalWarnings: this.infiniteLoopWarnings.length,
        criticalWarnings,
        performanceIssues,
      },
      recentStateUpdates: this.stateUpdateLogs.slice(-20),
      performanceMetrics: performanceMetricsArray.sort((a, b) => b.renderCount - a.renderCount),
      recentWarnings: this.infiniteLoopWarnings.slice(-10),
      recommendations,
    };
  }

  /**
   * 清除所有日志
   */
  public clearLogs(): void {
    this.stateUpdateLogs = [];
    this.performanceMetrics.clear();
    this.infiniteLoopWarnings = [];
    this.renderCounters.clear();

    reactLoopFixToolkit.debugLogger.info(
      'dev-debug-tools',
      '清除所有调试日志',
      {},
      'DevDebugTools'
    );
  }

  /**
   * 初始化调试工具
   */
  private initializeDebugTools(): void {
    // 监听全局错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    // 设置性能监控
    this.setupPerformanceMonitoring();
  }

  /**
   * 清理调试工具
   */
  private cleanupDebugTools(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  /**
   * 处理全局错误
   */
  private handleGlobalError = (event: ErrorEvent): void => {
    this.createInfiniteLoopWarning(
      'Global',
      `全局错误: ${event.message}`,
      'high',
      ['检查错误堆栈', '添加错误边界', '修复错误源码']
    );
  };

  /**
   * 处理未捕获的Promise拒绝
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    this.createInfiniteLoopWarning(
      'Promise',
      `未捕获的Promise拒绝: ${event.reason}`,
      'medium',
      ['添加.catch()处理', '使用try-catch包装', '检查异步逻辑']
    );
  };

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 监控内存使用
    setInterval(() => {
      if (this.isEnabled) {
        const memoryUsage = this.getMemoryUsage();
        if (memoryUsage > 100) { // 100MB
          this.createInfiniteLoopWarning(
            'Memory',
            `内存使用过高: ${memoryUsage.toFixed(2)}MB`,
            'medium',
            ['检查内存泄漏', '清理未使用的引用', '优化数据结构']
          );
        }
      }
    }, 10000); // 每10秒检查一次
  }

  /**
   * 增加渲染计数
   */
  private incrementRenderCount(component: string): number {
    const current = this.renderCounters.get(component) || 0;
    const newCount = current + 1;
    this.renderCounters.set(component, newCount);
    return newCount;
  }

  /**
   * 检测可疑的状态更新模式
   */
  private detectSuspiciousStateUpdates(component: string, renderCount: number): void {
    // 检测短时间内的大量更新
    const recentLogs = this.stateUpdateLogs
      .filter(log => log.component === component)
      .filter(log => Date.now() - log.timestamp < 1000); // 最近1秒

    if (recentLogs.length > 10) {
      this.createInfiniteLoopWarning(
        component,
        `${component}在1秒内进行了${recentLogs.length}次状态更新`,
        'high',
        [
          '检查useEffect依赖数组',
          '使用useCallback稳定化函数',
          '避免在渲染过程中更新状态',
        ]
      );
    }

    // 检测渲染次数过多
    if (renderCount > 50) {
      this.createInfiniteLoopWarning(
        component,
        `${component}渲染次数过多: ${renderCount}次`,
        'critical',
        [
          '立即检查无限循环',
          '使用React DevTools分析',
          '添加错误边界保护',
        ]
      );
    }
  }

  /**
   * 检测性能问题
   */
  private detectPerformanceIssue(metrics: PerformanceMetrics): boolean {
    return (
      metrics.averageRenderTime > 50 || // 平均渲染时间超过50ms
      metrics.renderCount > 100 || // 渲染次数超过100次
      metrics.memoryUsage > 50 // 内存使用超过50MB
    );
  }

  /**
   * 净化状态数据
   */
  private sanitizeState(state: any): any {
    try {
      // 移除循环引用和函数
      return JSON.parse(JSON.stringify(state, (_key, value) => {
        if (typeof value === 'function') {
          return '[Function]';
        }
        if (value instanceof Error) {
          return `[Error: ${value.message}]`;
        }
        return value;
      }));
    } catch (error) {
      return '[无法序列化的状态]';
    }
  }

  /**
   * 获取堆栈跟踪
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      return error instanceof Error ? error.stack || '' : '';
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

// 导出单例实例
export const devDebugTools = DevDebugTools.getInstance();