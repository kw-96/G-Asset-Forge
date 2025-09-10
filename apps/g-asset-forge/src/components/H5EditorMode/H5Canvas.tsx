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
  contentBlocks: _contentBlocks,
  selectedBlockId: _selectedBlockId,
  onBlockSelect,
  h5Service,
}) => {
  const editor = useContext(EditorContext);
  // 移除canvasRef，不再需要DOM引用

  // 确保编辑器正确显示H5容器
  useEffect(() => {
    console.log('H5Canvas useEffect 触发', {
      hasEditor: !!editor?.editor,
      hasH5Service: !!h5Service,
    });

    if (editor?.editor && h5Service) {
      // 直接操作编辑器实例
      editor.editor.render();

      // 延迟检查画布内容
      setTimeout(() => {
        try {
          const currentCanvas = editor.editor?.doc.getCurrentCanvas();
          const children = currentCanvas?.getChildren();

          const h5Container = children?.find((child: any) => {
            // 使用与canvas.ts相同的识别逻辑
            return (
              child.type === 'H5Container' ||
              child.constructor?.name === 'H5Container' ||
              (child.attrs &&
                child.attrs.id &&
                child.attrs.id.includes('h5_container')) ||
              (child.attrs &&
                child.attrs.id &&
                child.attrs.id.includes('h5-container'))
            );
          });

          if (h5Container) {
            console.log('H5容器属性:', {
              id: h5Container.attrs.id,
              width: h5Container.attrs.width,
              height: h5Container.attrs.height,
              visible: h5Container.attrs.visible,
            });
          }

          // 检查H5Service是否仍然有效（避免项目关闭后的警告）
          if (
            h5Service &&
            typeof h5Service.getCurrentContainer === 'function'
          ) {
            const container = h5Service.getCurrentContainer();
            if (container) {
              console.log('H5Canvas: 通过H5Service找到H5容器', container);
            } else {
              console.log(
                'H5Canvas: H5Service中没有找到容器（可能正在初始化或已清理）',
              );
            }
          } else {
            console.log('H5Canvas: H5Service不可用（可能已清理）');
          }
        } catch (error) {
          console.warn('H5Canvas: 调试失败', error);
        }
      }, 500);
    } else {
      console.log('H5Canvas: 条件不满足', {
        editor: !!editor?.editor,
        h5Service: !!h5Service,
      });
    }
  }, [editor, h5Service]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onBlockSelect('');
    }
  };

  return (
    <div
      className="h5-canvas-wrapper h5-canvas-overlay"
      onClick={handleCanvasClick}
    >
      {/* 编辑器已经在父容器中正确挂载，这里提供交互层 */}
    </div>
  );
};
