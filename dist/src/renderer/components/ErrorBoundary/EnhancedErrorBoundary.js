import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 增强的错误边界组件
 * 专门处理无限循环错误和其他React错误，提供错误恢复机制
 */
import { Component } from 'react';
import styled from 'styled-components';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';
import { errorAnalyzer } from '../../utils/ErrorAnalyzer';
import { errorRecoveryManager } from '../../utils/ErrorRecoveryManager';
// 错误类型枚举
export var ErrorType;
(function (ErrorType) {
    ErrorType["INFINITE_LOOP"] = "infinite_loop";
    ErrorType["RENDER_ERROR"] = "render_error";
    ErrorType["ASYNC_ERROR"] = "async_error";
    ErrorType["MEMORY_ERROR"] = "memory_error";
    ErrorType["NETWORK_ERROR"] = "network_error";
    ErrorType["UNKNOWN_ERROR"] = "unknown_error";
})(ErrorType || (ErrorType = {}));
// 错误严重程度
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
// 样式组件
const ErrorContainer = styled.div `
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
const ErrorCard = styled.div `
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
`;
const ErrorIcon = styled.div `
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
const ErrorTitle = styled.h1 `
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
`;
const ErrorMessage = styled.p `
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.5;
`;
const ButtonGroup = styled.div `
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;
const Button = styled.button `
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
const DetailsSection = styled.div `
  margin-top: 20px;
  text-align: left;
`;
const DetailsToggle = styled.button `
  background: none;
  border: none;
  color: #3742fa;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  margin-bottom: 10px;
`;
const DetailsContent = styled.div `
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
`;
const RecoveryProgress = styled.div `
  margin: 20px 0;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
`;
export class EnhancedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.retryTimeoutId = null;
        /**
         * 处理错误恢复
         */
        this.handleRecovery = async (method) => {
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
                    reactLoopFixToolkit.debugLogger.info('error-boundary', '手动恢复成功', { errorId, action: result.action, duration: result.duration }, 'EnhancedErrorBoundary');
                }
            }
            catch (error) {
                // 恢复失败
                this.setState({ isRecovering: false });
                reactLoopFixToolkit.debugLogger.error('error-boundary', '手动恢复失败', { errorId, error: error instanceof Error ? error.message : String(error) }, 'EnhancedErrorBoundary');
                // 如果推荐策略失败，尝试备用策略
                if (recoveryPlan.fallbackStrategy !== recoveryPlan.recommendedStrategy) {
                    try {
                        const fallbackResult = await errorRecoveryManager.executeRecovery(recoveryPlan.fallbackStrategy, errorId);
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
                    }
                    catch (fallbackError) {
                        // 备用策略也失败了
                        this.setState({ isRecovering: false });
                    }
                }
            }
        };
        /**
         * 处理旧版恢复方法
         */
        this.handleLegacyRecovery = (method) => {
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
                    }
                    else {
                        this.setState({
                            isRecovering: false,
                            recoveryStrategy: {
                                ...this.state.recoveryStrategy,
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
         * 生成错误报告
         */
        this.generateErrorReport = () => {
            const { errorInfo } = this.state;
            if (!errorInfo)
                return;
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
    static getDerivedStateFromError(_error) {
        return {
            hasError: true,
        };
    }
    componentDidCatch(error, errorInfo) {
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
        reactLoopFixToolkit.debugLogger.error('error-boundary', '捕获到React错误', {
            errorId,
            errorType: errorAnalysis.pattern || 'unknown',
            category: errorAnalysis.category,
            confidence: errorAnalysis.confidence,
            isRecoverable: errorAnalysis.isRecoverable,
            message: enhancedErrorInfo.message,
        }, 'EnhancedErrorBoundary');
        // 调用外部错误处理回调
        if (this.props.onError) {
            this.props.onError(enhancedErrorInfo);
        }
        // 自动恢复
        if (this.props.enableAutoRecovery && recoveryPlan.autoRecoveryEnabled) {
            this.scheduleAutoRecovery(recoveryPlan, errorId);
        }
    }
    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }
    /**
     * 创建增强的错误信息
     */
    createEnhancedErrorInfo(error, errorInfo, errorAnalysis) {
        const result = {
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
    mapPatternToType(pattern) {
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
    mapCategoryToSeverity(category) {
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
    convertToLegacyStrategy(modernStrategy) {
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
    mapActionToMethod(action) {
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
    scheduleAutoRecovery(plan, errorId) {
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
            }
            catch (error) {
                // 自动恢复失败，保持错误状态
                this.setState({ isRecovering: false });
                reactLoopFixToolkit.debugLogger.error('error-boundary', '自动恢复失败', { errorId, error: error instanceof Error ? error.message : String(error) }, 'EnhancedErrorBoundary');
            }
        }, plan.recommendedStrategy.estimatedTime);
    }
    /**
     * 获取错误图标
     */
    getErrorIcon(type) {
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
    getErrorTitle(type) {
        switch (type) {
            case ErrorType.INFINITE_LOOP: return '检测到无限循环';
            case ErrorType.RENDER_ERROR: return '渲染错误';
            case ErrorType.ASYNC_ERROR: return '异步操作错误';
            case ErrorType.MEMORY_ERROR: return '内存不足';
            case ErrorType.NETWORK_ERROR: return '网络连接错误';
            default: return '应用程序错误';
        }
    }
    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }
        const { errorInfo, errorAnalysis, recoveryPlan, isRecovering, showDetails } = this.state;
        if (!errorInfo) {
            return this.props.fallback || _jsx("div", { children: "\u52A0\u8F7D\u9519\u8BEF\u4FE1\u606F..." });
        }
        return (_jsx(ErrorContainer, { children: _jsxs(ErrorCard, { children: [_jsx(ErrorIcon, { severity: errorInfo.severity, children: this.getErrorIcon(errorInfo.type) }), _jsx(ErrorTitle, { children: this.getErrorTitle(errorInfo.type) }), _jsx(ErrorMessage, { children: errorAnalysis?.description || errorInfo.message }), errorAnalysis && (_jsxs("div", { style: { marginBottom: '20px', fontSize: '14px', color: '#666' }, children: [_jsxs("div", { children: ["\u7F6E\u4FE1\u5EA6: ", Math.round(errorAnalysis.confidence * 100), "%"] }), errorAnalysis.relatedComponents.length > 0 && (_jsxs("div", { children: ["\u76F8\u5173\u7EC4\u4EF6: ", errorAnalysis.relatedComponents.slice(0, 3).join(', ')] }))] })), isRecovering && recoveryPlan && (_jsxs(RecoveryProgress, { children: [_jsx("div", { children: "\uD83D\uDD04 \u6B63\u5728\u5C1D\u8BD5\u6062\u590D..." }), _jsx("div", { style: { fontSize: '14px', marginTop: '8px', color: '#666' }, children: recoveryPlan.recommendedStrategy.description })] })), _jsxs(ButtonGroup, { children: [recoveryPlan?.recommendedStrategy && (_jsx(Button, { variant: "primary", onClick: () => this.handleRecovery(), disabled: isRecovering, children: isRecovering ? '恢复中...' : '智能恢复' })), _jsx(Button, { variant: "secondary", onClick: () => window.location.reload(), children: "\u91CD\u65B0\u52A0\u8F7D" }), this.props.showDebugInfo && (_jsx(Button, { variant: "secondary", onClick: this.generateErrorReport, children: "\u4E0B\u8F7D\u9519\u8BEF\u62A5\u544A" }))] }), errorAnalysis?.suggestions && errorAnalysis.suggestions.length > 0 && (_jsxs("div", { style: { marginTop: '20px', textAlign: 'left' }, children: [_jsx("h4", { style: { fontSize: '16px', marginBottom: '10px' }, children: "\u4FEE\u590D\u5EFA\u8BAE:" }), _jsx("ul", { style: { fontSize: '14px', color: '#666', paddingLeft: '20px' }, children: errorAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (_jsx("li", { style: { marginBottom: '5px' }, children: suggestion }, index))) })] })), this.props.showDebugInfo && (_jsxs(DetailsSection, { children: [_jsxs(DetailsToggle, { onClick: () => this.setState({ showDetails: !showDetails }), children: [showDetails ? '隐藏' : '显示', "\u9519\u8BEF\u8BE6\u60C5"] }), showDetails && (_jsxs(DetailsContent, { children: [_jsxs("div", { children: [_jsx("strong", { children: "\u9519\u8BEFID:" }), " ", this.state.errorId] }), _jsxs("div", { children: [_jsx("strong", { children: "\u9519\u8BEF\u7C7B\u578B:" }), " ", errorInfo.type] }), _jsxs("div", { children: [_jsx("strong", { children: "\u4E25\u91CD\u7A0B\u5EA6:" }), " ", errorInfo.severity] }), _jsxs("div", { children: [_jsx("strong", { children: "\u65F6\u95F4:" }), " ", new Date(errorInfo.timestamp).toLocaleString()] }), _jsxs("div", { children: [_jsx("strong", { children: "\u91CD\u8BD5\u6B21\u6570:" }), " ", this.state.retryCount] }), _jsxs("div", { children: [_jsx("strong", { children: "URL:" }), " ", errorInfo.url] }), errorAnalysis && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("strong", { children: "\u9519\u8BEF\u5206\u6790:" }), _jsxs("div", { style: { marginTop: '4px', fontSize: '12px' }, children: [_jsxs("div", { children: ["\u6A21\u5F0F: ", errorAnalysis.pattern || '未知'] }), _jsxs("div", { children: ["\u7C7B\u522B: ", errorAnalysis.category] }), _jsxs("div", { children: ["\u53EF\u6062\u590D: ", errorAnalysis.isRecoverable ? '是' : '否'] }), _jsxs("div", { children: ["\u6062\u590D\u590D\u6742\u5EA6: ", errorAnalysis.recoveryComplexity] })] })] })), recoveryPlan && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("strong", { children: "\u6062\u590D\u8BA1\u5212:" }), _jsxs("div", { style: { marginTop: '4px', fontSize: '12px' }, children: [_jsxs("div", { children: ["\u63A8\u8350\u7B56\u7565: ", recoveryPlan.recommendedStrategy.action] }), _jsxs("div", { children: ["\u98CE\u9669\u7EA7\u522B: ", recoveryPlan.recommendedStrategy.riskLevel] }), _jsxs("div", { children: ["\u9884\u8BA1\u65F6\u95F4: ", recoveryPlan.recommendedStrategy.estimatedTime, "ms"] }), _jsxs("div", { children: ["\u81EA\u52A8\u6062\u590D: ", recoveryPlan.autoRecoveryEnabled ? '启用' : '禁用'] })] })] })), errorInfo.stack && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("strong", { children: "\u9519\u8BEF\u5806\u6808:" }), _jsx("pre", { style: { marginTop: '4px', fontSize: '11px' }, children: errorInfo.stack })] })), errorInfo.componentStack && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("strong", { children: "\u7EC4\u4EF6\u5806\u6808:" }), _jsx("pre", { style: { marginTop: '4px', fontSize: '11px' }, children: errorInfo.componentStack })] }))] }))] }))] }) }));
    }
}
//# sourceMappingURL=EnhancedErrorBoundary.js.map