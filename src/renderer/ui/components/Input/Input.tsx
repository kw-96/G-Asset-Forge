import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const getSizeStyles = (size: InputSize) => {
  switch (size) {
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

const getVariantStyles = (variant: InputVariant) => {
  switch (variant) {
    case 'filled':
      return css`
        background: ${({ theme }) => theme.colors.surface};
        border: 1px solid transparent;
        
        &:focus {
          background: ${({ theme }) => theme.colors.background};
          border-color: ${({ theme }) => theme.colors.border.focus};
        }
      `;
    
    case 'default':
    default:
      return css`
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        
        &:hover:not(:disabled) {
          border-color: ${({ theme }) => theme.colors.border.hover};
        }
        
        &:focus {
          border-color: ${({ theme }) => theme.colors.border.focus};
        }
      `;
  }
};

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  $size: InputSize;
  $variant: InputVariant;
  $error: boolean;
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
}>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  ${({ $size }) => getSizeStyles($size)}
  ${({ $variant }) => getVariantStyles($variant)}
  
  ${({ $hasLeftIcon, theme }) => $hasLeftIcon && css`
    padding-left: calc(${theme.spacing.lg} + 20px);
  `}
  
  ${({ $hasRightIcon, theme }) => $hasRightIcon && css`
    padding-right: calc(${theme.spacing.lg} + 20px);
  `}
  
  ${({ $error, theme }) => $error && css`
    border-color: ${theme.colors.error};
    
    &:focus {
      border-color: ${theme.colors.error};
      box-shadow: 0 0 0 3px ${theme.colors.error}20;
    }
  `}
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.border.focus}20, 
                ${({ theme }) => theme.shadows.sm};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.surface};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const IconWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
  
  ${({ $position, theme }) => $position === 'left' ? css`
    left: ${theme.spacing.md};
  ` : css`
    right: ${theme.spacing.md};
  `}
`;

const HelperText = styled.div<{ $error: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ $error, theme }) => $error ? theme.colors.error : theme.colors.text.secondary};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  variant = 'default',
  error = false,
  helperText,
  label,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}, ref) => {
  return (
    <InputContainer $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        {leftIcon && (
          <IconWrapper $position="left">
            {leftIcon}
          </IconWrapper>
        )}
        <StyledInput
          ref={ref}
          $size={size}
          $variant={variant}
          $error={error}
          $hasLeftIcon={!!leftIcon}
          $hasRightIcon={!!rightIcon}
          {...props}
        />
        {rightIcon && (
          <IconWrapper $position="right">
            {rightIcon}
          </IconWrapper>
        )}
      </InputWrapper>
      {helperText && (
        <HelperText $error={error}>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';