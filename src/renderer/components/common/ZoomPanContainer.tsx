/**
 * 通用缩放/平移容器（仅包裹子内容，不干扰子组件内部逻辑）
 * - 鼠标滚轮：以光标为中心缩放，步进10%
 * - 鼠标左键拖拽：平移视图
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ZoomPanContext } from './ZoomPanContext';

export interface ZoomPanContainerProps {
  minZoom?: number; // 最小缩放倍数，默认0.5
  maxZoom?: number; // 最大缩放倍数，默认3
  zoomStep?: number; // 每次缩放的比例步进（0.1=10%），默认0.1
  className?: string;
  // 允许外部传className做样式，不建议直接传style
  children: React.ReactNode;
  enableShortcuts?: boolean; // 启用 Ctrl/Cmd +/-/0 快捷键
  overlay?: React.ReactNode; // 不随缩放的覆盖层（如标尺/辅助线）
}

const Root = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const Inner = styled.div<{ $x: number; $y: number; $zoom: number }>`
  width: 100%;
  height: 100%;
  transform: ${({ $x, $y, $zoom }) => `translate(${$x}px, ${$y}px) scale(${$zoom})`};
  transform-origin: 0 0;
`;

const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none; // Allow clicks to pass through to content below
  z-index: 10; // Ensure it's above the main content
`;

export const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.1,
  className,
  children,
  enableShortcuts = false,
  overlay
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dir = e.deltaY > 0 ? -1 : 1;
    const next = Math.max(minZoom, Math.min(maxZoom, zoom * (1 + dir * zoomStep)));
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const safePrev = Math.max(zoom, 0.01);
    const ratio = next / safePrev;
    setPan(prev => ({ x: mouseX - (mouseX - prev.x) * ratio, y: mouseY - (mouseY - prev.y) * ratio }));
    setZoom(next);
  }, [zoom, minZoom, maxZoom, zoomStep]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const start = { x: e.clientX, y: e.clientY };
    const startPan = { ...pan };
    const onMove = (ev: MouseEvent) => {
      setPan({ x: startPan.x + (ev.clientX - start.x), y: startPan.y + (ev.clientY - start.y) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pan]);

  // 快捷键
  useEffect(() => {
    if (!enableShortcuts) return;
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (['+', '=', '-','0'].includes(e.key)) e.preventDefault();
      if (e.key === '+' || e.key === '=') onWheel({ preventDefault(){}, deltaY: -1, clientX: (rootRef.current?.getBoundingClientRect().left || 0) + 1, clientY: (rootRef.current?.getBoundingClientRect().top || 0) + 1 } as any);
      if (e.key === '-') onWheel({ preventDefault(){}, deltaY: 1, clientX: (rootRef.current?.getBoundingClientRect().left || 0) + 1, clientY: (rootRef.current?.getBoundingClientRect().top || 0) + 1 } as any);
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableShortcuts, onWheel]);

  return (
    <ZoomPanContext.Provider value={{ zoom, pan }}>
      <Root ref={rootRef} className={className} onWheel={onWheel} onMouseDown={onMouseDown}>
        <Inner $x={pan.x} $y={pan.y} $zoom={zoom}>{children}</Inner>
        {overlay && <OverlayContainer>{overlay}</OverlayContainer>}
      </Root>
    </ZoomPanContext.Provider>
  );
};

export default ZoomPanContainer;


