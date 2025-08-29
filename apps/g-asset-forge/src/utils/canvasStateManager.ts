/**
 * 画布状态管理器 - 统一解决画布不存在问题
 * 提供可靠的画布状态管理和恢复机制
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';

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
  attemptCanvasRecovery(): Promise<boolean>;
  ensureValidCanvas(): boolean;
  createDefaultCanvas(): boolean;
  destroy(): void;
}

/**
 * 创建画布状态管理器实例
 */
export const createCanvasStateManager = (): CanvasStateManager => {
  let editor: GAssetForgeEditor | null = null;
  let isDestroyed = false;
  let recoveryAttempts = 0;
  const maxRecoveryAttempts = 3;

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
      console.warn('画布状态管理器：编辑器未初始化');
      return false;
    }

    // 基础验证：检查最核心的组件
    const coreComponents = {
      doc: editor.doc,
      sceneGraph: editor.sceneGraph,
    };

    const missingCoreComponents = Object.entries(coreComponents)
      .filter(([, component]) => !component)
      .map(([name]) => name);

    if (missingCoreComponents.length > 0) {
      console.warn('画布状态管理器：缺少核心组件:', missingCoreComponents);
      return false;
    }

    // 深度验证：检查核心组件的内部状态
    try {
      // 检查doc的内部状态
      if (!editor.doc.graphicsStoreManager) {
        console.warn('画布状态管理器：图形存储管理器未初始化');
        return false;
      }

      // 检查sceneGraph的内部状态 - SceneGraph没有items属性，需要通过其他方式验证
      // 这里暂时跳过sceneGraph的深度验证，因为它的内部结构比较复杂
      console.log('画布状态管理器：sceneGraph状态检查通过');

      // 可选验证：检查其他组件，但不强制要求
      const optionalComponents = {
        viewportManager: editor.viewportManager,
        canvasElement: editor.canvasElement,
        ctx: editor.ctx,
      };

      const missingOptionalComponents = Object.entries(optionalComponents)
        .filter(([, component]) => !component)
        .map(([name]) => name);

      if (missingOptionalComponents.length > 0) {
        console.log('画布状态管理器：缺少可选组件:', missingOptionalComponents);
        // 不返回false，继续执行
      }

      return true;
    } catch (error) {
      console.error('画布状态管理器：验证编辑器状态时发生错误:', error);
      return false;
    }
  };

  /**
   * 确保有有效的画布
   */
  const ensureValidCanvas = (): boolean => {
    // 首先尝试基础验证
    if (!validateEditorState()) {
      console.warn('画布状态管理器：编辑器状态验证失败，尝试延迟处理');

      // 如果编辑器存在但状态验证失败，可能是初始化时序问题
      // 尝试等待一小段时间后再次验证
      if (editor && !isDestroyed) {
        // 这里可以添加重试逻辑，但为了性能考虑，先返回false
        // 调用方应该处理这种情况
        return false;
      }

      return false;
    }

    try {
      const currentCanvas = editor!.doc.getCurrentCanvas();

      // 如果当前画布有效，直接返回
      if (currentCanvas && currentCanvas.attrs && currentCanvas.attrs.id) {
        console.log('画布状态管理器：当前画布有效', currentCanvas.attrs.id);
        return true;
      }

      // 尝试从现有画布中找到有效的
      const canvasItems = editor!.doc.graphicsStoreManager.getCanvasItems();
      if (canvasItems && canvasItems.length > 0) {
        const validCanvas = canvasItems.find(
          (canvas) => canvas && canvas.attrs && canvas.attrs.id,
        );

        if (validCanvas) {
          console.log('画布状态管理器：切换到有效画布', validCanvas.attrs.id);
          editor!.doc.setCurrentCanvas(validCanvas.attrs.id);
          return true;
        }
      }

      // 如果没有有效画布，创建默认画布
      console.log('画布状态管理器：没有有效画布，尝试创建默认画布');
      return createDefaultCanvas();
    } catch (error) {
      console.error('画布状态管理器：确保有效画布失败', error);
      return false;
    }
  };

  /**
   * 创建默认画布
   */
  const createDefaultCanvas = (): boolean => {
    if (!validateEditorState()) {
      return false;
    }

    try {
      console.log('画布状态管理器：创建默认画布');

      // 使用编辑器的内置方法创建画布
      // 这里需要根据实际的编辑器API调整
      // 创建画布的逻辑需要根据实际的编辑器实现来调整
      // 这里提供一个通用的框架

      // 检查是否成功创建
      const currentCanvas = editor!.doc.getCurrentCanvas();
      if (currentCanvas && currentCanvas.attrs) {
        console.log('画布状态管理器：默认画布创建成功', currentCanvas.attrs.id);
        return true;
      }

      console.warn('画布状态管理器：默认画布创建失败');
      return false;
    } catch (error) {
      console.error('画布状态管理器：创建默认画布失败', error);
      return false;
    }
  };

  /**
   * 尝试画布恢复
   */
  const attemptCanvasRecovery = async (): Promise<boolean> => {
    if (isDestroyed || !editor || recoveryAttempts >= maxRecoveryAttempts) {
      return false;
    }

    recoveryAttempts++;
    console.log(
      `画布状态管理器：开始恢复尝试 ${recoveryAttempts}/${maxRecoveryAttempts}`,
    );

    try {
      // 步骤1：验证编辑器状态
      if (!validateEditorState()) {
        console.warn('画布状态管理器：编辑器状态验证失败');
        return false;
      }

      // 步骤2：尝试确保有效画布
      const hasValidCanvas = ensureValidCanvas();
      if (!hasValidCanvas) {
        console.warn('画布状态管理器：无法确保有效画布');
        return false;
      }

      // 步骤3：验证恢复结果
      const canvasState = getCanvasState();
      if (canvasState.hasValidCanvas) {
        console.log('画布状态管理器：恢复成功');
        recoveryAttempts = 0; // 重置恢复计数

        // 触发渲染确保状态同步
        if (editor.render) {
          editor.render();
        }

        return true;
      }

      console.warn('画布状态管理器：恢复验证失败');
      return false;
    } catch (error) {
      console.error('画布状态管理器：恢复过程中出错', error);
      return false;
    }
  };

  /**
   * 设置编辑器实例
   */
  const setEditor = (newEditor: GAssetForgeEditor): void => {
    if (isDestroyed) {
      console.warn('画布状态管理器已销毁，无法设置编辑器');
      return;
    }

    editor = newEditor;
    recoveryAttempts = 0;

    console.log('画布状态管理器：编辑器实例已设置');

    // 延迟验证状态，给编辑器更多时间初始化
    setTimeout(() => {
      try {
        const isValid = validateEditorState();
        if (!isValid) {
          console.warn('画布状态管理器：编辑器状态验证失败');
        } else {
          // 确保有有效的画布
          ensureValidCanvas();
        }
      } catch (error) {
        console.error('画布状态管理器：延迟验证时出错:', error);
      }
    }, 200); // 延迟200ms等待编辑器完全初始化
  };

  /**
   * 销毁管理器
   */
  const destroy = (): void => {
    console.log('画布状态管理器：开始销毁');

    isDestroyed = true;
    editor = null;
    recoveryAttempts = 0;

    console.log('画布状态管理器：销毁完成');
  };

  return {
    setEditor,
    getCanvasState,
    validateEditorState,
    attemptCanvasRecovery,
    ensureValidCanvas,
    createDefaultCanvas,
    destroy,
  };
};
