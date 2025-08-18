/**
 * 标签原子组件 - 表单标签组件
 * @description 提供表单字段的标签显示，支持必填标记和错误状态
 * @author 开发团队
 */

import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 标签组件属性接口
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 是否为必填字段 */
  required?: boolean;
  /** 是否为错误状态 */
  error?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 标签文本 */
  children: React.ReactNode;
}

const StyledLabel = styled.label<{
  $required: boolean;
  $error: boolean;
  $disabled: boolean;
}>`
  display: inline-block;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  
  ${({ $error, theme }) => $error && css`
    color: ${theme.colors.error};
  `}
  
  ${({ $disabled, theme }) => $disabled && css`
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  `}
  
  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error};
      font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    }
  `}
`;

/**
 * 标签组件
 * @param props 标签属性
 * @returns React标签组件
 * @example
 * <Label htmlFor="username" required>
 *   用户名
 * </Label>
 */
export const Label: React.FC<LabelProps> = ({
  required = false,
  error = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <StyledLabel
      $required={required}
      $error={error}
      $disabled={disabled}
      {...props}
    >
      {children}
    </StyledLabel>
  );
};