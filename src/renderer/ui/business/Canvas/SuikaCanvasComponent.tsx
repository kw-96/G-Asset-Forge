/**
 * Suika画布组件 - 集成Suika引擎的React组件
 * @description 提供基于Suika引擎的画布渲染和交互功能
 * @author 开发团队
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { SuikaEditor } from '../../../logic/engines/suika';

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

interface SuikaCanvasComponentProps {
  width?: number;
  height?: number;
  onReady?: (editor: SuikaEditor) => void;
  showRuler?: boolean;
  showGrid?: boolean;
  enableSnap?: boolean;
}

/**
 * Suika画布组件
 */
export const SuikaCanvasComponent: React.FC<SuikaCanvasComponentProps> = ({
  width = 800,
  height = 600,
  onReady,
  showRuler = false,
  showGrid = true,
  enableSnap = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SuikaEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建Suika编辑器实例
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
      },
    });

    editorRef.current = editor;

    // 设置编辑器配置
    if (showRuler) {
      editor.ruler.open();
    }

    // 监听编辑器事件
    const handleRender = () => {
      // 渲染完成
    };

    const handleSelectionChange = () => {
      // 选择变化
    };

    editor.on('render', handleRender);
    editor.on('selectionChange', handleSelectionChange);

    setIsReady(true);

    // 通知父组件编辑器已准备就绪
    if (onReady) {
      onReady(editor);
    }

    // 清理函数
    return () => {
      editor.off('render', handleRender);
      editor.off('selectionChange', handleSelectionChange);
      editor.destroy();
      editorRef.current = null;
      setIsReady(false);
    };
  }, [width, height, showRuler, showGrid, enableSnap, onReady]);

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