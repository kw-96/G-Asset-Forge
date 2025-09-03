# G-Asset Forge 自动导出 GAF 文件实现方案

## 📋 项目概述

### 目标

实现项目关闭时自动导出 GAF 文件到本地，提供彻底的持久化存储方案，确保即使清理浏览器缓存也能恢复项目数据。

### 背景

当前项目数据仅存储在浏览器的 localStorage 中，存在以下风险：

- 用户清理浏览器缓存会丢失所有项目
- 数据无法跨设备同步
- 缺乏本地备份机制

## 🎯 核心功能设计

### 1. 自动导出触发时机

- **项目关闭时**：用户点击 Header 首页按钮关闭项目
- **定期备份**：每 10 分钟自动备份一次
- **应用退出时**：检测到应用即将关闭时自动备份

### 2. 文件存储策略

```
存储位置：用户选择的本地目录（默认：Documents/g-asset-forge-projects/）
文件命名：{项目名称}_{项目ID}.gaf（自动导出覆盖模式）
文件格式：JSON格式，包含完整的项目数据和元数据
导出类型：根据项目类型自动设置（设计模式/H5模式）
手动导出：复用现有的 export_service.ts 实现
```

### 3. 数据恢复机制

- **启动时扫描**：应用启动时自动扫描本地 GAF 文件
- **项目列表合并**：将 localStorage 项目和本地 GAF 文件项目合并显示
- **智能去重**：基于项目 ID 和更新时间智能去重

## 🏗️ 技术架构

### 核心服务组件

#### 1. FileReadService（文件读取服务）

**文件位置**：`packages/core/src/service/file_read_service.ts`

**主要职责**：

- 提供统一的文件读取接口
- 封装 FileReader 逻辑
- 处理文件读取错误

**核心方法**：

```typescript
export class FileReadService {
  async readTextFile(file: File): Promise<string>;
  async readJSONFile<T>(file: File): Promise<T>;
  async readMultipleFiles(files: File[]): Promise<string[]>;
}
```

#### 2. ProjectDataService（项目数据服务）

**文件位置**：`packages/core/src/service/project_data_service.ts`

**主要职责**：

- 项目数据验证和校验
- 项目数据转换和格式化
- 数据完整性检查

**核心方法**：

```typescript
export class ProjectDataService {
  validateProjectData(data: any): boolean;
  validateGAFData(data: any): boolean;
  calculateChecksum(data: any): string;
  transformProjectData(data: any): ProjectData;
}
```

#### 3. FileSystemAccessService（文件系统访问服务）

**文件位置**：`packages/core/src/service/file_system_access_service.ts`

**主要职责**：

- 封装 File System Access API
- 提供降级方案
- 管理文件权限

**核心方法**：

```typescript
class FileSystemAccessService {
  async requestSavePermission(): Promise<boolean>;
  async saveFile(filename: string, blob: Blob): Promise<void>;
  async readFile(filePath: string): Promise<File>;
  isSupported(): boolean;
}
```

#### 4. AutoExportService（自动导出服务）

**文件位置**：`packages/core/src/service/auto_export_service.ts`

**主要职责**：

- 自动导出项目为 GAF 文件（覆盖模式）
- 复用 export_service 的核心逻辑
- 文件系统访问管理
- 导出错误处理

**核心方法**：

```typescript
class AutoExportService {
  async autoExportProject(projectData: ProjectData): Promise<void>;
  private generateGAFContent(projectData: ProjectData): string;
  private generateAutoExportFilename(projectData: ProjectData): string;
}
```

#### 5. ProjectRecoveryService（项目恢复服务）

**文件位置**：`packages/core/src/service/project_recovery_service.ts`

**主要职责**：

- 扫描本地 GAF 文件
- 从 GAF 文件恢复项目（复用 FileReadService）
- 验证数据完整性（复用 ProjectDataService）
- 合并项目列表

**核心方法**：

```typescript
class ProjectRecoveryService {
  private fileReadService: FileReadService;
  private projectDataService: ProjectDataService;

  async scanLocalGAFFiles(): Promise<ProjectData[]>;
  async restoreFromGAF(gafFile: File): Promise<ProjectData>;
  mergeProjects(
    localProjects: ProjectData[],
    gafProjects: ProjectData[],
  ): ProjectData[];
}
```

#### 6. ExportService（手动导出服务）

**文件位置**：`packages/core/src/service/export_service.ts`

**主要职责**：

- 手动导出（现有功能，保持不变）
- 提供核心导出逻辑供 AutoExportService 复用

#### 7. ImportService（手动导入服务）

**文件位置**：`packages/core/src/service/import_service.ts`

**主要职责**：

- 手动导入（现有功能，保持不变）
- 包含文件选择器和文件读取逻辑

### 数据格式设计

#### GAF 文件结构

```typescript
interface GAFProjectData {
  // 文件版本信息
  version: string; // GAF文件格式版本
  appVersion: string; // 应用版本
  schemaVersion: string; // 数据结构版本，用于未来迁移

  // 项目基本信息
  project: {
    id: string; // 项目唯一标识
    name: string; // 项目名称
    description: string; // 项目描述
    type: 'design' | 'h5'; // 项目类型
    createdAt: string; // 创建时间（ISO字符串）
    updatedAt: string; // 更新时间（ISO字符串）
    lastOpenedAt: string; // 最后打开时间（ISO字符串）
    settings: ProjectSettings; // 项目设置
    usedAssets: string[]; // 使用的素材
    usedTemplates: string[]; // 使用的模板
  };

  // 编辑器数据
  editorData: {
    appVersion: string; // 编辑器版本
    paperId: string; // 画布ID
    data: GraphicsAttrs[]; // 图形数据
  };

  // 导出元数据
  metadata: {
    exportedAt: string; // 导出时间
    exportType: 'design-mode' | 'h5-mode'; // 导出类型：设计模式或H5模式
    exportMethod: 'directory' | 'download' | 'electron'; // 记录导出方式
    checksum: string; // 数据校验和
    fileSize: number; // 文件大小
    browserInfo: string; // 记录浏览器信息，便于问题排查
  };
}
```

## 🔧 实现步骤

### 阶段一：基础服务开发

#### 1. 创建 FileReadService

```typescript
// packages/core/src/service/file_read_service.ts
export class FileReadService {
  /**
   * 读取文本文件（复用 ImportService 的逻辑）
   */
  async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          resolve(content);
        } else {
          reject(new Error('文件读取失败'));
        }
      };

      reader.onerror = () => reject(new Error('文件读取错误'));
      reader.readAsText(file);
    });
  }

  /**
   * 读取JSON文件
   */
  async readJSONFile<T>(file: File): Promise<T> {
    const content = await this.readTextFile(file);
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error('JSON解析失败');
    }
  }

  /**
   * 批量读取文件
   */
  async readMultipleFiles(files: File[]): Promise<string[]> {
    const promises = files.map((file) => this.readTextFile(file));
    return Promise.all(promises);
  }
}
```

#### 2. 创建 ProjectDataService

```typescript
// packages/core/src/service/project_data_service.ts
export class ProjectDataService {
  /**
   * 验证项目数据完整性
   */
  validateProjectData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 检查必需字段
    const requiredFields = ['id', 'name', 'type', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 验证GAF文件数据
   */
  validateGAFData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 检查GAF文件结构
    const requiredFields = ['version', 'project', 'editorData', 'metadata'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return false;
      }
    }

    // 验证项目数据
    return this.validateProjectData(data.project);
  }

  /**
   * 计算数据校验和
   */
  calculateChecksum(data: any): string {
    const content = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 项目数据格式转换
   */
  transformProjectData(data: any): ProjectData {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      type: data.type,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      lastOpenedAt: new Date(data.lastOpenedAt || data.updatedAt),
      settings: data.settings || {},
      usedAssets: data.usedAssets || [],
      usedTemplates: data.usedTemplates || [],
      editorData: data.editorData,
    };
  }
}
```

#### 3. 创建 FileSystemAccessService

```typescript
// packages/core/src/service/file_system_access_service.ts
export class FileSystemAccessService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  async requestSavePermission(): Promise<boolean> {
    // 检查浏览器支持
    if (this.isSupported()) {
      try {
        this.directoryHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
        });
        return true;
      } catch (error) {
        console.warn('用户取消或浏览器不支持，降级到下载模式');
        return false;
      }
    }

    // 不支持的浏览器直接返回false，使用降级方案
    console.info('浏览器不支持File System Access API，使用下载模式');
    return false;
  }

  async saveFile(filename: string, blob: Blob): Promise<void> {
    if (this.isElectron()) {
      // 使用 Electron 的原生文件系统 API
      await this.saveFileElectron(filename, blob);
    } else if (this.directoryHandle) {
      // 使用File System Access API（Chrome/Edge）
      await this.saveToDirectory(filename, blob);
    } else {
      // 降级到传统下载方式（Firefox/Safari/其他）
      this.downloadFile(filename, blob);
    }
  }

  private async saveToDirectory(filename: string, blob: Blob): Promise<void> {
    const fileHandle = await this.directoryHandle!.getFileHandle(filename, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  private async saveFileElectron(filename: string, blob: Blob): Promise<void> {
    // 通过 Electron 的 IPC 调用主进程保存文件
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 调用预加载脚本中定义的文件保存方法
    if (window.electronAPI) {
      await window.electronAPI.saveFile(filename, uint8Array);
    }
  }

  private downloadFile(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.process !== 'undefined' &&
      window.process.type === 'renderer'
    );
  }
}
```

### 阶段二：核心功能服务开发

#### 4. 创建 AutoExportService

```typescript
// packages/core/src/service/auto_export_service.ts
import { ProjectDataService } from './project_data_service';
import { FileSystemAccessService } from './file_system_access_service';

export class AutoExportService {
  private fileSystemService: FileSystemAccessService;
  private projectDataService: ProjectDataService;

  constructor() {
    this.fileSystemService = new FileSystemAccessService();
    this.projectDataService = new ProjectDataService();
  }

  async autoExportProject(projectData: ProjectData): Promise<void> {
    try {
      // 1. 生成GAF文件内容
      const gafContent = this.generateGAFContent(projectData);

      // 2. 创建Blob
      const blob = new Blob([gafContent], { type: 'application/json' });

      // 3. 生成文件名（覆盖模式）
      const filename = this.generateAutoExportFilename(projectData);

      // 4. 保存到本地（覆盖现有文件）
      await this.fileSystemService.saveFile(filename, blob);

      console.log('项目自动导出成功:', filename);
    } catch (error) {
      console.error('项目自动导出失败:', error);
    }
  }

  private generateGAFContent(projectData: ProjectData): string {
    const gafData: GAFProjectData = {
      version: '1.0.0',
      appVersion: projectData.appVersion,
      schemaVersion: '1.0.0',
      project: {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        type: projectData.type,
        createdAt: projectData.createdAt.toISOString(),
        updatedAt: projectData.updatedAt.toISOString(),
        lastOpenedAt: projectData.lastOpenedAt.toISOString(),
        settings: projectData.settings,
        usedAssets: projectData.usedAssets,
        usedTemplates: projectData.usedTemplates,
      },
      editorData: projectData.editorData,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportType: projectData.type === 'h5' ? 'h5-mode' : 'design-mode',
        exportMethod: this.getExportMethod(),
        checksum: this.projectDataService.calculateChecksum(projectData),
        fileSize: 0,
        browserInfo: this.getBrowserInfo(),
      },
    };

    return JSON.stringify(gafData, null, 2);
  }

  private getExportMethod(): 'directory' | 'download' | 'electron' {
    if (this.fileSystemService.isElectron()) {
      return 'electron';
    } else if (this.fileSystemService.isSupported()) {
      return 'directory';
    } else {
      return 'download';
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const isElectron = this.fileSystemService.isElectron();
    return isElectron ? `Electron-${userAgent}` : userAgent;
  }

  private generateAutoExportFilename(projectData: ProjectData): string {
    const safeName = projectData.name.replace(
      /[^a-zA-Z0-9\u4e00-\u9fa5]/g,
      '_',
    );
    return `${safeName}_${projectData.id}.gaf`;
  }
}
```

#### 5. 创建 ProjectRecoveryService

```typescript
// packages/core/src/service/project_recovery_service.ts
import { FileReadService } from './file_read_service';
import { ProjectDataService } from './project_data_service';

export class ProjectRecoveryService {
  private fileReadService: FileReadService;
  private projectDataService: ProjectDataService;

  constructor() {
    this.fileReadService = new FileReadService();
    this.projectDataService = new ProjectDataService();
  }

  /**
   * 扫描本地GAF文件
   */
  async scanLocalGAFFiles(): Promise<ProjectData[]> {
    // 实现文件系统扫描逻辑
    // 这里需要结合FileSystemAccessService
    return [];
  }

  /**
   * 从GAF文件恢复项目
   */
  async restoreFromGAF(gafFile: File): Promise<ProjectData> {
    try {
      // 使用FileReadService读取文件
      const gafData = await this.fileReadService.readJSONFile(gafFile);

      // 使用ProjectDataService验证数据
      if (!this.projectDataService.validateGAFData(gafData)) {
        throw new Error('GAF文件数据格式无效');
      }

      // 转换项目数据
      return this.projectDataService.transformProjectData(gafData.project);
    } catch (error) {
      throw new Error(`项目恢复失败: ${error.message}`);
    }
  }

  /**
   * 合并项目列表
   */
  mergeProjects(
    localProjects: ProjectData[],
    gafProjects: ProjectData[],
  ): ProjectData[] {
    const projectMap = new Map<string, ProjectData>();

    // 添加localStorage项目
    localProjects.forEach((project) => {
      projectMap.set(project.id, project);
    });

    // 合并GAF文件项目（以更新时间为准）
    gafProjects.forEach((project) => {
      const existing = projectMap.get(project.id);
      if (!existing || project.updatedAt > existing.updatedAt) {
        projectMap.set(project.id, project);
      }
    });

    return Array.from(projectMap.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }
}
```

### 阶段三：重构现有服务

#### 6. 重构 TemplateExportImport

```typescript
// apps/g-asset-forge/src/utils/templateExportImport.ts
import { FileReadService } from '@g-asset-forge/core';

export const selectAndReadTemplateFile = (): Promise<{
  file: File;
  content: string;
}> => {
  return new Promise(async (resolve, reject) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.gaf';
      input.style.display = 'none';

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('未选择文件'));
          return;
        }

        try {
          // 使用 FileReadService 读取文件
          const fileReadService = new FileReadService();
          const content = await fileReadService.readTextFile(file);
          resolve({ file, content });
        } catch (error) {
          reject(new Error('文件读取失败'));
        }
      };

      input.onerror = () => {
        reject(new Error('文件选择失败'));
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    } catch (error) {
      reject(error);
    }
  });
};
```

#### 7. 重构 ProjectStorageService（提取可复用部分）

```typescript
// packages/core/src/project/ProjectStorageService.ts
import { ProjectDataService } from '../service/project_data_service';

export class ProjectStorageService extends EventEmitter<ProjectStorageEvents> {
  private projectDataService: ProjectDataService;

  constructor() {
    super();
    this.projectDataService = new ProjectDataService();
  }

  /**
   * 从备份恢复项目（复用 ProjectDataService）
   */
  async restoreFromBackup(backupId: string): Promise<ProjectData | null> {
    try {
      const backupKey = this.BACKUP_PREFIX + backupId;
      const dataStr = localStorage.getItem(backupKey);

      if (!dataStr) {
        return null;
      }

      const backup = JSON.parse(dataStr) as ProjectBackup;

      // 使用 ProjectDataService 验证数据
      if (!this.projectDataService.validateProjectData(backup.data)) {
        throw new Error('备份数据格式无效');
      }

      const restoredProject = { ...backup.data };
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
}
```

### 阶段四：集成到项目管理服务

#### 8. 修改 ProjectManagementService

```typescript
// apps/g-asset-forge/src/services/ProjectManagementService.ts
export class ProjectManagementService extends EventEmitter<ProjectManagementEvents> {
  private autoExportService: AutoExportService;
  private projectRecoveryService: ProjectRecoveryService;

  constructor() {
    super();
    this.autoExportService = new AutoExportService();
    this.projectRecoveryService = new ProjectRecoveryService();
  }

  closeProject(projectId: string): void {
    if (this.currentProjectId === projectId) {
      console.log('关闭项目:', projectId);

      // 1. 先保存项目（如果有未保存的更改）
      if (this.autoSaveService) {
        this.autoSaveService.manualSave();
      }

      // 2. 自动导出GAF文件到本地
      this.autoExportProject(projectId);

      // 3. 继续原有的清理逻辑
      this.emit('projectClosed', projectId);

      if (this.autoSaveService) {
        this.autoSaveService.setCurrentProject(null);
      }

      if (this.editor) {
        this.editor.setContents({
          appVersion: 'g-asset-forge-editor_1.0.0',
          paperId: '',
          data: [],
        });
      }

      this.currentProjectId = null;

      if (typeof window !== 'undefined') {
        (window as any).editor = null;
        (window as any).__PROJECT_MANAGEMENT_SERVICE__ = null;
      }
    }
  }

  private async autoExportProject(projectId: string): Promise<void> {
    try {
      const projectData = await this.storageService.loadProject(projectId);
      if (projectData) {
        await this.autoExportService.autoExportProject(projectData);
        console.log('项目自动导出成功:', projectData.name);
      }
    } catch (error) {
      console.error('项目自动导出失败:', error);
    }
  }

  // 新增：获取所有项目（包括本地GAF文件）
  async getAllProjects(): Promise<ProjectData[]> {
    const localProjects = await this.storageService.getProjectsList();
    const gafProjects = await this.projectRecoveryService.scanLocalGAFFiles();
    return this.projectRecoveryService.mergeProjects(
      localProjects,
      gafProjects,
    );
  }
}
```

### 阶段五：修改前端组件

#### 9. 修改 HomePage 组件

```typescript
// apps/g-asset-forge/src/components/HomePage/HomePage.tsx
const HomePage: FC<HomePageProps> = ({ onOpenProject, onCreateProject }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);

        // 获取所有项目（包括本地GAF文件）
        const allProjects = await projectManagementService.getAllProjects();
        setProjects(allProjects);
      } catch (error) {
        console.error('加载项目列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // 项目列表渲染逻辑
  const renderProjectList = () => {
    if (loading) {
      return <div className="loading">加载中...</div>;
    }

    if (projects.length === 0) {
      return <div className="empty">暂无项目</div>;
    }

    return (
      <div className="project-list">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={() => onOpenProject(project.id)}
            onDelete={() => handleProjectDelete(project)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="home-page">
      <div className="header">
        <h1>G-Asset Forge</h1>
        <button onClick={onCreateProject} className="create-btn">
          新建项目
        </button>
      </div>

      <div className="content">
        <div className="recent-projects">
          <h2>最近项目</h2>
          {renderProjectList()}
        </div>
      </div>
    </div>
  );
};
```

## 🚀 部署和配置

### 1. 环境要求

- **浏览器支持**：
  - Chrome 86+：完全支持（目录导出 + 下载模式）
  - Edge 86+：完全支持（目录导出 + 下载模式）
  - Firefox：支持（下载模式）
  - Safari：支持（下载模式）
  - Electron：完全支持（原生文件系统）
- **权限要求**：Chrome/Edge 需要用户授权文件系统访问权限
- **存储空间**：建议至少 100MB 可用空间

### 2. 用户配置

```typescript
// 用户设置界面
interface AutoExportSettings {
  enabled: boolean; // 是否启用自动导出
  exportMethod: 'auto' | 'directory' | 'download'; // 导出方式：自动选择/目录导出/下载模式
  exportDirectory: string; // 导出目录（仅Chrome/Edge/Electron）
  autoBackupInterval: number; // 自动备份间隔（分钟）
  maxBackupFiles: number; // 最大备份文件数
  includeThumbnails: boolean; // 是否包含缩略图
  showExportMethodInfo: boolean; // 是否显示导出方式提示
}
```

### 3. 错误处理策略

```typescript
// 错误处理配置
interface ErrorHandlingConfig {
  retryAttempts: number; // 重试次数
  fallbackToDownload: boolean; // 是否降级到下载
  notifyUserOnError: boolean; // 是否通知用户错误
  logErrors: boolean; // 是否记录错误日志
  showBrowserCompatibilityWarning: boolean; // 是否显示浏览器兼容性警告
}
```

## 📊 性能优化

### 1. 文件大小优化

- **压缩 JSON**：使用 JSON.stringify 的紧凑格式
- **增量备份**：只备份变更的部分
- **清理旧文件**：自动清理超过 30 天的备份文件

### 2. 内存管理

- **流式处理**：大文件使用流式读写
- **内存释放**：及时释放 Blob 对象
- **缓存策略**：合理使用内存缓存

### 3. 用户体验优化

- **后台处理**：导出操作在后台进行
- **进度提示**：显示导出进度
- **错误恢复**：提供错误恢复机制

## 🔒 安全考虑

### 1. 数据安全

- **文件权限**：严格控制文件访问权限
- **数据加密**：敏感数据可选择性加密
- **完整性校验**：使用校验和验证数据完整性

### 2. 隐私保护

- **本地存储**：所有数据仅存储在用户本地
- **无网络传输**：不涉及网络数据传输
- **用户控制**：用户完全控制数据存储位置

## 📈 监控和日志

### 1. 操作日志

```typescript
interface ExportLog {
  timestamp: Date;
  projectId: string;
  projectName: string;
  operation: 'export' | 'import' | 'delete';
  status: 'success' | 'error' | 'warning';
  details: string;
  fileSize?: number;
  duration?: number;
}
```

### 2. 性能监控

- **导出时间**：记录每次导出的耗时
- **文件大小**：监控文件大小变化
- **错误率**：统计导出失败率

## 🧪 测试策略

### 1. 单元测试

- **服务测试**：测试各个服务的核心功能
- **数据格式测试**：验证 GAF 文件格式正确性
- **错误处理测试**：测试各种错误场景

### 2. 集成测试

- **端到端测试**：测试完整的导出导入流程
- **浏览器兼容性测试**：测试不同浏览器的兼容性
- **性能测试**：测试大文件处理的性能

### 3. 用户测试

- **可用性测试**：测试用户操作的便利性
- **错误恢复测试**：测试各种异常情况的恢复能力

## 📝 实施计划

### 第 1 周：基础服务开发

- [ ] 创建 FileReadService
- [ ] 创建 ProjectDataService
- [ ] 创建 FileSystemAccessService（包含 Electron 支持）
- [ ] 编写单元测试

### 第 2 周：核心功能开发

- [ ] 创建 AutoExportService（包含导出方式检测）
- [ ] 创建 ProjectRecoveryService
- [ ] 集成测试（多浏览器环境）
- [ ] 错误处理完善

### 第 3 周：重构和集成

- [ ] 重构 TemplateExportImport
- [ ] 重构 ProjectStorageService
- [ ] 修改 ProjectManagementService
- [ ] 修改 HomePage 组件

### 第 4 周：优化和测试

- [ ] 性能优化
- [ ] 用户体验优化（浏览器兼容性提示）
- [ ] 全面测试（Chrome/Edge/Firefox/Safari/Electron）
- [ ] 文档完善

### 第 5 周：部署和验证

- [ ] 生产环境部署
- [ ] 用户反馈收集
- [ ] 问题修复
- [ ] 功能完善

## 🎯 成功指标

### 1. 功能指标

- **导出成功率**：>99%
- **导入成功率**：>99%
- **数据完整性**：100%

### 2. 性能指标

- **导出速度**：<5 秒（10MB 项目）
- **导入速度**：<3 秒（10MB 项目）
- **内存使用**：<100MB 峰值

### 3. 用户体验指标

- **操作便利性**：用户无需手动操作
- **错误恢复**：自动处理常见错误
- **数据安全**：零数据丢失

## 🔮 未来扩展

### 1. 云同步支持

- **云端备份**：支持云存储服务
- **多设备同步**：跨设备项目同步
- **版本控制**：项目版本管理

### 2. 高级功能

- **增量备份**：只备份变更部分
- **压缩存储**：文件压缩存储
- **加密保护**：敏感数据加密

### 3. 集成功能

- **团队协作**：多用户项目共享
- **版本历史**：项目版本历史查看
- **自动恢复**：崩溃后自动恢复

---

**文档版本**：2.0.0
**创建时间**：2025-01-27
**最后更新**：2025-01-27
**维护人员**：G-Asset Forge 开发团队
