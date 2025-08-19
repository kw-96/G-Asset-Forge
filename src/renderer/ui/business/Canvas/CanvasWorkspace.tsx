/**
 * 画布工作区组件 - 使用统一坐标系统
 * - 显示画布对象
 * - 处理画布交互
 * - 使用统一的坐标系统进行缩放、平移、网格等操作
 */

import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
// useCanvasStore已不再需要，网格由CanvasGrid组件处理
import { useCanvasCoordinate } from '../common/CanvasCoordinateContext';
// CanvasContainer已由外层ZoomPanContainer提供，无需重复嵌套

// 画布工作区容器 - 无限画布实现
const WorkspaceContainer = styled.div`
  position: relative;
  // width: 10000px; /* 无限画布宽度 */
  // height: 10000px; /* 无限画布高度 */
  // background: ${({ theme }) => theme.colors.canvas.background};
  overflow: visible; /* 允许内容超出 */
`;

// 无限画布区域 - 网格已由CanvasGrid组件处理
const InfiniteCanvasArea = styled.div`
  position: absolute;
  inset: 0;
  background: transparent; /* 网格由CanvasGrid组件渲染 */
`;

// 画布对象容器
const CanvasObjectsContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

// 画布对象
const CanvasObject = styled.div<{ $x: number; $y: number; $width: number; $height: number }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  background: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`;

// 画布对象接口
interface CanvasObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

// 画布工作区组件接口
interface CanvasWorkspaceProps {
  externalObjects?: Array<{
    id: any;
    type: "text" | "shape" | "template";
    worldX: number;
    worldY: number;
    width: number;
    height: number;
    content: any;
    selected: boolean;
  }>;
}

// 画布工作区组件
export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ externalObjects }) => {
  // gridSize已由CanvasGrid组件处理，无需在此处使用
  const { zoom, screenToWorld, snapToGrid, canStartDrag, setDragMode } = useCanvasCoordinate();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  
  // 处理外部对象数据
  React.useEffect(() => {
    if (externalObjects && externalObjects.length > 0) {
      const convertedObjects: CanvasObject[] = externalObjects.map(obj => ({
        id: obj.id,
        x: obj.worldX,
        y: obj.worldY,
        width: obj.width,
        height: obj.height,
        type: obj.type
      }));
      setObjects(convertedObjects);
    }
  }, [externalObjects]);
  const isMouseDown = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const selectedObject = useRef<{ id: string; startPos: { x: number; y: number } } | null>(null);

  // 添加对象
  const addObject = useCallback((newObject: CanvasObject) => {
    setObjects(prev => [...prev, newObject]);
  }, []);

  // 更新对象
  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  }, []);

  // 删除对象
  const removeObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  }, []);

  // 处理画布点击 - 添加新对象
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // 只在画布空白区域点击时添加对象
    
    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // 转换为世界坐标
    const worldPos = screenToWorld(screenX, screenY);
    
    // 如果启用网格吸附，则吸附到网格
    const finalPos = snapToGrid(worldPos.x, worldPos.y);
    
    const newObject: CanvasObject = {
      id: `object-${Date.now()}`,
      x: finalPos.x,
      y: finalPos.y,
      width: 100,
      height: 100,
      type: 'rectangle'
    };
    
    addObject(newObject);
  }, [addObject, screenToWorld, snapToGrid]);

  // 处理对象选择
  const handleObjectClick = useCallback((e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    setSelectedObjectId(objectId);
  }, []);

  // 处理对象拖拽开始
  const handleObjectMouseDown = useCallback((e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    
    // 检查是否可以开始对象拖拽
    if (!canStartDrag('object-drag')) return;
    
    // 设置拖拽模式
    setDragMode('object-drag');
    
    isMouseDown.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    
    const object = objects.find((obj: CanvasObject) => obj.id === objectId);
    if (object) {
      selectedObject.current = {
        id: objectId,
        startPos: { x: object.x, y: object.y }
      };
    }
    
    document.addEventListener('mousemove', handleObjectMouseMove);
    document.addEventListener('mouseup', handleObjectMouseUp);
  }, [objects, canStartDrag, setDragMode]);

  // 处理对象拖拽移动
  const handleObjectMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown.current || !selectedObject.current) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    // 转换为世界坐标的偏移
    const worldDeltaX = deltaX / zoom;
    const worldDeltaY = deltaY / zoom;
    
    const newX = selectedObject.current.startPos.x + worldDeltaX;
    const newY = selectedObject.current.startPos.y + worldDeltaY;
    
    // 如果启用网格吸附，则吸附到网格
    const snappedPos = snapToGrid(newX, newY);
    
    updateObject(selectedObject.current.id, {
      x: snappedPos.x,
      y: snappedPos.y
    });
  }, [zoom, snapToGrid, updateObject]);

  // 处理对象拖拽结束
  const handleObjectMouseUp = useCallback(() => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      // 重置拖拽模式
      setDragMode('none');
      selectedObject.current = null;
      document.removeEventListener('mousemove', handleObjectMouseMove);
      document.removeEventListener('mouseup', handleObjectMouseUp);
    }
  }, [setDragMode]);

  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedObjectId) {
      removeObject(selectedObjectId);
      setSelectedObjectId(null);
    }
  }, [selectedObjectId, removeObject]);

  // 适应内容 - 暂时注释掉，后续实现
  // const handleFitToContent = useCallback(() => {
  //   if (objects.length === 0) return;
  //   
  //   // 计算所有对象的边界
  //   let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  //   
  //   objects.forEach((obj: CanvasObject) => {
  //     minX = Math.min(minX, obj.x);
  //     minY = Math.min(minY, obj.y);
  //     maxX = Math.max(maxX, obj.x + obj.width);
  //     maxY = Math.max(maxY, obj.y + obj.height);
  //   });
  //   
  //   // 添加边距
  //   const padding = 100;
  //   minX -= padding;
  //   minY -= padding;
  //   maxX += padding;
  //   maxY += padding;
  //   
  //   // 计算合适的缩放级别和位置
  //   const contentWidth = maxX - minX;
  //   const contentHeight = maxY - minY;
  //   
  //   // TODO: 实现智能缩放计算
  //   console.log('适应内容:', { minX, minY, maxX, maxY, contentWidth, contentHeight });
  // }, [objects]);

  return (
    <WorkspaceContainer
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 画布背景 - 网格已由CanvasGrid组件处理 */}
      <InfiniteCanvasArea />
      
      {/* 画布对象 */}
      <CanvasObjectsContainer onClick={handleCanvasClick}>
        {objects.map((obj: CanvasObject) => (
              <CanvasObject
                key={obj.id}
            $x={obj.x}
            $y={obj.y}
                $width={obj.width}
                $height={obj.height}
            onClick={(e) => handleObjectClick(e, obj.id)}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
                style={{
              borderColor: selectedObjectId === obj.id ? '#ff6b6b' : undefined,
              borderWidth: selectedObjectId === obj.id ? '3px' : '2px'
                }}
              />
            ))}
      </CanvasObjectsContainer>
    </WorkspaceContainer>
  );
};