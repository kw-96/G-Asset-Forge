/**
 * 通用自动布局属性配置管理器
 * 为所有支持自动布局的元素提供统一的属性配置
 */

export interface LayoutAttrConfig {
  label: string;
  key: string;
  value: number | string | boolean;
  uiType: 'switch' | 'select' | 'number';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  visible?: boolean;
  disabled?: boolean;
}

/**
 * 布局属性配置管理器
 */
export class LayoutAttrsConfigManager {
  /**
   * 获取自动布局属性配置
   */
  static getAutoLayoutAttrs(attrs: any): LayoutAttrConfig[] {
    return [
      {
        label: '启用自动布局',
        key: 'autoLayout',
        value: attrs.autoLayout || false,
        uiType: 'switch',
      },
      {
        label: '布局方式',
        key: 'layoutType',
        value: attrs.layoutType || 'vertical',
        uiType: 'select',
        options: [
          { value: 'vertical', label: '垂直布局' },
          { value: 'horizontal', label: '水平布局' },
          { value: 'grid', label: '网格布局' },
          { value: 'smart', label: '智能布局' },
        ],
        visible: attrs.autoLayout,
      },
      {
        label: '内边距',
        key: 'padding',
        value: attrs.padding || 0,
        uiType: 'number',
        min: 0,
        max: 200,
        step: 1,
        visible: attrs.autoLayout,
      },
      {
        label: '间距',
        key: 'gap',
        value: attrs.gap || 0,
        uiType: 'number',
        min: 0,
        max: 200,
        step: 1,
        visible: attrs.autoLayout,
      },
      {
        label: '网格列数',
        key: 'gridColumns',
        value: attrs.gridColumns || 2,
        uiType: 'number',
        min: 1,
        max: 10,
        step: 1,
        visible: attrs.autoLayout && attrs.layoutType === 'grid',
      },
    ];
  }

  /**
   * 检查元素是否支持自动布局
   */
  static supportsAutoLayout(element: any): boolean {
    // 检查元素类型
    const supportedTypes = ['H5Container', 'Frame'];
    if (supportedTypes.includes(element.type)) {
      return true;
    }

    // 检查是否有自动布局相关的属性或方法
    if (typeof element.isAutoLayoutEnabled === 'function') {
      return true;
    }

    // 检查属性中是否有autoLayout字段
    if (element.attrs && 'autoLayout' in element.attrs) {
      return true;
    }

    return false;
  }

  /**
   * 获取元素的布局属性（通用方法）
   */
  static getElementLayoutAttrs(element: any): LayoutAttrConfig[] {
    if (!this.supportsAutoLayout(element)) {
      return [];
    }

    // 如果元素有自定义的获取方法，优先使用
    if (typeof element.getLayoutAttrs === 'function') {
      return element.getLayoutAttrs();
    }

    // 否则使用通用配置
    return this.getAutoLayoutAttrs(element.attrs || {});
  }
}
