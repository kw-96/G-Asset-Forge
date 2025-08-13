/**
 * 文件操作性能优化器
 * 优化文件保存、加载和网络驱动器访问性能
 */

export interface FileOperationMetrics {
  operationType: 'save' | 'load' | 'upload' | 'download' | 'delete';
  filePath: string;
  fileSize: number; // bytes
  duration: number; // ms
  success: boolean;
  errorMessage?: string;
  timestamp: number;
  retryCount: number;
}

export interface FileOperationConfig {
  maxRetries: number;
  retryDelay: number; // ms
  timeout: number; // ms
  chunkSize: number; // bytes for large files
  compressionEnabled: boolean;
  cacheEnabled: boolean;
  progressCallback?: (progress: number) => void;
}

const DEFAULT_CONFIG: FileOperationConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  chunkSize: 1024 * 1024, // 1MB
  compressionEnabled: true,
  cacheEnabled: true
};

export class FileOperationOptimizer {
  private static instance: FileOperationOptimizer;
  private config: FileOperationConfig;
  private operationHistory: FileOperationMetrics[] = [];
  private activeOperations: Map<string, AbortController> = new Map();
  private cache: Map<string, { data: any; timestamp: number; size: number }> = new Map();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;

  private constructor(config: Partial<FileOperationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<FileOperationConfig>): FileOperationOptimizer {
    if (!FileOperationOptimizer.instance) {
      FileOperationOptimizer.instance = new FileOperationOptimizer(config);
    }
    return FileOperationOptimizer.instance;
  }

  /**
   * 优化的文件保存操作
   */
  async saveFile(
    filePath: string,
    data: any,
    options: Partial<FileOperationConfig> = {}
  ): Promise<FileOperationMetrics> {
    const operationId = `save-${filePath}-${Date.now()}`;
    const config = { ...this.config, ...options };
    const startTime = performance.now();
    
    let retryCount = 0;
    let lastError: Error | null = null;

    // 创建中止控制器
    const abortController = new AbortController();
    this.activeOperations.set(operationId, abortController);

    try {
      while (retryCount <= config.maxRetries) {
        try {
          // 检查是否被中止
          if (abortController.signal.aborted) {
            throw new Error('操作被用户取消');
          }

          // 预处理数据
          const processedData = await this.preprocessData(data, config);
          
          // 执行保存操作
          await this.performSaveOperation(filePath, processedData, config, abortController.signal);
          
          // 成功完成
          const duration = performance.now() - startTime;
          const metrics: FileOperationMetrics = {
            operationType: 'save',
            filePath,
            fileSize: this.getDataSize(data),
            duration,
            success: true,
            timestamp: Date.now(),
            retryCount
          };

          this.recordOperation(metrics);
          console.log(`文件保存成功: ${filePath} (${duration.toFixed(2)}ms)`);
          
          return metrics;

        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          if (retryCount <= config.maxRetries) {
            console.warn(`文件保存失败，正在重试 (${retryCount}/${config.maxRetries}): ${lastError.message}`);
            await this.delay(config.retryDelay * retryCount); // 指数退避
          }
        }
      }

      // 所有重试都失败了
      const duration = performance.now() - startTime;
      const metrics: FileOperationMetrics = {
        operationType: 'save',
        filePath,
        fileSize: this.getDataSize(data),
        duration,
        success: false,
        errorMessage: lastError?.message || '未知错误',
        timestamp: Date.now(),
        retryCount
      };

      this.recordOperation(metrics);
      throw lastError;

    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * 优化的文件加载操作
   */
  async loadFile(
    filePath: string,
    options: Partial<FileOperationConfig> = {}
  ): Promise<{ data: any; metrics: FileOperationMetrics }> {
    const operationId = `load-${filePath}-${Date.now()}`;
    const config = { ...this.config, ...options };
    const startTime = performance.now();

    // 检查缓存
    if (config.cacheEnabled) {
      const cached = this.getFromCache(filePath);
      if (cached) {
        const metrics: FileOperationMetrics = {
          operationType: 'load',
          filePath,
          fileSize: cached.size,
          duration: performance.now() - startTime,
          success: true,
          timestamp: Date.now(),
          retryCount: 0
        };
        
        console.log(`从缓存加载文件: ${filePath}`);
        return { data: cached.data, metrics };
      }
    }

    let retryCount = 0;
    let lastError: Error | null = null;

    // 创建中止控制器
    const abortController = new AbortController();
    this.activeOperations.set(operationId, abortController);

    try {
      while (retryCount <= config.maxRetries) {
        try {
          // 检查是否被中止
          if (abortController.signal.aborted) {
            throw new Error('操作被用户取消');
          }

          // 执行加载操作
          const data = await this.performLoadOperation(filePath, config, abortController.signal);
          
          // 缓存数据
          if (config.cacheEnabled) {
            this.addToCache(filePath, data);
          }

          // 成功完成
          const duration = performance.now() - startTime;
          const metrics: FileOperationMetrics = {
            operationType: 'load',
            filePath,
            fileSize: this.getDataSize(data),
            duration,
            success: true,
            timestamp: Date.now(),
            retryCount
          };

          this.recordOperation(metrics);
          console.log(`文件加载成功: ${filePath} (${duration.toFixed(2)}ms)`);
          
          return { data, metrics };

        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          if (retryCount <= config.maxRetries) {
            console.warn(`文件加载失败，正在重试 (${retryCount}/${config.maxRetries}): ${lastError.message}`);
            await this.delay(config.retryDelay * retryCount);
          }
        }
      }

      // 所有重试都失败了
      const duration = performance.now() - startTime;
      const metrics: FileOperationMetrics = {
        operationType: 'load',
        filePath,
        fileSize: 0,
        duration,
        success: false,
        errorMessage: lastError?.message || '未知错误',
        timestamp: Date.now(),
        retryCount
      };

      this.recordOperation(metrics);
      throw lastError;

    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * 取消正在进行的操作
   */
  cancelOperation(operationId: string): void {
    const controller = this.activeOperations.get(operationId);
    if (controller) {
      controller.abort();
      this.activeOperations.delete(operationId);
      console.log(`已取消操作: ${operationId}`);
    }
  }

  /**
   * 取消所有正在进行的操作
   */
  cancelAllOperations(): void {
    this.activeOperations.forEach((controller, operationId) => {
      controller.abort();
      console.log(`已取消操作: ${operationId}`);
    });
    this.activeOperations.clear();
  }

  /**
   * 获取操作历史
   */
  getOperationHistory(): FileOperationMetrics[] {
    return [...this.operationHistory];
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    averageSaveTime: number;
    averageLoadTime: number;
    successRate: number;
    totalOperations: number;
    cacheHitRate: number;
  } {
    const history = this.operationHistory;
    const saveOps = history.filter(op => op.operationType === 'save');
    const loadOps = history.filter(op => op.operationType === 'load');
    const successfulOps = history.filter(op => op.success);

    const averageSaveTime = saveOps.length > 0 
      ? saveOps.reduce((sum, op) => sum + op.duration, 0) / saveOps.length 
      : 0;

    const averageLoadTime = loadOps.length > 0 
      ? loadOps.reduce((sum, op) => sum + op.duration, 0) / loadOps.length 
      : 0;

    const successRate = history.length > 0 
      ? (successfulOps.length / history.length) * 100 
      : 0;

    // 简化的缓存命中率计算
    const cacheHitRate = 0; // 需要更复杂的跟踪逻辑

    return {
      averageSaveTime,
      averageLoadTime,
      successRate,
      totalOperations: history.length,
      cacheHitRate
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    console.log('文件缓存已清理');
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): {
    size: number;
    maxSize: number;
    itemCount: number;
    utilizationRate: number;
  } {
    return {
      size: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      itemCount: this.cache.size,
      utilizationRate: (this.currentCacheSize / this.maxCacheSize) * 100
    };
  }

  /**
   * 预处理数据（压缩等）
   */
  private async preprocessData(data: any, config: FileOperationConfig): Promise<any> {
    if (config.compressionEnabled && this.shouldCompress(data)) {
      // 这里可以添加压缩逻辑
      console.log('数据压缩已启用');
    }
    return data;
  }

  /**
   * 执行实际的保存操作
   */
  private async performSaveOperation(
    filePath: string,
    data: any,
    config: FileOperationConfig,
    signal: AbortSignal
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`保存操作超时: ${filePath}`));
      }, config.timeout);

      try {
        if (signal.aborted) {
          reject(new Error('操作被取消'));
          return;
        }

        // 检查是否为网络驱动器
        const isNetworkPath = Boolean(filePath) && this.isNetworkPath(filePath);
        
        if (isNetworkPath) {
          // 检查网络驱动器可用性
          const available = await this.checkNetworkAvailability(filePath);
          if (!available) {
            throw new Error('网络驱动器不可用，请检查网络连接');
          }
        }

        // 确保目录存在
        const fs = await import('fs-extra');
       await fs.ensureDir((await import('path-browserify')).default.dirname(filePath));

        // 执行文件写入
        if (typeof data === 'string') {
          await fs.writeFile(filePath, data, 'utf8');
        } else {
          await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        }

        clearTimeout(timeout);
        resolve();
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 执行实际的加载操作
   */
  private async performLoadOperation(
    filePath: string,
    config: FileOperationConfig,
    signal: AbortSignal
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`加载操作超时: ${filePath}`));
      }, config.timeout);

      try {
        if (signal.aborted) {
          reject(new Error('操作被取消'));
          return;
        }

        // 检查是否为网络驱动器
        const isNetworkPath = Boolean(filePath) && this.isNetworkPath(filePath);
        
        if (isNetworkPath) {
          // 检查网络驱动器可用性
          const available = await this.checkNetworkAvailability(filePath);
          if (!available) {
            throw new Error('网络驱动器不可用，请检查网络连接');
          }
        }

        // 执行文件读取
        const fs = await import('fs-extra');
        
        // 检查文件是否存在
        if (!await fs.pathExists(filePath)) {
          throw new Error(`文件不存在: ${filePath}`);
        }

        const fileContent = await fs.readFile(filePath, 'utf8');

        clearTimeout(timeout);
        resolve(fileContent);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(filePath: string): { data: any; size: number } | null {
    const cached = this.cache.get(filePath);
    if (cached) {
      // 检查缓存是否过期（1小时）
      if (Date.now() - cached.timestamp < 3600000) {
        return { data: cached.data, size: cached.size };
      } else {
        // 移除过期缓存
        this.cache.delete(filePath);
        this.currentCacheSize -= cached.size;
      }
    }
    return null;
  }

  /**
   * 添加到缓存
   */
  private addToCache(filePath: string, data: any): void {
    const size = this.getDataSize(data);
    
    // 检查缓存空间
    while (this.currentCacheSize + size > this.maxCacheSize && this.cache.size > 0) {
      // 移除最旧的缓存项，显式处理迭代返回类型以满足严格类型检查
      const oldestEntry = this.cache.keys().next();
      if (!oldestEntry.done) {
        const oldestKey = oldestEntry.value as string;
        const oldestItem = this.cache.get(oldestKey);
        if (oldestItem) {
          this.cache.delete(oldestKey);
          this.currentCacheSize -= oldestItem.size;
        }
      } else {
        break;
      }
    }

    // 添加新缓存项
    if (size <= this.maxCacheSize) {
      this.cache.set(filePath, {
        data,
        timestamp: Date.now(),
        size
      });
      this.currentCacheSize += size;
    }
  }

  /**
   * 记录操作历史
   */
  private recordOperation(metrics: FileOperationMetrics): void {
    this.operationHistory.push(metrics);
    
    // 限制历史记录大小
    if (this.operationHistory.length > 1000) {
      this.operationHistory.shift();
    }
  }

  /**
   * 获取数据大小
   */
  private getDataSize(data: any): number {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    } else {
      return new Blob([JSON.stringify(data)]).size;
    }
  }

  /**
   * 判断是否应该压缩数据
   */
  private shouldCompress(data: any): boolean {
    const size = this.getDataSize(data);
    return size > 1024 * 10; // 大于10KB的数据进行压缩
  }

  /**
   * 检查是否为网络路径
   */
  private isNetworkPath(filePath: string): boolean {
    // Windows UNC路径 (\\server\share)
    if (filePath.startsWith('\\\\')) {
      return true;
    }
    
    // 映射的网络驱动器 (通常是 Z:, Y: 等)
    const driveLetter = filePath.charAt(0).toLowerCase();
    const networkDrives = ['z', 'y', 'x', 'w', 'v', 'u', 't', 's'];
    if (filePath.charAt(1) === ':' && networkDrives.includes(driveLetter)) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查网络可用性
   */
  private async checkNetworkAvailability(filePath: string): Promise<boolean> {
    try {
      const fs = await import('fs-extra');
      const path = await import('path');
      
      // 尝试访问父目录
      const parentDir = path.dirname(filePath);
      await fs.access(parentDir);
      
      return true;
    } catch (error) {
      console.warn(`网络驱动器不可用: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建全局实例
export const fileOperationOptimizer = FileOperationOptimizer.getInstance();