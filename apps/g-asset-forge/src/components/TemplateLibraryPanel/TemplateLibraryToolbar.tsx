/**
 * 模板库工具栏组件 - 复用现有的按钮组件
 */
// import { Button } from '@g-asset-forge/components';
import React, { useCallback } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type ViewMode } from './types';

interface ITemplateLibraryToolbarProps {
  viewMode: ViewMode;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  onViewModeChange?: (mode: ViewMode) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onCreateTemplate?: () => void;
  onImportTemplate?: () => void;
  onFilterToggle?: () => void;
  showFilter?: boolean;
  className?: string;
}

export const TemplateLibraryToolbar: React.FC<ITemplateLibraryToolbarProps> = ({
  viewMode,
  sortBy,
  sortOrder,
  totalCount,
  onViewModeChange,
  onSortChange,
  onCreateTemplate,
  onImportTemplate,
  onFilterToggle,
  showFilter = false,
  className,
}) => {
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [newSortBy, newSortOrder] = e.target.value.split('-');
      onSortChange?.(newSortBy, newSortOrder as 'asc' | 'desc');
    },
    [onSortChange],
  );

  const handleCreateTemplate = useCallback(() => {
    onCreateTemplate?.();
  }, [onCreateTemplate]);

  const handleImportTemplate = useCallback(() => {
    onImportTemplate?.();
  }, [onImportTemplate]);

  const handleFilterToggle = useCallback(() => {
    onFilterToggle?.();
  }, [onFilterToggle]);

  return (
    <div className={`template-library-toolbar ${className || ''}`}>
      {/* 左侧：统计信息 */}
      <div className="toolbar-left">
        <span className="template-count">共 {totalCount} 个模板</span>
      </div>

      {/* 中间：视图模式切换 */}
      <div className="toolbar-center">
        <div className="view-mode-group">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('grid')}
            title="网格视图"
          >
            <SvgIcon name="icon.16.grid" size={16} />
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('list')}
            title="列表视图"
          >
            <SvgIcon name="icon.16.list" size={16} />
          </button>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="toolbar-right">
        {/* 排序选择 */}
        <select
          className="sort-select"
          value={`${sortBy}-${sortOrder}`}
          onChange={handleSortChange}
          title="排序方式"
        >
          <option value="createdAt-desc">创建时间 ↓</option>
          <option value="createdAt-asc">创建时间 ↑</option>
          <option value="updatedAt-desc">更新时间 ↓</option>
          <option value="updatedAt-asc">更新时间 ↑</option>
          <option value="name-asc">名称 A-Z</option>
          <option value="name-desc">名称 Z-A</option>
          <option value="usageCount-desc">使用次数 ↓</option>
          <option value="usageCount-asc">使用次数 ↑</option>
          <option value="rating-desc">评分 ↓</option>
          <option value="rating-asc">评分 ↑</option>
        </select>

        {/* 筛选按钮 */}
        <button
          type="button"
          className={`filter-toggle-btn ${showFilter ? 'active' : ''}`}
          onClick={handleFilterToggle}
          title="筛选条件"
        >
          <SvgIcon name="icon.16.filter" size={16} />
          筛选
        </button>

        {/* 导入模板按钮 */}
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleImportTemplate}
        >
          <SvgIcon name="icon.16.import" size={16} />
          导入
        </button>

        {/* 创建模板按钮 */}
        <button
          type="button"
          className="toolbar-btn primary"
          onClick={handleCreateTemplate}
        >
          <SvgIcon name="icon.16.plus" size={16} />
          创建模板
        </button>
      </div>
    </div>
  );
};
