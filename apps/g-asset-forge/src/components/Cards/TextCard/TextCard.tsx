import './style.scss';

import { TextOperationsService } from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../context';
import NumberInput from '../../input/NumberInput';
import { SelectInput } from '../../input/SelectInput';
import { BaseCard } from '../BaseCard';

interface ITextAttr {
  label: string;
  key: string;
  value: number | string;
  uiType: string;
}

export const TextCard: FC = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();
  const MIXED = intl.formatMessage({ id: 'mixed' });
  const [attrs, setAttrs] = useState<ITextAttr[]>([]);

  useEffect(() => {
    if (editor?.editor) {
      const updateInfo = () => {
        const items = editor?.editor?.selectedElements?.getItems();
        const textItems = items?.filter((item) => item.type === 'Text') || [];

        if (textItems.length === 0) {
          setAttrs([]);
          return;
        }

        const map = new Map<string, ITextAttr>();

        for (const el of textItems) {
          const attrs = el.getInfoPanelAttrs();
          for (const attr of attrs || []) {
            // 只处理文本相关的属性
            if (attr.uiType === 'fontFamily' || attr.key === 'fontSize') {
              const label = attr.label;
              if (!map.has(label)) {
                map.set(label, attr as ITextAttr);
              } else {
                const valInMap = map.get(label)!.value;
                if (valInMap !== attr.value) {
                  map.get(label)!.value = MIXED;
                }
              }
            }
          }
        }

        setAttrs(Array.from(map.values()));
      };

      updateInfo(); // init

      editor?.editor?.sceneGraph.on('render', updateInfo);

      return () => {
        editor?.editor?.sceneGraph.off('render', updateInfo);
      };
    }
  }, [editor, MIXED]);

  const handleFontSizeChange = (newVal: number) => {
    if (!editor?.editor) return;
    const elements = editor?.editor?.selectedElements?.getItems();
    TextOperationsService.setFontSize({
      editor: editor?.editor,
      graphicsArr: elements,
      val: newVal,
      isDelta: false,
    });
    editor?.editor?.render();
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    if (!editor?.editor) return;
    const elements = editor?.editor?.selectedElements?.getItems();
    TextOperationsService.setFontFamily({
      editor: editor?.editor,
      graphicsArr: elements,
      fontFamily,
    });
    editor?.editor?.render();
  };

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'monospace', label: 'Monospace' },
  ];

  // 如果没有文本属性，不显示卡片
  if (attrs.length === 0) {
    return null;
  }

  return (
    <BaseCard>
      <div className="text-card-header">
        <span className="card-title">文本</span>
      </div>
      <div className="text-attrs-container">
        {attrs.map((attr) => {
          if (attr.uiType === 'fontFamily') {
            return (
              <div key={attr.key} className="text-attr-row">
                <span className="text-attr-label">{attr.label}</span>
                <SelectInput
                  value={typeof attr.value === 'string' ? attr.value : 'Arial'}
                  options={fontOptions}
                  onChange={handleFontFamilyChange}
                />
              </div>
            );
          } else if (attr.key === 'fontSize') {
            return (
              <div key={attr.key} className="text-attr-row">
                <NumberInput
                  prefix={<span className="text-attr-label">{attr.label}</span>}
                  value={attr.value}
                  min={1}
                  onChange={handleFontSizeChange}
                  suffixValue="px"
                  onIncrement={() => {
                    if (typeof attr.value === 'number') {
                      handleFontSizeChange(attr.value + 1);
                    }
                  }}
                  onDecrement={() => {
                    if (typeof attr.value === 'number') {
                      handleFontSizeChange(Math.max(1, attr.value - 1));
                    }
                  }}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </BaseCard>
  );
};
