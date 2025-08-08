/**
 * 增强的错误边界组件
 * 专门处理无限循环错误和其他React错误，提供错误恢复机制
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorAnalysisResult } from '../../utils/ErrorAnalyzer';
import { RecoveryPlan } from '../../utils/ErrorRecoveryManager';
export declare enum ErrorType {
    INFINITE_LOOP = "infinite_loop",
    RENDER_ERROR = "render_error",
    ASYNC_ERROR = "async_error",
    MEMORY_ERROR = "memory_error",
    NETWORK_ERROR = "network_error",
    UNKNOWN_ERROR = "unknown_error"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface EnhancedErrorInfo {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    stack?: string;
    componentStack?: string;
    timestamp: number;
    userAgent: string;
    url: string;
    userId?: string;
    sessionId?: string;
    additionalInfo?: Record<string, any>;
}
export interface ErrorRecoveryStrategy {
    canRecover: boolean;
    recoveryMethod: 'reload' | 'reset' | 'retry' | 'fallback';
    recoveryMessage: string;
    autoRecovery?: boolean;
    autoRecoveryDelay?: number;
}
export interface EnhancedErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (errorInfo: EnhancedErrorInfo) => void;
    enableAutoRecovery?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    showDebugInfo?: boolean;
    enableErrorReporting?: boolean;
}
interface EnhancedErrorBoundaryState {
    hasError: boolean;
    errorInfo: EnhancedErrorInfo | null;
    errorAnalysis: ErrorAnalysisResult | null;
    recoveryPlan: RecoveryPlan | null;
    recoveryStrategy: ErrorRecoveryStrategy | null;
    retryCount: number;
    isRecovering: boolean;
    showDetails: boolean;
    errorId: string;
}
export declare class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
    private retryTimeoutId;
    constructor(props: EnhancedErrorBoundaryProps);
    static getDerivedStateFromError(_error: Error): Partial<EnhancedErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentWillUnmount(): void;
    /**
     * 创建增强的错误信息
     */
    private createEnhancedErrorInfo;
    /**
     * 将错误模式映射到错误类型
     */
    private mapPatternToType;
    /**
     * 将错误类别映射到严重程度
     */
    private mapCategoryToSeverity;
    /**
     * 转换为旧的恢复策略格式
     */
    private convertToLegacyStrategy;
    /**
     * 映射恢复动作到方法
     */
    private mapActionToMethod;
    /**
     * 安排自动恢复
     */
    private scheduleAutoRecovery;
    /**
     * 处理错误恢复
     */
    private handleRecovery;
    /**
     * 处理旧版恢复方法
     */
    private handleLegacyRecovery;
    /**
     * 获取错误图标
     */
    private getErrorIcon;
    /**
     * 获取错误标题
     */
    private getErrorTitle;
    /**
     * 生成错误报告
     */
    private generateErrorReport;
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | null | undefined;
}
export {};
//# sourceMappingURL=EnhancedErrorBoundary.d.ts.map