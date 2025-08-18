/**
 * 缩略图生成器
 * @description 为素材生成缩略图
 */
export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'png' | 'jpg' | 'webp';
}

export class ThumbnailGenerator {
  /**
   * 生成缩略图
   */
  static async generateThumbnail(
    source: string | File | HTMLImageElement,
    options: ThumbnailOptions
  ): Promise<string> {
    const { width, height, quality = 0.8, format = 'jpg' } = options;
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const img = new Image();
      
      img.onload = () => {
        // 计算缩放比例
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // 居中绘制
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        // 清空画布
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制图像
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // 转换为数据URL
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('图像加载失败'));
      };
      
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(source);
      } else if (source instanceof HTMLImageElement) {
        img.src = source.src;
      }
    });
  }
  
  /**
   * 批量生成缩略图
   */
  static async generateBatchThumbnails(
    sources: (string | File | HTMLImageElement)[],
    options: ThumbnailOptions
  ): Promise<string[]> {
    const promises = sources.map(source => 
      this.generateThumbnail(source, options)
    );
    
    return Promise.all(promises);
  }
}