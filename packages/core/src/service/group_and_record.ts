import { cloneDeep } from '@g-asset-forge/common';
import {
  boxToRect,
  calcRectBbox,
  invertMatrix,
  mergeBoxes,
  multiplyMatrix,
} from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { GAssetForgeFrame, GAssetForgeGraphics,GraphicsObjectSuffix } from '../graphics';
import { Transaction } from '../transaction';
import { getNoConflictObjectName, getParentIdSet } from '../utils';
export const groupAndRecord = (
  graphicsArr: GAssetForgeGraphics[],
  editor: GAssetForgeEditor,
) => {
  if (graphicsArr.length === 0) {
    console.warn('graphics should not be empty');
    return;
  }
  graphicsArr = GAssetForgeGraphics.sortGraphics(graphicsArr);
  const parentIdSet = getParentIdSet(graphicsArr);

  const lastGraphics = graphicsArr.at(-1)!;
  const parentOfGroup = lastGraphics.getParent()!;
  const parentOfGroupInvertTf = invertMatrix(parentOfGroup.getWorldTransform());

  const groupSortIndex = lastGraphics.getSortIndex();

  const boundRect = boxToRect(
    mergeBoxes(
      graphicsArr.map((el) => {
        return calcRectBbox({
          ...el.getSize(),
          transform: multiplyMatrix(
            parentOfGroupInvertTf,
            el.getWorldTransform(),
          ),
        });
      }),
    ),
  );

  const group = new GAssetForgeFrame(
    {
      objectName: getNoConflictObjectName(
        parentOfGroup,
        GraphicsObjectSuffix.Group,
      ),
      width: boundRect.width,
      height: boundRect.height,
      resizeToFit: true,
    },
    {
      advancedAttrs: {
        x: boundRect.x,
        y: boundRect.y,
      },
      doc: editor.doc,
    },
  );
  parentOfGroup.insertChild(group, groupSortIndex);
  const groupInvertTf = invertMatrix(group.getWorldTransform());

  const transaction = new Transaction(editor);
  transaction.addNewIds([group.attrs.id]);

  for (const graphics of graphicsArr) {
    transaction.recordOld(graphics.attrs.id, {
      parentIndex: cloneDeep(graphics.attrs.parentIndex),
      transform: cloneDeep(graphics.attrs.transform),
    });

    graphics.updateAttrs({
      transform: multiplyMatrix(groupInvertTf, graphics.getWorldTransform()),
    });
    group.insertChild(graphics);

    transaction.update(graphics.attrs.id, {
      parentIndex: cloneDeep(graphics.attrs.parentIndex),
      transform: cloneDeep(graphics.attrs.transform),
    });
  }

  transaction.updateNodeSize(parentIdSet);
  transaction.commit('group');

  editor.sceneGraph.addItems([group]);
  editor.selectedElements.setItems([group]);
};
