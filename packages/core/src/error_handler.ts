import { EventEmitter } from '@g-asset-forge/common';

export enum ErrorType {
  USER_INPUT = 'USER_INPUT',
  FILE_OPERATION = 'FILE_OPERATION',
  RENDERING = 'RENDERING',
  NETWORK = 'NETWORK',
  MEMORY = 'MEMORY',
  PERFORMANCE = 'PERFORMANCE',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  userId?: string;
}

interface ErrorHandlerEvents {
  error(errorInfo: ErrorInfo): void;
  criticalError(errorInfo: ErrorInfo): void;
  errorRecovered(errorInfo: ErrorInfo): void;
}

/**
 * 全局错误捕获和分类处理器
 * 实现全局错误捕获和分类处理，支持错误恢复和日志记录
 */
export class ErrorHandler extends EventEmitter<ErrorHandlerEvents> {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 100;
  private isInitialized = false;

  private constructor() {
    super();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 初始化全局错误处理
   */
  initialize(): void {
    if (this.isInitialized) return;

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandledrejection');
      event.preventDefault();
    });

    // 捕获全局JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), 'global', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // 捕获资源加载错误
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          const target = event.target as HTMLElement;
          this.handleError(
            new Error(`Resource load failed: ${target.tagName}`),
            'resource',
            { element: target.outerHTML },
          );
        }
      },
      true,
    );

    this.isInitialized = true;
  }

  /**
   * 手动处理错误
   */
  handleError(
    error: Error | string,
    context?: string,
    additionalInfo?: any,
  ): ErrorInfo {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const errorInfo: ErrorInfo = {
      type: this.classifyError(errorObj, context),
      severity: this.determineSeverity(errorObj, context),
      message: errorObj.message,
      stack: errorObj.stack,
      context: context || 'manual',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalInfo,
    };

    // 添加到错误日志
    this.addToLog(errorInfo);

    // 发送事件
    this.emit('error', errorInfo);

    if (errorInfo.severity === ErrorSeverity.CRITICAL) {
      this.emit('criticalError', errorInfo);
    }

    // 尝试错误恢复
    if (this.attemptRecovery(errorInfo)) {
      this.emit('errorRecovered', errorInfo);
    }

    // 在开发环境下打印详细信息
    if (import.meta.env?.DEV) {
      console.group(`🚨 ${errorInfo.severity} Error: ${errorInfo.type}`);
      console.error('Message:', errorInfo.message);
      console.error('Context:', errorInfo.context);
      console.error('Stack:', errorInfo.stack);
      console.error('Additional Info:', additionalInfo);
      console.groupEnd();
    }

    return errorInfo;
  }

  /**
   * 获取错误日志
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * 清空错误日志
   */
  clearErrorLog(): void {
    this.errorLog.length = 0;
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): { [key in ErrorType]: number } {
    const stats = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as { [key in ErrorType]: number });

    this.errorLog.forEach((error) => {
      stats[error.type]++;
    });

    return stats;
  }

  /**
   * 导出错误报告
   */
  exportErrorReport(): string {
    const stats = this.getErrorStats();
    const recentErrors = this.errorLog.slice(-10);

    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      totalErrors: this.errorLog.length,
      errorStats: stats,
      recentErrors: recentErrors.map((error) => ({
        type: error.type,
        severity: error.severity,
        message: error.message,
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString(),
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  private classifyError(error: Error, context?: string): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // 根据错误消息和堆栈分类
    if (
      context === 'resource' ||
      message.includes('load') ||
      message.includes('fetch')
    ) {
      return ErrorType.FILE_OPERATION;
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('xhr')
    ) {
      return ErrorType.NETWORK;
    }

    if (
      message.includes('canvas') ||
      message.includes('render') ||
      stack.includes('render')
    ) {
      return ErrorType.RENDERING;
    }

    if (message.includes('memory') || message.includes('heap')) {
      return ErrorType.MEMORY;
    }

    if (message.includes('performance') || message.includes('timeout')) {
      return ErrorType.PERFORMANCE;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.USER_INPUT;
    }

    return ErrorType.UNKNOWN;
  }

  private determineSeverity(error: Error, context?: string): ErrorSeverity {
    const message = error.message.toLowerCase();

    // 关键错误
    if (
      message.includes('critical') ||
      message.includes('fatal') ||
      context === 'unhandledrejection'
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // 高严重性错误
    if (
      message.includes('memory') ||
      message.includes('crash') ||
      message.includes('corrupt')
    ) {
      return ErrorSeverity.HIGH;
    }

    // 中等严重性错误
    if (
      message.includes('render') ||
      message.includes('load') ||
      message.includes('network')
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // 低严重性错误
    return ErrorSeverity.LOW;
  }

  private attemptRecovery(errorInfo: ErrorInfo): boolean {
    try {
      switch (errorInfo.type) {
        case ErrorType.RENDERING:
          // 尝试重新渲染
          this.scheduleRerender();
          return true;

        case ErrorType.MEMORY:
          // 尝试清理内存
          this.performMemoryCleanup();
          return true;

        case ErrorType.FILE_OPERATION:
          // 文件操作错误通常需要用户干预
          return false;

        default:
          return false;
      }
    } catch (recoveryError) {
      console.error('错误恢复失败:', recoveryError);
      return false;
    }
  }

  private scheduleRerender(): void {
    // 延迟重新渲染，避免立即重复错误
    setTimeout(() => {
      try {
        // 触发全局重新渲染事件
        window.dispatchEvent(new CustomEvent('force-rerender'));
      } catch (error) {
        console.error('重新渲染失败:', error);
      }
    }, 100);
  }

  private performMemoryCleanup(): void {
    try {
      // 触发垃圾回收（如果可用）
      if ('gc' in window) {
        (window as any).gc();
      }

      // 清理可能的内存泄漏
      window.dispatchEvent(new CustomEvent('memory-cleanup'));
    } catch (error) {
      console.error('内存清理失败:', error);
    }
  }

  private addToLog(errorInfo: ErrorInfo): void {
    this.errorLog.push(errorInfo);

    // 保持日志大小限制
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }
}

// 导出单例实例
export const globalErrorHandler = ErrorHandler.getInstance();

// 自定义错误类
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileError';
  }
}

export class RenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
