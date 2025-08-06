import React from 'react';
import styled from 'styled-components';
import { BrushSettings } from '../../tools/BrushTool';

const PropertiesContainer = styled.div`
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Slider = styled.input`
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

const SliderValue = styled.span`
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
  text-align: right;
`;

const ColorInput = styled.input`
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

const PresetButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PresetButton = styled.button<{ $active: boolean }>`
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

interface BrushPropertiesProps {
  settings: BrushSettings;
  onChange: (settings: Partial<BrushSettings>) => void;
}

const BrushProperties: React.FC<BrushPropertiesProps> = ({ settings, onChange }) => {
  const sizePresets = [2, 5, 10, 20, 50, 100];
  const opacityPresets = [0.25, 0.5, 0.75, 1];

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ size: parseInt(e.target.value) });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ opacity: parseFloat(e.target.value) });
  };

  const handleHardnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ hardness: parseFloat(e.target.value) });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ color: e.target.value });
  };

  return (
    <PropertiesContainer>
      {/* 画笔大小 */}
      <PropertyGroup>
        <PropertyLabel>画笔大小</PropertyLabel>
        <SliderContainer>
          <Slider
            type="range"
            min="1"
            max="200"
            value={settings.size}
            onChange={handleSizeChange}
          />
          <SliderValue>{settings.size}px</SliderValue>
        </SliderContainer>
        <PresetButtons style={{ marginTop: '8px' }}>
          {sizePresets.map(size => (
            <PresetButton
              key={size}
              $active={settings.size === size}
              onClick={() => onChange({ size })}
            >
              {size}px
            </PresetButton>
          ))}
        </PresetButtons>
      </PropertyGroup>

      {/* 不透明度 */}
      <PropertyGroup>
        <PropertyLabel>不透明度</PropertyLabel>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.opacity}
            onChange={handleOpacityChange}
          />
          <SliderValue>{Math.round(settings.opacity * 100)}%</SliderValue>
        </SliderContainer>
        <PresetButtons style={{ marginTop: '8px' }}>
          {opacityPresets.map(opacity => (
            <PresetButton
              key={opacity}
              $active={Math.abs(settings.opacity - opacity) < 0.01}
              onClick={() => onChange({ opacity })}
            >
              {Math.round(opacity * 100)}%
            </PresetButton>
          ))}
        </PresetButtons>
      </PropertyGroup>

      {/* 硬度 */}
      <PropertyGroup>
        <PropertyLabel>硬度</PropertyLabel>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.hardness}
            onChange={handleHardnessChange}
          />
          <SliderValue>{Math.round(settings.hardness * 100)}%</SliderValue>
        </SliderContainer>
      </PropertyGroup>

      {/* 颜色 */}
      <PropertyGroup>
        <PropertyLabel>颜色</PropertyLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={settings.color}
            onChange={handleColorChange}
          />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {settings.color.toUpperCase()}
          </span>
        </div>
      </PropertyGroup>
    </PropertiesContainer>
  );
};

export default BrushProperties;