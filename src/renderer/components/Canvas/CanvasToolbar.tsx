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
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ZoomSelect = styled.select.attrs({
  'aria-required': 'false',
  'aria-expanded': 'false'
})`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  min-width: 70px;
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  /* Ensure accessibility compliance */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

const ToggleButton = styled(IconButton)<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text.inverse : theme.colors.text.primary};
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active 
        ? theme.colors.primary 
        : theme.colors.border.hover
    };
  }
`;

interface CanvasToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ className, style }) => {
  const canvasStore = useCanvasStore();
  const { 
    zoom = 100,
    setZoom,
    showGrid = true,
    setShowGrid,
    showRuler = true,
    setShowRuler,
    snapToGrid = false,
    setSnapToGrid
  } = canvasStore;

  const zoomPresets = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setZoom(value);
  };

  const handleZoomIn = () => {
    const currentIndex = zoomPresets.findIndex(preset => preset >= zoom);
    const nextIndex = Math.min(currentIndex + 1, zoomPresets.length - 1);
    const nextZoom = zoomPresets[nextIndex];
    if (nextZoom !== undefined) {
      setZoom(nextZoom);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomPresets.findIndex(preset => preset >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevZoom = zoomPresets[prevIndex];
    if (prevZoom !== undefined) {
      setZoom(prevZoom);
    }
  };

  const handleFitToWindow = () => {
    // TODO: Implement fit to window logic
    setZoom(100);
  };

  const handleResetView = () => {
    setZoom(100);
    // TODO: Reset canvas position
  };

  return (
    <ToolbarContainer className={className} style={style}>
      {/* Zoom Controls */}
      <ToolGroup>
        <Tooltip content="缩小">
          <IconButton
            icon={<ZoomOutIcon />}
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            disabled={zoom <= (zoomPresets[0] ?? 25)}
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
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            disabled={zoom >= (zoomPresets[zoomPresets.length - 1] ?? 400)}
          />
        </Tooltip>
      </ToolGroup>

      <Separator />

      {/* View Controls */}
      <ToolGroup>
        <Tooltip content="适应窗口 (Shift+1)">
          <IconButton
            icon={<AspectRatioIcon />}
            onClick={handleFitToWindow}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        
        <Tooltip content="重置视图 (Shift+0)">
          <IconButton
            icon={<ResetIcon />}
            onClick={handleResetView}
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