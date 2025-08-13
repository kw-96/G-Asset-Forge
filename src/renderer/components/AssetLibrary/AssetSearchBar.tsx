// 素材搜索栏组件
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  type ISearchSuggestion 
} from '../../managers/assets/AssetSearchEngine';
import { type IAssetSearchOptions } from '../../managers/assets/AssetLibraryManager';

interface IAssetSearchBarProps {
  onSearch: (options: IAssetSearchOptions) => void;
  onSuggestionSelect?: (suggestion: ISearchSuggestion) => void;
  getSuggestions?: (query: string) => Promise<ISearchSuggestion[]>;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetSearchBar: React.FC<IAssetSearchBarProps> = ({
  onSearch,
  onSuggestionSelect,
  getSuggestions,
  placeholder = '搜索素材...',
  className,
  style
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ISearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedSuggestionIndex(-1);

    // 清除之前的搜索定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 如果查询为空，立即搜索
    if (!value.trim()) {
      onSearch({ query: '' });
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 延迟搜索以避免频繁请求
    searchTimeoutRef.current = setTimeout(() => {
      onSearch({ query: value.trim() });
      
      // 获取搜索建议
      if (getSuggestions && value.trim().length >= 2) {
        setIsLoading(true);
        getSuggestions(value.trim())
          .then(suggestions => {
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
            setIsLoading(false);
          })
          .catch(() => {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoading(false);
          });
      }
    }, 300);
  }, [onSearch, getSuggestions]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch({ query: query.trim() });
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const suggestion = suggestions[selectedSuggestionIndex];
          if (suggestion) handleSuggestionClick(suggestion);
        } else {
          onSearch({ query: query.trim() });
          setShowSuggestions(false);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, query, onSearch]);

  // 处理建议点击
  const handleSuggestionClick = useCallback((suggestion: ISearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    onSearch({ query: suggestion.text });
    onSuggestionSelect?.(suggestion);
  }, [onSearch, onSuggestionSelect]);

  // 处理输入框焦点
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 && query.trim().length >= 2) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, query]);

  // 处理输入框失焦
  const handleInputBlur = useCallback(() => {
    // 延迟隐藏建议，以便点击建议时能正常工作
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  }, []);

  // 清空搜索
  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch({ query: '' });
    inputRef.current?.focus();
  }, [onSearch]);

  // 获取建议类型图标
  const getSuggestionIcon = (type: ISearchSuggestion['type']): string => {
    switch (type) {
      case 'keyword': return '🔍';
      case 'tag': return '🏷️';
      case 'category': return '📁';
      case 'author': return '👤';
      default: return '🔍';
    }
  };

  // 获取建议类型名称
  const getSuggestionTypeName = (type: ISearchSuggestion['type']): string => {
    switch (type) {
      case 'keyword': return '关键词';
      case 'tag': return '标签';
      case 'category': return '分类';
      case 'author': return '作者';
      default: return '';
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* 搜索输入框 */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '0 12px',
          color: '#666',
          fontSize: '16px'
        }}>
          🔍
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '10px 8px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: 'transparent'
          }}
        />
        
        {/* 加载指示器 */}
        {isLoading && (
          <div style={{
            padding: '0 12px',
            color: '#666',
            fontSize: '12px'
          }}>
            ⏳
          </div>
        )}
        
        {/* 清空按钮 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '0 12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#999',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#999';
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 搜索建议下拉框 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.text}`}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: index === selectedSuggestionIndex ? '#f0f8ff' : 'white',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <span style={{ fontSize: '14px' }}>
                  {suggestion.text}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  color: '#999',
                  backgroundColor: '#f0f0f0',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {getSuggestionTypeName(suggestion.type)}
                </span>
              </div>
              
              <span style={{ 
                fontSize: '11px', 
                color: '#666',
                backgroundColor: '#e9ecef',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {suggestion.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetSearchBar;