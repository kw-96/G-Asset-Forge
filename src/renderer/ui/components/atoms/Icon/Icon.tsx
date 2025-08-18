/**
 * 图标原子组件 - 基础图标显示组件
 * @description 提供统一的图标显示和样式管理，支持多种尺寸和颜色
 * @author 开发团队
 */

import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 图标尺寸类型
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * 图标颜色类型
 */
export type IconColor = 'primary' | 'secondary' | 'disabled' | 'error' | 'warning' | 'success' | 'inherit';

/**
 * 图标组件属性接口
 */
export interface IconProps {
  /** 图标名称或SVG内容 */
  name?: string;
  /** 图标尺寸 */
  size?: IconSize;
  /** 图标颜色 */
  color?: IconColor;
  /** 自定义尺寸（像素） */
  customSize?: number;
  /** 自定义颜色 */
  customColor?: string;
  /** 是否可点击 */
  clickable?: boolean;
  /** 点击事件处理器 */
  onClick?: () => void;
  /** 子元素（SVG内容） */
  children?: React.ReactNode;
  /** 其他HTML属性 */
  [key: string]: any;
}

/**
 * 获取图标尺寸样式
 * @param size 图标尺寸
 * @param customSize 自定义尺寸
 * @returns 样式CSS
 */
const getSizeStyles = (size: IconSize, customSize?: number) => {
  if (customSize) {
    return css`
      width: ${customSize}px;
      height: ${customSize}px;
    `;
  }

  switch (size) {
    case 'xs':
      return css`
        width: 12px;
        height: 12px;
      `;
    case 'sm':
      return css`
        width: 16px;
        height: 16px;
      `;
    case 'md':
      return css`
        width: 20px;
        height: 20px;
      `;
    case 'lg':
      return css`
        width: 24px;
        height: 24px;
      `;
    case 'xl':
      return css`
        width: 32px;
        height: 32px;
      `;
    case '2xl':
      return css`
        width: 48px;
        height: 48px;
      `;
    default:
      return css`
        width: 20px;
        height: 20px;
      `;
  }
};

/**
 * 获取图标颜色样式
 * @param color 图标颜色
 * @param customColor 自定义颜色
 * @returns 样式CSS
 */
const getColorStyles = (color: IconColor, customColor?: string) => {
  if (customColor) {
    return css`
      color: ${customColor};
      fill: ${customColor};
    `;
  }

  switch (color) {
    case 'primary':
      return css`
        color: ${({ theme }) => theme.colors.text.primary};
        fill: ${({ theme }) => theme.colors.text.primary};
      `;
    case 'secondary':
      return css`
        color: ${({ theme }) => theme.colors.text.secondary};
        fill: ${({ theme }) => theme.colors.text.secondary};
      `;
    case 'disabled':
      return css`
        color: ${({ theme }) => theme.colors.text.disabled};
        fill: ${({ theme }) => theme.colors.text.disabled};
      `;
    case 'error':
      return css`
        color: ${({ theme }) => theme.colors.error};
        fill: ${({ theme }) => theme.colors.error};
      `;
    case 'warning':
      return css`
        color: ${({ theme }) => theme.colors.warning};
        fill: ${({ theme }) => theme.colors.warning};
      `;
    case 'success':
      return css`
        color: ${({ theme }) => theme.colors.success};
        fill: ${({ theme }) => theme.colors.success};
      `;
    case 'inherit':
      return css`
        color: inherit;
        fill: inherit;
      `;
    default:
      return css``;
  }
};

const StyledIcon = styled.span<{
  $size: IconSize;
  $color: IconColor;
  $customSize: number;
  $customColor: string;
  $clickable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${({ $size, $customSize }) => getSizeStyles($size, $customSize)}
  ${({ $color, $customColor }) => getColorStyles($color, $customColor)}
  
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.surface};
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  `}
`;

/**
 * 常用图标SVG映射
 */
const iconMap: Record<string, React.ReactNode> = {
  // 基础图标
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  ),
  chevronUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18,15 12,9 6,15"></polyline>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 01-8 0 4 4 0 018 0zM7 16a4 4 0 01-8 0 4 4 0 018 0z"></path>
    </svg>
  ),
};

/**
 * 图标组件
 * @param props 图标属性
 * @returns React图标组件
 * @example
 * <Icon name="check" size="md" color="success" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'primary',
  customSize,
  customColor,
  clickable = false,
  onClick,
  children,
  ...props
}) => {
  const iconContent = children || (name && iconMap[name]);

  return (
    <StyledIcon
      $size={size}
      $color={color}
      $customSize={customSize || 0}
      $customColor={customColor || ''}
      $clickable={clickable}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {iconContent}
    </StyledIcon>
  );
};