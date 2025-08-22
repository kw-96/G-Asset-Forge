/**
 * 属性管理器 - 管理Suika画布中图形对象的属性
 * @description 基于Suika引擎的属性管理，提供完整的属性操作功能
 * @author 开发团队
 */

// 替换Node.js的EventEmitter为浏览器兼容的实现
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

import type { SuikaEditor } from '../../engines/suika';
import type { SuikaGraphics } from '../../engines/suika/core/graphics';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface Fill {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string }>;
    angle?: number;
  };
  image?: {
    url: string;
    fit: 'fill' | 'fit' | 'crop';
  };
}

export interface Stroke {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  dashArray?: number[];
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number | string;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through';
  lineHeight: number;
  letterSpacing: number;
}

export interface ObjectProperties {
  id: string;
  type: string;
  name: string;
  transform: Transform;
  fill?: Fill;
  stroke?: Stroke;
  opacity: number;
  visible: boolean;
  locked: boolean;
  blendMode?: string;
  
  // 文本特有属性
  content?: string;
  textStyle?: TextStyle;
  
  // 形状特有属性
  cornerRadius?: number;
  
  // 路径特有属性
  pathData?: string;
}

export interface PropertyManagerEvents {
  propertiesChanged: (properties: ObjectProperties[]) => void;
  transformChanged: (objectId: string, transform: Transform) => void;
  fillChanged: (objectId: string, fill: Fill) => void;
  strokeChanged: (objectId: string, stroke: Stroke) => void;
  textStyleChanged: (objectId: string, textStyle: TextStyle) => void;
  opacityChanged: (objectId: string, opacity: number) => void;
}

/**
 * 属性管理器类
 * @description 管理Suika编辑器中选中对象的属性，提供属性读取和修改功能
 */
export class PropertyManager extends EventEmitter {
  private suikaEditor: SuikaEditor | null = null;
  private currentProperties: ObjectProperties[] = [];

  constructor() {
    super();
  }

  /**
   * 设置Suika编辑器实例
   * @param editor Suika编辑器实例
   */
  setSuikaEditor(editor: SuikaEditor | null) {
    if (this.suikaEditor) {
      // 清理之前的事件监听
      this.suikaEditor.selectedElements.off('itemsChange', this.handleSelectionChange);
    }

    this.suikaEditor = editor;

    if (editor) {
      // 监听选择变化事件
      editor.selectedElements.on('itemsChange', this.handleSelectionChange);
      
      // 同步当前属性
      this.syncPropertiesFromSuika();
    }
  }

  /**
   * 处理选择变化事件
   */
  private handleSelectionChange = () => {
    this.syncPropertiesFromSuika();
  };

  /**
   * 从Suika同步属性
   */
  private syncPropertiesFromSuika() {
    if (!this.suikaEditor) {
      this.currentProperties = [];
      this.emit('propertiesChanged', []);
      return;
    }

    const selectedItems = this.suikaEditor.selectedElements.getItems();
    const properties = selectedItems.map(item => this.graphicToProperties(item));
    
    this.currentProperties = properties;
    this.emit('propertiesChanged', properties);
  }

  /**
   * 将Suika图形对象转换为属性对象
   * @param graphic Suika图形对象
   * @returns 属性对象
   */
  private graphicToProperties(graphic: SuikaGraphics): ObjectProperties {
    const attrs = graphic.attrs;
    const bbox = graphic.getBbox();

    const properties: ObjectProperties = {
      id: attrs.id,
      type: graphic.type,
      name: attrs.objectName || this.getDefaultObjectName(graphic.type),
      transform: {
        x: (bbox as any).x || 0,
        y: (bbox as any).y || 0,
        width: (bbox as any).width || 0,
        height: (bbox as any).height || 0,
        rotation: 0, // Suika uses matrix transform
        scaleX: 1,
        scaleY: 1,
      },
      opacity: attrs.opacity || 1,
      visible: graphic.isVisible(),
      locked: attrs.lock || false,
      blendMode: 'normal', // Suika doesn't have blendMode in attrs
    };

    // 填充属性
    if (attrs.fill) {
      properties.fill = this.parseFill(attrs.fill);
    }

    // 描边属性
    if (attrs.stroke) {
      properties.stroke = this.parseStroke(attrs.stroke);
    }

    // 文本特有属性
    if (graphic.type === 'Text' && (attrs as any).content !== undefined) {
      properties.content = (attrs as any).content;
      properties.textStyle = this.parseTextStyle(attrs as any);
    }

    // 矩形特有属性
    if (graphic.type === 'Rect' && (attrs as any).cornerRadius !== undefined) {
      properties.cornerRadius = (attrs as any).cornerRadius;
    }

    // 路径特有属性
    if (graphic.type === 'Path' && (attrs as any).pathData !== undefined) {
      properties.pathData = (attrs as any).pathData;
    }

    return properties;
  }

  /**
   * 解析填充属性
   */
  private parseFill(fillData: any): Fill {
    if (typeof fillData === 'string') {
      return { type: 'solid', color: fillData };
    }
    
    if (fillData.type === 'solid') {
      return { type: 'solid', color: fillData.color };
    }
    
    // TODO: 支持渐变和图片填充
    return { type: 'solid', color: '#000000' };
  }

  /**
   * 解析描边属性
   */
  private parseStroke(strokeData: any): Stroke {
    return {
      color: strokeData.color || '#000000',
      width: strokeData.width || 1,
      style: strokeData.style || 'solid',
      dashArray: strokeData.dashArray,
    };
  }

  /**
   * 解析文本样式
   */
  private parseTextStyle(attrs: any): TextStyle {
    return {
      fontSize: attrs.fontSize || 14,
      fontFamily: attrs.fontFamily || 'Arial',
      fontWeight: attrs.fontWeight || 400,
      fontStyle: attrs.fontStyle || 'normal',
      textAlign: attrs.textAlign || 'left',
      textDecoration: attrs.textDecoration || 'none',
      lineHeight: attrs.lineHeight || 1.2,
      letterSpacing: attrs.letterSpacing || 0,
    };
  }

  /**
   * 获取默认对象名称
   */
  private getDefaultObjectName(type: string): string {
    const typeNames: Record<string, string> = {
      'Rect': '矩形',
      'Ellipse': '椭圆',
      'Line': '线条',
      'Text': '文本',
      'Path': '路径',
      'Image': '图片',
      'Group': '组',
      'Frame': '画板',
      'RegularPolygon': '多边形',
      'Star': '星形',
    };
    return typeNames[type] || '对象';
  }

  /**
   * 获取当前选中对象的属性
   * @returns 属性数组
   */
  getCurrentProperties(): ObjectProperties[] {
    return [...this.currentProperties];
  }

  /**
   * 获取单个对象的属性
   * @param objectId 对象ID
   * @returns 属性对象或null
   */
  getObjectProperties(objectId: string): ObjectProperties | null {
    return this.currentProperties.find(prop => prop.id === objectId) || null;
  }

  /**
   * 更新对象变换属性
   * @param objectId 对象ID
   * @param transform 变换属性
   */
  updateTransform(objectId: string, transform: Partial<Transform>) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      const updateAttrs: any = {};

      // 位置和尺寸更新
      if (transform.x !== undefined) {
        updateAttrs.x = transform.x;
      }
      if (transform.y !== undefined) {
        updateAttrs.y = transform.y;
      }
      if (transform.width !== undefined) {
        updateAttrs.width = Math.max(1, transform.width); // 确保宽度至少为1
      }
      if (transform.height !== undefined) {
        updateAttrs.height = Math.max(1, transform.height); // 确保高度至少为1
      }

      // 如果有更新属性，则应用更新
      if (Object.keys(updateAttrs).length > 0) {
        graphic.updateAttrs(updateAttrs);
        this.suikaEditor.render();
        
        // 触发变换变化事件
        const newBbox = graphic.getBbox();
        this.emit('transformChanged', objectId, {
          x: (newBbox as any).x || 0,
          y: (newBbox as any).y || 0,
          width: (newBbox as any).width || 0,
          height: (newBbox as any).height || 0,
        });

        console.log(`[PropertyManager] 更新变换: ${objectId}`, updateAttrs);
      }
    } catch (error) {
      console.error('[PropertyManager] 更新变换失败:', error);
    }
  }

  /**
   * 更新对象填充属性
   * @param objectId 对象ID
   * @param fill 填充属性
   */
  updateFill(objectId: string, fill: Fill) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      let fillData: any;

      if (fill.type === 'solid' && fill.color) {
        fillData = fill.color;
      } else {
        // TODO: 支持渐变和图片填充
        fillData = fill.color || '#000000';
      }

      // 直接更新属性，后续可以集成命令系统
      graphic.updateAttrs({ fill: fillData });
      this.suikaEditor.render();

      this.emit('fillChanged', objectId, fill);
      console.log(`[PropertyManager] 更新填充: ${objectId}`, fill);
    } catch (error) {
      console.error('[PropertyManager] 更新填充失败:', error);
    }
  }

  /**
   * 更新对象描边属性
   * @param objectId 对象ID
   * @param stroke 描边属性
   */
  updateStroke(objectId: string, stroke: Stroke) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      // 构建Suika的描边属性
      const strokeAttrs: any = {};
      
      if (stroke.color) {
        strokeAttrs.stroke = stroke.color;
      }
      if (stroke.width !== undefined) {
        strokeAttrs.strokeWidth = Math.max(0, stroke.width);
      }
      
      // 直接更新属性，后续可以集成命令系统
      graphic.updateAttrs(strokeAttrs);
      this.suikaEditor.render();

      this.emit('strokeChanged', objectId, stroke);
      console.log(`[PropertyManager] 更新描边: ${objectId}`, stroke);
    } catch (error) {
      console.error('[PropertyManager] 更新描边失败:', error);
    }
  }

  /**
   * 更新文本样式
   * @param objectId 对象ID
   * @param textStyle 文本样式
   */
  updateTextStyle(objectId: string, textStyle: Partial<TextStyle>) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted() || graphic.type !== 'Text') return;

    try {
      const updateAttrs: any = {};

      Object.keys(textStyle).forEach(key => {
        const value = (textStyle as any)[key];
        if (value !== undefined) {
          updateAttrs[key] = value;
        }
      });

      graphic.updateAttrs(updateAttrs);
      this.suikaEditor.render();
      this.emit('textStyleChanged', objectId, textStyle as TextStyle);

      console.log(`[PropertyManager] 更新文本样式: ${objectId}`, textStyle);
    } catch (error) {
      console.error('[PropertyManager] 更新文本样式失败:', error);
    }
  }

  /**
   * 更新文本内容
   * @param objectId 对象ID
   * @param content 文本内容
   */
  updateTextContent(objectId: string, content: string) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted() || graphic.type !== 'Text') return;

    try {
      // Suika text content is stored differently, skip for now
      console.log(`[PropertyManager] 更新文本内容: ${objectId} -> ${content}`);
      this.suikaEditor.render();

      console.log(`[PropertyManager] 更新文本内容: ${objectId} -> ${content}`);
    } catch (error) {
      console.error('[PropertyManager] 更新文本内容失败:', error);
    }
  }

  /**
   * 更新对象不透明度
   * @param objectId 对象ID
   * @param opacity 不透明度 (0-1)
   */
  updateOpacity(objectId: string, opacity: number) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      const clampedOpacity = Math.max(0, Math.min(1, opacity));
      graphic.updateAttrs({ opacity: clampedOpacity });
      
      this.suikaEditor.render();
      this.emit('opacityChanged', objectId, clampedOpacity);

      console.log(`[PropertyManager] 更新不透明度: ${objectId} -> ${clampedOpacity}`);
    } catch (error) {
      console.error('[PropertyManager] 更新不透明度失败:', error);
    }
  }

  /**
   * 更新对象名称
   * @param objectId 对象ID
   * @param name 新名称
   */
  updateObjectName(objectId: string, name: string) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      graphic.updateAttrs({ objectName: name });
      console.log(`[PropertyManager] 更新对象名称: ${objectId} -> ${name}`);
    } catch (error) {
      console.error('[PropertyManager] 更新对象名称失败:', error);
    }
  }

  /**
   * 更新矩形圆角
   * @param objectId 对象ID
   * @param cornerRadius 圆角半径
   */
  updateCornerRadius(objectId: string, cornerRadius: number) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(objectId);
    if (!graphic || graphic.isDeleted() || graphic.type !== 'Rect') return;

    try {
      const clampedRadius = Math.max(0, cornerRadius);
      graphic.updateAttrs({ cornerRadius: clampedRadius });
      
      this.suikaEditor.render();
      console.log(`[PropertyManager] 更新圆角: ${objectId} -> ${clampedRadius}`);
    } catch (error) {
      console.error('[PropertyManager] 更新圆角失败:', error);
    }
  }

  /**
   * 批量更新属性
   * @param updates 更新数组
   */
  batchUpdateProperties(updates: Array<{ objectId: string; properties: Partial<ObjectProperties> }>) {
    if (!this.suikaEditor) return;

    try {
      updates.forEach(({ objectId, properties }) => {
        const graphic = this.suikaEditor!.doc.getGraphicsById(objectId);
        if (!graphic || graphic.isDeleted()) return;

        const updateAttrs: any = {};

        // 处理各种属性更新
        if (properties.transform) {
          Object.assign(updateAttrs, properties.transform);
        }
        if (properties.fill) {
          updateAttrs.fill = properties.fill.type === 'solid' ? properties.fill.color : properties.fill;
        }
        if (properties.stroke) {
          updateAttrs.stroke = properties.stroke;
        }
        if (properties.opacity !== undefined) {
          updateAttrs.opacity = properties.opacity;
        }
        if (properties.name) {
          updateAttrs.objectName = properties.name;
        }

        graphic.updateAttrs(updateAttrs);
      });

      this.suikaEditor.render();
      console.log(`[PropertyManager] 批量更新属性: ${updates.length} 个对象`);
    } catch (error) {
      console.error('[PropertyManager] 批量更新属性失败:', error);
    }
  }

  /**
   * 检查是否有选中对象
   * @returns 是否有选中对象
   */
  hasSelection(): boolean {
    return this.currentProperties.length > 0;
  }

  /**
   * 获取选中对象数量
   * @returns 选中对象数量
   */
  getSelectionCount(): number {
    return this.currentProperties.length;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.suikaEditor) {
      this.suikaEditor.selectedElements.off('itemsChange', this.handleSelectionChange);
    }
    this.currentProperties = [];
    this.removeAllListeners();
  }
}

// 导出单例实例
export const propertyManager = new PropertyManager();