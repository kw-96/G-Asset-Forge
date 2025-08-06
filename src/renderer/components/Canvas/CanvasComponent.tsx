import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';
import { useCanvasStore } from '../../stores/canvasStore';
import ToolManager from '../../tools/ToolManager';

// 无限画布容器
const InfiniteCanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: transparent;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  &.drawing {
    cursor: crosshair;
  }
  
  &.text-mode {
    cursor: text;
  }
  
  &.crop-mode {
    cursor: crosshair;
  }
  
  &.hand-mode {
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
  }
`;

// 无限画布视口
const InfiniteCanvasViewport = styled.div<{
  $translateX: number;
  $translateY: number;
  $scale: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate(${props => props.$translateX}px, ${props => props.$translateY}px) scale(${props => props.$scale});
  transform-origin: 50% 50%;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
`;

// 无限网格背景
const InfiniteGridBackground = styled.div<{
  $visible: boolean;
  $scale: number;
  $gridSize: number;
}>`
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: ${props => props.$visible ? Math.min(0.6, Math.max(0.1, props.$scale / 100)) : 0};
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: ${props => props.$gridSize * props.$scale / 100}px ${props => props.$gridSize * props.$scale / 100}px;
  pointer-events: none;
  transition: opacity 0.2s ease;
`;

// 画布工作区域指示器
const WorkspaceIndicator = styled.div`
  position: absolute;
  left: -2000px;
  top: -2000px;
  width: 4000px;
  height: 4000px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  border-radius: 8px;
`;

// 画布元素
const CanvasElement = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $selected: boolean;
  $type: string;
  $fill?: string;
  $stroke?: string;
  $strokeWidth?: number;
  $borderRadius?: number;
}>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  background: ${props => {
    if (props.$type === 'text' || props.$type === 'frame') return 'transparent';
    return props.$fill || '#3b82f6';
  }};
  border: ${props => {
    if (props.$selected) return '2px solid #667eea';
    if (props.$type === 'frame') return `${props.$strokeWidth || 1}px dashed ${props.$stroke || '#e2e8f0'}`;
    return `${props.$strokeWidth || 1}px solid ${props.$stroke || '#e2e8f0'}`;
  }};
  border-radius: ${props => {
    if (props.$type === 'ellipse') return '50%';
    return `${props.$borderRadius || 4}px`;
  }};
  cursor: pointer;
  user-select: none;
  
  ${props => props.$type === 'text' && `
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props.$fill || '#1e293b'};
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `}
  
  &:hover {
    border-color: ${props => props.$selected ? '#667eea' : '#cbd5e1'};
  }
`;

// 选择框
const SelectionBox = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
}>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border: 1px dashed #667eea;
  background: rgba(102, 126, 234, 0.1);
  pointer-events: none;
`;

// 坐标原点指示器
const OriginIndicator = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 20px;
    height: 1px;
    background: #ef4444;
    transform: translateY(-50%);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    width: 1px;
    height: 20px;
    background: #ef4444;
    transform: translateX(-50%);
  }
`;

// 缩放级别指示器
const ZoomIndicator = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  pointer-events: none;
  z-index: 100;
`;

// 画笔预览SVG
const PreviewSVG = styled.svg`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const CanvasComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const { 
    elements, 
    selectedElements, 
    activeTool,
    selectElements,
    clearSelection,
    addElement,
    setActiveTool
  } = useAppStore();
  
  const {
    zoom,
    panX,
    panY,
    showGrid,
    gridSize,
    setZoom,
    setPan
  } = useCanvasStore();

  // 本地状态
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [lastPan, setLastPan] = useState({ x: panX, y: panY });
  
  // 工具管理器
  const toolManager = ToolManager.getInstance();
  const brushTool = toolManager.getBrushTool();
  const cropTool = toolManager.getCropTool();
  const [isDrawing, setIsDrawing] = useState(false);

  // 屏幕坐标转画布坐标
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const scale = zoom / 100;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const canvasX = (screenX - rect.left - centerX - panX) / scale;
    const canvasY = (screenY - rect.top - centerY - panY) / scale;
    
    return { x: canvasX, y: canvasY };
  }, [zoom, panX, panY]);

  // 处理双击重置视图
  const handleDoubleClick = useCallback((_e: React.MouseEvent) => {
    if (activeTool === 'hand' || (activeTool === 'select' && !Object.keys(elements).length)) {
      setZoom(100);
      setPan(0, 0);
    }
  }, [activeTool, elements, setZoom, setPan]);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    
    // 检查是否点击了元素
    const clickedElement: any = Object.values(elements).find(element => {
      return x >= element.x && x <= element.x + element.width &&
             y >= element.y && y <= element.y + element.height &&
             element.visible;
    }) || null;

    if (clickedElement) {
      // 点击了元素
      if (e.ctrlKey || e.metaKey) {
        // 多选
        const currentSelection = [...selectedElements];
        const index = currentSelection.indexOf(clickedElement.id);
        if (index > -1) {
          currentSelection.splice(index, 1);
        } else {
          currentSelection.push(clickedElement.id);
        }
        selectElements(currentSelection);
      } else if (!selectedElements.includes(clickedElement.id)) {
        // 单选
        selectElements([clickedElement.id]);
      }
      return;
    }

    // 没有点击元素
    if (activeTool === 'select') {
      // 选择工具：开始框选或拖拽画布
      if (e.button === 0) { // 左键
        setIsSelecting(true);
        setSelectionBox({ x, y, width: 0, height: 0 });
        clearSelection();
      }
    } else if (['rectangle', 'ellipse', 'text', 'frame'].includes(activeTool)) {
      // 创建工具：创建新元素
      const newElement = {
        id: `${activeTool}_${Date.now()}`,
        name: `${activeTool} ${Object.keys(elements).length + 1}`,
        type: activeTool as 'rectangle' | 'ellipse' | 'text' | 'frame',
        x: x - 50,
        y: y - 25,
        width: activeTool === 'text' ? 120 : 100,
        height: activeTool === 'text' ? 30 : 50,
        visible: true,
        locked: false,
        fill: activeTool === 'text' ? '#1e293b' : (activeTool === 'frame' ? 'transparent' : '#3b82f6'),
        stroke: '#e2e8f0',
        strokeWidth: 1,
        borderRadius: activeTool === 'ellipse' ? 50 : 4,
        ...(activeTool === 'text' && { text: 'Sample Text' })
      };
      
      addElement(newElement);
      selectElements([newElement.id]);
      setActiveTool('select');
    } else if (activeTool === 'brush') {
      // 画笔工具：开始绘制
      brushTool.startDrawing(x, y);
      setIsDrawing(true);
    } else if (activeTool === 'crop') {
      // 裁剪工具：选择要裁剪的元素
      if (clickedElement && clickedElement.id) {
        cropTool.startCrop(clickedElement as any);
        selectElements([clickedElement.id]);
      }
    }

    // 开始拖拽画布
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan({ x: panX, y: panY });
  }, [screenToCanvas, elements, selectedElements, activeTool, selectElements, clearSelection, addElement, setActiveTool, panX, panY]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawing && activeTool === 'brush') {
      // 画笔绘制
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      brushTool.continueDrawing(x, y);
    } else if (isDragging && !isSelecting) {
      // 拖拽画布
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPan(lastPan.x + deltaX, lastPan.y + deltaY);
    } else if (isSelecting) {
      // 框选
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const startX = selectionBox.x;
      const startY = selectionBox.y;
      
      setSelectionBox({
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY)
      });
    }
  }, [isDragging, isSelecting, isDrawing, activeTool, dragStart, lastPan, setPan, screenToCanvas, selectionBox, brushTool]);

  // 处理鼠标抬起
  const handleMouseUp = useCallback(() => {
    if (isDrawing && activeTool === 'brush') {
      // 完成画笔绘制
      const stroke = brushTool.finishDrawing();
      if (stroke) {
        const brushElement = brushTool.strokeToCanvasElement(stroke);
        addElement(brushElement);
        selectElements([brushElement.id]);
      }
      setIsDrawing(false);
      setActiveTool('select');
    } else if (isSelecting) {
      // 完成框选
      const selectedIds = Object.values(elements).filter(element => {
        const elementRight = element.x + element.width;
        const elementBottom = element.y + element.height;
        const boxRight = selectionBox.x + selectionBox.width;
        const boxBottom = selectionBox.y + selectionBox.height;
        
        return element.visible &&
               element.x < boxRight &&
               elementRight > selectionBox.x &&
               element.y < boxBottom &&
               elementBottom > selectionBox.y;
      }).map(element => element.id);
      
      selectElements(selectedIds);
      setIsSelecting(false);
    }
    
    setIsDragging(false);
  }, [isDrawing, isSelecting, activeTool, elements, selectionBox, selectElements, brushTool, addElement, setActiveTool]);

  // 处理滚轮缩放 - 使用原生事件监听器避免被动事件问题
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -10 : 10;
      const newZoom = Math.max(25, Math.min(400, zoom + delta));
      
      if (newZoom === zoom) return;
      
      // 以鼠标位置为中心缩放
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left - centerX;
      const mouseY = e.clientY - rect.top - centerY;
      
      const scaleFactor = newZoom / zoom;
      const newPanX = panX - mouseX * (scaleFactor - 1);
      const newPanY = panY - mouseY * (scaleFactor - 1);
      
      setZoom(newZoom);
      setPan(newPanX, newPanY);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, panX, panY, setZoom, setPan]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        // 删除选中元素
        // TODO: 实现删除功能
        console.log('删除选中元素:', selectedElements);
      } else if (e.key === 'Escape') {
        clearSelection();
        setActiveTool('select');
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        // 工具快捷键
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'o':
            setActiveTool('ellipse');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'f':
            setActiveTool('frame');
            break;
          case 'b':
            setActiveTool('brush');
            break;
          case 'c':
            setActiveTool('crop');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, setActiveTool, selectedElements]);

  // 获取画布类名
  const getCanvasClassName = () => {
    if (activeTool === 'hand') {
      return 'hand-mode';
    } else if (['rectangle', 'ellipse', 'text', 'frame'].includes(activeTool)) {
      return activeTool === 'text' ? 'text-mode' : 'drawing';
    } else if (activeTool === 'brush') {
      return 'drawing';
    } else if (activeTool === 'crop') {
      return 'crop-mode';
    }
    return '';
  };

  const scale = zoom / 100;

  return (
    <InfiniteCanvasContainer
      ref={containerRef}
      className={getCanvasClassName()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}

    >
      {/* 缩放级别指示器 */}
      <ZoomIndicator>
        {zoom}% • {Object.keys(elements).length} 对象
      </ZoomIndicator>
      
      {/* 无限网格背景 */}
      <InfiniteGridBackground
        $visible={showGrid}
        $scale={scale}
        $gridSize={gridSize}
      />
      
      <InfiniteCanvasViewport
        ref={viewportRef}
        $translateX={panX}
        $translateY={panY}
        $scale={scale}
      >
        {/* 工作区域指示器 */}
        <WorkspaceIndicator />
        
        {/* 坐标原点指示器 */}
        <OriginIndicator />
        
        {/* 渲染元素 */}
        {Object.values(elements).map((element) => {
          if (!element.visible) return null;
          
          const isSelected = selectedElements.includes(element.id);
          
          // 画笔元素特殊渲染
          if (element.type === 'brush' && element.brushData) {
            const BrushSVG = styled.svg`
              position: absolute;
              left: ${element.x}px;
              top: ${element.y}px;
              width: ${element.width}px;
              height: ${element.height}px;
              pointer-events: none;
              border: ${isSelected ? '2px solid #667eea' : 'none'};
            `;
            
            return (
              <BrushSVG key={element.id}>
                <path
                  d={brushTool.generateSVGPath({
                    id: element.id,
                    points: element.brushData.points,
                    settings: element.brushData.settings,
                    timestamp: Date.now()
                  })}
                  stroke={element.brushData.settings.color}
                  strokeWidth={element.brushData.settings.size}
                  strokeOpacity={element.brushData.settings.opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </BrushSVG>
            );
          }
          
          return (
            <CanvasElement
              key={element.id}
              $x={element.x}
              $y={element.y}
              $width={element.width}
              $height={element.height}
              $selected={isSelected}
              $type={element.type}
              $fill={element.fill || '#3b82f6'}
              $stroke={element.stroke || '#e2e8f0'}
              $strokeWidth={element.strokeWidth || 1}
              $borderRadius={element.borderRadius || 4}
            >
              {element.type === 'text' && (element.text || 'Sample Text')}
            </CanvasElement>
          );
        })}
        
        {/* 当前画笔笔画预览 */}
        {isDrawing && activeTool === 'brush' && brushTool.getCurrentStroke() && (
          <PreviewSVG>
            <path
              d={brushTool.generateSVGPath(brushTool.getCurrentStroke()!)}
              stroke={brushTool.getSettings().color}
              strokeWidth={brushTool.getSettings().size}
              strokeOpacity={brushTool.getSettings().opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </PreviewSVG>
        )}
        
        {/* 选择框 */}
        {isSelecting && (
          <SelectionBox
            $x={selectionBox.x}
            $y={selectionBox.y}
            $width={selectionBox.width}
            $height={selectionBox.height}
          />
        )}
      </InfiniteCanvasViewport>
    </InfiniteCanvasContainer>
  );
};

export default CanvasComponent;
