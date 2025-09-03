import { type ProjectData } from '../project/types';
import { FileSystemAccessService } from './file_system_access_service';
import { ProjectDataService } from './project_data_service';

/**
 * 自动导出服务 - 负责项目的自动导出功能
 * 复用 ExportService 的逻辑，支持多环境文件系统访问
 */
export class AutoExportService {
  private projectDataService: ProjectDataService;
  private fileSystemService: FileSystemAccessService;

  constructor() {
    this.projectDataService = new ProjectDataService();
    this.fileSystemService = new FileSystemAccessService();
  }

  /**
   * 自动导出项目
   * @param projectData 项目数据
   * @returns Promise<boolean> 导出是否成功
   */
  async autoExportProject(projectData: ProjectData): Promise<boolean> {
    try {
      // 验证项目数据
      if (!this.projectDataService.validateProjectData(projectData)) {
        throw new Error('项目数据格式无效');
      }

      // 生成 GAF 内容
      const gafContent = this.generateGAFContent(projectData);

      // 创建 Blob（复用 ExportService 的逻辑）
      const blob = new Blob([gafContent], {
        type: 'application/json',
      });

      // 计算文件大小（用于调试）
      const fileSize = this.projectDataService.calculateFileSize(gafContent);
      console.log('GAF 文件大小:', fileSize, '字节');

      // 生成文件名
      const filename = this.generateAutoExportFilename(projectData);

      // 保存文件
      await this.fileSystemService.saveFile(filename, blob);

      console.log(`项目自动导出成功: ${filename}`);
      return true;
    } catch (error) {
      console.error('项目自动导出失败:', error);
      return false;
    }
  }

  /**
   * 生成 GAF 文件内容
   * @param projectData 项目数据
   * @returns string GAF 文件内容
   */
  private generateGAFContent(projectData: ProjectData): string {
    const exportMethod = this.fileSystemService.getExportMethod();
    const browserInfo = this.fileSystemService.getBrowserInfo();

    const gafData = this.projectDataService.transformProjectData(
      projectData,
      exportMethod,
      browserInfo,
    );

    // 计算文件大小
    const fileSize = this.projectDataService.calculateFileSize(gafData);
    gafData.metadata.fileSize = fileSize;

    return JSON.stringify(gafData, null, 2);
  }

  /**
   * 生成自动导出文件名（无时间戳，直接覆盖）
   * @param projectData 项目数据
   * @returns string 文件名
   */
  private generateAutoExportFilename(projectData: ProjectData): string {
    return this.projectDataService.generateSafeFilename(
      projectData.name,
      projectData.id,
    );
  }

  /**
   * 检查是否支持自动导出
   * @returns boolean 是否支持
   */
  isAutoExportSupported(): boolean {
    const features = this.fileSystemService.getSupportedFeatures();
    return features.fileSystemAccess || features.electron || features.download;
  }

  /**
   * 获取导出方式信息
   * @returns object 导出方式信息
   */
  getExportMethodInfo(): {
    method: 'electron' | 'directory' | 'download';
    description: string;
    isOptimal: boolean;
  } {
    const method = this.fileSystemService.getExportMethod();

    let description: string;
    let isOptimal: boolean;

    switch (method) {
      case 'electron':
        description = '使用 Electron 原生文件系统（推荐）';
        isOptimal = true;
        break;
      case 'directory':
        description = '使用浏览器目录访问 API（Chrome/Edge）';
        isOptimal = true;
        break;
      case 'download':
        description = '使用传统下载方式（Firefox/Safari）';
        isOptimal = false;
        break;
      default:
        description = '未知导出方式';
        isOptimal = false;
    }

    return {
      method,
      description,
      isOptimal,
    };
  }

  /**
   * 请求文件系统权限（仅 Chrome/Edge 需要）
   * @returns Promise<boolean> 是否成功获取权限
   */
  async requestFileSystemPermission(): Promise<boolean> {
    return this.fileSystemService.requestSavePermission();
  }

  /**
   * 获取浏览器兼容性信息
   * @returns object 兼容性信息
   */
  getBrowserCompatibilityInfo(): {
    browser: string;
    supportsFileSystemAccess: boolean;
    supportsElectron: boolean;
    recommendedMethod: string;
    warning?: string;
  } {
    const features = this.fileSystemService.getSupportedFeatures();
    const userAgent = navigator.userAgent;

    console.log('浏览器功能支持:', features);

    let browser = 'Unknown';
    let recommendedMethod = 'download';
    let warning: string | undefined;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
      recommendedMethod = features.fileSystemAccess ? 'directory' : 'download';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
      recommendedMethod = features.fileSystemAccess ? 'directory' : 'download';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      recommendedMethod = 'download';
      warning = 'Firefox 不支持目录访问，将使用下载模式';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      recommendedMethod = 'download';
      warning = 'Safari 不支持目录访问，将使用下载模式';
    } else if (features.electron) {
      browser = 'Electron';
      recommendedMethod = 'electron';
    }

    return {
      browser,
      supportsFileSystemAccess: features.fileSystemAccess,
      supportsElectron: features.electron,
      recommendedMethod,
      warning,
    };
  }
}
