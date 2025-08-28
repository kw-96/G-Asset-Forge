import { type IBox, type IPoint, rectToBox } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../../editor';
import { type IHitOptions, type GAssetForgeGraphics } from '../../graphics';

/********* get top hit element ********/
export const getTopHitElement = (
  editor: GAssetForgeEditor,
  point: IPoint,
): GAssetForgeGraphics | null => {
  const zoom = editor.viewportManager.getZoom();
  const tol = editor.setting.get('selectionHitPadding') / zoom;
  const canvasGraphics = editor.doc.getCurrentCanvas();
  if (!canvasGraphics) {
    console.warn('无法获取当前画布，返回空的命中结果');
    return null;
  }

  const parentIdSet = editor.selectedElements.getParentIdSet();

  const hitOptions: IHitOptions = {
    tol,
    parentIdSet,
    zoom,
  };

  return canvasGraphics.getHitGraphics(point, hitOptions);
};

/****** get elements in selection ******/
export const getElementsInSelection = (
  editor: GAssetForgeEditor,
  parentIdSet: Set<string> = new Set(),
): GAssetForgeGraphics[] => {
  const selection = editor.sceneGraph.selection;
  if (selection === null) {
    console.warn('selection 为 null，请确认在正确的时机调用当前方法');
    return [];
  }
  const selectionBox = rectToBox(selection);

  const currentCanvas = editor.doc.getCurrentCanvas();
  if (!currentCanvas) {
    console.warn('无法获取当前画布，返回空的选择结果');
    return [];
  }

  const graphicsArr = getElementsInSelectionDFS(
    editor,
    selectionBox,
    currentCanvas,
    parentIdSet,
  );

  return graphicsArr;
};

const getElementsInSelectionDFS = (
  editor: GAssetForgeEditor,
  box: IBox,
  node: GAssetForgeGraphics,
  parentIdSet: Set<string>,
): GAssetForgeGraphics[] => {
  const graphicsArr: GAssetForgeGraphics[] = [];
  const children = node.getChildren();
  for (const child of children) {
    if (!child.isVisible() || child.isLock()) continue;
    if (parentIdSet.has(child.attrs.id)) {
      graphicsArr.push(
        ...getElementsInSelectionDFS(editor, box, child, parentIdSet),
      );
    } else if (child.intersectWithChildrenBox(box)) {
      graphicsArr.push(child);
    }
  }
  return graphicsArr;
};
