import { AssetType } from '../types';

/**
 * 素材辅助工具类
 */
export class AssetHelpers {
  /**
   * 根据文件类型推断素材类型
   */
  static getAssetTypeFromFile(file: File): AssetType {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (mimeType.startsWith('image/')) {
      if (fileName.includes('icon') || fileName.includes('ico')) {
        return AssetType.Icon;
      }
      if (fileName.includes('bg') || fileName.includes('background')) {
        return AssetType.Background;
      }
      if (fileName.includes('char') || fileName.includes('character')) {
        return AssetType.Character;
      }
      if (fileName.includes('deco') || fileName.includes('decoration')) {
        return AssetType.Decoration;
      }
      return AssetType.Image;
    }

    return AssetType.Image; // 默认类型
  }

  /**
   * 生成随机颜色
   */
  static generateRandomColor(): string {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 从文件名中提取素材名称（移除扩展名）
   */
  static extractAssetName(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
  }

  /**
   * 验证文件是否为支持的素材格式
   */
  static isValidAssetFile(file: File): boolean {
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
   * 格式化文件大小显示
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 生成素材描述
   */
  static generateAssetDescription(file: File): string {
    const type = file.type || '未知格式';
    const size = this.formatFileSize(file.size);
    return `上传的${type}文件，大小：${size}`;
  }
}
