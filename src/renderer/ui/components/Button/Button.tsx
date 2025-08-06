// Button组件 - 基于Figma设计语言
import React from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface IButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background: #667eea;
        color: white;
        border: 1px solid #667eea;
        
        &:hover:not(:disabled) {
          background: #667eeadd;
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;

    case 'secondary':
      return css`
        background: #f8fafc;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        
        &:hover:not(:disabled) {
          background: #cbd5e1;
          border-color: #cbd5e1;
        }
      `;

    case 'outline':
      return css`
        background: transparent;
        color: #667eea;
        border: 1px solid #667eea;
        
        &:hover:not(:disabled) {
          background: #667eea10;
        }
      `;

    case 'ghost':
      return css`
        background: transparent;
        color: #1e293b;
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: #f8fafc;
        }
      `;

    case 'danger':
      return css`
        background: #ef4444;
        color: white;
        border: 1px solid #ef4444;
        
        &:hover:not(:disabled) {
          background: #ef4444dd;
        }
      `;

    default:
      return css``;
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'xs':
      return css`
        height: 28px;
        padding: 0 8px;
        font-size: 12px;
      `;

    case 'sm':
      return css`
        height: 32px;
        padding: 0 12px;
        font-size: 14px;
      `;

    case 'md':
      return css`
        height: 40px;
        padding: 0 16px;
        font-size: 16px;
      `;

    case 'lg':
      return css`
        height: 48px;
        padding: 0 24px;
        font-size: 18px;
      `;

    default:
      return css``;
  }
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 500;
  line-height: 1;
  
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
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

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ $position }) => $position === 'right' && css`
    order: 1;
  `}
`;

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      disabled={disabled || loading}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {icon && iconPosition === 'left' && <IconWrapper $position={iconPosition}>{icon}</IconWrapper>}
      {children}
      {icon && iconPosition === 'right' && <IconWrapper $position={iconPosition}>{icon}</IconWrapper>}
    </StyledButton>
  );
});

Button.displayName = 'Button';
