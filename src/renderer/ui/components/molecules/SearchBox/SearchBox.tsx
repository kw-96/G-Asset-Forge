/**
 * 搜索框分子组件 - 包含搜索图标和输入框的搜索组件
 * @description 组合Icon、Input等原子组件，提供完整的搜索功能
 * @author 开发团队
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Icon } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';

/**
 * 搜索框组件属性接口
 */
export interface SearchBoxProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 搜索值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 搜索提交回调 */
  onSearch?: (value: string) => void;
  /** 清空回调 */
  onClear?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 搜索框尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

const SearchContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return `height: 32px;`;
      case 'md':
        return `height: 40px;`;
      case 'lg':
        return `height: 48px;`;
      default:
        return `height: 40px;`;
    }
  }}
`;

const SearchInput = styled.input<{ $size: 'sm' | 'md' | 'lg'; $hasValue: boolean }>`
  width: 100%;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing.xl};
  padding-right: ${({ $hasValue, theme }) => $hasValue ? theme.spacing.xl : theme.spacing.md};
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme, $size }) => {
    switch ($size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'md':
        return theme.typography.fontSize.base;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  }};
  
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.sm};
  z-index: 1;
  pointer-events: none;
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing.xs};
  z-index: 1;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border.default};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * 搜索框组件
 * @param props 搜索框属性
 * @returns React搜索框组件
 * @example
 * <SearchBox
 *   placeholder="搜索素材..."
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   onSearch={handleSearch}
 * />
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = '搜索...',
  value = '',
  onChange,
  onSearch,
  onClear,
  disabled = false,
  loading = false,
  autoFocus = false,
  size = 'md',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  
  const currentValue = onChange ? value : internalValue;
  const hasValue = currentValue.length > 0;

  /**
   * 处理输入值变化
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [onChange]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(currentValue);
    }
  }, [currentValue, onSearch]);

  /**
   * 处理清空
   */
  const handleClear = useCallback(() => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);

  return (
    <SearchContainer $size={size}>
      <SearchIcon name="search" size="sm" color="secondary" />
      
      <SearchInput
        type="text"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        $size={size}
        $hasValue={hasValue}
      />
      
      {loading && <LoadingSpinner />}
      
      {hasValue && !loading && (
        <ClearButton
          variant="ghost"
          size="xs"
          icon={<Icon name="close" size="xs" />}
          onClick={handleClear}
          disabled={disabled}
        />
      )}
    </SearchContainer>
  );
};