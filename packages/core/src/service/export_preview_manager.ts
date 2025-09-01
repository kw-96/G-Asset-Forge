/**
 * 导出预览管理器 - 处理导出前的实时预览功能
 */

import { EventEmitter } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import {
  type ExportOptions,
  type ExportPreview,
  EnhancedExportService,
} from './enhanced_export_service';

interface Events {
  previewGenerated(preview: ExportPreview): void;
  previewError(error: Error): void;
  previewStarted(): void;
}

/**
 * 导出预览管理器
 */
export class ExportPreviewManager {
  private eventEmitter = new EventEmitter<Events>();
  private exportService: EnhancedExportService;
  private currentPreviewOptions: ExportOptions | null = null;
  private previewCache = new Map<string, ExportPreview>();
  private isGenerating = false;

  constructor(private editor: GAssetForgeEditor) {
    this.exportService = new EnhancedExportService(editor);
  }

  /**
   * 监听事件
   */
  on<K extends keyof Events>(event: K, handler: Events[K]): void {
    this.eventEmitter.on(event, handler);
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof Events>(event: K, handler: Events[K]): void {
    this.eventEmitter.off(event, handler);
  }

  /**
   * 生成导出预览
   */
  async generatePreview(options: ExportOptions): Promise<void> {
    if (this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.currentPreviewOptions = options;
    this.eventEmitter.emit('previewStarted');

    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(options);
      const cachedPreview = this.previewCache.get(cacheKey);

      if (cachedPreview) {
        this.eventEmitter.emit('previewGenerated', cachedPreview);
        return;
      }

      // 生成新预览
      const preview = await this.exportService.generatePreview(options);

      // 缓存预览结果
      this.previewCache.set(cacheKey, preview);

      // 只有当前选项没有变化时才发送预览结果
      if (this.currentPreviewOptions === options) {
        this.eventEmitter.emit('previewGenerated', preview);
      }
    } catch (error) {
      if (this.currentPreviewOptions === options) {
        this.eventEmitter.emit('previewError', error as Error);
      }
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 清除预览缓存
   */
  clearCache(): void {
    this.previewCache.clear();
  }

  /**
   * 获取当前预览选项
   */
  getCurrentPreviewOptions(): ExportOptions | null {
    return this.currentPreviewOptions;
  }

  /**
   * 检查是否正在生成预览
   */
  isGeneratingPreview(): boolean {
    return this.isGenerating;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(options: ExportOptions): string {
    const key = {
      format: options.format,
      quality: options.quality,
      scope: options.scope,
      includeBackground: options.includeBackground,
      backgroundColor: options.backgroundColor,
    };
    return JSON.stringify(key);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache();
    // 清理事件监听器
    this.currentPreviewOptions = null;
    this.isGenerating = false;
  }
}

/**
 * 创建导出预览管理器实例
 */
export const createExportPreviewManager = (
  editor: GAssetForgeEditor,
): ExportPreviewManager => {
  return new ExportPreviewManager(editor);
};
