// 收藏夹管理器
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';

export interface IFavoriteCollection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean; // 默认收藏夹
}

export interface IFavoriteCollectionManagerEvents extends Record<string, (...args: any[]) => void> {
  collectionCreated(collection: IFavoriteCollection): void;
  collectionUpdated(collection: IFavoriteCollection): void;
  collectionDeleted(collectionId: string): void;
  assetAddedToCollection(collectionId: string, assetId: string): void;
  assetRemovedFromCollection(collectionId: string, assetId: string): void;
}

/**
 * 收藏夹管理器
 * 负责管理用户的收藏夹和收藏素材
 */
export class FavoriteCollectionManager {
  private emitter = new EventEmitter<IFavoriteCollectionManagerEvents>();
  private collections: Map<string, IFavoriteCollection> = new Map();
  private storageKey = 'asset-favorite-collections';

  constructor() {
    this.loadFromStorage();
    this.ensureDefaultCollection();
  }

  /**
   * 确保存在默认收藏夹
   */
  private ensureDefaultCollection(): void {
    const hasDefault = Array.from(this.collections.values()).some(c => c.isDefault);
    
    if (!hasDefault) {
      const defaultCollection: IFavoriteCollection = {
        id: 'default',
        name: '我的收藏',
        description: '默认收藏夹',
        assetIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };
      
      this.collections.set(defaultCollection.id, defaultCollection);
      this.saveToStorage();
    }
  }

  /**
   * 从本地存储加载收藏夹
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.collections.clear();
        
        Object.entries(data).forEach(([id, collectionData]: [string, any]) => {
          this.collections.set(id, {
            ...collectionData,
            createdAt: new Date(collectionData.createdAt),
            updatedAt: new Date(collectionData.updatedAt)
          });
        });
      }
    } catch (error) {
      console.error('加载收藏夹失败:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data: Record<string, any> = {};
      this.collections.forEach((collection, id) => {
        data[id] = collection;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存收藏夹失败:', error);
    }
  }

  /**
   * 生成收藏夹ID
   */
  private generateCollectionId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建收藏夹
   */
  async createCollection(data: Omit<IFavoriteCollection, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFavoriteCollection> {
    const collection: IFavoriteCollection = {
      id: this.generateCollectionId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };

    this.collections.set(collection.id, collection);
    this.saveToStorage();
    
    this.emitter.emit('collectionCreated', collection);
    return collection;
  }

  /**
   * 更新收藏夹
   */
  async updateCollection(id: string, updates: Partial<IFavoriteCollection>): Promise<IFavoriteCollection | null> {
    const collection = this.collections.get(id);
    if (!collection) {
      return null;
    }

    const updatedCollection: IFavoriteCollection = {
      ...collection,
      ...updates,
      id, // 确保ID不被修改
      updatedAt: new Date()
    };

    this.collections.set(id, updatedCollection);
    this.saveToStorage();
    
    this.emitter.emit('collectionUpdated', updatedCollection);
    return updatedCollection;
  }

  /**
   * 删除收藏夹
   */
  async deleteCollection(id: string): Promise<boolean> {
    const collection = this.collections.get(id);
    if (!collection || collection.isDefault) {
      return false; // 不能删除默认收藏夹
    }

    this.collections.delete(id);
    this.saveToStorage();
    
    this.emitter.emit('collectionDeleted', id);
    return true;
  }

  /**
   * 获取收藏夹
   */
  getCollection(id: string): IFavoriteCollection | null {
    return this.collections.get(id) || null;
  }

  /**
   * 获取所有收藏夹
   */
  getAllCollections(): IFavoriteCollection[] {
    return Array.from(this.collections.values()).sort((a, b) => {
      // 默认收藏夹排在前面
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // 按创建时间排序
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * 获取默认收藏夹
   */
  getDefaultCollection(): IFavoriteCollection | null {
    return Array.from(this.collections.values()).find(c => c.isDefault) || null;
  }

  /**
   * 添加素材到收藏夹
   */
  async addAssetToCollection(collectionId: string, assetId: string): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return false;
    }

    if (!collection.assetIds.includes(assetId)) {
      collection.assetIds.push(assetId);
      collection.updatedAt = new Date();
      
      this.collections.set(collectionId, collection);
      this.saveToStorage();
      
      this.emitter.emit('assetAddedToCollection', collectionId, assetId);
      this.emitter.emit('collectionUpdated', collection);
    }

    return true;
  }

  /**
   * 批量添加素材到收藏夹
   */
  async addAssetsToCollection(collectionId: string, assetIds: string[]): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return false;
    }

    let hasChanges = false;
    assetIds.forEach(assetId => {
      if (!collection.assetIds.includes(assetId)) {
        collection.assetIds.push(assetId);
        hasChanges = true;
        this.emitter.emit('assetAddedToCollection', collectionId, assetId);
      }
    });

    if (hasChanges) {
      collection.updatedAt = new Date();
      this.collections.set(collectionId, collection);
      this.saveToStorage();
      this.emitter.emit('collectionUpdated', collection);
    }

    return true;
  }

  /**
   * 从收藏夹移除素材
   */
  async removeAssetFromCollection(collectionId: string, assetId: string): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return false;
    }

    const index = collection.assetIds.indexOf(assetId);
    if (index !== -1) {
      collection.assetIds.splice(index, 1);
      collection.updatedAt = new Date();
      
      this.collections.set(collectionId, collection);
      this.saveToStorage();
      
      this.emitter.emit('assetRemovedFromCollection', collectionId, assetId);
      this.emitter.emit('collectionUpdated', collection);
    }

    return true;
  }

  /**
   * 批量从收藏夹移除素材
   */
  async removeAssetsFromCollection(collectionId: string, assetIds: string[]): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return false;
    }

    let hasChanges = false;
    assetIds.forEach(assetId => {
      const index = collection.assetIds.indexOf(assetId);
      if (index !== -1) {
        collection.assetIds.splice(index, 1);
        hasChanges = true;
        this.emitter.emit('assetRemovedFromCollection', collectionId, assetId);
      }
    });

    if (hasChanges) {
      collection.updatedAt = new Date();
      this.collections.set(collectionId, collection);
      this.saveToStorage();
      this.emitter.emit('collectionUpdated', collection);
    }

    return true;
  }

  /**
   * 检查素材是否在收藏夹中
   */
  isAssetInCollection(collectionId: string, assetId: string): boolean {
    const collection = this.collections.get(collectionId);
    return collection ? collection.assetIds.includes(assetId) : false;
  }

  /**
   * 获取包含指定素材的收藏夹
   */
  getCollectionsContainingAsset(assetId: string): IFavoriteCollection[] {
    return Array.from(this.collections.values()).filter(collection =>
      collection.assetIds.includes(assetId)
    );
  }

  /**
   * 清理无效的素材ID
   */
  async cleanupInvalidAssets(validAssetIds: Set<string>): Promise<void> {
    let hasChanges = false;

    this.collections.forEach(collection => {
      const originalLength = collection.assetIds.length;
      collection.assetIds = collection.assetIds.filter(assetId => validAssetIds.has(assetId));
      
      if (collection.assetIds.length !== originalLength) {
        collection.updatedAt = new Date();
        hasChanges = true;
        this.emitter.emit('collectionUpdated', collection);
      }
    });

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  /**
   * 获取收藏夹统计信息
   */
  getCollectionStats(collectionId: string): {
    totalAssets: number;
    lastUpdated: Date;
  } | null {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return null;
    }

    return {
      totalAssets: collection.assetIds.length,
      lastUpdated: collection.updatedAt
    };
  }

  /**
   * 导出收藏夹数据
   */
  exportCollections(): string {
    const data = {
      collections: Array.from(this.collections.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入收藏夹数据
   */
  async importCollections(jsonData: string, mergeMode: 'replace' | 'merge' = 'merge'): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.collections || !Array.isArray(data.collections)) {
        throw new Error('无效的收藏夹数据格式');
      }

      if (mergeMode === 'replace') {
        this.collections.clear();
      }

      data.collections.forEach((collectionData: any) => {
        const collection: IFavoriteCollection = {
          ...collectionData,
          createdAt: new Date(collectionData.createdAt),
          updatedAt: new Date(collectionData.updatedAt)
        };
        
        // 如果是合并模式且ID已存在，生成新ID
        if (mergeMode === 'merge' && this.collections.has(collection.id)) {
          collection.id = this.generateCollectionId();
        }
        
        this.collections.set(collection.id, collection);
        this.emitter.emit('collectionCreated', collection);
      });

      this.ensureDefaultCollection();
      this.saveToStorage();
      return true;
      
    } catch (error) {
      console.error('导入收藏夹失败:', error);
      return false;
    }
  }

  /**
   * 事件管理
   */
  on<T extends keyof IFavoriteCollectionManagerEvents>(eventName: T, listener: IFavoriteCollectionManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IFavoriteCollectionManagerEvents>(eventName: T, listener: IFavoriteCollectionManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.emitter.removeAllListeners();
  }
}