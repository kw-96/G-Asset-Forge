/**
 * Suika集成布局组件 - 整合GAF和Suika界面系统
 * @description 统一GAF和Suika的界面，使用GAF的顶部工具栏、底部状态栏，结合Suika的页面面板、图层面板和画布系统
 * @author 开发团队
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../../stores/canvasStore';
import { SuikaIntegratedCanvas } from '../Canvas/SuikaIntegratedCanvas';
import { FigmaToolbar } from './FigmaToolbar';
import { TopToolbar } from '../../components/organisms/Navbar/TopToolbar';
import { StatusBar } from '../../components/organisms/Navbar/StatusBar';
import { Modal } from '../../components/templates/Dialog/Modal';
import { AssetLibraryPanel } from '../AssetLibrary/AssetLibraryPanel';
import { TemplateLibraryPanel } from '../TemplateLibrary/TemplateLibraryPanel';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';
import { useSuikaManagers } from '../../../hooks/useSuikaManagers';



// 统一布局容器 - 整合GAF和Suika风格
const UnifiedLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.interface?.canvasArea?.light || '#f4f4f4'};
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
`;

// GAF顶部工具栏区域
const GAFTopSection = styled.div`
  flex-shrink: 0;
  height: 48px;
  background: ${({ theme }) => theme.colors.interface?.toolbar?.light || '#fff'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  z-index: 100;
`;

// 浮动工具栏区域 - 保持Suika风格的居中工具栏
const FloatingToolbarArea = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
`;

// 主体区域
const UnifiedBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

// 左侧面板区域 - 整合GAF模式切换和Suika面板
const UnifiedLeftArea = styled(motion.div)<{ $width: number; $collapsed: boolean }>`
  width: ${({ $collapsed, $width }) => $collapsed ? '0px' : `${$width}px`};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.interface?.panel?.light || '#fff'};
  border-right: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  overflow: hidden;
  transition: width 0.3s ease;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

// 中央画布区域 - 保持Suika风格
const UnifiedCenterArea = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.interface?.canvasArea?.light || '#f4f4f4'};
`;

// 右侧面板区域 - 保持Suika风格
const UnifiedRightArea = styled(motion.div)<{ $width: number; $collapsed: boolean }>`
  width: ${({ $collapsed, $width }) => $collapsed ? '0px' : `${$width}px`};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.interface?.panel?.light || '#fff'};
  border-left: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  overflow: hidden;
  transition: width 0.3s ease;
  z-index: 10;
`;

// GAF底部状态栏区域
const GAFBottomSection = styled.div`
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.interface?.toolbar?.light || '#fff'};
  border-top: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  z-index: 100;
`;

// GAF模式切换按钮容器 - 优化为一行显示
const GAFModeButtonsContainer = styled.div`
  // padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  background: ${({ theme }) => theme.colors.interface?.panel?.light || '#fff'};
`;

const GAFModeButtonsGrid = styled.div`
  display: flex;
  flex-direction: row;
  // gap: 12px;
  justify-content: space-between;
  align-items: center;
`;

const GAFModeButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  // border: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  // border-radius: 6px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary[500] : theme.colors.interface?.panel?.light || '#fff'};
  // color: ${({ $active, theme }) => 
    $active ? '#fff' : theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
  // min-width: 80px;
  height: 100%;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : theme.colors.interaction?.hover || '#f5f5f5'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .mode-icon {
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .mode-name {
    white-space: nowrap;
    font-size: 11px;
  }
`;

// 页面面板样式 - 保持Suika风格
const SuikaPagePanel = styled.div`
  height: 200px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface?.divider?.light || '#e6e6e6'};
  padding: 16px;
  overflow-y: auto;
  
  .page-title {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .page-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;
    font-size: 13px;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &.active {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .page-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      background: #ddd;
      border-radius: 2px;
      flex-shrink: 0;
    }
    
    .page-controls {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
      margin-left: auto;
      
      button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        font-size: 10px;
        
        &:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    &:hover .page-controls {
      opacity: 1;
    }
  }
`;

// 图层面板样式 - 保持Suika风格
const SuikaLayerPanel = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  
  .layer-title {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .layer-item {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 2px;
    font-size: 13px;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &.selected {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .layer-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 12px;
        height: 12px;
        fill: currentColor;
      }
    }
    
    .layer-name {
      flex: 1;
    }
    
    .layer-controls {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .layer-controls {
      opacity: 1;
    }
    
    .layer-control-btn {
      width: 16px;
      height: 16px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      
      svg {
        width: 10px;
        height: 10px;
        fill: currentColor;
      }
    }
  }
`;

// 属性面板样式 - 保持Suika风格
const SuikaPropertyPanel = styled.div`
  padding: 16px;
  overflow-y: auto;
  
  .property-title {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .property-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }
    
    .property-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .property-label {
        width: 60px;
        font-size: 12px;
        color: #666;
        flex-shrink: 0;
      }
      
      .property-input {
        flex: 1;
        height: 24px;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0 8px;
        font-size: 12px;
        
        &:focus {
          outline: none;
          border-color: #1976d2;
        }
      }
    }
  }
`;

// 右键菜单样式 - 符合图示的深色主题
const ContextMenu = styled.div<{ $visible: boolean; $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  background: #2d2d2d;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 4px 0;
  min-width: 160px;
  z-index: 10000;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  
  .context-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    color: #ffffff;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: #404040;
    }
    
    &:first-child {
      border-radius: 6px 6px 0 0;
    }
    
    &:last-child {
      border-radius: 0 0 6px 6px;
    }
  }
`;

// 重命名输入框样式
const RenameInput = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 20px;
  min-width: 300px;
  z-index: 10001;
  
  .rename-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
  
  .rename-input {
    width: 100%;
    height: 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 14px;
    margin-bottom: 16px;
    
    &:focus {
      outline: none;
      border-color: #1976d2;
    }
  }
  
  .rename-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &.cancel {
        background: #f5f5f5;
        color: #666;
        
        &:hover {
          background: #e0e0e0;
        }
      }
      
      &.confirm {
        background: #1976d2;
        color: white;
        
        &:hover {
          background: #1565c0;
        }
      }
    }
  }
`;



interface SuikaIntegratedLayoutProps {
  title?: string;
}

/**
 * Suika集成布局组件 - 整合GAF和Suika界面系统
 * @description 统一GAF和Suika的界面，使用GAF的顶部工具栏、底部状态栏，结合Suika的页面面板、图层面板和画布系统
 */
export const SuikaIntegratedLayout: React.FC<SuikaIntegratedLayoutProps> = () => {
  const { mode: canvasMode, setMode: setCanvasMode, suikaEditor } = useCanvasStore();
  const [leftPanelWidth] = useState(240);
  const [rightPanelWidth] = useState(280);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [, setZoom] = useState(100);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // GAF模式切换和弹窗状态
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  
  // 性能监控数据 - 用于底部状态栏
  const [performanceData, setPerformanceData] = useState({
    memory: 85,
    fps: 60,
    cpu: 15,
  });

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    pageId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    pageId: null,
  });

  // 重命名输入框状态
  const [renameDialog, setRenameDialog] = useState<{
    visible: boolean;
    pageId: string | null;
    currentName: string;
    newName: string;
  }>({
    visible: false,
    pageId: null,
    currentName: '',
    newName: '',
  });

  // 使用Suika管理器Hook
  const [managersState, managersActions] = useSuikaManagers(suikaEditor);
  const { pages, layers, selectedLayerIds, currentProperties } = managersState;

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // 监听Suika编辑器状态
  useEffect(() => {
    if (!suikaEditor) return;

    const handleZoomChange = () => {
      const currentZoom = Math.round(suikaEditor.viewportManager.getZoom() * 100);
      setZoom(currentZoom);
    };

    const handleToolChange = (toolName: string) => {
      setActiveTool(toolName);
    };

    suikaEditor.viewportManager.on('zoomChange', handleZoomChange);
    suikaEditor.toolManager.on('switchTool', handleToolChange);

    return () => {
      suikaEditor.viewportManager.off('zoomChange', handleZoomChange);
      suikaEditor.toolManager.off('switchTool', handleToolChange);
    };
  }, [suikaEditor]);



  // 性能监控 - 从Suika编辑器获取状态
  useEffect(() => {
    if (!suikaEditor) return;

    const updatePerformanceData = () => {
      // 模拟性能数据，实际应该从Suika编辑器获取
      setPerformanceData({
        memory: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 85,
        fps: 60, // 可以从Suika的性能监控获取
        cpu: Math.round(Math.random() * 20 + 10), // 模拟CPU使用率
      });
    };

    // 定期更新性能数据
    const performanceInterval = setInterval(updatePerformanceData, 1000);
    updatePerformanceData(); // 立即更新一次

    return () => {
      clearInterval(performanceInterval);
    };
  }, [suikaEditor]);

  // 处理工具切换
  const handleToolChange = useCallback((toolId: string) => {
    setActiveTool(toolId);
    if (suikaEditor) {
      suikaEditor.toolManager.setActiveTool(toolId);
    }
  }, [suikaEditor]);

  // 缩放控制现在通过TopToolbar的菜单处理，这里不再需要

  // GAF模式切换处理
  const handleModeSwitch = useCallback((mode: 'design' | 'h5') => {
    setCanvasMode(mode);
    console.log(`[unified-layout] 切换到${mode === 'design' ? '设计' : 'H5'}模式`);
  }, [setCanvasMode]);

  // GAF弹窗处理
  const handleOpenAssets = useCallback(() => {
    setIsAssetsOpen(true);
  }, []);

  const handleOpenTemplates = useCallback(() => {
    setIsTemplatesOpen(true);
  }, []);

  // 项目库暂时不实现，移除相关代码

  // 面板切换处理
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  }, [leftPanelCollapsed]);

  const toggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  }, [rightPanelCollapsed]);

  // 处理页面操作
  const handlePageSelect = useCallback((pageId: string) => {
    managersActions.switchToPage(pageId);
  }, [managersActions]);

  const handlePageAdd = useCallback(() => {
    const pageCount = pages.length;
    managersActions.createPage(`页面 ${pageCount + 1}`, true);
  }, [managersActions, pages.length]);

  const handlePageRename = useCallback((pageId: string, newName: string) => {
    managersActions.renamePage(pageId, newName);
  }, [managersActions]);

  const handlePageDelete = useCallback((pageId: string) => {
    managersActions.deletePage(pageId);
  }, [managersActions]);

  const handlePageDuplicate = useCallback((pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      // const pageCount = pages.length;
      managersActions.createPage(`${page.name} 副本`, false);
    }
  }, [managersActions, pages]);

  // 右键菜单处理函数
  const handlePageContextMenu = useCallback((e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      pageId,
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      pageId: null,
    });
  }, []);

  const handleContextMenuAction = useCallback((action: string, pageId: string) => {
    switch (action) {
      case 'rename':
        const page = pages.find(p => p.id === pageId);
        if (page) {
          // 显示自定义重命名输入框
          setRenameDialog({
            visible: true,
            pageId,
            currentName: page.name,
            newName: page.name,
          });
        }
        break;
      case 'duplicate':
        handlePageDuplicate(pageId);
        break;
      case 'delete':
        const pageToDelete = pages.find(p => p.id === pageId);
        if (pageToDelete && pages.length > 1) {
          if (confirm(`确定删除页面 "${pageToDelete.name}" 吗？`)) {
            handlePageDelete(pageId);
          }
        }
        break;
    }
    handleContextMenuClose();
  }, [pages, handlePageDuplicate, handlePageDelete, handleContextMenuClose]);

  // 重命名输入框处理函数
  const handleRenameConfirm = useCallback(() => {
    if (renameDialog.pageId && renameDialog.newName && renameDialog.newName !== renameDialog.currentName) {
      handlePageRename(renameDialog.pageId, renameDialog.newName);
    }
    setRenameDialog({
      visible: false,
      pageId: null,
      currentName: '',
      newName: '',
    });
  }, [renameDialog, handlePageRename]);

  const handleRenameCancel = useCallback(() => {
    setRenameDialog({
      visible: false,
      pageId: null,
      currentName: '',
      newName: '',
    });
  }, []);

  // 监听点击外部关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        handleContextMenuClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu.visible, handleContextMenuClose]);

  // 处理图层操作
  const handleLayerSelect = useCallback((layerId: string, addToSelection: boolean = false) => {
    managersActions.selectLayers([layerId], addToSelection);
  }, [managersActions]);

  const handleLayerToggleVisibility = useCallback((layerId: string) => {
    managersActions.toggleLayerVisibility(layerId);
  }, [managersActions]);

  const handleLayerToggleLock = useCallback((layerId: string) => {
    managersActions.toggleLayerLock(layerId);
  }, [managersActions]);

  // Remove unused handlers to fix TypeScript warnings

  // 处理属性操作
  const handlePropertyChange = useCallback((objectId: string, property: string, value: any) => {
    switch (property) {
      case 'x':
      case 'y':
      case 'width':
      case 'height':
        managersActions.updateTransform(objectId, { [property]: value });
        break;
      case 'opacity':
        managersActions.updateOpacity(objectId, value);
        break;
      case 'fill':
        managersActions.updateFill(objectId, value);
        break;
      case 'stroke':
        managersActions.updateStroke(objectId, value);
        break;
      case 'name':
        managersActions.updateObjectName(objectId, value);
        break;
      default:
        console.warn(`[SuikaIntegratedLayout] 未知属性: ${property}`);
    }
  }, [managersActions]);

  return (
    <UnifiedLayoutContainer>
      {/* GAF顶部工具栏 */}
      <GAFTopSection>
        <TopToolbar
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          leftPanelCollapsed={leftPanelCollapsed}
          rightPanelCollapsed={rightPanelCollapsed}
        />
      </GAFTopSection>

      {/* 主体区域 */}
      <UnifiedBody>
        {/* 左侧面板 - 整合GAF模式切换和Suika面板 */}
        <AnimatePresence>
          {!leftPanelCollapsed && (
            <UnifiedLeftArea
              $width={leftPanelWidth}
              $collapsed={leftPanelCollapsed}
              initial={{ width: 0 }}
              animate={{ width: leftPanelWidth }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* GAF模式切换按钮容器 */}
              <GAFModeButtonsContainer>
                <GAFModeButtonsGrid>
                  <GAFModeButton
                    $active={canvasMode === 'design'}
                    onClick={() => handleModeSwitch('design')}
                    // title="设计模式"
                  >
                    <div className="mode-icon"><SvgIcon name="icon.24.file.design" size={24} title="设计模式" /></div>
                    <div className="mode-name">设计模式</div>
                  </GAFModeButton>
                  <GAFModeButton
                    $active={canvasMode === 'h5'}
                    onClick={() => handleModeSwitch('h5')}
                    // title="H5模式"
                  >
                    <div className="mode-icon"><SvgIcon name="icon.24.file.H5" size={24} title="H5模式" /></div>
                    <div className="mode-name">H5模式</div>
                  </GAFModeButton>
                  <GAFModeButton
                    onClick={handleOpenAssets}
                    // title="素材库"
                  >
                    <div className="mode-icon"><SvgIcon name="icon.24.file.design.assets" size={24} title="素材库" /></div>
                    <div className="mode-name">素材库</div>
                  </GAFModeButton>
                  <GAFModeButton
                    onClick={handleOpenTemplates}
                    // title="模板库"
                  >
                    <div className="mode-icon"><SvgIcon name="icon.24.file.design.mods" size={24} title="模板库" /></div>
                    <div className="mode-name">模板库</div>
                  </GAFModeButton>
                </GAFModeButtonsGrid>
              </GAFModeButtonsContainer>

              {/* Suika页面面板 - 仅在设计模式下显示 */}
              {canvasMode === 'design' && (
                <SuikaPagePanel>
                  <div className="page-title">
                    页面
                    <button
                      type="button" 
                      onClick={handlePageAdd}
                      style={{ 
                        marginLeft: 'auto', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#666'
                      }}
                      title="添加页面"
                    >
                      <SvgIcon name="icon.24.plus" size={24} />
                    </button>
                  </div>
                  {pages.map((page) => (
                     <div
                       key={page.id}
                       className={`page-item ${page.isActive ? 'active' : ''}`}
                       onClick={() => handlePageSelect(page.id)}
                       onContextMenu={(e) => handlePageContextMenu(e, page.id)}
                     >
                       <span>{page.name}</span>
                       <div className="page-controls">
                         {pages.length > 1 && (
                           <button 
                             type="button" 
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm(`确定删除页面 "${page.name}" 吗？`)) {
                                 handlePageDelete(page.id);
                               }
                             }}
                             title="删除"
                           >
                             <SvgIcon name="icon.24.close" size={16} />
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                </SuikaPagePanel>
              )}

              {/* Suika图层面板 */}
              <SuikaLayerPanel>
                <div className="layer-title">
                  图层
                  {process.env['NODE_ENV'] === 'development' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        // 强制刷新图层列表
                        managersActions.refreshLayers?.();
                      }}
                      style={{ 
                        marginLeft: 'auto', 
                        background: 'none', 
                        border: '1px solid #ddd', 
                        cursor: 'pointer',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        color: '#666'
                      }}
                      title="刷新图层列表"
                    >
                      刷新
                    </button>
                  )}
                </div>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`layer-item ${selectedLayerIds.includes(layer.id) ? 'selected' : ''}`}
                    onClick={(e) => handleLayerSelect(layer.id, e.ctrlKey || e.metaKey)}
                  >
                    <div className="layer-icon">
                      {layer.type === 'rect' && (
                        <svg viewBox="0 0 16 16">
                          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      )}
                      {layer.type === 'text' && (
                        <svg viewBox="0 0 16 16">
                          <path d="M3 3h10v2H9v8H7V5H3V3z" fill="currentColor" />
                        </svg>
                      )}
                      {(layer.type === 'image' || layer.type === 'ellipse') && (
                        <svg viewBox="0 0 16 16">
                          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
                          <circle cx="6" cy="6" r="1" fill="currentColor" />
                          <path d="M2 12l3-3 2 2 4-4 3 3v2H2v-2z" fill="currentColor" />
                        </svg>
                      )}
                      {layer.type === 'line' && (
                        <svg viewBox="0 0 16 16">
                          <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      )}
                      {layer.type === 'path' && (
                        <svg viewBox="0 0 16 16">
                          <path d="M2 8c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2zm6 0c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <div className="layer-name">{layer.name}</div>
                    <div className="layer-controls">
                      <button 
                        type="button" 
                        className="layer-control-btn" 
                        title={layer.visible ? '隐藏' : '显示'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayerToggleVisibility(layer.id);
                        }}
                      >
                        {layer.visible ? (
                          <svg viewBox="0 0 16 16">
                            <path d="M8 3C4.5 3 1.7 5.6 1 8c.7 2.4 3.5 5 7 5s6.3-2.6 7-5c-.7-2.4-3.5-5-7-5zM8 11.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 4.5 8 4.5s3.5 1.6 3.5 3.5S9.9 11.5 8 11.5zM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16">
                            <path d="M2.5 2.5l11 11-1 1-2.4-2.4C9.4 12.4 8.7 12.5 8 12.5c-3.5 0-6.3-2.6-7-5 .3-1.1 1-2.1 1.9-2.9L1.5 3.5l1-1zM8 4.5c.8 0 1.5.3 2.1.8L8.8 6.6c-.3-.1-.5-.1-.8-.1-1.1 0-2 .9-2 2 0 .3 0 .5.1.8L4.8 10.6c-.9-.8-1.6-1.8-1.9-2.9C3.6 6.1 5.7 4.5 8 4.5zM11.2 5.4c.9.8 1.6 1.8 1.9 2.9-.7 2.4-3.5 5-7 5l1.4-1.4c1.9-.2 3.4-1.7 3.6-3.6L11.2 5.4z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="layer-control-btn" 
                        title={layer.locked ? '解锁' : '锁定'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayerToggleLock(layer.id);
                        }}
                      >
                        {layer.locked ? (
                          <svg viewBox="0 0 16 16">
                            <path d="M4 7V5c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1v7H3V7h1zM6 5v2h4V5c0-1.1-.9-2-2-2s-2 .9-2 2z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16">
                            <path d="M4 7V5c0-2.2 1.8-4 4-4s4 1.8 4 4v1h1v8H3V6h1v1zM6 5v1h4V5c0-1.1-.9-2-2-2s-2 .9-2 2z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {layers.length === 0 && (
                  <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                    当前页面没有图层
                  </div>
                )}
              </SuikaLayerPanel>
            </UnifiedLeftArea>
          )}
        </AnimatePresence>

        {/* 中央画布区域 - 保持Suika风格 */}
        <UnifiedCenterArea>
          {/* 浮动工具栏 - 保持Suika风格的居中工具栏 */}
          <FloatingToolbarArea>
            <FigmaToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
            />
          </FloatingToolbarArea>

          {/* Suika画布区域 */}
          <SuikaIntegratedCanvas
            width={windowSize.width - (leftPanelCollapsed ? 0 : leftPanelWidth) - (rightPanelCollapsed ? 0 : rightPanelWidth)}
            height={windowSize.height - 48 - 24} // 减去顶部工具栏和底部状态栏高度
            mode={canvasMode}
            showRuler={true}
            showGrid={canvasMode === 'design'}
            enableSnap={true}
            showInfo={false} // 不显示Suika的调试信息，使用GAF的底部状态栏
          />
        </UnifiedCenterArea>

        {/* 右侧面板 - 保持Suika风格 */}
        <AnimatePresence>
          {!rightPanelCollapsed && (
            <UnifiedRightArea
              $width={rightPanelWidth}
              $collapsed={rightPanelCollapsed}
              initial={{ width: 0 }}
              animate={{ width: rightPanelWidth }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
            >
              {canvasMode === 'h5' ? (
                // H5模式专属属性面板
                <SuikaPropertyPanel>
                  <div className="property-title">H5 属性</div>
                  
                  {currentProperties.length > 0 ? (
                    <>
                      {currentProperties.length === 1 ? (
                        // H5模式下的单个对象属性
                        (() => {
                          const props = currentProperties[0];
                          if (!props) return null;
                          return (
                            <>
                              <div className="property-section">
                                <div className="section-title">基本信息</div>
                                <div className="property-row">
                                  <div className="property-label">名称</div>
                                  <input 
                                    className="property-input" 
                                    type="text" 
                                    defaultValue={props.name}
                                    onBlur={(e) => handlePropertyChange(props.id, 'name', e.target.value)}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">类型</div>
                                  <input className="property-input" type="text" value={props.type} readOnly />
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="section-title">H5 布局</div>
                                <div className="property-row">
                                  <div className="property-label">X</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.x)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'x', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">Y</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.y)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'y', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">宽度</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.width)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'width', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">高度</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.height)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'height', parseFloat(e.target.value))}
                                  />
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="section-title">H5 样式</div>
                                <div className="property-row">
                                  <div className="property-label">透明度</div>
                                  <input 
                                    className="property-input" 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    defaultValue={Math.round((props.opacity || 1) * 100)}
                                    onChange={(e) => handlePropertyChange(props.id, 'opacity', parseFloat(e.target.value) / 100)}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">混合模式</div>
                                  <select 
                                    className="property-input"
                                    defaultValue={props.blendMode || 'normal'}
                                    onChange={(e) => handlePropertyChange(props.id, 'blendMode', e.target.value)}
                                  >
                                    <option value="normal">正常</option>
                                    <option value="multiply">正片叠底</option>
                                    <option value="screen">滤色</option>
                                    <option value="overlay">叠加</option>
                                  </select>
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="section-title">H5 交互</div>
                                <div className="property-row">
                                  <div className="property-label">可见性</div>
                                  <input 
                                    className="property-input" 
                                    type="checkbox" 
                                    defaultChecked={props.visible}
                                    onChange={(e) => handlePropertyChange(props.id, 'visible', e.target.checked)}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">锁定</div>
                                  <input 
                                    className="property-input" 
                                    type="checkbox" 
                                    defaultChecked={props.locked}
                                    onChange={(e) => handlePropertyChange(props.id, 'locked', e.target.checked)}
                                  />
                                </div>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        // H5模式下的多选属性
                        <div className="property-section">
                          <div className="section-title">多选对象 ({currentProperties.length})</div>
                          <div style={{ color: '#666', fontSize: '12px', padding: '8px 0' }}>
                            已选择 {currentProperties.length} 个对象
                          </div>
                          <div className="property-row">
                            <div className="property-label">批量操作</div>
                            <button 
                              className="property-input" 
                              style={{ cursor: 'pointer', background: '#f0f0f0' }}
                              onClick={() => {
                                // 批量设置透明度 - 使用简单的confirm替代prompt
                                if (window.confirm('是否将所有选中对象的透明度设置为50%？')) {
                                  const value = 0.5; // 固定设置为50%
                                  currentProperties.forEach(prop => {
                                    handlePropertyChange(prop.id, 'opacity', value);
                                  });
                                }
                              }}
                            >
                              批量设置透明度
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                      选择对象以编辑H5属性
                    </div>
                  )}
                </SuikaPropertyPanel>
              ) : (
                // 设计模式属性面板
                <SuikaPropertyPanel>
                  <div className="property-title">属性</div>
                  
                  {currentProperties.length > 0 && (
                    <>
                      {currentProperties.length === 1 ? (
                        // 单个对象属性
                        (() => {
                          const props = currentProperties[0];
                          if (!props) return null;
                          return (
                            <>
                              <div className="property-section">
                                <div className="section-title">基本信息</div>
                                <div className="property-row">
                                  <div className="property-label">名称</div>
                                  <input 
                                    className="property-input" 
                                    type="text" 
                                    defaultValue={props.name}
                                    onBlur={(e) => handlePropertyChange(props.id, 'name', e.target.value)}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">类型</div>
                                  <input className="property-input" type="text" value={props.type} readOnly />
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="section-title">位置和大小</div>
                                <div className="property-row">
                                  <div className="property-label">X</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.x)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'x', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">Y</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.y)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'y', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">宽度</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.width)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'width', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="property-row">
                                  <div className="property-label">高度</div>
                                  <input 
                                    className="property-input" 
                                    type="number" 
                                    defaultValue={Math.round(props.transform.height)}
                                    onBlur={(e) => handlePropertyChange(props.id, 'height', parseFloat(e.target.value))}
                                  />
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="section-title">外观</div>
                                {props.fill && (
                                  <div className="property-row">
                                    <div className="property-label">填充</div>
                                    <input 
                                      className="property-input" 
                                      type="color" 
                                      defaultValue={props.fill.color || '#000000'}
                                      onChange={(e) => handlePropertyChange(props.id, 'fill', { type: 'solid', color: e.target.value })}
                                    />
                                  </div>
                                )}
                                {props.stroke && (
                                  <>
                                    <div className="property-row">
                                      <div className="property-label">描边</div>
                                      <input 
                                        className="property-input" 
                                        type="color" 
                                        defaultValue={props.stroke.color}
                                        onChange={(e) => handlePropertyChange(props.id, 'stroke', { ...props.stroke, color: e.target.value })}
                                      />
                                    </div>
                                    <div className="property-row">
                                      <div className="property-label">描边宽度</div>
                                      <input 
                                        className="property-input" 
                                        type="number" 
                                        defaultValue={props.stroke.width}
                                        onBlur={(e) => handlePropertyChange(props.id, 'stroke', { ...props.stroke, width: parseFloat(e.target.value) })}
                                      />
                                    </div>
                                  </>
                                )}
                                <div className="property-row">
                                  <div className="property-label">不透明度</div>
                                  <input 
                                    className="property-input" 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01"
                                    defaultValue={props.opacity}
                                    onChange={(e) => handlePropertyChange(props.id, 'opacity', parseFloat(e.target.value))}
                                  />
                                  <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                                    {Math.round(props.opacity * 100)}%
                                  </span>
                                </div>
                              </div>

                              {props.content !== undefined && (
                                <div className="property-section">
                                  <div className="section-title">文本</div>
                                  <div className="property-row">
                                    <div className="property-label">内容</div>
                                    <textarea 
                                      className="property-input" 
                                      defaultValue={props.content}
                                      onBlur={(e) => managersActions.updateTextContent(props.id, e.target.value)}
                                      style={{ height: '60px', resize: 'vertical' }}
                                    />
                                  </div>
                                  {props.textStyle && (
                                    <>
                                      <div className="property-row">
                                        <div className="property-label">字体大小</div>
                                        <input 
                                          className="property-input" 
                                          type="number" 
                                          defaultValue={props.textStyle.fontSize}
                                          onBlur={(e) => managersActions.updateTextStyle(props.id, { fontSize: parseFloat(e.target.value) })}
                                        />
                                      </div>
                                      <div className="property-row">
                                        <div className="property-label">字体</div>
                                        <select 
                                          className="property-input" 
                                          defaultValue={props.textStyle.fontFamily}
                                          onChange={(e) => managersActions.updateTextStyle(props.id, { fontFamily: e.target.value })}
                                        >
                                          <option value="Arial">Arial</option>
                                          <option value="Helvetica">Helvetica</option>
                                          <option value="Times New Roman">Times New Roman</option>
                                          <option value="Courier New">Courier New</option>
                                          <option value="微软雅黑">微软雅黑</option>
                                          <option value="宋体">宋体</option>
                                        </select>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {props.cornerRadius !== undefined && (
                                <div className="property-section">
                                  <div className="section-title">形状</div>
                                  <div className="property-row">
                                    <div className="property-label">圆角</div>
                                    <input 
                                      className="property-input" 
                                      type="number" 
                                      defaultValue={props.cornerRadius}
                                      onBlur={(e) => managersActions.updateCornerRadius(props.id, parseFloat(e.target.value))}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        // 多个对象属性
                        <div className="property-section">
                          <div className="section-title">多选对象 ({currentProperties.length})</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            选中了 {currentProperties.length} 个对象
                          </div>
                          <div className="property-row">
                            <div className="property-label">不透明度</div>
                            <input 
                              className="property-input" 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.01"
                              onChange={(e) => {
                                const opacity = parseFloat(e.target.value);
                                currentProperties.forEach(props => {
                                  handlePropertyChange(props.id, 'opacity', opacity);
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {currentProperties.length === 0 && (
                    <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                      选择一个对象以查看属性
                    </div>
                  )}
                </SuikaPropertyPanel>
              )}
            </UnifiedRightArea>
          )}
        </AnimatePresence>
      </UnifiedBody>

      {/* GAF底部状态栏 */}
      <GAFBottomSection>
        <StatusBar
          memory={performanceData.memory}
          fps={performanceData.fps}
          cpu={performanceData.cpu}
        />
      </GAFBottomSection>

      {/* GAF弹窗 - 素材库 */}
      <Modal
        isOpen={isAssetsOpen}
        onClose={() => setIsAssetsOpen(false)}
        title="🎨 素材库"
        size="adaptive"
        className="asset-library-modal"
        zIndexLevel="topmost"
      >
        <div style={{ height: 'calc(85vh - 120px)', margin: '-24px', display: 'flex', flexDirection: 'column' }}>
          <AssetLibraryPanel
            onAssetSelect={() => {}}
            onAssetDoubleClick={() => setIsAssetsOpen(false)}
            style={{ height: '100%', border: 'none', borderRadius: 0, backgroundColor: 'transparent' }}
          />
        </div>
      </Modal>

      {/* GAF弹窗 - 模板库 */}
      <Modal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        title="📚 模板库"
        size="adaptive"
        className="template-library-modal"
        zIndexLevel="topmost"
      >
        <div style={{ height: 'calc(85vh - 120px)', margin: '-24px', display: 'flex', flexDirection: 'column' }}>
          <TemplateLibraryPanel
            onUseTemplate={() => setIsTemplatesOpen(false)}
            onPreviewTemplate={() => {}}
            style={{ height: '100%', border: 'none', borderRadius: 0, backgroundColor: 'transparent' }}
          />
        </div>
             </Modal>

       {/* 右键菜单 */}
       <ContextMenu
         $visible={contextMenu.visible}
         $x={contextMenu.x}
         $y={contextMenu.y}
       >
         <div 
           className="context-menu-item"
           onClick={() => contextMenu.pageId && handleContextMenuAction('rename', contextMenu.pageId)}
         >
           重命名页面
         </div>
         <div 
           className="context-menu-item"
           onClick={() => contextMenu.pageId && handleContextMenuAction('duplicate', contextMenu.pageId)}
         >
           创建页面副本
         </div>
         {pages.length > 1 && (
           <div 
             className="context-menu-item"
             onClick={() => contextMenu.pageId && handleContextMenuAction('delete', contextMenu.pageId)}
           >
             删除页面
           </div>
         )}
       </ContextMenu>

       {/* 重命名输入框 */}
       {renameDialog.visible && (
         <RenameInput>
           <div className="rename-title">重命名页面</div>
           <input
             className="rename-input"
             type="text"
             value={renameDialog.newName}
             onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 handleRenameConfirm();
               } else if (e.key === 'Escape') {
                 handleRenameCancel();
               }
             }}
             autoFocus
           />
           <div className="rename-buttons">
             <button className="cancel" onClick={handleRenameCancel}>
               取消
             </button>
             <button className="confirm" onClick={handleRenameConfirm}>
               确定
             </button>
           </div>
         </RenameInput>
       )}
 
     </UnifiedLayoutContainer>
   );
 };

export default SuikaIntegratedLayout;