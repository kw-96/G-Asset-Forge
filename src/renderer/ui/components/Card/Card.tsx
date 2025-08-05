// Card组件 - 基于Figma设计语言
import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface ICardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'outlined':
      return css`
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        box-shadow: none;
      `;
    
    case 'elevated':
      return css`
        background: ${({ theme }) => theme.colors.background};
        border: none;
        box-shadow: ${({ theme }) => theme.colors.shadow.large};
      `;
    
    case 'default':
    default:
      return css`
        background: ${({ theme }) => theme.colors.surface};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        box-shadow: ${({ theme }) => theme.colors.shadow.small};
      `;
  }
};

const getPaddingStyles = (padding: CardPadding) => {
  switch (padding) {
    case 'none':
      return css`
        padding: 0;
      `;
    
    case 'sm':
      return css`
        padding: ${({ theme }) => theme.spacing.sm};
      `;
    
    case 'md':
      return css`
        padding: ${({ theme }) => theme.spacing.md};
      `;
    
    case 'lg':
      return css`
        padding: ${({ theme }) => theme.spacing.lg};
      `;
    
    default:
      return css`
        padding: ${({ theme }) => theme.spacing.md};
      `;
  }
};

const StyledCard = styled(motion.div)<{
  $variant: CardVariant;
  $padding: CardPadding;
  $hoverable: boolean;
  $clickable: boolean;
}>`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $padding }) => getPaddingStyles($padding)}
  
  ${({ $hoverable, theme }) => $hoverable && css`
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.colors.shadow.large};
    }
  `}
  
  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
    user-select: none;
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

export const Card: React.FC<ICardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  children,
  className,
  onClick,
}) => {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $hoverable={hoverable}
      $clickable={clickable}
      className={className}
      onClick={onClick}
      whileTap={clickable ? { scale: 0.98 } : undefined}
    >
      {children}
    </StyledCard>
  );
};

// Card子组件
export const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

export const CardDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const CardContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  
  &:first-child {
    margin-top: 0;
  }
`;