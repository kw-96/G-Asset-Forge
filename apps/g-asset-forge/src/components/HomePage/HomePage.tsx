/**
 * 首页界面组件
 * 提供模式选择、项目管理和快速访问功能
 */

import './HomePage.scss';

import { Button } from '@g-asset-forge/components';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { SvgIcon } from '../SvgIcon';

export interface HomePageProps {
  onModeSelect: (mode: 'design' | 'h5') => void;
  onOpenProjectLibrary: () => void;
  onOpenTemplateLibrary: () => void;
  onOpenAssetLibrary: () => void;
  onCreateNewProject: () => void;
  onOpenProject?: (projectId: string) => void;
  recentProjects?: RecentProject[];
}

export interface RecentProject {
  id: string;
  name: string;
  type: 'design' | 'h5';
  lastOpenedAt: string;
  thumbnail?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onModeSelect,
  onOpenProjectLibrary,
  onOpenTemplateLibrary,
  onOpenAssetLibrary,
  onCreateNewProject,
  onOpenProject,
  recentProjects = [],
}) => {
  const [selectedMode, setSelectedMode] = useState<'design' | 'h5'>('design');

  const handleModeSelect = (mode: 'design' | 'h5') => {
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  const handleOpenRecentProject = (project: RecentProject) => {
    // 根据项目类型设置模式并打开项目
    setSelectedMode(project.type);
    onModeSelect(project.type);
    // 打开具体项目
    onOpenProject?.(project.id);
    console.log('打开最近项目:', project);
  };

  return (
    <div className="home-page">
      <div className="home-page__container">
        {/* 头部区域 */}
        <header className="home-page__header">
          <div className="home-page__logo">
            <h1 className="home-page__title">
              <FormattedMessage id="homePage.title" />
            </h1>
          </div>
          <p className="home-page__subtitle">
            <FormattedMessage id="homePage.subtitle" />
          </p>
        </header>

        {/* 主要内容区域 */}
        <main className="home-page__main">
          {/* 模式选择区域 */}
          <section className="home-page__modes">
            <h2 className="home-page__section-title">
              <FormattedMessage id="homePage.selectMode" />
            </h2>
            <div className="mode-cards">
              <div
                className={`mode-card ${
                  selectedMode === 'design' ? 'mode-card--active' : ''
                }`}
                onClick={() => handleModeSelect('design')}
              >
                <div className="mode-card__icon">
                  <SvgIcon name="icon.24.file.design" size={48} />
                </div>
                <h3 className="mode-card__title">
                  <FormattedMessage id="homePage.designMode" />
                </h3>
              </div>

              <div
                className={`mode-card ${
                  selectedMode === 'h5' ? 'mode-card--active' : ''
                }`}
                onClick={() => handleModeSelect('h5')}
              >
                <div className="mode-card__icon">
                  <SvgIcon name="icon.24.file.H5" size={48} />
                </div>
                <h3 className="mode-card__title">
                  <FormattedMessage id="homePage.h5Mode" />
                </h3>
              </div>
            </div>
          </section>

          {/* 快速操作区域 */}
          <section className="home-page__actions">
            <div className="action-group">
              <h3 className="action-group__title">
                <FormattedMessage id="homePage.quickStart" />
              </h3>
              <div className="action-buttons">
                <Button onClick={onCreateNewProject}>
                  <SvgIcon name="icon.24.plus" size={16} />
                  <FormattedMessage id="homePage.createNewProject" />
                </Button>
                <Button onClick={onOpenTemplateLibrary}>
                  <SvgIcon name="icon.24.file.design.library" size={16} />
                  <FormattedMessage id="homePage.templateLibrary" />
                </Button>
              </div>
            </div>

            <div className="action-group">
              <h3 className="action-group__title">
                <FormattedMessage id="homePage.resourceManagement" />
              </h3>
              <div className="action-buttons">
                <Button onClick={onOpenProjectLibrary}>
                  <SvgIcon name="icon.24.file.design.library" size={16} />
                  <FormattedMessage id="homePage.projectLibrary" />
                </Button>
                <Button onClick={onOpenAssetLibrary}>
                  <SvgIcon name="icon.24.file.design.library" size={16} />
                  <FormattedMessage id="homePage.assetLibrary" />
                </Button>
              </div>
            </div>
          </section>

          {/* 最近项目区域 */}
          {recentProjects.length > 0 && (
            <section className="home-page__recent">
              <h2 className="home-page__section-title">
                <FormattedMessage id="homePage.recentProjects" />
              </h2>
              <div className="recent-projects">
                {recentProjects.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="recent-project"
                    onClick={() => handleOpenRecentProject(project)}
                  >
                    <div className="recent-project__thumbnail">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} />
                      ) : (
                        <SvgIcon name="icon.24.file.design.library" size={32} />
                      )}
                    </div>
                    <div className="recent-project__info">
                      <h4 className="recent-project__name">{project.name}</h4>
                      <div className="recent-project__meta">
                        <span className="recent-project__type">
                          <FormattedMessage
                            id={
                              project.type === 'design'
                                ? 'homePage.designType'
                                : 'homePage.h5Type'
                            }
                          />
                        </span>
                        <span className="recent-project__date">
                          {new Date(project.lastOpenedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
