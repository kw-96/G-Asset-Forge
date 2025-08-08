import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { Button } from '../../ui';
const PropertiesContainer = styled.div `
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;
const PropertyGroup = styled.div `
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;
const PropertyLabel = styled.label `
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;
const AspectRatioGrid = styled.div `
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;
const AspectRatioButton = styled.button `
  padding: 8px 12px;
  border: 1px solid ${({ $active }) => $active ? '#667eea' : '#d1d5db'};
  border-radius: 6px;
  background: ${({ $active }) => $active ? '#667eea' : '#ffffff'};
  color: ${({ $active }) => $active ? '#ffffff' : '#374151'};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    border-color: #667eea;
    background: ${({ $active }) => $active ? '#5a67d8' : '#f3f4f6'};
  }
`;
const InputGroup = styled.div `
  display: flex;
  gap: 8px;
  align-items: center;
`;
const NumberInput = styled.input `
  flex: 1;
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
const Checkbox = styled.input `
  margin-right: 8px;
`;
const ActionButtons = styled.div `
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;
const CropProperties = ({ settings, cropArea, onSettingsChange, onCropAreaChange, onApplyCrop, onCancelCrop }) => {
    const aspectRatios = [
        { label: '自由', value: null },
        { label: '1:1', value: 1 },
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '3:2', value: 3 / 2 },
        { label: '9:16', value: 9 / 16 },
        { label: '3:4', value: 3 / 4 },
        { label: '2:3', value: 2 / 3 }
    ];
    const handleAspectRatioChange = (ratio) => {
        const settings = {
            maintainAspectRatio: ratio !== null
        };
        if (ratio !== null) {
            settings.aspectRatio = ratio;
        }
        onSettingsChange(settings);
    };
    const handleMaintainAspectRatioChange = (e) => {
        onSettingsChange({ maintainAspectRatio: e.target.checked });
    };
    const handleMinSizeChange = (field, value) => {
        const numValue = parseInt(value) || 1;
        onSettingsChange({ [field]: Math.max(1, numValue) });
    };
    const handleCropAreaChange = (field, value) => {
        const numValue = parseInt(value) || 0;
        onCropAreaChange({ [field]: Math.max(0, numValue) });
    };
    return (_jsxs(PropertiesContainer, { children: [_jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u5BBD\u9AD8\u6BD4" }), _jsx(AspectRatioGrid, { children: aspectRatios.map(ratio => (_jsx(AspectRatioButton, { "$active": settings.aspectRatio === ratio.value, onClick: () => handleAspectRatioChange(ratio.value), children: ratio.label }, ratio.label))) }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }, children: [_jsx(Checkbox, { type: "checkbox", checked: settings.maintainAspectRatio, onChange: handleMaintainAspectRatioChange }), "\u4FDD\u6301\u5BBD\u9AD8\u6BD4"] }) })] }), _jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u6700\u5C0F\u5C3A\u5BF8" }), _jsxs(InputGroup, { children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "\u5BBD\u5EA6" }), _jsx(NumberInput, { type: "number", min: "1", value: settings.minWidth, onChange: (e) => handleMinSizeChange('minWidth', e.target.value) })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "\u9AD8\u5EA6" }), _jsx(NumberInput, { type: "number", min: "1", value: settings.minHeight, onChange: (e) => handleMinSizeChange('minHeight', e.target.value) })] })] })] }), cropArea && (_jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u88C1\u526A\u533A\u57DF" }), _jsxs(InputGroup, { style: { marginBottom: '8px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "X" }), _jsx(NumberInput, { type: "number", min: "0", value: Math.round(cropArea.x), onChange: (e) => handleCropAreaChange('x', e.target.value) })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "Y" }), _jsx(NumberInput, { type: "number", min: "0", value: Math.round(cropArea.y), onChange: (e) => handleCropAreaChange('y', e.target.value) })] })] }), _jsxs(InputGroup, { children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "\u5BBD\u5EA6" }), _jsx(NumberInput, { type: "number", min: settings.minWidth, value: Math.round(cropArea.width), onChange: (e) => handleCropAreaChange('width', e.target.value) })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '11px', color: '#6b7280' }, children: "\u9AD8\u5EA6" }), _jsx(NumberInput, { type: "number", min: settings.minHeight, value: Math.round(cropArea.height), onChange: (e) => handleCropAreaChange('height', e.target.value) })] })] })] })), _jsxs(ActionButtons, { children: [_jsx(Button, { variant: "primary", size: "sm", onClick: onApplyCrop, disabled: !cropArea, style: { flex: 1 }, children: "\u5E94\u7528\u88C1\u526A" }), _jsx(Button, { variant: "outline", size: "sm", onClick: onCancelCrop, style: { flex: 1 }, children: "\u53D6\u6D88" })] })] }));
};
export default CropProperties;
//# sourceMappingURL=CropProperties.js.map