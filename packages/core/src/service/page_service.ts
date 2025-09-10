/**
 * 页面服务
 * 实现页面服务的逻辑
 * 提供了页面服务的初始化、激活、禁用、移动、结束等功能
 * 提供了页面服务的性能监控、调试工具等功能
 */

import { SwitchCurrentCanvasCmd } from '../commands';
import { type GAssetForgeEditor } from '../editor';
import { GAssetForgeCanvas } from '../graphics';
import { Transaction } from '../transaction';
import { getNoConflictObjectName } from '../utils';

export const addAndSwitchCanvasRecord = (
  editor: GAssetForgeEditor,
  canvasName: string | undefined,
) => {
  editor.commandManager.batchCommandStart();
  const canvas = addCanvasAndRecord(editor, canvasName);
  switchCanvasRecord(editor, canvas.attrs.id);
  editor.commandManager.batchCommandEnd();
};

export const addCanvasAndRecord = (
  editor: GAssetForgeEditor,
  canvasName: string | undefined,
) => {
  if (!canvasName) {
    console.log(
      'addCanvasAndRecord: 调用 getNoConflictObjectName 生成页面名称',
    );
    canvasName = getNoConflictObjectName(editor.doc, 'Page');
    console.log('addCanvasAndRecord: 生成的页面名称:', canvasName);
  } else {
    console.log('addCanvasAndRecord: 使用传入的页面名称:', canvasName);
  }
  const canvas = new GAssetForgeCanvas(
    {
      objectName: canvasName,
    },
    {
      doc: editor.doc,
    },
  );
  editor.sceneGraph.addItems([canvas]);

  // TODO: insert after current canvas
  editor.doc.insertChild(canvas);

  const transaction = new Transaction(editor);
  transaction.addNewIds([canvas.attrs.id]);
  transaction.commit('Add Canvas');
  return canvas;
};

export const switchCanvasRecord = (
  editor: GAssetForgeEditor,
  canvasId: string,
) => {
  const currentCanvas = editor.doc.getCurrentCanvas();
  if (!currentCanvas) {
    console.error('无法获取当前画布');
    return;
  }
  const prevId = currentCanvas.attrs.id;
  if (prevId === canvasId) {
    console.log('Same canvas, switch canvas failed');
    return;
  }
  editor.doc.setCurrentCanvas(canvasId);
  const updateCurrentCanvasCmd = new SwitchCurrentCanvasCmd(
    'Update Current Canvas',
    editor,
    {
      id: canvasId,
      prevId,
    },
  );
  editor.commandManager.pushCommand(updateCurrentCanvasCmd);
};
