import { cloneDeep } from '@g-asset-forge/common';
import { type IRect, normalizeRect } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import {
  type GAssetForgeGraphics,
  GAssetForgeRegularPolygon,
  GraphicsObjectSuffix,
} from '../graphics';
import { getNoConflictObjectName } from '../utils';
import { DrawGraphicsTool } from './tool_draw_graphics';
import { type ITool } from './type';

const TYPE = 'drawRegularPolygon';
const HOTKEY = '';
export class DrawRegularPolygonTool extends DrawGraphicsTool implements ITool {
  static override readonly type = TYPE;
  static override readonly hotkey = HOTKEY;
  override readonly type = TYPE;
  override readonly hotkey = HOTKEY;

  constructor(editor: GAssetForgeEditor) {
    super(editor);
    this.commandDesc = 'AddRegularPolygon';
  }

  protected createGraphics(rect: IRect, parent: GAssetForgeGraphics) {
    rect = normalizeRect(rect);
    return new GAssetForgeRegularPolygon(
      {
        objectName: getNoConflictObjectName(
          parent,
          GraphicsObjectSuffix.RegularPolygon,
        ),
        width: rect.width,
        height: rect.height,
        fill: [cloneDeep(this.editor.setting.get('firstFill'))],
        count: 3,
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
