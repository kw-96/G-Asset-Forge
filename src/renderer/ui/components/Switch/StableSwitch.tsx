/**
 * StableSwitch组件 - 解决Radix UI Switch的useEffect依赖问题
 * 提供稳定的开关切换功能，防止无限循环
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import styled from 'styled-components';
import { EnhancedErrorBoundary } from '../../../components/ErrorBoundary/EnhancedErrorBoundary';
import { reactLoopFixToolkit } from '../../../utils/ReactLoopFix';

interface StableSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  name?: string;
  value?: string;
  required?: boolean;
}

// 样式组件
const SwitchContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SwitchContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const SwitchLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const SwitchDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`;

const StableSwitchRoot = styled(SwitchPrimitive.Root)<{ $checked: boolean }>`
  width: 44px;
  height: 24px;
  background: ${({ theme, $checked }) => 
    $checked ? theme.colors.primary : theme.colors.surface};
  border: 1px solid ${({ theme, $checked }) => 
    $checked ? theme.colors.primary : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  position: relative;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not([data-disabled]) {
    background: ${({ theme, $checked }) => 
      $checked ? theme.colors.primary : theme.colors.border.hover};
  }
`;

const StableSwitchThumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: 18px;
  height: 18px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  transform: translateX(2px);
  will-change: transform;
  
  &[data-state='checked'] {
    transform: translateX(22px);
  }
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px; /* 对齐文本基线 */
`;

// 性能监控Hook
const useSwitchPerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    // 检测异常渲染频率
    if (timeSinceLastRender < 16 && renderCountRef.current > 10) {
      reactLoopFixToolkit.debugLogger.warn(
        'switch-performance',
        `${componentName}组件渲染频率异常`,
        {
          renderCount: renderCountRef.current,
          timeSinceLastRender,
          componentName,
        },
        'StableSwitch'
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

// 稳定的Switch组件
export const StableSwitch: React.FC<StableSwitchProps> = React.memo(({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
  name,
  value,
  required = false,
}) => {
  // 性能监控
  const renderCount = useSwitchPerformanceMonitor('StableSwitch');
  
  // 稳定化回调函数
  const stableOnCheckedChange = useCallback((newChecked: boolean) => {
    if (onCheckedChange && typeof onCheckedChange === 'function') {
      try {
        onCheckedChange(newChecked);
      } catch (error) {
        reactLoopFixToolkit.debugLogger.error(
          'switch-callback',
          'Switch状态变更回调执行失败',
          { 
            error: error instanceof Error ? error.message : String(error),
            newChecked,
            currentChecked: checked,
          },
          'StableSwitch'
        );
      }
    }
  }, [onCheckedChange, checked]);
  
  // 稳定化label和description
  const stableLabel = useMemo(() => label, [label]);
  const stableDescription = useMemo(() => description, [description]);
  
  // 记录组件使用情况
  useEffect(() => {
    reactLoopFixToolkit.debugLogger.info(
      'switch-lifecycle',
      'StableSwitch组件挂载',
      { renderCount, checked, disabled, hasLabel: !!label },
      'StableSwitch'
    );
    
    return () => {
      reactLoopFixToolkit.debugLogger.info(
        'switch-lifecycle',
        'StableSwitch组件卸载',
        { renderCount },
        'StableSwitch'
      );
    };
  }, []); // 空依赖数组，只在挂载和卸载时执行
  
  // 监控状态变化
  useEffect(() => {
    reactLoopFixToolkit.debugLogger.debug(
      'switch-state',
      'Switch状态变化',
      { checked, disabled },
      'StableSwitch'
    );
  }, [checked, disabled]);
  
  return (
    <EnhancedErrorBoundary>
      <SwitchContainer className={className}>
        <SwitchWrapper>
          <StableSwitchRoot
            checked={checked}
            onCheckedChange={stableOnCheckedChange}
            disabled={disabled}
            name={name}
            value={value}
            required={required}
            $checked={checked}
          >
            <StableSwitchThumb />
          </StableSwitchRoot>
        </SwitchWrapper>
        
        {(stableLabel || stableDescription) && (
          <SwitchContent>
            {stableLabel && (
              <SwitchLabel data-disabled={disabled ? '' : undefined}>
                {stableLabel}
              </SwitchLabel>
            )}
            {stableDescription && (
              <SwitchDescription data-disabled={disabled ? '' : undefined}>
                {stableDescription}
              </SwitchDescription>
            )}
          </SwitchContent>
        )}
      </SwitchContainer>
    </EnhancedErrorBoundary>
  );
});

StableSwitch.displayName = 'StableSwitch';

// 导出类型
export type { StableSwitchProps };