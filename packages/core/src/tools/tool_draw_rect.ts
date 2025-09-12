import { cloneDeep } from '@g-asset-forge/common';
import { type IRect, normalizeRect } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import {
  type GAssetForgeGraphics,
  GAssetForgeRect,
  GraphicsObjectSuffix,
} from '../graphics';
import { getNoConflictObjectName } from '../utils';
import { DrawGraphicsTool } from './tool_draw_graphics';
import { type ITool } from './type';

const TYPE = 'drawRect';
const HOTKEY = 'r';

export class DrawRectTool extends DrawGraphicsTool implements ITool {
  static override readonly type = TYPE;
  static override readonly hotkey = HOTKEY;
  override readonly type = TYPE;
  override readonly hotkey = HOTKEY;

  constructor(editor: GAssetForgeEditor) {
    super(editor);
    this.commandDesc = 'Add Rect';
  }

  protected override createGraphics(rect: IRect, parent: GAssetForgeGraphics) {
    rect = normalizeRect(rect);
    const graphics = new GAssetForgeRect(
      {
        objectName: getNoConflictObjectName(parent, GraphicsObjectSuffix.Rect),
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
    return graphics;
  }
}
