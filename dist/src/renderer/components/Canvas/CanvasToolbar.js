import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { IconButton, Tooltip } from '../../ui';
import { ZoomInIcon, ZoomOutIcon, AspectRatioIcon, ResetIcon, EyeOpenIcon, ActivityLogIcon, MixIcon } from '@radix-ui/react-icons';
import { useCanvasStore } from '../../stores/canvasStore';
const ToolbarContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;
const ToolGroup = styled.div `
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ZoomSelect = styled.select.attrs({
    'aria-required': 'false',
    'aria-expanded': 'false'
}) `
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
const Separator = styled.div `
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 4px;
`;
const ToggleButton = styled(IconButton) `
  background: ${({ $active }) => $active ? '#667eea' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#1e293b'};
  
  &:hover {
    background: ${({ $active }) => $active
    ? '#667eea'
    : '#cbd5e1'};
  }
`;
const CanvasToolbar = ({ className, style }) => {
    const { zoom, showGrid, showRuler, snapToGrid, zoomIn, zoomOut, resetView, zoomToFit, setShowGrid, setShowRuler, setSnapToGrid } = useCanvasStore();
    const zoomPresets = [25, 50, 75, 100, 125, 150, 200, 300, 400];
    const handleZoomChange = (e) => {
        const value = parseInt(e.target.value);
        useCanvasStore.getState().setZoom(value);
    };
    return (_jsxs(ToolbarContainer, { className: className, style: style, children: [_jsxs(ToolGroup, { children: [_jsx(Tooltip, { content: "\u7F29\u5C0F", children: _jsx(IconButton, { icon: _jsx(ZoomOutIcon, {}), onClick: zoomOut, variant: "ghost", size: "sm", disabled: zoom <= 25 }) }), _jsx(ZoomSelect, { value: zoom, onChange: handleZoomChange, title: "\u7F29\u653E\u7EA7\u522B", "aria-label": "\u7F29\u653E\u7EA7\u522B\u9009\u62E9", name: "zoom-level", id: "zoom-level-select", tabIndex: 0, role: "combobox", children: zoomPresets.map(preset => (_jsxs("option", { value: preset, children: [preset, "%"] }, preset))) }), _jsx(Tooltip, { content: "\u653E\u5927", children: _jsx(IconButton, { icon: _jsx(ZoomInIcon, {}), onClick: zoomIn, variant: "ghost", size: "sm", disabled: zoom >= 400 }) })] }), _jsx(Separator, {}), _jsxs(ToolGroup, { children: [_jsx(Tooltip, { content: "\u9002\u5E94\u6240\u6709\u5BF9\u8C61 (Shift+1)", children: _jsx(IconButton, { icon: _jsx(AspectRatioIcon, {}), onClick: zoomToFit, variant: "ghost", size: "sm" }) }), _jsx(Tooltip, { content: "\u91CD\u7F6E\u89C6\u56FE\u5230\u539F\u70B9 (Shift+0)", children: _jsx(IconButton, { icon: _jsx(ResetIcon, {}), onClick: resetView, variant: "ghost", size: "sm" }) })] }), _jsx(Separator, {}), _jsxs(ToolGroup, { children: [_jsx(Tooltip, { content: "\u663E\u793A\u7F51\u683C (Ctrl+')", children: _jsx(ToggleButton, { icon: _jsx(ActivityLogIcon, {}), onClick: () => setShowGrid(!showGrid), variant: "ghost", size: "sm", "$active": showGrid }) }), _jsx(Tooltip, { content: "\u663E\u793A\u6807\u5C3A (Shift+R)", children: _jsx(ToggleButton, { icon: _jsx(EyeOpenIcon, {}), onClick: () => setShowRuler(!showRuler), variant: "ghost", size: "sm", "$active": showRuler }) }), _jsx(Tooltip, { content: "\u5BF9\u9F50\u7F51\u683C (Ctrl+Shift+')", children: _jsx(ToggleButton, { icon: _jsx(MixIcon, {}), onClick: () => setSnapToGrid(!snapToGrid), variant: "ghost", size: "sm", "$active": snapToGrid }) })] })] }));
};
export default CanvasToolbar;
//# sourceMappingURL=CanvasToolbar.js.map