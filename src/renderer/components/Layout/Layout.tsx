import React from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import PropertiesPanel from './PropertiesPanel';
import StatusBar from './StatusBar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background || '#f5f5f5'};
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Layout: React.FC = () => {
  const { 
    sidebarCollapsed,
    propertiesPanelCollapsed
  } = useAppStore();

  return (
    <LayoutContainer>
      <Header />
      <MainArea>
        <Sidebar />
        <ContentArea>
          <MainContent />
          <PropertiesPanel />
        </ContentArea>
      </MainArea>
      <StatusBar />
    </LayoutContainer>
  );
};

export default Layout;
