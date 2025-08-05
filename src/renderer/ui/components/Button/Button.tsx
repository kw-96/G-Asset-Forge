// Button组件 - 基于Figma设计语言
import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

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
        background: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.text.inverse};
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}dd;
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    
    case 'secondary':
      return css`
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.border.hover};
          border-color: ${({ theme }) => theme.colors.border.hover};
        }
      `;
    
    case 'outline':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}10;
        }
      `;
    
    case 'ghost':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.surface};
        }
      `;
    
    case 'danger':
      return css`
        background: ${({ theme }) => theme.colors.error};
        color: ${({ theme }) => theme.colors.text.inverse};
        border: 1px solid ${({ theme }) => theme.colors.error};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.error}dd;
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
        padding: 0 ${({ theme }) => theme.spacing.xs};
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
      `;
    
    case 'sm':
      return css`
        height: 32px;
        padding: 0 ${({ theme }) => theme.spacing.sm};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
      `;
    
    case 'md':
      return css`
        height: 40px;
        padding: 0 ${({ theme }) => theme.spacing.md};
        font-size: ${({ theme }) => theme.typography.fontSize.base};
      `;
    
    case 'lg':
      return css`
        height: 48px;
        padding: 0 ${({ theme }) => theme.spacing.lg};
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
      `;
    
    default:
      return css``;
  }
};

const StyledButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['whileTap', 'whileHover', 'initial', 'animate', 'exit', 'transition'].includes(prop)
})<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
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
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
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
    // @ts-expect-error styled-components v6 compatibility issue with framer-motion
    <StyledButton
      ref={ref}
      disabled={disabled || loading}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
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
