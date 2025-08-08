/**
 * StableDropdown组件 - 解决Radix UI的useEffect依赖问题
 * 提供稳定的下拉菜单功能，防止无限循环
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { keyframes } from 'styled-components';
import { EnhancedErrorBoundary } from '../../../components/ErrorBoundary/EnhancedErrorBoundary';
import { reactLoopFixToolkit } from '../../../utils/ReactLoopFix';

interface StableDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  sideOffset?: number;
  alignOffset?: number;
}

interface StableDropdownItemProps {
  children: React.ReactNode;
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

// 动画定义
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

// 样式组件
const StableDropdownContent = styled(DropdownMenu.Content)`
  min-width: 160px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  
  animation-duration: 200ms;
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

const StableDropdownItemStyled = styled(DropdownMenu.Item)<{ $destructive?: boolean }>`
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

const StableDropdownSeparatorStyled = styled(DropdownMenu.Separator)`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

const DropdownWrapper = styled.div`
  display: inline-block;
`;

// 性能监控Hook
const useDropdownPerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    // 检测异常渲染频率
    if (timeSinceLastRender < 16 && renderCountRef.current > 10) {
      reactLoopFixToolkit.debugLogger.warn(
        'dropdown-performance',
        `${componentName}组件渲染频率异常`,
        {
          renderCount: renderCountRef.current,
          timeSinceLastRender,
          componentName,
        },
        'StableDropdown'
      );
    }
    
    lastRenderTimeRef.current = now;
    
    // 重置计数器
    if (renderCountRef.current > 100) {
      renderCountRef.current = 0;
    }
  });
  
  return renderCountRef.current;
};

// 稳定的Dropdown组件
export const StableDropdown: React.FC<StableDropdownProps> = React.memo(({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  open,
  onOpenChange,
  disabled = false,
  className,
  sideOffset = 4,
  alignOffset = 0,
}) => {
  // 性能监控
  const renderCount = useDropdownPerformanceMonitor('StableDropdown');
  
  // 稳定化回调函数
  const stableOnOpenChange = useCallback((newOpen: boolean) => {
    if (onOpenChange && typeof onOpenChange === 'function') {
      onOpenChange(newOpen);
    }
  }, [onOpenChange]);
  
  // 稳定化props对象
  const stableProps = useMemo(() => ({
    align,
    side,
    sideOffset,
    alignOffset,
  }), [align, side, sideOffset, alignOffset]);
  
  // 稳定化trigger元素
  const stableTrigger = useMemo(() => trigger, [trigger]);
  
  // 稳定化children
  const stableChildren = useMemo(() => children, [children]);
  
  // 记录组件使用情况
  useEffect(() => {
    reactLoopFixToolkit.debugLogger.info(
      'dropdown-lifecycle',
      'StableDropdown组件挂载',
      { renderCount, disabled },
      'StableDropdown'
    );
    
    return () => {
      reactLoopFixToolkit.debugLogger.info(
        'dropdown-lifecycle',
        'StableDropdown组件卸载',
        { renderCount },
        'StableDropdown'
      );
    };
  }, []); // 空依赖数组，只在挂载和卸载时执行
  
  return (
    <EnhancedErrorBoundary>
      <DropdownWrapper className={className}>
        <DropdownMenu.Root 
          {...(open !== undefined && { open })}
          onOpenChange={stableOnOpenChange}
        >
          <DropdownMenu.Trigger asChild disabled={disabled}>
            {stableTrigger}
          </DropdownMenu.Trigger>
          
          <DropdownMenu.Portal>
            <StableDropdownContent {...stableProps}>
              {stableChildren}
            </StableDropdownContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </DropdownWrapper>
    </EnhancedErrorBoundary>
  );
});

StableDropdown.displayName = 'StableDropdown';

// 稳定的DropdownItem组件
export const StableDropdownItem: React.FC<StableDropdownItemProps> = React.memo(({
  children,
  onSelect,
  disabled = false,
  destructive = false,
  className,
}) => {
  // 性能监控
  useDropdownPerformanceMonitor('StableDropdownItem');
  
  // 稳定化选择回调
  const stableOnSelect = useCallback((event: Event) => {
    if (onSelect && typeof onSelect === 'function') {
      try {
        onSelect(event);
      } catch (error) {
        reactLoopFixToolkit.debugLogger.error(
          'dropdown-item',
          'DropdownItem选择回调执行失败',
          { error: error instanceof Error ? error.message : String(error) },
          'StableDropdownItem'
        );
      }
    }
  }, [onSelect]);
  
  // 稳定化children
  const stableChildren = useMemo(() => children, [children]);
  
  return (
    <StableDropdownItemStyled
      onSelect={stableOnSelect}
      disabled={disabled}
      $destructive={destructive}
      className={className}
    >
      {stableChildren}
    </StableDropdownItemStyled>
  );
});

StableDropdownItem.displayName = 'StableDropdownItem';

// 稳定的DropdownSeparator组件
export const StableDropdownSeparator: React.FC<{ className?: string }> = React.memo(({ 
  className 
}) => {
  return <StableDropdownSeparatorStyled className={className} />;
});

StableDropdownSeparator.displayName = 'StableDropdownSeparator';

// 导出类型
export type { StableDropdownProps, StableDropdownItemProps };