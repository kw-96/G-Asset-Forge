import React from 'react';
import styled from 'styled-components';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../../ui';

const PropertiesContainer = styled.div`
  padding: 16px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const PropertyInput = styled.input`
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const CanvasProperties: React.FC = () => {
  const {
    zoom,
    backgroundColor,
    setBackgroundColor,
    resetView,
    zoomToFit
  } = useCanvasStore();

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  };

  return (
    <PropertiesContainer>
      <PropertyGroup>
        <PropertyLabel>缩放级别</PropertyLabel>
        <PropertyInput
          type="text"
          value={`${zoom}%`}
          readOnly
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>背景颜色</PropertyLabel>
        <PropertyInput
          type="color"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
      </PropertyGroup>

      <PropertyGroup>
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomToFit}
          >
            适应窗口
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
          >
            重置视图
          </Button>
        </ButtonGroup>
      </PropertyGroup>
    </PropertiesContainer>
  );
};

export default CanvasProperties;