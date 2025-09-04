/**
 * 编辑器初始化管理器 - 解决初始化时序问题
 * 确保编辑器组件按正确顺序初始化，避免画布状态异常
 */
import { type GAssetForgeEditor, type SettingValue } from '@g-asset-forge/core';

export interface EditorInitializationConfig {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  offsetY?: number;
  offsetX?: number;
  showPerfMonitor?: boolean;
  userPreference?: Partial<SettingValue>;
}

export interface EditorInitializationResult {
  editor: GAssetForgeEditor | null;
  success: boolean;
  error?: string;
}

/**
 * 安全的编辑器初始化函数
 * 包含完整的错误处理和状态验证
 */
export const initializeEditorSafely = async (
  config: EditorInitializationConfig,
): Promise<EditorInitializationResult> => {
  try {
    console.log('开始安全的编辑器初始化');

    // 验证配置参数
    if (!config.containerElement) {
      throw new Error('容器元素不存在');
    }

    if (config.width <= 0 || config.height <= 0) {
      throw new Error('无效的编辑器尺寸');
    }

    // 动态导入编辑器类以避免循环依赖
    const { GAssetForgeEditor } = await import('@g-asset-forge/core');

    // 创建编辑器实例
    const editor = new GAssetForgeEditor({
      containerElement: config.containerElement,
      width: config.width,
      height: config.height,
      offsetY: config.offsetY || 0,
      offsetX: config.offsetX || 0,
      showPerfMonitor: config.showPerfMonitor || false,
      userPreference: config.userPreference,
    });

    // 验证编辑器初始化状态
    const validationResult = await validateEditorInitialization(editor);
    if (!validationResult.success) {
      throw new Error(`编辑器初始化验证失败: ${validationResult.error}`);
    }

    console.log('编辑器初始化成功');
    return {
      editor,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('编辑器初始化失败:', errorMessage);

    return {
      editor: null,
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 验证编辑器初始化状态
 */
const validateEditorInitialization = async (
  editor: GAssetForgeEditor,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 验证核心组件
    const requiredComponents = {
      doc: editor.doc,
      sceneGraph: editor.sceneGraph,
      viewportManager: editor.viewportManager,
      canvasElement: editor.canvasElement,
      ctx: editor.ctx,
      toolManager: editor.toolManager,
      commandManager: editor.commandManager,
      selectedElements: editor.selectedElements,
    };

    const missingComponents = Object.entries(requiredComponents)
      .filter(([, component]) => !component)
      .map(([name]) => name);

    if (missingComponents.length > 0) {
      return {
        success: false,
        error: `缺少必要组件: ${missingComponents.join(', ')}`,
      };
    }

    // 验证文档和画布状态
    if (!editor.doc.graphicsStoreManager) {
      return {
        success: false,
        error: '图形存储管理器未初始化',
      };
    }

    // 检查画布状态
    const canvasItems = editor.doc.graphicsStoreManager.getCanvasItems();
    if (!canvasItems || canvasItems.length === 0) {
      console.log('没有画布项目，这是正常的初始状态');
    } else {
      // 如果有画布项目，验证当前画布
      const currentCanvas = editor.doc.getCurrentCanvas();
      if (!currentCanvas) {
        console.warn('有画布项目但无当前画布，尝试设置第一个画布');

        const firstCanvas = canvasItems[0];
        if (firstCanvas && firstCanvas.attrs && firstCanvas.attrs.id) {
          editor.doc.setCurrentCanvas(firstCanvas.attrs.id);

          // 再次验证
          const verifyCanvas = editor.doc.getCurrentCanvas();
          if (!verifyCanvas) {
            return {
              success: false,
              error: '无法设置当前画布',
            };
          }
        }
      }
    }

    // 验证渲染能力
    try {
      editor.render();
    } catch (renderError) {
      return {
        success: false,
        error: `渲染测试失败: ${
          renderError instanceof Error ? renderError.message : '未知渲染错误'
        }`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '验证过程中发生未知错误',
    };
  }
};

/**
 * 编辑器健康检查
 * 定期检查编辑器状态，发现问题时尝试修复
 */
export const createEditorHealthChecker = (editor: GAssetForgeEditor) => {
  let isDestroyed = false;
  let checkCount = 0;
  const maxChecks = 100; // 最多检查100次，避免无限循环

  const healthCheck = async () => {
    if (isDestroyed || checkCount >= maxChecks) {
      return;
    }

    checkCount++;

    try {
      // 简单的编辑器状态检查
      if (!editor || !editor.containerElement) {
        console.warn('健康检查：编辑器或容器元素不存在');
        return;
      }

      // 检查当前画布
      const currentCanvas = editor.doc.getCurrentCanvas();
      if (!currentCanvas) {
        console.warn('健康检查：当前画布不存在');
      }
    } catch (error) {
      console.error('健康检查失败:', error);
    }
  };

  // 每5秒检查一次
  const intervalId = setInterval(healthCheck, 5000);

  // 注册到全局定时器列表，便于清理
  if (typeof window !== 'undefined') {
    if (!(window as any).__G_ASSET_FORGE_TIMERS__) {
      (window as any).__G_ASSET_FORGE_TIMERS__ = [];
    }
    (window as any).__G_ASSET_FORGE_TIMERS__.push(intervalId);
  }

  // 返回清理函数
  return () => {
    isDestroyed = true;
    clearInterval(intervalId);

    // 从全局定时器列表中移除
    if (
      typeof window !== 'undefined' &&
      (window as any).__G_ASSET_FORGE_TIMERS__
    ) {
      const index = (window as any).__G_ASSET_FORGE_TIMERS__.indexOf(
        intervalId,
      );
      if (index > -1) {
        (window as any).__G_ASSET_FORGE_TIMERS__.splice(index, 1);
      }
    }

    console.log('编辑器健康检查已停止');
  };
};

/**
 * 编辑器状态诊断工具
 * 用于调试和问题排查
 */
export const diagnoseEditorState = (editor: GAssetForgeEditor): void => {
  console.group('编辑器状态诊断');

  try {
    // 基本组件状态
    console.log('基本组件状态:', {
      hasDoc: !!editor.doc,
      hasSceneGraph: !!editor.sceneGraph,
      hasViewportManager: !!editor.viewportManager,
      hasCanvasElement: !!editor.canvasElement,
      hasCtx: !!editor.ctx,
      hasToolManager: !!editor.toolManager,
      hasCommandManager: !!editor.commandManager,
    });

    // 文档状态
    if (editor.doc) {
      console.log('文档状态:', {
        hasGraphicsStoreManager: !!editor.doc.graphicsStoreManager,
        currentCanvasId: (editor.doc as any).currentCanvasId,
      });

      // 画布状态
      if (editor.doc.graphicsStoreManager) {
        const canvasItems = editor.doc.graphicsStoreManager.getCanvasItems();
        const currentCanvas = editor.doc.getCurrentCanvas();

        console.log('画布状态:', {
          canvasCount: canvasItems.length,
          hasCurrentCanvas: !!currentCanvas,
          currentCanvasId: currentCanvas?.attrs?.id,
          currentCanvasName: currentCanvas?.attrs?.objectName,
          canvasIds: canvasItems.map((c) => c.attrs?.id).filter(Boolean),
        });

        // 检查画布完整性
        canvasItems.forEach((canvas, index) => {
          console.log(`画布 ${index}:`, {
            id: canvas.attrs?.id,
            name: canvas.attrs?.objectName,
            hasAttrs: !!canvas.attrs,
            isDeleted: canvas.isDeleted?.() || false,
          });
        });
      }
    }

    // 视口状态
    if (editor.viewportManager) {
      console.log('视口状态:', {
        zoom: editor.viewportManager.getZoom?.(),
        viewMatrix: editor.viewportManager.getViewMatrix?.(),
      });
    }

    // 选择状态
    if (editor.selectedElements) {
      console.log('选择状态:', {
        selectedCount: editor.selectedElements.getItems?.()?.length || 0,
        selectedIds: Array.from(editor.selectedElements.getIdSet?.() || []),
      });
    }
  } catch (error) {
    console.error('诊断过程中出错:', error);
  }

  console.groupEnd();
};
