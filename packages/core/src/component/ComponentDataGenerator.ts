/**
 * 组件数据生成器
 * 负责将图形对象转换为标准的组件定义格式
 * 确保生成的数据与组件转换器完全兼容
 */

import { type GAssetForgeGraphics } from '../graphics';
import { GraphicsType } from '../type';
import {
  type ComponentDefinition,
  type GraphicsElementDefinition,
} from './ComponentTypes';

/**
 * 组件生成选项
 */
export interface ComponentGenerationOptions {
  /** 组件名称 */
  name: string;
  /** 组件描述 */
  description?: string;
  /** 组件标签 */
  tags?: string[];
  /** 组件作者 */
  author?: string;
  /** 组件版本 */
  version?: string;
  /** 组件缩略图 */
  thumbnail?: string;
}

/**
 * 组件数据生成器类
 */
export class ComponentDataGenerator {
  /**
   * 从图形对象生成组件定义
   * @param graphics 要转换的图形对象
   * @param options 组件生成选项
   * @returns 标准的组件定义
   */
  static generateComponentDefinition(
    graphics: GAssetForgeGraphics,
    options: ComponentGenerationOptions,
  ): ComponentDefinition {
    const now = Date.now();
    const componentId = ComponentDataGenerator.generateComponentId();

    return {
      id: componentId,
      name: options.name,
      description: options.description || '',
      version: options.version || '1.0.0',
      author: options.author || '用户',
      tags: options.tags || [],
      icon: 'icon.24.plugin',
      thumbnail: options.thumbnail || '',
      rootElement:
        ComponentDataGenerator.convertGraphicsToElementDefinition(graphics),
      parameters: [], // 暂时不支持参数
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 将图形对象转换为图形元素定义
   * 这个方法确保生成的数据格式与component_converter.ts完全兼容
   */
  static convertGraphicsToElementDefinition(
    graphics: GAssetForgeGraphics,
  ): GraphicsElementDefinition {
    // 获取图形类型的字符串表示
    const typeString = ComponentDataGenerator.getGraphicsTypeString(graphics);

    // 提取基础属性（符合转换器期望的格式）
    const attrs = ComponentDataGenerator.extractGraphicsAttributes(graphics);

    // 递归处理子元素
    const children = ComponentDataGenerator.extractChildren(graphics);

    return {
      type: typeString,
      id: graphics.attrs?.id || ComponentDataGenerator.generateElementId(),
      name: graphics.attrs?.objectName || typeString,
      attrs,
      children,
    };
  }

  /**
   * 获取图形类型的字符串表示
   * 确保与component_converter.ts中的switch case匹配
   */
  private static getGraphicsTypeString(graphics: GAssetForgeGraphics): string {
    switch (graphics.type) {
      case GraphicsType.Rect:
        // 如果是图片类型的矩形，判断是否有图片填充
        if (ComponentDataGenerator.hasImageFill(graphics)) {
          return 'Image';
        }
        return 'Rect';
      case GraphicsType.Ellipse:
        return 'Ellipse';
      case GraphicsType.Frame:
        return 'Frame';
      case GraphicsType.Text:
        return 'Text';
      case GraphicsType.Path:
        return 'Path';
      case GraphicsType.Line:
        return 'Line';
      default:
        return 'Rect'; // 默认返回Rect
    }
  }

  /**
   * 提取图形属性
   * 只提取转换器需要的属性，避免内部实现细节
   */
  private static extractGraphicsAttributes(
    graphics: GAssetForgeGraphics,
  ): Record<string, any> {
    const attrs: Record<string, any> = {};
    const graphicsAttrs = graphics.attrs;

    // 安全检查：确保 attrs 存在
    if (!graphicsAttrs || typeof graphicsAttrs !== 'object') {
      console.warn('图形对象缺少有效的 attrs 属性，使用默认值');
    }

    // 基础位置和尺寸属性 - 从transform中提取x,y
    const localPos = graphics.getLocalPosition();
    const size = graphics.getSize();

    attrs.x = localPos.x;
    attrs.y = localPos.y;
    attrs.width = size.width;
    attrs.height = size.height;

    // 文本属性
    if (graphics.type === GraphicsType.Text) {
      const textGraphics = graphics as any; // GAssetForgeText
      if (textGraphics.attrs?.content) attrs.text = textGraphics.attrs.content;
      if (textGraphics.attrs?.fontSize)
        attrs.fontSize = textGraphics.attrs.fontSize;
      if (textGraphics.attrs?.fontFamily)
        attrs.fontFamily = textGraphics.attrs.fontFamily;
    }

    // 填充属性 - 检查是否有图片填充
    if (graphicsAttrs?.fill && Array.isArray(graphicsAttrs.fill)) {
      const imageFill = graphicsAttrs.fill.find(
        (fill: any) => fill.type === 'Image',
      );
      if (imageFill && imageFill.type === 'Image' && imageFill.attrs?.src) {
        attrs.src = imageFill.attrs.src;
      }
    }

    // Frame特有属性
    if (graphics.type === GraphicsType.Frame && graphicsAttrs) {
      // 类型断言为Frame的attributes
      const frameAttrs = graphicsAttrs as any;
      if (typeof frameAttrs.resizeToFit === 'boolean') {
        attrs.resizeToFit = frameAttrs.resizeToFit;
      }
      if (typeof frameAttrs.padding === 'number') {
        attrs.padding = frameAttrs.padding;
      }
    }

    // 颜色和样式属性
    if (graphicsAttrs?.fill) attrs.fill = graphicsAttrs.fill;
    if (graphicsAttrs?.stroke) attrs.stroke = graphicsAttrs.stroke;
    if (typeof graphicsAttrs?.cornerRadius === 'number') {
      attrs.cornerRadius = graphicsAttrs.cornerRadius;
    }

    return attrs;
  }

  /**
   * 提取子元素
   */
  private static extractChildren(
    graphics: GAssetForgeGraphics,
  ): GraphicsElementDefinition[] {
    const children: GraphicsElementDefinition[] = [];

    // 检查是否有子元素
    if (graphics && typeof graphics.getChildren === 'function') {
      const childGraphics = graphics.getChildren();

      if (Array.isArray(childGraphics)) {
        for (const child of childGraphics) {
          if (child && typeof child === 'object') {
            try {
              const childDefinition =
                ComponentDataGenerator.convertGraphicsToElementDefinition(
                  child,
                );
              children.push(childDefinition);
            } catch (error) {
              console.warn('转换子元素失败，跳过:', error);
            }
          }
        }
      }
    }

    return children;
  }

  /**
   * 检查图形是否有图片填充
   */
  private static hasImageFill(graphics: GAssetForgeGraphics): boolean {
    const fill = graphics.attrs?.fill;
    if (!Array.isArray(fill)) return false;

    return fill.some((f: any) => f && f.type === 'Image' && f.attrs?.src);
  }

  /**
   * 生成组件ID
   */
  private static generateComponentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `component_${timestamp}_${random}`;
  }

  /**
   * 生成元素ID
   */
  private static generateElementId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `element_${timestamp}_${random}`;
  }

  /**
   * 验证生成的组件定义是否有效
   */
  static validateComponentDefinition(component: ComponentDefinition): boolean {
    // 检查必需字段
    if (!component.id || !component.name) {
      return false;
    }

    // 检查根元素
    if (
      !component.rootElement ||
      !component.rootElement.type ||
      !component.rootElement.id
    ) {
      return false;
    }

    // 检查参数数组
    if (!Array.isArray(component.parameters)) {
      return false;
    }

    // 检查时间戳
    if (
      typeof component.createdAt !== 'number' ||
      typeof component.updatedAt !== 'number'
    ) {
      return false;
    }

    return true;
  }
}

/**
 * 便捷函数：从图形对象生成组件定义
 */
export function generateComponentFromGraphics(
  graphics: GAssetForgeGraphics,
  options: ComponentGenerationOptions,
): ComponentDefinition {
  return ComponentDataGenerator.generateComponentDefinition(graphics, options);
}

/**
 * 便捷函数：将图形对象转换为元素定义
 */
export function convertGraphicsToElementDefinition(
  graphics: GAssetForgeGraphics,
): GraphicsElementDefinition {
  return ComponentDataGenerator.convertGraphicsToElementDefinition(graphics);
}
