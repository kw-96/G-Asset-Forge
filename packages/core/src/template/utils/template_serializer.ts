import type {
  TemplateData,
  TemplateExportData,
  TemplateImportResult,
} from '../types';

/**
 * 模板序列化工具类
 * 负责模板数据的序列化、反序列化、导出和导入
 */
export class TemplateSerializer {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly EXPORT_VERSION = '1.0.0';

  /**
   * 序列化模板数据为JSON字符串
   */
  static serialize(template: TemplateData): string {
    try {
      // 创建序列化对象，确保数据完整性
      const serializedData = {
        ...template,
        // 确保日期对象正确序列化
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        lastUsed: template.lastUsed?.toISOString(),
        // 添加序列化版本信息
        _serializationVersion: this.CURRENT_VERSION,
        _serializedAt: new Date().toISOString(),
      };

      return JSON.stringify(serializedData, null, 2);
    } catch (error) {
      throw new Error(`模板序列化失败: ${error}`);
    }
  }

  /**
   * 反序列化JSON字符串为模板数据
   */
  static deserialize(jsonString: string): TemplateData {
    try {
      const data = JSON.parse(jsonString);

      // 验证必要字段
      this.validateTemplateData(data);

      // 转换日期字符串为Date对象
      const template: TemplateData = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined,
      };

      // 移除序列化元数据
      delete (template as any)._serializationVersion;
      delete (template as any)._serializedAt;

      return template;
    } catch (error) {
      throw new Error(`模板反序列化失败: ${error}`);
    }
  }

  /**
   * 导出模板数据
   */
  static exportTemplate(
    template: TemplateData,
    exportedBy?: string,
  ): TemplateExportData {
    return {
      template,
      exportVersion: this.EXPORT_VERSION,
      exportedAt: new Date(),
      exportedBy,
    };
  }

  /**
   * 导出多个模板
   */
  static exportTemplates(
    templates: TemplateData[],
    exportedBy?: string,
  ): string {
    try {
      const exportData = {
        templates: templates.map((template) =>
          this.exportTemplate(template, exportedBy),
        ),
        exportVersion: this.EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        exportedBy,
        count: templates.length,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`批量导出模板失败: ${error}`);
    }
  }

  /**
   * 导入模板数据
   */
  static importTemplate(exportData: TemplateExportData): TemplateData {
    try {
      // 验证导出数据格式
      this.validateExportData(exportData);

      // 检查版本兼容性
      this.checkVersionCompatibility(exportData.exportVersion);

      return exportData.template;
    } catch (error) {
      throw new Error(`导入模板失败: ${error}`);
    }
  }

  /**
   * 批量导入模板
   */
  static importTemplates(jsonString: string): TemplateImportResult {
    const result: TemplateImportResult = {
      success: [],
      failed: [],
      warnings: [],
    };

    try {
      const importData = JSON.parse(jsonString);

      // 处理单个模板导入
      if (importData.template) {
        try {
          const template = this.importTemplate(importData);
          result.success.push(template);
        } catch (error) {
          result.failed.push({
            name: importData.template?.name || '未知模板',
            reason: `${error}`,
          });
        }
        return result;
      }

      // 处理批量模板导入
      if (importData.templates && Array.isArray(importData.templates)) {
        for (const templateExport of importData.templates) {
          try {
            const template = this.importTemplate(templateExport);
            result.success.push(template);
          } catch (error) {
            result.failed.push({
              name: templateExport.template?.name || '未知模板',
              reason: `${error}`,
            });
          }
        }

        // 检查版本兼容性警告
        if (importData.exportVersion !== this.EXPORT_VERSION) {
          result.warnings.push(
            `导入文件版本 (${importData.exportVersion}) 与当前版本 (${this.EXPORT_VERSION}) 不匹配，可能存在兼容性问题`,
          );
        }

        return result;
      }

      throw new Error('无效的导入数据格式');
    } catch (error) {
      result.failed.push({
        name: '批量导入',
        reason: `解析导入数据失败: ${error}`,
      });
      return result;
    }
  }

  /**
   * 验证模板数据完整性
   */
  private static validateTemplateData(data: any): void {
    const requiredFields = [
      'id',
      'name',
      'description',
      'type',
      'categoryId',
      'thumbnail',
      'editorData',
      'variables',
      'version',
      'minCompatibleVersion',
      'createdAt',
      'updatedAt',
      'usageCount',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`缺少必要字段: ${field}`);
      }
    }

    // 验证数组字段
    if (!Array.isArray(data.tags)) {
      throw new Error('tags 字段必须是数组');
    }

    if (!Array.isArray(data.previewImages)) {
      throw new Error('previewImages 字段必须是数组');
    }

    if (!Array.isArray(data.variables)) {
      throw new Error('variables 字段必须是数组');
    }

    // 验证编辑器数据
    if (!data.editorData || typeof data.editorData !== 'object') {
      throw new Error('editorData 字段必须是对象');
    }

    if (!data.editorData.paperId || !Array.isArray(data.editorData.data)) {
      throw new Error('editorData 格式不正确');
    }
  }

  /**
   * 验证导出数据格式
   */
  private static validateExportData(exportData: any): void {
    if (!exportData || typeof exportData !== 'object') {
      throw new Error('导出数据格式不正确');
    }

    if (!exportData.template) {
      throw new Error('导出数据中缺少模板信息');
    }

    if (!exportData.exportVersion) {
      throw new Error('导出数据中缺少版本信息');
    }

    if (!exportData.exportedAt) {
      throw new Error('���出数据中缺少导出时间');
    }
  }

  /**
   * 检查版本兼容性
   */
  private static checkVersionCompatibility(exportVersion: string): void {
    // 简单的版本比较逻辑，实际项目中可能需要更复杂的版本比较
    const currentMajor = parseInt(this.EXPORT_VERSION.split('.')[0]);
    const exportMajor = parseInt(exportVersion.split('.')[0]);

    if (exportMajor > currentMajor) {
      throw new Error(
        `导出版本 (${exportVersion}) 高于当前支持版本 (${this.EXPORT_VERSION})，无法导入`,
      );
    }

    // 可以添加更多版本兼容性检查逻辑
  }

  /**
   * 生成模板预览数据
   */
  static generatePreviewData(template: TemplateData): {
    basicInfo: object;
    variableInfo: object;
    contentSummary: object;
  } {
    return {
      basicInfo: {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        categoryId: template.categoryId,
        tags: template.tags,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
      variableInfo: {
        variableCount: template.variables.length,
        variableTypes: [...new Set(template.variables.map((v) => v.type))],
        requiredVariables: template.variables.filter((v) => v.required).length,
      },
      contentSummary: {
        objectCount: template.editorData.data.length,
        hasPreviewImages: template.previewImages.length > 0,
        version: template.version,
        minCompatibleVersion: template.minCompatibleVersion,
      },
    };
  }
}
