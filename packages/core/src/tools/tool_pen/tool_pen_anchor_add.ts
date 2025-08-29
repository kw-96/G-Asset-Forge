/**
 * 工具铅笔锚点添加工具
 * 实现铅笔锚点添加工具的逻辑
 * 提供了铅笔锚点添加工具的初始化、激活、禁用、移动、结束等功能
 * 提供了铅笔锚点添加工具的性能监控、调试工具等功能
 */

import { cloneDeep } from '@g-asset-forge/common';

import { SetGraphsAttrsCmd } from '../../commands';
import { type GAssetForgeEditor } from '../../editor';
import { type IBaseTool } from '../type';
import { type PenTool } from './tool_pen';

export class ToolDrawPathAnchorAdd implements IBaseTool {
  constructor(private editor: GAssetForgeEditor, private parentTool: PenTool) {}

  onActive() {
    /* noop */
  }

  onInactive() {
    /* noop */
  }

  onStart() {
    const editor = this.editor;
    const path = this.parentTool.path!;

    const projectInfo = path.project(
      this.editor.toolManager.getCurrPoint(),
      this.editor.toSceneSize(5),
    );

    if (!projectInfo) {
      return;
    }

    const prevAttrs = cloneDeep({
      transform: path.attrs.transform,
      pathData: path.attrs.pathData,
    });

    path.insertSeg(
      projectInfo.pathItemIndex,
      projectInfo.segIndex,
      projectInfo.t,
    );

    editor.commandManager.pushCommand(
      new SetGraphsAttrsCmd(
        'Update Path Data',
        [path],
        [
          cloneDeep({
            transform: path.attrs.transform,
            pathData: path.attrs.pathData,
          }),
        ],
        [prevAttrs],
      ),
    );

    editor.pathEditor.selectedControl.clear();
    editor.pathEditor.drawControlHandles();
    editor.render();
  }

  onDrag() {
    this.editor.setCursor('default');
  }

  onEnd() {
    this.editor.setCursor('pen');
  }

  afterEnd() {
    this.editor.setCursor('pen');
  }
}
