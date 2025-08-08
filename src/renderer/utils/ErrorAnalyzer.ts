/**
 * 错误分析工具
 * 用于检测和分析不同类型的React错误
 */

import { ErrorInfo } from 'react';
import { reactLoopFixToolkit } from './ReactLoopFix';

export enum ErrorCategory {
  REACT_ERROR = 'react_error',
  JAVASCRIPT_ERROR = 'javascript_error',
  NETWORK_ERROR = 'network_error',
  PERFORMANCE_ERROR = 'performance_error',
  USER_ERROR = 'user_error',
}

export enum ErrorPattern {
  INFINITE_LOOP = 'infinite_loop',
  MEMORY_LEAK = 'memory_leak',
  RENDER_THRASHING = 'render_thrashing',
  STATE_MUTATION = 'state_mutation',
  ASYNC_RACE_CONDITION = 'async_race_condition',
  COMPONENT_LIFECYCLE = 'component_lifecycle',
  HOOK_DEPENDENCY = 'hook_dependency',
  CONTEXT_PROVIDER = 'context_provider',
}

export interface ErrorAnalysisResult {
  category: ErrorCategory;
  pattern: ErrorPattern | null;
  confidence: number; // 0-1
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

export class ErrorAnalyzer {
  private static instance: ErrorAnalyzer | null = null;
  
  // 错误模式的正则表达式
  private readonly errorPatterns = {
    [ErrorPattern.INFINITE_LOOP]: [
      /maximum call stack size exceeded/i,
      /too much recursion/i,
      /maximum update depth exceeded/i,
      /useEffect.*infinite/i,
      /setState.*loop/i,
    ],
    [ErrorPattern.MEMORY_LEAK]: [
      /out of memory/i,
      /memory.*leak/i,
      /heap.*size/i,
      /allocation.*failed/i,
    ],
    [ErrorPattern.RENDER_THRASHING]: [
      /render.*too.*many.*times/i,
      /component.*render.*loop/i,
      /excessive.*re-render/i,
    ],
    [ErrorPattern.STATE_MUTATION]: [
      /cannot.*mutate.*state/i,
      /state.*immutable/i,
      /direct.*state.*modification/i,
    ],
    [ErrorPattern.ASYNC_RACE_CONDITION]: [
      /promise.*race/i,
      /async.*condition/i,
      /concurrent.*update/i,
      /setState.*unmounted/i,
    ],
    [ErrorPattern.COMPONENT_LIFECYCLE]: [
      /componentDidMount/i,
      /componentWillUnmount/i,
      /useEffect.*cleanup/i,
      /lifecycle.*method/i,
    ],
    [ErrorPattern.HOOK_DEPENDENCY]: [
      /useEffect.*dependency/i,
      /useMemo.*dependency/i,
      /useCallback.*dependency/i,
      /hook.*dependency.*array/i,
    ],
    [ErrorPattern.CONTEXT_PROVIDER]: [
      /context.*provider/i,
      /useContext.*undefined/i,
      /context.*not.*found/i,
    ],
  };

  // 组件名称提取正则
  private readonly componentNameRegex = /at\s+(\w+)\s+\(/g;

  public static getInstance(): ErrorAnalyzer {
    if (!ErrorAnalyzer.instance) {
      ErrorAnalyzer.instance = new ErrorAnalyzer();
    }
    return ErrorAnalyzer.instance;
  }

  /**
   * 分析错误
   */
  public analyzeError(error: Error, errorInfo?: ErrorInfo): ErrorAnalysisResult {
    const errorMessage = error.message;
    const errorStack = error.stack || '';
    const componentStack = errorInfo?.componentStack || '';
    
    // 解析堆栈帧
    const stackFrames = this.parseStackTrace(errorStack);
    
    // 提取相关组件
    const relatedComponents = this.extractComponentNames(componentStack);
    
    // 检测错误模式
    const pattern = this.detectErrorPattern(errorMessage, errorStack, componentStack);
    
    // 确定错误类别
    const category = this.categorizeError(error, pattern);
    
    // 计算置信度
    const confidence = this.calculateConfidence(pattern, errorMessage, errorStack);
    
    // 生成描述和建议
    const description = this.generateDescription(pattern, category);
    const suggestions = this.generateSuggestions(pattern, category, relatedComponents);
    
    // 评估恢复能力
    const { isRecoverable, recoveryComplexity } = this.assessRecoverability(pattern, category);

    const result: ErrorAnalysisResult = {
      category,
      pattern,
      confidence,
      description,
      suggestions,
      relatedComponents,
      stackFrames,
      isRecoverable,
      recoveryComplexity,
    };

    // 记录分析结果
    reactLoopFixToolkit.debugLogger.info(
      'error-analyzer',
      '错误分析完成',
      {
        category,
        pattern,
        confidence,
        componentsCount: relatedComponents.length,
      },
      'ErrorAnalyzer'
    );

    return result;
  }

  /**
   * 检测错误模式
   */
  private detectErrorPattern(
    message: string,
    stack: string,
    componentStack: string
  ): ErrorPattern | null {
    const fullText = `${message} ${stack} ${componentStack}`;
    
    for (const [pattern, regexes] of Object.entries(this.errorPatterns)) {
      for (const regex of regexes) {
        if (regex.test(fullText)) {
          return pattern as ErrorPattern;
        }
      }
    }

    // 特殊检测：无限循环
    if (this.detectInfiniteLoopPattern(message, stack, componentStack)) {
      return ErrorPattern.INFINITE_LOOP;
    }

    return null;
  }

  /**
   * 检测无限循环模式
   */
  private detectInfiniteLoopPattern(
    _message: string,
    stack: string,
    componentStack: string
  ): boolean {
    // 检查是否有重复的函数调用
    const stackLines = stack.split('\n');
    const functionCalls = new Map<string, number>();
    
    for (const line of stackLines) {
      const match = line.match(/at\s+(\w+)/);
      if (match && match[1]) {
        const funcName = match[1];
        functionCalls.set(funcName, (functionCalls.get(funcName) || 0) + 1);
      }
    }

    // 如果同一个函数出现超过10次，可能是无限循环
    for (const count of functionCalls.values()) {
      if (count > 10) {
        return true;
      }
    }

    // 检查组件堆栈中的重复组件
    const componentLines = componentStack.split('\n');
    const componentCalls = new Map<string, number>();
    
    for (const line of componentLines) {
      const match = line.match(/in\s+(\w+)/);
      if (match && match[1]) {
        const componentName = match[1];
        componentCalls.set(componentName, (componentCalls.get(componentName) || 0) + 1);
      }
    }

    // 如果同一个组件出现超过5次，可能是渲染循环
    for (const count of componentCalls.values()) {
      if (count > 5) {
        return true;
      }
    }

    // 使用StateValidator检测无限循环
    return reactLoopFixToolkit.detectInfiniteLoop();
  }

  /**
   * 分类错误
   */
  private categorizeError(error: Error, pattern: ErrorPattern | null): ErrorCategory {
    if (pattern) {
      switch (pattern) {
        case ErrorPattern.INFINITE_LOOP:
        case ErrorPattern.RENDER_THRASHING:
        case ErrorPattern.COMPONENT_LIFECYCLE:
        case ErrorPattern.HOOK_DEPENDENCY:
        case ErrorPattern.CONTEXT_PROVIDER:
          return ErrorCategory.REACT_ERROR;
          
        case ErrorPattern.MEMORY_LEAK:
          return ErrorCategory.PERFORMANCE_ERROR;
          
        case ErrorPattern.ASYNC_RACE_CONDITION:
          return ErrorCategory.JAVASCRIPT_ERROR;
          
        case ErrorPattern.STATE_MUTATION:
          return ErrorCategory.USER_ERROR;
      }
    }

    // 基于错误类型分类
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorCategory.JAVASCRIPT_ERROR;
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorCategory.NETWORK_ERROR;
    }

    return ErrorCategory.REACT_ERROR;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    pattern: ErrorPattern | null,
    message: string,
    stack: string
  ): number {
    if (!pattern) return 0.3;

    let confidence = 0.5;
    const patterns = this.errorPatterns[pattern];
    
    // 检查匹配的模式数量
    let matchCount = 0;
    for (const regex of patterns) {
      if (regex.test(message) || regex.test(stack)) {
        matchCount++;
      }
    }
    
    confidence += (matchCount / patterns.length) * 0.4;
    
    // 特殊情况的置信度调整
    if (pattern === ErrorPattern.INFINITE_LOOP) {
      if (reactLoopFixToolkit.detectInfiniteLoop()) {
        confidence += 0.3;
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 生成错误描述
   */
  private generateDescription(pattern: ErrorPattern | null, category: ErrorCategory): string {
    if (pattern) {
      switch (pattern) {
        case ErrorPattern.INFINITE_LOOP:
          return '检测到无限循环错误，通常由useEffect依赖问题或递归调用引起';
        case ErrorPattern.MEMORY_LEAK:
          return '检测到内存泄漏，可能由未清理的事件监听器或定时器引起';
        case ErrorPattern.RENDER_THRASHING:
          return '检测到渲染抖动，组件频繁重新渲染导致性能问题';
        case ErrorPattern.STATE_MUTATION:
          return '检测到状态直接修改，违反了React的不可变性原则';
        case ErrorPattern.ASYNC_RACE_CONDITION:
          return '检测到异步竞态条件，多个异步操作之间存在冲突';
        case ErrorPattern.COMPONENT_LIFECYCLE:
          return '检测到组件生命周期错误，可能在错误的时机调用了方法';
        case ErrorPattern.HOOK_DEPENDENCY:
          return '检测到Hook依赖问题，useEffect/useMemo/useCallback的依赖数组不正确';
        case ErrorPattern.CONTEXT_PROVIDER:
          return '检测到Context使用错误，可能在Provider外部使用了Context';
        default:
          return '检测到未知模式的错误';
      }
    }

    switch (category) {
      case ErrorCategory.REACT_ERROR:
        return 'React组件或Hook使用错误';
      case ErrorCategory.JAVASCRIPT_ERROR:
        return 'JavaScript运行时错误';
      case ErrorCategory.NETWORK_ERROR:
        return '网络请求或连接错误';
      case ErrorCategory.PERFORMANCE_ERROR:
        return '性能相关错误，可能影响应用响应速度';
      case ErrorCategory.USER_ERROR:
        return '用户操作或输入导致的错误';
      default:
        return '未分类的错误';
    }
  }

  /**
   * 生成修复建议
   */
  private generateSuggestions(
    pattern: ErrorPattern | null,
    _category: ErrorCategory,
    components: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (pattern) {
      switch (pattern) {
        case ErrorPattern.INFINITE_LOOP:
          suggestions.push(
            '检查useEffect的依赖数组，确保不包含每次渲染都变化的值',
            '使用useCallback和useMemo稳定化函数和对象引用',
            '避免在渲染过程中直接调用setState',
            '检查是否存在组件间的循环依赖'
          );
          break;
          
        case ErrorPattern.HOOK_DEPENDENCY:
          suggestions.push(
            '检查Hook的依赖数组是否包含所有使用的变量',
            '使用ESLint的react-hooks/exhaustive-deps规则',
            '考虑使用useCallback稳定化函数引用',
            '避免在依赖数组中使用对象或数组字面量'
          );
          break;
          
        case ErrorPattern.MEMORY_LEAK:
          suggestions.push(
            '在useEffect的清理函数中移除事件监听器',
            '清理定时器和间隔器',
            '取消未完成的网络请求',
            '检查是否有循环引用导致的内存泄漏'
          );
          break;
          
        case ErrorPattern.STATE_MUTATION:
          suggestions.push(
            '使用setState或状态更新函数修改状态',
            '避免直接修改state对象或数组',
            '使用扩展运算符或Object.assign创建新对象',
            '考虑使用Immer库处理复杂的状态更新'
          );
          break;
      }
    }

    // 基于组件的建议
    if (components.length > 0) {
      suggestions.push(`重点检查以下组件: ${components.slice(0, 3).join(', ')}`);
    }

    // 通用建议
    suggestions.push(
      '查看浏览器控制台的完整错误信息',
      '使用React DevTools检查组件状态和props',
      '考虑添加错误边界来捕获和处理错误'
    );

    return suggestions;
  }

  /**
   * 评估恢复能力
   */
  private assessRecoverability(
    pattern: ErrorPattern | null,
    _category: ErrorCategory
  ): { isRecoverable: boolean; recoveryComplexity: 'low' | 'medium' | 'high' } {
    if (pattern) {
      switch (pattern) {
        case ErrorPattern.INFINITE_LOOP:
          return { isRecoverable: true, recoveryComplexity: 'high' };
        case ErrorPattern.MEMORY_LEAK:
          return { isRecoverable: true, recoveryComplexity: 'medium' };
        case ErrorPattern.RENDER_THRASHING:
          return { isRecoverable: true, recoveryComplexity: 'medium' };
        case ErrorPattern.STATE_MUTATION:
          return { isRecoverable: true, recoveryComplexity: 'low' };
        case ErrorPattern.ASYNC_RACE_CONDITION:
          return { isRecoverable: true, recoveryComplexity: 'medium' };
        case ErrorPattern.COMPONENT_LIFECYCLE:
          return { isRecoverable: true, recoveryComplexity: 'low' };
        case ErrorPattern.HOOK_DEPENDENCY:
          return { isRecoverable: true, recoveryComplexity: 'medium' };
        case ErrorPattern.CONTEXT_PROVIDER:
          return { isRecoverable: true, recoveryComplexity: 'low' };
      }
    }

    switch (_category) {
      case ErrorCategory.REACT_ERROR:
        return { isRecoverable: true, recoveryComplexity: 'medium' };
      case ErrorCategory.JAVASCRIPT_ERROR:
        return { isRecoverable: true, recoveryComplexity: 'low' };
      case ErrorCategory.NETWORK_ERROR:
        return { isRecoverable: true, recoveryComplexity: 'low' };
      case ErrorCategory.PERFORMANCE_ERROR:
        return { isRecoverable: true, recoveryComplexity: 'high' };
      case ErrorCategory.USER_ERROR:
        return { isRecoverable: true, recoveryComplexity: 'low' };
      default:
        return { isRecoverable: false, recoveryComplexity: 'high' };
    }
  }

  /**
   * 解析堆栈跟踪
   */
  private parseStackTrace(stack: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = stack.split('\n');

    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match && match[1] && match[2] && match[3] && match[4]) {
        frames.push({
          functionName: match[1],
          fileName: match[2],
          lineNumber: parseInt(match[3], 10),
          columnNumber: parseInt(match[4], 10),
          source: line.trim(),
        });
      }
    }

    return frames;
  }

  /**
   * 提取组件名称
   */
  private extractComponentNames(componentStack: string): string[] {
    const components: string[] = [];
    const matches = componentStack.matchAll(this.componentNameRegex);

    for (const match of matches) {
      const componentName = match[1];
      if (componentName && !components.includes(componentName)) {
        components.push(componentName);
      }
    }

    return components;
  }
}

// 导出单例实例
export const errorAnalyzer = ErrorAnalyzer.getInstance();