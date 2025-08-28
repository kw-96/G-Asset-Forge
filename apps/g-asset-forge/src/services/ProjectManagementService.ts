/**
 * 项目管理服务 - 集成项目库功能
 * 负责多项目切换、标签页管理、项目状态保存和恢复
 */
import { EventEmitter } from '@g-asset-forge/common';
import {
  type GAssetForgeEditor,
  ProjectAutoSave,
  type ProjectData,
  type ProjectMetadata,
  ProjectStorageService,
} from '@g-asset-forge/core';

import { type IProjectTab } from '../components/ProjectLibraryPanel/types';

interface ProjectManagementEvents {
  projectOpened: (project: ProjectData) => void;
  projectClosed: (projectId: string) => void;
  projectSwitched: (project: ProjectData) => void;
  projectSaved: (project: ProjectData) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectDeleted: (projectId: string) => void;
  tabsChanged: (tabs: IProjectTab[]) => void;
  activeTabChanged: (tabId: string) => void;
}

/**
 * 项目管理服务类
 * 扩展现有的编辑器支持多项目切换
 */
export class ProjectManagementService extends EventEmitter<ProjectManagementEvents> {
  private storageService: ProjectStorageService;
  private autoSaveService: ProjectAutoSave | null = null;
  private editor: GAssetForgeEditor | null = null;
  private openTabs: Map<string, IProjectTab> = new Map();
  private activeTabId: string | null = null;
  private projectDataCache: Map<string, ProjectData> = new Map();

  constructor() {
    super();
    this.storageService = new ProjectStorageService();
    this.loadOpenTabs();
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;

    // 初始化自动保存服务
    if (this.autoSaveService) {
      this.autoSaveService.destroy();
    }

    this.autoSaveService = new ProjectAutoSave(editor, this.storageService);

    // 监听自动保存事件
    this.autoSaveService.on('autoSaveSuccess', (projectId) => {
      const tab = this.openTabs.get(projectId);
      if (tab) {
        tab.isDirty = false;
        this.openTabs.set(projectId, tab);
        this.emit('tabsChanged', this.getOpenTabs());
      }
    });

    this.autoSaveService.on('projectDataChanged', (projectId) => {
      const tab = this.openTabs.get(projectId);
      if (tab) {
        tab.isDirty = true;
        this.openTabs.set(projectId, tab);
        this.emit('tabsChanged', this.getOpenTabs());
      }
    });
  }

  /**
   * 获取当前打开的标签页列表
   */
  getOpenTabs(): IProjectTab[] {
    return Array.from(this.openTabs.values());
  }

  /**
   * 获取当前活动的标签页ID
   */
  getActiveTabId(): string | null {
    return this.activeTabId;
  }

  /**
   * 获取当前活动的项目数据
   */
  async getActiveProject(): Promise<ProjectData | null> {
    if (!this.activeTabId) {
      return null;
    }

    return this.getProjectData(this.activeTabId);
  }

  /**
   * 打开项目
   */
  async openProject(projectId: string): Promise<boolean> {
    try {
      // 检查项目是否已经打开
      if (this.openTabs.has(projectId)) {
        this.switchToTab(projectId);
        return true;
      }

      // 加载项目数据
      const projectData = await this.storageService.loadProject(projectId);
      if (!projectData) {
        console.error('项目不存在:', projectId);
        return false;
      }

      // 缓存项目数据
      this.projectDataCache.set(projectId, projectData);

      // 创建标签页
      const tab: IProjectTab = {
        id: projectId,
        name: projectData.name,
        filePath: `project://${projectId}`,
        isActive: false,
        isDirty: false,
        isClosable: true,
      };

      this.openTabs.set(projectId, tab);
      this.switchToTab(projectId);
      this.saveOpenTabs();

      this.emit('projectOpened', projectData);
      this.emit('tabsChanged', this.getOpenTabs());

      return true;
    } catch (error) {
      console.error('打开项目失败:', error);
      return false;
    }
  }

  /**
   * 关闭项目
   */
  async closeProject(projectId: string): Promise<boolean> {
    try {
      const tab = this.openTabs.get(projectId);
      if (!tab) {
        return false;
      }

      // 如果项目有未保存的更改，提示用户
      if (tab.isDirty) {
        const shouldSave = confirm(
          `项目 "${tab.name}" 有未保存的更改，是否保存？`,
        );
        if (shouldSave) {
          await this.saveProject(projectId);
        }
      }

      // 移除标签页
      this.openTabs.delete(projectId);
      this.projectDataCache.delete(projectId);

      // 如果关闭的是当前活动标签页，切换到其他标签页
      if (this.activeTabId === projectId) {
        const remainingTabs = this.getOpenTabs();
        if (remainingTabs.length > 0) {
          this.switchToTab(remainingTabs[0].id);
        } else {
          this.activeTabId = null;
          this.emit('activeTabChanged', '');
        }
      }

      this.saveOpenTabs();
      this.emit('projectClosed', projectId);
      this.emit('tabsChanged', this.getOpenTabs());

      return true;
    } catch (error) {
      console.error('关闭项目失败:', error);
      return false;
    }
  }

  /**
   * 切换到指定标签页
   */
  async switchToTab(tabId: string): Promise<boolean> {
    const tab = this.openTabs.get(tabId);
    if (!tab) {
      return false;
    }

    // 更新活动状态
    this.openTabs.forEach((t) => {
      t.isActive = t.id === tabId;
    });

    this.activeTabId = tabId;
    this.saveOpenTabs();

    // 更新自动保存服务的当前项目
    if (this.autoSaveService) {
      this.autoSaveService.setCurrentProject(tabId);
    }

    // 加载项目数据到编辑器
    const projectData = this.projectDataCache.get(tabId);
    if (projectData && this.editor) {
      try {
        this.editor.setContents(projectData.editorData);
      } catch (error) {
        console.error('加载项目数据到编辑器失败:', error);
      }
    }

    this.emit('activeTabChanged', tabId);
    this.emit('tabsChanged', this.getOpenTabs());

    // 触发项目切换事件
    if (projectData) {
      this.emit('projectSwitched', projectData);
    }

    return true;
  }

  /**
   * 重新排序标签页
   */
  reorderTabs(newTabs: IProjectTab[]): void {
    // 更新标签页顺序
    this.openTabs.clear();
    newTabs.forEach((tab) => {
      this.openTabs.set(tab.id, tab);
    });

    this.saveOpenTabs();
    this.emit('tabsChanged', this.getOpenTabs());
  }

  /**
   * 保存项目
   */
  async saveProject(projectId: string): Promise<boolean> {
    try {
      const projectData = this.projectDataCache.get(projectId);
      if (!projectData) {
        return false;
      }

      await this.storageService.saveProject(projectData);

      // 更新标签页状态
      const tab = this.openTabs.get(projectId);
      if (tab) {
        tab.isDirty = false;
        this.openTabs.set(projectId, tab);
        this.emit('tabsChanged', this.getOpenTabs());
      }

      this.emit('projectSaved', projectData);
      return true;
    } catch (error) {
      console.error('保存项目失败:', error);
      return false;
    }
  }

  /**
   * 标记项目为已修改
   */
  markProjectDirty(projectId: string): void {
    const tab = this.openTabs.get(projectId);
    if (tab && !tab.isDirty) {
      tab.isDirty = true;
      this.openTabs.set(projectId, tab);
      this.emit('tabsChanged', this.getOpenTabs());
    }

    // 通知自动保存服务
    if (this.autoSaveService && projectId === this.activeTabId) {
      this.autoSaveService.markDirty();
    }
  }

  /**
   * 重命名项目
   */
  async renameProject(projectId: string, newName: string): Promise<boolean> {
    try {
      const projectData = this.projectDataCache.get(projectId);
      if (!projectData) {
        return false;
      }

      // 更新项目数据
      projectData.name = newName;
      await this.storageService.saveProject(projectData);

      // 更新标签页名称
      const tab = this.openTabs.get(projectId);
      if (tab) {
        tab.name = newName;
        this.openTabs.set(projectId, tab);
        this.emit('tabsChanged', this.getOpenTabs());
      }

      this.emit('projectRenamed', projectId, newName);
      return true;
    } catch (error) {
      console.error('重命名项目失败:', error);
      return false;
    }
  }

  /**
   * 软删除项目（移动到回收站）
   */
  async softDeleteProject(projectId: string): Promise<boolean> {
    try {
      // 先关闭项目（如果已打开）
      if (this.openTabs.has(projectId)) {
        await this.closeProject(projectId);
      }

      // 使用软删除（移动到回收站）
      const success = await this.storageService.softDeleteProject(projectId);

      if (success) {
        this.emit('projectDeleted', projectId);
      }

      return success;
    } catch (error) {
      console.error('删除项目失败:', error);
      return false;
    }
  }

  /**
   * 获取项目数据
   */
  async getProjectData(projectId: string): Promise<ProjectData | null> {
    // 先从缓存获取
    let projectData = this.projectDataCache.get(projectId);

    if (!projectData) {
      // 从存储加载
      const loadedData = await this.storageService.loadProject(projectId);
      if (loadedData) {
        projectData = loadedData;
        this.projectDataCache.set(projectId, projectData);
      }
    }

    return projectData || null;
  }

  /**
   * 更新项目数据
   */
  updateProjectData(projectId: string, data: Partial<ProjectData>): void {
    const projectData = this.projectDataCache.get(projectId);
    if (projectData) {
      Object.assign(projectData, data);
      this.markProjectDirty(projectId);
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    return this.storageService.getProjectsList();
  }

  /**
   * 保存打开的标签页状态到本地存储
   */
  private saveOpenTabs(): void {
    const tabsData = {
      tabs: this.getOpenTabs(),
      activeTabId: this.activeTabId,
    };
    localStorage.setItem('g-asset-forge-open-tabs', JSON.stringify(tabsData));
  }

  /**
   * 从本地存储加载打开的标签页状态
   */
  private loadOpenTabs(): void {
    try {
      const dataStr = localStorage.getItem('g-asset-forge-open-tabs');
      if (dataStr) {
        const tabsData = JSON.parse(dataStr);

        // 恢复标签页
        if (tabsData.tabs && Array.isArray(tabsData.tabs)) {
          tabsData.tabs.forEach((tab: IProjectTab) => {
            this.openTabs.set(tab.id, tab);
          });
        }

        // 恢复活动标签页
        if (tabsData.activeTabId && this.openTabs.has(tabsData.activeTabId)) {
          this.activeTabId = tabsData.activeTabId;
        }
      }
    } catch (error) {
      console.error('加载标签页状态失败:', error);
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

    this.openTabs.clear();
    this.projectDataCache.clear();
    this.activeTabId = null;
    this.editor = null;
  }
}
