// H5模式界面 - 重构版本
import './H5EditorMode.scss';

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
import { ContentBlockPanel } from './ContentBlockPanel';
import { H5Canvas } from './H5Canvas';
import { H5PropertyPanel } from './H5PropertyPanel';

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
    setSelectedBlockId('');
    setShowPropertyPanel(false);
  }, []); // 空依赖数组，只在组件挂载时执行一次
  const cleanupRef = useRef<(() => void) | null>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  // 获取块内容
  const getBlockContent = useCallback((block: any) => {
    if (!block || !block.attrs) {
      return {};
    }

    switch (block.attrs.blockType) {
      case 'text':
        return {
          text: block.attrs.content || '请输入文本内容',
          fontSize: block.attrs.fontSize || 16,
          color: block.attrs.textColor || '#333333',
          textAlign: block.attrs.textAlign || 'left',
        };
      case 'image':
        return {
          src: block.attrs.src || '',
          alt: block.attrs.alt || '图片',
          objectFit: block.attrs.objectFit || 'cover',
        };
      case 'button':
        return {
          text: block.attrs.text || '点击按钮',
          backgroundColor: block.attrs.backgroundColor || '#007AFF',
          textColor: block.attrs.textColor || '#FFFFFF',
          borderRadius: block.attrs.borderRadius || 8,
        };
      default:
        return {};
    }
  }, []);

  // 更新内容块列表
  const updateContentBlocksList = useCallback(() => {
    if (h5ServiceRef.current) {
      try {
        // 使用新的H5Service API
        const blocks = h5ServiceRef.current.getContentBlocks
          ? h5ServiceRef.current.getContentBlocks()
          : h5ServiceRef.current.getAllContentBlocks
          ? h5ServiceRef.current.getAllContentBlocks()
          : [];

        const blockData = blocks
          .filter(
            (block: any) =>
              block && (block.id || (block.attrs && block.attrs.id)),
          ) // 过滤掉无效的块
          .map((block: any) => ({
            id: block.id || block.attrs?.id,
            type: block.type || block.attrs?.blockType || 'unknown',
            content: block.content || getBlockContent(block),
            style:
              block.style || (block.getBlockStyle ? block.getBlockStyle() : {}),
            order: block.order || block.attrs?.order || 0,
            isVisible:
              block.isVisible !== false && block.attrs?.visible !== false,
            isLocked: block.isLocked === true || block.attrs?.locked === true,
          }));
        setContentBlocks(blockData);
      } catch (error) {
        console.error('更新内容块列表失败:', error);
        setContentBlocks([]);
      }
    }
  }, [getBlockContent]);

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

        // 更新内容块列表
        updateContentBlocksList();
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
        h5Service.on('contentBlocksChanged', (blocks: any[]) => {
          updateContentBlocksList();
        });

        h5Service.on('selectionChanged', (selectedBlocks: string[]) => {
          if (selectedBlocks.length > 0) {
            setSelectedBlockId(selectedBlocks[0]);
          } else {
            setSelectedBlockId('');
          }
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

      // 初始化内容块列表
      updateContentBlocksList();

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
  }, [editor.editor, updateContentBlocksList, contentBlocks.length]);

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
            const handleH5ContainerRestored = (event: {
              containerId: string;
            }) => {
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
            updateContentBlocksList();

            // 强制重新渲染编辑器，确保H5容器可见
            editor?.editor?.render();
          });

          // 监听编辑器选择变化
          const handleSelectionChange = () => {
            const selectedElements =
              editor?.editor?.selectedElements?.getItems();
            if (selectedElements && selectedElements.length === 1) {
              const selectedElement = selectedElements[0];
              if (
                selectedElement.attrs.id &&
                (selectedElement.attrs as any).blockType
              ) {
                setSelectedBlockId(selectedElement.attrs.id);
                setShowPropertyPanel(true);
              } else {
                setSelectedBlockId('');
                setShowPropertyPanel(false);
              }
            } else {
              setSelectedBlockId('');
              setShowPropertyPanel(false);
            }
          };

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
              setSelectedBlockId('');
              setShowPropertyPanel(false);
              setContentBlocks([]);
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
    updateContentBlocksList,
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

  const handleBlockSelect = (blockId: string) => {
    setSelectedBlockId(blockId);
    if (h5ServiceRef.current) {
      if (blockId) {
        // 使用新的H5Service API
        if (h5ServiceRef.current.selectContentBlocks) {
          h5ServiceRef.current.selectContentBlocks([blockId]);
        } else if (h5ServiceRef.current.selectContentBlock) {
          h5ServiceRef.current.selectContentBlock(blockId);
        }
        setShowPropertyPanel(true);
      } else {
        if (h5ServiceRef.current.clearSelection) {
          h5ServiceRef.current.clearSelection();
        }
        setShowPropertyPanel(false);
      }
    }
  };

  const handleBlockAdd = (blockType: string) => {
    if (!h5ServiceRef.current) return;

    let newBlock;
    switch (blockType) {
      case 'text':
        newBlock = h5ServiceRef.current.addTextBlock();
        break;
      case 'image':
        newBlock = h5ServiceRef.current.addImageBlock();
        break;
      case 'button':
        newBlock = h5ServiceRef.current.addButtonBlock();
        break;
      default:
        return;
    }

    if (newBlock) {
      updateContentBlocksList();
      // 自动选择新添加的块
      setTimeout(() => {
        const blockId = newBlock.id || newBlock.attrs?.id;
        if (blockId) {
          handleBlockSelect(blockId);
        }
      }, 100);
    }
  };

  const handleBlockDelete = (blockId: string) => {
    if (!h5ServiceRef.current) return;

    const success = h5ServiceRef.current.removeContentBlock(blockId);
    if (success) {
      updateContentBlocksList();
      if (selectedBlockId === blockId) {
        setSelectedBlockId('');
        setShowPropertyPanel(false);
      }
    }
  };

  const handleBlockReorder = (dragIndex: number, hoverIndex: number) => {
    if (!h5ServiceRef.current) return;

    try {
      const newOrder = [...contentBlocks];
      const draggedBlock = newOrder.splice(dragIndex, 1)[0];
      newOrder.splice(hoverIndex, 0, draggedBlock);

      // 更新每个块的order属性
      newOrder.forEach((block, index) => {
        if (h5ServiceRef.current && h5ServiceRef.current.updateContentBlock) {
          h5ServiceRef.current.updateContentBlock(block.id, { order: index });
        }
      });

      updateContentBlocksList();
    } catch (error) {
      console.error('重排序内容块失败:', error);
    }
  };

  // 属性面板事件处理
  const handleUpdateBlock = (blockId: string, updates: any) => {
    if (!h5ServiceRef.current) return;

    h5ServiceRef.current.updateContentBlock(blockId, updates);
    updateContentBlocksList();
  };

  const handleClosePropertyPanel = () => {
    setShowPropertyPanel(false);
    setSelectedBlockId('');
    if (h5ServiceRef.current) {
      h5ServiceRef.current.clearSelection();
    }
  };

  // 获取选中的内容块
  const selectedBlock =
    contentBlocks.find((block) => block.id === selectedBlockId) || null;

  // 获取H5容器的所有子元素
  const [allElements, setAllElements] = useState<any[]>([]);

  // 更新所有元素列表
  const updateAllElements = useCallback(() => {
    if (h5ServiceRef.current) {
      try {
        // 通过H5Service的公共方法获取容器
        const container = h5ServiceRef.current.getCurrentContainer();
        if (container) {
          const children = container.getChildren
            ? container.getChildren()
            : container.childrenIds
            ? container.childrenIds
            : [];
          setAllElements(Array.isArray(children) ? children : []);
        } else {
          // 如果容器不存在，尝试从编辑器直接获取
          if (editor?.editor) {
            const currentCanvas = editor.editor.doc.getCurrentCanvas();
            if (currentCanvas) {
              const h5Container = currentCanvas
                .getChildren()
                .find((child: any) => child.type === 'H5Container');
              if (h5Container) {
                const children = h5Container.getChildren
                  ? h5Container.getChildren()
                  : [];
                setAllElements(Array.isArray(children) ? children : []);
                return;
              }
            }
          }
          setAllElements([]);
        }
      } catch (error) {
        console.error('更新所有元素列表失败:', error);
        setAllElements([]);
      }
    }
  }, [editor]);

  // 监听H5容器的变化
  useEffect(() => {
    updateAllElements();
  }, [updateAllElements, contentBlocks]);

  // 事件监听器已在H5Service初始化时注册，无需重复注册

  return (
    <div className="h5-editor-mode g-asset-forge-h5-mode">
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

      {/* 左侧内容块面板 */}
      <div className="h5-left-panel">
        <ContentBlockPanel
          onBlockAdd={handleBlockAdd}
          selectedBlockId={selectedBlockId}
          contentBlocks={contentBlocks}
          onBlockSelect={handleBlockSelect}
          onBlockDelete={handleBlockDelete}
          onBlockReorder={handleBlockReorder}
          onBlockVisibilityToggle={(blockId, isVisible) => {
            // 通过H5Service处理可见性切换
            if (
              h5ServiceRef.current &&
              typeof h5ServiceRef.current.updateContentBlockAttrs === 'function'
            ) {
              h5ServiceRef.current.updateContentBlockAttrs(blockId, {
                visible: isVisible,
              });
              updateContentBlocksList();
            }
          }}
          onBlockLockToggle={(blockId, isLocked) => {
            // 通过H5Service处理锁定切换
            if (
              h5ServiceRef.current &&
              typeof h5ServiceRef.current.updateContentBlockAttrs === 'function'
            ) {
              h5ServiceRef.current.updateContentBlockAttrs(blockId, {
                locked: isLocked,
              });
              updateContentBlocksList();
            }
          }}
          allElements={allElements}
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
              contentBlocks={contentBlocks}
              selectedBlockId={selectedBlockId}
              onBlockSelect={handleBlockSelect}
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

      {/* 右侧属性面板 */}
      <div className="h5-right-panel">
        {showPropertyPanel && selectedBlock ? (
          <H5PropertyPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={handleUpdateBlock}
            onClose={handleClosePropertyPanel}
          />
        ) : (
          <div className="h5-property-panel-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-title">属性面板</div>
              <div className="placeholder-text">选择一个内容块来编辑其属性</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
