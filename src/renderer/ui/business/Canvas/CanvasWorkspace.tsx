/**
 * 无限画布工作区 - 基于Suika引擎的无限画布系统
 * 支持无限制的平移、缩放和对象放置
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useZoomPan } from '../common/ZoomPanContext';
import styled from 'styled-components';
// import { IconButton } from '../../atoms/IconButton/IconButton.tsx';
// import { SvgIcon } from '../../Icon/SvgIcon.tsx';
import { Button } from '../../components/atoms/Button/Button';
// import { Badge } from '../../components/Badge/Badge.tsx';
import { canvasEvents } from '../../../logic/utils/events/canvasEvents';
import { useCanvasStore } from '../../../stores/canvasStore';

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

const CanvasAreaWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
`;

const InfiniteCanvasArea = styled.div<{ $showGrid: boolean; $gridSize: number; $isControlledExternally: boolean }>`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.canvas.background};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  /* 简化的网格背景 - 只在非外部控制模式下显示 */
  ${({ $showGrid, theme, $gridSize, $isControlledExternally }) => {
    if (!$showGrid || $isControlledExternally) return '';

    const gridColor = theme.colors.canvas.grid;
    const baseGrid = Math.max(10, $gridSize || 20);

    return `
      background-image:
        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px);
      background-size: ${baseGrid}px ${baseGrid}px;
      background-position: 0px 0px;
      background-repeat: repeat;
    `;
  }}
`;

const InfiniteCanvas = styled.div<{ $isControlledExternally: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 外部控制时不应用transform，由ZoomPanContainer处理 */
  transform: ${({ $isControlledExternally }) => $isControlledExternally ? 'none' : 'translate(0px, 0px) scale(1)'};
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

// 移除内置标尺，统一使用RulerGuides组件

const GuideLine = styled.div<{ $orientation: 'vertical' | 'horizontal'; $positionPx: number; $active?: boolean }>`
  position: absolute;
  ${({ $orientation, $positionPx }) =>
    $orientation === 'vertical'
      ? `left: ${$positionPx}px; top: 0; bottom: 0; width: 1px;`
      : `top: ${$positionPx}px; left: 0; right: 0; height: 1px;`}
  background: ${({ $active }) => ($active ? '#ef4444' : '#4f46e5')};
  opacity: 0.7;
  cursor: ${({ $orientation }) => ($orientation === 'vertical' ? 'col-resize' : 'row-resize')};
  pointer-events: auto;
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
  // 外部传入的对象数据
  externalObjects?: CanvasObject[];
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  mode: controlledMode,
  externalObjects
}) => {
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
  // 网格与标尺改为使用全局store
  const showGrid = useCanvasStore(s => s.showGrid);
  const gridSize = useCanvasStore(s => s.gridSize);

  // 获取外部缩放/平移状态（来自ZoomPanContainer）
  const zoomPanContext = useZoomPan();

  const [objects, setObjects] = useState<CanvasObject[]>(externalObjects || []);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 参考线状态（本地管理，因为RulerGuides组件管理全局参考线）
  const [guides, setGuides] = useState<Array<{
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    color: string;
  }>>([]);
  // const [showGuides, setShowGuides] = useState(true);
  // const [snapToGrid, setSnapToGrid] = useState(false);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  // 对象拖拽状态
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [draggedObjectStart, setDraggedObjectStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // 判断是否被外部容器控制（如ZoomPanContainer）
  const isControlledExternally = !!zoomPanContext && (zoomPanContext.zoom !== 1 || zoomPanContext.pan.x !== 0 || zoomPanContext.pan.y !== 0);

  // 同步外部objects数据
  useEffect(() => {
    if (externalObjects) {
      setObjects(externalObjects);
    }
  }, [externalObjects]);


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

  // 鼠标事件处理 - 只在非外部控制模式下处理平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isControlledExternally) return; // 只处理左键，外部控制时不处理

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan({ x: viewport.x, y: viewport.y });
  }, [viewport.x, viewport.y, isControlledExternally]);





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
        // 如果被外部控制，使用外部的缩放值
        const effectiveZoom = isControlledExternally ? zoomPanContext.zoom : viewport.zoom;
        const safeZoom = Math.max(effectiveZoom, 0.01); // 最小缩放值
        const worldDeltaX = deltaX / safeZoom;
        const worldDeltaY = deltaY / safeZoom;

        setObjects(prev => prev.map(obj => {
          if (obj.id === draggedObjectId) {
            // 计算新的世界坐标位置
            let newWorldX = obj.worldX + worldDeltaX;
            let newWorldY = obj.worldY + worldDeltaY;

            // 基于对象边缘进行辅助线吸附（屏幕像素计算）
            const guidesX = (window as any).__guidesX as number[] | undefined;
            const guidesY = (window as any).__guidesY as number[] | undefined;
            const threshold = 5; // 像素阈值
            const safeZoomForSnap = Math.max(safeZoom, 0.01);

            // 当被外部控制时，使用外部的平移值
            const panOffsetX = isControlledExternally ? zoomPanContext.pan.x : viewport.x;
            const panOffsetY = isControlledExternally ? zoomPanContext.pan.y : viewport.y;

            // 对象在新位置的边缘屏幕坐标
            const edgeScreenX = {
              left: newWorldX * safeZoomForSnap + panOffsetX,
              center: (newWorldX + obj.width / 2) * safeZoomForSnap + panOffsetX,
              right: (newWorldX + obj.width) * safeZoomForSnap + panOffsetX,
            } as const;
            const edgeScreenY = {
              top: newWorldY * safeZoomForSnap + panOffsetY,
              middle: (newWorldY + obj.height / 2) * safeZoomForSnap + panOffsetY,
              bottom: (newWorldY + obj.height) * safeZoomForSnap + panOffsetY,
            } as const;

            // X 方向吸附
            if (guidesX && guidesX.length) {
              let bestDx = threshold + 1;
              let bestGuideX: number | null = null;
              let bestEdgeX: keyof typeof edgeScreenX | null = null;
              for (const g of guidesX) {
                for (const k of Object.keys(edgeScreenX) as (keyof typeof edgeScreenX)[]) {
                  const d = Math.abs(edgeScreenX[k] - g);
                  if (d < bestDx) { bestDx = d; bestGuideX = g; bestEdgeX = k; }
                }
              }
              if (bestGuideX !== null && bestEdgeX && bestDx <= threshold) {
                const guideWorldX = (bestGuideX - panOffsetX) / safeZoomForSnap;
                if (bestEdgeX === 'left') newWorldX = guideWorldX;
                if (bestEdgeX === 'center') newWorldX = guideWorldX - obj.width / 2;
                if (bestEdgeX === 'right') newWorldX = guideWorldX - obj.width;
              }
            }

            // Y 方向吸附
            if (guidesY && guidesY.length) {
              let bestDy = threshold + 1;
              let bestGuideY: number | null = null;
              let bestEdgeY: keyof typeof edgeScreenY | null = null;
              for (const g of guidesY) {
                for (const k of Object.keys(edgeScreenY) as (keyof typeof edgeScreenY)[]) {
                  const d = Math.abs(edgeScreenY[k] - g);
                  if (d < bestDy) { bestDy = d; bestGuideY = g; bestEdgeY = k; }
                }
              }
              if (bestGuideY !== null && bestEdgeY && bestDy <= threshold) {
                const guideWorldY = (bestGuideY - panOffsetY) / safeZoomForSnap;
                if (bestEdgeY === 'top') newWorldY = guideWorldY;
                if (bestEdgeY === 'middle') newWorldY = guideWorldY - obj.height / 2;
                if (bestEdgeY === 'bottom') newWorldY = guideWorldY - obj.height;
              }
            }

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
  }, [isDragging, isDraggingObject, dragStart, lastPan, draggedObjectId, draggedObjectStart, viewport, gridSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    handleObjectMouseUp();
  }, [handleObjectMouseUp]);

  // 滚轮缩放 - 只在非外部控制模式下处理
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isControlledExternally) {
      // 外部控制模式下，让ZoomPanContainer处理滚轮事件
      return;
    }

    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 使用性能优化的缩放处理
    handleZoomChange(delta, { x: mouseX, y: mouseY });
  }, [handleZoomChange, isControlledExternally]);

  // 双击适应内容
  const handleDoubleClick = useCallback(() => {
    handleFitToContent();
  }, [handleFitToContent]);

  // 移除不再使用的computeStep函数

  // 移除标尺绘制代码，统一使用RulerGuides组件

  // 移除从标尺拖拽创建参考线的代码，统一使用RulerGuides组件

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
    const effectiveZoom = isControlledExternally ? zoomPanContext.zoom : viewport.zoom;
    setShowOverview(effectiveZoom < 0.3);
  }, [viewport.zoom, zoomPanContext.zoom, isControlledExternally]);

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
    const offToggleGrid = canvasEvents.on('toggleGrid', () => {
      const st = useCanvasStore.getState();
      st.setShowGrid(!st.showGrid);
    });
    // toggleGuides 事件由 RulerGuides 组件处理，这里不重复监听
    const offToggleRuler = canvasEvents.on('toggleRuler', () => {
      const st = useCanvasStore.getState();
      st.setShowRuler(!st.showRuler);
    });
    const offReset = canvasEvents.on('resetView', () => setViewport({ x: 0, y: 0, zoom: 1 }));
    const offZoomIn = canvasEvents.on('zoomIn', () => handleZoomChange(1));
    const offZoomOut = canvasEvents.on('zoomOut', () => handleZoomChange(-1));
    return () => {
      canvasEvents.off('fitToContent', offFit as any);
      canvasEvents.off('toggleGrid', offToggleGrid as any);
      // toggleGuides 事件由 RulerGuides 组件处理
      canvasEvents.off('toggleRuler', offToggleRuler as any);
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
          // 网格、标尺、参考线的快捷键由 TopToolbar 统一处理，这里不重复定义
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

      {/* 画布区域 */}
      <CanvasAreaWrapper>

        <InfiniteCanvasArea
          key={`${containerSize.width}x${containerSize.height}`}
          ref={canvasRef}
          $showGrid={showGrid}
          $gridSize={gridSize}
          $isControlledExternally={isControlledExternally}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={isControlledExternally ? undefined : handleWheel}
          onDoubleClick={isControlledExternally ? undefined : handleDoubleClick}
        >
          {/* 无限画布内容 */}
          <InfiniteCanvas
            $isControlledExternally={isControlledExternally}
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

        {/* 参考线渲染（世界->屏幕转换） - 在外部控制模式下由RulerGuides组件处理 */}
        {!isControlledExternally && guides.map(g => {
          const effectiveZoom = viewport.zoom;
          const effectivePanX = viewport.x;
          const effectivePanY = viewport.y;

          return (
            <GuideLine
              key={g.id}
              $orientation={g.type}
              $positionPx={
                g.type === 'vertical'
                  ? Math.round(g.position * effectiveZoom + effectivePanX)
                  : Math.round(g.position * effectiveZoom + effectivePanY)
              }
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startMouse = { x: e.clientX, y: e.clientY };
                const startPos = g.position;
                const move = (ev: MouseEvent) => {
                  const dx = (ev.clientX - startMouse.x) / Math.max(effectiveZoom, 0.01);
                  const dy = (ev.clientY - startMouse.y) / Math.max(effectiveZoom, 0.01);
                  setGuides(prev => prev.map(it => it.id === g.id ? {
                    ...it,
                    position: it.type === 'vertical' ? startPos + dx : startPos + dy
                  } : it));
                };
                const up = () => {
                  window.removeEventListener('mousemove', move);
                  window.removeEventListener('mouseup', up);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
              }}
            />
          );
        })}

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