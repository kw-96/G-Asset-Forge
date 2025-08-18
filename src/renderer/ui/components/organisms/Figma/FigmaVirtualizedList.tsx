import React, { useState, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
// import { useTheme } from '../theme/ThemeProvider';

// 虚拟化列表项接口
export interface VirtualizedListItem {
  id: string;
  data: any;
  height?: number;
  group?: string | undefined;
}

// 虚拟化列表配置接口
export interface VirtualizedListConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  bufferSize?: number;
  enableGrouping?: boolean;
  enableSearch?: boolean;
  enableSorting?: boolean;
}

// 虚拟化列表属性接口
export interface FigmaVirtualizedListProps {
  items: VirtualizedListItem[];
  config: VirtualizedListConfig;
  renderItem: (item: VirtualizedListItem, index: number) => React.ReactNode;
  renderGroup?: (group: string, items: VirtualizedListItem[]) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  onItemClick?: (item: VirtualizedListItem, index: number) => void;
  onItemDoubleClick?: (item: VirtualizedListItem, index: number) => void;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  loading?: boolean;
  className?: string;
}

// 样式组件
const ListContainer = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  overflow: auto;
  position: relative;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  /* Figma风格滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: ${props => props.theme.colors.border.strong};
    }
  }
`;

const VirtualContainer = styled.div<{ totalHeight: number }>`
  height: ${props => props.totalHeight}px;
  position: relative;
`;

const ItemContainer = styled(motion.div)<{ top: number; height: number }>`
  position: absolute;
  top: ${props => props.top}px;
  left: 0;
  right: 0;
  height: ${props => props.height}px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
  
  &:active {
    background: ${props => props.theme.colors.background.pressed};
  }
`;

const GroupHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 20px;
  color: ${props => props.theme.colors.text.tertiary};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  max-width: 300px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
`;

const LoadingSpinner = styled(motion.div)`
  width: 24px;
  height: 24px;
  border: 2px solid ${props => props.theme.colors.border.subtle};
  border-top: 2px solid ${props => props.theme.colors.accent};
  border-radius: 50%;
`;

// 搜索和过滤工具函数
const filterItems = (items: VirtualizedListItem[], searchQuery: string): VirtualizedListItem[] => {
  if (!searchQuery.trim()) return items;
  
  const query = searchQuery.toLowerCase();
  return items.filter(item => {
    const searchableText = JSON.stringify(item.data).toLowerCase();
    return searchableText.includes(query);
  });
};

// 排序工具函数
const sortItems = (items: VirtualizedListItem[], sortBy: string, sortOrder: 'asc' | 'desc'): VirtualizedListItem[] => {
  if (!sortBy) return items;
  
  return [...items].sort((a, b) => {
    const aValue = a.data[sortBy];
    const bValue = b.data[sortBy];
    
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// 分组工具函数
const groupItems = (items: VirtualizedListItem[]): { [key: string]: VirtualizedListItem[] } => {
  return items.reduce((groups, item) => {
    const group = item.group || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as { [key: string]: VirtualizedListItem[] });
};

// 虚拟化计算钩子
const useVirtualization = (
  items: VirtualizedListItem[],
  config: VirtualizedListConfig,
  scrollTop: number
) => {
  return useMemo(() => {
    const { itemHeight, containerHeight, overscan = 5 } = config;
    // const bufferSize = 10; // 未使用的变量
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    
    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, config, scrollTop]);
};

// 主组件
export const FigmaVirtualizedList: React.FC<FigmaVirtualizedListProps> = ({
  items,
  config,
  renderItem,
  renderGroup,
  renderEmpty,
  renderLoading,
  onItemClick,
  onItemDoubleClick,
  searchQuery = '',
  sortBy = '',
  sortOrder = 'asc',
  loading = false,
  className
}) => {
  // const theme = useTheme(); // 暂时未使用
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // 处理项目点击
  const handleItemClick = useCallback((item: VirtualizedListItem, index: number) => {
    onItemClick?.(item, index);
  }, [onItemClick]);
  
  // 处理项目双击
  const handleItemDoubleClick = useCallback((item: VirtualizedListItem, index: number) => {
    onItemDoubleClick?.(item, index);
  }, [onItemDoubleClick]);
  
  // 处理数据过滤和排序
  const processedItems = useMemo(() => {
    let result = items;
    
    // 搜索过滤
    if (searchQuery) {
      result = filterItems(result, searchQuery);
    }
    
    // 排序
    if (sortBy) {
      result = sortItems(result, sortBy, sortOrder);
    }
    
    return result;
  }, [items, searchQuery, sortBy, sortOrder]);
  
  // 分组处理
  const groupedItems = useMemo(() => {
    if (!config.enableGrouping) return { default: processedItems };
    return groupItems(processedItems);
  }, [processedItems, config.enableGrouping]);
  
  // 虚拟化计算
  const virtualization = useVirtualization(processedItems, config, scrollTop);
  
  // 渲染加载状态
  if (loading) {
    return (
      <ListContainer height={config.containerHeight} className={className}>
        {renderLoading ? renderLoading() : (
          <LoadingContainer>
            <LoadingSpinner
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </LoadingContainer>
        )}
      </ListContainer>
    );
  }
  
  // 渲染空状态
  if (processedItems.length === 0) {
    return (
      <ListContainer height={config.containerHeight} className={className}>
        {renderEmpty ? renderEmpty() : (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>暂无数据</EmptyTitle>
            <EmptyDescription>
              {searchQuery ? `未找到包含"${searchQuery}"的项目` : '列表中暂时没有任何项目'}
            </EmptyDescription>
          </EmptyState>
        )}
      </ListContainer>
    );
  }
  
  // 渲染分组列表
  if (config.enableGrouping && Object.keys(groupedItems).length > 1) {
    return (
      <ListContainer 
        height={config.containerHeight} 
        className={className}
        ref={containerRef}
        onScroll={handleScroll}
      >
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName}>
            {renderGroup ? renderGroup(groupName, groupItems) : (
              <GroupHeader>{groupName}</GroupHeader>
            )}
            {groupItems.map((item, itemIndex) => (
              <ItemContainer
                key={item.id}
                top={itemIndex * config.itemHeight}
                height={item.height || config.itemHeight}
                onClick={() => handleItemClick(item, itemIndex)}
                onDoubleClick={() => handleItemDoubleClick(item, itemIndex)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderItem(item, itemIndex)}
              </ItemContainer>
            ))}
          </div>
        ))}
      </ListContainer>
    );
  }
  
  // 渲染虚拟化列表
  return (
    <ListContainer 
      height={config.containerHeight} 
      className={className}
      ref={containerRef}
      onScroll={handleScroll}
    >
      <VirtualContainer totalHeight={virtualization.totalHeight}>
        <AnimatePresence>
          {virtualization.visibleItems.map((item, itemIndex) => {
            const actualIndex = virtualization.startIndex + itemIndex;
            return (
              <ItemContainer
                key={item.id}
                top={virtualization.offsetY + itemIndex * config.itemHeight}
                height={item.height || config.itemHeight}
                onClick={() => handleItemClick(item, actualIndex)}
                onDoubleClick={() => handleItemDoubleClick(item, actualIndex)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderItem(item, actualIndex)}
              </ItemContainer>
            );
          })}
        </AnimatePresence>
      </VirtualContainer>
    </ListContainer>
  );
};

// 默认导出
export default FigmaVirtualizedList;

// 工具函数导出
export { filterItems, sortItems, groupItems };