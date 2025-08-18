/**
 * 统一标尺与辅助线组件（依赖 ZoomPanContext 获取平移/缩放）
 * - 顶部和左侧 20px 标尺
 * - 展示当前缩放影响下的刻度
 * - 简化版辅助线（以百分比表达位置）
 */
import React from 'react';
import styled from 'styled-components';
import { useZoomPan } from './ZoomPanContext';
import { canvasEvents } from '../../../logic/utils/events/canvasEvents';
import { useCanvasStore } from '../../../stores/canvasStore';

const RULER_SIZE = 20;

const Wrapper = styled.div<{ $showGrid: boolean; $gridSize: number; $zoom: number; $panX: number; $panY: number }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1; /* 降低z-index，确保不会覆盖其他内容 */
  
  /* 网格背景 - 在外部控制模式下显示 */
  ${({ $showGrid, theme, $gridSize, $zoom, $panX, $panY }) => {
    if (!$showGrid) return '';

    const gridColor = theme.colors.canvas.grid;
    const baseGrid = Math.max(10, $gridSize || 20);
    const gridSizePx = Math.max(2, baseGrid * $zoom);

    // 计算网格偏移，确保网格与标尺对齐（1=1px）
    const offsetX = $panX % gridSizePx;
    const offsetY = $panY % gridSizePx;

    // 调试信息
    if (process.env['NODE_ENV'] === 'development') {
      console.debug('Grid CSS (1=1px):', {
        showGrid: $showGrid,
        gridColor,
        baseGrid,
        gridSizePx,
        offsetX,
        offsetY,
        zoom: $zoom,
        panX: $panX,
        panY: $panY,
        worldGridSize: baseGrid, // 世界坐标中的网格大小
        screenGridSize: gridSizePx // 屏幕坐标中的网格大小
      });
    }

    return `
      background-image:
        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px);
      background-size: ${gridSizePx}px ${gridSizePx}px;
      background-position: ${offsetX}px ${offsetY}px;
      background-repeat: repeat;
    `;
  }}
`;

const RulerTop = styled.canvas<{ $showRuler: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ $showRuler }) => ($showRuler ? RULER_SIZE : 0)}px;
  right: 0;
  height: ${RULER_SIZE}px;
  width: calc(100% - ${({ $showRuler }) => ($showRuler ? RULER_SIZE : 0)}px);
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: ${({ $showRuler }) => ($showRuler ? 'block' : 'none')};
  pointer-events: ${({ $showRuler }) => ($showRuler ? 'auto' : 'none')};
  z-index: 20; /* 确保标尺在网格之上 */
`;

const RulerLeft = styled.canvas<{ $showRuler: boolean }>`
  position: absolute;
  top: ${({ $showRuler }) => ($showRuler ? RULER_SIZE : 0)}px;
  left: 0;
  bottom: 0;
  width: ${RULER_SIZE}px;
  height: calc(100% - ${({ $showRuler }) => ($showRuler ? RULER_SIZE : 0)}px);
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: ${({ $showRuler }) => ($showRuler ? 'block' : 'none')};
  pointer-events: ${({ $showRuler }) => ($showRuler ? 'auto' : 'none')};
  z-index: 20; /* 确保标尺在网格之上 */
`;

const Corner = styled.div<{ $showRuler: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${RULER_SIZE}px;
  height: ${RULER_SIZE}px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: ${({ $showRuler }) => ($showRuler ? 'block' : 'none')};
  pointer-events: ${({ $showRuler }) => ($showRuler ? 'auto' : 'none')};
  z-index: 20; /* 确保标尺在网格之上 */
`;

type Guide = { id: string; type: 'horizontal' | 'vertical'; position: number };

interface RulerGuidesProps {
  mode?: 'design' | 'h5';
}

export const RulerGuides: React.FC<RulerGuidesProps> = ({ mode = 'design' }) => {
  const { zoom, pan } = useZoomPan();
  const topRef = React.useRef<HTMLCanvasElement>(null);
  const leftRef = React.useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = React.useState(true); // 辅助线显隐

  // 从canvasStore获取标尺和网格显示状态，确保与全局状态同步
  const showRuler = useCanvasStore(s => s.showRuler);
  const showGrid = useCanvasStore(s => s.showGrid);
  const gridSize = useCanvasStore(s => s.gridSize);
  const [guides, setGuides] = React.useState<Guide[]>([]);
  const draggingRef = React.useRef<{ id: string; type: 'horizontal' | 'vertical' } | null>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

  // 调试信息
  React.useEffect(() => {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug('RulerGuides render:', {
        mode,
        showRuler,
        showGrid: mode === 'design' && showGrid,
        gridSize,
        zoom,
        pan
      });
    }
  }, [mode, showRuler, showGrid, gridSize, zoom, pan]);

  // 监听容器尺寸变化
  React.useEffect(() => {
    const wrapper = topRef.current?.parentElement;
    if (!wrapper) return;

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    // 初始更新
    updateSize();

    // 使用ResizeObserver监听尺寸变化
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 重绘刻度
  React.useEffect(() => {
    const drawRulers = () => {
      const top = topRef.current;
      const left = leftRef.current;
      if (!top || !left) return;

    // 顶部
    const topWidth = top.clientWidth;
    const topHeight = top.clientHeight;
    
    if (process.env['NODE_ENV'] === 'development') {
      console.debug('Ruler top canvas size:', { topWidth, topHeight });
    }
    
    if (topWidth === 0 || topHeight === 0) {
      console.warn('Ruler top canvas has zero size, skipping render');
      return;
    }
    
    top.width = topWidth * devicePixelRatio;
    top.height = topHeight * devicePixelRatio;
    const tctx = top.getContext('2d');
    if (tctx) {
      tctx.scale(devicePixelRatio, devicePixelRatio);
      tctx.clearRect(0, 0, top.clientWidth, top.clientHeight);
      tctx.fillStyle = '#6b7280'; // 更深的颜色，确保可见性
      tctx.strokeStyle = '#6b7280';
      tctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      // 使用与网格相同的计算逻辑，确保1=1px对应
      const baseGrid = Math.max(10, gridSize || 20);
      const gridSizePx = Math.max(2, baseGrid * zoom);
      
      // 计算合适的标尺刻度间距
      let rulerStep = gridSizePx;
      
      // 如果网格太密集，使用网格的倍数作为标尺间距
      if (gridSizePx < 20) {
        const multiplier = Math.ceil(20 / gridSizePx);
        rulerStep = gridSizePx * multiplier;
      }
      
      if (process.env['NODE_ENV'] === 'development') {
        console.debug('Ruler horizontal (1=1px):', {
          baseGrid,
          gridSizePx,
          rulerStep,
          zoom,
          panX: pan.x
        });
      }
      
      const offset = pan.x % rulerStep;
      for (let x = -offset; x < top.clientWidth; x += rulerStep) {
        // 绘制刻度线
        const isMajor = Math.abs(x % (rulerStep * 5)) < 1;
        const tickHeight = isMajor ? 8 : 4;
        tctx.fillRect(x, RULER_SIZE - tickHeight, 1, tickHeight);
        
        // 计算世界坐标（确保1=1px）
        const worldX = Math.round((x - pan.x) / zoom);
        
        // 只在主要刻度上显示数字
        if (isMajor) {
          tctx.fillText(`${worldX}`, x + 2, RULER_SIZE - 2);
        }
      }
    }

    // 左侧
    const leftWidth = left.clientWidth;
    const leftHeight = left.clientHeight;
    
    if (process.env['NODE_ENV'] === 'development') {
      console.debug('Ruler left canvas size:', { leftWidth, leftHeight });
    }
    
    if (leftWidth === 0 || leftHeight === 0) {
      console.warn('Ruler left canvas has zero size, skipping render');
      return;
    }
    
    left.width = leftWidth * devicePixelRatio;
    left.height = leftHeight * devicePixelRatio;
    const lctx = left.getContext('2d');
    if (lctx) {
      lctx.scale(devicePixelRatio, devicePixelRatio);
      lctx.clearRect(0, 0, left.clientWidth, left.clientHeight);
      lctx.fillStyle = '#6b7280'; // 更深的颜色，确保可见性
      lctx.strokeStyle = '#6b7280';
      lctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      // 使用与网格相同的计算逻辑，确保1=1px对应
      const baseGrid = Math.max(10, gridSize || 20);
      const gridSizePx = Math.max(2, baseGrid * zoom);
      
      // 计算合适的标尺刻度间距
      let rulerStep = gridSizePx;
      
      // 如果网格太密集，使用网格的倍数作为标尺间距
      if (gridSizePx < 20) {
        const multiplier = Math.ceil(20 / gridSizePx);
        rulerStep = gridSizePx * multiplier;
      }
      
      if (process.env['NODE_ENV'] === 'development') {
        console.debug('Ruler vertical (1=1px):', {
          baseGrid,
          gridSizePx,
          rulerStep,
          zoom,
          panY: pan.y
        });
      }
      
      const offset = pan.y % rulerStep;
      for (let y = -offset; y < left.clientHeight; y += rulerStep) {
        // 绘制刻度线
        const isMajor = Math.abs(y % (rulerStep * 5)) < 1;
        const tickWidth = isMajor ? 8 : 4;
        lctx.fillRect(RULER_SIZE - tickWidth, y, tickWidth, 1);
        
        // 计算世界坐标（确保1=1px）
        const worldY = Math.round((y - pan.y) / zoom);
        
        // 只在主要刻度上显示数字
        if (isMajor) {
          lctx.save();
          lctx.translate(2, y + 3);
          lctx.rotate(-Math.PI / 2);
          lctx.fillText(`${worldY}`, 0, 0);
          lctx.restore();
        }
      }
    }
    // 绘制辅助线覆盖层
    const overlay = top.parentElement as HTMLElement;
    const cvs = document.createElement('canvas');
    cvs.style.position = 'absolute';
    cvs.style.inset = '0';
    cvs.style.pointerEvents = 'none';
    overlay.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    (window as any).__guidesX = guides
      .filter(g => g.type === 'vertical')
      .map(g => Math.round(g.position * zoom + pan.x));
    (window as any).__guidesY = guides
      .filter(g => g.type === 'horizontal')
      .map(g => Math.round(g.position * zoom + pan.y));

    const drawGuides = () => {
      cvs.width = overlay.clientWidth * devicePixelRatio;
      cvs.height = overlay.clientHeight * devicePixelRatio;
      if (!ctx) return;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, overlay.clientWidth, overlay.clientHeight);
      if (!visible) return;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      guides.forEach(g => {
        if (g.type === 'vertical') {
          const x = Math.round(g.position * zoom + pan.x) + 0.5;
          const topOffset = showRuler ? RULER_SIZE : 0;
          ctx.beginPath(); ctx.moveTo(x, topOffset); ctx.lineTo(x, overlay.clientHeight); ctx.stroke();
        } else {
          const y = Math.round(g.position * zoom + pan.y) + 0.5;
          const leftOffset = showRuler ? RULER_SIZE : 0;
          ctx.beginPath(); ctx.moveTo(leftOffset, y); ctx.lineTo(overlay.clientWidth, y); ctx.stroke();
        }
      });
    };
    drawGuides();

      return () => { overlay.removeChild(cvs); };
    };

    // 立即绘制
    drawRulers();

    // 添加延迟重绘，确保容器尺寸已经确定
    const timeoutId = setTimeout(drawRulers, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [zoom, pan.x, pan.y, guides, visible, showRuler, containerSize]);

  // 显隐与增删改事件
  React.useEffect(() => {
    const offToggleGuides = canvasEvents.on('toggleGuides', () => setVisible(v => !v));
    // 标尺显隐通过canvasStore管理，不需要本地状态
    const offAdd = canvasEvents.on('addGuide', (data: { type: 'horizontal' | 'vertical'; position: number }) => setGuides(prev => [...prev, { id: `${Date.now()}`, type: data.type, position: data.position }]));
    const offMove = canvasEvents.on('moveGuide', (data: { id: string; position: number }) => setGuides(prev => prev.map(g => g.id === data.id ? { ...g, position: data.position } : g)));
    const offRemove = canvasEvents.on('removeGuide', (data: { id: string }) => setGuides(prev => prev.filter(g => g.id !== data.id)));
    return () => {
      canvasEvents.off('toggleGuides', offToggleGuides as any);
      canvasEvents.off('addGuide', offAdd as any);
      canvasEvents.off('moveGuide', offMove as any);
      canvasEvents.off('removeGuide', offRemove as any);
    };
  }, []);

  // 从标尺拖拽创建并移动
  React.useEffect(() => {
    const wrapper = topRef.current?.parentElement as HTMLElement | null;
    if (!wrapper) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!showRuler) return; // 隐藏标尺时不允许从标尺拖拽创建
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (y <= RULER_SIZE && x >= RULER_SIZE) {
        const world = (x - pan.x) / zoom; const id = `${Date.now()}`;
        setGuides(prev => [...prev, { id, type: 'vertical', position: world }]);
        draggingRef.current = { id, type: 'vertical' };
      } else if (x <= RULER_SIZE && y >= RULER_SIZE) {
        const world = (y - pan.y) / zoom; const id = `${Date.now()}`;
        setGuides(prev => [...prev, { id, type: 'horizontal', position: world }]);
        draggingRef.current = { id, type: 'horizontal' };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      const g = draggingRef.current;
      if (g.type === 'vertical') {
        const world = (x - pan.x) / zoom;
        setGuides(prev => prev.map(it => it.id === g.id ? { ...it, position: world } : it));
      } else {
        const world = (y - pan.y) / zoom;
        setGuides(prev => prev.map(it => it.id === g.id ? { ...it, position: world } : it));
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      // 拖拽结束时，如果辅助线被拖回标尺区域则删除
      if (draggingRef.current) {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = draggingRef.current.id;
        const rulerTop = showRuler ? RULER_SIZE : 0;
        const rulerLeft = showRuler ? RULER_SIZE : 0;
        if ((showRuler && (y <= rulerTop || x <= rulerLeft))) {
          setGuides(prev => prev.filter(g => g.id !== id));
        }
      }
      draggingRef.current = null;
    };
    wrapper.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      wrapper.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [zoom, pan.x, pan.y, showRuler]);

  return (
    <Wrapper
      $showGrid={mode === 'design' && showGrid} // 只在设计模式下显示网格
      $gridSize={gridSize}
      $zoom={zoom}
      $panX={pan.x}
      $panY={pan.y}
    >
      <Corner $showRuler={showRuler} />
      <RulerTop ref={topRef} $showRuler={showRuler} />
      <RulerLeft ref={leftRef} $showRuler={showRuler} />
    </Wrapper>
  );
};

export default RulerGuides;


