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
import { projectManagementService } from '../services/ProjectManagementServiceSingleton';

// 模块级幂等标志，防止多组件重复初始化/重复绑定
let HOOK_INITIALIZED = false;
let EVENTS_WIRED = false;

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
  validateProjectType: (projectId: string) => Promise<boolean>;

  // 工具方法
  setEditor: (editor: GAssetForgeEditor) => void;
  getCurrentProject: () => Promise<any>;
  getCurrentProjectId: () => string | null;
  clearError: () => void;
  refreshProject: () => Promise<boolean>;

  // 性能和内存优化
  cleanup: () => void;

  // 服务实例
  projectManagementService: ProjectManagementService;
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

  // 初始化服务（仅执行一次，且全局幂等）
  useEffect(() => {
    if (isInitializedRef.current || HOOK_INITIALIZED) return;

    // 始终复用全局单例，若提供 externalService 则优先使用
    const service = externalService || projectManagementService;
    serviceRef.current = service;

    // 项目事件处理
    const handleProjectOpened = (project: any) => {
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

    const handleProjectClosed = () => {
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

    // 绑定事件监听器（只绑定一次）
    if (!EVENTS_WIRED) {
      service.on('projectOpened', handleProjectOpened);
      service.on('projectClosed', handleProjectClosed);
      service.on('projectSaved', handleProjectSaved);
      service.on('projectTypeChanged', handleProjectTypeChanged);
      service.on('projectTypeIdentified', handleProjectTypeIdentified);
      service.on('error', handleError);
      EVENTS_WIRED = true;
    }

    isInitializedRef.current = true;
    HOOK_INITIALIZED = true;

    // 清理函数：不卸载全局事件，避免多组件装载/卸载导致重复绑定/解绑
    const cleanup = () => {};

    cleanupRef.current = cleanup;

    return cleanup;
  }, [externalService]);

  // 设置编辑器实例 - 使用 useCallback 确保引用稳定
  const setEditor = useCallback((editor: GAssetForgeEditor): void => {
    if (serviceRef.current) {
      serviceRef.current.setEditor(editor);
    }
  }, []); // 空依赖数组确保引用稳定

  // 打开项目 - 事件驱动方案
  const openProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!serviceRef.current) {
        console.error('项目管理服务未初始化');
        return false;
      }

      try {
        setLoading((prev) => ({
          ...prev,
          isLoading: true,
          isInitializing: true,
        }));
        setError((prev) => ({
          ...prev,
          error: null,
          initializationError: null,
        }));

        const success = await serviceRef.current.openProject(projectId);

        setLoading((prev) => ({
          ...prev,
          isLoading: false,
          isInitializing: false,
        }));

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
  const saveProject = useCallback(async (): Promise<boolean> => {
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
  }, []);

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

  // 切换项目类型已废弃：单项目单模式策略下不再支持

  // 验证项目类型
  const validateProjectType = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current) return false;

    setLoading((prev) => ({ ...prev, isValidating: true }));
    setError((prev) => ({ ...prev, validationErrors: [] }));

    try {
      // 这里需要调用服务的项目类型验证方法
      console.log(`验证项目类型: 忽略参数，单项目单模式`);

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
  }, []);

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

    // 项目类型管理（仅校验）
    validateProjectType,

    // 工具方法
    setEditor,
    getCurrentProject,
    getCurrentProjectId,
    clearError,
    refreshProject,

    // 性能和内存优化
    cleanup,

    // 服务实例
    projectManagementService: serviceRef.current || projectManagementService,
  };
};
