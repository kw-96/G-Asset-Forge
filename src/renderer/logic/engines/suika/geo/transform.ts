/**
 * 变换工具函数 - 几何变换相关的工具函数
 * @description 提供旋转变换等几何变换功能
 * @author Suika团队
 */

import { type IPoint } from './type';

export const transformRotate = (
  x: number,
  y: number,
  radian: number,
  cx: number,
  cy: number,
): IPoint => {
  if (!radian) {
    return { x, y };
  }
  const cos = Math.cos(radian);
  const sin = Math.sin(radian);
  return {
    x: (x - cx) * cos - (y - cy) * sin + cx,
    y: (x - cx) * sin + (y - cy) * cos + cy,
  };
};