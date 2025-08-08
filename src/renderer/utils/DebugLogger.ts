/**
 * 调试日志工具
 * 帮助开发时定位React无限循环和状态更新问题
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string | undefined;
  componentName?: string | undefined;
}

export interface DebugLoggerOptions {
  enableConsoleOutput?: boolean;
  enableStackTrace?: boolean;
  maxLogEntries?: number;
  logLevel?: LogLevel;
  categories?: string[];
  enableTimestamp?: boolean;
  enableComponentTracking?: boolean;
}

/**
 * 调试日志工具类
 * 提供结构化的日志记录和分析功能
 */
export class DebugLogger {
  private static instance: DebugLogger | null = null;
  private logEntries: LogEntry[] = [];
  private options: Required<DebugLoggerOptions>;
  private logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private constructor(options: DebugLoggerOptions = {}) {
    this.options = {
      enableConsoleOutput: options.enableConsoleOutput ?? true,
      enableStackTrace: options.enableStackTrace ?? false,
      maxLogEntries: options.maxLogEntries ?? 1000,
      logLevel: options.logLevel ?? 'debug',
      categories: options.categories ?? [],
      enableTimestamp: options.enableTimestamp ?? true,
      enableComponentTracking: options.enableComponentTracking ?? true,
    };
  }

  /**
   * 获取单例实例
   */
  public static getInstance(options?: DebugLoggerOptions): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger(options);
    }
    return DebugLogger.instance;
  }

  /**
   * 记录调试信息
   */
  public debug(category: string, message: string, data?: any, componentName?: string): void {
    this.log('debug', category, message, data, componentName);
  }

  /**
   * 记录一般信息
   */
  public info(category: string, message: string, data?: any, componentName?: string): void {
    this.log('info', category, message, data, componentName);
  }

  /**
   * 记录警告信息
   */
  public warn(category: string, message: string, data?: any, componentName?: string): void {
    this.log('warn', category, message, data, componentName);
  }

  /**
   * 记录错误信息
   */
  public error(category: string, message: string, data?: any, componentName?: string): void {
    this.log('error', category, message, data, componentName);
  }

  /**
   * 记录React组件相关的日志
   */
  public logComponent(
    componentName: string,
    action: string,
    details?: any,
    level: LogLevel = 'debug'
  ): void {
    this.log(level, 'component', `${componentName}: ${action}`, details, componentName);
  }

  /**
   * 记录状态更新相关的日志
   */
  public logStateUpdate(
    statePath: string,
    prevValue: any,
    nextValue: any,
    componentName?: string
  ): void {
    const data = {
      statePath,
      prevValue: this.sanitizeValue(prevValue),
      nextValue: this.sanitizeValue(nextValue),
      hasChanged: !this.isValueEqual(prevValue, nextValue),
    };

    this.log('debug', 'state', `状态更新: ${statePath}`, data, componentName);
  }

  /**
   * 记录useEffect相关的日志
   */
  public logEffect(
    componentName: string,
    effectName: string,
    dependencies: any[],
    action: 'mount' | 'update' | 'cleanup'
  ): void {
    const data = {
      effectName,
      dependencies: dependencies.map(dep => this.sanitizeValue(dep)),
      dependencyCount: dependencies.length,
      action,
    };

    this.log('debug', 'effect', `${componentName} useEffect: ${effectName}`, data, componentName);
  }

  /**
   * 记录渲染相关的日志
   */
  public logRender(
    componentName: string,
    renderCount: number,
    props?: any,
    reason?: string
  ): void {
    const data = {
      renderCount,
      props: props ? this.sanitizeValue(props) : undefined,
      reason,
    };

    this.log('debug', 'render', `${componentName} 渲染 #${renderCount}`, data, componentName);
  }

  /**
   * 记录性能相关的日志
   */
  public logPerformance(
    operation: string,
    duration: number,
    details?: any
  ): void {
    const data = {
      operation,
      duration,
      ...details,
    };

    const level: LogLevel = duration > 100 ? 'warn' : 'debug';
    this.log(level, 'performance', `${operation} 耗时 ${duration}ms`, data);
  }

  /**
   * 记录无限循环检测结果
   */
  public logInfiniteLoopDetection(
    detected: boolean,
    details: {
      componentName?: string;
      statePath?: string;
      updateCount?: number;
      timeWindow?: number;
    }
  ): void {
    const level: LogLevel = detected ? 'error' : 'debug';
    const message = detected 
      ? `检测到潜在无限循环: ${details.componentName || 'Unknown'}`
      : '无限循环检测通过';

    this.log(level, 'infinite-loop', message, details, details.componentName);
  }

  /**
   * 获取日志条目
   */
  public getLogEntries(
    category?: string,
    level?: LogLevel,
    componentName?: string,
    limit?: number
  ): LogEntry[] {
    let entries = [...this.logEntries];

    // 按类别过滤
    if (category) {
      entries = entries.filter(entry => entry.category === category);
    }

    // 按级别过滤
    if (level) {
      const minPriority = this.logLevelPriority[level];
      entries = entries.filter(entry => this.logLevelPriority[entry.level] >= minPriority);
    }

    // 按组件名过滤
    if (componentName) {
      entries = entries.filter(entry => entry.componentName === componentName);
    }

    // 限制数量
    if (limit && limit > 0) {
      entries = entries.slice(-limit);
    }

    return entries;
  }

  /**
   * 清除日志
   */
  public clearLogs(): void {
    this.logEntries = [];
    if (this.options.enableConsoleOutput) {
      console.log('[DebugLogger] 日志已清除');
    }
  }

  /**
   * 导出日志为文本
   */
  public exportLogs(category?: string, level?: LogLevel): string {
    const entries = this.getLogEntries(category, level);
    const lines: string[] = [];

    lines.push('=== Debug Logger 导出日志 ===');
    lines.push(`导出时间: ${new Date().toISOString()}`);
    lines.push(`总条目数: ${entries.length}`);
    lines.push('');

    entries.forEach((entry, index) => {
      const timestamp = new Date(entry.timestamp).toISOString();
      const component = entry.componentName ? ` [${entry.componentName}]` : '';
      
      lines.push(`${index + 1}. [${entry.level.toUpperCase()}] ${timestamp}${component}`);
      lines.push(`   类别: ${entry.category}`);
      lines.push(`   消息: ${entry.message}`);
      
      if (entry.data) {
        lines.push(`   数据: ${JSON.stringify(entry.data, null, 2)}`);
      }
      
      if (entry.stackTrace) {
        lines.push(`   调用栈: ${entry.stackTrace}`);
      }
      
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * 生成日志统计报告
   */
  public generateStats(): {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    entriesByCategory: Record<string, number>;
    entriesByComponent: Record<string, number>;
    recentErrors: LogEntry[];
    performanceIssues: LogEntry[];
  } {
    const stats = {
      totalEntries: this.logEntries.length,
      entriesByLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>,
      entriesByCategory: {} as Record<string, number>,
      entriesByComponent: {} as Record<string, number>,
      recentErrors: [] as LogEntry[],
      performanceIssues: [] as LogEntry[],
    };

    this.logEntries.forEach(entry => {
      // 按级别统计
      stats.entriesByLevel[entry.level]++;

      // 按类别统计
      stats.entriesByCategory[entry.category] = (stats.entriesByCategory[entry.category] || 0) + 1;

      // 按组件统计
      if (entry.componentName) {
        stats.entriesByComponent[entry.componentName] = 
          (stats.entriesByComponent[entry.componentName] || 0) + 1;
      }

      // 收集最近的错误
      if (entry.level === 'error' && stats.recentErrors.length < 10) {
        stats.recentErrors.push(entry);
      }

      // 收集性能问题
      if (entry.category === 'performance' && entry.data?.duration > 100) {
        stats.performanceIssues.push(entry);
      }
    });

    return stats;
  }

  /**
   * 设置日志选项
   */
  public setOptions(options: Partial<DebugLoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 核心日志记录方法
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    componentName?: string
  ): void {
    // 检查日志级别
    if (this.logLevelPriority[level] < this.logLevelPriority[this.options.logLevel]) {
      return;
    }

    // 检查类别过滤
    if (this.options.categories.length > 0 && !this.options.categories.includes(category)) {
      return;
    }

    // 创建日志条目
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data: data ? this.sanitizeValue(data) : undefined,
      stackTrace: this.options.enableStackTrace ? this.getStackTrace() : undefined,
      componentName: this.options.enableComponentTracking ? componentName : undefined,
    };

    // 添加到日志列表
    this.logEntries.push(entry);

    // 限制日志条目数量
    if (this.logEntries.length > this.options.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.options.maxLogEntries);
    }

    // 控制台输出
    if (this.options.enableConsoleOutput) {
      this.outputToConsole(entry);
    }
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = this.options.enableTimestamp 
      ? `[${new Date(entry.timestamp).toISOString()}] `
      : '';
    
    const component = entry.componentName ? ` [${entry.componentName}]` : '';
    const prefix = `${timestamp}[${entry.category.toUpperCase()}]${component}`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data || '');
        break;
      case 'info':
        console.info(message, entry.data || '');
        break;
      case 'warn':
        console.warn(message, entry.data || '');
        break;
      case 'error':
        console.error(message, entry.data || '');
        if (entry.stackTrace) {
          console.error('调用栈:', entry.stackTrace);
        }
        break;
    }
  }

  /**
   * 清理敏感数据
   */
  private sanitizeValue(value: any): any {
    if (value == null) return value;
    
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    if (typeof value === 'object') {
      try {
        // 限制对象深度，避免循环引用
        return JSON.parse(JSON.stringify(value, null, 0));
      } catch {
        return '[无法序列化的对象]';
      }
    }
    
    return value;
  }

  /**
   * 比较两个值是否相等
   */
  private isValueEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    }
    
    return false;
  }

  /**
   * 获取调用栈
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      if (error instanceof Error && error.stack) {
        return error.stack.split('\n').slice(3, 8).join('\n'); // 跳过前几行，只保留相关部分
      }
      return '无法获取调用栈';
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.clearLogs();
    DebugLogger.instance = null;
  }
}

// 导出默认实例
export const debugLogger = DebugLogger.getInstance();

// 导出便捷方法
export const logComponent = (componentName: string, action: string, details?: any, level?: LogLevel) => {
  debugLogger.logComponent(componentName, action, details, level);
};

export const logStateUpdate = (statePath: string, prevValue: any, nextValue: any, componentName?: string) => {
  debugLogger.logStateUpdate(statePath, prevValue, nextValue, componentName);
};

export const logEffect = (componentName: string, effectName: string, dependencies: any[], action: 'mount' | 'update' | 'cleanup') => {
  debugLogger.logEffect(componentName, effectName, dependencies, action);
};

export const logRender = (componentName: string, renderCount: number, props?: any, reason?: string) => {
  debugLogger.logRender(componentName, renderCount, props, reason);
};

export const logInfiniteLoop = (detected: boolean, details: any) => {
  debugLogger.logInfiniteLoopDetection(detected, details);
};