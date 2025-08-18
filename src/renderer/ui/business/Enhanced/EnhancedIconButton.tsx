/**
 * 增强版IconButton组件
 * 集成Figma风格交互、工具提示和无障碍支持
 */

import React, { forwardRef, useMemo } from 'react';
import { IconButton, type IconButtonVariant, type IconButtonSize } from '../../components/atoms/IconButton/IconButton';
import { FigmaInteractive } from '../../components/organisms/Figma/FigmaInteractive';
import { Tooltip as FigmaTooltip } from '../../components/atoms/Tooltip/Tooltip';
import { useUIIntegration } from '../UIIntegration/UIIntegrationProvider';
import { UIFeature } from '../UIIntegration/UIIntegrationProvider';

// 增强IconButton属性接口
export interface EnhancedIconButtonProps {
  // 继承原有IconButton属性
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
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
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // 增强功能属性
  enableFigmaInteractions?: boolean;
  enableTooltip?: boolean;
  tooltipContent?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  performanceOptimized?: boolean;
  interactionVariant?: 'button' | 'tool' | 'icon-button';
  enableHapticFeedback?: boolean;
  trackInteraction?: boolean;
  enableKeyboardShortcut?: boolean;
  keyboardShortcut?: string;
  shortcutDescription?: string;
}

/**
 * 增强版IconButton组件
 */
export const EnhancedIconButton = forwardRef<HTMLButtonElement, EnhancedIconButtonProps>(({
  // 原有属性
  variant,
  size,
  disabled = false,
  loading = false,
  icon,
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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  
  // 增强功能属性
  enableFigmaInteractions = true,
  enableTooltip = true, // IconButton默认启用工具提示
  tooltipContent,
  tooltipPlacement = 'bottom',
  performanceOptimized = true,
  interactionVariant = 'tool',
  enableHapticFeedback = false,
  trackInteraction = true,
  enableKeyboardShortcut = false,
  keyboardShortcut,
  shortcutDescription,
  
  ...rest
}, ref) => {
  const { isFeatureEnabled, manager } = useUIIntegration();
  
  // 检查功能是否启用
  const interactionsEnabled = useMemo(() => 
    enableFigmaInteractions && isFeatureEnabled(UIFeature.INTERACTIVE_COMPONENTS),
    [enableFigmaInteractions, isFeatureEnabled]
  );
  
  const tooltipsEnabled = useMemo(() => 
    enableTooltip && isFeatureEnabled(UIFeature.TOOLTIPS),
    [enableTooltip, isFeatureEnabled]
  );

  const accessibilityEnabled = useMemo(() => 
    isFeatureEnabled(UIFeature.ACCESSIBILITY),
    [isFeatureEnabled]
  );

  // 生成工具提示内容
  const finalTooltipContent = useMemo(() => {
    if (!tooltipContent && !ariaLabel) return undefined;
    
    let content = tooltipContent || ariaLabel || '';
    
    // 如果启用了键盘快捷键，添加到工具提示中
    if (enableKeyboardShortcut && keyboardShortcut && accessibilityEnabled) {
      content += ` (${keyboardShortcut})`;
    }
    
    return content;
  }, [tooltipContent, ariaLabel, enableKeyboardShortcut, keyboardShortcut, accessibilityEnabled]);

  // 性能优化的点击处理
  const handleClick = useMemo(() => {
    if (!onClick) return undefined;
    
    return performanceOptimized 
      ? (event: React.MouseEvent<HTMLButtonElement>) => {
          // 性能监控
          if (trackInteraction && isFeatureEnabled(UIFeature.PERFORMANCE_MONITORING)) {
            const endMeasurement = manager.measureInteractionDelay?.('icon-button-click') || (() => {});
            
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
            navigator.vibrate(5); // 更短的振动，适合图标按钮
          }
        }
      : onClick;
  }, [onClick, performanceOptimized, trackInteraction, isFeatureEnabled, manager, enableHapticFeedback]);

  // 键盘事件处理
  const handleKeyDown = useMemo(() => {
    if (!enableKeyboardShortcut || !keyboardShortcut || !accessibilityEnabled) {
      return undefined;
    }
    
    return (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // 检查是否匹配快捷键
      const keys = keyboardShortcut.toLowerCase().split('+');
      const eventKey = event.key.toLowerCase();
      
      let matches = true;
      
      if (keys.includes('ctrl') && !event.ctrlKey) matches = false;
      if (keys.includes('alt') && !event.altKey) matches = false;
      if (keys.includes('shift') && !event.shiftKey) matches = false;
      if (keys.includes('meta') && !event.metaKey) matches = false;
      
      const mainKey = keys.find(key => !['ctrl', 'alt', 'shift', 'meta'].includes(key));
      if (mainKey && mainKey !== eventKey) matches = false;
      
      if (matches && !disabled && onClick) {
        event.preventDefault();
        event.stopPropagation();
        onClick(event as any);
      }
    };
  }, [enableKeyboardShortcut, keyboardShortcut, accessibilityEnabled, disabled, onClick]);

  // 增强的无障碍属性
  const accessibilityProps = useMemo(() => {
    if (!accessibilityEnabled) return {};
    
    return {
      'aria-label': ariaLabel || tooltipContent,
      'aria-describedby': ariaDescribedBy,
      'aria-keyshortcuts': enableKeyboardShortcut ? keyboardShortcut : undefined,
      'title': shortcutDescription || finalTooltipContent
    };
  }, [
    accessibilityEnabled, 
    ariaLabel, 
    tooltipContent, 
    ariaDescribedBy, 
    enableKeyboardShortcut, 
    keyboardShortcut, 
    shortcutDescription, 
    finalTooltipContent
  ]);

  // 基础IconButton组件
  const baseButtonProps: any = {
    ref,
    disabled,
    loading,
    icon,
    onClick: handleClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    className,
    style,
    type,
    'data-testid': testId,
    ...accessibilityProps,
    ...rest,
  };
  if (variant !== undefined) baseButtonProps.variant = variant;
  if (size !== undefined) baseButtonProps.size = size;

  const baseButton = (
    <IconButton {...baseButtonProps}>
      {children}
    </IconButton>
  );

  // 如果启用了Figma交互，包装FigmaInteractive
  const resolvedVariant = interactionVariant && (interactionVariant as any) === 'icon' ? 'icon-button' : interactionVariant;
  const interactiveButton = interactionsEnabled ? (
    <FigmaInteractive 
      variant={resolvedVariant as 'button' | 'tool' | 'icon-button'}
      disabled={disabled}
    >
      {baseButton}
    </FigmaInteractive>
  ) : baseButton;

  // 如果启用了工具提示，包装FigmaTooltip
  const tooltipButton = tooltipsEnabled && finalTooltipContent ? (
    <FigmaTooltip
      content={finalTooltipContent}
      side={tooltipPlacement}
      disabled={disabled}
    >
      {interactiveButton}
    </FigmaTooltip>
  ) : interactiveButton;

  return tooltipButton;
});

EnhancedIconButton.displayName = 'EnhancedIconButton';

export default EnhancedIconButton;