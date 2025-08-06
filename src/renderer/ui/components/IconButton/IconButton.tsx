// IconButton组件 - 基于Figma设计语言
import React from 'react';
import styled, { css } from 'styled-components';

export type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface IIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  loading?: boolean;
}

const getVariantStyles = (variant: IconButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background: #667eea;
        color: white;
        border: 1px solid #667eea;
        
        &:hover:not(:disabled) {
          background: #667eeadd;
        }
      `;
    
    case 'ghost':
      return css`
        background: transparent;
        color: #64748b;
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: #f8fafc;
          color: #1e293b;
        }
      `;
    
    case 'danger':
      return css`
        background: transparent;
        color: #ef4444;
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: #ef444410;
        }
      `;
    
    case 'default':
    default:
      return css`
        background: #f8fafc;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        
        &:hover:not(:disabled) {
          background: #cbd5e1;
          border-color: #cbd5e1;
        }
      `;
  }
};

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
  
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid #667eea;
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

export const IconButton = React.forwardRef<HTMLButtonElement, IIconButtonProps>(({
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
