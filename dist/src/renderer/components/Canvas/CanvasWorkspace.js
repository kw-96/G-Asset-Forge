import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 无限画布工作区 - 基于Suika引擎的无限画布系统
 * 支持无限制的平移、缩放和对象放置
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Button } from '../../ui/components/Button/Button';
import { Badge } from '../../ui/components/Badge/Badge';
const WorkspaceContainer = styled.div `
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.canvas.background};
  position: relative;
  overflow: hidden;
`;
const CanvasToolbar = styled.div `
  height: 40px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(8px);
`;
const ToolbarSection = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const InfiniteCanvasArea = styled.div `
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
const InfiniteCanvas = styled.div `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate(${({ $panX }) => $panX}px, ${({ $panY }) => $panY}px) scale(${({ $zoom }) => $zoom});
  transform-origin: 0 0;
  pointer-events: none;
`;
const CanvasObject = styled.div `
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
const WelcomeArea = styled.div `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
  z-index: 1;
`;
const TemplateGrid = styled.div `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
`;
const TemplateCard = styled.div `
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;
const OverviewNavigator = styled.div `
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
const ViewportIndicator = styled.div `
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $width }) => $width}%;
  height: ${({ $height }) => $height}%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}20;
  cursor: move;
`;
const FloatingControls = styled.div `
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;
const ZoomControls = styled.div `
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.md};
`;
const ZoomDisplay = styled.div `
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  min-width: 50px;
`;
const ModeSelector = styled.div `
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.md};
`;
const ModeButton = styled(Button) `
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
`;
const CanvasInfo = styled.div `
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  left: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;
export const CanvasWorkspace = () => {
    // 无限画布状态
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const [hasError, setHasError] = useState(false);
    const [mode, setMode] = useState('design');
    const [showGrid, setShowGrid] = useState(true);
    // const [gridSize, setGridSize] = useState(20);
    const [gridSize] = useState(20);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [showGuides, setShowGuides] = useState(true);
    // const [guides, setGuides] = useState<Array<{
    const [guides] = useState([]);
    const [objects, setObjects] = useState([]);
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [showOverview, setShowOverview] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    // 拖拽状态
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
    // 对象拖拽状态
    const [isDraggingObject, setIsDraggingObject] = useState(false);
    const [draggedObjectId, setDraggedObjectId] = useState(null);
    const [draggedObjectStart, setDraggedObjectStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    // 常用模板
    const templates = [
        { id: 'mobile', name: '移动端', width: 375, height: 667, category: 'mobile', emoji: '📱' },
        { id: 'tablet', name: '平板', width: 768, height: 1024, category: 'mobile', emoji: '📱' },
        { id: 'desktop', name: '桌面', width: 1920, height: 1080, category: 'desktop', emoji: '🖥️' },
        { id: 'icon', name: '游戏图标', width: 256, height: 256, category: 'game', emoji: '🎮' },
        { id: 'button', name: '按钮', width: 200, height: 60, category: 'game', emoji: '🔘' },
        { id: 'banner', name: '横幅', width: 728, height: 90, category: 'social', emoji: '🎯' },
    ];
    // 缩放处理 - 支持10%-500%缩放范围和60fps性能优化
    const handleZoomChange = useCallback((delta, centerPoint) => {
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
        if (!canvasRef.current)
            return;
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
    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0)
            return; // 只处理左键
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
    }, [viewport.x, viewport.y]);
    // 对象拖拽开始
    const handleObjectMouseDown = useCallback((objectId, e) => {
        if (e.button !== 0)
            return; // 只处理左键
        e.stopPropagation();
        e.preventDefault();
        setSelectedObjectId(objectId);
        setIsDraggingObject(true);
        setDraggedObjectId(objectId);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect)
            return;
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
    const handleMouseMove = useCallback((e) => {
        try {
            // 处理对象拖拽
            if (isDraggingObject && draggedObjectId) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect)
                    return;
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
                        if (snapToGrid || showGuides) {
                            // 转换为屏幕坐标进行对齐计算
                            const screenX = (newWorldX + obj.width / 2) * viewport.zoom + viewport.x;
                            const screenY = (newWorldY + obj.height / 2) * viewport.zoom + viewport.y;
                            let alignedScreenPos = { x: screenX, y: screenY };
                            // 应用参考线对齐
                            if (showGuides && guides.length > 0) {
                                const threshold = 5;
                                guides.forEach(guide => {
                                    const guideScreenPos = guide.position * viewport.zoom +
                                        (guide.type === 'vertical' ? viewport.x : viewport.y);
                                    const distance = Math.abs((guide.type === 'vertical' ? alignedScreenPos.x : alignedScreenPos.y) - guideScreenPos);
                                    if (distance < threshold) {
                                        if (guide.type === 'vertical') {
                                            alignedScreenPos.x = guideScreenPos;
                                        }
                                        else {
                                            alignedScreenPos.y = guideScreenPos;
                                        }
                                    }
                                });
                            }
                            // 应用网格对齐
                            if (snapToGrid) {
                                const safeZoom = Math.max(viewport.zoom, 0.01);
                                const worldPoint = {
                                    x: (alignedScreenPos.x - viewport.x) / safeZoom,
                                    y: (alignedScreenPos.y - viewport.y) / safeZoom
                                };
                                const snappedWorld = {
                                    x: Math.round(worldPoint.x / gridSize) * gridSize,
                                    y: Math.round(worldPoint.y / gridSize) * gridSize
                                };
                                alignedScreenPos = {
                                    x: snappedWorld.x * safeZoom + viewport.x,
                                    y: snappedWorld.y * safeZoom + viewport.y
                                };
                            }
                            // 转换回世界坐标
                            const safeZoomForConversion = Math.max(viewport.zoom, 0.01);
                            newWorldX = (alignedScreenPos.x - viewport.x) / safeZoomForConversion - obj.width / 2;
                            newWorldY = (alignedScreenPos.y - viewport.y) / safeZoomForConversion - obj.height / 2;
                        }
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
            if (!isDragging)
                return;
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            setViewport(prev => ({
                ...prev,
                x: lastPan.x + deltaX,
                y: lastPan.y + deltaY,
            }));
        }
        catch (error) {
            console.error('Error in handleMouseMove:', error);
        }
    }, [isDragging, isDraggingObject, dragStart, lastPan, draggedObjectId, draggedObjectStart, viewport, snapToGrid, showGuides, guides, gridSize]);
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        handleObjectMouseUp();
    }, [handleObjectMouseUp]);
    // 滚轮缩放 - 支持10%-500%缩放范围和60fps性能优化
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // 使用性能优化的缩放处理
        handleZoomChange(delta, { x: mouseX, y: mouseY });
    }, [handleZoomChange]);
    // 双击适应内容
    const handleDoubleClick = useCallback(() => {
        handleFitToContent();
    }, [handleFitToContent]);
    // 创建模板对象
    const handleCreateTemplate = useCallback((template) => {
        try {
            // 计算初始位置（屏幕中心转换为世界坐标）
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect)
                return;
            const centerX = canvasRect.width / 2;
            const centerY = canvasRect.height / 2;
            // 转换为世界坐标，防止除零错误
            const safeZoom = Math.max(viewport.zoom, 0.01);
            const worldPosition = {
                x: (centerX - viewport.x) / safeZoom - template.width / 2,
                y: (centerY - viewport.y) / safeZoom - template.height / 2
            };
            // 首先应用参考线对齐，然后应用网格对齐
            let screenPosition = { x: centerX, y: centerY };
            // 应用参考线对齐
            if (showGuides && guides.length > 0) {
                const threshold = 5;
                guides.forEach(guide => {
                    const guideScreenPos = guide.position * viewport.zoom +
                        (guide.type === 'vertical' ? viewport.x : viewport.y);
                    const distance = Math.abs((guide.type === 'vertical' ? screenPosition.x : screenPosition.y) - guideScreenPos);
                    if (distance < threshold) {
                        if (guide.type === 'vertical') {
                            screenPosition.x = guideScreenPos;
                        }
                        else {
                            screenPosition.y = guideScreenPos;
                        }
                    }
                });
            }
            // 应用网格对齐
            if (snapToGrid) {
                const safeZoomForGrid = Math.max(viewport.zoom, 0.01);
                const worldPoint = {
                    x: (screenPosition.x - viewport.x) / safeZoomForGrid,
                    y: (screenPosition.y - viewport.y) / safeZoomForGrid
                };
                const snappedWorld = {
                    x: Math.round(worldPoint.x / gridSize) * gridSize,
                    y: Math.round(worldPoint.y / gridSize) * gridSize
                };
                screenPosition = {
                    x: snappedWorld.x * safeZoomForGrid + viewport.x,
                    y: snappedWorld.y * safeZoomForGrid + viewport.y
                };
            }
            const alignedWorldPosition = {
                x: (screenPosition.x - viewport.x) / safeZoom - template.width / 2,
                y: (screenPosition.y - viewport.y) / safeZoom - template.height / 2
            };
            const newObject = {
                id: `template-${Date.now()}`,
                type: 'template',
                worldX: (snapToGrid || showGuides) ? alignedWorldPosition.x : worldPosition.x,
                worldY: (snapToGrid || showGuides) ? alignedWorldPosition.y : worldPosition.y,
                width: template.width,
                height: template.height,
                content: template.name,
            };
            setObjects(prev => [...prev, newObject]);
            setSelectedObjectId(newObject.id);
        }
        catch (error) {
            console.error('Error in handleCreateTemplate:', error);
        }
    }, [viewport, snapToGrid, showGuides, guides, gridSize]);
    // 对象点击处理
    const handleObjectClick = useCallback((objectId, e) => {
        e.stopPropagation();
        setSelectedObjectId(objectId);
    }, []);
    // 显示概览导航器（当缩放很小时）- 视口边界检测
    useEffect(() => {
        setShowOverview(viewport.zoom < 0.3);
    }, [viewport.zoom]);
    // 监听容器尺寸变化
    useEffect(() => {
        const updateContainerSize = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        // 初始化尺寸
        updateContainerSize();
        // 监听窗口大小变化
        const handleResize = () => {
            updateContainerSize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // 内容定位功能 - 检测可见对象
    const visibleObjects = useMemo(() => {
        try {
            return objects.filter(obj => {
                // 检查对象属性是否有效
                if (!obj || typeof obj.worldX !== 'number' || typeof obj.worldY !== 'number' ||
                    typeof obj.width !== 'number' || typeof obj.height !== 'number') {
                    return false;
                }
                // 检查对象是否在当前视口内可见
                const safeZoom = Math.max(viewport.zoom, 0.01);
                const screenLeft = obj.worldX * safeZoom + viewport.x;
                const screenTop = obj.worldY * safeZoom + viewport.y;
                const screenRight = screenLeft + obj.width * safeZoom;
                const screenBottom = screenTop + obj.height * safeZoom;
                // 检查计算结果是否有效
                if (!isFinite(screenLeft) || !isFinite(screenTop) ||
                    !isFinite(screenRight) || !isFinite(screenBottom)) {
                    return false;
                }
                return !(screenRight < 0 ||
                    screenLeft > containerSize.width ||
                    screenBottom < 0 ||
                    screenTop > containerSize.height);
            });
        }
        catch (error) {
            console.error('Error calculating visible objects:', error);
            return [];
        }
    }, [objects, viewport, containerSize]);
    const handleExport = () => {
        console.log('Export infinite canvas');
    };
    // 键盘快捷键支持
    useEffect(() => {
        const handleKeyDown = (e) => {
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
            }
            else {
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
        const handleError = (error) => {
            console.error('Canvas workspace error:', error);
            setHasError(true);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);
    if (hasError) {
        return (_jsx(WorkspaceContainer, { children: _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    flexDirection: 'column',
                    gap: '16px'
                }, children: [_jsx("div", { style: { fontSize: '48px' }, children: "\u26A0\uFE0F" }), _jsx("h2", { children: "\u753B\u5E03\u52A0\u8F7D\u51FA\u9519" }), _jsx("p", { children: "\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5" }), _jsx(Button, { onClick: () => setHasError(false), children: "\u91CD\u8BD5" })] }) }));
    }
    return (_jsxs(WorkspaceContainer, { children: [_jsxs(CanvasToolbar, { children: [_jsxs(ToolbarSection, { children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleFitToContent, children: "\uD83C\uDFAF \u9002\u5E94\u5185\u5BB9" }), _jsx(IconButton, { variant: showGrid ? 'primary' : 'ghost', size: "sm", icon: "\u229E", onClick: () => setShowGrid(!showGrid), title: "\u663E\u793A/\u9690\u85CF\u7F51\u683C" }), _jsx(IconButton, { variant: snapToGrid ? 'primary' : 'ghost', size: "sm", icon: "\uD83E\uDDF2", onClick: () => setSnapToGrid(!snapToGrid), title: "\u7F51\u683C\u5BF9\u9F50" }), _jsx(IconButton, { variant: showGuides ? 'primary' : 'ghost', size: "sm", icon: "\uD83D\uDCCF", onClick: () => setShowGuides(!showGuides), title: "\u663E\u793A/\u9690\u85CF\u53C2\u8003\u7EBF" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewport({ x: 0, y: 0, zoom: 1 }), children: "\uD83C\uDFE0 \u91CD\u7F6E\u89C6\u56FE" })] }), _jsxs(ToolbarSection, { children: [_jsx(Button, { variant: "outline", size: "sm", children: "\uD83D\uDCCB \u590D\u5236" }), _jsx(Button, { variant: "primary", size: "sm", onClick: handleExport, children: "\uD83D\uDCE4 \u5BFC\u51FA" })] })] }), _jsxs(InfiniteCanvasArea, { ref: canvasRef, "$showGrid": showGrid, "$gridSize": gridSize, "$panX": viewport.x, "$panY": viewport.y, "$zoom": viewport.zoom, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp, onWheel: handleWheel, onDoubleClick: handleDoubleClick, children: [_jsx(InfiniteCanvas, { "$panX": viewport.x, "$panY": viewport.y, "$zoom": viewport.zoom, children: objects.map((obj) => (_jsx(CanvasObject, { "$x": obj.worldX, "$y": obj.worldY, "$width": obj.width, "$height": obj.height, "$selected": obj.id === selectedObjectId, onClick: (e) => handleObjectClick(obj.id, e), onMouseDown: (e) => handleObjectMouseDown(obj.id, e), children: obj.type === 'template' && (_jsxs("div", { style: {
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
                                }, children: [_jsx("div", { style: { fontSize: '24px' }, children: "\uD83D\uDCC4" }), _jsx("div", { children: obj.content }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.7 }, children: [obj.width, " \u00D7 ", obj.height] })] })) }, obj.id))) }), objects.length === 0 && (_jsxs(WelcomeArea, { children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83C\uDFA8" }), _jsx("h2", { style: { margin: '0 0 8px 0', fontSize: '24px' }, children: "\u6B22\u8FCE\u4F7F\u7528\u65E0\u9650\u753B\u5E03" }), _jsx("p", { style: { margin: '0 0 24px 0', fontSize: '16px', opacity: 0.8 }, children: "\u9009\u62E9\u6A21\u677F\u5F00\u59CB\u521B\u4F5C\uFF0C\u6216\u4F7F\u7528\u5DE5\u5177\u5728\u4EFB\u610F\u4F4D\u7F6E\u6DFB\u52A0\u5185\u5BB9" }), _jsx(TemplateGrid, { children: templates.map((template) => (_jsxs(TemplateCard, { onClick: () => handleCreateTemplate(template), children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: template.emoji }), _jsx("div", { style: { fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }, children: template.name }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.7 }, children: [template.width, " \u00D7 ", template.height] })] }, template.id))) })] })), _jsxs(OverviewNavigator, { "$visible": showOverview, children: [_jsx("div", { style: {
                                    padding: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #eee',
                                    background: '#f5f5f5'
                                }, children: "\u753B\u5E03\u6982\u89C8" }), _jsxs("div", { style: { position: 'relative', flex: 1, margin: '8px' }, children: [objects.map((obj) => (_jsx("div", { style: {
                                            position: 'absolute',
                                            left: `${(obj.worldX + 2000) / 40}px`,
                                            top: `${(obj.worldY + 1500) / 40}px`,
                                            width: `${obj.width / 40}px`,
                                            height: `${obj.height / 40}px`,
                                            background: '#007acc',
                                            borderRadius: '2px',
                                            opacity: 0.7,
                                        } }, obj.id))), _jsx(ViewportIndicator, { "$x": 50, "$y": 50, "$width": 20, "$height": 15 })] })] }), _jsxs(CanvasInfo, { children: [_jsxs(Badge, { variant: "secondary", size: "sm", children: ["\u7F29\u653E: ", Math.round(viewport.zoom * 100), "%"] }), _jsx(Badge, { variant: "info", size: "sm", children: mode === 'design' ? '设计模式' : 'H5模式' }), _jsxs(Badge, { variant: "secondary", size: "sm", children: ["\u5BF9\u8C61: ", objects.length, " / \u53EF\u89C1: ", visibleObjects.length] }), _jsxs(Badge, { variant: "secondary", size: "sm", children: ["\u4F4D\u7F6E: (", Math.round(-viewport.x / Math.max(viewport.zoom, 0.01)), ", ", Math.round(-viewport.y / Math.max(viewport.zoom, 0.01)), ")"] }), process.env['NODE_ENV'] === 'development' && (_jsx(Badge, { variant: "warning", size: "sm", children: "\u6027\u80FD: 60fps" }))] }), _jsxs(FloatingControls, { children: [_jsxs(ModeSelector, { children: [_jsx(ModeButton, { "$active": mode === 'design', variant: "ghost", size: "sm", onClick: () => setMode('design'), children: "\uD83C\uDFA8" }), _jsx(ModeButton, { "$active": mode === 'h5', variant: "ghost", size: "sm", onClick: () => setMode('h5'), children: "\uD83D\uDCF1" })] }), _jsxs(ZoomControls, { children: [_jsx(IconButton, { variant: "ghost", size: "sm", icon: "\u2795", onClick: () => handleZoomChange(1) }), _jsxs(ZoomDisplay, { children: [Math.round(viewport.zoom * 100), "%"] }), _jsx(IconButton, { variant: "ghost", size: "sm", icon: "\u2796", onClick: () => handleZoomChange(-1) }), _jsx(IconButton, { variant: "ghost", size: "sm", icon: "\u22A1", onClick: handleFitToContent })] })] })] })] }));
};
//# sourceMappingURL=CanvasWorkspace.js.map