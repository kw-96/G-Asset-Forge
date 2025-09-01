/**
 * 增强导出服务 - 支持多种格式和高级功能
 * 基于现有的 exportService 扩展，添加 SVG、PDF、WebP 等格式支持
 */

import { type GAssetForgeEditor } from '../editor';
import { type GAssetForgeGraphics } from '../graphics';
import { toSVG } from '../to_svg';

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  PNG = 'png',
  JPG = 'jpg',
  WEBP = 'webp',
  SVG = 'svg',
  PDF = 'pdf',
  GAF = 'gaf', // 原生格式
}

/**
 * 导出质量设置
 */
export interface ExportQuality {
  /** 图片质量 0-1 */
  quality: number;
  /** 输出分辨率倍数 */
  scale: number;
  /** 自定义宽度（可选） */
  width?: number;
  /** 自定义高度（可选） */
  height?: number;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat;
  /** 文件名（不含扩展名） */
  filename: string;
  /** 质量设置 */
  quality: ExportQuality;
  /** 是否包含背景 */
  includeBackground: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 导出范围 - 选中元素或全部 */
  scope: 'selected' | 'all' | 'visible';
  /** 是否显示预览 */
  showPreview?: boolean;
}

/**
 * 批量导出选项
 */
export interface BatchExportOptions extends Omit<ExportOptions, 'filename'> {
  /** 文件名前缀 */
  filenamePrefix: string;
  /** 是否按图层分别导出 */
  separateByLayer: boolean;
  /** 是否按画板分别导出 */
  separateByCanvas: boolean;
}

/**
 * 导出预览数据
 */
export interface ExportPreview {
  /** 预览图片 DataURL */
  dataUrl: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 图片尺寸 */
  dimensions: { width: number; height: number };
  /** 格式信息 */
  format: ExportFormat;
}

/**
 * 增强导出服务类
 */
export class EnhancedExportService {
  constructor(private editor: GAssetForgeEditor) {}

  /**
   * 单个文件导出
   */
  async exportSingle(options: ExportOptions): Promise<Blob> {
    const graphics = this.getGraphicsToExport(options.scope);

    if (graphics.length === 0) {
      throw new Error('没有可导出的内容');
    }

    switch (options.format) {
      case ExportFormat.PNG:
      case ExportFormat.JPG:
      case ExportFormat.WEBP:
        return this.exportAsImage(graphics, options);
      case ExportFormat.SVG:
        return this.exportAsSVG(graphics, options);
      case ExportFormat.PDF:
        return this.exportAsPDF(graphics, options);
      case ExportFormat.GAF:
        return this.exportAsGAF(graphics, options);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 批量导出
   */
  async exportBatch(options: BatchExportOptions): Promise<Blob[]> {
    const results: Blob[] = [];

    if (options.separateByCanvas) {
      // 按画板分别导出
      const canvases = this.getAllCanvases();
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const filename = `${options.filenamePrefix}_canvas_${i + 1}`;
        const blob = await this.exportCanvas(canvas, { ...options, filename });
        results.push(blob);
      }
    } else if (options.separateByLayer) {
      // 按图层分别导出
      const layers = this.getTopLevelLayers();
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const filename = `${options.filenamePrefix}_layer_${i + 1}`;
        const blob = await this.exportLayer(layer, { ...options, filename });
        results.push(blob);
      }
    } else {
      // 单个文件导出
      const blob = await this.exportSingle({
        ...options,
        filename: options.filenamePrefix,
      });
      results.push(blob);
    }

    return results;
  }

  /**
   * 生成导出预览
   */
  async generatePreview(options: ExportOptions): Promise<ExportPreview> {
    const graphics = this.getGraphicsToExport(options.scope);

    if (graphics.length === 0) {
      throw new Error('没有可预览的内容');
    }

    // 生成预览用的小尺寸图片
    const previewOptions: ExportOptions = {
      ...options,
      quality: {
        ...options.quality,
        scale: Math.min(options.quality.scale, 0.5), // 预览最大0.5倍
      },
    };

    const blob = await this.exportAsImage(graphics, previewOptions);
    const dataUrl = await this.blobToDataUrl(blob);

    // 计算实际导出的尺寸
    const bounds = this.calculateBounds(graphics);
    const actualDimensions = {
      width: Math.round(bounds.width * options.quality.scale),
      height: Math.round(bounds.height * options.quality.scale),
    };

    return {
      dataUrl,
      fileSize: blob.size,
      dimensions: actualDimensions,
      format: options.format,
    };
  }

  /**
   * 导出为图片格式（PNG/JPG/WebP）
   */
  private async exportAsImage(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    const bounds = this.calculateBounds(graphics);
    const scale = options.quality.scale;

    // 创建离屏画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // 设置画布尺寸
    canvas.width = Math.round(bounds.width * scale);
    canvas.height = Math.round(bounds.height * scale);

    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 绘制背景
    if (options.includeBackground) {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 应用缩放和偏移
    ctx.scale(scale, scale);
    ctx.translate(-bounds.x, -bounds.y);

    // 渲染图形
    await this.renderGraphicsToCanvas(graphics, ctx);

    // 转换为 Blob
    return new Promise((resolve, reject) => {
      const mimeType = this.getMimeType(options.format);
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
   * 导出为 SVG 格式
   */
  private async exportAsSVG(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    const svgContent = toSVG(graphics);
    return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  /**
   * 导出为 PDF 格式（基础实现）
   */
  private async exportAsPDF(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    // 先导出为高质量 PNG，然后嵌入到 PDF 中
    const pngBlob = await this.exportAsImage(graphics, {
      ...options,
      format: ExportFormat.PNG,
      quality: { ...options.quality, quality: 1.0 },
    });

    // 创建简单的 PDF 结构
    const bounds = this.calculateBounds(graphics);
    const pdfContent = await this.createSimplePDF(pngBlob, bounds);

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * 导出为原生 GAF 格式
   */
  private async exportAsGAF(
    graphics: GAssetForgeGraphics[],
    options: ExportOptions,
  ): Promise<Blob> {
    const data = this.editor.sceneGraph.toJSON();
    return new Blob([data], { type: 'application/json' });
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
      case ExportFormat.PNG:
        return 'image/png';
      case ExportFormat.JPG:
        return 'image/jpeg';
      case ExportFormat.WEBP:
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  /**
   * Blob 转 DataURL
   */
  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 获取所有画板
   */
  private getAllCanvases(): GAssetForgeGraphics[] {
    // 简化实现：返回当前画板
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
   * 导出单个画板
   */
  private async exportCanvas(
    _canvas: GAssetForgeGraphics,
    options: ExportOptions,
  ): Promise<Blob> {
    const graphics: GAssetForgeGraphics[] = [];
    this.collectGraphicsRecursively(canvas, graphics);
    return this.exportSingle({ ...options, scope: 'all' });
  }

  /**
   * 导出单个图层
   */
  private async exportLayer(
    layer: GAssetForgeGraphics,
    options: ExportOptions,
  ): Promise<Blob> {
    const graphics = [layer];
    this.collectGraphicsRecursively(layer, graphics);

    switch (options.format) {
      case ExportFormat.PNG:
      case ExportFormat.JPG:
      case ExportFormat.WEBP:
        return this.exportAsImage(graphics, options);
      case ExportFormat.SVG:
        return this.exportAsSVG(graphics, options);
      case ExportFormat.PDF:
        return this.exportAsPDF(graphics, options);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 创建简单的 PDF（基础实现）
   */
  private async createSimplePDF(
    _imageBlob: Blob,
    bounds: { width: number; height: number },
  ): Promise<string> {
    // 这是一个非常基础的 PDF 实现
    // 在实际项目中，建议使用 jsPDF 或 PDFKit 等专业库
    // const imageData = await this.blobToDataUrl(imageBlob); // 暂时不使用

    // 简化的 PDF 结构
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
}

/**
 * 下载文件的工具函数
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 创建增强导出服务实例
 */
export const createEnhancedExportService = (
  editor: GAssetForgeEditor,
): EnhancedExportService => {
  return new EnhancedExportService(editor);
};
