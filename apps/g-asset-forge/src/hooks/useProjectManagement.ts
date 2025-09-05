/**
 * 项目管理Hook - 重构版本
 * 集成新的项目管理架构和状态管理，支持项目类型状态管理
 */
import {
  type GAssetForgeEditor,
  ProjectType,
  type ProjectTypeIdentificationResult,
} from '@g-asset-forge/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import ProjectManagementService from '../services/ProjectManagementService';

/**
 * 项目加载状态
 */
export interface ProjectLoadingState {
  isLoading: boolean;
  isValidating: boolean;
  isInitializing: boolean;
  isSwitchingType: boolean;
}

/**
 * 项目错误状态
 */
export interface ProjectErrorState {
  error: string | null;
  validationErrors: string[];
  initializationError: string | null;
  typeError: string | null;
}

/**
 * 项目类型状态
 */
export interface ProjectTypeState {
  currentType: ProjectType | null;
  previousType: ProjectType | null;
  identificationResult: ProjectTypeIdentificationResult | null;
  isTypeChanging: boolean;
}

/**
 * 项目状态
 */
export interface ProjectState {
  currentProjectId: string | null;
  currentProject: any | null;
  isProjectOpen: boolean;
  hasUnsavedChanges: boolean;
}

export interface UseProjectManagementReturn {
  // 状态
  loading: ProjectLoadingState;
  error: ProjectErrorState;
  projectType: ProjectTypeState;
  project: ProjectState;

  // 操作方法
  openProject: (projectId: string) => Promise<boolean>;
  closeProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectId?: string) => Promise<boolean>;
  renameProject: (projectId: string, newName: string) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // 项目类型管理
  switchProjectType: (
    projectId: string,
    newType: ProjectType,
  ) => Promise<boolean>;
  validateProjectType: (projectId: string) => Promise<boolean>;

  // 工具方法
  setEditor: (editor: GAssetForgeEditor) => void;
  getCurrentProject: () => Promise<any>;
  getCurrentProjectId: () => string | null;
  clearError: () => void;
  refreshProject: () => Promise<boolean>;

  // 性能和内存优化
  cleanup: () => void;
}

/**
 * 项目管理Hook - 重构版本
 * 集成新的项目管理架构和状态管理
 */
export const useProjectManagement = (
  externalService?: ProjectManagementService,
): UseProjectManagementReturn => {
  // 服务实例管理
  const serviceRef = useRef<ProjectManagementService | null>(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 加载状态
  const [loading, setLoading] = useState<ProjectLoadingState>({
    isLoading: false,
    isValidating: false,
    isInitializing: false,
    isSwitchingType: false,
  });

  // 错误状态
  const [error, setError] = useState<ProjectErrorState>({
    error: null,
    validationErrors: [],
    initializationError: null,
    typeError: null,
  });

  // 项目类型状态
  const [projectType, setProjectType] = useState<ProjectTypeState>({
    currentType: null,
    previousType: null,
    identificationResult: null,
    isTypeChanging: false,
  });

  // 项目状态
  const [project, setProject] = useState<ProjectState>({
    currentProjectId: null,
    currentProject: null,
    isProjectOpen: false,
    hasUnsavedChanges: false,
  });

  // 初始化服务（仅执行一次）
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('初始化项目管理服务 - 重构版本');

    // 创建或使用外部服务
    const service = externalService || new ProjectManagementService();
    serviceRef.current = service;

    // 项目事件处理
    const handleProjectOpened = (project: any) => {
      console.log('项目已打开:', project.name);
      setProject((prev) => ({
        ...prev,
        currentProjectId: project.id,
        currentProject: project,
        isProjectOpen: true,
        hasUnsavedChanges: false,
      }));
      setError((prev) => ({ ...prev, error: null, initializationError: null }));
      setLoading((prev) => ({
        ...prev,
        isLoading: false,
        isInitializing: false,
      }));
    };

    const handleProjectClosed = (projectId: string) => {
      console.log('项目已关闭:', projectId);
      setProject((prev) => ({
        ...prev,
        currentProjectId: null,
        currentProject: null,
        isProjectOpen: false,
        hasUnsavedChanges: false,
      }));
      setProjectType((prev) => ({
        ...prev,
        currentType: null,
        previousType: prev.currentType,
        identificationResult: null,
      }));
    };

    const handleProjectSaved = (project: any) => {
      console.log('项目已保存:', project.name);
      setProject((prev) => ({
        ...prev,
        currentProject: project,
        hasUnsavedChanges: false,
      }));
      setError((prev) => ({ ...prev, error: null }));
    };

    // 项目类型事件处理
    const handleProjectTypeChanged = (
      projectId: string,
      oldType: ProjectType | null,
      newType: ProjectType,
    ) => {
      console.log(`项目类型变更: ${projectId} 从 ${oldType} 变为 ${newType}`);
      setProjectType((prev) => ({
        ...prev,
        previousType: oldType,
        currentType: newType,
        isTypeChanging: false,
      }));
      setLoading((prev) => ({ ...prev, isSwitchingType: false }));
    };

    const handleProjectTypeIdentified = (
      projectId: string,
      result: ProjectTypeIdentificationResult,
    ) => {
      console.log(`项目类型识别完成: ${projectId}`, result);
      setProjectType((prev) => ({
        ...prev,
        identificationResult: result,
        currentType: result.type,
      }));
    };

    // 错误事件处理
    const handleError = (error: Error) => {
      console.error('项目管理服务错误:', error);
      setError((prev) => ({
        ...prev,
        error: error.message,
      }));
      setLoading({
        isLoading: false,
        isValidating: false,
        isInitializing: false,
        isSwitchingType: false,
      });
    };

    // 绑定事件监听器
    service.on('projectOpened', handleProjectOpened);
    service.on('projectClosed', handleProjectClosed);
    service.on('projectSaved', handleProjectSaved);
    service.on('projectTypeChanged', handleProjectTypeChanged);
    service.on('projectTypeIdentified', handleProjectTypeIdentified);
    service.on('error', handleError);

    isInitializedRef.current = true;

    // 清理函数
    const cleanup = () => {
      if (serviceRef.current) {
        serviceRef.current.off('projectOpened', handleProjectOpened);
        serviceRef.current.off('projectClosed', handleProjectClosed);
        serviceRef.current.off('projectSaved', handleProjectSaved);
        serviceRef.current.off('projectTypeChanged', handleProjectTypeChanged);
        serviceRef.current.off(
          'projectTypeIdentified',
          handleProjectTypeIdentified,
        );
        serviceRef.current.off('error', handleError);
      }
    };

    cleanupRef.current = cleanup;

    return cleanup;
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

      setLoading((prev) => ({
        ...prev,
        isLoading: true,
        isInitializing: true,
      }));
      setError((prev) => ({ ...prev, error: null, initializationError: null }));

      try {
        const success = await serviceRef.current.openProject(projectId);
        if (!success) {
          setError((prev) => ({ ...prev, error: '打开项目失败' }));
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '打开项目时发生未知错误';
        setError((prev) => ({
          ...prev,
          error: errorMessage,
          initializationError: errorMessage,
        }));
        return false;
      } finally {
        setLoading((prev) => ({
          ...prev,
          isLoading: false,
          isInitializing: false,
        }));
      }
    },
    [],
  );

  // 关闭项目
  const closeProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isLoading: true }));
      setError((prev) => ({ ...prev, error: null }));

      try {
        serviceRef.current.closeProject(projectId);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '关闭项目时发生未知错误';
        setError((prev) => ({ ...prev, error: errorMessage }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [],
  );

  // 保存项目
  const saveProject = useCallback(
    async (projectId?: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isLoading: true }));
      setError((prev) => ({ ...prev, error: null }));

      try {
        const success = await serviceRef.current.saveProject();
        if (!success) {
          setError((prev) => ({ ...prev, error: '保存项目失败' }));
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '保存项目时发生未知错误';
        setError((prev) => ({ ...prev, error: errorMessage }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [],
  );

  // 重命名项目
  const renameProject = useCallback(
    async (projectId: string, newName: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isLoading: true }));
      setError((prev) => ({ ...prev, error: null }));

      try {
        const success = await serviceRef.current.renameProject(
          projectId,
          newName,
        );
        if (!success) {
          setError((prev) => ({ ...prev, error: '重命名项目失败' }));
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '重命名项目时发生未知错误';
        setError((prev) => ({ ...prev, error: errorMessage }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [],
  );

  // 删除项目
  const deleteProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isLoading: true }));
      setError((prev) => ({ ...prev, error: null }));

      try {
        const success = await serviceRef.current.deleteProject(projectId);
        if (!success) {
          setError((prev) => ({ ...prev, error: '删除项目失败' }));
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '删除项目时发生未知错误';
        setError((prev) => ({ ...prev, error: errorMessage }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [],
  );

  // 切换项目类型
  const switchProjectType = useCallback(
    async (projectId: string, newType: ProjectType): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isSwitchingType: true }));
      setProjectType((prev) => ({ ...prev, isTypeChanging: true }));
      setError((prev) => ({ ...prev, typeError: null }));

      try {
        // 这里需要调用服务的项目类型切换方法
        // 由于当前服务可能没有这个方法，我们先模拟实现
        console.log(`切换项目类型: ${projectId} -> ${newType}`);

        // 模拟切换逻辑
        setProjectType((prev) => ({
          ...prev,
          previousType: prev.currentType,
          currentType: newType,
          isTypeChanging: false,
        }));

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '切换项目类型时发生未知错误';
        setError((prev) => ({ ...prev, typeError: errorMessage }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isSwitchingType: false }));
        setProjectType((prev) => ({ ...prev, isTypeChanging: false }));
      }
    },
    [],
  );

  // 验证项目类型
  const validateProjectType = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) return false;

      setLoading((prev) => ({ ...prev, isValidating: true }));
      setError((prev) => ({ ...prev, validationErrors: [] }));

      try {
        // 这里需要调用服务的项目类型验证方法
        console.log(`验证项目类型: ${projectId}`);

        // 模拟验证逻辑
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '验证项目类型时发生未知错误';
        setError((prev) => ({
          ...prev,
          validationErrors: [errorMessage],
        }));
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, isValidating: false }));
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
      setError((prev) => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  // 获取当前项目ID
  const getCurrentProjectId = useCallback((): string | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getCurrentProjectId();
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError({
      error: null,
      validationErrors: [],
      initializationError: null,
      typeError: null,
    });
  }, []);

  // 刷新项目
  const refreshProject = useCallback(async (): Promise<boolean> => {
    const currentProjectId = getCurrentProjectId();
    if (!currentProjectId) return false;

    return await openProject(currentProjectId);
  }, [getCurrentProjectId, openProject]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (serviceRef.current) {
      // 如果服务有destroy方法，调用它
      if (typeof serviceRef.current.destroy === 'function') {
        serviceRef.current.destroy();
      }
      serviceRef.current = null;
    }

    // 重置所有状态
    setLoading({
      isLoading: false,
      isValidating: false,
      isInitializing: false,
      isSwitchingType: false,
    });
    setError({
      error: null,
      validationErrors: [],
      initializationError: null,
      typeError: null,
    });
    setProjectType({
      currentType: null,
      previousType: null,
      identificationResult: null,
      isTypeChanging: false,
    });
    setProject({
      currentProjectId: null,
      currentProject: null,
      isProjectOpen: false,
      hasUnsavedChanges: false,
    });

    isInitializedRef.current = false;
  }, []);

  // 性能优化：在组件卸载时自动清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // 状态
    loading,
    error,
    projectType,
    project,

    // 操作方法
    openProject,
    closeProject,
    saveProject,
    renameProject,
    deleteProject,

    // 项目类型管理
    switchProjectType,
    validateProjectType,

    // 工具方法
    setEditor,
    getCurrentProject,
    getCurrentProjectId,
    clearError,
    refreshProject,

    // 性能和内存优化
    cleanup,
  };
};
