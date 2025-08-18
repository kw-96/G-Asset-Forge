/**
 * 卡片分子组件 - 内容容器卡片组件
 * @description 提供多种样式变体和内边距的卡片容器，支持悬停和点击效果
 * @author 开发团队
 */

import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 卡片样式变体类型
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * 卡片内边距类型
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * 卡片组件属性接口
 */
export interface CardProps {
  /** 卡片样式变体 */
  variant?: CardVariant;
  /** 卡片内边距 */
  padding?: CardPadding;
  /** 是否支持悬停效果 */
  hoverable?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
  /** CSS类名 */
  className?: string;
  /** 点击事件处理器 */
  onClick?: () => void;
}

/**
 * 获取卡片变体样式
 * @param variant 卡片变体
 * @returns 样式CSS
 */
const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'outlined':
      return css`
        background: ${({ theme }) => theme.colors.surface};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
        box-shadow: none;
        backdrop-filter: blur(8px);
      `;
    
    case 'elevated':
      return css`
        background: ${({ theme }) => theme.colors.surface};
        border: 1px solid ${({ theme }) => theme.colors.border.default}40;
        box-shadow: ${({ theme }) => theme.shadows.lg};
        backdrop-filter: blur(12px);
      `;
    
    case 'default':
    default:
      return css`
        background: ${({ theme }) => theme.colors.surface};
        border: 1px solid ${({ theme }) => theme.colors.border.default}60;
        box-shadow: ${({ theme }) => theme.shadows.md};
        backdrop-filter: blur(4px);
      `;
  }
};

/**
 * 获取卡片内边距样式
 * @param padding 内边距大小
 * @returns 样式CSS
 */
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

const StyledCard = styled.div<{
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
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.lg};
      border-color: ${theme.colors.border.hover};
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

/**
 * 卡片组件
 * @param props 卡片属性
 * @returns React卡片组件
 * @example
 * <Card variant="elevated" hoverable>
 *   <CardHeader>
 *     <CardTitle>卡片标题</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     卡片内容
 *   </CardContent>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
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
    >
      {children}
    </StyledCard>
  );
};

/**
 * 卡片头部组件
 */
export const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * 卡片标题组件
 */
export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

/**
 * 卡片描述组件
 */
export const CardDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

/**
 * 卡片内容组件
 */
export const CardContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * 卡片底部组件
 */
export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  
  &:first-child {
    margin-top: 0;
  }
`;