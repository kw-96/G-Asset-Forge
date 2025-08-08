import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../../ui';
const PropertiesContainer = styled.div `
  padding: 16px;
`;
const PropertyGroup = styled.div `
  margin-bottom: 16px;
`;
const PropertyLabel = styled.label `
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;
const PropertyInput = styled.input `
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;
// PropertySelect 暂时不需要
const ButtonGroup = styled.div `
  display: flex;
  gap: 8px;
`;
const CanvasProperties = () => {
    const { zoom, backgroundColor, setBackgroundColor, resetView, zoomToFit } = useCanvasStore();
    const handleBackgroundColorChange = (e) => {
        setBackgroundColor(e.target.value);
    };
    return (_jsxs(PropertiesContainer, { children: [_jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u7F29\u653E\u7EA7\u522B" }), _jsx(PropertyInput, { type: "text", value: `${zoom}%`, readOnly: true })] }), _jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u80CC\u666F\u989C\u8272" }), _jsx(PropertyInput, { type: "color", value: backgroundColor, onChange: handleBackgroundColorChange })] }), _jsx(PropertyGroup, { children: _jsxs(ButtonGroup, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: zoomToFit, children: "\u9002\u5E94\u7A97\u53E3" }), _jsx(Button, { variant: "outline", size: "sm", onClick: resetView, children: "\u91CD\u7F6E\u89C6\u56FE" })] }) })] }));
};
export default CanvasProperties;
//# sourceMappingURL=CanvasProperties.js.map