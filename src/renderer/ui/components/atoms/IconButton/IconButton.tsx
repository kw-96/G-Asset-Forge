/**
 * 图标按钮原子组件 - 仅包含图标的按钮组件
 * @description 提供多种样式变体和尺寸的图标按钮，支持加载状态
 * @author 开发团队
 */

import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 图标按钮样式变体类型
 */
export type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

/**
 * 图标按钮尺寸类型
 */
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * 图标按钮组件属性接口
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  /** 按钮样式变体 */
  variant?: IconButtonVariant;
  /** 按钮尺寸 */
  size?: IconButtonSize;
  /** 图标元素 */
  icon: React.ReactNode;
  /** 是否显示加载状态 */
  loading?: boolean;
}

/**
 * 获取图标按钮变体样式
 * @param variant 按钮变体
 * @returns 样式CSS
 */
const getVariantStyles = (variant: IconButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background: ${({ theme }) => theme.colors.primary};
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
      `;
    
    case 'ghost':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.text.secondary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.surface};
          color: ${({ theme }) => theme.colors.text.primary};
        }
      `;
    
    case 'danger':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.error};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.error}10;
        }
      `;
    
    case 'default':
    default:
      return css`
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.border.hover};
        }
      `;
  }
};

/**
 * 获取图标按钮尺寸样式
 * @param size 按钮尺寸
 * @returns 样式CSS
 */
const getSizeStyles = (size: IconButtonSize) => {
  switch (size) {
    case 'xs':
      return css`
        width: 24px;
        height: 24px;
        
        svg {
          width: 12px;
          height: 12px;
        }
      `;
    
    case 'sm':
      return css`
        width: 32px;
        height: 32px;
        
        svg {
          width: 16px;
          height: 16px;
        }
      `;
    
    case 'md':
      return css`
        width: 40px;
        height: 40px;
        
        svg {
          width: 20px;
          height: 20px;
        }
      `;
    
    case 'lg':
      return css`
        width: 48px;
        height: 48px;
        
        svg {
          width: 24px;
          height: 24px;
        }
      `;
    
    default:
      return css``;
  }
};

const StyledIconButton = styled.button<{
  $variant: IconButtonVariant;
  $size: IconButtonSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * 图标按钮组件
 * @param props 图标按钮属性
 * @returns React图标按钮组件
 * @example
 * <IconButton 
 *   variant="primary" 
 *   size="md" 
 *   icon={<CloseIcon />} 
 *   onClick={handleClose}
 * />
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  variant = 'default',
  size = 'md',
  icon,
  loading = false,
  disabled,
  ...props
}, ref) => {
  return (
    <StyledIconButton
      ref={ref}
      $variant={variant}
      $size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : icon}
    </StyledIconButton>
  );
});

IconButton.displayName = 'IconButton';