/**
 * 项目生命周期管理器
 * 负责项目的创建、打开、保存、删除、重命名等核心生命周期操作
 */

import { EventEmitter } from '@g-asset-forge/common';
import type { ProjectData, ProjectType } from '@g-asset-forge/core';

import { ErrorType, ProjectErrorHandler } from '../../ProjectErrorHandler';
import {
  ProjectLifecycleState,
  type ProjectOperationResult,
} from '../types/ProjectManagementTypes';

export class ProjectLifecycleManager extends EventEmitter<{
  projectOpened: (_project: ProjectData) => void;
  projectClosed: (_projectId: string) => void;
  projectSaved: (_project: ProjectData) => void;
  projectRenamed: (_projectId: string, _newName: string) => void;
  projectDeleted: (_projectId: string) => void;
}> {
  private errorHandler: ProjectErrorHandler;
  private lifecycleState: ProjectLifecycleState = ProjectLifecycleState.IDLE;

  constructor(errorHandler: ProjectErrorHandler) {
    super();
    this.errorHandler = errorHandler;
  }

  /**
   * 获取当前生命周期状态
   */
  getCurrentState(): ProjectLifecycleState {
    return this.lifecycleState;
  }

  /**
   * 设置生命周期状态
   */
  private setState(newState: ProjectLifecycleState): void {
    const oldState = this.lifecycleState;
    this.lifecycleState = newState;
    console.log(`项目生命周期状态变更: ${oldState} -> ${newState}`);
  }

  /**
   * 创建项目
   */
  async createProject(
    projectData: ProjectData,
    onSuccess: (project: ProjectData) => Promise<void>,
  ): Promise<ProjectOperationResult> {
    try {
      this.setState(ProjectLifecycleState.LOADING);
      console.log('开始创建项目:', projectData.name);

      // 执行创建逻辑
      await onSuccess(projectData);

      console.log('项目创建成功:', projectData.name);
      this.setState(ProjectLifecycleState.IDLE);

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectName: projectData.name },
      );

      console.error('项目创建失败:', projectError);
      this.setState(ProjectLifecycleState.ERROR);

      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 打开项目
   */
  async openProject(
    projectId: string,
    onLoad: (projectId: string) => Promise<ProjectData | null>,
    onIdentify: (projectData: ProjectData) => Promise<ProjectType | null>,
    onInitialize: (
      projectData: ProjectData,
      projectType: ProjectType,
    ) => Promise<void>,
  ): Promise<ProjectOperationResult> {
    try {
      this.setState(ProjectLifecycleState.LOADING);
      console.log('开始打开项目:', projectId);

      // 步骤1: 加载项目数据
      const projectData = await onLoad(projectId);
      if (!projectData) {
        const error = this.errorHandler.handleError(
          new Error(`项目 ${projectId} 不存在`),
          ErrorType.PROJECT_NOT_FOUND,
          { projectId },
        );
        this.setState(ProjectLifecycleState.ERROR);
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 步骤2: 识别项目类型
      const projectType = await onIdentify(projectData);
      if (!projectType) {
        const error = this.errorHandler.handleError(
          new Error(`无法识别项目 ${projectId} 的类型`),
          ErrorType.PROJECT_TYPE_IDENTIFICATION_FAILED,
          { projectId, projectData: projectData.name },
        );
        this.setState(ProjectLifecycleState.ERROR);
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 步骤3: 初始化项目
      await onInitialize(projectData, projectType);

      console.log('项目打开成功:', {
        projectId,
        projectName: projectData.name,
        projectType,
      });

      this.setState(ProjectLifecycleState.IDLE);
      this.emit('projectOpened', projectData);

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );

      console.error('项目打开失败:', projectError);
      this.setState(ProjectLifecycleState.ERROR);

      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 保存项目
   */
  async saveProject(
    projectData: ProjectData,
    onSave: (projectData: ProjectData) => Promise<void>,
  ): Promise<ProjectOperationResult> {
    try {
      this.setState(ProjectLifecycleState.SAVING);
      console.log('开始保存项目:', projectData.name);

      await onSave(projectData);

      console.log('项目保存成功:', projectData.name);
      this.setState(ProjectLifecycleState.IDLE);
      this.emit('projectSaved', projectData);

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_SAVE_FAILED,
        { projectName: projectData.name },
      );

      console.error('项目保存失败:', projectError);
      this.setState(ProjectLifecycleState.ERROR);

      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(
    projectId: string,
    onDelete: (projectId: string) => Promise<void>,
  ): Promise<ProjectOperationResult> {
    try {
      this.setState(ProjectLifecycleState.DELETING);
      console.log('开始删除项目:', projectId);

      await onDelete(projectId);

      console.log('项目删除成功:', projectId);
      this.setState(ProjectLifecycleState.IDLE);
      this.emit('projectDeleted', projectId);

      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );

      console.error('项目删除失败:', projectError);
      this.setState(ProjectLifecycleState.ERROR);

      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 重命名项目
   */
  async renameProject(
    projectId: string,
    newName: string,
    onRename: (projectId: string, newName: string) => Promise<void>,
  ): Promise<ProjectOperationResult> {
    try {
      this.setState(ProjectLifecycleState.RENAMING);
      console.log('开始重命名项目:', { projectId, newName });

      await onRename(projectId, newName);

      console.log('项目重命名成功:', { projectId, newName });
      this.setState(ProjectLifecycleState.IDLE);
      this.emit('projectRenamed', projectId, newName);

      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId, newName },
      );

      console.error('项目重命名失败:', projectError);
      this.setState(ProjectLifecycleState.ERROR);

      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 关闭项目
   */
  closeProject(projectId: string): void {
    console.log('关闭项目:', projectId);
    this.setState(ProjectLifecycleState.IDLE);
    this.emit('projectClosed', projectId);
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.setState(ProjectLifecycleState.IDLE);
  }
}
