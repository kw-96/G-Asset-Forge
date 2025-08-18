/**
 * Figma风格的属性面板
 * 根据选中的对象类型显示相应的属性控制
 */

import React from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../atoms/Icon/SvgIcon';
// import { Button } from '../../atoms/Button/Button.tsx';
import { Input } from '../../atoms/Input/Input';
import { StableSlider } from '../../atoms/Slider/Slider';

interface PropertiesPanelProps {
  selectedObject?: {
    type: 'text' | 'shape' | 'image' | 'frame';
    properties: Record<string, any>;
  };
  onPropertyChange: (property: string, value: any) => void;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.interface.panel.light};
  border-left: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const PanelSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.label`
  font-size: 12px;
  color: #374151;
  min-width: 60px;
  font-weight: 500;
`;

const ColorSwatch = styled.button<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: ${({ $color }) => $color};
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 4px;
    border: 2px solid transparent;
    background: linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
                linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
                linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    z-index: -1;
  }
`;

const IconButtonGroup = styled.div`
  display: flex;
  gap: 2px;
`;

const IconToggleButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 4px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary[500] : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 150ms ease;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : '#f9fafb'};
  }
  
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }
  
  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  &:not(:first-child):not(:last-child) {
    border-radius: 0;
    border-right: none;
  }
`;

const NumberInput = styled(Input)`
  width: 60px;
  text-align: center;
  font-size: 12px;
  height: 28px;
`;

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  onPropertyChange,
}) => {
  if (!selectedObject) {
    return (
      <PanelContainer>
        <PanelSection>
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px' }}>
            <SvgIcon name="icon.24.select" size={32} title="选择对象" />
            <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
              选择一个对象来编辑属性
            </p>
          </div>
        </PanelSection>
      </PanelContainer>
    );
  }

  const renderTextProperties = () => (
    <>
      <PanelSection>
        <SectionTitle>文本</SectionTitle>
        <PropertyRow>
          <PropertyLabel>字体</PropertyLabel>
          <select style={{ flex: 1, height: '28px', fontSize: '12px' }}>
            <option>Inter</option>
            <option>Roboto</option>
            <option>Arial</option>
          </select>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>大小</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['fontSize'] || 16}
            onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value))}
          />
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>样式</PropertyLabel>
          <IconButtonGroup>
            <IconToggleButton $active={selectedObject.properties['fontWeight'] === 'bold'}>
              <SvgIcon name="icon.24.bold" size={12} title="粗体" />
            </IconToggleButton>
            <IconToggleButton $active={selectedObject.properties['fontStyle'] === 'italic'}>
              <SvgIcon name="icon.24.italic" size={12} title="斜体" />
            </IconToggleButton>
            <IconToggleButton $active={selectedObject.properties['textDecoration'] === 'underline'}>
              <SvgIcon name="icon.24.underline" size={12} title="下划线" />
            </IconToggleButton>
          </IconButtonGroup>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>对齐</PropertyLabel>
          <IconButtonGroup>
            <IconToggleButton $active={selectedObject.properties['textAlign'] === 'left'}>
              <SvgIcon name="icon.24.text.align-left" size={12} title="左对齐" />
            </IconToggleButton>
            <IconToggleButton $active={selectedObject.properties['textAlign'] === 'center'}>
              <SvgIcon name="icon.24.text.align-center" size={12} title="居中对齐" />
            </IconToggleButton>
            <IconToggleButton $active={selectedObject.properties['textAlign'] === 'right'}>
              <SvgIcon name="icon.24.text.align-right" size={12} title="右对齐" />
            </IconToggleButton>
          </IconButtonGroup>
        </PropertyRow>
      </PanelSection>
    </>
  );

  const renderShapeProperties = () => (
    <>
      <PanelSection>
        <SectionTitle>填充</SectionTitle>
        <PropertyRow>
          <ColorSwatch 
            $color={selectedObject.properties['fill'] || '#000000'}
            onClick={() => {/* 打开颜色选择器 */}}
          />
          <Input 
            value={selectedObject.properties['fill'] || '#000000'}
            onChange={(e) => onPropertyChange('fill', e.target.value)}
            style={{ flex: 1, fontSize: '12px', height: '28px' }}
          />
        </PropertyRow>
      </PanelSection>
      
      <PanelSection>
        <SectionTitle>描边</SectionTitle>
        <PropertyRow>
          <ColorSwatch 
            $color={selectedObject.properties['stroke'] || '#000000'}
            onClick={() => {/* 打开颜色选择器 */}}
          />
          <Input 
            value={selectedObject.properties['stroke'] || '#000000'}
            onChange={(e) => onPropertyChange('stroke', e.target.value)}
            style={{ flex: 1, fontSize: '12px', height: '28px' }}
          />
          <NumberInput 
            value={selectedObject.properties['strokeWidth'] || 1}
            onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value))}
          />
        </PropertyRow>
      </PanelSection>
    </>
  );

  const renderCommonProperties = () => (
    <>
      <PanelSection>
        <SectionTitle>位置和大小</SectionTitle>
        <PropertyRow>
          <PropertyLabel>X</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['x'] || 0}
            onChange={(e) => onPropertyChange('x', parseInt(e.target.value))}
          />
          <PropertyLabel>Y</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['y'] || 0}
            onChange={(e) => onPropertyChange('y', parseInt(e.target.value))}
          />
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>W</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['width'] || 100}
            onChange={(e) => onPropertyChange('width', parseInt(e.target.value))}
          />
          <PropertyLabel>H</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['height'] || 100}
            onChange={(e) => onPropertyChange('height', parseInt(e.target.value))}
          />
        </PropertyRow>
      </PanelSection>
      
      <PanelSection>
        <SectionTitle>变换</SectionTitle>
        <PropertyRow>
          <PropertyLabel>旋转</PropertyLabel>
          <NumberInput 
            value={selectedObject.properties['rotation'] || 0}
            onChange={(e) => onPropertyChange('rotation', parseInt(e.target.value))}
          />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>°</span>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>不透明度</PropertyLabel>
          <div style={{ flex: 1 }}>
            <StableSlider
            value={[selectedObject.properties['opacity'] ?? 100]}
            onValueChange={(value) => onPropertyChange('opacity', value[0] ?? 0)}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '30px' }}>
            {selectedObject.properties['opacity'] || 100}%
          </span>
        </PropertyRow>
      </PanelSection>
    </>
  );

  return (
    <PanelContainer>
      {selectedObject.type === 'text' && renderTextProperties()}
      {selectedObject.type === 'shape' && renderShapeProperties()}
      {renderCommonProperties()}
    </PanelContainer>
  );
};

export type { PropertiesPanelProps };
export { PropertiesPanel as FigmaPropertiesPanel };