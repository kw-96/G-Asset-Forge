/**
 * 项目管理Hook - 提供项目管理功能的React Hook
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type IProjectTab } from '../components/ProjectLibraryPanel/types';
import { ProjectManagementService } from '../services/ProjectManagementService';

export interface UseProjectManagementReturn {
  // 状态
  openTabs: IProjectTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;

  // 操作方法
  openProject: (projectId: string) => Promise<boolean>;
  closeProject: (projectId: string) => Promise<boolean>;
  switchToTab: (tabId: string) => Promise<boolean>;
  reorderTabs: (tabs: IProjectTab[]) => void;
  saveProject: (projectId: string) => Promise<boolean>;
  saveAllProjects: () => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // 工具方法
  setEditor: (editor: GAssetForgeEditor) => void;
  getActiveProject: () => Promise<any>;
  markProjectDirty: (projectId: string) => void;
  hasUnsavedChanges: () => boolean;
}

/**
 * 项目管理Hook
 */
export const useProjectManagement = (): UseProjectManagementReturn => {
  const serviceRef = useRef<ProjectManagementService | null>(null);
  const [openTabs, setOpenTabs] = useState<IProjectTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化服务
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new ProjectManagementService();

      // 监听事件
      const service = serviceRef.current;

      service.on('tabsChanged', (tabs) => {
        setOpenTabs([...tabs]);
      });

      service.on('activeTabChanged', (tabId) => {
        setActiveTabId(tabId || null);
      });

      service.on('projectOpened', (project) => {
        console.log('项目已打开:', project.name);
        setError(null);
      });

      service.on('projectClosed', (projectId) => {
        console.log('项目已关闭:', projectId);
      });

      service.on('projectSaved', (project) => {
        console.log('项目已保存:', project.name);
      });

      service.on('projectRenamed', (projectId, newName) => {
        console.log('项目已重命名:', projectId, newName);
      });

      service.on('projectDeleted', (projectId) => {
        console.log('项目已删除:', projectId);
      });

      // 初始化状态
      setOpenTabs(service.getOpenTabs());
      setActiveTabId(service.getActiveTabId());
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  // 打开项目
  const openProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.openProject(projectId);
        if (!success) {
          setError('打开项目失败');
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '打开项目时发生未知错误';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 关闭项目
  const closeProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.closeProject(projectId);
        if (!success) {
          setError('关闭项目失败');
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '关闭项目时发生未知错误';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 切换标签页
  const switchToTab = useCallback(async (tabId: string): Promise<boolean> => {
    if (!serviceRef.current) return false;

    try {
      return await serviceRef.current.switchToTab(tabId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '切换标签页时发生未知错误';
      setError(errorMessage);
      return false;
    }
  }, []);

  // 重新排序标签页
  const reorderTabs = useCallback((tabs: IProjectTab[]): void => {
    if (!serviceRef.current) return;

    try {
      serviceRef.current.reorderTabs(tabs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '重新排序标签页时发生未知错误';
      setError(errorMessage);
    }
  }, []);

  // 保存项目
  const saveProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.saveProject(projectId);
        if (!success) {
          setError('保存项目失败');
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '保存项目时发生未知错误';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 保存所有项目
  const saveAllProjects = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const dirtyTabs = openTabs.filter((tab) => tab.isDirty);

      for (const tab of dirtyTabs) {
        await serviceRef.current.saveProject(tab.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '保存所有项目时发生未知错误';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [openTabs]);

  // 重命名项目
  const renameProject = useCallback(
    async (projectId: string, newName: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.renameProject(
          projectId,
          newName,
        );
        if (!success) {
          setError('重命名项目失败');
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '重命名项目时发生未知错误';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 删除项目
  const deleteProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.softDeleteProject(projectId);
        if (!success) {
          setError('删除项目失败');
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '删除项目时发生未知错误';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 获取当前活动项目
  const getActiveProject = useCallback(async () => {
    if (!serviceRef.current) return null;

    try {
      return await serviceRef.current.getActiveProject();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取活动项目时发生未知错误';
      setError(errorMessage);
      return null;
    }
  }, []);

  // 标记项目为已修改
  const markProjectDirty = useCallback((projectId: string): void => {
    if (!serviceRef.current) return;

    try {
      serviceRef.current.markProjectDirty(projectId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '标记项目状态时发生未知错误';
      setError(errorMessage);
    }
  }, []);

  // 设置编辑器实例
  const setEditor = useCallback((editor: GAssetForgeEditor): void => {
    if (serviceRef.current) {
      serviceRef.current.setEditor(editor);
    }
  }, []);

  // 检查是否有未保存的更改
  const hasUnsavedChanges = useCallback((): boolean => {
    return openTabs.some((tab) => tab.isDirty);
  }, [openTabs]);

  return {
    // 状态
    openTabs,
    activeTabId,
    isLoading,
    error,

    // 操作方法
    openProject,
    closeProject,
    switchToTab,
    reorderTabs,
    saveProject,
    saveAllProjects,
    renameProject,
    deleteProject,

    // 工具方法
    setEditor,
    getActiveProject,
    markProjectDirty,
    hasUnsavedChanges,
  };
};
