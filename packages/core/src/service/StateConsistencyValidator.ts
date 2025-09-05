/**
 * 状态一致性验证器
 * 提供编辑器状态一致性检查和自动修复功能
 */

import type { GAssetForgeEditor } from '../editor';
import type { StateManager } from './EditorStateIsolator';
import { ProjectType } from './ProjectTypeManager';

/**
 * 验证结果
 */
export interface StateValidationResult {
  isValid: boolean;
  errors: StateValidationError[];
  warnings: StateValidationWarning[];
  suggestions: StateValidationSuggestion[];
}

/**
 * 状态验证错误
 */
export interface StateValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  component: string;
  details?: any;
}

/**
 * 状态验证警告
 */
export interface StateValidationWarning {
  code: string;
  message: string;
  component: string;
  details?: any;
}

/**
 * 状态验证建议
 */
export interface StateValidationSuggestion {
  code: string;
  message: string;
  action: string;
  autoFixable: boolean;
}

/**
 * 修复结果
 */
export interface RepairResult {
  success: boolean;
  fixedErrors: string[];
  remainingErrors: string[];
  message: string;
}

/**
 * 状态一致性验证器
 * 检查编辑器状态、项目数据和UI状态的一致性
 */
export class StateConsistencyValidator {
  private editor: GAssetForgeEditor | null = null;
  // private validationRules: Map<string, StateValidationRule> = new Map();

  constructor() {
    // this.initializeValidationRules();
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;
  }

  /**
   * 验证状态管理器一致性
   */
  async validateStateManager(
    stateManager: StateManager,
    projectType: ProjectType,
  ): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    try {
      // 基础验证
      await this.validateBasicStateManager(stateManager, result);

      // 类型特定验证
      if (projectType === ProjectType.DESIGN) {
        await this.validateDesignStateManager(stateManager, result);
      } else if (projectType === ProjectType.H5) {
        await this.validateH5StateManager(stateManager, result);
      }

      // 编辑器一致性验证
      if (this.editor) {
        await this.validateEditorConsistency(stateManager, result);
      }

      result.isValid = result.errors.length === 0;
    } catch (error) {
      result.errors.push({
        code: 'VALIDATION_EXCEPTION',
        message: `验证过程中发生异常: ${(error as Error).message}`,
        severity: 'critical',
        component: 'StateConsistencyValidator',
        details: {
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证项目数据一致性
   */
  async validateProjectData(
    projectData: any,
    projectType: ProjectType,
  ): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    try {
      // 基础数据结构验证
      this.validateBasicProjectData(projectData, result);

      // 类型特定数据验证
      if (projectType === ProjectType.DESIGN) {
        this.validateDesignProjectData(projectData, result);
      } else if (projectType === ProjectType.H5) {
        this.validateH5ProjectData(projectData, result);
      }

      // 数据完整性验证
      this.validateDataIntegrity(projectData, result);

      result.isValid = result.errors.length === 0;
    } catch (error) {
      result.errors.push({
        code: 'DATA_VALIDATION_EXCEPTION',
        message: `项目数据验证异常: ${(error as Error).message}`,
        severity: 'critical',
        component: 'ProjectDataValidator',
        details: { error: (error as Error).message },
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证编辑器与状态的同步性
   */
  async validateEditorStateSync(
    stateManager: StateManager,
  ): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    if (!this.editor) {
      result.errors.push({
        code: 'NO_EDITOR_INSTANCE',
        message: '编辑器实例不存在',
        severity: 'critical',
        component: 'EditorStateSync',
      });
      return result;
    }

    try {
      const currentState = stateManager.getCurrentState();

      // 验证选择状态同步
      await this.validateSelectionSync(currentState, result);

      // 验证视口状态同步
      await this.validateViewportSync(currentState, result);

      // 验证页面/容器状态同步
      await this.validatePageContainerSync(
        currentState,
        stateManager.getType(),
        result,
      );

      result.isValid = result.errors.length === 0;
    } catch (error) {
      result.errors.push({
        code: 'SYNC_VALIDATION_EXCEPTION',
        message: `同步验证异常: ${(error as Error).message}`,
        severity: 'major',
        component: 'EditorStateSync',
        details: { error: (error as Error).message },
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 自动修复状态不一致问题
   */
  async autoRepairState(
    stateManager: StateManager,
    validationResult: StateValidationResult,
  ): Promise<RepairResult> {
    const repairResult: RepairResult = {
      success: false,
      fixedErrors: [],
      remainingErrors: [],
      message: '',
    };

    try {
      const autoFixableErrors = validationResult.errors.filter((error) =>
        this.isAutoFixable(error.code),
      );

      for (const error of autoFixableErrors) {
        try {
          const fixed = await this.fixError(error, stateManager);
          if (fixed) {
            repairResult.fixedErrors.push(error.code);
          } else {
            repairResult.remainingErrors.push(error.code);
          }
        } catch (fixError) {
          console.error(`修复错误 ${error.code} 失败:`, fixError);
          repairResult.remainingErrors.push(error.code);
        }
      }

      // 添加无法自动修复的错误
      const nonAutoFixableErrors = validationResult.errors.filter(
        (error) => !this.isAutoFixable(error.code),
      );
      repairResult.remainingErrors.push(
        ...nonAutoFixableErrors.map((e) => e.code),
      );

      repairResult.success = repairResult.fixedErrors.length > 0;
      repairResult.message = this.generateRepairMessage(repairResult);
    } catch (error) {
      repairResult.message = `自动修复过程中发生异常: ${
        (error as Error).message
      }`;
    }

    return repairResult;
  }

  // 私有验证方法

  /**
   * 验证基础状态管理器
   */
  private async validateBasicStateManager(
    stateManager: StateManager,
    result: StateValidationResult,
  ): Promise<void> {
    // 检查状态管理器是否正确初始化
    try {
      const currentState = stateManager.getCurrentState();
      if (!currentState) {
        result.errors.push({
          code: 'NO_CURRENT_STATE',
          message: '状态管理器没有当前状态',
          severity: 'critical',
          component: 'StateManager',
        });
      }
    } catch (error) {
      result.errors.push({
        code: 'STATE_ACCESS_ERROR',
        message: '无法访问状态管理器的当前状态',
        severity: 'critical',
        component: 'StateManager',
        details: { error: (error as Error).message },
      });
    }

    // 检查状态验证功能
    try {
      const isValid = stateManager.validateState();
      if (!isValid) {
        result.warnings.push({
          code: 'STATE_VALIDATION_FAILED',
          message: '状态管理器内部验证失败',
          component: 'StateManager',
        });
      }
    } catch (error) {
      result.errors.push({
        code: 'STATE_VALIDATION_ERROR',
        message: '状态验证过程中发生错误',
        severity: 'major',
        component: 'StateManager',
        details: { error: (error as Error).message },
      });
    }
  }

  /**
   * 验证设计状态管理器
   */
  private async validateDesignStateManager(
    stateManager: StateManager,
    result: StateValidationResult,
  ): Promise<void> {
    const currentState = stateManager.getCurrentState();

    // 验证页面状态
    if (currentState?.pages && Array.isArray(currentState.pages)) {
      if (currentState.currentPage) {
        const pageExists = currentState.pages.some(
          (page: any) => page.id === currentState.currentPage,
        );
        if (!pageExists) {
          result.errors.push({
            code: 'INVALID_CURRENT_PAGE',
            message: '当前页面在页面列表中不存在',
            severity: 'major',
            component: 'DesignStateManager',
          });
        }
      }
    }

    // 验证选择状态
    if (
      currentState?.selectedElements &&
      Array.isArray(currentState.selectedElements)
    ) {
      // 这里可以添加更多选择状态的验证
    }
  }

  /**
   * 验证H5状态管理器
   */
  private async validateH5StateManager(
    stateManager: StateManager,
    result: StateValidationResult,
  ): Promise<void> {
    const currentState = stateManager.getCurrentState();

    // 验证容器状态
    if (currentState?.currentContainer) {
      // 验证容器配置
      if (currentState.containerConfig) {
        const { width, height, padding, gap } = currentState.containerConfig;
        if (width <= 0 || height <= 0) {
          result.errors.push({
            code: 'INVALID_CONTAINER_SIZE',
            message: '容器尺寸无效',
            severity: 'major',
            component: 'H5StateManager',
          });
        }
        if (padding < 0 || gap < 0) {
          result.errors.push({
            code: 'INVALID_CONTAINER_SPACING',
            message: '容器内边距或间距无效',
            severity: 'minor',
            component: 'H5StateManager',
          });
        }
      }
    }

    // 验证内容块状态
    if (
      currentState?.contentBlocks &&
      Array.isArray(currentState.contentBlocks)
    ) {
      const blockIds = currentState.contentBlocks.map((block: any) => block.id);
      const uniqueIds = new Set(blockIds);
      if (blockIds.length !== uniqueIds.size) {
        result.errors.push({
          code: 'DUPLICATE_CONTENT_BLOCKS',
          message: '存在重复的内容块ID',
          severity: 'major',
          component: 'H5StateManager',
        });
      }
    }
  }

  /**
   * 验证编辑器一致性
   */
  private async validateEditorConsistency(
    stateManager: StateManager,
    result: StateValidationResult,
  ): Promise<void> {
    if (!this.editor) {
      return;
    }

    const currentState = stateManager.getCurrentState();

    // 验证视口一致性
    if (currentState?.viewport && (this.editor as any).viewportManager) {
      const editorZoom = (this.editor as any).viewportManager.getZoom?.();
      if (
        editorZoom &&
        Math.abs(editorZoom - currentState.viewport.zoom) > 0.01
      ) {
        result.warnings.push({
          code: 'VIEWPORT_ZOOM_MISMATCH',
          message: '状态中的视口缩放与编辑器不一致',
          component: 'EditorConsistency',
        });
      }
    }
  }

  /**
   * 验证基础项目数据
   */
  private validateBasicProjectData(
    projectData: any,
    result: StateValidationResult,
  ): void {
    if (!projectData) {
      result.errors.push({
        code: 'NO_PROJECT_DATA',
        message: '项目数据不存在',
        severity: 'critical',
        component: 'ProjectData',
      });
      return;
    }

    // 验证基础字段
    if (!projectData.type) {
      result.warnings.push({
        code: 'NO_PROJECT_TYPE',
        message: '项目数据缺少类型标识',
        component: 'ProjectData',
      });
    }

    if (!projectData.data && !projectData.editorData) {
      result.errors.push({
        code: 'NO_EDITOR_DATA',
        message: '项目数据缺少编辑器数据',
        severity: 'critical',
        component: 'ProjectData',
      });
    }
  }

  /**
   * 验证设计项目数据
   */
  private validateDesignProjectData(
    projectData: any,
    result: StateValidationResult,
  ): void {
    // 验证设计项目不应包含H5特定字段
    if (projectData.h5Container || projectData.contentBlocks) {
      result.errors.push({
        code: 'DESIGN_PROJECT_HAS_H5_DATA',
        message: '设计项目包含H5特定数据',
        severity: 'major',
        component: 'DesignProjectData',
      });
    }
  }

  /**
   * 验证H5项目数据
   */
  private validateH5ProjectData(
    projectData: any,
    result: StateValidationResult,
  ): void {
    // 验证H5项目应包含H5Container
    const hasH5Container = this.checkH5Container(projectData);
    if (!hasH5Container) {
      result.warnings.push({
        code: 'H5_PROJECT_NO_CONTAINER',
        message: 'H5项目缺少H5Container',
        component: 'H5ProjectData',
      });
    }
  }

  /**
   * 验证数据完整性
   */
  private validateDataIntegrity(
    projectData: any,
    result: StateValidationResult,
  ): void {
    // 验证数据结构完整性
    const editorData = projectData.data || projectData.editorData;
    if (editorData && Array.isArray(editorData.data)) {
      // 检查元素ID唯一性
      const elementIds = editorData.data
        .map((item: any) => item.attrs?.id || item.id)
        .filter(Boolean);
      const uniqueIds = new Set(elementIds);
      if (elementIds.length !== uniqueIds.size) {
        result.errors.push({
          code: 'DUPLICATE_ELEMENT_IDS',
          message: '存在重复的元素ID',
          severity: 'major',
          component: 'DataIntegrity',
        });
      }
    }
  }

  /**
   * 验证选择状态同步
   */
  private async validateSelectionSync(
    currentState: any,
    result: StateValidationResult,
  ): Promise<void> {
    if (!this.editor || !(this.editor as any).selectedElements) {
      return;
    }

    try {
      const editorSelection = (this.editor as any).selectedElements
        .getItems()
        .map((item: any) => item.attrs?.id || item.id);
      const stateSelection = currentState?.selectedElements || [];

      if (
        JSON.stringify(editorSelection.sort()) !==
        JSON.stringify(stateSelection.sort())
      ) {
        result.warnings.push({
          code: 'SELECTION_STATE_MISMATCH',
          message: '编辑器选择状态与状态管理器不同步',
          component: 'SelectionSync',
        });
      }
    } catch (error) {
      result.errors.push({
        code: 'SELECTION_SYNC_ERROR',
        message: '验证选择状态同步时发生错误',
        severity: 'minor',
        component: 'SelectionSync',
        details: { error: (error as Error).message },
      });
    }
  }

  /**
   * 验证视口状态同步
   */
  private async validateViewportSync(
    currentState: any,
    result: StateValidationResult,
  ): Promise<void> {
    if (!this.editor || !(this.editor as any).viewportManager) {
      return;
    }

    try {
      const viewportManager = (this.editor as any).viewportManager;
      const editorZoom = viewportManager.getZoom?.();
      const stateZoom = currentState?.viewport?.zoom;

      if (editorZoom && stateZoom && Math.abs(editorZoom - stateZoom) > 0.01) {
        result.warnings.push({
          code: 'VIEWPORT_ZOOM_MISMATCH',
          message: '编辑器视口缩放与状态不同步',
          component: 'ViewportSync',
        });
      }
    } catch (error) {
      result.errors.push({
        code: 'VIEWPORT_SYNC_ERROR',
        message: '验证视口状态同步时发生错误',
        severity: 'minor',
        component: 'ViewportSync',
        details: { error: (error as Error).message },
      });
    }
  }

  /**
   * 验证页面/容器状态同步
   */
  private async validatePageContainerSync(
    currentState: any,
    projectType: ProjectType,
    result: StateValidationResult,
  ): Promise<void> {
    if (!this.editor) {
      return;
    }

    try {
      if (projectType === ProjectType.DESIGN) {
        // 验证当前页面
        const currentCanvas = this.editor.doc?.getCurrentCanvas?.();
        const editorCurrentPage = currentCanvas?.attrs?.id;
        const stateCurrentPage = currentState?.currentPage;

        if (editorCurrentPage !== stateCurrentPage) {
          result.warnings.push({
            code: 'CURRENT_PAGE_MISMATCH',
            message: '编辑器当前页面与状态不同步',
            component: 'PageSync',
          });
        }
      }
      // H5项目的容器同步验证可以在这里添加
    } catch (error) {
      result.errors.push({
        code: 'PAGE_CONTAINER_SYNC_ERROR',
        message: '验证页面/容器状态同步时发生错误',
        severity: 'minor',
        component: 'PageContainerSync',
        details: { error: (error as Error).message },
      });
    }
  }

  /**
   * 检查H5Container存在性
   */
  private checkH5Container(projectData: any): boolean {
    if (projectData?.h5Container) {
      return true;
    }

    const editorData = projectData?.data || projectData?.editorData;
    if (editorData && Array.isArray(editorData.data)) {
      return editorData.data.some(
        (item: any) =>
          item.type === 'H5Container' || item.attrs?.type === 'H5Container',
      );
    }

    return false;
  }

  /**
   * 初始化验证规则
   */
  // private initializeValidationRules(): void {
  //   // 这里可以定义更复杂的验证规则
  //   // 目前使用简单的实现
  // }

  /**
   * 检查错误是否可以自动修复
   */
  private isAutoFixable(errorCode: string): boolean {
    const autoFixableCodes = [
      'SELECTION_STATE_MISMATCH',
      'VIEWPORT_ZOOM_MISMATCH',
      'INVALID_CONTAINER_SPACING',
    ];
    return autoFixableCodes.includes(errorCode);
  }

  /**
   * 修复特定错误
   */
  private async fixError(
    error: StateValidationError,
    stateManager: StateManager,
  ): Promise<boolean> {
    try {
      switch (error.code) {
        case 'SELECTION_STATE_MISMATCH':
          return await this.fixSelectionMismatch(stateManager);
        case 'VIEWPORT_ZOOM_MISMATCH':
          return await this.fixViewportMismatch(stateManager);
        case 'INVALID_CONTAINER_SPACING':
          return await this.fixContainerSpacing(stateManager);
        default:
          return false;
      }
    } catch (fixError) {
      console.error(`修复错误 ${error.code} 时发生异常:`, fixError);
      return false;
    }
  }

  /**
   * 修复选择状态不匹配
   */
  private async fixSelectionMismatch(
    stateManager: StateManager,
  ): Promise<boolean> {
    if (!this.editor || !(this.editor as any).selectedElements) {
      return false;
    }

    try {
      // 以编辑器的选择状态为准，更新状态管理器
      const editorSelection = (this.editor as any).selectedElements
        .getItems()
        .map((item: any) => item.attrs?.id || item.id);
      const currentState = stateManager.getCurrentState();

      if (currentState) {
        currentState.selectedElements = editorSelection;
        await stateManager.restoreState(currentState);
        return true;
      }

      return false;
    } catch (error) {
      console.error('修复选择状态不匹配失败:', error);
      return false;
    }
  }

  /**
   * 修复视口状态不匹配
   */
  private async fixViewportMismatch(
    stateManager: StateManager,
  ): Promise<boolean> {
    if (!this.editor || !(this.editor as any).viewportManager) {
      return false;
    }

    try {
      // 以编辑器的视口状态为准，更新状态管理器
      const viewportManager = (this.editor as any).viewportManager;
      const currentState = stateManager.getCurrentState();

      if (currentState && currentState.viewport) {
        currentState.viewport.zoom =
          viewportManager.getZoom?.() || currentState.viewport.zoom;
        currentState.viewport.offset =
          viewportManager.getOffset?.() || currentState.viewport.offset;

        await stateManager.restoreState(currentState);
        return true;
      }

      return false;
    } catch (error) {
      console.error('修复视口状态不匹配失败:', error);
      return false;
    }
  }

  /**
   * 修复容器间距无效
   */
  private async fixContainerSpacing(
    stateManager: StateManager,
  ): Promise<boolean> {
    try {
      const currentState = stateManager.getCurrentState();

      if (currentState && currentState.containerConfig) {
        // 修正无效的间距值
        if (currentState.containerConfig.padding < 0) {
          currentState.containerConfig.padding = 0;
        }
        if (currentState.containerConfig.gap < 0) {
          currentState.containerConfig.gap = 0;
        }

        await stateManager.restoreState(currentState);
        return true;
      }

      return false;
    } catch (error) {
      console.error('修复容器间距失败:', error);
      return false;
    }
  }

  /**
   * 生成修复结果消息
   */
  private generateRepairMessage(repairResult: RepairResult): string {
    const { fixedErrors, remainingErrors } = repairResult;

    let message = '';

    if (fixedErrors.length > 0) {
      message += `成功修复 ${fixedErrors.length} 个问题: ${fixedErrors.join(
        ', ',
      )}`;
    }

    if (remainingErrors.length > 0) {
      if (message) message += '; ';
      message += `仍有 ${
        remainingErrors.length
      } 个问题需要手动处理: ${remainingErrors.join(', ')}`;
    }

    if (!message) {
      message = '没有发现需要修复的问题';
    }

    return message;
  }
}

/**
 * 验证规则接口
 */
// interface StateValidationRule {
//   code: string;
//   name: string;
//   description: string;
//   severity: 'critical' | 'major' | 'minor';
//   validate: (data: any) => boolean;
//   autoFix?: (data: any) => any;
// }

/**
 * 全局状态一致性验证器实例
 */
export const globalStateConsistencyValidator = new StateConsistencyValidator();
