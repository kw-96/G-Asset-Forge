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
    canvasName = getNoConflictObjectName(editor.doc, 'Page');
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

export const switchCanvasRecord = (editor: GAssetForgeEditor, canvasId: string) => {
  const prevId = editor.doc.getCurrentCanvas().attrs.id;
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
