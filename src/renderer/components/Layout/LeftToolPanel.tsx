/**
 * 左侧工具面板 - Figma风格的工具选择面板
 * 包含设计工具和面板切换功能
 */

import React from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Tooltip } from '../../ui/components/Tooltip/Tooltip';

interface LeftToolPanelProps {
  activePanel: 'layers' | 'assets';
  onSwitchPanel: (panel: 'layers' | 'assets') => void;
}

const ToolPanelContainer = styled.div`
  width: 60px;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ToolSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ToolButton = styled(IconButton)<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'transparent'};
  
  &:hover {
    background: ${({ theme, $active }) => 
      $active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;

const PanelSwitcher = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LeftToolPanel: React.FC<LeftToolPanelProps> = ({
  activePanel,
  onSwitchPanel,
}) => {
  const [activeTool, setActiveTool] = React.useState<string>('select');

  const designTools = [
    { id: 'select', icon: '🔍', name: '选择工具', shortcut: 'V' },
    { id: 'text', icon: '📝', name: '文本工具', shortcut: 'T' },
    { id: 'image', icon: '🖼️', name: '图片工具', shortcut: 'I' },
    { id: 'shape', icon: '⬜', name: '形状工具', shortcut: 'R' },
    { id: 'brush', icon: '🖌️', name: '画笔工具', shortcut: 'B' },
    { id: 'crop', icon: '✂️', name: '裁剪工具', shortcut: 'C' },
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    console.log('Selected tool:', toolId);
  };

  return (
    <ToolPanelContainer>
      {/* 设计工具 */}
      <ToolSection>
        {designTools.map((tool) => (
          <Tooltip key={tool.id} content={`${tool.name} (${tool.shortcut})`} side="right">
            <ToolButton
              $active={activeTool === tool.id}
              icon={tool.icon}
              onClick={() => handleToolSelect(tool.id)}
            />
          </Tooltip>
        ))}
      </ToolSection>

      <SectionDivider />

      {/* 面板切换器 */}
      <PanelSwitcher>
        <Tooltip content="图层面板" side="right">
          <ToolButton
            $active={activePanel === 'layers'}
            icon="📋"
            onClick={() => onSwitchPanel('layers')}
          />
        </Tooltip>

        <Tooltip content="素材库" side="right">
          <ToolButton
            $active={activePanel === 'assets'}
            icon="🎨"
            onClick={() => onSwitchPanel('assets')}
          />
        </Tooltip>
      </PanelSwitcher>
    </ToolPanelContainer>
  );
};