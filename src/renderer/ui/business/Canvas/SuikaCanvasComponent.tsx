/**
 * Suika画布组件 - 集成Suika引擎的React组件，统一调用Suika核心
 * @description 提供基于Suika引擎的画布渲染和交互功能，使用Suika内置的缩放平移系统
 * @author 开发团队
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika';
import { SuikaGridAdapter, SuikaRulerAdapter, SuikaRefLineAdapter } from '../common';

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f4f4f4;
`;

const CanvasWrapper = styled.div`
  position: absolute;
  inset: 0;
  
  canvas {
    display: block;
    cursor: default;
  }
`;

// 适配器容器 - 覆盖在Suika画布上方
const AdapterOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
`;

interface SuikaCanvasComponentProps {
  width?: number;
  height?: number;
  onReady?: (editor: SuikaEditor) => void;
  showRuler?: boolean;
  showGrid?: boolean;
  enableSnap?: boolean;
  mode?: 'design' | 'h5';
  selectedObjects?: any[];
}

/**
 * Suika画布组件 - 统一调用Suika核心，使用Suika内置的缩放平移系统
 * @description 不再使用ZoomPanContainer，直接使用Suika的ViewportManager进行缩放平移
 */
export const SuikaCanvasComponent: React.FC<SuikaCanvasComponentProps> = ({
  width = 800,
  height = 600,
  onReady,
  showRuler = false,
  showGrid = true,
  enableSnap = true,
  mode = 'design',
  selectedObjects = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SuikaEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 监听Suika编辑器的视口变化
  const handleViewportChange = useCallback(() => {
    if (editorRef.current) {
      // 视口变化处理逻辑
      // 可以在这里同步状态到其他组件
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建Suika编辑器实例 - 使用Suika内置的缩放平移系统
    const editor = new SuikaEditor({
      containerElement: containerRef.current,
      width,
      height,
      showPerfMonitor: process.env['NODE_ENV'] === 'development',
      userPreference: {
        enableRuler: showRuler,
        enablePixelGrid: showGrid,
        snapToGrid: enableSnap,
        snapToObjects: enableSnap,
        // 映射到Suika核心的设置
        minPixelGridZoom: mode === 'design' ? 1 : 1, // 降低网格显示阈值
        pixelGridLineColor: '#cccccc55',
        rulerBgColor: '#fff',
        rulerStroke: '#e6e6e6',
        rulerMarkStroke: '#c1c1c1',
        refLineStroke: '#f14f30ee',
        refLineTolerance: 4,
      },
    });

    editorRef.current = editor;

    // 设置编辑器配置
    if (showRuler) {
      editor.ruler.open();
    }

    // 监听编辑器的视口变化事件
    const handleRender = () => {
      handleViewportChange();
    };

    const handleSelectionChange = () => {
      // 选择变化
    };

    // 监听视口变化
    editor.viewportManager.on('viewportChange' as any, handleViewportChange);
    editor.on('render' as any, handleRender as any);
    editor.on('selectionChange' as any, handleSelectionChange as any);

    setIsReady(true);

    // 通知父组件编辑器已准备就绪
    if (onReady) {
      onReady(editor);
    }

    // 清理函数
    return () => {
      editor.viewportManager.off('viewportChange' as any, handleViewportChange);
      editor.off('render' as any, handleRender as any);
      editor.off('selectionChange' as any, handleSelectionChange as any);
      editor.destroy();
      editorRef.current = null;
      setIsReady(false);
    };
  }, [width, height, showRuler, showGrid, enableSnap, onReady, handleViewportChange]);

  // 处理容器尺寸变化
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.viewportManager.setViewportSize({ width, height });
      editorRef.current.render();
    }
  }, [width, height, isReady]);

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
      editorRef.current.setting.set('enablePixelGrid', showGrid);
      editorRef.current.setting.set('snapToGrid', enableSnap);
      editorRef.current.setting.set('snapToObjects', enableSnap);
      editorRef.current.render();
    }
  }, [showGrid, enableSnap, isReady]);

  return (
    <CanvasContainer>
      <CanvasWrapper ref={containerRef} />
      
      {/* 适配器覆盖层 - 在Suika画布上方渲染网格、标尺、参考线 */}
      {isReady && editorRef.current && (
        <AdapterOverlay>
          {/* 网格系统 - 仅在设计模式下显示 */}
          {mode === 'design' && showGrid && (
            <SuikaGridAdapter 
              editor={editorRef.current} 
              minZoomThreshold={1} 
            />
          )}
          
          {/* 标尺系统 - 在设计模式和H5模式中都显示 */}
          <SuikaRulerAdapter 
            editor={editorRef.current}
            visible={showRuler} 
            mode={mode} 
          />
          
          {/* 参考线系统 - 在设计模式和H5模式中都显示 */}
          <SuikaRefLineAdapter 
            editor={editorRef.current}
            visible={true} 
            mode={mode} 
            selectedObjects={selectedObjects}
          />
        </AdapterOverlay>
      )}
      
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(244, 244, 244, 0.8)',
            fontSize: '14px',
            color: '#666',
          }}
        >
          正在初始化画布...
        </div>
      )}
    </CanvasContainer>
  );
};

export default SuikaCanvasComponent;