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

      // 确保有文件系统访问权限（自动导出需要保存到指定目录，不是下载目录）
      const hasPermission = await this.ensureFileSystemPermission();
      if (!hasPermission) {
        console.warn('无法获取文件系统权限，自动导出将使用下载模式');
        // 在浏览器环境中，如果用户拒绝了文件系统权限，我们仍然继续导出
        // 但会降级到下载模式，文件将保存到下载目录
        // 这是为了确保自动导出功能仍然可用，即使不是最理想的保存位置
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
  generateAutoExportFilename(projectData: ProjectData): string {
    return this.projectDataService.generateSafeFilename(
      projectData.name,
      projectData.id,
    );
  }

  /**
   * 删除导出的文件
   * @param filename 文件名
   * @returns Promise<boolean> 删除是否成功
   */
  async deleteExportedFile(filename: string): Promise<boolean> {
    try {
      await this.fileSystemService.deleteFile(filename);
      console.log('已删除导出文件:', filename);
      return true;
    } catch (error) {
      console.error('删除导出文件失败:', error);
      return false;
    }
  }

  /**
   * 从导出的文件加载项目数据
   * @param filename 文件名
   * @returns Promise<ProjectData | null> 项目数据
   */
  async loadExportedFile(filename: string): Promise<ProjectData | null> {
    try {
      const fileContent = await this.fileSystemService.readFile(filename);
      if (!fileContent) {
        return null;
      }

      // 解析GAF文件内容
      const gafData = JSON.parse(fileContent);

      // 验证GAF数据格式
      if (!this.projectDataService.validateGAFData(gafData)) {
        console.error('导出的文件数据格式无效:', filename);
        return null;
      }

      // 将GAF数据转换为项目数据格式
      const projectData = this.projectDataService.transformGAFData(gafData);

      console.log('从导出文件加载数据成功:', filename);
      return projectData;
    } catch (error) {
      console.warn('从导出文件加载数据失败:', error);
      return null;
    }
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
   * 确保有文件系统访问权限（用于自动导出）
   * @returns Promise<boolean> 是否有权限
   */
  private async ensureFileSystemPermission(): Promise<boolean> {
    // 检查是否已经有权限
    if (this.fileSystemService.hasDirectoryAccess()) {
      console.log('自动导出：文件系统权限已存在');
      return true;
    }

    // 在 Electron 环境中，总是有权限
    if (this.fileSystemService.isElectron()) {
      return true;
    }

    // 在浏览器环境中，尝试恢复权限
    if (this.fileSystemService.isSupported()) {
      // 获取权限恢复提示
      const restoreHint = this.fileSystemService.getPermissionRestoreHint();
      if (restoreHint) {
        console.log('自动导出：', restoreHint);
        console.log('自动导出：请重新选择相同目录以恢复权限');
      } else {
        console.log('自动导出：检测到支持文件系统访问，尝试请求用户授权');
        console.log(
          '提示：请选择 Downloads 目录，应用将自动创建 G-Asset Forge 子目录',
        );
        console.log(
          '您只需要点击"选择文件夹"按钮，文件将保存到 Downloads/G-Asset Forge/ 目录',
        );
      }

      try {
        const hasPermission =
          await this.fileSystemService.requestSavePermission();
        if (hasPermission) {
          console.log('自动导出：文件系统访问权限获取成功');
          return true;
        } else {
          console.warn('自动导出：用户拒绝了文件系统访问权限，将使用下载模式');
          return false;
        }
      } catch (error) {
        console.error('自动导出：请求文件系统权限时出错:', error);
        return false;
      }
    }

    // 不支持的浏览器
    console.warn('自动导出：浏览器不支持文件系统访问 API');
    return false;
  }

  /**
   * 检查用户是否已经授权文件系统访问
   * @returns boolean 是否已授权
   */
  hasFileSystemPermission(): boolean {
    return this.fileSystemService.hasDirectoryAccess();
  }

  /**
   * 引导用户进行一次性文件系统授权
   * @returns Promise<boolean> 是否授权成功
   */
  async guideUserToAuthorize(): Promise<boolean> {
    if (this.fileSystemService.isElectron()) {
      console.log('Electron 环境无需授权');
      return true;
    }

    if (!this.fileSystemService.isSupported()) {
      console.warn('浏览器不支持文件系统访问 API');
      return false;
    }

    console.log('正在引导用户授权文件系统访问...');
    console.log(
      '提示：请选择 Downloads 目录，应用将自动创建 G-Asset Forge 子目录',
    );
    console.log(
      '您只需要点击"选择文件夹"按钮，文件将保存到 Downloads/G-Asset Forge/ 目录',
    );

    const granted = await this.fileSystemService.requestSavePermission();
    if (granted) {
      console.log(
        '文件系统访问授权成功！自动导出将保存到 Downloads/G-Asset Forge/ 目录',
      );
      return true;
    } else {
      console.log('用户取消了授权，自动导出将使用下载模式');
      return false;
    }
  }

  /**
   * 检查自动导出是否使用了正确的保存方式
   * @returns object 保存方式信息
   */
  getAutoExportSaveMethod(): {
    method: 'electron' | 'directory' | 'download';
    isOptimal: boolean;
    description: string;
    warning?: string;
  } {
    const method = this.fileSystemService.getExportMethod();
    const hasPermission = this.fileSystemService.hasDirectoryAccess();
    const isElectron = this.fileSystemService.isElectron();

    let isOptimal = true;
    let description = '';
    let warning: string | undefined;

    switch (method) {
      case 'electron':
        description = '使用 Electron 原生文件系统（推荐）';
        isOptimal = true;
        break;
      case 'directory':
        if (hasPermission) {
          description = '使用浏览器目录访问 API（推荐）';
          isOptimal = true;
          // 不再显示"非最优选择"警告，因为用户已经成功授权
        } else {
          description = '使用浏览器目录访问 API（需要用户授权）';
          isOptimal = false;
          warning =
            '请选择 Downloads 目录，应用将自动创建 G-Asset Forge 子目录';
        }
        break;
      case 'download':
        description = '使用传统下载方式（文件将保存到下载目录）';
        isOptimal = false;
        if (!isElectron) {
          warning =
            '文件将保存到浏览器下载目录。Chrome/Edge 用户可以授权文件系统访问权限来改善体验（将保存到 Downloads/G-Asset Forge/ 目录）';
        }
        break;
    }

    return {
      method,
      isOptimal,
      description,
      warning,
    };
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
