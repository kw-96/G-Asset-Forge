/**
 * 项目库工具栏组件 - 基于现有的按钮组件创建项目管理界面
 */
import React from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type ViewMode } from './types';

interface IProjectLibraryToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  projectCount?: number;
  className?: string;
}

export const ProjectLibraryToolbar: React.FC<IProjectLibraryToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onCreateProject,
  onImportProject,
  onRefresh,
  isLoading = false,
  projectCount = 0,
  className,
}) => {
  return (
    <div className={`project-library-toolbar ${className || ''}`}>
      {/* 左侧：项目统计 */}
      <div className="toolbar-left">
        <span className="project-count">共 {projectCount} 个项目</span>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="toolbar-right">
        {/* 视图模式切换 */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="网格视图"
          >
            <SvgIcon name="icon.24.grid" size={16} />
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="列表视图"
          >
            <SvgIcon name="icon.24.list" size={16} />
          </button>
        </div>

        {/* 分隔线 */}
        <div className="toolbar-divider" />

        {/* 刷新按钮 */}
        <button
          type="button"
          className="toolbar-btn secondary"
          onClick={onRefresh}
          disabled={isLoading}
          title="刷新项目列表"
        >
          <SvgIcon
            name="icon.24.refresh"
            size={16}
            className={isLoading ? 'spinning' : ''}
          />
        </button>

        {/* 导入项目按钮 */}
        <button
          type="button"
          className="toolbar-btn secondary"
          onClick={onImportProject}
          disabled={isLoading}
          title="导入项目文件"
        >
          <SvgIcon name="icon.24.import" size={16} />
          导入
        </button>

        {/* 新建项目按钮 */}
        <button
          type="button"
          className="toolbar-btn primary"
          onClick={onCreateProject}
          disabled={isLoading}
          title="创建新项目"
        >
          <SvgIcon name="icon.24.plus" size={16} />
          新建项目
        </button>
      </div>
    </div>
  );
};
