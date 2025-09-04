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
  const [editorMode] = useState<'design' | 'h5'>(initialMode);

  // 弹窗状态管理
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);

  // 项目管理Hook - 统一状态管理
  const {
    openProject,
    renameProject,
    deleteProject,
    setEditor: setProjectEditor,
    getCurrentProject,
  } = useProjectManagement(projectManagementService);

  useLayoutEffect(() => {
    // 使用requestAnimationFrame确保DOM完全渲染后再检查
    const rafId = requestAnimationFrame(async () => {
      if (!containerRef.current) {
        console.debug('容器元素尚未就绪，延迟初始化');
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

          // 滚轮事件处理已移除 - 由核心包的 host_event_manager 统一处理
          // 核心包中的滚轮处理逻辑：
          // - Ctrl/Cmd + 滚轮：缩放画布
          // - 普通滚轮：平移画布
          console.log('滚轮事件由核心包统一处理，无需在此处重复绑定');

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

            // 滚轮事件监听器已移除，由核心包统一处理

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

      // 执行初始化
      await initializeEditor();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [containerRef, setProjectEditor, projectManagementService]);

  // 监听currentProjectId变化，自动打开项目
  useEffect(() => {
    if (currentProjectId && projectManagementService) {
      // 检查项目是否已经打开，避免重复打开
      const currentOpenProjectId =
        projectManagementService.getCurrentProjectId();
      if (currentOpenProjectId === currentProjectId) {
        console.log('项目已经打开，跳过重复打开:', currentProjectId);
        return;
      }

      console.log('检测到项目ID变化，自动打开项目:', currentProjectId);
      // 使用项目管理服务打开项目
      projectManagementService
        .openProject(currentProjectId)
        .then((success: boolean) => {
          if (success) {
            console.log('项目自动打开成功:', currentProjectId);
          } else {
            console.error('项目自动打开失败:', currentProjectId);
          }
        })
        .catch((error: any) => {
          console.error('项目自动打开时发生错误:', error);
        });
    }
  }, [currentProjectId, projectManagementService]);

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
          const projectData = await getCurrentProject();
          if (projectData && editor) {
            editor.setContents(projectData.editorData);
            console.log('项目数据已加载到编辑器');
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
          console.log('项目创建成功:', projectResult);

          // 打开创建的项目
          const success = await openProject(projectResult.id);
          if (success) {
            console.log('创建并打开新项目:', projectResult.name);

            // 等待一小段时间确保状态更新
            setTimeout(async () => {
              // 加载项目数据到编辑器
              const projectData = await getCurrentProject();
              if (projectData && editor) {
                try {
                  editor.setContents(projectData.editorData);
                  console.log('项目数据已加载到编辑器');
                } catch (error) {
                  console.error('加载项目数据到编辑器失败:', error);
                }
              }
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
    getCurrentProject,
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

  return (
    <div>
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

        {/* 主体内容区域 */}
        <div className="body">
          {editorMode === 'h5' ? (
            <H5EditorMode containerRef={containerRef} />
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
