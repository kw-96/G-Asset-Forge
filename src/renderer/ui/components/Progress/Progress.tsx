/**
 * Progress组件 - 基于Figma UI3设计系统
 * 用于显示任务进度和加载状态
 */

import React from 'react';
import styled, { css, keyframes } from 'styled-components';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value?: number; // 0-100
  variant?: ProgressVariant;
  size?: ProgressSize;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const getVariantColor = (variant: ProgressVariant) => {
  switch (variant) {
    case 'success':
      return css`${({ theme }) => theme.colors.success}`;
    case 'warning':
      return css`${({ theme }) => theme.colors.warning}`;
    case 'error':
      return css`${({ theme }) => theme.colors.error}`;
    case 'default':
    default:
      return css`${({ theme }) => theme.colors.primary}`;
  }
};

const getSizeStyles = (size: ProgressSize) => {
  switch (size) {
    case 'sm':
      return css`
        height: 4px;
      `;
    case 'md':
      return css`
        height: 6px;
      `;
    case 'lg':
      return css`
        height: 8px;
      `;
    default:
      return css``;
  }
};

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProgressValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressTrack = styled.div<{ $size: ProgressSize }>`
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default}40;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  
  ${({ $size }) => getSizeStyles($size)}
`;

const indeterminateAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const ProgressBar = styled.div<{
  $variant: ProgressVariant;
  $value: number;
  $indeterminate: boolean;
}>`
  height: 100%;
  background: linear-gradient(90deg, ${({ $variant }) => getVariantColor($variant)}, ${({ $variant }) => getVariantColor($variant)}dd);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: inherit;
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  ${({ $indeterminate, $value }) => 
    $indeterminate 
      ? css`
          width: 50%;
          animation: ${indeterminateAnimation} 1.5s ease-in-out infinite;
        `
      : css`
          width: ${$value}%;
        `
  }
`;

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  label,
  showValue = false,
  className,
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <ProgressContainer className={className}>
      {(label || showValue) && (
        <ProgressHeader>
          {label && <ProgressLabel>{label}</ProgressLabel>}
          {showValue && !indeterminate && (
            <ProgressValue>{Math.round(clampedValue)}%</ProgressValue>
          )}
        </ProgressHeader>
      )}
      <ProgressTrack $size={size}>
        <ProgressBar
          $variant={variant}
          $value={clampedValue}
          $indeterminate={indeterminate}
        />
      </ProgressTrack>
    </ProgressContainer>
  );
};