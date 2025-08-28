import type { TemplateCategory, TemplateType } from '../types';
import { TemplateIndexedDBUtils } from '../utils/template_indexeddb_utils';

/**
 * 模板分类管理器
 * 负责模板分类的CRUD操作和层级管理
 */
export class TemplateCategoryManager {
  private dbUtils: TemplateIndexedDBUtils;

  constructor(dbUtils: TemplateIndexedDBUtils) {
    this.dbUtils = dbUtils;
  }

  /**
   * 创建分类
   */
  async createCategory(
    category: Omit<TemplateCategory, 'id' | 'createdAt'>,
  ): Promise<TemplateCategory> {
    try {
      const categoryId = this.generateCategoryId();
      const newCategory: TemplateCategory = {
        ...category,
        id: categoryId,
        createdAt: new Date(),
      };

      await this.dbUtils.add('template_categories', newCategory);
      return newCategory;
    } catch (error) {
      throw new Error(`创建模板分类失败: ${error}`);
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    updates: Partial<TemplateCategory>,
  ): Promise<TemplateCategory> {
    try {
      const existingCategory = await this.getCategory(id);
      if (!existingCategory) {
        throw new Error('模板分类不存在');
      }

      const updatedCategory: TemplateCategory = {
        ...existingCategory,
        ...updates,
        id, // 确保ID不被修改
      };

      await this.dbUtils.put('template_categories', updatedCategory);
      return updatedCategory;
    } catch (error) {
      throw new Error(`更新模板分类失败: ${error}`);
    }
  }

  /**
   * 获取分类
   */
  async getCategory(id: string): Promise<TemplateCategory | undefined> {
    try {
      return await this.dbUtils.get<TemplateCategory>(
        'template_categories',
        id,
      );
    } catch (error) {
      throw new Error(`获取模板分类失败: ${error}`);
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const category = await this.getCategory(id);
      if (!category) {
        throw new Error('模板分类不存在');
      }

      // 检查是否有子分类
      const childCategories = await this.getChildCategories(id);
      if (childCategories.length > 0) {
        throw new Error('无法删除包含子分类的分类，请先删除子分类');
      }

      // 检查是否有模板使用此分类
      const templatesInCategory = await this.dbUtils.getByIndex(
        'templates',
        'categoryId',
        id,
      );
      if (templatesInCategory.length > 0) {
        throw new Error('无法删除包含模板的分类，请先移动或删除相关模板');
      }

      await this.dbUtils.delete('template_categories', id);
    } catch (error) {
      throw new Error(`删除模板分类失败: ${error}`);
    }
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<TemplateCategory[]> {
    try {
      return await this.dbUtils.getAll<TemplateCategory>('template_categories');
    } catch (error) {
      throw new Error(`获取所有模板分类失败: ${error}`);
    }
  }

  /**
   * 根据模板类型获取分类
   */
  async getCategoriesByType(
    templateType: TemplateType,
  ): Promise<TemplateCategory[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(
        (category) => category.templateType === templateType,
      );
    } catch (error) {
      throw new Error(`获取指定类型的模板分类失败: ${error}`);
    }
  }

  /**
   * 获取子分类
   */
  async getChildCategories(parentId: string): Promise<TemplateCategory[]> {
    try {
      return await this.dbUtils.getByIndex<TemplateCategory>(
        'template_categories',
        'parentId',
        parentId,
      );
    } catch (error) {
      throw new Error(`获取子分类失败: ${error}`);
    }
  }

  /**
   * 获取根分类（没有父分类的分类）
   */
  async getRootCategories(
    templateType?: TemplateType,
  ): Promise<TemplateCategory[]> {
    try {
      const allCategories = await this.getAllCategories();
      let rootCategories = allCategories.filter(
        (category) => !category.parentId,
      );

      if (templateType) {
        rootCategories = rootCategories.filter(
          (category) => category.templateType === templateType,
        );
      }

      return rootCategories.sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(`获取根分类失败: ${error}`);
    }
  }

  /**
   * 获取分类树结构
   */
  async getCategoryTree(
    templateType?: TemplateType,
  ): Promise<TemplateCategoryTree[]> {
    try {
      const allCategories = await this.getAllCategories();
      let categories = templateType
        ? allCategories.filter(
            (category) => category.templateType === templateType,
          )
        : allCategories;

      return this.buildCategoryTree(categories);
    } catch (error) {
      throw new Error(`获取分类树失败: ${error}`);
    }
  }

  /**
   * 移动分类到新的父分类下
   */
  async moveCategory(categoryId: string, newParentId?: string): Promise<void> {
    try {
      const category = await this.getCategory(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 检查是否会形成循环引用
      if (
        newParentId &&
        (await this.wouldCreateCircularReference(categoryId, newParentId))
      ) {
        throw new Error('无法移动分类：会形成循环引用');
      }

      await this.updateCategory(categoryId, { parentId: newParentId });
    } catch (error) {
      throw new Error(`移动分类失败: ${error}`);
    }
  }

  /**
   * 重新排序分类
   */
  async reorderCategories(
    categoryOrders: Array<{ id: string; order: number }>,
  ): Promise<void> {
    try {
      for (const { id, order } of categoryOrders) {
        await this.updateCategory(id, { order });
      }
    } catch (error) {
      throw new Error(`重新排序分类失败: ${error}`);
    }
  }

  /**
   * 创建默认分类
   */
  async createDefaultCategories(): Promise<void> {
    try {
      const defaultCategories = [
        // 设计模式分类
        {
          name: '游戏UI',
          templateType: 'design' as TemplateType,
          order: 1,
        },
        {
          name: '运营素材',
          templateType: 'design' as TemplateType,
          order: 2,
        },
        {
          name: '图标设计',
          templateType: 'design' as TemplateType,
          order: 3,
        },
        // H5模式分类
        {
          name: '活动页面',
          templateType: 'h5' as TemplateType,
          order: 1,
        },
        {
          name: '产品介绍',
          templateType: 'h5' as TemplateType,
          order: 2,
        },
        {
          name: '营销推广',
          templateType: 'h5' as TemplateType,
          order: 3,
        },
      ];

      for (const categoryData of defaultCategories) {
        await this.createCategory(categoryData);
      }
    } catch (error) {
      throw new Error(`创建默认分类失败: ${error}`);
    }
  }

  /**
   * 构建分类树结构
   */
  private buildCategoryTree(
    categories: TemplateCategory[],
  ): TemplateCategoryTree[] {
    const categoryMap = new Map<string, TemplateCategoryTree>();
    const rootCategories: TemplateCategoryTree[] = [];

    // 创建分类节点映射
    for (const category of categories) {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    }

    // 构建树结构
    for (const category of categories) {
      const node = categoryMap.get(category.id)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 父分类不存在，作为根节点处理
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    }

    // 排序
    const sortCategories = (categories: TemplateCategoryTree[]) => {
      categories.sort((a, b) => a.order - b.order);
      categories.forEach((category) => {
        if (category.children.length > 0) {
          sortCategories(category.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  }

  /**
   * 检查是否会形成循环引用
   */
  private async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId: string | undefined = newParentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parent = await this.getCategory(currentParentId);
      currentParentId = parent?.parentId;
    }

    return false;
  }

  /**
   * 生成分类ID
   */
  private generateCategoryId(): string {
    return `template_category_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}

/**
 * 分类树节点接口
 */
export interface TemplateCategoryTree extends TemplateCategory {
  /** 子分类列表 */
  children: TemplateCategoryTree[];
}
