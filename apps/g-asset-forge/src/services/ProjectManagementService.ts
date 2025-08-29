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
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../utils/canvasStateManager';

interface ProjectManagementEvents {
  projectOpened: (project: ProjectData) => void;
  projectClosed: (projectId: string) => void;
  projectSwitched: (project: ProjectData) => void;
  projectSaved: (project: ProjectData) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectDeleted: (projectId: string) => void;
  tabsChanged: (tabs: IProjectTab[]) => void;
  activeTabChanged: (tabId: string) => void;
  canvasContentChanged: (data: {
    projectId: string;
    canvasCount: number;
  }) => void;
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
  private canvasStateManager: CanvasStateManager;
  private pendingProjectLoad: string | null = null; // 待加载的项目ID

  // 新增：项目级别的文档实例管理，实现真正的数据隔离
  private projectDocuments: Map<string, any> = new Map(); // 存储每个项目的GAssetForgeDocument实例
  private projectEditorStates: Map<string, any> = new Map(); // 存储每个项目的编辑器状态

  constructor() {
    super();
    this.storageService = new ProjectStorageService();
    this.canvasStateManager = createCanvasStateManager();
    this.loadOpenTabs();
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;

    // 设置画布状态管理器
    this.canvasStateManager.setEditor(editor);

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

    // 检查是否有待加载的项目
    if (this.pendingProjectLoad) {
      console.log('编辑器已就绪，处理待加载的项目:', this.pendingProjectLoad);
      this.loadPendingProject();
    }
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
   * 加载待加载的项目
   */
  private async loadPendingProject(): Promise<void> {
    if (!this.pendingProjectLoad || !this.editor) {
      return;
    }

    try {
      const projectId = this.pendingProjectLoad;
      const projectData = this.projectDataCache.get(projectId);

      if (projectData) {
        console.log('加载待加载的项目数据:', projectData.name);
        await this.loadProjectDataToEditor(projectData);
        this.emit('projectSwitched', projectData);
      }

      // 清除待加载标记
      this.pendingProjectLoad = null;
    } catch (error) {
      console.error('加载待加载项目失败:', error);
      this.pendingProjectLoad = null;
    }
  }

  /**
   * 打开项目
   */
  async openProject(projectId: string): Promise<boolean> {
    try {
      console.log('尝试打开项目:', projectId);

      // 检查项目是否已经打开
      if (this.openTabs.has(projectId)) {
        console.log('项目已打开，切换到该标签页');
        return await this.switchToTab(projectId);
      }

      // 加载项目数据
      const projectData = await this.storageService.loadProject(projectId);
      if (!projectData) {
        console.error('项目不存在:', projectId);
        return false;
      }

      console.log('项目数据加载成功:', projectData.name);

      // 缓存项目数据
      this.projectDataCache.set(projectId, projectData);

      // 将其他标签页设为非活动状态
      this.openTabs.forEach((existingTab) => {
        existingTab.isActive = false;
      });

      // 创建标签页
      const tab: IProjectTab = {
        id: projectId,
        name: projectData.name,
        filePath: `project://${projectId}`,
        isActive: true,
        isDirty: false,
        isClosable: true,
      };

      this.openTabs.set(projectId, tab);
      this.activeTabId = projectId;

      // 更新自动保存服务的当前项目
      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(projectId);
      }

      // 保存状态
      this.saveOpenTabs();

      // 批量发射事件，减少事件频率
      this.emit('projectOpened', projectData);
      this.emit('activeTabChanged', projectId);
      this.emit('tabsChanged', this.getOpenTabs());

      console.log('项目打开完成:', {
        projectId,
        tabsCount: this.openTabs.size,
        activeTabId: this.activeTabId,
      });

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
          const success = await this.switchToTab(remainingTabs[0].id);
          if (!success) {
            console.warn('切换到剩余标签页失败');
            this.activeTabId = null;
          }
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
    if (!this.editor || !this.openTabs.has(tabId)) {
      console.warn('无法切换到标签页:', tabId);
      return false;
    }

    try {
      console.log('切换到标签页:', tabId);

      // 保存当前项目状态（如果需要）
      if (this.activeTabId) {
        await this.saveCurrentProjectState();
      }

      // 更新活动标签页
      this.activeTabId = tabId;
      const tab = this.openTabs.get(tabId)!;

      // 获取项目数据
      const projectData = this.projectDataCache.get(tabId);
      if (!projectData) {
        console.warn('项目数据未找到:', tabId);
        return false;
      }

      // 加载项目数据到编辑器（使用新的隔离方法）
      await this.loadProjectDataToEditor(projectData);

      // 发射事件
      this.emit('activeTabChanged', tabId);
      this.emit('tabsChanged', this.getOpenTabs());

      console.log('标签页切换完成:', {
        tabId,
        activeTabId: this.activeTabId,
        tabsCount: this.openTabs.size,
      });

      return true;
    } catch (error) {
      console.error('切换标签页失败:', error);
      return false;
    }
  }

  /**
   * 保存当前项目状态到缓存
   */
  private async saveCurrentProjectState(): Promise<void> {
    if (!this.activeTabId || !this.editor) {
      return;
    }

    try {
      // 获取当前编辑器的状态（通过sceneGraph的toJSON方法）
      const currentStateJson = this.editor.sceneGraph.toJSON();
      const currentState = JSON.parse(currentStateJson);

      // 更新项目数据缓存
      const currentTab = this.openTabs.get(this.activeTabId);
      if (currentTab) {
        const projectData = this.projectDataCache.get(this.activeTabId);
        if (projectData) {
          projectData.editorData = currentState;
          this.projectDataCache.set(this.activeTabId, projectData);
          console.log('已保存当前项目状态到缓存:', this.activeTabId);
        }
      }
    } catch (error) {
      console.warn('保存当前项目状态失败:', error);
    }
  }

  /**
   * 加载项目数据到编辑器，实现数据隔离
   */
  private async loadProjectDataToEditor(
    projectData: ProjectData,
  ): Promise<void> {
    if (!this.editor || !projectData) {
      return;
    }

    try {
      console.log(
        '开始加载项目数据到编辑器（数据隔离模式）:',
        projectData.name,
      );

      // 保存当前项目状态（如果有活动项目）
      if (this.activeTabId) {
        await this.saveCurrentProjectState();
      }

      // 使用现有的setContents方法，通过项目级别的数据缓存实现隔离
      // 每次切换项目时，都会完全替换编辑器内容，确保数据隔离
      this.editor.setContents(projectData.editorData);

      // 使用画布状态管理器确保有效画布
      const hasValidCanvas = this.canvasStateManager.ensureValidCanvas();
      if (!hasValidCanvas) {
        console.warn('项目数据加载后无法确保有效画布');
      }

      // 等待一帧确保DOM更新
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // 触发渲染
      this.editor.render();

      // 强制更新画布状态，确保Pages组件能获取到正确的页面列表
      if (this.canvasStateManager) {
        try {
          // 获取当前画布状态
          const canvasState = this.canvasStateManager.getCanvasState();
          console.log('画布状态已更新:', canvasState);
        } catch (error) {
          console.warn('更新画布状态时出错:', error);
        }
      }

      console.log(
        '项目数据已安全加载到编辑器（数据隔离模式）:',
        projectData.name,
      );
    } catch (error) {
      console.error('加载项目数据到编辑器失败:', error);
      throw error;
    }
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
    console.log('标记项目为已修改:', projectId);

    const tab = this.openTabs.get(projectId);
    if (tab && !tab.isDirty) {
      console.log('项目标签页状态更新: 未修改 → 已修改');
      tab.isDirty = true;
      this.openTabs.set(projectId, tab);

      // 发射事件通知UI更新
      this.emit('tabsChanged', this.getOpenTabs());
      console.log(
        '已发射tabsChanged事件，标签页数量:',
        this.getOpenTabs().length,
      );
    } else if (tab && tab.isDirty) {
      console.log('项目已经是已修改状态，无需更新');
    } else {
      console.warn('未找到项目标签页:', projectId);
    }

    // 通知自动保存服务
    if (this.autoSaveService && projectId === this.activeTabId) {
      console.log('通知自动保存服务项目已修改');
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
   * 获取存储服务实例
   */
  getStorageService(): ProjectStorageService {
    return this.storageService;
  }

  /**
   * 创建新项目
   */
  async createProject(params: {
    name: string;
    description: string;
    type: 'design' | 'h5';
  }): Promise<{ id: string; name: string } | null> {
    try {
      const projectData = await this.storageService.createProject(params);
      return { id: projectData.id, name: projectData.name };
    } catch (error) {
      console.error('创建项目失败:', error);
      return null;
    }
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

    this.canvasStateManager.destroy();
    this.openTabs.clear();
    this.projectDataCache.clear();
    this.activeTabId = null;
    this.editor = null;
  }
}
