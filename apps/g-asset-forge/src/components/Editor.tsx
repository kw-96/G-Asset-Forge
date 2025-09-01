/**
 * Editor 组件
 * 包含 Editor 的核心功能
 * 提供了 Editor 的初始化、销毁、切换模式、健康检查等功能
 * 提供了 Editor 的上下文、状态管理、事件处理等功能
 * 提供了 Editor 的性能监控、调试工具等功能
 */

import './Editor.scss';

import { pick, throttle } from '@g-asset-forge/common';
import {
  GAssetForgeEditor,
  type SettingValue,
  performanceService,
} from '@g-asset-forge/core';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { EditorContext } from '../context';
import { useProjectManagement } from '../hooks/useProjectManagement';
import { AutoSaveGraphics } from '../store/auto-save-graphs';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../utils/canvasStateManager';
import {
  createEditorHealthChecker,
  diagnoseEditorState,
  initializeEditorSafely,
} from '../utils/editorInitializer';
// import { createProjectDataIsolationTester } from '../utils/projectDataIsolationTester';
import { DataIsolationMonitor } from './DebugPanel/DataIsolationMonitor';
import { ProjectTabsDebugger } from './DebugPanel/ProjectTabsDebugger';
import { AssetLibraryPanel } from './AssetLibraryPanel/index';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ContextMenu } from './ContextMenu/ContextMenu';
import { FloatingActionButtons } from './FloatingActionButtons/FloatingActionButtons';
import { H5EditorMode } from './H5EditorMode/H5EditorMode';
import { ToolBar } from './Header/components/Toolbar/Toolbar';
import { Header } from './Header/Header';
import { InfoPanel } from './InfoPanel/InfoPanel';
import { LayerPanel } from './LayerPanel/LayerPanel';
import { Modal } from './Modal/Modal';
import { ModeSwitcher } from './ModeSwitcher/ModeSwitcher';
import { Pages } from './Pages/Pages';
import { ProjectLibraryPanel } from './ProjectLibraryPanel/ProjectLibraryPanel';
import { type IProjectMetadata } from './ProjectLibraryPanel/types';
import { TemplateLibraryPanel } from './TemplateLibraryPanel/TemplateLibraryPanel';

const topMargin = 48;
const leftRightMargin = 240 * 2;

const USER_PREFERENCE_KEY = 'g-asset-forge-user-preference';
const storeKeys: Partial<keyof SettingValue>[] = [
  'enablePixelGrid',
  'snapToGrid',
  'enableRuler',

  'keepToolSelectedAfterUse',
  'invertZoomDirection',
  'highlightLayersOnHover',
  'flipObjectsWhileResizing',
  'snapToObjects',
];

interface EditorProps {
  initialMode?: 'design' | 'h5';
  onBackToHome?: () => void;
  onOpenAssetLibrary?: () => void;
  onOpenTemplateLibrary?: () => void;
  onOpenProjectLibrary?: () => void;
  showHeader?: boolean; // 控制是否显示Header，默认true
  projectManagementService?: any; // 项目管理服务
  currentProjectId?: string | null; // 当前项目ID
}

const Editor: FC<EditorProps> = ({
  initialMode = 'design',
  onBackToHome,
  onOpenAssetLibrary,
  onOpenTemplateLibrary,
  onOpenProjectLibrary,
  showHeader = true,
  projectManagementService,
  currentProjectId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<GAssetForgeEditor | null>(null);
  const [editorMode, setEditorMode] = useState<'design' | 'h5'>(initialMode);

  // 画布状态管理器
  const canvasStateManagerRef = useRef<CanvasStateManager | null>(null);

  // 弹窗状态管理
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);

  // 项目管理Hook - 统一状态管理
  const {
    openTabs,
    activeTabId,
    isLoading: projectLoading,
    error: projectError,
    openProject,
    closeProject,
    switchToTab,
    reorderTabs,
    saveProject,
    saveAllProjects,
    renameProject,
    deleteProject,
    setEditor: setProjectEditor,
    getActiveProject,
    markProjectDirty,
    hasUnsavedChanges,
  } = useProjectManagement(projectManagementService);

  useEffect(() => {
    if (!containerRef.current) {
      console.warn('容器元素不存在，跳过编辑器初始化');
      return;
    }

    // 使用安全的编辑器初始化函数
    const initializeEditor = async () => {
      const container = containerRef.current;
      if (!container) {
        console.warn('容器元素在初始化时丢失');
        return;
      }

      const userPreferenceEncoded = localStorage.getItem(USER_PREFERENCE_KEY);
      const userPreference = userPreferenceEncoded
        ? (JSON.parse(userPreferenceEncoded) as Partial<SettingValue>)
        : undefined;

      // 确保有有效的尺寸 - 针对Electron环境优化
      const isElectron = typeof window !== 'undefined' && window.electronAPI;
      let containerWidth, containerHeight;

      if (isElectron) {
        // Electron环境：使用窗口内部尺寸
        containerWidth = Math.max(window.innerWidth - leftRightMargin, 800);
        containerHeight = Math.max(window.innerHeight - topMargin, 600);
      } else {
        // Web环境：使用容器的实际尺寸
        const containerRect = container.getBoundingClientRect();
        containerWidth = Math.max(containerRect.width || 800, 800);
        containerHeight = Math.max(containerRect.height || 600, 600);

        // 如果容器尺寸为0，使用body尺寸作为后备
        if (containerWidth === 800 && containerHeight === 600) {
          containerWidth = Math.max(
            document.body.clientWidth - leftRightMargin,
            800,
          );
          containerHeight = Math.max(
            document.body.clientHeight - topMargin,
            600,
          );
        }
      }

      console.log('Editor 初始化尺寸:', {
        containerWidth,
        containerHeight,
        isElectron,
        containerRect: container.getBoundingClientRect(),
        windowSize: { width: window.innerWidth, height: window.innerHeight },
        bodySize: {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        },
      });

      // 使用安全的初始化函数
      const initResult = await initializeEditorSafely({
        containerElement: container,
        width: containerWidth,
        height: containerHeight,
        offsetY: 48,
        offsetX: 240,
        showPerfMonitor: false,
        userPreference: userPreference,
      });

      if (!initResult.success || !initResult.editor) {
        console.error('编辑器初始化失败:', initResult.error);
        return;
      }

      const editor = initResult.editor;

      editor.setting.on(
        'update',
        (value: SettingValue, changedKey: keyof SettingValue) => {
          if (!storeKeys.includes(changedKey)) return;

          localStorage.setItem(
            USER_PREFERENCE_KEY,
            JSON.stringify(pick(value, storeKeys)),
          );
        },
      );

      (window as any).editor = editor;

      new AutoSaveGraphics(editor);

      // 初始化性能服务
      performanceService.initialize(container);

      // 设置性能服务事件监听
      performanceService.on('memoryWarning', (usage) => {
        console.warn(`内存使用警告: ${(usage / 1024 / 1024).toFixed(2)}MB`);
      });

      performanceService.on('performanceDegraded', (reason) => {
        console.warn(`性能下降: ${reason}`);
      });

      // 设置项目管理的编辑器实例
      setProjectEditor(editor);

      // 确保项目管理服务在全局可用，供其他组件使用
      if (projectManagementService) {
        (window as any).__PROJECT_MANAGEMENT_SERVICE__ =
          projectManagementService;
        console.log('项目管理服务已设置为全局可用');

        // 创建数据隔离测试工具（开发环境）
        if (import.meta.env?.DEV) {
          const { createDataIsolationTester } = await import(
            '../utils/dataIsolationTester'
          );
          const isolationTester = createDataIsolationTester(
            editor,
            projectManagementService,
          );
          (window as any).__ISOLATION_TESTER__ = isolationTester;

          // 加载数据隔离修复测试脚本
          try {
            await import('../utils/testDataIsolationFix');
            console.log('数据隔离修复测试脚本已加载');
          } catch (error) {
            console.warn('加载数据隔离修复测试脚本失败:', error);
          }

          // 加载数据隔离修复工具
          try {
            const { createDataIsolationFixer } = await import(
              '../utils/dataIsolationFixer'
            );
            const projectDocumentManager =
              projectManagementService.getProjectDocumentManager();
            if (projectDocumentManager) {
              const fixer = createDataIsolationFixer(
                editor,
                projectDocumentManager,
              );
              (window as any).__DATA_ISOLATION_FIXER_INSTANCE__ = fixer;
              console.log('数据隔离修复工具实例已创建');

              // 添加全局修复函数
              (window as any).fixDataIsolation = (projectId?: string) => {
                if (projectId) {
                  return fixer.smartFix(projectId);
                } else {
                  const currentProjectId =
                    projectManagementService.getActiveTabId();
                  if (currentProjectId) {
                    return fixer.smartFix(currentProjectId);
                  } else {
                    console.warn('没有活动项目可修复');
                    return null;
                  }
                }
              };

              (window as any).fixAllDataIsolation = () => {
                return fixer.fixAllProjects();
              };

              console.log('全局修复函数已添加:');
              console.log(
                '- fixDataIsolation(projectId?): 修复指定项目或当前项目的数据不匹配',
              );
              console.log('- fixAllDataIsolation(): 修复所有项目的数据不匹配');
            }
          } catch (error) {
            console.warn('加载数据隔离修复工具失败:', error);
          }

          console.log('项目数据隔离测试工具已准备就绪');
          console.log('可用的测试函数:');
          console.log('- testDataIsolationFix(): 完整的数据隔离修复测试');
          console.log('- quickTestIsolation(): 快速数据隔离验证');
          console.log('- testDataIsolation(): 原有的数据隔离测试');
        }
      }

      // 如果有当前项目ID，加载项目数据
      if (currentProjectId && projectManagementService) {
        const loadProjectData = async () => {
          try {
            const projectData = await projectManagementService.getProjectData(
              currentProjectId,
            );
            if (projectData && projectData.editorData) {
              // 再次验证编辑器状态
              if (!editor.doc || !editor.sceneGraph || !editor.canvasElement) {
                console.error('编辑器状态异常，无法加载项目数据');
                return;
              }

              editor.setContents(projectData.editorData);
              console.log('已加载项目数据到编辑器:', projectData.name);

              // 触发一次渲染确保数据正确显示
              editor.render();
            } else {
              console.log('项目数据为空或无效，使用默认状态');
            }
          } catch (error) {
            console.error('加载项目数据失败:', error);
          }
        };

        // 使用Promise.resolve确保在下一个事件循环中执行
        Promise.resolve().then(loadProjectData);
      }

      // 尝试手动配置编辑器设置
      try {
        // 确保滚轮缩放功能正常
        if (editor.setting) {
          console.log('编辑器设置管理器可用');
        }

        // 尝试启用标尺
        if (editor.setting) {
          console.log('编辑器设置管理器已初始化');
        }
      } catch (error) {
        console.warn('配置编辑器设置时出错:', error);
      }

      // 添加调试信息
      console.log('编辑器初始化完成:', {
        editor: !!editor,
        toolManager: !!editor.toolManager,
        viewportManager: !!editor.viewportManager,
        setting: !!editor.setting,
      });

      // 检查编辑器容器的事件绑定
      let wheelHandler: ((e: WheelEvent) => void) | null = null;

      if (containerRef.current) {
        const container = containerRef.current;
        // 等待一帧后再次检查尺寸，确保 DOM 已完全渲染
        requestAnimationFrame(() => {
          if (container) {
            console.log('编辑器容器信息 (延迟检查):', {
              element: container,
              hasEventListeners: !!(container as any)._events,
              style: container.style.cssText,
              dimensions: {
                width: container.offsetWidth,
                height: container.offsetHeight,
                clientWidth: container.clientWidth,
                clientHeight: container.clientHeight,
              },
              computedStyle: window.getComputedStyle(container),
              parentDimensions: {
                parentWidth: container.parentElement?.clientWidth,
                parentHeight: container.parentElement?.clientHeight,
              },
            });
          }
        });

        // 改进的滚轮事件处理 - 针对Electron环境优化
        wheelHandler = (e: WheelEvent) => {
          // 只在Canvas区域内处理滚轮事件
          const target = e.target as HTMLElement;
          if (!target || !containerRef.current?.contains(target)) {
            return;
          }

          console.log('编辑器滚轮事件触发:', {
            deltaY: e.deltaY,
            target: e.target,
          });

          // 阻止默认行为
          e.preventDefault();

          if (editor && editor.viewportManager) {
            const delta = e.deltaY;
            const center = editor.getCursorXY(e);

            try {
              // 使用标准的缩放方法
              if (delta > 0) {
                editor.viewportManager.zoomOut({
                  center,
                  deltaY: Math.abs(delta),
                });
              } else {
                editor.viewportManager.zoomIn({
                  center,
                  deltaY: Math.abs(delta),
                });
              }
              console.log('滚轮缩放成功:', { delta, center });
            } catch (error) {
              console.warn('滚轮缩放失败:', error);
            }
          }
        };

        // 只在容器上绑定事件，避免全局冲突
        if (containerRef.current) {
          containerRef.current.addEventListener('wheel', wheelHandler, {
            passive: false,
          });
          console.log('已绑定编辑器滚轮事件监听器');
        }

        // 添加更多调试信息
        console.log('编辑器状态检查:', {
          hasEditor: !!editor,
          hasToolManager: !!editor?.toolManager,
          hasViewportManager: !!editor?.viewportManager,
          hasSetting: !!editor?.setting,
          containerElement: !!containerRef.current,
          containerStyle: containerRef.current?.style.cssText,
        });
      }

      const changeViewport = throttle(
        () => {
          const newWidth = Math.max(
            document.body.clientWidth - leftRightMargin,
            800,
          );
          const newHeight = Math.max(
            document.body.clientHeight - topMargin,
            600,
          );

          console.log('视口尺寸更新:', { newWidth, newHeight });

          editor.viewportManager.setViewportSize({
            width: newWidth,
            height: newHeight,
          });
          editor.render();
        },
        10,
        { leading: false },
      );

      // 使用 passive: true 来避免滚轮事件冲突
      window.addEventListener('resize', changeViewport, { passive: true });

      // 初始化画布状态管理器
      if (!canvasStateManagerRef.current) {
        canvasStateManagerRef.current = createCanvasStateManager();
      }
      canvasStateManagerRef.current.setEditor(editor);

      // 启动编辑器健康检查
      const stopHealthCheck = createEditorHealthChecker(editor);

      // 输出诊断信息（仅在开发环境）
      if (import.meta.env?.DEV) {
        setTimeout(() => {
          diagnoseEditorState(editor);
        }, 1000);
      }

      setEditor(editor);

      return () => {
        try {
          // 停止健康检查
          stopHealthCheck();

          // 销毁画布状态管理器
          if (canvasStateManagerRef.current) {
            canvasStateManagerRef.current.destroy();
            canvasStateManagerRef.current = null;
          }

          // 移除滚轮事件监听器
          if (containerRef.current && wheelHandler) {
            containerRef.current.removeEventListener('wheel', wheelHandler);
          }

          // 安全检查编辑器是否存在且未被销毁
          if (editor && editor.containerElement) {
            editor.destroy();
          }

          window.removeEventListener('resize', changeViewport);
          changeViewport.cancel();

          console.log('Editor组件清理完成');
        } catch (error) {
          console.warn('Editor组件清理过程中出现警告:', error);
        }
      };
    };

    // 使用requestAnimationFrame确保DOM完全渲染后再初始化
    const rafId = requestAnimationFrame(async () => {
      // 再次检查容器是否存在
      if (containerRef.current) {
        await initializeEditor();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    containerRef,
    setProjectEditor,
    currentProjectId,
    projectManagementService,
  ]);

  const handleModeSwitch = (mode: 'design' | 'h5') => {
    setEditorMode(mode);
  };

  // 弹窗处理函数
  const handleOpenAssetLibraryModal = useCallback(() => {
    setShowAssetLibrary(true);
    onOpenAssetLibrary?.();
  }, [onOpenAssetLibrary]);

  const handleOpenTemplateLibraryModal = useCallback(() => {
    setShowTemplateLibrary(true);
    onOpenTemplateLibrary?.();
  }, [onOpenTemplateLibrary]);

  const handleOpenProjectLibraryModal = useCallback(() => {
    setShowProjectLibrary(true);
    onOpenProjectLibrary?.();
  }, [onOpenProjectLibrary]);

  // 素材库事件处理
  const handleAssetSelect = useCallback((asset: any) => {
    console.log('选择素材:', asset);
    // TODO: 将素材添加到画布
  }, []);

  const handleAssetDoubleClick = useCallback((asset: any) => {
    console.log('双击素材:', asset);
    // TODO: 将素材添加到画布并关闭弹窗
    setShowAssetLibrary(false);
  }, []);

  // 模板库事件处理
  const handleTemplateSelect = useCallback((template: any) => {
    console.log('选择模板:', template);
  }, []);

  const handleTemplateApply = useCallback(
    (template: any, result?: any) => {
      console.log('应用模板:', template, result);

      if (result && result.editorData && editor) {
        try {
          // 应用模板数据到编辑器
          editor.setContents(result.editorData);
          console.log('模板应用成功:', result.templateInfo);
          setShowTemplateLibrary(false);
        } catch (error) {
          console.error('应用模板到编辑器失败:', error);
        }
      }
    },
    [editor],
  );

  const handleTemplatePreview = useCallback((template: any) => {
    console.log('预览模板:', template);
    // TODO: 实现模板预览功能
  }, []);

  const handleTemplateEdit = useCallback((template: any) => {
    console.log('编辑模板:', template);
    // TODO: 实现模板编辑功能
  }, []);

  const handleTemplateSave = useCallback((templateData: any) => {
    console.log('保存模板:', templateData);
    // TODO: 实现模板保存功能
  }, []);

  // 项目库事件处理
  const handleProjectOpen = useCallback(
    async (project: IProjectMetadata) => {
      console.log('打开项目:', project);

      try {
        const success = await openProject(project.id);
        if (success) {
          setShowProjectLibrary(false);

          // 加载项目数据到编辑器
          const projectData = await getActiveProject();
          if (projectData && editor) {
            editor.setContents(projectData.editorData);
            console.log('项目数据已加载到编辑器');
          }
        }
      } catch (error) {
        console.error('打开项目失败:', error);
      }
    },
    [openProject, getActiveProject, editor],
  );

  const handleProjectCreate = useCallback(async () => {
    try {
      if (projectManagementService) {
        // 使用传入的项目管理服务创建项目
        const projectResult = await projectManagementService.createProject({
          name: '新项目',
          description: '',
          type: editorMode,
        });

        if (projectResult) {
          console.log('项目创建成功:', projectResult);

          // 打开创建的项目
          const success = await openProject(projectResult.id);
          if (success) {
            console.log('创建并打开新项目:', projectResult.name);

            // 等待一小段时间确保状态更新
            setTimeout(async () => {
              // 加载项目数据到编辑器
              const projectData = await getActiveProject();
              if (projectData && editor) {
                try {
                  editor.setContents(projectData.editorData);
                  console.log('项目数据已加载到编辑器');
                } catch (error) {
                  console.error('加载项目数据到编辑器失败:', error);
                }
              }

              // 调试信息：检查标签页状态
              console.log('当前打开的标签页:', openTabs);
              console.log('当前活动标签页ID:', activeTabId);
            }, 100);
          } else {
            console.error('打开新创建的项目失败');
          }
        } else {
          console.error('创建项目失败');
        }
      } else {
        console.error('项目管理服务未初始化');
      }
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  }, [
    editorMode,
    openProject,
    editor,
    projectManagementService,
    getActiveProject,
    openTabs,
    activeTabId,
  ]);

  const handleProjectRename = useCallback(
    async (project: IProjectMetadata, newName: string) => {
      console.log('重命名项目:', project.id, newName);

      try {
        await renameProject(project.id, newName);
      } catch (error) {
        console.error('重命名项目失败:', error);
      }
    },
    [renameProject],
  );

  const handleProjectDelete = useCallback(
    async (project: IProjectMetadata) => {
      console.log('删除项目:', project.id);

      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('删除项目失败:', error);
      }
    },
    [deleteProject],
  );

  // 标签页事件处理
  const handleTabSelect = useCallback(
    async (tabId: string) => {
      await switchToTab(tabId);
    },
    [switchToTab],
  );

  const handleTabClose = useCallback(
    async (tabId: string) => {
      await closeProject(tabId);
    },
    [closeProject],
  );

  const handleTabsReorder = useCallback(
    (tabs: any[]) => {
      reorderTabs(tabs);
    },
    [reorderTabs],
  );

  // 监听当前项目ID变化，加载项目数据
  useEffect(() => {
    if (currentProjectId && editor && projectManagementService) {
      const loadProjectData = async () => {
        try {
          // 验证编辑器状态
          if (!editor.doc || !editor.sceneGraph || !editor.canvasElement) {
            console.warn('编辑器未完全初始化，跳过项目数据加载');
            return;
          }

          const projectData = await projectManagementService.getProjectData(
            currentProjectId,
          );
          if (projectData && projectData.editorData) {
            // 再次验证编辑器状态（异步操作后可能发生变化）
            if (!editor.doc || !editor.sceneGraph || !editor.canvasElement) {
              console.warn('编辑器状态在异步操作后发生变化，跳过数据加载');
              return;
            }

            editor.setContents(projectData.editorData);
            editor.render();
            console.log('项目数据已更新到编辑器:', projectData.name);
          } else {
            console.log('项目数据为空，保持当前状态');
          }
        } catch (error) {
          console.error('加载项目数据失败:', error);
        }
      };

      // 使用微任务确保在下一个事件循环中执行
      Promise.resolve().then(loadProjectData);
    }
  }, [currentProjectId, editor, projectManagementService]);

  // 监听编辑器内容变化，标记项目为已修改
  useEffect(() => {
    if (!editor || !activeTabId) return;

    const handleContentChange = () => {
      markProjectDirty(activeTabId);
    };

    // 监听编辑器的内容变化事件
    editor.commandManager.on('change', handleContentChange);

    // 额外监听画布渲染事件，确保能捕获到内容变化
    try {
      if (editor.sceneGraph && editor.sceneGraph.on) {
        const handleRender = () => {
          console.log('画布渲染事件触发，可能表示内容变化');
          // 延迟标记，避免频繁更新
          setTimeout(() => {
            markProjectDirty(activeTabId);
          }, 1000);
        };

        editor.sceneGraph.on('render', handleRender);
        console.log('已监听编辑器sceneGraph.render事件');

        // 保存引用以便清理
        (editor.sceneGraph as any)._renderHandler = handleRender;
      }
    } catch (error) {
      console.warn('监听编辑器render事件失败:', error);
    }

    return () => {
      try {
        editor.commandManager.off('change', handleContentChange);
        if (editor.sceneGraph && editor.sceneGraph.off) {
          const renderHandler = (editor.sceneGraph as any)._renderHandler;
          if (renderHandler) {
            editor.sceneGraph.off('render', renderHandler);
          }
        }
        console.log('已清理编辑器事件监听器');
      } catch (error) {
        console.warn('清理编辑器事件监听器失败:', error);
      }
    };
  }, [editor, activeTabId, markProjectDirty]);

  // 自动保存功能
  useEffect(() => {
    if (!activeTabId) return;

    const autoSaveInterval = setInterval(async () => {
      if (hasUnsavedChanges() && editor) {
        try {
          // 获取当前编辑器内容
          const editorData = JSON.parse(editor.sceneGraph.toJSON());

          // 更新项目数据（这里需要实现获取项目数据的方法）
          // TODO: 实现updateProjectData方法

          // 保存项目
          await saveProject(activeTabId);
          console.log('项目自动保存成功');
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }
    }, 30000); // 30秒自动保存一次

    return () => clearInterval(autoSaveInterval);
  }, [activeTabId, hasUnsavedChanges, editor, saveProject]);

  return (
    <div>
      <EditorContext.Provider
        value={{
          editor,
          projectTabs: openTabs,
          activeTabId,
          onTabSelect: handleTabSelect,
          onTabClose: handleTabClose,
        }}
      >
        {/* 统一的Header - 两个模式共用，集成项目标签页 */}
        {showHeader && (
          <Header
            title="g-asset-forge"
            projectTabs={openTabs}
            activeTabId={activeTabId || undefined}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onTabsReorder={handleTabsReorder}
            onBackToHome={onBackToHome}
            showHomeButton={!!onBackToHome}
            onCreateProject={handleProjectCreate}
          >
            <div className="header-controls">
              <ModeSwitcher
                currentMode={editorMode}
                onModeChange={handleModeSwitch}
              />
            </div>
          </Header>
        )}

        {/* 主体内容区域 */}
        <div className="body">
          {editorMode === 'h5' ? (
            <H5EditorMode onModeSwitch={handleModeSwitch} />
          ) : (
            <>
              <div className="g-asset-forge-editor-left-area">
                <Pages />
                <LayerPanel />
              </div>
              <div ref={containerRef} className="editor-canvas-container" />
              <InfoPanel />
              <ContextMenu />
            </>
          )}

          {/* 悬浮工具栏 - 两个模式共用，位于画布下方中间 */}
          <div className="floating-toolbar-container">
            <ToolBar />
          </div>
        </div>

        {/* 悬浮操作按钮 - 在所有模式下都显示 */}
        <FloatingActionButtons
          onOpenAssetLibrary={handleOpenAssetLibraryModal}
          onOpenTemplateLibrary={handleOpenTemplateLibraryModal}
          onOpenProjectLibrary={handleOpenProjectLibraryModal}
        />

        {/* 素材库弹窗 */}
        <Modal
          isOpen={showAssetLibrary}
          onClose={() => setShowAssetLibrary(false)}
          title="素材库"
          size="large"
        >
          <AssetLibraryPanel
            onAssetSelect={handleAssetSelect}
            onAssetDoubleClick={handleAssetDoubleClick}
          />
        </Modal>

        {/* 模板库弹窗 */}
        <Modal
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          title="模板库"
          size="large"
        >
          <TemplateLibraryPanel
            onTemplateSelect={handleTemplateSelect}
            onTemplatePreview={handleTemplatePreview}
            onTemplateApply={handleTemplateApply}
            onTemplateEdit={handleTemplateEdit}
            onTemplateSave={handleTemplateSave}
          />
        </Modal>

        {/* 项目库弹窗 */}
        <Modal
          isOpen={showProjectLibrary}
          onClose={() => setShowProjectLibrary(false)}
          title="项目库"
          size="large"
        >
          <ProjectLibraryPanel
            onProjectOpen={handleProjectOpen}
            onProjectCreate={handleProjectCreate}
            onProjectRename={handleProjectRename}
            onProjectDelete={handleProjectDelete}
          />
        </Modal>

        {/* 性能监控器 */}
        <PerformanceMonitor
          visible={import.meta.env?.DEV || false}
          position="top-right"
        />

        {/* 开发环境调试器 */}
        {import.meta.env?.DEV && (
          <>
            <ProjectTabsDebugger />
            <DataIsolationMonitor />
          </>
        )}
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
