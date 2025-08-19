/**
 * 标尺和辅助线组件 - 使用统一坐标系统
 * - 渲染标尺、网格、辅助线
 * - 使用统一的坐标系统进行所有计算
 * - 支持1px精度的网格线和标尺刻度
 * - 辅助线已集成到统一坐标系统中
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useCanvasCoordinate } from './CanvasCoordinateContext';

// 标尺尺寸
const RULER_SIZE = 20;

// 标尺容器
const RulerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

// 水平标尺
const HorizontalRuler = styled.div`
  position: absolute;
  top: 0;
  left: ${RULER_SIZE}px;
  right: 0;
  height: ${RULER_SIZE}px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

// 垂直标尺
const VerticalRuler = styled.div`
  position: absolute;
  top: ${RULER_SIZE}px;
  left: 0;
  bottom: 0;
  width: ${RULER_SIZE}px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
`;

// 标尺角落
const RulerCorner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${RULER_SIZE}px;
  height: ${RULER_SIZE}px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
`;

// 网格渲染已移至CanvasGrid组件

// 辅助线容器
const GuideContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
`;

// 辅助线
const GuideLine = styled.div<{ $orientation: 'vertical' | 'horizontal'; $position: number; $active?: boolean }>`
  position: absolute;
  background: ${({ $active }) => ($active ? '#ef4444' : '#4f46e5')};
  opacity: 0.7;
  pointer-events: auto;
  cursor: ${({ $orientation }) => ($orientation === 'vertical' ? 'col-resize' : 'row-resize')};
  
  ${({ $orientation, $position }) => $orientation === 'vertical' ? `
    left: ${$position}px;
    top: 0;
    bottom: 0;
    width: 1px;
  ` : `
    top: ${$position}px;
    left: 0;
    right: 0;
    height: 1px;
  `}
`;

// 标尺刻度接口 - 已由CanvasCoordinateContext提供
// interface RulerTick {
//   position: number;
//   value: number;
//   type: 'major' | 'minor' | 'micro';
//   height: number;
//   showLabel: boolean;
// }

// 标尺组件
const Ruler: React.FC<{ orientation: 'horizontal' | 'vertical'; size: number }> = ({ orientation, size }) => {
  const { zoom, pan, getRulerTicks } = useCanvasCoordinate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 获取设备像素比
  const devicePixelRatio = useMemo(() => window.devicePixelRatio || 1, []);
  
  // 绘制标尺
  const drawRuler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    const displaySize = orientation === 'horizontal' ? 
      { width: size, height: RULER_SIZE } : 
      { width: RULER_SIZE, height: size };
    
    canvas.width = displaySize.width * devicePixelRatio;
    canvas.height = displaySize.height * devicePixelRatio;
    canvas.style.width = `${displaySize.width}px`;
    canvas.style.height = `${displaySize.height}px`;
    
    // 设置变换
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);
    
    // 获取刻度信息
    const ticks = getRulerTicks(orientation === 'horizontal', size);
    
    // 设置统一字体样式和位置
    const fontSize = 10 * devicePixelRatio; // 统一字体大小
    const font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    const textOffset = 12; // 统一文字偏移量
    
    // 设置统一的文字样式
    ctx.font = font;
    ctx.textAlign = 'center'; // 统一使用居中对齐
    ctx.textBaseline = 'middle'; // 统一使用中线基准
    
    // 按类型分组绘制刻度
        const ticksByType = {
          micro: ticks.filter(t => t.type === 'micro'),
          minor: ticks.filter(t => t.type === 'minor'),
          major: ticks.filter(t => t.type === 'major')
        };
        
        // 绘制微刻度
        ticksByType.micro.forEach(tick => {
      ctx.fillStyle = '#9ca3af';
      if (orientation === 'horizontal') {
        ctx.fillRect(tick.position - 0.5, RULER_SIZE - tick.height, 1, tick.height);
      } else {
        ctx.fillRect(RULER_SIZE - tick.height, tick.position - 0.5, tick.height, 1);
      }
        });
        
        // 绘制次刻度
        ticksByType.minor.forEach(tick => {
      ctx.fillStyle = '#6b7280';
          
      if (orientation === 'horizontal') {
        ctx.fillRect(tick.position - 0.5, RULER_SIZE - tick.height, 1, tick.height);
          if (tick.showLabel) {
          ctx.fillText(String(tick.worldValue), tick.position, RULER_SIZE - textOffset);
        }
      } else {
        ctx.fillRect(RULER_SIZE - tick.height, tick.position - 0.5, tick.height, 1);
          if (tick.showLabel) {
          ctx.save();
          ctx.translate(RULER_SIZE - textOffset, tick.position);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(String(tick.worldValue), 0, 0);
          ctx.restore();
        }
          }
        });
        
        // 绘制主刻度
        ticksByType.major.forEach(tick => {
      ctx.fillStyle = '#374151';
      
      if (orientation === 'horizontal') {
        ctx.fillRect(tick.position - 0.5, RULER_SIZE - tick.height, 1, tick.height);
        ctx.fillText(String(tick.worldValue), tick.position, RULER_SIZE - textOffset);
      } else {
        ctx.fillRect(RULER_SIZE - tick.height, tick.position - 0.5, tick.height, 1);
        ctx.save();
        ctx.translate(RULER_SIZE - textOffset, tick.position);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(tick.worldValue), 0, 0);
        ctx.restore();
      }
    });
  }, [orientation, size, getRulerTicks, zoom, pan, devicePixelRatio]);
  
  // 监听相关状态变化，重新绘制
  useEffect(() => {
    drawRuler();
  }, [drawRuler]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: orientation === 'horizontal' ? 0 : RULER_SIZE,
        left: orientation === 'horizontal' ? RULER_SIZE : 0,
        width: orientation === 'horizontal' ? size : RULER_SIZE,
        height: orientation === 'horizontal' ? RULER_SIZE : size
      }}
    />
  );
};

// 主组件
export const RulerGuides: React.FC<{ mode?: string }> = ({ mode: _mode }) => {
  const { 
    showRuler, 
    showGuides,
    guides,
    viewport,
    addGuide,
    removeGuide,
    updateGuidePosition,
    worldToScreen,
    screenToWorld,
    canStartDrag,
    setDragMode
  } = useCanvasCoordinate();
  
  // 从标尺拖拽创建辅助线
  const handleRulerMouseDown = useCallback((e: React.MouseEvent, orientation: 'horizontal' | 'vertical') => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const screenPosition = orientation === 'horizontal' ? 
      e.clientY - rect.top : 
      e.clientX - rect.left;
    
    // 转换为世界坐标
    const worldPosition = orientation === 'horizontal' ? 
      screenToWorld(0, screenPosition).y : 
      screenToWorld(screenPosition, 0).x;
    
    const newGuide = {
      id: `guide-${Date.now()}`,
      type: orientation,
      position: worldPosition
    };
    
    addGuide(newGuide);
  }, [addGuide, screenToWorld]);
  
  // 拖拽辅助线
  const handleGuideMouseDown = useCallback((guideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 检查是否可以开始辅助线拖拽
    if (!canStartDrag('guide-drag')) return;
    
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;
    
    // 设置拖拽模式
    setDragMode('guide-drag');
    
    const startPos = guide.type === 'horizontal' ? e.clientY : e.clientX;
    const startGuidePos = guide.position;
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = guide.type === 'horizontal' ? e.clientY : e.clientX;
      const delta = currentPos - startPos;
      
      // 转换为世界坐标的增量
      const worldDelta = guide.type === 'horizontal' ? 
        screenToWorld(0, delta).y - screenToWorld(0, 0).y : 
        screenToWorld(delta, 0).x - screenToWorld(0, 0).x;
      
      const newWorldPosition = startGuidePos + worldDelta;
      updateGuidePosition(guideId, newWorldPosition);
    };
    
    const handleMouseUp = () => {
      // 重置拖拽模式
      setDragMode('none');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [guides, updateGuidePosition, screenToWorld, canStartDrag, setDragMode]);
  
  // 删除辅助线
  const handleGuideDoubleClick = useCallback((guideId: string) => {
    removeGuide(guideId);
  }, [removeGuide]);
  
  // 渲染辅助线 - 将世界坐标转换为屏幕坐标
  const renderGuides = useMemo(() => {
    if (!showGuides || guides.length === 0) return null;
    
    return guides.map(guide => {
      const screenPosition = guide.type === 'horizontal' ? 
        worldToScreen(0, guide.position).y : 
        worldToScreen(guide.position, 0).x;
      
      return (
        <GuideLine
          key={guide.id}
          $orientation={guide.type}
          $position={screenPosition}
          $active={guide.active || false}
          onMouseDown={(e) => handleGuideMouseDown(guide.id, e)}
          onDoubleClick={() => handleGuideDoubleClick(guide.id)}
        />
      );
    });
  }, [guides, showGuides, worldToScreen, handleGuideMouseDown, handleGuideDoubleClick]);
  
  return (
    <RulerContainer>
      {/* 标尺 */}
      {showRuler && (
        <>
          <RulerCorner />
          <HorizontalRuler onMouseDown={(e) => handleRulerMouseDown(e, 'horizontal')} />
          <VerticalRuler onMouseDown={(e) => handleRulerMouseDown(e, 'vertical')} />
          <Ruler orientation="horizontal" size={viewport.width} />
          <Ruler orientation="vertical" size={viewport.height} />
        </>
      )}
      
      {/* 网格已由CanvasGrid组件处理，无需重复渲染 */}
      
      {/* 辅助线 */}
      {renderGuides && (
        <GuideContainer>
          {renderGuides}
        </GuideContainer>
      )}
    </RulerContainer>
   );
};

export default RulerGuides;


