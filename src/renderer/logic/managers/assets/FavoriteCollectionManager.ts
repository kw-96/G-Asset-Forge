/**
 * 收藏集合管理器
 * @description 管理用户的素材收藏集合
 */
export interface IFavoriteCollection {
  id: string;
  name: string;
  description?: string | undefined;
  assetIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface IFavoriteItem {
  assetId: string;
  collectionId: string;
  addedAt: Date;
  notes?: string | undefined;
}

export class FavoriteCollectionManager {
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private collections: Map<string, IFavoriteCollection> = new Map();
  private favorites: Map<string, IFavoriteItem[]> = new Map(); // assetId -> collections
  
  constructor() {
    // 创建默认收藏集合
    this.createDefaultCollection();
  }

  /**
   * 注册事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: () => void): void {
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
  off(eventName: string, callback: () => void): void {
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
   */
  private emit(eventName: string): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`FavoriteCollectionManager 事件处理错误 [${eventName}]:`, error);
        }
      });
    }
  }
  
  /**
   * 创建收藏集合
   */
  createCollection(name: string, description?: string): string {
    const id = this.generateCollectionId();
    const collection: IFavoriteCollection = {
      id,
      name,
      description,
      assetIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };
    
    this.collections.set(id, collection);
    
    // 触发集合创建事件
    this.emit('collectionCreated');
    
    return id;
  }
  
  /**
   * 获取收藏集合
   */
  getCollection(id: string): IFavoriteCollection | null {
    return this.collections.get(id) || null;
  }
  
  /**
   * 获取所有收藏集合
   */
  getAllCollections(): IFavoriteCollection[] {
    return Array.from(this.collections.values());
  }
  
  /**
   * 更新收藏集合
   */
  updateCollection(id: string, updates: Partial<IFavoriteCollection>): boolean {
    const collection = this.collections.get(id);
    if (!collection) return false;
    
    const updatedCollection = {
      ...collection,
      ...updates,
      updatedAt: new Date()
    };
    
    this.collections.set(id, updatedCollection);
    return true;
  }
  
  /**
   * 删除收藏集合
   */
  deleteCollection(id: string): boolean {
    const collection = this.collections.get(id);
    if (!collection || collection.isDefault) return false;
    
    // 移除所有相关的收藏项
    collection.assetIds.forEach(assetId => {
      this.removeFromFavorites(assetId, id);
    });
    
    // 删除集合
    this.collections.delete(id);
    
    // 触发集合删除事件
    this.emit('collectionDeleted');
    
    return true;
  }
  
  /**
   * 添加素材到收藏集合
   * @param collectionId 集合ID
   * @param assetIds 素材ID数组
   */
  addAssetsToCollection(collectionId: string, assetIds: string[]): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;
    
    let hasChanges = false;
    assetIds.forEach(assetId => {
      if (!collection.assetIds.includes(assetId)) {
        collection.assetIds.push(assetId);
        hasChanges = true;
        
        // 添加到收藏项映射
        if (!this.favorites.has(assetId)) {
          this.favorites.set(assetId, []);
        }
        this.favorites.get(assetId)!.push({
          assetId,
          collectionId,
          addedAt: new Date()
        });
      }
    });
    
    if (hasChanges) {
      collection.updatedAt = new Date();
      // 触发集合更新事件
      this.emit('collectionUpdated');
    }
    
    return hasChanges;
  }

  /**
   * 从收藏集合中移除单个素材
   * @param assetId 素材ID
   * @param collectionId 集合ID
   */
  removeAssetFromCollection(assetId: string, collectionId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;
    
    // 从集合中移除
    const index = collection.assetIds.indexOf(assetId);
    if (index === -1) return false;
    
    collection.assetIds.splice(index, 1);
    collection.updatedAt = new Date();
    
    // 从收藏项映射中移除
    this.removeFromFavorites(assetId, collectionId);
    
    return true;
  }

  /**
   * 从收藏集合中移除素材
   * @param collectionId 集合ID
   * @param assetIds 素材ID数组
   */
  removeAssetsFromCollection(collectionId: string, assetIds: string[]): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;
    
    let hasChanges = false;
    assetIds.forEach(assetId => {
      if (this.removeAssetFromCollection(assetId, collectionId)) {
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      // 触发集合更新事件
      this.emit('collectionUpdated');
    }
    
    return hasChanges;
  }
  
  /**
   * 检查素材是否在收藏集合中
   */
  isInCollection(assetId: string, collectionId: string): boolean {
    const collection = this.collections.get(collectionId);
    return collection ? collection.assetIds.includes(assetId) : false;
  }
  
  /**
   * 获取素材所在的所有收藏集合
   */
  getCollectionsForAsset(assetId: string): IFavoriteCollection[] {
    const favoriteItems = this.favorites.get(assetId) || [];
    return favoriteItems
      .map(item => this.collections.get(item.collectionId))
      .filter(collection => collection !== undefined) as IFavoriteCollection[];
  }
  
  /**
   * 获取收藏集合中的所有素材ID
   */
  getAssetsInCollection(collectionId: string): string[] {
    const collection = this.collections.get(collectionId);
    return collection ? [...collection.assetIds] : [];
  }
  
  /**
   * 搜索收藏集合
   */
  searchCollections(query: string): IFavoriteCollection[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.collections.values()).filter(collection =>
      collection.name.toLowerCase().includes(lowerQuery) ||
      (collection.description && collection.description.toLowerCase().includes(lowerQuery))
    );
  }
  
  /**
   * 获取默认收藏集合
   */
  getDefaultCollection(): IFavoriteCollection | null {
    return Array.from(this.collections.values()).find(c => c.isDefault) || null;
  }
  
  /**
   * 创建默认收藏集合
   */
  private createDefaultCollection(): void {
    const defaultCollection: IFavoriteCollection = {
      id: 'default',
      name: '我的收藏',
      description: '默认收藏集合',
      assetIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    };
    
    this.collections.set('default', defaultCollection);
  }
  
  /**
   * 从收藏项映射中移除
   */
  private removeFromFavorites(assetId: string, collectionId: string): boolean {
    const favoriteItems = this.favorites.get(assetId);
    if (!favoriteItems) return false;
    
    const index = favoriteItems.findIndex(item => item.collectionId === collectionId);
    if (index !== -1) {
      favoriteItems.splice(index, 1);
      
      // 如果没有收藏项了，移除整个映射
      if (favoriteItems.length === 0) {
        this.favorites.delete(assetId);
      }
      return true;
    }
    return false;
  }
  
  /**
   * 生成收藏集合ID
   */
  private generateCollectionId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}