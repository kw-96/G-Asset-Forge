// 项目管理器
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';
import { fileOperationOptimizer } from '../../utils/performance/FileOperationOptimizer';
import path from 'path-browserify';
// 渲染进程不直接使用 fs-extra，统一通过 preload 暴露的安全 API
const fsBridge = {
  ensureDir: async (dir: string) => {
    const res = await window.electronAPI.fs.createDirectory(dir);
    if (!res.success) throw new Error(res.error || 'ensureDir failed');
  },
  pathExists: async (p: string) => {
    return await window.electronAPI.fs.exists(p);
  },
  readFile: async (p: string) => {
    const res = await window.electronAPI.fs.readFile(p);
    if (!res.success) throw new Error(res.error || 'readFile failed');
    return String(res.data ?? '');
  },
  writeFile: async (p: string, data: string) => {
    const res = await window.electronAPI.fs.writeFile(p, data);
    if (!res.success) throw new Error(res.error || 'writeFile failed');
  }
};

export interface IProjectMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
  author?: string;
  tags: string[];
  thumbnail?: string; // 项目缩略图
  filePath?: string; // 项目文件路径
  isTemplate?: boolean; // 是否为模板项目
}

export interface IProjectSettings {
  // 画布设置
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
    gridEnabled: boolean;
    gridSize: number;
    snapToGrid: boolean;
    rulers: boolean;
  };
  
  // 工具设置
  tools: {
    defaultTool: string;
    brushSize: number;
    brushOpacity: number;
    textFont: string;
    textSize: number;
    textColor: string;
  };
  
  // 导出设置
  export: {
    format: 'png' | 'jpg' | 'svg';
    quality: number;
    scale: number;
    transparent: boolean;
  };
  
  // 自定义设置
  custom: Record<string, any>;
}

export interface IProjectData {
  metadata: IProjectMetadata;
  settings: IProjectSettings;
  
  // 画布数据
  canvas: {
    objects: any[]; // 画布对象数据
    layers: any[]; // 图层数据
    history: any[]; // 历史记录
  };
  
  // 素材引用
  assets: {
    used: string[]; // 使用的素材ID
    embedded: any[]; // 嵌入的素材数据
  };
  
  // 版本信息
  version: {
    appVersion: string;
    fileVersion: string;
    compatibility: string[];
  };
}

export interface IProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'game' | 'ui' | 'icon' | 'background' | 'general';
  thumbnail: string;
  settings: IProjectSettings;
  initialObjects?: any[];
  tags: string[];
}

export interface IProjectManagerEvents extends Record<string, (...args: any[]) => void> {
  projectCreated(project: IProjectData): void;
  projectOpened(project: IProjectData): void;
  projectSaved(project: IProjectData, filePath: string): void;
  projectClosed(projectId: string): void;
  projectUpdated(project: IProjectData): void;
  templateCreated(template: IProjectTemplate): void;
  recentProjectsUpdated(recentProjects: IProjectMetadata[]): void;
}

/**
 * 项目管理器
 * 负责项目的创建、保存、加载和管理
 */
export class ProjectManager {
  private emitter = new EventEmitter<IProjectManagerEvents>();
  private currentProject: IProjectData | null = null;
  private recentProjects: IProjectMetadata[] = [];
  private templates: IProjectTemplate[] = [];
  private projectsDirectory: string;
  private templatesDirectory: string;
  private maxRecentProjects = 10;

  constructor(userDataPath: string) {
    this.projectsDirectory = path.join(userDataPath, 'projects');
    this.templatesDirectory = path.join(userDataPath, 'templates');
    
    this.initializeDirectories();
    this.loadRecentProjects();
    this.loadTemplates();
  }

  /**
   * 初始化目录
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fsBridge.ensureDir(this.projectsDirectory);
      await fsBridge.ensureDir(this.templatesDirectory);
    } catch (error) {
      console.error('初始化项目目录失败:', error);
    }
  }

  /**
   * 生成项目ID
   */
  private generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取默认项目设置
   */
  private getDefaultSettings(): IProjectSettings {
    return {
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        gridEnabled: true,
        gridSize: 20,
        snapToGrid: false,
        rulers: true
      },
      tools: {
        defaultTool: 'select',
        brushSize: 5,
        brushOpacity: 1,
        textFont: 'Arial',
        textSize: 16,
        textColor: '#000000'
      },
      export: {
        format: 'png',
        quality: 90,
        scale: 1,
        transparent: false
      },
      custom: {}
    };
  }

  /**
   * 创建新项目
   */
  async createProject(options: {
    name: string;
    description?: string;
    template?: string;
    settings?: Partial<IProjectSettings>;
  }): Promise<IProjectData> {
    const { name, description, template, settings } = options;
    
    // 获取模板或默认设置
    let projectSettings = this.getDefaultSettings();
    let initialObjects: any[] = [];
    
    if (template) {
      const templateData = this.templates.find(t => t.id === template);
      if (templateData) {
        projectSettings = { ...projectSettings, ...templateData.settings };
        initialObjects = templateData.initialObjects || [];
      }
    }
    
    if (settings) {
      projectSettings = { ...projectSettings, ...settings };
    }

    const project: IProjectData = {
      metadata: {
        id: this.generateProjectId(),
        name,
        description: description || '',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'User', // 可以从用户设置获取
        tags: []
      },
      settings: projectSettings,
      canvas: {
        objects: initialObjects,
        layers: [],
        history: []
      },
      assets: {
        used: [],
        embedded: []
      },
      version: {
        appVersion: '1.0.0', // 从应用配置获取
        fileVersion: '1.0',
        compatibility: ['1.0']
      }
    };

    this.currentProject = project;
    this.emitter.emit('projectCreated', project);
    
    return project;
  }

  /**
   * 保存项目
   */
  async saveProject(filePath?: string): Promise<string> {
    if (!this.currentProject) {
      throw new Error('没有打开的项目');
    }

    // 如果没有指定路径，使用默认路径
    if (!filePath) {
      if (this.currentProject.metadata.filePath) {
        filePath = this.currentProject.metadata.filePath;
      } else {
        const fileName = `${this.currentProject.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}.gaf`;
        filePath = path.join(this.projectsDirectory, fileName);
      }
    }

    // 确保文件扩展名
    if (!filePath.endsWith('.gaf')) {
      filePath += '.gaf';
    }

    try {
      // 更新项目元数据
      this.currentProject.metadata.updatedAt = new Date();
      this.currentProject.metadata.filePath = filePath;

      // 序列化项目数据
      const projectJson = JSON.stringify(this.currentProject, null, 2);
      
      // 使用优化的文件保存操作，确保1秒内完成
      const metrics = await fileOperationOptimizer.saveFile(filePath, projectJson, {
        timeout: 1000, // 1秒超时
        maxRetries: 3,
        compressionEnabled: true,
        progressCallback: (progress) => {
          // 可以在这里更新UI进度条
          console.log(`项目保存进度: ${Math.round(progress * 100)}%`);
        }
      });
      
      // 记录性能指标
      if (metrics.duration > 1000) {
        console.warn(`项目保存超时: ${metrics.duration}ms，目标是1000ms以内`);
      } else {
        console.log(`项目保存成功: ${filePath} (${metrics.duration.toFixed(2)}ms)`);
      }
      
      // 更新最近项目列表
      this.addToRecentProjects(this.currentProject.metadata);
      
      this.emitter.emit('projectSaved', this.currentProject, filePath);
      
      return filePath;
    } catch (error) {
      console.error('保存项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`保存项目失败: ${msg}`);
    }
  }

  /**
   * 另存为项目
   */
  async saveProjectAs(filePath: string): Promise<string> {
    if (!this.currentProject) {
      throw new Error('没有打开的项目');
    }

    // 创建项目副本
    const projectCopy: IProjectData = JSON.parse(JSON.stringify(this.currentProject));
    projectCopy.metadata.id = this.generateProjectId();
    // exactOptionalPropertyTypes: 不要将可选属性赋值为 undefined，应当删除该属性
    delete projectCopy.metadata.filePath;
    
    const originalProject = this.currentProject;
    this.currentProject = projectCopy;
    
    try {
      const savedPath = await this.saveProject(filePath);
      return savedPath;
    } catch (error) {
      // 恢复原项目
      this.currentProject = originalProject;
      throw error;
    }
  }

  /**
   * 加载项目
   */
  async loadProject(filePath: string): Promise<IProjectData> {
    try {
      // 检查文件是否存在
      if (!await fsBridge.pathExists(filePath)) {
        throw new Error('项目文件不存在');
      }

      // 使用优化的文件加载操作
      const { data: fileContent, metrics } = await fileOperationOptimizer.loadFile(filePath, {
        timeout: 5000, // 5秒超时
        maxRetries: 3,
        cacheEnabled: true,
        progressCallback: (progress) => {
          // 可以在这里更新UI进度条
          console.log(`项目加载进度: ${Math.round(progress * 100)}%`);
        }
      });

      // 记录性能指标
      console.log(`项目加载完成: ${filePath} (${metrics.duration.toFixed(2)}ms)`);
      
      const projectData: IProjectData = JSON.parse(fileContent);
      
      // 验证项目数据
      this.validateProjectData(projectData);
      
      // 更新文件路径和最后打开时间
      projectData.metadata.filePath = filePath;
      projectData.metadata.lastOpenedAt = new Date();
      
      // 设置为当前项目
      this.currentProject = projectData;
      
      // 更新最近项目列表
      this.addToRecentProjects(projectData.metadata);
      
      this.emitter.emit('projectOpened', projectData);
      
      return projectData;
    } catch (error) {
      console.error('加载项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`加载项目失败: ${msg}`);
    }
  }

  /**
   * 关闭项目
   */
  closeProject(): void {
    if (this.currentProject) {
      const projectId = this.currentProject.metadata.id;
      this.currentProject = null;
      this.emitter.emit('projectClosed', projectId);
    }
  }

  /**
   * 获取当前项目
   */
  getCurrentProject(): IProjectData | null {
    return this.currentProject;
  }

  /**
   * 更新项目数据
   */
  updateProject(updates: Partial<IProjectData>): void {
    if (!this.currentProject) {
      throw new Error('没有打开的项目');
    }

    // 深度合并更新
    const merged: IProjectData = this.deepMerge(this.currentProject as IProjectData, updates) as IProjectData;
    merged.metadata.updatedAt = new Date();
    this.currentProject = merged;
    
    this.emitter.emit('projectUpdated', merged);
  }

  /**
   * 验证项目数据
   */
  private validateProjectData(projectData: any): void {
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('无效的项目数据格式');
    }

    if (!projectData.metadata || !projectData.metadata.id || !projectData.metadata.name) {
      throw new Error('项目元数据不完整');
    }

    if (!projectData.version || !projectData.version.fileVersion) {
      throw new Error('项目版本信息缺失');
    }

    // 检查版本兼容性
    const fileVersion = projectData.version.fileVersion;
    const supportedVersions = ['1.0']; // 支持的文件版本
    
    if (!supportedVersions.includes(fileVersion)) {
      throw new Error(`不支持的项目文件版本: ${fileVersion}`);
    }
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * 添加到最近项目列表
   */
  private addToRecentProjects(metadata: IProjectMetadata): void {
    // 移除已存在的项目
    this.recentProjects = this.recentProjects.filter(p => p.id !== metadata.id);
    
    // 添加到开头
    this.recentProjects.unshift({ ...metadata });
    
    // 限制数量
    if (this.recentProjects.length > this.maxRecentProjects) {
      this.recentProjects = this.recentProjects.slice(0, this.maxRecentProjects);
    }
    
    // 保存到本地存储
    this.saveRecentProjects();
    
    this.emitter.emit('recentProjectsUpdated', this.recentProjects);
  }

  /**
   * 获取最近项目列表
   */
  getRecentProjects(): IProjectMetadata[] {
    return [...this.recentProjects];
  }

  /**
   * 清除最近项目列表
   */
  clearRecentProjects(): void {
    this.recentProjects = [];
    this.saveRecentProjects();
    this.emitter.emit('recentProjectsUpdated', this.recentProjects);
  }

  /**
   * 从最近项目列表中移除
   */
  removeFromRecentProjects(projectId: string): void {
    this.recentProjects = this.recentProjects.filter(p => p.id !== projectId);
    this.saveRecentProjects();
    this.emitter.emit('recentProjectsUpdated', this.recentProjects);
  }

  /**
   * 保存最近项目列表
   */
  private saveRecentProjects(): void {
    try {
      localStorage.setItem('recent-projects', JSON.stringify(this.recentProjects));
    } catch (error) {
      console.error('保存最近项目列表失败:', error);
    }
  }

  /**
   * 加载最近项目列表
   */
  private loadRecentProjects(): void {
    try {
      const stored = localStorage.getItem('recent-projects');
      if (stored) {
        const projects = JSON.parse(stored);
        this.recentProjects = projects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          lastOpenedAt: p.lastOpenedAt ? new Date(p.lastOpenedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('加载最近项目列表失败:', error);
      this.recentProjects = [];
    }
  }

  /**
   * 获取项目模板列表
   */
  getTemplates(): IProjectTemplate[] {
    return [...this.templates];
  }

  /**
   * 创建项目模板
   */
  async createTemplate(template: Omit<IProjectTemplate, 'id'>): Promise<IProjectTemplate> {
    const newTemplate: IProjectTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template
    };

    this.templates.push(newTemplate);
    await this.saveTemplates();
    
    this.emitter.emit('templateCreated', newTemplate);
    
    return newTemplate;
  }

  /**
   * 从当前项目创建模板
   */
  async createTemplateFromCurrentProject(templateInfo: {
    name: string;
    description: string;
    category: IProjectTemplate['category'];
    tags: string[];
  }): Promise<IProjectTemplate> {
    if (!this.currentProject) {
      throw new Error('没有打开的项目');
    }

    const template: IProjectTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: templateInfo.name,
      description: templateInfo.description,
      category: templateInfo.category,
      thumbnail: this.currentProject.metadata.thumbnail || '',
      settings: { ...this.currentProject.settings },
      initialObjects: [...this.currentProject.canvas.objects],
      tags: templateInfo.tags
    };

    this.templates.push(template);
    await this.saveTemplates();
    
    this.emitter.emit('templateCreated', template);
    
    return template;
  }

  /**
   * 保存模板列表
   */
  private async saveTemplates(): Promise<void> {
    try {
      const templatesPath = path.join(this.templatesDirectory, 'templates.json');
      await fsBridge.writeFile(templatesPath, JSON.stringify(this.templates, null, 2));
    } catch (error) {
      console.error('保存模板列表失败:', error);
    }
  }

  /**
   * 加载模板列表
   */
  private async loadTemplates(): Promise<void> {
    try {
      const templatesPath = path.join(this.templatesDirectory, 'templates.json');
      
      if (await fsBridge.pathExists(templatesPath)) {
        const content = await fsBridge.readFile(templatesPath);
        this.templates = JSON.parse(content);
      } else {
        // 创建默认模板
        await this.createDefaultTemplates();
      }
    } catch (error) {
      console.error('加载模板列表失败:', error);
      this.templates = [];
      await this.createDefaultTemplates();
    }
  }

  /**
   * 创建默认模板
   */
  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<IProjectTemplate, 'id'>[] = [
      {
        name: '空白项目',
        description: '从空白画布开始创建',
        category: 'general',
        thumbnail: '',
        settings: this.getDefaultSettings(),
        initialObjects: [],
        tags: ['空白', '通用']
      },
      {
        name: '游戏UI模板',
        description: '适合游戏界面设计的模板',
        category: 'game',
        thumbnail: '',
        settings: {
          ...this.getDefaultSettings(),
          canvas: {
            ...this.getDefaultSettings().canvas,
            width: 1920,
            height: 1080,
            backgroundColor: '#1a1a1a'
          }
        },
        initialObjects: [],
        tags: ['游戏', 'UI', '界面']
      },
      {
        name: '图标设计模板',
        description: '专为图标设计优化的模板',
        category: 'icon',
        thumbnail: '',
        settings: {
          ...this.getDefaultSettings(),
          canvas: {
            ...this.getDefaultSettings().canvas,
            width: 512,
            height: 512,
            backgroundColor: 'transparent'
          }
        },
        initialObjects: [],
        tags: ['图标', '设计']
      }
    ];

    for (const template of defaultTemplates) {
      await this.createTemplate(template);
    }
  }

  /**
   * 导出项目数据
   */
  exportProject(format: 'json' | 'zip' = 'json'): string {
    if (!this.currentProject) {
      throw new Error('没有打开的项目');
    }

    if (format === 'json') {
      return JSON.stringify(this.currentProject, null, 2);
    }

    // ZIP格式导出暂时不实现
    throw new Error('ZIP格式导出暂未实现');
  }

  /**
   * 导入项目数据
   */
  async importProject(data: string, format: 'json' | 'zip' = 'json'): Promise<IProjectData> {
    try {
      let projectData: IProjectData;

      if (format === 'json') {
        projectData = JSON.parse(data);
      } else {
        throw new Error('ZIP格式导入暂未实现');
      }

      // 验证项目数据
      this.validateProjectData(projectData);

      // 生成新的项目ID
      projectData.metadata.id = this.generateProjectId();
      // exactOptionalPropertyTypes: 移除可选属性而非设置为 undefined
      delete projectData.metadata.filePath;
      projectData.metadata.updatedAt = new Date();

      this.currentProject = projectData;
      this.emitter.emit('projectOpened', projectData);

      return projectData;
    } catch (error) {
      console.error('导入项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`导入项目失败: ${msg}`);
    }
  }

  /**
   * 事件管理
   */
  on<T extends keyof IProjectManagerEvents>(eventName: T, listener: IProjectManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IProjectManagerEvents>(eventName: T, listener: IProjectManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.emitter.removeAllListeners();
  }
}