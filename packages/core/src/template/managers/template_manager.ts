import type {
  TemplateData,
  TemplateQueryOptions,
  TemplateQueryResult,
  CreateTemplateParams,
  UpdateTemplateParams,
} from '../types';
import { TemplateIndexedDBUtils } from '../utils/template_indexeddb_utils';
import { TemplateVersionManager } from '../utils/template_version_manager';

/**
 * 模板管理器
 * 负责模板的CRUD操作和查询功能
 */
export class TemplateManager {
  private dbUtils: TemplateIndexedDBUtils;

  constructor(dbUtils: TemplateIndexedDBUtils) {
    this.dbUtils = dbUtils;
  }

  /**
   * 创建模板
   */
  async createTemplate(params: CreateTemplateParams): Promise<TemplateData> {
    try {
      const now = new Date();
      const templateId = this.generateTemplateId();

      // 处理缩略图
      const thumbnail = params.thumbnailFile
        ? await this.fileToDataURL(params.thumbnailFile)
        : this.generateDefaultThumbnail();

      // 处理预览图片
      const previewImages: string[] = [];
      if (params.previewFiles) {
        for (const file of params.previewFiles) {
          const dataURL = await this.fileToDataURL(file);
          previewImages.push(dataURL);
        }
      }

      const template: TemplateData = {
        id: templateId,
        name: params.name,
        description: params.description,
        type: params.type,
        categoryId: params.categoryId,
        tags: params.tags || [],
        thumbnail,
        previewImages,
        editorData: params.editorData,
        variables: params.variables || [],
        version: '1.0.0',
        minCompatibleVersion: '1.0.0',
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        author: params.author,
        copyright: params.copyright,
        metadata: params.metadata,
      };

      await this.dbUtils.add('templates', template);
      return template;
    } catch (error) {
      throw new Error(`创建模板失败: ${error}`);
    }
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    id: string,
    params: UpdateTemplateParams,
  ): Promise<TemplateData> {
    try {
      const existingTemplate = await this.getTemplate(id);
      if (!existingTemplate) {
        throw new Error('模板不存在');
      }

      const updatedTemplate: TemplateData = {
        ...existingTemplate,
        ...params,
        id, // 确保ID不被修改
        updatedAt: new Date(),
      };

      // 处理缩略图更新
      if (params.thumbnailFile) {
        updatedTemplate.thumbnail = await this.fileToDataURL(
          params.thumbnailFile,
        );
      }

      // 处理预览图片更新
      if (params.previewFiles) {
        const previewImages: string[] = [];
        for (const file of params.previewFiles) {
          const dataURL = await this.fileToDataURL(file);
          previewImages.push(dataURL);
        }
        updatedTemplate.previewImages = previewImages;
      }

      await this.dbUtils.put('templates', updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      throw new Error(`更新模板失败: ${error}`);
    }
  }

  /**
   * 获取模板
   */
  async getTemplate(id: string): Promise<TemplateData | undefined> {
    try {
      return await this.dbUtils.get<TemplateData>('templates', id);
    } catch (error) {
      throw new Error(`获取模板失败: ${error}`);
    }
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      await this.dbUtils.delete('templates', id);
    } catch (error) {
      throw new Error(`删除模板失败: ${error}`);
    }
  }

  /**
   * 查询模板
   */
  async queryTemplates(
    options: TemplateQueryOptions = {},
  ): Promise<TemplateQueryResult> {
    try {
      let templates = await this.dbUtils.getAll<TemplateData>('templates');

      // 应用筛选条件
      templates = this.applyFilters(templates, options);

      // 应用排序
      templates = this.applySorting(templates, options);

      // 计算总数
      const total = templates.length;

      // 应用分页
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const paginatedTemplates = templates.slice(offset, offset + limit);

      return {
        templates: paginatedTemplates,
        total,
        offset,
        limit,
      };
    } catch (error) {
      throw new Error(`查询模板失败: ${error}`);
    }
  }

  /**
   * 记录模板使用
   */
  async recordTemplateUsage(id: string): Promise<void> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      template.usageCount += 1;
      template.lastUsed = new Date();

      await this.dbUtils.put('templates', template);
    } catch (error) {
      throw new Error(`记录模板使用失败: ${error}`);
    }
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStats(): Promise<{
    totalCount: number;
    designCount: number;
    h5Count: number;
    mostUsedTemplates: TemplateData[];
    recentTemplates: TemplateData[];
  }> {
    try {
      const templates = await this.dbUtils.getAll<TemplateData>('templates');

      const designCount = templates.filter((t) => t.type === 'design').length;
      const h5Count = templates.filter((t) => t.type === 'h5').length;

      const mostUsedTemplates = templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      const recentTemplates = templates
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10);

      return {
        totalCount: templates.length,
        designCount,
        h5Count,
        mostUsedTemplates,
        recentTemplates,
      };
    } catch (error) {
      throw new Error(`获取模板统计信息失败: ${error}`);
    }
  }

  /**
   * 检查模板兼容性
   */
  async checkTemplateCompatibility(id: string) {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      return TemplateVersionManager.checkCompatibility(template);
    } catch (error) {
      throw new Error(`检查模板兼容性失败: ${error}`);
    }
  }

  /**
   * 升级模板版本
   */
  async upgradeTemplate(id: string): Promise<TemplateData> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      const upgradedTemplate =
        TemplateVersionManager.autoUpgradeTemplate(template);
      await this.dbUtils.put('templates', upgradedTemplate);

      return upgradedTemplate;
    } catch (error) {
      throw new Error(`升级模板失败: ${error}`);
    }
  }

  /**
   * 应用筛选条件
   */
  private applyFilters(
    templates: TemplateData[],
    options: TemplateQueryOptions,
  ): TemplateData[] {
    let filtered = templates;

    // 关键词搜索
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(keyword) ||
          template.description.toLowerCase().includes(keyword) ||
          template.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    // 类型筛选
    if (options.type) {
      filtered = filtered.filter((template) => template.type === options.type);
    }

    // 分类筛选
    if (options.categoryId) {
      filtered = filtered.filter(
        (template) => template.categoryId === options.categoryId,
      );
    }

    // 标签筛选
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter((template) =>
        options.tags!.some((tag) => template.tags.includes(tag)),
      );
    }

    return filtered;
  }

  /**
   * 应用排序
   */
  private applySorting(
    templates: TemplateData[],
    options: TemplateQueryOptions,
  ): TemplateData[] {
    const { sortBy = 'updatedAt', sortOrder = 'desc' } = options;

    return templates.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * 生成模板ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 文件转换为DataURL
   */
  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 生成默认缩略图
   */
  private generateDefaultThumbnail(): string {
    // 生成一个简单的默认缩略图（SVG格式的DataURL）
    const svg = `
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
          模板预览
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}
