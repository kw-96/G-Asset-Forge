// H5画布
import './H5Canvas.scss';

import { type H5Service } from '@g-asset-forge/core';
import { type FC, useContext, useEffect } from 'react';

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
          // 检查H5Service是否仍然有效（避免项目关闭后的警告）
          if (
            h5Service &&
            typeof h5Service.getCurrentContainer === 'function'
          ) {
            h5Service.getCurrentContainer();
          }
        } catch (error) {
          console.warn('H5Canvas: 调试失败', error);
        }
      }, 500);
    }
  }, [editor, h5Service, containerRef]);

  return null;
};
