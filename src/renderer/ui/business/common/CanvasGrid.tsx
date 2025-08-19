/**
 * 统一网格渲染组件
 * - 使用CanvasCoordinateContext进行坐标计算
 * - 支持1px精度的网格线
 * - 自动与标尺刻度对齐
 */

import React from 'react';
import styled from 'styled-components';
import { useCanvasGrid } from './CanvasCoordinateContext';

const GridContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  
  /* 网格背景 - 基于统一坐标系统 */
  ${({ theme }) => `
    background-image:
      linear-gradient(to right, ${theme.colors.canvas.grid} 1px, transparent 1px),
      linear-gradient(to bottom, ${theme.colors.canvas.grid} 1px, transparent 1px);
    background-size: var(--grid-size) var(--grid-size);
    background-position: var(--grid-offset-x) var(--grid-offset-y);
    background-repeat: repeat;
  `}
`;

export const CanvasGrid: React.FC = () => {
  const { shouldShowGrid, getGridSize, getGridOffset } = useCanvasGrid();
  
  // 计算网格样式变量
  const gridStyle = React.useMemo(() => {
    if (!shouldShowGrid()) return {};
    
    const { screen } = getGridSize();
    const offset = getGridOffset();
    
    return {
      '--grid-size': `${screen}px`,
      '--grid-offset-x': `${offset.x}px`,
      '--grid-offset-y': `${offset.y}px`
    } as React.CSSProperties;
  }, [shouldShowGrid, getGridSize, getGridOffset]);
  
  if (!shouldShowGrid()) return null;
  
  return (
    <GridContainer 
      style={gridStyle}
    />
  );
};

export default CanvasGrid;
