// 搜索性能监控组件
import React, { useState } from 'react';
import { type ISearchAnalytics } from '../../managers/assets/AssetSearchEngine';

interface ISearchPerformanceMonitorProps {
  analytics: ISearchAnalytics;
  onRefresh?: () => void;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchPerformanceMonitor: React.FC<ISearchPerformanceMonitorProps> = ({
  analytics,
  onRefresh,
  onClear,
  className,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取热门查询
  const getTopQueries = (limit: number = 5) => {
    return Array.from(analytics.popularQueries.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  // 获取热门标签
  const getTopTags = (limit: number = 5) => {
    return Array.from(analytics.popularTags.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  // 获取热门分类
  const getTopCategories = (limit: number = 5) => {
    return Array.from(analytics.popularCategories.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 获取性能等级
  const getPerformanceLevel = (avgTime: number): { level: string; color: string } => {
    if (avgTime < 50) return { level: '优秀', color: '#28a745' };
    if (avgTime < 100) return { level: '良好', color: '#ffc107' };
    if (avgTime < 200) return { level: '一般', color: '#fd7e14' };
    return { level: '需优化', color: '#dc3545' };
  };

  const performanceLevel = getPerformanceLevel(analytics.searchPerformance.averageTime);

  return (
    <div className={className} style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      ...style
    }}>
      {/* 头部 */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            📊 搜索性能监控
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '10px',
            backgroundColor: performanceLevel.color,
            color: 'white'
          }}>
            {performanceLevel.level}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {analytics.totalSearches} 次搜索
          </span>
          <span style={{ fontSize: '12px' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* 基础统计（始终显示） */}
      <div style={{ padding: '12px 16px', fontSize: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', marginBottom: '2px' }}>平均响应时间</div>
            <div style={{ fontWeight: 'bold', color: performanceLevel.color }}>
              {formatTime(analytics.searchPerformance.averageTime)}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', marginBottom: '2px' }}>平均结果数</div>
            <div style={{ fontWeight: 'bold' }}>
              {Math.round(analytics.averageResultCount)}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#666', marginBottom: '2px' }}>慢查询</div>
            <div style={{ fontWeight: 'bold', color: analytics.searchPerformance.slowQueries.length > 0 ? '#dc3545' : '#28a745' }}>
              {analytics.searchPerformance.slowQueries.length}
            </div>
          </div>
        </div>
      </div>

      {/* 详细统计（可展开） */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid #e0e0e0' }}>
          {/* 操作按钮 */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #007bff',
                  backgroundColor: 'white',
                  color: '#007bff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                刷新
              </button>
            )}
            
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #dc3545',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                清空
              </button>
            )}
          </div>

          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {/* 热门查询 */}
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                热门查询
              </h5>
              <div style={{ fontSize: '11px' }}>
                {getTopQueries().length === 0 ? (
                  <div style={{ color: '#999', fontStyle: 'italic' }}>暂无数据</div>
                ) : (
                  getTopQueries().map(([query, count]) => (
                    <div key={query} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {query}
                      </span>
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 热门标签 */}
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                热门标签
              </h5>
              <div style={{ fontSize: '11px' }}>
                {getTopTags().length === 0 ? (
                  <div style={{ color: '#999', fontStyle: 'italic' }}>暂无数据</div>
                ) : (
                  getTopTags().map(([tag, count]) => (
                    <div key={tag} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🏷️ {tag}
                      </span>
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 热门分类 */}
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                热门分类
              </h5>
              <div style={{ fontSize: '11px' }}>
                {getTopCategories().length === 0 ? (
                  <div style={{ color: '#999', fontStyle: 'italic' }}>暂无数据</div>
                ) : (
                  getTopCategories().map(([category, count]) => (
                    <div key={category} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📁 {category}
                      </span>
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 慢查询 */}
            {analytics.searchPerformance.slowQueries.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#dc3545' }}>
                  慢查询 (&gt;100毫秒)
                </h5>
                <div style={{ fontSize: '11px' }}>
                  {analytics.searchPerformance.slowQueries.map((slowQuery, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        color: '#dc3545'
                      }}>
                        ⚠️ {slowQuery.query || '(空查询)'}
                      </span>
                      <span style={{ color: '#dc3545', marginLeft: '8px' }}>
                        {formatTime(slowQuery.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 性能建议 */}
          {analytics.searchPerformance.averageTime > 100 && (
            <div style={{
              margin: '16px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#856404' }}>
                💡 性能优化建议:
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#856404' }}>
                <li>考虑减少搜索索引的大小</li>
                <li>优化搜索查询的复杂度</li>
                <li>检查是否有过多的过滤条件</li>
                <li>考虑实现搜索结果缓存</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPerformanceMonitor;