/**
 * StableSlider组件 - 解决Radix UI Slider的useEffect依赖问题
 * 提供稳定的滑块输入功能，防止无限循环
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import styled from 'styled-components';
import { EnhancedErrorBoundary } from '../../../components/ErrorBoundary/EnhancedErrorBoundary';
import { reactLoopFixToolkit } from '../../../utils/ReactLoopFix';

interface StableSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  inverted?: boolean;
  showValue?: boolean;
}

// 样式组件
const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SliderLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SliderValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-variant-numeric: tabular-nums;
`;

const StableSliderRoot = styled(SliderPrimitive.Root)<{ $orientation: 'horizontal' | 'vertical' }>`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: ${({ $orientation }) => $orientation === 'horizontal' ? '100%' : '20px'};
  height: ${({ $orientation }) => $orientation === 'horizontal' ? '20px' : '200px'};
  flex-direction: ${({ $orientation }) => $orientation === 'horizontal' ? 'row' : 'column'};
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StableSliderTrack = styled(SliderPrimitive.Track)<{ $orientation: 'horizontal' | 'vertical' }>`
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  flex-grow: 1;
  height: ${({ $orientation }) => $orientation === 'horizontal' ? '4px' : '100%'};
  width: ${({ $orientation }) => $orientation === 'horizontal' ? '100%' : '4px'};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const StableSliderRange = styled(SliderPrimitive.Range)`
  position: absolute;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 100%;
  width: 100%;
`;

const StableSliderThumb = styled(SliderPrimitive.Thumb)`
  display: block;
  width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  &[data-disabled] {
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
`;

// 性能监控Hook
const useSliderPerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    // 检测异常渲染频率
    if (timeSinceLastRender < 16 && renderCountRef.current > 10) {
      reactLoopFixToolkit.debugLogger.warn(
        'slider-performance',
        `${componentName}组件渲染频率异常`,
        {
          renderCount: renderCountRef.current,
          timeSinceLastRender,
          componentName,
        },
        'StableSlider'
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

// 值变化防抖Hook
const useValueChangeDebounce = (
  onValueChange: (value: number[]) => void,
  delay: number = 16
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((newValue: number[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (onValueChange && typeof onValueChange === 'function') {
        try {
          onValueChange(newValue);
        } catch (error) {
          reactLoopFixToolkit.debugLogger.error(
            'slider-callback',
            'Slider值变更回调执行失败',
            { 
              error: error instanceof Error ? error.message : String(error),
              newValue,
            },
            'StableSlider'
          );
        }
      }
    }, delay);
  }, [onValueChange, delay]);
};

// 稳定的Slider组件
export const StableSlider: React.FC<StableSliderProps> = React.memo(({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  className,
  name,
  orientation = 'horizontal',
  inverted = false,
  showValue = false,
}) => {
  // 性能监控
  const renderCount = useSliderPerformanceMonitor('StableSlider');
  
  // 防抖的值变更回调
  const debouncedOnValueChange = useValueChangeDebounce(onValueChange);
  
  // 稳定化props
  const stableProps = useMemo(() => ({
    min,
    max,
    step,
    orientation,
    inverted,
  }), [min, max, step, orientation, inverted]);
  
  // 稳定化label
  const stableLabel = useMemo(() => label, [label]);
  
  // 稳定化value显示
  const displayValue = useMemo(() => {
    if (!showValue || !value || value.length === 0) return null;
    return value.length === 1 ? value[0] : `${value[0]} - ${value[value.length - 1]}`;
  }, [value, showValue]);
  
  // 记录组件使用情况
  useEffect(() => {
    reactLoopFixToolkit.debugLogger.info(
      'slider-lifecycle',
      'StableSlider组件挂载',
      { 
        renderCount, 
        disabled, 
        hasLabel: !!label,
        valueLength: value?.length || 0,
        orientation,
      },
      'StableSlider'
    );
    
    return () => {
      reactLoopFixToolkit.debugLogger.info(
        'slider-lifecycle',
        'StableSlider组件卸载',
        { renderCount },
        'StableSlider'
      );
    };
  }, []); // 空依赖数组，只在挂载和卸载时执行
  
  // 监控值变化
  useEffect(() => {
    reactLoopFixToolkit.debugLogger.debug(
      'slider-state',
      'Slider值变化',
      { value, disabled },
      'StableSlider'
    );
  }, [value, disabled]);
  
  return (
    <EnhancedErrorBoundary>
      <SliderContainer className={className}>
        {(stableLabel || showValue) && (
          <SliderHeader>
            {stableLabel && <SliderLabel>{stableLabel}</SliderLabel>}
            {showValue && displayValue !== null && (
              <SliderValue>{displayValue}</SliderValue>
            )}
          </SliderHeader>
        )}
        
        <StableSliderRoot
          value={value}
          onValueChange={debouncedOnValueChange}
          disabled={disabled}
          {...(name && { name })}
          $orientation={orientation}
          {...stableProps}
        >
          <StableSliderTrack $orientation={orientation}>
            <StableSliderRange />
          </StableSliderTrack>
          {value.map((_, index) => (
            <StableSliderThumb key={index} />
          ))}
        </StableSliderRoot>
      </SliderContainer>
    </EnhancedErrorBoundary>
  );
});

StableSlider.displayName = 'StableSlider';

// 导出类型
export type { StableSliderProps };