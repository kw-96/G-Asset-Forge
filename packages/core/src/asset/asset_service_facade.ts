import { AssetStorageService } from './asset_storage_service';
import { AssetType, CreateAssetParams } from './types';
import { AssetHelpers } from './utils/asset_helpers';
import { UIHelpers } from './ui_helpers';

/**
 * 素材服务门面 - 提供简化的素材管理接口
 */
export class AssetServiceFacade {
  private assetService: AssetStorageService;

  constructor() {
    this.assetService = new AssetStorageService();
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    await this.assetService.initialize();
    console.log('素材管理器初始化成功');
  }

  /**
   * 上传新素材
   */
  async uploadAsset(
    file: File,
    categoryId: string,
    tagIds: string[] = [],
  ): Promise<void> {
    const params: CreateAssetParams = {
      name: AssetHelpers.extractAssetName(file.name),
      type: AssetHelpers.getAssetTypeFromFile(file),
      categoryId,
      tagIds,
      file,
      description: AssetHelpers.generateAssetDescription(file),
      author: '当前用户',
    };

    const asset = await this.assetService.createAsset(params);
    console.log('素材上传成功:', asset.name);
    this.onAssetUploaded(asset);
  }

  /**
   * 搜索素材
   */
  async searchAssets(keyword: string, type?: AssetType): Promise<any[]> {
    const result = await this.assetService.queryAssets({
      keyword,
      type,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit: 20,
    });

    console.log(`找到 ${result.total} 个匹配的素材`);
    return result.assets;
  }

  /**
   * 使用素材（拖拽到画布时调用）
   */
  async useAsset(assetId: string): Promise<Blob | undefined> {
    await this.assetService.recordAssetUsage(assetId);
    const fileBlob = await this.assetService.getAssetFile(assetId);

    if (fileBlob) {
      console.log('素材使用成功');
      return fileBlob;
    } else {
      console.warn('素材文件不存在');
      return undefined;
    }
  }

  /**
   * 获取分类列表（用于UI显示）
   */
  async getCategoriesForUI(): Promise<
    Array<{ id: string; name: string; count: number }>
  > {
    return UIHelpers.getCategoriesForUI(this.assetService);
  }

  /**
   * 获取热门标签（用于UI显示）
   */
  async getPopularTags(
    limit: number = 10,
  ): Promise<
    Array<{ id: string; name: string; color?: string; count: number }>
  > {
    return UIHelpers.getPopularTags(this.assetService, limit);
  }

  /**
   * 批量删除素材
   */
  async deleteAssets(assetIds: string[]): Promise<void> {
    for (const assetId of assetIds) {
      await this.assetService.deleteAsset(assetId);
    }

    console.log(`成功删除 ${assetIds.length} 个素材`);
    this.onAssetsDeleted(assetIds);
  }

  /**
   * 创建新分类
   */
  async createCategory(name: string, parentId?: string): Promise<void> {
    const categories = await this.assetService.getAllCategories();
    const maxOrder = Math.max(...categories.map((c) => c.order), 0);

    const category = await this.assetService.createCategory({
      name,
      parentId,
      order: maxOrder + 1,
    });

    console.log('分类创建成功:', category.name);
    this.onCategoryCreated(category);
  }

  /**
   * 创建新标签
   */
  async createTag(name: string, color?: string): Promise<void> {
    const tag = await this.assetService.createTag({
      name,
      color: color || AssetHelpers.generateRandomColor(),
    });

    console.log('标签创建成功:', tag.name);
    this.onTagCreated(tag);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.assetService.destroy();
  }

  // ========== 事件回调（可以被外部重写） ==========

  protected onAssetUploaded(asset: any): void {
    // 子类可以重写此方法来处理UI更新
  }

  protected onAssetsDeleted(assetIds: string[]): void {
    // 子类可以重写此方法来处理UI更新
  }

  protected onCategoryCreated(category: any): void {
    // 子类可以重写此方法来处理UI更新
  }

  protected onTagCreated(tag: any): void {
    // 子类可以重写此方法来处理UI更新
  }
}

// 导出单例实例
export const assetServiceFacade = new AssetServiceFacade();
