import { AssetCategory, AssetData } from '../types';
import { IndexedDBUtils } from '../utils/indexeddb_utils';

/**
 * 分类管理器 - 负责素材分类的管理
 */
export class CategoryManager {
  private dbUtils: IndexedDBUtils;

  constructor(dbUtils: IndexedDBUtils) {
    this.dbUtils = dbUtils;
  }

  /**
   * 创建分类
   */
  async createCategory(
    category: Omit<AssetCategory, 'id' | 'createdAt'>,
  ): Promise<AssetCategory> {
    const newCategory: AssetCategory = {
      ...category,
      id: this.generateId(),
      createdAt: new Date(),
    };

    await this.dbUtils.add('categories', newCategory);
    return newCategory;
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<AssetCategory[]> {
    const categories = await this.dbUtils.getAll<AssetCategory>('categories');
    return categories.sort((a, b) => a.order - b.order);
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    updates: Partial<AssetCategory>,
  ): Promise<AssetCategory> {
    const category = await this.dbUtils.get<AssetCategory>('categories', id);
    if (!category) {
      throw new Error(`分类不存在: ${id}`);
    }

    const updatedCategory = { ...category, ...updates };
    await this.dbUtils.put('categories', updatedCategory);
    return updatedCategory;
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    // 检查是否有素材使用此分类
    const assets = await this.dbUtils.getByIndex<AssetData>(
      'assets',
      'categoryId',
      id,
    );
    if (assets.length > 0) {
      throw new Error(`无法删除分类，还有 ${assets.length} 个素材使用此分类`);
    }

    await this.dbUtils.delete('categories', id);
  }

  /**
   * 创建默认分类
   */
  async createDefaultCategories(): Promise<void> {
    const defaultCategories: AssetCategory[] = [
      {
        id: 'cat-icons',
        name: '图标',
        order: 1,
        createdAt: new Date(),
      },
      {
        id: 'cat-backgrounds',
        name: '背景',
        order: 2,
        createdAt: new Date(),
      },
      {
        id: 'cat-decorations',
        name: '装饰元素',
        order: 3,
        createdAt: new Date(),
      },
      {
        id: 'cat-characters',
        name: '角色',
        order: 4,
        createdAt: new Date(),
      },
    ];

    for (const category of defaultCategories) {
      await this.dbUtils.add('categories', category);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
