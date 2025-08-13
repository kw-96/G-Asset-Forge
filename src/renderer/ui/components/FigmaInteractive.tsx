import React, { useState, useCallback } from 'react';
import { motion, MotionProps } from 'framer-motion';
import styled, { css } from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格微交互变体类型
export type FigmaInteractiveVariant =
  | 'button'
  | 'card'
  | 'panel'
  | 'tool'
  | 'tab'
  | 'list-item'
  | 'icon-button'
  | 'menu-item';

export interface FigmaInteractiveProps extends Omit<MotionProps, 'variants'> {
  variant: FigmaInteractiveVariant;
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onHover?: (isHovering: boolean) => void;
  className?: string;
  // 微交互配置
  hoverScale?: number;
  tapScale?: number;
  hoverElevation?: boolean;
  rippleEffect?: boolean;
  focusRing?: boolean;
}

// 获取变体样式
const getVariantStyles = (variant: FigmaInteractiveVariant, theme: any) => {
  const styles = {
    button: css`
      padding: 8px 16px;
      border-radius: ${theme.borderRadius.md};
      background: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border.default};
      color: ${theme.colors.text.primary};
      font-weight: ${theme.typography.fontWeight.medium};
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
        border-color: ${theme.colors.border.hover};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.interaction?.active || 'rgba(0, 0, 0, 0.08)'};
      }
    `,

    card: css`
      padding: 16px;
      border-radius: ${theme.borderRadius.lg};
      background: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border.default};
      cursor: pointer;
      
      &:hover:not(:disabled) {
        border-color: ${theme.colors.border.hover};
        box-shadow: ${theme.shadows.soft};
      }
    `,

    panel: css`
      background: ${theme.colors.interface?.panel?.light || theme.colors.surface};
      border: 1px solid ${theme.colors.interface?.divider?.light || theme.colors.border.default};
      border-radius: ${theme.borderRadius.md};
      
      ${theme.colors.interface && `
        background: ${theme.actualMode === 'dark'
        ? theme.colors.interface.panel.dark
        : theme.colors.interface.panel.light};
        border-color: ${theme.actualMode === 'dark'
        ? theme.colors.interface.divider.dark
        : theme.colors.interface.divider.light};
      `}
    `,

    tool: css`
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${theme.borderRadius.md};
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      color: ${theme.colors.text.primary};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
        border-color: ${theme.colors.border.default};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.interaction?.active || 'rgba(0, 0, 0, 0.08)'};
      }
      
      &.selected {
        background: ${theme.colors.primary};
        color: white;
        border-color: ${theme.colors.primary};
      }
    `,

    tab: css`
      padding: 8px 16px;
      border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
      background: transparent;
      border: 1px solid transparent;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      color: ${theme.colors.text.secondary};
      font-weight: ${theme.typography.fontWeight.medium};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
        color: ${theme.colors.text.primary};
      }
      
      &.selected {
        background: ${theme.colors.surface};
        color: ${theme.colors.primary};
        border-color: ${theme.colors.border.default};
        border-bottom-color: ${theme.colors.primary};
      }
    `,

    'list-item': css`
      padding: 8px 12px;
      border-radius: ${theme.borderRadius.base};
      background: transparent;
      cursor: pointer;
      color: ${theme.colors.text.primary};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.interaction?.active || 'rgba(0, 0, 0, 0.08)'};
      }
      
      &.selected {
        background: ${theme.colors.primary}15;
        color: ${theme.colors.primary};
      }
    `,

    'icon-button': css`
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${theme.borderRadius.base};
      background: transparent;
      border: none;
      cursor: pointer;
      color: ${theme.colors.text.secondary};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
        color: ${theme.colors.text.primary};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.interaction?.active || 'rgba(0, 0, 0, 0.08)'};
      }
    `,

    'menu-item': css`
      padding: 6px 12px;
      border-radius: ${theme.borderRadius.base};
      background: transparent;
      cursor: pointer;
      color: ${theme.colors.text.primary};
      font-size: ${theme.typography.fontSize.sm};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.interaction?.active || 'rgba(0, 0, 0, 0.08)'};
      }
    `,
  };

  return styles[variant];
};

// 交互状态样式
const getInteractiveStateStyles = (
  disabled: boolean,
  selected: boolean,
  active: boolean,
  loading: boolean
) => css`
  ${disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  ${selected && css`
    &.selected {
      /* 选中状态样式已在变体中定义 */
    }
  `}
  
  ${active && css`
    transform: scale(0.98);
  `}
  
  ${loading && css`
    cursor: wait;
    opacity: 0.7;
  `}
`;

// 焦点环样式
const getFocusRingStyles = (focusRing: boolean, theme: any) => {
  if (!focusRing) return css``;

  return css`
    &:focus-visible {
      outline: 2px solid ${theme.colors.interaction?.focus || theme.colors.primary};
      outline-offset: 2px;
    }
  `;
};

// 波纹效果容器
const RippleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
`;

const RippleEffect = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  pointer-events: none;
`;

// 主要的交互式组件
const InteractiveElement = styled(motion.div) <{
  $variant: FigmaInteractiveVariant;
  $disabled: boolean;
  $selected: boolean;
  $active: boolean;
  $loading: boolean;
  $focusRing: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  outline: none;
  transition: all ${({ theme }) => theme.animation.duration.microInteraction} 
              ${({ theme }) => theme.animation.easing.smooth};
  
  ${({ $variant, theme }) => getVariantStyles($variant, theme)}
  ${({ $disabled, $selected, $active, $loading }) =>
    getInteractiveStateStyles($disabled, $selected, $active, $loading)}
  ${({ $focusRing, theme }) => getFocusRingStyles($focusRing, theme)}
`;

export const FigmaInteractive: React.FC<FigmaInteractiveProps> = ({
  variant,
  children,
  disabled = false,
  selected = false,
  active = false,
  loading = false,
  onClick,
  onDoubleClick,
  onHover,
  className,
  hoverScale = 1.02,
  tapScale = 0.98,
  hoverElevation = false,
  rippleEffect = false,
  focusRing = true,
  ...motionProps
}) => {
  const { reducedMotion } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovering(true);
    onHover?.(true);
  }, [disabled, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setIsHovering(false);
    onHover?.(false);
  }, [disabled, onHover]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled || loading) return;

    // 波纹效果
    if (rippleEffect) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rippleId = Date.now();

      setRipples(prev => [...prev, { id: rippleId, x, y }]);

      // 清理波纹
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
      }, 600);
    }

    onClick?.();
  }, [disabled, loading, rippleEffect, onClick]);

  // 动画变体
  const animationVariants = {
    initial: { scale: 1 },
    hover: {
      scale: reducedMotion ? 1 : hoverScale,
      y: hoverElevation && !reducedMotion ? -1 : 0,
    },
    tap: {
      scale: reducedMotion ? 1 : tapScale,
    },
  };

  return (
    <InteractiveElement
      className={`${className || ''} ${selected ? 'selected' : ''}`}
      $variant={variant}
      $disabled={disabled}
      $selected={selected}
      $active={active}
      $loading={loading}
      $focusRing={focusRing}
      variants={animationVariants}
      initial="initial"
      animate={isHovering ? "hover" : "initial"}
      whileTap={disabled || loading ? {} : "tap"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      aria-pressed={selected}
      {...motionProps}
    >
      {children}

      {/* 波纹效果 */}
      {rippleEffect && (
        <RippleContainer>
          {ripples.map(ripple => (
            <RippleEffect
              key={ripple.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
            />
          ))}
        </RippleContainer>
      )}
    </InteractiveElement>
  );
};

// 预设的Figma风格交互组件
export const FigmaButton: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="button" />
);

export const FigmaCard: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="card" hoverElevation />
);

export const FigmaPanel: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="panel" />
);

export const FigmaTool: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="tool" />
);

export const FigmaTab: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="tab" />
);

export const FigmaListItem: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="list-item" />
);

export const FigmaIconButton: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="icon-button" />
);

export const FigmaMenuItem: React.FC<Omit<FigmaInteractiveProps, 'variant'>> = (props) => (
  <FigmaInteractive {...props} variant="menu-item" />
);

// 高级交互组件：支持长按
export interface FigmaLongPressProps extends FigmaInteractiveProps {
  onLongPress?: () => void;
  longPressDuration?: number;
}

export const FigmaLongPress: React.FC<FigmaLongPressProps> = ({
  onLongPress,
  longPressDuration = 500,
  ...props
}) => {
  // const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  // const handleMouseDown = useCallback(() => {
  //   if (onLongPress) {
  //     const timer = setTimeout(() => {
  //       onLongPress();
  //     }, longPressDuration);
  //     setPressTimer(timer);
  //   }
  // }, [onLongPress, longPressDuration]);

  // const handleMouseUp = useCallback(() => {
  //   if (pressTimer) {
  //     clearTimeout(pressTimer);
  //     setPressTimer(null);
  //   }
  // }, [pressTimer]);

  // const handleMouseLeave = useCallback(() => {
  //   if (pressTimer) {
  //     clearTimeout(pressTimer);
  //     setPressTimer(null);
  //   }
  // }, [pressTimer]);

  return (
    <FigmaInteractive
      {...props}
    />
  );
};

// 交互状态Hook
export const useFigmaInteraction = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const interactionProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return {
    isHovering,
    isPressed,
    isFocused,
    interactionProps,
  };
};