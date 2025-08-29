import { type GAssetForgeGraphics } from '@g-asset-forge/core';
import { type IPoint } from '@g-asset-forge/geo';
import { type FC, useContext, useEffect, useState } from 'react';

import { EditorContext } from '../../context';

export const DebugPanel: FC = () => {
  const editor = useContext(EditorContext);

  const [zoom, setZoom] = useState(1);
  const [isSelectedBoxHover, setIsSelectedBoxHover] = useState(false);
  const [hoveredGraphName, setHoveredGraphName] = useState('');
  const [cursorPos, setCursorPos] = useState<IPoint | null>(null);

  useEffect(() => {
    if (!editor?.editor) return;

    const handleSelectedBoxHover = (isHover: boolean) => {
      setIsSelectedBoxHover(isHover);
    };
    const handleHoverItemChange = (hoveredItem: GAssetForgeGraphics | null) => {
      setHoveredGraphName(hoveredItem?.attrs?.objectName ?? '');
    };
    const updateZoom = (val: number) => {
      setZoom(val);
    };

    setZoom(editor?.editor?.viewportManager.getZoom());

    editor?.editor?.selectedBox.on('hoverChange', handleSelectedBoxHover);
    editor?.editor?.selectedElements.on('hoverItemChange', handleHoverItemChange);
    editor?.editor?.mouseEventManager.on('cursorPosUpdate', setCursorPos);
    editor?.editor?.viewportManager.on('zoomChange', updateZoom);

    return () => {
      editor?.editor?.selectedBox.off('hoverChange', handleSelectedBoxHover);
      editor?.editor?.selectedElements.off('hoverItemChange', handleHoverItemChange);
      editor?.editor?.viewportManager.off('zoomChange', updateZoom);
    };
  }, [editor]);

  return (
    <div style={{ padding: 8 }}>
      <div>zoom: {zoom}</div>
      <div>isSelectedBoxHover: {isSelectedBoxHover ? 'true' : 'false'}</div>
      <div>hoveredGraphName: {hoveredGraphName}</div>
      {cursorPos && (
        <>
          <div>X: {cursorPos.x.toFixed(2)}</div>
          <div>Y: {cursorPos.y.toFixed(2)}</div>
        </>
      )}
    </div>
  );
};
