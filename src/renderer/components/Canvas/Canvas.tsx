import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';
import { IconButton, Tooltip } from '../../ui';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  GridIcon,
  RulerSquareIcon
} from '@radix-ui/react-icons';

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.canvas};
`;

const RulersContainer = styled.div<{ $showRulers: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  ${({ $showRulers }) => !$showRulers && 'display: none;'}
`;

const HorizontalRuler = styled.div`
  position: absolute;
  top: 0;
  left: 20px;
  right: 0;
  height: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
`;

const VerticalRuler = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 0;
  width: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
`;

const RulerCorner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const ViewportContainer = styled.div<{ 
  $showRulers: boolean; 
  $activeTool: string; 
}>`
  position: absolute;
  top: ${({ $showRulers }) => $showRulers ? '20px' : '0'};
  left: ${({ $showRulers }) => $showRulers ? '20px' : '0'};
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: ${({ $activeTool }) => {
    switch ($activeTool) {
      case 'select': return 'default';
      case 'hand': return 'grab';
      case 'text': return 'text';
      case 'rectangle':
      case 'ellipse':
      case 'frame': return 'crosshair';
      default: return 'crosshair';
    }
  }};
  
  &:active {
    cursor: ${({ $activeTool }) => $activeTool === 'hand' ? 'grabbing' : undefined};
  }
`;

const GridBackground = styled.div<{ 
  $showGrid: boolean; 
  $zoom: number; 
  $offsetX: number; 
  $offsetY: number; 
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.canvas.background};
  
  ${({ $showGrid, $zoom, $offsetX, $offsetY, theme }) => 
    $showGrid && `
      background-image: 
        linear-gradient(${theme.colors.canvas.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${theme.colors.canvas.grid} 1px, transparent 1px);
      background-size: ${20 * $zoom}px ${20 * $zoom}px;
      background-position: ${$offsetX}px ${$offsetY}px;
    `
  }
`;

const CanvasElement = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $selected: boolean;
  $zoom: number;
  $offsetX: number;
  $offsetY: number;
}>`
  position: absolute;
  left: ${({ $x, $zoom, $offsetX }) => ($x * $zoom) + $offsetX}px;
  top: ${({ $y, $zoom, $offsetY }) => ($y * $zoom) + $offsetY}px;
  width: ${({ $width, $zoom }) => $width * $zoom}px;
  height: ${({ $height, $zoom }) => $height * $zoom}px;
  cursor: pointer;
  border: ${({ $selected, theme }) => 
    $selected ? `2px solid ${theme.colors.canvas.selection}` : '1px solid transparent'
  };
  
  &:hover {
    border: ${({ $selected, theme }) => 
      $selected 
        ? `2px solid ${theme.colors.canvas.selection}` 
        : `1px solid ${theme.colors.border.hover}`
    };
  }
`;

const RectangleElement = styled(CanvasElement)<{
  $fill?: string | undefined;
  $stroke?: string | undefined;
  $strokeWidth?: number | undefined;
  $borderRadius?: number | undefined;
}>`
  background: ${({ $fill }) => $fill || '#3b82f6'};
  border-color: ${({ $stroke }) => $stroke || '#e5e7eb'};
  border-width: ${({ $strokeWidth }) => $strokeWidth || 1}px;
  border-radius: ${({ $borderRadius }) => $borderRadius || 4}px;
  border-style: solid;
`;

const EllipseElement = styled(CanvasElement)<{
  $fill?: string | undefined;
  $stroke?: string | undefined;
  $strokeWidth?: number | undefined;
}>`
  background: ${({ $fill }) => $fill || '#3b82f6'};
  border-color: ${({ $stroke }) => $stroke || '#e5e7eb'};
  border-width: ${({ $strokeWidth }) => $strokeWidth || 1}px;
  border-radius: 50%;
  border-style: solid;
`;

const TextElement = styled(CanvasElement)<{
  $fill?: string | undefined;
}>`
  background: transparent;
  color: ${({ $fill }) => $fill || '#1f2937'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  &::after {
    content: 'Sample Text';
  }
`;

const FrameElement = styled(CanvasElement)<{
  $stroke?: string | undefined;
  $strokeWidth?: number | undefined;
}>`
  background: transparent;
  border-color: ${({ $stroke }) => $stroke || '#e5e7eb'};
  border-width: ${({ $strokeWidth }) => $strokeWidth || 1}px;
  border-style: dashed;
  border-radius: 4px;
`;

const CanvasControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  z-index: 100;
`;

const ZoomDisplay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  z-index: 100;
`;

const Canvas: React.FC = () => {
  const {
    canvasZoom,
    canvasX,
    canvasY,
    showGrid,
    showRulers,
    elements,
    selectedElements,
    activeTool,
    setCanvasZoom,
    setCanvasPosition,
    setShowGrid,
    setShowRulers,
    selectElements,
    clearSelection,
    addElement,
    setActiveTool
  } = useAppStore();

  // 初始化一些示例元素（仅用于测试）
  React.useEffect(() => {
    if (Object.keys(elements).length === 0) {
      const sampleElements = [
        {
          id: 'sample_rect_1',
          name: '示例矩形',
          type: 'rectangle' as const,
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          visible: true,
          locked: false,
          fill: '#3b82f6',
          stroke: '#e5e7eb',
          strokeWidth: 1,
          borderRadius: 8
        },
        {
          id: 'sample_ellipse_1', 
          name: '示例椭圆',
          type: 'ellipse' as const,
          x: 300,
          y: 120,
          width: 120,
          height: 80,
          visible: true,
          locked: false,
          fill: '#10b981',
          stroke: '#e5e7eb',
          strokeWidth: 1
        },
        {
          id: 'sample_text_1',
          name: '示例文本',
          type: 'text' as const,
          x: 150,
          y: 250,
          width: 200,
          height: 40,
          visible: true,
          locked: false,
          fill: '#1f2937'
        }
      ];

      sampleElements.forEach(element => addElement(element));
    }
  }, [elements, addElement]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 处理画布拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'hand' || (e.button === 1)) { // 中键或抓手工具
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: canvasX, y: canvasY });
      e.preventDefault();
    }
  }, [activeTool, canvasX, canvasY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setCanvasPosition(dragOffset.x + deltaX, dragOffset.y + deltaY);
    }
  }, [isDragging, dragStart, dragOffset, setCanvasPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 处理缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setCanvasZoom(canvasZoom + delta);
  }, [canvasZoom, setCanvasZoom]);

  // 处理元素选择
  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      // 多选
      const currentSelection = [...selectedElements];
      const index = currentSelection.indexOf(elementId);
      if (index > -1) {
        currentSelection.splice(index, 1);
      } else {
        currentSelection.push(elementId);
      }
      selectElements(currentSelection);
    } else {
      // 单选
      selectElements([elementId]);
    }
  }, [selectedElements, selectElements]);

  // 处理画布点击（清除选择或创建元素）
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'select') {
      clearSelection();
    } else if (['rectangle', 'ellipse', 'text', 'frame'].includes(activeTool)) {
      // 获取点击位置
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - canvasX) / canvasZoom;
        const y = (e.clientY - rect.top - canvasY) / canvasZoom;
        
        // 创建新元素
        const newElement = {
          id: `${activeTool}_${Date.now()}`,
          name: `${activeTool} ${Object.keys(elements).length + 1}`,
          type: activeTool as 'rectangle' | 'ellipse' | 'text' | 'frame',
          x: x - 50, // 居中
          y: y - 25,
          width: activeTool === 'text' ? 120 : 100,
          height: activeTool === 'text' ? 30 : 50,
          visible: true,
          locked: false,
          fill: activeTool === 'text' ? '#000000' : '#3b82f6',
          stroke: '#e5e7eb',
          strokeWidth: 1,
          borderRadius: activeTool === 'ellipse' ? 50 : 4
        };
        
        addElement(newElement);
        selectElements([newElement.id]);
        
        // 创建后自动切换回选择工具
        setActiveTool('select');
      }
    }
  }, [activeTool, clearSelection, canvasX, canvasY, canvasZoom, elements, addElement, selectElements, setActiveTool]);

  // 缩放控制
  const handleZoomIn = () => setCanvasZoom(canvasZoom + 0.1);
  const handleZoomOut = () => setCanvasZoom(canvasZoom - 0.1);
  const handleZoomReset = () => {
    setCanvasZoom(1);
    setCanvasPosition(0, 0);
  };

  // 创建标尺刻度组件
  const RulerMark = styled.div<{ $position: number; $isHorizontal: boolean }>`
    position: absolute;
    ${({ $isHorizontal, $position }) => $isHorizontal ? `left: ${$position}px; top: 0;` : `top: ${$position}px; left: 0;`}
    ${({ $isHorizontal }) => $isHorizontal ? 'width: 1px; height: 10px;' : 'height: 1px; width: 10px;'}
    background: #666;
    font-size: 10px;
    color: #666;
  `;

  // 渲染标尺刻度
  const renderRulerMarks = (isHorizontal: boolean, length: number) => {
    const marks = [];
    const step = 50; // 每50px一个刻度
    const zoomedStep = step * canvasZoom;
    const offset = isHorizontal ? canvasX % zoomedStep : canvasY % zoomedStep;
    
    for (let i = -zoomedStep; i < length + zoomedStep; i += zoomedStep) {
      const position = i + offset;
      if (position >= 0 && position <= length) {
        marks.push(
          <RulerMark
            key={i}
            $position={position}
            $isHorizontal={isHorizontal}
          />
        );
      }
    }
    return marks;
  };

  return (
    <CanvasContainer>
      {/* 标尺 */}
      <RulersContainer $showRulers={showRulers}>
        <RulerCorner />
        <HorizontalRuler>
          {renderRulerMarks(true, viewportRef.current?.clientWidth || 1000)}
        </HorizontalRuler>
        <VerticalRuler>
          {renderRulerMarks(false, viewportRef.current?.clientHeight || 800)}
        </VerticalRuler>
      </RulersContainer>

      {/* 主画布区域 */}
      <ViewportContainer
        ref={viewportRef}
        $showRulers={showRulers}
        $activeTool={activeTool}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        {/* 网格背景 */}
        <GridBackground
          $showGrid={showGrid}
          $zoom={canvasZoom}
          $offsetX={canvasX}
          $offsetY={canvasY}
        />

        {/* 渲染元素 */}
        {Object.values(elements).map((element) => {
          const isSelected = selectedElements.includes(element.id);
          
          if (!element.visible) return null;

          if (element.type === 'rectangle') {
            const rectangleProps: any = {
              key: element.id,
              $x: element.x,
              $y: element.y,
              $width: element.width,
              $height: element.height,
              $selected: isSelected,
              $zoom: canvasZoom,
              $offsetX: canvasX,
              $offsetY: canvasY,
              onClick: (e: React.MouseEvent<HTMLDivElement>) => handleElementClick(element.id, e)
            };
            
            if (element.fill !== undefined) rectangleProps.$fill = element.fill;
            if (element.stroke !== undefined) rectangleProps.$stroke = element.stroke;
            if (element.strokeWidth !== undefined) rectangleProps.$strokeWidth = element.strokeWidth;
            if (element.borderRadius !== undefined) rectangleProps.$borderRadius = element.borderRadius;
            
            return <RectangleElement {...rectangleProps} />;
          }

          if (element.type === 'ellipse') {
            const ellipseProps: any = {
              key: element.id,
              $x: element.x,
              $y: element.y,
              $width: element.width,
              $height: element.height,
              $selected: isSelected,
              $zoom: canvasZoom,
              $offsetX: canvasX,
              $offsetY: canvasY,
              onClick: (e: React.MouseEvent<HTMLDivElement>) => handleElementClick(element.id, e)
            };
            
            if (element.fill !== undefined) ellipseProps.$fill = element.fill;
            if (element.stroke !== undefined) ellipseProps.$stroke = element.stroke;
            if (element.strokeWidth !== undefined) ellipseProps.$strokeWidth = element.strokeWidth;
            
            return <EllipseElement {...ellipseProps} />;
          }

          if (element.type === 'text') {
            const textProps: any = {
              key: element.id,
              $x: element.x,
              $y: element.y,
              $width: element.width,
              $height: element.height,
              $selected: isSelected,
              $zoom: canvasZoom,
              $offsetX: canvasX,
              $offsetY: canvasY,
              onClick: (e: React.MouseEvent<HTMLDivElement>) => handleElementClick(element.id, e)
            };
            
            if (element.fill !== undefined) textProps.$fill = element.fill;
            
            return <TextElement {...textProps} />;
          }

          if (element.type === 'frame') {
            const frameProps: any = {
              key: element.id,
              $x: element.x,
              $y: element.y,
              $width: element.width,
              $height: element.height,
              $selected: isSelected,
              $zoom: canvasZoom,
              $offsetX: canvasX,
              $offsetY: canvasY,
              onClick: (e: React.MouseEvent<HTMLDivElement>) => handleElementClick(element.id, e)
            };
            
            if (element.stroke !== undefined) frameProps.$stroke = element.stroke;
            if (element.strokeWidth !== undefined) frameProps.$strokeWidth = element.strokeWidth;
            
            return <FrameElement {...frameProps} />;
          }

          return null;
        })}
      </ViewportContainer>

      {/* 缩放显示 */}
      <ZoomDisplay>
        {Math.round(canvasZoom * 100)}%
      </ZoomDisplay>

      {/* 画布控制 */}
      <CanvasControls>
        <Tooltip content="显示/隐藏网格">
          <IconButton
            icon={<GridIcon />}
            onClick={() => setShowGrid(!showGrid)}
            variant={showGrid ? 'primary' : 'ghost'}
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="显示/隐藏标尺">
          <IconButton
            icon={<RulerSquareIcon />}
            onClick={() => setShowRulers(!showRulers)}
            variant={showRulers ? 'primary' : 'ghost'}
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="放大">
          <IconButton
            icon={<ZoomInIcon />}
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="缩小">
          <IconButton
            icon={<ZoomOutIcon />}
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="重置视图">
          <IconButton
            icon={<ResetIcon />}
            onClick={handleZoomReset}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      </CanvasControls>
    </CanvasContainer>
  );
};

export default Canvas;