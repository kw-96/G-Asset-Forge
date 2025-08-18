// 素材过滤器面板组件
import React, { useState, useCallback } from 'react';
import { 
  type AssetCategory,
  type IAssetCategoryInfo 
} from './AssetBatchManager';
import { type AdvancedFilter } from '../../../logic/managers/assets/AssetSearchEngine';

interface IAssetFilterPanelProps {
  categories: IAssetCategoryInfo[];
  availableTags: string[];
  availableAuthors: string[];
  currentFilter: AdvancedFilter;
  onFilterChange: (filter: AdvancedFilter) => void;
  onReset: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetFilterPanel: React.FC<IAssetFilterPanelProps> = ({
  categories,
  availableTags,
  availableAuthors,
  currentFilter,
  onFilterChange,
  onReset,
  className,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('category');

  // 处理分类过滤
  const handleCategoryChange = useCallback((category: AssetCategory | '') => {
    const newFilter = { ...currentFilter };
    if (category) {
      newFilter.category = category;
    } else {
      delete newFilter.category;
    }
    onFilterChange(newFilter);
  }, [currentFilter, onFilterChange]);

  // 处理子分类过滤
  const handleSubcategoryChange = useCallback((subcategory: string) => {
    const newFilter = { ...currentFilter };
    if (subcategory) {
      newFilter.subcategory = subcategory;
    } else {
      delete newFilter.subcategory;
    }
    onFilterChange(newFilter);
  }, [currentFilter, onFilterChange]);

  // 处理标签过滤
  const handleTagToggle = useCallback((tag: string) => {
    const currentTags = currentFilter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    const newFilter = { ...currentFilter };
    if (newTags.length > 0) {
      newFilter.tags = newTags;
    } else {
      delete newFilter.tags;
    }
    onFilterChange(newFilter);
  }, [currentFilter, onFilterChange]);

  // 处理许可证过滤
  const handleLicenseToggle = useCallback((license: 'free' | 'premium' | 'custom') => {
    const currentLicenses = currentFilter.license as string[] || [];
    const newLicenses = currentLicenses.includes(license)
      ? currentLicenses.filter(l => l !== license)
      : [...currentLicenses, license];
    
    const newFilter = { ...currentFilter };
    if (newLicenses.length > 0) {
      (newFilter.license as string[] | undefined) = newLicenses;
    } else {
      (newFilter.license as string[] | undefined) = undefined;
    }
    onFilterChange(newFilter);
  }, [currentFilter, onFilterChange]);

  // 处理尺寸过滤
  const handleSizeChange = useCallback((field: 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFilterChange({
      ...currentFilter,
      [field]: numValue
    });
  }, [currentFilter, onFilterChange]);

  // 处理文件大小过滤
  const handleFileSizeChange = useCallback((field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) * 1024 : undefined; // 转换为字节
    const fileSizeRange = currentFilter.fileSizeRange || {};
    
    onFilterChange({
      ...currentFilter,
      fileSizeRange: {
        ...fileSizeRange,
        [field]: numValue
      }
    });
  }, [currentFilter, onFilterChange]);

  // 处理评分过滤
  const handleRatingChange = useCallback((field: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    const ratingRange = currentFilter.ratingRange || {};
    
    onFilterChange({
      ...currentFilter,
      ratingRange: {
        ...ratingRange,
        [field]: numValue
      }
    });
  }, [currentFilter, onFilterChange]);

  // 获取当前选中的分类信息
  const selectedCategory = categories.find(c => c.id === currentFilter.category);

  // 计算活跃过滤器数量
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (currentFilter.category) count++;
    if (currentFilter.subcategory) count++;
    if (currentFilter.tags && currentFilter.tags.length > 0) count++;
    if (currentFilter.license && currentFilter.license.length > 0) count++;
    if (currentFilter.fileType && currentFilter.fileType.length > 0) count++;
    if (currentFilter.isFavorite !== undefined) count++;
    if (currentFilter.isCustom !== undefined) count++;
    if (currentFilter.minWidth || currentFilter.maxWidth || currentFilter.minHeight || currentFilter.maxHeight) count++;
    if (currentFilter.fileSizeRange?.min || currentFilter.fileSizeRange?.max) count++;
    if (currentFilter.ratingRange?.min || currentFilter.ratingRange?.max) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={className} style={{ ...style }}>
      {/* 过滤器头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
            过滤器
          </h4>
          {activeFilterCount > 0 && (
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px'
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              style={{
                padding: '4px 8px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 快速过滤器（始终显示） */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const newFilter = { ...currentFilter };
              if (currentFilter.isFavorite) {
                (newFilter.isFavorite as boolean | undefined) = undefined;
              } else {
                newFilter.isFavorite = true;
              }
              onFilterChange(newFilter);
            }}
            style={{
              padding: '4px 8px',
              border: `1px solid ${currentFilter.isFavorite ? '#dc3545' : '#ddd'}`,
              backgroundColor: currentFilter.isFavorite ? '#dc3545' : 'white',
              color: currentFilter.isFavorite ? 'white' : '#666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            ❤️ 收藏
          </button>
          
          <button
            onClick={() => {
              const newFilter = { ...currentFilter };
              if (currentFilter.isCustom) {
                (newFilter.isCustom as boolean | undefined) = undefined;
              } else {
                newFilter.isCustom = true;
              }
              onFilterChange(newFilter);
            }}
            style={{
              padding: '4px 8px',
              border: `1px solid ${currentFilter.isCustom ? '#28a745' : '#ddd'}`,
              backgroundColor: currentFilter.isCustom ? '#28a745' : 'white',
              color: currentFilter.isCustom ? 'white' : '#666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            📁 自定义
          </button>
          
          {['free', 'premium', 'custom'].map(license => (
            <button
              key={license}
              onClick={() => handleLicenseToggle(license as 'free' | 'premium' | 'custom')}
              style={{
                padding: '4px 8px',
                border: `1px solid ${(currentFilter.license as string[] || []).includes(license) ? '#17a2b8' : '#ddd'}`,
                backgroundColor: (currentFilter.license as string[] || []).includes(license) ? '#17a2b8' : 'white',
                color: (currentFilter.license as string[] || []).includes(license) ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {license === 'free' ? '🆓 免费' : 
               license === 'premium' ? '💎 付费' : '🔧 自定义'}
            </button>
          ))}
        </div>
      </div>

      {/* 详细过滤器（可展开） */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* 过滤器导航 */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '16px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {[
              { key: 'category', label: '分类' },
              { key: 'tags', label: '标签' },
              { key: 'size', label: '尺寸' },
              { key: 'advanced', label: '高级' }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeSection === section.key ? '#007bff' : '#666',
                  borderBottom: activeSection === section.key ? '2px solid #007bff' : 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activeSection === section.key ? 'bold' : 'normal'
                }}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* 分类过滤 */}
          {activeSection === 'category' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  主分类
                </label>
                <select
                  value={currentFilter.category || ''}
                  onChange={(e) => handleCategoryChange(e.target.value as AssetCategory | '')}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="">所有分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.id} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    子分类
                  </label>
                  <select
                    value={currentFilter.subcategory || ''}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">所有子分类</option>
                    {selectedCategory.subcategories.map((sub: IAssetCategoryInfo) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 标签过滤 */}
          {activeSection === 'tags' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                标签选择
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {availableTags.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', padding: '20px' }}>
                    暂无可用标签
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        style={{
                          padding: '4px 8px',
                          border: `1px solid ${currentFilter.tags?.includes(tag) ? '#007bff' : '#ddd'}`,
                          backgroundColor: currentFilter.tags?.includes(tag) ? '#007bff' : 'white',
                          color: currentFilter.tags?.includes(tag) ? 'white' : '#666',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 尺寸过滤 */}
          {activeSection === 'size' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  宽度范围 (像素)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="最小"
                    value={currentFilter.minWidth || ''}
                    onChange={(e) => handleSizeChange('minWidth', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={currentFilter.maxWidth || ''}
                    onChange={(e) => handleSizeChange('maxWidth', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  高度范围 (像素)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="最小"
                    value={currentFilter.minHeight || ''}
                    onChange={(e) => handleSizeChange('minHeight', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={currentFilter.maxHeight || ''}
                    onChange={(e) => handleSizeChange('maxHeight', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* 常用尺寸预设 */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  常用尺寸
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {[
                    { label: '图标', width: 64, height: 64 },
                    { label: '按钮', width: 200, height: 60 },
                    { label: '横幅', width: 800, height: 200 },
                    { label: 'HD', width: 1920, height: 1080 },
                    { label: '正方形', width: 512, height: 512 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        onFilterChange({
                          ...currentFilter,
                          minWidth: preset.width.toString(),
                          maxWidth: preset.width.toString(),
                          minHeight: preset.height.toString(),
                          maxHeight: preset.height.toString()
                        });
                      }}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 高级过滤 */}
          {activeSection === 'advanced' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  文件大小 (KB)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="最小"
                    value={currentFilter.fileSizeRange?.min ? Math.round(currentFilter.fileSizeRange.min / 1024) : ''}
                    onChange={(e) => handleFileSizeChange('min', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={currentFilter.fileSizeRange?.max ? Math.round(currentFilter.fileSizeRange.max / 1024) : ''}
                    onChange={(e) => handleFileSizeChange('max', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  评分范围
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="最低"
                    value={currentFilter.ratingRange?.min || ''}
                    onChange={(e) => handleRatingChange('min', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="最高"
                    value={currentFilter.ratingRange?.max || ''}
                    onChange={(e) => handleRatingChange('max', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  作者
                </label>
                <select
                  value={currentFilter.author || ''}
                  onChange={(e) => {
                    const newFilter = { ...currentFilter };
                    if (e.target.value) {
                      newFilter.author = e.target.value;
                    } else {
                      (newFilter.author as string | undefined) = undefined;
                    }
                    onFilterChange(newFilter);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="">所有作者</option>
                  {availableAuthors.map(author => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  其他选项
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                    <input
                      type="checkbox"
                      checked={currentFilter.hasPreview || false}
                      onChange={(e) => {
                        const newFilter = { ...currentFilter };
                        if (e.target.checked) {
                          newFilter.hasPreview = true;
                        } else {
                          (newFilter.hasPreview as boolean | undefined) = undefined;
                        }
                        onFilterChange(newFilter);
                      }}
                      style={{ marginRight: '6px' }}
                    />
                    有预览图
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                    <input
                      type="checkbox"
                      checked={currentFilter.hasThumbnail || false}
                      onChange={(e) => {
                        const newFilter = { ...currentFilter };
                        if (e.target.checked) {
                          newFilter.hasThumbnail = true;
                        } else {
                          (newFilter.hasThumbnail as boolean | undefined) = undefined;
                        }
                        onFilterChange(newFilter);
                      }}
                      style={{ marginRight: '6px' }}
                    />
                    有缩略图
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 活跃过滤器显示 */}
      {activeFilterCount > 0 && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#e3f2fd',
          borderTop: '1px solid #e0e0e0',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>活跃过滤器:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {currentFilter.category && (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                分类: {categories.find(c => c.id === currentFilter.category)?.name}
              </span>
            )}
            {currentFilter.subcategory && (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                子分类: {currentFilter.subcategory}
              </span>
            )}
            {currentFilter.tags && currentFilter.tags.length > 0 && (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                标签: {currentFilter.tags.length}个
              </span>
            )}
            {currentFilter.isFavorite && (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                收藏
              </span>
            )}
            {currentFilter.isCustom && (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#6f42c1', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                自定义
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetFilterPanel;