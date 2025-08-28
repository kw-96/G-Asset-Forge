import type { IEditorPaperData } from '../../type';
import { TemplateServiceFacade } from '../template_service_facade';
import type { TemplateCategory, TemplateData, TemplateType } from '../types';
import { TemplateApplicationService } from './template_application_service';

/**
 * 模板集成服务
 * 提供模板库与编辑器之间的集成功能
 */
export class TemplateIntegrationService {
  private static instance: TemplateIntegrationService;
  private templateService: TemplateServiceFacade;
  private applicationService: TemplateApplicationService;
  private isInitialized = false;

  private constructor() {
    this.templateService = TemplateServiceFacade.getInstance();
    this.applicationService = new TemplateApplicationService(
      this.templateService['storageService'],
    );
  }

  /**
   * 获取单例实例
   */
  static getInstance(): TemplateIntegrationService {
    if (!TemplateIntegrationService.instance) {
      TemplateIntegrationService.instance = new TemplateIntegrationService();
    }
    return TemplateIntegrationService.instance;
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.templateService.initialize();
    this.isInitialized = true;
  }

  // ========== 模板查询和管理 ==========

  /**
   * 获取所有模板分类
   */
  async getTemplateCategories(
    type?: TemplateType,
  ): Promise<TemplateCategory[]> {
    await this.ensureInitialized();
    const categoryTree = await this.templateService.getCategoryTree(type);
    return this.flattenCategoryTree(categoryTree);
  }

  /**
   * 搜索模板
   */
  async searchTemplates(
    options: {
      keyword?: string;
      type?: TemplateType;
      categoryId?: string;
      tags?: string[];
      sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
    } = {},
  ) {
    await this.ensureInitialized();
    return await this.templateService['storageService'].queryTemplates(options);
  }

  /**
   * 获取热门模板
   */
  async getPopularTemplates(limit: number = 10) {
    await this.ensureInitialized();
    return await this.templateService.getPopularTemplates(limit);
  }

  /**
   * 获取最新模板
   */
  async getRecentTemplates(limit: number = 10) {
    await this.ensureInitialized();
    return await this.templateService.getRecentTemplates(limit);
  }

  /**
   * 获取模板详情
   */
  async getTemplateDetail(
    templateId: string,
  ): Promise<TemplateData | undefined> {
    await this.ensureInitialized();
    return await this.templateService.getTemplate(templateId);
  }

  /**
   * 获取可用标签列表
   */
  async getAvailableTags(): Promise<string[]> {
    await this.ensureInitialized();
    const result = await this.templateService['storageService'].queryTemplates({
      limit: 1000, // 获取足够多的模板来收集标签
    });

    const tags = new Set<string>();
    for (const template of result.templates) {
      for (const tag of template.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort();
  }

  // ========== 模板应用功能 ==========

  /**
   * 应用模板到新项目
   */
  async applyTemplateToNewProject(
    templateId: string,
    variableValues: Record<string, any> = {},
  ): Promise<{
    editorData: IEditorPaperData;
    templateInfo: {
      id: string;
      name: string;
      type: string;
      appliedAt: Date;
    };
  }> {
    await this.ensureInitialized();
    return await this.applicationService.applyTemplateToNewProject(
      templateId,
      variableValues,
    );
  }

  /**
   * 应用模板到当前项目
   */
  async applyTemplateToCurrentProject(
    templateId: string,
    currentEditorData: IEditorPaperData,
    variableValues: Record<string, any> = {},
    mergeMode: 'replace' | 'append' = 'replace',
  ): Promise<IEditorPaperData> {
    await this.ensureInitialized();
    return await this.applicationService.applyTemplateToCurrentProject(
      templateId,
      currentEditorData,
      variableValues,
      mergeMode,
    );
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
  ) {
    await this.ensureInitialized();
    return await this.applicationService.batchApplyTemplate(
      templateId,
      batchParams,
    );
  }

  /**
   * 预览模板应用效果
   */
  async previewTemplateApplication(
    templateId: string,
    variableValues: Record<string, any> = {},
  ) {
    await this.ensureInitialized();
    return await this.applicationService.previewTemplateApplication(
      templateId,
      variableValues,
    );
  }

  // ========== 模板创建功能 ==========

  /**
   * 从当前项目创建模板
   */
  async createTemplateFromProject(
    editorData: IEditorPaperData,
    templateInfo: {
      name: string;
      description: string;
      type: 'design' | 'h5';
      categoryId: string;
      tags?: string[];
      author?: string;
    },
    variableDefinitions: Array<{
      name: string;
      type: 'text' | 'image' | 'color';
      targetObjectIds: string[];
      targetProperty: string;
      description?: string;
      defaultValue?: any;
    }> = [],
  ): Promise<TemplateData> {
    await this.ensureInitialized();
    return await this.applicationService.createTemplateFromProject(
      editorData,
      templateInfo,
      variableDefinitions,
    );
  }

  /**
   * 识别可变元素
   */
  async identifyVariableElements(editorData: IEditorPaperData) {
    await this.ensureInitialized();
    return this.applicationService.identifyVariableElements(editorData);
  }

  /**
   * 批量内容替换
   */
  async batchContentReplace(
    editorData: IEditorPaperData,
    replacements: Array<{
      objectId: string;
      property: string;
      newValue: any;
    }>,
  ): Promise<IEditorPaperData> {
    await this.ensureInitialized();
    return await this.applicationService.batchContentReplace(
      editorData,
      replacements,
    );
  }

  // ========== 模板导入导出功能 ==========

  /**
   * 导出模板
   */
  async exportTemplate(
    templateId: string,
    exportedBy?: string,
  ): Promise<string> {
    await this.ensureInitialized();
    return await this.templateService['storageService'].exportTemplate(
      templateId,
      exportedBy,
    );
  }

  /**
   * 批量导出模板
   */
  async exportTemplates(
    templateIds: string[],
    exportedBy?: string,
  ): Promise<string> {
    await this.ensureInitialized();
    return await this.templateService.exportTemplates(templateIds, exportedBy);
  }

  /**
   * 导入模板文件
   */
  async importTemplateFile(file: File) {
    await this.ensureInitialized();
    return await this.templateService.importTemplateFile(file);
  }

  /**
   * 导入模板JSON字符串
   */
  async importTemplateJson(jsonString: string) {
    await this.ensureInitialized();
    return await this.templateService['storageService'].importTemplates(
      jsonString,
    );
  }

  // ========== 模板管理功能 ==========

  /**
   * 删除模板
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.ensureInitialized();
    await this.templateService['storageService'].deleteTemplate(templateId);
  }

  /**
   * 批量删除模板
   */
  async deleteTemplates(templateIds: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    await this.ensureInitialized();
    return await this.templateService.deleteTemplates(templateIds);
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    templateId: string,
    updates: {
      name?: string;
      description?: string;
      categoryId?: string;
      tags?: string[];
      variables?: any[];
    },
  ): Promise<TemplateData> {
    await this.ensureInitialized();
    return await this.templateService['storageService'].updateTemplate(
      templateId,
      updates,
    );
  }

  /**
   * 复制模板
   */
  async duplicateTemplate(
    templateId: string,
    newName?: string,
  ): Promise<TemplateData> {
    await this.ensureInitialized();

    const originalTemplate = await this.getTemplateDetail(templateId);
    if (!originalTemplate) {
      throw new Error('模板不存在');
    }

    const duplicatedTemplate = await this.templateService.createTemplate({
      name: newName || `${originalTemplate.name} (副本)`,
      description: originalTemplate.description,
      type: originalTemplate.type,
      categoryId: originalTemplate.categoryId,
      tags: [...originalTemplate.tags],
      editorData: JSON.parse(JSON.stringify(originalTemplate.editorData)),
      variables: JSON.parse(JSON.stringify(originalTemplate.variables)),
      author: originalTemplate.author,
      copyright: originalTemplate.copyright,
      metadata: originalTemplate.metadata
        ? JSON.parse(JSON.stringify(originalTemplate.metadata))
        : undefined,
    });

    return duplicatedTemplate;
  }

  // ========== 统计和分析功能 ==========

  /**
   * 获取模板使用统计
   */
  async getTemplateStats() {
    await this.ensureInitialized();
    return await this.templateService.getTemplateStats();
  }

  /**
   * 获取用户模板分析
   */
  async getUserTemplateAnalytics() {
    await this.ensureInitialized();
    return await this.templateService.getUserTemplateAnalytics();
  }

  /**
   * 记录模板使用
   */
  async recordTemplateUsage(templateId: string): Promise<void> {
    await this.ensureInitialized();
    await this.templateService['storageService'].recordTemplateUsage(
      templateId,
    );
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
   * 扁平化分类树
   */
  private flattenCategoryTree(tree: any[]): TemplateCategory[] {
    const result: TemplateCategory[] = [];

    const flatten = (nodes: any[], parentId?: string) => {
      for (const node of nodes) {
        result.push({
          id: node.id,
          name: node.name,
          parentId: parentId,
          templateType: node.templateType,
          order: node.order,
          createdAt: node.createdAt,
        });

        if (node.children && node.children.length > 0) {
          flatten(node.children, node.id);
        }
      }
    };

    flatten(tree);
    return result;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.templateService.destroy();
    this.isInitialized = false;
  }
}
