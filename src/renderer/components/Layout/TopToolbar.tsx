/**
 * 顶部工具栏 - Figma风格的主工具栏
 * 包含文件操作、编辑操作、视图控制等功能
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Dropdown, type DropdownItem as DropdownItemType } from '../../ui/components/Dropdown/Dropdown';
// import { Badge } from '../../ui/components/Badge/Badge';
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

// 保留分隔符定义以备将来使用（当前未使用）
// const ToolbarDivider = styled.div`
//   width: 1px;
//   height: 24px;
//   background: ${({ theme }) => theme.colors.border.default};
//   margin: 0 ${({ theme }) => theme.spacing.sm};
// `;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  -webkit-app-region: no-drag;
`;

// const ProjectInfo = styled.div`
//   display: flex;
//   align-items: center;
//   gap: ${({ theme }) => theme.spacing.sm};
// `;

// const ProjectName = styled.span`
//   font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
//   color: ${({ theme }) => theme.colors.text.primary};
// `;

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

// 标签条样式
const TabsContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const TabsScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;
  &::-webkit-scrollbar { display: none; }
`;

const TabItem = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.border.default : theme.colors.border.subtle};
  background: ${({ theme, $active }) => $active ? theme.colors.surface : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-app-region: no-drag;

  &:hover { background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0,0,0,0.04)'}; }
`;

const TabTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabClose = styled.span`
  margin-left: 4px;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const NewTabButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border.subtle};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  -webkit-app-region: no-drag;
  &:hover { background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0,0,0,0.04)'}; }
`;

export const TopToolbar: React.FC<TopToolbarProps> = ({
  // onToggleLeftPanel,
  onToggleRightPanel,
  // leftPanelCollapsed,
  rightPanelCollapsed,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tabs, setTabs] = useState<Array<{ id: string; title: string; icon?: string }>>([
    { id: 'tab-1', title: '无标题' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const handleFileAction = (action: string) => {
    console.log('File action:', action);
  };

  const handleEditAction = (action: string) => {
    console.log('Edit action:', action);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleNewTab = useCallback(() => {
    const id = `tab-${Date.now()}`;
    setTabs(prev => [...prev, { id, title: '无标题' }]);
    setActiveTabId(id);
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (id === activeTabId && next.length > 0) {
        const newIndex = Math.max(0, Math.min(idx, next.length - 1));
        const newActive = next[newIndex]?.id || next[0]?.id || 'tab-1';
        setActiveTabId(newActive);
      }
      return next.length > 0 ? next : [{ id: 'tab-1', title: '无标题' }];
    });
  }, [activeTabId]);

  const handleActivateTab = useCallback((id: string) => setActiveTabId(id), []);

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
      {/* 左侧：主页按钮 */}
      <ToolbarSection>
        <NoDrag>
          <IconButton
            icon={<SvgIcon name="icon.24.home" size={20} title="主页" />}
            variant="ghost"
            size="sm"
            onClick={() => console.log('open home')}
            aria-label="主页"
            title="主页"
          />
        </NoDrag>
      </ToolbarSection>

      {/* 中央：标签栏 */}
      <CenterSection>
        <TabsContainer>
          <TabsScroll>
            {tabs.map(tab => (
              <TabItem key={tab.id} $active={tab.id === activeTabId} onClick={() => handleActivateTab(tab.id)} title={tab.title}>
                {tab.icon && <SvgIcon name={tab.icon} size={14} title="文件" />}
                <TabTitle>{tab.title}</TabTitle>
                <TabClose onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} title="关闭">×</TabClose>
              </TabItem>
            ))}
            <NewTabButton onClick={handleNewTab} aria-label="新建标签" title="新建标签">＋</NewTabButton>
          </TabsScroll>
        </TabsContainer>
      </CenterSection>

      {/* 右侧：视图控制和面板切换 */}
      <ToolbarSection>

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