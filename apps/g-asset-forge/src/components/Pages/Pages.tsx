import './Pages.scss';

import { IconButton } from '@g-asset-forge/components';
import {
  addAndSwitchCanvasRecord,
  MutateGraphsAndRecord,
  removeGraphicsAndRecord,
  type GAssetForgeCanvas,
  switchCanvasRecord,
} from '@g-asset-forge/core';
import { AddOutlined } from '@g-asset-forge/icons';
import { type FC, useContext, useEffect, useState } from 'react';

import { EditorContext } from '../../context';
import { BaseCard } from '../Cards/BaseCard';
import { PageContextMenu } from '../ContextMenu';
import { PageItem } from './PageItem';

export const Pages: FC = () => {
  const editor = useContext(EditorContext);

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

  useEffect(() => {
    if (!editor) return;

    const updatePageItems = () => {
      try {
        const pages = editor.doc.graphicsStoreManager.getCanvasItemsData();
        setPageItems(pages);

        // 安全地获取当前画布ID
        const currentCanvas = editor.doc.getCurrentCanvas();
        if (currentCanvas && currentCanvas.attrs) {
          setCurrPageId(currentCanvas.attrs.id);
        } else {
          console.warn('当前画布不存在或缺少attrs属性');
          setCurrPageId('');
        }
      } catch (error) {
        console.error('更新页面项目时出错:', error);
        setPageItems([]);
        setCurrPageId('');
      }
    };

    updatePageItems();

    const renderHandler = () => {
      updatePageItems();
    };

    editor.sceneGraph.on('render', renderHandler);

    // 清理函数
    return () => {
      editor.sceneGraph.off('render', renderHandler);
    };
  }, [editor]);

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
    if (!editor) return;

    try {
      switchCanvasRecord(editor, canvasId);
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
      console.log('新页面创建成功');
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
