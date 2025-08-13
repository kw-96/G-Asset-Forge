/**
 * 统一的Dropdown组件 - 支持简单菜单和增强功能
 * 基于Radix UI提供无障碍支持，同时支持搜索、分组等高级功能
 */

import React, { useState, useRef, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { keyframes } from 'styled-components';
import { SvgIcon } from '../Icon/SvgIcon';
import { Input } from '../Input/Input';

// 简单下拉菜单接口（基于Radix UI）
interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  mode?: 'simple';
}

// 增强下拉菜单接口
export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
  shortcut?: string;
  destructive?: boolean;
  onSelect?: () => void;
}

interface EnhancedDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  offset?: number;
  searchable?: boolean;
  maxHeight?: number;
  onSelect?: (item: DropdownItem) => void;
  mode: 'enhanced';
}

// 统一的Props类型
type DropdownProps = SimpleDropdownProps | EnhancedDropdownProps;

interface DropdownItemProps {
  children: React.ReactNode;
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  destructive?: boolean;
}

const slideUpAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideRightAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideDownAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideLeftAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const DropdownContent = styled(DropdownMenu.Content)`
  min-width: 160px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  
  &[data-state='open'][data-side='top'] {
    animation-name: ${slideDownAndFade};
  }
  &[data-state='open'][data-side='right'] {
    animation-name: ${slideLeftAndFade};
  }
  &[data-state='open'][data-side='bottom'] {
    animation-name: ${slideUpAndFade};
  }
  &[data-state='open'][data-side='left'] {
    animation-name: ${slideRightAndFade};
  }
`;

const DropdownItemStyled = styled(DropdownMenu.Item)<{ $destructive?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme, $destructive }) => 
    $destructive ? theme.colors.error : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  user-select: none;
  outline: none;
  
  &:hover,
  &[data-highlighted] {
    background: ${({ theme, $destructive }) => 
      $destructive ? `${theme.colors.error}10` : theme.colors.surface};
  }
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
    }
  }
`;

const DropdownSeparator = styled(DropdownMenu.Separator)`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

// 增强下拉菜单样式
const EnhancedDropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const EnhancedDropdownTrigger = styled.div`
  cursor: pointer;
`;

const EnhancedDropdownContent = styled.div<{ 
  $placement: string; 
  $offset: number; 
  $maxHeight: number;
}>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  min-width: 200px;
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  ${({ $placement, $offset }) => {
    switch ($placement) {
      case 'bottom-start':
        return `top: calc(100% + ${$offset}px); left: 0;`;
      case 'bottom-end':
        return `top: calc(100% + ${$offset}px); right: 0;`;
      case 'top-start':
        return `bottom: calc(100% + ${$offset}px); left: 0;`;
      case 'top-end':
        return `bottom: calc(100% + ${$offset}px); right: 0;`;
      default:
        return `top: calc(100% + ${$offset}px); left: 0;`;
    }
  }}
`;

const DropdownSearch = styled.div`
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: #fafafa;
`;

const SearchInput = styled(Input)`
  width: 100%;
  font-size: 12px;
  height: 28px;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const DropdownList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const DropdownGroup = styled.div`
  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
    margin-top: 4px;
    padding-top: 4px;
  }
`;

const DropdownGroupLabel = styled.div`
  padding: 6px 12px 4px 12px;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EnhancedDropdownItem = styled.div<{ 
  $disabled?: boolean;
  $highlighted?: boolean;
  $destructive?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  color: ${({ theme, $disabled, $destructive }) => {
    if ($disabled) return '#9ca3af';
    if ($destructive) return theme.colors.error;
    return '#374151';
  }};
  font-size: 13px;
  background: ${({ $highlighted, theme }) => 
    $highlighted ? theme.colors.primary[50] : 'transparent'};
  
  &:hover {
    background: ${({ theme, $disabled, $highlighted, $destructive }) => {
      if ($disabled) return 'transparent';
      if ($highlighted) return theme.colors.primary[100];
      if ($destructive) return `${theme.colors.error}10`;
      return '#f9fafb';
    }};
  }
  
  &:active {
    background: ${({ theme, $disabled, $destructive }) => {
      if ($disabled) return 'transparent';
      if ($destructive) return `${theme.colors.error}15`;
      return theme.colors.primary[100];
    }};
  }
`;

const DropdownItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #6b7280;
`;

const DropdownItemLabel = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownItemShortcut = styled.div`
  font-size: 11px;
  color: #9ca3af;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
`;

// 增强下拉菜单组件
const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  offset = 4,
  searchable = false,
  maxHeight = 300,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 过滤项目
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // 按组分组
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, DropdownItem[]> = {};
    
    filteredItems.forEach(item => {
      const group = item.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    const item = filteredItems[highlightedIndex];
                    if (item) handleItemSelect(item);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredItems]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  const handleItemSelect = (item: DropdownItem) => {
    if (item?.disabled) return;
    
    item?.onSelect?.();
    onSelect?.(item);
    setIsOpen(false);
  };

  return (
    <EnhancedDropdownContainer>
      <EnhancedDropdownTrigger ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </EnhancedDropdownTrigger>
      
      {isOpen && (
        <EnhancedDropdownContent 
          ref={dropdownRef}
          $placement={placement} 
          $offset={offset}
          $maxHeight={maxHeight}
        >
          {searchable && (
            <DropdownSearch>
              <SearchInput
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </DropdownSearch>
          )}
          
          <DropdownList>
            {filteredItems.length === 0 ? (
              <NoResults>
                <SvgIcon name="icon.24.search" size={16} title="无结果" />
                <div style={{ marginTop: '4px' }}>
                  没有找到匹配项
                </div>
              </NoResults>
            ) : (
              Object.entries(groupedItems).map(([groupName, groupItems]) => (
                <DropdownGroup key={groupName}>
                  {groupName !== 'default' && (
                    <DropdownGroupLabel>{groupName}</DropdownGroupLabel>
                  )}
                  {groupItems.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const disabled = item.disabled ?? false;
                    return (
                      <EnhancedDropdownItem
                        key={item.id}
                        $disabled={disabled}
                        $highlighted={highlightedIndex === globalIndex}
                        $destructive={item.destructive ?? false}
                        onClick={() => handleItemSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                      >
                        {item.icon && (
                          <DropdownItemIcon>
                            {item.icon}
                          </DropdownItemIcon>
                        )}
                        <DropdownItemLabel>{item.label}</DropdownItemLabel>
                        {item.shortcut && (
                          <DropdownItemShortcut>{item.shortcut}</DropdownItemShortcut>
                        )}
                      </EnhancedDropdownItem>
                    );
                  })}
                </DropdownGroup>
              ))
            )}
          </DropdownList>
        </EnhancedDropdownContent>
      )}
    </EnhancedDropdownContainer>
  );
};

// 主要的Dropdown组件 - 支持两种模式
export const Dropdown: React.FC<DropdownProps> = (props) => {
  if ('mode' in props && props.mode === 'enhanced') {
    return <EnhancedDropdown {...props} />;
  }
  
  // 默认使用简单模式（Radix UI）
  const { trigger, children, align = 'start', side = 'bottom' } = props as SimpleDropdownProps;
  
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownContent align={align} side={side} sideOffset={4}>
          {children}
        </DropdownContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onSelect,
  disabled = false,
  destructive = false,
}) => {
  return (
    <DropdownItemStyled
      onSelect={onSelect || (() => {})}
      disabled={disabled}
      $destructive={destructive}
    >
      {children}
    </DropdownItemStyled>
  );
};

export const DropdownSeparatorComponent = DropdownSeparator;