import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '../../ui';
import { useAppStore } from '../../stores/appStore';
import {
  CursorArrowIcon,
  HandIcon,
  FrameIcon,
  BoxIcon,
  CircleIcon,
  TriangleUpIcon,
  Pencil1Icon,
  TextIcon,
  ImageIcon,
  Component1Icon
} from '@radix-ui/react-icons';

const ToolbarContainer = styled.div<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => $collapsed ? '0px' : '48px'};
  min-width: ${({ $collapsed }) => $collapsed ? '0px' : '48px'};
  height: calc(100vh - 68px);
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  gap: 2px;
  transition: all 0.2s ease;
  overflow: hidden;
`;

const ToolButton = styled(IconButton)<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'transparent'
  };
  color: ${({ $active, theme }) => 
    $active ? 'white' : theme.colors.text.primary
  };
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary : theme.colors.border.hover
    };
  }
`;

const ToolSeparator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

interface ToolbarProps {
  collapsed: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ collapsed }) => {
  const { activeTool, setActiveTool } = useAppStore();

  const tools = [
    { id: 'select', icon: CursorArrowIcon, tooltip: '选择工具 (V)', hotkey: 'V' },
    { id: 'hand', icon: HandIcon, tooltip: '抓手工具 (H)', hotkey: 'H' },
    { id: 'frame', icon: FrameIcon, tooltip: '框架工具 (F)', hotkey: 'F' },
    { id: 'rectangle', icon: BoxIcon, tooltip: '矩形 (R)', hotkey: 'R' },
    { id: 'ellipse', icon: CircleIcon, tooltip: '椭圆 (O)', hotkey: 'O' },
    { id: 'polygon', icon: TriangleUpIcon, tooltip: '多边形', hotkey: '' },
    { id: 'pen', icon: Pencil1Icon, tooltip: '钢笔工具 (P)', hotkey: 'P' },
    { id: 'text', icon: TextIcon, tooltip: '文本 (T)', hotkey: 'T' },
    { id: 'image', icon: ImageIcon, tooltip: '图片', hotkey: '' },
    { id: 'component', icon: Component1Icon, tooltip: '组件', hotkey: '' }
  ];

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
    console.log(`Tool selected: ${toolId}`);
    
    // 如果是创建工具，给用户一些反馈
    if (['rectangle', 'ellipse', 'text', 'frame'].includes(toolId)) {
      console.log(`${toolId} tool activated - click and drag on canvas to create`);
    }
  };

  // 添加键盘快捷键支持
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只有在没有输入框聚焦时才处理快捷键
      if (document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        const tool = tools.find(t => t.hotkey.toLowerCase() === e.key.toLowerCase());
        if (tool) {
          e.preventDefault();
          setActiveTool(tool.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tools, setActiveTool]);

  if (collapsed) {
    return <ToolbarContainer $collapsed={true} />;
  }

  return (
    <ToolbarContainer $collapsed={false}>
      {tools.map((tool, index) => (
        <React.Fragment key={tool.id}>
          <Tooltip content={tool.tooltip} side="right">
            <ToolButton
              icon={<tool.icon />}
              onClick={() => handleToolClick(tool.id)}
              $active={activeTool === tool.id}
              variant="ghost"
              size="sm"
            />
          </Tooltip>
          {/* 在某些工具之间添加分隔符 */}
          {(index === 1 || index === 6) && <ToolSeparator />}
        </React.Fragment>
      ))}
    </ToolbarContainer>
  );
};

export default Toolbar;