/**
 * 素材服务 - 提供素材相关的业务逻辑服务
 * @description 封装素材操作的业务逻辑，协调素材管理器和存储
 * @author 开发团队
 */
import { assetManager } from '../managers/assets/AssetManager';
import type { 
  Asset, 
  AssetFilter, 
  SortOption,
} from '../../stores/assetStore';

/**
 * 素材操作结果接口
 */
export interface AssetOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 素材导入选项接口
 */
export interface AssetImportOptions {
  category?: string;
  tags?: string[];
  overwriteExisting?: boolean;
  generateThumbnails?: boolean;
  validateFormat?: boolean;
}

/**
 * 素材批量操作接口
 */
export interface AssetBatchOperation {
  action: 'delete' | 'move' | 'tag' | 'favorite' | 'export';
  assetIds: string[];
  options?: any;
}

/**
 * 素材推荐接口
 */
export interface AssetRecommendation {
  asset: any;
  score: number;
  reasons: string[];
}

/**
 * 素材服务类
 * @description 提供素材相关的高级业务服务
 */
export class AssetService {
  private static instance: AssetService | null = null;
  private isInitialized = false;
  private searchHistory: string[] = [];
  private maxSearchHistory = 20;

  private constructor() {}

  /**
   * 获取素材服务单例实例
   */
  public static getInstance(): AssetService {
    if (!AssetService.instance) {
      AssetService.instance = new AssetService();
    }
    return AssetService.instance;
  }

  /**
   * 初始化素材服务
   */
  public async initialize(): Promise<AssetOperationResult> {
    if (this.isInitialized) {
      return { success: true, message: '素材服务已经初始化' };
    }

    try {
      console.info('[asset-service] 开始初始化素材服务');

      // 初始化素材管理器
      await assetManager.initialize();

      // 加载搜索历史
      this.loadSearchHistory();

      // 设置事件监听
      this.setupEventListeners();

      this.isInitialized = true;
      console.info('[asset-service] 素材服务初始化完成');

      return { success: true };
    } catch (error) {
      console.error('[asset-service] 素材服务初始化失败:', error);
      return {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 销毁素材服务
   */
  public destroy(): AssetOperationResult {
    if (!this.isInitialized) {
      return { success: true, message: '素材服务未初始化' };
    }

    try {
      console.info('[asset-service] 销毁素材服务');

      // 保存搜索历史
      this.saveSearchHistory();

      // 销毁素材管理器
      assetManager.destroy();

      // 清理数据
      this.searchHistory = [];
      this.isInitialized = false;

      console.info('[asset-service] 素材服务销毁完成');
      return { success: true };
    } catch (error) {
      console.error('[asset-service] 素材服务销毁失败:', error);
      return {
        success: false,
        message: `销毁失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 搜索素材
   */
  public async searchAssets(
    query: string,
    filters?: Partial<AssetFilter>,
    sortBy?: SortOption
  ): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材服务未初始化' };
    }

    try {
      console.info(`[asset-service] 搜索素材: "${query}"`);

      // 执行搜索
      const result = await assetManager.searchAssets(query, filters, sortBy);

      // 添加到搜索历史
      if (query.trim()) {
        this.addToSearchHistory(query);
      }

      console.info(`[asset-service] 搜索完成`, {
        query,
        resultCount: result.totalCount,
        searchTime: `${result.searchTime.toFixed(2)}ms`,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(`[asset-service] 搜索失败: "${query}"`, error);
      return {
        success: false,
        message: `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 添加素材
   */
  public async addAsset(
    assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>,
    options?: AssetImportOptions
  ): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材服务未初始化' };
    }

    try {
      // 应用导入选项
      const finalAssetData = {
        ...assetData,
        category: options?.category || assetData.category,
        tags: options?.tags ? [...assetData.tags, ...options.tags] : assetData.tags,
      };

      // 格式验证
      if (options?.validateFormat) {
        const validationResult = this.validateAssetFormat(finalAssetData);
        if (!validationResult.valid) {
          return {
            success: false,
            message: `格式验证失败: ${validationResult.errors.join(', ')}`,
          };
        }
      }

      // 添加素材
      const result = await assetManager.addAsset(finalAssetData);

      if (result.success) {
        console.info(`[asset-service] 添加素材: ${assetData.name}`, {
          id: result.data?.id,
          type: assetData.type,
        });

        // 生成缩略图
        if (options?.generateThumbnails && result.data?.id) {
          this.generateThumbnail(result.data.id).catch(error => {
            console.warn(`[asset-service] 生成缩略图失败: ${result.data.id}`, error);
          });
        }
      }

      return result;
    } catch (error) {
      console.error(`[asset-service] 添加素材失败: ${assetData.name}`, error);
      return {
        success: false,
        message: `添加素材失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 批量上传素材
   */
  public async uploadAssets(
    files: File[],
    options?: AssetImportOptions
  ): Promise<AssetOperationResult> {
    if (!this.isInitialized) {
      return { success: false, message: '素材服务未初始化' };
    }

    if (files.length === 0) {
      return { success: false, message: '没有文件可上传' };
    }

    try {
      console.info(`[asset-service] 开始批量上传: ${files.length} 个文件`);

      // 过滤和验证文件
      const validFiles = files.filter(file => this.isValidAssetFile(file));
      if (validFiles.length === 0) {
        return { success: false, message: '没有有效的素材文件' };
      }

      if (validFiles.length < files.length) {
        console.warn(`[asset-service] 过滤掉 ${files.length - validFiles.length} 个无效文件`);
      }

      // 执行上传
      const result = await assetManager.uploadAssets(validFiles);

      if (result.success) {
        console.info(`[asset-service] 批量上传完成`, {
          uploadedCount: result.data?.assetIds?.length || 0,
          totalFiles: validFiles.length,
        });

        // 批量生成缩略图
        if (options?.generateThumbnails && result.data?.assetIds) {
          this.batchGenerateThumbnails(result.data.assetIds).catch(error => {
            console.warn('[asset-service] 批量生成缩略图失败:', error);
          });
        }
      }

      return result;
    } catch (error) {
      console.error('[asset-service] 批量上传失败:', error);
      return {
        success: false,
        message: `批量上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取素材推荐
   */
  public getAssetRecommendations(
    baseAsset?: Asset,
    count: number = 10
  ): AssetRecommendation[] {
    if (!this.isInitialized) {
      return [];
    }

    try {
      const allAssets = assetManager.getStatus().totalAssets > 0 
        ? Object.values((assetManager as any).assets || {})
        : [];

      if (allAssets.length === 0) {
        return [];
      }

      let recommendations: AssetRecommendation[] = [];

      if (baseAsset) {
        // 基于相似性推荐
        recommendations = allAssets
          .filter((asset: any) => asset.id !== baseAsset.id)
          .map(asset => ({
            asset,
            score: this.calculateSimilarityScore(baseAsset, asset),
            reasons: this.getSimilarityReasons(baseAsset, asset),
          }))
          .filter(rec => rec.score > 0)
          .sort((a, b) => b.score - a.score);
      } else {
        // 基于使用频率和评分推荐
        recommendations = allAssets
          .map(asset => ({
            asset,
            score: this.calculatePopularityScore(asset),
            reasons: this.getPopularityReasons(asset),
          }))
          .sort((a, b) => b.score - a.score);
      }

      return recommendations.slice(0, count);
    } catch (error) {
      console.error('[asset-service] 获取推荐失败:', error);
      return [];
    }
  }

  /**
   * 获取素材统计信息
   */
  public getAssetStats(): any | null {
    if (!this.isInitialized) {
      return null;
    }
    return assetManager.getAssetStats();
  }

  /**
   * 获取搜索历史
   */
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * 清除搜索历史
   */
  public clearSearchHistory(): AssetOperationResult {
    try {
      this.searchHistory = [];
      this.saveSearchHistory();
      console.info('[asset-service] 清除搜索历史');
      return { success: true };
    } catch (error) {
      console.error('[asset-service] 清除搜索历史失败:', error);
      return {
        success: false,
        message: `清除搜索历史失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 获取服务状态
   */
  public getStatus() {
    const assetStatus = assetManager.getStatus();
    return {
      isInitialized: this.isInitialized,
      asset: assetStatus,
      search: {
        historyCount: this.searchHistory.length,
        maxHistory: this.maxSearchHistory,
      },
    };
  }

  /**
   * 检查服务健康状态
   */
  public checkHealth() {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!this.isInitialized) {
      issues.push('素材服务未初始化');
      return { isHealthy: false, issues, warnings };
    }

    const assetStatus = assetManager.getStatus();
    if (assetStatus.isLoading && Date.now() - (assetStatus as any).loadingStartTime > 30000) {
      issues.push('素材加载超时');
    }

    if (assetStatus.totalAssets === 0) {
      warnings.push('没有可用的素材');
    }

    if (assetStatus.uploadQueueSize > 10) {
      warnings.push(`上传队列过长: ${assetStatus.uploadQueueSize} 个文件`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }

  // 私有方法
  private setupEventListeners(): void {
    // 监听素材添加事件
    assetManager.addEventListener('asset-added', (_event, data) => {
      console.debug(`[asset-service] 素材已添加: ${data?.asset?.name}`);
    });

    // 监听搜索完成事件
    assetManager.addEventListener('search-completed', (_event, data) => {
      console.debug(`[asset-service] 搜索完成: ${data?.totalCount} 个结果`);
    });
  }

  private addToSearchHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || this.searchHistory.includes(trimmedQuery)) {
      return;
    }

    this.searchHistory.push(trimmedQuery);

    // 限制历史记录数量
    if (this.searchHistory.length > this.maxSearchHistory) {
      this.searchHistory = this.searchHistory.slice(-this.maxSearchHistory);
    }

    // 定期保存
    if (this.searchHistory.length % 5 === 0) {
      this.saveSearchHistory();
    }
  }

  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem('asset-service-search-history');
      if (saved) {
        this.searchHistory = JSON.parse(saved);
        console.debug(`[asset-service] 加载搜索历史: ${this.searchHistory.length} 条`);
      }
    } catch (error) {
      console.warn('[asset-service] 加载搜索历史失败:', error);
      this.searchHistory = [];
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('asset-service-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('[asset-service] 保存搜索历史失败:', error);
    }
  }

  private isValidAssetFile(file: File): boolean {
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  private validateAssetFormat(assetData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assetData.name || assetData.name.trim().length === 0) {
      errors.push('素材名称不能为空');
    }

    if (!assetData.type) {
      errors.push('素材类型不能为空');
    }

    if (!assetData.url || !assetData.url.startsWith('http')) {
      errors.push('素材URL格式无效');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async generateThumbnail(assetId: string): Promise<void> {
    // 缩略图生成逻辑
    console.debug(`[asset-service] 生成缩略图: ${assetId}`);
  }

  private async batchGenerateThumbnails(assetIds: string[]): Promise<void> {
    // 批量缩略图生成逻辑
    console.debug(`[asset-service] 批量生成缩略图: ${assetIds.length} 个`);
  }

  private calculateSimilarityScore(baseAsset: any, compareAsset: any): number {
    let score = 0;

    // 类型相同加分
    if (baseAsset.type === compareAsset.type) {
      score += 30;
    }

    // 分类相同加分
    if (baseAsset.category === compareAsset.category) {
      score += 20;
    }

    // 标签相似度
    const commonTags = baseAsset.tags.filter((tag: any) => compareAsset.tags.includes(tag));
    score += commonTags.length * 10;

    return score;
  }

  private getSimilarityReasons(baseAsset: any, compareAsset: any): string[] {
    const reasons: string[] = [];

    if (baseAsset.type === compareAsset.type) {
      reasons.push('相同类型');
    }

    if (baseAsset.category === compareAsset.category) {
      reasons.push('相同分类');
    }

    const commonTags = baseAsset.tags.filter((tag: any) => compareAsset.tags.includes(tag));
    if (commonTags.length > 0) {
      reasons.push(`共同标签: ${commonTags.join(', ')}`);
    }

    return reasons;
  }

  private calculatePopularityScore(_asset: any): number {
    // 基于使用频率、评分等计算热门度
    return Math.random() * 100; // 简单实现
  }

  private getPopularityReasons(_asset: any): string[] {
    return ['热门素材', '高评分'];
  }
}

// 导出单例实例
export const assetService = AssetService.getInstance();