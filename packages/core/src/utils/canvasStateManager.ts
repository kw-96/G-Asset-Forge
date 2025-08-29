/**
 * 画布状态管理器 - Core 包版本
 * 提供可靠的画布状态管理和恢复机制
 */
import { type GAssetForgeEditor } from '../editor';
import { type GAssetForgeGraphics } from '../graphics';

export interface CanvasState {
  isInitialized: boolean;
  hasValidCanvas: boolean;
  currentCanvasId: string | null;
  canvasCount: number;
  lastError: string | null;
}

export interface CanvasStateManager {
  setEditor(editor: GAssetForgeEditor): void;
  getCanvasState(): CanvasState;
  validateEditorState(): boolean;
  ensureValidCanvas(): boolean;
  getCurrentCanvas(): GAssetForgeGraphics | null;
  destroy(): void;
}

/**
 * 创建画布状态管理器实例 - Core 包版本
 */
export const createCanvasStateManager = (): CanvasStateManager => {
  let editor: GAssetForgeEditor | null = null;
  let isDestroyed = false;

  /**
   * 获取当前画布状态
   */
  const getCanvasState = (): CanvasState => {
    if (isDestroyed || !editor) {
      return {
        isInitialized: false,
        hasValidCanvas: false,
        currentCanvasId: null,
        canvasCount: 0,
        lastError: '编辑器未初始化',
      };
    }

    try {
      const currentCanvas = editor.doc?.getCurrentCanvas();
      const canvasItems =
        editor.doc?.graphicsStoreManager?.getCanvasItems() || [];

      return {
        isInitialized: true,
        hasValidCanvas: !!(currentCanvas && currentCanvas.attrs),
        currentCanvasId: currentCanvas?.attrs?.id || null,
        canvasCount: canvasItems.length,
        lastError: null,
      };
    } catch (error) {
      return {
        isInitialized: true,
        hasValidCanvas: false,
        currentCanvasId: null,
        canvasCount: 0,
        lastError: error instanceof Error ? error.message : '未知错误',
      };
    }
  };

  /**
   * 验证编辑器状态
   */
  const validateEditorState = (): boolean => {
    if (isDestroyed || !editor) {
      return false;
    }

    // 验证编辑器核心组件
    const requiredComponents = {
      doc: editor.doc,
      sceneGraph: editor.sceneGraph,
      viewportManager: editor.viewportManager,
      canvasElement: editor.canvasElement,
      ctx: editor.ctx,
      graphicsStoreManager: editor.doc?.graphicsStoreManager,
    };

    const missingComponents = Object.entries(requiredComponents)
      .filter(([, component]) => !component)
      .map(([name]) => name);

    if (missingComponents.length > 0) {
      return false;
    }

    return true;
  };

  /**
   * 确保有有效的画布
   */
  const ensureValidCanvas = (): boolean => {
    if (!validateEditorState()) {
      return false;
    }

    try {
      const currentCanvas = editor!.doc.getCurrentCanvas();

      // 如果当前画布有效，直接返回
      if (currentCanvas && currentCanvas.attrs && currentCanvas.attrs.id) {
        return true;
      }

      // 尝试从现有画布中找到有效的
      const canvasItems = editor!.doc.graphicsStoreManager.getCanvasItems();
      if (canvasItems && canvasItems.length > 0) {
        const validCanvas = canvasItems.find(
          (canvas) => canvas && canvas.attrs && canvas.attrs.id,
        );

        if (validCanvas) {
          editor!.doc.setCurrentCanvas(validCanvas.attrs.id);
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  };
  /**
   * 获取当前画布
   */
  const getCurrentCanvas = (): GAssetForgeGraphics | null => {
    if (!validateEditorState()) {
      return null;
    }

    try {
      // 检查画布存储管理器是否有画布项目
      const canvasItems = editor!.doc.graphicsStoreManager.getCanvasItems();
      if (!canvasItems || canvasItems.length === 0) {
        console.warn('CanvasStateManager: 画布存储中没有可用的画布项目');
        return null;
      }

      // 确保有有效画布
      const hasValidCanvas = ensureValidCanvas();
      if (!hasValidCanvas) {
        console.warn('CanvasStateManager: 无法确保有效画布');
        return null;
      }

      const currentCanvas = editor!.doc.getCurrentCanvas();
      if (!currentCanvas) {
        console.warn('CanvasStateManager: 无法获取当前画布');
        return null;
      }

      return currentCanvas;
    } catch (error) {
      console.error('CanvasStateManager: 获取当前画布时出错:', error);
      return null;
    }
  };

  /**
   * 设置编辑器实例
   */
  const setEditor = (newEditor: GAssetForgeEditor): void => {
    if (isDestroyed) {
      return;
    }

    editor = newEditor;
  };

  /**
   * 销毁管理器
   */
  const destroy = (): void => {
    isDestroyed = true;
    editor = null;
  };

  return {
    setEditor,
    getCanvasState,
    validateEditorState,
    ensureValidCanvas,
    getCurrentCanvas,
    destroy,
  };
};
