import {
  AssetData,
  AssetQueryOptions,
  AssetQueryResult,
  CreateAssetParams,
  UpdateAssetParams,
} from '../types';
import { IndexedDBUtils } from '../utils/indexeddb_utils';
import { ImageProcessor } from '../utils/image_processor';

/**
 * 素材管理器 - 负责素材的增删改查操作
 */
export class AssetManager {
  private dbUtils: IndexedDBUtils;
  private imageProcessor: ImageProcessor;

  constructor(dbUtils: IndexedDBUtils) {
    this.dbUtils = dbUtils;
    this.imageProcessor = new ImageProcessor();
  }

  /**
   * 创建新素材
   */
  async createAsset(params: CreateAssetParams): Promise<AssetData> {
    const assetId = this.generateId();
    const now = new Date();

    // 处理文件数据
    const { width, height, thumbnail } =
      await this.imageProcessor.processImageFile(params.file);

    // 创建素材数据对象
    const assetData: AssetData = {
      id: assetId,
      name: params.name,
      type: params.type,
      categoryId: params.categoryId,
      tagIds: params.tagIds || [],
      filename: params.file.name,
      fileSize: params.file.size,
      mimeType: params.file.type,
      width,
      height,
      thumbnail,
      usageCount: 0,
      lastUsed: now,
      createdAt: now,
      updatedAt: now,
      description: params.description,
      author: params.author,
      copyright: params.copyright,
      metadata: params.metadata,
    };

    // 分别存储素材数据和文件数据
    await this.dbUtils.add('assets', assetData);
    await this.dbUtils.add('files', { id: assetId, blob: params.file });

    return assetData;
  }

  /**
   * 更新素材
   */
  async updateAsset(id: string, params: UpdateAssetParams): Promise<AssetData> {
    const existingAsset = await this.getAsset(id);
    if (!existingAsset) {
      throw new Error(`素材不存在: ${id}`);
    }

    const updatedAsset: AssetData = {
      ...existingAsset,
      ...params,
      updatedAt: new Date(),
    };

    await this.dbUtils.put('assets', updatedAsset);
    return updatedAsset;
  }

  /**
   * 获取单个素材
   */
  async getAsset(id: string): Promise<AssetData | undefined> {
    return await this.dbUtils.get<AssetData>('assets', id);
  }

  /**
   * 获取素材文件数据
   */
  async getAssetFile(id: string): Promise<Blob | undefined> {
    const fileData = await this.dbUtils.get<{ id: string; blob: Blob }>(
      'files',
      id,
    );
    return fileData?.blob;
  }

  /**
   * 删除素材
   */
  async deleteAsset(id: string): Promise<void> {
    const asset = await this.getAsset(id);
    if (!asset) {
      throw new Error(`素材不存在: ${id}`);
    }

    // 删除素材数据和文件数据
    await this.dbUtils.delete('assets', id);
    await this.dbUtils.delete('files', id);
  }

  /**
   * 查询素材
   */
  async queryAssets(
    options: AssetQueryOptions = {},
  ): Promise<AssetQueryResult> {
    let assets = await this.dbUtils.getAll<AssetData>('assets');

    // 应用筛选条件
    assets = this.applyFilters(assets, options);

    // 应用排序
    assets = this.applySorting(assets, options);

    // 应用分页
    const total = assets.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    assets = assets.slice(offset, offset + limit);

    return {
      assets,
      total,
      offset,
      limit,
    };
  }

  /**
   * 记录素材使用
   */
  async recordAssetUsage(id: string): Promise<void> {
    const asset = await this.getAsset(id);
    if (!asset) {
      return;
    }

    const updatedAsset: AssetData = {
      ...asset,
      usageCount: asset.usageCount + 1,
      lastUsed: new Date(),
      updatedAt: new Date(),
    };

    await this.dbUtils.put('assets', updatedAsset);
  }

  /**
   * 应用筛选条件
   */
  private applyFilters(
    assets: AssetData[],
    options: AssetQueryOptions,
  ): AssetData[] {
    let filtered = assets;

    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(keyword) ||
          asset.description?.toLowerCase().includes(keyword),
      );
    }

    if (options.type) {
      filtered = filtered.filter((asset) => asset.type === options.type);
    }

    if (options.categoryId) {
      filtered = filtered.filter(
        (asset) => asset.categoryId === options.categoryId,
      );
    }

    if (options.tagIds && options.tagIds.length > 0) {
      filtered = filtered.filter((asset) =>
        options.tagIds!.some((tagId) => asset.tagIds.includes(tagId)),
      );
    }

    return filtered;
  }

  /**
   * 应用排序
   */
  private applySorting(
    assets: AssetData[],
    options: AssetQueryOptions,
  ): AssetData[] {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    return assets.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
