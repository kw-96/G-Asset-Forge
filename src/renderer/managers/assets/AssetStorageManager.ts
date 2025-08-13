// 素材存储管理器 - 负责素材文件的存储和管理
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';
import { type IAssetMetadata } from './AssetLibraryManager';

export interface IStorageConfig {
  baseUrl: string;
  maxFileSize: number; // 最大文件大小（字节）
  allowedTypes: string[]; // 允许的文件类型
  compressionQuality: number; // 压缩质量 0-1
  enableCompression: boolean; // 是否启用压缩
  storageType: 'local' | 'network' | 'cloud'; // 存储类型
}

export interface IUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'complete';
  message: string;
}

export interface IUploadResult {
  success: boolean;
  assetId?: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  metadata?: Partial<IAssetMetadata>;
  error?: string;
  warnings?: string[];
}

export interface IStorageStats {
  totalFiles: number;
  totalSize: number;
  usedSpace: number;
  availableSpace: number;
  compressionRatio: number;
}

export interface IAssetStorageEvents extends Record<string, (...args: any[]) => void> {
  uploadStarted(file: File): void;
  uploadProgress(progress: IUploadProgress): void;
  uploadCompleted(result: IUploadResult): void;
  uploadFailed(error: Error): void;
  fileDeleted(assetId: string): void;
  storageCleared(): void;
  compressionCompleted(originalSize: number, compressedSize: number): void;
  error(error: Error): void;
}

/**
 * 素材存储管理器
 * 负责素材文件的上传、存储、压缩和管理
 */
export class AssetStorageManager {
  private emitter = new EventEmitter<IAssetStorageEvents>();
  private config: IStorageConfig;
  private uploadQueue: Map<string, Promise<IUploadResult>> = new Map();
  private storageStats: IStorageStats = {
    totalFiles: 0,
    totalSize: 0,
    usedSpace: 0,
    availableSpace: 0,
    compressionRatio: 1
  };

  constructor(config?: Partial<IStorageConfig>) {
    this.config = {
      baseUrl: '/assets',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      compressionQuality: 0.8,
      enableCompression: true,
      storageType: 'local',
      ...config
    };

    this.loadStorageStats();
  }

  /**
   * 上传单个文件
   */
  async uploadFile(file: File, metadata?: Partial<IAssetMetadata>): Promise<IUploadResult> {
    const uploadId = this.generateUploadId();
    
    // 检查是否已在上传队列中
    const existingUpload = this.uploadQueue.get(file.name);
    if (existingUpload) {
      return existingUpload;
    }

    // 开始上传
    const uploadPromise = this.doUploadFile(file, metadata, uploadId);
    this.uploadQueue.set(file.name, uploadPromise);

    try {
      const result = await uploadPromise;
      return result;
    } finally {
      this.uploadQueue.delete(file.name);
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[], metadata?: Partial<IAssetMetadata>): Promise<IUploadResult[]> {
    const results: IUploadResult[] = [];
    
    // 限制并发上传数量
    const concurrency = 3;
    const chunks = this.chunkArray(Array.from(files), concurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(file => this.uploadFile(file, metadata));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * 实际上传文件的方法
   */
  private async doUploadFile(
    file: File,
    metadata: Partial<IAssetMetadata> = {},
    uploadId: string
  ): Promise<IUploadResult> {
    try {
      // 发送上传开始事件
      this.emitter.emit('uploadStarted', file);
      
      // 阶段1: 准备
      this.emitProgress(uploadId, {
        loaded: 0,
        total: file.size,
        percentage: 0,
        stage: 'preparing',
        message: '准备上传文件...'
      });

      // 验证文件
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || '验证失败',
          ...(validation.warnings ? { warnings: validation.warnings } : {})
        };
      }

      // 阶段2: 处理文件
      this.emitProgress(uploadId, {
        loaded: file.size * 0.2,
        total: file.size,
        percentage: 20,
        stage: 'processing',
        message: '处理文件...'
      });

      // 读取文件
      const fileData = await this.readFile(file);
      
      // 获取图片信息
      const imageInfo = await this.getImageInfo(fileData);
      
      // 压缩文件（如果需要）
      let processedData = fileData;
      let compressionRatio = 1;
      
      if (this.config.enableCompression && this.shouldCompress(file)) {
        const compressed = await this.compressImage(fileData, file.type);
        if (compressed.success && compressed.data) {
          processedData = compressed.data;
          compressionRatio = compressed.data.byteLength / fileData.byteLength;
          
          this.emitter.emit('compressionCompleted', fileData.byteLength, compressed.data.byteLength);
        }
      }

      // 阶段3: 上传
      this.emitProgress(uploadId, {
        loaded: file.size * 0.6,
        total: file.size,
        percentage: 60,
        stage: 'uploading',
        message: '上传文件...'
      });

      // 生成文件URL（模拟存储）
      const assetId = this.generateAssetId();
      const originalUrl = await this.storeFile(processedData, assetId, file.type);
      
      // 生成预览URL（对于图片）
      let previewUrl = originalUrl;
      if (imageInfo) {
        previewUrl = await this.generatePreview(processedData, assetId);
      }

      // 阶段4: 完成
      this.emitProgress(uploadId, {
        loaded: file.size,
        total: file.size,
        percentage: 100,
        stage: 'complete',
        message: '上传完成'
      });

      // 更新存储统计
      this.updateStorageStats(processedData.byteLength, compressionRatio);

      const result: IUploadResult = {
        success: true,
        assetId,
        originalUrl,
        previewUrl,
        metadata: {
          name: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
          fileType: file.type,
          fileSize: processedData.byteLength,
          dimensions: imageInfo || { width: 0, height: 0 },
          isCustom: true,
          ...metadata
        }
      };

      this.emitter.emit('uploadCompleted', result);
      return result;

    } catch (error) {
      const result: IUploadResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      this.emitter.emit('uploadFailed', error as Error);
      return result;
    }
  }

  /**
   * 验证文件
   */
  private validateFile(file: File): { valid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];

    // 检查文件大小
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `文件大小 ${this.formatFileSize(file.size)} 超过限制 ${this.formatFileSize(this.config.maxFileSize)}`
      };
    }

    // 检查文件类型
    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型: ${file.type}`
      };
    }

    // 检查文件名
    if (file.name.length > 255) {
      warnings.push('文件名过长，可能会被截断');
    }

    // 大文件警告
    if (file.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('文件较大，上传可能需要较长时间');
    }

    return { valid: true, warnings };
  }

  /**
   * 读取文件
   */
  private async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 获取图片信息
   */
  private async getImageInfo(data: ArrayBuffer): Promise<{ width: number; height: number } | null> {
    try {
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
          resolve(null);
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      });
    } catch {
      return null;
    }
  }

  /**
   * 判断是否需要压缩
   */
  private shouldCompress(file: File): boolean {
    // SVG文件不压缩
    if (file.type === 'image/svg+xml') {
      return false;
    }
    
    // 小文件不压缩
    if (file.size < 100 * 1024) { // 100KB
      return false;
    }
    
    return true;
  }

  /**
   * 压缩图片
   */
  private async compressImage(data: ArrayBuffer, mimeType: string): Promise<{ success: boolean; data?: ArrayBuffer }> {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // 保持原始尺寸
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // 绘制图片
          ctx.drawImage(img, 0, 0);
          
          // 转换为压缩格式
          canvas.toBlob((compressedBlob) => {
            if (compressedBlob) {
              const reader = new FileReader();
              reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                  resolve({ success: true, data: reader.result });
                } else {
                  resolve({ success: false });
                }
              };
              reader.readAsArrayBuffer(compressedBlob);
            } else {
              resolve({ success: false });
            }
          }, mimeType, this.config.compressionQuality);
          
          URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
          resolve({ success: false });
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      });
    } catch {
      return { success: false };
    }
  }

  /**
   * 存储文件
   */
  private async storeFile(data: ArrayBuffer, assetId: string, mimeType: string): Promise<string> {
    // 在实际应用中，这里应该将文件上传到服务器或云存储
    // 现在我们使用 Data URL 作为模拟
    const blob = new Blob([data], { type: mimeType });
    
    if (this.config.storageType === 'local') {
      // 本地存储：转换为 Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('转换文件失败'));
          }
        };
        reader.onerror = () => reject(new Error('转换文件失败'));
        reader.readAsDataURL(blob);
      });
    } else {
      // 网络存储：返回URL
      return `${this.config.baseUrl}/${assetId}`;
    }
  }

  /**
   * 生成预览图
   */
  private async generatePreview(data: ArrayBuffer, assetId: string): Promise<string> {
    // 对于预览图，我们可以生成一个较小的版本
    // 这里简化处理，直接返回原图URL
    return this.storeFile(data, `${assetId}_preview`, 'image/jpeg');
  }

  /**
   * 删除文件
   */
  async deleteFile(assetId: string): Promise<boolean> {
    try {
      // 在实际应用中，这里应该从存储中删除文件
      // 现在只是模拟删除
      
      this.emitter.emit('fileDeleted', assetId);
      return true;
    } catch (error) {
      this.emitter.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 清空存储
   */
  async clearStorage(): Promise<void> {
    try {
      // 在实际应用中，这里应该清空所有存储的文件
      
      this.storageStats = {
        totalFiles: 0,
        totalSize: 0,
        usedSpace: 0,
        availableSpace: 0,
        compressionRatio: 1
      };
      
      this.saveStorageStats();
      this.emitter.emit('storageCleared');
    } catch (error) {
      this.emitter.emit('error', error as Error);
    }
  }

  /**
   * 生成上传ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成素材ID
   */
  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 发送进度事件
   */
  private emitProgress(_uploadId: string, progress: IUploadProgress): void {
    this.emitter.emit('uploadProgress', progress);
  }

  /**
   * 更新存储统计
   */
  private updateStorageStats(fileSize: number, compressionRatio: number): void {
    this.storageStats.totalFiles++;
    this.storageStats.totalSize += fileSize;
    this.storageStats.usedSpace += fileSize;
    this.storageStats.compressionRatio = 
      (this.storageStats.compressionRatio * (this.storageStats.totalFiles - 1) + compressionRatio) / 
      this.storageStats.totalFiles;
    
    this.saveStorageStats();
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 保存存储统计
   */
  private saveStorageStats(): void {
    try {
      localStorage.setItem('asset-storage-stats', JSON.stringify(this.storageStats));
    } catch (error) {
      console.error('保存存储统计失败:', error);
    }
  }

  /**
   * 加载存储统计
   */
  private loadStorageStats(): void {
    try {
      const statsStr = localStorage.getItem('asset-storage-stats');
      if (statsStr) {
        this.storageStats = { ...this.storageStats, ...JSON.parse(statsStr) };
      }
    } catch (error) {
      console.error('加载存储统计失败:', error);
    }
  }

  /**
   * 获取存储统计
   */
  getStorageStats(): IStorageStats {
    return { ...this.storageStats };
  }

  /**
   * 获取配置
   */
  getConfig(): IStorageConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<IStorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 事件管理
   */
  on<T extends keyof IAssetStorageEvents>(eventName: T, listener: IAssetStorageEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IAssetStorageEvents>(eventName: T, listener: IAssetStorageEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.uploadQueue.clear();
    this.emitter.removeAllListeners();
  }
}