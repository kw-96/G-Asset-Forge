/**
 * 增强版Button组件
 * 集成Figma风格交互、工具提示和性能优化
 */

import React, { forwardRef, useMemo } from 'react';
import { Button, type ButtonVariant, type ButtonSize } from '../../components/atoms/Button/Button';
import { FigmaInteractive } from '../../components/organisms/Figma/FigmaInteractive';
import { Tooltip as FigmaTooltip } from '../../components/atoms/Tooltip/Tooltip';
import { useUIIntegration } from '../UIIntegration/UIIntegrationProvider';
import { UIFeature } from '../UIIntegration/UIIntegrationProvider';

// 增强Button属性接口
export interface EnhancedButtonProps {
  // 继承原有Button属性
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
  
  // 增强功能属性
  enableFigmaInteractions?: boolean;
  enableTooltip?: boolean;
  tooltipContent?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  performanceOptimized?: boolean;
  interactionVariant?: 'button' | 'card' | 'tool';
  enableHapticFeedback?: boolean;
  trackInteraction?: boolean;
}

/**
 * 增强版Button组件
 */
export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(({
  // 原有属性
  variant,
  size,
  disabled = false,
  loading = false,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className,
  style,
  type = 'button',
  'data-testid': testId,
  
  // 增强功能属性
  enableFigmaInteractions = true,
  enableTooltip = false,
  tooltipContent,
  tooltipPlacement = 'top',
  performanceOptimized = true,
  interactionVariant = 'button',
  enableHapticFeedback = false,
  trackInteraction = true,
  
  ...rest
}, ref) => {
  const { isFeatureEnabled, manager } = useUIIntegration();
  
  // 检查功能是否启用
  const interactionsEnabled = useMemo(() => 
    enableFigmaInteractions && isFeatureEnabled(UIFeature.INTERACTIVE_COMPONENTS),
    [enableFigmaInteractions, isFeatureEnabled]
  );
  
  const tooltipsEnabled = useMemo(() => 
    enableTooltip && tooltipContent && isFeatureEnabled(UIFeature.TOOLTIPS),
    [enableTooltip, tooltipContent, isFeatureEnabled]
  );

  // 性能优化的点击处理
  const handleClick = useMemo(() => {
    if (!onClick) return undefined;
    
    return performanceOptimized 
      ? (event: React.MouseEvent<HTMLButtonElement>) => {
          // 性能监控
          if (trackInteraction && isFeatureEnabled(UIFeature.PERFORMANCE_MONITORING)) {
            const endMeasurement = manager.measureInteractionDelay?.('button-click') || (() => {});
            
            // 执行点击处理
            onClick(event);
            
            // 结束性能测量
            requestAnimationFrame(() => {
              endMeasurement();
            });
          } else {
            onClick(event);
          }
          
          // 触觉反馈（如果支持）
          if (enableHapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      : onClick;
  }, [onClick, performanceOptimized, trackInteraction, isFeatureEnabled, manager, enableHapticFeedback]);

  // 基础Button组件
  const baseButtonProps: any = {
    ref,
    disabled,
    loading,
    onClick: handleClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    className,
    style,
    type,
    'data-testid': testId,
    ...rest,
  };

  if (variant !== undefined) baseButtonProps.variant = variant;
  if (size !== undefined) baseButtonProps.size = size;

  const baseButton = (
    <Button {...baseButtonProps}>
      {children}
    </Button>
  );

  // 如果启用了Figma交互，包装FigmaInteractive
  const interactiveButton = interactionsEnabled ? (
    <FigmaInteractive 
      variant={interactionVariant}
      disabled={disabled}
    >
      {baseButton}
    </FigmaInteractive>
  ) : baseButton;

  // 如果启用了工具提示，包装FigmaTooltip
  const tooltipButton = tooltipsEnabled ? (
    <FigmaTooltip
      content={tooltipContent!}
      side={tooltipPlacement}
      disabled={disabled}
    >
      {interactiveButton}
    </FigmaTooltip>
  ) : interactiveButton;

  return tooltipButton;
});

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;