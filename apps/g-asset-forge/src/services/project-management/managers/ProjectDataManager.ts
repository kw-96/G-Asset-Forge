/**
 * 项目数据管理器
 * 负责项目数据的加载、验证、类型识别等数据相关操作
 */

import {
  type ProjectData,
  ProjectDataValidator,
  type ProjectMetadata,
  ProjectStorageService,
  type ProjectType,
  type ProjectTypeIdentificationResult,
  ProjectTypeManager,
} from '@g-asset-forge/core';

import { ErrorType, ProjectErrorHandler } from '../../ProjectErrorHandler';
import type { ProjectOperationResult } from '../types/ProjectManagementTypes';

export class ProjectDataManager {
  private storageService: ProjectStorageService;
  private projectTypeManager: ProjectTypeManager;
  private dataValidator: ProjectDataValidator;
  private errorHandler: ProjectErrorHandler;

  constructor(errorHandler: ProjectErrorHandler) {
    this.storageService = new ProjectStorageService();
    this.projectTypeManager = new ProjectTypeManager();
    this.dataValidator = new ProjectDataValidator();
    this.errorHandler = errorHandler;
  }

  /**
   * 加载项目数据
   */
  async loadProjectData(projectId: string): Promise<ProjectData | null> {
    try {
      const projectData = await this.storageService.loadProject(projectId);

      if (!projectData) {
        console.warn('项目数据不存在:', projectId);
        return null;
      }

      // 验证项目数据
      const isValid = await this.dataValidator.validateProjectData(projectData);
      if (!isValid) {
        const error = this.errorHandler.handleError(
          new Error(`项目数据验证失败: ${projectId}`),
          ErrorType.VALIDATION_FAILED,
          { projectId },
        );
        throw new Error(error.userMessage);
      }

      return projectData;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );
      console.error('加载项目数据失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 识别项目类型
   */
  async identifyProjectType(
    projectData: ProjectData,
    projectId: string,
  ): Promise<ProjectTypeIdentificationResult | null> {
    try {
      const result = await this.projectTypeManager.identifyProjectType(
        projectData,
      );

      if (!result) {
        console.warn('无法识别项目类型:', projectId);
        return null;
      }

      return result;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_TYPE_IDENTIFICATION_FAILED,
        { projectId, projectName: projectData.name },
      );
      console.error('项目类型识别失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 设置项目状态
   */
  async setProjectState(
    projectId: string,
    projectType: ProjectType,
  ): Promise<void> {
    try {

      // 设置项目类型管理器状态
      this.projectTypeManager.setCurrentProjectType(projectId, projectType);

    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId, projectType },
      );
      console.error('设置项目状态失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    try {
      const projects = await this.storageService.getProjectsList();

      return projects;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        {},
      );
      console.error('获取项目列表失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 获取当前项目类型
   */
  getCurrentProjectType(): ProjectType | null {
    return this.projectTypeManager.getCurrentProjectType();
  }

  /**
   * 验证项目状态
   */
  async validateProjectState(): Promise<boolean> {
    try {
      const currentType = this.getCurrentProjectType();
      if (!currentType) {
        console.warn('当前没有活跃的项目类型');
        return false;
      }

      return true;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.VALIDATION_FAILED,
        {},
      );
      console.error('项目状态验证失败:', projectError);
      return false;
    }
  }

  /**
   * 保存项目数据
   */
  async saveProjectData(
    projectData: ProjectData,
  ): Promise<ProjectOperationResult> {
    try {
      // 验证数据
      const isValid = await this.dataValidator.validateProjectData(projectData);
      if (!isValid) {
        const error = this.errorHandler.handleError(
          new Error(`项目数据验证失败: ${projectData.name}`),
          ErrorType.VALIDATION_FAILED,
          { projectName: projectData.name },
        );
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 保存数据
      await this.storageService.saveProject(projectData);

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
      console.error('保存项目数据失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 删除项目数据
   */
  async deleteProjectData(projectId: string): Promise<ProjectOperationResult> {
    try {
      // 项目数据删除成功（实际删除由ProjectListManager处理）
      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );
      console.error('删除项目数据失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 重命名项目数据
   */
  async renameProjectData(
    projectId: string,
    newName: string,
  ): Promise<ProjectOperationResult> {
    try {
      console.log('重命名项目数据:', { projectId, newName });

      await this.storageService.updateProject(projectId, { name: newName });

      console.log('项目数据重命名成功:', { projectId, newName });
      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId, newName },
      );
      console.error('重命名项目数据失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }
}
