/**
 * 统一画布容器组件
 * - 整合网格、标尺、辅助线等功能
 * - 使用CanvasCoordinateContext进行统一管理
 * - 提供统一的缩放、平移、网格吸附等功能
 */

import React, { useRef, useEffect, useCallback, ReactNode } from 'react';
import styled from 'styled-components';
import { useCanvasCoordinate, useCanvasViewport } from './CanvasCoordinateContext';
import { CanvasCoordinateProvider } from './CanvasCoordinateProvider';
import { CanvasGrid } from './CanvasGrid';
import { CanvasRulers } from './CanvasRuler';

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.canvas.background};
`;

const CanvasContent = styled.div<{ $zoom: number; $panX: number; $panY: number }>`
  position: absolute;
  inset: 0;
  transform: ${({ $zoom, $panX, $panY }) => 
    `translate(${$panX}px, ${$panY}px) scale(${$zoom})`};
  transform-origin: 0 0;
  pointer-events: none;
`;

const InteractiveLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: auto;
  z-index: 10;
`;

interface CanvasContainerProps {
  children: ReactNode;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  initialGridSize?: number;
  initialShowGrid?: boolean;
  initialShowRuler?: boolean;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
}

// 内部画布组件
const CanvasContentComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { zoom, pan, setViewportSize } = useCanvasCoordinate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateViewportSize = () => {
      setViewportSize(container.clientWidth, container.clientHeight);
    };
    
    updateViewportSize();
    
    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [setViewportSize]);
  
  return (
    <CanvasContent
      ref={containerRef}
      $zoom={zoom}
      $panX={pan.x}
      $panY={pan.y}
    >
      {children}
    </CanvasContent>
  );
};

// 交互层组件
const CanvasInteractionLayer: React.FC = () => {
  const { zoom, pan, setZoom, setPan } = useCanvasViewport();
  const isMouseDown = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  
  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const dir = e.deltaY > 0 ? -1 : 1;
    const zoomStep = zoom >= 16 ? 0.05 : zoom >= 8 ? 0.1 : zoom >= 4 ? 0.15 : zoom >= 2 ? 0.2 : 0.25;
    const newZoom = Math.max(0.1, Math.min(32, zoom * (1 + dir * zoomStep)));
    
    // 以鼠标位置为中心缩放
    const safePrev = Math.max(zoom, 0.01);
    const ratio = newZoom / safePrev;
    const newPanX = mouseX - (mouseX - pan.x) * ratio;
    const newPanY = mouseY - (mouseY - pan.y) * ratio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan]);
  
  // 鼠标拖拽平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    isMouseDown.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
    
    const target = e.currentTarget as HTMLElement;
    target.style.cursor = 'grabbing';
  }, [pan]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown.current) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setPan({
      x: startPan.current.x + deltaX,
      y: startPan.current.y + deltaY
    });
  }, [setPan]);
  
  const handleMouseUp = useCallback(() => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      const element = document.activeElement as HTMLElement;
      if (element) {
        element.style.cursor = 'grab';
      }
    }
  }, []);
  
  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isMouseDown.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isMouseDown.current, handleMouseMove, handleMouseUp]);
  
  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            setZoom(Math.max(0.1, Math.min(32, zoom * 1.1)));
            break;
          case '-':
            e.preventDefault();
            setZoom(Math.max(0.1, Math.min(32, zoom * 0.9)));
            break;
          case '0':
            e.preventDefault();
            setZoom(1);
            setPan({ x: 0, y: 0 });
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, setZoom, setPan]);
  
  return (
    <InteractiveLayer
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'grab' }}
    >
      {/* 交互层内容 */}
    </InteractiveLayer>
  );
};

// 主画布容器组件
export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  initialGridSize = 1,
  initialShowGrid = true,
  initialShowRuler = true
}) => {
  return (
    <CanvasCoordinateProvider
      initialZoom={initialZoom}
      initialPan={initialPan}
      initialGridSize={initialGridSize}
      initialShowGrid={initialShowGrid}
      initialShowRuler={initialShowRuler}
    >
      <CanvasWrapper>
        {/* 标尺 - 动态尺寸 */}
        <CanvasRulers />
        
        {/* 网格 */}
        <CanvasGrid />
        
        {/* 画布内容 */}
        <CanvasContentComponent>
          {children}
        </CanvasContentComponent>
        
        {/* 交互层 */}
        <CanvasInteractionLayer />
      </CanvasWrapper>
    </CanvasCoordinateProvider>
  );
};

export default CanvasContainer;
