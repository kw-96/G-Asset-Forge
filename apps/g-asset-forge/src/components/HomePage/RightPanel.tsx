/**
 * 首页右侧内容面板组件
 * 显示点击左侧面板对应条目所显示的内容
 */

import { Button } from '@g-asset-forge/components';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { SvgIcon } from '../SvgIcon';
import { SettingsPanel } from './SettingsPanel';

export interface RightPanelProps {
  selectedItem: string;
  onCreateNewProject: () => void;
  onCreateDesignProject?: () => void;
  onCreateH5Project?: () => void;
  onOpenProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  recentProjects?: RecentProject[];
  // 设置相关 props
  onAutoExportToggle?: (enabled: boolean) => void;
  onRequestFileSystemPermission?: () => Promise<boolean>;
  autoExportInfo?: {
    isSupported: boolean;
    method: 'electron' | 'directory' | 'download';
    description: string;
    isOptimal: boolean;
    browserInfo: any;
  };
}

export interface RecentProject {
  id: string;
  name: string;
  type: 'design' | 'h5';
  lastOpenedAt: string;
  thumbnail?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedItem,
  onCreateNewProject,
  onCreateDesignProject,
  onCreateH5Project,
  onOpenProject,
  onDeleteProject,
  recentProjects = [],
  onAutoExportToggle,
  onRequestFileSystemPermission,
  autoExportInfo,
}) => {
  const handleOpenProject = (project: RecentProject) => {
    onOpenProject?.(project.id);
    console.log('打开项目:', project);
  };

  const handleDeleteProject = (
    project: RecentProject,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发项目卡片的点击事件
    if (
      window.confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`)
    ) {
      onDeleteProject?.(project.id);
      console.log('删除项目:', project);
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'project-library':
        return (
          <div className="right-panel__content">
            <div className="content-header">
              <h2 className="content-title">
                <FormattedMessage id="homePage.projectLibrary" />
              </h2>
              <div className="create-buttons">
                <Button onClick={onCreateDesignProject || onCreateNewProject}>
                  <SvgIcon name="icon.24.file.design" size={16} />
                  <FormattedMessage id="homePage.createDesignProject" />
                </Button>
                <Button onClick={onCreateH5Project || onCreateNewProject}>
                  <SvgIcon name="icon.24.file.H5" size={16} />
                  <FormattedMessage id="homePage.createH5Project" />
                </Button>
              </div>
            </div>

            {recentProjects.length > 0 ? (
              <div className="project-grid">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="project-card"
                    onClick={() => handleOpenProject(project)}
                  >
                    <div className="project-card__thumbnail">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} />
                      ) : (
                        <SvgIcon name="icon.24.file.design.library" size={24} />
                      )}
                    </div>
                    <div className="project-card__info">
                      <h4 className="project-card__name">{project.name}</h4>
                      <div className="project-card__meta">
                        <span className="project-card__type">
                          <FormattedMessage
                            id={
                              project.type === 'design'
                                ? 'homePage.designType'
                                : 'homePage.h5Type'
                            }
                          />
                        </span>
                        <span className="project-card__date">
                          {new Date(project.lastOpenedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="project-card__delete"
                      onClick={(e) => handleDeleteProject(project, e)}
                      title="删除项目"
                    >
                      <SvgIcon name="icon.24.trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <SvgIcon name="icon.24.file.design.library" size={64} />
                <h3>暂无项目</h3>
                <p>创建您的第一个项目开始设计之旅</p>
              </div>
            )}
          </div>
        );

      case 'template-library':
        return (
          <div className="right-panel__content">
            <div className="content-header">
              <h2 className="content-title">
                <FormattedMessage id="homePage.templateLibrary" />
              </h2>
            </div>
            <div className="empty-state">
              <SvgIcon name="icon.24.file.design.mods" size={64} />
              <h3>模板库</h3>
              <p>模板库功能正在开发中，敬请期待</p>
            </div>
          </div>
        );

      case 'asset-library':
        return (
          <div className="right-panel__content">
            <div className="content-header">
              <h2 className="content-title">
                <FormattedMessage id="homePage.assetLibrary" />
              </h2>
            </div>
            <div className="empty-state">
              <SvgIcon name="icon.24.file.design.assets" size={64} />
              <h3>素材库</h3>
              <p>素材库功能正在开发中，敬请期待</p>
            </div>
          </div>
        );

      case 'font-library':
        return (
          <div className="right-panel__content">
            <div className="content-header">
              <h2 className="content-title">
                <FormattedMessage id="homePage.fontLibrary" />
              </h2>
            </div>
            <div className="empty-state">
              <SvgIcon name="icon.24.text" size={64} />
              <h3>字体库</h3>
              <p>字体库功能正在开发中，敬请期待</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="right-panel__content">
            <div className="content-header">
              <h2 className="content-title">
                <FormattedMessage id="homePage.settings" />
              </h2>
            </div>
            <SettingsPanel
              onAutoExportToggle={onAutoExportToggle}
              onRequestFileSystemPermission={onRequestFileSystemPermission}
              autoExportInfo={autoExportInfo}
            />
          </div>
        );

      default:
        return (
          <div className="right-panel__content">
            <div className="empty-state">
              <SvgIcon name="icon.24.file.design" size={64} />
              <h3>欢迎使用 G-Asset Forge</h3>
              <p>请从左侧选择功能模块</p>
            </div>
          </div>
        );
    }
  };

  return <div className="right-panel">{renderContent()}</div>;
};
