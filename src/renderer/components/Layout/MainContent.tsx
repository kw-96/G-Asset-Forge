import React from 'react';
import styled from 'styled-components';
import CanvasArea from '../Canvas/CanvasArea';

const ContentContainer = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.background || '#f0f2f5'};
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent: React.FC = () => {
  return (
    <ContentContainer>
      <CanvasArea />
    </ContentContainer>
  );
};

export default MainContent;
