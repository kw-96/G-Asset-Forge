/**
 * 项目错误处理器
 * 提供统一的错误处理和用户友好的错误消息
 */

export enum ErrorType {
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_LOAD_FAILED = 'PROJECT_LOAD_FAILED',
  PROJECT_SAVE_FAILED = 'PROJECT_SAVE_FAILED',
  PROJECT_DELETE_FAILED = 'PROJECT_DELETE_FAILED',
  PROJECT_RENAME_FAILED = 'PROJECT_RENAME_FAILED',
  PROJECT_TYPE_IDENTIFICATION_FAILED = 'PROJECT_TYPE_IDENTIFICATION_FAILED',
  EDITOR_INITIALIZATION_FAILED = 'EDITOR_INITIALIZATION_FAILED',
  AUTO_SAVE_FAILED = 'AUTO_SAVE_FAILED',
  AUTO_EXPORT_FAILED = 'AUTO_EXPORT_FAILED',
  H5_CONTAINER_RESTORE_TIMEOUT = 'H5_CONTAINER_RESTORE_TIMEOUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ProjectError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  context?: Record<string, any>;
  recoverable: boolean;
  timestamp: number;
}

export class ProjectErrorHandler {
  private errorHistory: ProjectError[] = [];
  private maxHistorySize = 50;

  /**
   * 处理项目错误
   */
  handleError(
    error: Error,
    type: ErrorType,
    context?: Record<string, any>,
  ): ProjectError {
    const projectError: ProjectError = {
      type,
      severity: this.assessSeverity(error, type),
      message: error.message,
      userMessage: this.getUserFriendlyMessage(error, type),
      context,
      recoverable: this.isRecoverable(error, type),
      timestamp: Date.now(),
    };

    this.addToHistory(projectError);
    console.error('项目错误:', projectError);

    return projectError;
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(error: Error, type: ErrorType): string {
    switch (type) {
      case ErrorType.PROJECT_NOT_FOUND:
        return '项目不存在，请检查项目ID是否正确';
      case ErrorType.PROJECT_LOAD_FAILED:
        return '项目加载失败，请尝试重新打开项目';
      case ErrorType.PROJECT_SAVE_FAILED:
        return '项目保存失败，请检查存储空间或网络连接';
      case ErrorType.PROJECT_TYPE_IDENTIFICATION_FAILED:
        return '无法识别项目类型，请检查项目文件是否完整';
      case ErrorType.EDITOR_INITIALIZATION_FAILED:
        return '编辑器初始化失败，请刷新页面重试';
      case ErrorType.AUTO_SAVE_FAILED:
        return '自动保存失败，请手动保存项目';
      case ErrorType.NETWORK_ERROR:
        return '网络连接错误，请检查网络连接后重试';
      case ErrorType.VALIDATION_ERROR:
        return '项目数据验证失败，可能存在兼容性问题';
      default:
        return `发生未知错误：${error.message}`;
    }
  }

  /**
   * 评估错误严重程度
   */
  private assessSeverity(error: Error, type: ErrorType): ErrorSeverity {
    // 根据错误类型和消息内容评估严重程度
    if (type === ErrorType.EDITOR_INITIALIZATION_FAILED) {
      return ErrorSeverity.CRITICAL;
    }

    if (
      type === ErrorType.PROJECT_LOAD_FAILED ||
      type === ErrorType.PROJECT_SAVE_FAILED
    ) {
      return ErrorSeverity.HIGH;
    }

    if (
      type === ErrorType.AUTO_SAVE_FAILED ||
      type === ErrorType.NETWORK_ERROR
    ) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * 判断错误是否可恢复
   */
  private isRecoverable(error: Error, type: ErrorType): boolean {
    // 网络错误通常可恢复
    if (type === ErrorType.NETWORK_ERROR) {
      return true;
    }

    // 自动保存失败可恢复
    if (type === ErrorType.AUTO_SAVE_FAILED) {
      return true;
    }

    // 项目加载失败可能可恢复
    if (type === ErrorType.PROJECT_LOAD_FAILED) {
      return true;
    }

    return false;
  }

  /**
   * 添加错误到历史记录
   */
  private addToHistory(error: ProjectError): void {
    this.errorHistory.push(error);

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(limit?: number): ProjectError[] {
    const history = [...this.errorHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: ProjectError[];
  } {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: this.errorHistory.slice(-10),
    };

    // 初始化计数器
    Object.values(ErrorType).forEach((type) => {
      stats.byType[type] = 0;
    });
    Object.values(ErrorSeverity).forEach((severity) => {
      stats.bySeverity[severity] = 0;
    });

    // 统计各类错误
    for (const error of this.errorHistory) {
      stats.byType[error.type]++;
      stats.bySeverity[error.severity]++;
    }

    return stats;
  }

  /**
   * 清理错误历史
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * 检查是否有严重错误
   */
  hasCriticalErrors(): boolean {
    return this.errorHistory.some(
      (error) => error.severity === ErrorSeverity.CRITICAL,
    );
  }

  /**
   * 获取最近的错误
   */
  getRecentError(): ProjectError | null {
    return this.errorHistory.length > 0
      ? this.errorHistory[this.errorHistory.length - 1]
      : null;
  }
}
