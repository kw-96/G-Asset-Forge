/**
 * 简化的项目管理Hook - 单项目形式
 * 参考suika_backup的简单实现，移除复杂的状态管理
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ProjectManagementService } from '../services/ProjectManagementService';

export interface UseProjectManagementReturn {
  // 状态
  isLoading: boolean;
  error: string | null;

  // 操作方法
  openProject: (projectId: string) => Promise<boolean>;
  closeProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectId: string) => Promise<boolean>;
  renameProject: (projectId: string, newName: string) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // 工具方法
  setEditor: (editor: GAssetForgeEditor) => void;
  getCurrentProject: () => Promise<any>;
  getCurrentProjectId: () => string | null;
}

/**
 * 简化的项目管理Hook
 * 单项目形式，无需复杂的状态管理
 */
export const useProjectManagement = (
  externalService?: ProjectManagementService,
): UseProjectManagementReturn => {
  // 服务实例管理
  const serviceRef = useRef<ProjectManagementService | null>(null);
  const isInitializedRef = useRef(false);

  // React 状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化服务（仅执行一次）
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('初始化简化的项目管理服务');

    // 创建或使用外部服务
    const service = externalService || new ProjectManagementService();
    serviceRef.current = service;

    const handleProjectOpened = (project: any) => {
      console.log('项目已打开:', project.name);
      setError(null);
    };

    const handleProjectClosed = (projectId: string) => {
      console.log('项目已关闭:', projectId);
    };

    const handleProjectSaved = (project: any) => {
      console.log('项目已保存:', project.name);
    };

    // 绑定事件监听器
    service.on('projectOpened', handleProjectOpened);
    service.on('projectClosed', handleProjectClosed);
    service.on('projectSaved', handleProjectSaved);

    isInitializedRef.current = true;

    // 清理函数
    return () => {
      if (serviceRef.current) {
        serviceRef.current.off('projectOpened', handleProjectOpened);
        serviceRef.current.off('projectClosed', handleProjectClosed);
        serviceRef.current.off('projectSaved', handleProjectSaved);
      }
    };
  }, [externalService]);

  // 设置编辑器实例
  const setEditor = useCallback((editor: GAssetForgeEditor): void => {
    console.log('设置编辑器实例');

    if (serviceRef.current) {
      serviceRef.current.setEditor(editor);
    }
  }, []);

  // 打开项目
  const openProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) {
        console.error('项目管理服务未初始化');
        return false;
      }

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
        serviceRef.current.closeProject(projectId);
        return true;
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

  // 保存项目
  const saveProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setIsLoading(true);
      setError(null);

      try {
        const success = await serviceRef.current.saveProject();
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
        const success = await serviceRef.current.deleteProject(projectId);
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

  // 获取当前项目
  const getCurrentProject = useCallback(async () => {
    if (!serviceRef.current) return null;

    try {
      return await serviceRef.current.getCurrentProject();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取当前项目时发生未知错误';
      setError(errorMessage);
      return null;
    }
  }, []);

  // 获取当前项目ID
  const getCurrentProjectId = useCallback((): string | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getCurrentProjectId();
  }, []);

  return {
    // 状态
    isLoading,
    error,

    // 操作方法
    openProject,
    closeProject,
    saveProject,
    renameProject,
    deleteProject,

    // 工具方法
    setEditor,
    getCurrentProject,
    getCurrentProjectId,
  };
};
