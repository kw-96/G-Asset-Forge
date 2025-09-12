// H5画布
import './H5Canvas.scss';

import {
  type ComponentDefinition,
  type GraphicsElementDefinition,
  type H5Service,
} from '@g-asset-forge/core';
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
          const currentCanvas = editor.editor?.doc.getCurrentCanvas();

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

  // 处理拖拽进入
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  // 处理拖拽放置
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    try {
      // 获取拖拽的组件数据
      const componentData = event.dataTransfer.getData('application/json');
      if (!componentData) {
        console.warn('没有获取到组件数据');
        return;
      }

      const component = JSON.parse(componentData);
      console.log('接收到拖拽的组件:', component);

      // 获取H5容器
      const currentCanvas = editor?.editor?.doc?.getCurrentCanvas();
      if (!currentCanvas) {
        console.warn('无法获取当前画布');
        return;
      }

      const h5Container = currentCanvas.getChildren().find((child: any) => {
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

      if (!h5Container) {
        console.warn('未找到H5容器');
        return;
      }

      // 将组件转换为H5内容块
      await addComponentToH5Container(component, h5Container, editor?.editor);
    } catch (error) {
      console.error('处理组件拖拽失败:', error);
    }
  };

  return (
    <div
      className="h5-canvas-wrapper h5-canvas-overlay"
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto', // 允许拖拽交互
        zIndex: 1, // 确保在编辑器画布之上，但不阻止交互
        backgroundColor: 'transparent', // 确保背景透明
      }}
    >
      {/* 编辑器已经在父容器中正确挂载，这里提供交互层 */}
    </div>
  );
};

/**
 * 将组件添加到H5容器中
 */
async function addComponentToH5Container(
  component: ComponentDefinition,
  h5Container: any,
  editor: any,
): Promise<void> {
  try {
    // 生成新的元素ID，避免冲突
    const generateId = () =>
      `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 递归转换组件元素为图形元素
    const convertElement = (elementDef: GraphicsElementDefinition): any => {
      const newId = generateId();

      // 创建基础元素属性
      const elementAttrs = {
        id: newId,
        objectName: elementDef.name || `${component.name}_${elementDef.type}`,
        type: elementDef.type,
        ...elementDef.attrs,
        // 确保位置相对于H5容器
        x: (elementDef.attrs?.x || 0) + (h5Container.attrs?.padding || 16),
        y: (elementDef.attrs?.y || 0) + (h5Container.attrs?.padding || 16),
        transform: [1, 0, 0, 1, 0, 0], // 重置变换矩阵
      };

      // 根据元素类型创建相应的图形对象
      let graphicsElement: any;

      switch (elementDef.type) {
        case 'Frame':
          // 创建Frame元素
          graphicsElement = editor.doc.createGraphics('Frame', elementAttrs);
          break;
        case 'Text':
          // 创建Text元素
          graphicsElement = editor.doc.createGraphics('Text', elementAttrs);
          break;
        case 'Image':
          // 创建Image元素
          graphicsElement = editor.doc.createGraphics('Image', elementAttrs);
          break;
        case 'Rect':
          // 创建Rect元素
          graphicsElement = editor.doc.createGraphics('Rect', elementAttrs);
          break;
        case 'Ellipse':
          // 创建Ellipse元素
          graphicsElement = editor.doc.createGraphics('Ellipse', elementAttrs);
          break;
        default:
          console.warn(`不支持的图形类型: ${elementDef.type}`);
          return null;
      }

      if (!graphicsElement) {
        return null;
      }

      // 递归处理子元素
      if (elementDef.children && elementDef.children.length > 0) {
        elementDef.children.forEach((childDef) => {
          const childElement = convertElement(childDef);
          if (childElement) {
            graphicsElement.insertChild(childElement);
          }
        });
      }

      return graphicsElement;
    };

    // 转换根元素
    const rootElement = convertElement(component.rootElement);
    if (!rootElement) {
      throw new Error('无法转换组件根元素');
    }

    // 将元素添加到H5容器中
    h5Container.insertChild(rootElement);

    // 触发编辑器重新渲染
    editor.render();

    console.log(`成功添加组件 "${component.name}" 到H5容器`);
  } catch (error) {
    console.error('添加组件到H5容器失败:', error);
    throw error;
  }
}
