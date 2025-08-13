/**
 * 顶部工具栏 - Figma风格的主工具栏
 * 包含文件操作、编辑操作、视图控制等功能
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/components/Button/Button';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Dropdown, type DropdownItem as DropdownItemType } from '../../ui/components/Dropdown/Dropdown';
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

// 统一菜单触发按钮（图标按钮），放在窗口控制组件左侧
const MenuTriggerButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  padding: 0;
  -webkit-app-region: no-drag;

  &:hover {
    background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0,0,0,0.04)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const TopToolbar: React.FC<TopToolbarProps> = ({
  // onToggleLeftPanel,
  onToggleRightPanel,
  // leftPanelCollapsed,
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

  // 统一下拉菜单条目（文件/编辑/设置/帮助关于）
  const unifiedMenuItems: DropdownItemType[] = [
    // 文件
    { id: 'file__new', label: '新建项目', icon: <SvgIcon name="icon.24.file.design" size={16} title="新建项目" />, group: '文件', shortcut: 'Ctrl+N', onSelect: () => handleFileAction('new') },
    { id: 'file__open', label: '打开项目', icon: <SvgIcon name="icon.24.open.session" size={16} title="打开项目" />, group: '文件', shortcut: 'Ctrl+O', onSelect: () => handleFileAction('open') },
    { id: 'file__save', label: '保存项目', icon: <SvgIcon name="icon.24.save" size={16} title="保存项目" />, group: '文件', shortcut: 'Ctrl+S', onSelect: () => handleFileAction('save') },
    { id: 'file__export', label: '导出图像', icon: <SvgIcon name="icon.24.export" size={16} title="导出图像" />, group: '文件', shortcut: 'Ctrl+E', onSelect: () => handleFileAction('export') },

    // 编辑
    { id: 'edit__undo', label: '撤销', icon: <SvgIcon name="icon.24.return" size={16} title="撤销" />, group: '编辑', shortcut: 'Ctrl+Z', onSelect: () => handleEditAction('undo') },
    { id: 'edit__redo', label: '重做', icon: <SvgIcon name="icon.24.forward" size={16} title="重做" />, group: '编辑', shortcut: 'Ctrl+Shift+Z', onSelect: () => handleEditAction('redo') },
    { id: 'edit__copy', label: '复制', icon: <SvgIcon name="icon.24.copy" size={16} title="复制" />, group: '编辑', shortcut: 'Ctrl+C', onSelect: () => handleEditAction('copy') },
    { id: 'edit__paste', label: '粘贴', icon: <SvgIcon name="icon.24.paste" size={16} title="粘贴" />, group: '编辑', shortcut: 'Ctrl+V', onSelect: () => handleEditAction('paste') },

    // 系统
    { id: 'settings__open', label: '设置', icon: <SvgIcon name="icon.24.settings" size={16} title="设置" />, group: '系统', shortcut: 'Ctrl+,', onSelect: () => handleSettingsClick() },
    { id: 'help__docs', label: '帮助', icon: <SvgIcon name="icon.24.info" size={16} title="帮助" />, group: '系统', onSelect: () => console.log('open help') },
    { id: 'about__app', label: '关于', icon: <SvgIcon name="icon.24.info" size={16} title="关于" />, group: '系统', onSelect: () => console.log('open about') },
  ];

  return (
    <>
    <ToolbarContainer>
      {/* 左侧：面板切换（文件/编辑已合并至右侧统一菜单） */}
      <ToolbarSection>
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

        {/* 统一下拉菜单按钮（窗口控制左侧） */}
        <NoDrag>
          <Dropdown
            mode="enhanced"
            trigger={
              <MenuTriggerButton aria-label="应用菜单" title="应用菜单">
                <SvgIcon name="icon.24.more" size={16} title="菜单" />
              </MenuTriggerButton>
            }
            items={unifiedMenuItems}
            placement="bottom-end"
          />
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