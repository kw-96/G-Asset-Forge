/**
 * 错误分析工具
 * 用于检测和分析不同类型的React错误
 */
import { ErrorInfo } from 'react';
export declare enum ErrorCategory {
    REACT_ERROR = "react_error",
    JAVASCRIPT_ERROR = "javascript_error",
    NETWORK_ERROR = "network_error",
    PERFORMANCE_ERROR = "performance_error",
    USER_ERROR = "user_error"
}
export declare enum ErrorPattern {
    INFINITE_LOOP = "infinite_loop",
    MEMORY_LEAK = "memory_leak",
    RENDER_THRASHING = "render_thrashing",
    STATE_MUTATION = "state_mutation",
    ASYNC_RACE_CONDITION = "async_race_condition",
    COMPONENT_LIFECYCLE = "component_lifecycle",
    HOOK_DEPENDENCY = "hook_dependency",
    CONTEXT_PROVIDER = "context_provider"
}
export interface ErrorAnalysisResult {
    category: ErrorCategory;
    pattern: ErrorPattern | null;
    confidence: number;
    description: string;
    suggestions: string[];
    relatedComponents: string[];
    stackFrames: StackFrame[];
    isRecoverable: boolean;
    recoveryComplexity: 'low' | 'medium' | 'high';
}
export interface StackFrame {
    functionName: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    source: string;
}
export declare class ErrorAnalyzer {
    private static instance;
    private readonly errorPatterns;
    private readonly componentNameRegex;
    static getInstance(): ErrorAnalyzer;
    /**
     * 分析错误
     */
    analyzeError(error: Error, errorInfo?: ErrorInfo): ErrorAnalysisResult;
    /**
     * 检测错误模式
     */
    private detectErrorPattern;
    /**
     * 检测无限循环模式
     */
    private detectInfiniteLoopPattern;
    /**
     * 分类错误
     */
    private categorizeError;
    /**
     * 计算置信度
     */
    private calculateConfidence;
    /**
     * 生成错误描述
     */
    private generateDescription;
    /**
     * 生成修复建议
     */
    private generateSuggestions;
    /**
     * 评估恢复能力
     */
    private assessRecoverability;
    /**
     * 解析堆栈跟踪
     */
    private parseStackTrace;
    /**
     * 提取组件名称
     */
    private extractComponentNames;
}
export declare const errorAnalyzer: ErrorAnalyzer;
//# sourceMappingURL=ErrorAnalyzer.d.ts.map