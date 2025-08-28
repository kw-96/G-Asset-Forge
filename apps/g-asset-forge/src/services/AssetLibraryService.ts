/**
 * 素材库服务 - 连接UI组件和核心数据服务
 * 负责将核心素材服务适配到UI组件的需求
 */
import {
  AssetData,
  AssetStorageService,
  AssetType,
  CreateAssetParams,
  AssetQueryOptions as CoreAssetQueryOptions,
} from '@g-asset-forge/core';
import {
  IAssetMetadata,
  IAssetSearchOptions,
  IAssetSearchResult,
  AssetCategory,
  IAssetCategoryInfo,
} from '../components/AssetLibraryPanel/types';

/**
 * 素材库集成服务
 */
export class AssetLibraryService {
  private assetStorageService: AssetStorageService;
  private isInitialized = false;

  constructor() {
    this.assetStorageService = new AssetStorageService();
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.assetStorageService.initialize();
      this.isInitialized = true;
      console.log('素材库服务初始化成功');
    } catch (error) {
      console.error('素材库服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 搜索素材
   */
  async searchAssets(
    options: IAssetSearchOptions = {},
  ): Promise<IAssetSearchResult> {
    await this.ensureInitialized();

    // 转换搜索选项格式
    const coreOptions: CoreAssetQueryOptions = {
      keyword: options.query,
      type: this.mapCategoryToAssetType(options.category),
      sortBy: options.sortBy || 'createdAt',
      sortOrder: options.sortOrder || 'desc',
      offset: ((options.page || 1) - 1) * (options.pageSize || 20),
      limit: options.pageSize || 20,
    };

    const result = await this.assetStorageService.queryAssets(coreOptions);

    // 转换结果格式
    const assets = result.assets.map(this.mapAssetDataToMetadata);
    const totalPages = Math.ceil(result.total / (options.pageSize || 20));

    return {
      assets,
      totalCount: result.total,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      totalPages,
      hasMore: (options.page || 1) < totalPages,
    };
  }

  /**
   * 上传素材
   */
  async uploadAsset(
    file: File,
    name: string,
    category: AssetCategory,
    tags: string[] = [],
    description?: string,
  ): Promise<IAssetMetadata> {
    await this.ensureInitialized();

    // 验证文件类型
    if (!this.isValidImageFile(file)) {
      throw new Error('不支持的文件格式');
    }

    // 获取或创建分类
    const categories = await this.assetStorageService.getAllCategories();
    let categoryId = categories.find(
      (c: any) => c.name === this.getCategoryDisplayName(category),
    )?.id;

    if (!categoryId) {
      const newCategory = await this.assetStorageService.createCategory({
        name: this.getCategoryDisplayName(category),
        order: categories.length,
      });
      categoryId = newCategory.id;
    }

    // 处理标签
    const allTags = await this.assetStorageService.getAllTags();
    const tagIds: string[] = [];

    for (const tagName of tags) {
      let tag = allTags.find((t: any) => t.name === tagName);
      if (!tag) {
        tag = await this.assetStorageService.createTag({ name: tagName });
      }
      tagIds.push(tag.id);
    }

    const params: CreateAssetParams = {
      name,
      type: this.mapCategoryToAssetType(category) || AssetType.Image,
      categoryId,
      tagIds,
      file,
      description,
      author: '用户',
    };

    const assetData = await this.assetStorageService.createAsset(params);
    return this.mapAssetDataToMetadata(assetData);
  }

  /**
   * 删除素材
   */
  async deleteAsset(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.assetStorageService.deleteAsset(id);
  }

  /**
   * 批量删除素材
   */
  async deleteAssets(ids: string[]): Promise<void> {
    await this.ensureInitialized();

    for (const id of ids) {
      await this.assetStorageService.deleteAsset(id);
    }
  }

  /**
   * 重命名素材
   */
  async renameAsset(id: string, newName: string): Promise<IAssetMetadata> {
    await this.ensureInitialized();

    const updatedAsset = await this.assetStorageService.updateAsset(id, {
      name: newName,
    });

    return this.mapAssetDataToMetadata(updatedAsset);
  }

  /**
   * 获取素材文件
   */
  async getAssetFile(id: string): Promise<Blob | undefined> {
    await this.ensureInitialized();
    return await this.assetStorageService.getAssetFile(id);
  }

  /**
   * 记录素材使用
   */
  async recordAssetUsage(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.assetStorageService.recordAssetUsage(id);
  }

  /**
   * 获取分类列表
   */
  async getCategories(): Promise<IAssetCategoryInfo[]> {
    await this.ensureInitialized();

    const categories = await this.assetStorageService.getAllCategories();

    return categories.map((category: any) => ({
      id: this.mapCategoryNameToType(category.name),
      name: category.name,
      description: `${category.name}素材`,
    }));
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<string[]> {
    await this.ensureInitialized();

    const tags = await this.assetStorageService.getAllTags();
    return tags.map((tag: any) => tag.name);
  }

  /**
   * 导出素材
   */
  async exportAssets(assetIds: string[]): Promise<void> {
    await this.ensureInitialized();

    // 创建下载链接
    for (const assetId of assetIds) {
      const asset = await this.assetStorageService.getAsset(assetId);
      const fileBlob = await this.assetStorageService.getAssetFile(assetId);

      if (asset && fileBlob) {
        const url = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = asset.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  }

  /**
   * 导入素材
   */
  async importAssets(files: FileList): Promise<IAssetMetadata[]> {
    await this.ensureInitialized();

    const results: IAssetMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.isValidImageFile(file)) {
        try {
          const asset = await this.uploadAsset(
            file,
            this.extractFileName(file.name),
            'ui',
            [],
            `导入的素材: ${file.name}`,
          );
          results.push(asset);
        } catch (error) {
          console.error(`导入文件 ${file.name} 失败:`, error);
        }
      }
    }

    return results;
  }

  // ========== 私有辅助方法 ==========

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 将核心AssetData转换为UI所需的IAssetMetadata
   */
  private mapAssetDataToMetadata(assetData: AssetData): IAssetMetadata {
    return {
      id: assetData.id,
      name: assetData.name,
      category: this.mapAssetTypeToCategory(assetData.type),
      tags: [], // 需要通过tagIds查询实际标签名称
      fileType: assetData.mimeType,
      fileSize: assetData.fileSize,
      dimensions: {
        width: assetData.width,
        height: assetData.height,
      },
      thumbnail: assetData.thumbnail,
      originalUrl: '', // 由于使用Blob存储，这里为空
      license: 'custom',
      isCustom: true,
      createdAt: assetData.createdAt,
      updatedAt: assetData.updatedAt,
      usageCount: assetData.usageCount,
      description: assetData.description,
      author: assetData.author,
    };
  }

  /**
   * 将UI分类映射到核心AssetType
   */
  private mapCategoryToAssetType(
    category?: AssetCategory,
  ): AssetType | undefined {
    const mapping: Record<AssetCategory, AssetType> = {
      ui: AssetType.Image,
      icon: AssetType.Icon,
      background: AssetType.Background,
      decoration: AssetType.Decoration,
      character: AssetType.Character,
      effect: AssetType.Image,
      texture: AssetType.Image,
    };

    return category ? mapping[category] : undefined;
  }

  /**
   * 将核心AssetType映射到UI分类
   */
  private mapAssetTypeToCategory(type: AssetType): AssetCategory {
    const mapping: Record<AssetType, AssetCategory> = {
      [AssetType.Icon]: 'icon',
      [AssetType.Background]: 'background',
      [AssetType.Decoration]: 'decoration',
      [AssetType.Character]: 'character',
      [AssetType.Image]: 'ui',
    };

    return mapping[type] || 'ui';
  }

  /**
   * 获取分类显示名称
   */
  private getCategoryDisplayName(category: AssetCategory): string {
    const mapping: Record<AssetCategory, string> = {
      ui: 'UI元素',
      icon: '图标',
      background: '背景',
      decoration: '装饰',
      character: '角色',
      effect: '特效',
      texture: '纹理',
    };

    return mapping[category] || 'UI元素';
  }

  /**
   * 将分类名称映射回分类类型
   */
  private mapCategoryNameToType(name: string): AssetCategory {
    const mapping: Record<string, AssetCategory> = {
      UI元素: 'ui',
      图标: 'icon',
      背景: 'background',
      装饰: 'decoration',
      角色: 'character',
      特效: 'effect',
      纹理: 'texture',
    };

    return mapping[name] || 'ui';
  }

  /**
   * 验证是否为有效的图片文件
   */
  private isValidImageFile(file: File): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    return supportedTypes.includes(file.type.toLowerCase());
  }

  /**
   * 提取文件名（去除扩展名）
   */
  private extractFileName(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.assetStorageService.destroy();
    this.isInitialized = false;
  }
}

// 导出单例实例
export const assetLibraryService = new AssetLibraryService();
