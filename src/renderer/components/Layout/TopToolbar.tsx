/**
 * 顶部工具栏 - Figma风格的主工具栏
 * 包含文件操作、编辑操作、视图控制等功能
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/components/Button/Button';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Dropdown, DropdownItem } from '../../ui/components/Dropdown/Dropdown';
import { Badge } from '../../ui/components/Badge/Badge';
import { SettingsModal } from '../Settings/SettingsModal';
import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { WindowControls } from './WindowControls';

interface TopToolbarProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
}

const ToolbarContainer = styled.div`
  height: 48px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.sm};
  -webkit-app-region: drag;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  -webkit-app-region: no-drag;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProjectName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NoDrag = styled.div`
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
`;

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onToggleLeftPanel,
  onToggleRightPanel,
  leftPanelCollapsed,
  rightPanelCollapsed,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleFileAction = (action: string) => {
    console.log('File action:', action);
  };

  const handleEditAction = (action: string) => {
    console.log('Edit action:', action);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
    <ToolbarContainer>
      {/* 左侧：面板切换 + 文件/编辑菜单 */}
      <ToolbarSection>
        <NoDrag>
          <EnhancedIconButton
            icon={leftPanelCollapsed ? '▶' : '◀'}
            onClick={() => onToggleLeftPanel?.()}
            enableTooltip={true}
            tooltipContent={leftPanelCollapsed ? '显示左侧面板' : '隐藏左侧面板'}
            enableKeyboardShortcut={true}
            keyboardShortcut="Ctrl+1"
            aria-label="切换左侧面板"
          />
        </NoDrag>

        <NoDrag>
          <Dropdown trigger={<Button variant="ghost" size="sm">文件</Button>}>
          <DropdownItem onSelect={() => handleFileAction('new')}>
            新建项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('open')}>
            打开项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('save')}>
            保存项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('export')}>
            导出图像
          </DropdownItem>
          </Dropdown>
        </NoDrag>

        <NoDrag>
          <Dropdown trigger={<Button variant="ghost" size="sm">编辑</Button>}>
          <DropdownItem onSelect={() => handleEditAction('undo')}>
            撤销
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('redo')}>
            重做
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('copy')}>
            复制
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('paste')}>
            粘贴
          </DropdownItem>
          </Dropdown>
        </NoDrag>

        <ToolbarDivider />

      </ToolbarSection>

      {/* 中央：项目信息和缩放控制 */}
      <CenterSection>
        <ProjectInfo>
          <ProjectName>未命名项目</ProjectName>
          <Badge variant="success" size="sm"></Badge>
        </ProjectInfo>
      </CenterSection>

      {/* 右侧：视图控制和面板切换 */}
      <ToolbarSection>
        <NoDrag>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<SvgIcon name="icon.24.design" size={16} title="设计模式" />}
            onClick={() => console.log('Switch to design mode')}
          />
        </NoDrag>

        <NoDrag>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<SvgIcon name="icon.24.mobile" size={16} title="H5模式" />}
            onClick={() => console.log('Switch to H5 mode')}
          />
        </NoDrag>

        <ToolbarDivider />

        <NoDrag>
          <EnhancedIconButton
            icon={<SvgIcon name="icon.24.settings" size={16} title="设置" />}
            onClick={handleSettingsClick}
            enableFigmaInteractions={true}
            enableTooltip={true}
            tooltipContent="打开设置 (Ctrl+,)"
            enableKeyboardShortcut={true}
            keyboardShortcut="Ctrl+,"
            aria-label="打开设置"
          />
        </NoDrag>

        <NoDrag>
          <Dropdown trigger={<IconButton variant="ghost" size="sm" icon={<SvgIcon name="icon.16.more" size={16} title="更多" />} />}>
          <DropdownItem>❓ 帮助</DropdownItem>
          <DropdownItem>ℹ️ 关于</DropdownItem>
          </Dropdown>
        </NoDrag>

        <NoDrag>
          <EnhancedIconButton
            icon={rightPanelCollapsed ? '◀' : '▶'}
            onClick={() => onToggleRightPanel?.()}
            enableTooltip={true}
            tooltipContent={rightPanelCollapsed ? '显示右侧面板' : '隐藏右侧面板'}
            enableKeyboardShortcut={true}
            keyboardShortcut="Ctrl+2"
            aria-label="切换右侧面板"
          />
        </NoDrag>

        {/* 窗口控制按钮 */}
        <WindowControls />
      </ToolbarSection>
    </ToolbarContainer>

    {/* 设置模态框 */}
    <SettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
    />
    </>
  );
};