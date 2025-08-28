import './Editor.scss';

import { pick, throttle } from '@g-asset-forge/common';
import { GAssetForgeEditor, type SettingValue } from '@g-asset-forge/core';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { EditorContext } from '../context';
import { useProjectManagement } from '../hooks/useProjectManagement';
import { AutoSaveGraphics } from '../store/auto-save-graphs';
import { AssetLibraryPanel } from './AssetLibraryPanel/index';
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
}

const Editor: FC<EditorProps> = ({
  initialMode = 'design',
  onBackToHome,
  onOpenAssetLibrary,
  onOpenTemplateLibrary,
  onOpenProjectLibrary,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<GAssetForgeEditor | null>(null);
  const [editorMode, setEditorMode] = useState<'design' | 'h5'>(initialMode);

  // 弹窗状态管理
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);

  // 项目管理Hook
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
  } = useProjectManagement();

  useEffect(() => {
    if (containerRef.current) {
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
        // Web环境：使用body尺寸
        containerWidth = Math.max(
          document.body.clientWidth - leftRightMargin,
          800,
        );
        containerHeight = Math.max(document.body.clientHeight - topMargin, 600);
      }

      console.log('Editor 初始化尺寸:', {
        containerWidth,
        containerHeight,
        isElectron,
        windowSize: { width: window.innerWidth, height: window.innerHeight },
        bodySize: {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        },
      });

      const editor = new GAssetForgeEditor({
        containerElement: containerRef.current,
        width: containerWidth,
        height: containerHeight,
        offsetY: 48,
        offsetX: 240,
        showPerfMonitor: false,
        userPreference: userPreference,
      });

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

      // 设置项目管理的编辑器实例
      setProjectEditor(editor);

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

        // 改进的滚轮事件处理 - 针对Electron环境优化
        const handleWheel = (e: WheelEvent) => {
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
          containerRef.current.addEventListener('wheel', handleWheel, {
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
      setEditor(editor);

      return () => {
        editor.destroy(); // 注销事件
        window.removeEventListener('resize', changeViewport);
        changeViewport.cancel();
      };
    }
  }, [containerRef, setProjectEditor]);

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

  const handleProjectCreate = useCallback(() => {
    console.log('创建项目');
    // 项目创建后会自动刷新项目列表
  }, []);

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

  // 监听编辑器内容变化，标记项目为已修改
  useEffect(() => {
    if (!editor || !activeTabId) return;

    const handleContentChange = () => {
      markProjectDirty(activeTabId);
    };

    // 监听编辑器的内容变化事件
    editor.commandManager.on('change', handleContentChange);

    return () => {
      editor.commandManager.off('change', handleContentChange);
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
      <EditorContext.Provider value={editor}>
        {/* 统一的Header - 两个模式共用，集成项目标签页 */}
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
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
