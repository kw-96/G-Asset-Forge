import React from 'react';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.default || '#ddd'};
  position: relative;
`;

const PlaceholderText = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary || '#999'};
  font-size: 16px;
  text-align: center;
`;

const CanvasComponent: React.FC = () => {
  return (
    <CanvasContainer>
      <PlaceholderText>
        画布区域
        <br />
        <small>这里将显示设计内容</small>
      </PlaceholderText>
    </CanvasContainer>
  );
};

export default CanvasComponent;
