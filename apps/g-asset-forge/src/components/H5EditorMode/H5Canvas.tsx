// H5画布
import './H5Canvas.scss';

import { type H5Service } from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useRef } from 'react';

import { EditorContext } from '../../context';

interface H5CanvasProps {
  h5Service?: H5Service | null; // 添加H5Service引用
  containerRef?: React.RefObject<HTMLDivElement>; // 添加容器引用
}

export const H5Canvas: FC<H5CanvasProps> = ({ h5Service, containerRef }) => {
  const editor = useContext(EditorContext);
  // 移除canvasRef，不再需要DOM引用

  // 确保编辑器正确显示H5容器
  useEffect(() => {
    if (editor?.editor && h5Service && containerRef?.current) {
      // 重新挂载编辑器画布到正确的容器
      const canvasElement = editor.editor.canvasElement;
      const currentContainer = editor.editor.containerElement;
      const targetContainer = containerRef.current;

      // 如果画布不在目标容器中，则移动它
      if (canvasElement && currentContainer !== targetContainer) {
        // 从当前容器移除画布
        if (currentContainer && currentContainer.contains(canvasElement)) {
          currentContainer.removeChild(canvasElement);
        }

        // 将画布添加到目标容器
        targetContainer.appendChild(canvasElement);

        // 更新编辑器的容器引用
        editor.editor.containerElement = targetContainer;
      }

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

          // 检查H5Service是否仍然有效（避免项目关闭后的警告）
          if (
            h5Service &&
            typeof h5Service.getCurrentContainer === 'function'
          ) {
            const container = h5Service.getCurrentContainer();
          }
        } catch (error) {
          console.warn('H5Canvas: 调试失败', error);
        }
      }, 500);
    }
  }, [editor, h5Service]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    // LayerPanel会自动处理选择变化，这里不需要额外处理
    if (event.target === event.currentTarget) {
      // 清空选择
      if (editor?.editor) {
        editor.editor.selectedElements.setItems([]);
        editor.editor.render();
      }
    }
  };

  return (
    <div
      className="h5-canvas-wrapper h5-canvas-overlay"
      onClick={handleCanvasClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // 允许事件穿透到编辑器
        zIndex: 1, // 确保在编辑器画布之上，但不阻止交互
        backgroundColor: 'transparent', // 确保背景透明
      }}
    >
      {/* 编辑器已经在父容器中正确挂载，这里提供交互层 */}
    </div>
  );
};
