/**
 * 统一Suika画布组件 - 支持设计模式和H5模式的统一画布系统
 * @description 基于Suika引擎的统一画布组件，支持双模式下的无限画布功能
 * @author 开发团队
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika';
// 直接使用Suika核心功能
import { useCanvasStore } from '../../../stores/canvasStore';
import { toolManager } from '../../../logic/managers/tools/ToolManager';
import { canvasEvents } from '../../../logic/utils/events/canvasEvents';

const CanvasContainer = styled.div<{ $mode: 'design' | 'h5' }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ $mode }) => $mode === 'design' ? '#f4f4f4' : '#ffffff'};
  
  /* H5模式下居中显示画布 */
  ${({ $mode }) => $mode === 'h5' && `
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const CanvasWrapper = styled.div<{ $mode: 'design' | 'h5'; $canvasWidth?: number; $canvasHeight?: number }>`
  position: ${({ $mode }) => $mode === 'design' ? 'absolute' : 'relative'};
  ${({ $mode }) => $mode === 'design' ? 'inset: 0;' : ''}
  ${({ $mode, $canvasWidth, $canvasHeight }) => 
    $mode === 'h5' && $canvasWidth && $canvasHeight ? 
    `width: ${$canvasWidth}px; height: ${$canvasHeight}px;` : 
    ''
  }
  
  canvas {
    display: block;
    cursor: default;
  }
  

`;



interface SuikaCanvasComponentProps {
  width?: number;
  height?: number;
  onReady?: (editor: SuikaEditor) => void;
  showRuler?: boolean;
  showGrid?: boolean;
  showGuides?: boolean; // 参考线显示控制
  enableSnap?: boolean;
  mode?: 'design' | 'h5';
}

/**
 * 统一Suika画布组件 - 支持设计模式和H5模式
 * @description 使用Suika核心引擎，支持双模式下的无限画布功能
 */
export const SuikaCanvasComponent: React.FC<SuikaCanvasComponentProps> = ({
  width = 800,
  height = 600,
  onReady,
  showRuler = false,
  showGrid = true,
  showGuides = true,
  enableSnap = true,
  mode = 'design',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SuikaEditor | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // 使用画布状态管理
  const { updatePerformanceMetrics } = useCanvasStore();



  // 使用 useCallback 优化函数引用，避免无限渲染
  const handleViewportChange = useCallback(() => {
    if (editorRef.current) {
      // 从Suika编辑器获取实际的性能指标
      try {
        // 暂时使用固定值，等待PerfMonitor API完善
        const fps = 60;
        const memoryUsage = (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0;
        updatePerformanceMetrics(fps, memoryUsage, 0);
      } catch (error) {
        // 如果获取失败，使用默认值
        updatePerformanceMetrics(60, 0, 0);
      }
    }
  }, [updatePerformanceMetrics]);

  // 使用 useRef 存储 onReady 回调，避免依赖项变化
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!containerRef.current) return;

    // 根据模式设置不同的画布配置
    const canvasConfig = {
      containerElement: containerRef.current,
      width,
      height,
      showPerfMonitor: process.env['NODE_ENV'] === 'development',
      userPreference: {
        enableRuler: showRuler,
        enablePixelGrid: showGrid && mode === 'design', // H5模式下不显示网格
        snapToGrid: enableSnap,
        snapToObjects: showGuides, // 参考线通过snapToObjects控制
        // 根据模式调整设置
        minPixelGridZoom: 0.5,
        pixelGridLineColor: '#cccccc55',
        rulerBgColor: '#fff',
        rulerStroke: '#e6e6e6',
        rulerMarkStroke: '#c1c1c1',
        refLineStroke: '#f14f30ee',
        refLineTolerance: 4,
        // 双模式下统一启用无限画布
        enableInfiniteCanvas: true,
      },
    };

    // 创建Suika编辑器实例
    const editor = new SuikaEditor(canvasConfig as any);
    editorRef.current = editor;

    // 设置编辑器配置
    if (showRuler) {
      editor.ruler.open();
    }

    // H5模式下禁用网格显示
    if (mode === 'h5') {
      editor.setting.set('enablePixelGrid', false);
    }

    // 监听编辑器事件

    // 绑定事件监听器
    editor.viewportManager.on('zoomChange', handleViewportChange);
    editor.viewportManager.on('xOrYChange', handleViewportChange);

    // 集成工具管理器
    toolManager.initialize();

    setIsReady(true);

    // 通知父组件编辑器已准备就绪
    if (onReadyRef.current) {
      onReadyRef.current(editor);
    }

    // 清理函数
    return () => {
      editor.viewportManager.off('zoomChange', handleViewportChange);
      editor.viewportManager.off('xOrYChange', handleViewportChange);
      editor.destroy();
      editorRef.current = null;
      setIsReady(false);
    };
  }, [width, height, showRuler, showGrid, showGuides, enableSnap, mode]); 

  // 处理容器尺寸变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (mode === 'design') {
        editorRef.current.viewportManager.setViewportSize({ width, height });
      }
      editorRef.current.render();
    }
  }, [width, height, isReady, mode]);

// 处理标尺显示/隐藏
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (showRuler) {
        editorRef.current.ruler.open();
      } else {
        editorRef.current.ruler.close();
      }
      editorRef.current.render();
    }
  }, [showRuler, isReady]);

  // 处理网格和吸附设置
  useEffect(() => {
    if (editorRef.current && isReady) {
      // H5模式下不显示网格
      const shouldShowGrid = showGrid && mode === 'design';
      editorRef.current.setting.set('enablePixelGrid', shouldShowGrid);
      editorRef.current.setting.set('snapToGrid', enableSnap);
      editorRef.current.setting.set('snapToObjects', showGuides); // 参考线通过snapToObjects控制
      editorRef.current.render();
    }
  }, [showGrid, showGuides, enableSnap, isReady, mode]);

  // 处理模式切换
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (mode === 'h5') {
        // 切换到H5模式：禁用网格
        editorRef.current.setting.set('enablePixelGrid', false);
      } else {
        // 切换到设计模式：启用网格
        editorRef.current.setting.set('enablePixelGrid', showGrid);
      }
      // 重置视口并更新尺寸
      editorRef.current.viewportManager.setViewportSize({ width, height });
      editorRef.current.viewportManager.resetViewport();
      editorRef.current.render();
    }
  }, [mode, isReady, showGrid, width, height]);

  // 监听画布事件 - 标尺和辅助线控制
  useEffect(() => {
    if (!editorRef.current || !isReady) return;

    const editor = editorRef.current;

    // 切换标尺显示/隐藏
    const handleToggleRuler = () => {
      const currentState = editor.setting.get('enableRuler');
      editor.setting.set('enableRuler', !currentState);
      
      if (!currentState) {
        editor.ruler.open();
      } else {
        editor.ruler.close();
      }
      
      editor.render();
      console.log(`[SuikaCanvas] 标尺${!currentState ? '显示' : '隐藏'}`);
    };

    // 切换参考线显示/隐藏
    const handleToggleGuides = () => {
      const currentState = editor.setting.get('snapToObjects');
      editor.setting.set('snapToObjects', !currentState);
      
      // 清除当前参考线缓存，强制重新计算
      editor.refLine.clear();
      
      editor.render();
      console.log(`[SuikaCanvas] 参考线${!currentState ? '启用' : '禁用'}`);
    };

    // 切换网格显示/隐藏
    const handleToggleGrid = () => {
      const currentState = editor.setting.get('enablePixelGrid');
      const newState = !currentState;
      
      // H5模式下不允许显示网格
      if (mode === 'h5' && newState) {
        console.log('[SuikaCanvas] H5模式下不支持网格显示');
        return;
      }
      
      editor.setting.set('enablePixelGrid', newState);
      editor.render();
      console.log(`[SuikaCanvas] 网格${newState ? '显示' : '隐藏'}`);
    };

    // 适应内容
    const handleFitToContent = () => {
      editor.viewportManager.zoomToFit();
      editor.render();
      console.log('[SuikaCanvas] 适应内容');
    };

    // 重置视图
    const handleResetView = () => {
      editor.viewportManager.resetViewport();
      editor.render();
      console.log('[SuikaCanvas] 重置视图');
    };

    // 放大
    const handleZoomIn = () => {
      const currentZoom = editor.viewportManager.getZoom();
      const newZoom = Math.min(currentZoom * 1.2, editor.setting.get('zoomMax'));
      const pageSize = editor.viewportManager.getPageSize();
      const center = { x: pageSize.width / 2, y: pageSize.height / 2 };
      editor.viewportManager.setZoom(newZoom, center);
      editor.render();
      console.log(`[SuikaCanvas] 放大到 ${Math.round(newZoom * 100)}%`);
    };

    // 缩小
    const handleZoomOut = () => {
      const currentZoom = editor.viewportManager.getZoom();
      const newZoom = Math.max(currentZoom / 1.2, editor.setting.get('zoomMin'));
      const pageSize = editor.viewportManager.getPageSize();
      const center = { x: pageSize.width / 2, y: pageSize.height / 2 };
      editor.viewportManager.setZoom(newZoom, center);
      editor.render();
      console.log(`[SuikaCanvas] 缩小到 ${Math.round(newZoom * 100)}%`);
    };

    // 绑定事件监听器
    canvasEvents.on('toggleRuler', handleToggleRuler);
    canvasEvents.on('toggleGuides', handleToggleGuides);
    canvasEvents.on('toggleGrid', handleToggleGrid);
    canvasEvents.on('fitToContent', handleFitToContent);
    canvasEvents.on('resetView', handleResetView);
    canvasEvents.on('zoomIn', handleZoomIn);
    canvasEvents.on('zoomOut', handleZoomOut);

    return () => {
      // 清理事件监听器
      canvasEvents.off('toggleRuler', handleToggleRuler);
      canvasEvents.off('toggleGuides', handleToggleGuides);
      canvasEvents.off('toggleGrid', handleToggleGrid);
      canvasEvents.off('fitToContent', handleFitToContent);
      canvasEvents.off('resetView', handleResetView);
      canvasEvents.off('zoomIn', handleZoomIn);
      canvasEvents.off('zoomOut', handleZoomOut);
    };
  }, [isReady, mode]);
  return (
    <CanvasContainer $mode={mode}>
      <CanvasWrapper 
        ref={containerRef} 
        $mode={mode}
      />
      
      {/* Suika核心已经内置网格、标尺、参考线功能 */}
      
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: mode === 'design' ? 'rgba(244, 244, 244, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            color: '#666',
            zIndex: 1000,
          }}
        >
          正在初始化{mode === 'h5' ? 'H5' : '设计'}画布...
        </div>
      )}
    </CanvasContainer>
  );
};

export default SuikaCanvasComponent;