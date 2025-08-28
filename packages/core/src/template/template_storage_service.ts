import { TemplateCategoryManager } from './managers/template_category_manager';
import { TemplateManager } from './managers/template_manager';
import type {
  ApplyTemplateParams,
  CreateTemplateParams,
  TemplateCategory,
  TemplateData,
  TemplateImportResult,
  TemplateQueryOptions,
  TemplateQueryResult,
  UpdateTemplateParams,
} from './types';
import { TemplateIndexedDBUtils } from './utils/template_indexeddb_utils';
import { TemplateSerializer } from './utils/template_serializer';
import { TemplateVersionManager } from './utils/template_version_manager';

/**
 * 模板存储服务 - 统一的模板管理入口
 * 提供模板的创建、查询、更新、删除、导入导出等功能
 */
export class TemplateStorageService {
  private dbUtils: TemplateIndexedDBUtils;
  private templateManager: TemplateManager;
  private categoryManager: TemplateCategoryManager;
  private isInitialized = false;

  constructor() {
    this.dbUtils = new TemplateIndexedDBUtils('GAssetForgeTemplates', 1);
    this.templateManager = new TemplateManager(this.dbUtils);
    this.categoryManager = new TemplateCategoryManager(this.dbUtils);
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.dbUtils.openDatabase();
      await this.initializeDefaultData();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`模板存储服务初始化失败: ${error}`);
    }
  }

  /**
   * 初始化默认数据
   */
  private async initializeDefaultData(): Promise<void> {
    const categories = await this.categoryManager.getAllCategories();
    if (categories.length === 0) {
      await this.categoryManager.createDefaultCategories();
    }
  }

  // ========== 模板管理方法 ==========

  /**
   * 创建模板
   */
  async createTemplate(params: CreateTemplateParams): Promise<TemplateData> {
    await this.ensureInitialized();
    return await this.templateManager.createTemplate(params);
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    id: string,
    params: UpdateTemplateParams,
  ): Promise<TemplateData> {
    await this.ensureInitialized();
    return await this.templateManager.updateTemplate(id, params);
  }

  /**
   * 获取模板
   */
  async getTemplate(id: string): Promise<TemplateData | undefined> {
    await this.ensureInitialized();
    return await this.templateManager.getTemplate(id);
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.templateManager.deleteTemplate(id);
  }

  /**
   * 查询模板
   */
  async queryTemplates(
    options: TemplateQueryOptions = {},
  ): Promise<TemplateQueryResult> {
    await this.ensureInitialized();
    return await this.templateManager.queryTemplates(options);
  }

  /**
   * 记录模板使用
   */
  async recordTemplateUsage(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.templateManager.recordTemplateUsage(id);
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStats() {
    await this.ensureInitialized();
    return await this.templateManager.getTemplateStats();
  }

  // ========== 分类管理方法 ==========

  /**
   * 创建分类
   */
  async createCategory(
    category: Omit<TemplateCategory, 'id' | 'createdAt'>,
  ): Promise<TemplateCategory> {
    await this.ensureInitialized();
    return await this.categoryManager.createCategory(category);
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    updates: Partial<TemplateCategory>,
  ): Promise<TemplateCategory> {
    await this.ensureInitialized();
    return await this.categoryManager.updateCategory(id, updates);
  }

  /**
   * 获取分类
   */
  async getCategory(id: string): Promise<TemplateCategory | undefined> {
    await this.ensureInitialized();
    return await this.categoryManager.getCategory(id);
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.categoryManager.deleteCategory(id);
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<TemplateCategory[]> {
    await this.ensureInitialized();
    return await this.categoryManager.getAllCategories();
  }

  /**
   * 获取分类树
   */
  async getCategoryTree(templateType?: any) {
    await this.ensureInitialized();
    return await this.categoryManager.getCategoryTree(templateType);
  }

  // ========== 模板应用方法 ==========

  /**
   * 应用模板
   */
  async applyTemplate(params: ApplyTemplateParams): Promise<any> {
    await this.ensureInitialized();

    const template = await this.getTemplate(params.templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 检查模板兼容性
    const compatibility = TemplateVersionManager.checkCompatibility(template);
    if (compatibility.status === 'incompatible') {
      throw new Error(`模板不兼容: ${compatibility.errors.join(', ')}`);
    }

    // 克隆编辑器数据
    const editorData = JSON.parse(JSON.stringify(template.editorData));

    // 应用变量替换
    this.applyVariableValues(
      editorData,
      template.variables,
      params.variableValues,
    );

    // 记录使用次数
    await this.recordTemplateUsage(params.templateId);

    return {
      editorData,
      templateInfo: {
        id: template.id,
        name: template.name,
        type: template.type,
        appliedAt: new Date(),
      },
    };
  }

  /**
   * 批量应用模板
   */
  async batchApplyTemplate(
    templateId: string,
    batchParams: Array<{
      variableValues: Record<string, any>;
      outputName: string;
    }>,
  ): Promise<Array<{ editorData: any; outputName: string }>> {
    await this.ensureInitialized();

    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    const results = [];

    for (const params of batchParams) {
      const editorData = JSON.parse(JSON.stringify(template.editorData));
      this.applyVariableValues(
        editorData,
        template.variables,
        params.variableValues,
      );

      results.push({
        editorData,
        outputName: params.outputName,
      });
    }

    // 记录使用次数
    await this.recordTemplateUsage(templateId);

    return results;
  }

  // ========== 导入导出方法 ==========

  /**
   * 导出模板
   */
  async exportTemplate(id: string, exportedBy?: string): Promise<string> {
    await this.ensureInitialized();

    const template = await this.getTemplate(id);
    if (!template) {
      throw new Error('模板不存在');
    }

    const exportData = TemplateSerializer.exportTemplate(template, exportedBy);
    return TemplateSerializer.serialize(exportData as any);
  }

  /**
   * 批量导出模板
   */
  async exportTemplates(ids: string[], exportedBy?: string): Promise<string> {
    await this.ensureInitialized();

    const templates: TemplateData[] = [];
    for (const id of ids) {
      const template = await this.getTemplate(id);
      if (template) {
        templates.push(template);
      }
    }

    if (templates.length === 0) {
      throw new Error('没有找到可导出的模板');
    }

    return TemplateSerializer.exportTemplates(templates, exportedBy);
  }

  /**
   * 导入模板
   */
  async importTemplates(jsonString: string): Promise<TemplateImportResult> {
    await this.ensureInitialized();

    const importResult = TemplateSerializer.importTemplates(jsonString);

    // 保存成功导入的模板
    for (const template of importResult.success) {
      try {
        // 生成新的ID避免冲突
        const newTemplate = {
          ...template,
          id: this.generateTemplateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.dbUtils.add('templates', newTemplate);
      } catch (error) {
        // 如果保存失败，从成功列表移除并添加到失败列表
        importResult.success = importResult.success.filter(
          (t) => t.id !== template.id,
        );
        importResult.failed.push({
          name: template.name,
          reason: `保存到数据库失败: ${error}`,
        });
      }
    }

    return importResult;
  }

  // ========== 版本管理方法 ==========

  /**
   * 检查模板兼容性
   */
  async checkTemplateCompatibility(id: string) {
    await this.ensureInitialized();
    return await this.templateManager.checkTemplateCompatibility(id);
  }

  /**
   * 升级模板版本
   */
  async upgradeTemplate(id: string): Promise<TemplateData> {
    await this.ensureInitialized();
    return await this.templateManager.upgradeTemplate(id);
  }

  // ========== 私有辅助方法 ==========

  /**
   * 确保服务已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 应用变量值到编辑器数据
   */
  private applyVariableValues(
    editorData: any,
    variables: any[],
    variableValues: Record<string, any>,
  ): void {
    // 创建对象ID到对象的映射
    const objectMap = new Map();
    for (const obj of editorData.data) {
      objectMap.set(obj.id, obj);
    }

    // 应用每个变量的值
    for (const variable of variables) {
      const value = variableValues[variable.id];
      if (value === undefined) {
        continue;
      }

      // 对每个目标对象应用变量值
      for (const targetObjectId of variable.targetObjectIds) {
        const targetObject = objectMap.get(targetObjectId);
        if (targetObject) {
          // 根据变量类型处理不同的属性设置
          switch (variable.type) {
            case 'text':
              if (
                variable.targetProperty === 'text' ||
                variable.targetProperty === 'content'
              ) {
                targetObject[variable.targetProperty] = value;
              }
              break;
            case 'color':
              if (
                variable.targetProperty === 'fill' ||
                variable.targetProperty === 'stroke'
              ) {
                targetObject[variable.targetProperty] = value;
              }
              break;
            case 'image':
              if (
                variable.targetProperty === 'src' ||
                variable.targetProperty === 'url'
              ) {
                targetObject[variable.targetProperty] = value;
              }
              break;
          }
        }
      }
    }
  }

  /**
   * 生成模板ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.dbUtils.close();
    this.isInitialized = false;
  }
}
