/**
 * 图形构造函数映射
 * 避免循环依赖，独立管理图形类型与构造函数的映射关系
 */

import { GraphicsType } from '../type';
import { GAssetForgeCanvas } from './canvas';
import { GAssetForgeDocument } from './document';
import { GAssetForgeEllipse } from './ellipse';
import { GAssetForgeFrame } from './frame';
import { GAssetForgeGraphics } from './graphics';
import { H5Container } from './h5/h5_container';
import { GAssetForgeLine } from './line';
import { GAssetForgePath } from './path';
import { GAssetForgeRect } from './rect';
import { GAssetForgeRegularPolygon } from './regular_polygon';
import { GAssetForgeStar } from './star';
import { GAssetForgeText } from './text';

export const graphCtorMap = {
  [GraphicsType.Graph]: GAssetForgeGraphics,
  [GraphicsType.Rect]: GAssetForgeRect,
  [GraphicsType.Ellipse]: GAssetForgeEllipse,
  [GraphicsType.Line]: GAssetForgeLine,
  [GraphicsType.Text]: GAssetForgeText,
  [GraphicsType.Path]: GAssetForgePath,
  [GraphicsType.RegularPolygon]: GAssetForgeRegularPolygon,
  [GraphicsType.Star]: GAssetForgeStar,
  [GraphicsType.Frame]: GAssetForgeFrame,
  [GraphicsType.Canvas]: GAssetForgeCanvas,
  [GraphicsType.Document]: GAssetForgeDocument,
  // H5Container 使用字符串类型，避免循环依赖
  H5Container: H5Container,
};
