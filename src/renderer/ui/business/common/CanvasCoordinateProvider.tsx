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
    setZoomState(clampedZoom);
  }, []);

  const zoomIn = useCallback(() => {
    const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    const nextZoom = zoomLevels[nextIndex];
    if (nextZoom !== undefined) {
      setZoomState(nextZoom);
    }
  }, [zoom]);

  const zoomOut = useCallback(() => {
    const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevZoom = zoomLevels[prevIndex];
    if (prevZoom !== undefined) {
      setZoomState(prevZoom);
    }
  }, [zoom]);

  const resetView = useCallback(() => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
  }, []);

  const zoomToFit = useCallback(() => {
    // TODO: 根据内容计算合适的缩放级别
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
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

  // 网格相关计算 - 完全基于世界坐标，与标尺刻度对齐
  const getGridSize = useCallback(() => {
    // 使用与标尺刻度相同的间距逻辑
    const getTickIntervals = (zoomLevel: number) => {
      if (zoomLevel < 0.3) return { major: 500, minor: 100, micro: 1 };
      if (zoomLevel < 0.8) return { major: 200, minor: 50, micro: 1 };
      if (zoomLevel < 2) return { major: 100, minor: 20, micro: 1 };
      if (zoomLevel < 5) return { major: 50, minor: 10, micro: 1 };
      if (zoomLevel < 10) return { major: 20, minor: 5, micro: 1 };
      if (zoomLevel < 20) return { major: 10, minor: 2, micro: 1 };
      return { major: 10, minor: 5, micro: 1 };
    };
    
         const intervals = getTickIntervals(zoom);
     // 网格大小使用微刻度间距，确保与1px精度微刻度完全对齐
     const alignedGridSize = intervals.micro; // 使用微刻度间距，即1个世界单位
     
     const baseGridSize = Math.max(1, alignedGridSize);
     const screenGridSize = Math.max(1, baseGridSize * zoom);
     
     return { base: baseGridSize, screen: screenGridSize, intervals };
  }, [gridSize, zoom]);

  // 检查网格是否应该显示（基于最小像素阈值）
  const shouldShowGrid = useCallback(() => {
    if (!showGrid) return false;
    
    const { screen } = getGridSize();
    // 网格现在基于微刻度（1px世界单位），需要更小的最小阈值
    const minGridPixelSize = 10; // 最小网格像素大小，允许更精细的网格显示
    
    return screen >= minGridPixelSize;
  }, [showGrid, getGridSize]);

  // 统一的坐标计算函数，确保网格和标尺刻度完全同步
  const getUnifiedCoordinateInfo = useCallback((isHorizontal: boolean, containerSize: number) => {
    const { base } = getGridSize();
    
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
    
    // 计算世界坐标中的网格起始点，与标尺刻度使用完全相同的起始点
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
  }, [getGridSize, screenToWorld]);

  // 基于世界坐标计算网格偏移，与标尺刻度完全对齐
  const getGridOffset = useCallback(() => {
    const { base, worldOffset } = getUnifiedCoordinateInfo(true, Math.max(viewportSize.width, viewportSize.height));
    
    // 转换回屏幕坐标
    const screenOffsetX = worldOffset * zoom;
    const screenOffsetY = worldOffset * zoom;
    
    // 调试输出
    if (typeof window !== 'undefined' && (window as any).__GAF_DEBUG_GRID) {
      console.log(`网格偏移计算: base=${base}, zoom=${zoom}, pan=[${pan.x}, ${pan.y}], 世界偏移=${worldOffset.toFixed(2)}, 屏幕偏移=[${screenOffsetX.toFixed(2)}, ${screenOffsetY.toFixed(2)}]`);
    }
    
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
    
    // 调试输出
    if (typeof window !== 'undefined' && (window as any).__GAF_DEBUG_GRID) {
      console.log(`网格捕捉: 输入=[${x}, ${y}], 世界坐标=[${worldX.toFixed(2)}, ${worldY.toFixed(2)}], 捕捉后世界坐标=[${snappedWorldX}, ${snappedWorldY}], 输出=[${snappedX.toFixed(2)}, ${snappedY.toFixed(2)}]`);
    }
    
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

    // 计算刻度间距 - 确保微刻度精确到1px
    const getTickIntervals = (zoomLevel: number) => {
      // 基于1px精度的刻度设计
      if (zoomLevel < 0.3) return { major: 1000, minor: 500, micro: 1 }; // 1px精度
      if (zoomLevel < 0.8) return { major: 200, minor: 100, micro: 1 };  // 1px精度
      if (zoomLevel < 2) return { major: 100, minor: 50, micro: 1 };    // 1px精度
      // if (zoomLevel < 5) return { major: 50, minor: 10, micro: 1 };     // 1px精度
      if (zoomLevel < 10) return { major: 20, minor: 10, micro: 1 };     // 1px精度
      if (zoomLevel < 20) return { major: 10, minor: 5, micro: 1 };     // 1px精度
      return { major: 5, minor: 1, micro: 1 };                        // 最大缩放下的间距
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
        console.log(`微刻度生成: zoom=${zoom}, intervals=${JSON.stringify(intervals)}, 生成数量=${microCount}, 世界范围=[${Math.floor(visibleStart)}, ${Math.ceil(visibleEnd)}]`);
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
