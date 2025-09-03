/**
 * Pencil 铅笔工具
 * 实现铅笔工具的逻辑
 * 提供了铅笔工具的初始化、激活、禁用、移动、结束等功能
 * 提供了铅笔工具的性能监控、调试工具等功能
 */

import { cloneDeep, noop } from '@g-asset-forge/common';
import { simplePath } from '@g-asset-forge/geo';

import { AddGraphCmd } from '../commands';
import { type ICursor } from '../cursor_manager';
import { type GAssetForgeEditor } from '../editor';
import { GAssetForgePath, GraphicsObjectSuffix } from '../graphics';
import { getNoConflictObjectName } from '../utils';
import { type ITool } from './type';

const TYPE = 'pencil';
const HOTKEY = { shiftKey: true, keyCode: 'KeyP' };

export class PencilTool implements ITool {
  static readonly type = TYPE;
  static readonly hotkey = HOTKEY;
  readonly type = TYPE;
  readonly hotkey = HOTKEY;
  cursor: ICursor = 'pencil';
  commandDesc = 'draw by Pencil';
  private unbindEvent: () => void = noop;

  private path: GAssetForgePath | null = null;
  private isFirstDrag = true;

  constructor(private editor: GAssetForgeEditor) {}
  onActive() {
    this.editor.selectedElements.clear();
  }
  onInactive() {
    this.unbindEvent();
  }
  onMoveExcludeDrag() {
    // do nothing
  }

  onStart(e: PointerEvent) {
    this.path = new GAssetForgePath(
      {
        objectName: getNoConflictObjectName(
          this.editor.doc.getCurrentCanvas()!,
          GraphicsObjectSuffix.Path,
        ),
        width: 0,
        height: 0,
        pathData: [
          {
            segs: [],
            closed: false,
          },
        ],
        stroke: [cloneDeep(this.editor.setting.get('firstStroke'))],
        strokeWidth: 3,
      },
      {
        doc: this.editor.doc,
      },
    );

    const point = this.editor.getSceneCursorXY(e);
    this.path!.addSeg(0, {
      point,
      in: { x: 0, y: 0 },
      out: { x: 0, y: 0 },
    });
  }

  onDrag(e: PointerEvent) {
    const point = this.editor.getSceneCursorXY(e);
    const path = this.path!;
    path.addSeg(0, {
      point,
      in: { x: 0, y: 0 },
      out: { x: 0, y: 0 },
    });

    if (this.isFirstDrag) {
      this.editor.sceneGraph.addItems([path]);
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (currentCanvas) {
        currentCanvas.insertChild(path);
      } else {
        console.error('无法获取当前画布，无法插入路径');
      }
      this.isFirstDrag = false;
    }
    this.editor.render();
  }

  onEnd(_e: PointerEvent, isDragHappened: boolean) {
    const path = this.path!;
    if (isDragHappened) {
      const segs = path.attrs.pathData[0].segs;
      const newSegs = simplePath(
        segs,
        this.editor.setting.get('pencilCurveFitTolerance'),
      );
      path.attrs.pathData[0].segs = newSegs;
      this.editor.commandManager.pushCommand(
        new AddGraphCmd('Add Path by pencil', this.editor, [path]),
      );
    } else {
      path.setDeleted(true);
    }
  }

  afterEnd() {
    this.path = null;
    this.isFirstDrag = true;
  }

  getDragBlockStep() {
    return 0;
  }
}
