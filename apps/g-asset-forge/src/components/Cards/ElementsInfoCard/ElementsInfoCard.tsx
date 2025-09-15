import './style.scss';

import { remainDecimal } from '@g-asset-forge/common';
import { MutateGraphsAndRecord } from '@g-asset-forge/core';
import { deg2Rad, normalizeRadian } from '@g-asset-forge/geo';
import { type FC, useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../context';
import NumberInput from '../../input/NumberInput';
import { PercentInput } from '../../input/PercentInput';
import { BaseCard } from '../BaseCard';

interface IAttr {
  label: string;
  key: string;
  value: number | string;
  uiType: string;
  precision?: number;
}

export const ElementsInfoCards: FC = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();
  const MIXED = intl.formatMessage({ id: 'mixed' });
  const [attrs, setAttrs] = useState<IAttr[]>([]);

  useEffect(() => {
    if (editor?.editor) {
      const updateInfo = () => {
        const items = editor?.editor?.selectedElements?.getItems();
        // TODO: config attr order
        const map = new Map<string, IAttr>();
        for (const el of items || []) {
          const attrs = el.getInfoPanelAttrs();
          for (const attr of attrs || []) {
            // 跳过文本相关的属性，这些由TextCard处理
            if (attr.uiType === 'fontFamily' || attr.key === 'fontSize') {
              continue;
            }

            if (attr.uiType === 'number' && typeof attr.value === 'number') {
              const precision = 2;
              attr.value = remainDecimal(attr.value, precision);
            }
            const label = attr.label;
            if (!map.has(label)) {
              map.set(label, attr);
            } else {
              const valInMap = map.get(label)!.value;
              if (valInMap !== attr.value) {
                map.get(label)!.value = MIXED;
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

  const execCommand = (
    key: string,
    newVal: number,
    isDelta: boolean = false,
  ) => {
    if (!editor?.editor) {
      return false;
    }
    const elements = editor?.editor?.selectedElements?.getItems();
    const params = {
      editor: editor?.editor,
      graphicsArr: elements,
      val: newVal,
      isDelta,
    };
    if (key === 'x') {
      MutateGraphsAndRecord.setX(params);
    } else if (key === 'y') {
      MutateGraphsAndRecord.setY(params);
    } else if (key === 'width') {
      MutateGraphsAndRecord.setWidth(params);
    } else if (key === 'height') {
      MutateGraphsAndRecord.setHeight(params);
    } else if (key === 'rotation') {
      MutateGraphsAndRecord.setRotation({
        editor: editor?.editor,
        graphicsArr: elements,
        rotation: normalizeRadian(deg2Rad(newVal)),
        isDelta,
      });
    } else if (key === 'cornerRadius') {
      // 特定图形特有属性要做特殊处理。。。遍历图形时需要判断当前图形是否支持某个属性
      MutateGraphsAndRecord.setCornerRadius(params);
    } else if (key === 'count') {
      /// count must to be integer
      MutateGraphsAndRecord.setCount({
        editor: editor?.editor,
        graphicsArr: elements,
        val: Math.round(newVal),
        isDelta,
      });
    } else if (key === 'starInnerScale') {
      MutateGraphsAndRecord.setStarInnerScale(params);
    }
    editor?.editor?.render();
  };

  const getEventHandlers = (key: string) => {
    return {
      onChange: (newVal: number) => {
        execCommand(key, newVal);
      },
      onIncrement: () => {
        const step = key === 'starInnerScale' ? 0.01 : 1;
        execCommand(key, step, true);
      },
      onDecrement: () => {
        const step = key === 'starInnerScale' ? -0.01 : -1;
        execCommand(key, step, true);
      },
    };
  };

  return (
    <BaseCard>
      <div className="element-info-attrs-row">
        {attrs.slice(0, 2).map((item) => (
          <NumAttrInput
            {...item}
            key={item.key}
            {...getEventHandlers(item.key)}
          />
        ))}
      </div>
      <div className="element-info-attrs-row">
        {attrs.slice(2, 4).map((item) => (
          <NumAttrInput
            {...item}
            key={item.key}
            {...getEventHandlers(item.key)}
          />
        ))}
      </div>
      <div className="element-info-attrs-row">
        {attrs.slice(4, 6).map((item) => (
          <NumAttrInput
            {...item}
            key={item.key}
            {...getEventHandlers(item.key)}
          />
        ))}
      </div>
      {attrs.length > 6 && (
        <div className="element-info-attrs-row">
          {attrs.slice(6, 8).map((item) => (
            <NumAttrInput
              {...item}
              key={item.key}
              {...getEventHandlers(item.key)}
            />
          ))}
        </div>
      )}
    </BaseCard>
  );
};

const NumAttrInput: FC<{
  label: string;
  key: string;
  min?: number;
  max?: number;
  value: string | number;
  suffixValue?: string;
  uiType: string;
  onChange: (newVal: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}> = (props) => {
  if (props.uiType === 'percent') {
    return (
      <PercentInput
        prefix={
          <span className="g-asset-forge-info-attrs-label">{props.label}</span>
        }
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={props.onChange}
        onIncrement={props.onIncrement}
        onDecrement={props.onDecrement}
      />
    );
  } else {
    return (
      <NumberInput
        prefix={
          <span className="g-asset-forge-info-attrs-label">{props.label}</span>
        }
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={props.onChange}
        suffixValue={props.suffixValue}
        onIncrement={props.onIncrement}
        onDecrement={props.onDecrement}
      />
    );
  }
};
