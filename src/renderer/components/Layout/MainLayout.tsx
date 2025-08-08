/**
 * 主布局组件 - 基于Figma风格的界面布局
 * 包含顶部工具栏、左侧工具面板、中央画布、右侧属性面板
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TopToolbar } from './TopToolbar';
import { LeftToolPanel } from './LeftToolPanel';
import { CanvasWorkspace } from '../Canvas/CanvasWorkspace';
import { RightPropertiesPanel } from './RightPropertiesPanel';
import { StatusBar } from './StatusBar';
import { LayersPanel } from './LayersPanel';
import { AssetsPanel } from '../Assets/AssetsPanel';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const TopSection = styled.div`
  flex-shrink: 0;
  z-index: ${({ theme }) => theme.zIndex.banner};
`;

const MainSection = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftSection = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-shrink: 0;
  width: ${({ $collapsed }) => $collapsed ? '60px' : '280px'};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.docked};
`;

const ToolPanel = styled.div<{ $collapsed?: boolean }>`
  width: 60px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  flex-shrink: 0;
`;

const SidePanel = styled.div<{ $collapsed?: boolean }>`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const RightSection = styled.div<{ $collapsed?: boolean }>`
  width: ${({ $collapsed }) => $collapsed ? '0px' : '320px'};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.docked};
`;

const BottomSection = styled.div`
  flex-shrink: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
`;

export const MainLayout: React.FC = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<'layers' | 'assets'>('layers');

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  const switchLeftPanel = (panel: 'layers' | 'assets') => {
    setActiveLeftPanel(panel);
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
    }
  };

  return (
    <LayoutContainer>
      {/* 顶部工具栏 */}
      <TopSection>
        <TopToolbar 
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          leftPanelCollapsed={leftPanelCollapsed}
          rightPanelCollapsed={rightPanelCollapsed}
        />
      </TopSection>

      {/* 主要内容区域 */}
      <MainSection>
        {/* 左侧区域 */}
        <LeftSection $collapsed={leftPanelCollapsed}>
          <ToolPanel>
            <LeftToolPanel 
              activePanel={activeLeftPanel}
              onSwitchPanel={switchLeftPanel}
            />
          </ToolPanel>
          
          <SidePanel $collapsed={leftPanelCollapsed}>
            {activeLeftPanel === 'layers' ? (
              <LayersPanel />
            ) : (
              <AssetsPanel />
            )}
          </SidePanel>
        </LeftSection>

        {/* 中央画布区域 */}
        <CenterSection>
          <CanvasWorkspace />
        </CenterSection>

        {/* 右侧属性面板 */}
        <RightSection $collapsed={rightPanelCollapsed}>
          <RightPropertiesPanel />
        </RightSection>
      </MainSection>

      {/* 底部状态栏 */}
      <BottomSection>
        <StatusBar />
      </BottomSection>
    </LayoutContainer>
  );
};