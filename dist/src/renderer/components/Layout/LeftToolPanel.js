import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 左侧工具面板 - Figma风格的工具选择面板
 * 包含设计工具和面板切换功能
 */
import React from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Tooltip } from '../../ui/components/Tooltip/Tooltip';
const ToolPanelContainer = styled.div `
  width: 60px;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  gap: ${({ theme }) => theme.spacing.xs};
`;
const ToolSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;
const SectionDivider = styled.div `
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;
const ToolButton = styled(IconButton) `
  width: 44px;
  height: 44px;
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  
  &:hover {
    background: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;
const PanelSwitcher = styled.div `
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;
export const LeftToolPanel = ({ activePanel, onSwitchPanel, }) => {
    const [activeTool, setActiveTool] = React.useState('select');
    const designTools = [
        { id: 'select', icon: '🔍', name: '选择工具', shortcut: 'V' },
        { id: 'text', icon: '📝', name: '文本工具', shortcut: 'T' },
        { id: 'image', icon: '🖼️', name: '图片工具', shortcut: 'I' },
        { id: 'shape', icon: '⬜', name: '形状工具', shortcut: 'R' },
        { id: 'brush', icon: '🖌️', name: '画笔工具', shortcut: 'B' },
        { id: 'crop', icon: '✂️', name: '裁剪工具', shortcut: 'C' },
    ];
    const handleToolSelect = (toolId) => {
        setActiveTool(toolId);
        console.log('Selected tool:', toolId);
    };
    return (_jsxs(ToolPanelContainer, { children: [_jsx(ToolSection, { children: designTools.map((tool) => (_jsx(Tooltip, { content: `${tool.name} (${tool.shortcut})`, side: "right", children: _jsx(ToolButton, { "$active": activeTool === tool.id, icon: tool.icon, onClick: () => handleToolSelect(tool.id) }) }, tool.id))) }), _jsx(SectionDivider, {}), _jsxs(PanelSwitcher, { children: [_jsx(Tooltip, { content: "\u56FE\u5C42\u9762\u677F", side: "right", children: _jsx(ToolButton, { "$active": activePanel === 'layers', icon: "\uD83D\uDCCB", onClick: () => onSwitchPanel('layers') }) }), _jsx(Tooltip, { content: "\u7D20\u6750\u5E93", side: "right", children: _jsx(ToolButton, { "$active": activePanel === 'assets', icon: "\uD83C\uDFA8", onClick: () => onSwitchPanel('assets') }) })] })] }));
};
//# sourceMappingURL=LeftToolPanel.js.map