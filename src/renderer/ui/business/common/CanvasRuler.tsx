/**
 * 统一标尺组件
 * - 使用CanvasCoordinateContext进行坐标计算
 * - 支持水平、垂直标尺
 * - 自动与网格对齐
 */

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useCanvasRuler, useCanvasViewport } from './CanvasCoordinateContext';

const RULER_SIZE = 20;

const RulerCanvas = styled.canvas<{ $orientation: 'horizontal' | 'vertical' }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  
  ${({ $orientation }) => $orientation === 'horizontal' ? `
    top: 0;
    left: ${RULER_SIZE}px;
    right: 0;
    height: ${RULER_SIZE}px;
    border-left: none;
  ` : `
    top: ${RULER_SIZE}px;
    left: 0;
    bottom: 0;
    width: ${RULER_SIZE}px;
    border-top: none;
  `}
`;

const Corner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${RULER_SIZE}px;
  height: ${RULER_SIZE}px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  z-index: 20;
`;

interface CanvasRulerProps {
  orientation: 'horizontal' | 'vertical';
  containerSize: number;
}

export const CanvasRuler: React.FC<CanvasRulerProps> = ({ orientation, containerSize }) => {
  const { showRuler, getRulerTicks } = useCanvasRuler();
  const { zoom, pan } = useCanvasViewport();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 获取设备像素比
  const devicePixelRatio = useMemo(() => window.devicePixelRatio || 1, []);
  
  // 绘制标尺
  const drawRuler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showRuler) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    const displaySize = orientation === 'horizontal' ? 
      { width: containerSize, height: RULER_SIZE } : 
      { width: RULER_SIZE, height: containerSize };
    
    canvas.width = displaySize.width * devicePixelRatio;
    canvas.height = displaySize.height * devicePixelRatio;
    canvas.style.width = `${displaySize.width}px`;
    canvas.style.height = `${displaySize.height}px`;
    
    // 设置变换
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);
    
    // 获取刻度信息
    const ticks = getRulerTicks(orientation === 'horizontal', containerSize);
    
    // 设置文字样式
    ctx.font = `${9 * devicePixelRatio}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = orientation === 'horizontal' ? 'left' : 'center';
    ctx.textBaseline = orientation === 'horizontal' ? 'bottom' : 'middle';
    
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
          ctx.fillText(String(tick.worldValue), tick.position + 2, RULER_SIZE - 2);
        }
      } else {
        ctx.fillRect(RULER_SIZE - tick.height, tick.position - 0.5, tick.height, 1);
        if (tick.showLabel) {
          ctx.save();
          ctx.translate(RULER_SIZE / 2, tick.position);
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
        ctx.font = `bold ${10 * devicePixelRatio}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillText(String(tick.worldValue), tick.position + 2, RULER_SIZE - 2);
      } else {
        ctx.fillRect(RULER_SIZE - tick.height, tick.position - 0.5, tick.height, 1);
        ctx.font = `bold ${10 * devicePixelRatio}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.save();
        ctx.translate(RULER_SIZE / 2, tick.position);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(tick.worldValue), 0, 0);
        ctx.restore();
      }
    });
  }, [orientation, containerSize, showRuler, getRulerTicks, zoom, pan, devicePixelRatio]);
  
  // 监听相关状态变化，重新绘制
  useEffect(() => {
    drawRuler();
  }, [drawRuler]);
  
  if (!showRuler) return null;
  
  return (
    <RulerCanvas
      ref={canvasRef}
      $orientation={orientation}
    />
  );
};

export const CanvasRulers: React.FC = () => {
  const { viewport } = useCanvasViewport();
  
  return (
    <>
      <Corner />
      <CanvasRuler orientation="horizontal" containerSize={viewport.width} />
      <CanvasRuler orientation="vertical" containerSize={viewport.height} />
    </>
  );
};

export default CanvasRulers;
