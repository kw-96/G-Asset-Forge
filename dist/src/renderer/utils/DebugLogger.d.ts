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
export declare class DebugLogger {
    private static instance;
    private logEntries;
    private options;
    private logLevelPriority;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(options?: DebugLoggerOptions): DebugLogger;
    /**
     * 记录调试信息
     */
    debug(category: string, message: string, data?: any, componentName?: string): void;
    /**
     * 记录一般信息
     */
    info(category: string, message: string, data?: any, componentName?: string): void;
    /**
     * 记录警告信息
     */
    warn(category: string, message: string, data?: any, componentName?: string): void;
    /**
     * 记录错误信息
     */
    error(category: string, message: string, data?: any, componentName?: string): void;
    /**
     * 记录React组件相关的日志
     */
    logComponent(componentName: string, action: string, details?: any, level?: LogLevel): void;
    /**
     * 记录状态更新相关的日志
     */
    logStateUpdate(statePath: string, prevValue: any, nextValue: any, componentName?: string): void;
    /**
     * 记录useEffect相关的日志
     */
    logEffect(componentName: string, effectName: string, dependencies: any[], action: 'mount' | 'update' | 'cleanup'): void;
    /**
     * 记录渲染相关的日志
     */
    logRender(componentName: string, renderCount: number, props?: any, reason?: string): void;
    /**
     * 记录性能相关的日志
     */
    logPerformance(operation: string, duration: number, details?: any): void;
    /**
     * 记录无限循环检测结果
     */
    logInfiniteLoopDetection(detected: boolean, details: {
        componentName?: string;
        statePath?: string;
        updateCount?: number;
        timeWindow?: number;
    }): void;
    /**
     * 获取日志条目
     */
    getLogEntries(category?: string, level?: LogLevel, componentName?: string, limit?: number): LogEntry[];
    /**
     * 清除日志
     */
    clearLogs(): void;
    /**
     * 导出日志为文本
     */
    exportLogs(category?: string, level?: LogLevel): string;
    /**
     * 生成日志统计报告
     */
    generateStats(): {
        totalEntries: number;
        entriesByLevel: Record<LogLevel, number>;
        entriesByCategory: Record<string, number>;
        entriesByComponent: Record<string, number>;
        recentErrors: LogEntry[];
        performanceIssues: LogEntry[];
    };
    /**
     * 设置日志选项
     */
    setOptions(options: Partial<DebugLoggerOptions>): void;
    /**
     * 核心日志记录方法
     */
    private log;
    /**
     * 输出到控制台
     */
    private outputToConsole;
    /**
     * 清理敏感数据
     */
    private sanitizeValue;
    /**
     * 比较两个值是否相等
     */
    private isValueEqual;
    /**
     * 获取调用栈
     */
    private getStackTrace;
    /**
     * 销毁实例
     */
    destroy(): void;
}
export declare const debugLogger: DebugLogger;
export declare const logComponent: (componentName: string, action: string, details?: any, level?: LogLevel) => void;
export declare const logStateUpdate: (statePath: string, prevValue: any, nextValue: any, componentName?: string) => void;
export declare const logEffect: (componentName: string, effectName: string, dependencies: any[], action: "mount" | "update" | "cleanup") => void;
export declare const logRender: (componentName: string, renderCount: number, props?: any, reason?: string) => void;
export declare const logInfiniteLoop: (detected: boolean, details: any) => void;
//# sourceMappingURL=DebugLogger.d.ts.map