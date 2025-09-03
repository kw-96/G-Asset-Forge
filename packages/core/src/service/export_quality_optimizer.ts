/**
 * 导出质量优化器 - 根据内容和目标自动优化导出设置（简化版）
 */

import { type GAssetForgeGraphics } from '../graphics';
import { ExportFormat, type ExportQuality } from './enhanced_export_service';

/**
 * 导出目标类型
 */
export enum ExportTarget {
  WEB_DISPLAY = 'web_display', // 网页显示
  PRINT_HIGH = 'print_high', // 高质量打印
  PRINT_DRAFT = 'print_draft', // 草稿打印
  SOCIAL_MEDIA = 'social_media', // 社交媒体
  EMAIL = 'email', // 邮件
  PRESENTATION = 'presentation', // 演示文稿
  MOBILE_APP = 'mobile_app', // 移动应用
  ICON = 'icon', // 图标
  THUMBNAIL = 'thumbnail', // 缩略图
}

/**
 * 内容分析结果
 */
interface ContentAnalysis {
  hasText: boolean;
  hasComplexPaths: boolean;
  hasImages: boolean;
  complexity: number;
  colorCount: number;
  dimensions: { width: number; height: number };
}

/**
 * 优化建议
 */
interface OptimizationSuggestion {
  recommendedFormat: ExportFormat;
  recommendedQuality: ExportQuality;
  reason: string;
  estimatedSize: string;
  alternatives: Array<{
    format: ExportFormat;
    quality: ExportQuality;
    reason: string;
  }>;
}

/**
 * 导出质量优化器（简化版）
 */
export class ExportQualityOptimizer {
  constructor() {}

  /**
   * 分析内容并提供优化建议
   */
  analyzeAndOptimize(
    graphics: GAssetForgeGraphics[],
    target: ExportTarget,
  ): OptimizationSuggestion {
    const analysis = this.analyzeContent(graphics);
    return this.generateOptimizationSuggestion(analysis, target);
  }

  /**
   * 分析内容特征（简化版）
   */
  private analyzeContent(graphics: GAssetForgeGraphics[]): ContentAnalysis {
    let hasText = false;
    let hasComplexPaths = false;
    let hasImages = false;
    let complexity = 0;
    const colors = new Set<string>();

    // 计算边界
    const dimensions = this.calculateDimensions(graphics);

    for (const graphic of graphics) {
      const type = graphic.attrs.type;

      switch (type) {
        case 'Text':
          hasText = true;
          complexity += 0.3;
          break;
        case 'Path':
          hasComplexPaths = true;
          complexity += 0.5;
          break;
        case 'Frame':
          hasImages = true;
          complexity += 0.4;
          break;
      }

      // 简化的颜色分析
      colors.add('color'); // 占位符

      // 分析子元素
      const children = graphic.getChildren();
      if (children.length > 0) {
        const childAnalysis = this.analyzeContent(children);
        hasText = hasText || childAnalysis.hasText;
        hasComplexPaths = hasComplexPaths || childAnalysis.hasComplexPaths;
        hasImages = hasImages || childAnalysis.hasImages;
        complexity += childAnalysis.complexity * 0.5;
      }
    }

    complexity += Math.min(graphics.length * 0.1, 0.5);
    complexity = Math.min(complexity, 1);

    return {
      hasText,
      hasComplexPaths,
      hasImages,
      complexity,
      colorCount: colors.size,
      dimensions,
    };
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestion(
    analysis: ContentAnalysis,
    target: ExportTarget,
  ): OptimizationSuggestion {
    switch (target) {
      case ExportTarget.WEB_DISPLAY:
        return this.optimizeForWeb(analysis);
      case ExportTarget.PRINT_HIGH:
        return this.optimizeForPrint(analysis, true);
      case ExportTarget.SOCIAL_MEDIA:
        return this.optimizeForSocialMedia(analysis);
      default:
        return this.optimizeForWeb(analysis);
    }
  }

  /**
   * 网页显示优化
   */
  private optimizeForWeb(analysis: ContentAnalysis): OptimizationSuggestion {
    if (analysis.hasText || analysis.hasComplexPaths) {
      return {
        recommendedFormat: ExportFormat.SVG,
        recommendedQuality: { quality: 1.0, scale: 1.0 },
        reason: '包含文本或复杂路径，SVG 格式可保持清晰度且文件较小',
        estimatedSize: '< 100KB',
        alternatives: [
          {
            format: ExportFormat.PNG,
            quality: { quality: 0.9, scale: 2.0 },
            reason: '高分辨率 PNG 适合高清显示',
          },
        ],
      };
    }

    return {
      recommendedFormat: ExportFormat.PNG,
      recommendedQuality: { quality: 0.9, scale: 1.0 },
      reason: '通用格式，适合大多数网页使用场景',
      estimatedSize: this.estimateFileSize(analysis, ExportFormat.PNG, 0.9),
      alternatives: [
        {
          format: ExportFormat.WEBP,
          quality: { quality: 0.85, scale: 1.0 },
          reason: '更小的文件大小（需要浏览器支持）',
        },
      ],
    };
  }

  /**
   * 打印优化
   */
  private optimizeForPrint(
    analysis: ContentAnalysis,
    highQuality: boolean,
  ): OptimizationSuggestion {
    const scale = highQuality ? 3.0 : 2.0;
    const quality = highQuality ? 1.0 : 0.95;

    if (analysis.hasText || analysis.hasComplexPaths) {
      return {
        recommendedFormat: ExportFormat.PDF,
        recommendedQuality: { quality: 1.0, scale },
        reason: 'PDF 格式最适合打印，保持矢量清晰度',
        estimatedSize: '< 1MB',
        alternatives: [
          {
            format: ExportFormat.PNG,
            quality: { quality, scale },
            reason: '高分辨率位图，兼容性更好',
          },
        ],
      };
    }

    return {
      recommendedFormat: ExportFormat.PNG,
      recommendedQuality: { quality, scale },
      reason: `${
        highQuality ? '高质量' : '标准质量'
      }打印，${scale}倍分辨率确保清晰度`,
      estimatedSize: this.estimateFileSize(
        analysis,
        ExportFormat.PNG,
        quality,
        scale,
      ),
      alternatives: [
        {
          format: ExportFormat.PDF,
          quality: { quality: 1.0, scale },
          reason: '矢量格式，无限缩放',
        },
      ],
    };
  }

  /**
   * 社交媒体优化
   */
  private optimizeForSocialMedia(
    analysis: ContentAnalysis,
  ): OptimizationSuggestion {
    return {
      recommendedFormat: ExportFormat.JPG,
      recommendedQuality: { quality: 0.85, scale: 1.0 },
      reason: '社交媒体平台通常会压缩图片，JPG 格式更适合',
      estimatedSize: this.estimateFileSize(analysis, ExportFormat.JPG, 0.85),
      alternatives: [
        {
          format: ExportFormat.PNG,
          quality: { quality: 0.9, scale: 1.0 },
          reason: '需要透明背景时使用',
        },
      ],
    };
  }

  /**
   * 计算内容尺寸
   */
  private calculateDimensions(graphics: GAssetForgeGraphics[]): {
    width: number;
    height: number;
  } {
    if (graphics.length === 0) {
      return { width: 100, height: 100 };
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
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 估算文件大小（简化版）
   */
  private estimateFileSize(
    analysis: ContentAnalysis,
    format: ExportFormat,
    quality: number,
    scale: number = 1.0,
  ): string {
    const { width, height } = analysis.dimensions;
    const pixelCount = width * height * scale * scale;

    let baseSize: number;

    switch (format) {
      case ExportFormat.SVG:
        baseSize = Math.max(analysis.complexity * 50000, 5000);
        break;
      case ExportFormat.PNG:
        baseSize = pixelCount * 4 * quality;
        break;
      case ExportFormat.JPG:
        baseSize = pixelCount * 0.5 * quality;
        break;
      case ExportFormat.WEBP:
        baseSize = pixelCount * 0.35 * quality;
        break;
      case ExportFormat.PDF:
        baseSize = Math.max(pixelCount * 0.1 * quality, 50000);
        break;
      default:
        baseSize = pixelCount * quality;
    }

    baseSize *= 1 + analysis.complexity * 0.5;

    return this.formatFileSize(baseSize);
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${Math.round(bytes)} B`;
    } else if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }
}

/**
 * 创建导出质量优化器实例
 */
export const createExportQualityOptimizer = (): ExportQualityOptimizer => {
  return new ExportQualityOptimizer();
};
