import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '../../components';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';
import { useCanvasStore } from '../../../stores/canvasStore';


const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ZoomSelect = styled.select.attrs({
  'aria-required': 'false',
  'aria-expanded': 'false'
})`
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #ffffff;
  color: #1e293b;
  font-size: 12px;
  min-width: 70px;
  
  &:focus {
    outline: 2px solid #667eea;
    border-color: #667eea;
  }
  
  /* Ensure accessibility compliance */
  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 4px;
`;

const ToggleButton = styled(IconButton)<{ $active: boolean }>`
  background: ${({ $active }) => $active ? '#667eea' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#1e293b'};
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? '#667eea' 
        : '#cbd5e1'
    };
  }
`;

interface CanvasToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ className, style }) => {
  const { 
    zoom,
    showGrid,
    showRuler,
    snapToGrid,
    zoomIn,
    zoomOut,
    resetView,
    zoomToFit,
    setShowGrid,
    setShowRuler,
    setSnapToGrid
  } = useCanvasStore();

  const zoomPresets = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    useCanvasStore.getState().setZoom(value);
  };

  return (
    <ToolbarContainer className={className} style={style}>
      {/* Zoom Controls */}
      <ToolGroup>
        <Tooltip content="缩小">
          <IconButton
            icon={<SvgIcon name="icon.24.zoom.out.small" size={16} title="缩小" />}
            onClick={zoomOut}
            variant="ghost"
            size="sm"
            disabled={zoom <= 25}
          />
        </Tooltip>
        
        <ZoomSelect 
          value={zoom} 
          onChange={handleZoomChange}
          title="缩放级别"
          aria-label="缩放级别选择"
          name="zoom-level"
          id="zoom-level-select"
          tabIndex={0}
          role="combobox"
        >
          {zoomPresets.map(preset => (
            <option key={preset} value={preset}>
              {preset}%
            </option>
          ))}
        </ZoomSelect>
        
        <Tooltip content="放大">
          <IconButton
            icon={<SvgIcon name="icon.24.zoom.in.small" size={16} title="放大" />}
            onClick={zoomIn}
            variant="ghost"
            size="sm"
            disabled={zoom >= 400}
          />
        </Tooltip>
      </ToolGroup>

      <Separator />

      {/* View Controls */}
      <ToolGroup>
        <Tooltip content="适应所有对象 (Shift+1)">
          <IconButton
            icon={<SvgIcon name="icon.24.fit.to.screen.small" size={16} title="适应所有对象" />}
            onClick={zoomToFit}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="重置视图到原点 (Shift+0)">
          <IconButton
            icon={<SvgIcon name="icon.24.actual.size.small" size={16} title="重置视图" />}
            onClick={resetView}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      </ToolGroup>

      <Separator />

      {/* Display Options */}
      <ToolGroup>
        <Tooltip content="显示网格 (G)">
          <ToggleButton
            icon={<SvgIcon name="icon.24.grid.svg" size={16} title="显示网格" />}
            onClick={() => setShowGrid(!showGrid)}
            variant="ghost"
            size="sm"
            $active={showGrid}
          />
        </Tooltip>
        
        <Tooltip content="显示标尺 (Shift+R)">
          <ToggleButton
            icon={<SvgIcon name="icon.24.measure.small" size={16} title="显示标尺" />}
            onClick={() => setShowRuler(!showRuler)}
            variant="ghost"
            size="sm"
            $active={showRuler}
          />
        </Tooltip>
        
        <Tooltip content="对齐网格 (Ctrl+Shift+')">
          <ToggleButton
            icon={<SvgIcon name="icon.24.autolayout-add-horizontal" size={16} title="对齐网格" />}
            onClick={() => setSnapToGrid(!snapToGrid)}
            variant="ghost"
            size="sm"
            $active={snapToGrid}
          />
        </Tooltip>
      </ToolGroup>
    </ToolbarContainer>
  );
};

export default CanvasToolbar;