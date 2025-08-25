/**
 * Suika集成画布组件 - 直接复用Suika的UI实现
 * @description 基于suika_backup目录的完整UI实现，提供与原生Suika相同的用户体验
 * @author 开发团队
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika';
import { useCanvasStore } from '../../../stores/canvasStore';

// 复用Suika的样式定义
const SuikaEditorContainer = styled.div<{ $mode: 'design' | 'h5' }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ $mode }) => $mode === 'design' ? '#f4f4f4' : '#ffffff'};
  
  /* Suika编辑器的基础样式 */
  .suika-editor-canvas {
    position: absolute;
    top: 0;
    left: 0;
    cursor: default;
  }
  
  /* H5模式下居中显示 */
  ${({ $mode }) => $mode === 'h5' && `
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

// 复用Suika的信息面板样式
const InfoOverlay = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: #666;
  z-index: 100;
  min-width: 200px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .info-label {
    font-weight: 500;
  }
  
  .info-value {
    font-family: monospace;
  }
`;

// 复用Suika的上下文菜单样式
const ContextMenuOverlay = styled.div<{ $visible: boolean; $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 10000;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
  transition: opacity 0.2s;
  
  .context-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &.disabled {
      color: #999;
      cursor: not-allowed;
      
      &:hover {
        background: transparent;
      }
    }
    
    .menu-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
    }
    
    .menu-shortcut {
      margin-left: auto;
      font-size: 12px;
      color: #999;
    }
  }
  
  .context-menu-divider {
    height: 1px;
    background: #e0e0e0;
    margin: 4px 0;
  }
`;

// 加载状态组件
const LoadingOverlay = styled.div<{ $mode: 'design' | 'h5' }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ $mode }) => 
    $mode === 'design' ? 'rgba(244, 244, 244, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(4px);
  z-index: 1000;
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e0e0e0;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-text {
    font-size: 14px;
    color: #666;
    text-align: center;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface SuikaIntegratedCanvasProps {
  width?: number;
  height?: number;
  onReady?: (editor: SuikaEditor) => void;
  showRuler?: boolean;
  showGrid?: boolean;
  showGuides?: boolean; // 参考线显示控制
  enableSnap?: boolean;
  mode?: 'design' | 'h5';
  showInfo?: boolean;
}

/**
 * Suika集成画布组件 - 完整复用Suika的UI实现
 * @description 直接集成Suika的完整功能，包括画布、工具、信息面板等
 */
export const SuikaIntegratedCanvas: React.FC<SuikaIntegratedCanvasProps> = ({
  width = 800,
  height = 600,
  onReady,
  showRuler = true,
  showGrid = true,
  showGuides = true,
  enableSnap = true,
  mode = 'design',
  showInfo = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SuikaEditor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [editorInfo, setEditorInfo] = useState({
    zoom: 100,
    selectedCount: 0,
    canvasSize: { width: 0, height: 0 },
    performance: { fps: 60, memory: 0 },
  });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    items: [] as Array<{ label: string; action: () => void; disabled?: boolean; shortcut?: string; divider?: boolean }>,
  });

  // 使用画布状态管理
  const { updatePerformanceMetrics, setSuikaEditor } = useCanvasStore();

  // 初始化Suika编辑器
  useEffect(() => {
    if (!containerRef.current) return;

    // 获取容器的准确位置信息
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // 创建Suika编辑器配置
    const editorConfig = {
      containerElement: containerRef.current,
      width: width,
      height: height,
      // 使用准确的容器偏移量，确保鼠标坐标正确对应
      offsetX: containerRect.left,
      offsetY: containerRect.top,
      // showPerfMonitor: process.env['NODE_ENV'] === 'development', // 暂时关闭性能监控
      userPreference: {
        enableRuler: showRuler,
        enablePixelGrid: showGrid && mode === 'design',
        snapToGrid: enableSnap,
        snapToObjects: showGuides, // 参考线通过snapToObjects控制
        // 根据模式调整设置
        ...(mode === 'h5' && {
          enableInfiniteCanvas: false,
        }),
        ...(mode === 'design' && {
          enableInfiniteCanvas: true,
        }),
      },
    };

    try {
      // 创建编辑器实例
      const editor = new SuikaEditor(editorConfig as any);
      editorRef.current = editor;

      // 设置编辑器状态
      if (showRuler) {
        editor.ruler.open();
      }

      // 监听编辑器事件
      const handleViewportChange = () => {
        if (editor.viewportManager) {
          const zoom = Math.round(editor.viewportManager.getZoom() * 100);
          setEditorInfo(prev => ({
            ...prev,
            zoom,
            canvasSize: {
              width: width,
              height: height,
            },
          }));
        }
      };

      // 选择变化处理 - 暂时注释掉，等待Suika API完善
      // const handleSelectionChange = () => {
      //   if (editor.selectedElements) {
      //     const selectedCount = editor.selectedElements.size();
      //     setEditorInfo(prev => ({
      //       ...prev,
      //       selectedCount,
      //     }));
      //   }
      // };

      const handlePerformanceUpdate = () => {
        try {
          const fps = 60; // 默认值，等待PerfMonitor API完善
          const memoryUsage = (performance as any).memory ? 
            Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0;
          
          setEditorInfo(prev => ({
            ...prev,
            performance: { fps, memory: memoryUsage },
          }));
          
          updatePerformanceMetrics(fps, memoryUsage, 0);
        } catch (error) {
          // 如果获取失败，使用默认值
          updatePerformanceMetrics(60, 0, 0);
        }
      };

      // 绑定事件监听器
      editor.viewportManager.on('zoomChange', handleViewportChange);
      editor.viewportManager.on('xOrYChange', handleViewportChange);
      
      // 定期更新性能信息
      const performanceInterval = setInterval(handlePerformanceUpdate, 1000);

      // 设置右键菜单
      const handleContextMenu = (e: PointerEvent) => {
        e.preventDefault();
        
        const menuItems = [
          { label: '复制', action: () => console.log('复制'), shortcut: 'Ctrl+C', divider: false },
          { label: '粘贴', action: () => console.log('粘贴'), shortcut: 'Ctrl+V', divider: false },
          { label: '', action: () => {}, divider: true },
          { label: '删除', action: () => console.log('删除'), shortcut: 'Delete', divider: false },
          { label: '', action: () => {}, divider: true },
          { label: '置于顶层', action: () => console.log('置于顶层'), divider: false },
          { label: '置于底层', action: () => console.log('置于底层'), divider: false },
        ];

        // 使用与画布其他鼠标操作一致的坐标系统
        // 使用PointerEvent，让Suika引擎处理坐标转换
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          items: menuItems,
        });
      };

      // 使用pointerdown事件监听右键点击，支持PointerEvent
      const handlePointerDown = (e: PointerEvent) => {
        if (e.button === 2) { // 右键
          e.preventDefault();
          handleContextMenu(e);
        }
      };

      containerRef.current.addEventListener('pointerdown', handlePointerDown);

      // 隐藏右键菜单
      const handleClickOutside = () => {
        setContextMenu(prev => ({ ...prev, visible: false }));
      };

      document.addEventListener('click', handleClickOutside);

      setIsReady(true);

      // 保存编辑器实例到状态管理
      setSuikaEditor(editor);

      // 通知父组件编辑器已准备就绪
      if (onReady) {
        onReady(editor);
      }

      // 清理函数
      return () => {
        clearInterval(performanceInterval);
        editor.viewportManager.off('zoomChange', handleViewportChange);
        editor.viewportManager.off('xOrYChange', handleViewportChange);
        containerRef.current?.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('click', handleClickOutside);
        editor.destroy();
        editorRef.current = null;
        setIsReady(false);
      };
    } catch (error) {
      console.error('[suika-integrated-canvas] Suika编辑器初始化失败:', error);
      setIsReady(false);
    }
  }, [width, height, showRuler, showGrid, showGuides, enableSnap, mode, onReady, updatePerformanceMetrics, setSuikaEditor]);

  // 处理参考线显示设置变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.setting.set('snapToObjects', showGuides);
      editorRef.current.render();
    }
  }, [showGuides, isReady]);

  // 监听窗口大小变化和容器位置变化
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // 动态更新画布偏移量，确保鼠标坐标始终正确
        editorRef.current.setting.set('offsetX', rect.left);
        editorRef.current.setting.set('offsetY', rect.top);
        // console.log('[suika-integrated-canvas] 更新画布偏移量:', { offsetX: rect.left, offsetY: rect.top });
      }
    };

    // 使用ResizeObserver监听容器大小变化
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize); // 监听滚动事件
    
    // 初始设置一次
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // 处理容器尺寸变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.viewportManager.setViewportSize({ 
        width: width, 
        height: height 
      });
      editorRef.current.render();
    }
  }, [width, height, isReady]);

  // 处理设置变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (showRuler) {
        editorRef.current.ruler.open();
      } else {
        editorRef.current.ruler.close();
      }
      
      const shouldShowGrid = showGrid && mode === 'design';
      editorRef.current.setting.set('enablePixelGrid', shouldShowGrid);
      editorRef.current.setting.set('snapToGrid', enableSnap);
      editorRef.current.setting.set('snapToObjects', enableSnap);
      
      editorRef.current.render();
    }
  }, [showRuler, showGrid, enableSnap, isReady, mode]);

  // 处理右键菜单项点击
  const handleContextMenuItemClick = useCallback((action: () => void) => {
    action();
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <SuikaEditorContainer $mode={mode}>
      {/* 画布容器 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* 信息面板 */}
      {showInfo && isReady && (
        <InfoOverlay>
          <div className="info-item">
            <span className="info-label">缩放:</span>
            <span className="info-value">{editorInfo.zoom}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">选中:</span>
            <span className="info-value">{editorInfo.selectedCount} 个对象</span>
          </div>
          <div className="info-item">
            <span className="info-label">画布:</span>
            <span className="info-value">
              {editorInfo.canvasSize.width} × {editorInfo.canvasSize.height}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">FPS:</span>
            <span className="info-value">{editorInfo.performance.fps}</span>
          </div>
          <div className="info-item">
            <span className="info-label">内存:</span>
            <span className="info-value">{editorInfo.performance.memory} MB</span>
          </div>
          {process.env['NODE_ENV'] === 'development' && (
            <div className="info-item">

            </div>
          )}
        </InfoOverlay>
      )}

      {/* 右键菜单 */}
      <ContextMenuOverlay
        $visible={contextMenu.visible}
        $x={contextMenu.x}
        $y={contextMenu.y}
      >
        {contextMenu.items.map((item, index) => (
          item.divider ? (
            <div key={index} className="context-menu-divider" />
          ) : (
            <div
              key={index}
              className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && handleContextMenuItemClick(item.action)}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="menu-shortcut">{item.shortcut}</span>
              )}
            </div>
          )
        ))}
      </ContextMenuOverlay>

      {/* 加载状态 */}
      {!isReady && (
        <LoadingOverlay $mode={mode}>
          <div className="loading-spinner" />
          <div className="loading-text">
            正在初始化{mode === 'h5' ? 'H5' : '设计'}画布...
            <br />
            <small>集成Suika引擎功能</small>
          </div>
        </LoadingOverlay>
      )}
    </SuikaEditorContainer>
  );
};

export default SuikaIntegratedCanvas;