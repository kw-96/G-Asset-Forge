import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import styled, { css } from 'styled-components';
const getVariantStyles = (variant) => {
    switch (variant) {
        case 'primary':
            return css `
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.primary};
        box-shadow: ${({ theme }) => theme.shadows.sm};
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary} 0%, ${({ theme }) => theme.colors.primary} 100%);
          transform: translateY(-1px);
          box-shadow: ${({ theme }) => theme.shadows.md};
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: ${({ theme }) => theme.shadows.sm};
        }
      `;
        case 'secondary':
            return css `
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        box-shadow: ${({ theme }) => theme.shadows.sm};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.background};
          border-color: ${({ theme }) => theme.colors.border.hover};
          transform: translateY(-1px);
          box-shadow: ${({ theme }) => theme.shadows.md};
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
        case 'outline':
            return css `
        background: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}15;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}25;
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
        case 'ghost':
            return css `
        background: transparent;
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.surface};
          border-color: ${({ theme }) => theme.colors.border.default};
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
        case 'danger':
            return css `
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.error} 0%, #dc2626 100%);
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.error};
        box-shadow: ${({ theme }) => theme.shadows.sm};
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, ${({ theme }) => theme.colors.error} 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${({ theme }) => theme.colors.error}25;
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
        default:
            return css ``;
    }
};
const getSizeStyles = (size) => {
    switch (size) {
        case 'xs':
            return css `
        height: 28px;
        padding: 0 ${({ theme }) => theme.spacing.sm};
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
      `;
        case 'sm':
            return css `
        height: 32px;
        padding: 0 ${({ theme }) => theme.spacing.md};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
      `;
        case 'md':
            return css `
        height: 40px;
        padding: 0 ${({ theme }) => theme.spacing.lg};
        font-size: ${({ theme }) => theme.typography.fontSize.base};
      `;
        case 'lg':
            return css `
        height: 48px;
        padding: 0 ${({ theme }) => theme.spacing.xl};
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
      `;
        default:
            return css ``;
    }
};
const StyledButton = styled.button `
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
  
  ${({ $fullWidth }) => $fullWidth && css `
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
const LoadingSpinner = styled.div `
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
const IconWrapper = styled.span `
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ $position }) => $position === 'right' && css `
    order: 1;
  `}
`;
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', fullWidth = false, disabled, children, ...props }, ref) => {
    return (_jsxs(StyledButton, { ref: ref, disabled: disabled || loading, "$variant": variant, "$size": size, "$fullWidth": fullWidth, "$loading": loading, ...props, children: [loading && _jsx(LoadingSpinner, {}), icon && iconPosition === 'left' && _jsx(IconWrapper, { "$position": iconPosition, children: icon }), children, icon && iconPosition === 'right' && _jsx(IconWrapper, { "$position": iconPosition, children: icon })] }));
});
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map