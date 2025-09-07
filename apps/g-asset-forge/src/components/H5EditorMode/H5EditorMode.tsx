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
  containerRef?: React.RefObject<HTMLDivElement>;
  projectType?: ProjectTypeState;
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
  projectData?: any; // 添加项目数据
}

export const H5EditorMode: FC<H5EditorModeProps> = ({
  containerRef,
  projectType,
  loading,
  error,
  projectData,
}) => {
  const editor = useContext(EditorContext);
  const { getCurrentProject } = useProjectManagement();
  const h5ServiceRef = useRef<any>(null); // 使用any类型避免循环依赖
  const autoSaveRef = useRef<AutoSaveGraphics | null>(null);
  const initializationRef = useRef<boolean>(false);
  const saveH5DataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [h5ServiceHealth, setH5ServiceHealth] = useState<any>(null);

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

    setIsInitializing(true);
    setInitializationError(null);
    initializationRef.current = true;

    try {
      console.log('开始初始化H5Service - 重构版本');

      // 动态导入H5Service，使用新的实现
      console.log('正在动态导入H5Service...');
      const { H5Service } = await import('@g-asset-forge/core');
      console.log('H5Service导入成功:', H5Service);

      // 创建H5Service实例，配置优化选项
      console.log('正在创建H5Service实例...');
      const h5Service = new H5Service({
        autoHealthCheck: true,
        healthCheckInterval: 30000,
        containerRecoveryTimeout: 3000, // 减少等待时间
        enablePerformanceMonitoring: true,
      });
      console.log('H5Service实例创建成功:', h5Service);

      // 初始化H5Service
      console.log('正在调用h5Service.initialize...');
      // 获取当前项目数据
      const currentProjectData = await getCurrentProject();
      await h5Service.initialize(editor.editor, currentProjectData);
      console.log('h5Service.initialize调用成功');

      // 设置事件监听器
      h5Service.on('contentBlocksChanged', (blocks) => {
        console.log('内容块变化:', blocks);
        updateContentBlocksList();
      });

      h5Service.on('selectionChanged', (selectedBlocks) => {
        console.log('选择变化:', selectedBlocks);
        if (selectedBlocks.length > 0) {
          setSelectedBlockId(selectedBlocks[0]);
        } else {
          setSelectedBlockId('');
        }
      });

      h5Service.on('error', (error) => {
        console.error('H5Service错误:', error);
        setInitializationError(error.message);
      });

      h5Service.on('healthCheck', (isHealthy, issues) => {
        setH5ServiceHealth({ isHealthy, issues, timestamp: Date.now() });
        if (!isHealthy) {
          console.warn('H5Service健康检查失败:', issues);
        }
      });

      console.log('正在设置h5ServiceRef.current...');
      h5ServiceRef.current = h5Service;
      console.log('h5ServiceRef.current设置成功');

      // 初始化自动保存机制
      console.log('正在初始化自动保存机制...');
      if (!autoSaveRef.current) {
        autoSaveRef.current = new AutoSaveGraphics(editor.editor);
        console.log('H5 模式自动保存已启用');
      }

      // 初始化内容块列表
      console.log('正在初始化内容块列表...');
      updateContentBlocksList();
      console.log('内容块列表初始化完成');

      console.log('H5Service初始化完成');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'H5Service初始化失败';
      console.error('H5Service初始化失败:', error);
      setInitializationError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, [editor.editor, updateContentBlocksList]);

  // 清理H5Service
  const cleanupH5Service = useCallback(async () => {
    if (h5ServiceRef.current) {
      try {
        console.log('开始清理H5Service');

        // 执行健康检查
        if (typeof h5ServiceRef.current.performHealthCheck === 'function') {
          const healthResult = await h5ServiceRef.current.performHealthCheck();
          console.log('清理前健康检查:', healthResult);
        }

        // 清理资源
        await h5ServiceRef.current.cleanup();

        // 销毁服务
        if (typeof h5ServiceRef.current.destroy === 'function') {
          h5ServiceRef.current.destroy();
        }

        h5ServiceRef.current = null;
        console.log('H5Service清理完成');
      } catch (error) {
        console.error('H5Service清理失败:', error);
      }
    }

    // 清理自动保存
    if (autoSaveRef.current) {
      autoSaveRef.current = null;
    }

    initializationRef.current = false;
  }, []);

  useEffect(() => {
    console.log('H5EditorMode useEffect 触发', {
      hasEditor: !!editor?.editor,
      hasContainerRef: !!containerRef?.current,
    });

    // 修改条件：只要editor和containerRef存在就初始化H5Service
    // 不依赖projectType.currentType，因为H5EditorMode组件只在H5模式下才会被渲染
    if (editor?.editor && containerRef?.current) {
      console.log('H5EditorMode: 条件满足，开始初始化H5Service');
      try {
        initializeH5Service();

        // 监听编辑器变化事件，确保H5模式下添加的图形能被保存
        const handleEditorChange = () => {
          console.log('H5模式检测到编辑器变化');

          // 检查是否需要重新添加H5容器
          if (h5ServiceRef.current) {
            const currentCanvas = editor?.editor?.doc?.getCurrentCanvas();
            if (currentCanvas) {
              const h5Containers = currentCanvas
                .getChildren()
                .filter((child: any) => child.type === 'H5Container');

              console.log('当前画布中的H5容器数量:', h5Containers.length);

              // 如果H5容器数量为0，且不是在项目加载过程中，才重新添加
              if (
                h5Containers.length === 0 &&
                !(window as any).__isProjectLoading
              ) {
                console.log('检测到H5容器丢失，重新添加');
                h5ServiceRef.current.addH5ContainerToCanvas?.();
                // 设置H5容器恢复标记
                (window as any).__h5ContainerRestored = true;
              } else if (h5Containers.length > 1) {
                console.warn('检测到多个H5容器，这可能是异常情况');
                // 保留第一个，删除多余的
                for (let i = 1; i < h5Containers.length; i++) {
                  const extraContainer = h5Containers[i];
                  console.log('删除多余的H5容器:', extraContainer.attrs.id);
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

        // 设置H5数据定期保存到编辑器数据
        // 注意：H5Service暂时没有saveToEditorData方法，暂时注释掉
        // saveH5DataIntervalRef.current = setInterval(() => {
        //   if (h5ServiceRef.current) {
        //     const success = h5ServiceRef.current.saveToEditorData();
        //     if (success) {
        //       console.log('H5数据已定期保存到编辑器数据');
        //     }
        //   }
        // }, 5000); // 每5秒保存一次H5数据

        // 初始化 H5 编辑模式
        if (h5ServiceRef.current) {
          // 检查是否是已有的H5项目
          const isExistingH5Project = (window as any).__isH5Project;
          console.log('H5EditorMode: 检查项目类型标记:', {
            isExistingH5Project,
            windowFlag: (window as any).__isH5Project,
          });

          if (isExistingH5Project) {
            console.log(
              'H5EditorMode: 检测到现有H5项目，等待ProjectManagementService完成数据加载',
            );

            // 等待ProjectManagementService完成setContents，然后直接使用现有的H5容器
            const waitForH5Container = () => {
              try {
                const currentCanvas = editor?.editor?.doc?.getCurrentCanvas();
                const editorData = currentCanvas?.getChildren();

                console.log('H5EditorMode: 检查画布状态', {
                  canvasId: currentCanvas?.attrs?.id,
                  childrenCount: editorData?.length || 0,
                  projectType: (window as any).__projectType,
                });

                if (editorData && editorData.length > 0) {
                  // 查找H5容器
                  const h5Container = editorData.find(
                    (child: any) => child && child.type === 'H5Container',
                  );

                  if (h5Container) {
                    console.log('H5EditorMode: 发现现有H5容器，直接使用', {
                      id: h5Container.attrs?.id,
                      childrenCount: h5Container.getChildren?.()?.length || 0,
                      containerType: h5Container.type,
                    });

                    // 直接设置现有H5容器，不重新创建
                    h5ServiceRef.current!.setCurrentContainer(
                      h5Container as any,
                    );

                    // 清除项目类型标记
                    delete (window as any).__isH5Project;
                    delete (window as any).__projectType;

                    console.log('H5EditorMode: 现有H5容器设置完成');
                    return; // 成功，退出等待
                  } else {
                    console.log('H5EditorMode: 画布中有元素但未找到H5容器', {
                      elementTypes: editorData.map((child: any) => child.type),
                    });
                  }
                } else {
                  console.log('H5EditorMode: 画布为空，等待数据加载');
                }

                // 如果还没找到H5容器，继续等待（最多等待5秒）
                const maxWaitTime = 5000; // 5秒
                const checkInterval = 100; // 100ms检查一次
                const elapsedTime =
                  Date.now() - (window as any).__h5WaitStartTime || 0;

                if (elapsedTime < maxWaitTime) {
                  setTimeout(waitForH5Container, checkInterval);
                } else {
                  console.warn('H5EditorMode: 等待超时，初始化新的H5模式');
                  h5ServiceRef.current!.initializeH5Mode();
                  delete (window as any).__isH5Project;
                  delete (window as any).__projectType;
                }
              } catch (error) {
                console.warn(
                  'H5EditorMode: 等待H5容器时出错，初始化新的H5模式:',
                  error,
                );
                h5ServiceRef.current!.initializeH5Mode();
                delete (window as any).__isH5Project;
                delete (window as any).__projectType;
              }
            };

            // 记录等待开始时间
            (window as any).__h5WaitStartTime = Date.now();

            // 延迟等待，给ProjectManagementService足够时间完成setContents
            setTimeout(waitForH5Container, 200);
          } else {
            console.log('H5EditorMode: 新建H5项目，直接初始化H5模式');
            h5ServiceRef.current.initializeH5Mode();
          }

          console.log('H5 编辑模式已激活');

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
                console.log('H5 模式自动保存已停止');
              }

              // 清理H5数据保存定时器
              if (saveH5DataIntervalRef.current) {
                clearInterval(saveH5DataIntervalRef.current);
                console.log('H5数据保存定时器已清理');
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
  }, [editor, updateContentBlocksList, containerRef, initializeH5Service]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupH5Service();
    };
  }, [cleanupH5Service]);

  // 错误恢复处理
  const handleErrorRecovery = useCallback(async () => {
    console.log('尝试H5Service错误恢复...');

    try {
      setInitializationError(null);

      // 清理现有服务
      await cleanupH5Service();

      // 重新初始化
      await initializeH5Service();

      console.log('H5Service错误恢复完成');
    } catch (error) {
      console.error('H5Service错误恢复失败:', error);
      setInitializationError('错误恢复失败');
    }
  }, [cleanupH5Service, initializeH5Service, getCurrentProject]);

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

  // 工具栏事件处理（暂时注释，未来可能使用）
  // const handleAddTextBlock = () => handleBlockAdd('text');
  // const handleAddImageBlock = () => handleBlockAdd('image');
  // const handleAddButtonBlock = () => handleBlockAdd('button');

  // const handleDeleteSelected = () => {
  //   if (selectedBlockId) {
  //     handleBlockDelete(selectedBlockId);
  //   }
  // };

  // const handleTogglePreview = () => {
  //   setIsPreviewMode(!isPreviewMode);
  // };

  // const handleExport = async () => {
  //   if (!h5ServiceRef.current) return;

  //   try {
  //     const resolutions = [
  //       { width: 375, height: 667, name: '1x' },
  //       { width: 750, height: 1334, name: '2x' },
  //       { width: 1125, height: 2001, name: '3x' },
  //     ];

  //     const images = await h5ServiceRef.current.exportToImages(resolutions);

  //     // 下载图片
  //     Object.entries(images).forEach(([name, blob]) => {
  //       const url = URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `h5-long-image-${name}.png`;
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       URL.revokeObjectURL(url);
  //     });

  //     console.log('H5长图导出成功');
  //   } catch (error) {
  //     console.error('导出失败:', error);
  //   }
  // };

  // const handleSettings = () => {
  //   // TODO: 实现H5设置功能
  //   console.log('打开H5设置');
  // };

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
          console.log('H5EditorMode: 更新所有元素列表，数量:', children.length);
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
                console.log(
                  'H5EditorMode: 从编辑器直接获取元素列表，数量:',
                  children.length,
                );
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

  // 监听H5Service的内容块变化事件
  useEffect(() => {
    if (h5ServiceRef.current) {
      const handleContentBlocksChanged = () => {
        // 检查H5Service是否仍然有效
        if (
          !h5ServiceRef.current ||
          h5ServiceRef.current.state === 'DESTROYED'
        ) {
          console.warn('H5Service已销毁，忽略内容块变化事件');
          return;
        }
        console.log('H5EditorMode: 收到内容块变化事件，更新列表');
        updateContentBlocksList();
        updateAllElements();
      };

      h5ServiceRef.current.on(
        'contentBlocksChanged',
        handleContentBlocksChanged,
      );
      h5ServiceRef.current.on('contentBlockAdded', handleContentBlocksChanged);
      h5ServiceRef.current.on(
        'contentBlockRemoved',
        handleContentBlocksChanged,
      );
      h5ServiceRef.current.on(
        'contentBlockUpdated',
        handleContentBlocksChanged,
      );

      return () => {
        if (h5ServiceRef.current) {
          try {
            h5ServiceRef.current.off(
              'contentBlocksChanged',
              handleContentBlocksChanged,
            );
            h5ServiceRef.current.off(
              'contentBlockAdded',
              handleContentBlocksChanged,
            );
            h5ServiceRef.current.off(
              'contentBlockRemoved',
              handleContentBlocksChanged,
            );
            h5ServiceRef.current.off(
              'contentBlockUpdated',
              handleContentBlocksChanged,
            );
          } catch (error) {
            console.warn('清理H5Service事件监听器时出错:', error);
          }
        }
      };
    }
  }, [updateContentBlocksList, updateAllElements]);

  return (
    <div className="h5-editor-mode g-asset-forge-h5-mode">
      {/* H5Service初始化状态指示器 */}
      {(isInitializing || loading?.isInitializing) && (
        <div className="h5-initialization-overlay">
          <div className="initialization-indicator">
            <div className="spinner" />
            <span>正在初始化H5编辑器...</span>
          </div>
        </div>
      )}

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

      {/* H5Service健康状态指示器 */}
      {h5ServiceHealth && !h5ServiceHealth.isHealthy && (
        <div className="h5-health-warning">
          <span>⚠️ H5服务状态异常</span>
          <details>
            <summary>查看详情</summary>
            <ul>
              {h5ServiceHealth.issues?.map((issue: string, index: number) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </details>
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
            />
          ) : (
            <div className="h5-canvas-loading">
              <div className="loading-content">
                <div className="loading-spinner" />
                <div className="loading-text">正在初始化H5编辑器...</div>
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
