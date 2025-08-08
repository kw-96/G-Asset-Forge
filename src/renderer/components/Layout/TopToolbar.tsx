/**
 * 顶部工具栏 - Figma风格的主工具栏
 * 包含文件操作、编辑操作、视图控制等功能
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/components/Button/Button';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Dropdown, DropdownItem } from '../../ui/components/Dropdown/Dropdown';
import { Badge } from '../../ui/components/Badge/Badge';

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
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-right: ${({ theme }) => theme.spacing.lg};
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: 16px;
`;

const AppName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
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

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
`;

const ZoomValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
  text-align: center;
`;

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onToggleLeftPanel,
  onToggleRightPanel,
  leftPanelCollapsed,
  rightPanelCollapsed,
}) => {
  const handleFileAction = (action: string) => {
    console.log('File action:', action);
  };

  const handleEditAction = (action: string) => {
    console.log('Edit action:', action);
  };

  const handleZoomChange = (delta: number) => {
    console.log('Zoom change:', delta);
  };

  return (
    <ToolbarContainer>
      {/* 左侧：应用标识和文件操作 */}
      <ToolbarSection>
        <AppLogo>
          <LogoIcon>G</LogoIcon>
          <AppName>G-Asset Forge</AppName>
        </AppLogo>

        <Dropdown trigger={<Button variant="ghost" size="sm">文件</Button>}>
          <DropdownItem onSelect={() => handleFileAction('new')}>
            🆕 新建项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('open')}>
            📁 打开项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('save')}>
            💾 保存项目
          </DropdownItem>
          <DropdownItem onSelect={() => handleFileAction('export')}>
            📤 导出图像
          </DropdownItem>
        </Dropdown>

        <Dropdown trigger={<Button variant="ghost" size="sm">编辑</Button>}>
          <DropdownItem onSelect={() => handleEditAction('undo')}>
            ↶ 撤销
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('redo')}>
            ↷ 重做
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('copy')}>
            📋 复制
          </DropdownItem>
          <DropdownItem onSelect={() => handleEditAction('paste')}>
            📄 粘贴
          </DropdownItem>
        </Dropdown>

        <ToolbarDivider />

        <IconButton
          variant="ghost"
          size="sm"
          icon={leftPanelCollapsed ? '▶️' : '◀️'}
          onClick={onToggleLeftPanel}
        />
      </ToolbarSection>

      {/* 中央：项目信息和缩放控制 */}
      <CenterSection>
        <ProjectInfo>
          <ProjectName>未命名项目</ProjectName>
          <Badge variant="success" size="sm">已保存</Badge>
        </ProjectInfo>

        <ZoomControl>
          <IconButton
            variant="ghost"
            size="xs"
            icon="➖"
            onClick={() => handleZoomChange(-10)}
          />
          <ZoomValue>100%</ZoomValue>
          <IconButton
            variant="ghost"
            size="xs"
            icon="➕"
            onClick={() => handleZoomChange(10)}
          />
        </ZoomControl>
      </CenterSection>

      {/* 右侧：视图控制和面板切换 */}
      <ToolbarSection>
        <IconButton
          variant="ghost"
          size="sm"
          icon="🎨"
          onClick={() => console.log('Switch to design mode')}
        />

        <IconButton
          variant="ghost"
          size="sm"
          icon="📱"
          onClick={() => console.log('Switch to H5 mode')}
        />

        <ToolbarDivider />

        <IconButton
          variant="ghost"
          size="sm"
          icon={rightPanelCollapsed ? '◀️' : '▶️'}
          onClick={onToggleRightPanel}
        />

        <Dropdown trigger={<IconButton variant="ghost" size="sm" icon="⚙️" />}>
          <DropdownItem>🌙 切换主题</DropdownItem>
          <DropdownItem>🔧 偏好设置</DropdownItem>
          <DropdownItem>❓ 帮助</DropdownItem>
          <DropdownItem>ℹ️ 关于</DropdownItem>
        </Dropdown>
      </ToolbarSection>
    </ToolbarContainer>
  );
};