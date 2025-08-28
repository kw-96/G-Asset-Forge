import { AssetStorageService } from './asset_storage_service';

/**
 * UI 辅助工具 - 为界面提供数据格式化功能
 */
export class UIHelpers {
  /**
   * 获取分类列表（用于UI显示）
   */
  static async getCategoriesForUI(
    assetService: AssetStorageService,
  ): Promise<Array<{ id: string; name: string; count: number }>> {
    const categories = await assetService.getAllCategories();
    const result = [];

    for (const category of categories) {
      const assets = await assetService.queryAssets({
        categoryId: category.id,
      });
      result.push({
        id: category.id,
        name: category.name,
        count: assets.total,
      });
    }

    return result;
  }

  /**
   * 获取热门标签（用于UI显示）
   */
  static async getPopularTags(
    assetService: AssetStorageService,
    limit: number = 10,
  ): Promise<
    Array<{ id: string; name: string; color?: string; count: number }>
  > {
    const tags = await assetService.getAllTags();

    return tags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        count: tag.usageCount,
      }));
  }

  /**
   * 格式化素材列表用于显示
   */
  static formatAssetsForDisplay(assets: any[]): Array<{
    id: string;
    name: string;
    type: string;
    thumbnail: string;
    size: string;
    lastUsed: string;
  }> {
    return assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      thumbnail: asset.thumbnail,
      size: this.formatFileSize(asset.fileSize),
      lastUsed: this.formatDate(asset.lastUsed),
    }));
  }

  /**
   * 格式化文件大小
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化日期
   */
  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
}
