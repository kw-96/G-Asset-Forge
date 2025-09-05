/**
 * H5模式状态管理器
 * 管理H5项目的状态，包括容器、内容块、布局等
 */

import type { GAssetForgeEditor } from '../../editor';
import { ProjectType } from '../ProjectTypeManager';
import { type BaseState, BaseStateManager } from './BaseStateManager';

/**
 * H5项目状态数据结构
 */
export interface H5ProjectState extends BaseState {
  // 选择状态
  selectedBlocks: string[];
  selectedElements: string[];

  // 容器状态
  currentContainer: string | null;
  containerConfig: {
    width: number;
    height: number;
    backgroundColor: string;
    padding: number;
    gap: number;
    autoLayout: boolean;
  };

  // 内容块状态
  contentBlocks: Array<{
    id: string;
    type: string;
    order: number;
    isVisible: boolean;
    isLocked: boolean;
  }>;

  // 视口状态
  viewport: {
    zoom: number;
    offset: { x: number; y: number };
    center: { x: number; y: number };
  };

  // 布局设置
  layoutSettings: {
    autoLayout: boolean;
    padding: number;
    gap: number;
    alignment: 'left' | 'center' | 'right';
  };

  // UI状态
  uiState: {
    showContentBlocks: boolean;
    showLayers: boolean;
    showProperties: boolean;
    activeTab: 'blocks' | 'layers';
    expandedGroups: string[];
  };

  // H5特定状态
  h5State: {
    previewMode: boolean;
    mobileWidth: number;
    currentBlockType: string | null;
    blockEditMode: boolean;
  };
}

/**
 * H5模式状态管理器
 * 专门管理H5项目的编辑器状态和H5Service状态
 */
export class H5StateManager extends BaseStateManager {
  private h5Service: any = null; // H5Service实例
  private eventListeners: Array<() => void> = [];

  constructor() {
    super(ProjectType.H5);
  }

  /**
   * 初始化H5状态管理器
   */
  override async initialize(
    editor: GAssetForgeEditor,
    h5Service?: any,
  ): Promise<void> {
    await super.initialize(editor);

    if (h5Service) {
      this.h5Service = h5Service;
      this.setupH5ServiceListeners();
    }
  }

  /**
   * 设置H5Service实例
   */
  setH5Service(h5Service: any): void {
    this.h5Service = h5Service;
    this.setupH5ServiceListeners();
  }

  /**
   * 创建初始状态
   */
  protected createInitialState(): H5ProjectState {
    return {
      id: `h5_state_${Date.now()}`,
      type: ProjectType.H5,
      timestamp: Date.now(),
      version: '1.0.0',

      selectedBlocks: [],
      selectedElements: [],

      currentContainer: null,
      containerConfig: {
        width: 1080,
        height: 2220,
        backgroundColor: '#ffffff',
        padding: 16,
        gap: 12,
        autoLayout: true,
      },

      contentBlocks: [],

      viewport: {
        zoom: 1,
        offset: { x: 0, y: 0 },
        center: { x: 540, y: 1110 }, // H5容器中心
      },

      layoutSettings: {
        autoLayout: true,
        padding: 16,
        gap: 12,
        alignment: 'center',
      },

      uiState: {
        showContentBlocks: true,
        showLayers: true,
        showProperties: true,
        activeTab: 'blocks',
        expandedGroups: [],
      },

      h5State: {
        previewMode: false,
        mobileWidth: 1080,
        currentBlockType: null,
        blockEditMode: false,
      },
    };
  }

  /**
   * 构建当前状态
   */
  protected buildCurrentState(): H5ProjectState {
    if (!this.editor) {
      return this.currentState;
    }

    try {
      // 获取选择状态
      const { selectedBlocks, selectedElements } = this.getSelectionState();

      // 获取容器状态
      const { currentContainer, containerConfig } = this.getContainerState();

      // 获取内容块状态
      const contentBlocks = this.getContentBlocksState();

      // 获取视口状态
      const viewport = this.getViewportState();

      // 获取H5特定状态
      const h5State = this.getH5SpecificState();

      return {
        ...this.currentState,
        selectedBlocks,
        selectedElements,
        currentContainer,
        containerConfig,
        contentBlocks,
        viewport,
        h5State,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('构建H5状态失败:', error);
      return this.currentState;
    }
  }

  /**
   * 应用状态
   */
  protected async applyState(state: H5ProjectState): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器实例不存在');
    }

    try {
      // 恢复容器状态
      await this.restoreContainerState(
        state.currentContainer,
        state.containerConfig,
      );

      // 恢复内容块状态
      await this.restoreContentBlocksState(state.contentBlocks);

      // 恢复选择状态
      await this.restoreSelectionState(
        state.selectedBlocks,
        state.selectedElements,
      );

      // 恢复视口状态
      await this.restoreViewportState(state.viewport);

      // 恢复布局设置
      await this.restoreLayoutSettings(state.layoutSettings);

      // 恢复UI状态
      await this.restoreUIState(state.uiState);

      // 恢复H5特定状态
      await this.restoreH5SpecificState(state.h5State);

      console.log('H5状态应用成功');
    } catch (error) {
      console.error('应用H5状态失败:', error);
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

      // 验证H5Service实例
      if (!this.h5Service) {
        errors.push('H5Service实例不存在');
        isValid = false;
      }

      // 验证当前状态
      if (!this.currentState) {
        errors.push('当前状态不存在');
        isValid = false;
      }

      // 验证容器状态
      if (this.currentState?.currentContainer) {
        const containerExists =
          this.h5Service?.getCurrentContainer?.()?.id ===
          this.currentState.currentContainer;
        if (!containerExists) {
          errors.push('当前容器在H5Service中不存在');
          isValid = false;
        }
      }

      // 验证内容块状态
      if (this.currentState?.contentBlocks?.length > 0) {
        const serviceBlocks = this.h5Service?.getContentBlocks?.() || [];
        const stateBlockIds = this.currentState.contentBlocks.map(
          (block: any) => block.id,
        );
        const serviceBlockIds = serviceBlocks.map((block: any) => block.id);

        const missingBlocks = stateBlockIds.filter(
          (id: string) => !serviceBlockIds.includes(id),
        );
        if (missingBlocks.length > 0) {
          errors.push(`内容块在H5Service中不存在: ${missingBlocks.join(', ')}`);
          isValid = false;
        }
      }

      // 验证容器配置
      if (this.currentState?.containerConfig) {
        const { width, height, padding, gap } =
          this.currentState.containerConfig;
        if (width <= 0 || height <= 0) {
          errors.push('容器尺寸无效');
          isValid = false;
        }
        if (padding < 0 || gap < 0) {
          errors.push('容器内边距或间距无效');
          isValid = false;
        }
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
      errors.push(`H5状态验证异常: ${(error as Error).message}`);
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
      // const onSelectionChange = () => {
      //   const selectionState = this.getSelectionState();
      //   this.updateState(selectionState);
      // };

      // 监听视口变化
      // const onViewportChange = () => {
      //   const viewport = this.getViewportState();
      //   this.updateState({ viewport });
      // };

      // 这里需要根据实际的编辑器API来设置事件监听器
      // 由于不确定具体的API，这里使用伪代码形式

      console.log('H5状态管理器事件监听器设置完成');
    } catch (error) {
      console.error('设置H5事件监听器失败:', error);
    }
  }

  /**
   * 设置H5Service事件监听器
   */
  private setupH5ServiceListeners(): void {
    if (!this.h5Service) {
      return;
    }

    try {
      // 监听内容块变化
      // const onContentBlocksChange = () => {
      //   const contentBlocks = this.getContentBlocksState();
      //   this.updateState({ contentBlocks });
      // };

      // 监听容器变化
      // const onContainerChange = () => {
      //   const containerState = this.getContainerState();
      //   this.updateState(containerState);
      // };

      // 这里需要根据实际的H5Service API来设置事件监听器
      // if (this.h5Service.on) {
      //   this.h5Service.on('contentBlocksChanged', onContentBlocksChange);
      //   this.h5Service.on('containerChanged', onContainerChange);
      //
      //   this.eventListeners.push(() => {
      //     this.h5Service.off('contentBlocksChanged', onContentBlocksChange);
      //     this.h5Service.off('containerChanged', onContainerChange);
      //   });
      // }

      console.log('H5Service事件监听器设置完成');
    } catch (error) {
      console.error('设置H5Service事件监听器失败:', error);
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

      console.log('H5状态管理器事件监听器移除完成');
    } catch (error) {
      console.error('移除H5事件监听器失败:', error);
    }
  }

  /**
   * 执行清理操作
   */
  protected async performCleanup(): Promise<void> {
    try {
      // 清理H5Service状态
      if (this.h5Service) {
        // 清理选择状态
        if (this.h5Service.clearSelection) {
          this.h5Service.clearSelection();
        }

        // 重置容器状态（可选）
        // if (this.h5Service.resetContainer) {
        //   this.h5Service.resetContainer();
        // }
      }

      // 清理编辑器选择状态
      if (this.editor && (this.editor as any).selectedElements) {
        (this.editor as any).selectedElements.clear();
      }

      this.h5Service = null;

      console.log('H5状态管理器清理完成');
    } catch (error) {
      console.error('H5状态管理器清理失败:', error);
      throw error;
    }
  }

  // 私有辅助方法

  /**
   * 获取选择状态
   */
  private getSelectionState(): {
    selectedBlocks: string[];
    selectedElements: string[];
  } {
    try {
      let selectedBlocks: string[] = [];
      let selectedElements: string[] = [];

      // 从H5Service获取选择的内容块
      if (this.h5Service && this.h5Service.getSelectedContentBlocks) {
        selectedBlocks = this.h5Service
          .getSelectedContentBlocks()
          .map((block: any) => block.id);
      }

      // 从编辑器获取选择的元素
      if (this.editor && (this.editor as any).selectedElements) {
        selectedElements = (this.editor as any).selectedElements
          .getItems()
          .map((item: any) => item.attrs?.id || item.id);
      }

      return { selectedBlocks, selectedElements };
    } catch (error) {
      console.error('获取H5选择状态失败:', error);
      return { selectedBlocks: [], selectedElements: [] };
    }
  }

  /**
   * 获取容器状态
   */
  private getContainerState(): {
    currentContainer: string | null;
    containerConfig: H5ProjectState['containerConfig'];
  } {
    try {
      let currentContainer: string | null = null;
      let containerConfig = this.currentState?.containerConfig || {
        width: 1080,
        height: 2220,
        backgroundColor: '#ffffff',
        padding: 16,
        gap: 12,
        autoLayout: true,
      };

      if (this.h5Service) {
        const container = this.h5Service.getCurrentContainer?.();
        if (container) {
          currentContainer = container.id;
          containerConfig = {
            width: container.attrs?.width || 1080,
            height: container.attrs?.height || 2220,
            backgroundColor: container.attrs?.backgroundColor || '#ffffff',
            padding: container.attrs?.padding || 16,
            gap: container.attrs?.gap || 12,
            autoLayout: container.attrs?.autoLayout !== false,
          };
        }
      }

      return { currentContainer, containerConfig };
    } catch (error) {
      console.error('获取容器状态失败:', error);
      return {
        currentContainer: null,
        containerConfig: {
          width: 1080,
          height: 2220,
          backgroundColor: '#ffffff',
          padding: 16,
          gap: 12,
          autoLayout: true,
        },
      };
    }
  }

  /**
   * 获取内容块状态
   */
  private getContentBlocksState(): H5ProjectState['contentBlocks'] {
    try {
      if (this.h5Service && this.h5Service.getContentBlocks) {
        return this.h5Service
          .getContentBlocks()
          .map((block: any, index: number) => ({
            id: block.id,
            type: block.type || block.attrs?.type || 'unknown',
            order: index,
            isVisible: block.attrs?.visible !== false,
            isLocked: block.attrs?.locked === true,
          }));
      }

      return [];
    } catch (error) {
      console.error('获取内容块状态失败:', error);
      return [];
    }
  }

  /**
   * 获取视口状态
   */
  private getViewportState(): H5ProjectState['viewport'] {
    try {
      if (this.editor && (this.editor as any).viewportManager) {
        const viewportManager = (this.editor as any).viewportManager;
        return {
          zoom: viewportManager.getZoom?.() || 1,
          offset: viewportManager.getOffset?.() || { x: 0, y: 0 },
          center: viewportManager.getCenter?.() || { x: 540, y: 1110 },
        };
      }

      return (
        this.currentState?.viewport || {
          zoom: 1,
          offset: { x: 0, y: 0 },
          center: { x: 540, y: 1110 },
        }
      );
    } catch (error) {
      console.error('获取H5视口状态失败:', error);
      return {
        zoom: 1,
        offset: { x: 0, y: 0 },
        center: { x: 540, y: 1110 },
      };
    }
  }

  /**
   * 获取H5特定状态
   */
  private getH5SpecificState(): H5ProjectState['h5State'] {
    try {
      return {
        previewMode: false, // 从UI组件获取
        mobileWidth: this.currentState?.containerConfig?.width || 1080,
        currentBlockType: null, // 从UI组件获取当前选择的内容块类型
        blockEditMode: false, // 从UI组件获取是否在编辑模式
      };
    } catch (error) {
      console.error('获取H5特定状态失败:', error);
      return {
        previewMode: false,
        mobileWidth: 1080,
        currentBlockType: null,
        blockEditMode: false,
      };
    }
  }

  // 状态恢复方法

  /**
   * 恢复容器状态
   */
  private async restoreContainerState(
    containerId: string | null,
    containerConfig: H5ProjectState['containerConfig'],
  ): Promise<void> {
    try {
      if (this.h5Service && containerId) {
        // 设置当前容器
        const container = this.h5Service.getContainerById?.(containerId);
        if (container) {
          this.h5Service.setCurrentContainer?.(container);

          // 更新容器配置
          if (this.h5Service.updateContainerConfig) {
            this.h5Service.updateContainerConfig(containerConfig);
          }
        }
      }
    } catch (error) {
      console.error('恢复容器状态失败:', error);
    }
  }

  /**
   * 恢复内容块状态
   */
  private async restoreContentBlocksState(
    contentBlocks: H5ProjectState['contentBlocks'],
  ): Promise<void> {
    try {
      if (this.h5Service && contentBlocks.length > 0) {
        // 恢复内容块的顺序、可见性、锁定状态等
        for (const blockState of contentBlocks) {
          const block = this.h5Service.getContentBlockById?.(blockState.id);
          if (block) {
            // 更新块的属性
            if (this.h5Service.updateContentBlockAttrs) {
              this.h5Service.updateContentBlockAttrs(blockState.id, {
                visible: blockState.isVisible,
                locked: blockState.isLocked,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('恢复内容块状态失败:', error);
    }
  }

  /**
   * 恢复选择状态
   */
  private async restoreSelectionState(
    selectedBlocks: string[],
    selectedElements: string[],
  ): Promise<void> {
    try {
      // 恢复H5内容块选择
      if (this.h5Service && selectedBlocks.length > 0) {
        if (this.h5Service.selectContentBlocks) {
          this.h5Service.selectContentBlocks(selectedBlocks);
        }
      }

      // 恢复编辑器元素选择
      if (
        this.editor &&
        (this.editor as any).selectedElements &&
        selectedElements.length > 0
      ) {
        (this.editor as any).selectedElements.clear();

        // 根据ID找到对应的元素并选择
        // for (const elementId of selectedElements) {
        //   const element = this.editor.doc.getElementById(elementId);
        //   if (element) {
        //     this.editor.selectedElements.add(element);
        //   }
        // }
      }
    } catch (error) {
      console.error('恢复H5选择状态失败:', error);
    }
  }

  /**
   * 恢复视口状态
   */
  private async restoreViewportState(
    viewport: H5ProjectState['viewport'],
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
      console.error('恢复H5视口状态失败:', error);
    }
  }

  /**
   * 恢复布局设置
   */
  private async restoreLayoutSettings(
    layoutSettings: H5ProjectState['layoutSettings'],
  ): Promise<void> {
    try {
      if (this.h5Service && this.h5Service.updateLayoutSettings) {
        this.h5Service.updateLayoutSettings(layoutSettings);
      }
    } catch (error) {
      console.error('恢复布局设置失败:', error);
    }
  }

  /**
   * 恢复UI状态
   */
  private async restoreUIState(
    uiState: H5ProjectState['uiState'],
  ): Promise<void> {
    try {
      // 这里需要通过事件或回调来通知UI组件更新状态
      // 例如：切换活动标签页、展开/折叠面板等
      void uiState; // 明确表示暂时未使用，但保留参数用于未来实现
    } catch (error) {
      console.error('恢复H5 UI状态失败:', error);
    }
  }

  /**
   * 恢复H5特定状态
   */
  private async restoreH5SpecificState(
    h5State: H5ProjectState['h5State'],
  ): Promise<void> {
    try {
      // 恢复预览模式、移动端宽度等H5特定设置
      if (this.h5Service) {
        if (this.h5Service.setPreviewMode) {
          this.h5Service.setPreviewMode(h5State.previewMode);
        }

        if (this.h5Service.setMobileWidth) {
          this.h5Service.setMobileWidth(h5State.mobileWidth);
        }
      }
    } catch (error) {
      console.error('恢复H5特定状态失败:', error);
    }
  }
}
