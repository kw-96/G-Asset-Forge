import './Header.scss';

import { type FC } from 'react';

import { ProjectTabs } from '../ProjectLibraryPanel/ProjectTabs';
import { type IProjectTab } from '../ProjectLibraryPanel/types';
import { SvgIcon } from '../SvgIcon/SvgIcon';
import { WindowControls } from '../WindowControls';
import { Menu } from './components/Toolbar/menu';

interface IProps {
  title: string;
  projectTabs?: IProjectTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabsReorder?: (tabs: IProjectTab[]) => void;
  onBackToHome?: () => void;
  showHomeButton?: boolean;
  onCreateProject?: () => void; // 新增：创建项目回调
  children?: React.ReactNode;
}

export const Header: FC<IProps> = ({
  projectTabs = [],
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabsReorder,
  onBackToHome,
  showHomeButton = false,
  onCreateProject, // 新增：创建项目回调
  children,
}) => {
  // 添加调试信息
  console.log('Header 渲染 - 标签页数据:', {
    projectTabsLength: projectTabs.length,
    projectTabs,
    activeTabId,
    hasOnTabSelect: !!onTabSelect,
    hasOnTabClose: !!onTabClose,
    hasOnCreateProject: !!onCreateProject,
  });

  return (
    <div
      className="sk-header"
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Header: 阻止双击事件冒泡');
      }}
    >
      {/* 左侧区域 - 主页按钮 */}
      <div className="sk-left-area">
        {showHomeButton && onBackToHome && (
          <button
            type="button"
            className="home-btn"
            onClick={onBackToHome}
            title="首页"
          >
            <SvgIcon name="icon.24.home" size={24} />
          </button>
        )}
      </div>

      {/* 项目标签页区域 - 始终显示容器，即使没有标签页 */}
      <div className="sk-tabs-area">
        {projectTabs.length > 0 ? (
          <ProjectTabs
            tabs={projectTabs}
            activeTabId={activeTabId}
            onTabSelect={onTabSelect}
            onTabClose={onTabClose}
            onTabsReorder={onTabsReorder}
          />
        ) : (
          <div className="no-tabs-placeholder">
            {/* 可以显示一个占位符或者什么都不显示 */}
            <span className="no-tabs-text">暂无打开的项目</span>
          </div>
        )}
      </div>

      {/* 新建项目按钮 - 始终显示 */}
      {onCreateProject && (
        <button
          type="button"
          className="new-project-btn"
          onClick={() => {
            console.log('新建项目按钮被点击');
            onCreateProject();
          }}
          title="新建项目"
        >
          <SvgIcon name="icon.24.plus" size={24} />
        </button>
      )}

      <div className="sk-right-area">
        {children}
        <Menu />
        <WindowControls />
      </div>
    </div>
  );
};
