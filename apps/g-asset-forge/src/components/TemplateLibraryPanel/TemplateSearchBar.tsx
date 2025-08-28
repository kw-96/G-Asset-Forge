/**
 * 模板搜索栏组件 - 复用现有的搜索和筛选UI组件
 */
import React, { useCallback, useState } from 'react';

import { type ITemplateSearchOptions } from './types';

interface ITemplateSearchBarProps {
  onSearch?: (options: Partial<ITemplateSearchOptions>) => void;
  placeholder?: string;
  className?: string;
}

export const TemplateSearchBar: React.FC<ITemplateSearchBarProps> = ({
  onSearch,
  placeholder = '搜索模板名称、标签...',
  className,
}) => {
  const [query, setQuery] = useState('');

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      onSearch?.({ query: newQuery });
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.({ query: '' });
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.({ query });
      }
    },
    [query, onSearch],
  );

  return (
    <div className={`template-search-bar ${className || ''}`}>
      <div className="search-input-wrapper">
        <div className="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#6c757d">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
          </svg>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            title="清除搜索"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#6c757d">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
