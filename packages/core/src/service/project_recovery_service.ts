import { type ProjectData } from '../project/types';
import { FileReadService } from './file_read_service';
import {
  type GAFProjectData,
  ProjectDataService,
} from './project_data_service';

/**
 * 项目恢复服务 - 负责从 GAF 文件恢复项目数据
 * 复用现有的项目数据验证和转换逻辑
 */

// 使用全局类型声明
export class ProjectRecoveryService {
  private projectDataService: ProjectDataService;
  private fileReadService: FileReadService;

  constructor() {
    this.projectDataService = new ProjectDataService();
    this.fileReadService = new FileReadService();
  }

  /**
   * 从 GAF 文件恢复项目
   * @param file GAF 文件
   * @returns Promise<ProjectData | null> 恢复的项目数据
   */
  async recoverProjectFromGAF(file: File): Promise<ProjectData | null> {
    try {
      // 读取文件内容
      const content = await this.fileReadService.readTextFile(file);

      // 解析 JSON
      const gafData = JSON.parse(content) as GAFProjectData;

      // 验证 GAF 数据格式
      if (!this.projectDataService.validateGAFData(gafData)) {
        throw new Error('GAF 文件格式无效');
      }

      // 验证校验和
      const projectData = this.projectDataService.transformGAFData(gafData);
      if (
        !this.projectDataService.verifyChecksum(
          projectData,
          gafData.metadata.checksum,
        )
      ) {
        console.warn('校验和不匹配，但继续恢复项目');
      }

      // 验证项目数据
      if (!this.projectDataService.validateProjectData(projectData)) {
        throw new Error('项目数据格式无效');
      }

      console.log(`项目恢复成功: ${projectData.name}`);
      return projectData;
    } catch (error) {
      console.error('项目恢复失败:', error);
      return null;
    }
  }

  /**
   * 从 GAF 文件内容恢复项目
   * @param content GAF 文件内容
   * @returns ProjectData | null 恢复的项目数据
   */
  recoverProjectFromContent(content: string): ProjectData | null {
    try {
      // 解析 JSON
      const gafData = JSON.parse(content) as GAFProjectData;

      // 验证 GAF 数据格式
      if (!this.projectDataService.validateGAFData(gafData)) {
        throw new Error('GAF 文件格式无效');
      }

      // 验证校验和
      const projectData = this.projectDataService.transformGAFData(gafData);
      if (
        !this.projectDataService.verifyChecksum(
          projectData,
          gafData.metadata.checksum,
        )
      ) {
        console.warn('校验和不匹配，但继续恢复项目');
      }

      // 验证项目数据
      if (!this.projectDataService.validateProjectData(projectData)) {
        throw new Error('项目数据格式无效');
      }

      console.log(`项目恢复成功: ${projectData.name}`);
      return projectData;
    } catch (error) {
      console.error('项目恢复失败:', error);
      return null;
    }
  }

  /**
   * 批量恢复项目
   * @param files GAF 文件列表
   * @returns Promise<ProjectData[]> 恢复的项目数据列表
   */
  async recoverMultipleProjects(files: File[]): Promise<ProjectData[]> {
    const recoveredProjects: ProjectData[] = [];

    for (const file of files) {
      const project = await this.recoverProjectFromGAF(file);
      if (project) {
        recoveredProjects.push(project);
      }
    }

    return recoveredProjects;
  }

  /**
   * 验证 GAF 文件
   * @param file GAF 文件
   * @returns Promise<boolean> 是否为有效的 GAF 文件
   */
  async validateGAFFile(file: File): Promise<boolean> {
    try {
      const content = await this.fileReadService.readTextFile(file);
      const gafData = JSON.parse(content) as GAFProjectData;
      return this.projectDataService.validateGAFData(gafData);
    } catch (error) {
      console.error('GAF 文件验证失败:', error);
      return false;
    }
  }

  /**
   * 获取 GAF 文件信息
   * @param file GAF 文件
   * @returns Promise<GAFFileInfo | null> GAF 文件信息
   */
  async getGAFFileInfo(file: File): Promise<GAFFileInfo | null> {
    try {
      const content = await this.fileReadService.readTextFile(file);
      const gafData = JSON.parse(content) as GAFProjectData;

      if (!this.projectDataService.validateGAFData(gafData)) {
        return null;
      }

      return {
        projectName: gafData.project.name,
        projectType: gafData.project.type,
        exportType: gafData.metadata.exportType,
        exportMethod: gafData.metadata.exportMethod,
        exportedAt: gafData.metadata.exportedAt,
        fileSize: gafData.metadata.fileSize,
        browserInfo: gafData.metadata.browserInfo,
        version: gafData.version,
        appVersion: gafData.appVersion,
        schemaVersion: gafData.schemaVersion,
      };
    } catch (error) {
      console.error('获取 GAF 文件信息失败:', error);
      return null;
    }
  }

  /**
   * 检查 GAF 文件兼容性
   * @param file GAF 文件
   * @returns Promise<CompatibilityInfo> 兼容性信息
   */
  async checkGAFFileCompatibility(file: File): Promise<CompatibilityInfo> {
    try {
      const content = await this.fileReadService.readTextFile(file);
      const gafData = JSON.parse(content) as GAFProjectData;

      if (!this.projectDataService.validateGAFData(gafData)) {
        return {
          isCompatible: false,
          reason: 'GAF 文件格式无效',
          warnings: [],
        };
      }

      const warnings: string[] = [];
      let isCompatible = true;

      // 检查版本兼容性
      if (gafData.schemaVersion !== '1.0.0') {
        warnings.push(`未知的数据结构版本: ${gafData.schemaVersion}`);
        isCompatible = false;
      }

      // 检查应用版本
      if (gafData.appVersion !== 'g-asset-forge-editor_1.0.0') {
        warnings.push(`不同的应用版本: ${gafData.appVersion}`);
      }

      // 检查导出方式
      if (gafData.metadata.exportMethod === 'electron' && !this.isElectron()) {
        warnings.push('文件在 Electron 环境中导出，当前环境可能不完全兼容');
      }

      return {
        isCompatible,
        reason: isCompatible ? '兼容' : '存在兼容性问题',
        warnings,
      };
    } catch (error) {
      return {
        isCompatible: false,
        reason: `文件解析失败: ${
          error instanceof Error ? error.message : '未知错误'
        }`,
        warnings: [],
      };
    }
  }

  /**
   * 检查是否在 Electron 环境中
   * @returns boolean 是否在 Electron 环境
   */
  private isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.process !== 'undefined' &&
      window.process.type === 'renderer'
    );
  }
}

/**
 * GAF 文件信息接口
 */
export interface GAFFileInfo {
  projectName: string;
  projectType: 'design' | 'h5';
  exportType: 'design-mode' | 'h5-mode';
  exportMethod: 'directory' | 'download' | 'electron';
  exportedAt: string;
  fileSize: number;
  browserInfo: string;
  version: string;
  appVersion: string;
  schemaVersion: string;
}

/**
 * 兼容性信息接口
 */
export interface CompatibilityInfo {
  isCompatible: boolean;
  reason: string;
  warnings: string[];
}
