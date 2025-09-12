import './ContextMenu.scss';

import { isWindows } from '@g-asset-forge/common';
import {
  arrangeAndRecord,
  ArrangeType,
  flipHorizontalAndRecord,
  flipVerticalAndRecord,
  groupAndRecord,
  type IHistoryStatus,
  MutateGraphsAndRecord,
  ungroupAndRecord,
} from '@g-asset-forge/core';
import { type IPoint } from '@g-asset-forge/geo';
import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';

import { EditorContext } from '../../context';
import { ComponentSaveDialog } from '../H5EditorMode/ComponentSaveDialog';
import ContextMenuItem from './components/ContextMenuItem';
import ContextMenuSep from './components/ContextMenuSep';

const OFFSET_X = 2;
const OFFSET_Y = -5;
const MENU_SPACE_PADDING = 60;

export const ContextMenu: FC = () => {
  const editor = useContext(EditorContext);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUdo] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // avoid the right-click menu goes off the screen
  const calculateMenuPosition = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = pos.x + OFFSET_X;
    let top = pos.y + OFFSET_Y;

    if (left + menuSize.width > viewportWidth) {
      left = pos.x - menuSize.width - OFFSET_X;
    }

    if (top < MENU_SPACE_PADDING) {
      top = MENU_SPACE_PADDING;
    } else if (pos.y + menuSize.height + MENU_SPACE_PADDING > viewportHeight) {
      top = viewportHeight - MENU_SPACE_PADDING - menuSize.height;
    }

    return { left, top };
  }, [pos.x, pos.y, menuSize]);

  useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setMenuSize({ width: rect.width, height: rect.height });
    }
  }, [visible]);

  useEffect(() => {
    if (editor?.editor) {
      // 监听 editor �?contextmenu 事件
      const handleContextmenu = (pos: IPoint) => {
        if (!visible) {
          const hitTestResult = editor?.editor?.selectedBox.hitTest(
            editor?.editor?.getSceneCursorXY({
              clientX: pos.x,
              clientY: pos.y,
            }),
          );
          setShowCopy(!!hitTestResult);
          setVisible(true);
          setPos(pos);
        }
      };
      editor?.editor?.hostEventManager.on('contextmenu', handleContextmenu);

      const handleCommandChange = (status: IHistoryStatus) => {
        setCanRedo(status.canRedo);
        setCanUdo(status.canUndo);
      };
      editor?.editor?.commandManager.on('change', handleCommandChange);
      return () => {
        editor?.editor?.hostEventManager.off('contextmenu', handleContextmenu);
        editor?.editor?.commandManager.off('change', handleCommandChange);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  /**
   * contextmenu part showed anyway
   */
  const renderNoSelectContextMenu = () => {
    return (
      <>
        {showCopy && (
          <>
            <ContextMenuItem
              suffix={isWindows() ? 'Ctrl+C' : '⌘C'}
              onClick={() => {
                setVisible(false);
                if (editor?.editor) {
                  editor?.editor?.clipboard?.copy();
                }
              }}
            >
              <FormattedMessage id="command.copy" />
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setVisible(false);
                if (editor?.editor) {
                  editor?.editor?.clipboard?.copyAsSVG();
                }
              }}
            >
              <FormattedMessage id="command.copyAsSVG" />
            </ContextMenuItem>
          </>
        )}
        <ContextMenuItem
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              const scenePos = editor?.editor?.getSceneCursorXY(
                {
                  clientX: pos.x,
                  clientY: pos.y,
                },
                true,
              );
              editor?.editor?.clipboard.pasteAt(scenePos);
            }
          }}
        >
          <FormattedMessage id="command.pasteHere" />
        </ContextMenuItem>
        <ContextMenuSep />
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+Z' : '⌘Z'}
          disabled={!canUndo}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              editor?.editor?.commandManager?.undo();
            }
          }}
        >
          <FormattedMessage id="command.undo" />
        </ContextMenuItem>
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+Shift+Z' : '⇧⌘Z'}
          disabled={!canRedo}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              editor?.editor?.commandManager?.redo();
            }
          }}
        >
          <FormattedMessage id="command.redo" />
        </ContextMenuItem>
        <ContextMenuSep />
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+A' : '⌘A'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              editor?.editor?.selectedElements?.selectAll();
              editor?.editor?.render();
            }
          }}
        >
          <FormattedMessage id="command.selectAll" />
        </ContextMenuItem>
      </>
    );
  };

  /**
   * 检查选中的元素是否是画框
   */
  const isFrameSelected = () => {
    if (!editor?.editor) return false;
    const selectedItems = editor.editor.selectedElements.getItems();
    if (selectedItems.length !== 1) return false;

    const selectedItem = selectedItems[0];
    // 检查是否是画框类型
    return (
      selectedItem.type === 'Frame' ||
      selectedItem.constructor?.name === 'Frame'
    );
  };

  /**
   * 处理添加为组件
   */
  const handleAddAsComponent = () => {
    setVisible(false);
    if (!editor?.editor) return;

    const selectedItems = editor.editor.selectedElements.getItems();
    if (selectedItems.length !== 1) return;

    const frame = selectedItems[0];
    setSelectedFrame(frame);
    setShowComponentDialog(true);
  };

  /**
   * 处理组件保存
   */
  const handleComponentSave = useCallback(async (component: any) => {
    try {
      console.log('组件保存成功:', component);

      // 触发组件列表刷新事件
      window.dispatchEvent(
        new CustomEvent('componentSaved', {
          detail: { component },
        }),
      );

      alert('组件保存成功！');
    } catch (error) {
      console.error('保存组件失败:', error);
      alert('保存组件失败，请重试');
    }
  }, []);

  /**
   * 处理组件对话框关闭
   */
  const handleComponentDialogClose = useCallback(() => {
    setShowComponentDialog(false);
    setSelectedFrame(null);
  }, []);

  /**
   * with select elements
   */
  const renderSelectContextMenu = () => {
    return (
      <>
        {/* 添加为组件 - 只在选中单个画框时显示 */}
        {isFrameSelected() && (
          <>
            <ContextMenuItem onClick={handleAddAsComponent}>
              添加为组件
            </ContextMenuItem>
            <ContextMenuSep />
          </>
        )}
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+G' : '⌘G'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              groupAndRecord(
                editor?.editor?.selectedElements?.getItems(),
                editor?.editor,
              );
            }
          }}
        >
          <FormattedMessage id="group" />
        </ContextMenuItem>
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+Backspace' : '⌘⌫'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              ungroupAndRecord(
                editor?.editor?.selectedElements?.getItems(),
                editor?.editor,
              );
            }
          }}
        >
          <FormattedMessage id="ungroup" />
        </ContextMenuItem>
        <ContextMenuSep />
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+]' : '⌘]'}
          onClick={() => {
            setVisible(false);
            editor?.editor &&
              arrangeAndRecord(editor.editor, ArrangeType.Forward);
          }}
        >
          <FormattedMessage id="arrange.forward" />
        </ContextMenuItem>
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+[' : '⌘['}
          onClick={() => {
            setVisible(false);
            editor?.editor &&
              arrangeAndRecord(editor.editor, ArrangeType.Backward);
          }}
        >
          <FormattedMessage id="arrange.backward" />
        </ContextMenuItem>
        <ContextMenuItem
          suffix="]"
          onClick={() => {
            setVisible(false);
            editor?.editor &&
              arrangeAndRecord(editor.editor, ArrangeType.Front);
          }}
        >
          <FormattedMessage id="arrange.front" />
        </ContextMenuItem>
        <ContextMenuItem
          suffix="["
          onClick={() => {
            setVisible(false);
            editor?.editor && arrangeAndRecord(editor.editor, ArrangeType.Back);
          }}
        >
          <FormattedMessage id="arrange.back" />
        </ContextMenuItem>

        <ContextMenuSep />
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+Shift+H' : '⇧⌘H'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              MutateGraphsAndRecord.toggleVisible(
                editor?.editor,
                editor?.editor?.selectedElements?.getItems(),
              );
              editor?.editor?.render();
            }
          }}
        >
          <FormattedMessage id="showOrHide" />
        </ContextMenuItem>
        {/* lock/unlock */}
        <ContextMenuItem
          suffix={isWindows() ? 'Ctrl+Shift+L' : '⇧⌘L'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              MutateGraphsAndRecord.toggleLock(
                editor?.editor,
                editor?.editor?.selectedElements?.getItems(),
              );
              editor?.editor?.render();
            }
          }}
        >
          <FormattedMessage id="lockOrUnlock" />
        </ContextMenuItem>
        <ContextMenuSep />
        {/* flipHorizontal */}
        <ContextMenuItem
          suffix={isWindows() ? 'Shift+H' : '⇧H'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              flipHorizontalAndRecord(
                editor?.editor,
                editor?.editor?.selectedElements?.getItems(),
              );
              editor?.editor?.render();
            }
          }}
        >
          <FormattedMessage id="flip.horizontal" />
        </ContextMenuItem>
        {/* flipVertical */}
        <ContextMenuItem
          suffix={isWindows() ? 'Shift+V' : '⇧V'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              flipVerticalAndRecord(
                editor?.editor,
                editor?.editor?.selectedElements?.getItems(),
              );
              editor?.editor?.render();
            }
          }}
        >
          <FormattedMessage id="flip.vertical" />
        </ContextMenuItem>
        <ContextMenuSep />
        <ContextMenuItem
          suffix={isWindows() ? 'Backspace' : '⌫'}
          onClick={() => {
            setVisible(false);
            if (editor?.editor) {
              editor?.editor?.selectedElements?.removeFromScene();
            }
          }}
        >
          <FormattedMessage id="delete" />
        </ContextMenuItem>
      </>
    );
  };

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      {visible && (
        <div
          className="g-asset-forge-context-menu-mask"
          onMouseDown={() => {
            setVisible(false);
          }}
        />
      )}
      <div
        ref={menuRef}
        className="g-asset-forge-context-menu"
        style={{
          display: visible ? undefined : 'none',
          ...calculateMenuPosition(),
        }}
      >
        {renderNoSelectContextMenu()}
        {editor &&
          !editor?.editor?.selectedElements?.isEmpty() &&
          renderSelectContextMenu()}
      </div>

      {/* 组件保存对话框 */}
      <ComponentSaveDialog
        isOpen={showComponentDialog}
        onClose={handleComponentDialogClose}
        onSave={handleComponentSave}
        selectedFrame={selectedFrame}
      />
    </div>
  );
};
