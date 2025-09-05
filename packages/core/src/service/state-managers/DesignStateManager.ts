/**
 * 设计模式状态管理器
 * 管理设计项目的状态，包括页面、图层、选择、视口等
 */

import { ProjectType } from '../ProjectTypeManager';
import { type BaseState, BaseStateManager } from './BaseStateManager';

/**
 * 设计项目状态数据结构
 */
export interface DesignProjectState extends BaseState {
  // 选择状态
  selectedElements: string[];

  // 页面状态
  currentPage: string | null;
  pages: Array<{
    id: string;
    name: string;
    isVisible: boolean;
  }>;

  // 视口状态
  viewport: {
    zoom: number;
    offset: { x: number; y: number };
    center: { x: number; y: number };
  };

  // 工具状态
  toolSettings: {
    currentTool: string | null;
    toolOptions: Record<string, any>;
  };

  // UI状态
  uiState: {
    showPages: boolean;
    showLayers: boolean;
    showProperties: boolean;
    showRulers: boolean;
    showGrid: boolean;
    showGuides: boolean;
  };

  // 图层状态
  layerState: {
    expandedGroups: string[];
    lockedElements: string[];
    hiddenElements: string[];
  };

  // 历史状态
  historyState: {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
  };
}

/**
 * 设计模式状态管理器
 * 专门管理设计项目的编辑器状态
 */
export class DesignStateManager extends BaseStateManager {
  private eventListeners: Array<() => void> = [];

  constructor() {
    super(ProjectType.DESIGN);
  }

  /**
   * 创建初始状态
   */
  protected createInitialState(): DesignProjectState {
    return {
      id: `design_state_${Date.now()}`,
      type: ProjectType.DESIGN,
      timestamp: Date.now(),
      version: '1.0.0',

      selectedElements: [],
      currentPage: null,
      pages: [],

      viewport: {
        zoom: 1,
        offset: { x: 0, y: 0 },
        center: { x: 400, y: 300 },
      },

      toolSettings: {
        currentTool: null,
        toolOptions: {},
      },

      uiState: {
        showPages: true,
        showLayers: true,
        showProperties: true,
        showRulers: false,
        showGrid: false,
        showGuides: false,
      },

      layerState: {
        expandedGroups: [],
        lockedElements: [],
        hiddenElements: [],
      },

      historyState: {
        canUndo: false,
        canRedo: false,
        currentIndex: 0,
      },
    };
  }

  /**
   * 构建当前状态
   */
  protected buildCurrentState(): DesignProjectState {
    if (!this.editor) {
      return this.currentState;
    }

    try {
      // 获取选择状态
      const selectedElements = this.getSelectedElements();

      // 获取页面状态
      const { currentPage, pages } = this.getPageState();

      // 获取视口状态
      const viewport = this.getViewportState();

      // 获取工具状态
      const toolSettings = this.getToolSettings();

      // 获取历史状态
      const historyState = this.getHistoryState();

      return {
        ...this.currentState,
        selectedElements,
        currentPage,
        pages,
        viewport,
        toolSettings,
        historyState,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('构建设计状态失败:', error);
      return this.currentState;
    }
  }

  /**
   * 应用状态
   */
  protected async applyState(state: DesignProjectState): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器实例不存在');
    }

    try {
      // 恢复选择状态
      await this.restoreSelection(state.selectedElements);

      // 恢复页面状态
      await this.restorePageState(state.currentPage, state.pages);

      // 恢复视口状态
      await this.restoreViewportState(state.viewport);

      // 恢复工具状态
      await this.restoreToolSettings(state.toolSettings);

      // 恢复UI状态
      await this.restoreUIState(state.uiState);

      // 恢复图层状态
      await this.restoreLayerState(state.layerState);

      console.log('设计状态应用成功');
    } catch (error) {
      console.error('应用设计状态失败:', error);
      throw error;
    }
  }

  /**
   * 执行状态验证
   */
  protected performStateValidation(errors: string[]): boolean {
    let isValid = true;

    try {
      // 验证编辑器实例
      if (!this.editor) {
        errors.push('编辑器实例不存在');
        isValid = false;
      }

      // 验证当前状态
      if (!this.currentState) {
        errors.push('当前状态不存在');
        isValid = false;
      }

      // 验证页面状态
      if (this.currentState?.currentPage) {
        const pageExists = this.currentState.pages?.some(
          (page: any) => page.id === this.currentState.currentPage,
        );
        if (!pageExists) {
          errors.push('当前页面在页面列表中不存在');
          isValid = false;
        }
      }

      // 验证选择状态
      if (this.currentState?.selectedElements?.length > 0) {
        // 这里可以添加更多选择状态的验证逻辑
      }

      // 验证视口状态
      if (this.currentState?.viewport) {
        const { zoom, offset } = this.currentState.viewport;
        if (typeof zoom !== 'number' || zoom <= 0) {
          errors.push('视口缩放值无效');
          isValid = false;
        }
        if (
          !offset ||
          typeof offset.x !== 'number' ||
          typeof offset.y !== 'number'
        ) {
          errors.push('视口偏移值无效');
          isValid = false;
        }
      }
    } catch (error) {
      errors.push(`状态验证异常: ${(error as Error).message}`);
      isValid = false;
    }

    return isValid;
  }

  /**
   * 设置事件监听器
   */
  protected setupEventListeners(): void {
    if (!this.editor) {
      return;
    }

    try {
      // 监听选择变化
      const onSelectionChange = () => {
        const selectedElements = this.getSelectedElements();
        this.updateState({ selectedElements });
      };

      // 监听视口变化
      const onViewportChange = () => {
        const viewport = this.getViewportState();
        this.updateState({ viewport });
      };

      // 监听工具变化
      const onToolChange = () => {
        const toolSettings = this.getToolSettings();
        this.updateState({ toolSettings });
      };

      // 监听页面变化
      const onPageChange = () => {
        const { currentPage, pages } = this.getPageState();
        this.updateState({ currentPage, pages });
      };

      // 监听历史状态变化
      const onHistoryChange = () => {
        const historyState = this.getHistoryState();
        this.updateState({ historyState });
      };

      // 设置选择变化监听器
      if (
        this.editor.selectedElements &&
        typeof this.editor.selectedElements.on === 'function'
      ) {
        this.editor.selectedElements.on('itemsChange', onSelectionChange);
        this.eventListeners.push(() => {
          if (
            this.editor?.selectedElements &&
            typeof this.editor.selectedElements.off === 'function'
          ) {
            this.editor.selectedElements.off('itemsChange', onSelectionChange);
          }
        });
      }

      // 设置视口变化监听器
      if (
        this.editor.viewportManager &&
        typeof this.editor.viewportManager.on === 'function'
      ) {
        this.editor.viewportManager.on('xOrYChange', onViewportChange);
        this.eventListeners.push(() => {
          if (
            this.editor?.viewportManager &&
            typeof this.editor.viewportManager.off === 'function'
          ) {
            this.editor.viewportManager.off('xOrYChange', onViewportChange);
          }
        });
      }

      // 设置工具变化监听器
      if (
        this.editor.toolManager &&
        typeof this.editor.toolManager.on === 'function'
      ) {
        this.editor.toolManager.on('switchTool', onToolChange);
        this.eventListeners.push(() => {
          if (
            this.editor?.toolManager &&
            typeof this.editor.toolManager.off === 'function'
          ) {
            this.editor.toolManager.off('switchTool', onToolChange);
          }
        });
      }

      // 设置文档变化监听器
      if (this.editor.doc && typeof this.editor.doc.on === 'function') {
        this.editor.doc.on('currentCanvasChange', onPageChange);
        this.eventListeners.push(() => {
          if (this.editor?.doc && typeof this.editor.doc.off === 'function') {
            this.editor.doc.off('currentCanvasChange', onPageChange);
          }
        });
      }

      // 设置命令管理器监听器
      if (
        this.editor.commandManager &&
        typeof this.editor.commandManager.on === 'function'
      ) {
        this.editor.commandManager.on('change', onHistoryChange);
        this.eventListeners.push(() => {
          if (
            this.editor?.commandManager &&
            typeof this.editor.commandManager.off === 'function'
          ) {
            this.editor.commandManager.off('change', onHistoryChange);
          }
        });
      }

      console.log('设计状态管理器事件监听器设置完成');
    } catch (error) {
      console.error('设置事件监听器失败:', error);
    }
  }

  /**
   * 移除事件监听器
   */
  protected removeEventListeners(): void {
    try {
      this.eventListeners.forEach((removeListener) => {
        removeListener();
      });
      this.eventListeners = [];

      console.log('设计状态管理器事件监听器移除完成');
    } catch (error) {
      console.error('移除事件监听器失败:', error);
    }
  }

  /**
   * 执行清理操作
   */
  protected async performCleanup(): Promise<void> {
    try {
      // 清理选择状态
      if (this.editor && (this.editor as any).selectedElements) {
        (this.editor as any).selectedElements.clear();
      }

      // 重置视口（可选）
      // if (this.editor && this.editor.viewportManager) {
      //   this.editor.viewportManager.reset();
      // }

      console.log('设计状态管理器清理完成');
    } catch (error) {
      console.error('设计状态管理器清理失败:', error);
      throw error;
    }
  }

  // 公共方法 - 供外部调用

  /**
   * 更新选择状态
   */
  updateSelection(elementIds: string[]): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      if (this.editor && this.editor.selectedElements) {
        this.editor.selectedElements.clear();

        for (const elementId of elementIds) {
          const element = this.editor.doc.getGraphicsById(elementId);
          if (element) {
            this.editor.selectedElements.setItems([element]);
          }
        }
      }
    } catch (error) {
      console.error('更新选择状态失败:', error);
    }
  }

  /**
   * 更新视口状态
   */
  updateViewport(viewport: Partial<DesignProjectState['viewport']>): void {
    if (!this.isInitialized || !this.editor?.viewportManager) {
      return;
    }

    try {
      if (viewport.zoom !== undefined && viewport.center) {
        this.editor.viewportManager.setZoom(viewport.zoom, viewport.center);
      }

      if (viewport.offset) {
        // 使用 setViewMatrix 设置偏移
        const currentMatrix = this.editor.viewportManager.getViewMatrix();
        currentMatrix.tx = viewport.offset.x;
        currentMatrix.ty = viewport.offset.y;
        this.editor.viewportManager.setViewMatrix(currentMatrix);
      }
    } catch (error) {
      console.error('更新视口状态失败:', error);
    }
  }

  /**
   * 更新工具状态
   */
  updateTool(toolName: string, options?: Record<string, any>): void {
    if (!this.isInitialized || !this.editor?.toolManager) {
      return;
    }

    try {
      this.editor.toolManager.setActiveTool(toolName);

      if (options && Object.keys(options).length > 0) {
        // 设置工具选项
        // this.editor.toolManager.setToolOptions(options);
      }
    } catch (error) {
      console.error('更新工具状态失败:', error);
    }
  }

  /**
   * 切换页面
   */
  switchToPage(pageId: string): void {
    if (!this.isInitialized || !this.editor?.doc) {
      return;
    }

    try {
      const page = this.editor.doc.getGraphicsById(pageId);
      if (page && page.type === 'Canvas') {
        this.editor.doc.setCurrentCanvas(pageId);
      }
    } catch (error) {
      console.error('切换页面失败:', error);
    }
  }

  /**
   * 更新UI面板显示状态
   */
  updateUIState(uiState: Partial<DesignProjectState['uiState']>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      const currentUIState = { ...this.currentState.uiState, ...uiState };
      this.updateState({ uiState: currentUIState });

      // 应用UI状态变更
      if (uiState.showRulers !== undefined && this.editor?.ruler) {
        this.editor.ruler.visible = uiState.showRulers;
      }

      if (uiState.showGuides !== undefined && this.editor?.guideLineManager) {
        // TODO: GuideLineManager 需要实现 setVisible 方法
        // this.editor.guideLineManager.setVisible(uiState.showGuides);
      }

      // 通知UI组件更新
      this.emit('uiStateChanged', currentUIState);
    } catch (error) {
      console.error('更新UI状态失败:', error);
    }
  }

  /**
   * 更新图层状态
   */
  updateLayerState(
    layerState: Partial<DesignProjectState['layerState']>,
  ): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      const currentLayerState = {
        ...this.currentState.layerState,
        ...layerState,
      };
      this.updateState({ layerState: currentLayerState });

      // 应用图层状态变更
      if (layerState.lockedElements) {
        for (const elementId of layerState.lockedElements) {
          const element = this.editor?.doc.getGraphicsById(elementId);
          if (element) {
            (element as any).attrs.locked = true;
          }
        }
      }

      if (layerState.hiddenElements) {
        for (const elementId of layerState.hiddenElements) {
          const element = this.editor?.doc.getGraphicsById(elementId);
          if (element) {
            (element as any).attrs.visible = false;
          }
        }
      }

      // 通知UI组件更新
      this.emit('layerStateChanged', currentLayerState);
    } catch (error) {
      console.error('更新图层状态失败:', error);
    }
  }

  /**
   * 获取当前选择的元素数量
   */
  getSelectedElementsCount(): number {
    try {
      if (this.editor && this.editor.selectedElements) {
        return this.editor.selectedElements.size();
      }
      return 0;
    } catch (error) {
      console.error('获取选择元素数量失败:', error);
      return 0;
    }
  }

  /**
   * 检查是否有选择的元素
   */
  hasSelection(): boolean {
    return this.getSelectedElementsCount() > 0;
  }

  /**
   * 获取当前页面数量
   */
  getPageCount(): number {
    try {
      if (
        this.editor &&
        this.editor.doc &&
        this.editor.doc.graphicsStoreManager
      ) {
        return this.editor.doc.graphicsStoreManager.getCanvasItems().length;
      }
      return 0;
    } catch (error) {
      console.error('获取页面数量失败:', error);
      return 0;
    }
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    try {
      return this.editor?.commandManager?.canUndo?.() || false;
    } catch (error) {
      console.error('检查撤销状态失败:', error);
      return false;
    }
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    try {
      return this.editor?.commandManager?.canRedo?.() || false;
    } catch (error) {
      console.error('检查重做状态失败:', error);
      return false;
    }
  }

  // 私有辅助方法

  /**
   * 获取选择的元素
   */
  private getSelectedElements(): string[] {
    try {
      if (this.editor && (this.editor as any).selectedElements) {
        return (this.editor as any).selectedElements
          .getItems()
          .map((item: any) => item.attrs?.id || item.id);
      }
      return [];
    } catch (error) {
      console.error('获取选择元素失败:', error);
      return [];
    }
  }

  /**
   * 获取页面状态
   */
  private getPageState(): { currentPage: string | null; pages: any[] } {
    try {
      // 获取当前画布
      const currentCanvas = this.editor?.doc?.getCurrentCanvas();
      const currentPage = currentCanvas?.attrs?.id || null;

      // 获取所有画布（页面）
      const pages: any[] = [];
      if (
        this.editor &&
        this.editor.doc &&
        this.editor.doc.graphicsStoreManager
      ) {
        const canvasItems =
          this.editor.doc.graphicsStoreManager.getCanvasItems();
        pages.push(
          ...canvasItems.map((canvas) => ({
            id: canvas.attrs.id,
            name: canvas.attrs.objectName || `页面 ${canvas.attrs.id}`,
            isVisible: canvas.attrs.visible !== false,
          })),
        );
      }

      return { currentPage, pages };
    } catch (error) {
      console.error('获取页面状态失败:', error);
      return { currentPage: null, pages: [] };
    }
  }

  /**
   * 获取视口状态
   */
  private getViewportState(): DesignProjectState['viewport'] {
    try {
      if (this.editor && (this.editor as any).viewportManager) {
        const viewportManager = (this.editor as any).viewportManager;
        return {
          zoom: viewportManager.getZoom?.() || 1,
          offset: viewportManager.getOffset?.() || { x: 0, y: 0 },
          center: viewportManager.getCenter?.() || { x: 400, y: 300 },
        };
      }

      return (
        this.currentState?.viewport || {
          zoom: 1,
          offset: { x: 0, y: 0 },
          center: { x: 400, y: 300 },
        }
      );
    } catch (error) {
      console.error('获取视口状态失败:', error);
      return {
        zoom: 1,
        offset: { x: 0, y: 0 },
        center: { x: 400, y: 300 },
      };
    }
  }

  /**
   * 获取工具设置
   */
  private getToolSettings(): DesignProjectState['toolSettings'] {
    try {
      let currentTool: string | null = null;
      let toolOptions: Record<string, any> = {};

      if (this.editor && this.editor.toolManager) {
        // 获取当前激活的工具
        const activeTool = this.editor.toolManager.getActiveTool?.();
        currentTool = activeTool ? activeTool.constructor.name : null;

        // 获取工具选项
        if (this.editor.toolManager.getToolOptions) {
          toolOptions = this.editor.toolManager.getToolOptions() || {};
        }
      }

      return {
        currentTool,
        toolOptions,
      };
    } catch (error) {
      console.error('获取工具设置失败:', error);
      return {
        currentTool: null,
        toolOptions: {},
      };
    }
  }

  /**
   * 获取历史状态
   */
  private getHistoryState(): DesignProjectState['historyState'] {
    try {
      let canUndo = false;
      let canRedo = false;
      let currentIndex = 0;

      if (this.editor && this.editor.commandManager) {
        // 获取撤销/重做状态
        canUndo = this.editor.commandManager.canUndo?.() || false;
        canRedo = this.editor.commandManager.canRedo?.() || false;

        // 获取当前历史索引
        if (this.editor.commandManager.getCurrentIndex) {
          currentIndex = this.editor.commandManager.getCurrentIndex() || 0;
        }
      }

      return {
        canUndo,
        canRedo,
        currentIndex,
      };
    } catch (error) {
      console.error('获取历史状态失败:', error);
      return {
        canUndo: false,
        canRedo: false,
        currentIndex: 0,
      };
    }
  }

  /**
   * 恢复选择状态
   */
  private async restoreSelection(selectedElements: string[]): Promise<void> {
    try {
      if (this.editor && this.editor.selectedElements) {
        this.editor.selectedElements.clear();

        // 根据ID找到对应的元素并选择
        for (const elementId of selectedElements) {
          const element = this.editor.doc.getGraphicsById(elementId);
          if (element) {
            this.editor.selectedElements.setItems([element]);
          }
        }
      }
    } catch (error) {
      console.error('恢复选择状态失败:', error);
    }
  }

  /**
   * 恢复页面状态
   */
  private async restorePageState(
    currentPage: string | null,
    pages: any[],
  ): Promise<void> {
    try {
      if (currentPage && this.editor?.doc) {
        // 切换到指定页面
        const page = this.editor.doc.getGraphicsById(currentPage);
        if (page && page.type === 'Canvas') {
          this.editor.doc.setCurrentCanvas(currentPage);
        }
      }

      // 恢复页面的可见性状态
      if (pages && pages.length > 0) {
        for (const pageInfo of pages) {
          const page = this.editor?.doc.getGraphicsById(pageInfo.id);
          if (page && page.type === 'Canvas') {
            // 设置页面可见性
            if (typeof pageInfo.isVisible === 'boolean') {
              (page as any).attrs.visible = pageInfo.isVisible;
            }
          }
        }
      }
    } catch (error) {
      console.error('恢复页面状态失败:', error);
    }
  }

  /**
   * 恢复视口状态
   */
  private async restoreViewportState(
    viewport: DesignProjectState['viewport'],
  ): Promise<void> {
    try {
      if (this.editor && (this.editor as any).viewportManager) {
        const viewportManager = (this.editor as any).viewportManager;

        if (viewportManager.setZoom) {
          viewportManager.setZoom(viewport.zoom, viewport.center);
        }

        if (viewportManager.setOffset) {
          viewportManager.setOffset(viewport.offset);
        }
      }
    } catch (error) {
      console.error('恢复视口状态失败:', error);
    }
  }

  /**
   * 恢复工具设置
   */
  private async restoreToolSettings(
    toolSettings: DesignProjectState['toolSettings'],
  ): Promise<void> {
    try {
      if (this.editor && this.editor.toolManager && toolSettings.currentTool) {
        // 设置当前工具
        this.editor.toolManager.setActiveTool(toolSettings.currentTool);

        // 恢复工具选项
        if (
          toolSettings.toolOptions &&
          Object.keys(toolSettings.toolOptions).length > 0
        ) {
          // 这里需要根据具体的工具管理器API来设置工具选项
          // 由于不确定具体的API，暂时保留注释
          // this.editor.toolManager.setToolOptions(toolSettings.toolOptions);
        }
      }
    } catch (error) {
      console.error('恢复工具设置失败:', error);
    }
  }

  /**
   * 恢复UI状态
   */
  private async restoreUIState(
    uiState: DesignProjectState['uiState'],
  ): Promise<void> {
    try {
      // 恢复标尺显示状态
      if (
        this.editor &&
        this.editor.ruler &&
        typeof uiState.showRulers === 'boolean'
      ) {
        this.editor.ruler.visible = uiState.showRulers;
      }

      // 恢复网格显示状态
      if (typeof uiState.showGrid === 'boolean') {
        // 这里需要根据实际的网格管理器API来设置
        // this.editor.gridManager?.setVisible(uiState.showGrid);
      }

      // 恢复参考线显示状态
      if (
        this.editor &&
        this.editor.guideLineManager &&
        typeof uiState.showGuides === 'boolean'
      ) {
        // TODO: GuideLineManager 需要实现 setVisible 方法
        // this.editor.guideLineManager.setVisible(uiState.showGuides);
      }

      // 通过事件通知UI组件更新面板显示状态
      this.emit('uiStateChanged', {
        showPages: uiState.showPages,
        showLayers: uiState.showLayers,
        showProperties: uiState.showProperties,
      });
    } catch (error) {
      console.error('恢复UI状态失败:', error);
    }
  }

  /**
   * 恢复图层状态
   */
  private async restoreLayerState(
    layerState: DesignProjectState['layerState'],
  ): Promise<void> {
    try {
      // 恢复锁定的元素
      if (layerState.lockedElements && layerState.lockedElements.length > 0) {
        for (const elementId of layerState.lockedElements) {
          const element = this.editor?.doc.getGraphicsById(elementId);
          if (element) {
            (element as any).attrs.locked = true;
          }
        }
      }

      // 恢复隐藏的元素
      if (layerState.hiddenElements && layerState.hiddenElements.length > 0) {
        for (const elementId of layerState.hiddenElements) {
          const element = this.editor?.doc.getGraphicsById(elementId);
          if (element) {
            (element as any).attrs.visible = false;
          }
        }
      }

      // 通过事件通知UI组件更新图层面板状态
      this.emit('layerStateChanged', {
        expandedGroups: layerState.expandedGroups,
        lockedElements: layerState.lockedElements,
        hiddenElements: layerState.hiddenElements,
      });
    } catch (error) {
      console.error('恢复图层状态失败:', error);
    }
  }
}
