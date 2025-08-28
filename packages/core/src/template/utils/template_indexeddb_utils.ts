/**
 * 模板专用 IndexedDB 工具类
 * 扩展基础 IndexedDB 功能，专门用于模板数据存储
 */
export class TemplateIndexedDBUtils {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'GAssetForgeTemplates', version: number = 1) {
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
        reject(new Error(`无法打开模板数据库: ${request.error?.message}`));
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
    // 模板存储
    if (!db.objectStoreNames.contains('templates')) {
      const templateStore = db.createObjectStore('templates', {
        keyPath: 'id',
      });
      templateStore.createIndex('type', 'type', { unique: false });
      templateStore.createIndex('categoryId', 'categoryId', { unique: false });
      templateStore.createIndex('createdAt', 'createdAt', { unique: false });
      templateStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      templateStore.createIndex('usageCount', 'usageCount', { unique: false });
      templateStore.createIndex('name', 'name', { unique: false });
      templateStore.createIndex('version', 'version', { unique: false });
    }

    // 模板分类存储
    if (!db.objectStoreNames.contains('template_categories')) {
      const categoryStore = db.createObjectStore('template_categories', {
        keyPath: 'id',
      });
      categoryStore.createIndex('parentId', 'parentId', { unique: false });
      categoryStore.createIndex('templateType', 'templateType', {
        unique: false,
      });
      categoryStore.createIndex('order', 'order', { unique: false });
    }

    // 模板预览图片存储（单独存储大文件）
    if (!db.objectStoreNames.contains('template_previews')) {
      db.createObjectStore('template_previews', { keyPath: 'id' });
    }

    // 模板使用历史记录
    if (!db.objectStoreNames.contains('template_usage_history')) {
      const historyStore = db.createObjectStore('template_usage_history', {
        keyPath: 'id',
        autoIncrement: true,
      });
      historyStore.createIndex('templateId', 'templateId', { unique: false });
      historyStore.createIndex('usedAt', 'usedAt', { unique: false });
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
      throw new Error('模板数据库未打开');
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
        reject(new Error(`添加模板数据失败: ${request.error?.message}`));
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
        reject(new Error(`更新模板数据失败: ${request.error?.message}`));
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
        reject(new Error(`获取模板数据失败: ${request.error?.message}`));
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
        reject(new Error(`删除模板数据失败: ${request.error?.message}`));
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
        reject(new Error(`获取所有模板数据失败: ${request.error?.message}`));
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
        reject(new Error(`模板索引查询失败: ${request.error?.message}`));
    });
  }

  /**
   * 通过索引范围查询数据
   */
  async getByIndexRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const index = store.index(indexName);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error(`模板范围查询失败: ${request.error?.message}`));
    });
  }

  /**
   * 计数查询
   */
  async count(storeName: string, key?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const request = key ? store.count(key) : store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error(`模板计数查询失败: ${request.error?.message}`));
    });
  }

  /**
   * 游标遍历
   */
  async iterateWithCursor<T>(
    storeName: string,
    callback: (value: T, key: string) => boolean | void,
    indexName?: string,
    range?: IDBKeyRange,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const source = indexName ? store.index(indexName) : store;
      const request = source.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const shouldContinue = callback(cursor.value, cursor.key as string);
          if (shouldContinue !== false) {
            cursor.continue();
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };

      request.onerror = () =>
        reject(new Error(`模板游标遍历失败: ${request.error?.message}`));
    });
  }

  /**
   * 批量操作
   */
  async batchOperation<T>(
    operations: Array<{
      type: 'add' | 'put' | 'delete';
      storeName: string;
      data?: T;
      key?: string;
    }>,
  ): Promise<void> {
    const storeNames = [...new Set(operations.map((op) => op.storeName))];
    const transaction = this.getTransaction(storeNames, 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`模板批量操作失败: ${transaction.error?.message}`));

      for (const operation of operations) {
        const store = transaction.objectStore(operation.storeName);

        switch (operation.type) {
          case 'add':
            if (operation.data) {
              store.add(operation.data);
            }
            break;
          case 'put':
            if (operation.data) {
              store.put(operation.data);
            }
            break;
          case 'delete':
            if (operation.key) {
              store.delete(operation.key);
            }
            break;
        }
      }
    });
  }

  /**
   * 清空存储
   */
  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`清空模板存储失败: ${request.error?.message}`));
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

  /**
   * 删除数据库
   */
  static async deleteDatabase(
    dbName: string = 'GAssetForgeTemplates',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`删除模板数据库失败: ${request.error?.message}`));
      request.onblocked = () =>
        reject(new Error('删除模板数据库被阻塞，请关闭其他标签页'));
    });
  }
}
