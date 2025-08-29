import './style.scss';

import { type GAssetForgeGraphics } from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { EditorContext } from '../../context';
import { AlignCard } from '../Cards/AlignCard';
import { ElementsInfoCards } from '../Cards/ElementsInfoCard';
import { FillCard } from '../Cards/FillCard';
import { LayerInfoCard } from '../Cards/LayerInfoCard';
import { StrokeCard } from '../Cards/StrokeCard';
import { DebugPanel } from '../DebugPanel';

enum PanelType {
  Global = 'Global',
  SelectedElements = 'SelectedElements',
}

export const InfoPanel: FC = () => {
  const editor = useContext(EditorContext);
  const [type, setType] = useState(PanelType.Global);
  // select panel type by selected elements

  const showDebugPanel = localStorage.getItem('g-asset-forge-debug-panel') === 'true';

  useEffect(() => {
    if (editor?.editor) {
      const handler = (items: GAssetForgeGraphics[]) => {
        setType(items.length ? PanelType.SelectedElements : PanelType.Global);
      };
      editor?.editor?.selectedElements.on('itemsChange', handler);

      return () => {
        editor?.editor?.selectedElements.off('itemsChange', handler);
      };
    }
  }, [editor]);

  return (
    <div className="info-panel" onKeyDown={(e) => e.stopPropagation()}>
      {type === PanelType.SelectedElements && (
        <>
          <AlignCard />
          <ElementsInfoCards />
          <LayerInfoCard />
          <FillCard key="fill" />
          <StrokeCard key="stroke" />
        </>
      )}
      {type === PanelType.Global && (
        <div className="empty-text">
          <FormattedMessage id="noSelectedShapes" />
        </div>
      )}

      {showDebugPanel && <DebugPanel />}
    </div>
  );
};
