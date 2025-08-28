import {
  AssetData,
  AssetCategory,
  AssetTag,
  AssetQueryOptions,
  AssetQueryResult,
  CreateAssetParams,
  UpdateAssetParams,
} from './types';
import { IndexedDBUtils } from './utils/indexeddb_utils';
import { AssetManager } from './managers/asset_manager';
import { CategoryManager } from './managers/category_manager';
import { TagManager } from './managers/tag_manager';

/**
 * 素材存储服务 - 统一的素材管理入口
 */
export class AssetStorageService {
  private dbUtils: IndexedDBUtils;
  private assetManager: AssetManager;
  private categoryManager: CategoryManager;
  private tagManager: TagManager;
  private isInitialized = false;

  constructor() {
    this.dbUtils = new IndexedDBUtils('GAssetForgeAssets', 1);
    this.assetManager = new AssetManager(this.dbUtils);
    this.categoryManager = new CategoryManager(this.dbUtils);
    this.tagManager = new TagManager(this.dbUtils);
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
      throw new Error(`素材存储服务初始化失败: ${error}`);
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

    const tags = await this.tagManager.getAllTags();
    if (tags.length === 0) {
      await this.tagManager.createDefaultTags();
    }
  }

  // ========== 素材管理方法 ==========

  async createAsset(params: CreateAssetParams): Promise<AssetData> {
    await this.ensureInitialized();
    const asset = await this.assetManager.createAsset(params);

    // 更新标签使用计数
    if (params.tagIds) {
      await this.tagManager.updateTagUsageCount(params.tagIds, 1);
    }

    return asset;
  }

  async updateAsset(id: string, params: UpdateAssetParams): Promise<AssetData> {
    await this.ensureInitialized();

    // 处理标签使用计数变化
    if (params.tagIds) {
      const existingAsset = await this.assetManager.getAsset(id);
      if (existingAsset) {
        const oldTagIds = existingAsset.tagIds;
        const newTagIds = params.tagIds;

        const removedTags = oldTagIds.filter(
          (tagId) => !newTagIds.includes(tagId),
        );
        const addedTags = newTagIds.filter(
          (tagId) => !oldTagIds.includes(tagId),
        );

        if (removedTags.length > 0) {
          await this.tagManager.updateTagUsageCount(removedTags, -1);
        }
        if (addedTags.length > 0) {
          await this.tagManager.updateTagUsageCount(addedTags, 1);
        }
      }
    }

    return await this.assetManager.updateAsset(id, params);
  }

  async getAsset(id: string): Promise<AssetData | undefined> {
    await this.ensureInitialized();
    return await this.assetManager.getAsset(id);
  }

  async getAssetFile(id: string): Promise<Blob | undefined> {
    await this.ensureInitialized();
    return await this.assetManager.getAssetFile(id);
  }

  async deleteAsset(id: string): Promise<void> {
    await this.ensureInitialized();

    const asset = await this.assetManager.getAsset(id);
    if (asset && asset.tagIds.length > 0) {
      await this.tagManager.updateTagUsageCount(asset.tagIds, -1);
    }

    await this.assetManager.deleteAsset(id);
  }

  async queryAssets(
    options: AssetQueryOptions = {},
  ): Promise<AssetQueryResult> {
    await this.ensureInitialized();
    return await this.assetManager.queryAssets(options);
  }

  async recordAssetUsage(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.assetManager.recordAssetUsage(id);
  }

  // ========== 分类管理方法 ==========

  async createCategory(
    category: Omit<AssetCategory, 'id' | 'createdAt'>,
  ): Promise<AssetCategory> {
    await this.ensureInitialized();
    return await this.categoryManager.createCategory(category);
  }

  async getAllCategories(): Promise<AssetCategory[]> {
    await this.ensureInitialized();
    return await this.categoryManager.getAllCategories();
  }

  async updateCategory(
    id: string,
    updates: Partial<AssetCategory>,
  ): Promise<AssetCategory> {
    await this.ensureInitialized();
    return await this.categoryManager.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.categoryManager.deleteCategory(id);
  }

  // ========== 标签管理方法 ==========

  async createTag(
    tag: Omit<AssetTag, 'id' | 'createdAt' | 'usageCount'>,
  ): Promise<AssetTag> {
    await this.ensureInitialized();
    return await this.tagManager.createTag(tag);
  }

  async getAllTags(): Promise<AssetTag[]> {
    await this.ensureInitialized();
    return await this.tagManager.getAllTags();
  }

  async updateTag(id: string, updates: Partial<AssetTag>): Promise<AssetTag> {
    await this.ensureInitialized();
    return await this.tagManager.updateTag(id, updates);
  }

  async deleteTag(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.tagManager.deleteTag(id);
  }

  // ========== 私有辅助方法 ==========

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.dbUtils.close();
    this.isInitialized = false;
  }
}
