/**
 * UI增强功能错误边界组件
 * 捕获UI增强功能中的错误，提供降级处理和用户友好的错误界面
 */

import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { UIEnhancementManager } from '../../utils/UIEnhancementManager';
import { UIFeature } from './UIIntegrationProvider';

// 错误状态接口
interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  affectedFeature?: UIFeature;
  canRecover: boolean;
  retryCount: number;
}

// 组件属性接口
interface UIEnhancementErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, feature?: UIFeature) => void;
  onRecover?: (feature?: UIFeature) => void;
  maxRetries?: number;
  enableAutoRecovery?: boolean;
}

// 样式组件
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.status.error};
  border-radius: ${props => props.theme.borderRadius.medium};
  margin: 16px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.status.error};
`;

const ErrorMessage = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  max-width: 400px;
  line-height: 1.5;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ErrorButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: 1px solid ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : props.theme.colors.border.default
  };
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : props.theme.colors.background.primary
  };
  color: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.text.inverse 
      : props.theme.colors.text.primary
  };
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorDetails = styled.details`
  margin-top: 16px;
  max-width: 500px;
  
  summary {
    cursor: pointer;
    font-size: 12px;
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: 8px;
  }
`;

const ErrorStack = styled.pre`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.primary};
  padding: 12px;
  border-radius: ${props => props.theme.borderRadius.small};
  overflow-x: auto;
  max-height: 200px;
  text-align: left;
`;

/**
 * UI增强功能错误边界组件
 */
export class UIEnhancementErrorBoundary extends Component<
  UIEnhancementErrorBoundaryProps,
  ErrorState
> {
  private manager: UIEnhancementManager;
  private recoveryTimer?: NodeJS.Timeout;

  constructor(props: UIEnhancementErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      canRecover: true,
      retryCount: 0
    };

    this.manager = UIEnhancementManager.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return {
      hasError: true,
      error,
      canRecover: true
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, maxRetries = 3 } = this.props;
    
    console.error('UI增强功能错误边界捕获错误:', error, errorInfo);

    // 尝试识别受影响的功能
    const affectedFeature = this.identifyAffectedFeature(error, errorInfo);
    
    // 更新状态（在 exactOptionalPropertyTypes 下，避免为可选属性显式赋 undefined）
    const baseUpdate = {
      error,
      errorInfo,
      canRecover: this.state.retryCount < maxRetries
    } as Pick<ErrorState, 'error' | 'errorInfo' | 'canRecover'>;
    const update = (affectedFeature !== undefined)
      ? ({ ...baseUpdate, affectedFeature } as Pick<ErrorState, 'error' | 'errorInfo' | 'canRecover'> & Partial<Pick<ErrorState, 'affectedFeature'>>)
      : baseUpdate;
    this.setState(update);

    // 禁用受影响的功能
    if (affectedFeature) {
      try {
        this.manager.disableFeature(affectedFeature);
        console.log(`已禁用受影响的功能: ${affectedFeature}`);
      } catch (disableError) {
        console.error('禁用功能时出错:', disableError);
      }
    }

    // 调用错误回调
    onError?.(error, errorInfo, affectedFeature);

    // 自动恢复机制
    if (this.props.enableAutoRecovery && this.state.canRecover) {
      this.scheduleAutoRecovery();
    }
  }

  override componentWillUnmount(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  /**
   * 识别受影响的功能
   */
  private identifyAffectedFeature(error: Error, errorInfo: React.ErrorInfo): UIFeature | undefined {
    const stack = error.stack || '';
    const componentStack = errorInfo.componentStack || '';
    
    // 根据错误堆栈和组件堆栈识别功能
    if (stack.includes('FigmaInteractive') || componentStack.includes('FigmaInteractive')) {
      return UIFeature.INTERACTIVE_COMPONENTS;
    }
    
    if (stack.includes('FigmaTooltip') || componentStack.includes('FigmaTooltip')) {
      return UIFeature.TOOLTIPS;
    }
    
    if (stack.includes('FigmaTransition') || componentStack.includes('FigmaTransition')) {
      return UIFeature.TRANSITIONS;
    }
    
    if (stack.includes('FigmaVirtualizedList') || componentStack.includes('VirtualizedList')) {
      return UIFeature.VIRTUALIZATION;
    }
    
    if (stack.includes('FigmaNotification') || componentStack.includes('Notification')) {
      return UIFeature.NOTIFICATIONS;
    }
    
    if (stack.includes('PerformanceMonitor') || componentStack.includes('Performance')) {
      return UIFeature.PERFORMANCE_MONITORING;
    }
    
    if (stack.includes('Accessibility') || componentStack.includes('Keyboard') || componentStack.includes('ScreenReader')) {
      return UIFeature.ACCESSIBILITY;
    }
    
    return undefined;
  }

  /**
   * 安排自动恢复
   */
  private scheduleAutoRecovery(): void {
    this.recoveryTimer = setTimeout(() => {
      this.handleRetry();
    }, 5000); // 5秒后自动重试
  }

  /**
   * 处理重试
   */
  private handleRetry = (): void => {
    const { maxRetries = 3, onRecover } = this.props;
    const { affectedFeature, retryCount } = this.state;

    if (retryCount >= maxRetries) {
      this.setState({ canRecover: false });
      return;
    }

    try {
      // 尝试重新启用功能
      if (affectedFeature) {
        this.manager.enableFeature(affectedFeature);
      }

      // 重置错误状态（不为可选属性显式赋 undefined）
      this.setState({
        hasError: false,
        retryCount: retryCount + 1
      });

      onRecover?.(affectedFeature);
      
      console.log(`UI增强功能已恢复${affectedFeature ? ` (功能: ${affectedFeature})` : ''}`);
      
    } catch (error) {
      console.error('恢复UI增强功能失败:', error);
      this.setState({
        retryCount: retryCount + 1,
        canRecover: retryCount + 1 < maxRetries
      });
    }
  };

  /**
   * 处理禁用所有增强功能
   */
  private handleDisableEnhancements = (): void => {
    try {
      this.manager.disableAllFeatures();
      
      // 重置到基础模式（不为可选属性显式赋 undefined）
      this.setState({
        hasError: false
      });
      
      console.log('已切换到基础UI模式');
      
    } catch (error) {
      console.error('禁用UI增强功能失败:', error);
    }
  };

  /**
   * 获取用户友好的错误消息
   */
  private getFriendlyErrorMessage(): string {
    const { affectedFeature } = this.state;
    
    if (affectedFeature) {
      const featureNames: Record<UIFeature, string> = {
        [UIFeature.PERFORMANCE_MONITORING]: '性能监控',
        [UIFeature.ACCESSIBILITY]: '无障碍功能',
        [UIFeature.CUSTOM_LAYOUT]: '自定义布局',
        [UIFeature.BATCH_UPDATES]: '批量更新',
        [UIFeature.NOTIFICATIONS]: '通知系统',
        [UIFeature.ANIMATIONS]: '动画效果',
        [UIFeature.VIRTUALIZATION]: '虚拟化列表',
        [UIFeature.INTERACTIVE_COMPONENTS]: '交互组件',
        [UIFeature.TOOLTIPS]: '工具提示',
        [UIFeature.TRANSITIONS]: '过渡动画'
      };
      
      return `${featureNames[affectedFeature] || affectedFeature}功能出现问题，已自动切换到基础模式。应用的核心功能不受影响。`;
    }
    
    return 'UI增强功能出现问题，已自动切换到基础模式。应用的核心功能不受影响。';
  }

  override render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error, errorInfo, canRecover, retryCount } = this.state;

    if (hasError) {
      // 如果提供了自定义fallback，使用它
      if (fallback) {
        return fallback;
      }

      // 默认错误界面
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>UI增强功能暂时不可用</ErrorTitle>
          <ErrorMessage>
            {this.getFriendlyErrorMessage()}
          </ErrorMessage>
          
          <ErrorActions>
            {canRecover && (
              <ErrorButton variant="primary" onClick={this.handleRetry}>
                重试 {retryCount > 0 && `(${retryCount}/3)`}
              </ErrorButton>
            )}
            <ErrorButton onClick={this.handleDisableEnhancements}>
              使用基础模式
            </ErrorButton>
          </ErrorActions>

          {process.env['NODE_ENV'] === 'development' && error && (
            <ErrorDetails>
              <summary>错误详情 (开发模式)</summary>
              <ErrorStack>
                {error.toString()}
                {errorInfo?.componentStack}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return children;
  }
}

export default UIEnhancementErrorBoundary;