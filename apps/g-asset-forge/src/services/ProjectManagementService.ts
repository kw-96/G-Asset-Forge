/**
 * 项目管理服务
 */
import { EventEmitter } from '@g-asset-forge/common';
import {
  AutoExportService,
  EditorStateIsolator,
  type GAssetForgeEditor,
  globalProjectHandlerFactory,
  type IProjectHandler,
  ProjectAutoSave,
  type ProjectData,
  ProjectDataValidator,
  type ProjectMetadata,
  ProjectStorageService,
  ProjectType,
  type ProjectTypeIdentificationResult,
  ProjectTypeManager,
} from '@g-asset-forge/core';

interface ProjectManagementEvents {
  projectOpened: (project: ProjectData) => void;
  projectClosed: (projectId: string) => void;
  projectSaved: (project: ProjectData) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectDeleted: (projectId: string) => void;
  projectAutoExported: (project: ProjectData) => void;
  autoExportError: (projectId: string, error: any) => void;
  projectTypeChanged: (
    projectId: string,
    oldType: ProjectType | null,
    newType: ProjectType,
  ) => void;
  projectTypeIdentified: (
    projectId: string,
    result: ProjectTypeIdentificationResult,
  ) => void;
  error: (error: Error) => void;
}

export class ProjectManagementService extends EventEmitter<ProjectManagementEvents> {
  private storageService: ProjectStorageService;
  private autoSaveService: ProjectAutoSave | null = null;
  private autoExportService: AutoExportService;
  private editor: GAssetForgeEditor | null = null;
  private currentProjectId: string | null = null;
  private autoExportEnabled: boolean = true;
  private projectTypeManager: ProjectTypeManager;
  private dataValidator: ProjectDataValidator;
  private stateIsolator: EditorStateIsolator;
  private currentProjectHandler: IProjectHandler | null = null;

  constructor() {
    super();
    this.storageService = new ProjectStorageService();
    this.autoExportService = new AutoExportService();
    this.projectTypeManager = new ProjectTypeManager();
    this.dataValidator = new ProjectDataValidator();
    this.stateIsolator = new EditorStateIsolator();

    // 设置项目类型管理器事件监听
    this.setupProjectTypeManagerEvents();

    // 从 localStorage 读取自动导出设置
    this.loadAutoExportSettings();

    // 监听项目类型管理器事件
    this.setupProjectTypeManagerListeners();
  }

  /**
   * 设置项目类型管理器事件监听
   */
  private setupProjectTypeManagerListeners(): void {
    this.projectTypeManager.on('typeChanged', (oldType, newType) => {
      if (this.currentProjectId) {
        console.log('项目类型变更:', {
          projectId: this.currentProjectId,
          oldType,
          newType,
        });
        this.emit(
          'projectTypeChanged',
          this.currentProjectId,
          oldType,
          newType,
        );
      }
    });

    this.projectTypeManager.on('typeIdentified', (result) => {
      if (this.currentProjectId) {
        console.log('项目类型识别完成:', {
          projectId: this.currentProjectId,
          result,
        });
        this.emit('projectTypeIdentified', this.currentProjectId, result);
      }
    });
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor | null): void {
    console.log('ProjectManagementService.setEditor 被调用', {
      editor: !!editor,
    });

    // 如果编辑器已经设置过，先保存当前项目
    if (this.editor && this.currentProjectId) {
      console.log('编辑器重新设置，先保存当前项目:', this.currentProjectId);
      this.saveProject();
    }

    // 如果传入 null，清理编辑器状态
    if (editor === null) {
      console.log('清理编辑器状态');
      this.editor = null;
      this.autoSaveService = null;
      this.currentProjectId = null;
      console.log('编辑器状态已清理');
      return;
    }

    this.editor = editor;

    // 保存当前项目ID，用于重新设置自动保存服务
    const currentProjectId = this.currentProjectId;

    // 初始化自动保存服务
    this.autoSaveService = new ProjectAutoSave(editor, this.storageService);
    console.log('自动保存服务已初始化:', !!this.autoSaveService);

    // 如果之前有项目，重新设置项目ID
    if (currentProjectId) {
      console.log('重新设置项目ID到新的自动保存服务:', currentProjectId);
      this.autoSaveService.setCurrentProject(currentProjectId);

      // 检查是否是H5项目，如果是H5项目则延迟重新加载数据，等待H5EditorMode完成初始化
      const isH5Project = (window as any).__isH5Project;
      if (isH5Project) {
        console.log(
          '检测到H5项目，延迟数据重新加载，等待H5EditorMode完成初始化',
        );

        // 等待H5容器恢复完成后再重新加载数据
        let checkCount = 0;
        const maxChecks = 20;
        const checkInterval = 500;

        const waitForH5Restoration = () => {
          const h5ContainerRestored = (window as any).__h5ContainerRestored;
          const isH5ProjectStillActive = (window as any).__isH5Project;

          checkCount++;
          console.log(
            `ProjectManagementService: 第${checkCount}次检查H5恢复状态:`,
            {
              h5ContainerRestored,
              isH5ProjectStillActive,
              checkCount,
            },
          );

          if (h5ContainerRestored || !isH5ProjectStillActive) {
            console.log(
              'H5容器已恢复或H5项目标记已清除，现在可以安全地重新加载数据',
            );
            // 清除恢复标记
            delete (window as any).__h5ContainerRestored;
            // 重新加载数据，但不覆盖H5容器
            this.reloadCurrentProject();
          } else if (checkCount < maxChecks) {
            setTimeout(waitForH5Restoration, checkInterval);
          } else {
            console.warn('等待H5容器恢复超时，强制重新加载数据');
            this.reloadCurrentProject();
          }
        };

        // 开始等待
        setTimeout(waitForH5Restoration, checkInterval);
      } else {
        console.log('普通项目，重新加载当前项目数据到编辑器');
        // 重新加载当前项目数据到编辑器
        this.reloadCurrentProject();
      }
    }

    console.log('编辑器实例已设置');
  }

  /**
   * 重新加载当前项目数据到编辑器
   */
  private async reloadCurrentProject(): Promise<void> {
    if (!this.currentProjectId || !this.editor) {
      console.warn('reloadCurrentProject: 没有当前项目或编辑器未初始化');
      return;
    }

    try {
      console.log('重新加载当前项目数据到编辑器:', this.currentProjectId);

      // 加载项目数据
      let projectData = await this.loadProjectFromAutoExport(
        this.currentProjectId,
      );
      if (!projectData) {
        projectData = await this.storageService.loadProject(
          this.currentProjectId,
        );
        if (!projectData) {
          console.error('重新加载项目失败: 项目不存在', this.currentProjectId);
          return;
        }
      }

      console.log('重新加载项目数据成功:', projectData.name);
      console.log('编辑器数据:', projectData.editorData);

      // 设置编辑器内容
      this.editor.setContents(projectData.editorData);
      console.log('编辑器内容重新设置完成');

      // 同步项目设置到编辑器设置
      if (projectData.settings) {
        // 同步标尺设置
        if (projectData.settings.showRuler !== undefined) {
          this.editor.setting.set(
            'enableRuler',
            projectData.settings.showRuler,
          );
        }

        // 同步网格设置
        if (projectData.settings.showGrid !== undefined) {
          this.editor.setting.set(
            'enablePixelGrid',
            projectData.settings.showGrid,
          );
        }
      }

      console.log('当前项目数据重新加载完成');
    } catch (error) {
      console.error('重新加载当前项目数据失败:', error);
    }
  }

  /**
   * 创建新项目
   */
  async createProject(params: {
    name: string;
    type: 'design' | 'h5';
    settings?: any;
  }): Promise<ProjectData> {
    try {
      const projectData = await this.storageService.createProject({
        name: params.name,
        type: params.type,
        settings: params.settings,
      });

      console.log('项目创建成功:', projectData.name);
      return projectData;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  /**
   * 打开项目 - 重构版本，使用新的组件架构
   */
  async openProject(projectId: string): Promise<boolean> {
    try {
      console.log('打开项目:', projectId);

      // 加载项目数据 - 优先从自动导出的文件加载，如果文件不存在则从localStorage加载
      let projectData = await this.loadProjectFromAutoExport(projectId);
      if (!projectData) {
        // 如果自动导出文件不存在，从localStorage加载
        projectData = await this.storageService.loadProject(projectId);
        if (!projectData) {
          console.error('项目不存在:', projectId);
          return false;
        }
        console.log('从localStorage加载项目数据:', projectData.name);
      } else {
        console.log('从自动导出文件加载项目数据:', projectData.name);
      }

      console.log('项目数据加载成功:', projectData.name);
      console.log('编辑器数据:', projectData.editorData);

      // 验证项目数据
      const validationResult = await this.dataValidator.validateProjectData(
        projectData,
      );
      if (!validationResult.isValid) {
        console.warn(
          '加载的项目数据验证失败，尝试自动修复:',
          validationResult.errors,
        );

        // 尝试自动修复
        const repairResult = await this.dataValidator.repairProjectData(
          projectData as any,
        );
        if (repairResult.result.isValid) {
          console.log('项目数据已自动修复:', repairResult.result.fixedIssues);
          projectData = repairResult.data as any;

          // 保存修复后的数据
          await this.storageService.saveProject(projectData as any);
        } else {
          console.error('项目数据修复失败，可能存在兼容性问题');
          // 继续加载，但用户可能会遇到问题
        }
      } else if (validationResult.warnings.length > 0) {
        console.warn('项目数据验证警告:', validationResult.warnings);
      }

      // 先更新当前项目ID和自动保存服务，避免在设置内容时触发自动保存
      this.currentProjectId = projectId;

      // 更新自动保存服务的当前项目
      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(projectId);
      }

      // 使用项目类型管理器识别项目类型
      const typeResult = this.projectTypeManager.identifyProjectType(
        projectData as any,
        projectId,
        projectData?.name || '',
      );

      console.log('项目类型识别结果:', {
        projectId,
        type: typeResult.type,
        confidence: typeResult.confidence,
        evidence: typeResult.evidence,
      });

      // 设置当前项目类型
      this.projectTypeManager.setCurrentProjectType(projectId, typeResult.type);

      // 为了兼容现有代码，暂时保留全局标记（后续会被移除）
      if (typeResult.type === ProjectType.H5) {
        console.log('检测到H5项目，将在H5模式下打开');
        (window as any).__isH5Project = true;
        (window as any).__projectType = 'h5';
      } else {
        console.log('检测到设计项目，将在设计模式下打开');
        (window as any).__isH5Project = false;
        (window as any).__projectType = 'design';
      }

      // 根据项目类型进行状态隔离处理
      if (this.editor) {
        console.log(
          '开始设置编辑器内容，项目类型:',
          (window as any).__projectType,
        );

        // 清理现有状态，确保模式切换时状态干净
        this.clearEditorState();

        // 设置编辑器内容
        this.editor.setContents(projectData?.editorData as any);
        console.log('编辑器内容设置完成');

        // 同步项目设置到编辑器设置
        if (projectData?.settings) {
          // 同步标尺设置
          if (projectData.settings.showRuler !== undefined) {
            this.editor.setting.set(
              'enableRuler',
              projectData.settings.showRuler,
            );
          }

          // 同步网格设置
          if (projectData.settings.showGrid !== undefined) {
            this.editor.setting.set(
              'enablePixelGrid',
              projectData.settings.showGrid,
            );
          }

          // 触发重新渲染以应用设置
          this.editor.render();
        }
      }

      // 发射事件
      this.emit('projectOpened', projectData as any);

      console.log('项目打开完成:', projectId);
      return true;
    } catch (error) {
      console.error('打开项目失败:', error);
      return false;
    }
  }

  /**
   * 清理编辑器状态，确保模式切换时状态干净
   */
  private clearEditorState(): void {
    if (!this.editor) return;

    try {
      console.log('清理编辑器状态，准备模式切换');

      // 清理画布上的所有元素
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (currentCanvas) {
        const children = currentCanvas.getChildren();
        children.forEach((child) => {
          currentCanvas.removeChild(child);
        });
        console.log('画布已清理，移除了', children.length, '个元素');
      }

      // 清理选择状态
      if (this.editor.selectedElements) {
        this.editor.selectedElements.clear();
        console.log('选择状态已清理');
      }

      // 重置视口到默认状态
      // if (this.editor.viewportManager) {
      //   this.editor.viewportManager.setViewportSize({
      //     width: 800,
      //     height: 600,
      //   });
      //   this.editor.viewportManager.setZoom(1, { x: 0, y: 0 });
      //   console.log('视口已重置');
      // }

      // 清理命令历史（如果存在clear方法）
      if (
        this.editor.commandManager &&
        typeof (this.editor.commandManager as any).clear === 'function'
      ) {
        (this.editor.commandManager as any).clear();
        console.log('命令历史已清理');
      }

      console.log('编辑器状态清理完成');
    } catch (error) {
      console.warn('清理编辑器状态时出错:', error);
    }
  }

  /**
   * 获取项目类型管理器
   */
  getProjectTypeManager(): ProjectTypeManager {
    return this.projectTypeManager;
  }

  /**
   * 获取当前项目类型
   */
  getCurrentProjectType(): ProjectType | null {
    return this.projectTypeManager.getCurrentProjectType();
  }

  /**
   * 检查当前项目是否为H5项目
   */
  isCurrentProjectH5(): boolean {
    return this.projectTypeManager.isH5Project();
  }

  /**
   * 检查当前项目是否为设计项目
   */
  isCurrentProjectDesign(): boolean {
    return this.projectTypeManager.isDesignProject();
  }

  /**
   * 获取项目类型（兼容方法，使用新的项目类型管理器）
   */
  getProjectType(projectId: string, projectData?: any): ProjectType | null {
    return this.projectTypeManager.getProjectType(projectId, projectData);
  }

  /**
   * 验证项目类型
   */
  validateProjectType(
    projectId: string,
    expectedType: ProjectType,
    projectData?: any,
  ): boolean {
    return this.projectTypeManager.validateProjectType(
      projectId,
      expectedType,
      projectData,
    );
  }

  /**
   * 重命名项目
   */
  async renameProject(projectId: string, newName: string): Promise<boolean> {
    try {
      const projectData = await this.storageService.loadProject(projectId);
      if (!projectData) {
        return false;
      }

      projectData.name = newName;
      projectData.updatedAt = new Date();

      await this.storageService.saveProject(projectData);

      console.log('项目重命名成功:', newName);
      this.emit('projectRenamed', projectId, newName);
      return true;
    } catch (error) {
      console.error('重命名项目失败:', error);
      return false;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      // 先获取项目数据，用于删除自动导出的文件
      const projectData = await this.storageService.loadProject(projectId);

      // 删除localStorage中的数据
      await this.storageService.softDeleteProject(projectId);

      // 删除自动导出的文件
      if (projectData) {
        try {
          const filename =
            this.autoExportService.generateAutoExportFilename(projectData);
          await this.autoExportService.deleteExportedFile(filename);
          console.log('已删除自动导出文件:', filename);
        } catch (error) {
          console.warn('删除自动导出文件失败:', error);
        }
      }

      // 如果删除的是当前项目，清空编辑器
      if (this.currentProjectId === projectId) {
        this.currentProjectId = null;
        if (this.editor) {
          // 清空编辑器内容 - 直接清空所有画布，不创建新的
          this.editor.doc.clear();
          // 不需要设置 paperId，因为编辑器已经清空
        }
      }

      console.log('项目删除成功:', projectId);
      this.emit('projectDeleted', projectId);
      return true;
    } catch (error) {
      console.error('删除项目失败:', error);
      return false;
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectsList(): Promise<ProjectMetadata[]> {
    try {
      return await this.storageService.getProjectsList();
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 获取当前项目数据
   */
  async getCurrentProject(): Promise<ProjectData | null> {
    if (!this.currentProjectId) {
      return null;
    }

    try {
      return await this.storageService.loadProject(this.currentProjectId);
    } catch (error) {
      console.error('获取当前项目失败:', error);
      return null;
    }
  }

  /**
   * 关闭当前项目
   */
  closeProject(projectId: string): void {
    if (this.currentProjectId === projectId) {
      console.log('关闭项目:', projectId);

      // 先保存项目（如果有未保存的更改）
      if (this.autoSaveService) {
        this.autoSaveService.manualSave();
      }

      // 同步自动导出设置（确保获取最新状态）
      this.syncAutoExportSettings();

      // 如果启用了自动导出，则自动导出GAF文件到本地
      if (this.autoExportEnabled) {
        console.log('关闭项目时触发自动导出...');
        this.triggerAutoExport();
      } else {
        console.log('自动导出未启用，跳过自动导出');
      }

      this.emit('projectClosed', projectId);

      // 先清空自动保存服务，避免setContents触发自动保存
      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(null);
      }

      // 清空编辑器内容 - 直接清空所有画布，不创建新的
      if (this.editor) {
        this.editor.doc.clear();
        // 不需要设置 paperId，因为编辑器已经清空
      }

      // 最后清空当前项目ID
      this.currentProjectId = null;

      // 重置项目类型管理器
      this.projectTypeManager.resetCurrentProject();

      // 清理全局状态
      if (typeof window !== 'undefined') {
        // 清理全局编辑器实例
        (window as any).editor = null;
        // 清理全局项目管理服务引用
        (window as any).__PROJECT_MANAGEMENT_SERVICE__ = null;
        // 清理项目类型标记（兼容性，后续会移除）
        delete (window as any).__isH5Project;
        delete (window as any).__projectType;
      }
    }
  }

  /**
   * 手动保存当前项目（用于关闭项目时）
   */
  async manualSave(): Promise<boolean> {
    if (this.autoSaveService) {
      return await this.autoSaveService.manualSave();
    } else {
      console.error('自动保存服务未初始化');
      return false;
    }
  }

  /**
   * 测试自动保存功能
   */
  testAutoSave(): void {
    if (this.autoSaveService) {
      this.autoSaveService.testAutoSave();
    } else {
      console.error('自动保存服务未初始化');
    }
  }

  /**
   * 从 localStorage 加载自动导出设置
   */
  private loadAutoExportSettings(): void {
    try {
      const saved = localStorage.getItem('autoExportEnabled');
      if (saved !== null) {
        this.autoExportEnabled = JSON.parse(saved);
        console.log('已加载自动导出设置:', this.autoExportEnabled);
      }
    } catch (error) {
      console.warn('加载自动导出设置失败:', error);
      this.autoExportEnabled = false;
    }
  }

  /**
   * 启用自动导出
   */
  enableAutoExport(): void {
    this.autoExportEnabled = true;
    // 同步到 localStorage
    localStorage.setItem('autoExportEnabled', JSON.stringify(true));
    console.log('自动导出已启用');
  }

  /**
   * 禁用自动导出
   */
  disableAutoExport(): void {
    this.autoExportEnabled = false;
    // 同步到 localStorage
    localStorage.setItem('autoExportEnabled', JSON.stringify(false));
    console.log('自动导出已禁用');
  }

  /**
   * 检查自动导出是否启用
   */
  isAutoExportEnabled(): boolean {
    return this.autoExportEnabled;
  }

  /**
   * 同步自动导出设置（从 localStorage 重新加载）
   */
  syncAutoExportSettings(): void {
    this.loadAutoExportSettings();
  }

  /**
   * 从自动导出文件加载项目数据
   * @param projectId 项目ID
   * @returns Promise<ProjectData | null> 项目数据
   */
  private async loadProjectFromAutoExport(
    projectId: string,
  ): Promise<ProjectData | null> {
    try {
      // 先从localStorage获取项目元数据
      const projectMetadata = await this.storageService.loadProject(projectId);
      if (!projectMetadata) {
        return null;
      }

      // 生成自动导出文件名
      const filename =
        this.autoExportService.generateAutoExportFilename(projectMetadata);

      // 尝试从自动导出文件加载数据
      const fileData = await this.autoExportService.loadExportedFile(filename);
      if (fileData) {
        console.log('从自动导出文件加载数据成功:', filename);
        return fileData;
      }

      return null;
    } catch (error) {
      console.warn('从自动导出文件加载数据失败:', error);
      return null;
    }
  }

  /**
   * 手动触发自动导出
   */
  async triggerAutoExport(): Promise<boolean> {
    if (!this.currentProjectId) {
      console.warn('没有当前项目，无法进行自动导出');
      return false;
    }

    try {
      const projectData = await this.getCurrentProject();
      if (!projectData) {
        console.error('无法获取当前项目数据');
        return false;
      }

      // 检查自动导出的保存方式
      const saveMethod = this.autoExportService.getAutoExportSaveMethod();
      console.log('自动导出保存方式:', saveMethod.description);

      if (saveMethod.warning) {
        console.warn('自动导出警告:', saveMethod.warning);
        // 可以在这里添加用户通知逻辑
      }

      const success = await this.autoExportService.autoExportProject(
        projectData,
      );
      if (success) {
        this.emit('projectAutoExported', projectData);
        console.log('项目自动导出成功:', projectData.name);

        // 如果使用了非最优的保存方式，可以通知用户
        if (!saveMethod.isOptimal) {
          console.warn('自动导出使用了非最优的保存方式，建议检查设置');
        }
      } else {
        this.emit(
          'autoExportError',
          this.currentProjectId,
          new Error('自动导出失败'),
        );
      }

      return success;
    } catch (error) {
      console.error('自动导出失败:', error);
      this.emit('autoExportError', this.currentProjectId, error);
      return false;
    }
  }

  /**
   * 获取自动导出服务信息
   */
  getAutoExportInfo(): {
    isSupported: boolean;
    method: 'electron' | 'directory' | 'download';
    description: string;
    isOptimal: boolean;
    browserInfo: any;
  } {
    const methodInfo = this.autoExportService.getExportMethodInfo();
    const browserInfo = this.autoExportService.getBrowserCompatibilityInfo();

    return {
      isSupported: this.autoExportService.isAutoExportSupported(),
      method: methodInfo.method,
      description: methodInfo.description,
      isOptimal: methodInfo.isOptimal,
      browserInfo,
    };
  }

  /**
   * 请求文件系统权限（仅 Chrome/Edge 需要）
   */
  async requestFileSystemPermission(): Promise<boolean> {
    return this.autoExportService.requestFileSystemPermission();
  }

  /**
   * 重写保存项目方法，集成自动导出
   */
  async saveProject(): Promise<boolean> {
    if (!this.currentProjectId || !this.editor) {
      console.warn('没有当前项目或编辑器实例');
      return false;
    }

    try {
      // 获取当前编辑器数据
      const editorData = this.editor.sceneGraph.toJSON();
      console.log('保存编辑器数据:', editorData);

      // 加载项目数据
      const projectData = await this.storageService.loadProject(
        this.currentProjectId,
      );
      if (!projectData) {
        console.error('项目不存在:', this.currentProjectId);
        return false;
      }

      // 更新编辑器数据 - 直接使用解析后的数据
      projectData.editorData = JSON.parse(editorData);
      projectData.updatedAt = new Date();

      console.log('更新后的项目数据:', projectData);

      // 同步编辑器设置到项目设置
      if (projectData.settings) {
        // 同步标尺设置
        projectData.settings.showRuler = this.editor.setting.get('enableRuler');

        // 同步网格设置
        projectData.settings.showGrid =
          this.editor.setting.get('enablePixelGrid');
      }

      // 验证项目数据
      const validationResult = await this.dataValidator.validateProjectData(
        projectData,
      );
      if (!validationResult.isValid) {
        console.warn(
          '项目数据验证失败，尝试自动修复:',
          validationResult.errors,
        );

        // 尝试自动修复
        const repairResult = await this.dataValidator.repairProjectData(
          projectData as any,
        );
        if (repairResult.result.isValid) {
          console.log('项目数据已自动修复:', repairResult.result.fixedIssues);
          Object.assign(projectData, repairResult.data as any);
        } else {
          console.error('项目数据修复失败，仍然保存但可能存在问题');
        }
      }

      // 保存项目
      await this.storageService.saveProject(projectData);

      console.log('项目保存成功:', projectData.name);
      this.emit('projectSaved', projectData);

      // 如果启用了自动导出，则触发自动导出
      if (this.autoExportEnabled) {
        console.log('触发自动导出...');
        await this.triggerAutoExport();
      }

      return true;
    } catch (error) {
      console.error('保存项目失败:', error);
      return false;
    }
  }

  /**
   * 设置项目类型管理器事件监听
   */
  private setupProjectTypeManagerEvents(): void {
    this.projectTypeManager.on('typeChanged', (oldType, newType) => {
      console.log(`项目类型变更: 从 ${oldType} 变为 ${newType}`);
      if (this.currentProjectId) {
        this.emit(
          'projectTypeChanged',
          this.currentProjectId,
          oldType,
          newType,
        );
      }
    });

    this.projectTypeManager.on('typeIdentified', (result) => {
      console.log(`项目类型识别完成:`, result);
      if (this.currentProjectId) {
        this.emit('projectTypeIdentified', this.currentProjectId, result);
      }
    });
  }

  /**
   * 初始化项目处理器
   */
  private async initializeProjectHandler(
    projectType: ProjectType,
    projectData: ProjectData,
  ): Promise<IProjectHandler | null> {
    try {
      if (!this.editor) {
        throw new Error('编辑器实例不存在');
      }

      // 清理当前项目处理器
      if (this.currentProjectHandler) {
        await this.currentProjectHandler.cleanup();
        await this.currentProjectHandler.destroy();
        this.currentProjectHandler = null;
      }

      // 创建新的项目处理器
      const handler = globalProjectHandlerFactory.createHandler(projectType);
      if (!handler) {
        throw new Error(`无法创建项目处理器: ${projectType}`);
      }

      // 初始化项目处理器
      const initializedHandler = await handler;
      await initializedHandler.initialize(this.editor);

      // 加载项目数据
      const success = await initializedHandler.loadProjectData(
        projectData as any,
      );
      if (!success) {
        throw new Error('项目数据加载失败');
      }

      this.currentProjectHandler = initializedHandler;
      console.log(`项目处理器初始化成功: ${projectType}`);

      return initializedHandler;
    } catch (error) {
      console.error('项目处理器初始化失败:', error);
      return null;
    }
  }

  /**
   * 切换项目类型
   */
  private async switchProjectType(
    projectId: string,
    newType: ProjectType,
    projectData: ProjectData,
  ): Promise<boolean> {
    try {
      if (!this.editor) {
        throw new Error('编辑器实例不存在');
      }

      console.log(`切换项目类型: ${projectId} -> ${newType}`);

      // 保存当前状态
      if (this.currentProjectHandler) {
        const currentState = this.currentProjectHandler.getProjectState();
        if (currentState) {
          console.log('保存当前项目状态');
        }
      }

      // 使用状态隔离器切换项目类型
      // await this.stateIsolator.switchProjectType(
      //   this.editor,
      //   newType,
      //   projectData,
      // );

      // 初始化新的项目处理器
      const handler = await this.initializeProjectHandler(newType, projectData);
      if (!handler) {
        throw new Error('项目处理器初始化失败');
      }

      // 更新项目类型管理器
      this.projectTypeManager.setCurrentProjectType(projectId, newType);

      console.log(`项目类型切换成功: ${newType}`);
      return true;
    } catch (error) {
      console.error('项目类型切换失败:', error);
      return false;
    }
  }

  /**
   * 验证项目状态一致性
   */
  private async validateProjectState(): Promise<boolean> {
    try {
      if (!this.currentProjectHandler || !this.currentProjectId) {
        return true; // 没有当前项目时认为是一致的
      }

      // 验证项目处理器状态
      const handlerState = this.currentProjectHandler.getState();
      if (handlerState === 'error' || handlerState === 'destroyed') {
        console.error('项目处理器状态异常:', handlerState);
        return false;
      }

      // 验证状态管理器
      // const stateManager = this.currentProjectHandler.getStateManager();
      // if (stateManager) {
      //   const isValid = stateManager.validateState();
      //   if (!isValid) {
      //     console.error('项目状态验证失败');
      //     return false;
      //   }
      // }

      return true;
    } catch (error) {
      console.error('项目状态验证异常:', error);
      return false;
    }
  }

  /**
   * 处理项目打开错误
   */
  private async handleProjectOpenError(
    projectId: string,
    error: Error,
  ): Promise<void> {
    console.error(`项目打开失败: ${projectId}`, error);

    // 清理状态
    if (this.currentProjectHandler) {
      try {
        await this.currentProjectHandler.cleanup();
        await this.currentProjectHandler.destroy();
      } catch (cleanupError) {
        console.error('清理项目处理器失败:', cleanupError);
      }
      this.currentProjectHandler = null;
    }

    // 重置当前项目ID
    this.currentProjectId = null;

    // 清理状态隔离器
    if (this.editor) {
      try {
        // await this.stateIsolator.cleanup(this.editor);
      } catch (cleanupError) {
        console.error('清理状态隔离器失败:', cleanupError);
      }
    }

    // 发出错误事件
    this.emit('error', error);
  }

  /**
   * 销毁服务
   */
  async destroy(): Promise<void> {
    try {
      // 保存当前项目（使用手动保存，只在有未保存更改时才保存）
      if (this.currentProjectId) {
        this.manualSave();
      }

      // 清理当前项目处理器
      if (this.currentProjectHandler) {
        await this.currentProjectHandler.cleanup();
        await this.currentProjectHandler.destroy();
        this.currentProjectHandler = null;
      }

      // 清理状态隔离器
      if (this.editor) {
        // await this.stateIsolator.cleanup(this.editor);
      }

      // 清理项目类型管理器
      this.projectTypeManager.destroy();

      // 清理资源
      this.autoSaveService = null;
      this.editor = null;
      this.currentProjectId = null;

      console.log('项目管理服务已销毁');
    } catch (error) {
      console.error('销毁项目管理服务时发生错误:', error);
    }
  }
}

export default ProjectManagementService;
