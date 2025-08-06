import React from 'react';
import styled from 'styled-components';
import { CropSettings } from '../../tools/CropTool';
import { Button } from '../../ui';

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

const AspectRatioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const AspectRatioButton = styled.button<{ $active: boolean }>`
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

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const NumberInput = styled.input`
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

const Checkbox = styled.input`
  margin-right: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

interface CropPropertiesProps {
  settings: CropSettings;
  cropArea: { x: number; y: number; width: number; height: number } | null;
  onSettingsChange: (settings: Partial<CropSettings>) => void;
  onCropAreaChange: (area: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

const CropProperties: React.FC<CropPropertiesProps> = ({
  settings,
  cropArea,
  onSettingsChange,
  onCropAreaChange,
  onApplyCrop,
  onCancelCrop
}) => {
  const aspectRatios = [
    { label: '自由', value: null },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16/9 },
    { label: '4:3', value: 4/3 },
    { label: '3:2', value: 3/2 },
    { label: '9:16', value: 9/16 },
    { label: '3:4', value: 3/4 },
    { label: '2:3', value: 2/3 }
  ];

  const handleAspectRatioChange = (ratio: number | null) => {
    const settings: Partial<CropSettings> = {
      maintainAspectRatio: ratio !== null
    };
    
    if (ratio !== null) {
      settings.aspectRatio = ratio;
    }
    
    onSettingsChange(settings);
  };

  const handleMaintainAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ maintainAspectRatio: e.target.checked });
  };

  const handleMinSizeChange = (field: 'minWidth' | 'minHeight', value: string) => {
    const numValue = parseInt(value) || 1;
    onSettingsChange({ [field]: Math.max(1, numValue) });
  };

  const handleCropAreaChange = (field: 'x' | 'y' | 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    onCropAreaChange({ [field]: Math.max(0, numValue) });
  };

  return (
    <PropertiesContainer>
      {/* 宽高比 */}
      <PropertyGroup>
        <PropertyLabel>宽高比</PropertyLabel>
        <AspectRatioGrid>
          {aspectRatios.map(ratio => (
            <AspectRatioButton
              key={ratio.label}
              $active={settings.aspectRatio === ratio.value}
              onClick={() => handleAspectRatioChange(ratio.value)}
            >
              {ratio.label}
            </AspectRatioButton>
          ))}
        </AspectRatioGrid>
        
        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
            <Checkbox
              type="checkbox"
              checked={settings.maintainAspectRatio}
              onChange={handleMaintainAspectRatioChange}
            />
            保持宽高比
          </label>
        </div>
      </PropertyGroup>

      {/* 最小尺寸 */}
      <PropertyGroup>
        <PropertyLabel>最小尺寸</PropertyLabel>
        <InputGroup>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: '#6b7280' }}>宽度</label>
            <NumberInput
              type="number"
              min="1"
              value={settings.minWidth}
              onChange={(e) => handleMinSizeChange('minWidth', e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: '#6b7280' }}>高度</label>
            <NumberInput
              type="number"
              min="1"
              value={settings.minHeight}
              onChange={(e) => handleMinSizeChange('minHeight', e.target.value)}
            />
          </div>
        </InputGroup>
      </PropertyGroup>

      {/* 裁剪区域 */}
      {cropArea && (
        <PropertyGroup>
          <PropertyLabel>裁剪区域</PropertyLabel>
          <InputGroup style={{ marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#6b7280' }}>X</label>
              <NumberInput
                type="number"
                min="0"
                value={Math.round(cropArea.x)}
                onChange={(e) => handleCropAreaChange('x', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#6b7280' }}>Y</label>
              <NumberInput
                type="number"
                min="0"
                value={Math.round(cropArea.y)}
                onChange={(e) => handleCropAreaChange('y', e.target.value)}
              />
            </div>
          </InputGroup>
          <InputGroup>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#6b7280' }}>宽度</label>
              <NumberInput
                type="number"
                min={settings.minWidth}
                value={Math.round(cropArea.width)}
                onChange={(e) => handleCropAreaChange('width', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#6b7280' }}>高度</label>
              <NumberInput
                type="number"
                min={settings.minHeight}
                value={Math.round(cropArea.height)}
                onChange={(e) => handleCropAreaChange('height', e.target.value)}
              />
            </div>
          </InputGroup>
        </PropertyGroup>
      )}

      {/* 操作按钮 */}
      <ActionButtons>
        <Button
          variant="primary"
          size="sm"
          onClick={onApplyCrop}
          disabled={!cropArea}
          style={{ flex: 1 }}
        >
          应用裁剪
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelCrop}
          style={{ flex: 1 }}
        >
          取消
        </Button>
      </ActionButtons>
    </PropertiesContainer>
  );
};

export default CropProperties;