/**
 * 左侧工具面板 - Figma风格的工具选择面板
 * 包含设计工具和面板切换功能
 */

import React from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Tooltip } from '../../ui/components/Tooltip/Tooltip';
import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { useUIIntegration } from '../UIIntegration/UIIntegrationProvider';
import { UIFeature } from '../UIIntegration/UIIntegrationProvider';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';

interface LeftToolPanelProps {
  activePanel: 'layers' | 'assets';
  onSwitchPanel: (panel: 'layers' | 'assets') => void;
  onTogglePanel: () => void;
  panelCollapsed: boolean;
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
  onTogglePanel,
  panelCollapsed,
}) => {
  const [activeTool, setActiveTool] = React.useState<string>('select');
  const { isFeatureEnabled } = useUIIntegration();

  const designTools = [
    { id: 'select', icon: <SvgIcon name="icon.16.arrow" size={16} title="选择" />, name: '选择工具', shortcut: 'V' },
    { id: 'text', icon: <SvgIcon name="icon.16.text" size={16} title="文本" />, name: '文本工具', shortcut: 'T' },
    { id: 'image', icon: <SvgIcon name="icon.16.image" size={16} title="图片" />, name: '图片工具', shortcut: 'I' },
    { id: 'shape', icon: <SvgIcon name="icon.16.rectangle" size={16} title="形状" />, name: '形状工具', shortcut: 'R' },
    { id: 'brush', icon: <SvgIcon name="icon.16.pen" size={16} title="画笔" />, name: '画笔工具', shortcut: 'B' },
    { id: 'crop', icon: <SvgIcon name="icon.24.crop.small" size={16} title="裁剪" />, name: '裁剪工具', shortcut: 'C' },
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    console.log('Selected tool:', toolId);
  };

  return (
    <ToolPanelContainer>
      {/* 设计工具 */}
      <ToolSection>
        {designTools.map((tool) => 
          isFeatureEnabled(UIFeature.INTERACTIVE_COMPONENTS) ? (
            <EnhancedIconButton
              key={tool.id}
              icon={tool.icon}
              onClick={() => handleToolSelect(tool.id)}
              enableFigmaInteractions={true}
              enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
              tooltipContent={`${tool.name} (${tool.shortcut})`}
              tooltipPlacement="right"
              enableKeyboardShortcut={isFeatureEnabled(UIFeature.ACCESSIBILITY)}
              keyboardShortcut={tool.shortcut}
              variant={activeTool === tool.id ? 'primary' : 'ghost'}
              interactionVariant="tool"
              aria-label={tool.name}
              style={{
                width: '44px',
                height: '44px',
                background: activeTool === tool.id ? 'var(--color-primary)' : 'transparent',
                color: activeTool === tool.id ? 'white' : 'var(--color-text-primary)',
                border: `1px solid ${activeTool === tool.id ? 'var(--color-primary)' : 'transparent'}`
              }}
            />
          ) : (
            <Tooltip key={tool.id} content={`${tool.name} (${tool.shortcut})`} side="right">
              <ToolButton
                $active={activeTool === tool.id}
                icon={tool.icon}
                onClick={() => handleToolSelect(tool.id)}
              />
            </Tooltip>
          )
        )}
      </ToolSection>

      <SectionDivider />

      {/* 面板切换器 */}
      <PanelSwitcher>
        {isFeatureEnabled(UIFeature.INTERACTIVE_COMPONENTS) ? (
          <>
            <EnhancedIconButton
              icon={<SvgIcon name={panelCollapsed ? 'icon.16.chevron.right' : 'icon.16.chevron.right'} size={16} title={panelCollapsed ? '展开' : '折叠'} />}
              onClick={onTogglePanel}
              enableFigmaInteractions={true}
              enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
              tooltipContent={panelCollapsed ? "展开面板" : "折叠面板"}
              tooltipPlacement="right"
              interactionVariant="tool"
              aria-label={panelCollapsed ? "展开面板" : "折叠面板"}
              style={{ width: '44px', height: '44px' }}
            />

            <EnhancedIconButton
              icon={<SvgIcon name="icon.16.frame" size={16} title="图层" />}
              onClick={() => onSwitchPanel('layers')}
              enableFigmaInteractions={true}
              enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
              tooltipContent="图层面板"
              tooltipPlacement="right"
              variant={activePanel === 'layers' ? 'primary' : 'ghost'}
              interactionVariant="tool"
              aria-label="图层面板"
              style={{
                width: '44px',
                height: '44px',
                background: activePanel === 'layers' ? 'var(--color-primary)' : 'transparent',
                color: activePanel === 'layers' ? 'white' : 'var(--color-text-primary)'
              }}
            />

            <EnhancedIconButton
              icon={<SvgIcon name="icon.16.library" size={16} title="素材库" />}
              onClick={() => onSwitchPanel('assets')}
              enableFigmaInteractions={true}
              enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
              tooltipContent="素材库"
              tooltipPlacement="right"
              variant={activePanel === 'assets' ? 'primary' : 'ghost'}
              interactionVariant="tool"
              aria-label="素材库"
              style={{
                width: '44px',
                height: '44px',
                background: activePanel === 'assets' ? 'var(--color-primary)' : 'transparent',
                color: activePanel === 'assets' ? 'white' : 'var(--color-text-primary)'
              }}
            />
          </>
        ) : (
          <>
            <Tooltip content={panelCollapsed ? "展开面板" : "折叠面板"} side="right">
              <ToolButton
                icon={panelCollapsed ? "▶️" : "◀️"}
                onClick={onTogglePanel}
              />
            </Tooltip>

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
          </>
        )}
      </PanelSwitcher>
    </ToolPanelContainer>
  );
};