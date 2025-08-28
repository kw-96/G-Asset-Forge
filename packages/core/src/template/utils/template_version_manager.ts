import type { TemplateData } from '../types';

/**
 * 版本比较结果
 */
export enum VersionComparisonResult {
  /** 版本相同 */
  Equal = 0,
  /** 当前版本更新 */
  Newer = 1,
  /** 当前版本更旧 */
  Older = -1,
}

/**
 * 版本兼容性状态
 */
export enum CompatibilityStatus {
  /** 完全兼容 */
  Compatible = 'compatible',
  /** 部分兼容，可能有警告 */
  PartiallyCompatible = 'partially_compatible',
  /** 不兼容 */
  Incompatible = 'incompatible',
}

/**
 * 版本兼容性检查结果
 */
export interface CompatibilityCheckResult {
  /** 兼容性状态 */
  status: CompatibilityStatus;
  /** 警告信息 */
  warnings: string[];
  /** 错误信息 */
  errors: string[];
  /** 是否可以自动升级 */
  canAutoUpgrade: boolean;
  /** 建议的操作 */
  recommendedAction: string;
}

/**
 * 模板版本管理器
 * 负责模板版本控制、兼容性检查和自动升级
 */
export class TemplateVersionManager {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MIN_SUPPORTED_VERSION = '1.0.0';

  /**
   * 比较两个版本号
   */
  static compareVersions(
    version1: string,
    version2: string,
  ): VersionComparisonResult {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    // 确保版本号长度一致
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    while (v1Parts.length < maxLength) v1Parts.push(0);
    while (v2Parts.length < maxLength) v2Parts.push(0);

    for (let i = 0; i < maxLength; i++) {
      if (v1Parts[i] > v2Parts[i]) {
        return VersionComparisonResult.Newer;
      }
      if (v1Parts[i] < v2Parts[i]) {
        return VersionComparisonResult.Older;
      }
    }

    return VersionComparisonResult.Equal;
  }

  /**
   * 检查模板版本兼容性
   */
  static checkCompatibility(template: TemplateData): CompatibilityCheckResult {
    const result: CompatibilityCheckResult = {
      status: CompatibilityStatus.Compatible,
      warnings: [],
      errors: [],
      canAutoUpgrade: false,
      recommendedAction: '无需操作',
    };

    // 检查模板版本是否过新
    const templateVersionComparison = this.compareVersions(
      template.version,
      this.CURRENT_VERSION,
    );

    if (templateVersionComparison === VersionComparisonResult.Newer) {
      result.status = CompatibilityStatus.Incompatible;
      result.errors.push(
        `模板版本 (${template.version}) 高于当前支持版本 (${this.CURRENT_VERSION})`,
      );
      result.recommendedAction = '请升级应用程序到最新版本';
      return result;
    }

    // 检查最低兼容版本
    const minVersionComparison = this.compareVersions(
      template.minCompatibleVersion,
      this.CURRENT_VERSION,
    );

    if (minVersionComparison === VersionComparisonResult.Newer) {
      result.status = CompatibilityStatus.Incompatible;
      result.errors.push(
        `模板要求的最低版本 (${template.minCompatibleVersion}) 高于当前版本 (${this.CURRENT_VERSION})`,
      );
      result.recommendedAction = '请升级应用程序到最新版本';
      return result;
    }

    // 检查是否需要升级
    const supportedVersionComparison = this.compareVersions(
      template.version,
      this.MIN_SUPPORTED_VERSION,
    );

    if (supportedVersionComparison === VersionComparisonResult.Older) {
      result.status = CompatibilityStatus.PartiallyCompatible;
      result.warnings.push(
        `模板版本 (${template.version}) 较旧，建议升级以获得更好的兼容性`,
      );
      result.canAutoUpgrade = this.canAutoUpgrade(template.version);
      result.recommendedAction = result.canAutoUpgrade
        ? '建议自动升级模板'
        : '建议手动更新模板';
    }

    // 检查编辑器数据兼容性
    this.checkEditorDataCompatibility(template, result);

    // 检查变量定义兼容性
    this.checkVariableCompatibility(template, result);

    return result;
  }

  /**
   * 检查是否可以自动升级
   */
  static canAutoUpgrade(fromVersion: string): boolean {
    // 定义可以自动升级的版本路径
    const autoUpgradePaths: Record<string, string[]> = {
      '0.9.0': ['1.0.0'],
      '0.9.1': ['1.0.0'],
      '0.9.2': ['1.0.0'],
    };

    return fromVersion in autoUpgradePaths;
  }

  /**
   * 自动升级模板
   */
  static autoUpgradeTemplate(template: TemplateData): TemplateData {
    let upgradedTemplate = { ...template };

    // 根据版本执行相应的升级逻辑
    switch (template.version) {
      case '0.9.0':
      case '0.9.1':
      case '0.9.2':
        upgradedTemplate = this.upgradeFrom09x(upgradedTemplate);
        break;
      default:
        throw new Error(`不支持从版本 ${template.version} 自动升级`);
    }

    // 更新版本信息
    upgradedTemplate.version = this.CURRENT_VERSION;
    upgradedTemplate.minCompatibleVersion = this.MIN_SUPPORTED_VERSION;
    upgradedTemplate.updatedAt = new Date();

    return upgradedTemplate;
  }

  /**
   * 从0.9.x版本升级
   */
  private static upgradeFrom09x(template: TemplateData): TemplateData {
    const upgraded = { ...template };

    // 升级变量定义格式
    if (upgraded.variables) {
      upgraded.variables = upgraded.variables.map((variable) => ({
        ...variable,
        // 添加新的字段
        description: variable.description || '',
        required: variable.required ?? false,
        validation: variable.validation || {},
      }));
    }

    // 升级编辑器数据格式（如果需要）
    // 这里可以添加具体的数据格式升级逻辑

    return upgraded;
  }

  /**
   * 检查编辑器数据兼容性
   */
  private static checkEditorDataCompatibility(
    template: TemplateData,
    result: CompatibilityCheckResult,
  ): void {
    const { editorData } = template;

    // 检查编辑器数据结构
    if (!editorData.paperId) {
      result.warnings.push('编辑器数据缺少paperId字段');
    }

    if (!Array.isArray(editorData.data)) {
      result.errors.push('编辑器数据格式不正确');
      result.status = CompatibilityStatus.Incompatible;
      return;
    }

    // 检查图形对象兼容性
    for (const graphicsData of editorData.data) {
      if (!graphicsData.id || !graphicsData.type) {
        result.warnings.push('发现格式不完整的图形对象');
      }

      // 检查是否使用了已废弃的属性
      if ('deprecated_property' in graphicsData) {
        result.warnings.push('模板使用了已废弃的属性，建议更新');
      }
    }
  }

  /**
   * 检查变量定义兼容性
   */
  private static checkVariableCompatibility(
    template: TemplateData,
    result: CompatibilityCheckResult,
  ): void {
    for (const variable of template.variables) {
      // 检查变量类型是否支持
      const supportedTypes = ['text', 'image', 'color'];
      if (!supportedTypes.includes(variable.type)) {
        result.warnings.push(`不支持的变量类型: ${variable.type}`);
      }

      // 检查目标对象是否存在
      const objectIds = template.editorData.data.map((obj) => obj.id);
      for (const targetId of variable.targetObjectIds) {
        if (!objectIds.includes(targetId)) {
          result.warnings.push(
            `变量 ${variable.name} 引用的对象 ${targetId} 不存在`,
          );
        }
      }

      // 检查验证规则格式
      if (variable.validation) {
        if (variable.type === 'text' && variable.validation.pattern) {
          try {
            new RegExp(variable.validation.pattern);
          } catch {
            result.warnings.push(
              `变量 ${variable.name} 的正则表达式格式不正确`,
            );
          }
        }
      }
    }
  }

  /**
   * 获取版本更新日志
   */
  static getVersionChangelog(fromVersion: string, toVersion: string): string[] {
    const changelog: Record<string, string[]> = {
      '1.0.0': [
        '新增模板变量验证功能',
        '改进模板兼容性检查',
        '优化模板序列化性能',
        '修复模板导入导出问题',
      ],
      '0.9.2': ['修复变量替换bug', '改进模板预览功能'],
      '0.9.1': ['新增H5模板支持', '优化模板分类管理'],
      '0.9.0': ['初始版本发布', '基础模板功能'],
    };

    const changes: string[] = [];
    const versions = Object.keys(changelog).sort((a, b) =>
      this.compareVersions(b, a),
    );

    let collecting = false;
    for (const version of versions) {
      if (version === toVersion) {
        collecting = true;
      }
      if (collecting && changelog[version]) {
        changes.push(`版本 ${version}:`, ...changelog[version]);
      }
      if (version === fromVersion) {
        break;
      }
    }

    return changes;
  }
}
