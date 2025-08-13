/**
 * Slider组件 - 基于Radix UI和Figma UI3设计系统
 * 提供可访问的滑块输入功能
 */

import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import styled from 'styled-components';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SliderLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SliderRoot = styled(SliderPrimitive.Root)`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: 100%;
  height: 20px;
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SliderTrack = styled(SliderPrimitive.Track)`
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  flex-grow: 1;
  height: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const SliderRange = styled(SliderPrimitive.Range)`
  position: absolute;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 100%;
`;

const SliderThumb = styled(SliderPrimitive.Thumb)`
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

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  className,
}) => {
  return (
    <SliderContainer className={className}>
      {label && <SliderLabel>{label}</SliderLabel>}
      <SliderRoot
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </SliderRoot>
    </SliderContainer>
  );
};