import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as SliderPrimitive from '@radix-ui/react-slider';
import styled from 'styled-components';
const SliderContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;
const SliderLabel = styled.label `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;
const SliderRoot = styled(SliderPrimitive.Root) `
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
const SliderTrack = styled(SliderPrimitive.Track) `
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  flex-grow: 1;
  height: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;
const SliderRange = styled(SliderPrimitive.Range) `
  position: absolute;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 100%;
`;
const SliderThumb = styled(SliderPrimitive.Thumb) `
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
export const Slider = ({ value, onValueChange, min = 0, max = 100, step = 1, disabled = false, label, className, }) => {
    return (_jsxs(SliderContainer, { className: className, children: [label && _jsx(SliderLabel, { children: label }), _jsxs(SliderRoot, { value: value, onValueChange: onValueChange, min: min, max: max, step: step, disabled: disabled, children: [_jsx(SliderTrack, { children: _jsx(SliderRange, {}) }), _jsx(SliderThumb, {})] })] }));
};
//# sourceMappingURL=Slider.js.map