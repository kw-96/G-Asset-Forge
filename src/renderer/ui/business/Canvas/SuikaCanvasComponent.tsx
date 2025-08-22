/**
 * 统一Suika画布组件 - 支持设计模式和H5模式的统一画布系统
 * @description 基于Suika引擎的统一画布组件，支持设计模式的无限画布和H5模式的固定尺寸画布
 * @author 开发团队
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika';
// 移除不再使用的适配器导入，直接使用Suika核心功能
import { useCanvasStore } from '../../../stores/canvasStore';
import { toolManager } from '../../../logic/managers/tools/ToolManager';

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
  
  /* H5模式下的画布样式 */
  ${({ $mode }) => $mode === 'h5' && `
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: white;
  `}
`;

// 移除不再使用的适配器容器样式

interface SuikaCanvasComponentProps {
  width?: number;
  height?: number;
  onReady?: (editor: SuikaEditor) => void;
  showRuler?: boolean;
  showGrid?: boolean;
  enableSnap?: boolean;
  mode?: 'design' | 'h5';
  // 移除不再使用的selectedObjects参数，参考线由Suika核心管理
}

/**
 * 统一Suika画布组件 - 支持设计模式和H5模式
 * @description 使用Suika核心引擎，支持无限画布（设计模式）和固定尺寸画布（H5模式）
 */
export const SuikaCanvasComponent: React.FC<SuikaCanvasComponentProps> = ({
  width = 800,
  height = 600,
  onReady,
  showRuler = false,
  showGrid = true,
  enableSnap = true,
  mode = 'design',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SuikaEditor | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // 使用画布状态管理
  const { updatePerformanceMetrics } = useCanvasStore();

  // H5模式的画布尺寸
  // const h5CanvasWidth = mode === 'h5' ? 375 : undefined;
  // const h5CanvasHeight = mode === 'h5' ? 812 : undefined;

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
      // width: mode === 'h5' ? h5CanvasWidth! : width,
      // height: mode === 'h5' ? h5CanvasHeight! : height,
      showPerfMonitor: process.env['NODE_ENV'] === 'development',
      userPreference: {
        enableRuler: showRuler,
        enablePixelGrid: showGrid && mode === 'design', // H5模式下不显示网格
        snapToGrid: enableSnap,
        snapToObjects: enableSnap,
        // 根据模式调整设置
        minPixelGridZoom: mode === 'design' ? 0.5 : 1,
        pixelGridLineColor: mode === 'design' ? '#cccccc55' : '#e0e0e055',
        rulerBgColor: '#fff',
        rulerStroke: '#e6e6e6',
        rulerMarkStroke: '#c1c1c1',
        refLineStroke: '#f14f30ee',
        refLineTolerance: 4,
        // H5模式特殊设置
        ...(mode === 'h5' && {
          // canvasWidth: h5CanvasWidth,
          // canvasHeight: h5CanvasHeight,
          // enableInfiniteCanvas: false, // H5模式下禁用无限画布
        }),
        // 设计模式特殊设置
        ...(mode === 'design' && {
          enableInfiniteCanvas: true, // 设计模式下启用无限画布
        }),
      },
    };

    // 创建Suika编辑器实例
    const editor = new SuikaEditor(canvasConfig as any);
    editorRef.current = editor;

    // 设置编辑器配置
    if (showRuler) {
      editor.ruler.open();
    }

    // H5模式下的特殊设置
    if (mode === 'h5') {
      // console.log('[suika-canvas] H5模式设置:', { h5CanvasWidth, h5CanvasHeight });
      
      // 设置固定画布尺寸
      // editor.viewportManager.setViewportSize({ 
      // //   width: h5CanvasWidth!, 
      // //   height: h5CanvasHeight! 
      // });
      
      // 禁用网格显示
      editor.setting.set('enablePixelGrid', false);
      
      // 居中显示画布
      // const containerRect = containerRef.current.getBoundingClientRect();
      // const centerX = (containerRect.width - h5CanvasWidth!) / 2;
      // const centerY = (containerRect.height - h5CanvasHeight!) / 2;
      // console.log('[suika-canvas] 居中位置:', { centerX, centerY });
      
      // 使用translate方法居中画布
      // editor.viewportManager.translate(centerX, centerY);
    }

    // 监听编辑器事件
    // 暂时注释掉未使用的事件处理器，等待Suika API完善
    // const handleRender = () => {
    //   handleViewportChange();
    // };

    // const handleSelectionChange = () => {
    //   // 选择变化处理
    //   const selectedElements = editor.selectedElements.getItems();
    //   console.log('选择变化:', selectedElements);
    // };

    // const handleToolActivate = (toolType: string) => {
    //   console.log('工具激活:', toolType);
    // };

    // 绑定事件监听器 - 使用正确的事件名称
    editor.viewportManager.on('zoomChange', handleViewportChange);
    editor.viewportManager.on('xOrYChange', handleViewportChange);
    // 暂时注释掉不存在的事件，等待API完善
    // editor.on('render', handleRender);
    // editor.on('selectionChange', handleSelectionChange);
    // editor.on('toolActivate', handleToolActivate);

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
      // 暂时注释掉不存在的事件，等待API完善
      // editor.off('render', handleRender);
      // editor.off('selectionChange', handleSelectionChange);
      // editor.off('toolActivate', handleToolActivate);
      editor.destroy();
      editorRef.current = null;
      setIsReady(false);
    };
  // }, [width, height, showRuler, showGrid, enableSnap, mode, h5CanvasWidth, h5CanvasHeight]); 
  }, [width, height, showRuler, showGrid, enableSnap, mode ]); 

  // 处理容器尺寸变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (mode === 'design') {
        editorRef.current.viewportManager.setViewportSize({ width, height });
      } else {
        // H5模式下保持固定尺寸
      //   editorRef.current.viewportManager.setViewportSize({ 
      //     width: h5CanvasWidth!, 
      //     height: h5CanvasHeight! 
      //   });
      }
      editorRef.current.render();
    }
  }, [width, height, isReady, mode ]);
  // }, [width, height, isReady, mode, h5CanvasWidth, h5CanvasHeight]);

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
      editorRef.current.setting.set('snapToObjects', enableSnap);
      editorRef.current.render();
    }
  }, [showGrid, enableSnap, isReady, mode]);

  // 处理模式切换
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (mode === 'h5') {
        // 切换到H5模式
        console.log('[suika-canvas] 切换到H5模式');
        
        // 设置固定画布尺寸
        // editorRef.current.viewportManager.setViewportSize({ 
        //   width: h5CanvasWidth!, 
        //   height: h5CanvasHeight! 
        // });
        
        // 禁用网格显示
        editorRef.current.setting.set('enablePixelGrid', false);
        
        // 重置视口并居中
        editorRef.current.viewportManager.resetViewport();
      } else {
        // 切换到设计模式
        console.log('[suika-canvas] 切换到设计模式');
        
        // 恢复原始尺寸
        editorRef.current.viewportManager.setViewportSize({ 
          width: width, 
          height: height 
        });
        
        // 启用网格显示
        editorRef.current.setting.set('enablePixelGrid', showGrid);
        
        // 重置视口
        editorRef.current.viewportManager.resetViewport();
      }
      editorRef.current.render();
    }
  // }, [mode, isReady, showGrid, h5CanvasWidth, h5CanvasHeight, width, height]);
  }, [mode, isReady, showGrid, width, height]);
  return (
    <CanvasContainer $mode={mode}>
      <CanvasWrapper 
        ref={containerRef} 
        $mode={mode}
        // {...(mode === 'h5' && h5CanvasWidth && h5CanvasHeight && {
        //   $canvasWidth: h5CanvasWidth,
        //   $canvasHeight: h5CanvasHeight
        // })}
      />
      
      {/* 移除重复的适配器覆盖层，直接使用Suika核心的网格、标尺、参考线渲染 */}
      {/* 注意：Suika核心已经内置了这些功能，不需要额外的React适配器 */}
      
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