/**
 * 表单字段分子组件 - 包含标签、输入框和错误信息的完整表单字段
 * @description 组合Label、Input等原子组件，提供完整的表单字段功能
 * @author 开发团队
 */

import React from 'react';
import styled from 'styled-components';
import { Label } from '../../atoms/Label/Label';
import { Text } from '../../atoms/Text/Text';

/**
 * 表单字段组件属性接口
 */
export interface FormFieldProps {
  /** 字段标签 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 字段ID */
  id?: string;
  /** 子元素（通常是输入组件） */
  children: React.ReactNode;
}

const FormFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
`;

const HelpText = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

/**
 * 表单字段组件
 * @param props 表单字段属性
 * @returns React表单字段组件
 * @example
 * <FormField label="用户名" required error="用户名不能为空">
 *   <Input placeholder="请输入用户名" />
 * </FormField>
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  id,
  children,
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormFieldContainer>
      {label && (
        <Label
          htmlFor={fieldId}
          required={required}
          error={!!error}
          disabled={disabled}
        >
          {label}
        </Label>
      )}
      
      <InputContainer>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          disabled,
          error: !!error,
        })}
      </InputContainer>
      
      {error && (
        <ErrorText variant="caption" color="error">
          {error}
        </ErrorText>
      )}
      
      {helpText && !error && (
        <HelpText variant="caption" color="secondary">
          {helpText}
        </HelpText>
      )}
    </FormFieldContainer>
  );
};