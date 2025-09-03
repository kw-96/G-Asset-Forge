/**
 * 首页界面组件
 * 提供左右分栏布局，左侧为功能菜单，右侧为内容展示
 */

import './HomePage.scss';

import React, { useState } from 'react';

import { Header } from '../Header';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';

export interface HomePageProps {
  onCreateNewProject: () => void;
  onCreateDesignProject?: () => void;
  onCreateH5Project?: () => void;
  onOpenProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  recentProjects?: RecentProject[];

  // Header 相关 props - 从 Editor.tsx 传递过来
  onBackToHome?: () => void;
  onCreateProject?: () => void;
}

export interface RecentProject {
  id: string;
  name: string;
  type: 'design' | 'h5';
  lastOpenedAt: string;
  thumbnail?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onCreateNewProject,
  onCreateDesignProject,
  onCreateH5Project,
  onOpenProject,
  onDeleteProject,
  recentProjects = [],

  // Header 相关 props
  onBackToHome,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>('project-library');

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
  };

  return (
    <div className="home-page">
      {/* 统一的Header */}
      <Header
        title="g-asset-forge"
        onBackToHome={onBackToHome || (() => window.location.reload())}
        showHomeButton={true}
      />

      {/* 主要内容区域 - 左右分栏布局 */}
      <div className="home-page__container">
        <LeftPanel
          selectedItem={selectedItem}
          onItemSelect={handleItemSelect}
        />
        <RightPanel
          selectedItem={selectedItem}
          onCreateNewProject={onCreateNewProject}
          onCreateDesignProject={onCreateDesignProject}
          onCreateH5Project={onCreateH5Project}
          onOpenProject={onOpenProject}
          onDeleteProject={onDeleteProject}
          recentProjects={recentProjects}
        />
      </div>
    </div>
  );
};
