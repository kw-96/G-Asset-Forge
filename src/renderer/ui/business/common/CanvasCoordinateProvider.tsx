/**
 * 统一画布坐标系统提供者
 * - 实现所有坐标系统逻辑
 * - 管理缩放、平移、网格、标尺、辅助线等状态
 * - 提供统一的坐标转换和计算服务
 */

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { CanvasCoordinateContext, CanvasCoordinateContextValue } from './CanvasCoordinateContext';



export interface CanvasCoordinateProviderProps {
  children: ReactNode;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  initialGridSize?: number;
  initialShowGrid?: boolean;
  initialShowRuler?: boolean;
  initialShowGuides?: boolean;
}

export const CanvasCoordinateProvider: React.FC<CanvasCoordinateProviderProps> = ({
  children,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  initialGridSize = 1,
  initialShowGrid = true,
  initialShowRuler = true,
  initialShowGuides = true
}) => {
  // 基础变换状态
  const [zoom, setZoomState] = useState(initialZoom);
  const [pan, setPanState] = useState(initialPan);
  
  // 网格系统状态
  const [gridSize, setGridSizeState] = useState(initialGridSize);
  const [showGrid, setShowGridState] = useState(initialShowGrid);
  const [snapToGridEnabled, setSnapToGridEnabledState] = useState(false);
  
  // 标尺系统状态
  const [showRuler, setShowRulerState] = useState(initialShowRuler);
  
  // 辅助线系统状态
  const [showGuides, setShowGuidesState] = useState(initialShowGuides);
  const [guides, setGuidesState] = useState<Array<{
    id: string;
    type: 'vertical' | 'horizontal';
    position: number;
    active?: boolean;
  }>>([]);
  const [snapToGuidesEnabled, setSnapToGuidesEnabledState] = useState(false);
  
  // 拖拽模式管理
  const [dragMode, setDragModeState] = useState<'none' | 'canvas-pan' | 'object-drag' | 'guide-drag'>('none');
  
  // 视口状态
  const [viewportSize, setViewportSizeState] = useState({ width: 0, height: 0 });

  // 缩放控制
  const setZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(32, newZoom));
    
    // 调试信息：记录缩放变化
    // if (process.env['NODE_ENV'] === 'development') {
    //   // console.log(`🎛️ 坐标系统缩放: ${zoom.toFixed(2)}x → ${clampedZoom.toFixed(2)}x`, {
    //     原始值: newZoom.toFixed(2),
    //     限制后: clampedZoom.toFixed(2),
    //     变化: ((clampedZoom - zoom) > 0 ? '+' : '') + (clampedZoom - zoom).toFixed(2),
    //     网格阈值: clampedZoom >= 8 ? '✅ 达到' : '❌ 未达到'
    //   });
    // }
    
    setZoomState(clampedZoom);
  }, [zoom]);

  const zoomIn = useCallback(() => {
    // 参考Suika的缩放级别数组
    const zoomLevels = [0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    const nextZoom = zoomLevels[nextIndex];
    if (nextZoom !== undefined) {
      setZoomState(nextZoom);
    }
  }, [zoom]);

  const zoomOut = useCallback(() => {
    // 参考Suika的缩放级别数组
    const zoomLevels = [0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevZoom = zoomLevels[prevIndex];
    if (prevZoom !== undefined) {
      setZoomState(prevZoom);
    }
  }, [zoom]);

  const resetView = useCallback(() => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 }); // 无限画布：支持任意pan值
  }, []);

  const zoomToFit = useCallback(() => {
    // TODO: 根据内容计算合适的缩放级别
    setZoomState(1);
    setPanState({ x: 0, y: 0 }); // 无限画布：支持任意pan值
  }, []);

  // 平移控制
  const setPan = useCallback((newPan: { x: number; y: number }) => {
    setPanState(newPan);
  }, []);

  // 网格控制
  const setGridSize = useCallback((newSize: number) => {
    setGridSizeState(Math.max(1, newSize));
  }, []);

  const setShowGrid = useCallback((show: boolean) => {
    setShowGridState(show);
  }, []);

  const setSnapToGrid = useCallback((snap: boolean) => {
    setSnapToGridEnabledState(snap);
  }, []);

  // 标尺控制
  const setShowRuler = useCallback((show: boolean) => {
    setShowRulerState(show);
  }, []);

  // 辅助线控制
  const setShowGuides = useCallback((show: boolean) => {
    setShowGuidesState(show);
  }, []);

  const addGuide = useCallback((guide: { id: string; type: 'vertical' | 'horizontal'; position: number }) => {
    const newGuide = {
      id: guide.id,
      type: guide.type,
      position: guide.position,
      active: true
    };
    setGuidesState(prev => [...prev, newGuide]);
  }, []);

  const removeGuide = useCallback((id: string) => {
    setGuidesState(prev => prev.filter(guide => guide.id !== id));
  }, []);

  const updateGuidePosition = useCallback((id: string, newPosition: number) => {
    setGuidesState(prev => prev.map(guide => 
      guide.id === id ? { ...guide, position: newPosition } : guide
    ));
  }, []);

  const toggleGuideActive = useCallback((id: string, active: boolean) => {
    setGuidesState(prev => prev.map(guide => 
      guide.id === id ? { ...guide, active } : guide
    ));
  }, []);

  const setSnapToGuides = useCallback((snap: boolean) => {
    setSnapToGuidesEnabledState(snap);
  }, []);

  // 拖拽模式控制
  const setDragMode = useCallback((mode: 'none' | 'canvas-pan' | 'object-drag' | 'guide-drag') => {
    setDragModeState(mode);
  }, []);

  const canStartDrag = useCallback((mode: 'canvas-pan' | 'object-drag' | 'guide-drag') => {
    // 拖拽优先级：辅助线 > 对象 > 画布平移
    if (dragMode === 'none') return true;
    if (mode === 'guide-drag') return true;
    if (mode === 'object-drag' && dragMode !== 'guide-drag') return true;
    return false;
  }, [dragMode]);

  // 视口控制
  const setViewportSize = useCallback((width: number, height: number) => {
    setViewportSizeState({ width, height });
  }, []);

  // 坐标转换方法
  const worldToScreen = useCallback((worldX: number, worldY: number) => ({
    x: worldX * zoom + pan.x,
    y: worldY * zoom + pan.y
  }), [zoom, pan.x, pan.y]);

  const screenToWorld = useCallback((screenX: number, screenY: number) => ({
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom
  }), [zoom, pan.x, pan.y]);

  // 网格相关计算 - 固定1px网格，与标尺刻度完全对齐
  const getGridSize = useCallback(() => {
    // 网格大小固定为1px，确保与标尺的1px刻度完全对齐
    const baseGridSize = 1; // 固定1px网格
    
    // 屏幕网格大小 = 1px * zoom
    const screenGridSize = baseGridSize * zoom;
    
    return { 
      base: baseGridSize, 
      screen: screenGridSize, 
      intervals: { major: 1, minor: 1, micro: 1 } // 固定间隔
    };
  }, [zoom]);

  // 检查网格是否应该显示（参考Suika的简化逻辑）
  const shouldShowGrid = useCallback(() => {
    if (!showGrid) {
      return false;
    }
    
    // 修复：参考Suika，降低缩放阈值，让网格在正常缩放级别下显示
    // 与Suika保持一致，网格应该在1x缩放时就能显示
    const minPixelGridZoom = 1; // 修复：从8改为1，与Suika一致
    
    return zoom >= minPixelGridZoom;
  }, [showGrid, zoom]);

  // 统一的坐标计算函数，确保网格和标尺刻度完全同步
  const getUnifiedCoordinateInfo = useCallback((isHorizontal: boolean, containerSize: number) => {
    // 网格固定为1px，从(0,0)开始对齐
    const base = 1;
    
    // 使用与标尺刻度完全相同的可见范围计算逻辑
    const startWorld = isHorizontal ? 
      screenToWorld(0, 0).x : 
      screenToWorld(0, 0).y;
    const endWorld = isHorizontal ? 
      screenToWorld(containerSize, 0).x : 
      screenToWorld(0, containerSize).y;
    
    const buffer = Math.abs(endWorld - startWorld) * 0.1;
    const visibleStart = Math.min(startWorld, endWorld) - buffer;
    const visibleEnd = Math.max(startWorld, endWorld) + buffer;
    
    // 网格从(0,0)开始，每1px一个，与标尺刻度完全对齐
    const gridStart = Math.floor(visibleStart / base) * base;
    
    // 计算网格偏移，确保与标尺刻度完全同步
    const worldOffset = visibleStart - gridStart;
    
    return {
      base,
      visibleStart,
      visibleEnd,
      gridStart,
      worldOffset,
      containerSize
    };
  }, [screenToWorld]);

  // 基于世界坐标计算网格偏移，与标尺刻度完全对齐
  const getGridOffset = useCallback(() => {
    const { worldOffset } = getUnifiedCoordinateInfo(true, Math.max(viewportSize.width, viewportSize.height));
    
    // 转换回屏幕坐标
    const screenOffsetX = worldOffset * zoom;
    const screenOffsetY = worldOffset * zoom;
    
    return {
      x: screenOffsetX,
      y: screenOffsetY
    };
  }, [zoom, pan.x, pan.y, getUnifiedCoordinateInfo, viewportSize]);

  // 基于世界坐标的网格捕捉，与标尺刻度完全对齐
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!snapToGridEnabled) return { x, y };
    
    const { base } = getGridSize();
    
    // 将屏幕坐标转换为世界坐标
    const worldX = (x - pan.x) / zoom;
    const worldY = (y - pan.y) / zoom;
    
    // 在世界坐标中进行网格捕捉，使用与标尺刻度相同的逻辑
    const snappedWorldX = Math.round(worldX / base) * base;
    const snappedWorldY = Math.round(worldY / base) * base;
    
    // 转换回屏幕坐标
    const snappedX = snappedWorldX * zoom + pan.x;
    const snappedY = snappedWorldY * zoom + pan.y;
    
    return { x: snappedX, y: snappedY };
  }, [snapToGridEnabled, getGridSize, zoom, pan.x, pan.y]);

  // 辅助线相关计算
  const getGuidePositions = useCallback(() => {
    const positions: number[] = [];
    guides.forEach(guide => {
      if (guide.type === 'vertical') {
        positions.push(guide.position);
      } else if (guide.type === 'horizontal') {
        positions.push(guide.position);
      }
    });
    return positions;
  }, [guides]);

  const isGuideActive = useCallback((id: string) => {
    return guides.find(guide => guide.id === id)?.active || false;
  }, [guides]);

  const snapToGuides = useCallback((x: number, y: number) => {
    if (!snapToGuidesEnabled) return { x, y };

    const guidePositions = getGuidePositions();
    let snappedX = x;
    let snappedY = y;

    if (guidePositions.length > 0) {
      const minDistance = Math.min(
        ...guidePositions.map(pos => Math.abs(pos - x)),
        ...guidePositions.map(pos => Math.abs(pos - y))
      );

      if (minDistance < 10) { // 允许轻微偏移，避免完全贴合
        const closestGuide = guidePositions.reduce((prev, curr) => {
          const prevDist = Math.abs(prev - x);
          const currDist = Math.abs(curr - x);
          return currDist < prevDist ? curr : prev;
        });
        snappedX = closestGuide;
      }
    }

    return { x: snappedX, y: snappedY };
  }, [snapToGuidesEnabled, getGuidePositions]);

  // 添加缺失的snapToGuide方法
  const snapToGuide = useCallback((x: number, y: number, type: 'vertical' | 'horizontal') => {
    if (!snapToGuidesEnabled) return { x, y };

    const relevantGuides = guides.filter(guide => guide.type === type);
    if (relevantGuides.length === 0) return { x, y };

    const positions = relevantGuides.map(guide => guide.position);
    if (positions.length === 0) return { x, y };
    
    const targetCoord = type === 'vertical' ? x : y;
    
    let closestPosition = positions[0]!; // 断言不为undefined，因为我们已经检查了长度
    let minDistance = Math.abs(targetCoord - closestPosition);
    
    for (const pos of positions) {
      const distance = Math.abs(targetCoord - pos);
      if (distance < minDistance) {
        minDistance = distance;
        closestPosition = pos;
      }
    }

    // 确保closestPosition不为undefined
    if (typeof closestPosition === 'undefined') {
      return { x, y };
    }

    // 如果距离小于阈值，则吸附
    if (minDistance < 10) {
      if (type === 'vertical') {
        return { x: closestPosition, y };
      } else {
        return { x, y: closestPosition };
      }
    }

    return { x, y };
  }, [snapToGuidesEnabled, guides]);

  // 标尺刻度计算
  const getRulerTicks = useCallback((isHorizontal: boolean, containerSize: number) => {
    const ticks: Array<{
      position: number;
      worldValue: number;
      type: 'major' | 'minor' | 'micro';
      height: number;
      showLabel: boolean;
    }> = [];

    // 计算刻度间距（参考Suika的算法）
    const getTickIntervals = (zoomLevel: number) => {
      // 参考Suika的步长算法：50 / zoom = 步长
      const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
      const step = 50 / zoomLevel;
      
      let majorStep = steps[0]!; // 确保不为undefined
      for (let i = 0, len = steps.length; i < len; i++) {
        if (steps[i]! >= step) {
          majorStep = steps[i]!;
          break;
        }
      }
      
      // 计算次要和微小刻度
      const minorStep = Math.max(1, majorStep / 5);
      const microStep = 1; // 网格固定为1px
      
      return { 
        major: majorStep, 
        minor: minorStep, 
        micro: microStep 
      };
    };

    const intervals = getTickIntervals(zoom);
    
    // 使用统一的坐标计算，确保与网格完全同步
    const { visibleStart, visibleEnd } = getUnifiedCoordinateInfo(isHorizontal, containerSize);

    // 生成微刻度 - 1px精度显示条件
    if (zoom >= 2) { // 只在较高缩放下显示微刻度，避免过于密集
      let microCount = 0; // 调试：计数生成的微刻度
      
      // 基于世界坐标生成微刻度，每1个世界单位一个微刻度
      const microStart = Math.floor(visibleStart / intervals.micro) * intervals.micro;
      
      for (let world = microStart; world <= visibleEnd; world += intervals.micro) {
        // 跳过与主刻度和次刻度重叠的位置
        if (intervals.minor > 1 && world % intervals.minor === 0) continue;
        if (world % intervals.major === 0) continue;
        
        const screenPos = isHorizontal ? 
          worldToScreen(world, 0).x : 
          worldToScreen(0, world).y;
        
        if (screenPos >= -10 && screenPos <= containerSize + 10) {
          ticks.push({
            position: Math.round(screenPos) + 0.5, // 确保像素精确对齐
            worldValue: world,
            type: 'micro',
            height: 3,
            showLabel: false
          });
          microCount++;
        }
      }
      
      // 调试输出
      if (typeof window !== 'undefined' && (window as any).__GAF_DEBUG_MICRO) {
        // console.log(`微刻度生成: zoom=${zoom}, intervals=${JSON.stringify(intervals)}, 生成数量=${microCount}, 世界范围=[${Math.floor(visibleStart)}, ${Math.ceil(visibleEnd)}]`);
      }
    }

    // 生成次刻度 - 1px精度对齐
    if (zoom < 0.8) {
      const minorStart = Math.floor(visibleStart / intervals.minor) * intervals.minor;
      for (let world = minorStart; world <= visibleEnd; world += intervals.minor) {
        if (world % intervals.major === 0) continue; // 跳过主刻度位置
        
        const screenPos = isHorizontal ? 
          worldToScreen(world, 0).x : 
          worldToScreen(0, world).y;
        
        if (screenPos >= -10 && screenPos <= containerSize + 10) {
          ticks.push({
             position: Math.round(screenPos) + 0.5, // 确保像素精确对齐
             worldValue: world,
             type: 'minor',
             height: 5,
             showLabel: zoom > 1.5 && world % 5 === 0 && Math.abs(world) >= 5
          });
        }
      }
    }

    // 生成主刻度 - 1px精度对齐
    const majorStart = Math.floor(visibleStart / intervals.major) * intervals.major;
    for (let world = majorStart; world <= visibleEnd; world += intervals.major) {
      const screenPos = isHorizontal ? 
        worldToScreen(world, 0).x : 
        worldToScreen(0, world).y;
      
      if (screenPos >= -50 && screenPos <= containerSize + 50) {
                 ticks.push({
           position: Math.round(screenPos) + 0.5, // 确保像素精确对齐
           worldValue: world,
           type: 'major',
           height: 8,
           showLabel: world % 5 === 0 && Math.abs(world) >= 5 // 只显示5的倍数且5px以外
         });
      }
    }

    return ticks;
  }, [zoom, worldToScreen, screenToWorld, getUnifiedCoordinateInfo]);

  // 视口相关计算
  const getVisibleBounds = useCallback(() => {
    const { width, height } = viewportSize;
    if (width === 0 || height === 0) {
      return { minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 };
    }
    
    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(width, height);
    
    return {
      minX: Math.min(topLeft.x, bottomRight.x),
      maxX: Math.max(topLeft.x, bottomRight.x),
      minY: Math.min(topLeft.y, bottomRight.y),
      maxY: Math.max(topLeft.y, bottomRight.y)
    };
  }, [viewportSize, screenToWorld]);

  const isInViewport = useCallback((worldX: number, worldY: number) => {
    const bounds = getVisibleBounds();
    return worldX >= bounds.minX && worldX <= bounds.maxX && 
           worldY >= bounds.minY && worldY <= bounds.maxY;
  }, [getVisibleBounds]);

  // 构建上下文值
  const contextValue: CanvasCoordinateContextValue = useMemo(() => ({
    // 状态
    zoom,
    pan,
    gridSize,
    showGrid,
    snapToGridEnabled,
    showRuler,
    showGuides,
    guides,
    snapToGuidesEnabled,
    dragMode,
    viewport: {
      width: viewportSize.width,
      height: viewportSize.height,
      bounds: {
        minX: -10000,
        maxX: 10000,
        minY: -10000,
        maxY: 10000
      }
    },
    
    // Params
    setZoom,
    setPan,
    resetView,
    zoomIn,
    zoomOut,
    zoomToFit,
    setGridSize,
    setShowGrid,
    setSnapToGrid,
    setShowRuler,
    setShowGuides,
    addGuide,
    removeGuide,
    updateGuidePosition,
    toggleGuideActive,
    setSnapToGuides,
    setViewportSize,
    
    // 转换方法
    worldToScreen,
    screenToWorld,
    getGridOffset,
    snapToGrid,
    getGridSize,
    shouldShowGrid,
    getRulerTicks,
    getVisibleBounds,
    isInViewport,
    getGuidePositions,
    isGuideActive,
    snapToGuides,
    snapToGuide,
    setDragMode,
    canStartDrag
  }), [
    zoom, pan, gridSize, showGrid, snapToGridEnabled, showRuler, showGuides, guides, snapToGuidesEnabled, dragMode, viewportSize,
    setZoom, setPan, resetView, zoomIn, zoomOut, zoomToFit,
    setGridSize, setShowGrid, setSnapToGrid, setShowRuler, setShowGuides, addGuide, removeGuide, updateGuidePosition, toggleGuideActive, setSnapToGuides, setViewportSize,
    worldToScreen, screenToWorld, getGridOffset, snapToGrid, getGridSize, shouldShowGrid,
    getRulerTicks, getVisibleBounds, isInViewport, getGuidePositions, isGuideActive, snapToGuides, snapToGuide,
    setDragMode, canStartDrag
  ]);

  return (
    <CanvasCoordinateContext.Provider value={contextValue}>
      {children}
    </CanvasCoordinateContext.Provider>
  );
};
