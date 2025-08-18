// 高级搜索面板组件
import React, { useState, useCallback } from 'react';
import { 
  type AdvancedFilter
} from '../../../logic/managers/assets/AssetSearchEngine';
import { 
  type AssetCategoryInfo 
} from '../../../logic/managers/assets/AssetLibraryManager';

interface IAdvancedSearchPanelProps {
  categories: AssetCategoryInfo[];
  availableTags: string[];
  availableAuthors: string[];
  popularTags: Array<{ tag: string; count: number }>;
  currentFilter: AdvancedFilter;
  onFilterChange: (filter: AdvancedFilter) => void;
  onReset: () => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AdvancedSearchPanel: React.FC<IAdvancedSearchPanelProps> = ({
  categories,
  availableTags,
  availableAuthors,
  popularTags,
  currentFilter,
  onFilterChange,
  onReset,
  onClose,
  className,
  style
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'tags'>('basic');

  // 处理基础过滤器变化
  const handleBasicFilterChange = useCallback((field: string, value: any) => {
    onFilterChange({
      ...currentFilter,
      [field]: value || undefined
    });
  }, [currentFilter, onFilterChange]);

  // 处理范围过滤器变化
  const handleRangeFilterChange = useCallback((
    rangeField: 'fileSizeRange' | 'dimensionRatio' | 'ratingRange' | 'downloadCountRange',
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = value ? parseFloat(value) : undefined;
    const currentRange = (currentFilter as any)[rangeField] || {};
    
    onFilterChange({
      ...currentFilter,
      [rangeField]: {
        ...currentRange,
        [field]: numValue
      }
    });
  }, [currentFilter, onFilterChange]);

  // 处理尺寸过滤器变化
  const handleSizeFilterChange = useCallback((field: 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFilterChange({
      ...currentFilter,
      [field]: numValue
    });
  }, [currentFilter, onFilterChange]);

  // 处理标签切换
  const handleTagToggle = useCallback((tag: string) => {
    const currentTags = currentFilter.tags ?? [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFilterChange({
      ...currentFilter,
      // exactOptionalPropertyTypes: 若后端类型要求非可选，使用空数组
      tags: newTags
    });
  }, [currentFilter, onFilterChange]);

  // 处理多选过滤器切换
  const handleMultiSelectToggle = useCallback((
    field: 'license' | 'fileType',
    value: string
  ) => {
    const currentValues = ((currentFilter as any)[field] as string[] | undefined) ?? [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...currentFilter,
      // 保证为数组类型
      [field]: newValues
    });
  }, [currentFilter, onFilterChange]);

  // 应用预设尺寸
  const applyPresetSize = useCallback((width: number, height: number) => {
    onFilterChange({
      ...currentFilter,
      minWidth: width.toString(),
      maxWidth: width.toString(),
      minHeight: height.toString(),
      maxHeight: height.toString()
    });
  }, [currentFilter, onFilterChange]);

  // 计算活跃过滤器数量
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (currentFilter.category) count++;
    if (currentFilter.tags && currentFilter.tags.length > 0) count++;
    if (currentFilter.ratingRange?.min || currentFilter.ratingRange?.max) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={className} style={{ 
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      ...style 
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            高级搜索
          </h4>
          {activeFilterCount > 0 && (
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {activeFilterCount} 个过滤器
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              style={{
                padding: '6px 12px',
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
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 标签页导航 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {[
          { key: 'basic', label: '基础过滤' },
          { key: 'advanced', label: '高级选项' },
          { key: 'tags', label: '标签管理' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? '#f8f9fa' : 'transparent',
              color: activeTab === tab.key ? '#007bff' : '#666',
              borderBottom: activeTab === tab.key ? '2px solid #007bff' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {/* 基础过滤 */}
        {activeTab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 分类选择 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                分类
              </label>
              <select
                value={currentFilter.category || ''}
                onChange={(e) => handleBasicFilterChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              >
                <option value="">所有分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 子分类选择 */}
            {currentFilter.category && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                  子分类
                </label>
                <select
                  value={currentFilter.category || ''}
                  onChange={(e) => handleBasicFilterChange('subcategory', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  <option value="">所有子分类</option>
                  {(categories.find(c => c.id === currentFilter.category)?.subcategories ?? []).map((sub: AssetCategoryInfo) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* 许可证类型 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                许可证类型
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['free', 'premium', 'custom'].map(license => (
                  <button
                    key={license}
                    type="button"
                    onClick={() => handleMultiSelectToggle('license', license)}
                    style={{
                      padding: '6px 12px',
                      border: `1px solid ${(currentFilter.license as string[] || []).includes(license) ? '#007bff' : '#ddd'}`,
                      backgroundColor: (currentFilter.license as string[] || []).includes(license) ? '#007bff' : 'white',
                      color: (currentFilter.license as string[] || []).includes(license) ? 'white' : '#666',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {license === 'free' ? '🆓 免费' : 
                     license === 'premium' ? '💎 付费' : '🔧 自定义'}
                  </button>
                ))}
              </div>
            </div>

            {/* 文件类型 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                文件类型
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'].map(fileType => (
                  <button
                    key={fileType}
                    type="button"
                    onClick={() => handleMultiSelectToggle('fileType', fileType)}
                    style={{
                      padding: '6px 12px',
                      border: `1px solid ${(currentFilter.fileType as string[] || []).includes(fileType) ? '#28a745' : '#ddd'}`,
                      backgroundColor: (currentFilter.fileType as string[] || []).includes(fileType) ? '#28a745' : 'white',
                      color: (currentFilter.fileType as string[] || []).includes(fileType) ? 'white' : '#666',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {(fileType.split('/')[1] ?? '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸过滤 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                尺寸范围 (像素)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>最小宽度</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentFilter.minWidth || ''}
                    onChange={(e) => handleSizeFilterChange('minWidth', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>最大宽度</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={currentFilter.maxWidth || ''}
                    onChange={(e) => handleSizeFilterChange('maxWidth', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>最小高度</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentFilter.minHeight || ''}
                    onChange={(e) => handleSizeFilterChange('minHeight', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>最大高度</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={currentFilter.maxHeight || ''}
                    onChange={(e) => handleSizeFilterChange('maxHeight', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>
              
              {/* 常用尺寸预设 */}
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
                    type="button"
                    onClick={() => applyPresetSize(preset.width, preset.height)}
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

        {/* 高级选项 */}
        {activeTab === 'advanced' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 作者选择 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                作者
              </label>
              <select
                value={currentFilter.author || ''}
                onChange={(e) => handleBasicFilterChange('author', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
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

            {/* 文件大小范围 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                文件大小 (KB)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="最小"
                  value={currentFilter.fileSizeRange?.min ? Math.round(currentFilter.fileSizeRange.min / 1024) : ''}
                  onChange={(e) => handleRangeFilterChange('fileSizeRange', 'min', e.target.value ? (parseInt(e.target.value) * 1024).toString() : '')}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <input
                  type="number"
                  placeholder="最大"
                  value={currentFilter.fileSizeRange?.max ? Math.round(currentFilter.fileSizeRange.max / 1024) : ''}
                  onChange={(e) => handleRangeFilterChange('fileSizeRange', 'max', e.target.value ? (parseInt(e.target.value) * 1024).toString() : '')}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            {/* 宽高比范围 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                宽高比
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="最小"
                  value={currentFilter.dimensionRatio?.min || ''}
                  onChange={(e) => handleRangeFilterChange('dimensionRatio', 'min', e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="最大"
                  value={currentFilter.dimensionRatio?.max || ''}
                  onChange={(e) => handleRangeFilterChange('dimensionRatio', 'max', e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
              
              {/* 常用宽高比预设 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {[
                  { label: '正方形', ratio: 1 },
                  { label: '16:9', ratio: 16/9 },
                  { label: '4:3', ratio: 4/3 },
                  { label: '3:2', ratio: 3/2 },
                  { label: '竖屏', ratio: 9/16 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onFilterChange({
                        ...currentFilter,
                        dimensionRatio: {
                          min: preset.ratio - 0.1,
                          max: preset.ratio + 0.1
                        }
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

            {/* 评分范围 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                评分范围
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="最低"
                  value={currentFilter.ratingRange?.min || ''}
                  onChange={(e) => handleRangeFilterChange('ratingRange', 'min', e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="最高"
                  value={currentFilter.ratingRange?.max || ''}
                  onChange={(e) => handleRangeFilterChange('ratingRange', 'max', e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            {/* 其他选项 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                其他选项
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={currentFilter.isFavorite || false}
                    onChange={(e) => handleBasicFilterChange('isFavorite', e.target.checked ? true : undefined)}
                    style={{ marginRight: '8px' }}
                  />
                  仅显示收藏
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={currentFilter.isCustom || false}
                    onChange={(e) => handleBasicFilterChange('isCustom', e.target.checked ? true : undefined)}
                    style={{ marginRight: '8px' }}
                  />
                  仅显示自定义素材
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={currentFilter.hasPreview || false}
                    onChange={(e) => handleBasicFilterChange('hasPreview', e.target.checked ? true : undefined)}
                    style={{ marginRight: '8px' }}
                  />
                  有预览图
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={currentFilter.hasThumbnail || false}
                    onChange={(e) => handleBasicFilterChange('hasThumbnail', e.target.checked ? true : undefined)}
                    style={{ marginRight: '8px' }}
                  />
                  有缩略图
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 标签管理 */}
        {activeTab === 'tags' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 已选标签 */}
            {currentFilter.tags && currentFilter.tags.length > 0 && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  已选标签 ({currentFilter.tags.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {currentFilter.tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #dc3545',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {tag}
                      <span>✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 热门标签 */}
            {popularTags.length > 0 && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  热门标签
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {popularTags.slice(0, 20).map(({ tag, count }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '4px 8px',
                        border: `1px solid ${(currentFilter.tags || []).includes(tag) ? '#007bff' : '#ddd'}`,
                        backgroundColor: (currentFilter.tags || []).includes(tag) ? '#007bff' : 'white',
                        color: (currentFilter.tags || []).includes(tag) ? 'white' : '#666',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {tag}
                      <span style={{ 
                        fontSize: '9px', 
                        opacity: 0.7,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        padding: '1px 4px',
                        borderRadius: '8px'
                      }}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 所有标签 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                所有标签 ({availableTags.length})
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {availableTags.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    fontSize: '12px',
                    padding: '20px'
                  }}>
                    暂无可用标签
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        style={{
                          padding: '3px 6px',
                          border: `1px solid ${(currentFilter.tags || []).includes(tag) ? '#007bff' : '#ddd'}`,
                          backgroundColor: (currentFilter.tags || []).includes(tag) ? '#007bff' : 'white',
                          color: (currentFilter.tags || []).includes(tag) ? 'white' : '#666',
                          borderRadius: '10px',
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;