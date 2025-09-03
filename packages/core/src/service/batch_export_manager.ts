/**
 * 批量导出管理器 - 处理多画板和多图层的批量导出
 */

import { EventEmitter } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import { type GAssetForgeGraphics } from '../graphics';
import {
  type BatchExportOptions,
  ExportFormat,
  type ExportOptions,
  downloadBlob,
} from './enhanced_export_service';

export interface BatchExportProgress {
  current: number;
  total: number;
  currentItem: string;
  completed: boolean;
}

export interface BatchExportResult {
  success: boolean;
  totalFiles: number;
  successCount: number;
  failedItems: Array<{ name: string; error: string }>;
  downloadUrl?: string;
}

interface Events {
  progress(progress: BatchExportProgress): void;
  completed(result: BatchExportResult): void;
  error(error: Error): void;
  started(): void;
}

/**
 * 批量导出管理器
 */
export class BatchExportManager {
  private eventEmitter = new EventEmitter<Events>();
  private isExporting = false;
  private currentProgress: BatchExportProgress | null = null;

  constructor(private editor: GAssetForgeEditor) {}

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
   * 开始批量导出
   */
  async startBatchExport(options: BatchExportOptions): Promise<void> {
    if (this.isExporting) {
      throw new Error('批量导出正在进行中');
    }

    this.isExporting = true;
    this.eventEmitter.emit('started');

    try {
      const result = await this.performBatchExport(options);
      this.eventEmitter.emit('completed', result);
    } catch (error) {
      this.eventEmitter.emit('error', error as Error);
    } finally {
      this.isExporting = false;
      this.currentProgress = null;
    }
  }

  /**
   * 获取当前进度
   */
  getCurrentProgress(): BatchExportProgress | null {
    return this.currentProgress;
  }

  /**
   * 检查是否正在导出
   */
  isExportingInProgress(): boolean {
    return this.isExporting;
  }

  /**
   * 取消批量导出
   */
  cancelExport(): void {
    if (this.isExporting) {
      this.isExporting = false;
      this.currentProgress = null;
    }
  }

  /**
   * 执行批量导出
   */
  private async performBatchExport(
    options: BatchExportOptions,
  ): Promise<BatchExportResult> {
    const exportItems = this.getExportItems(options);
    const results: Blob[] = [];
    const failedItems: Array<{ name: string; error: string }> = [];

    this.currentProgress = {
      current: 0,
      total: exportItems.length,
      currentItem: '',
      completed: false,
    };

    for (let i = 0; i < exportItems.length && this.isExporting; i++) {
      const item = exportItems[i];

      this.currentProgress = {
        current: i + 1,
        total: exportItems.length,
        currentItem: item.name,
        completed: false,
      };

      this.eventEmitter.emit('progress', this.currentProgress);

      try {
        const blob = await this.exportItem(item, options);
        results.push(blob);

        // 单独下载每个文件
        const filename = this.generateFilename(item.name, options.format);
        downloadBlob(blob, filename);
      } catch (error) {
        failedItems.push({
          name: item.name,
          error: (error as Error).message,
        });
      }

      // 添加小延迟避免阻塞 UI
      await this.delay(10);
    }

    this.currentProgress = {
      current: exportItems.length,
      total: exportItems.length,
      currentItem: '完成',
      completed: true,
    };

    this.eventEmitter.emit('progress', this.currentProgress);

    return {
      success: failedItems.length === 0,
      totalFiles: exportItems.length,
      successCount: results.length,
      failedItems,
    };
  }

  /**
   * 获取导出项目列表
   */
  private getExportItems(
    options: BatchExportOptions,
  ): Array<{ name: string; graphics: GAssetForgeGraphics[] }> {
    const items: Array<{ name: string; graphics: GAssetForgeGraphics[] }> = [];

    if (options.separateByCanvas) {
      // 按画板分别导出
      const canvases = this.getAllCanvases();
      canvases.forEach((canvas, index) => {
        const graphics: GAssetForgeGraphics[] = [];
        this.collectGraphicsRecursively(canvas, graphics);
        items.push({
          name: `${options.filenamePrefix}_canvas_${index + 1}`,
          graphics: graphics.filter((g) => g.isVisible()),
        });
      });
    } else if (options.separateByLayer) {
      // 按图层分别导出
      const layers = this.getTopLevelLayers();
      layers.forEach((layer, index) => {
        const graphics: GAssetForgeGraphics[] = [layer];
        this.collectGraphicsRecursively(layer, graphics);
        items.push({
          name: `${options.filenamePrefix}_layer_${index + 1}`,
          graphics: graphics.filter((g) => g.isVisible()),
        });
      });
    } else {
      // 单个文件导出
      const allGraphics = this.getGraphicsToExport(options.scope);
      items.push({
        name: options.filenamePrefix,
        graphics: allGraphics,
      });
    }

    return items.filter((item) => item.graphics.length > 0);
  }

  /**
   * 导出单个项目
   */
  private async exportItem(
    item: { name: string; graphics: GAssetForgeGraphics[] },
    options: BatchExportOptions,
  ): Promise<Blob> {
    const exportOptions: ExportOptions = {
      format: options.format,
      filename: item.name,
      quality: options.quality,
      includeBackground: options.includeBackground,
      backgroundColor: options.backgroundColor,
      scope: 'all', // 已经筛选过了
    };

    // 临时设置选中的图形
    const originalSelection = this.editor.selectedElements.getItems();
    this.editor.selectedElements.clear();

    try {
      // 这里需要一个特殊的导出方法，直接传入图形数组
      return await this.exportSpecificGraphics(item.graphics, exportOptions);
    } finally {
      // 恢复原始选择
      this.editor.selectedElements.clear();
      this.editor.selectedElements.setItems(originalSelection);
    }
  }

  /**
   * 导出指定的图形数组
   */
  private async exportSpecificGraphics(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    switch (options.format) {
      case ExportFormat.PNG:
      case ExportFormat.JPG:
      case ExportFormat.WEBP:
        return this.exportGraphicsAsImage(graphics, options);
      case ExportFormat.SVG:
        return this.exportGraphicsAsSVG(graphics, options);
      case ExportFormat.PDF:
        return this.exportGraphicsAsPDF(graphics, options);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 导出图形为图片
   */
  private async exportGraphicsAsImage(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    const bounds = this.calculateBounds(graphics);
    const scale = options.quality.scale;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = Math.round(bounds.width * scale);
    canvas.height = Math.round(bounds.height * scale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (options.includeBackground) {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.scale(scale, scale);
    ctx.translate(-bounds.x, -bounds.y);

    await this.renderGraphicsToCanvas(graphics, ctx);

    return new Promise((resolve, reject) => {
      const mimeType = this.getMimeType(options.format as ExportFormat);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('导出图片失败'));
          }
        },
        mimeType,
        options.quality.quality,
      );
    });
  }

  /**
   * 导出图形为 SVG
   */
  private async exportGraphicsAsSVG(
    graphics: GAssetForgeGraphics[],
    _options: ExportOptions,
  ): Promise<Blob> {
    // 使用现有的 toSVG 函数
    const { toSVG } = await import('../to_svg');
    const svgContent = toSVG(graphics);
    return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  /**
   * 导出图形为 PDF
   */
  private async exportGraphicsAsPDF(
    graphics: GAssetForgeGraphics[],
    _options: ExportOptions,
  ): Promise<Blob> {
    // 先导出为高质量 PNG
    const pngBlob = await this.exportGraphicsAsImage(graphics, {
      ..._options,
      format: ExportFormat.PNG,
      quality: { ..._options.quality, quality: 1.0 },
    });

    // 创建简单的 PDF
    const bounds = this.calculateBounds(graphics);
    const pdfContent = await this.createSimplePDF(pngBlob, bounds);

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * 获取所有画板
   */
  private getAllCanvases(): GAssetForgeGraphics[] {
    const currentCanvas = this.editor.doc.getCurrentCanvas();
    return currentCanvas ? [currentCanvas] : [];
  }

  /**
   * 获取顶级图层
   */
  private getTopLevelLayers(): GAssetForgeGraphics[] {
    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) return [];
    return currentCanvas.getChildren();
  }

  /**
   * 获取要导出的图形对象
   */
  private getGraphicsToExport(
    scope: 'selected' | 'all' | 'visible',
  ): GAssetForgeGraphics[] {
    switch (scope) {
      case 'selected':
        return this.editor.selectedElements
          .getItems()
          .filter((item) => item.isVisible());
      case 'visible':
        return this.getAllVisibleGraphics();
      case 'all':
      default:
        return this.getAllGraphics();
    }
  }

  /**
   * 获取所有图形对象
   */
  private getAllGraphics(): GAssetForgeGraphics[] {
    const currentCanvas = this.editor.doc.getCurrentCanvas();
    if (!currentCanvas) return [];

    const result: GAssetForgeGraphics[] = [];
    this.collectGraphicsRecursively(currentCanvas, result);
    return result;
  }

  /**
   * 获取所有可见图形对象
   */
  private getAllVisibleGraphics(): GAssetForgeGraphics[] {
    return this.getAllGraphics().filter((graphics) => graphics.isVisible());
  }

  /**
   * 递归收集图形对象
   */
  private collectGraphicsRecursively(
    parent: GAssetForgeGraphics,
    result: GAssetForgeGraphics[],
  ): void {
    const children = parent.getChildren();
    for (const child of children) {
      result.push(child);
      this.collectGraphicsRecursively(child, result);
    }
  }

  /**
   * 计算图形边界
   */
  private calculateBounds(graphics: GAssetForgeGraphics[]): {
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
   * 渲染图形到画布
   */
  private async renderGraphicsToCanvas(
    graphics: GAssetForgeGraphics[],
    ctx: CanvasRenderingContext2D,
  ): Promise<void> {
    const imgManager = this.editor.imgManager;

    for (const graphic of graphics) {
      if (graphic.isVisible()) {
        ctx.save();
        graphic.draw({
          ctx,
          imgManager,
          smooth: true,
          viewportArea: undefined,
        });
        ctx.restore();
      }
    }
  }

  /**
   * 获取 MIME 类型
   */
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'png':
        return 'image/png';
      case 'jpg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(baseName: string, format: ExportFormat): string {
    const extension = format === 'jpg' ? 'jpg' : format;
    return `${baseName}.${extension}`;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 创建简单的 PDF
   */
  private async createSimplePDF(
    _imageBlob: Blob,
    bounds: { width: number; height: number },
  ): Promise<string> {
    // 基础 PDF 实现
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${bounds.width} ${bounds.height}]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${bounds.width} 0 0 ${bounds.height} 0 0 cm
/Im1 Do
Q
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000225 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
319
%%EOF`;

    return pdfContent;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.cancelExport();
    // 清理事件监听器
  }
}

/**
 * 创建批量导出管理器实例
 */
export const createBatchExportManager = (
  editor: GAssetForgeEditor,
): BatchExportManager => {
  return new BatchExportManager(editor);
};
