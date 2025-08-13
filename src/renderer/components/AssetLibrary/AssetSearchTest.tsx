// 素材搜索功能测试组件
import React, { useState, useEffect } from 'react';
import { AssetSearchEngine, type IAdvancedFilter, type ISearchSuggestion } from '../../managers/assets/AssetSearchEngine';
import { type IAssetMetadata, type AssetCategory } from '../../managers/assets/AssetLibraryManager';

// 模拟测试数据
const mockAssets: IAssetMetadata[] = [
  {
    id: '1',
    name: '游戏按钮背景',
    description: '蓝色渐变游戏按钮背景素材',
    category: 'ui' as AssetCategory,
    subcategory: '按钮',
    tags: ['按钮', '蓝色', '渐变', '游戏', 'UI'],
    fileType: 'image/png',
    fileSize: 15360, // 15KB
    dimensions: { width: 200, height: 60 },
    originalUrl: '/assets/button-bg-1.png',
    thumbnailUrl: '/assets/button-bg-1-thumb.png',
    license: 'free',
    author: '设计师A',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    downloadCount: 150,
    rating: 4.5,
    isFavorite: false,
    isCustom: false
  },
  {
    id: '2',
    name: '科幻背景图',
    description: '深空科幻背景，适合太空游戏',
    category: 'background' as AssetCategory,
    subcategory: '科幻',
    tags: ['背景', '科幻', '太空', '深蓝', '星空'],
    fileType: 'image/jpeg',
    fileSize: 204800, // 200KB
    dimensions: { width: 1920, height: 1080 },
    originalUrl: '/assets/sci-fi-bg-1.jpg',
    thumbnailUrl: '/assets/sci-fi-bg-1-thumb.jpg',
    license: 'premium',
    author: '设计师B',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    downloadCount: 89,
    rating: 4.8,
    isFavorite: true,
    isCustom: false
  },
  {
    id: '3',
    name: '魔法师角色',
    description: '卡通风格魔法师角色立绘',
    category: 'character' as AssetCategory,
    subcategory: '法师',
    tags: ['角色', '魔法师', '卡通', '立绘', 'RPG'],
    fileType: 'image/png',
    fileSize: 81920, // 80KB
    dimensions: { width: 512, height: 768 },
    originalUrl: '/assets/wizard-char-1.png',
    thumbnailUrl: '/assets/wizard-char-1-thumb.png',
    license: 'free',
    author: '设计师C',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    downloadCount: 234,
    rating: 4.2,
    isFavorite: false,
    isCustom: true
  },
  {
    id: '4',
    name: '金币图标',
    description: '游戏金币图标，高清PNG格式',
    category: 'icon' as AssetCategory,
    subcategory: '货币',
    tags: ['图标', '金币', '货币', '游戏', '黄金'],
    fileType: 'image/png',
    fileSize: 8192, // 8KB
    dimensions: { width: 64, height: 64 },
    originalUrl: '/assets/gold-coin-icon.png',
    thumbnailUrl: '/assets/gold-coin-icon-thumb.png',
    license: 'free',
    author: '设计师A',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    downloadCount: 456,
    rating: 4.9,
    isFavorite: true,
    isCustom: false
  },
  {
    id: '5',
    name: '爆炸特效',
    description: '火焰爆炸特效动画帧',
    category: 'effect' as AssetCategory,
    subcategory: '爆炸',
    tags: ['特效', '爆炸', '火焰', '动画', '战斗'],
    fileType: 'image/png',
    fileSize: 122880, // 120KB
    dimensions: { width: 256, height: 256 },
    originalUrl: '/assets/explosion-effect.png',
    thumbnailUrl: '/assets/explosion-effect-thumb.png',
    license: 'premium',
    author: '设计师D',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    downloadCount: 78,
    rating: 4.6,
    isFavorite: false,
    isCustom: false
  }
];

export const AssetSearchTest: React.FC = () => {
  const [searchEngine] = useState(() => new AssetSearchEngine());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IAssetMetadata[]>([]);
  const [suggestions, setSuggestions] = useState<ISearchSuggestion[]>([]);
  const [filter, setFilter] = useState<IAdvancedFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [indexStats, setIndexStats] = useState<any>({});

  // 初始化搜索引擎
  useEffect(() => {
    // 重建索引
    searchEngine.rebuildIndex(mockAssets);
    
    // 获取索引统计
    setIndexStats(searchEngine.getIndexStats());
    
    // 执行初始搜索
    performSearch('');
  }, [searchEngine]);

  // 执行搜索
  const performSearch = (query: string, advancedFilter?: IAdvancedFilter) => {
    setIsLoading(true);
    
    try {
      const result = searchEngine.search({
        query,
        filter: advancedFilter || filter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20
      });
      
      setSearchResults(result.assets);
      
      // 获取搜索建议
      if (query.trim().length >= 2) {
        const searchSuggestions = searchEngine.getSuggestions(query, 5);
        setSuggestions(searchSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  // 处理过滤器变化
  const handleFilterChange = (newFilter: Partial<IAdvancedFilter>) => {
    const updatedFilter = { ...filter, ...newFilter } as IAdvancedFilter;
    setFilter(updatedFilter);
    performSearch(searchQuery, updatedFilter);
  };

  // 重置过滤器
  const resetFilter = () => {
    setFilter({});
    performSearch(searchQuery, {});
  };

  // 获取热门标签
  const popularTags = searchEngine.getPopularTags(10);

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        素材搜索功能测试
      </h2>

      {/* 索引统计 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>索引统计</h4>
        <div style={{ fontSize: '14px', color: '#666' }}>
          总素材: {indexStats.totalAssets} | 
          索引词汇: {indexStats.totalTerms} | 
          标签数: {indexStats.totalTags} | 
          分类数: {indexStats.totalCategories} | 
          作者数: {indexStats.totalAuthors}
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜索素材... (试试: 游戏, 按钮, 科幻, 魔法师)"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        
        {/* 搜索建议 */}
        {suggestions.length > 0 && (
          <div style={{
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '8px 12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #f0f0f0' }}>
              搜索建议:
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSearchChange(suggestion.text)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ fontSize: '14px' }}>
                  {suggestion.type === 'keyword' && '🔍'} 
                  {suggestion.type === 'tag' && '🏷️'} 
                  {suggestion.type === 'category' && '📁'} 
                  {suggestion.type === 'author' && '👤'} 
                  {suggestion.text}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {suggestion.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 过滤器 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            分类
          </label>
          <select
            value={filter.category || ''}
            onChange={(e) => handleFilterChange({ category: e.target.value as AssetCategory || undefined })}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">所有分类</option>
            <option value="ui">UI元素</option>
            <option value="background">背景</option>
            <option value="character">角色</option>
            <option value="icon">图标</option>
            <option value="effect">特效</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            许可证
          </label>
          <select
            value={filter.license?.[0] || ''}
            onChange={(e) => handleFilterChange(e.target.value ? { license: [e.target.value as 'free' | 'premium' | 'custom'] } : {})}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">所有许可证</option>
            <option value="free">免费</option>
            <option value="premium">付费</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            作者
          </label>
          <select
            value={filter.author || ''}
            onChange={(e) => handleFilterChange(e.target.value ? { author: e.target.value } : {})}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">所有作者</option>
            <option value="设计师A">设计师A</option>
            <option value="设计师B">设计师B</option>
            <option value="设计师C">设计师C</option>
            <option value="设计师D">设计师D</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filter.isFavorite || false}
              onChange={(e) => handleFilterChange(e.target.checked ? { isFavorite: true } : {})}
              style={{ marginRight: '4px' }}
            />
            仅收藏
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filter.isCustom || false}
              onChange={(e) => handleFilterChange(e.target.checked ? { isCustom: true } : {})}
              style={{ marginRight: '4px' }}
            />
            自定义
          </label>
          
          <button
            type="button"
            onClick={resetFilter}
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
        </div>
      </div>

      {/* 热门标签 */}
      {popularTags.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '8px', color: '#666' }}>热门标签:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {popularTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearchChange(tag)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #007bff',
                  backgroundColor: 'white',
                  color: '#007bff',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      <div>
        <h4 style={{ marginBottom: '16px', color: '#666' }}>
          搜索结果 ({searchResults.length})
          {isLoading && <span style={{ color: '#007bff' }}> - 搜索中...</span>}
        </h4>
        
        {searchResults.length === 0 && !isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            没有找到匹配的素材
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {searchResults.map(asset => (
              <div
                key={asset.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    {asset.name}
                  </h5>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {asset.isFavorite && <span>❤️</span>}
                    {asset.isCustom && <span>🔧</span>}
                  </div>
                </div>
                
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  {asset.description}
                </p>
                
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  分类: {asset.category} • 作者: {asset.author}
                </div>
                
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  尺寸: {asset.dimensions.width}×{asset.dimensions.height} • 
                  大小: {Math.round(asset.fileSize / 1024)}KB
                </div>
                
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  评分: {'⭐'.repeat(Math.floor(asset.rating))} {asset.rating} • 
                  下载: {asset.downloadCount}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {asset.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => handleSearchChange(tag)}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '10px',
                        fontSize: '9px',
                        cursor: 'pointer',
                        color: '#495057'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetSearchTest;