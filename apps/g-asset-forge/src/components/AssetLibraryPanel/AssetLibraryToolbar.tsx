/**
 * 素材库工具栏组件
 */
import React, { useCallback } from 'react';

import { type IAssetSearchOptions, type ViewMode } from './types';

interface IAssetLibraryToolbarProps {
  viewMode: ViewMode;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  isUploading?: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'usageCount',
    sortOrder: 'asc' | 'desc',
  ) => void;
  onUploadClick: () => void;
  onFilterToggle: () => void;
  showFilter: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetLibraryToolbar: React.FC<IAssetLibraryToolbarProps> = ({
  viewMode,
  sortBy,
  sortOrder,
  totalCount,
  isUploading = false,
  onViewModeChange,
  onSortChange,
  onUploadClick,
  onFilterToggle,
  showFilter,
  className,
  style,
}) => {
  const handleSortByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSortChange(
        e.target.value as 'name' | 'createdAt' | 'updatedAt' | 'usageCount',
        sortOrder,
      );
    },
    [sortOrder, onSortChange],
  );

  const handleSortOrderToggle = useCallback(() => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  }, [sortBy, sortOrder, onSortChange]);

  const sortOptions = [
    { value: 'createdAt', label: '创建时间' },
    { value: 'name', label: '名称' },
    { value: 'usageCount', label: '使用次数' },
    { value: 'rating', label: '评分' },
    { value: 'fileSize', label: '文件大小' },
  ];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        ...style,
      }}
    >
      {/* 左侧：统计信息和筛选按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontSize: '14px',
            color: '#6c757d',
            fontWeight: '500',
          }}
        >
          共 {totalCount} 个素材
        </span>

        <button
          type="button"
          onClick={onFilterToggle}
          style={{
            padding: '6px 12px',
            border: `1px solid ${showFilter ? '#007bff' : '#e9ecef'}`,
            backgroundColor: showFilter ? '#007bff' : '#f8f9fa',
            color: showFilter ? 'white' : '#495057',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
          </svg>
          筛选
        </button>
      </div>

      {/* 右侧：视图模式、排序和上传按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 排序控件 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}
          >
            排序:
          </span>
          <select
            title="排序"
            value={sortBy}
            onChange={handleSortByChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
              fontSize: '12px',
              color: '#495057',
              cursor: 'pointer',
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSortOrderToggle}
            style={{
              padding: '4px 6px',
              border: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={sortOrder === 'asc' ? '升序' : '降序'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* 视图模式切换 */}
        <div
          style={{
            display: 'flex',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            style={{
              padding: '6px 10px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#007bff' : '#f8f9fa',
              color: viewMode === 'grid' ? 'white' : '#495057',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
            </svg>
            网格
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            style={{
              padding: '6px 10px',
              border: 'none',
              backgroundColor: viewMode === 'list' ? '#007bff' : '#f8f9fa',
              color: viewMode === 'list' ? 'white' : '#495057',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            列表
          </button>
        </div>

        {/* 上传按钮 */}
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          style={{
            padding: '8px 16px',
            border: '1px solid #28a745',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '6px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
          {isUploading ? '上传中...' : '上传素材'}
        </button>
      </div>
    </div>
  );
};
