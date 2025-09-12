/**
 * 项目处理器基类和接口定义
 * 定义项目处理器的通用接口和生命周期管理
 */

import type { GAssetForgeEditor } from '../../editor';
import {
  ProjectDataValidator,
  type ValidationResult,
} from '../ProjectDataValidator';
import type { ProjectType } from '../ProjectTypeManager';

/**
 * 项目数据接口
 */
export interface ProjectData {
  type: ProjectType;
  data: any;
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    version?: string;
    [key: string]: any;
  };
}

/**
 * 项目处理器状态
 */
export enum ProjectHandlerState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  LOADING = 'loading',
  SAVING = 'saving',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

/**
 * 项目处理器事件
 */
export interface ProjectHandlerEvents {
  stateChanged: (
    oldState: ProjectHandlerState,
    newState: ProjectHandlerState,
  ) => void;
  projectLoaded: (projectData: ProjectData) => void;
  projectSaved: (projectData: ProjectData) => void;
  error: (error: Error) => void;
}

/**
 * 项目处理器接口
 * 定义所有项目处理器必须实现的方法
 */
export interface IProjectHandler {
  /**
   * 获取处理器支持的项目类型
   */
  getSupportedProjectType(): ProjectType;

  /**
   * 获取当前状态
   */
  getState(): ProjectHandlerState;

  /**
   * 初始化项目处理器
   * @param editor 编辑器实例
   */
  initialize(editor: GAssetForgeEditor): Promise<void>;

  /**
   * 加载项目数据
   * @param projectData 项目数据
   */
  loadProjectData(projectData: ProjectData): Promise<boolean>;

  /**
   * 保存项目数据
   */
  saveProjectData(): Promise<ProjectData>;

  /**
   * 验证项目数据格式
   * @param projectData 项目数据
   */
  validateProjectData(projectData: any): Promise<boolean>;

  /**
   * 获取项目状态快照
   */
  getProjectState(): any;

  /**
   * 恢复项目状态
   * @param state 状态数据
   */
  restoreProjectState(state: any): Promise<void>;

  /**
   * 清理资源
   */
  cleanup(): Promise<void>;

  /**
   * 销毁处理器
   */
  destroy(): Promise<void>;
}

/**
 * 项目处理器基类
 * 提供通用的生命周期管理和状态管理功能
 */
export abstract class BaseProjectHandler implements IProjectHandler {
  protected editor: GAssetForgeEditor | null = null;
  protected state: ProjectHandlerState = ProjectHandlerState.IDLE;
  protected eventListeners: Map<string, ((...args: any[]) => void)[]> =
    new Map();
  protected dataValidator: ProjectDataValidator;

  constructor() {
    this.dataValidator = new ProjectDataValidator();
    this.setupEventListeners();
  }

  /**
   * 获取处理器支持的项目类型
   */
  abstract getSupportedProjectType(): ProjectType;

  /**
   * 获取当前状态
   */
  getState(): ProjectHandlerState {
    return this.state;
  }

  /**
   * 初始化项目处理器
   */
  async initialize(editor: GAssetForgeEditor): Promise<void> {
    if (this.state !== ProjectHandlerState.IDLE) {
      throw new Error(`无法初始化处理器，当前状态: ${this.state}`);
    }

    this.setState(ProjectHandlerState.INITIALIZING);

    try {
      this.editor = editor;
      await this.onInitialize(editor);
      this.setState(ProjectHandlerState.READY);
    } catch (error) {
      this.setState(ProjectHandlerState.ERROR);
      this.emitEvent('error', error);
      throw error;
    }
  }

  /**
   * 加载项目数据
   */
  async loadProjectData(projectData: ProjectData): Promise<boolean> {
    if (this.state !== ProjectHandlerState.READY) {
      throw new Error(`无法加载项目，当前状态: ${this.state}`);
    }

    // 验证项目数据
    const isValid = await this.validateProjectData(projectData);
    if (!isValid) {
      console.error('项目数据验证失败，无法加载项目');
      return false;
    }

    this.setState(ProjectHandlerState.LOADING);

    try {
      const success = await this.onLoadProjectData(projectData);

      if (success) {
        this.emitEvent('projectLoaded', projectData);
        this.setState(ProjectHandlerState.READY);
      } else {
        this.setState(ProjectHandlerState.ERROR);
      }

      return success;
    } catch (error) {
      this.setState(ProjectHandlerState.ERROR);
      this.emitEvent('error', error);
      throw error;
    }
  }

  /**
   * 保存项目数据
   */
  async saveProjectData(): Promise<ProjectData> {
    if (this.state !== ProjectHandlerState.READY) {
      throw new Error(`无法保存项目，当前状态: ${this.state}`);
    }

    this.setState(ProjectHandlerState.SAVING);

    try {
      const projectData = await this.onSaveProjectData();

      // 保存前验证数据完整性
      const isValid = await this.validateProjectData(projectData);
      if (!isValid) {
        throw new Error('保存的项目数据验证失败');
      }

      this.emitEvent('projectSaved', projectData);
      this.setState(ProjectHandlerState.READY);
      return projectData;
    } catch (error) {
      this.setState(ProjectHandlerState.ERROR);
      this.emitEvent('error', error);
      throw error;
    }
  }

  /**
   * 验证项目数据格式
   */
  async validateProjectData(projectData: any): Promise<boolean> {
    if (!projectData || typeof projectData !== 'object') {
      console.error('项目数据无效：不是有效的对象');
      return false;
    }

    // 检查基本字段
    if (projectData.type !== this.getSupportedProjectType()) {
      console.error(
        `项目类型不匹配，期望: ${this.getSupportedProjectType()}, 实际: ${
          projectData.type
        }`,
      );
      return false;
    }

    try {
      // 使用ProjectDataValidator进行详细验证
      const validationResult = await this.dataValidator.validateProjectData(
        projectData,
        this.getSupportedProjectType(),
      );

      if (!validationResult.isValid) {
        console.error('项目数据验证失败:', validationResult.errors);

        // 尝试自动修复
        if (this.shouldAutoRepair(validationResult)) {
          const repairResult = await this.dataValidator.repairProjectData(
            projectData,
          );
          if (repairResult.result.isValid) {
            console.log('项目数据已自动修复:', repairResult.result.fixedIssues);
            // 更新项目数据
            Object.assign(projectData, repairResult.data);
            return true;
          }
        }

        return false;
      }

      // 记录警告
      if (validationResult.warnings.length > 0) {
        console.warn('项目数据验证警告:', validationResult.warnings);
      }

      // 调用子类的额外验证
      return this.onValidateProjectData(projectData);
    } catch (error) {
      console.error('项目数据验证异常:', error);
      return false;
    }
  }

  /**
   * 判断是否应该自动修复数据
   */
  protected shouldAutoRepair(validationResult: ValidationResult): boolean {
    // 只有当所有错误都可以自动修复时才进行修复
    return validationResult.errors.every((error) => error.autoFixable);
  }

  /**
   * 获取项目状态快照
   */
  getProjectState(): any {
    if (this.state !== ProjectHandlerState.READY) {
      return null;
    }

    return this.onGetProjectState();
  }

  /**
   * 恢复项目状态
   */
  async restoreProjectState(state: any): Promise<void> {
    if (this.state !== ProjectHandlerState.READY) {
      throw new Error(`无法恢复状态，当前状态: ${this.state}`);
    }

    await this.onRestoreProjectState(state);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.state === ProjectHandlerState.DESTROYED) {
      return;
    }

    try {
      await this.onCleanup();
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  }

  /**
   * 销毁处理器
   */
  async destroy(): Promise<void> {
    if (this.state === ProjectHandlerState.DESTROYED) {
      return;
    }

    await this.cleanup();
    this.setState(ProjectHandlerState.DESTROYED);
    this.clearEventListeners();
    this.editor = null;
  }

  /**
   * 设置状态
   */
  protected setState(newState: ProjectHandlerState): void {
    const oldState = this.state;
    this.state = newState;
    this.emitEvent('stateChanged', oldState, newState);
  }

  /**
   * 添加事件监听器
   */
  protected addEventListener(
    event: string,
    listener: (...args: any[]) => void,
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 发射事件
   */
  protected emitEvent(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`事件监听器执行出错 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 清理事件监听器
   */
  protected clearEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * 设置事件监听器（子类可重写）
   */
  protected setupEventListeners(): void {
    // 子类可以重写此方法来设置特定的事件监听器
  }

  // 抽象方法 - 子类必须实现

  /**
   * 初始化处理器（子类实现）
   */
  protected abstract onInitialize(editor: GAssetForgeEditor): Promise<void>;

  /**
   * 加载项目数据（子类实现）
   */
  protected abstract onLoadProjectData(
    projectData: ProjectData,
  ): Promise<boolean>;

  /**
   * 保存项目数据（子类实现）
   */
  protected abstract onSaveProjectData(): Promise<ProjectData>;

  /**
   * 验证项目数据（子类实现）
   */
  protected abstract onValidateProjectData(projectData: any): boolean;

  /**
   * 获取项目状态（子类实现）
   */
  protected abstract onGetProjectState(): any;

  /**
   * 恢复项目状态（子类实现）
   */
  protected abstract onRestoreProjectState(state: any): Promise<void>;

  /**
   * 清理资源（子类实现）
   */
  protected abstract onCleanup(): Promise<void>;
}
