import './Pages.scss';

import { IconButton } from '@g-asset-forge/components';
import {
  addAndSwitchCanvasRecord,
  type GAssetForgeCanvas,
  MutateGraphsAndRecord,
  removeGraphicsAndRecord,
  switchCanvasRecord,
} from '@g-asset-forge/core';
import { AddOutlined } from '@g-asset-forge/icons';
import { type FC, useContext, useEffect, useRef, useState } from 'react';

import { EditorContext } from '../../context';
import { BaseCard } from '../Cards/BaseCard';
import { PageContextMenu } from '../ContextMenu';
import { PageItem } from './PageItem';

export const Pages: FC = () => {
  const contextValue = useContext(EditorContext);
  const editor = contextValue.editor;

  const [currPageId, setCurrPageId] = useState<string>('');
  const [pageItems, setPageItems] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [canvasIdByMenu, setCanvasIdByMenu] = useState<string>('');

  // 定期检查定时器引用
  const periodicCheckRef = useRef<number | null>(null);
  // 防重复更新标志
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!editor) return;

    const updatePageItems = () => {
      // 防止重复更新
      if (isUpdatingRef.current) {
        return;
      }

      isUpdatingRef.current = true;

      try {
        // 延迟验证，给编辑器更多时间初始化
        setTimeout(() => {
          try {
            // 获取当前项目的页面数据 - 从编辑器获取画布列表
            let pages: any[] = [];

            try {
              // 从编辑器获取当前项目的画布列表
              pages = editor.doc.graphicsStoreManager.getCanvasItemsData();
            } catch (error) {
              console.warn('Pages: 从编辑器获取数据失败:', error);
            }

            setPageItems(pages || []);

            // 设置当前页面ID
            const currentCanvas = editor.doc.getCurrentCanvas();
            if (currentCanvas) {
              const newCurrentPageId = currentCanvas.attrs.id || '';
              setCurrPageId(newCurrentPageId);
            } else {
              console.warn('无法获取当前画布，设置空的页面ID');
              setCurrPageId('');
            }
          } catch (error) {
            console.error('延迟更新页面项目时出错:', error);
          } finally {
            // 重置更新标志
            isUpdatingRef.current = false;
          }
        }, 100); // 延迟100ms等待编辑器完全初始化
      } catch (error) {
        console.error('更新页面项目时出错:', error);
        setPageItems([]);
        setCurrPageId('');
        // 重置更新标志
        isUpdatingRef.current = false;
      }
    };

    updatePageItems();

    // 添加状态恢复机制
    const attemptStateRecovery = () => {
      setTimeout(() => {
        try {
          if (pageItems.length === 0 && editor?.doc?.graphicsStoreManager) {
            const pages = editor.doc.graphicsStoreManager.getCanvasItemsData();
            if (pages && pages.length > 0) {
              setPageItems(pages);

              // 尝试设置当前页面ID
              const currentCanvas = editor.doc.getCurrentCanvas();
              if (currentCanvas && currentCanvas.attrs) {
                setCurrPageId(currentCanvas.attrs.id);
              }
            }
          }
        } catch (error) {
          console.error('Pages: 状态恢复失败:', error);
        }
      }, 500); // 延迟500ms进行状态恢复
    };

    // 在初始化后尝试状态恢复
    attemptStateRecovery();

    // 监听编辑器状态变化
    const editorStateHandler = () => {
      setTimeout(() => {
        updatePageItems();
      }, 100);
    };

    // 尝试监听编辑器的事件
    try {
      if (editor && editor.on) {
        // 检查编辑器是否支持这些事件类型
        if (typeof editor.on === 'function') {
          // 使用类型安全的事件监听
          try {
            editor.on('destroy', editorStateHandler);
          } catch (error) {
            console.warn('Pages: 监听编辑器事件失败:', error);
          }
        }
      }
    } catch (error) {
      console.warn('Pages: 监听编辑器事件失败:', error);
    }

    // 设置定期检查，确保页面状态与编辑器状态同步
    if (periodicCheckRef.current) {
      clearInterval(periodicCheckRef.current);
    }

    periodicCheckRef.current = window.setInterval(() => {
      try {
        if (editor) {
          const currentCanvas = editor.doc.getCurrentCanvas();
          if (currentCanvas && currentCanvas.attrs) {
            const newCurrentPageId = currentCanvas.attrs.id;
            if (newCurrentPageId !== currPageId) {
              setCurrPageId(newCurrentPageId);
            }
          }
        }
      } catch (error) {
        console.warn('Pages: 定期检查时出错:', error);
      }
    }, 2000); // 每2秒检查一次

    // 清理函数
    return () => {
      if (periodicCheckRef.current) {
        clearInterval(periodicCheckRef.current);
        periodicCheckRef.current = null;
      }

      // 清理编辑器事件监听器
      try {
        if (editor && editor.off && typeof editor.off === 'function') {
          editor.off('destroy', editorStateHandler);
        }
      } catch (error) {
        console.warn('Pages: 清理编辑器事件监听器失败:', error);
      }
    };
  }, [editor, pageItems.length, currPageId]);

  // 组件卸载时清理画布状态管理器
  useEffect(() => {
    return () => {
      // 延迟销毁，避免在编辑器操作过程中过早销毁
      setTimeout(() => {}, 2000); // 增加延迟时间，避免热更新时过早销毁
    };
  }, []);

  const setName = (id: string, newName: string) => {
    if (!editor) return;

    try {
      const graphics = editor.doc.getGraphicsById(id);
      if (graphics && graphics.attrs && graphics.attrs.objectName !== newName) {
        MutateGraphsAndRecord.setGraphName(editor, graphics, newName);
        editor.render();
      }
    } catch (error) {
      console.error('设置页面名称时出错:', error);
    }
  };

  const switchPage = (canvasId: string) => {
    if (!editor) {
      console.warn('Pages: 编辑器未初始化，无法切换页面');
      return;
    }

    try {
      // 先验证画布是否存在
      const canvas = editor.doc.getGraphicsById(canvasId);
      if (!canvas) {
        console.warn('Pages: 要切换的画布不存在:', canvasId);
        return;
      }

      // 检查画布是否已经是当前画布
      const currentCanvas = editor.doc.getCurrentCanvas();
      if (
        currentCanvas &&
        currentCanvas.attrs &&
        currentCanvas.attrs.id === canvasId
      ) {
        return;
      }

      // 执行切换
      switchCanvasRecord(editor, canvasId);

      // 更新当前页面ID
      setCurrPageId(canvasId);

      // 触发渲染
      editor.render();
    } catch (error) {
      console.error('切换页面时出错:', error);
    }
  };

  const createNewPage = () => {
    if (!editor) return;

    try {
      addAndSwitchCanvasRecord(editor, undefined);
      editor.render();
    } catch (error) {
      console.error('创建新页面时出错:', error);
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    id: string,
  ) => {
    setCanvasIdByMenu(id);
    setMenuVisible(true);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="g-asset-forge-page-list">
      <BaseCard
        title="Pages"
        headerAction={
          <IconButton
            onClick={() => {
              createNewPage();
            }}
          >
            <AddOutlined />
          </IconButton>
        }
      >
        <div className="g-asset-forge-page-list-content">
          {pageItems.map((item) => (
            <PageItem
              key={item.id}
              id={item.id}
              name={item.name}
              activeId={currPageId}
              setName={setName}
              setSelectedGraph={switchPage}
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
      </BaseCard>
      <PageContextMenu
        visible={menuVisible}
        setVisible={setMenuVisible}
        pos={menuPos}
        style={{
          width: 150,
        }}
        disabledDelete={pageItems.length <= 1}
        onDelete={() => {
          if (!editor) return;

          try {
            const canvas = editor.doc.getGraphicsById(
              canvasIdByMenu,
            ) as GAssetForgeCanvas;
            if (!canvas || !canvas.attrs) {
              console.warn('要删除的画布不存在或缺少attrs属性');
              return;
            }

            const isCurrentCanvasToDelete = canvas.attrs.id === currPageId;

            const newCurrentCanvas =
              canvas.getNextSibling() || canvas.getPrevSibling();

            editor.commandManager.batchCommandStart();
            removeGraphicsAndRecord(editor, [canvas]);

            if (
              isCurrentCanvasToDelete &&
              newCurrentCanvas &&
              newCurrentCanvas.attrs
            ) {
              switchCanvasRecord(editor, newCurrentCanvas.attrs.id);
            }

            editor.commandManager.batchCommandEnd();
            editor.render();
          } catch (error) {
            console.error('删除页面时出错:', error);
          }
        }}
      />
    </div>
  );
};
