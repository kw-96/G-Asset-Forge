import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 右侧属性面板 - Figma风格的属性编辑面板
 * 根据选中的工具和对象显示相应的属性控制
 */
import { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../../ui/components/Input/Input';
import { Slider } from '../../ui/components/Slider/Slider';
import { Switch } from '../../ui/components/Switch/Switch';
import { IconButton } from '../../ui/components/IconButton/IconButton';
const PanelContainer = styled.div `
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  overflow-y: auto;
`;
const PanelSection = styled.div `
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
`;
const SectionHeader = styled.div `
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;
const SectionTitle = styled.h4 `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;
const SectionContent = styled.div `
  padding: ${({ theme }) => theme.spacing.md};
  padding-top: 0;
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;
const PropertyRow = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;
const PropertyLabel = styled.label `
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 60px;
  flex-shrink: 0;
`;
const PropertyControl = styled.div `
  flex: 1;
`;
const ColorPicker = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const ColorSwatch = styled.div `
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }
`;
const ColorPresets = styled.div `
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;
const PresetColor = styled.div `
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;
const NoSelection = styled.div `
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;
const NoSelectionIcon = styled.div `
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
export const RightPropertiesPanel = () => {
    const [selectedTool] = useState('select');
    const [selectedObject] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState([]);
    // 模拟属性状态
    const [properties, setProperties] = useState({
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        rotation: 0,
        opacity: 100,
        fillColor: '#6366f1',
        strokeColor: '#000000',
        strokeWidth: 1,
        borderRadius: 0,
        fontSize: 16,
        fontWeight: 400,
        textAlign: 'left',
        visible: true,
        locked: false,
    });
    const colorPresets = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
        '#f59e0b', '#10b981', '#06b6d4', '#64748b',
        '#000000', '#ffffff', '#f3f4f6', '#1f2937',
    ];
    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => prev.includes(sectionId)
            ? prev.filter(id => id !== sectionId)
            : [...prev, sectionId]);
    };
    const updateProperty = (key, value) => {
        setProperties(prev => ({ ...prev, [key]: value }));
    };
    const updateNestedProperty = (parent, key, value) => {
        setProperties(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: value }
        }));
    };
    // 如果没有选中对象，显示空状态
    if (!selectedObject && selectedTool === 'select') {
        return (_jsx(PanelContainer, { children: _jsxs(NoSelection, { children: [_jsx(NoSelectionIcon, { children: "\uD83C\uDFAF" }), _jsx("div", { children: "\u9009\u62E9\u5BF9\u8C61\u4EE5\u7F16\u8F91\u5C5E\u6027" })] }) }));
    }
    return (_jsxs(PanelContainer, { children: [_jsxs(PanelSection, { children: [_jsxs(SectionHeader, { onClick: () => toggleSection('transform'), children: [_jsx(SectionTitle, { children: "\u53D8\u6362" }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: collapsedSections.includes('transform') ? '▶️' : '🔽' })] }), _jsxs(SectionContent, { "$collapsed": collapsedSections.includes('transform'), children: [_jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u4F4D\u7F6E" }), _jsx(PropertyControl, { children: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Input, { size: "sm", value: properties.position.x, onChange: (e) => updateNestedProperty('position', 'x', Number(e.target.value)), placeholder: "X" }), _jsx(Input, { size: "sm", value: properties.position.y, onChange: (e) => updateNestedProperty('position', 'y', Number(e.target.value)), placeholder: "Y" })] }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u5C3A\u5BF8" }), _jsx(PropertyControl, { children: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Input, { size: "sm", value: properties.size.width, onChange: (e) => updateNestedProperty('size', 'width', Number(e.target.value)), placeholder: "\u5BBD" }), _jsx(Input, { size: "sm", value: properties.size.height, onChange: (e) => updateNestedProperty('size', 'height', Number(e.target.value)), placeholder: "\u9AD8" })] }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u65CB\u8F6C" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.rotation], onValueChange: (value) => updateProperty('rotation', value[0]), min: 0, max: 360 }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u900F\u660E\u5EA6" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.opacity], onValueChange: (value) => updateProperty('opacity', value[0]), min: 0, max: 100 }) })] })] })] }), _jsxs(PanelSection, { children: [_jsxs(SectionHeader, { onClick: () => toggleSection('appearance'), children: [_jsx(SectionTitle, { children: "\u5916\u89C2" }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: collapsedSections.includes('appearance') ? '▶️' : '🔽' })] }), _jsxs(SectionContent, { "$collapsed": collapsedSections.includes('appearance'), children: [_jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u586B\u5145" }), _jsxs(PropertyControl, { children: [_jsxs(ColorPicker, { children: [_jsx(ColorSwatch, { "$color": properties.fillColor }), _jsx(Input, { size: "sm", value: properties.fillColor, onChange: (e) => updateProperty('fillColor', e.target.value) })] }), _jsx(ColorPresets, { children: colorPresets.map((color) => (_jsx(PresetColor, { "$color": color, onClick: () => updateProperty('fillColor', color) }, color))) })] })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u63CF\u8FB9" }), _jsx(PropertyControl, { children: _jsxs(ColorPicker, { children: [_jsx(ColorSwatch, { "$color": properties.strokeColor }), _jsx(Input, { size: "sm", value: properties.strokeColor, onChange: (e) => updateProperty('strokeColor', e.target.value) })] }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u63CF\u8FB9\u5BBD\u5EA6" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.strokeWidth], onValueChange: (value) => updateProperty('strokeWidth', value[0]), min: 0, max: 10 }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u5706\u89D2" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.borderRadius], onValueChange: (value) => updateProperty('borderRadius', value[0]), min: 0, max: 50 }) })] })] })] }), selectedTool === 'text' && (_jsxs(PanelSection, { children: [_jsxs(SectionHeader, { onClick: () => toggleSection('text'), children: [_jsx(SectionTitle, { children: "\u6587\u672C" }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: collapsedSections.includes('text') ? '▶️' : '🔽' })] }), _jsxs(SectionContent, { "$collapsed": collapsedSections.includes('text'), children: [_jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u5B57\u4F53\u5927\u5C0F" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.fontSize], onValueChange: (value) => updateProperty('fontSize', value[0]), min: 8, max: 72 }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u5B57\u91CD" }), _jsx(PropertyControl, { children: _jsx(Slider, { value: [properties.fontWeight], onValueChange: (value) => updateProperty('fontWeight', value[0]), min: 100, max: 900, step: 100 }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u5BF9\u9F50" }), _jsx(PropertyControl, { children: _jsxs("div", { style: { display: 'flex', gap: '4px' }, children: [_jsx(IconButton, { variant: properties.textAlign === 'left' ? 'primary' : 'ghost', size: "sm", icon: "\u2B05\uFE0F", onClick: () => updateProperty('textAlign', 'left') }), _jsx(IconButton, { variant: properties.textAlign === 'center' ? 'primary' : 'ghost', size: "sm", icon: "\u2194\uFE0F", onClick: () => updateProperty('textAlign', 'center') }), _jsx(IconButton, { variant: properties.textAlign === 'right' ? 'primary' : 'ghost', size: "sm", icon: "\u27A1\uFE0F", onClick: () => updateProperty('textAlign', 'right') })] }) })] })] })] })), _jsxs(PanelSection, { children: [_jsxs(SectionHeader, { onClick: () => toggleSection('layer'), children: [_jsx(SectionTitle, { children: "\u56FE\u5C42" }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: collapsedSections.includes('layer') ? '▶️' : '🔽' })] }), _jsxs(SectionContent, { "$collapsed": collapsedSections.includes('layer'), children: [_jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u53EF\u89C1" }), _jsx(PropertyControl, { children: _jsx(Switch, { checked: properties.visible, onCheckedChange: (checked) => updateProperty('visible', checked) }) })] }), _jsxs(PropertyRow, { children: [_jsx(PropertyLabel, { children: "\u9501\u5B9A" }), _jsx(PropertyControl, { children: _jsx(Switch, { checked: properties.locked, onCheckedChange: (checked) => updateProperty('locked', checked) }) })] })] })] })] }));
};
//# sourceMappingURL=RightPropertiesPanel.js.map