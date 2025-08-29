/**
 * 项目标签页组件 - 支持标签页切换和管理
 */
import './ProjectTabs.scss';

import React, { useCallback, useRef, useState } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type IProjectTab } from './types';

interface IProjectTabsProps {
  tabs: IProjectTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabsReorder?: (tabs: IProjectTab[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ProjectTabs: React.FC<IProjectTabsProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabsReorder,
  className,
  style,
}) => {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 添加调试信息
  console.log('ProjectTabs 渲染:', {
    tabsCount: tabs.length,
    tabs,
    activeTabId,
    hasOnTabSelect: !!onTabSelect,
  });

  const handleTabClick = useCallback(
    (tabId: string) => {
      console.log('标签页被点击:', tabId);
      onTabSelect?.(tabId);
    },
    [onTabSelect],
  );

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      onTabClose?.(tabId);
    },
    [onTabClose],
  );

  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTab(tabId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTab(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTabId: string) => {
      e.preventDefault();

      if (!draggedTab || draggedTab === targetTabId) {
        setDraggedTab(null);
        setDragOverTab(null);
        return;
      }

      const draggedIndex = tabs.findIndex((tab) => tab.id === draggedTab);
      const targetIndex = tabs.findIndex((tab) => tab.id === targetTabId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedTab(null);
        setDragOverTab(null);
        return;
      }

      const newTabs = [...tabs];
      const [draggedTabData] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(targetIndex, 0, draggedTabData);

      onTabsReorder?.(newTabs);
      setDraggedTab(null);
      setDragOverTab(null);
    },
    [tabs, draggedTab, onTabsReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTab(null);
    setDragOverTab(null);
  }, []);

  const getTabDisplayName = useCallback((tab: IProjectTab): string => {
    const maxLength = 20;
    if (tab.name.length <= maxLength) {
      return tab.name;
    }
    return tab.name.substring(0, maxLength - 3) + '...';
  }, []);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={`project-tabs ${className || ''}`}
      style={style}
      ref={tabsRef}
    >
      <div className="tabs-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`project-tab ${tab.id === activeTabId ? 'active' : ''} ${
              tab.isDirty ? 'dirty' : ''
            } ${draggedTab === tab.id ? 'dragging' : ''} ${
              dragOverTab === tab.id ? 'drag-over' : ''
            }`}
            onClick={() => handleTabClick(tab.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
            title={tab.name}
          >
            {/* 标签页图标 */}
            <div className="tab-icon">
              <SvgIcon name="icon.24.file.design.library" size={14} />
            </div>

            {/* 标签页名称 */}
            <span className="tab-name">
              {getTabDisplayName(tab)}
              {tab.isDirty && <span className="dirty-indicator">•</span>}
            </span>

            {/* 关闭按钮 */}
            {tab.isClosable && (
              <button
                type="button"
                className="tab-close-btn"
                onClick={(e) => handleTabClose(e, tab.id)}
                title="关闭标签页"
              >
                <SvgIcon name="icon.24.close" size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 标签页操作按钮 */}
      <div className="tabs-actions">
        {/* 标签页菜单 */}
        <button type="button" className="tab-menu-btn" title="标签页菜单">
          <SvgIcon name="icon.24.more" size={14} />
        </button>
      </div>
    </div>
  );
};
