import React from 'react';
import styled from 'styled-components';
import { IconButton, Button, Tooltip } from '../../ui';
import { useAppStore } from '../../stores/appStore';
import { useTheme } from '../../ui/theme/ThemeProvider';
import {
  HamburgerMenuIcon,
  Share1Icon,
  PlayIcon,
  PersonIcon,
  Cross2Icon,
  MinusIcon,
  SquareIcon,
  MoonIcon,
  SunIcon
} from '@radix-ui/react-icons';


const TitleBar = styled.div`
  height: 28px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
`;

const FileTabsArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing.sm};
  -webkit-app-region: no-drag;
`;

const FileTab = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 28px;
  background: ${({ $active, theme }) => $active ? theme.colors.surface : 'transparent'};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const WindowControls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
`;

const WindowControlButton = styled.button`
  width: 46px;
  height: 28px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.border.hover};
  }
  
  &:last-child:hover {
    background: #e81123;
    color: white;
  }
`;

const MainToolbar = styled.header`
  height: 40px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ToolbarCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ToolSeparator = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

const ShareButton = styled(Button)`
  background: #0066ff;
  color: white;
  font-weight: 500;
  
  &:hover {
    background: #0052cc;
  }
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Header: React.FC = () => {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed
  } = useAppStore();

  const { mode, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* 窗口标题栏 */}
      <TitleBar>
        <FileTabsArea>
          <FileTab $active={true}>
            <span>无标题</span>
            <IconButton
              icon={<Cross2Icon />}
              variant="ghost"
              size="xs"
            />
          </FileTab>
        </FileTabsArea>
        
        <WindowControls>
          <WindowControlButton>
            <MinusIcon />
          </WindowControlButton>
          <WindowControlButton>
            <SquareIcon />
          </WindowControlButton>
          <WindowControlButton>
            <Cross2Icon />
          </WindowControlButton>
        </WindowControls>
      </TitleBar>

      {/* 主工具栏 */}
      <MainToolbar>
        <ToolbarLeft>
          <Tooltip content="菜单">
            <IconButton
              icon={<HamburgerMenuIcon />}
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
            />
          </Tooltip>
        </ToolbarLeft>

        <ToolbarCenter>
          <Tooltip content="移动工具 (V)">
            <IconButton
              icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1L9 4H7V8H5V4H3L6 1Z" />
                <path d="M1 6L4 9V7H8V5H4V3L1 6Z" />
              </svg>}
              variant="ghost"
              size="sm"
            />
          </Tooltip>
          
          <Tooltip content="缩放工具 (Z)">
            <IconButton
              icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M8 8L11 11V7H8V5H4V3L1 6Z" />
              </svg>}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          <ToolSeparator />

          <Tooltip content="对齐左侧">
            <IconButton
              icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1 2H11V3H1V2Z M1 5H8V6H3V5Z M1 8H11V9H1V8Z" />
              </svg>}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          <Tooltip content="水平居中">
            <IconButton
              icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 2H10V3H2V2Z M3 5H9V6H3V5Z M2 8H10V9H2V8Z" />
              </svg>}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          <Tooltip content="对齐右侧">
            <IconButton
              icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1 2H11V3H1V2Z M4 5H11V6H4V5Z M1 8H11V9H1V8Z" />
              </svg>}
              variant="ghost"
              size="sm"
            />
          </Tooltip>
        </ToolbarCenter>

        <ToolbarRight>
          <Tooltip content="演示">
            <IconButton
              icon={<PlayIcon />}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          <Tooltip content={mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
            <IconButton
              icon={mode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          <ShareButton size="sm" icon={<Share1Icon />}>
            分享
          </ShareButton>

          <UserAvatar>
            <PersonIcon style={{ width: 12, height: 12 }} />
          </UserAvatar>
        </ToolbarRight>
      </MainToolbar>
    </>
  );
};

export default Header;