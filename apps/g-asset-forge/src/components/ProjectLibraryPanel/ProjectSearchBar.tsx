/**
 * 项目搜索栏组件 - 复用现有的搜索和筛选UI组件
 */
import React from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type IProjectSearchOptions, type ProjectCategory } from './types';

interface IProjectSearchBarProps {
  searchOptions: IProjectSearchOptions;
  onSearchChange: (options: Partial<IProjectSearchOptions>) => void;
  className?: string;
}

export const ProjectSearchBar: React.FC<IProjectSearchBarProps> = ({
  searchOptions,
  onSearchChange,
  className,
}) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange({ query: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category =
      e.target.value === 'all'
        ? undefined
        : (e.target.value as ProjectCategory);
    onSearchChange({ category });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type =
      e.target.value === 'all'
        ? undefined
        : (e.target.value as 'design' | 'h5');
    onSearchChange({ type });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [
      IProjectSearchOptions['sortBy'],
      IProjectSearchOptions['sortOrder'],
    ];
    onSearchChange({ sortBy, sortOrder });
  };

  const handleFavoriteToggle = () => {
    onSearchChange({ isFavorite: !searchOptions.isFavorite });
  };

  const handleClearFilters = () => {
    onSearchChange({
      query: '',
      category: undefined,
      type: undefined,
      isFavorite: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    searchOptions.query ||
    searchOptions.category ||
    searchOptions.type ||
    searchOptions.isFavorite;

  return (
    <div className={`project-search-bar ${className || ''}`}>
      {/* 搜索输入框 */}
      <div className="search-input-wrapper">
        <SvgIcon name="icon.24.search" size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="搜索项目名称、描述或标签..."
          value={searchOptions.query || ''}
          onChange={handleQueryChange}
        />
        {searchOptions.query && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange({ query: '' })}
          >
            <SvgIcon name="icon.24.close" size={14} />
          </button>
        )}
      </div>

      {/* 筛选器 */}
      <div className="search-filters">
        {/* 分类筛选 */}
        <select
          className="filter-select"
          value={searchOptions.category || 'all'}
          onChange={handleCategoryChange}
          title="按分类筛选"
        >
          <option value="all">全部分类</option>
          <option value="h5">H5</option>
          <option value="design">设计</option>
          <option value="demo">示例</option>
          <option value="other">其他</option>
        </select>

        {/* 类型筛选 */}
        <select
          className="filter-select"
          value={searchOptions.type || 'all'}
          onChange={handleTypeChange}
          title="按类型筛选"
        >
          <option value="all">全部类型</option>
          <option value="design">设计模式</option>
          <option value="h5">H5长图</option>
        </select>

        {/* 排序 */}
        <select
          className="filter-select"
          value={`${searchOptions.sortBy || 'updatedAt'}-${
            searchOptions.sortOrder || 'desc'
          }`}
          onChange={handleSortChange}
          title="排序方式"
        >
          <option value="updatedAt-desc">最近更新</option>
          <option value="createdAt-desc">最近创建</option>
          <option value="lastOpenedAt-desc">最近打开</option>
          <option value="name-asc">名称 A-Z</option>
          <option value="name-desc">名称 Z-A</option>
          <option value="usageCount-desc">使用次数</option>
        </select>

        {/* 收藏筛选 */}
        <button
          type="button"
          className={`favorite-filter-btn ${
            searchOptions.isFavorite ? 'active' : ''
          }`}
          onClick={handleFavoriteToggle}
          title="只显示收藏的项目"
        >
          <SvgIcon name="icon.24.heart" size={16} />
          {searchOptions.isFavorite && (
            <span className="filter-label">收藏</span>
          )}
        </button>

        {/* 清除筛选 */}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
            title="清除所有筛选条件"
          >
            <SvgIcon name="icon.24.refresh" size={16} />
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
};
