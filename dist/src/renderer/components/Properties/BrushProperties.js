import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
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
const SliderContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Slider = styled.input `
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;
const SliderValue = styled.span `
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
  text-align: right;
`;
const ColorInput = styled.input `
  width: 40px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;
const PresetButtons = styled.div `
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const PresetButton = styled.button `
  padding: 4px 8px;
  border: 1px solid ${({ $active }) => $active ? '#667eea' : '#d1d5db'};
  border-radius: 4px;
  background: ${({ $active }) => $active ? '#667eea' : '#ffffff'};
  color: ${({ $active }) => $active ? '#ffffff' : '#374151'};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: ${({ $active }) => $active ? '#5a67d8' : '#f3f4f6'};
  }
`;
const BrushProperties = ({ settings, onChange }) => {
    const sizePresets = [2, 5, 10, 20, 50, 100];
    const opacityPresets = [0.25, 0.5, 0.75, 1];
    const handleSizeChange = (e) => {
        onChange({ size: parseInt(e.target.value) });
    };
    const handleOpacityChange = (e) => {
        onChange({ opacity: parseFloat(e.target.value) });
    };
    const handleHardnessChange = (e) => {
        onChange({ hardness: parseFloat(e.target.value) });
    };
    const handleColorChange = (e) => {
        onChange({ color: e.target.value });
    };
    return (_jsxs(PropertiesContainer, { children: [_jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u753B\u7B14\u5927\u5C0F" }), _jsxs(SliderContainer, { children: [_jsx(Slider, { type: "range", min: "1", max: "200", value: settings.size, onChange: handleSizeChange }), _jsxs(SliderValue, { children: [settings.size, "px"] })] }), _jsx(PresetButtons, { style: { marginTop: '8px' }, children: sizePresets.map(size => (_jsxs(PresetButton, { "$active": settings.size === size, onClick: () => onChange({ size }), children: [size, "px"] }, size))) })] }), _jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u4E0D\u900F\u660E\u5EA6" }), _jsxs(SliderContainer, { children: [_jsx(Slider, { type: "range", min: "0", max: "1", step: "0.01", value: settings.opacity, onChange: handleOpacityChange }), _jsxs(SliderValue, { children: [Math.round(settings.opacity * 100), "%"] })] }), _jsx(PresetButtons, { style: { marginTop: '8px' }, children: opacityPresets.map(opacity => (_jsxs(PresetButton, { "$active": Math.abs(settings.opacity - opacity) < 0.01, onClick: () => onChange({ opacity }), children: [Math.round(opacity * 100), "%"] }, opacity))) })] }), _jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u786C\u5EA6" }), _jsxs(SliderContainer, { children: [_jsx(Slider, { type: "range", min: "0", max: "1", step: "0.01", value: settings.hardness, onChange: handleHardnessChange }), _jsxs(SliderValue, { children: [Math.round(settings.hardness * 100), "%"] })] })] }), _jsxs(PropertyGroup, { children: [_jsx(PropertyLabel, { children: "\u989C\u8272" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(ColorInput, { type: "color", value: settings.color, onChange: handleColorChange }), _jsx("span", { style: { fontSize: '12px', color: '#6b7280' }, children: settings.color.toUpperCase() })] })] })] }));
};
export default BrushProperties;
//# sourceMappingURL=BrushProperties.js.map