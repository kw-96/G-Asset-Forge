// H5组件转换器 - 使用工具API创建图形元素
import { cloneDeep } from '@g-asset-forge/common';
import { normalizeRect } from '@g-asset-forge/geo';

import type {
  ComponentDefinition,
  GraphicsElementDefinition,
} from '../../component/ComponentTypes';
import { PaintType } from '../../paint';
import { getNoConflictObjectName } from '../../utils';
import {
  GAssetForgeEllipse,
  GAssetForgeFrame,
  GAssetForgeRect,
  GAssetForgeText,
  GraphicsObjectSuffix,
} from '../index';

/**
 * 使用工具API风格创建图形元素 - 最简洁的实现方式
 */
export async function addComponentToH5Container(
  component: ComponentDefinition,
  h5Container: any,
  editor: any,
): Promise<void> {
  try {
    // 递归创建图形元素 - 借鉴工具的createGraphics模式
    const createGraphicsElement = (
      elementDef: GraphicsElementDefinition,
    ): any => {
      // 位置和尺寸计算 - 保持组件原始尺寸，不添加容器padding
      const x = elementDef.attrs?.x || 0;
      const y = elementDef.attrs?.y || 0;
      const width = elementDef.attrs?.width || 100;
      const height = elementDef.attrs?.height || 100;

      const rect = normalizeRect({ x, y, width, height });
      let graphicsElement: any;

      // 使用工具API风格创建图形 - 每种类型都遵循对应工具的最佳实践
      switch (elementDef.type) {
        case 'Rect': {
          // 完全遵循 DrawRectTool 的实现
          graphicsElement = new GAssetForgeRect(
            {
              objectName:
                elementDef.name ||
                getNoConflictObjectName(h5Container, GraphicsObjectSuffix.Rect),
              width: rect.width,
              height: rect.height,
              fill: [cloneDeep(editor.setting.get('firstFill'))],
              ...elementDef.attrs,
            },
            {
              advancedAttrs: { x: rect.x, y: rect.y },
              doc: editor.doc,
            },
          );
          break;
        }

        case 'Ellipse': {
          // 遵循 DrawEllipseTool 的实现
          graphicsElement = new GAssetForgeEllipse(
            {
              objectName:
                elementDef.name ||
                getNoConflictObjectName(
                  h5Container,
                  GraphicsObjectSuffix.Ellipse,
                ),
              width: rect.width,
              height: rect.height,
              fill: [cloneDeep(editor.setting.get('firstFill'))],
              ...elementDef.attrs,
            },
            {
              advancedAttrs: { x: rect.x, y: rect.y },
              doc: editor.doc,
            },
          );
          break;
        }

        case 'Frame': {
          // 遵循 DrawFrameTool 的实现
          graphicsElement = new GAssetForgeFrame(
            {
              objectName:
                elementDef.name ||
                getNoConflictObjectName(
                  h5Container,
                  GraphicsObjectSuffix.Frame,
                ),
              width: rect.width,
              height: rect.height,
              resizeToFit: false,
              ...elementDef.attrs,
            },
            {
              advancedAttrs: { x: rect.x, y: rect.y },
              doc: editor.doc,
            },
          );
          break;
        }

        case 'Text': {
          // 文本创建方式
          graphicsElement = new GAssetForgeText(
            {
              objectName:
                elementDef.name ||
                getNoConflictObjectName(h5Container, GraphicsObjectSuffix.Text),
              width: rect.width,
              height: rect.height,
              content: elementDef.attrs?.text || 'Text',
              fontSize: elementDef.attrs?.fontSize || 16,
              fontFamily: elementDef.attrs?.fontFamily || 'sans-serif',
              ...elementDef.attrs,
            },
            {
              advancedAttrs: { x: rect.x, y: rect.y },
              doc: editor.doc,
            },
          );
          break;
        }

        case 'Image': {
          // 完全遵循 DrawImgTool 的实现 - Rect + Image Paint
          // 统一 fill 处理逻辑：优先使用图像，回退到默认填充
          let imageFill;
          if (elementDef.attrs?.src) {
            // 有图像源时使用图像填充
            imageFill = [
              {
                type: PaintType.Image,
                attrs: {
                  src: elementDef.attrs.src,
                },
              },
            ];
          } else {
            // 没有图像源时使用默认填充，保持与其他元素类型一致
            imageFill = [cloneDeep(editor.setting.get('firstFill'))];
          }

          graphicsElement = new GAssetForgeRect(
            {
              objectName:
                elementDef.name ||
                getNoConflictObjectName(h5Container, 'Image'),
              width: rect.width,
              height: rect.height,
              fill: imageFill,
              ...elementDef.attrs,
            },
            {
              advancedAttrs: { x: rect.x, y: rect.y },
              doc: editor.doc,
            },
          );
          break;
        }

        default:
          console.warn(`不支持的图形类型: ${elementDef.type}`);
          return null;
      }

      if (!graphicsElement) {
        return null;
      }

      // 使用工具的标准流程：先添加到场景图，再建立父子关系
      editor.sceneGraph.addItems([graphicsElement]);

      // 递归处理子元素
      if (elementDef.children && elementDef.children.length > 0) {
        for (const childDef of elementDef.children) {
          const childElement = createGraphicsElement(childDef);
          if (childElement) {
            graphicsElement.insertChild(childElement);
          }
        }
      }

      return graphicsElement;
    };

    // 创建根元素
    const rootElement = createGraphicsElement(component.rootElement);
    if (!rootElement) {
      throw new Error('无法创建组件根元素');
    }

    // 将根元素添加到H5容器 - 遵循工具的标准流程
    h5Container.insertChild(rootElement);

    // 触发重新渲染
    editor.render();

    console.log(`✅ 成功添加组件 "${component.name}" 到H5容器`);
  } catch (error) {
    console.error('❌ 添加组件到H5容器失败:', error);
    throw error;
  }
}
