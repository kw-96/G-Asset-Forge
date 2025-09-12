import './style.scss';

import { type FC, useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../context';
import NumberInput from '../../input/NumberInput';
import { SelectInput } from '../../input/SelectInput';
import { BaseCard } from '../BaseCard';

interface H5LayoutAttr {
  label: string;
  key: string;
  value: number | string;
  uiType: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  visible?: boolean;
}

export const H5LayoutCard: FC = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();
  const MIXED = intl.formatMessage({ id: 'mixed' });
  const [attrs, setAttrs] = useState<H5LayoutAttr[]>([]);

  useEffect(() => {
    if (editor?.editor) {
      const updateInfo = () => {
        const items = editor?.editor?.selectedElements?.getItems();
        if (items?.length === 1 && (items[0] as any).type === 'H5Container') {
          const h5Container = items[0] as any;
          const layoutAttrs = h5Container.getH5LayoutAttrs?.() || [];

          setAttrs(layoutAttrs);
        } else {
          setAttrs([]);
        }
      };

      updateInfo(); // init

      editor?.editor?.sceneGraph.on('render', updateInfo);
      editor?.editor?.selectedElements.on('itemsChange', updateInfo);

      return () => {
        editor?.editor?.sceneGraph.off('render', updateInfo);
        editor?.editor?.selectedElements.off('itemsChange', updateInfo);
      };
    }
  }, [editor, MIXED]);

  const execCommand = (key: string, newVal: number | string) => {
    if (!editor?.editor) {
      return false;
    }
    const elements = editor?.editor?.selectedElements?.getItems();
    if (elements?.length === 1 && (elements[0] as any).type === 'H5Container') {
      const h5Container = elements[0] as any;

      // 更新H5容器的属性
      h5Container.updateAttrs({
        [key]: newVal,
      });

      editor?.editor?.render();
    }
  };

  const getEventHandlers = (key: string) => {
    return {
      onChange: (newVal: number) => {
        execCommand(key, newVal);
      },
    };
  };

  if (attrs.length === 0) {
    return null;
  }

  return (
    <BaseCard>
      <div className="h5-layout-card">
        <div className="layout-section-header">
          <span>自动布局</span>
        </div>

        <div className="layout-attributes">
          {attrs.map((attr) => {
            if (attr.visible === false) {
              return null;
            }

            if (attr.uiType === 'select') {
              return (
                <div key={attr.key} className="layout-attr-item">
                  <span className="attr-label">{attr.label}</span>
                  <div className="attr-input">
                    <SelectInput
                      value={attr.value as string}
                      options={attr.options || []}
                      onChange={(value: string) => execCommand(attr.key, value)}
                    />
                  </div>
                </div>
              );
            }

            if (attr.uiType === 'number') {
              return (
                <div key={attr.key} className="layout-attr-item">
                  <span className="attr-label">{attr.label}</span>
                  <div className="attr-input">
                    <NumberInput
                      value={attr.value as number}
                      min={attr.min}
                      max={attr.max}
                      {...getEventHandlers(attr.key)}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </BaseCard>
  );
};
