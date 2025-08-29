import { cloneDeep, isEqual } from '@g-asset-forge/common';
import {
  type GAssetForgeGraphics,
  type IPaint,
  SetGraphsAttrsCmd,
} from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../context';
import { PaintCard } from '../PaintCard';

export const FillCard: FC = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();

  const [fill, setFill] = useState<IPaint[]>([]);
  const prevFills = useRef<IPaint[][]>([]);

  /**
   * update fill and return a new fill
   */
  const updateFill = (index: number, newPaint: IPaint) => {
    if (!editor?.editor) return;

    const newFills = [...fill];

    newFills[index] = newPaint;
    setFill(newFills);

    const selectItems = editor.editor.selectedElements.getItems();

    selectItems.forEach((item: any) => {
      item.updateAttrs({
        fill: cloneDeep(newFills),
      });
    });

    return newFills;
  };

  const addFill = () => {
    if (!editor?.editor) return;

    const newPaint = cloneDeep(
      editor.editor.setting.get(fill.length ? 'addedPaint' : 'firstFill'),
    );
    const newFills = [...fill, newPaint];
    setFill(newFills);

    const selectItems = editor.editor.selectedElements.getItems();
    selectItems.forEach((item: any) => {
      item.updateAttrs({
        fill: cloneDeep(newFills),
      });
    });
    pushToHistory('Add Fill', selectItems, newFills);
    editor.editor.render();
  };

  const deleteFill = (index: number) => {
    if (!editor?.editor) return;

    const newFills = fill.filter((_, i) => i !== index);
    setFill(newFills);

    const selectItems = editor.editor.selectedElements.getItems();
    selectItems.forEach((item: any) => {
      item.updateAttrs({
        fill: cloneDeep(newFills),
      });
    });
    pushToHistory('Update Fill', selectItems, newFills);
    editor.editor.render();
  };

  const toggleVisible = (index: number) => {
    if (!editor?.editor) return;

    const newFills = fill.map((paint, i) => {
      if (i === index) {
        return {
          ...paint,
          visible: !(paint.visible ?? true),
        };
      }
      return paint;
    });
    setFill(newFills);

    const selectItems = editor.editor.selectedElements.getItems();
    selectItems.forEach((item: any) => {
      item.updateAttrs({
        fill: cloneDeep(newFills),
      });
    });
    pushToHistory('Update Fill', selectItems, newFills);
    editor.editor.render();
  };

  const pushToHistory = (
    cmdDesc: string,
    selectedElements: GAssetForgeGraphics[],
    newPaints: IPaint[],
  ) => {
    if (!editor?.editor) return;

    editor.editor.commandManager.pushCommand(
      new SetGraphsAttrsCmd(
        cmdDesc,
        selectedElements,
        { fill: newPaints },
        // prev value
        selectedElements.map((_, i) => ({
          fill: cloneDeep(prevFills.current[i]),
        })),
      ),
    );

    prevFills.current = selectedElements.map((el) =>
      cloneDeep(el.attrs.fill ?? []),
    );
  };

  useEffect(() => {
    if (editor?.editor) {
      const updatePrevFill = (els: GAssetForgeGraphics[]) => {
        prevFills.current = els.map((el) => cloneDeep(el.attrs.fill ?? []));
      };
      const updateInfo = () => {
        if (!editor?.editor) return;
        const selectedElements = editor.editor.selectedElements.getItems();
        if (selectedElements.length > 0) {
          /**
           * 目前一个图形只支持一个fill
           * 显示 fill 值时，如果有的图形没有fill，将其排除掉
           * 添加颜色时，如果有的图形不存在fill，赋值给它
           */
          let newFill = selectedElements[0].attrs.fill ?? [];
          for (let i = 1, len = selectedElements.length; i < len; i++) {
            const currentFill = selectedElements[i].attrs.fill;
            if (!isEqual(newFill, currentFill)) {
              // TODO: 标记为不相同，作为文案提示
              newFill = [];
              break;
            }
          }
          setFill(newFill);
        }
      };

      // init
      updatePrevFill(editor.editor.selectedElements.getItems());
      updateInfo();

      editor.editor.sceneGraph.on('render', updateInfo);
      editor.editor.selectedElements.on('itemsChange', updatePrevFill);
      return () => {
        if (editor?.editor) {
          editor.editor.sceneGraph.off('render', updateInfo);
          editor.editor.selectedElements.off('itemsChange', updatePrevFill);
        }
      };
    }
  }, [editor]);

  return (
    <PaintCard
      title={intl.formatMessage({ id: 'fill' })}
      paints={fill}
      onChange={(newPaint, i) => {
        if (!editor?.editor) return;
        updateFill(i, newPaint);
        editor.editor.render();
      }}
      onChangeComplete={(newPaint, i) => {
        if (!editor?.editor) return;
        const newFill = updateFill(i, newPaint);

        pushToHistory(
          'Update fill',
          editor.editor.selectedElements.getItems(),
          newFill!,
        );

        editor.editor.render();
      }}
      onAdd={addFill}
      onDelete={deleteFill}
      onToggleVisible={toggleVisible}
    />
  );
};
