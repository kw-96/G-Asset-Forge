/**
 * 项目数据验证器
 * 提供项目数据格式的严格验证逻辑、数据完整性检查和自动修复功能
 */

import type { IEditorPaperData } from '../type';
import type { DesignProjectData } from './project-handlers/DesignProjectHandler';
import type {
  ContentBlockData,
  H5ProjectData,
} from './project-handlers/H5ProjectHandler';
import type { ProjectData } from './project-handlers/ProjectHandler';
import { ProjectType } from './ProjectTypeManager';

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixedIssues?: string[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  severity: 'critical' | 'major' | 'minor';
  autoFixable: boolean;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * 数据模式定义
 */
export interface DataSchema {
  type: ProjectType;
  version: string;
  requiredFields: string[];
  optionalFields: string[];
  validators: Array<(data: any) => ValidationResult>;
}

/**
 * 修复选项
 */
export interface RepairOptions {
  autoFix: boolean;
  preserveUserData: boolean;
  addMissingFields: boolean;
  removeInvalidFields: boolean;
  updateVersion: boolean;
}

/**
 * 项目数据验证器
 * 负责验证项目数据格式、完整性检查和自动修复
 */
export class ProjectDataValidator {
  private schemas: Map<ProjectType, DataSchema> = new Map();
  private supportedVersions: Map<ProjectType, string[]> = new Map();

  constructor() {
    this.initializeSchemas();
    this.initializeSupportedVersions();
  }

  /**
   * 验证项目数据
   */
  async validateProjectData(
    data: unknown,
    expectedType?: ProjectType,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // 基础类型检查
      if (!this.isValidProjectData(data)) {
        result.errors.push({
          code: 'INVALID_DATA_TYPE',
          message: '项目数据必须是有效的对象',
          severity: 'critical',
          autoFixable: false,
        });
        result.isValid = false;
        return result;
      }

      const projectData = data as ProjectData;

      // 项目类型验证
      const typeValidation = this.validateProjectType(
        projectData,
        expectedType,
      );
      this.mergeValidationResults(result, typeValidation);

      // 版本兼容性检查
      const versionValidation = this.validateVersion(projectData);
      this.mergeValidationResults(result, versionValidation);

      // 数据结构验证
      const structureValidation = await this.validateDataStructure(projectData);
      this.mergeValidationResults(result, structureValidation);

      // 项目类型特定验证
      const typeSpecificValidation = await this.validateTypeSpecificData(
        projectData,
      );
      this.mergeValidationResults(result, typeSpecificValidation);

      // 数据完整性检查
      const integrityValidation = await this.validateDataIntegrity(projectData);
      this.mergeValidationResults(result, integrityValidation);

      console.log(
        `项目数据验证完成: ${result.isValid ? '通过' : '失败'}, 错误: ${
          result.errors.length
        }, 警告: ${result.warnings.length}`,
      );
    } catch (error) {
      result.errors.push({
        code: 'VALIDATION_ERROR',
        message: `验证过程中发生异常: ${(error as Error).message}`,
        severity: 'critical',
        autoFixable: false,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 修复项目数据
   */
  async repairProjectData(
    data: ProjectData,
    options: RepairOptions = {
      autoFix: true,
      preserveUserData: true,
      addMissingFields: true,
      removeInvalidFields: false,
      updateVersion: true,
    },
  ): Promise<{ data: ProjectData; result: ValidationResult }> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixedIssues: [],
    };

    try {
      let repairedData = { ...data };

      // 修复基础结构
      repairedData = this.repairBasicStructure(repairedData, options, result);

      // 修复版本信息
      repairedData = this.repairVersionInfo(repairedData, options, result);

      // 修复项目类型特定数据
      repairedData = await this.repairTypeSpecificData(
        repairedData,
        options,
        result,
      );

      // 修复数据完整性
      repairedData = await this.repairDataIntegrity(
        repairedData,
        options,
        result,
      );

      // 最终验证
      const finalValidation = await this.validateProjectData(
        repairedData,
        repairedData.type,
      );
      if (!finalValidation.isValid) {
        result.errors.push(...finalValidation.errors);
        result.warnings.push(...finalValidation.warnings);
        result.isValid = false;
      }

      console.log(
        `项目数据修复完成: 修复了 ${result.fixedIssues?.length || 0} 个问题`,
      );

      return { data: repairedData, result };
    } catch (error) {
      result.errors.push({
        code: 'REPAIR_ERROR',
        message: `修复过程中发生异常: ${(error as Error).message}`,
        severity: 'critical',
        autoFixable: false,
      });
      result.isValid = false;

      return { data, result };
    }
  }

  /**
   * 获取项目类型的数据模式
   */
  getSchema(type: ProjectType): DataSchema | null {
    return this.schemas.get(type) || null;
  }

  /**
   * 检查版本兼容性
   */
  isVersionSupported(type: ProjectType, version: string): boolean {
    const supportedVersions = this.supportedVersions.get(type);
    return supportedVersions ? supportedVersions.includes(version) : false;
  }

  /**
   * 获取最新版本
   */
  getLatestVersion(type: ProjectType): string {
    const versions = this.supportedVersions.get(type);
    return versions ? versions[versions.length - 1] : '1.0.0';
  }

  // 私有方法

  /**
   * 初始化数据模式
   */
  private initializeSchemas(): void {
    // 设计项目模式
    this.schemas.set(ProjectType.DESIGN, {
      type: ProjectType.DESIGN,
      version: '1.0.0',
      requiredFields: ['type', 'data'],
      optionalFields: ['metadata', 'state'],
      validators: [
        this.validateDesignProjectStructure.bind(this),
        this.validateEditorPaperData.bind(this),
      ],
    });

    // H5项目模式
    this.schemas.set(ProjectType.H5, {
      type: ProjectType.H5,
      version: '1.0.0',
      requiredFields: ['type', 'data'],
      optionalFields: ['metadata', 'state', 'h5Container', 'contentBlocks'],
      validators: [
        this.validateH5ProjectStructure.bind(this),
        this.validateH5ContainerData.bind(this),
        this.validateContentBlocksData.bind(this),
      ],
    });
  }

  /**
   * 初始化支持的版本
   */
  private initializeSupportedVersions(): void {
    this.supportedVersions.set(ProjectType.DESIGN, ['1.0.0']);
    this.supportedVersions.set(ProjectType.H5, ['1.0.0']);
  }

  /**
   * 检查是否为有效的项目数据
   */
  private isValidProjectData(data: unknown): data is ProjectData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      'data' in data
    );
  }

  /**
   * 验证项目类型
   */
  private validateProjectType(
    data: ProjectData,
    expectedType?: ProjectType,
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // 检查项目类型是否有效
    if (!Object.values(ProjectType).includes(data.type)) {
      result.errors.push({
        code: 'INVALID_PROJECT_TYPE',
        message: `无效的项目类型: ${data.type}`,
        path: 'type',
        severity: 'critical',
        autoFixable: false,
      });
      result.isValid = false;
    }

    // 检查项目类型是否匹配预期
    if (expectedType && data.type !== expectedType) {
      result.errors.push({
        code: 'PROJECT_TYPE_MISMATCH',
        message: `项目类型不匹配，期望: ${expectedType}, 实际: ${data.type}`,
        path: 'type',
        severity: 'major',
        autoFixable: false,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证版本信息
   */
  private validateVersion(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const version = data.metadata?.version;

    if (!version) {
      result.warnings.push({
        code: 'MISSING_VERSION',
        message: '缺少版本信息',
        path: 'metadata.version',
        suggestion: '建议添加版本信息以确保兼容性',
      });
    } else if (!this.isVersionSupported(data.type, version)) {
      result.errors.push({
        code: 'UNSUPPORTED_VERSION',
        message: `不支持的版本: ${version}`,
        path: 'metadata.version',
        severity: 'major',
        autoFixable: true,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证数据结构
   */
  private async validateDataStructure(
    data: ProjectData,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const schema = this.schemas.get(data.type);
    if (!schema) {
      result.errors.push({
        code: 'UNKNOWN_PROJECT_TYPE',
        message: `未知的项目类型: ${data.type}`,
        severity: 'critical',
        autoFixable: false,
      });
      result.isValid = false;
      return result;
    }

    // 检查必需字段
    for (const field of schema.requiredFields) {
      if (!(field in data)) {
        result.errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          message: `缺少必需字段: ${field}`,
          path: field,
          severity: 'critical',
          autoFixable: true,
        });
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * 验证项目类型特定数据
   */
  private async validateTypeSpecificData(
    data: ProjectData,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const schema = this.schemas.get(data.type);
    if (!schema) {
      return result;
    }

    // 运行项目类型特定的验证器
    for (const validator of schema.validators) {
      const validationResult = validator(data);
      this.mergeValidationResults(result, validationResult);
    }

    return result;
  }

  /**
   * 验证数据完整性
   */
  private async validateDataIntegrity(
    data: ProjectData,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // 验证编辑器数据
      if (data.data) {
        const editorDataValidation = this.validateEditorPaperData(data);
        this.mergeValidationResults(result, editorDataValidation);
      }

      // 验证元数据
      if (data.metadata) {
        const metadataValidation = this.validateMetadata(data.metadata);
        this.mergeValidationResults(result, metadataValidation);
      }
    } catch (error) {
      result.errors.push({
        code: 'INTEGRITY_CHECK_ERROR',
        message: `数据完整性检查失败: ${(error as Error).message}`,
        severity: 'major',
        autoFixable: false,
      });
      result.isValid = false;
    }

    return result;
  }

  // 项目类型特定验证器

  /**
   * 验证设计项目结构
   */
  private validateDesignProjectStructure(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const designData = data as DesignProjectData;

    // 检查是否包含H5特定字段
    if ('h5Container' in designData || 'contentBlocks' in designData) {
      result.errors.push({
        code: 'DESIGN_PROJECT_CONTAINS_H5_DATA',
        message: '设计项目不应包含H5特定数据',
        severity: 'major',
        autoFixable: true,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证H5项目结构
   */
  private validateH5ProjectStructure(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const h5Data = data as H5ProjectData;

    // H5项目应该有H5Container或contentBlocks
    if (
      !h5Data.h5Container &&
      (!h5Data.contentBlocks || h5Data.contentBlocks.length === 0)
    ) {
      result.warnings.push({
        code: 'H5_PROJECT_MISSING_CONTAINER_OR_BLOCKS',
        message: 'H5项目缺少H5Container或内容块',
        suggestion: '建议添加H5Container或内容块以确保项目完整性',
      });
    }

    return result;
  }

  /**
   * 验证编辑器数据
   */
  private validateEditorPaperData(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const editorData = data.data as IEditorPaperData;

    if (!editorData) {
      result.errors.push({
        code: 'MISSING_EDITOR_DATA',
        message: '缺少编辑器数据',
        path: 'data',
        severity: 'critical',
        autoFixable: false,
      });
      result.isValid = false;
      return result;
    }

    // 验证基础字段
    if (!editorData.canvases || !Array.isArray(editorData.canvases)) {
      result.errors.push({
        code: 'INVALID_CANVASES_DATA',
        message: '画布数据无效或缺失',
        path: 'data.canvases',
        severity: 'critical',
        autoFixable: true,
      });
      result.isValid = false;
    }

    if (!editorData.graphics || !Array.isArray(editorData.graphics)) {
      result.errors.push({
        code: 'INVALID_GRAPHICS_DATA',
        message: '图形数据无效或缺失',
        path: 'data.graphics',
        severity: 'critical',
        autoFixable: true,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证H5容器数据
   */
  private validateH5ContainerData(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const h5Data = data as H5ProjectData;

    if (h5Data.h5Container) {
      const container = h5Data.h5Container;

      // 验证必需字段
      if (!container.id) {
        result.errors.push({
          code: 'H5_CONTAINER_MISSING_ID',
          message: 'H5容器缺少ID',
          path: 'h5Container.id',
          severity: 'critical',
          autoFixable: true,
        });
        result.isValid = false;
      }

      if (container.type !== 'H5Container') {
        result.errors.push({
          code: 'H5_CONTAINER_INVALID_TYPE',
          message: `H5容器类型无效: ${container.type}`,
          path: 'h5Container.type',
          severity: 'major',
          autoFixable: true,
        });
        result.isValid = false;
      }

      // 验证尺寸
      if (container.width <= 0 || container.height <= 0) {
        result.errors.push({
          code: 'H5_CONTAINER_INVALID_SIZE',
          message: 'H5容器尺寸无效',
          path: 'h5Container',
          severity: 'major',
          autoFixable: true,
        });
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * 验证内容块数据
   */
  private validateContentBlocksData(data: ProjectData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const h5Data = data as H5ProjectData;

    if (h5Data.contentBlocks && Array.isArray(h5Data.contentBlocks)) {
      const blockIds = new Set<string>();

      for (let i = 0; i < h5Data.contentBlocks.length; i++) {
        const block = h5Data.contentBlocks[i];
        const path = `contentBlocks[${i}]`;

        // 验证必需字段
        if (!block.id) {
          result.errors.push({
            code: 'CONTENT_BLOCK_MISSING_ID',
            message: `内容块缺少ID`,
            path: `${path}.id`,
            severity: 'critical',
            autoFixable: true,
          });
          result.isValid = false;
        } else {
          // 检查ID重复
          if (blockIds.has(block.id)) {
            result.errors.push({
              code: 'CONTENT_BLOCK_DUPLICATE_ID',
              message: `内容块ID重复: ${block.id}`,
              path: `${path}.id`,
              severity: 'major',
              autoFixable: true,
            });
            result.isValid = false;
          }
          blockIds.add(block.id);
        }

        // 验证类型
        const validTypes = ['H5TextBlock', 'H5ImageBlock', 'H5ButtonBlock'];
        if (!validTypes.includes(block.type)) {
          result.errors.push({
            code: 'CONTENT_BLOCK_INVALID_TYPE',
            message: `内容块类型无效: ${block.type}`,
            path: `${path}.type`,
            severity: 'major',
            autoFixable: false,
          });
          result.isValid = false;
        }

        // 验证顺序
        if (typeof block.order !== 'number' || block.order < 0) {
          result.errors.push({
            code: 'CONTENT_BLOCK_INVALID_ORDER',
            message: `内容块顺序无效: ${block.order}`,
            path: `${path}.order`,
            severity: 'minor',
            autoFixable: true,
          });
        }
      }
    }

    return result;
  }

  /**
   * 验证元数据
   */
  private validateMetadata(metadata: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // 验证时间戳
    if (metadata.createdAt && !(metadata.createdAt instanceof Date)) {
      result.warnings.push({
        code: 'INVALID_CREATED_AT',
        message: '创建时间格式无效',
        path: 'metadata.createdAt',
        suggestion: '应该是Date对象',
      });
    }

    if (metadata.updatedAt && !(metadata.updatedAt instanceof Date)) {
      result.warnings.push({
        code: 'INVALID_UPDATED_AT',
        message: '更新时间格式无效',
        path: 'metadata.updatedAt',
        suggestion: '应该是Date对象',
      });
    }

    return result;
  }

  // 修复方法

  /**
   * 修复基础结构
   */
  private repairBasicStructure(
    data: ProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): ProjectData {
    const repairedData = { ...data };

    if (options.addMissingFields) {
      // 添加缺失的元数据
      if (!repairedData.metadata) {
        repairedData.metadata = {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: this.getLatestVersion(data.type),
        };
        result.fixedIssues?.push('添加了缺失的元数据');
      }

      // 确保数据字段存在
      if (!repairedData.data) {
        repairedData.data = {
          canvases: [],
          graphics: [],
        };
        result.fixedIssues?.push('添加了缺失的编辑器数据结构');
      }
    }

    return repairedData;
  }

  /**
   * 修复版本信息
   */
  private repairVersionInfo(
    data: ProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): ProjectData {
    const repairedData = { ...data };

    if (options.updateVersion) {
      if (!repairedData.metadata) {
        repairedData.metadata = {};
      }

      const currentVersion = repairedData.metadata.version;
      const latestVersion = this.getLatestVersion(data.type);

      if (
        !currentVersion ||
        !this.isVersionSupported(data.type, currentVersion)
      ) {
        repairedData.metadata.version = latestVersion;
        result.fixedIssues?.push(`更新版本信息为 ${latestVersion}`);
      }
    }

    return repairedData;
  }

  /**
   * 修复项目类型特定数据
   */
  private async repairTypeSpecificData(
    data: ProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): Promise<ProjectData> {
    let repairedData = { ...data };

    if (data.type === ProjectType.DESIGN) {
      repairedData = this.repairDesignProjectData(
        repairedData as DesignProjectData,
        options,
        result,
      );
    } else if (data.type === ProjectType.H5) {
      repairedData = this.repairH5ProjectData(
        repairedData as H5ProjectData,
        options,
        result,
      );
    }

    return repairedData;
  }

  /**
   * 修复设计项目数据
   */
  private repairDesignProjectData(
    data: DesignProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): DesignProjectData {
    const repairedData = { ...data };

    if (options.removeInvalidFields) {
      // 移除H5特定字段
      if ('h5Container' in repairedData) {
        delete (repairedData as any).h5Container;
        result.fixedIssues?.push('移除了设计项目中的H5容器数据');
      }

      if ('contentBlocks' in repairedData) {
        delete (repairedData as any).contentBlocks;
        result.fixedIssues?.push('移除了设计项目中的内容块数据');
      }
    }

    return repairedData;
  }

  /**
   * 修复H5项目数据
   */
  private repairH5ProjectData(
    data: H5ProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): H5ProjectData {
    const repairedData = { ...data };

    if (options.addMissingFields) {
      // 添加默认H5容器
      if (!repairedData.h5Container) {
        repairedData.h5Container = {
          id: `h5_container_${Date.now()}`,
          type: 'H5Container',
          width: 1080,
          height: 2220,
          backgroundColor: '#ffffff',
          padding: 16,
          gap: 12,
          autoLayout: true,
          childrenIds: [],
          children: [], // 添加子元素数组
        };
        result.fixedIssues?.push('添加了默认H5容器');
      }

      // 初始化内容块数组
      if (!repairedData.contentBlocks) {
        repairedData.contentBlocks = [];
        result.fixedIssues?.push('初始化了内容块数组');
      }
    }

    // 修复内容块数据
    if (
      repairedData.contentBlocks &&
      Array.isArray(repairedData.contentBlocks)
    ) {
      const seenIds = new Set<string>();
      const validBlocks: ContentBlockData[] = [];

      for (let i = 0; i < repairedData.contentBlocks.length; i++) {
        const block = { ...repairedData.contentBlocks[i] };

        // 修复缺失的ID
        if (!block.id) {
          block.id = `content_block_${Date.now()}_${i}`;
          result.fixedIssues?.push(`为内容块添加了ID: ${block.id}`);
        }

        // 处理重复ID
        if (seenIds.has(block.id)) {
          block.id = `${block.id}_${Date.now()}`;
          result.fixedIssues?.push(`修复了重复的内容块ID: ${block.id}`);
        }
        seenIds.add(block.id);

        // 修复顺序
        if (typeof block.order !== 'number' || block.order < 0) {
          block.order = i;
          result.fixedIssues?.push(`修复了内容块顺序: ${block.id}`);
        }

        // 修复父容器ID
        if (!block.parentId && repairedData.h5Container) {
          block.parentId = repairedData.h5Container.id;
          result.fixedIssues?.push(`设置了内容块的父容器ID: ${block.id}`);
        }

        validBlocks.push(block);
      }

      repairedData.contentBlocks = validBlocks;
    }

    return repairedData;
  }

  /**
   * 修复数据完整性
   */
  private async repairDataIntegrity(
    data: ProjectData,
    options: RepairOptions,
    result: ValidationResult,
  ): Promise<ProjectData> {
    const repairedData = { ...data };

    // 修复编辑器数据
    if (options.addMissingFields && repairedData.data) {
      const editorData = repairedData.data as IEditorPaperData;

      if (!editorData.canvases || !Array.isArray(editorData.canvases)) {
        editorData.canvases = [];
        result.fixedIssues?.push('修复了画布数据结构');
      }

      if (!editorData.graphics || !Array.isArray(editorData.graphics)) {
        editorData.graphics = [];
        result.fixedIssues?.push('修复了图形数据结构');
      }
    }

    // 更新时间戳
    if (repairedData.metadata && options.preserveUserData) {
      repairedData.metadata.updatedAt = new Date();
    }

    return repairedData;
  }

  /**
   * 合并验证结果
   */
  private mergeValidationResults(
    target: ValidationResult,
    source: ValidationResult,
  ): void {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    if (!source.isValid) {
      target.isValid = false;
    }
    if (source.fixedIssues) {
      if (!target.fixedIssues) {
        target.fixedIssues = [];
      }
      target.fixedIssues.push(...source.fixedIssues);
    }
  }
}
