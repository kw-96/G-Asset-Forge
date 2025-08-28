import { TemplateStorageService } from './template_storage_service';
import type {
  CreateTemplateParams,
  TemplateCategory,
  TemplateData,
  TemplateType,
} from './types';

/**
 * 模板服务门面类
 * 提供简化的模板操作接口，隐藏底层实现复杂性
 */
export class TemplateServiceFacade {
  private static instance: TemplateServiceFacade;
  private storageService: TemplateStorageService;

  private constructor() {
    this.storageService = new TemplateStorageService();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): TemplateServiceFacade {
    if (!TemplateServiceFacade.instance) {
      TemplateServiceFacade.instance = new TemplateServiceFacade();
    }
    return TemplateServiceFacade.instance;
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    await this.storageService.initialize();
  }

  // ========== 模板操作的简化接口 ==========

  /**
   * 创建新模板
   */
  async createTemplate(params: CreateTemplateParams): Promise<TemplateData> {
    return await this.storageService.createTemplate(params);
  }

  /**
   * 获取模板详情
   */
  async getTemplate(id: string): Promise<TemplateData | undefined> {
    return await this.storageService.getTemplate(id);
  }

  /**
   * 搜索模板
   */
  async searchTemplates(keyword: string, type?: TemplateType) {
    return await this.storageService.queryTemplates({
      keyword,
      type,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  }

  /**
   * 获取热门模板
   */
  async getPopularTemplates(limit: number = 10) {
    return await this.storageService.queryTemplates({
      sortBy: 'usageCount',
      sortOrder: 'desc',
      limit,
    });
  }

  /**
   * 获取最新模板
   */
  async getRecentTemplates(limit: number = 10) {
    return await this.storageService.queryTemplates({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit,
    });
  }

  /**
   * 根据分类获取模板
   */
  async getTemplatesByCategory(categoryId: string) {
    return await this.storageService.queryTemplates({
      categoryId,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }

  /**
   * 应用模板到新项目
   */
  async applyTemplateToNewProject(
    templateId: string,
    variableValues: Record<string, any>,
    projectName?: string,
  ) {
    return await this.storageService.applyTemplate({
      templateId,
      variableValues,
      createNewProject: true,
      projectName,
    });
  }

  /**
   * 从当前项目创建模板
   */
  async createTemplateFromProject(
    projectData: any,
    templateInfo: {
      name: string;
      description: string;
      type: TemplateType;
      categoryId: string;
      tags?: string[];
    },
  ): Promise<TemplateData> {
    return await this.storageService.createTemplate({
      ...templateInfo,
      editorData: projectData,
      variables: [], // 可以后续添加变量定义
    });
  }

  // ========== 分类操作的简化接口 ==========

  /**
   * 获取分类树
   */
  async getCategoryTree(type?: TemplateType) {
    return await this.storageService.getCategoryTree(type);
  }

  /**
   * 创建新分类
   */
  async createCategory(
    name: string,
    type: TemplateType,
    parentId?: string,
  ): Promise<TemplateCategory> {
    return await this.storageService.createCategory({
      name,
      templateType: type,
      parentId,
      order: Date.now(), // 简单的排序方式
    });
  }

  // ========== 批量操作的简化接口 ==========

  /**
   * 批量删除模板
   */
  async deleteTemplates(
    ids: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    const result: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    for (const id of ids) {
      try {
        await this.storageService.deleteTemplate(id);
        result.success.push(id);
      } catch (error) {
        result.failed.push(id);
      }
    }

    return result;
  }

  /**
   * 批量导出模板
   */
  async exportTemplates(ids: string[], exportedBy?: string): Promise<string> {
    return await this.storageService.exportTemplates(ids, exportedBy);
  }

  /**
   * 导入模板文件
   */
  async importTemplateFile(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;
          const result = await this.storageService.importTemplates(jsonString);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  // ========== 统计和分析接口 ==========

  /**
   * 获取模板使用统计
   */
  async getTemplateStats() {
    return await this.storageService.getTemplateStats();
  }

  /**
   * 获取用户的模板使用习惯分析
   */
  async getUserTemplateAnalytics() {
    const stats = await this.getTemplateStats();
    const recentTemplates = await this.getRecentTemplates(20);

    return {
      totalTemplates: stats.totalCount,
      designTemplates: stats.designCount,
      h5Templates: stats.h5Count,
      mostUsedTemplates: stats.mostUsedTemplates.slice(0, 5),
      recentActivity: recentTemplates.templates.slice(0, 10),
      usagePattern: {
        designUsage: stats.designCount / stats.totalCount,
        h5Usage: stats.h5Count / stats.totalCount,
      },
    };
  }

  // ========== 模板预览和验证接口 ==========

  /**
   * 验证模板数据完整性
   */
  async validateTemplate(templateData: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const result: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    } = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // 基本字段验证
    const requiredFields = [
      'name',
      'description',
      'type',
      'categoryId',
      'editorData',
    ];
    for (const field of requiredFields) {
      if (!templateData[field]) {
        result.errors.push(`缺少必要字段: ${field}`);
        result.isValid = false;
      }
    }

    // 编辑器数据验证
    if (templateData.editorData) {
      if (!templateData.editorData.paperId) {
        result.warnings.push('编辑器数据缺少paperId');
      }
      if (!Array.isArray(templateData.editorData.data)) {
        result.errors.push('编辑器数据格式不正确');
        result.isValid = false;
      }
    }

    // 变量定义验证
    if (templateData.variables && Array.isArray(templateData.variables)) {
      for (const variable of templateData.variables) {
        if (!variable.id || !variable.name || !variable.type) {
          result.warnings.push(
            `变量定义不完整: ${variable.name || '未命名变量'}`,
          );
        }
      }
    }

    return result;
  }

  /**
   * 生成模板预览信息
   */
  async generateTemplatePreview(templateId: string) {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    return {
      basicInfo: {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        thumbnail: template.thumbnail,
        previewImages: template.previewImages,
      },
      statistics: {
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        lastUsed: template.lastUsed,
      },
      content: {
        objectCount: template.editorData.data.length,
        variableCount: template.variables.length,
        hasVariables: template.variables.length > 0,
        variableTypes: [...new Set(template.variables.map((v) => v.type))],
      },
      compatibility: await this.storageService.checkTemplateCompatibility(
        templateId,
      ),
    };
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.storageService.destroy();
  }
}
