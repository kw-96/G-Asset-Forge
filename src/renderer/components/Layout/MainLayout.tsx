/**
 * Figma风格主布局组件 - 增强的界面布局系统
 * 包含响应式布局、面板管理、主题适配等功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TopToolbar } from './TopToolbar';
// import { LeftToolPanel } from './LeftToolPanel';
import { FigmaToolbar } from './FigmaToolbar';
import { FigmaLayersPanel } from './FigmaLayersPanel';
import { H5EditorCanvas } from '../../engines/h5-editor/adapter/react-adapter';
import { FigmaPropertiesPanel } from '../Properties/FigmaPropertiesPanel';
import { CanvasWorkspace } from '../Canvas/CanvasWorkspace';
import { StatusBar } from './StatusBar';
// import { AssetsPanel } from '../Assets/AssetsPanel';
import { useTheme } from '../../ui/theme/ThemeProvider';
import { useLayoutConfig } from '../../contexts/LayoutContext';

// 注意：全局 LayoutConfig 来源于 `FigmaLayoutCustomizer.tsx`，此处不再定义本地重复类型

// Figma风格的布局容器
const FigmaLayoutContainer = styled(motion.div)<{ 
  $isCompact: boolean; 
  $devicePixelRatio: number;
  $actualMode: 'light' | 'dark';
}>`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.interface.canvasArea.light};
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  
  /* 高DPI显示器支持 */
  ${({ $devicePixelRatio }) => $devicePixelRatio > 1 && `
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    
    /* 确保边框在高DPI下清晰 */
    * {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
  `}
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.canvasArea.dark 
      : theme.colors.interface.canvasArea.light};
  `}
`;

// 顶部工具栏区域
const FigmaTopSection = styled(motion.div)<{ $height: number; $isCompact: boolean; $actualMode: 'light' | 'dark' }>`
  flex-shrink: 0;
  height: ${({ $height, $isCompact }) => $isCompact ? $height * 0.8 : $height}px;
  background: ${({ theme }) => theme.colors.interface?.toolbar?.light || theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.banner};
  transition: height ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.smooth};
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.toolbar.dark 
      : theme.colors.interface.toolbar.light};
    border-bottom-color: ${$actualMode === 'dark' 
      ? theme.colors.interface.divider.dark 
      : theme.colors.interface.divider.light};
  `}
`;

// 主要内容区域
const FigmaMainSection = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

// 左侧面板区域
const FigmaLeftSection = styled(motion.div)<{ 
  $width: number; 
  $collapsed: boolean; 
  $isOverlay: boolean;
  $isResizing: boolean;
  $actualMode: 'light' | 'dark';
}>`
  display: flex;
  flex-shrink: 0;
  width: ${({ $collapsed, $width }) => $collapsed ? '60px' : `${$width}px`};
  background: ${({ theme }) => theme.colors.interface?.sidebar?.light || theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || theme.colors.border.default};
  z-index: ${({ theme, $isOverlay }) => $isOverlay ? theme.zIndex.overlay : theme.zIndex.docked};
  position: ${({ $isOverlay }) => $isOverlay ? 'absolute' : 'relative'};
  height: ${({ $isOverlay }) => $isOverlay ? '100%' : 'auto'};
  box-shadow: ${({ theme, $isOverlay }) => $isOverlay ? theme.shadows.panel : 'none'};
  cursor: ${({ $isResizing }) => $isResizing ? 'col-resize' : 'default'};
  
  transition: ${({ $isResizing, theme }) => $isResizing ? 'none' : `
    width ${theme.animation.duration.normal} ${theme.animation.easing.smooth},
    transform ${theme.animation.duration.normal} ${theme.animation.easing.smooth}
  `};
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.sidebar.dark 
      : theme.colors.interface.sidebar.light};
    border-right-color: ${$actualMode === 'dark' 
      ? theme.colors.interface.divider.dark 
      : theme.colors.interface.divider.light};
  `}
`;

// 工具面板已废弃（内容合并到图层面板顶部）
// const FigmaToolPanel = styled.div<{ $actualMode: 'light' | 'dark' }>`
//   width: 60px;
//   background: ${({ theme }) => theme.colors.interface?.toolbar?.light || theme.colors.surface};
//   border-right: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || theme.colors.border.default};
//   flex-shrink: 0;
//   
//   ${({ theme, $actualMode }) => theme.colors.interface && `
//     background: ${$actualMode === 'dark' 
//       ? theme.colors.interface.toolbar.dark 
//       : theme.colors.interface.toolbar.light};
//     border-right-color: ${$actualMode === 'dark' 
//       ? theme.colors.interface.divider.dark 
//       : theme.colors.interface.divider.light};
//   `}
// `;

// 侧边面板
const FigmaSidePanel = styled(motion.div)<{ $collapsed: boolean; $actualMode: 'light' | 'dark' }>`
  flex: 1;
  background: ${({ theme }) => theme.colors.interface?.panel?.light || theme.colors.background};
  overflow: hidden;
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.panel.dark 
      : theme.colors.interface.panel.light};
  `}
`;

// 中央画布区域
const FigmaCenterSection = styled.div<{ $padding: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  padding: ${({ $padding }) => $padding}px;
  background: ${({ theme }) => theme.colors.canvas?.background || theme.colors.background};
`;

// 浮动工具栏（放置在底部居中）
const FloatingToolbar = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
`;

// 右侧面板区域
const FigmaRightSection = styled(motion.div)<{ 
  $width: number; 
  $collapsed: boolean; 
  $isOverlay: boolean;
  $isResizing: boolean;
  $actualMode: 'light' | 'dark';
}>`
  width: ${({ $collapsed, $width }) => $collapsed ? '0px' : `${$width}px`};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.interface?.panel?.light || theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || theme.colors.border.default};
  overflow: hidden;
  z-index: ${({ theme, $isOverlay }) => $isOverlay ? theme.zIndex.overlay : theme.zIndex.docked};
  position: ${({ $isOverlay }) => $isOverlay ? 'absolute' : 'relative'};
  right: ${({ $isOverlay }) => $isOverlay ? '0' : 'auto'};
  height: ${({ $isOverlay }) => $isOverlay ? '100%' : 'auto'};
  box-shadow: ${({ theme, $isOverlay }) => $isOverlay ? theme.shadows.panel : 'none'};
  cursor: ${({ $isResizing }) => $isResizing ? 'col-resize' : 'default'};
  
  transition: ${({ $isResizing, theme }) => $isResizing ? 'none' : `
    width ${theme.animation.duration.normal} ${theme.animation.easing.smooth},
    transform ${theme.animation.duration.normal} ${theme.animation.easing.smooth}
  `};
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.panel.dark 
      : theme.colors.interface.panel.light};
    border-left-color: ${$actualMode === 'dark' 
      ? theme.colors.interface.divider.dark 
      : theme.colors.interface.divider.light};
  `}
`;

// 底部状态栏
const FigmaBottomSection = styled.div<{ $actualMode: 'light' | 'dark' }>`
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.interface?.toolbar?.light || theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.sticky};
  
  ${({ theme, $actualMode }) => theme.colors.interface && `
    background: ${$actualMode === 'dark' 
      ? theme.colors.interface.toolbar.dark 
      : theme.colors.interface.toolbar.light};
    border-top-color: ${$actualMode === 'dark' 
      ? theme.colors.interface.divider.dark 
      : theme.colors.interface.divider.light};
  `}
`;

// 面板调整大小手柄
const ResizeHandle = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${({ $position }) => $position}: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.5;
  }
  
  &:active {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.8;
  }
`;

// 自定义Hook：窗口尺寸和DPI监听
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      });
    };

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 监听DPI变化（用户缩放或移动到不同显示器）
    const mediaQuery = window.matchMedia('(resolution: 1dppx)');
    const handleDPIChange = () => {
      setWindowSize(prev => ({
        ...prev,
        devicePixelRatio: window.devicePixelRatio,
      }));
    };
    
    // 现代浏览器支持
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDPIChange);
    } else {
      // 旧版浏览器兼容
      mediaQuery.addListener(handleDPIChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDPIChange);
      } else {
        mediaQuery.removeListener(handleDPIChange);
      }
    };
  }, []);

  return windowSize;
};

// 自定义Hook：面板调整大小
const usePanelResize = (initialWidth: number, minWidth: number, maxWidth: number) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, minWidth, maxWidth]);

  return { width, isResizing, startResize, setWidth };
};

// 自定义Hook：布局性能监控
const useLayoutPerformance = () => {
  const [layoutMetrics, setLayoutMetrics] = useState({
    lastLayoutTime: 0,
    averageLayoutTime: 0,
    layoutCount: 0,
  });

  const measureLayout = useCallback((callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    // 使用requestAnimationFrame确保DOM更新完成后测量
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const layoutTime = endTime - startTime;
      
      setLayoutMetrics(prev => {
        const newCount = prev.layoutCount + 1;
        const newAverage = (prev.averageLayoutTime * prev.layoutCount + layoutTime) / newCount;
        
        return {
          lastLayoutTime: layoutTime,
          averageLayoutTime: newAverage,
          layoutCount: newCount,
        };
      });

      // 性能警告
      if (layoutTime > 500) {
        console.warn(`布局性能警告: 布局调整耗时 ${layoutTime.toFixed(2)}ms，超过500ms阈值`);
      }
    });
  }, []);

  return { layoutMetrics, measureLayout };
};

export const MainLayout: React.FC = () => {
  const { actualMode, reducedMotion } = useTheme();
  const windowSize = useWindowSize();
  
  // 使用布局配置上下文
  const { config: layoutConfig } = useLayoutConfig();
  
  // 高DPI适配 (已在styled组件中使用devicePixelRatio)
  
  // 布局性能监控
  const { measureLayout } = useLayoutPerformance();
  
  // 面板状态
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  // const [activeLeftPanel, setActiveLeftPanel] = useState<'layers' | 'assets'>('layers');
  const [editorMode, setEditorMode] = useState<'design' | 'h5'>('design');
  
  // Figma风格组件状态
  const [activeTool, setActiveTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [layers, setLayers] = useState([
    {
      id: '1',
      name: '示例框架',
      type: 'frame' as const,
      visible: true,
      locked: false,
      expanded: true,
      children: [
        {
          id: '2',
          name: '标题文本',
          type: 'text' as const,
          visible: true,
          locked: false,
        },
        {
          id: '3',
          name: '背景矩形',
          type: 'shape' as const,
          visible: true,
          locked: false,
        }
      ]
    }
  ]);
  
  // 面板调整大小
  // 将全局布局配置映射为本组件使用的派生值
  const leftPanel = usePanelResize(
    layoutConfig.leftPanelWidth || 280,
    200,
    400
  );
  
  const rightPanel = usePanelResize(
    layoutConfig.rightPanelWidth || 320,
    250,
    500
  );

  // 响应式布局计算
  const isCompactMode = useMemo(() => {
    // 使用一个合理的阈值作为紧凑模式开关
    const compactAt = 700;
    return windowSize.width < compactAt;
  }, [windowSize.width]);

  const shouldAutoCollapseLeft = useMemo(() => {
    const collapseAt = 1200;
    return windowSize.width < collapseAt;
  }, [windowSize.width]);

  const shouldAutoCollapseRight = useMemo(() => {
    const collapseAt = 1200;
    return windowSize.width < collapseAt;
  }, [windowSize.width]);

  const leftPanelOverlay = shouldAutoCollapseLeft && !leftPanelCollapsed;
  const rightPanelOverlay = shouldAutoCollapseRight && !rightPanelCollapsed;

  // 响应式自动折叠
  useEffect(() => {
    if (shouldAutoCollapseLeft && !leftPanelCollapsed) {
      // 在小屏幕上不自动折叠，而是使用覆盖模式
    }
  }, [shouldAutoCollapseLeft]);

  useEffect(() => {
    if (shouldAutoCollapseRight && !rightPanelCollapsed) {
      // 在小屏幕上不自动折叠，而是使用覆盖模式
    }
  }, [shouldAutoCollapseRight]);

  // 面板控制函数（带性能监控）
  // const handleToggleLeftPanel = useCallback(() => {
  //   measureLayout(() => {
  //     setLeftPanelCollapsed(!leftPanelCollapsed);
  //   });
  // }, [leftPanelCollapsed, measureLayout]);

  const toggleLeftPanel = useCallback(() => {
    measureLayout(() => {
      setLeftPanelCollapsed(!leftPanelCollapsed);
    });
  }, [leftPanelCollapsed, measureLayout]);

  const toggleRightPanel = useCallback(() => {
    measureLayout(() => {
      setRightPanelCollapsed(!rightPanelCollapsed);
    });
  }, [rightPanelCollapsed, measureLayout]);

  // Figma风格组件处理函数
  const handleToolChange = useCallback((toolId: string) => {
    setActiveTool(toolId);
    console.log('Tool changed to:', toolId);
  }, []);

  const handleLayerSelect = useCallback((layerId: string) => {
    const findLayer = (layers: any[], id: string): any => {
      for (const layer of layers) {
        if (layer.id === id) return layer;
        if (layer.children) {
          const found = findLayer(layer.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const layer = findLayer(layers, layerId);
    setSelectedObject(layer ? {
      type: layer.type,
      properties: {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 100,
        rotation: 0,
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left'
      }
    } : null);
  }, [layers]);

  const handleLayerToggleVisibility = useCallback((layerId: string) => {
    const updateLayer = (layers: any[]): any[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, visible: !layer.visible };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  }, [layers]);

  const handleLayerToggleLock = useCallback((layerId: string) => {
    const updateLayer = (layers: any[]): any[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, locked: !layer.locked };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  }, [layers]);

  const handleLayerRename = useCallback((layerId: string, newName: string) => {
    const updateLayer = (layers: any[]): any[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, name: newName };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  }, [layers]);

  const handleLayerToggleExpanded = useCallback((layerId: string) => {
    const updateLayer = (layers: any[]): any[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, expanded: !layer.expanded };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  }, [layers]);

  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (selectedObject) {
      setSelectedObject({
        ...selectedObject,
        properties: {
          ...selectedObject.properties,
          [property]: value
        }
      });
    }
  }, [selectedObject]);

  // 动画变体 (预留用于未来的面板动画)
  // const panelVariants = {
  //   collapsed: { width: 60, opacity: 0.8 },
  //   expanded: { width: leftPanel.width, opacity: 1 },
  // };

  return (
    <FigmaLayoutContainer 
      $isCompact={isCompactMode}
      $devicePixelRatio={windowSize.devicePixelRatio}
      $actualMode={actualMode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      {/* 顶部工具栏 */}
      <FigmaTopSection 
        $height={48}
        $isCompact={isCompactMode}
        $actualMode={actualMode}
        layout={!reducedMotion}
      >
        <TopToolbar 
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          leftPanelCollapsed={leftPanelCollapsed}
          rightPanelCollapsed={rightPanelCollapsed}
        />
      </FigmaTopSection>

      {/* 主要内容区域 */}
      <FigmaMainSection>
        {/* 左侧面板区域 */}
        <AnimatePresence>
          {(!shouldAutoCollapseLeft || !leftPanelCollapsed) && (
            <FigmaLeftSection
              $width={leftPanel.width}
              $collapsed={leftPanelCollapsed}
              $isOverlay={leftPanelOverlay}
              $isResizing={leftPanel.isResizing}
              $actualMode={actualMode}
              initial={reducedMotion ? { x: 0 } : { x: -leftPanel.width }}
              animate={{ x: 0 }}
              exit={reducedMotion ? { x: 0 } : { x: -leftPanel.width }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* 左侧独立工具面板已合并至图层面板顶部，此处移除 */}
              
              <FigmaSidePanel 
                $collapsed={leftPanelCollapsed}
                $actualMode={actualMode}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={reducedMotion ? false : { opacity: leftPanelCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
              <FigmaLayersPanel
                  layers={layers}
                  selectedLayerId={selectedObject?.id}
                  onLayerSelect={handleLayerSelect}
                  onLayerToggleVisibility={handleLayerToggleVisibility}
                  onLayerToggleLock={handleLayerToggleLock}
                  onLayerRename={handleLayerRename}
                  onLayerToggleExpanded={handleLayerToggleExpanded}
                  onSwitchMode={(m) => {
                    setEditorMode(m);
                  }}
                />
              </FigmaSidePanel>

              {/* 左侧面板调整大小手柄 */}
              {layoutConfig.leftPanelVisible && !leftPanelCollapsed && (
                <ResizeHandle 
                  $position="right" 
                  onMouseDown={leftPanel.startResize}
                />
              )}
            </FigmaLeftSection>
          )}
        </AnimatePresence>

        {/* 中央画布区域 */}
        <FigmaCenterSection $padding={20}>
          {/* Figma风格工具栏 */}
          <FloatingToolbar>
            <FigmaToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
            />
          </FloatingToolbar>
          
          {editorMode === 'h5' ? (
            <H5EditorCanvas width={375} height={667} />
          ) : (
            <CanvasWorkspace />
          )}
        </FigmaCenterSection>

        {/* 右侧面板区域 */}
        <AnimatePresence>
          {(!shouldAutoCollapseRight || !rightPanelCollapsed) && (
            <FigmaRightSection
              $width={rightPanel.width}
              $collapsed={rightPanelCollapsed}
              $isOverlay={rightPanelOverlay}
              $isResizing={rightPanel.isResizing}
              $actualMode={actualMode}
              initial={reducedMotion ? { x: 0 } : { x: rightPanel.width }}
              animate={{ x: 0 }}
              exit={reducedMotion ? { x: 0 } : { x: rightPanel.width }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* 右侧面板调整大小手柄 */}
              {layoutConfig.rightPanelVisible && !rightPanelCollapsed && (
                <ResizeHandle 
                  $position="left" 
                  onMouseDown={rightPanel.startResize}
                />
              )}
              
              <FigmaPropertiesPanel
                selectedObject={selectedObject}
                onPropertyChange={handlePropertyChange}
              />
            </FigmaRightSection>
          )}
        </AnimatePresence>
      </FigmaMainSection>

      {/* 底部状态栏 */}
      <FigmaBottomSection $actualMode={actualMode}>
        <StatusBar />
      </FigmaBottomSection>
    </FigmaLayoutContainer>
  );
};