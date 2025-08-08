/**
 * Switch组件 - 基于Radix UI和Figma UI3设计系统
 * 提供可访问的开关切换功能
 */

import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import styled from 'styled-components';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

const SwitchContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SwitchContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const SwitchLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const SwitchDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`;

const SwitchRoot = styled(SwitchPrimitive.Root)<{ $checked: boolean }>`
  width: 44px;
  height: 24px;
  background: ${({ theme, $checked }) => 
    $checked ? theme.colors.primary : theme.colors.surface};
  border: 1px solid ${({ theme, $checked }) => 
    $checked ? theme.colors.primary : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  position: relative;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not([data-disabled]) {
    background: ${({ theme, $checked }) => 
      $checked ? theme.colors.primary : theme.colors.border.hover};
  }
`;

const SwitchThumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: 18px;
  height: 18px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  transform: translateX(2px);
  will-change: transform;
  
  &[data-state='checked'] {
    transform: translateX(22px);
  }
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px; /* 对齐文本基线 */
`;

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}) => {
  return (
    <SwitchContainer className={className}>
      <SwitchWrapper>
        <SwitchRoot
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          $checked={checked}
        >
          <SwitchThumb />
        </SwitchRoot>
      </SwitchWrapper>
      
      {(label || description) && (
        <SwitchContent>
          {label && (
            <SwitchLabel data-disabled={disabled ? '' : undefined}>
              {label}
            </SwitchLabel>
          )}
          {description && (
            <SwitchDescription data-disabled={disabled ? '' : undefined}>
              {description}
            </SwitchDescription>
          )}
        </SwitchContent>
      )}
    </SwitchContainer>
  );
};