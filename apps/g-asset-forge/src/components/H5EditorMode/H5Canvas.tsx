// H5画布
import './H5Canvas.scss';

import { type H5Service } from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useRef } from 'react';

import { EditorContext } from '../../context';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
  order: number;
}

interface H5CanvasProps {
  contentBlocks: ContentBlock[];
  selectedBlockId: string;
  onBlockSelect: (blockId: string) => void;
  h5Service?: H5Service | null; // 添加H5Service引用
}

export const H5Canvas: FC<H5CanvasProps> = ({
  contentBlocks: _contentBlocks, // 未使用，但需要保持接口一致性
  selectedBlockId: _selectedBlockId, // 未使用，但需要保持接口一致性
  onBlockSelect,
  h5Service,
}) => {
  const editor = useContext(EditorContext);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 确保编辑器画布正确显示H5容器
  useEffect(() => {
    if (editor && canvasRef.current && h5Service) {
      // 强制重新渲染编辑器，确保H5容器可见
      editor?.editor?.render();

      // 延迟调整视口，确保H5容器已完全初始化
      setTimeout(() => {
        try {
          // 直接通过H5Service获取容器信息
          const container = h5Service.getCurrentContainer();
          if (container) {
            console.log('H5Canvas: 通过H5Service找到H5容器', container);
            // 使用编辑器的视口管理聚焦到H5容器
            editor?.editor?.viewportManager.zoomToFit(1);
            editor?.editor?.render();
          } else {
            console.warn('H5Canvas: H5Service中没有找到容器');
          }
        } catch (error) {
          console.warn('H5Canvas: 调整视口失败', error);
        }
      }, 200);
    }
  }, [editor, h5Service]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    // 点击画布空白区域时取消选择
    if (event.target === event.currentTarget) {
      onBlockSelect('');
    }
  };

  return (
    <div
      ref={canvasRef}
      className="h5-canvas-wrapper h5-canvas-overlay"
      onClick={handleCanvasClick}
    >
      {/* 编辑器画布由GAssetForgeEditor自动管理，H5容器会在这里显示 */}
      {/* 如果看不到H5容器，请检查控制台输出 */}
    </div>
  );
};
