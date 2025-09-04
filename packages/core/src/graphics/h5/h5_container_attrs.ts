/**
 * H5 容器属性控制工具
 *
 * 提供 H5 容器的特殊属性控制方法，包括位置锁定、尺寸调整等功能
 */

import { type GraphicsAttrs } from '../graphics';

/**
 * H5 容器属性控制器
 * 用于控制 H5 容器的特殊行为，如位置锁定但允许尺寸调整
 */
export class H5ContainerAttrsController {
  /**
   * 过滤属性更新，禁止移动但允许调整尺寸
   * @param partialAttrs 要更新的属性
   * @param currentTransform 当前的 transform 矩阵
   * @returns 过滤后的属性
   */
  static filterAttrsForUpdate(
    partialAttrs: Partial<GraphicsAttrs> & any,
    currentTransform: number[],
  ): Partial<GraphicsAttrs> & any {
    // 创建属性副本
    const filteredAttrs = { ...partialAttrs };

    // 禁止修改transform中的位置部分（tx, ty）
    if (filteredAttrs.transform && Array.isArray(filteredAttrs.transform)) {
      filteredAttrs.transform = [
        filteredAttrs.transform[0] || currentTransform[0], // a
        filteredAttrs.transform[1] || currentTransform[1], // b
        filteredAttrs.transform[2] || currentTransform[2], // c
        filteredAttrs.transform[3] || currentTransform[3], // d
        currentTransform[4], // tx - 保持原位置
        currentTransform[5], // ty - 保持原位置
      ];
    }

    // 禁止直接修改x, y坐标
    if ('x' in filteredAttrs) {
      delete filteredAttrs.x;
    }
    if ('y' in filteredAttrs) {
      delete filteredAttrs.y;
    }

    return filteredAttrs;
  }

  /**
   * 检查是否允许更新指定属性
   * @param key 属性键名
   * @param value 属性值
   * @returns 是否允许更新
   */
  static isAllowedToUpdate(key: string, value: any): boolean {
    // 禁止更新的属性
    const forbiddenAttrs = ['x', 'y'];

    if (forbiddenAttrs.includes(key)) {
      return false;
    }

    // 对于 transform 属性，检查是否包含位置信息
    if (key === 'transform' && Array.isArray(value)) {
      // 如果 transform 数组长度正确且包含位置信息，则不允许直接更新
      // 应该通过 filterAttrsForUpdate 方法处理
      return false;
    }

    return true;
  }

  /**
   * 获取允许更新的属性列表
   * @returns 允许更新的属性键名数组
   */
  static getAllowedAttrs(): string[] {
    return [
      'width',
      'height',
      'fill',
      'stroke',
      'strokeWidth',
      'opacity',
      'visible',
      'objectName',
      'cornerRadius',
      'mobileWidth',
      'padding',
      'gap',
      'autoLayout',
      'resizeToFit',
    ];
  }

  /**
   * 获取禁止更新的属性列表
   * @returns 禁止更新的属性键名数组
   */
  static getForbiddenAttrs(): string[] {
    return [
      'x',
      'y',
      'transform', // 需要通过特殊方法处理
    ];
  }

  /**
   * 验证属性更新是否合法
   * @param partialAttrs 要更新的属性
   * @returns 验证结果
   */
  static validateAttrsUpdate(partialAttrs: Partial<GraphicsAttrs> & any): {
    isValid: boolean;
    forbiddenKeys: string[];
    warnings: string[];
  } {
    const forbiddenKeys: string[] = [];
    const warnings: string[] = [];

    // 检查禁止更新的属性
    for (const key of this.getForbiddenAttrs()) {
      if (key in partialAttrs) {
        forbiddenKeys.push(key);
      }
    }

    // 检查尺寸属性
    if ('width' in partialAttrs && partialAttrs.width !== undefined) {
      if (partialAttrs.width <= 0) {
        warnings.push('宽度必须大于0');
      }
    }

    if ('height' in partialAttrs && partialAttrs.height !== undefined) {
      if (partialAttrs.height <= 0) {
        warnings.push('高度必须大于0');
      }
    }

    // 检查移动端宽度
    if (
      'mobileWidth' in partialAttrs &&
      partialAttrs.mobileWidth !== undefined
    ) {
      if (partialAttrs.mobileWidth <= 0) {
        warnings.push('移动端宽度必须大于0');
      }
    }

    return {
      isValid: forbiddenKeys.length === 0,
      forbiddenKeys,
      warnings,
    };
  }
}
