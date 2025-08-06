import React from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';
import { Input } from '../../ui';
import BrushProperties from '../Properties/BrushProperties';
import CropProperties from '../Properties/CropProperties';
import ToolManager from '../../tools/ToolManager';

const PropertiesPanelContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
`;

const PropertySection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.label`
  font-size: 12px;
  color: #6b7280;
  min-width: 60px;
  flex-shrink: 0;
`;

const PropertyInput = styled(Input)`
  flex: 1;
  height: 28px;
  font-size: 12px;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #cbd5e1;
  }
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const NoSelectionMessage = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
`;

const ToolPropertiesPanel: React.FC = () => {
  const { activeTool, selectedElements, elements, updateElement } = useAppStore();
  
  // 工具管理器
  const toolManager = ToolManager.getInstance();
  const brushTool = toolManager.getBrushTool();
  const cropTool = toolManager.getCropTool();

  // 获取当前选中元素的属性
  const selectedElement = selectedElements.length === 1 && selectedElements[0] ? elements[selectedElements[0]] : null;

  // 通用属性更新函数
  const updateProperty = (property: string, value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { [property]: value });
    }
  };

  // 渲染选择工具属性
  const renderSelectionProperties = () => {
    if (!selectedElement) {
      return (
        <NoSelectionMessage>
          选择一个对象来编辑属性
        </NoSelectionMessage>
      );
    }

    return (
      <>
        <PropertySection>
          <SectionTitle>位置与尺寸</SectionTitle>
          <PropertyGrid>
            <PropertyRow>
              <PropertyLabel>X</PropertyLabel>
              <PropertyInput
                type="number"
                value={selectedElement.x || 0}
                onChange={(e) => updateProperty('x', parseInt(e.target.value) || 0)}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Y</PropertyLabel>
              <PropertyInput
                type="number"
                value={selectedElement.y || 0}
                onChange={(e) => updateProperty('y', parseInt(e.target.value) || 0)}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>宽度</PropertyLabel>
              <PropertyInput
                type="number"
                value={selectedElement.width || 0}
                onChange={(e) => updateProperty('width', parseInt(e.target.value) || 0)}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>高度</PropertyLabel>
              <PropertyInput
                type="number"
                value={selectedElement.height || 0}
                onChange={(e) => updateProperty('height', parseInt(e.target.value) || 0)}
              />
            </PropertyRow>
          </PropertyGrid>
        </PropertySection>

        {selectedElement.type !== 'text' && selectedElement.type !== 'frame' && (
          <PropertySection>
            <SectionTitle>填充</SectionTitle>
            <PropertyRow>
              <ColorSwatch
                $color={selectedElement.fill || '#3b82f6'}
                onClick={() => {
                  const color = prompt('输入颜色值:', selectedElement.fill || '#3b82f6');
                  if (color) updateProperty('fill', color);
                }}
              />
              <PropertyInput
                type="text"
                value={selectedElement.fill || '#3b82f6'}
                onChange={(e) => updateProperty('fill', e.target.value)}
                placeholder="#颜色值"
              />
            </PropertyRow>
          </PropertySection>
        )}
      </>
    );
  };

  // 画笔工具属性处理
  const handleBrushSettingsChange = (settings: Partial<any>) => {
    brushTool.updateSettings(settings);
  };

  // 裁剪工具属性处理
  const handleCropSettingsChange = (settings: Partial<any>) => {
    cropTool.updateSettings(settings);
  };

  const handleCropAreaChange = (area: Partial<any>) => {
    cropTool.updateCropArea(area);
  };

  const handleApplyCrop = () => {
    const croppedElement = cropTool.applyCrop();
    if (croppedElement) {
      updateElement(croppedElement.id, croppedElement);
    }
  };

  const handleCancelCrop = () => {
    cropTool.cancelCrop();
  };

  // 根据当前工具渲染对应的属性面板
  const renderToolProperties = () => {
    switch (activeTool) {
      case 'select':
        return renderSelectionProperties();
      
      case 'brush':
        return (
          <BrushProperties
            settings={brushTool.getSettings()}
            onChange={handleBrushSettingsChange}
          />
        );
      
      case 'crop':
        return (
          <CropProperties
            settings={cropTool.getSettings()}
            cropArea={cropTool.getCropArea()}
            onSettingsChange={handleCropSettingsChange}
            onCropAreaChange={handleCropAreaChange}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
          />
        );
      
      default:
        return (
          <NoSelectionMessage>
            选择一个工具来查看属性
          </NoSelectionMessage>
        );
    }
  };

  return (
    <PropertiesPanelContainer>
      {renderToolProperties()}
    </PropertiesPanelContainer>
  );
};

export default ToolPropertiesPanel;