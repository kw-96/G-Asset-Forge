import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '../../ui';
import useToolSwitch from '../../hooks/useToolSwitch';
import {
  CursorArrowIcon,
  HandIcon,
  SquareIcon,
  CircleIcon,
  TextIcon,
  FrameIcon,
  Pencil1Icon,
  ImageIcon,
  StarIcon,
  TriangleRightIcon,
  CropIcon
} from '@radix-ui/react-icons';
import { TOOL_SHORTCUTS } from '../../tools/toolConfig';

// Figma风格的悬浮工具栏容器
const FloatingToolbarContainer = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    bottom: 16px;
    padding: 6px;
    gap: 2px;
  }
`;

// 工具分组分隔符
const ToolSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 4px;
`;

// 工具按钮样式
const ToolButton = styled(IconButton)<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $active }) => $active ? '#667eea' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#5a67d8' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// 工具组定义
const toolGroups = [
  {
    name: 'selection',
    tools: [
      { id: 'select', icon: CursorArrowIcon, label: '选择工具', shortcut: TOOL_SHORTCUTS.select },
      { id: 'hand', icon: HandIcon, label: '抓手工具', shortcut: TOOL_SHORTCUTS.hand },
    ]
  },
  {
    name: 'shapes',
    tools: [
      { id: 'rectangle', icon: SquareIcon, label: '矩形工具', shortcut: TOOL_SHORTCUTS.rectangle },
      { id: 'ellipse', icon: CircleIcon, label: '椭圆工具', shortcut: TOOL_SHORTCUTS.ellipse },
      { id: 'triangle', icon: TriangleRightIcon, label: '三角形工具', shortcut: TOOL_SHORTCUTS.triangle },
      { id: 'star', icon: StarIcon, label: '星形工具', shortcut: TOOL_SHORTCUTS.star },
    ]
  },
  {
    name: 'content',
    tools: [
      { id: 'text', icon: TextIcon, label: '文本工具', shortcut: TOOL_SHORTCUTS.text },
      { id: 'image', icon: ImageIcon, label: '图片工具', shortcut: TOOL_SHORTCUTS.image },
      { id: 'frame', icon: FrameIcon, label: '框架工具', shortcut: TOOL_SHORTCUTS.frame },
    ]
  },
  {
    name: 'drawing',
    tools: [
      { id: 'brush', icon: Pencil1Icon, label: '画笔工具', shortcut: TOOL_SHORTCUTS.brush },
      { id: 'crop', icon: CropIcon, label: '裁剪工具', shortcut: TOOL_SHORTCUTS.crop },
    ]
  }
];

interface FloatingToolbarProps {
  className?: string;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ className }) => {
  const { activeTool, switchTool } = useToolSwitch();

  const handleToolClick = (toolId: string) => {
    switchTool(toolId);
  };

  return (
    <FloatingToolbarContainer className={className}>
      {toolGroups.map((group, groupIndex) => (
        <React.Fragment key={group.name}>
          {group.tools.map((tool) => (
            <Tooltip key={tool.id} content={`${tool.label} (${tool.shortcut})`}>
              <ToolButton
                icon={<tool.icon />}
                onClick={() => handleToolClick(tool.id)}
                $active={activeTool === tool.id}
                variant="ghost"
                size="sm"
                aria-label={tool.label}
              />
            </Tooltip>
          ))}
          {groupIndex < toolGroups.length - 1 && <ToolSeparator />}
        </React.Fragment>
      ))}
    </FloatingToolbarContainer>
  );
};

export default FloatingToolbar;