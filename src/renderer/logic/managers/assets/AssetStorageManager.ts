import { UploadAssetData } from "@/renderer/ui/business/AssetLibrary/AssetUploadPanel";

/**
 * 素材存储管理器
 * @description 管理素材的存储和检索
 */
export interface AssetMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  thumbnail?: string | undefined;
}

export interface StorageOptions {
  maxFileSize: number;
  allowedTypes: string[];
  compressionQuality: number;
}

export class AssetStorageManager {
  private eventListeners: Map<string, Set<(result: UploadAssetData) => Promise<void>>> = new Map();
  private assets: Map<string, AssetMetadata> = new Map();
  private storageOptions: StorageOptions;
  
  constructor(options?: Partial<StorageOptions>) {
    this.storageOptions = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
      compressionQuality: 0.8,
      ...options
    };
  }

  /**
   * 注册事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: (result: UploadAssetData) => Promise<void>): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(callback);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback: (result: UploadAssetData) => Promise<void>): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventName);
      }
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  private emit(eventName: string, data: UploadAssetData): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`AssetStorageManager 事件处理错误 [${eventName}]:`, error);
        }
      });
    }
  }
  
  /**
   * 存储素材
   */
  async storeAsset(file: File, metadata: Partial<AssetMetadata>): Promise<string> {
    // 验证文件
    this.validateFile(file);
    
    const id = this.generateAssetId();
    const assetMetadata: AssetMetadata = {
      id,
      name: metadata.name || file.name,
      type: file.type,
      size: file.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: metadata.tags || [],
      category: metadata.category || 'uncategorized',
      thumbnail: metadata.thumbnail || undefined
    };
    
    // 存储到内存（实际项目中应该存储到数据库或文件系统）
    this.assets.set(id, assetMetadata);
    
    // 触发上传完成事件
    this.emit('uploadCompleted', {
      success: true,
      metadata: assetMetadata,
      originalUrl: file.name, // 使用文件名作为原始URL
      previewUrl: metadata.thumbnail,
      file: file,
      name: file.name,
      category: metadata.category || 'uncategorized',
      tags: metadata.tags || [],
      license: 'custom' as const
    });
    
    return id;
  }
  
  /**
   * 获取素材元数据
   */
  getAssetMetadata(id: string): AssetMetadata | null {
    return this.assets.get(id) || null;
  }
  
  /**
   * 获取所有素材
   */
  getAllAssets(): AssetMetadata[] {
    return Array.from(this.assets.values());
  }
  
  /**
   * 删除素材
   */
  deleteAsset(id: string): boolean {
    return this.assets.delete(id);
  }
  
  /**
   * 更新素材元数据
   */
  updateAssetMetadata(id: string, updates: Partial<AssetMetadata>): boolean {
    const asset = this.assets.get(id);
    if (!asset) return false;
    
    const updatedAsset = {
      ...asset,
      ...updates,
      updatedAt: new Date()
    };
    
    this.assets.set(id, updatedAsset);
    return true;
  }
  
  /**
   * 按类别获取素材
   */
  getAssetsByCategory(category: string): AssetMetadata[] {
    return Array.from(this.assets.values()).filter(
      asset => asset.category === category
    );
  }
  
  /**
   * 按标签搜索素材
   */
  searchAssetsByTags(tags: string[]): AssetMetadata[] {
    return Array.from(this.assets.values()).filter(asset =>
      tags.some(tag => asset.tags.includes(tag))
    );
  }
  
  /**
   * 验证文件
   */
  private validateFile(file: File): void {
    if (file.size > this.storageOptions.maxFileSize) {
      throw new Error(`文件大小超过限制: ${this.storageOptions.maxFileSize} bytes`);
    }
    
    if (!this.storageOptions.allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}`);
    }
  }
  
  /**
   * 生成素材ID
   */
  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}