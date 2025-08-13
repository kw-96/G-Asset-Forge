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
// import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { WindowControls } from './WindowControls';
import { useAppStore } from '../../stores/appStore';

// 简单创建空项目的辅助方法（与 ProjectManager 对齐的最小结构）
const createEmptyProject = (name: string) => ({
  metadata: {
    id: `project_${Date.now()}`,
    name,
    description: '',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [] as string[],
  },
  settings: {
    canvas: { width: 800, height: 600, backgroundColor: '#ffffff', gridEnabled: true, gridSize: 20, snapToGrid: false, rulers: true },
    tools: { defaultTool: 'select', brushSize: 5, brushOpacity: 1, textFont: 'Arial', textSize: 16, textColor: '#000000' },
    export: { format: 'png', quality: 90, scale: 1, transparent: false },
    custom: {} as Record<string, any>
  },
  canvas: { objects: [] as any[], layers: [] as any[], history: [] as any[] },
  assets: { used: [] as string[], embedded: [] as any[] },
  version: { appVersion: '1.0.0', fileVersion: '1.0', compatibility: ['1.0'] }
});

interface TopToolbarProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
}

const ToolbarContainer = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
`;

const ToolbarSection = styled.div<{ $leftDivider?: boolean; $rightDivider?: boolean; $noGap?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $noGap, theme }) => ($noGap ? '0' : theme.spacing.sm)};
  -webkit-app-region: no-drag;
  ${({ $leftDivider, theme }) => $leftDivider ? `
    border-left: 1px solid ${theme.colors.border.default};
  ` : ''}
  ${({ $rightDivider, theme }) => $rightDivider ? `
    border-right: 1px solid ${theme.colors.border.default};
    padding: 0 12px;
  ` : ''}
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
  -webkit-app-region: drag;
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
  
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 12px;
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
  -webkit-app-region: drag;
`;

const TabsScroll = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;
  &::-webkit-scrollbar { display: none; }
  -webkit-app-region: drag;
`;

const TabItem = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  height: 100%;
  padding: 12px;
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
  // onToggleRightPanel,
  // leftPanelCollapsed,
  // rightPanelCollapsed,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 兼容旧 store：若不存在 setCurrentProject 则提供空函数
  const store = useAppStore as any;
  const setCurrentProject = (store && store.getState && store.getState().setCurrentProject)
    ? (store.getState().setCurrentProject as (p: any) => void)
    : ((_: any) => {});
  const [tabs, setTabs] = useState<Array<{ id: string; title: string; icon?: string; project?: any }>>([
    { id: 'tab-1', title: '无标题', project: createEmptyProject('无标题') },
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
    const project = createEmptyProject('无标题');
    setTabs(prev => [...prev, { id, title: project.metadata.name, project }]);
    setActiveTabId(id);
    try { setCurrentProject(project); } catch {}
  }, [setCurrentProject]);

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
  
  // 同步当前项目到全局store
  React.useEffect(() => {
    const active = tabs.find(t => t.id === activeTabId);
    if (active?.project) {
      try { setCurrentProject(active.project); } catch {}
    }
  }, [activeTabId, tabs, setCurrentProject]);

  // 统一下拉菜单条目（文件/编辑/设置/帮助关于）
  const unifiedMenuItems: DropdownItemType[] = [
    // 文件
    { id: 'file__new', label: '新建项目', group: '文件', shortcut: 'Ctrl+N', onSelect: () => handleFileAction('new') },
    { id: 'file__open', label: '打开项目', group: '文件', shortcut: 'Ctrl+O', onSelect: () => handleFileAction('open') },
    { id: 'file__save', label: '保存项目', group: '文件', shortcut: 'Ctrl+S', onSelect: () => handleFileAction('save') },
    { id: 'file__export', label: '导出图像', group: '文件', shortcut: 'Ctrl+E', onSelect: () => handleFileAction('export') },

    // 编辑
    { id: 'edit__undo', label: '撤销', group: '编辑', shortcut: 'Ctrl+Z', onSelect: () => handleEditAction('undo') },
    { id: 'edit__redo', label: '重做', group: '编辑', shortcut: 'Ctrl+Shift+Z', onSelect: () => handleEditAction('redo') },
    { id: 'edit__copy', label: '复制', group: '编辑', shortcut: 'Ctrl+C', onSelect: () => handleEditAction('copy') },
    { id: 'edit__paste', label: '粘贴', group: '编辑', shortcut: 'Ctrl+V', onSelect: () => handleEditAction('paste') },

    // 系统
    { id: 'settings__open', label: '设置', group: '系统', shortcut: 'Ctrl+,', onSelect: () => handleSettingsClick() },
    { id: 'help__docs', label: '帮助', group: '系统', onSelect: () => console.log('open help') },
    { id: 'about__app', label: '关于', group: '系统', onSelect: () => console.log('open about') },
  ];

  return (
    <>
    <ToolbarContainer>
      {/* 左侧：主页按钮 */}
      <ToolbarSection $rightDivider>
        <NoDrag>
          <IconButton
            icon={<SvgIcon name="icon.24.home" size={20} title="主页" />}
            variant="ghost"
            onClick={() => console.log('open home')}
            aria-label="主页"
            title="主页"
            style={{ height: '100%', width: '100%' }}
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

      {/* 右侧：菜单与窗口控制（无间隔） */}
      <ToolbarSection $leftDivider $noGap>

        {/* 统一下拉菜单按钮（窗口控制左侧） */}
        <NoDrag>
          <Dropdown
            mode="enhanced"
            trigger={
              <MenuTriggerButton aria-label="应用菜单" title="应用菜单">
                <SvgIcon name="icon.24.more" size={20} title="菜单" />
              </MenuTriggerButton>
            }
            items={unifiedMenuItems}
            placement="bottom-end"
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