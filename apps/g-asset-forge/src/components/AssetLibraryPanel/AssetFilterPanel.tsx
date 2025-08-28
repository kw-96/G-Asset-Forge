/**
 * 素材筛选面板组件
 */
import React, { useCallback } from 'react';

import {
  type AssetCategory,
  type IAssetCategoryInfo,
  type IAssetSearchOptions,
} from './types';

interface IAssetFilterPanelProps {
  categories: IAssetCategoryInfo[];
  availableTags: string[];
  currentFilter: Partial<IAssetSearchOptions>;
  onFilterChange: (filter: Partial<IAssetSearchOptions>) => void;
  onReset: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetFilterPanel: React.FC<IAssetFilterPanelProps> = ({
  categories,
  availableTags,
  currentFilter,
  onFilterChange,
  onReset,
  className,
  style,
}) => {
  const handleCategoryChange = useCallback(
    (category: AssetCategory | undefined) => {
      onFilterChange({ ...currentFilter, category });
    },
    [currentFilter, onFilterChange],
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const currentTags = currentFilter.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      onFilterChange({
        ...currentFilter,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleLicenseChange = useCallback(
    (license: string) => {
      const currentLicenses = currentFilter.license || [];
      const newLicenses = currentLicenses.includes(license)
        ? currentLicenses.filter((l) => l !== license)
        : [...currentLicenses, license];

      onFilterChange({
        ...currentFilter,
        license: newLicenses.length > 0 ? newLicenses : undefined,
      });
    },
    [currentFilter, onFilterChange],
  );

  const handleFavoriteToggle = useCallback(() => {
    onFilterChange({
      ...currentFilter,
      isFavorite: currentFilter.isFavorite ? undefined : true,
    });
  }, [currentFilter, onFilterChange]);

  const handleCustomToggle = useCallback(() => {
    onFilterChange({
      ...currentFilter,
      isCustom: currentFilter.isCustom ? undefined : true,
    });
  }, [currentFilter, onFilterChange]);

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
          }}
        >
          筛选条件
        </h4>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: '4px 8px',
            border: '1px solid #dc3545',
            backgroundColor: 'transparent',
            color: '#dc3545',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          重置
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 分类筛选 */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6c757d',
              marginBottom: '8px',
            }}
          >
            分类
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleCategoryChange(undefined)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${
                  !currentFilter.category ? '#007bff' : '#e9ecef'
                }`,
                backgroundColor: !currentFilter.category
                  ? '#007bff'
                  : '#f8f9fa',
                color: !currentFilter.category ? 'white' : '#495057',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${
                    currentFilter.category === category.id
                      ? '#007bff'
                      : '#e9ecef'
                  }`,
                  backgroundColor:
                    currentFilter.category === category.id
                      ? '#007bff'
                      : '#f8f9fa',
                  color:
                    currentFilter.category === category.id
                      ? 'white'
                      : '#495057',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 标签筛选 */}
        {availableTags.length > 0 && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#6c757d',
                marginBottom: '8px',
              }}
            >
              标签
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {availableTags.slice(0, 20).map((tag) => {
                const isSelected = currentFilter.tags?.includes(tag) || false;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    style={{
                      padding: '4px 8px',
                      border: `1px solid ${isSelected ? '#28a745' : '#e9ecef'}`,
                      backgroundColor: isSelected ? '#28a745' : '#f8f9fa',
                      color: isSelected ? 'white' : '#495057',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 许可证筛选 */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6c757d',
              marginBottom: '8px',
            }}
          >
            许可证
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['free', 'premium', 'custom'].map((license) => {
              const isSelected =
                currentFilter.license?.includes(license) || false;
              const licenseNames = {
                free: '免费',
                premium: '付费',
                custom: '自定义',
              };
              return (
                <button
                  key={license}
                  type="button"
                  onClick={() => handleLicenseChange(license)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${isSelected ? '#ffc107' : '#e9ecef'}`,
                    backgroundColor: isSelected ? '#ffc107' : '#f8f9fa',
                    color: isSelected ? '#212529' : '#495057',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {licenseNames[license as keyof typeof licenseNames]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 特殊筛选 */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6c757d',
              marginBottom: '8px',
            }}
          >
            特殊筛选
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleFavoriteToggle}
              style={{
                padding: '6px 12px',
                border: `1px solid ${
                  currentFilter.isFavorite ? '#dc3545' : '#e9ecef'
                }`,
                backgroundColor: currentFilter.isFavorite
                  ? '#dc3545'
                  : '#f8f9fa',
                color: currentFilter.isFavorite ? 'white' : '#495057',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              ❤️ 仅收藏
            </button>
            <button
              type="button"
              onClick={handleCustomToggle}
              style={{
                padding: '6px 12px',
                border: `1px solid ${
                  currentFilter.isCustom ? '#6f42c1' : '#e9ecef'
                }`,
                backgroundColor: currentFilter.isCustom ? '#6f42c1' : '#f8f9fa',
                color: currentFilter.isCustom ? 'white' : '#495057',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              📁 自定义
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
