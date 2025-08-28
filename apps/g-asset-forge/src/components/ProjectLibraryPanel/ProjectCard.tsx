/**
 * 项目卡片组件 - 基于现有的BaseCard组件实现
 */
import React, { useCallback, useState } from 'react';

import { BaseCard } from '../Cards/BaseCard';
import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type IProjectMetadata, type ViewMode } from './types';

interface IProjectCardProps {
  project: IProjectMetadata;
  viewMode: ViewMode;
  isSelected?: boolean;
  onSelect?: (project: IProjectMetadata) => void;
  onOpen?: (project: IProjectMetadata) => void;
  onRename?: (project: IProjectMetadata) => void;
  onDelete?: (project: IProjectMetadata) => void;
  onToggleFavorite?: (project: IProjectMetadata, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<IProjectCardProps> = ({
  project,
  viewMode,
  isSelected = false,
  onSelect,
  onOpen,
  onRename,
  onDelete,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onSelect?.(project);
  }, [project, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onOpen?.(project);
  }, [project, onOpen]);

  const handleOpenClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen?.(project);
    },
    [project, onOpen],
  );

  const handleRenameClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRename?.(project);
    },
    [project, onRename],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(project);
    },
    [project, onDelete],
  );

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(project, e);
    },
    [project, onToggleFavorite],
  );

  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      h5: '#e83e8c',
      design: '#007bff',
      demo: '#28a745',
      other: '#6c757d',
    };
    return colors[category] || '#6c757d';
  }, []);

  const getTypeColor = useCallback((type: string): string => {
    return type === 'h5' ? '#e83e8c' : '#007bff';
  }, []);

  const formatDate = useCallback((dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch {
      return dateStr;
    }
  }, []);

  if (viewMode === 'list') {
    return (
      <div
        className={`project-card-list ${isSelected ? 'selected' : ''} ${
          isHovered ? 'hovered' : ''
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 缩略图 */}
        <div className="project-thumbnail">
          {project.thumbnail && !imageError ? (
            <img
              src={project.thumbnail}
              alt={project.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="project-placeholder">
              <SvgIcon
                name="icon.24.file.design.library"
                size={32}
                title={project.name}
              />
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="project-info">
          <div className="project-header">
            <h4 className="project-name" title={project.name}>
              {project.name}
            </h4>
            <button
              type="button"
              className="favorite-btn"
              onClick={handleFavoriteClick}
            >
              {project.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="project-description" title={project.description}>
            {project.description}
          </p>

          <div className="project-meta">
            <span
              className="category-tag"
              style={{ backgroundColor: getCategoryColor(project.category) }}
            >
              {project.category}
            </span>
            <span
              className="type-tag"
              style={{ backgroundColor: getTypeColor(project.type) }}
            >
              {project.type === 'h5' ? 'H5长图' : '设计模式'}
            </span>
            <span className="update-time">
              更新于 {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="project-actions">
          <button
            type="button"
            className="action-btn secondary"
            onClick={handleRenameClick}
          >
            重命名
          </button>
          <button
            type="button"
            className="action-btn secondary"
            onClick={handleDeleteClick}
          >
            删除
          </button>
          <button
            type="button"
            className="action-btn primary"
            onClick={handleOpenClick}
          >
            打开
          </button>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <BaseCard>
      <div
        className={`project-card-grid ${isSelected ? 'selected' : ''} ${
          isHovered ? 'hovered' : ''
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 收藏按钮 */}
        <button
          type="button"
          className="favorite-btn-overlay"
          onClick={handleFavoriteClick}
          style={{
            opacity: isHovered || project.isFavorite ? 1 : 0,
          }}
        >
          {project.isFavorite ? '❤️' : '🤍'}
        </button>

        {/* 缩略图区域 */}
        <div className="project-thumbnail-grid">
          {project.thumbnail && !imageError ? (
            <img
              src={project.thumbnail}
              alt={project.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="project-placeholder">
              <SvgIcon
                name="icon.24.file.design.library"
                size={48}
                title={project.name}
              />
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="project-info-grid">
          <h4 className="project-name" title={project.name}>
            {project.name}
          </h4>

          <p className="project-description" title={project.description}>
            {project.description}
          </p>

          <div className="project-meta-grid">
            <div className="project-tags">
              <span
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(project.category) }}
              >
                {project.category}
              </span>
              <span
                className="type-tag"
                style={{ backgroundColor: getTypeColor(project.type) }}
              >
                {project.type === 'h5' ? 'H5' : '设计'}
              </span>
            </div>
            <div className="project-stats">
              <span className="update-time">
                {formatDate(project.updatedAt)}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="project-actions-grid">
            <button
              type="button"
              className="action-btn secondary"
              onClick={handleRenameClick}
            >
              重命名
            </button>
            <button
              type="button"
              className="action-btn primary"
              onClick={handleOpenClick}
            >
              打开
            </button>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
