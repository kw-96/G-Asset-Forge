// H5编辑器管理器 - 负责H5编辑器模式的整体管理和协调
import { H5Editor, type IH5EditorOptions, type IH5Page } from './h5-editor';
import { EventEmitter } from '../utils/event-emitter';
import { BackgroundManager, type IBackgroundSettings, type IBackgroundPreset } from '../background/BackgroundManager';
import { ImageExportEngine, type IImageExportOptions, type IImageExportResult } from '../export/ImageExportEngine';

export interface IH5EditorManagerOptions {
  enableSuikaIntegration?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  maxUndoSteps?: number;
  performanceMonitoring?: boolean;
}

export interface IH5EditorManagerEvents extends Record<string, (...args: any[]) => void> {
  modeChange(mode: 'h5' | 'suika'): void;
  editorReady(editor: H5Editor): void;
  editorDestroyed(): void;
  projectLoad(project: any): void;
  projectSave(project: any): void;
  performanceWarning(info: any): void;
  error(error: Error): void;
}

export interface IH5Project {
  id: string;
  name: string;
  description?: string;
  pages: IH5Page[];
  settings: {
    defaultCanvasSize: { width: number; height: number };
    mode: 'mobile' | 'desktop';
    theme: 'light' | 'dark';
    gridEnabled: boolean;
    snapToGrid: boolean;
  };
  metadata: {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    author: string;
    tags: string[];
  };
}

/**
 * H5编辑器管理器
 * 负责H5编辑器的生命周期管理、模式切换、项目管理等功能
 */
export class H5EditorManager {
  private editor: H5Editor | null = null;
  private emitter = new EventEmitter<IH5EditorManagerEvents>();
  private options: IH5EditorManagerOptions;
  private currentMode: 'h5' | 'suika' = 'h5';
  private currentProject: IH5Project | null = null;
  private undoStack: any[] = [];
  private redoStack: any[] = [];
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private performanceMonitor: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private backgroundManager: BackgroundManager | null = null;
  private imageExportEngine: ImageExportEngine | null = null;

  constructor(options: IH5EditorManagerOptions = {}) {
    this.options = {
      enableSuikaIntegration: true,
      enableAutoSave: true,
      autoSaveInterval: 30000, // 30秒
      maxUndoSteps: 50,
      performanceMonitoring: true,
      ...options
    };

    this.initializePerformanceMonitoring();
    this.initializeBackgroundManager();
    this.initializeImageExportEngine();
  }

  /**
   * 初始化背景管理器
   */
  private initializeBackgroundManager(): void {
    this.backgroundManager = new BackgroundManager();
    
    // 绑定背景变更事件
    this.backgroundManager.on('backgroundChange', (background) => {
      if (this.editor) {
        this.editor.setPageBackground(background);
        this.pushUndoState(this.editor.exportAllPagesData());
      }
    });

    this.backgroundManager.on('error', (error) => {
      console.error('Background manager error:', error);
      this.emitter.emit('error', error);
    });
  }

  /**
   * 初始化图片导出引擎
   */
  private initializeImageExportEngine(): void {
    this.imageExportEngine = new ImageExportEngine();
    
    // 绑定导出事件
    this.imageExportEngine.on('exportStart', (options) => {
      console.log('开始导出图片:', options);
    });

    this.imageExportEngine.on('exportComplete', (result) => {
      console.log('图片导出完成:', result);
    });

    this.imageExportEngine.on('exportError', (error) => {
      console.error('图片导出错误:', error);
      this.emitter.emit('error', error);
    });

    this.imageExportEngine.on('exportWarning', (warning) => {
      console.warn('图片导出警告:', warning);
    });
  }

  /**
   * 初始化H5编辑器
   */
  async initializeH5Editor(_container: HTMLElement, editorOptions: IH5EditorOptions): Promise<H5Editor> {
    try {
      if (this.editor) {
        this.destroyCurrentEditor();
      }

      this.editor = new H5Editor(editorOptions);
      this.currentMode = 'h5';

      // 绑定编辑器事件
      this.bindEditorEvents();

      // 启动自动保存
      if (this.options.enableAutoSave) {
        this.startAutoSave();
      }

      this.emitter.emit('editorReady', this.editor);
      this.emitter.emit('modeChange', 'h5');

      console.log('H5Editor initialized successfully');
      return this.editor;
    } catch (error) {
      console.error('Failed to initialize H5Editor:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 切换到Suika模式（与Suika画布系统协同工作）
   */
  async switchToSuikaMode(): Promise<void> {
    if (!this.options.enableSuikaIntegration) {
      throw new Error('Suika integration is not enabled');
    }

    try {
      // 保存当前H5编辑器状态
      if (this.editor && this.currentProject) {
        await this.saveCurrentProject();
      }

      // 销毁H5编辑器
      this.destroyCurrentEditor();

      this.currentMode = 'suika';
      this.emitter.emit('modeChange', 'suika');

      console.log('切换到Suika模式成功');
    } catch (error) {
      console.error('切换到Suika模式失败:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 切换回H5模式
   */
  async switchToH5Mode(container: HTMLElement, editorOptions: IH5EditorOptions): Promise<H5Editor> {
    try {
      if (this.currentMode === 'h5' && this.editor) {
        console.log('已经在H5模式，返回现有编辑器');
        return this.editor;
      }

      console.log('切换到H5编辑器模式');
      return await this.initializeH5Editor(container, editorOptions);
    } catch (error) {
      console.error('切换到H5模式失败:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 进入H5编辑器模式
   */
  async enterH5Mode(container: HTMLElement, editorOptions: IH5EditorOptions): Promise<H5Editor> {
    return await this.switchToH5Mode(container, editorOptions);
  }

  /**
   * 退出H5��辑器模式
   */
  async exitH5Mode(): Promise<void> {
    if (this.currentMode === 'h5') {
      await this.switchToSuikaMode();
    }
  }

  /**
   * 自定义画布尺寸设置
   */
  setCustomCanvasSize(width: number, height: number): void {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      this.editor.setCanvasSize(width, height);
      
      // 更新当前项目设置
      if (this.currentProject) {
        this.currentProject.settings.defaultCanvasSize = { width, height };
        this.currentProject.metadata.updatedAt = new Date();
      }

      console.log(`画布尺寸已设置为: ${width}x${height}`);
    } catch (error) {
      console.error('设置画布尺寸失败:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 获取当前画布尺寸
   */
  getCurrentCanvasSize(): { width: number; height: number } {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    const currentPage = this.editor.getCurrentPage();
    if (currentPage) {
      return { width: currentPage.width, height: currentPage.height };
    }

    return this.currentProject?.settings.defaultCanvasSize || { width: 375, height: 667 };
  }

  /**
   * 设置预设画布尺寸
   */
  setPresetCanvasSize(preset: 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape' | 'desktop' | 'custom', customSize?: { width: number; height: number }): void {
    let size: { width: number; height: number };

    switch (preset) {
      case 'mobile-portrait':
        size = { width: 375, height: 667 };
        break;
      case 'mobile-landscape':
        size = { width: 667, height: 375 };
        break;
      case 'tablet-portrait':
        size = { width: 768, height: 1024 };
        break;
      case 'tablet-landscape':
        size = { width: 1024, height: 768 };
        break;
      case 'desktop':
        size = { width: 1200, height: 800 };
        break;
      case 'custom':
        if (!customSize) {
          throw new Error('自定义尺寸需要提供width和height参数');
        }
        size = customSize;
        break;
      default:
        throw new Error(`不支持的预设尺寸: ${preset}`);
    }

    this.setCustomCanvasSize(size.width, size.height);
  }

  /**
   * 获取可用的预设尺寸
   */
  getAvailablePresets(): Array<{ id: string; name: string; width: number; height: number; category: string }> {
    return [
      { id: 'mobile-portrait', name: '手机竖屏', width: 375, height: 667, category: '移动端' },
      { id: 'mobile-landscape', name: '手机横屏', width: 667, height: 375, category: '移动端' },
      { id: 'tablet-portrait', name: '平板竖屏', width: 768, height: 1024, category: '平板' },
      { id: 'tablet-landscape', name: '平板横屏', width: 1024, height: 768, category: '平板' },
      { id: 'desktop', name: '桌面端', width: 1200, height: 800, category: '桌面' },
      { id: 'iphone-x', name: 'iPhone X', width: 375, height: 812, category: '移动端' },
      { id: 'iphone-plus', name: 'iPhone Plus', width: 414, height: 736, category: '移动端' },
      { id: 'ipad', name: 'iPad', width: 768, height: 1024, category: '平板' },
      { id: 'ipad-pro', name: 'iPad Pro', width: 1024, height: 1366, category: '平板' },
      { id: 'android-phone', name: 'Android 手机', width: 360, height: 640, category: '移动端' },
      { id: 'wechat-mini', name: '微信小程序', width: 375, height: 667, category: '小程序' },
      { id: 'h5-banner', name: 'H5横幅', width: 750, height: 300, category: 'H5' },
      { id: 'square', name: '正方形', width: 500, height: 500, category: '通用' },
      { id: 'poster', name: '海报', width: 750, height: 1334, category: '设计' },
      { id: 'card', name: '卡片', width: 400, height: 600, category: '设计' }
    ];
  }

  /**
   * 项目管理
   */
  createNewProject(name: string, options?: Partial<IH5Project>): IH5Project {
    const project: IH5Project = {
      id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      description: options?.description || '',
      pages: options?.pages || [],
      settings: {
        defaultCanvasSize: { width: 375, height: 667 },
        mode: 'mobile',
        theme: 'light',
        gridEnabled: true,
        snapToGrid: true,
        ...options?.settings
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'User',
        tags: [],
        ...options?.metadata
      }
    };

    this.currentProject = project;
    this.clearUndoRedoStack();

    // 如果没有页面，创建默认页面
    if (project.pages.length === 0) {
      const defaultPage: IH5Page = {
        id: 'page_' + Date.now(),
        name: '页面1',
        width: project.settings.defaultCanvasSize.width,
        height: project.settings.defaultCanvasSize.height,
        background: { type: 'color', value: '#ffffff' },
        components: []
      };
      project.pages.push(defaultPage);
    }

    this.emitter.emit('projectLoad', project);
    return project;
  }

  async loadProject(projectData: IH5Project): Promise<void> {
    try {
      this.currentProject = {
        ...projectData,
        metadata: {
          ...projectData.metadata,
          updatedAt: new Date()
        }
      };

      // 如果有编辑器实例，加载项目数据
      if (this.editor) {
        // 清空现有页面
        const currentPages = this.editor.getAllPages();
        currentPages.forEach(page => {
          this.editor!.deletePage(page.id);
        });

        // 加载项目页面
        projectData.pages.forEach(page => {
          const newPage = this.editor!.createPage(page.name, page);
          if (projectData.pages[0] && projectData.pages[0].id === page.id) {
            this.editor!.setCurrentPage(newPage.id);
          }
        });
      }

      this.clearUndoRedoStack();
      this.emitter.emit('projectLoad', this.currentProject);

      console.log('Project loaded successfully:', projectData.name);
    } catch (error) {
      console.error('Failed to load project:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  async saveCurrentProject(): Promise<IH5Project | null> {
    if (!this.currentProject || !this.editor) {
      return null;
    }

    try {
      // 更新项目数据
      this.currentProject.pages = this.editor.getAllPages();
      this.currentProject.metadata.updatedAt = new Date();

      this.emitter.emit('projectSave', this.currentProject);

      console.log('Project saved successfully:', this.currentProject.name);
      return this.currentProject;
    } catch (error) {
      console.error('Failed to save project:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 实时预览功能
   */
  enableRealTimePreview(): void {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      this.editor.togglePreview(true);
      console.log('实时预览已启用');
    } catch (error) {
      console.error('启用实时预览失败:', error);
      this.emitter.emit('error', error as Error);
    }
  }

  disableRealTimePreview(): void {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      this.editor.togglePreview(false);
      console.log('实时预览已禁用');
    } catch (error) {
      console.error('禁用实时预览失败:', error);
      this.emitter.emit('error', error as Error);
    }
  }

  /**
   * 获取实时预览数据URL
   */
  getRealTimePreviewUrl(): string {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      return this.editor.getPreviewDataUrl();
    } catch (error) {
      console.error('获取实时预览失败:', error);
      return '';
    }
  }

  /**
   * 更新实时预览
   */
  updateRealTimePreview(): void {
    if (!this.editor) {
      return;
    }

    try {
      this.editor.updatePreview();
    } catch (error) {
      console.error('更新实时预览失败:', error);
    }
  }

  /**
   * 获取最终效果预览
   */
  getFinalEffectPreview(options?: { 
    format?: 'png' | 'jpg'; 
    quality?: number; 
    scale?: number;
    includeBackground?: boolean;
  }): string {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      const {
        format = 'png',
        quality = 1,
        scale = 1
      } = options || {};

      return this.editor.exportAsImage(format, quality, scale);
    } catch (error) {
      console.error('获取最终效果预览失败:', error);
      this.emitter.emit('error', error as Error);
      return '';
    }
  }

  /**
   * 设置预览更新回调
   */
  setPreviewUpdateCallback(callback: (previewUrl: string) => void): void {
    if (this.editor) {
      this.editor.on('previewUpdate', callback);
    }
  }

  /**
   * 撤销重做功能
   */
  pushUndoState(state: any): void {
    if (this.undoStack.length >= (this.options.maxUndoSteps || 50)) {
      this.undoStack.shift();
    }
    this.undoStack.push(JSON.parse(JSON.stringify(state)));
    this.redoStack = []; // 清空重做栈
  }

  undo(): boolean {
    if (this.undoStack.length === 0 || !this.editor) return false;

    try {
      // 保存当前状态到重做栈
      const currentState = this.editor.exportAllPagesData();
      this.redoStack.push(currentState);

      // 恢复上一个状态
      const previousState = this.undoStack.pop();
      if (previousState) {
        this.restoreEditorState(previousState);
        return true;
      }
    } catch (error) {
      console.error('Undo failed:', error);
    }

    return false;
  }

  redo(): boolean {
    if (this.redoStack.length === 0 || !this.editor) return false;

    try {
      // 保存当前状态到撤销栈
      const currentState = this.editor.exportAllPagesData();
      this.undoStack.push(currentState);

      // 恢复重做状态
      const nextState = this.redoStack.pop();
      if (nextState) {
        this.restoreEditorState(nextState);
        return true;
      }
    } catch (error) {
      console.error('Redo failed:', error);
    }

    return false;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private restoreEditorState(state: IH5Page[]): void {
    if (!this.editor) return;

    // 清空现有页面
    const currentPages = this.editor.getAllPages();
    currentPages.forEach(page => {
      this.editor!.deletePage(page.id);
    });

    // 恢复页面
    state.forEach((page, index) => {
      const newPage = this.editor!.createPage(page.name, page);
      if (index === 0) {
        this.editor!.setCurrentPage(newPage.id);
      }
    });
  }

  private clearUndoRedoStack(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * 自动保存
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      if (this.currentProject && this.editor) {
        try {
          await this.saveCurrentProject();
          console.log('Auto-save completed');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, this.options.autoSaveInterval || 30000);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (!this.options.performanceMonitoring) return;

    this.performanceMonitor = setInterval(() => {
      if (this.editor) {
        const perfInfo = this.editor.getPerformanceInfo();
        
        // 检查性能警告条件
        if (perfInfo.componentsCount > 1000) {
          this.emitter.emit('performanceWarning', {
            type: 'high_component_count',
            message: `组件数量过多: ${perfInfo.componentsCount}`,
            data: perfInfo
          });
        }

        const memoryMB = parseInt(perfInfo.memoryUsage);
        if (memoryMB > 100) {
          this.emitter.emit('performanceWarning', {
            type: 'high_memory_usage',
            message: `内存使用过高: ${perfInfo.memoryUsage}`,
            data: perfInfo
          });
        }
      }
    }, 10000); // 每10秒检查一次
  }

  private stopPerformanceMonitoring(): void {
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = null;
    }
  }

  /**
   * 事件绑定
   */
  private bindEditorEvents(): void {
    if (!this.editor) return;

    this.editor.on('componentAdd', (_component) => {
      this.pushUndoState(this.editor!.exportAllPagesData());
    });

    this.editor.on('componentUpdate', (_component) => {
      this.pushUndoState(this.editor!.exportAllPagesData());
    });

    this.editor.on('componentRemove', (_componentId) => {
      this.pushUndoState(this.editor!.exportAllPagesData());
    });

    this.editor.on('backgroundChange', (_background) => {
      this.pushUndoState(this.editor!.exportAllPagesData());
    });

    this.editor.on('pageChange', (_page) => {
      // 页面切换不需要记录到撤销栈
    });
  }

  /**
   * 清理和销毁
   */
  private destroyCurrentEditor(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
      this.emitter.emit('editorDestroyed');
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    this.destroyCurrentEditor();
    this.stopAutoSave();
    this.stopPerformanceMonitoring();
    this.clearUndoRedoStack();
    this.emitter.removeAllListeners();

    // 销毁背景管理器
    if (this.backgroundManager) {
      this.backgroundManager.destroy();
      this.backgroundManager = null;
    }

    // 销毁图片导出引擎
    if (this.imageExportEngine) {
      this.imageExportEngine.destroy();
      this.imageExportEngine = null;
    }

    console.log('H5EditorManager destroyed successfully');
  }

  /**
   * 增强的页面管理功能
   */
  createPageWithTemplate(name: string, templateId?: string, options?: Partial<IH5Page>): IH5Page | null {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      let pageOptions = options || {};

      // 如果指定了模板，应用模板设置
      if (templateId) {
        const templates = this.editor.getTemplates();
        const template = templates.find(t => t.id === templateId);
        if (template && template.pages.length > 0) {
          const templatePage = template.pages[0];
          if (templatePage) {
            pageOptions = {
              ...pageOptions,
              width: templatePage.width,
              height: templatePage.height,
              background: templatePage.background,
              components: templatePage.components.map(comp => ({
                ...comp,
                id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
              }))
            };
          }
        }
      }

      const newPage = this.editor.createPage(name, pageOptions);
      
      // 更新项目页面列表
      if (this.currentProject) {
        this.currentProject.pages.push(newPage);
        this.currentProject.metadata.updatedAt = new Date();
      }

      console.log(`页面创建成功: ${name}`);
      return newPage;
    } catch (error) {
      console.error('创建页面失败:', error);
      this.emitter.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 复制页面
   */
  duplicateCurrentPage(newName?: string): IH5Page | null {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      const currentPage = this.editor.getCurrentPage();
      if (!currentPage) {
        throw new Error('没有当前页面可复制');
      }

      const duplicatedPage = this.editor.duplicatePage(
        currentPage.id, 
        newName || `${currentPage.name} 副本`
      );

      if (duplicatedPage && this.currentProject) {
        this.currentProject.pages.push(duplicatedPage);
        this.currentProject.metadata.updatedAt = new Date();
      }

      console.log(`页面复制成功: ${duplicatedPage?.name}`);
      return duplicatedPage;
    } catch (error) {
      console.error('复制页面失败:', error);
      this.emitter.emit('error', error as Error);
      return null;
    }
  }

  /**
   * 删除页面
   */
  deletePageById(pageId: string): boolean {
    if (!this.editor) {
      throw new Error('H5编辑器未初始化');
    }

    try {
      const success = this.editor.deletePage(pageId);
      
      if (success && this.currentProject) {
        this.currentProject.pages = this.currentProject.pages.filter(p => p.id !== pageId);
        this.currentProject.metadata.updatedAt = new Date();
      }

      console.log(`页面删除${success ? '成功' : '失败'}: ${pageId}`);
      return success;
    } catch (error) {
      console.error('删除页面失败:', error);
      this.emitter.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 获取所有页面信息
   */
  getAllPagesInfo(): Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    componentCount: number;
    isCurrent: boolean;
    thumbnail?: string;
  }> {
    if (!this.editor) {
      return [];
    }

    try {
      const allPages = this.editor.getAllPages();
      const currentPage = this.editor.getCurrentPage();

      return allPages.map(page => ({
        id: page.id,
        name: page.name,
        width: page.width,
        height: page.height,
        componentCount: page.components.length,
        isCurrent: currentPage?.id === page.id,
        thumbnail: this.generatePageThumbnail(page)
      }));
    } catch (error) {
      console.error('获取页面信息失败:', error);
      return [];
    }
  }

  /**
   * 生成页面缩略图
   */
  private generatePageThumbnail(_page: IH5Page): string {
    try {
      // 简化实现：返回空字符串，实际应该生成缩略图
      // 在实际实现中，这里应该创建一个小尺寸的画布并渲染页面内容
      return '';
    } catch (error) {
      console.error('生成页面缩略图失败:', error);
      return '';
    }
  }

  /**
   * 重新排序页面
   */
  reorderPages(pageIds: string[]): boolean {
    if (!this.editor || !this.currentProject) {
      return false;
    }

    try {
      const allPages = this.editor.getAllPages();
      const reorderedPages: IH5Page[] = [];

      // 按照新的顺序重新排列页面
      pageIds.forEach(pageId => {
        const page = allPages.find(p => p.id === pageId);
        if (page) {
          reorderedPages.push(page);
        }
      });

      // 添加任何遗漏的页面
      allPages.forEach(page => {
        if (!reorderedPages.find(p => p.id === page.id)) {
          reorderedPages.push(page);
        }
      });

      this.currentProject.pages = reorderedPages;
      this.currentProject.metadata.updatedAt = new Date();

      console.log('页面重新排序成功');
      return true;
    } catch (error) {
      console.error('页面重新排序失败:', error);
      return false;
    }
  }

  /**
   * 背景设置功能
   */
  setColorBackground(color: string): void {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    this.backgroundManager.setColorBackground(color);
  }

  setGradientBackground(gradient: {
    gradientType: 'linear' | 'radial';
    angle?: number;
    centerX?: number;
    centerY?: number;
    radius?: number;
    stops: Array<{ offset: number; color: string; opacity?: number }>;
  }): void {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    this.backgroundManager.setGradientBackground(gradient);
  }

  setImageBackground(imageUrl: string, options?: {
    fit?: 'cover' | 'contain' | 'fill' | 'repeat' | 'center';
    opacity?: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }): void {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    this.backgroundManager.setImageBackground(imageUrl, options);
  }

  async uploadImageBackground(file: File): Promise<string> {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    return await this.backgroundManager.uploadImageBackground(file);
  }

  applyBackgroundPreset(presetId: string): boolean {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    return this.backgroundManager.applyPreset(presetId);
  }

  createCustomBackgroundPreset(name: string, category: string = '自定义', description: string = '', tags: string[] = []): IBackgroundPreset | null {
    if (!this.backgroundManager) {
      throw new Error('背景管理器未初始化');
    }
    return this.backgroundManager.createCustomPreset(name, category, description, tags);
  }

  getAllBackgroundPresets(): IBackgroundPreset[] {
    if (!this.backgroundManager) {
      return [];
    }
    return this.backgroundManager.getAllPresets();
  }

  getBackgroundPresetsByCategory(category: string): IBackgroundPreset[] {
    if (!this.backgroundManager) {
      return [];
    }
    return this.backgroundManager.getPresetsByCategory(category);
  }

  searchBackgroundPresets(query: string): IBackgroundPreset[] {
    if (!this.backgroundManager) {
      return [];
    }
    return this.backgroundManager.searchPresets(query);
  }

  getBackgroundCategories(): string[] {
    if (!this.backgroundManager) {
      return [];
    }
    return this.backgroundManager.getCategories();
  }

  getCurrentBackground(): IBackgroundSettings | null {
    if (!this.backgroundManager) {
      return null;
    }
    return this.backgroundManager.getCurrentBackground();
  }

  getBackgroundPreviewUrl(): string {
    if (!this.backgroundManager) {
      return '';
    }
    return this.backgroundManager.getPreviewDataUrl();
  }

  setBackgroundPreviewCallback(callback: (previewUrl: string) => void): void {
    if (this.backgroundManager) {
      this.backgroundManager.on('previewUpdate', callback);
    }
  }

  /**
   * 图片导出功能
   */
  async exportImage(options?: Partial<IImageExportOptions>): Promise<IImageExportResult> {
    if (!this.editor || !this.imageExportEngine) {
      throw new Error('编辑器或导出引擎未初始化');
    }

    const currentPage = this.editor.getCurrentPage();
    if (!currentPage) {
      throw new Error('没有当前页面可导出');
    }

    // 获取画布元素
    const canvasElement = this.editor.getCanvasElement();
    if (!canvasElement) {
      throw new Error('无法获取画布元素');
    }

    return await this.imageExportEngine.exportImage(canvasElement, currentPage, options);
  }

  async exportImageAsFile(filename: string, options?: Partial<IImageExportOptions>): Promise<File | null> {
    if (!this.editor || !this.imageExportEngine) {
      throw new Error('编辑器或导出引擎未初始化');
    }

    const currentPage = this.editor.getCurrentPage();
    if (!currentPage) {
      throw new Error('没有当前页面可导出');
    }

    const canvasElement = this.editor.getCanvasElement();
    if (!canvasElement) {
      throw new Error('无法获取画布元素');
    }

    return await this.imageExportEngine.exportAsFile(canvasElement, currentPage, filename, options);
  }

  async exportMultipleFormats(
    formats: Array<{ format: 'png' | 'jpg' | 'webp'; quality?: number; scale?: number }>
  ): Promise<IImageExportResult[]> {
    if (!this.editor || !this.imageExportEngine) {
      throw new Error('编辑器或导出引擎未初始化');
    }

    const currentPage = this.editor.getCurrentPage();
    if (!currentPage) {
      throw new Error('没有当前页面可导出');
    }

    const canvasElement = this.editor.getCanvasElement();
    if (!canvasElement) {
      throw new Error('无法获取画布元素');
    }

    return await this.imageExportEngine.exportMultipleFormats(canvasElement, currentPage, formats);
  }

  getExportRecommendedSettings(purpose: 'web' | 'print' | 'social' | 'icon'): Partial<IImageExportOptions> {
    if (!this.imageExportEngine) {
      throw new Error('导出引擎未初始化');
    }
    return this.imageExportEngine.getRecommendedSettings(purpose);
  }

  getSupportedExportFormats(): Array<{ format: string; name: string; extensions: string[]; supportsTransparency: boolean }> {
    if (!this.imageExportEngine) {
      return [];
    }
    return this.imageExportEngine.getSupportedFormats();
  }

  cancelImageExport(): void {
    if (this.imageExportEngine) {
      this.imageExportEngine.cancelExport();
    }
  }

  setImageExportProgressCallback(callback: (progress: any) => void): void {
    if (this.imageExportEngine) {
      this.imageExportEngine.on('exportProgress', callback);
    }
  }

  setImageExportCompleteCallback(callback: (result: IImageExportResult) => void): void {
    if (this.imageExportEngine) {
      this.imageExportEngine.on('exportComplete', callback);
    }
  }

  setImageExportErrorCallback(callback: (error: Error) => void): void {
    if (this.imageExportEngine) {
      this.imageExportEngine.on('exportError', callback);
    }
  }

  /**
   * 获取器方法
   */
  getCurrentEditor(): H5Editor | null {
    return this.editor;
  }

  getCurrentMode(): 'h5' | 'suika' {
    return this.currentMode;
  }

  getCurrentProject(): IH5Project | null {
    return this.currentProject;
  }

  isH5Mode(): boolean {
    return this.currentMode === 'h5';
  }

  isSuikaMode(): boolean {
    return this.currentMode === 'suika';
  }

  /**
   * 事件管理
   */
  on<T extends keyof IH5EditorManagerEvents>(eventName: T, listener: IH5EditorManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IH5EditorManagerEvents>(eventName: T, listener: IH5EditorManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 工具方法
   */
  getManagerInfo(): {
    currentMode: 'h5' | 'suika';
    hasEditor: boolean;
    hasProject: boolean;
    undoStackSize: number;
    redoStackSize: number;
    autoSaveEnabled: boolean;
    performanceMonitoringEnabled: boolean;
  } {
    return {
      currentMode: this.currentMode,
      hasEditor: !!this.editor,
      hasProject: !!this.currentProject,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
      autoSaveEnabled: !!this.autoSaveTimer,
      performanceMonitoringEnabled: !!this.performanceMonitor
    };
  }
}