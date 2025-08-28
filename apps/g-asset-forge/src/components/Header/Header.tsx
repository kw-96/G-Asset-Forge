import './Header.scss';

import { type FC } from 'react';

import { ProjectTabs } from '../ProjectLibraryPanel/ProjectTabs';
import { type IProjectTab } from '../ProjectLibraryPanel/types';
import { SvgIcon } from '../SvgIcon/SvgIcon';
import { WindowControls } from '../WindowControls';
// import { LocaleSelector } from '../LocaleSelector'; // 暂时不使用国际化组件
// import { ZoomActions } from '../ZoomActions'; // 暂时不使用缩放组件
import Title from './components/Title';
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
  title,
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
  return (
    <div className="sk-header">
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

      {/* 项目标签页区域 */}
      {projectTabs.length > 0 && (
        <div className="sk-tabs-area">
          <ProjectTabs
            tabs={projectTabs}
            activeTabId={activeTabId}
            onTabSelect={onTabSelect}
            onTabClose={onTabClose}
            onTabsReorder={onTabsReorder}
          />
        </div>
      )}

      {/* 新建项目按钮 - 始终显示 */}
      {onCreateProject && (
        <button
          type="button"
          className="new-project-btn"
          onClick={onCreateProject}
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
