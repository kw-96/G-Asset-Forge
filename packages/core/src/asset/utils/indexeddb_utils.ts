/**
 * IndexedDB 工具类 - 提供数据库操作的基础功能
 */
export class IndexedDBUtils {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  /**
   * 打开数据库连接
   */
  async openDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`无法打开数据库: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * 创建对象存储
   */
  private createObjectStores(db: IDBDatabase): void {
    // 素材存储
    if (!db.objectStoreNames.contains('assets')) {
      const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
      assetStore.createIndex('type', 'type', { unique: false });
      assetStore.createIndex('categoryId', 'categoryId', { unique: false });
      assetStore.createIndex('createdAt', 'createdAt', { unique: false });
      assetStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      assetStore.createIndex('usageCount', 'usageCount', { unique: false });
    }

    // 分类存储
    if (!db.objectStoreNames.contains('categories')) {
      const categoryStore = db.createObjectStore('categories', {
        keyPath: 'id',
      });
      categoryStore.createIndex('parentId', 'parentId', { unique: false });
      categoryStore.createIndex('order', 'order', { unique: false });
    }

    // 标签存储
    if (!db.objectStoreNames.contains('tags')) {
      const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
      tagStore.createIndex('name', 'name', { unique: true });
      tagStore.createIndex('usageCount', 'usageCount', { unique: false });
    }

    // 文件数据存储（单独存储大文件）
    if (!db.objectStoreNames.contains('files')) {
      db.createObjectStore('files', { keyPath: 'id' });
    }
  }

  /**
   * 获取事务
   */
  getTransaction(
    storeNames: string[],
    mode: IDBTransactionMode = 'readonly',
  ): IDBTransaction {
    if (!this.db) {
      throw new Error('数据库未打开');
    }
    return this.db.transaction(storeNames, mode);
  }

  /**
   * 获取对象存储
   */
  getObjectStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly',
  ): IDBObjectStore {
    const transaction = this.getTransaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 添加数据
   */
  async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`添加数据失败: ${request.error?.message}`));
    });
  }

  /**
   * 更新数据
   */
  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`更新数据失败: ${request.error?.message}`));
    });
  }

  /**
   * 获取单条数据
   */
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error(`获取数据失败: ${request.error?.message}`));
    });
  }

  /**
   * 删除数据
   */
  async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`删除数据失败: ${request.error?.message}`));
    });
  }

  /**
   * 获取所有数据
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error(`获取所有数据失败: ${request.error?.message}`));
    });
  }

  /**
   * 通过索引查询数据
   */
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error(`索引查询失败: ${request.error?.message}`));
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
