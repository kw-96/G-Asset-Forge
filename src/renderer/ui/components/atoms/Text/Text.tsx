/**
 * 文本原子组件 - 基础文本显示组件
 * @description 提供统一的文本样式和语义化的文本组件
 * @author 开发团队
 */

import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 文本变体类型
 */
export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';

/**
 * 文本颜色类型
 */
export type TextColor = 'primary' | 'secondary' | 'disabled' | 'error' | 'warning' | 'success';

/**
 * 文本对齐类型
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * 文本组件属性接口
 */
export interface TextProps {
  /** 文本变体 */
  variant?: TextVariant;
  /** 文本颜色 */
  color?: TextColor;
  /** 文本对齐方式 */
  align?: TextAlign;
  /** 是否加粗 */
  bold?: boolean;
  /** 是否斜体 */
  italic?: boolean;
  /** 是否下划线 */
  underline?: boolean;
  /** 是否删除线 */
  strikethrough?: boolean;
  /** 是否截断文本 */
  truncate?: boolean;
  /** 最大行数（用于多行截断） */
  maxLines?: number;
  /** HTML元素类型 */
  as?: keyof JSX.IntrinsicElements;
  /** 子元素 */
  children: React.ReactNode;
  /** 其他HTML属性 */
  [key: string]: any;
}

/**
 * 获取文本变体样式
 * @param variant 文本变体
 * @returns 样式CSS
 */
const getVariantStyles = (variant: TextVariant) => {
  switch (variant) {
    case 'h1':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        line-height: 1.2;
        margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
      `;
    case 'h2':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        line-height: 1.3;
        margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
      `;
    case 'h3':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        line-height: 1.4;
        margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
      `;
    case 'h4':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        line-height: 1.4;
        margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
      `;
    case 'h5':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
        line-height: 1.5;
        margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
      `;
    case 'h6':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
        line-height: 1.5;
        margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      `;
    case 'body1':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
        line-height: 1.6;
        margin: 0;
      `;
    case 'body2':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
        line-height: 1.5;
        margin: 0;
      `;
    case 'caption':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
        line-height: 1.4;
        margin: 0;
      `;
    case 'overline':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
        line-height: 1.4;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
      `;
    default:
      return css``;
  }
};

/**
 * 获取文本颜色样式
 * @param color 文本颜色
 * @returns 样式CSS
 */
const getColorStyles = (color: TextColor) => {
  switch (color) {
    case 'primary':
      return css`
        color: ${({ theme }) => theme.colors.text.primary};
      `;
    case 'secondary':
      return css`
        color: ${({ theme }) => theme.colors.text.secondary};
      `;
    case 'disabled':
      return css`
        color: ${({ theme }) => theme.colors.text.disabled};
      `;
    case 'error':
      return css`
        color: ${({ theme }) => theme.colors.error};
      `;
    case 'warning':
      return css`
        color: ${({ theme }) => theme.colors.warning};
      `;
    case 'success':
      return css`
        color: ${({ theme }) => theme.colors.success};
      `;
    default:
      return css``;
  }
};

const StyledText = styled.span<{
  $variant: TextVariant;
  $color: TextColor;
  $align: TextAlign;
  $bold: boolean;
  $italic: boolean;
  $underline: boolean;
  $strikethrough: boolean;
  $truncate: boolean;
  $maxLines: number;
}>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $color }) => getColorStyles($color)}
  
  text-align: ${({ $align }) => $align};
  
  ${({ $bold }) => $bold && css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  `}
  
  ${({ $italic }) => $italic && css`
    font-style: italic;
  `}
  
  ${({ $underline }) => $underline && css`
    text-decoration: underline;
  `}
  
  ${({ $strikethrough }) => $strikethrough && css`
    text-decoration: line-through;
  `}
  
  ${({ $truncate }) => $truncate && css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
  
  ${({ $maxLines }) => $maxLines && $maxLines > 1 && css`
    display: -webkit-box;
    -webkit-line-clamp: ${$maxLines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  `}
`;

/**
 * 文本组件
 * @param props 文本属性
 * @returns React文本组件
 * @example
 * <Text variant="h1" color="primary">
 *   这是一个标题
 * </Text>
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  maxLines,
  as = 'span',
  children,
  ...props
}) => {
  return (
    <StyledText
      as={as}
      $variant={variant}
      $color={color}
      $align={align}
      $bold={bold}
      $italic={italic}
      $underline={underline}
      $strikethrough={strikethrough}
      $truncate={truncate}
      $maxLines={maxLines ?? 1}
      {...props}
    >
      {children}
    </StyledText>
  );
};