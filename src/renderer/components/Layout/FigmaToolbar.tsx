/**
 * Figma风格的主工具栏
 * 包含所有设计工具的快速访问按钮
 */

import React from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Tooltip } from '../../ui/components/Tooltip/Tooltip';

interface FigmaToolbarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
  className?: string;
}

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.interface.toolbar.light};
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
`;

const ToolButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary[500] : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : theme.colors.interaction.hover};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.interaction.focus};
    outline-offset: 2px;
  }
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  
  &:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 20px;
    background: ${({ theme }) => theme.colors.interface.divider.light};
    margin: 0 6px;
  }
`;

export const FigmaToolbar: React.FC<FigmaToolbarProps> = ({
  activeTool,
  onToolChange,
  className,
}) => {
  const toolGroups = [
    // 选择和移动工具
    {
      tools: [
        { id: 'select', icon: 'icon.24.select', name: '选择工具', shortcut: 'V' },
        { id: 'hand', icon: 'icon.24.hand.small', name: '抓手工具', shortcut: 'H' },
      ]
    },
    // 形状工具
    {
      tools: [
        { id: 'frame', icon: 'icon.24.frame.small', name: '框架工具', shortcut: 'F' },
        { id: 'rectangle', icon: 'icon.24.rectangle.small', name: '矩形工具', shortcut: 'R' },
        { id: 'ellipse', icon: 'icon.24.ellipse.small', name: '椭圆工具', shortcut: 'O' },
        { id: 'polygon', icon: 'icon.24.polygon.small', name: '多边形工具', shortcut: 'P' },
        { id: 'star', icon: 'icon.24.star.small', name: '星形工具', shortcut: 'S' },
        { id: 'line', icon: 'icon.24.line.small', name: '直线工具', shortcut: 'L' },
      ]
    },
    // 绘制工具
    {
      tools: [
        { id: 'pen', icon: 'icon.24.pen.small', name: '钢笔工具', shortcut: 'P' },
        { id: 'pencil', icon: 'icon.24.pencil.small', name: '铅笔工具', shortcut: 'Shift+P' },
      ]
    },
    // 内容工具
    {
      tools: [
        { id: 'text', icon: 'icon.24.text.small', name: '文本工具', shortcut: 'T' },
        { id: 'image', icon: 'icon.24.image.small', name: '图片工具', shortcut: 'Ctrl+Shift+K' },
      ]
    },
    // 其他工具
    {
      tools: [
        { id: 'slice', icon: 'icon.24.slice.small', name: '切片工具', shortcut: 'S' },
      ]
    }
  ];

  return (
    <ToolbarContainer className={className}>
      {toolGroups.map((group, groupIndex) => (
        <ToolGroup key={groupIndex}>
          {group.tools.map((tool) => (
            <Tooltip key={tool.id} content={`${tool.name} (${tool.shortcut})`} side="bottom">
              <ToolButton
                $active={activeTool === tool.id}
                onClick={() => onToolChange(tool.id)}
                aria-label={tool.name}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <SvgIcon name={tool.icon} size={16} title={tool.name} />
              </ToolButton>
            </Tooltip>
          ))}
        </ToolGroup>
      ))}
    </ToolbarContainer>
  );
};