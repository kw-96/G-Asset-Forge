import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 主布局组件 - 基于Figma风格的界面布局
 * 包含顶部工具栏、左侧工具面板、中央画布、右侧属性面板
 */
import { useState } from 'react';
import styled from 'styled-components';
import { TopToolbar } from './TopToolbar';
import { LeftToolPanel } from './LeftToolPanel';
import { CanvasWorkspace } from '../Canvas/CanvasWorkspace';
import { RightPropertiesPanel } from './RightPropertiesPanel';
import { StatusBar } from './StatusBar';
import { LayersPanel } from './LayersPanel';
import { AssetsPanel } from '../Assets/AssetsPanel';
const LayoutContainer = styled.div `
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;
const TopSection = styled.div `
  flex-shrink: 0;
  z-index: ${({ theme }) => theme.zIndex.banner};
`;
const MainSection = styled.div `
  display: flex;
  flex: 1;
  overflow: hidden;
`;
const LeftSection = styled.div `
  display: flex;
  flex-shrink: 0;
  width: ${({ $collapsed }) => $collapsed ? '60px' : '280px'};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  z-index: ${({ theme }) => theme.zIndex.docked};
`;
const ToolPanel = styled.div `
  width: 60px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  flex-shrink: 0;
`;
const SidePanel = styled.div `
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;
const CenterSection = styled.div `
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;
const RightSection = styled.div `
  width: ${({ $collapsed }) => $collapsed ? '0px' : '320px'};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  transition: width ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.docked};
`;
const BottomSection = styled.div `
  flex-shrink: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
`;
export const MainLayout = () => {
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
    const [activeLeftPanel, setActiveLeftPanel] = useState('layers');
    const toggleLeftPanel = () => {
        setLeftPanelCollapsed(!leftPanelCollapsed);
    };
    const toggleRightPanel = () => {
        setRightPanelCollapsed(!rightPanelCollapsed);
    };
    const switchLeftPanel = (panel) => {
        setActiveLeftPanel(panel);
        if (leftPanelCollapsed) {
            setLeftPanelCollapsed(false);
        }
    };
    return (_jsxs(LayoutContainer, { children: [_jsx(TopSection, { children: _jsx(TopToolbar, { onToggleLeftPanel: toggleLeftPanel, onToggleRightPanel: toggleRightPanel, leftPanelCollapsed: leftPanelCollapsed, rightPanelCollapsed: rightPanelCollapsed }) }), _jsxs(MainSection, { children: [_jsxs(LeftSection, { "$collapsed": leftPanelCollapsed, children: [_jsx(ToolPanel, { children: _jsx(LeftToolPanel, { activePanel: activeLeftPanel, onSwitchPanel: switchLeftPanel }) }), _jsx(SidePanel, { "$collapsed": leftPanelCollapsed, children: activeLeftPanel === 'layers' ? (_jsx(LayersPanel, {})) : (_jsx(AssetsPanel, {})) })] }), _jsx(CenterSection, { children: _jsx(CanvasWorkspace, {}) }), _jsx(RightSection, { "$collapsed": rightPanelCollapsed, children: _jsx(RightPropertiesPanel, {}) })] }), _jsx(BottomSection, { children: _jsx(StatusBar, {}) })] }));
};
//# sourceMappingURL=MainLayout.js.map