/**
 * 图片处理器 - 负责图片文件的处理和缩略图生成
 */
export class ImageProcessor {
  /**
   * 处理图片文件，提取尺寸和生成缩略图
   */
  async processImageFile(file: File): Promise<{
    width: number;
    height: number;
    thumbnail: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }

      img.onload = () => {
        const { width, height } = img;

        // 生成缩略图
        const thumbnail = this.generateThumbnail(img, canvas, ctx);

        resolve({ width, height, thumbnail });

        // 清理资源
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('无法加载图片文件'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 生成缩略图
   */
  private generateThumbnail(
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ): string {
    const { width, height } = img;
    const maxSize = 200;

    let thumbWidth = width;
    let thumbHeight = height;

    // 计算缩略图尺寸（保持宽高比）
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      thumbWidth = width * ratio;
      thumbHeight = height * ratio;
    }

    canvas.width = thumbWidth;
    canvas.height = thumbHeight;

    // 绘制缩略图
    ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    // 返回数据URL
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * 验证文件是否为支持的图片格式
   */
  isValidImageFile(file: File): boolean {
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
   * 获取图片文件的基本信息
   */
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    if (!this.isValidImageFile(file)) {
      throw new Error('不支持的图片格式');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
        });

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('无法读取图片信息'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
