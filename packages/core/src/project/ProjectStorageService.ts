import { EventEmitter } from '@g-asset-forge/common';

// import { ProjectDataService } from '../service/project_data_service'; // 暂时注释，后续使用
import { GraphicsType } from '../type';
import { RecycleBinService } from './RecycleBinService';
import {
  type CreateProjectParams,
  type ProjectBackup,
  type ProjectData,
  type ProjectMetadata,
  type ProjectSettings,
  type ProjectStorageConfig,
  type UpdateProjectParams,
} from './types';

/**
 * 项目存储服务类
 * 负责项目的本地存储、备份和版本管理
 */
interface ProjectStorageEvents {
  projectCreated: (project: ProjectData) => void;
  projectSaved: (project: ProjectData) => void;
  projectSaveError: (data: { project: ProjectData; error: any }) => void;
  projectLoaded: (project: ProjectData) => void;
  projectLoadError: (data: { projectId: string; error: any }) => void;
  projectDeleted: (projectId: string) => void;
  projectDeleteError: (data: { projectId: string; error: any }) => void;
  backupCreated: (backup: ProjectBackup) => void;
  backupCreateError: (data: { projectId: string; error: any }) => void;
  projectRestored: (data: {
    backup: ProjectBackup;
    project: ProjectData;
  }) => void;
  restoreError: (data: { backupId: string; error: any }) => void;
  configUpdated: (config: ProjectStorageConfig) => void;
  allProjectsCleared: () => void;
}

export class ProjectStorageService extends EventEmitter<ProjectStorageEvents> {
  private readonly PROJECTS_KEY = 'g-asset-forge-projects';
  private readonly PROJECT_PREFIX = 'g-asset-forge-project-';
  private readonly BACKUP_PREFIX = 'g-asset-forge-backup-';
  private readonly CONFIG_KEY = 'g-asset-forge-project-config';

  private config: ProjectStorageConfig;
  private recycleBinService: RecycleBinService;
  // private projectDataService: ProjectDataService; // 暂时注释，后续使用

  constructor(config?: Partial<ProjectStorageConfig>) {
    super();

    // 默认配置
    this.config = {
      autoSaveInterval: 10000, // 10秒
      maxBackupCount: 10,
      enableAutoBackup: true,
      autoBackupInterval: 300000, // 5分钟
      ...config,
    };

    this.recycleBinService = new RecycleBinService();
    // this.projectDataService = new ProjectDataService(); // 暂时注释，后续使用
    this.saveConfig();
  }

  /**
   * 获取默认项目设置
   */
  private getDefaultSettings(): ProjectSettings {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      backgroundColor: '#ffffff',
      exportFormat: ['png', 'jpg'],
      exportQuality: 0.9,
      showGrid: true, // 默认显示网格，与编辑器设置保持一致
      gridSize: 20,
      showRuler: true,
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建新项目
   */
  async createProject(params: CreateProjectParams): Promise<ProjectData> {
    const now = new Date();
    const projectId = this.generateId();

    const project: ProjectData = {
      id: projectId,
      name: params.name,
      description: params.description || '',
      type: params.type,
      editorData: {
        appVersion: 'g-asset-forge-editor_1.0.0',
        paperId: projectId,
        data: [
          // 添加默认的Page 1 (无限画布)
          {
            id: `${projectId}-page-1`,
            type: GraphicsType.Canvas,
            objectName: 'Page 1',
            width: 0,
            height: 0,
            transform: [1, 0, 0, 1, 0, 0],
          },
        ],
      },
      settings: {
        ...this.getDefaultSettings(),
        ...params.settings,
      },
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      usedAssets: [],
      usedTemplates: params.templateId ? [params.templateId] : [],
      version: '1.0.0',
      appVersion: 'g-asset-forge-editor_1.0.0',
    };

    await this.saveProject(project);
    await this.updateProjectsList(project);

    this.emit('projectCreated', project);
    return project;
  }

  /**
   * 保存项目数据
   */
  async saveProject(project: ProjectData): Promise<void> {
    try {
      project.updatedAt = new Date();
      const projectKey = this.PROJECT_PREFIX + project.id;

      localStorage.setItem(projectKey, JSON.stringify(project));
      await this.updateProjectsList(project);

      this.emit('projectSaved', project);
    } catch (error) {
      console.error('保存项目失败:', error);
      this.emit('projectSaveError', { project, error });
      throw error;
    }
  }

  /**
   * 加载项目数据
   */
  async loadProject(projectId: string): Promise<ProjectData | null> {
    try {
      const projectKey = this.PROJECT_PREFIX + projectId;
      const dataStr = localStorage.getItem(projectKey);

      if (!dataStr) {
        return null;
      }

      const project = JSON.parse(dataStr) as ProjectData;

      // 更新最后打开时间
      project.lastOpenedAt = new Date();
      await this.saveProject(project);

      this.emit('projectLoaded', project);
      return project;
    } catch (error) {
      console.error('加载项目失败:', error);
      this.emit('projectLoadError', { projectId, error });
      return null;
    }
  }

  /**
   * 更新项目数据
   */
  async updateProject(
    projectId: string,
    params: UpdateProjectParams,
  ): Promise<ProjectData | null> {
    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    // 更新项目数据
    if (params.name !== undefined) project.name = params.name;
    if (params.description !== undefined)
      project.description = params.description;
    if (params.settings) {
      project.settings = { ...project.settings, ...params.settings };
    }
    if (params.editorData) project.editorData = params.editorData;
    if (params.usedAssets) project.usedAssets = params.usedAssets;
    if (params.usedTemplates) project.usedTemplates = params.usedTemplates;

    await this.saveProject(project);
    return project;
  }

  /**
   * 软删除项目（移动到回收站）
   */
  async softDeleteProject(projectId: string): Promise<boolean> {
    try {
      // 先加载项目数据
      const project = await this.loadProject(projectId);
      if (!project) {
        console.error('项目不存在:', projectId);
        return false;
      }

      // 移动到回收站
      await this.recycleBinService.moveToRecycleBin(project);

      // 从正常存储中删除
      return this.deleteProject(projectId);
    } catch (error) {
      console.error('软删除项目失败:', error);
      this.emit('projectDeleteError', { projectId, error });
      return false;
    }
  }

  /**
   * 硬删除项目（永久删除）
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const projectKey = this.PROJECT_PREFIX + projectId;
      localStorage.removeItem(projectKey);

      // 删除相关备份
      await this.deleteProjectBackups(projectId);

      // 更新项目列表
      const projects = await this.getProjectsList();
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(updatedProjects));

      this.emit('projectDeleted', projectId);
      return true;
    } catch (error) {
      console.error('删除项目失败:', error);
      this.emit('projectDeleteError', { projectId, error });
      return false;
    }
  }

  /**
   * 从回收站恢复项目
   */
  async restoreProject(recycleBinItemId: string): Promise<ProjectData | null> {
    try {
      const restoredProject =
        await this.recycleBinService.restoreFromRecycleBin(recycleBinItemId);

      if (restoredProject) {
        // 保存恢复的项目
        await this.saveProject(restoredProject);
        return restoredProject;
      }

      return null;
    } catch (error) {
      console.error('恢复项目失败:', error);
      return null;
    }
  }

  /**
   * 获取回收站服务实例
   */
  getRecycleBinService(): RecycleBinService {
    return this.recycleBinService;
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    try {
      const dataStr = localStorage.getItem(this.PROJECTS_KEY);
      if (!dataStr) {
        return [];
      }

      const projects = JSON.parse(dataStr) as ProjectMetadata[];

      // 按最后打开时间排序
      return projects.sort(
        (a, b) =>
          new Date(b.lastOpenedAt).getTime() -
          new Date(a.lastOpenedAt).getTime(),
      );
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  }

  /**
   * 更新项目列表
   */
  private async updateProjectsList(project: ProjectData): Promise<void> {
    const projects = await this.getProjectsList();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      lastOpenedAt: project.lastOpenedAt,
      fileSize: JSON.stringify(project).length,
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = metadata;
    } else {
      projects.push(metadata);
    }

    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  }

  /**
   * 创建项目备份
   */
  async createBackup(
    projectId: string,
    name?: string,
    isAutoBackup = false,
  ): Promise<ProjectBackup | null> {
    try {
      const project = await this.loadProject(projectId);
      if (!project) {
        return null;
      }

      const backupId = this.generateId();
      const backup: ProjectBackup = {
        id: backupId,
        projectId,
        name: name || `备份_${new Date().toLocaleString()}`,
        data: { ...project },
        createdAt: new Date(),
        isAutoBackup,
      };

      const backupKey = this.BACKUP_PREFIX + backupId;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      // 清理旧备份
      if (isAutoBackup) {
        await this.cleanupOldBackups(projectId);
      }

      this.emit('backupCreated', backup);
      return backup;
    } catch (error) {
      console.error('创建备份失败:', error);
      this.emit('backupCreateError', { projectId, error });
      return null;
    }
  }

  /**
   * 获取项目备份列表
   */
  async getProjectBackups(projectId: string): Promise<ProjectBackup[]> {
    try {
      const backups: ProjectBackup[] = [];

      // 遍历所有localStorage键，查找备份
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.BACKUP_PREFIX)) {
          const dataStr = localStorage.getItem(key);
          if (dataStr) {
            const backup = JSON.parse(dataStr) as ProjectBackup;
            if (backup.projectId === projectId) {
              backups.push(backup);
            }
          }
        }
      }

      // 按创建时间排序
      return backups.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }

  /**
   * 从备份恢复项目
   */
  async restoreFromBackup(backupId: string): Promise<ProjectData | null> {
    try {
      const backupKey = this.BACKUP_PREFIX + backupId;
      const dataStr = localStorage.getItem(backupKey);

      if (!dataStr) {
        return null;
      }

      const backup = JSON.parse(dataStr) as ProjectBackup;
      const restoredProject = { ...backup.data };

      // 更新时间戳
      restoredProject.updatedAt = new Date();
      restoredProject.lastOpenedAt = new Date();

      await this.saveProject(restoredProject);

      this.emit('projectRestored', { backup, project: restoredProject });
      return restoredProject;
    } catch (error) {
      console.error('从备份恢复失败:', error);
      this.emit('restoreError', { backupId, error });
      return null;
    }
  }

  /**
   * 删除项目的所有备份
   */
  private async deleteProjectBackups(projectId: string): Promise<void> {
    const backups = await this.getProjectBackups(projectId);

    for (const backup of backups) {
      const backupKey = this.BACKUP_PREFIX + backup.id;
      localStorage.removeItem(backupKey);
    }
  }

  /**
   * 清理旧备份
   */
  private async cleanupOldBackups(projectId: string): Promise<void> {
    const backups = await this.getProjectBackups(projectId);
    const autoBackups = backups.filter((b) => b.isAutoBackup);

    if (autoBackups.length > this.config.maxBackupCount) {
      const toDelete = autoBackups.slice(this.config.maxBackupCount);

      for (const backup of toDelete) {
        const backupKey = this.BACKUP_PREFIX + backup.id;
        localStorage.removeItem(backupKey);
      }
    }
  }

  /**
   * 保存配置
   */
  private saveConfig(): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
  }

  /**
   * 加载配置
   */
  loadConfig(): ProjectStorageConfig {
    try {
      const dataStr = localStorage.getItem(this.CONFIG_KEY);
      if (dataStr) {
        this.config = { ...this.config, ...JSON.parse(dataStr) };
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
    return this.config;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ProjectStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.emit('configUpdated', this.config);
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): {
    used: number;
    total: number;
    projects: number;
    backups: number;
  } {
    let projectsSize = 0;
    let backupsSize = 0;
    let projectsCount = 0;
    let backupsCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = key.length + value.length;

        if (key.startsWith(this.PROJECT_PREFIX)) {
          projectsSize += size;
          projectsCount++;
        } else if (key.startsWith(this.BACKUP_PREFIX)) {
          backupsSize += size;
          backupsCount++;
        }
      }
    }

    // 估算localStorage总大小限制（通常为5-10MB）
    const estimatedTotal = 5 * 1024 * 1024; // 5MB

    return {
      used: projectsSize + backupsSize,
      total: estimatedTotal,
      projects: projectsCount,
      backups: backupsCount,
    };
  }

  /**
   * 清理所有项目数据
   */
  async clearAllProjects(): Promise<void> {
    try {
      const keys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(this.PROJECT_PREFIX) ||
            key.startsWith(this.BACKUP_PREFIX) ||
            key === this.PROJECTS_KEY)
        ) {
          keys.push(key);
        }
      }

      keys.forEach((key) => localStorage.removeItem(key));

      this.emit('allProjectsCleared');
    } catch (error) {
      console.error('清理项目数据失败:', error);
      throw error;
    }
  }
}
