/**
 * 项目库面板组件 - 集成真实数据服务
 * - 将项目库界面与数据服务集成，替换占位实现
 * - 基于现有的Cards组件实现项目卡片视图和列表视图
 * - 复用现有的搜索、筛选和排序UI组件
 * - 基于现有的表单和按钮组件创建项目的新建、重命名和删除界面
 * - 设计适合弹窗显示的布局和尺寸
 */
import './ProjectLibraryPanel.scss';

import { ProjectStorageService } from '@g-asset-forge/core';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { ProjectEditModal } from './ProjectEditModal';
import { ProjectGrid } from './ProjectGrid';
import { ProjectLibraryToolbar } from './ProjectLibraryToolbar';
import { ProjectSearchBar } from './ProjectSearchBar';
import {
  type IProjectLibraryPanelProps,
  type IProjectMetadata,
  type IProjectSearchOptions,
  type ViewMode,
} from './types';

export const ProjectLibraryPanel: React.FC<IProjectLibraryPanelProps> = ({
  onProjectSelect,
  onProjectOpen,
  onProjectCreate,
  onProjectRename,
  onProjectDelete,
  onProjectImport,
  className,
  style,
}) => {
  // 项目存储服务
  const storageServiceRef = useRef<ProjectStorageService | null>(null);

  // 状态管理
  const [projects, setProjects] = useState<IProjectMetadata[]>([]);
  const [selectedProject, setSelectedProject] = useState<
    IProjectMetadata | undefined
  >();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 搜索和筛选状态
  const [searchOptions, setSearchOptions] = useState<IProjectSearchOptions>({
    query: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // 模态框状态
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'rename' | 'delete';
    project?: IProjectMetadata;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // 初始化存储服务
  // 加载项目列表
  const loadProjects = useCallback(async () => {
    if (!storageServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const projectsList = await storageServiceRef.current.getProjectsList();

      // 转换数据格式
      const formattedProjects: IProjectMetadata[] = projectsList.map(
        (project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          type: project.type,
          category: project.type === 'h5' ? 'h5' : 'design',
          tags: [], // 暂时为空，后续可以从项目数据中提取
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          lastOpenedAt: project.lastOpenedAt.toISOString(),
          fileSize: project.fileSize,
          usageCount: 0, // 暂时为0，后续可以从使用统计中获取
          isFavorite: false, // 暂时为false，后续可以添加收藏功能
        }),
      );

      setProjects(formattedProjects);
    } catch (err) {
      console.error('加载项目列表失败:', err);
      setError('加载项目列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!storageServiceRef.current) {
      storageServiceRef.current = new ProjectStorageService();
      loadProjects();
    }
  }, [loadProjects]);

  // 筛选和排序项目
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 搜索筛选
    if (searchOptions.query) {
      const query = searchOptions.query.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // 分类筛选
    if (searchOptions.category) {
      filtered = filtered.filter(
        (project) => project.category === searchOptions.category,
      );
    }

    // 类型筛选
    if (searchOptions.type) {
      filtered = filtered.filter(
        (project) => project.type === searchOptions.type,
      );
    }

    // 收藏筛选
    if (searchOptions.isFavorite) {
      filtered = filtered.filter((project) => project.isFavorite);
    }

    // 排序
    const sortBy = searchOptions.sortBy || 'updatedAt';
    const sortOrder = searchOptions.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // 处理日期字段
      if (
        sortBy === 'createdAt' ||
        sortBy === 'updatedAt' ||
        sortBy === 'lastOpenedAt'
      ) {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // 处理字符串字段
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [projects, searchOptions]);

  // 处理搜索选项变更
  const handleSearchChange = useCallback(
    (newOptions: Partial<IProjectSearchOptions>) => {
      setSearchOptions((prev) => ({ ...prev, ...newOptions }));
    },
    [],
  );

  // 处理项目选择
  const handleProjectSelect = useCallback(
    (project: IProjectMetadata) => {
      setSelectedProject(project);
      onProjectSelect?.(project);
    },
    [onProjectSelect],
  );

  // 处理项目打开
  const handleProjectOpen = useCallback(
    (project: IProjectMetadata) => {
      onProjectOpen?.(project);
    },
    [onProjectOpen],
  );

  // 处理项目重命名
  const handleProjectRename = useCallback((project: IProjectMetadata) => {
    setModalState({
      isOpen: true,
      mode: 'rename',
      project,
    });
  }, []);

  // 处理项目删除
  const handleProjectDelete = useCallback((project: IProjectMetadata) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      project,
    });
  }, []);

  // 处理收藏切换
  const handleToggleFavorite = useCallback((project: IProjectMetadata) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );
  }, []);

  // 处理创建项目
  const handleCreateProject = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create',
    });
  }, []);

  // 处理导入项目
  const handleImportProject = useCallback(() => {
    onProjectImport?.();
  }, [onProjectImport]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    loadProjects();
  }, [loadProjects]);

  // 处理模态框确认
  const handleModalConfirm = useCallback(
    async (data: any) => {
      if (!storageServiceRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        if (modalState.mode === 'create') {
          // 创建新项目
          const projectData = await storageServiceRef.current.createProject({
            name: data.name,
            description: data.description,
            type: data.type,
          });

          // 刷新项目列表
          await loadProjects();
          onProjectCreate?.();
        } else if (modalState.mode === 'rename' && modalState.project) {
          // 重命名项目
          await storageServiceRef.current.updateProject(modalState.project.id, {
            name: data.name,
            description: data.description,
          });

          // 刷新项目列表
          await loadProjects();
          onProjectRename?.(modalState.project, data.name);
        } else if (modalState.mode === 'delete' && modalState.project) {
          // 删除项目
          await storageServiceRef.current.deleteProject(modalState.project.id);

          // 刷新项目列表
          await loadProjects();
          onProjectDelete?.(modalState.project);
        }

        setModalState({ isOpen: false, mode: 'create' });
      } catch (err) {
        console.error('操作项目失败:', err);
        setError('操作失败，请重试');
      } finally {
        setIsLoading(false);
      }
    },
    [
      modalState,
      onProjectCreate,
      onProjectRename,
      onProjectDelete,
      loadProjects,
    ],
  );

  // 处理模态框关闭
  const handleModalClose = useCallback(() => {
    if (!isLoading) {
      setModalState({ isOpen: false, mode: 'create' });
    }
  }, [isLoading]);

  return (
    <div className={`project-library-panel ${className || ''}`} style={style}>
      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <SvgIcon name="icon.24.warning" size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="error-close-btn"
            onClick={() => setError(null)}
          >
            <SvgIcon name="icon.24.close" size={14} />
          </button>
        </div>
      )}

      {/* 工具栏 */}
      <ProjectLibraryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateProject={handleCreateProject}
        onImportProject={handleImportProject}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        projectCount={filteredProjects.length}
      />

      {/* 搜索栏 */}
      <ProjectSearchBar
        searchOptions={searchOptions}
        onSearchChange={handleSearchChange}
      />

      {/* 项目网格 */}
      <div className="project-content">
        <ProjectGrid
          projects={filteredProjects}
          viewMode={viewMode}
          selectedProject={selectedProject}
          isLoading={isLoading}
          onProjectSelect={handleProjectSelect}
          onProjectOpen={handleProjectOpen}
          onProjectRename={handleProjectRename}
          onProjectDelete={handleProjectDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* 编辑模态框 */}
      <ProjectEditModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        project={modalState.project}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        isLoading={isLoading}
      />
    </div>
  );
};
