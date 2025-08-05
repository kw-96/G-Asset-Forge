import React from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';

const StatusBarContainer = styled.footer`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.surface || '#fafafa'};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default || '#d9d9d9'};
  height: 28px;
  line-height: normal;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary || '#666'};
`;

const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBar: React.FC = () => {
  const { 
    canvasZoom, 
    selectedElements,
    elements,
    hasUnsavedChanges
  } = useAppStore();

  const selectedCount = selectedElements.length;
  const totalElements = Object.keys(elements).length;

  return (
    <StatusBarContainer>
      <StatusGroup>
        <StatusItem>
          画布: 1920 × 1080
        </StatusItem>
        
        <StatusItem>
          缩放: {Math.round(canvasZoom * 100)}%
        </StatusItem>

        <StatusItem>
          元素: {selectedCount}/{totalElements}
        </StatusItem>
      </StatusGroup>

      <StatusGroup>
        {hasUnsavedChanges && (
          <StatusItem style={{ color: '#faad14' }}>
            未保存的更改
          </StatusItem>
        )}
        
        <StatusItem>
          就绪
        </StatusItem>
      </StatusGroup>
    </StatusBarContainer>
  );
};

export default StatusBar;
