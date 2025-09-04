// H5模式界面
import './H5EditorMode.scss';

import { H5Service } from '@g-asset-forge/core';
import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { EditorContext } from '../../context';
import { AutoSaveGraphics } from '../../store/auto-save-graphs';
import { ContentBlockPanel } from './ContentBlockPanel';
import { H5Canvas } from './H5Canvas';
import { H5PropertyPanel } from './H5PropertyPanel';

interface H5EditorModeProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const H5EditorMode: FC<H5EditorModeProps> = ({ containerRef }) => {
  const editor = useContext(EditorContext);
  const h5ServiceRef = useRef<H5Service | null>(null);
  const autoSaveRef = useRef<AutoSaveGraphics | null>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState<boolean>(false);
  // const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

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
      const blocks = h5ServiceRef.current.getAllContentBlocks();
      const blockData = blocks
        .filter((block) => block && block.attrs && block.attrs.id) // 过滤掉无效的块
        .map((block) => ({
          id: block.attrs.id,
          type: block.attrs.blockType || 'unknown',
          content: getBlockContent(block),
          style: block.getBlockStyle ? block.getBlockStyle() : {},
          order: block.attrs.order || 0,
        }));
      setContentBlocks(blockData);
    }
  }, [getBlockContent]);

  useEffect(() => {
    if (editor && containerRef?.current) {
      let saveH5DataInterval: number | null = null;

      try {
        // 初始化 H5 服务
        h5ServiceRef.current = editor?.editor && new H5Service(editor.editor);

        // 初始化自动保存机制
        if (editor?.editor && !autoSaveRef.current) {
          autoSaveRef.current = new AutoSaveGraphics(editor.editor);
          console.log('H5 模式自动保存已启用');
        }

        // 监听编辑器变化事件，确保H5模式下添加的图形能被保存
        const handleEditorChange = () => {
          console.log('H5模式检测到编辑器变化，触发保存');
          if (h5ServiceRef.current) {
            h5ServiceRef.current.saveToEditorData();
          }
        };

        // 监听命令管理器的变化事件
        if (editor.editor?.commandManager) {
          editor.editor.commandManager.on('change', handleEditorChange);
        }

        // 设置H5数据定期保存到编辑器数据
        saveH5DataInterval = setInterval(() => {
          if (h5ServiceRef.current) {
            const success = h5ServiceRef.current.saveToEditorData();
            if (success) {
              console.log('H5数据已定期保存到编辑器数据');
            }
          }
        }, 5000); // 每5秒保存一次H5数据

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
              if (saveH5DataInterval) {
                clearInterval(saveH5DataInterval);
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
  }, [editor, updateContentBlocksList, containerRef]);

  const handleBlockSelect = (blockId: string) => {
    setSelectedBlockId(blockId);
    if (h5ServiceRef.current) {
      if (blockId) {
        h5ServiceRef.current.selectContentBlock(blockId);
        setShowPropertyPanel(true);
      } else {
        h5ServiceRef.current.clearSelection();
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

    if (newBlock && newBlock.attrs && newBlock.attrs.id) {
      updateContentBlocksList();
      // 自动选择新添加的块
      setTimeout(() => {
        handleBlockSelect(newBlock.attrs.id);
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

    const newOrder = [...contentBlocks];
    const draggedBlock = newOrder.splice(dragIndex, 1)[0];
    newOrder.splice(hoverIndex, 0, draggedBlock);

    const reorderedIds = newOrder.map((block) => block.id);
    h5ServiceRef.current.reorderContentBlocks(reorderedIds);
    updateContentBlocksList();
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
      // 通过H5Service的公共方法获取容器
      const container = h5ServiceRef.current.getCurrentContainer();
      if (container) {
        const children = container.getChildren();
        setAllElements(children);
        console.log('H5EditorMode: 更新所有元素列表，数量:', children.length);
      }
    }
  }, []);

  // 监听H5容器的变化
  useEffect(() => {
    updateAllElements();
  }, [updateAllElements, contentBlocks]);

  return (
    <div className="h5-editor-mode g-asset-forge-h5-mode">
      {/* 左侧内容块面板 */}
      <div className="h5-left-panel">
        <ContentBlockPanel
          onBlockAdd={handleBlockAdd}
          selectedBlockId={selectedBlockId}
          contentBlocks={contentBlocks}
          onBlockSelect={handleBlockSelect}
          onBlockDelete={handleBlockDelete}
          onBlockReorder={handleBlockReorder}
          allElements={allElements}
        />
      </div>

      {/* H5画布区域 */}
      <div className="h5-canvas-area">
        <div ref={containerRef} className="editor-canvas-wrapper">
          {/* 编辑器画布将在这里渲染 */}
          <H5Canvas
            contentBlocks={contentBlocks}
            selectedBlockId={selectedBlockId}
            onBlockSelect={handleBlockSelect}
            h5Service={h5ServiceRef.current}
          />
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
