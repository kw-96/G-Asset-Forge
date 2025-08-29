import './LayerPanel.scss';

import { type IObject, MutateGraphsAndRecord } from '@g-asset-forge/core';
import { type FC, useContext, useEffect, useState } from 'react';

import { EditorContext } from '../../context';
import { LayerTree } from './LayerTree';

export const LayerPanel: FC = () => {
  const editor = useContext(EditorContext);
  const [objects, setObjects] = useState<IObject[]>([]);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [hlId, setHlId] = useState('');

  useEffect(() => {
    if (editor?.editor) {
      setObjects(editor?.editor?.sceneGraph?.toObjects() || []);
      editor?.editor?.sceneGraph.on('render', () => {
        setObjects(editor?.editor?.sceneGraph?.toObjects() || []);
        setSelectedIds(editor?.editor?.selectedElements?.getIdSet() || new Set());
      });

      setHlId(editor?.editor?.selectedElements?.getHighlightedItem()?.attrs.id || '');
      editor?.editor?.selectedElements.on('highlightedItemChange', (item) => {
        const id = item ? item.attrs.id : '';
        setHlId(id);
      });
    }
  }, [editor]);

  const setSelectedGraph = (
    objId: string,
    event: React.MouseEvent<Element, MouseEvent>,
  ) => {
    if (!editor?.editor) return;
    if (event.ctrlKey || event.metaKey) {
      // parent and child can not be selected together, remove parent in selected object
      editor?.editor?.selectedElements.toggleItemById(objId, {
        disableParentAndChildCoexist: true,
      });
    } else {
      editor?.editor?.selectedElements.setItemsById(new Set([objId]));
    }
    editor?.editor?.render();
  };

  const getLayerIcon = (id: string) => {
    if (!editor?.editor) return '';

    const graphics = editor?.editor?.doc.getGraphicsById(id);
    return graphics ? graphics.getLayerIconPath() : '';
  };

  const zoomGraphicsToFit = (id: string) => {
    if (editor?.editor) {
      const graphics = editor?.editor?.doc.getGraphicsById(id);
      if (graphics) {
        editor?.editor?.viewportManager.zoomToGraphics(graphics);
        editor?.editor?.render();
      }
    }
  };

  const setEditorHlId = (id: string) => {
    if (editor?.editor) {
      const graphics = editor?.editor?.doc.getGraphicsById(id) ?? null;

      editor?.editor?.selectedElements.setHighlightedItem(graphics);
      editor?.editor?.render();
    }
  };

  const setName = (id: string, newName: string) => {
    if (editor?.editor) {
      const graphics = editor?.editor?.doc.getGraphicsById(id);
      if (graphics && graphics.attrs.objectName !== newName) {
        MutateGraphsAndRecord.setGraphName(editor?.editor, graphics, newName);
        editor?.editor?.render();
      }
    }
  };

  const toggleVisible = (id: string) => {
    if (editor?.editor) {
      const graphics = editor?.editor?.doc.getGraphicsById(id);
      if (graphics) {
        MutateGraphsAndRecord.toggleVisible(editor?.editor, [graphics]);
        editor?.editor?.render();
      }
    }
  };

  const toggleLock = (id: string) => {
    if (editor?.editor) {
      const graphics = editor?.editor?.doc.getGraphicsById(id);
      if (graphics) {
        MutateGraphsAndRecord.toggleLock(editor?.editor, [graphics]);
        editor?.editor?.render();
      }
    }
  };

  return (
    <div className="layer-panel">
      <LayerTree
        treeData={objects}
        activeIds={Array.from(selectedIds)}
        hlId={hlId}
        toggleVisible={toggleVisible}
        toggleLock={toggleLock}
        setHlId={setEditorHlId}
        setName={setName}
        setSelectedGraph={setSelectedGraph}
        getLayerIcon={getLayerIcon}
        zoomGraphicsToFit={zoomGraphicsToFit}
      />
    </div>
  );
};
