/**
 * Flex组件 - 灵活的Flexbox布局组件
 * 提供简洁的API来处理常见的Flexbox布局需求
 */

import React from 'react';
import styled, { css } from 'styled-components';
import type { Theme } from '../../../../theme';

interface FlexProps {
  /** 主轴方向 */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** 主轴对齐 */
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** 交叉轴对齐 */
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  /** 换行 */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** 间距 */
  gap?: keyof Theme['spacing'];
  /** 内边距 */
  padding?: keyof Theme['spacing'];
  /** 外边距 */
  margin?: keyof Theme['spacing'];
  /** 是否填满容器 */
  fill?: boolean;
  /** 是否内联 */
  inline?: boolean;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}

interface FlexItemProps {
  /** flex-grow */
  grow?: number;
  /** flex-shrink */
  shrink?: number;
  /** flex-basis */
  basis?: string | number;
  /** 简写flex属性 */
  flex?: string | number;
  /** 单独的align-self */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

const StyledFlex = styled.div<{
  $direction?: string;
  $justify?: string;
  $align?: string;
  $wrap?: string;
  $gap?: keyof Theme['spacing'];
  $padding?: keyof Theme['spacing'];
  $margin?: keyof Theme['spacing'];
  $fill?: boolean;
  $inline?: boolean;
}>`
  display: ${({ $inline }) => $inline ? 'inline-flex' : 'flex'};
  
  ${({ $direction }) => $direction && css`
    flex-direction: ${$direction};
  `}
  
  ${({ $justify }) => $justify && css`
    justify-content: ${$justify};
  `}
  
  ${({ $align }) => $align && css`
    align-items: ${$align};
  `}
  
  ${({ $wrap }) => $wrap && css`
    flex-wrap: ${$wrap};
  `}
  
  ${({ $gap, theme }) => $gap && css`
    gap: ${theme.spacing[$gap]};
  `}
  
  ${({ $padding, theme }) => $padding && css`
    padding: ${theme.spacing[$padding]};
  `}
  
  ${({ $margin, theme }) => $margin && css`
    margin: ${theme.spacing[$margin]};
  `}
  
  ${({ $fill }) => $fill && css`
    width: 100%;
    height: 100%;
  `}
`;

const StyledFlexItem = styled.div<{
  $grow?: number;
  $shrink?: number;
  $basis?: string | number;
  $flex?: string | number;
  $alignSelf?: string;
}>`
  ${({ $grow }) => $grow !== undefined && css`
    flex-grow: ${$grow};
  `}
  
  ${({ $shrink }) => $shrink !== undefined && css`
    flex-shrink: ${$shrink};
  `}
  
  ${({ $basis }) => $basis !== undefined && css`
    flex-basis: ${typeof $basis === 'number' ? `${$basis}px` : $basis};
  `}
  
  ${({ $flex }) => $flex !== undefined && css`
    flex: ${$flex};
  `}
  
  ${({ $alignSelf }) => $alignSelf && css`
    align-self: ${$alignSelf};
  `}
`;

/**
 * Flex容器组件 - 提供灵活的Flexbox布局
 * 
 * @example
 * ```tsx
 * <Flex direction="column" justify="center" align="center" gap="md">
 *   <FlexItem flex={1}>
 *     <div>弹性内容</div>
 *   </FlexItem>
 *   <FlexItem>
 *     <div>固定内容</div>
 *   </FlexItem>
 * </Flex>
 * ```
 */
export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  justify,
  align,
  wrap = 'nowrap',
  gap,
  padding,
  margin,
  fill = false,
  inline = false,
  children,
  className,
  onClick,
}) => {
  const flexProps: any = {
    $direction: direction,
    $fill: fill,
    $inline: inline,
    className,
    onClick,
  };

  if (justify !== undefined) flexProps.$justify = justify;
  if (align !== undefined) flexProps.$align = align;
  if (wrap !== undefined) flexProps.$wrap = wrap;
  if (gap !== undefined) flexProps.$gap = gap;
  if (padding !== undefined) flexProps.$padding = padding;
  if (margin !== undefined) flexProps.$margin = margin;

  return (
    <StyledFlex {...flexProps}
    >
      {children}
    </StyledFlex>
  );
};

/**
 * Flex项组件 - Flexbox布局中的单个项目
 * 
 * @example
 * ```tsx
 * <FlexItem grow={1} shrink={0} basis="200px">
 *   <div>弹性项目</div>
 * </FlexItem>
 * ```
 */
export const FlexItem: React.FC<FlexItemProps> = ({
  grow,
  shrink,
  basis,
  flex,
  alignSelf,
  children,
  className,
}) => {
  const flexItemProps: any = {
    className,
  };

  if (grow !== undefined) flexItemProps.$grow = grow;
  if (shrink !== undefined) flexItemProps.$shrink = shrink;
  if (basis !== undefined) flexItemProps.$basis = basis;
  if (flex !== undefined) flexItemProps.$flex = flex;
  if (alignSelf !== undefined) flexItemProps.$alignSelf = alignSelf;

  return (
    <StyledFlexItem {...flexItemProps}>
      {children}
    </StyledFlexItem>
  );
};

// 便捷组件
export const VStack: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
  <Flex direction="column" {...props} />
);

export const HStack: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
  <Flex direction="row" {...props} />
);

export const Center: React.FC<Omit<FlexProps, 'justify' | 'align'>> = (props) => (
  <Flex justify="center" align="center" {...props} />
);

export const Spacer: React.FC = () => (
  <FlexItem flex={1}>{null}</FlexItem>
);

export type { FlexProps };
export type { FlexItemProps };
export { Flex as FigmaFlex };
export { FlexItem as FigmaFlexItem };
export { VStack as FigmaVStack };
export { HStack as FigmaHStack };
export { Center as FigmaCenter };
export { Spacer as FigmaSpacer };