import './H5Canvas.scss';

import { type FC, useContext, useEffect, useRef } from 'react';

import { EditorContext } from '../../context';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
}

interface H5CanvasProps {
  contentBlocks: ContentBlock[];
  selectedBlockId: string;
  onBlockSelect: (blockId: string) => void;
}

export const H5Canvas: FC<H5CanvasProps> = ({
  contentBlocks,
  onBlockSelect,
}) => {
  const editor = useContext(EditorContext);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor && canvasRef.current) {
      // H5 模式下，编辑器画布已经由 H5Service 配置
      // 这里主要是提供一个容器来包装编辑器画布
      const editorCanvas = editor.canvasElement;
      if (editorCanvas && canvasRef.current) {
        // 确保编辑器画布在容器中正确显示
        canvasRef.current.appendChild(editorCanvas);
      }
    }

    return () => {
      // 清理时移除画布元素
      if (editor && canvasRef.current) {
        const editorCanvas = editor.canvasElement;
        if (editorCanvas && canvasRef.current.contains(editorCanvas)) {
          canvasRef.current.removeChild(editorCanvas);
        }
      }
    };
  }, [editor]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    // 点击画布空白区域时取消选择
    if (event.target === canvasRef.current) {
      onBlockSelect('');
    }
  };

  return (
    <div className="h5-canvas-container">
      {/* 画布信息栏 */}
      <div className="canvas-info-bar">
        <div className="canvas-title">H5 长图编辑</div>
        <div className="canvas-stats">
          <span className="canvas-size">375 × 自适应</span>
          <span className="block-count">{contentBlocks.length} 个内容块</span>
        </div>
      </div>

      {/* 编辑器画布容器 */}
      <div
        ref={canvasRef}
        className="h5-canvas-wrapper"
        onClick={handleCanvasClick}
      >
        {/* 编辑器画布将被插入到这里 */}
      </div>

      {/* 空状态提示 */}
      {contentBlocks.length === 0 && (
        <div className="empty-canvas-overlay">
          <div className="empty-content">
            <div className="empty-icon">📱</div>
            <div className="empty-text">使用下方工具栏添加内容块开始创建</div>
            <div className="empty-hint">支持文本、图片、按钮等多种内容类型</div>
          </div>
        </div>
      )}
    </div>
  );
};
