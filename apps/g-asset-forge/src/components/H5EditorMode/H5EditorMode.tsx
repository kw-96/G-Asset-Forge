// H5模式界面
import './H5EditorMode.scss';

import { addComponentToH5Container } from '@g-asset-forge/core';
import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { EditorContext } from '../../context';
import {
  type ProjectErrorState,
  type ProjectLoadingState,
  type ProjectTypeState,
  useProjectManagement,
} from '../../hooks/useProjectManagement';
import { AutoSaveGraphics } from '../../store/auto-save-graphs';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { InfoPanel } from '../InfoPanel/InfoPanel';
import { ContentBlockPanel } from './ContentBlockPanel';
import { H5Canvas } from './H5Canvas';

interface H5EditorModeProps {
  projectType?: ProjectTypeState;
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
  projectData?: any; // 添加项目数据
  projectManagementService?: any; // 添加项目管理服务
}

export const H5EditorMode: FC<H5EditorModeProps> = ({
  loading,
  error,
  projectManagementService: externalProjectManagementService,
}) => {
  const editor = useContext(EditorContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const { projectManagementService } = useProjectManagement(
    externalProjectManagementService,
  );
  const h5ServiceRef = useRef<any>(null); // 使用any类型避免循环依赖
  const autoSaveRef = useRef<AutoSaveGraphics | null>(null);
  const initializationRef = useRef<boolean>(false);
  const saveH5DataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // 组件挂载时只重置UI状态，不清理全局H5Service状态
  useEffect(() => {
    // 只重置UI相关状态，保持H5Service状态
  }, []); // 空依赖数组，只在组件挂载时执行一次
  const cleanupRef = useRef<(() => void) | null>(null);

  // 内容块相关状态已移除，现在使用组件库功能
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  // H5Service初始化和生命周期管理
  const initializeH5Service = useCallback(async () => {
    if (!editor?.editor || initializationRef.current) {
      return;
    }

    // 检查是否已有可复用的H5Service
    if ((window as any).__h5Service && (window as any).__h5ServiceInitialized) {
      console.log('发现现有H5Service，尝试复用');
      const existingH5Service = (window as any).__h5Service;

      // 检查现有H5Service是否有效
      if (
        existingH5Service &&
        typeof existingH5Service.setEditor === 'function'
      ) {
        h5ServiceRef.current = existingH5Service;

        // 确保编辑器实例是最新的
        if (editor?.editor) {
          existingH5Service.setEditor(editor.editor);
        }

        return;
      } else {
        console.log('现有H5Service无效，将创建新的');
        (window as any).__h5Service = null;
        (window as any).__h5ServiceInitialized = false;
      }
    }

    setIsInitializing(true);
    setInitializationError(null);
    initializationRef.current = true;

    try {
      // 动态导入H5Service，使用新的实现
      const { H5Service } = await import('@g-asset-forge/core');

      // 创建H5Service实例（简化版，不需要复杂配置）
      const h5Service = new H5Service();

      // 将H5Service存储到全局状态
      (window as any).__h5Service = h5Service;

      // 简化初始化：只设置编辑器，让H5Service通过事件监听自动初始化
      h5Service.setEditor(editor.editor);

      // 确保H5Service成功初始化后才设置ref
      h5ServiceRef.current = h5Service;

      // 设置事件监听器（防重复注册）
      if (!(h5Service as any).__eventsRegistered) {
        h5Service.on('componentsChanged', () => {});

        h5Service.on('selectionChanged', (selectedBlocks: string[]) => {
          // 保留选择变化监听，但不用于UI状态管理
          console.log('H5选择变化:', selectedBlocks);
        });

        h5Service.on('error', (error: Error) => {
          console.error('H5Service错误:', error);
          setInitializationError(error.message);
        });

        h5Service.on('healthCheck', (isHealthy: boolean, issues?: string[]) => {
          if (!isHealthy) {
            console.warn('H5Service健康检查失败:', issues);
          }
        });

        // 标记已注册
        (h5Service as any).__eventsRegistered = true;
      }

      // 立即设置editor实例
      if (h5ServiceRef.current && editor?.editor) {
        h5ServiceRef.current.setEditor(editor.editor);
      }

      // 初始化自动保存机制
      if (!autoSaveRef.current) {
        autoSaveRef.current = new AutoSaveGraphics(editor.editor);
      }

      // 设置初始化完成标记
      (window as any).__h5ServiceInitialized = true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'H5Service初始化失败';
      console.error('H5Service初始化失败:', error);
      setInitializationError(errorMessage);

      // 即使初始化失败，也要确保h5ServiceRef被设置，避免一直显示加载状态
      if (!h5ServiceRef.current) {
        h5ServiceRef.current = (window as any).__h5Service;
      }
    } finally {
      setIsInitializing(false);
    }
  }, [editor.editor]);

  // 清理H5Service
  const cleanupH5Service = useCallback(async () => {
    if (h5ServiceRef.current) {
      try {
        // 执行健康检查
        if (typeof h5ServiceRef.current.performHealthCheck === 'function') {
          await h5ServiceRef.current.performHealthCheck();
        }

        // 清理资源
        await h5ServiceRef.current.cleanup();

        // 销毁服务
        if (typeof h5ServiceRef.current.destroy === 'function') {
          h5ServiceRef.current.destroy();
        }

        h5ServiceRef.current = null;
        // 清理全局H5Service状态
        (window as any).__h5Service = null;
      } catch (error) {
        console.error('H5Service清理失败:', error);
      }
    }

    // 清理自动保存
    if (autoSaveRef.current) {
      autoSaveRef.current = null;
    }

    // 清理全局状态标志位
    (window as any).__h5ServiceInitialized = false;
    (window as any).__h5Service = null;

    initializationRef.current = false;
  }, []);

  useEffect(() => {
    // 如果编辑器或容器不存在，等待初始化
    if (!editor?.editor || !containerRef?.current) {
      return;
    }

    // 如果编辑器文档不存在，监听文档初始化完成事件
    if (!editor.editor.doc) {
      const handleDocReady = () => {
        initializeH5Service();
      };

      // 监听编辑器文档准备完成事件
      editor.editor.on('canvasReady', handleDocReady);

      return () => {
        editor.editor?.off('canvasReady', handleDocReady);
      };
    }

    // 编辑器完全准备好，开始初始化H5Service
    if (editor.editor && editor.editor.doc && containerRef.current) {
      try {
        initializeH5Service();

        // 监听编辑器变化事件，确保H5模式下添加的图形能被保存
        const handleEditorChange = () => {
          // 检查是否需要重新添加H5容器
          if (h5ServiceRef.current) {
            const currentCanvas = editor?.editor?.doc?.getCurrentCanvas();
            if (currentCanvas) {
              const h5Containers = currentCanvas
                .getChildren()
                .filter((child: any) => {
                  // 使用与canvas.ts相同的识别逻辑
                  return (
                    child.type === 'H5Container' ||
                    child.constructor?.name === 'H5Container' ||
                    (child.attrs &&
                      child.attrs.id &&
                      child.attrs.id.includes('h5_container')) ||
                    (child.attrs &&
                      child.attrs.id &&
                      child.attrs.id.includes('h5-container'))
                  );
                });

              // 如果H5容器数量为0，且不是在项目加载过程中，且H5容器未被恢复，才重新添加
              if (
                h5Containers.length === 0 &&
                !(window as any).__isProjectLoading &&
                !(window as any).__h5ContainerRestored
              ) {
                h5ServiceRef.current.addH5ContainerToCanvas?.();
                // 设置H5容器恢复标记
                (window as any).__h5ContainerRestored = true;
              } else if (h5Containers.length > 0) {
                // 如果H5容器存在，同步H5Service状态
                if (h5ServiceRef.current) {
                  h5ServiceRef.current.syncH5Container?.();
                }
              } else if (h5Containers.length > 1) {
                console.warn('检测到多个H5容器，这可能是异常情况');
                // 保留第一个，删除多余的
                for (let i = 1; i < h5Containers.length; i++) {
                  const extraContainer = h5Containers[i];
                  extraContainer.removeFromParent();
                }
              }
            }
          }
        };

        // 监听命令管理器的变化事件
        if (editor.editor?.commandManager) {
          editor.editor.commandManager.on('change', handleEditorChange);
        }

        // 初始化 H5 编辑模式
        if (h5ServiceRef.current) {
          // 检查是否是已有的H5项目
          const isExistingH5Project = (window as any).__isH5Project;

          if (isExistingH5Project) {
            // 使用事件驱动方式等待H5容器恢复

            // 监听H5容器恢复事件
            const handleH5ContainerRestored = () => {
              // 检查项目是否仍然打开
              if (!(window as any).__isH5Project) {
                return;
              }

              // 同步H5Service状态，但不重新创建容器
              if (h5ServiceRef.current) {
                h5ServiceRef.current.syncH5Container?.();
              }

              // 清除项目类型标记
              delete (window as any).__isH5Project;
              delete (window as any).__projectType;

              // 移除事件监听器
              if (projectManagementService) {
                projectManagementService.off(
                  'h5ContainerRestored',
                  handleH5ContainerRestored,
                );
              }
            };

            // 监听H5容器恢复事件
            if (projectManagementService) {
              projectManagementService.on(
                'h5ContainerRestored',
                handleH5ContainerRestored,
              );

              // 在组件卸载时清理事件监听器
              const cleanup = () => {
                projectManagementService.off(
                  'h5ContainerRestored',
                  handleH5ContainerRestored,
                );
              };

              // 将清理函数存储到ref中，在组件卸载时调用
              if (!cleanupRef.current) {
                cleanupRef.current = cleanup;
              }
            } else {
              console.warn(
                'H5EditorMode: ProjectManagementService不可用，使用降级方案',
              );

              // 降级方案：直接初始化H5模式，不等待容器恢复事件
              if (h5ServiceRef.current) {
                h5ServiceRef.current.initializeH5Mode().catch(console.error);
              }
            }
          } else {
            h5ServiceRef.current.initializeH5Mode().catch(console.error);
          }

          // 等待一帧后更新内容块列表，确保容器已完全初始化
          requestAnimationFrame(() => {
            // 强制重新渲染编辑器，确保H5容器可见
            editor?.editor?.render();
          });

          // 监听编辑器选择变化 - 简化逻辑，直接使用InfoPanel
          const handleSelectionChange = () => {};

          editor?.editor?.selectedElements.on(
            'itemsChange',
            handleSelectionChange,
          );

          return () => {
            try {
              // 清理事件监听器
              editor?.editor?.selectedElements.off(
                'itemsChange',
                handleSelectionChange,
              );

              // 清理命令管理器事件监听器
              if (editor?.editor?.commandManager) {
                editor.editor.commandManager.off('change', handleEditorChange);
              }

              // 停止自动保存
              if (autoSaveRef.current) {
                autoSaveRef.current.stopAutoSave();
                autoSaveRef.current = null;
              }

              // 清理H5数据保存定时器
              const saveH5DataInterval = saveH5DataIntervalRef.current;
              if (saveH5DataInterval) {
                clearInterval(saveH5DataInterval);
                saveH5DataIntervalRef.current = null;
              }

              // 销毁H5服务
              if (h5ServiceRef.current) {
                h5ServiceRef.current.destroy();
                h5ServiceRef.current = null;
              }

              // 清理状态
            } catch (error) {
              console.warn('H5EditorMode清理过程中出现警告:', error);
            }
          };
        }
      } catch (error) {
        console.error('H5EditorMode初始化失败:', error);
      }
    }
  }, [
    editor?.editor,
    editor?.editor?.doc,
    containerRef,
    initializeH5Service,
    projectManagementService,
  ]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupH5Service();
    };
  }, [cleanupH5Service]);

  // 错误恢复处理
  const handleErrorRecovery = useCallback(async () => {
    try {
      setInitializationError(null);

      // 清理现有服务
      await cleanupH5Service();

      // 重新初始化
      await initializeH5Service();
    } catch (error) {
      console.error('H5Service错误恢复失败:', error);
      setInitializationError('错误恢复失败');
    }
  }, [cleanupH5Service, initializeH5Service]);

  // 监听编辑器渲染事件，确保图层添加后立即更新
  useEffect(() => {
    if (editor?.editor) {
      const handleEditorRender = () => {};

      // 监听编辑器渲染事件
      editor.editor.sceneGraph.on('render', handleEditorRender);

      // 清理函数
      return () => {
        if (editor?.editor) {
          editor.editor.sceneGraph.off('render', handleEditorRender);
        }
      };
    }
  }, [editor]);

  // 处理拖拽悬停
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // 处理拖拽放置
  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      try {
        // 获取拖拽的组件数据
        const componentData = event.dataTransfer.getData('application/json');
        if (!componentData) {
          console.warn('没有获取到组件数据');
          return;
        }

        const component = JSON.parse(componentData);
        console.log('接收到拖拽的组件:', component);

        // 获取H5容器
        const currentCanvas = editor?.editor?.doc?.getCurrentCanvas();
        if (!currentCanvas) {
          console.warn('无法获取当前画布');
          return;
        }

        const h5Container = currentCanvas.getChildren().find((child: any) => {
          return (
            child.type === 'H5Container' ||
            child.constructor?.name === 'H5Container' ||
            (child.attrs &&
              child.attrs.id &&
              child.attrs.id.includes('h5_container')) ||
            (child.attrs &&
              child.attrs.id &&
              child.attrs.id.includes('h5-container'))
          );
        });

        if (!h5Container) {
          console.warn('未找到H5容器');
          return;
        }

        // 将组件转换为H5元素并添加到H5容器
        await addComponentToH5Container(component, h5Container, editor?.editor);
      } catch (error) {
        console.error('处理组件拖拽失败:', error);
      }
    },
    [editor],
  );

  return (
    <div
      className="h5-editor-mode g-asset-forge-h5-mode"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 错误提示 */}
      {(initializationError || error?.error) && (
        <div className="h5-error-banner">
          <div className="error-content">
            <span className="error-message">
              {initializationError || error?.error}
            </span>
            <button
              className="error-recovery-btn"
              onClick={handleErrorRecovery}
            >
              重新初始化
            </button>
          </div>
        </div>
      )}

      {/* 左侧组件库和图层面板 */}
      <div className="h5-left-panel">
        <ContentBlockPanel
          onComponentDrag={(component) => {
            // 处理组件拖拽到画布
            console.log('拖拽组件到画布:', component);
            // 组件拖拽逻辑在H5Canvas中处理
          }}
          loading={loading}
          error={error}
        />
      </div>

      {/* H5画布区域 */}
      <div className="h5-canvas-area">
        <div ref={containerRef} className="editor-canvas-wrapper">
          {/* 编辑器画布将在这里渲染 */}
          {h5ServiceRef.current ? (
            <H5Canvas
              h5Service={h5ServiceRef.current}
              containerRef={containerRef}
            />
          ) : (
            <div className="h5-canvas-loading">
              <div className="loading-content">
                <div className="loading-spinner" />
                <div className="loading-text">
                  {isInitializing
                    ? '正在初始化H5编辑器...'
                    : '等待H5编辑器准备...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧属性面板 - 直接使用InfoPanel，与设计模式保持一致 */}
      <div className="h5-right-panel">
        <InfoPanel />
      </div>

      {/* 右键菜单 - 与设计模式保持一致 */}
      <ContextMenu />
    </div>
  );
};
