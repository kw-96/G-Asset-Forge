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
  performanceService,
  ProjectType,
  type SettingValue,
} from '@g-asset-forge/core';
import {
  type FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { EditorContext } from '../context';
import { appEventEmitter } from '../events';
import { useProjectManagement } from '../hooks/useProjectManagement';
import { AutoSaveGraphics } from '../store/auto-save-graphs';
import {
  createEditorHealthChecker,
  diagnoseEditorState,
  initializeEditorSafely,
} from '../utils/editorInitializer';
import { AssetLibraryPanel } from './AssetLibraryPanel/index';
import { ContextMenu } from './ContextMenu/ContextMenu';
import { FloatingActionButtons } from './FloatingActionButtons/FloatingActionButtons';
import { H5EditorMode } from './H5EditorMode/H5EditorMode';
import { ToolBar } from './Header/components/Toolbar/Toolbar';
import { Header } from './Header/Header';
import { InfoPanel } from './InfoPanel/InfoPanel';
import { LayerPanel } from './LayerPanel/LayerPanel';
import { Modal } from './Modal/Modal';
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
  onModeSwitch?: (newMode: 'design' | 'h5') => void; // 模式切换回调
  enableModeTransition?: boolean; // 启用模式切换动画
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
  onModeSwitch,
  enableModeTransition = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<GAssetForgeEditor | null>(null);
  const [editorMode, setEditorMode] = useState<'design' | 'h5'>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 监听 initialMode 变化，同步更新 editorMode
  useEffect(() => {
    if (initialMode !== editorMode) {
      console.log('Editor模式同步更新:', { from: editorMode, to: initialMode });
      setEditorMode(initialMode);
    }
  }, [initialMode, editorMode]);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // 防重复初始化标志位
  const isEditorInitializedRef = useRef(false);

  // 弹窗状态管理
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);

  // 项目管理Hook - 重构版本，集成新的状态管理
  const projectManagement = useProjectManagement(projectManagementService);

  // 直接使用 projectManagement，避免不必要的 useMemo 优化
  const {
    loading,
    error,
    projectType,
    project,
    openProject,
    renameProject,
    deleteProject,
    setEditor: setProjectEditor,
    getCurrentProject,
    clearError,
    refreshProject,
  } = projectManagement;

  // 模式切换处理函数
  const handleModeSwitch = useCallback(
    async (newMode: 'design' | 'h5') => {
      if (newMode === editorMode || isTransitioning) {
        return;
      }

      setIsTransitioning(true);
      setTransitionError(null);

      try {
        // 单项目单模式策略：不再支持项目类型切换

        // 执行模式切换动画（如果启用）
        if (enableModeTransition) {
          // 添加切换动画类
          if (containerRef.current) {
            containerRef.current.classList.add('mode-transitioning');
          }

          // 等待动画完成
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // 更新编辑器模式
        setEditorMode(newMode);

        // 通知外部组件
        onModeSwitch?.(newMode);

        // 移除动画类
        if (enableModeTransition && containerRef.current) {
          containerRef.current.classList.remove('mode-transitioning');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '模式切换失败';
        setTransitionError(errorMessage);
        console.error('编辑器模式切换失败:', error);
      } finally {
        setIsTransitioning(false);
      }
    },
    [editorMode, isTransitioning, enableModeTransition, onModeSwitch],
  );

  // 监听项目类型变化，自动切换编辑器模式
  useEffect(() => {
    if (projectType.currentType) {
      const newMode =
        projectType.currentType === ProjectType.H5 ? 'h5' : 'design';
      if (newMode !== editorMode && !projectType.isTypeChanging) {
        handleModeSwitch(newMode);
      }
    }
  }, [
    projectType.currentType,
    projectType.isTypeChanging,
    editorMode,
    handleModeSwitch,
  ]);

  // 错误恢复处理
  const handleErrorRecovery = useCallback(async () => {
    try {
      // 清除所有错误状态
      clearError();
      setTransitionError(null);

      // 如果有当前项目，尝试刷新
      if (project.currentProjectId) {
        await refreshProject();
      }

      // 验证编辑器状态
      if (editor) {
        // 健康检查器会自动运行，这里不需要手动调用
      }
    } catch (error) {
      console.error('错误恢复失败:', error);
    }
  }, [clearError, project.currentProjectId, refreshProject, editor]);

  // 使用 useRef 存储服务引用，避免依赖项变化
  const projectManagementServiceRef = useRef(projectManagementService);
  const setProjectEditorRef = useRef(setProjectEditor);

  // 更新引用
  useEffect(() => {
    projectManagementServiceRef.current = projectManagementService;
    setProjectEditorRef.current = setProjectEditor;
  }, [projectManagementService, setProjectEditor]);

  useLayoutEffect(() => {
    console.log('Editor useLayoutEffect触发', {
      isEditorInitialized: isEditorInitializedRef.current,
      isInitializing: (window as any).__editorInitializing,
      hasEditor: !!editor,
      hasContainer: !!containerRef.current,
    });

    // 更严格的防重复初始化检查
    if (
      isEditorInitializedRef.current ||
      (window as any).__editorInitializing ||
      editor // 如果编辑器已经存在，跳过初始化
    ) {
      console.log('Editor: 跳过初始化，原因:', {
        isEditorInitialized: isEditorInitializedRef.current,
        isInitializing: (window as any).__editorInitializing,
        hasEditor: !!editor,
      });
      return;
    }

    // 检查容器是否可用
    if (!containerRef.current) {
      return;
    }

    // 使用requestAnimationFrame确保DOM完全渲染后再检查
    const rafId = requestAnimationFrame(async () => {
      if (!containerRef.current) {
        console.debug('容器元素尚未就绪，延迟初始化');
        return;
      }

      // 使用安全的编辑器初始化函数
      const initializeEditor = async () => {
        // 设置初始化标志位
        (window as any).__editorInitializing = true;

        const container = containerRef.current;
        if (!container) {
          (window as any).__editorInitializing = false;
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
          containerWidth = Math.max(containerRect.width || 800, 100);
          containerHeight = Math.max(containerRect.height || 600, 100);

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

        // 使用现有的 editorInitializer - 简洁高效方案
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

        console.log('Editor: 编辑器初始化完成，设置到状态', {
          editor: !!editor,
          doc: !!editor.doc,
        });

        // 创建 AutoSaveGraphics 实例并保存引用
        const autoSaveGraphics = new AutoSaveGraphics(editor);
        (window as any).autoSaveGraphics = autoSaveGraphics;

        // 初始化性能服务
        performanceService.initialize(container);

        // 设置性能服务事件监听
        performanceService.on('memoryWarning', (usage) => {
          console.warn(`内存使用警告: ${(usage / 1024 / 1024).toFixed(2)}MB`);
        });

        performanceService.on('performanceDegraded', (reason) => {
          console.warn(`性能下降: ${reason}`);
        });

        // 确保项目管理服务在全局可用，供其他组件使用
        if (projectManagementServiceRef.current) {
          (window as any).__PROJECT_MANAGEMENT_SERVICE__ =
            projectManagementServiceRef.current;
          console.log('项目管理服务已设置为全局可用');
        }

        // 同步设置编辑器实例到项目管理服务（在发出事件之前）
        if (projectManagementServiceRef.current) {
          projectManagementServiceRef.current.setEditor(editor);
          console.log('编辑器实例已同步设置到项目管理服务');
        }

        // 设置项目管理的编辑器实例（React state，异步）
        setProjectEditorRef.current(editor);

        // 尝试手动配置编辑器设置
        try {
          // 确保滚轮缩放功能正常
          // 尝试启用标尺
          if (editor.setting) {
            // 编辑器设置管理器已初始化
          }
        } catch (error) {
          console.warn('配置编辑器设置时出错:', error);
        }

        // 发出编辑器就绪事件，允许项目数据加载
        const { appEventEmitter } = await import('../events');
        appEventEmitter.emit('editorReady' as any);

        // 清除初始化标志位
        (window as any).__editorInitializing = false;

        // 设置编辑器已初始化标志位
        isEditorInitializedRef.current = true;
        // 检查编辑器容器的事件绑定

        if (containerRef.current) {
          const container = containerRef.current;
          // 等待一帧后再次检查尺寸，确保 DOM 已完全渲染
          requestAnimationFrame(() => {
            if (container) {
              // 容器检查完成
            }
          });
        }

        const changeViewport = throttle(
          () => {
            // 使用容器的实际尺寸，而不是硬编码的最小值
            const containerSize = editor.viewportManager.getPageSize();

            editor.viewportManager.setViewportSize(containerSize);
            editor.render();
          },
          10,
          { leading: false },
        );

        // 使用 passive: true 来避免滚轮事件冲突
        window.addEventListener('resize', changeViewport, { passive: true });

        // 启动编辑器健康检查
        const stopHealthCheck = createEditorHealthChecker(editor);

        // 输出诊断信息（仅在开发环境）
        if (import.meta.env?.DEV) {
          // 防重复诊断检查
          if (!(window as any).__editorDiagnosed) {
            (window as any).__editorDiagnosed = true;
            setTimeout(() => {
              diagnoseEditorState(editor);
            }, 1000);
          }
        }

        console.log('Editor: 调用setEditor设置编辑器状态');
        setEditor(editor);

        return () => {
          try {
            console.log('开始清理编辑器资源...');

            // 停止健康检查
            stopHealthCheck();

            // 安全检查编辑器是否存在且未被销毁
            if (editor && editor.containerElement) {
              console.log('销毁编辑器实例...');
              editor.destroy();
            }

            // 清理事件监听器
            window.removeEventListener('resize', changeViewport);
            changeViewport.cancel();

            // 重置初始化标志位
            isEditorInitializedRef.current = false;
            (window as any).__editorInitializing = false;
            (window as any).__editorDiagnosed = false;

            console.log('编辑器资源清理完成');
          } catch (error) {
            console.warn('Editor组件清理过程中出现警告:', error);
          }
        };
      };

      // 执行初始化
      await initializeEditor();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [containerRef, editor]); // 添加 editor 依赖，但通过内部检查避免重复初始化

  // 监听编辑器就绪事件，自动打开待处理的项目
  useEffect(() => {
    const handleEditorReady = () => {
      if (currentProjectId && projectManagementService) {
        // 检查项目是否已经打开，避免重复打开
        const currentOpenProjectId =
          projectManagementService.getCurrentProjectId();
        if (currentOpenProjectId === currentProjectId) {
          return;
        }

        // 编辑器就绪后打开项目
        projectManagementService
          .openProject(currentProjectId)
          .then((success: boolean) => {
            if (!success) {
              console.error('项目自动打开失败:', currentProjectId);
            }
          })
          .catch((error: any) => {
            console.error('项目自动打开时发生错误:', error);
          });
      }
    };

    // 监听编辑器就绪事件
    appEventEmitter.on('editorReady', handleEditorReady);

    return () => {
      appEventEmitter.off('editorReady', handleEditorReady);
    };
  }, [currentProjectId, projectManagementService, editor]);

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
  const handleAssetSelect = useCallback((_asset: any) => {
    // TODO: 将素材添加到画布
  }, []);

  const handleAssetDoubleClick = useCallback((_asset: any) => {
    // TODO: 将素材添加到画布并关闭弹窗
    setShowAssetLibrary(false);
  }, []);

  // 模板库事件处理
  const handleTemplateSelect = useCallback((_template: any) => {
    // 选择模板
  }, []);

  const handleTemplateApply = useCallback(
    (template: any, result?: any) => {
      if (result && result.editorData && editor) {
        try {
          // 应用模板数据到编辑器
          editor.setContents(result.editorData);
          setShowTemplateLibrary(false);
        } catch (error) {
          console.error('应用模板到编辑器失败:', error);
        }
      }
    },
    [editor],
  );

  const handleTemplatePreview = useCallback((_template: any) => {
    // TODO: 实现模板预览功能
  }, []);

  const handleTemplateEdit = useCallback((_template: any) => {
    // TODO: 实现模板编辑功能
  }, []);

  const handleTemplateSave = useCallback((_templateData: any) => {
    // TODO: 实现模板保存功能
  }, []);

  // 项目库事件处理
  const handleProjectOpen = useCallback(
    async (project: IProjectMetadata) => {
      try {
        const success = await openProject(project.id);
        if (success) {
          setShowProjectLibrary(false);

          // 加载项目数据到编辑器
          const projectData = await getCurrentProject();
          if (projectData && editor) {
            editor.setContents(projectData.editorData);
          }
        }
      } catch (error) {
        console.error('打开项目失败:', error);
      }
    },
    [openProject, getCurrentProject, editor],
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
          // 打开创建的项目
          const success = await openProject(projectResult.id);
          if (success) {
            // 等待一小段时间确保状态更新
            setTimeout(async () => {
              // 加载项目数据到编辑器
              const projectData = await getCurrentProject();
              if (projectData && editor) {
                try {
                  editor.setContents(projectData.editorData);
                } catch (error) {
                  console.error('加载项目数据到编辑器失败:', error);
                }
              }
            }, 100);
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
    getCurrentProject,
  ]);

  const handleProjectRename = useCallback(
    async (project: IProjectMetadata, newName: string) => {
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
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('删除项目失败:', error);
      }
    },
    [deleteProject],
  );

  return (
    <div className={`editor-root ${isTransitioning ? 'transitioning' : ''}`}>
      <EditorContext.Provider
        value={{
          editor,
        }}
      >
        {/* 统一的Header - 两个模式共用 */}
        {showHeader && (
          <Header
            title="g-asset-forge"
            onBackToHome={onBackToHome}
            showHomeButton={!!onBackToHome}
          />
        )}

        {/* 错误提示 */}
        {(error.error || error.typeError || transitionError) && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-message">
                {transitionError || error.typeError || error.error}
              </span>
              <button
                className="error-recovery-btn"
                onClick={handleErrorRecovery}
              >
                重试
              </button>
              <button
                className="error-dismiss-btn"
                onClick={() => {
                  clearError();
                  setTransitionError(null);
                }}
              >
                忽略
              </button>
            </div>
          </div>
        )}

        {/* 主体内容区域 */}
        <div className={`body mode-${editorMode}`}>
          {editorMode === 'h5' ? (
            <>
              {/* H5模式：隐藏的编辑器容器，用于初始化编辑器 */}
              <div
                ref={containerRef}
                className="editor-canvas-container"
                style={{
                  position: 'absolute',
                  visibility: 'hidden',
                  pointerEvents: 'none',
                }}
              />
              {console.log('Editor: 渲染H5EditorMode组件', {
                editorMode,
                projectType,
              })}
              <H5EditorMode
                projectType={projectType}
                loading={loading}
                error={error}
                projectData={null} // 暂时传递 null，后续通过 getCurrentProject 获取
                projectManagementService={projectManagementService}
              />
            </>
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
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
