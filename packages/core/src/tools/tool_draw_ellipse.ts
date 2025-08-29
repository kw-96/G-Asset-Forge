/**
 * 工具绘制椭圆工具
 * 实现绘制椭圆工具的逻辑
 * 提供了绘制椭圆工具的初始化、激活、禁用、移动、结束等功能
 * 提供了绘制椭圆工具的性能监控、调试工具等功能
 */

import { cloneDeep } from '@g-asset-forge/common';
import { type IRect, normalizeRect } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import {
  GAssetForgeEllipse,
  type GAssetForgeGraphics,
  GraphicsObjectSuffix,
} from '../graphics';
import { getNoConflictObjectName } from '../utils';
import { DrawGraphicsTool } from './tool_draw_graphics';
import { type ITool } from './type';

const TYPE = 'drawEllipse';
const HOTKEY = 'o';
export class DrawEllipseTool extends DrawGraphicsTool implements ITool {
  static override readonly type = TYPE;
  static override readonly hotkey = HOTKEY;
  override readonly type = TYPE;
  override readonly hotkey = HOTKEY;

  constructor(editor: GAssetForgeEditor) {
    super(editor);
    this.commandDesc = 'Add Ellipse';
  }

  protected createGraphics(rect: IRect, parent: GAssetForgeGraphics) {
    rect = normalizeRect(rect);
    return new GAssetForgeEllipse(
      {
        objectName: getNoConflictObjectName(
          parent,
          GraphicsObjectSuffix.Ellipse,
        ),
        width: rect.width,
        height: rect.height,
        fill: [cloneDeep(this.editor.setting.get('firstFill'))],
      },
      {
        advancedAttrs: {
          x: rect.x,
          y: rect.y,
        },
        doc: this.editor.doc,
      },
    );
  }
}
