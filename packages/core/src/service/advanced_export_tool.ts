/**
 * 高级导出工具 - 整合所有导出功能的统一接口
 */

import { EventEmitter } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import {
  BatchExportManager,
  type BatchExportResult,
} from './batch_export_manager';
import {
  type BatchExportOptions,
  downloadBlob,
  EnhancedExportService,
  ExportFormat,
  type ExportOptions,
  type ExportPreview,
} from './enhanced_export_service';
import { ExportPreviewManager } from './export_preview_manager';

/**
 * 导出配置预设
 */
export const EXPORT_PRESETS = {
  // 高质量打印
  PRINT_HIGH: {
    quality: 1.0,
    scale: 3.0,
    includeBackground: true,
    backgroundColor: '#ffffff',
  },
  // 网页使用
  WEB_STANDARD: {
    quality: 0.9,
    scale: 1.0,
    includeBackground: false,
    backgroundColor: undefined,
  },
  // 社交媒体
  SOCIAL_MEDIA: {
    quality: 0.85,
    scale: 1.0,
    includeBackground: true,
    backgroundColor: '#ffffff',
  },
  // 移动端
  MOBILE: {
    quality: 0.8,
    scale: 0.75,
    includeBackground: false,
    backgroundColor: undefined,
  },
  // 缩略图
  THUMBNAIL: {
    quality: 0.7,
    scale: 0.25,
    includeBackground: true,
    backgroundColor: '#f5f5f5',
  },
} as const;

/**
 * 常用分辨率预设
 */
export const RESOLUTION_PRESETS = {
  // 社交媒体
  INSTAGRAM_POST: { width: 1080, height: 1080 },
  INSTAGRAM_STORY: { width: 1080, height: 1920 },
  FACEBOOK_POST: { width: 1200, height: 630 },
  TWITTER_POST: { width: 1024, height: 512 },

  // 网页
  WEB_BANNER: { width: 1920, height: 600 },
  WEB_HERO: { width: 1920, height: 1080 },

  // 打印
  A4_300DPI: { width: 2480, height: 3508 },
  A3_300DPI: { width: 3508, height: 4961 },

  // 移动端
  MOBILE_SCREEN: { width: 375, height: 812 },
  TABLET_SCREEN: { width: 768, height: 1024 },
} as const;

interface Events {
  exportStarted(): void;
  exportCompleted(result: { success: boolean; filename?: string }): void;
  exportError(error: Error): void;
  previewReady(preview: ExportPreview): void;
  batchProgress(progress: {
    current: number;
    total: number;
    currentItem: string;
  }): void;
  batchCompleted(result: BatchExportResult): void;
}

/**
 * 高级导出工具类
 */
export class AdvancedExportTool {
  private eventEmitter = new EventEmitter<Events>();
  private exportService: EnhancedExportService;
  private previewManager: ExportPreviewManager;
  private batchManager: BatchExportManager;

  constructor(private editor: GAssetForgeEditor) {
    this.exportService = new EnhancedExportService(editor);
    this.previewManager = new ExportPreviewManager(editor);
    this.batchManager = new BatchExportManager(editor);

    this.setupEventListeners();
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
   * 快速导出 - 使用预设配置
   */
  async quickExport(
    format: ExportFormat,
    preset: keyof typeof EXPORT_PRESETS = 'WEB_STANDARD',
    filename = 'design',
  ): Promise<void> {
    const presetConfig = EXPORT_PRESETS[preset];

    const options: ExportOptions = {
      format,
      filename,
      quality: {
        quality: presetConfig.quality,
        scale: presetConfig.scale,
      },
      includeBackground: presetConfig.includeBackground,
      backgroundColor: presetConfig.backgroundColor || '#ffffff',
      scope: 'selected',
    };

    await this.exportWithOptions(options);
  }

  /**
   * 自定义导出
   */
  async exportWithOptions(options: ExportOptions): Promise<void> {
    try {
      this.eventEmitter.emit('exportStarted');

      const blob = await this.exportService.exportSingle(options);
      const filename = this.generateFilename(options.filename, options.format);

      downloadBlob(blob, filename);

      this.eventEmitter.emit('exportCompleted', {
        success: true,
        filename,
      });
    } catch (error) {
      this.eventEmitter.emit('exportError', error as Error);
    }
  }

  /**
   * 批量导出
   */
  async batchExport(options: BatchExportOptions): Promise<void> {
    try {
      await this.batchManager.startBatchExport(options);
    } catch (error) {
      this.eventEmitter.emit('exportError', error as Error);
    }
  }

  /**
   * 生成预览
   */
  async generatePreview(options: ExportOptions): Promise<void> {
    await this.previewManager.generatePreview(options);
  }

  /**
   * 导出为多种格式
   */
  async exportMultipleFormats(
    formats: ExportFormat[],
    baseOptions: Omit<ExportOptions, 'format'>,
  ): Promise<void> {
    for (const format of formats) {
      try {
        const options: ExportOptions = { ...baseOptions, format };
        await this.exportWithOptions(options);
      } catch (error) {
        console.error(`导出 ${format} 格式失败:`, error);
      }
    }
  }

  /**
   * 导出为指定分辨率
   */
  async exportWithResolution(
    format: ExportFormat,
    resolution:
      | keyof typeof RESOLUTION_PRESETS
      | { width: number; height: number },
    filename = 'design',
  ): Promise<void> {
    const targetResolution =
      typeof resolution === 'string'
        ? RESOLUTION_PRESETS[resolution]
        : resolution;

    // 计算当前内容的尺寸
    const currentBounds = this.getCurrentBounds();
    const scaleX = targetResolution.width / currentBounds.width;
    const scaleY = targetResolution.height / currentBounds.height;
    const scale = Math.min(scaleX, scaleY); // 保持比例

    const options: ExportOptions = {
      format,
      filename,
      quality: {
        quality: 0.9,
        scale,
        width: targetResolution.width,
        height: targetResolution.height,
      },
      includeBackground: true,
      backgroundColor: '#ffffff',
      scope: 'selected',
    };

    await this.exportWithOptions(options);
  }

  /**
   * 导出选中元素
   */
  async exportSelected(
    format: ExportFormat = ExportFormat.PNG,
    filename = 'selected',
  ): Promise<void> {
    const selectedItems = this.editor.selectedElements.getItems();

    if (selectedItems.length === 0) {
      throw new Error('没有选中的元素');
    }

    const options: ExportOptions = {
      format,
      filename,
      quality: EXPORT_PRESETS.WEB_STANDARD,
      includeBackground: false,
      scope: 'selected',
    };

    await this.exportWithOptions(options);
  }

  /**
   * 导出整个画布
   */
  async exportCanvas(
    format: ExportFormat = ExportFormat.PNG,
    filename = 'canvas',
  ): Promise<void> {
    const options: ExportOptions = {
      format,
      filename,
      quality: EXPORT_PRESETS.WEB_STANDARD,
      includeBackground: true,
      backgroundColor: this.editor.setting.get('canvasBgColor'),
      scope: 'all',
    };

    await this.exportWithOptions(options);
  }

  /**
   * 导出可见元素
   */
  async exportVisible(
    format: ExportFormat = ExportFormat.PNG,
    filename = 'visible',
  ): Promise<void> {
    const options: ExportOptions = {
      format,
      filename,
      quality: EXPORT_PRESETS.WEB_STANDARD,
      includeBackground: false,
      scope: 'visible',
    };

    await this.exportWithOptions(options);
  }

  /**
   * 获取支持的导出格式
   */
  getSupportedFormats(): ExportFormat[] {
    return Object.values(ExportFormat);
  }

  /**
   * 获取预设配置
   */
  getPresets(): typeof EXPORT_PRESETS {
    return EXPORT_PRESETS;
  }

  /**
   * 获取分辨率预设
   */
  getResolutionPresets(): typeof RESOLUTION_PRESETS {
    return RESOLUTION_PRESETS;
  }

  /**
   * 检查是否有可导出的内容
   */
  hasExportableContent(
    scope: 'selected' | 'all' | 'visible' = 'selected',
  ): boolean {
    switch (scope) {
      case 'selected':
        return this.editor.selectedElements.getItems().length > 0;
      case 'visible':
        return this.getVisibleGraphics().length > 0;
      case 'all':
        return this.getAllGraphics().length > 0;
      default:
        return false;
    }
  }

  /**
   * 获取当前内容边界
   */
  getCurrentBounds(): { width: number; height: number; x: number; y: number } {
    const selectedItems = this.editor.selectedElements.getItems();

    if (selectedItems.length > 0) {
      return this.calculateBounds(selectedItems);
    }

    const allGraphics = this.getAllGraphics();
    return this.calculateBounds(allGraphics);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 预览管理器事件
    this.previewManager.on('previewGenerated', (preview) => {
      this.eventEmitter.emit('previewReady', preview);
    });

    this.previewManager.on('previewError', (error) => {
      this.eventEmitter.emit('exportError', error);
    });

    // 批量导出管理器事件
    this.batchManager.on('progress', (progress) => {
      this.eventEmitter.emit('batchProgress', progress);
    });

    this.batchManager.on('completed', (result) => {
      this.eventEmitter.emit('batchCompleted', result);
    });

    this.batchManager.on('error', (error) => {
      this.eventEmitter.emit('exportError', error);
    });
  }

  /**
   * 生成文件名
   */
  private generateFilename(baseName: string, format: ExportFormat): string {
    const extension = format === ExportFormat.JPG ? 'jpg' : format;
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}.${extension}`;
  }

  /**
   * 获取所有图形
   */
  private getAllGraphics() {
    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) return [];

    const result: any[] = [];
    this.collectGraphicsRecursively(currentCanvas, result);
    return result;
  }

  /**
   * 获取可见图形
   */
  private getVisibleGraphics() {
    return this.getAllGraphics().filter((graphics) => graphics.isVisible());
  }

  /**
   * 递归收集图形
   */
  private collectGraphicsRecursively(parent: any, result: any[]): void {
    const children = parent.getChildren();
    for (const child of children) {
      result.push(child);
      this.collectGraphicsRecursively(child, result);
    }
  }

  /**
   * 计算边界
   */
  private calculateBounds(graphics: any[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (graphics.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const graphic of graphics) {
      const bbox = graphic.getBboxWithStroke();
      minX = Math.min(minX, bbox.minX);
      minY = Math.min(minY, bbox.minY);
      maxX = Math.max(maxX, bbox.maxX);
      maxY = Math.max(maxY, bbox.maxY);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 销毁工具
   */
  destroy(): void {
    this.previewManager.destroy();
    this.batchManager.destroy();
    // 清理事件监听器
    // this.eventEmitter 没有 removeAllListeners 方法，需要手动清理
  }
}

/**
 * 创建高级导出工具实例
 */
export const createAdvancedExportTool = (
  editor: GAssetForgeEditor,
): AdvancedExportTool => {
  return new AdvancedExportTool(editor);
};
