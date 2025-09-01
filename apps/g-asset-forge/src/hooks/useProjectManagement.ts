/**
 * 项目管理Hook - 统一状态管理解决方案
 * 解决双重状态管理、状态同步和画布初始化问题
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type IProjectTab } from '../components/ProjectLibraryPanel/types';
import { ProjectManagementService } from '../services/ProjectManagementService';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../utils/canvasStateManager';

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
  getDataIsolationStatus: () => any;
}

/**
 * 项目管理Hook - 统一状态管理版本
 * 解决双重状态管理问题，提供可靠的画布状态管理
 */
export const useProjectManagement = (
  externalService?: ProjectManagementService,
): UseProjectManagementReturn => {
  // 服务实例管理
  const serviceRef = useRef<ProjectManagementService | null>(null);
  const canvasManagerRef = useRef<CanvasStateManager | null>(null);
  const isInitializedRef = useRef(false);

  // React 状态 - 作为唯一的状态源
  const [openTabs, setOpenTabs] = useState<IProjectTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 状态同步锁，防止循环更新
  const syncLockRef = useRef(false);

  // 初始化服务（仅执行一次）
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('初始化项目管理服务');

    // 创建或使用外部服务
    const service = externalService || new ProjectManagementService();
    serviceRef.current = service;

    // 创建画布状态管理器
    canvasManagerRef.current = createCanvasStateManager();

    // 从服务获取初始状态
    const initialTabs = service.getOpenTabs();
    const initialActiveTabId = service.getActiveTabId();

    console.log('初始状态同步:', {
      tabsCount: initialTabs.length,
      activeTabId: initialActiveTabId,
    });

    // 设置初始状态
    setOpenTabs([...initialTabs]);
    setActiveTabId(initialActiveTabId);

    // 绑定服务事件到React状态更新
    const handleTabsChanged = (tabs: IProjectTab[]) => {
      if (syncLockRef.current) return;

      console.log('服务事件：标签页变化', tabs.length);
      setOpenTabs((prevTabs) => {
        // 深度比较避免不必要的更新
        const prevIds = prevTabs.map((t) => t.id).sort();
        const newIds = tabs.map((t) => t.id).sort();

        if (JSON.stringify(prevIds) !== JSON.stringify(newIds)) {
          console.log('标签页列表确实发生变化，更新状态');
          return [...tabs];
        }

        // 检查标签页属性是否有变化
        const hasChanges = tabs.some((newTab) => {
          const prevTab = prevTabs.find((t) => t.id === newTab.id);
          return (
            !prevTab ||
            prevTab.name !== newTab.name ||
            prevTab.isActive !== newTab.isActive ||
            prevTab.isDirty !== newTab.isDirty
          );
        });

        if (hasChanges) {
          console.log('标签页属性发生变化，更新状态');
          return [...tabs];
        }

        return prevTabs;
      });
    };

    const handleActiveTabChanged = (tabId: string) => {
      if (syncLockRef.current) return;

      console.log('服务事件：活动标签页变化', tabId);
      setActiveTabId((prevActiveTabId) => {
        const newActiveTabId = tabId || null;
        if (prevActiveTabId !== newActiveTabId) {
          console.log('活动标签页确实发生变化，更新状态');
          return newActiveTabId;
        }
        return prevActiveTabId;
      });
    };

    const handleProjectOpened = (project: any) => {
      console.log('服务事件：项目已打开', project.name);
      setError(null);

      // 验证画布状态
      if (canvasManagerRef.current) {
        const canvasState = canvasManagerRef.current.getCanvasState();
        if (!canvasState.hasValidCanvas) {
          console.log('项目打开后检测到画布状态异常，尝试恢复');
          canvasManagerRef.current.attemptCanvasRecovery();
        }
      }
    };

    const handleProjectClosed = (projectId: string) => {
      console.log('服务事件：项目已关闭', projectId);
    };

    // 绑定事件监听器
    service.on('tabsChanged', handleTabsChanged);
    service.on('activeTabChanged', handleActiveTabChanged);
    service.on('projectOpened', handleProjectOpened);
    service.on('projectClosed', handleProjectClosed);

    isInitializedRef.current = true;

    // 清理函数
    return () => {
      if (serviceRef.current) {
        serviceRef.current.off('tabsChanged', handleTabsChanged);
        serviceRef.current.off('activeTabChanged', handleActiveTabChanged);
        serviceRef.current.off('projectOpened', handleProjectOpened);
        serviceRef.current.off('projectClosed', handleProjectClosed);
      }
    };
  }, [externalService]);

  // 定期状态同步和健康检查
  useEffect(() => {
    if (!serviceRef.current || !isInitializedRef.current) return;

    const healthCheckInterval = setInterval(() => {
      if (syncLockRef.current) return;

      try {
        const service = serviceRef.current!;
        const serviceTabs = service.getOpenTabs();
        const serviceActiveTabId = service.getActiveTabId();

        // 检查状态是否不同步
        const isTabsOutOfSync = serviceTabs.length !== openTabs.length;
        const isActiveTabOutOfSync = serviceActiveTabId !== activeTabId;

        if (isTabsOutOfSync || isActiveTabOutOfSync) {
          console.log('检测到状态不同步，触发同步:', {
            serviceTabs: serviceTabs.length,
            reactTabs: openTabs.length,
            serviceActiveTabId,
            reactActiveTabId: activeTabId,
          });

          // 使用服务状态作为权威源进行同步
          syncLockRef.current = true;
          setOpenTabs([...serviceTabs]);
          setActiveTabId(serviceActiveTabId);

          // 延迟解锁，避免立即触发反向同步
          setTimeout(() => {
            syncLockRef.current = false;
          }, 100);
        }

        // 检查画布状态
        if (canvasManagerRef.current) {
          const canvasState = canvasManagerRef.current.getCanvasState();
          if (canvasState.isInitialized && !canvasState.hasValidCanvas) {
            console.warn('检测到画布状态异常，尝试恢复');
            // 使用异步恢复避免阻塞
            canvasManagerRef.current.attemptCanvasRecovery().catch((error) => {
              console.error('画布恢复失败:', error);
            });
          }
        }
      } catch (error) {
        console.error('健康检查失败:', error);
      }
    }, 2000); // 每2秒检查一次

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [openTabs.length, activeTabId]);

  // 设置编辑器实例
  const setEditor = useCallback((editor: GAssetForgeEditor): void => {
    console.log('设置编辑器实例');

    if (serviceRef.current) {
      serviceRef.current.setEditor(editor);
    }

    if (canvasManagerRef.current) {
      canvasManagerRef.current.setEditor(editor);

      // 验证编辑器初始化状态
      const isValid = canvasManagerRef.current.validateEditorState();
      if (!isValid) {
        console.warn('编辑器状态验证失败，尝试恢复');
        canvasManagerRef.current.attemptCanvasRecovery();
      }
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
        } else {
          // 验证画布状态
          if (canvasManagerRef.current) {
            const canvasState = canvasManagerRef.current.getCanvasState();
            if (!canvasState.hasValidCanvas) {
              console.log('项目打开后画布状态异常，尝试恢复');
              await canvasManagerRef.current.attemptCanvasRecovery();
            }
          }
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
      const success = await serviceRef.current.switchToTab(tabId);

      if (success && canvasManagerRef.current) {
        // 验证画布状态
        const canvasState = canvasManagerRef.current.getCanvasState();
        if (!canvasState.hasValidCanvas) {
          console.log('标签页切换后画布状态异常，尝试恢复');
          await canvasManagerRef.current.attemptCanvasRecovery();
        }
      }

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '切换标签页时发生未知错误';
      setError(errorMessage);
      return false;
    }
  }, []);

  // 其他方法保持不变，但添加错误处理
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

  const hasUnsavedChanges = useCallback((): boolean => {
    return openTabs.some((tab) => tab.isDirty);
  }, [openTabs]);

  const getDataIsolationStatus = useCallback((): any => {
    if (!serviceRef.current) return null;

    // 调用服务的数据隔离状态方法
    return (serviceRef.current as any).getDataIsolationStatus?.() || null;
  }, []);

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
    getDataIsolationStatus,
  };
};
