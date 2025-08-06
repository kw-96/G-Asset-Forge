import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '../../ui';
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  AspectRatioIcon,
  ResetIcon,
  EyeOpenIcon,
  ActivityLogIcon,
  MixIcon
} from '@radix-ui/react-icons';
import { useCanvasStore } from '../../stores/canvasStore';


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
            icon={<ZoomOutIcon />}
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
            icon={<ZoomInIcon />}
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
            icon={<AspectRatioIcon />}
            onClick={zoomToFit}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="重置视图到原点 (Shift+0)">
          <IconButton
            icon={<ResetIcon />}
            onClick={resetView}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      </ToolGroup>

      <Separator />

      {/* Display Options */}
      <ToolGroup>
        <Tooltip content="显示网格 (Ctrl+')">
          <ToggleButton
            icon={<ActivityLogIcon />}
            onClick={() => setShowGrid(!showGrid)}
            variant="ghost"
            size="sm"
            $active={showGrid}
          />
        </Tooltip>
        
        <Tooltip content="显示标尺 (Shift+R)">
          <ToggleButton
            icon={<EyeOpenIcon />}
            onClick={() => setShowRuler(!showRuler)}
            variant="ghost"
            size="sm"
            $active={showRuler}
          />
        </Tooltip>
        
        <Tooltip content="对齐网格 (Ctrl+Shift+')">
          <ToggleButton
            icon={<MixIcon />}
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