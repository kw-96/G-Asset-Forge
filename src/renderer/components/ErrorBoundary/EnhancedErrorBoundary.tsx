/**
 * 增强的错误边界组件
 * 专门处理无限循环错误和其他React错误，提供错误恢复机制
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';
import { errorAnalyzer, ErrorAnalysisResult } from '../../utils/ErrorAnalyzer';
import { errorRecoveryManager, RecoveryPlan } from '../../utils/ErrorRecoveryManager';

// 错误类型枚举
export enum ErrorType {
  INFINITE_LOOP = 'infinite_loop',
  RENDER_ERROR = 'render_error',
  ASYNC_ERROR = 'async_error',
  MEMORY_ERROR = 'memory_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误信息接口
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

// 错误恢复策略
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryMethod: 'reload' | 'reset' | 'retry' | 'fallback';
  recoveryMessage: string;
  autoRecovery?: boolean;
  autoRecoveryDelay?: number;
}

// 组件Props
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

// 组件State
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

// 样式组件
const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const ErrorIcon = styled.div<{ severity: ErrorSeverity }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  background: ${({ severity }) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '#ff4757';
      case ErrorSeverity.HIGH: return '#ff6b6b';
      case ErrorSeverity.MEDIUM: return '#ffa502';
      case ErrorSeverity.LOW: return '#3742fa';
      default: return '#747d8c';
    }
  }};
  color: white;
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #3742fa;
          color: white;
          &:hover { background: #2f3542; }
        `;
      case 'secondary':
        return `
          background: #f1f2f6;
          color: #57606f;
          &:hover { background: #ddd; }
        `;
      case 'danger':
        return `
          background: #ff4757;
          color: white;
          &:hover { background: #ff3838; }
        `;
      default:
        return '';
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DetailsSection = styled.div`
  margin-top: 20px;
  text-align: left;
`;

const DetailsToggle = styled.button`
  background: none;
  border: none;
  color: #3742fa;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  margin-bottom: 10px;
`;

const DetailsContent = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
`;

const RecoveryProgress = styled.div`
  margin: 20px 0;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
`;

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      errorAnalysis: null,
      recoveryPlan: null,
      recoveryStrategy: null,
      retryCount: 0,
      isRecovering: false,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 使用ErrorAnalyzer分析错误
    const errorAnalysis = errorAnalyzer.analyzeError(error, errorInfo);
    
    // 创建增强的错误信息
    const enhancedErrorInfo = this.createEnhancedErrorInfo(error, errorInfo, errorAnalysis);
    
    // 创建恢复计划
    const recoveryPlan = errorRecoveryManager.createRecoveryPlan(errorAnalysis, {
      enableAutoRecovery: this.props.enableAutoRecovery ?? false,
      maxRetries: this.props.maxRetries ?? 3,
      retryDelay: this.props.retryDelay ?? 2000,
    });

    // 兼容旧的恢复策略格式
    const recoveryStrategy = this.convertToLegacyStrategy(recoveryPlan.recommendedStrategy);

    this.setState({
      errorId,
      errorInfo: enhancedErrorInfo,
      errorAnalysis,
      recoveryPlan,
      recoveryStrategy,
    });

    // 记录错误日志
    reactLoopFixToolkit.debugLogger.error(
      'error-boundary',
      '捕获到React错误',
      {
        errorId,
        errorType: errorAnalysis.pattern || 'unknown',
        category: errorAnalysis.category,
        confidence: errorAnalysis.confidence,
        isRecoverable: errorAnalysis.isRecoverable,
        message: enhancedErrorInfo.message,
      },
      'EnhancedErrorBoundary'
    );

    // 调用外部错误处理回调
    if (this.props.onError) {
      this.props.onError(enhancedErrorInfo);
    }

    // 自动恢复
    if (this.props.enableAutoRecovery && recoveryPlan.autoRecoveryEnabled) {
      this.scheduleAutoRecovery(recoveryPlan, errorId);
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }



  /**
   * 创建增强的错误信息
   */
  private createEnhancedErrorInfo(
    error: Error,
    errorInfo: ErrorInfo,
    errorAnalysis: ErrorAnalysisResult
  ): EnhancedErrorInfo {
    const result: EnhancedErrorInfo = {
      type: this.mapPatternToType(errorAnalysis.pattern),
      severity: this.mapCategoryToSeverity(errorAnalysis.category),
      message: error.message,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalInfo: {
        errorAnalysis,
        retryCount: this.state.retryCount,
      },
    };

    if (error.stack) {
      result.stack = error.stack;
    }

    if (errorInfo.componentStack) {
      result.componentStack = errorInfo.componentStack;
    }

    return result;
  }

  /**
   * 将错误模式映射到错误类型
   */
  private mapPatternToType(pattern: string | null): ErrorType {
    switch (pattern) {
      case 'infinite_loop': return ErrorType.INFINITE_LOOP;
      case 'render_error': return ErrorType.RENDER_ERROR;
      case 'async_error': return ErrorType.ASYNC_ERROR;
      case 'memory_leak': return ErrorType.MEMORY_ERROR;
      case 'network_error': return ErrorType.NETWORK_ERROR;
      default: return ErrorType.UNKNOWN_ERROR;
    }
  }

  /**
   * 将错误类别映射到严重程度
   */
  private mapCategoryToSeverity(category: string): ErrorSeverity {
    switch (category) {
      case 'performance_error': return ErrorSeverity.CRITICAL;
      case 'react_error': return ErrorSeverity.HIGH;
      case 'javascript_error': return ErrorSeverity.MEDIUM;
      case 'network_error': return ErrorSeverity.LOW;
      default: return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * 转换为旧的恢复策略格式
   */
  private convertToLegacyStrategy(modernStrategy: any): ErrorRecoveryStrategy {
    return {
      canRecover: true,
      recoveryMethod: this.mapActionToMethod(modernStrategy.action),
      recoveryMessage: modernStrategy.description,
      autoRecovery: modernStrategy.riskLevel === 'low',
      autoRecoveryDelay: modernStrategy.estimatedTime,
    };
  }

  /**
   * 映射恢复动作到方法
   */
  private mapActionToMethod(action: string): 'reload' | 'reset' | 'retry' | 'fallback' {
    switch (action) {
      case 'reload_page': return 'reload';
      case 'reset_state': return 'reset';
      case 'retry_operation': return 'retry';
      default: return 'fallback';
    }
  }

  /**
   * 安排自动恢复
   */
  private scheduleAutoRecovery(plan: RecoveryPlan, errorId: string) {
    if (!plan.autoRecoveryEnabled) {
      return;
    }

    this.setState({ isRecovering: true });

    this.retryTimeoutId = setTimeout(async () => {
      try {
        await errorRecoveryManager.autoRecover(plan, errorId, {
          enableAutoRecovery: this.props.enableAutoRecovery ?? false,
          preserveUserData: true,
        });
        
        // 自动恢复成功，重置错误状态
        this.setState({
          hasError: false,
          errorInfo: null,
          errorAnalysis: null,
          recoveryPlan: null,
          recoveryStrategy: null,
          isRecovering: false,
        });
      } catch (error) {
        // 自动恢复失败，保持错误状态
        this.setState({ isRecovering: false });
        
        reactLoopFixToolkit.debugLogger.error(
          'error-boundary',
          '自动恢复失败',
          { errorId, error: error instanceof Error ? error.message : String(error) },
          'EnhancedErrorBoundary'
        );
      }
    }, plan.recommendedStrategy.estimatedTime);
  }

  /**
   * 处理错误恢复
   */
  private handleRecovery = async (method?: ErrorRecoveryStrategy['recoveryMethod']) => {
    const { recoveryPlan, errorId } = this.state;
    
    if (!recoveryPlan) {
      // 回退到旧的恢复方法
      return this.handleLegacyRecovery(method || 'retry');
    }

    this.setState({ isRecovering: true });

    try {
      const strategy = method 
        ? recoveryPlan.strategies.find(s => this.mapActionToMethod(s.action) === method) || recoveryPlan.recommendedStrategy
        : recoveryPlan.recommendedStrategy;

      const result = await errorRecoveryManager.executeRecovery(strategy, errorId, {
        enableAutoRecovery: this.props.enableAutoRecovery ?? false,
        preserveUserData: true,
      });

      if (result.success) {
        // 恢复成功，重置错误状态
        this.setState({
          hasError: false,
          errorInfo: null,
          errorAnalysis: null,
          recoveryPlan: null,
          recoveryStrategy: null,
          retryCount: 0,
          isRecovering: false,
          showDetails: false,
          errorId: '',
        });

        reactLoopFixToolkit.debugLogger.info(
          'error-boundary',
          '手动恢复成功',
          { errorId, action: result.action, duration: result.duration },
          'EnhancedErrorBoundary'
        );
      }
    } catch (error) {
      // 恢复失败
      this.setState({ isRecovering: false });
      
      reactLoopFixToolkit.debugLogger.error(
        'error-boundary',
        '手动恢复失败',
        { errorId, error: error instanceof Error ? error.message : String(error) },
        'EnhancedErrorBoundary'
      );

      // 如果推荐策略失败，尝试备用策略
      if (recoveryPlan.fallbackStrategy !== recoveryPlan.recommendedStrategy) {
        try {
          const fallbackResult = await errorRecoveryManager.executeRecovery(
            recoveryPlan.fallbackStrategy,
            errorId
          );
          
          if (fallbackResult.success) {
            this.setState({
              hasError: false,
              errorInfo: null,
              errorAnalysis: null,
              recoveryPlan: null,
              recoveryStrategy: null,
              retryCount: 0,
              isRecovering: false,
              showDetails: false,
              errorId: '',
            });
          }
        } catch (fallbackError) {
          // 备用策略也失败了
          this.setState({ isRecovering: false });
        }
      }
    }
  };

  /**
   * 处理旧版恢复方法
   */
  private handleLegacyRecovery = (method: ErrorRecoveryStrategy['recoveryMethod']) => {
    const { retryCount } = this.state;
    const maxRetries = this.props.maxRetries || 3;

    switch (method) {
      case 'reload':
        window.location.reload();
        break;

      case 'reset':
        reactLoopFixToolkit.resetAll();
        this.setState({
          hasError: false,
          errorInfo: null,
          errorAnalysis: null,
          recoveryPlan: null,
          recoveryStrategy: null,
          retryCount: 0,
          isRecovering: false,
          showDetails: false,
          errorId: '',
        });
        break;

      case 'retry':
        if (retryCount < maxRetries) {
          this.setState({
            hasError: false,
            errorInfo: null,
            errorAnalysis: null,
            recoveryPlan: null,
            recoveryStrategy: null,
            retryCount: retryCount + 1,
            isRecovering: false,
          });
        } else {
          this.setState({
            isRecovering: false,
            recoveryStrategy: {
              ...this.state.recoveryStrategy!,
              autoRecovery: false,
              recoveryMessage: `已达到最大重试次数 (${maxRetries})，请手动处理`,
            },
          });
        }
        break;

      case 'fallback':
        break;
    }
  };

  /**
   * 获取错误图标
   */
  private getErrorIcon(type: ErrorType): string {
    switch (type) {
      case ErrorType.INFINITE_LOOP: return '🔄';
      case ErrorType.RENDER_ERROR: return '🖥️';
      case ErrorType.ASYNC_ERROR: return '⏳';
      case ErrorType.MEMORY_ERROR: return '💾';
      case ErrorType.NETWORK_ERROR: return '🌐';
      default: return '❌';
    }
  }

  /**
   * 获取错误标题
   */
  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.INFINITE_LOOP: return '检测到无限循环';
      case ErrorType.RENDER_ERROR: return '渲染错误';
      case ErrorType.ASYNC_ERROR: return '异步操作错误';
      case ErrorType.MEMORY_ERROR: return '内存不足';
      case ErrorType.NETWORK_ERROR: return '网络连接错误';
      default: return '应用程序错误';
    }
  }

  /**
   * 生成错误报告
   */
  private generateErrorReport = () => {
    const { errorInfo } = this.state;
    if (!errorInfo) return;

    const report = {
      ...errorInfo,
      diagnosticReport: reactLoopFixToolkit.generateDiagnosticReport(),
    };

    const reportText = JSON.stringify(report, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { errorInfo, errorAnalysis, recoveryPlan, isRecovering, showDetails } = this.state;
    
    if (!errorInfo) {
      return this.props.fallback || <div>加载错误信息...</div>;
    }

    return (
      <ErrorContainer>
        <ErrorCard>
          <ErrorIcon severity={errorInfo.severity}>
            {this.getErrorIcon(errorInfo.type)}
          </ErrorIcon>
          
          <ErrorTitle>
            {this.getErrorTitle(errorInfo.type)}
          </ErrorTitle>
          
          <ErrorMessage>
            {errorAnalysis?.description || errorInfo.message}
          </ErrorMessage>

          {/* 显示错误分析信息 */}
          {errorAnalysis && (
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              <div>置信度: {Math.round(errorAnalysis.confidence * 100)}%</div>
              {errorAnalysis.relatedComponents.length > 0 && (
                <div>相关组件: {errorAnalysis.relatedComponents.slice(0, 3).join(', ')}</div>
              )}
            </div>
          )}

          {isRecovering && recoveryPlan && (
            <RecoveryProgress>
              <div>🔄 正在尝试恢复...</div>
              <div style={{ fontSize: '14px', marginTop: '8px', color: '#666' }}>
                {recoveryPlan.recommendedStrategy.description}
              </div>
            </RecoveryProgress>
          )}

          <ButtonGroup>
            {recoveryPlan?.recommendedStrategy && (
              <Button
                variant="primary"
                onClick={() => this.handleRecovery()}
                disabled={isRecovering}
              >
                {isRecovering ? '恢复中...' : '智能恢复'}
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              重新加载
            </Button>
            
            {this.props.showDebugInfo && (
              <Button
                variant="secondary"
                onClick={this.generateErrorReport}
              >
                下载错误报告
              </Button>
            )}
          </ButtonGroup>

          {/* 显示修复建议 */}
          {errorAnalysis?.suggestions && errorAnalysis.suggestions.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>修复建议:</h4>
              <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
                {errorAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {this.props.showDebugInfo && (
            <DetailsSection>
              <DetailsToggle
                onClick={() => this.setState({ showDetails: !showDetails })}
              >
                {showDetails ? '隐藏' : '显示'}错误详情
              </DetailsToggle>
              
              {showDetails && (
                <DetailsContent>
                  <div><strong>错误ID:</strong> {this.state.errorId}</div>
                  <div><strong>错误类型:</strong> {errorInfo.type}</div>
                  <div><strong>严重程度:</strong> {errorInfo.severity}</div>
                  <div><strong>时间:</strong> {new Date(errorInfo.timestamp).toLocaleString()}</div>
                  <div><strong>重试次数:</strong> {this.state.retryCount}</div>
                  <div><strong>URL:</strong> {errorInfo.url}</div>
                  
                  {errorAnalysis && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>错误分析:</strong>
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>
                        <div>模式: {errorAnalysis.pattern || '未知'}</div>
                        <div>类别: {errorAnalysis.category}</div>
                        <div>可恢复: {errorAnalysis.isRecoverable ? '是' : '否'}</div>
                        <div>恢复复杂度: {errorAnalysis.recoveryComplexity}</div>
                      </div>
                    </div>
                  )}

                  {recoveryPlan && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>恢复计划:</strong>
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>
                        <div>推荐策略: {recoveryPlan.recommendedStrategy.action}</div>
                        <div>风险级别: {recoveryPlan.recommendedStrategy.riskLevel}</div>
                        <div>预计时间: {recoveryPlan.recommendedStrategy.estimatedTime}ms</div>
                        <div>自动恢复: {recoveryPlan.autoRecoveryEnabled ? '启用' : '禁用'}</div>
                      </div>
                    </div>
                  )}
                  
                  {errorInfo.stack && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>错误堆栈:</strong>
                      <pre style={{ marginTop: '4px', fontSize: '11px' }}>
                        {errorInfo.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo.componentStack && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>组件堆栈:</strong>
                      <pre style={{ marginTop: '4px', fontSize: '11px' }}>
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </DetailsContent>
              )}
            </DetailsSection>
          )}
        </ErrorCard>
      </ErrorContainer>
    );
  }
}