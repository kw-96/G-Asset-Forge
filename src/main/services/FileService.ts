/**
 * 文件服务 - 统一的文件操作管理
 * @description 提供安全的文件读写、监控、缓存等功能
 * @author 开发团队
 */
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { app, dialog } from 'electron';
import { logger } from './LoggingService';

/**
 * 文件操作结果接口
 */
export interface FileOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  path?: string;
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  mtime: Date;
  isDirectory: boolean;
  isFile: boolean;
  hash?: string;
}

/**
 * 文件监控配置接口
 */
export interface FileWatchConfig {
  recursive: boolean;
  ignored: string[];
  debounceMs: number;
}

/**
 * 文件服务配置接口
 */
export interface FileServiceConfig {
  enableCache: boolean;
  cacheMaxSize: number;
  cacheTTL: number;
  enableWatcher: boolean;
  watchConfig: FileWatchConfig;
  allowedExtensions: string[];
  maxFileSize: number;
  tempDirectory: string;
  backupDirectory: string;
}

/**
 * 默认文件服务配置
 */
const DEFAULT_FILE_CONFIG: FileServiceConfig = {
  enableCache: true,
  cacheMaxSize: 100 * 1024 * 1024, // 100MB
  cacheTTL: 5 * 60 * 1000, // 5分钟
  enableWatcher: true,
  watchConfig: {
    recursive: true,
    ignored: ['node_modules', '.git', 'dist', 'logs'],
    debounceMs: 300,
  },
  allowedExtensions: ['.json', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  tempDirectory: path.join(app.getPath('temp'), 'g-asset-forge'),
  backupDirectory: path.join(app.getPath('userData'), 'backups'),
};

/**
 * 文件缓存条目接口
 */
interface FileCacheEntry {
  data: any;
  hash: string;
  timestamp: number;
  size: number;
}

/**
 * 文件服务类
 * @description 提供完整的文件操作管理功能
 */
export class FileService {
  private config: FileServiceConfig;
  private isInitialized = false;
  private fileCache: Map<string, FileCacheEntry> = new Map();
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private cacheSize = 0;

  constructor(config: Partial<FileServiceConfig> = {}) {
    this.config = { ...DEFAULT_FILE_CONFIG, ...config };
  }

  /**
   * 初始化文件服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[file-service] 文件服务已经初始化');
      return;
    }

    try {
      logger.info('[file-service] 开始初始化文件服务');

      // 创建必要的目录
      await this.ensureDirectories();

      // 启动缓存清理
      if (this.config.enableCache) {
        this.startCacheCleanup();
      }

      this.isInitialized = true;
      logger.info('[file-service] 文件服务初始化完成');

    } catch (error) {
      logger.error('[file-service] 文件服务初始化失败', error);
      throw error;
    }
  }

  /**
   * 读取文件
   */
  public async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<FileOperationResult<string | Buffer>> {
    try {
      // 安全检查
      const securityCheck = await this.checkFileSecurity(filePath);
      if (!securityCheck.success) {
        return securityCheck;
      }

      // 检查缓存
      if (this.config.enableCache) {
        const cached = await this.getCachedFile(filePath);
        if (cached) {
          logger.debug(`[file-service] 从缓存读取文件: ${filePath}`);
          return { success: true, data: cached, path: filePath };
        }
      }

      // 读取文件
      const data = await fs.readFile(filePath, encoding);
      
      // 更新缓存
      if (this.config.enableCache && typeof data === 'string') {
        await this.setCachedFile(filePath, data);
      }

      logger.debug(`[file-service] 读取文件成功: ${filePath}`);
      return { success: true, data, path: filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '读取文件失败';
      logger.error(`[file-service] 读取文件失败: ${filePath}`, error);
      return { success: false, error: errorMessage, path: filePath };
    }
  }

  /**
   * 写入文件
   */
  public async writeFile(filePath: string, data: string | Buffer, options: fs.WriteFileOptions = {}): Promise<FileOperationResult> {
    try {
      // 安全检查
      const securityCheck = await this.checkFileSecurity(filePath, true);
      if (!securityCheck.success) {
        return securityCheck;
      }

      // 创建备份
      if (await fs.pathExists(filePath)) {
        await this.createBackup(filePath);
      }

      // 确保目录存在
      await fs.ensureDir(path.dirname(filePath));

      // 写入文件
      await fs.writeFile(filePath, data, options);

      // 清除缓存
      this.clearFileCache(filePath);

      logger.debug(`[file-service] 写入文件成功: ${filePath}`);
      return { success: true, path: filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '写入文件失败';
      logger.error(`[file-service] 写入文件失败: ${filePath}`, error);
      return { success: false, error: errorMessage, path: filePath };
    }
  }

  /**
   * 复制文件
   */
  public async copyFile(sourcePath: string, targetPath: string): Promise<FileOperationResult> {
    try {
      // 安全检查
      const sourceCheck = await this.checkFileSecurity(sourcePath);
      if (!sourceCheck.success) {
        return sourceCheck;
      }

      const targetCheck = await this.checkFileSecurity(targetPath, true);
      if (!targetCheck.success) {
        return targetCheck;
      }

      // 确保目标目录存在
      await fs.ensureDir(path.dirname(targetPath));

      // 复制文件
      await fs.copy(sourcePath, targetPath);

      logger.debug(`[file-service] 复制文件成功: ${sourcePath} -> ${targetPath}`);
      return { success: true, path: targetPath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '复制文件失败';
      logger.error(`[file-service] 复制文件失败: ${sourcePath} -> ${targetPath}`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 移动文件
   */
  public async moveFile(sourcePath: string, targetPath: string): Promise<FileOperationResult> {
    try {
      // 安全检查
      const sourceCheck = await this.checkFileSecurity(sourcePath);
      if (!sourceCheck.success) {
        return sourceCheck;
      }

      const targetCheck = await this.checkFileSecurity(targetPath, true);
      if (!targetCheck.success) {
        return targetCheck;
      }

      // 确保目标目录存在
      await fs.ensureDir(path.dirname(targetPath));

      // 移动文件
      await fs.move(sourcePath, targetPath);

      // 清除缓存
      this.clearFileCache(sourcePath);

      logger.debug(`[file-service] 移动文件成功: ${sourcePath} -> ${targetPath}`);
      return { success: true, path: targetPath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '移动文件失败';
      logger.error(`[file-service] 移动文件失败: ${sourcePath} -> ${targetPath}`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 删除文件
   */
  public async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      // 安全检查
      const securityCheck = await this.checkFileSecurity(filePath);
      if (!securityCheck.success) {
        return securityCheck;
      }

      // 创建备份
      await this.createBackup(filePath);

      // 删除文件
      await fs.remove(filePath);

      // 清除缓存
      this.clearFileCache(filePath);

      logger.debug(`[file-service] 删除文件成功: ${filePath}`);
      return { success: true, path: filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除文件失败';
      logger.error(`[file-service] 删除文件失败: ${filePath}`, error);
      return { success: false, error: errorMessage, path: filePath };
    }
  }

  /**
   * 获取文件信息
   */
  public async getFileInfo(filePath: string): Promise<FileOperationResult<FileInfo>> {
    try {
      const stats = await fs.stat(filePath);
      const parsedPath = path.parse(filePath);
      
      const fileInfo: FileInfo = {
        path: filePath,
        name: parsedPath.name,
        extension: parsedPath.ext,
        size: stats.size,
        mtime: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
      };

      // 计算文件哈希
      if (stats.isFile() && stats.size < this.config.maxFileSize) {
        fileInfo.hash = await this.calculateFileHash(filePath);
      }

      return { success: true, data: fileInfo, path: filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取文件信息失败';
      logger.error(`[file-service] 获取文件信息失败: ${filePath}`, error);
      return { success: false, error: errorMessage, path: filePath };
    }
  }

  /**
   * 列出目录内容
   */
  public async listDirectory(dirPath: string, recursive = false): Promise<FileOperationResult<FileInfo[]>> {
    try {
      const files: FileInfo[] = [];
      
      const processDirectory = async (currentPath: string) => {
        const items = await fs.readdir(currentPath);
        
        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          const fileInfoResult = await this.getFileInfo(itemPath);
          
          if (fileInfoResult.success && fileInfoResult.data) {
            files.push(fileInfoResult.data);
            
            if (recursive && fileInfoResult.data.isDirectory) {
              await processDirectory(itemPath);
            }
          }
        }
      };

      await processDirectory(dirPath);

      return { success: true, data: files, path: dirPath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '列出目录失败';
      logger.error(`[file-service] 列出目录失败: ${dirPath}`, error);
      return { success: false, error: errorMessage, path: dirPath };
    }
  }

  /**
   * 监控文件变化
   */
  public async watchFile(filePath: string, callback: (eventType: string, filename: string) => void): Promise<FileOperationResult> {
    try {
      if (!this.config.enableWatcher) {
        return { success: false, error: '文件监控已禁用' };
      }

      // 停止现有监控
      if (this.watchers.has(filePath)) {
        this.watchers.get(filePath)?.close();
      }

      // 创建新的监控
      const watcher = fs.watch(filePath, { recursive: this.config.watchConfig.recursive }, (eventType, filename) => {
        // 防抖处理
        setTimeout(() => {
          callback(eventType, filename || '');
        }, this.config.watchConfig.debounceMs);
      });

      this.watchers.set(filePath, watcher);

      logger.debug(`[file-service] 开始监控文件: ${filePath}`);
      return { success: true, path: filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '监控文件失败';
      logger.error(`[file-service] 监控文件失败: ${filePath}`, error);
      return { success: false, error: errorMessage, path: filePath };
    }
  }

  /**
   * 停止监控文件
   */
  public stopWatchFile(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
      logger.debug(`[file-service] 停止监控文件: ${filePath}`);
    }
  }

  /**
   * 显示文件选择对话框
   */
  public async showOpenDialog(options: Electron.OpenDialogOptions = {}): Promise<FileOperationResult<string[]>> {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: '所有文件', extensions: ['*'] },
          { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'] },
          { name: '文本文件', extensions: ['txt', 'md', 'json'] },
        ],
        ...options,
      });

      if (result.canceled) {
        return { success: false, error: '用户取消选择' };
      }

      return { success: true, data: result.filePaths };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '显示文件对话框失败';
      logger.error('[file-service] 显示文件对话框失败', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 显示文件保存对话框
   */
  public async showSaveDialog(options: Electron.SaveDialogOptions = {}): Promise<FileOperationResult<string>> {
    try {
      const result = await dialog.showSaveDialog({
        filters: [
          { name: '所有文件', extensions: ['*'] },
          { name: '图片文件', extensions: ['png', 'jpg', 'jpeg'] },
          { name: 'JSON文件', extensions: ['json'] },
        ],
        ...options,
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: '用户取消保存' };
      }

      return { success: true, data: result.filePath };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '显示保存对话框失败';
      logger.error('[file-service] 显示保存对话框失败', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats() {
    return {
      size: this.cacheSize,
      entries: this.fileCache.size,
      maxSize: this.config.cacheMaxSize,
      hitRate: 0, // 可以添加命中率统计
    };
  }

  /**
   * 清理文件服务
   */
  public async cleanup(): Promise<void> {
    logger.info('[file-service] 清理文件服务');

    try {
      // 停止所有文件监控
      for (const [filePath, watcher] of this.watchers.entries()) {
        watcher.close();
        logger.debug(`[file-service] 停止监控: ${filePath}`);
      }
      this.watchers.clear();

      // 清理缓存
      this.fileCache.clear();
      this.cacheSize = 0;

      this.isInitialized = false;
      logger.info('[file-service] 文件服务清理完成');

    } catch (error) {
      logger.error('[file-service] 文件服务清理失败', error);
    }
  }

  // 私有方法

  /**
   * 检查文件安全性
   */
  private async checkFileSecurity(filePath: string, isWrite = false): Promise<FileOperationResult> {
    try {
      // 检查路径是否安全
      const normalizedPath = path.normalize(filePath);
      const userDataPath = app.getPath('userData');
      const tempPath = this.config.tempDirectory;
      
      // 只允许在用户数据目录和临时目录内操作
      if (!normalizedPath.startsWith(userDataPath) && !normalizedPath.startsWith(tempPath)) {
        return { success: false, error: '文件路径不安全' };
      }

      // 检查文件扩展名
      const ext = path.extname(filePath).toLowerCase();
      if (ext && !this.config.allowedExtensions.includes(ext)) {
        return { success: false, error: `不支持的文件类型: ${ext}` };
      }

      // 检查文件大小
      if (!isWrite && await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        if (stats.size > this.config.maxFileSize) {
          return { success: false, error: '文件过大' };
        }
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: '安全检查失败' };
    }
  }

  /**
   * 获取缓存文件
   */
  private async getCachedFile(filePath: string): Promise<string | null> {
    const cached = this.fileCache.get(filePath);
    if (!cached) return null;

    // 检查TTL
    if (Date.now() - cached.timestamp > this.config.cacheTTL) {
      this.fileCache.delete(filePath);
      this.cacheSize -= cached.size;
      return null;
    }

    // 检查文件是否被修改
    try {
      const currentHash = await this.calculateFileHash(filePath);
      
      if (currentHash !== cached.hash) {
        this.fileCache.delete(filePath);
        this.cacheSize -= cached.size;
        return null;
      }

      return cached.data;
    } catch {
      this.fileCache.delete(filePath);
      this.cacheSize -= cached.size;
      return null;
    }
  }

  /**
   * 设置缓存文件
   */
  private async setCachedFile(filePath: string, data: string): Promise<void> {
    try {
      const hash = await this.calculateFileHash(filePath);
      const size = Buffer.byteLength(data, 'utf8');

      // 检查缓存大小限制
      if (this.cacheSize + size > this.config.cacheMaxSize) {
        this.evictCache();
      }

      const entry: FileCacheEntry = {
        data,
        hash,
        timestamp: Date.now(),
        size,
      };

      this.fileCache.set(filePath, entry);
      this.cacheSize += size;

    } catch (error) {
      logger.error(`[file-service] 设置文件缓存失败: ${filePath}`, error);
    }
  }

  /**
   * 清除文件缓存
   */
  private clearFileCache(filePath: string): void {
    const cached = this.fileCache.get(filePath);
    if (cached) {
      this.fileCache.delete(filePath);
      this.cacheSize -= cached.size;
    }
  }

  /**
   * 驱逐缓存
   */
  private evictCache(): void {
    // 按时间戳排序，删除最旧的条目
    const entries = Array.from(this.fileCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const targetSize = this.config.cacheMaxSize * 0.7; // 清理到70%
    
    while (this.cacheSize > targetSize && entries.length > 0) {
      const [filePath, entry] = entries.shift()!;
      this.fileCache.delete(filePath);
      this.cacheSize -= entry.size;
    }
  }

  /**
   * 计算文件哈希
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * 创建备份
   */
  private async createBackup(filePath: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const parsedPath = path.parse(filePath);
      const backupName = `${parsedPath.name}-${timestamp}${parsedPath.ext}`;
      const backupPath = path.join(this.config.backupDirectory, backupName);

      await fs.ensureDir(this.config.backupDirectory);
      await fs.copy(filePath, backupPath);

      logger.debug(`[file-service] 创建备份: ${backupPath}`);
    } catch (error) {
      logger.warn(`[file-service] 创建备份失败: ${filePath}`, error);
    }
  }

  /**
   * 确保必要目录存在
   */
  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.config.tempDirectory);
    await fs.ensureDir(this.config.backupDirectory);
  }

  /**
   * 启动缓存清理
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [filePath, entry] of this.fileCache.entries()) {
        if (now - entry.timestamp > this.config.cacheTTL) {
          expiredKeys.push(filePath);
        }
      }

      expiredKeys.forEach(key => {
        const entry = this.fileCache.get(key);
        if (entry) {
          this.fileCache.delete(key);
          this.cacheSize -= entry.size;
        }
      });

      if (expiredKeys.length > 0) {
        logger.debug(`[file-service] 清理过期缓存: ${expiredKeys.length} 个文件`);
      }
    }, 60000); // 每分钟清理一次
  }
}

// 创建全局文件服务实例
export const fileService = new FileService();