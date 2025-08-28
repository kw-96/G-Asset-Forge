/**
 * 素材搜索栏组件
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { type IAssetSearchOptions } from './types';

interface IAssetSearchBarProps {
  onSearch: (options: Partial<IAssetSearchOptions>) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetSearchBar: React.FC<IAssetSearchBarProps> = ({
  onSearch,
  placeholder = '搜索素材...',
  className,
  style,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number>();

  // 防抖搜索
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = window.setTimeout(() => {
        onSearch({ query: searchQuery.trim() || undefined });
      }, 300);
    },
    [onSearch],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch({ query: query.trim() || undefined });
      } else if (e.key === 'Escape') {
        setQuery('');
        onSearch({ query: undefined });
        inputRef.current?.blur();
      }
    },
    [query, onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch({ query: undefined });
    inputRef.current?.focus();
  }, [onSearch]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        border: `2px solid ${isFocused ? '#007bff' : '#e9ecef'}`,
        borderRadius: '8px',
        padding: '8px 12px',
        transition: 'border-color 0.2s ease',
        ...style,
      }}
    >
      {/* 搜索图标 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginRight: '8px', color: '#6c757d' }}
      >
        <path
          d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: '14px',
          color: '#495057',
          backgroundColor: 'transparent',
        }}
      />

      {/* 清除按钮 */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            marginLeft: '8px',
            padding: '4px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
