/**
 * Badge组件 - 基于Figma UI3设计系统
 * 用于显示状态、标签和计数
 */

import React from 'react';
import styled, { css } from 'styled-components';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const getVariantStyles = (variant: BadgeVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${({ theme }) => theme.colors.primary};
        color: white;
      `;
    case 'success':
      return css`
        background-color: ${({ theme }) => theme.colors.success};
        color: white;
      `;
    case 'warning':
      return css`
        background-color: ${({ theme }) => theme.colors.warning};
        color: white;
      `;
    case 'error':
      return css`
        background-color: ${({ theme }) => theme.colors.error};
        color: white;
      `;
    case 'info':
      return css`
        background-color: ${({ theme }) => theme.colors.info};
        color: white;
      `;
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
      `;
  }
};

const getSizeStyles = (size: BadgeSize, dot: boolean) => {
  if (dot) {
    switch (size) {
      case 'sm':
        return css`
          width: 6px;
          height: 6px;
        `;
      case 'md':
        return css`
          width: 8px;
          height: 8px;
        `;
      case 'lg':
        return css`
          width: 10px;
          height: 10px;
        `;
      default:
        return css``;
    }
  } else {
    switch (size) {
      case 'sm':
        return css`
          padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
          font-size: ${({ theme }) => theme.typography.fontSize.xs};
        `;
      case 'md':
        return css`
          padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
          font-size: ${({ theme }) => theme.typography.fontSize.sm};
        `;
      case 'lg':
        return css`
          padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
          font-size: ${({ theme }) => theme.typography.fontSize.base};
        `;
      default:
        return css``;
    }
  }
};

const StyledBadge = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
  $dot: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size, $dot }) => getSizeStyles($size, $dot)}
  
  ${({ $dot }) => $dot && css`
    border-radius: 50%;
    padding: 0;
  `}
`;

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  size = 'md',
  dot = false,
  children,
  className,
}) => {
  return (
    <StyledBadge
      $variant={variant}
      $size={size}
      $dot={dot}
      className={className}
    >
      {!dot && children}
    </StyledBadge>
  );
};