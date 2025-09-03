import { type ProjectData, type ProjectSettings } from '../project/types';
import { validateProjectData as validateProjectDataUtil } from '../project/utils';

/**
 * GAF 项目数据接口（导出文件格式）
 */
export interface GAFProjectData {
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
    data: any[]; // 图形数据
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

/**
 * 项目数据服务 - 封装项目数据验证、转换和校验和计算
 */
export class ProjectDataService {
  /**
   * 验证项目数据格式
   * @param data 要验证的数据
   * @returns 是否为有效的项目数据
   */
  validateProjectData(data: any): data is ProjectData {
    return validateProjectDataUtil(data);
  }

  /**
   * 验证 GAF 文件数据格式
   * @param data 要验证的 GAF 数据
   * @returns 是否为有效的 GAF 数据
   */
  validateGAFData(data: any): data is GAFProjectData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 检查必需字段
    const requiredFields = [
      'version',
      'appVersion',
      'schemaVersion',
      'project',
      'editorData',
      'metadata',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(`GAF 数据缺少必需字段: ${field}`);
        return false;
      }
    }

    // 检查项目数据
    if (!data.project || typeof data.project !== 'object') {
      console.error('GAF 项目数据格式无效');
      return false;
    }

    const requiredProjectFields = [
      'id',
      'name',
      'description',
      'type',
      'createdAt',
      'updatedAt',
      'lastOpenedAt',
      'settings',
      'usedAssets',
      'usedTemplates',
    ];

    for (const field of requiredProjectFields) {
      if (!(field in data.project)) {
        console.error(`GAF 项目数据缺少必需字段: ${field}`);
        return false;
      }
    }

    // 检查项目类型
    if (!['design', 'h5'].includes(data.project.type)) {
      console.error('GAF 项目类型无效:', data.project.type);
      return false;
    }

    // 检查编辑器数据
    if (
      !data.editorData ||
      !data.editorData.paperId ||
      !Array.isArray(data.editorData.data)
    ) {
      console.error('GAF 编辑器数据格式无效');
      return false;
    }

    // 检查元数据
    if (!data.metadata || typeof data.metadata !== 'object') {
      console.error('GAF 元数据格式无效');
      return false;
    }

    const requiredMetadataFields = [
      'exportedAt',
      'exportType',
      'exportMethod',
      'checksum',
      'fileSize',
      'browserInfo',
    ];

    for (const field of requiredMetadataFields) {
      if (!(field in data.metadata)) {
        console.error(`GAF 元数据缺少必需字段: ${field}`);
        return false;
      }
    }

    // 检查导出类型
    if (!['design-mode', 'h5-mode'].includes(data.metadata.exportType)) {
      console.error('GAF 导出类型无效:', data.metadata.exportType);
      return false;
    }

    // 检查导出方式
    if (
      !['directory', 'download', 'electron'].includes(
        data.metadata.exportMethod,
      )
    ) {
      console.error('GAF 导出方式无效:', data.metadata.exportMethod);
      return false;
    }

    return true;
  }

  /**
   * 计算数据校验和
   * @param data 要计算校验和的数据
   * @returns 校验和字符串
   */
  calculateChecksum(data: any): string {
    try {
      const jsonString = JSON.stringify(data, null, 0);
      let hash = 0;

      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // 转换为32位整数
      }

      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('计算校验和失败:', error);
      return '0';
    }
  }

  /**
   * 将项目数据转换为 GAF 格式
   * @param projectData 项目数据
   * @param exportMethod 导出方式
   * @param browserInfo 浏览器信息
   * @returns GAF 格式数据
   */
  transformProjectData(
    projectData: ProjectData,
    exportMethod: 'directory' | 'download' | 'electron' = 'download',
    browserInfo: string = navigator.userAgent,
  ): GAFProjectData {
    const now = new Date().toISOString();

    return {
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
      editorData: {
        appVersion: projectData.editorData.appVersion,
        paperId: projectData.editorData.paperId,
        data: projectData.editorData.data,
      },
      metadata: {
        exportedAt: now,
        exportType: projectData.type === 'h5' ? 'h5-mode' : 'design-mode',
        exportMethod,
        checksum: this.calculateChecksum(projectData),
        fileSize: 0, // 将在生成文件时计算
        browserInfo,
      },
    };
  }

  /**
   * 将 GAF 数据转换为项目数据
   * @param gafData GAF 格式数据
   * @returns 项目数据
   */
  transformGAFData(gafData: GAFProjectData): ProjectData {
    return {
      id: gafData.project.id,
      name: gafData.project.name,
      description: gafData.project.description,
      type: gafData.project.type,
      editorData: {
        appVersion: gafData.editorData.appVersion,
        paperId: gafData.editorData.paperId,
        data: gafData.editorData.data,
      },
      settings: gafData.project.settings,
      createdAt: new Date(gafData.project.createdAt),
      updatedAt: new Date(gafData.project.updatedAt),
      lastOpenedAt: new Date(gafData.project.lastOpenedAt),
      usedAssets: gafData.project.usedAssets,
      usedTemplates: gafData.project.usedTemplates,
      version: gafData.version,
      appVersion: gafData.appVersion,
    };
  }

  /**
   * 验证校验和
   * @param data 要验证的数据
   * @param expectedChecksum 期望的校验和
   * @returns 校验和是否匹配
   */
  verifyChecksum(data: any, expectedChecksum: string): boolean {
    const actualChecksum = this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  /**
   * 生成安全的文件名
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 安全的文件名
   */
  generateSafeFilename(projectName: string, projectId: string): string {
    const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    return `${safeName}_${projectId}.gaf`;
  }

  /**
   * 计算文件大小
   * @param data 要计算大小的数据
   * @returns 文件大小（字节）
   */
  calculateFileSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch (error) {
      console.error('计算文件大小失败:', error);
      return 0;
    }
  }
}
