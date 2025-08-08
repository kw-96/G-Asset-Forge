import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { css, keyframes } from 'styled-components';
const getVariantColor = (variant) => {
    switch (variant) {
        case 'success':
            return css `${({ theme }) => theme.colors.success}`;
        case 'warning':
            return css `${({ theme }) => theme.colors.warning}`;
        case 'error':
            return css `${({ theme }) => theme.colors.error}`;
        case 'default':
        default:
            return css `${({ theme }) => theme.colors.primary}`;
    }
};
const getSizeStyles = (size) => {
    switch (size) {
        case 'sm':
            return css `
        height: 4px;
      `;
        case 'md':
            return css `
        height: 6px;
      `;
        case 'lg':
            return css `
        height: 8px;
      `;
        default:
            return css ``;
    }
};
const ProgressContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;
const ProgressHeader = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ProgressLabel = styled.span `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;
const ProgressValue = styled.span `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
const ProgressTrack = styled.div `
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default}40;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  
  ${({ $size }) => getSizeStyles($size)}
`;
const indeterminateAnimation = keyframes `
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;
const ProgressBar = styled.div `
  height: 100%;
  background: linear-gradient(90deg, ${({ $variant }) => getVariantColor($variant)}, ${({ $variant }) => getVariantColor($variant)}dd);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: inherit;
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  ${({ $indeterminate, $value }) => $indeterminate
    ? css `
          width: 50%;
          animation: ${indeterminateAnimation} 1.5s ease-in-out infinite;
        `
    : css `
          width: ${$value}%;
        `}
`;
export const Progress = ({ value = 0, variant = 'default', size = 'md', indeterminate = false, label, showValue = false, className, }) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    return (_jsxs(ProgressContainer, { className: className, children: [(label || showValue) && (_jsxs(ProgressHeader, { children: [label && _jsx(ProgressLabel, { children: label }), showValue && !indeterminate && (_jsxs(ProgressValue, { children: [Math.round(clampedValue), "%"] }))] })), _jsx(ProgressTrack, { "$size": size, children: _jsx(ProgressBar, { "$variant": variant, "$value": clampedValue, "$indeterminate": indeterminate }) })] }));
};
//# sourceMappingURL=Progress.js.map