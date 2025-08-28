/**
 * 模板筛选面板组件 - 基于现有的表单组件创建筛选界面
 */
import React, { useCallback } from 'react';

import {
  type ITemplateCategoryInfo,
  type ITemplateSearchOptions,
  type TemplateCategory,
} from './types';

interface ITemplateFilterPanelProps {
  categories: ITemplateCategoryInfo[];
  availableTags: string[];
  currentFilter: Partial<ITemplateSearchOptions>;
  onFilterChange?: (filter: Partial<ITemplateSearchOptions>) => void;
  onReset?: () => void;
  className?: string;
}

export const TemplateFilterPanel: React.FC<ITemplateFilterPanelProps> = ({
  categories,
  availableTags,
  currentFilter,
  onFilterChange,
  onReset,
  className,
}) => {
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const type = e.target.value as 'design' | 'h5' | '';
      onFilterChange?.({
        ...currentFilter,
        type: type || undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const category = e.target.value as TemplateCategory | '';
      onFilterChange?.({
        ...currentFilter,
        category: category || undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleTagsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions);
      const tags = selectedOptions.map((option) => option.value);
      onFilterChange?.({
        ...currentFilter,
        tags: tags.length > 0 ? tags : undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleLicenseChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = e.target;
      const currentLicenses = currentFilter.license || [];
      let newLicenses: string[];

      if (checked) {
        newLicenses = [...currentLicenses, value];
      } else {
        newLicenses = currentLicenses.filter((license) => license !== value);
      }

      onFilterChange?.({
        ...currentFilter,
        license: newLicenses.length > 0 ? newLicenses : undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleFavoriteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange?.({
        ...currentFilter,
        isFavorite: e.target.checked || undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange?.({
        ...currentFilter,
        isCustom: e.target.checked || undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleReset = useCallback(() => {
    onReset?.();
  }, [onReset]);

  return (
    <div className={`template-filter-panel ${className || ''}`}>
      <div className="filter-section">
        <h4 className="filter-title">筛选条件</h4>
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
          title="重置筛选条件"
        >
          重置
        </button>
      </div>

      <div className="filter-content">
        {/* 模板类型筛选 */}
        <div className="filter-group">
          <label className="filter-label">模板类型</label>
          <select
            title="模板类型"
            className="filter-select"
            value={currentFilter.type || ''}
            onChange={handleTypeChange}
          >
            <option value="">全部类型</option>
            <option value="design">设计模式</option>
            <option value="h5">H5长图</option>
          </select>
        </div>

        {/* 分类筛选 */}
        <div className="filter-group">
          <label className="filter-label">分类</label>
          <select
            title="分类"
            className="filter-select"
            value={currentFilter.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标签筛选 */}
        <div className="filter-group">
          <label className="filter-label">标签</label>
          <select
            title="标签"
            className="filter-select"
            multiple
            value={currentFilter.tags || []}
            onChange={handleTagsChange}
            size={4}
          >
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <small className="filter-hint">按住 Ctrl 多选</small>
        </div>

        {/* 许可证筛选 */}
        <div className="filter-group">
          <label className="filter-label">许可证</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                value="free"
                checked={currentFilter.license?.includes('free') || false}
                onChange={handleLicenseChange}
              />
              <span>免费</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                value="premium"
                checked={currentFilter.license?.includes('premium') || false}
                onChange={handleLicenseChange}
              />
              <span>付费</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                value="custom"
                checked={currentFilter.license?.includes('custom') || false}
                onChange={handleLicenseChange}
              />
              <span>自定义</span>
            </label>
          </div>
        </div>

        {/* 其他筛选 */}
        <div className="filter-group">
          <label className="filter-label">其他</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={currentFilter.isFavorite || false}
                onChange={handleFavoriteChange}
              />
              <span>仅收藏</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={currentFilter.isCustom || false}
                onChange={handleCustomChange}
              />
              <span>仅自定义</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
