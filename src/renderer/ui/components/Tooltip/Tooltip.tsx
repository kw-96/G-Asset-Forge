import React from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

// const fadeIn = keyframes`
//   from {
//     opacity: 0;
//     transform: translateY(2px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// `;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
  }
`;

const TooltipContent = styled.div<{ $side: 'top' | 'right' | 'bottom' | 'left' }>`
  position: absolute;
  z-index: 9999;
  padding: 6px 8px;
  background: #1a202c;
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  
  /* 添加小箭头 */
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 4px solid transparent;
  }
  
  ${({ $side }) => {
    switch ($side) {
      case 'top':
        return `
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          
          &::after {
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: #1a202c;
          }
        `;
      case 'right':
        return `
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          
          &::after {
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: #1a202c;
          }
        `;
      case 'bottom':
        return `
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          
          &::after {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: #1a202c;
          }
        `;
      case 'left':
        return `
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          
          &::after {
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: #1a202c;
          }
        `;
      default:
        return '';
    }
  }}
`;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  disabled = false,
}) => {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipContainer>
      {children}
      <TooltipContent $side={side} className="tooltip-content">
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};
