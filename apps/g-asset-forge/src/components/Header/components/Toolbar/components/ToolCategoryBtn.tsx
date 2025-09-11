import './ToolCategoryBtn.scss';

import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { SvgIcon } from '../../../../SvgIcon';
import { TOOLBAR_CONFIG } from '../config/toolCategories';

interface Tool {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
}

interface ToolCategory {
  id: string;
  name: string;
  defaultTool: string;
  tools: Tool[];
}

interface ToolCategoryBtnProps {
  category: ToolCategory;
  currentTool: string;
  enableTools: string[];
  onToolSelect: (toolId: string) => void;
  position: 'first' | 'middle' | 'last';
}

export const ToolCategoryBtn: React.FC<ToolCategoryBtnProps> = ({
  category,
  currentTool,
  enableTools,
  onToolSelect,
  position,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前分类的默认工具
  const defaultTool = category.tools.find(
    (tool) => tool.id === category.defaultTool,
  );
  const currentToolInfo = category.tools.find(
    (tool) => tool.id === currentTool,
  );
  const activeTool = currentToolInfo || defaultTool;

  // 检查当前激活的工具是否已实现
  const isActiveToolImplemented = activeTool
    ? enableTools.includes(activeTool.id)
    : false;

  // 显示所有工具，包括未实现的工具
  const allTools = category.tools;
  const availableTools = category.tools.filter((tool) =>
    enableTools.includes(tool.id),
  );

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 未实现的工具列表
  const unimplementedTools = ['zoom', 'slice', 'section', 'drawArrow'];

  const handleToolSelect = (toolId: string) => {
    // 如果是未实现的工具，只关闭下拉菜单，不执行工具选择
    if (unimplementedTools.includes(toolId)) {
      setIsOpen(false);
      return;
    }

    onToolSelect(toolId);
    setIsOpen(false);
  };

  const isActive = currentToolInfo !== undefined;

  return (
    <div className="tool-category-btn" ref={dropdownRef}>
      <div className={classNames('tool-group', `position-${position}`)}>
        {allTools.length > 1 ? (
          <div className="tool-button-with-dropdown">
            <button
              className={classNames('main-tool-button', {
                active: isActive,
              })}
              onMouseDown={() => {
                if (activeTool && isActiveToolImplemented) {
                  handleToolSelect(activeTool.id);
                }
              }}
              title={activeTool?.name || ''}
            >
              {activeTool && (
                <SvgIcon
                  name={activeTool.icon}
                  size={TOOLBAR_CONFIG.ICON_SIZE}
                />
              )}
            </button>

            <button
              className="dropdown-button"
              onMouseDown={() => {
                setIsOpen(!isOpen);
              }}
              title="更多工具"
            >
              <div className="dropdown-icon">
                <SvgIcon
                  name="icon.24.chevron.down"
                  size={TOOLBAR_CONFIG.DROPDOWN_ARROW_SIZE}
                  className={classNames('dropdown-arrow', { open: isOpen })}
                />
              </div>
            </button>
          </div>
        ) : (
          <button
            className={classNames('main-tool-button', {
              active: isActive,
            })}
            onMouseDown={() => {
              if (activeTool && isActiveToolImplemented) {
                handleToolSelect(activeTool.id);
              }
            }}
            title={activeTool?.name || ''}
          >
            {activeTool && (
              <SvgIcon name={activeTool.icon} size={TOOLBAR_CONFIG.ICON_SIZE} />
            )}
          </button>
        )}
      </div>

      {isOpen && allTools.length > 1 && (
        <div className="dropdown-menu">
          {allTools.map((tool) => {
            const isUnimplemented = unimplementedTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                className={classNames('dropdown-item', {
                  active: currentTool === tool.id,
                  unimplemented: isUnimplemented,
                })}
                onMouseDown={() => handleToolSelect(tool.id)}
                title={isUnimplemented ? `${tool.name} (即将推出)` : tool.name}
                disabled={isUnimplemented}
              >
                <div className="tool-icon">
                  <SvgIcon name={tool.icon} size={12} />
                </div>
                <div className="tool-name">{tool.name}</div>
                {tool.hotkey && (
                  <div className="tool-hotkey">{tool.hotkey}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
