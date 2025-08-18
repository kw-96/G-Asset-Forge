/**
 * 容器组件 - 响应式布局容器
 * 提供统一的内容宽度限制和间距管理
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { mixins } from '../../../../theme/mixins';
import type { Theme } from '../../../../theme';

interface ContainerProps {
  /** 最大宽度 */
  maxWidth?: keyof Theme['responsive']['containers'];
  /** 是否流体布局 */
  fluid?: boolean;
  /** 内边距 */
  padding?: keyof Theme['spacing'];
  /** 是否居中 */
  centered?: boolean;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

const StyledContainer = styled.div<{
  $maxWidth?: keyof Theme['responsive']['containers'];
  $fluid?: boolean;
  $padding?: keyof Theme['spacing'];
  $centered?: boolean;
}>`
  width: 100%;
  
  ${({ $maxWidth, $fluid, theme }) => !$fluid && css`
    max-width: ${$maxWidth ? theme.responsive.containers[$maxWidth] : theme.responsive.containers.xl};
  `}
  
  ${({ $centered }) => $centered && css`
    margin: 0 auto;
  `}
  
  ${({ $padding, theme }) => $padding && css`
    padding: 0 ${theme.spacing[$padding]};
  `}
  
  /* 响应式内边距 */
  padding: 0 ${({ theme }) => theme.spacing.md};
  
  ${mixins.responsive.below('sm')(css`
    padding: 0 ${({ theme }: { theme: Theme }) => theme.spacing.sm};
  `)}
  
  ${mixins.responsive.above('lg')(css`
    padding: 0 ${({ theme }: { theme: Theme }) => theme.spacing.lg};
  `)}
`;

/**
 * 容器组件 - 提供响应式布局容器
 * 
 * @example
 * ```tsx
 * <Container maxWidth="lg" centered>
 *   <div>内容</div>
 * </Container>
 * ```
 */
export const Container: React.FC<ContainerProps> = ({
  maxWidth,
  fluid = false,
  padding,
  centered = true,
  children,
  className,
}) => {
  const containerProps: any = {
    $fluid: fluid,
    $centered: centered,
    className,
  };

  if (maxWidth !== undefined) containerProps.$maxWidth = maxWidth;
  if (padding !== undefined) containerProps.$padding = padding;

  return (
    <StyledContainer {...containerProps}>
      {children}
    </StyledContainer>
  );
};

export type { ContainerProps };
export { Container as FigmaContainer };