/**
 * 项目列表管理器
 * 负责项目列表的获取、创建、删除等列表相关操作
 */

import { EventEmitter } from '@g-asset-forge/common';
import {
  GraphicsType,
  PaintType,
  type ProjectData,
  type ProjectMetadata,
  ProjectStorageService,
} from '@g-asset-forge/core';

import { ErrorType, ProjectErrorHandler } from '../../ProjectErrorHandler';
import { type ProjectOperationResult } from '../types/ProjectManagementTypes';

export class ProjectListManager extends EventEmitter<{
  projectsListLoaded: (projects: ProjectMetadata[]) => void;
  projectCreated: (project: ProjectData) => void;
  projectDeleted: (projectId: string) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectsSearched: (query: string, results: ProjectMetadata[]) => void;
  projectStatsLoaded: (stats: any) => void;
}> {
  private storageService: ProjectStorageService;
  private errorHandler: ProjectErrorHandler;

  constructor(errorHandler: ProjectErrorHandler) {
    super();
    this.storageService = new ProjectStorageService();
    this.errorHandler = errorHandler;
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    try {
      const projects = await this.storageService.getProjectsList();

      this.emit('projectsListLoaded', projects);

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
   * 创建新项目
   */
  async createProject(
    projectName: string,
    projectType: 'h5' | 'design' = 'design',
  ): Promise<ProjectOperationResult> {
    try {
      // 生成项目ID
      const projectId = this.generateProjectId(projectName);

      // 创建项目数据
      const projectData: ProjectData = {
        id: projectId,
        name: projectName,
        description: '',
        type: projectType,
        version: '1.0.0',
        appVersion: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastOpenedAt: new Date(),
        editorData:
          projectType === 'h5'
            ? this.getDefaultH5Data()
            : this.getDefaultDesignData(),
        settings: {
          canvasWidth: 0, // 无限宽度
          canvasHeight: 0, // 无限高度
          backgroundColor: '#ffffff',
          exportFormat: ['png'],
          exportQuality: 0.9,
          showGrid: true,
          showRuler: true,
          gridSize: 10,
        },
        usedAssets: [],
        usedTemplates: [],
      };

      // 保存项目
      await this.storageService.saveProject(projectData);

      this.emit('projectCreated', projectData);

      // 重新加载项目列表并发出更新事件
      try {
        const updatedProjects = await this.getProjectsList();
        this.emit('projectsListLoaded', updatedProjects);
        console.log('项目列表已更新，当前项目数量:', updatedProjects.length);
      } catch (error) {
        console.error('重新加载项目列表失败:', error);
      }

      return {
        success: true,
        data: projectData,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectName, projectType },
      );
      console.error('创建项目失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<ProjectOperationResult> {
    try {
      console.log('删除项目:', projectId);

      // 检查项目是否存在
      const project = await this.storageService.loadProject(projectId);
      if (!project) {
        const error = this.errorHandler.handleError(
          new Error(`项目 ${projectId} 不存在`),
          ErrorType.PROJECT_NOT_FOUND,
          { projectId },
        );
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 删除项目
      await this.storageService.deleteProject(projectId);

      console.log('项目删除成功:', projectId);
      this.emit('projectDeleted', projectId);

      // 重新加载项目列表并发出更新事件
      try {
        const updatedProjects = await this.getProjectsList();
        this.emit('projectsListLoaded', updatedProjects);
        console.log('项目列表已更新，当前项目数量:', updatedProjects.length);
      } catch (error) {
        console.error('重新加载项目列表失败:', error);
      }

      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId },
      );
      console.error('删除项目失败:', projectError);
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
  ): Promise<ProjectOperationResult> {
    try {
      console.log('重命名项目:', { projectId, newName });

      // 检查项目是否存在
      const project = await this.storageService.loadProject(projectId);
      if (!project) {
        const error = this.errorHandler.handleError(
          new Error(`项目 ${projectId} 不存在`),
          ErrorType.PROJECT_NOT_FOUND,
          { projectId },
        );
        return {
          success: false,
          error: new Error(error.userMessage),
        };
      }

      // 重命名项目
      await this.storageService.updateProject(projectId, { name: newName });

      console.log('项目重命名成功:', { projectId, newName });
      this.emit('projectRenamed', projectId, newName);

      // 重新加载项目列表并发出更新事件
      try {
        const updatedProjects = await this.getProjectsList();
        this.emit('projectsListLoaded', updatedProjects);
        console.log('项目列表已更新，当前项目数量:', updatedProjects.length);
      } catch (error) {
        console.error('重新加载项目列表失败:', error);
      }

      return {
        success: true,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { projectId, newName },
      );
      console.error('重命名项目失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 搜索项目
   */
  async searchProjects(query: string): Promise<ProjectMetadata[]> {
    try {
      console.log('搜索项目:', query);

      const allProjects = await this.getProjectsList();
      const filteredProjects = allProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase()),
      );

      console.log('项目搜索完成:', {
        query,
        total: allProjects.length,
        filtered: filteredProjects.length,
      });

      this.emit('projectsSearched', query, filteredProjects);

      return filteredProjects;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        { query },
      );
      console.error('搜索项目失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(): Promise<{
    total: number;
    h5Projects: number;
    designProjects: number;
    recentProjects: ProjectMetadata[];
  }> {
    try {
      console.log('获取项目统计信息');

      const projects = await this.getProjectsList();
      const h5Projects = projects.filter((p) => p.type === 'h5');
      const designProjects = projects.filter((p) => p.type === 'design');

      // 获取最近的项目（按更新时间排序）
      const recentProjects = projects
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5);

      const stats = {
        total: projects.length,
        h5Projects: h5Projects.length,
        designProjects: designProjects.length,
        recentProjects,
      };

      console.log('项目统计信息获取成功:', stats);
      this.emit('projectStatsLoaded', stats);

      return stats;
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.PROJECT_LOAD_FAILED,
        {},
      );
      console.error('获取项目统计信息失败:', projectError);
      throw new Error(projectError.userMessage);
    }
  }

  /**
   * 生成项目ID
   */
  private generateProjectId(projectName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = projectName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    return `${sanitizedName}_${timestamp}_${random}`;
  }

  /**
   * 获取默认H5项目数据
   */
  private getDefaultH5Data(): any {
    return {
      appVersion: 'g-asset-forge-editor_1.0.0',
      paperId: 'h5-default-paper',
      data: [
        // 添加默认的H5画布（不可编辑，仅作为背景容器）
        {
          id: 'h5-canvas-1',
          type: GraphicsType.Canvas,
          objectName: 'Page 1',
          width: 0, // 0表示无限宽度
          height: 0, // 0表示无限高度
          transform: [1, 0, 0, 1, 0, 0],
          fill: [
            { type: PaintType.Solid, attrs: { r: 255, g: 255, b: 255, a: 1 } },
          ],
          lock: true, // 锁定画布，不可编辑
        },
        // 添加默认的H5容器
        {
          id: 'h5-container-1',
          type: 'H5Container' as any,
          objectName: 'H5长图容器',
          width: 1080, // H5长图标准宽度
          height: 2220, // H5长图标准高度
          transform: [1, 0, 0, 1, 0, 0],
          fill: [
            { type: PaintType.Solid, attrs: { r: 248, g: 249, b: 250, a: 1 } },
          ],
          parentIndex: {
            guid: 'h5-canvas-1',
            position: '0',
          },
        },
      ],
    };
  }

  /**
   * 获取默认设计项目数据
   */
  private getDefaultDesignData(): any {
    return {
      appVersion: 'g-asset-forge-editor_1.0.0',
      paperId: 'design-default-paper',
      data: [
        // 添加默认的设计画布
        {
          id: 'design-canvas-1',
          type: GraphicsType.Canvas,
          objectName: 'Page 1',
          width: 0, // 0表示无限宽度
          height: 0, // 0表示无限高度
          transform: [1, 0, 0, 1, 0, 0],
          fill: [
            { type: PaintType.Solid, attrs: { r: 255, g: 255, b: 255, a: 1 } },
          ],
        },
      ],
    };
  }
}
