/**
 * 缩放平移容器组件 - 使用统一坐标系统
 * - 提供缩放、平移功能
 * - 使用统一的坐标系统进行所有计算
 * - 支持鼠标滚轮缩放、拖拽平移、快捷键等交互
 */

import React, { useRef, useCallback, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { CanvasCoordinateProvider } from '../common/CanvasCoordinateProvider';
import { useCanvasCoordinate } from '../common/CanvasCoordinateContext';
import { CanvasDisplayProvider, useCanvasDisplay } from '../common/CanvasDisplayContext';
import { SuikaGridAdapter } from './SuikaGridAdapter';
import { SuikaRulerAdapter } from './SuikaRulerAdapter';
import { SuikaRefLineAdapter } from './SuikaRefLineAdapter';

// 根容器 - 需要与画布尺寸匹配
const Root = styled.div<{ $canvasWidth?: number; $canvasHeight?: number }>`
  position: relative;
  width: ${({ $canvasWidth }) => $canvasWidth ? `${$canvasWidth}px` : '100%'};
  height: ${({ $canvasWidth, $canvasHeight }) => $canvasWidth && $canvasHeight ? `${$canvasHeight}px` : '100%'};
  flex: ${({ $canvasWidth, $canvasHeight }) => ($canvasWidth && $canvasHeight) ? 'none' : '1'};
  min-height: 0;
  overflow: hidden;
  cursor: grab;
  
  /* 强制样式 - 确保容器自适应 */
  ${({ $canvasWidth, $canvasHeight }) => !$canvasWidth && !$canvasHeight && `
    height: 100% !important;
    flex: 1 !important;
    min-height: 0 !important;
  `}
  
  /* 只对网格Canvas强制尺寸，标尺Canvas保持自己的尺寸 */
  & > canvas[data-type="grid"] {
    width: 100% !important;
    height: 100% !important;
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

  // 处理滚轮缩放（混合策略：动态算法 + 实用调整）
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 改进的缩放算法：解决无法达到8x的问题
    const getZoomStep = (deltaY: number, currentZoom: number) => {
      // 调试信息：记录缩放过程
      if (process.env['NODE_ENV'] === 'development') {
        // console.log(`🔍 缩放调试 - 当前: ${currentZoom.toFixed(2)}x, deltaY: ${deltaY}, 目标: 8.0x`);
      }
      
      // 简化且更有效的缩放步长算法
      let zoomStep: number;
      
      // 根据当前缩放级别动态调整步长，确保能够达到8x
      if (currentZoom < 2) {
        zoomStep = 0.4; // 低缩放时使用较大步长快速接近
      } else if (currentZoom < 4) {
        zoomStep = 0.3; // 中等缩放时使用中等步长
      } else if (currentZoom < 8) {
        zoomStep = 0.25; // 接近8x时使用较大步长确保能达到
      } else if (currentZoom < 16) {
        zoomStep = 0.2; // 高缩放时使用精确控制
      } else {
        zoomStep = 0.15; // 超高缩放时使用小步长
      }
      
      // 根据滚轮速度微调（保持Suika的响应性）
      const speedFactor = Math.min(Math.abs(deltaY) / 100, 1.5);
      zoomStep *= speedFactor;
      
      // 确保最小步长，避免无法缩放
      zoomStep = Math.max(zoomStep, 0.1);
      
      if (process.env['NODE_ENV'] === 'development') {
        // console.log(`🎯 计算步长: ${zoomStep.toFixed(3)}, 速度因子: ${speedFactor.toFixed(2)}`);
      }
      
      return zoomStep;
    };
    
    const zoomStep = getZoomStep(e.deltaY, zoom);
    const newZoom = e.deltaY > 0 
      ? Math.max(0.1, zoom / (1 + zoomStep))  // 缩小
      : Math.min(32, zoom * (1 + zoomStep));  // 放大
    
    // 调试信息：记录缩放结果
    if (process.env['NODE_ENV'] === 'development') {
      // console.log(`📈 缩放结果: ${zoom.toFixed(2)}x → ${newZoom.toFixed(2)}x ${newZoom >= 8 ? '✅ 网格可显示' : '❌ 网格隐藏'}`);
      
      // 特殊检查：是否达到8x
      if (zoom < 8 && newZoom >= 8) {
        // console.log('🎉 已达到8x缩放级别！网格应该显示了！');
      }
    }
    
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
            // 参考Suika的默认缩放步长
            setZoom(Math.max(0.1, Math.min(32, zoom * (1 + 0.2325))));
            break;
          case '-':
            e.preventDefault();
            // 参考Suika的默认缩放步长
            setZoom(Math.max(0.1, Math.min(32, zoom / (1 + 0.2325))));
            break;
          case '0':
            e.preventDefault();
            setZoom(1);
            setPan({ x: 0, y: 0 }); // 无限画布：支持任意pan值
            break;
          case '8':
            e.preventDefault();
            // 快捷键：直接跳转到8x缩放（网格显示级别）
            setZoom(8);
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
  initialShowGuides?: boolean;
  canvasWidth?: number; // 画布宽度
  canvasHeight?: number; // 画布高度
  className?: string;
  overlay?: ReactNode;
  enableShortcuts?: boolean;
  mode?: 'design' | 'h5'; // 编辑器模式
  selectedObjects?: any[]; // 选中的对象，用于参考线系统
}

// 主缩放平移容器组件
export const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({
  children,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  initialGridSize = 1,
  initialShowGrid = true,
  initialShowRuler = true,
  initialShowGuides = true,
  canvasWidth,
  canvasHeight,
  className,
  overlay,
  enableShortcuts = true,
  mode = 'design',
  selectedObjects = []
}) => {
  return (
    <CanvasDisplayProvider
      initialState={{
        showGrid: initialShowGrid,
        showRuler: initialShowRuler,
        showGuides: initialShowGuides
      }}
    >
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
          mode={mode}
          selectedObjects={selectedObjects}
          {...(canvasWidth !== undefined && { canvasWidth })}
          {...(canvasHeight !== undefined && { canvasHeight })}
        >
          {children}
        </ZoomPanContent>
      </CanvasCoordinateProvider>
    </CanvasDisplayProvider>
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
  mode?: 'design' | 'h5';
  selectedObjects?: any[];
}> = ({ 
  children, 
  className, 
  overlay,
  enableShortcuts,
  canvasWidth,
  canvasHeight,
  mode = 'design',
  selectedObjects = []
}) => {
  const { zoom, pan, setViewportSize } = useCanvasCoordinate();
  const { displayState } = useCanvasDisplay();
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
    ...(typeof canvasWidth === 'number' && { $canvasWidth: canvasWidth }),
    ...(typeof canvasHeight === 'number' && { $canvasHeight: canvasHeight })
  };

  // 动态className，包含状态信息
  const containerClassName = [
    className || '',
    'suika-container',
    displayState.showGrid ? 'grid-visible' : 'grid-hidden',
    displayState.showRuler ? 'ruler-visible' : 'ruler-hidden',
    displayState.showGuides ? 'guides-visible' : 'guides-hidden',
    mode === 'design' ? 'design-mode' : 'h5-mode'
  ].filter(Boolean).join(' ');

  return (
    <Root {...rootProps} className={containerClassName}>
      {/* 网格渲染 - 仅在设计模式下显示 */}
      {mode === 'design' && displayState.showGrid && <SuikaGridAdapter minZoomThreshold={8} />}
      
      {/* 标尺系统 - 在设计模式和H5模式中都显示 */}
      <SuikaRulerAdapter visible={displayState.showRuler} mode={mode} />
      
      {/* 参考线系统 - 在设计模式和H5模式中都显示 */}
      <SuikaRefLineAdapter 
        visible={displayState.showGuides} 
        mode={mode} 
        selectedObjects={selectedObjects}
      />
      
      <Inner $x={pan.x} $y={pan.y} $zoom={zoom}>
        {children}
      </Inner>
      {overlay && <OverlayContainer>{overlay}</OverlayContainer>}
      <ZoomPanInteraction enableShortcuts={enableShortcuts || true} />
    </Root>
  );
};

export default ZoomPanContainer;
