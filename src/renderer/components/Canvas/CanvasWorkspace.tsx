/**
 * 无限画布工作区 - 基于Suika引擎的无限画布系统
 * 支持无限制的平移、缩放和对象放置
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
// import { IconButton } from '../../ui/components/IconButton/IconButton';
// import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Button } from '../../ui/components/Button/Button';
// import { Badge } from '../../ui/components/Badge/Badge';
import { canvasEvents } from '../../utils/events/canvasEvents';
import { useCanvasStore } from '../../stores/canvasStore';

const WorkspaceContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.canvas.background};
  position: relative;
  overflow: hidden;
`;

// const CanvasToolbar = styled.div`
//   height: 40px;
//   background: ${({ theme }) => theme.colors.surface};
//   border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 0 ${({ theme }) => theme.spacing.md};
//   backdrop-filter: blur(8px);
// `;

// const ToolbarSection = styled.div`
//   display: flex;
//   align-items: center;
//   gap: ${({ theme }) => theme.spacing.sm};
// `;

const CanvasAreaWrapper = styled.div<{ $showRuler: boolean; $rulerSize: number }>`
  position: relative;
  flex: 1;
  padding-top: ${({ $showRuler, $rulerSize }) => ($showRuler ? `${$rulerSize}px` : '0')};
  padding-left: ${({ $showRuler, $rulerSize }) => ($showRuler ? `${$rulerSize}px` : '0')};
`;

const InfiniteCanvasArea = styled.div<{ $showGrid: boolean; $gridSize: number; $panX: number; $panY: number; $zoom: number }>`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.canvas.background};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  /* 动态网格背景 - 跟随视口移动 */
  ${({ $showGrid, theme, $gridSize, $panX, $panY, $zoom }) => $showGrid ? `
    background-image: 
      linear-gradient(${theme.colors.canvas.grid} 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.canvas.grid} 1px, transparent 1px);
    background-size: ${$gridSize * $zoom}px ${$gridSize * $zoom}px;
    background-position: ${$panX}px ${$panY}px;
  ` : ''}
`;

const InfiniteCanvas = styled.div<{ $panX: number; $panY: number; $zoom: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate(${({ $panX }) => $panX}px, ${({ $panY }) => $panY}px) scale(${({ $zoom }) => $zoom});
  transform-origin: 0 0;
  pointer-events: none;
`;

const CanvasObject = styled.div<{ $x: number; $y: number; $width: number; $height: number; $selected?: boolean }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  pointer-events: auto;
  cursor: pointer;
  
  ${({ $selected, theme }) => $selected ? `
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  ` : ''}
`;

const OverviewNavigator = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: 200px;
  height: 150px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

const ViewportIndicator = styled.div<{ $x: number; $y: number; $width: number; $height: number }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $width }) => $width}%;
  height: ${({ $height }) => $height}%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}20;
  cursor: move;
`;

const RulerCanvasHorizontal = styled.canvas<{ $visible: boolean; $rulerSize: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: ${({ $rulerSize }) => $rulerSize}px;
  right: 0;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.banner};
`;

const RulerCanvasVertical = styled.canvas<{ $visible: boolean; $rulerSize: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ $rulerSize }) => $rulerSize}px;
  bottom: 0;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.banner};
`;

const GuideLine = styled.div<{ $orientation: 'vertical' | 'horizontal'; $positionPx: number }>`
  position: absolute;
  ${({ $orientation, $positionPx }) =>
    $orientation === 'vertical'
      ? `left: ${$positionPx}px; top: 0; bottom: 0; width: 1px;`
      : `top: ${$positionPx}px; left: 0; right: 0; height: 1px;`}
  background: #4f46e5;
  opacity: 0.6;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

// 无限画布对象接口
interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'template';
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  content?: string;
  selected?: boolean;
}

// 视口信息接口
interface ViewportInfo {
  x: number;
  y: number;
  zoom: number;
}

// 模板接口
// interface CanvasTemplate {
//   id: string;
//   name: string;
//   width: number;
//   height: number;
//   category: 'mobile' | 'desktop' | 'game' | 'social';
//   emoji: string;
// }

interface CanvasWorkspaceProps {
  mode?: 'design' | 'h5';
  onModeChange?: (mode: 'design' | 'h5') => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ mode: controlledMode }) => {
  // 无限画布状态
  const [viewport, setViewport] = useState<ViewportInfo>({ x: 0, y: 0, zoom: 1 });
  const [hasError, setHasError] = useState(false);
  const [mode, setMode] = useState<'design' | 'h5'>(controlledMode || 'design');
  // 受控模式同步
  useEffect(() => {
    if (controlledMode && controlledMode !== mode) {
      setMode(controlledMode);
    }
  }, [controlledMode]);
  const [showGrid, setShowGrid] = useState(true);
  // const [gridSize, setGridSize] = useState(20);
  const [gridSize] = useState(20);
  // const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [guides, setGuides] = useState<Array<{
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    color: string;
  }>>([]);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  
  // 对象拖拽状态
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [draggedObjectStart, setDraggedObjectStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const rulerHRef = useRef<HTMLCanvasElement>(null);
  const rulerVRef = useRef<HTMLCanvasElement>(null);
  const RULER_SIZE = 20;
  // 从全局画布Store读取标尺可见性
  const showRuler = useCanvasStore(s => s.showRuler);


  // 常用模板
  // const templates: CanvasTemplate[] = [
  //   { id: 'mobile', name: '移动端', width: 375, height: 667, category: 'mobile', emoji: '📱' },
  //   { id: 'tablet', name: '平板', width: 768, height: 1024, category: 'mobile', emoji: '📱' },
  //   { id: 'desktop', name: '桌面', width: 1920, height: 1080, category: 'desktop', emoji: '🖥️' },
  //   { id: 'icon', name: '游戏图标', width: 256, height: 256, category: 'game', emoji: '🎮' },
  //   { id: 'button', name: '按钮', width: 200, height: 60, category: 'game', emoji: '🔘' },
  //   { id: 'banner', name: '横幅', width: 728, height: 90, category: 'social', emoji: '🎯' },
  // ];

  // 缩放处理 - 支持10%-500%缩放范围和60fps性能优化
  const handleZoomChange = useCallback((delta: number, centerPoint?: { x: number; y: number }) => {
    setViewport(prev => {
      const newZoom = Math.max(0.1, Math.min(5.0, prev.zoom + delta * 0.1));
      
      if (centerPoint) {
        // 以指定点为中心进行缩放，防止除零错误
        const safePrevZoom = Math.max(prev.zoom, 0.01);
        const zoomRatio = newZoom / safePrevZoom;
        return {
          ...prev,
          x: centerPoint.x - (centerPoint.x - prev.x) * zoomRatio,
          y: centerPoint.y - (centerPoint.y - prev.y) * zoomRatio,
          zoom: newZoom
        };
      }
      
      return { ...prev, zoom: newZoom };
    });
  }, []);

  // 适应内容
  const handleFitToContent = useCallback(() => {
    if (objects.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // 计算所有对象的边界框
    const bounds = objects.reduce((acc, obj) => {
      const left = obj.worldX;
      const top = obj.worldY;
      const right = obj.worldX + obj.width;
      const bottom = obj.worldY + obj.height;

      return {
        left: Math.min(acc.left, left),
        top: Math.min(acc.top, top),
        right: Math.max(acc.right, right),
        bottom: Math.max(acc.bottom, bottom),
      };
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const contentWidth = bounds.right - bounds.left;
    const contentHeight = bounds.bottom - bounds.top;

    // 计算合适的缩放比例
    const scaleX = (canvasRect.width * 0.8) / contentWidth;
    const scaleY = (canvasRect.height * 0.8) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 2.0);

    // 计算居中位置
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    const newX = canvasRect.width / 2 - centerX * newZoom;
    const newY = canvasRect.height / 2 - centerY * newZoom;

    setViewport({ x: newX, y: newY, zoom: newZoom });
  }, [objects]);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan({ x: viewport.x, y: viewport.y });
  }, [viewport.x, viewport.y]);





  // 对象拖拽开始
  const handleObjectMouseDown = useCallback((objectId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键
    
    e.stopPropagation();
    e.preventDefault();
    
    setSelectedObjectId(objectId);
    setIsDraggingObject(true);
    setDraggedObjectId(objectId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggedObjectStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // 对象拖拽结束
  const handleObjectMouseUp = useCallback(() => {
    setIsDraggingObject(false);
    setDraggedObjectId(null);
    setDraggedObjectStart({ x: 0, y: 0 });
  }, []);

  // 鼠标移动处理
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    try {
      // 处理对象拖拽
      if (isDraggingObject && draggedObjectId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
      
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      // 计算移动距离
      const deltaX = currentX - draggedObjectStart.x;
      const deltaY = currentY - draggedObjectStart.y;
      
      // 转换为世界坐标的移动距离，防止除零错误
      const safeZoom = Math.max(viewport.zoom, 0.01); // 最小缩放值
      const worldDeltaX = deltaX / safeZoom;
      const worldDeltaY = deltaY / safeZoom;
      
      setObjects(prev => prev.map(obj => {
        if (obj.id === draggedObjectId) {
          // 计算新的世界坐标位置
          let newWorldX = obj.worldX + worldDeltaX;
          let newWorldY = obj.worldY + worldDeltaY;
          
          // 如果启用了对齐功能，应用对齐逻辑
          // if (snapToGrid || showGuides) {
          //   // 转换为屏幕坐标进行对齐计算
          //   const screenX = (newWorldX + obj.width / 2) * viewport.zoom + viewport.x;
          //   const screenY = (newWorldY + obj.height / 2) * viewport.zoom + viewport.y;
            
          //   let alignedScreenPos = { x: screenX, y: screenY };
            
          //   // 应用参考线对齐
          //   if (showGuides && guides.length > 0) {
          //     const threshold = 5;
          //     guides.forEach(guide => {
          //       const guideScreenPos = guide.position * viewport.zoom + 
          //         (guide.type === 'vertical' ? viewport.x : viewport.y);
                
          //       const distance = Math.abs(
          //         (guide.type === 'vertical' ? alignedScreenPos.x : alignedScreenPos.y) - guideScreenPos
          //       );
                
          //       if (distance < threshold) {
          //         if (guide.type === 'vertical') {
          //           alignedScreenPos.x = guideScreenPos;
          //         } else {
          //           alignedScreenPos.y = guideScreenPos;
          //         }
          //       }
          //     });
          //   }
            
          //   // 应用网格对齐
          //   if (snapToGrid) {
          //     const safeZoom = Math.max(viewport.zoom, 0.01);
          //     const worldPoint = {
          //       x: (alignedScreenPos.x - viewport.x) / safeZoom,
          //       y: (alignedScreenPos.y - viewport.y) / safeZoom
          //     };
              
          //     const snappedWorld = {
          //       x: Math.round(worldPoint.x / gridSize) * gridSize,
          //       y: Math.round(worldPoint.y / gridSize) * gridSize
          //     };
              
          //     alignedScreenPos = {
          //       x: snappedWorld.x * safeZoom + viewport.x,
          //       y: snappedWorld.y * safeZoom + viewport.y
          //     };
          //   }
            
          //   // 转换回世界坐标
          //   const safeZoomForConversion = Math.max(viewport.zoom, 0.01);
          //   newWorldX = (alignedScreenPos.x - viewport.x) / safeZoomForConversion - obj.width / 2;
          //   newWorldY = (alignedScreenPos.y - viewport.y) / safeZoomForConversion - obj.height / 2;
          // }
          
          return {
            ...obj,
            worldX: newWorldX,
            worldY: newWorldY
          };
        }
        return obj;
      }));
      
        // 更新拖拽起始点
        setDraggedObjectStart({ x: currentX, y: currentY });
        return;
      }

      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setViewport(prev => ({
        ...prev,
        x: lastPan.x + deltaX,
        y: lastPan.y + deltaY,
      }));
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  }, [isDragging, isDraggingObject, dragStart, lastPan, draggedObjectId, draggedObjectStart, viewport, showGuides, guides, gridSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    handleObjectMouseUp();
  }, [handleObjectMouseUp]);

  // 滚轮缩放 - 支持10%-500%缩放范围和60fps性能优化
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 使用性能优化的缩放处理
    handleZoomChange(delta, { x: mouseX, y: mouseY });
  }, [handleZoomChange]);

  // 双击适应内容
  const handleDoubleClick = useCallback(() => {
    handleFitToContent();
  }, [handleFitToContent]);

  // 计算合适刻度步长（世界坐标单位），保证屏幕像素间距在 50-100 像素
  const computeStep = useCallback((zoom: number) => {
    const minPx = 50;
    const maxPx = 100;
    const targetWorld = minPx / Math.max(zoom, 0.01);
    const pow = Math.pow(10, Math.floor(Math.log10(targetWorld)));
    const candidates = [1, 2, 5, 10].map(m => m * pow);
    const base = (candidates[0] ?? pow);
    let best: number = base;
    let bestPx: number = best * zoom;
    for (const c of candidates) {
      const px = c * zoom;
      if (px >= minPx && px <= maxPx) return c;
      if (Math.abs(px - (minPx + maxPx) / 2) < Math.abs(bestPx - (minPx + maxPx) / 2)) {
        best = c; bestPx = px;
      }
    }
    return best || pow; // 类型保护，确保有返回值
  }, []);

  // 绘制水平/垂直标尺
  useEffect(() => {
    if (!showRuler) return;
    const devicePixelRatio = window.devicePixelRatio || 1;

    const drawHorizontal = () => {
      const canvas = rulerHRef.current;
      const host = canvas?.parentElement as HTMLElement | null;
      if (!canvas || !host) return;
      const width = host.clientWidth;
      const height = RULER_SIZE;
      canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#cbd5e1';
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';

      const stepWorld = computeStep(viewport.zoom);
      const startWorld = Math.floor((-viewport.x) / stepWorld) * stepWorld;
      for (let world = startWorld; ; world += stepWorld) {
        const x = Math.round(world * viewport.zoom + viewport.x);
        if (x > width) break;
        if (x >= 0) {
          const isMajor = Math.abs((world / (stepWorld * 5)) - Math.round(world / (stepWorld * 5))) < 1e-6;
          const tick = isMajor ? height : Math.floor(height * 0.6);
          ctx.beginPath();
          ctx.moveTo(x + 0.5, height);
          ctx.lineTo(x + 0.5, height - tick + 2);
          ctx.stroke();
          if (isMajor) {
            const label = Math.round(world).toString();
            ctx.fillText(label, x + 2, 10);
          }
        }
        if (world > (width - viewport.x) / viewport.zoom) break;
      }
    };

    const drawVertical = () => {
      const canvas = rulerVRef.current;
      const host = canvas?.parentElement as HTMLElement | null;
      if (!canvas || !host) return;
      const height = host.clientHeight;
      const width = RULER_SIZE;
      canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#cbd5e1';
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';

      const stepWorld = computeStep(viewport.zoom);
      const startWorld = Math.floor((-viewport.y) / stepWorld) * stepWorld;
      for (let world = startWorld; ; world += stepWorld) {
        const y = Math.round(world * viewport.zoom + viewport.y);
        if (y > height) break;
        if (y >= 0) {
          const isMajor = Math.abs((world / (stepWorld * 5)) - Math.round(world / (stepWorld * 5))) < 1e-6;
          const tick = isMajor ? width : Math.floor(width * 0.6);
          ctx.beginPath();
          ctx.moveTo(width, y + 0.5);
          ctx.lineTo(width - tick + 2, y + 0.5);
          ctx.stroke();
          if (isMajor) {
            const label = Math.round(world).toString();
            ctx.save();
            ctx.translate(0, y + 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(label, 2, 10);
            ctx.restore();
          }
        }
        if (world > (height - viewport.y) / viewport.zoom) break;
      }
    };

    drawHorizontal();
    drawVertical();
  }, [viewport.x, viewport.y, viewport.zoom, showRuler, computeStep]);

  // 从标尺拖拽创建参考线（简单实现）
  useEffect(() => {
    if (!showRuler) return;
    const wrapper = canvasRef.current?.parentElement as HTMLElement | null;
    if (!wrapper) return;

    let dragging: null | { type: 'vertical' | 'horizontal' } = null;

    const onMouseDown = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= RULER_SIZE) {
        dragging = { type: 'vertical' };
      } else if (y >= 0 && y <= RULER_SIZE) {
        dragging = { type: 'horizontal' };
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (dragging.type === 'vertical') {
        const world = (x - viewport.x - (showRuler ? RULER_SIZE : 0)) / Math.max(viewport.zoom, 0.01);
        setGuides(prev => [...prev, { id: `gv-${Date.now()}`, type: 'vertical', position: world, color: '#4f46e5' }]);
      } else {
        const world = (y - viewport.y - (showRuler ? RULER_SIZE : 0)) / Math.max(viewport.zoom, 0.01);
        setGuides(prev => [...prev, { id: `gh-${Date.now()}`, type: 'horizontal', position: world, color: '#4f46e5' }]);
      }
      dragging = null;
    };
    wrapper.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      wrapper.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [showRuler, viewport.x, viewport.y, viewport.zoom]);

  // 创建模板对象（预留实现）
  // const handleCreateTemplate = useCallback((template: CanvasTemplate) => {
  //   try {
  //     // 计算初始位置（屏幕中心转换为世界坐标）
  //     const canvasRect = canvasRef.current?.getBoundingClientRect();
  //     if (!canvasRect) return;
    
  //   const centerX = canvasRect.width / 2;
  //   const centerY = canvasRect.height / 2;
    
  //   // 转换为世界坐标，防止除零错误
  //   const safeZoom = Math.max(viewport.zoom, 0.01);
  //   const worldPosition = {
  //     x: (centerX - viewport.x) / safeZoom - template.width / 2,
  //     y: (centerY - viewport.y) / safeZoom - template.height / 2
  //   };
    
  //   // 首先应用参考线对齐，然后应用网格对齐
  //   let screenPosition = { x: centerX, y: centerY };
    
  //   // 应用参考线对齐
  //   if (showGuides && guides.length > 0) {
  //     const threshold = 5;
  //     guides.forEach(guide => {
  //       const guideScreenPos = guide.position * viewport.zoom + 
  //         (guide.type === 'vertical' ? viewport.x : viewport.y);
        
  //       const distance = Math.abs(
  //         (guide.type === 'vertical' ? screenPosition.x : screenPosition.y) - guideScreenPos
  //       );
        
  //       if (distance < threshold) {
  //         if (guide.type === 'vertical') {
  //           screenPosition.x = guideScreenPos;
  //         } else {
  //           screenPosition.y = guideScreenPos;
  //         }
  //       }
  //     });
  //   }
    
  //   // 应用网格对齐
  //   if (snapToGrid) {
  //     const safeZoomForGrid = Math.max(viewport.zoom, 0.01);
  //     const worldPoint = {
  //       x: (screenPosition.x - viewport.x) / safeZoomForGrid,
  //       y: (screenPosition.y - viewport.y) / safeZoomForGrid
  //     };
      
  //     const snappedWorld = {
  //       x: Math.round(worldPoint.x / gridSize) * gridSize,
  //       y: Math.round(worldPoint.y / gridSize) * gridSize
  //     };
      
  //     screenPosition = {
  //       x: snappedWorld.x * safeZoomForGrid + viewport.x,
  //       y: snappedWorld.y * safeZoomForGrid + viewport.y
  //     };
  //   }
    
  //   const alignedWorldPosition = {
  //     x: (screenPosition.x - viewport.x) / safeZoom - template.width / 2,
  //     y: (screenPosition.y - viewport.y) / safeZoom - template.height / 2
  //   };

  //   const newObject: CanvasObject = {
  //     id: `template-${Date.now()}`,
  //     type: 'template',
  //     worldX: (snapToGrid || showGuides) ? alignedWorldPosition.x : worldPosition.x,
  //     worldY: (snapToGrid || showGuides) ? alignedWorldPosition.y : worldPosition.y,
  //     width: template.width,
  //     height: template.height,
  //     content: template.name,
  //   };

  //     setObjects(prev => [...prev, newObject]);
  //     setSelectedObjectId(newObject.id);
  //   } catch (error) {
  //     console.error('Error in handleCreateTemplate:', error);
  //   }
  // }, [viewport, snapToGrid, showGuides, guides, gridSize]);

  // // 对象点击处理
  // const handleObjectClick = useCallback((objectId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setSelectedObjectId(objectId);
  // }, []);



  // 显示概览导航器（当缩放很小时）- 视口边界检测
  useEffect(() => {
    setShowOverview(viewport.zoom < 0.3);
  }, [viewport.zoom]);

  // 监听容器尺寸变化（面板宽度联动）
  useEffect(() => {
    if (!canvasRef.current) return;

    const el = canvasRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };

    // 初始更新
    update();

    // 使用 ResizeObserver 精准感知尺寸变化（安全检测 + 回退）
    let ro: ResizeObserver | null = null;
    const RO: any = (window as any).ResizeObserver;
    if (typeof RO === 'function') {
      const observer: ResizeObserver = new RO(() => update());
      observer.observe(el);
      ro = observer;
    } else {
      // 退化方案
      window.addEventListener('resize', update);
    }

    return () => {
      if (ro) {
        ro.disconnect();
      } else {
        window.removeEventListener('resize', update);
      }
    };
  }, []);

  // 订阅顶部菜单发出的画布事件
  useEffect(() => {
    const offFit = canvasEvents.on('fitToContent', () => handleFitToContent());
    const offToggleGrid = canvasEvents.on('toggleGrid', () => setShowGrid(prev => !prev));
    const offToggleGuides = canvasEvents.on('toggleGuides', () => setShowGuides(prev => !prev));
    const offReset = canvasEvents.on('resetView', () => setViewport({ x: 0, y: 0, zoom: 1 }));
    const offZoomIn = canvasEvents.on('zoomIn', () => handleZoomChange(1));
    const offZoomOut = canvasEvents.on('zoomOut', () => handleZoomChange(-1));
    return () => {
      canvasEvents.off('fitToContent', offFit as any);
      canvasEvents.off('toggleGrid', offToggleGrid as any);
      canvasEvents.off('toggleGuides', offToggleGuides as any);
      canvasEvents.off('resetView', offReset as any);
      canvasEvents.off('zoomIn', offZoomIn as any);
      canvasEvents.off('zoomOut', offZoomOut as any);
    };
  }, [handleFitToContent, handleZoomChange]);




  // const handleExport = () => {
  //   console.log('Export infinite canvas');
  // };

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 防止在输入框中触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomChange(1);
            break;
          case '-':
            e.preventDefault();
            handleZoomChange(-1);
            break;
          case '0':
            e.preventDefault();
            setViewport({ x: 0, y: 0, zoom: 1 });
            break;
          case '1':
            e.preventDefault();
            handleFitToContent();
            break;
          case '2':
            e.preventDefault();
            setViewport(prev => ({ ...prev, zoom: 1 }));
            break;
        }
      } else {
        switch (e.key) {
          case 'g':
            e.preventDefault();
            setShowGrid(prev => !prev);
            break;
          case 'r':
            e.preventDefault();
            setShowGuides(prev => !prev);
            break;
          case 'h':
            e.preventDefault();
            setViewport({ x: 0, y: 0, zoom: 1 });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomChange, handleFitToContent]);

  // 错误处理
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Canvas workspace error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <WorkspaceContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2>画布加载出错</h2>
          <p>请刷新页面重试</p>
          <Button onClick={() => setHasError(false)}>重试</Button>
        </div>
      </WorkspaceContainer>
    );
  }

  return (
    <WorkspaceContainer>
      {/* 无限画布工具栏 */}
      {/* <CanvasToolbar>
        <ToolbarSection>
          <Button variant="ghost" size="sm" onClick={handleFitToContent}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <SvgIcon name="icon.16.target" size={12} title="适应" /> 适应内容
            </span>
          </Button>

          <IconButton
            variant={showGrid ? 'primary' : 'ghost'}
            size="sm"
            icon="⊞"
            onClick={() => setShowGrid(!showGrid)}
            title="显示/隐藏网格"
          />

          <IconButton
            variant={snapToGrid ? 'primary' : 'ghost'}
            size="sm"
            icon="🧲"
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="网格对齐"
          />

          <IconButton
            variant={showGuides ? 'primary' : 'ghost'}
            size="sm"
            icon="📏"
            onClick={() => setShowGuides(!showGuides)}
            title="显示/隐藏参考线"
          />

          <Button variant="ghost" size="sm" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <SvgIcon name="icon.16.reset" size={12} title="重置" /> 重置视图
            </span>
          </Button>
        </ToolbarSection>

        <ToolbarSection>
          <Button variant="outline" size="sm">
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <SvgIcon name="icon.16.copy" size={12} title="复制" /> 复制
            </span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <SvgIcon name="icon.16.publish" size={12} title="导出" /> 导出
            </span>
          </Button>
        </ToolbarSection>
      </CanvasToolbar> */}

      {/* 标尺 + 画布区域 */}
      <CanvasAreaWrapper $showRuler={showRuler} $rulerSize={RULER_SIZE}>
        <RulerCanvasHorizontal ref={rulerHRef} $visible={showRuler} $rulerSize={RULER_SIZE} />
        <RulerCanvasVertical ref={rulerVRef} $visible={showRuler} $rulerSize={RULER_SIZE} />

        <InfiniteCanvasArea
          key={`${containerSize.width}x${containerSize.height}`}
          ref={canvasRef}
          $showGrid={showGrid}
          $gridSize={gridSize}
          $panX={viewport.x}
          $panY={viewport.y}
          $zoom={viewport.zoom}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
        {/* 无限画布内容 */}
        <InfiniteCanvas
          $panX={viewport.x}
          $panY={viewport.y}
          $zoom={viewport.zoom}
        >
          {/* 渲染画布对象 */}
          {objects.map((obj) => (
            <CanvasObject
              key={obj.id}
              $x={obj.worldX}
              $y={obj.worldY}
              $width={obj.width}
              $height={obj.height}
              $selected={obj.id === selectedObjectId}
              // onClick={(e) => handleObjectClick(obj.id, e)}
              onMouseDown={(e) => handleObjectMouseDown(obj.id, e)}
            >
              {obj.type === 'template' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#666',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '24px' }}>📄</div>
                  <div>{obj.content}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {obj.width} × {obj.height}
                  </div>
                </div>
              )}
            </CanvasObject>
          ))}
          </InfiniteCanvas>
        </InfiniteCanvasArea>

        {/* 参考线渲染（世界->屏幕转换） */}
        {guides.map(g => (
          <GuideLine
            key={g.id}
            $orientation={g.type}
            $positionPx={
              g.type === 'vertical'
                ? Math.round(g.position * viewport.zoom + viewport.x)
                : Math.round(g.position * viewport.zoom + viewport.y)
            }
          />
        ))}

        {/* 概览导航器 */}
        <OverviewNavigator $visible={showOverview}>
          <div style={{
            padding: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderBottom: '1px solid #eee',
            background: '#f5f5f5'
          }}>
            画布概览
          </div>
          <div style={{ position: 'relative', flex: 1, margin: '8px' }}>
            {/* 简化的内容缩略图 */}
            {objects.map((obj) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: `${(obj.worldX + 2000) / 40}px`,
                  top: `${(obj.worldY + 1500) / 40}px`,
                  width: `${obj.width / 40}px`,
                  height: `${obj.height / 40}px`,
                  background: '#007acc',
                  borderRadius: '2px',
                  opacity: 0.7,
                }}
              />
            ))}

            {/* 视口指示器 */}
            <ViewportIndicator
              $x={50}
              $y={50}
              $width={20}
              $height={15}
            />
          </div>
        </OverviewNavigator>
      </CanvasAreaWrapper>
    </WorkspaceContainer>
  );
};