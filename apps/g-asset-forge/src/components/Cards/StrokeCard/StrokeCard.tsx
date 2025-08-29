import { arrMap, cloneDeep, forEach, isEqual } from '@g-asset-forge/common';
import {
  type GAssetForgeGraphics,
  type IPaint,
  type ISetElementsAttrsType,
  SetGraphsAttrsCmd,
} from '@g-asset-forge/core';
import { LineWidthOutlined } from '@g-asset-forge/icons';
import { type FC, useContext, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../context';
import NumberInput from '../../input/NumberInput';
import { PaintCard } from '../PaintCard';

export const StrokeCard: FC = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();

  const [strokes, setStrokes] = useState<IPaint[]>([]);
  const [strokeWidth, setStrokeWidth] = useState(-1); // -1 means elements have different stroke width
  const prevStrokes = useRef<IPaint[][]>([]);

  useEffect(() => {
    if (editor?.editor) {
      const updatePrevStroke = (els: GAssetForgeGraphics[]) => {
        prevStrokes.current = els.map((el) => cloneDeep(el.attrs.stroke ?? []));
      };

      const updateInfo = () => {
        const selectedElements = editor?.editor?.selectedElements?.getItems();
        if (selectedElements && selectedElements.length > 0) {
          /**
           * 显示 stroke 值时，如果有的图形没有stroke，将其排除掉
           * 添加颜色时，如果有的图形不存在stroke，赋值给它
           */
          let strokes = selectedElements[0].attrs.stroke ?? [];
          for (let i = 1, len = selectedElements.length; i < len; i++) {
            const currentStrokes = selectedElements[i].attrs.stroke;
            if (!isEqual(strokes, currentStrokes)) {
              // TODO: 标记为不相同，作为文案提示
              strokes = [];
              break;
            }
          }
          setStrokes(strokes);

          // 线宽
          let strokeWidth = selectedElements[0].attrs.strokeWidth ?? 0;
          for (let i = 1, len = selectedElements.length; i < len; i++) {
            const currentStrokeWidth =
              selectedElements[i].attrs.strokeWidth ?? 0;
            if (strokeWidth !== currentStrokeWidth) {
              strokeWidth = -1;
              break;
            }
          }
          setStrokeWidth(strokeWidth);
        }
      };

      // init
      updateInfo();
      updatePrevStroke(editor?.editor?.selectedElements?.getItems());

      editor?.editor?.sceneGraph.on('render', updateInfo);
      editor?.editor?.selectedElements.on('itemsChange', updatePrevStroke);
      return () => {
        editor?.editor?.sceneGraph.off('render', updateInfo);
        editor?.editor?.selectedElements.off('itemsChange', updatePrevStroke);
      };
    }
  }, [editor]);

  /**
   * update stroke and return a new stroke
   */
  const updateStrokeWithoutRecord = (newPaint: IPaint, index: number) => {
    if (!editor?.editor) return;

    const newStrokes = [...strokes];

    newStrokes[index] = newPaint;
    setStrokes(newStrokes);

    const selectItems = editor?.editor?.selectedElements?.getItems();

    selectItems.forEach((item) => {
      item.updateAttrs({
        stroke: cloneDeep(newStrokes),
      });
    });

    return newStrokes;
  };

  const addStroke = () => {
    if (!editor?.editor) return;

    const newPaint = cloneDeep(
      editor?.editor?.setting.get(strokes.length ? 'addedPaint' : 'firstStroke'),
    );
    const newStrokes = [...strokes, newPaint];
    setStrokes(newStrokes);

    const selectItems = editor?.editor?.selectedElements?.getItems();
    selectItems.forEach((item) => {
      item.updateAttrs({
        stroke: cloneDeep(newStrokes),
      });
    });
    pushToHistory('Add Stroke', selectItems, newStrokes, true);
    editor?.editor?.render();
  };

  const deleteStroke = (index: number) => {
    if (!editor?.editor) return;

    const newStrokes = strokes.filter((_, i) => i !== index);
    setStrokes(newStrokes);

    const selectItems = editor?.editor?.selectedElements?.getItems();
    for (const item of selectItems || []) {
      item.updateAttrs({
        stroke: cloneDeep(newStrokes),
      });
    }
    pushToHistory('Update Stroke', selectItems, newStrokes);
    editor?.editor?.render();
  };

  const toggleVisible = (index: number) => {
    if (!editor?.editor) return;

    const newStrokes = strokes.map((paint, i) => {
      if (i === index) {
        return {
          ...paint,
          visible: !(paint.visible ?? true),
        };
      }
      return paint;
    });
    setStrokes(newStrokes);

    const selectItems = editor?.editor?.selectedElements?.getItems();
    selectItems.forEach((item) => {
      item.updateAttrs({
        stroke: cloneDeep(newStrokes),
      });
    });
    pushToHistory('Update Stroke', selectItems, newStrokes);
    editor?.editor?.render();
  };

  const pushToHistory = (
    cmdDesc: string,
    selectedElements: GAssetForgeGraphics[],
    newStroke: IPaint[],
    isAddAction?: boolean,
  ) => {
    if (!editor?.editor) return;

    const prevAttrs: ISetElementsAttrsType[] = selectedElements.map((_, i) => ({
      stroke: cloneDeep(prevStrokes.current[i]),
    }));
    const attrs: ISetElementsAttrsType[] = arrMap(selectedElements, () => ({
      stroke: cloneDeep(newStroke),
    }));

    // case 1: add first stroke，change strokeWidth to 1
    if (isAddAction && newStroke.length === 1) {
      selectedElements.forEach((el, i) => {
        prevAttrs[i].strokeWidth = el.attrs.strokeWidth;
      });

      const defaultStrokeWidth = editor?.editor?.setting.get('strokeWidth');
      forEach(selectedElements, (el, i) => {
        el.updateAttrs({
          strokeWidth: defaultStrokeWidth,
        });
        attrs[i].strokeWidth = defaultStrokeWidth;
      });
    }

    editor?.editor?.commandManager.pushCommand(
      new SetGraphsAttrsCmd(cmdDesc, selectedElements, attrs, prevAttrs),
    );

    prevStrokes.current = selectedElements.map((el) =>
      cloneDeep(el.attrs.stroke ?? []),
    );
  };

  const updateStrokeWidth = (newStrokeWidth: number) => {
    if (!editor?.editor) return;

    const selectedElements = editor?.editor?.selectedElements?.getItems();
    editor?.editor?.commandManager.pushCommand(
      new SetGraphsAttrsCmd(
        'update strokeWidth',
        selectedElements,
        { strokeWidth: newStrokeWidth },
        arrMap(selectedElements, (item) => ({
          strokeWidth: item.attrs.strokeWidth,
        })),
      ),
    );

    selectedElements.forEach((item) => {
      item.updateAttrs({
        strokeWidth: newStrokeWidth,
      });
    });
    setStrokeWidth(newStrokeWidth);

    editor?.editor?.render();
  };

  return (
    <PaintCard
      title={intl.formatMessage({ id: 'stroke' })}
      paints={strokes}
      appendedContent={
        <div style={{ padding: '0 8px' }}>
          <NumberInput
            prefix={
              <div
                style={{
                  paddingLeft: '3px',
                  color: '#b3b3b3',
                  display: 'flex',
                }}
              >
                <LineWidthOutlined />
              </div>
            }
            value={strokeWidth}
            min={0}
            onChange={updateStrokeWidth}
          />
        </div>
      }
      onChange={(newPaint, i) => {
        if (!editor?.editor) return;
        updateStrokeWithoutRecord(newPaint, i);
        editor?.editor?.render();
      }}
      onChangeComplete={(newPaint, i) => {
        if (!editor?.editor) return;
        const newStrokes = updateStrokeWithoutRecord(newPaint, i);

        pushToHistory(
          'Change Stroke',
          editor?.editor?.selectedElements?.getItems(),
          newStrokes!,
        );
        editor?.editor?.render();
      }}
      onAdd={addStroke}
      onDelete={deleteStroke}
      onToggleVisible={toggleVisible}
    />
  );
};
