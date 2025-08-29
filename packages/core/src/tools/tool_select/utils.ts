/**
 * 工具选择工具的辅助函数
 * 提供命中测试、选择操作等功能
 * 使用统一的画布状态管理器
 */

import { type IBox, type IPoint, rectToBox } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../../editor';
import { type GAssetForgeGraphics, type IHitOptions } from '../../graphics';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../../utils/canvasStateManager';

// 创建全局画布状态管理器实例
let globalCanvasStateManager: CanvasStateManager | null = null;

/**
 * 初始化画布状态管理器
 */
const initCanvasStateManager = (): CanvasStateManager => {
  if (!globalCanvasStateManager) {
    globalCanvasStateManager = createCanvasStateManager();
  }
  return globalCanvasStateManager;
};

/**
 * 获取有效的画布对象 - 使用统一的画布状态管理器
 */
const getValidCanvas = (
  editor: GAssetForgeEditor,
): GAssetForgeGraphics | null => {
  const canvasStateManager = initCanvasStateManager();
  canvasStateManager.setEditor(editor);

  // 使用画布状态管理器获取当前画布
  return canvasStateManager.getCurrentCanvas();
};

/********* get top hit element ********/
export const getTopHitElement = (
  editor: GAssetForgeEditor,
  point: IPoint,
): GAssetForgeGraphics | null => {
  // 验证编辑器状态
  if (!editor || !editor.doc || !editor.viewportManager || !editor.setting) {
    console.warn('编辑器状态异常，无法执行命中测试');
    return null;
  }

  const zoom = editor.viewportManager.getZoom();
  const tol = editor.setting.get('selectionHitPadding') / zoom;

  // 使用增强的画布获取逻辑
  const canvasGraphics = getValidCanvas(editor);
  if (!canvasGraphics) {
    return null;
  }

  const parentIdSet = editor.selectedElements.getParentIdSet();
  const hitOptions: IHitOptions = {
    tol,
    parentIdSet,
    zoom,
  };

  try {
    return canvasGraphics.getHitGraphics(point, hitOptions);
  } catch (error) {
    console.error('执行命中测试时出错:', error);
    return null;
  }
};

/****** get elements in selection ******/
export const getElementsInSelection = (
  editor: GAssetForgeEditor,
  parentIdSet: Set<string> = new Set(),
): GAssetForgeGraphics[] => {
  // 验证编辑器状态
  if (!editor || !editor.sceneGraph || !editor.doc) {
    console.warn('编辑器状态异常，无法执行选择操作');
    return [];
  }

  const selection = editor.sceneGraph.selection;
  if (selection === null) {
    console.warn('selection 为 null，请确认在正确的时机调用当前方法');
    return [];
  }
  const selectionBox = rectToBox(selection);

  // 使用增强的画布获取逻辑
  const currentCanvas = getValidCanvas(editor);
  if (!currentCanvas) {
    return [];
  }

  try {
    return getElementsInSelectionDFS(
      editor,
      selectionBox,
      currentCanvas,
      parentIdSet,
    );
  } catch (error) {
    console.error('执行选择操作时出错:', error);
    return [];
  }
};

const getElementsInSelectionDFS = (
  editor: GAssetForgeEditor,
  box: IBox,
  node: GAssetForgeGraphics,
  parentIdSet: Set<string>,
): GAssetForgeGraphics[] => {
  const graphicsArr: GAssetForgeGraphics[] = [];
  const children = node.getChildren();
  for (const child of children) {
    if (!child.isVisible() || child.isLock()) continue;
    if (parentIdSet.has(child.attrs.id)) {
      graphicsArr.push(
        ...getElementsInSelectionDFS(editor, box, child, parentIdSet),
      );
    } else if (child.intersectWithChildrenBox(box)) {
      graphicsArr.push(child);
    }
  }
  return graphicsArr;
};
