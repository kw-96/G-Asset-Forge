/**
 * 缩放平移容器组件 - 使用统一坐标系统
 * - 提供缩放、平移功能
 * - 使用统一的坐标系统进行所有计算
 * - 支持鼠标滚轮缩放、拖拽平移、快捷键等交互
 */

import React, { useRef, useCallback, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { CanvasCoordinateProvider } from './CanvasCoordinateProvider';
import { useCanvasCoordinate } from './CanvasCoordinateContext';
import { CanvasGrid } from './CanvasGrid';

// 根容器 - 需要与画布尺寸匹配
const Root = styled.div<{ $canvasWidth?: number; $canvasHeight?: number }>`
  position: relative;
  width: ${({ $canvasWidth }) => $canvasWidth ? `${$canvasWidth}px` : '100%'};
  height: ${({ $canvasHeight }) => $canvasHeight ? `${$canvasHeight}px` : '100%'};
  flex: ${({ $canvasWidth, $canvasHeight }) => ($canvasWidth && $canvasHeight) ? 'none' : '1'};
  min-height: 0; /* 确保flex子元素能够正确收缩 */
  overflow: hidden;
  cursor: grab;
  
  /* 强制样式 - 确保容器自适应 */
  ${({ $canvasWidth, $canvasHeight }) => !$canvasWidth && !$canvasHeight && `
    height: 100% !important;
    flex: 1 !important;
    min-height: 0 !important;
  `}
  
  &:active {
    cursor: grabbing;
  }
`;

// 内容容器
const Inner = styled.div<{ $x: number; $y: number; $zoom: number }>`
  position: absolute;
  // inset: 0;
  transform: ${({ $x, $y, $zoom }) => `translate(${$x}px, ${$y}px) scale(${$zoom})`};
  transform-origin: 0 0;
  pointer-events: none;
`;

// 覆盖层容器
const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
`;

// 交互层
const InteractionLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: auto;
  z-index: 50;
  background: transparent !important; /* 确保没有背景色 */
`;

// 缩放平移交互组件
const ZoomPanInteraction: React.FC<{ enableShortcuts?: boolean }> = ({ enableShortcuts = true }) => {
  const { zoom, pan, setZoom, setPan, canStartDrag, setDragMode } = useCanvasCoordinate();
  const isMouseDown = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const interactionRef = useRef<HTMLDivElement>(null);

  // 处理滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(32, zoom * delta));
    
    // 计算新的平移位置，保持鼠标位置不变
    const scaleFactor = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * scaleFactor;
    const newPanY = mouseY - (mouseY - pan.y) * scaleFactor;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan]);

  // 处理鼠标按下 - 开始画布平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 检查是否可以开始画布平移拖拽
    if (!canStartDrag('canvas-pan')) return;
    
    e.preventDefault();
    isMouseDown.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { x: pan.x, y: pan.y };
    
    // 设置拖拽模式
    setDragMode('canvas-pan');
    
    const target = e.currentTarget as HTMLElement;
    target.style.cursor = 'grabbing';
  }, [pan, canStartDrag, setDragMode]);
  
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
      // 重置拖拽模式
      setDragMode('none');
      
      const element = document.activeElement;
      if (element && element instanceof HTMLElement) {
        element.style.cursor = 'grab';
      }
    }
  }, [setDragMode]);
  
  // 添加滚轮事件监听器 - 设置passive: false以支持preventDefault
  useEffect(() => {
    const element = interactionRef.current;
    if (!element) return;
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

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
    if (!enableShortcuts) return;
    
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
  }, [zoom, setZoom, setPan, enableShortcuts]);
  
  return (
    <InteractionLayer
      ref={interactionRef}
      onMouseDown={handleMouseDown}
    />
  );
};

// 主组件接口
export interface ZoomPanContainerProps {
  children: ReactNode;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  initialGridSize?: number;
  initialShowGrid?: boolean;
  initialShowRuler?: boolean;
  canvasWidth?: number; // 画布宽度
  canvasHeight?: number; // 画布高度
  className?: string;
  overlay?: ReactNode;
  enableShortcuts?: boolean;
}

// 主缩放平移容器组件
export const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({
  children,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  initialGridSize = 1,
  initialShowGrid = true,
  initialShowRuler = true,
  canvasWidth,
  canvasHeight,
  className,
  overlay,
  enableShortcuts = true
}) => {
  return (
    <CanvasCoordinateProvider
      initialZoom={initialZoom}
      initialPan={initialPan}
      initialGridSize={initialGridSize}
      initialShowGrid={initialShowGrid}
      initialShowRuler={initialShowRuler}
    >
      <ZoomPanContent 
        className={className || ''} 
        overlay={overlay} 
        enableShortcuts={enableShortcuts}
        {...(canvasWidth !== undefined && { canvasWidth })}
        {...(canvasHeight !== undefined && { canvasHeight })}
      >
        {children}
      </ZoomPanContent>
    </CanvasCoordinateProvider>
  );
};

// 内容组件
const ZoomPanContent: React.FC<{ 
  children: ReactNode; 
  className?: string; 
  overlay?: ReactNode; 
  enableShortcuts?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}> = ({ 
  children, 
  className, 
  overlay,
  enableShortcuts,
  canvasWidth,
  canvasHeight
}) => {
  const { zoom, pan, setViewportSize } = useCanvasCoordinate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // 初始化尺寸
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setViewportSize(rect.width, rect.height);
    };
    
    updateSize();
    
    // 使用ResizeObserver监听尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setViewportSize(width, height);
      }
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.disconnect();
    };
  }, [setViewportSize]);
  
  // 构建props对象，只有当值存在时才添加
  const rootProps = {
    ref: containerRef,
    className: className || '',
    ...(typeof canvasWidth === 'number' && { $canvasWidth: canvasWidth }),
    ...(typeof canvasHeight === 'number' && { $canvasHeight: canvasHeight })
  };

  return (
    <Root {...rootProps}>
      {/* 网格渲染 */}
      <CanvasGrid />
      
      <Inner $x={pan.x} $y={pan.y} $zoom={zoom}>
        {children}
      </Inner>
      {overlay && <OverlayContainer>{overlay}</OverlayContainer>}
      <ZoomPanInteraction enableShortcuts={enableShortcuts || true} />
    </Root>
  );
};

export default ZoomPanContainer;


