/**
 * 缩放平移容器组件 - 直接使用Suika核心
 * - 提供缩放、平移功能
 * - 直接使用Suika核心的ViewportManager
 * - 支持鼠标滚轮缩放、拖拽平移、快捷键等交互
 */

import React, { useRef, useCallback, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika/core/editor';

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
const ZoomPanInteraction: React.FC<{ 
  enableShortcuts?: boolean; 
  editor?: SuikaEditor;
}> = ({ enableShortcuts = true, editor }) => {
  const isMouseDown = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });
  const interactionRef = useRef<HTMLDivElement>(null);
  
  // 直接使用Suika核心的状态
  // const zoom = editor?.viewportManager?.getZoom() || 1;
  const pan = editor?.viewportManager?.getPos() || { x: 0, y: 0 };

  // 处理滚轮缩放 - 直接使用Suika核心
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!editor?.viewportManager) return;
    
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 使用Suika核心的缩放方法
    if (e.deltaY > 0) {
      editor.viewportManager.zoomOut({ 
        center: { x: mouseX, y: mouseY },
        deltaY: e.deltaY 
      });
    } else {
      editor.viewportManager.zoomIn({ 
        center: { x: mouseX, y: mouseY },
        deltaY: e.deltaY 
      });
    }
  }, [editor]);

  // 处理鼠标按下 - 开始画布平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editor?.viewportManager) return;
    
    e.preventDefault();
    isMouseDown.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPan.current = { x: pan.x, y: pan.y };
    
    const target = e.currentTarget as HTMLElement;
    target.style.cursor = 'grabbing';
  }, [pan, editor]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown.current || !editor?.viewportManager) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    // 使用Suika核心的平移方法
    editor.viewportManager.translate(deltaX, deltaY);
    
    // 更新起始位置，避免累积误差
    startPos.current = { x: e.clientX, y: e.clientY };
  }, [editor]);
  
  const handleMouseUp = useCallback(() => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      
      const element = document.activeElement;
      if (element && element instanceof HTMLElement) {
        element.style.cursor = 'grab';
      }
    }
  }, []);
  
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
  
  // 快捷键支持 - 使用Suika核心
  useEffect(() => {
    if (!enableShortcuts || !editor?.viewportManager) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            editor.viewportManager.zoomIn();
            break;
          case '-':
            e.preventDefault();
            editor.viewportManager.zoomOut();
            break;
          case '0':
            e.preventDefault();
            editor.viewportManager.resetViewport();
            break;
          case '8':
            e.preventDefault();
            // 快捷键：直接跳转到8x缩放（网格显示级别）
            const center = editor.viewportManager.getPageSize();
            editor.viewportManager.setZoom(8, {
              x: center.width / 2,
              y: center.height / 2
            });
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, editor]);
  
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
  editor?: SuikaEditor; // Suika编辑器实例
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
  editor,
  canvasWidth,
  canvasHeight,
  className,
  overlay,
  enableShortcuts = true,
  mode = 'design',
  selectedObjects = []
}) => {
  return (
    <ZoomPanContent 
      editor={editor as SuikaEditor}
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
  );
};

// 内容组件
const ZoomPanContent: React.FC<{ 
  children: ReactNode; 
  editor?: SuikaEditor;
  className?: string; 
  overlay?: ReactNode; 
  enableShortcuts?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  mode?: 'design' | 'h5';
  selectedObjects?: any[];
}> = ({ 
  children, 
  editor,
  className, 
  overlay,
  enableShortcuts,
  canvasWidth,
  canvasHeight,
  mode = 'design',
  selectedObjects = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  
  // 直接使用Suika核心的状态
  const zoom = editor?.viewportManager?.getZoom() || 1;
  const pan = editor?.viewportManager?.getPos() || { x: 0, y: 0 };
  
  // 避免未使用变量警告
  void selectedObjects;
  
  // 监听Suika编辑器的状态变化
  useEffect(() => {
    if (!editor?.viewportManager) return;
    
    const handleViewMatrixChange = () => {
      forceUpdate({});
    };
    
    const handleZoomChange = () => {
      forceUpdate({});
    };
    
    editor.viewportManager.on('viewMatrixChange', handleViewMatrixChange);
    editor.viewportManager.on('zoomChange', handleZoomChange);
    
    return () => {
      editor.viewportManager.off('viewMatrixChange', handleViewMatrixChange);
      editor.viewportManager.off('zoomChange', handleZoomChange);
    };
  }, [editor]);
  
  // 监听容器尺寸变化并更新Suika编辑器
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor?.viewportManager) return;
    
    // 初始化尺寸
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      editor.viewportManager.setViewportSize({ width: rect.width, height: rect.height });
    };
    
    updateSize();
    
    // 使用ResizeObserver监听尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        editor.viewportManager.setViewportSize({ width, height });
      }
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.disconnect();
    };
  }, [editor]);
  
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
    editor?.setting?.get('enablePixelGrid') ? 'grid-visible' : 'grid-hidden',
    editor?.setting?.get('enableRuler') ? 'ruler-visible' : 'ruler-hidden',
    mode === 'design' ? 'design-mode' : 'h5-mode'
  ].filter(Boolean).join(' ');

  return (
    <Root {...rootProps} className={containerClassName}>
      <Inner $x={pan.x} $y={pan.y} $zoom={zoom}>
        {children}
      </Inner>
      {overlay && <OverlayContainer>{overlay}</OverlayContainer>}
      <ZoomPanInteraction enableShortcuts={enableShortcuts || true} editor={editor as SuikaEditor} />
    </Root>
  );
};

export default ZoomPanContainer;
