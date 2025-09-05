/**
 * 编辑器状态集成工具
 * 提供编辑器初始化流程中的状态隔离集成功能
 */

import type { GAssetForgeEditor } from '../editor';
import { EditorStateIsolator } from './EditorStateIsolator';
import { ProjectType, ProjectTypeManager } from './ProjectTypeManager';
import { DesignStateManager } from './state-managers/DesignStateManager';
import { H5StateManager } from './state-managers/H5StateManager';
import { StateConsistencyValidator } from './StateConsistencyValidator';

/**
 * 集成配置选项
 */
export interface IntegrationOptions {
  enableAutoValidation?: boolean;
  enableAutoRepair?: boolean;
  validationInterval?: number;
  maxHistorySize?: number;
}

/**
 * 集成结果
 */
export interface IntegrationResult {
  success: boolean;
  message: string;
  isolator: EditorStateIsolator | null;
  projectTypeManager: ProjectTypeManager | null;
  validator: StateConsistencyValidator | null;
}

/**
 * 编辑器状态集成工具
 * 简化编辑器初始化流程中的状态隔离设置
 */
export class EditorStateIntegration {
  private static instance: EditorStateIntegration | null = null;

  private isolator: EditorStateIsolator | null = null;
  private projectTypeManager: ProjectTypeManager | null = null;
  private validator: StateConsistencyValidator | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): EditorStateIntegration {
    if (!EditorStateIntegration.instance) {
      EditorStateIntegration.instance = new EditorStateIntegration();
    }
    return EditorStateIntegration.instance;
  }

  /**
   * 集成状态隔离到编辑器
   */
  async integrateWithEditor(
    editor: GAssetForgeEditor,
    options: IntegrationOptions = {},
  ): Promise<IntegrationResult> {
    const result: IntegrationResult = {
      success: false,
      message: '',
      isolator: null,
      projectTypeManager: null,
      validator: null,
    };

    try {
      // 检查是否已经初始化
      if (this.isInitialized) {
        result.message = '状态隔离已经集成到编辑器';
        result.success = true;
        result.isolator = this.isolator;
        result.projectTypeManager = this.projectTypeManager;
        result.validator = this.validator;
        return result;
      }

      // 创建组件实例
      this.isolator = new EditorStateIsolator();
      this.projectTypeManager = new ProjectTypeManager();
      this.validator = new StateConsistencyValidator();

      // 初始化状态隔离管理器
      await this.isolator.initialize(editor);

      // 设置验证器的编辑器实例
      this.validator.setEditor(editor);

      // 注册状态管理器
      const designStateManager = new DesignStateManager();
      const h5StateManager = new H5StateManager();

      this.isolator.registerStateManager(
        ProjectType.DESIGN,
        designStateManager,
      );
      this.isolator.registerStateManager(ProjectType.H5, h5StateManager);

      // 设置自动验证（如果启用）
      if (options.enableAutoValidation) {
        this.setupAutoValidation(options.validationInterval || 30000); // 默认30秒
      }

      this.isInitialized = true;

      result.success = true;
      result.message = '状态隔离成功集成到编辑器';
      result.isolator = this.isolator;
      result.projectTypeManager = this.projectTypeManager;
      result.validator = this.validator;

      console.log('编辑器状态隔离集成完成');
    } catch (error) {
      result.message = `状态隔离集成失败: ${(error as Error).message}`;
      console.error('编辑器状态隔离集成失败:', error);
    }

    return result;
  }

  /**
   * 初始化项目状态管理
   */
  async initializeProjectState(
    projectData: any,
    projectId?: string,
    h5Service?: any,
  ): Promise<boolean> {
    if (!this.isolator || !this.projectTypeManager) {
      console.error('状态隔离管理器未初始化');
      return false;
    }

    try {
      // 识别项目类型
      const identificationResult = this.projectTypeManager.identifyProjectType(
        projectData,
        projectId,
      );

      console.log(
        `项目类型识别结果: ${identificationResult.type} (置信度: ${identificationResult.confidence})`,
      );

      // 设置当前项目类型
      await this.isolator.setCurrentProjectType(identificationResult.type);

      if (projectId) {
        this.projectTypeManager.setCurrentProjectType(
          projectId,
          identificationResult.type,
        );
      }

      // 获取对应的状态管理器
      const stateManager = this.isolator.getStateManager(
        identificationResult.type,
      );
      if (!stateManager) {
        console.error(`未找到 ${identificationResult.type} 类型的状态管理器`);
        return false;
      }

      // 如果是H5项目，设置H5Service
      if (identificationResult.type === ProjectType.H5 && h5Service) {
        (stateManager as H5StateManager).setH5Service(h5Service);
      }

      // 恢复项目状态（如果项目数据中包含状态信息）
      if (projectData.state) {
        await stateManager.restoreState(projectData.state);
        console.log(`项目状态恢复完成: ${identificationResult.type}`);
      }

      return true;
    } catch (error) {
      console.error('初始化项目状态管理失败:', error);
      return false;
    }
  }

  /**
   * 切换项目类型
   */
  async switchProjectType(
    newType: ProjectType,
    projectId?: string,
    h5Service?: any,
  ): Promise<boolean> {
    if (!this.isolator || !this.projectTypeManager) {
      console.error('状态隔离管理器未初始化');
      return false;
    }

    try {
      // 创建当前状态快照
      await this.isolator.createStateSnapshot();

      // 切换项目类型
      await this.isolator.setCurrentProjectType(newType);

      if (projectId) {
        this.projectTypeManager.setCurrentProjectType(projectId, newType);
      }

      // 获取新的状态管理器
      const stateManager = this.isolator.getStateManager(newType);
      if (!stateManager) {
        console.error(`未找到 ${newType} 类型的状态管理器`);
        return false;
      }

      // 如果是H5项目，设置H5Service
      if (newType === ProjectType.H5 && h5Service) {
        (stateManager as H5StateManager).setH5Service(h5Service);
      }

      // 尝试恢复该类型的最新状态
      await this.isolator.restoreLatestState(newType);

      console.log(`项目类型切换完成: ${newType}`);
      return true;
    } catch (error) {
      console.error('切换项目类型失败:', error);
      return false;
    }
  }

  /**
   * 验证当前状态
   */
  async validateCurrentState(): Promise<boolean> {
    if (!this.isolator || !this.validator) {
      console.error('状态隔离管理器或验证器未初始化');
      return false;
    }

    try {
      const currentStateManager = this.isolator.getCurrentStateManager();
      if (!currentStateManager) {
        console.warn('没有当前活动的状态管理器');
        return true; // 没有状态管理器不算错误
      }

      const projectType = this.isolator.getCurrentProjectType();
      if (!projectType) {
        console.warn('没有当前项目类型');
        return true;
      }

      const validationResult = await this.validator.validateStateManager(
        currentStateManager,
        projectType,
      );

      if (!validationResult.isValid) {
        console.warn('状态验证失败:', validationResult.errors);

        // 尝试自动修复（如果启用）
        const repairResult = await this.validator.autoRepairState(
          currentStateManager,
          validationResult,
        );

        if (repairResult.success) {
          console.log('状态自动修复成功:', repairResult.message);
        }
      }

      return validationResult.isValid;
    } catch (error) {
      console.error('验证当前状态失败:', error);
      return false;
    }
  }

  /**
   * 清理项目状态
   */
  async cleanupProjectState(projectType?: ProjectType): Promise<void> {
    if (!this.isolator) {
      return;
    }

    try {
      if (projectType) {
        await this.isolator.cleanupState(projectType);
      } else {
        await this.isolator.cleanupAllStates();
      }

      console.log(`项目状态清理完成: ${projectType || '全部'}`);
    } catch (error) {
      console.error('清理项目状态失败:', error);
    }
  }

  /**
   * 获取状态统计信息
   */
  getStateStats(): any {
    if (!this.isolator || !this.projectTypeManager) {
      return null;
    }

    return {
      isolator: this.isolator.getStateStats(),
      projectTypeManager: this.projectTypeManager.getCacheStats(),
      isInitialized: this.isInitialized,
    };
  }

  /**
   * 销毁集成
   */
  async destroy(): Promise<void> {
    try {
      if (this.isolator) {
        await this.isolator.destroy();
        this.isolator = null;
      }

      if (this.projectTypeManager) {
        this.projectTypeManager.destroy();
        this.projectTypeManager = null;
      }

      this.validator = null;
      this.isInitialized = false;

      console.log('编辑器状态隔离集成销毁完成');
    } catch (error) {
      console.error('销毁编辑器状态隔离集成失败:', error);
    }
  }

  /**
   * 设置自动验证
   */
  private setupAutoValidation(interval: number): void {
    setInterval(async () => {
      try {
        await this.validateCurrentState();
      } catch (error) {
        console.error('自动验证失败:', error);
      }
    }, interval);

    console.log(`自动验证已启用，间隔: ${interval}ms`);
  }

  // Getter方法

  /**
   * 获取状态隔离管理器
   */
  getIsolator(): EditorStateIsolator | null {
    return this.isolator;
  }

  /**
   * 获取项目类型管理器
   */
  getProjectTypeManager(): ProjectTypeManager | null {
    return this.projectTypeManager;
  }

  /**
   * 获取状态验证器
   */
  getValidator(): StateConsistencyValidator | null {
    return this.validator;
  }

  /**
   * 检查是否已初始化
   */
  isIntegrationInitialized(): boolean {
    return this.isInitialized;
  }
}

/**
 * 全局编辑器状态集成实例
 */
export const globalEditorStateIntegration =
  EditorStateIntegration.getInstance();
