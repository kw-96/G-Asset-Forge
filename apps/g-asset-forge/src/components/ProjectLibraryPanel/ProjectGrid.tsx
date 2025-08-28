/**
 * 项目网格组件 - 基于现有的Cards组件实现项目卡片视图
 */
import React from 'react';

import { ProjectCard } from './ProjectCard';
import { type IProjectMetadata, type ViewMode } from './types';

interface IProjectGridProps {
  projects: IProjectMetadata[];
  viewMode: ViewMode;
  selectedProject?: IProjectMetadata;
  isLoading?: boolean;
  onProjectSelect?: (project: IProjectMetadata) => void;
  onProjectOpen?: (project: IProjectMetadata) => void;
  onProjectRename?: (project: IProjectMetadata) => void;
  onProjectDelete?: (project: IProjectMetadata) => void;
  onToggleFavorite?: (project: IProjectMetadata, e: React.MouseEvent) => void;
}

export const ProjectGrid: React.FC<IProjectGridProps> = ({
  projects,
  viewMode,
  selectedProject,
  isLoading = false,
  onProjectSelect,
  onProjectOpen,
  onProjectRename,
  onProjectDelete,
  onToggleFavorite,
}) => {
  if (isLoading) {
    return (
      <div className="project-grid-loading">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>加载项目中...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>暂无项目</h3>
          <p>没有找到符合条件的项目，请尝试调整筛选条件或创建新项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`project-grid project-grid-${viewMode}`}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          viewMode={viewMode}
          isSelected={selectedProject?.id === project.id}
          onSelect={onProjectSelect}
          onOpen={onProjectOpen}
          onRename={onProjectRename}
          onDelete={onProjectDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
