/**
 * Figma风格的主工具栏 - 集成Suika引擎工具系统
 * @description 基于Suika引擎的工具系统，提供完整的设计工具集成，保持Figma风格界面
 * @author 开发团队
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useCanvasStore } from '../../../stores/canvasStore';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';

// 工具分类配置
const TOOL_CATEGORIES = [
  {
    id: 'navigation',
    name: '移动工具',
    defaultTool: 'select',
    tools: [
      { id: 'select', name: '移动', hotkey: 'V', icon: 'icon.24.move' },
      { id: 'dragCanvas', name: '抓手', hotkey: 'H', icon: 'icon.24.hand' },
      { id: 'zoom', name: '缩放', hotkey: 'K', icon: 'icon.24.scale' }
    ]
  },
  {
    id: 'frame',
    name: '区域工具',
    defaultTool: 'drawFrame',
    tools: [
      { id: 'drawFrame', name: '画框', hotkey: 'F', icon: 'icon.24.frame' },
      { id: 'slice', name: '切片', hotkey: 'S', icon: 'icon.24.slice' },
      { id: 'section', name: '分区', hotkey: 'Shift+S', icon: 'icon.24.section' }
    ]
  },
  {
    id: 'shapes',
    name: '形状工具',
    defaultTool: 'drawRect',
    tools: [
      { id: 'drawRect', name: '矩形', hotkey: 'R', icon: 'icon.24.rectangle' },
      { id: 'drawLine', name: '直线', hotkey: 'L', icon: 'icon.24.line' },
      { id: 'drawArrow', name: '箭头', hotkey: 'Shift+L', icon: 'icon.24.arrow' },
      { id: 'drawEllipse', name: '椭圆', hotkey: 'O', icon: 'icon.24.ellipse' },
      { id: 'drawRegularPolygon', name: '多边形', hotkey: 'P', icon: 'icon.24.polygon' },
      { id: 'drawStar', name: '星形', hotkey: 'Shift+P', icon: 'icon.24.star' },
      { id: 'drawImg', name: '图片', hotkey: 'I', icon: 'icon.24.image' }
    ]
  },
  {
    id: 'drawing',
    name: '绘制工具',
    defaultTool: 'pen',
    tools: [
      { id: 'pen', name: '钢笔', hotkey: 'P', icon: 'icon.24.pen' },
      { id: 'pencil', name: '铅笔', hotkey: 'Shift+P', icon: 'icon.24.pencil' }
    ]
  },
  {
    id: 'text',
    name: '文本工具',
    defaultTool: 'drawText',
    tools: [
      { id: 'drawText', name: '文本', hotkey: 'T', icon: 'icon.24.text' }
    ]
  }
];

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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  user-select: none;
`;

const ToolButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => 
    $active ? '#3b82f6' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
   
  &:hover {
    background: ${({ $active }) => 
      $active ? '#2563eb' : '#f3f4f6'};
  }
   
  &:active {
    transform: scale(0.95);
  }
   
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  img {
    filter: ${({ $active }) => 
      $active 
        ? 'brightness(0) saturate(100%) invert(100%)' 
        : '#374151'
    };
  }
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    // width: 1px;
    height: 20px;
    background: #e5e7eb;
    margin: 0 2px;
  }
`;

const ToolButtonWithDropdown = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
`;

const MainToolButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => 
    $active ? '#3b82f6' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
   
  &:hover {
    background: ${({ $active }) => 
      $active ? '#2563eb' : '#f3f4f6'};
  }
   
  &:active {
    transform: scale(0.95);
  }
   
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  img {
    filter: ${({ $active }) => 
      $active 
        ? 'brightness(0) saturate(100%) invert(100%)' 
        : '#374151'
    };
  }
`;

const DropdownButton = styled.button<{ $active: boolean; $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 32px;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
   
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
   
  &:active {
    transform: scale(0.95);
    color: #374151;
  }
   
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  
  svg {
    width: 10px;
    height: 10px;
    fill: currentColor;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean; $position: 'top' | 'bottom' }>`
  position: absolute;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  min-width: 140px;
  padding: 4px;
  
  /* 向上显示 */
  ${({ $position }) => $position === 'top' && `
    bottom: 100%;
    margin-bottom: 4px;
    transform: ${({ $isOpen }: { $isOpen: boolean }) => $isOpen ? 'translateY(0)' : 'translateY(8px)'};
  `}
  
  /* 向下显示 */
  ${({ $position }) => $position === 'bottom' && `
    top: 100%;
    margin-top: 4px;
    transform: ${({ $isOpen }: { $isOpen: boolean }) => $isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  `}
`;

const DropdownItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: ${({ $active }) => $active ? '#f3f4f6' : 'transparent'};
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
  
  .tool-icon {
    width: 12px;
    height: 12px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .tool-name {
    flex: 1;
    text-align: left;
  }
  
  .tool-hotkey {
    color: #9ca3af;
    font-size: 12px;
    margin-left: 8px;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
   
  &:hover {
    background: #f3f4f6;
  }
   
  &:active {
    transform: scale(0.95);
  }
  
  img {
    filter: #374151;
  }
`;

// 模式切换分隔符
const ModeSeparator = styled.div`
  width: 1px;
  height: 30px;
  background: #e5e7eb;
  margin: 0 10px 0 0;
`;

// 模式切换开关容器
const ModeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  // padding: 2px;
  border: 1px solid #e5e7eb;
  // gap: 2px;
`;

// 模式切换开关按钮
const ModeToggleButton = styled.button<{ $active: boolean; $isLeft: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 34px;
  border: none;
  border-radius: ${({ $isLeft }) => $isLeft ? '6px 0 0 6px' : '0 6px 6px 0'};
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#374151' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => $active ? '0 0px 6px rgba(0, 0, 0, 0.1)' : 'none'};
   
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
   
  &:active {
    transform: scale(0.95);
  }
   
  &:focus-visible {
    // outline: 2px solid #10b981;
    outline-offset: 2px;
  }
   
  svg, img {
    width: 24px;
    height: 24px;
    filter: none;
    opacity: ${({ $active }) => $active ? 1 : 0.5}; // 非激活状态降低透明度
  }
`;



/**
 * Figma风格工具栏组件 - 集成Suika工具系统
 * @description 基于Suika引擎的工具管理器，提供完整的设计工具集成
 */
export const FigmaToolbar: React.FC<FigmaToolbarProps> = ({
  onToolChange,
  className,
}) => {
  const { suikaEditor, mode, setMode } = useCanvasStore();
  const [currentTool, setCurrentTool] = useState('select');
  const [enabledTools, setEnabledTools] = useState<string[]>([]);
  const [isPathEditorActive, setIsPathEditorActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 处理模式切换
  const handleModeClick = useCallback((modeId: 'design' | 'h5') => {
    setMode(modeId);
    console.log(`[figma-toolbar] 切换到模式: ${modeId}`);
  }, [setMode]);

  // 监听Suika编辑器的工具变化
  useEffect(() => {
    if (!suikaEditor) return;

    // 获取当前工具状态
    setCurrentTool(suikaEditor.toolManager.getActiveToolName() || 'select');
    setEnabledTools(suikaEditor.toolManager.getEnableTools());
    setIsPathEditorActive(suikaEditor.pathEditor.isActive());

    // 监听工具切换事件
    const handleToolSwitch = (toolName: string) => {
      setCurrentTool(toolName);
      onToolChange(toolName); // 同步到父组件
    };

    const handleEnableToolsChange = (tools: string[]) => {
      setEnabledTools(tools);
    };

    const handlePathEditorToggle = (active: boolean) => {
      setIsPathEditorActive(active);
    };

    // 绑定事件监听器
    suikaEditor.toolManager.on('switchTool', handleToolSwitch);
    suikaEditor.toolManager.on('changeEnableTools', handleEnableToolsChange);
    suikaEditor.pathEditor.on('toggle', handlePathEditorToggle);

    return () => {
      // 清理事件监听器
      suikaEditor.toolManager.off('switchTool', handleToolSwitch);
      suikaEditor.toolManager.off('changeEnableTools', handleEnableToolsChange);
      suikaEditor.pathEditor.off('toggle', handlePathEditorToggle);
    };
  }, [suikaEditor, onToolChange]);

  // 处理工具切换
  const handleToolClick = useCallback((toolName: string) => {
    if (!suikaEditor) return;
    
    try {
      suikaEditor.toolManager.setActiveTool(toolName);
      setOpenDropdown(null); // 关闭下拉菜单
      console.log(`[figma-toolbar] 切换到工具: ${toolName}`);
    } catch (error) {
      console.error(`[figma-toolbar] 工具切换失败: ${toolName}`, error);
    }
  }, [suikaEditor]);

  // 处理路径编辑器退出
  const handlePathEditorDone = useCallback(() => {
    if (!suikaEditor) return;
    
    try {
      suikaEditor.pathEditor.inactive();
      console.log('[figma-toolbar] 退出路径编辑模式');
    } catch (error) {
      console.error('[figma-toolbar] 退出路径编辑模式失败', error);
    }
  }, [suikaEditor]);

  // 切换下拉菜单
  const toggleDropdown = useCallback((categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  }, [openDropdown]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // 获取工具分类，保留所有工具但标记可用状态
  const getToolCategoriesWithStatus = useCallback(() => {
    return TOOL_CATEGORIES.map(category => ({
      ...category,
      tools: category.tools.map(tool => ({
        ...tool,
        isEnabled: enabledTools.includes(tool.id)
      }))
    }));
  }, [enabledTools]);

  // 渲染工具图标
  const renderToolIcon = useCallback((iconName: string) => {
    // 如果图标名称包含路径，直接使用SvgIcon组件
    if (iconName.includes('.')) {
      return <SvgIcon name={iconName} />;
    }
    
    // 否则使用默认图标
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      </svg>
    );
  }, []);

    // 渲染工具按钮
  const renderToolButton = useCallback((category: ReturnType<typeof getToolCategoriesWithStatus>[0]) => {
    const hasDropdown = category.tools.length > 1;
    const currentToolInCategory = category.tools.find(tool => tool.id === currentTool) || category.tools[0];
    
    // 确保currentToolInCategory存在
    if (!currentToolInCategory) {
      return null;
    }
    
    if (hasDropdown) {
      return (
        <ToolGroup key={category.id}>
          <ToolButtonWithDropdown>
            <MainToolButton
              $active={currentTool === currentToolInCategory.id}
              onClick={() => currentToolInCategory.isEnabled && handleToolClick(currentToolInCategory.id)}
              aria-label={currentToolInCategory.name}
            >
              {renderToolIcon(currentToolInCategory.icon)}
            </MainToolButton>
            
            <DropdownButton
              $active={false}
              $isOpen={openDropdown === category.id}
              onClick={() => toggleDropdown(category.id)}
              aria-label={`展开${category.name}菜单`}
            >
              <DropdownIcon>
                <SvgIcon name="icon.24.chevron.down" />
              </DropdownIcon>
            </DropdownButton>
          </ToolButtonWithDropdown>
          
          <DropdownMenu
            ref={el => dropdownRefs.current[category.id] = el}
            $isOpen={openDropdown === category.id}
            $position="top"
          >
            {category.tools.map(tool => (
              <DropdownItem
                key={tool.id}
                $active={currentTool === tool.id}
                onClick={() => tool.isEnabled && handleToolClick(tool.id)}
              >
                <div className="tool-icon">
                  {renderToolIcon(tool.icon)}
                </div>
                <div className="tool-name">{tool.name}</div>
                {tool.hotkey && (
                  <div className="tool-hotkey">{tool.hotkey}</div>
                )}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ToolGroup>
      );
    } else {
      // 单个工具，直接渲染按钮
      return (
        <ToolGroup key={category.id}>
          <ToolButton
            $active={currentTool === currentToolInCategory.id}
            onClick={() => currentToolInCategory.isEnabled && handleToolClick(currentToolInCategory.id)}
            aria-label={currentToolInCategory.name}
          >
            {renderToolIcon(currentToolInCategory.icon)}
          </ToolButton>
        </ToolGroup>
      );
    }
  }, [currentTool, openDropdown, toggleDropdown, handleToolClick, renderToolIcon]);

  return (
    <ToolbarContainer className={className}>
      {/* 菜单按钮 */}
      <MenuButton
        onClick={() => {
          // TODO: 实现菜单功能
          console.log('[figma-toolbar] 菜单按钮点击');
        }}
        title="菜单"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"/>
        </svg>
      </MenuButton>

      {/* 工具按钮组 */}
      {getToolCategoriesWithStatus().map(category => renderToolButton(category))}

      {/* 路径编辑器完成按钮 */}
      {isPathEditorActive && (
        <ToolButton
          $active={false}
          onClick={handlePathEditorDone}
          style={{ marginLeft: '16px' }}
          aria-label="完成路径编辑"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
          </svg>
        </ToolButton>
      )}

      {/* 模式切换分隔线 */}
      <ModeSeparator />
       
              {/* 模式切换开关容器 */}
        <ModeToggleContainer>
          <ModeToggleButton
            $active={mode === 'design'}
            $isLeft={true}
            onClick={() => handleModeClick('design')}
            aria-label="设计模式"
            title="设计模式"
          >
            <SvgIcon name="icon.24.file.design" size={24} />
          </ModeToggleButton>
          
          <ModeToggleButton
            $active={mode === 'h5'}
            $isLeft={false}
            onClick={() => handleModeClick('h5')}
            aria-label="H5模式"
            title="H5模式"
          >
            <SvgIcon name="icon.24.file.H5" size={24} />
          </ModeToggleButton>
        </ModeToggleContainer>
       
    </ToolbarContainer>
  );
};