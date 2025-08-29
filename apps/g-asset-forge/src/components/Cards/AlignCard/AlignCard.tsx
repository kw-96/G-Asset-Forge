import './AlignCard.scss';

import {
  alignAndRecord,
  AlignType,
  type GAssetForgeGraphics,
} from '@g-asset-forge/core';
import {
  AlignHCenter,
  AlignLeft,
  AlignRight,
  AlignTop,
  AlignVCenter,
  IconAlignBottom,
} from '@g-asset-forge/icons';
import classNames from 'classnames';
import { type FC, useContext, useEffect, useState } from 'react';

import { EditorContext } from '../../../context';
import { BaseCard } from '../BaseCard';

export const AlignCard: FC = () => {
  const editor = useContext(EditorContext);
  const [disabled, setDisable] = useState(true);

  useEffect(() => {
    if (editor?.editor) {
      const selectedEls = editor.editor.selectedElements.getItems();
      setDisable(selectedEls.length < 2);

      const handler = (items: GAssetForgeGraphics[]) => {
        setDisable(items.length < 2);
      };

      if (editor.editor) {
        editor.editor.selectedElements.on('itemsChange', handler);
        return () => {
          if (editor.editor) {
            editor.editor.selectedElements.off('itemsChange', handler);
          }
        };
      }
    }
  }, [editor]);

  return (
    <BaseCard>
      <div className={classNames('align-list', { disabled })}>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.Left);
          }}
        >
          <AlignLeft />
        </div>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.HCenter);
          }}
        >
          <AlignHCenter />
        </div>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.Right);
          }}
        >
          <AlignRight />
        </div>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.Top);
          }}
        >
          <AlignTop />
        </div>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.VCenter);
          }}
        >
          <AlignVCenter />
        </div>
        <div
          className="align-item"
          onClick={() => {
            editor?.editor && alignAndRecord(editor.editor, AlignType.Bottom);
          }}
        >
          <IconAlignBottom />
        </div>
      </div>
    </BaseCard>
  );
};
