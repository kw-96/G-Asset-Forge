/**
 * 自动保存和导出管理器
 * 负责项目的自动保存、手动保存、自动导出等功能
 */

import { EventEmitter } from '@g-asset-forge/common';
import {
  AutoExportService,
  type GAssetForgeEditor,
  ProjectAutoSave,
  type ProjectData,
  ProjectStorageService,
} from '@g-asset-forge/core';

import { ErrorType, ProjectErrorHandler } from '../../ProjectErrorHandler';
import type {
  AutoExportConfig,
  AutoSaveConfig,
  ProjectOperationResult,
} from '../types/ProjectManagementTypes';

export class AutoSaveExportManager extends EventEmitter<{
  autoSaveSetup: (_projectId: string) => void;
  autoSaveError: (_projectId: string, _error: any) => void;
  projectManuallySaved: (_projectData: ProjectData) => void;
  projectAutoExported: (_projectData: ProjectData) => void;
  autoExportError: (_projectId: string, _error: any) => void;
}> {
  private autoSaveService: ProjectAutoSave | null = null;
  private autoExportService: AutoExportService;
  private storageService: ProjectStorageService;
  private errorHandler: ProjectErrorHandler;
  private autoSaveConfig: AutoSaveConfig;
  private autoExportConfig: AutoExportConfig;
  private autoExportEnabled: boolean = true;

  constructor(errorHandler: ProjectErrorHandler) {
    super();
    this.autoExportService = new AutoExportService();
    this.storageService = new ProjectStorageService();
    this.errorHandler = errorHandler;

    // 默认配置
    this.autoSaveConfig = {
      enabled: true,
      interval: 30000, // 30秒
      maxRetries: 3,
    };

    this.autoExportConfig = {
      enabled: true,
      format: ['png', 'jpg'],
      quality: 0.9,
      includeMetadata: true,
    };

    // 从本地存储加载设置
    this.loadSettings();
  }

  /**
   * 设置自动保存服务
   */
  setupAutoSave(editor: GAssetForgeEditor, projectId: string): void {
    try {
      console.log('设置自动保存服务:', { projectId });

      // 清理现有服务
      if (this.autoSaveService) {
        this.autoSaveService.destroy();
      }

      // 创建新的自动保存服务
      this.autoSaveService = new ProjectAutoSave(editor, this.storageService);
      this.autoSaveService.setCurrentProject(projectId);

      // 设置自动保存配置
      if (this.autoSaveConfig.enabled) {
        this.autoSaveService.setAutoSaveInterval(this.autoSaveConfig.interval);
        this.autoSaveService.enableAutoSave();
      } else {
        this.autoSaveService.disableAutoSave();
      }

      console.log('自动保存服务设置成功:', {
        projectId,
        enabled: this.autoSaveConfig.enabled,
        interval: this.autoSaveConfig.interval,
      });

      this.emit('autoSaveSetup', projectId);
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.AUTO_SAVE_FAILED,
        { projectId },
      );
      console.error('设置自动保存服务失败:', projectError);
      this.emit('autoSaveError', projectId, error);
    }
  }

  /**
   * 手动保存项目
   */
  async manualSave(projectData: ProjectData): Promise<ProjectOperationResult> {
    try {
      console.log('手动保存项目:', projectData.name);

      // 保存项目数据
      await this.storageService.saveProject(projectData);

      console.log('项目手动保存成功:', projectData.name);
      this.emit('projectManuallySaved', projectData);

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
      console.error('手动保存项目失败:', projectError);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 触发自动导出
   */
  async triggerAutoExport(
    projectData: ProjectData,
  ): Promise<ProjectOperationResult> {
    try {
      if (!this.autoExportEnabled || !this.autoExportConfig.enabled) {
        console.log('自动导出已禁用，跳过导出:', projectData.name);
        return {
          success: true,
          data: { skipped: true, reason: 'Auto export disabled' },
        };
      }

      console.log('触发自动导出:', projectData.name);

      // 执行自动导出
      const exportResult = await this.autoExportService.autoExportProject(
        projectData,
      );

      console.log('自动导出成功:', {
        projectName: projectData.name,
        result: exportResult,
      });

      this.emit('projectAutoExported', projectData);
      this.emit('projectAutoExported', projectData);

      return {
        success: true,
        data: exportResult,
      };
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.AUTO_EXPORT_FAILED,
        { projectName: projectData.name },
      );
      console.error('自动导出失败:', projectError);
      this.emit('autoExportError', projectData.id, error);
      return {
        success: false,
        error: new Error(projectError.userMessage),
      };
    }
  }

  /**
   * 设置自动保存配置
   */
  setAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };

    if (this.autoSaveService) {
      if (this.autoSaveConfig.enabled) {
        this.autoSaveService.setAutoSaveInterval(this.autoSaveConfig.interval);
        this.autoSaveService.enableAutoSave();
      } else {
        this.autoSaveService.disableAutoSave();
      }
    }

    // 保存到本地存储
    this.saveSettings();
    console.log('自动保存配置已更新:', this.autoSaveConfig);
  }

  /**
   * 设置自动导出配置
   */
  setAutoExportConfig(config: Partial<AutoExportConfig>): void {
    this.autoExportConfig = { ...this.autoExportConfig, ...config };

    // 保存到本地存储
    this.saveSettings();
    console.log('自动导出配置已更新:', this.autoExportConfig);
  }

  /**
   * 启用/禁用自动导出
   */
  setAutoExportEnabled(enabled: boolean): void {
    this.autoExportEnabled = enabled;
    this.autoExportConfig.enabled = enabled;

    // 保存到本地存储
    this.saveSettings();
    console.log('自动导出状态已更新:', enabled);
  }

  /**
   * 获取自动保存状态
   */
  getAutoSaveStatus(): {
    enabled: boolean;
    interval: number;
    maxRetries: number;
    isActive: boolean;
  } {
    return {
      enabled: this.autoSaveConfig.enabled,
      interval: this.autoSaveConfig.interval,
      maxRetries: this.autoSaveConfig.maxRetries,
      isActive: this.autoSaveService
        ? this.autoSaveService.isDirtyProject()
        : false,
    };
  }

  /**
   * 获取自动导出状态
   */
  getAutoExportStatus(): {
    enabled: boolean;
    config: AutoExportConfig;
  } {
    return {
      enabled: this.autoExportEnabled && this.autoExportConfig.enabled,
      config: this.autoExportConfig,
    };
  }

  /**
   * 加载设置
   */
  private loadSettings(): void {
    try {
      const autoSaveSettings = localStorage.getItem('autoSaveSettings');
      if (autoSaveSettings) {
        this.autoSaveConfig = {
          ...this.autoSaveConfig,
          ...JSON.parse(autoSaveSettings),
        };
      }

      const autoExportSettings = localStorage.getItem('autoExportSettings');
      if (autoExportSettings) {
        const settings = JSON.parse(autoExportSettings);
        this.autoExportConfig = { ...this.autoExportConfig, ...settings };
        this.autoExportEnabled = settings.enabled !== false;
      }

      console.log('设置加载完成:', {
        autoSave: this.autoSaveConfig,
        autoExport: this.autoExportConfig,
      });
    } catch (error) {
      console.warn('加载设置失败，使用默认配置:', error);
    }
  }

  /**
   * 保存设置
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        'autoSaveSettings',
        JSON.stringify(this.autoSaveConfig),
      );
      localStorage.setItem(
        'autoExportSettings',
        JSON.stringify({
          ...this.autoExportConfig,
          enabled: this.autoExportEnabled,
        }),
      );
    } catch (error) {
      console.warn('保存设置失败:', error);
    }
  }

  /**
   * 启用自动导出
   */
  enableAutoExport(): void {
    this.autoExportEnabled = true;
    this.saveSettings();
    console.log('自动导出已启用');
  }

  /**
   * 禁用自动导出
   */
  disableAutoExport(): void {
    this.autoExportEnabled = false;
    this.saveSettings();
    console.log('自动导出已禁用');
  }

  /**
   * 获取自动导出信息
   */
  getAutoExportInfo(): any {
    return {
      enabled: this.autoExportEnabled,
      interval: 30000, // 默认30秒
      isActive: this.autoSaveService?.isDirtyProject() || false,
    };
  }

  /**
   * 请求文件系统权限
   */
  async requestFileSystemPermission(): Promise<boolean> {
    try {
      return await this.autoExportService.requestFileSystemPermission();
    } catch (error) {
      const projectError = this.errorHandler.handleError(
        error as Error,
        ErrorType.AUTO_EXPORT_FAILED,
        {},
      );
      console.error('文件系统权限请求失败:', projectError);
      return false;
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.autoSaveService) {
      this.autoSaveService.destroy();
      this.autoSaveService = null;
    }
    console.log('AutoSaveExportManager 已销毁');
  }
}
