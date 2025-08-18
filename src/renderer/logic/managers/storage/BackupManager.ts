/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// 备份管理器
import { EventEmitter } from '../../engines/h5-editor/utils/event-emitter';
import path from 'path-browserify';
// 渲染进程通过 preload 提供的 fs 桥接
const fsBridge = {
  pathExists: async (p: string) => window.electronAPI.fs?.exists(p),
  ensureDir: async (p: string) => window.electronAPI.fs?.createDirectory(p),
  readFile: async (p: string) => {
    const res = await window.electronAPI.fs?.readFile(p);
    if (!res.success) throw new Error(res.error || 'readFile failed');
    return res.data as any;
  },
  writeJson: async (p: string, data: any) => window.electronAPI.fs.writeJson(p, data, 2),
  readJson: async (p: string) => {
    const res = await window.electronAPI.fs.readJson(p);
    if (!res.success) throw new Error(res.error || 'readJson failed');
    return res.data;
  },
  copy: async (src: string, dest: string) => window.electronAPI.fs.copy(src, dest),
  remove: async (p: string) => window.electronAPI.fs.remove(p),
  stat: async (p: string) => window.electronAPI.fs.stat(p),
};
import crypto from 'crypto';

export interface IBackupConfig {
  enabled: boolean;
  maxBackups: number;
  backupInterval: number; // 分钟
  autoBackup: boolean;
  backupPath: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

export interface IBackupMetadata {
  id: string;
  originalPath: string;
  backupPath: string;
  timestamp: Date;
  fileSize: number;
  checksum: string;
  version: number;
  description?: string;
  tags: string[];
  isAutoBackup: boolean;
}

export interface IFileConflict {
  id: string;
  filePath: string;
  localVersion: {
    path: string;
    modifiedTime: Date;
    size: number;
    checksum: string;
  };
  remoteVersion: {
    path: string;
    modifiedTime: Date;
    size: number;
    checksum: string;
  };
  conflictType: 'modified' | 'deleted' | 'created';
  detectedAt: Date;
  resolved: boolean;
  resolution?: 'keep_local' | 'keep_remote' | 'merge' | 'rename';
}

export interface IBackupManagerEvents extends Record<string, (...args: any[]) => void> {
  backupCreated(backup: IBackupMetadata): void;
  backupRestored(backup: IBackupMetadata): void;
  backupDeleted(backupId: string): void;
  conflictDetected(conflict: IFileConflict): void;
  conflictResolved(conflict: IFileConflict): void;
  autoBackupCompleted(backupsCreated: number): void;
  backupError(error: string): void;
}

/**
 * 备份管理器
 * 负责文件备份、版本管理和冲突处理
 */
export class BackupManager {
  private emitter = new EventEmitter<IBackupManagerEvents>();
  private config: IBackupConfig;
  private backups: Map<string, IBackupMetadata> = new Map();
  private conflicts: Map<string, IFileConflict> = new Map();
  private autoBackupTimer: NodeJS.Timeout | null = null;
  private watchedFiles: Map<string, { checksum: string; modifiedTime: Date }> = new Map();

  constructor(config: Partial<IBackupConfig> = {}) {
    this.config = {
      enabled: true,
      maxBackups: 10,
      backupInterval: 30, // 30分钟
      autoBackup: true,
      backupPath: path.join(process.cwd(), 'backups'),
      compressionEnabled: false,
      encryptionEnabled: false,
      ...config
    };

    this.initializeBackupDirectory();
    this.loadBackupMetadata();
    this.loadConflicts();
    
    if (this.config.autoBackup) {
      this.startAutoBackup();
    }
  }

  /**
   * 初始化备份目录
   */
  private async initializeBackupDirectory(): Promise<void> {
    try {
      await fsBridge.ensureDir(this.config.backupPath);
      await fsBridge.ensureDir(path.join(this.config.backupPath, 'metadata'));
      await fsBridge.ensureDir(path.join(this.config.backupPath, 'files'));
    } catch (error) {
      console.error('初始化备份目录失败:', error);
    }
  }

  /**
   * 计算文件校验和
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fsBridge.readFile(filePath);
      return crypto.createHash('md5').update(fileBuffer).digest('hex');
    } catch (error) {
      console.error('计算文件校验和失败:', error);
      return '';
    }
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建备份
   */
  async createBackup(filePath: string, options: {
    description?: string;
    tags?: string[];
    isAutoBackup?: boolean;
  } = {}): Promise<IBackupMetadata> {
    if (!this.config.enabled) {
      throw new Error('备份功能已禁用');
    }

    try {
      // 检查文件是否存在
      if (!await fsBridge.pathExists(filePath)) {
        throw new Error('源文件不存在');
      }

      const statsRes = await fsBridge.stat(filePath);
      const stats = { size: (statsRes.data as any).size, mtime: new Date((statsRes.data as any).mtime) } as any;
      const checksum = await this.calculateChecksum(filePath);
      const backupId = this.generateBackupId();
      
      // 生成备份文件路径
      const fileName = path.basename(filePath);
      const backupFileName = `${backupId}_${fileName}`;
      const backupFilePath = path.join(this.config.backupPath, 'files', backupFileName);

      // 复制文件到备份目录
      await fsBridge.copy(filePath, backupFilePath);

      // 获取版本号
      const existingBackups = Array.from(this.backups.values())
        .filter(b => b.originalPath === filePath)
        .sort((a, b) => b.version - a.version);
      const version = existingBackups.length > 0 ? (existingBackups[0]?.version ?? 0) + 1 : 1;

      // 创建备份元数据
      const backup: IBackupMetadata = {
        id: backupId,
        originalPath: filePath,
        backupPath: backupFilePath,
        timestamp: new Date(),
        fileSize: stats.size,
        checksum,
        version,
        ...(options.description ? { description: options.description } : {}),
        tags: options.tags || [],
        isAutoBackup: options.isAutoBackup || false
      };

      // 保存备份元数据
      this.backups.set(backupId, backup);
      await this.saveBackupMetadata();

      // 清理旧备份
      await this.cleanupOldBackups(filePath);

      this.emitter.emit('backupCreated', backup);
      return backup;

    } catch (error) {
      console.error('创建备份失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      this.emitter.emit('backupError', `创建备份失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 恢复备份
   */
  async restoreBackup(backupId: string, targetPath?: string): Promise<void> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error('备份不存在');
    }

    try {
      const restorePath = targetPath || backup.originalPath;
      
      // 检查备份文件是否存在
      if (!await fsBridge.pathExists(backup.backupPath)) {
        throw new Error('备份文件不存在');
      }

      // 如果目标文件存在，先创建一个临时备份
      let tempBackupPath: string | null = null;
      if (await fsBridge.pathExists(restorePath)) {
        tempBackupPath = `${restorePath}.restore_backup_${Date.now()}`;
        await fsBridge.copy(restorePath, tempBackupPath);
      }

      try {
        // 恢复文件
        await fsBridge.copy(backup.backupPath, restorePath);
        
        // 验证恢复的文件
        const restoredChecksum = await this.calculateChecksum(restorePath);
        if (restoredChecksum !== backup.checksum) {
          throw new Error('恢复的文件校验和不匹配');
        }

        // 删除临时备份
        if (tempBackupPath) {
          await fsBridge.remove(tempBackupPath);
        }

        this.emitter.emit('backupRestored', backup);

      } catch (error) {
        // 恢复失败，回滚临时备份
        if (tempBackupPath && await fsBridge.pathExists(tempBackupPath)) {
          await fsBridge.copy(tempBackupPath, restorePath);
          await fsBridge.remove(tempBackupPath);
        }
        throw error;
      }

    } catch (error) {
      console.error('恢复备份失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      this.emitter.emit('backupError', `恢复备份失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error('备份不存在');
    }

    try {
      // 删除备份文件
      if (await fsBridge.pathExists(backup.backupPath)) {
        await fsBridge.remove(backup.backupPath);
      }

      // 删除元数据
      this.backups.delete(backupId);
      await this.saveBackupMetadata();

      this.emitter.emit('backupDeleted', backupId);

    } catch (error) {
      console.error('删除备份失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      this.emitter.emit('backupError', `删除备份失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 获取文件的所有备份
   */
  getFileBackups(filePath: string): IBackupMetadata[] {
    return Array.from(this.backups.values())
      .filter(backup => backup.originalPath === filePath)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 获取所有备份
   */
  getAllBackups(): IBackupMetadata[] {
    return Array.from(this.backups.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 清理旧备份
   */
  private async cleanupOldBackups(filePath: string): Promise<void> {
    const fileBackups = this.getFileBackups(filePath);
    
    if (fileBackups.length > this.config.maxBackups) {
      const backupsToDelete = fileBackups.slice(this.config.maxBackups);
      
      for (const backup of backupsToDelete) {
        try {
          await this.deleteBackup(backup.id);
        } catch (error) {
          console.error('清理旧备份失败:', error);
        }
      }
    }
  }

  /**
   * 检测文件冲突
   */
  async detectConflicts(filePath: string): Promise<IFileConflict[]> {
    const conflicts: IFileConflict[] = [];

    try {
      // 检查本地文件
      if (!await fsBridge.pathExists(filePath)) {
        return conflicts;
      }

      const localStatsRes = await fsBridge.stat(filePath);
      const localStats = { mtime: new Date((localStatsRes.data as any).mtime) } as any;
      const localChecksum = await this.calculateChecksum(filePath);

      // 检查是否有监控的版本
      const watchedFile = this.watchedFiles.get(filePath);
      if (watchedFile) {
        // 比较校验和和修改时间
        if (watchedFile.checksum !== localChecksum || 
            watchedFile.modifiedTime.getTime() !== localStats.mtime.getTime()) {
          
          const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const conflict: IFileConflict = {
            id: conflictId,
            filePath,
            localVersion: {
              path: filePath,
              modifiedTime: localStats.mtime,
              size: localStats.size,
              checksum: localChecksum
            },
            remoteVersion: {
              path: filePath,
              modifiedTime: watchedFile.modifiedTime,
              size: 0, // 这里应该从远程获取
              checksum: watchedFile.checksum
            },
            conflictType: 'modified',
            detectedAt: new Date(),
            resolved: false
          };

          conflicts.push(conflict);
          this.conflicts.set(conflictId, conflict);
          this.emitter.emit('conflictDetected', conflict);
        }
      }

      // 更新监控信息
      this.watchedFiles.set(filePath, {
        checksum: localChecksum,
        modifiedTime: localStats.mtime
      });

    } catch (error) {
      console.error('检测文件冲突失败:', error);
    }

    return conflicts;
  }

  /**
   * 解决文件冲突
   */
  async resolveConflict(conflictId: string, resolution: NonNullable<IFileConflict['resolution']>): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('冲突不存在');
    }

    try {
      switch (resolution) {
        case 'keep_local':
          // 保留本地版本，不做任何操作
          break;

        case 'keep_remote':
          // 这里应该从远程获取文件并覆盖本地
          // 由于没有实际的远程源，这里只是示例
          console.log('保留远程版本 - 需要实现远程文件获取');
          break;

        case 'rename':
          // 重命名本地文件
          const dir = path.dirname(conflict.filePath);
          const ext = path.extname(conflict.filePath);
          const name = path.basename(conflict.filePath, ext);
          const newName = `${name}_conflict_${Date.now()}${ext}`;
          const newPath = path.join(dir, newName);
          
          await window.electronAPI.fs?.move(conflict.filePath, newPath);
          break;

        case 'merge':
          // 合并冲突 - 这里需要根据文件类型实现具体的合并逻辑
          console.log('合并冲突 - 需要实现具体的合并逻辑');
          break;
      }

      // 标记冲突已解决
      conflict.resolved = true;
      conflict.resolution = resolution;
      this.conflicts.set(conflictId, conflict);
      await this.saveConflicts();

      this.emitter.emit('conflictResolved', conflict);

    } catch (error) {
      console.error('解决文件冲突失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      this.emitter.emit('backupError', `解决文件冲突失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 获取所有冲突
   */
  getAllConflicts(): IFileConflict[] {
    return Array.from(this.conflicts.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * 获取未解决的冲突
   */
  getUnresolvedConflicts(): IFileConflict[] {
    return this.getAllConflicts().filter(conflict => !conflict.resolved);
  }

  /**
   * 开始自动备份
   */
  private startAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }

    this.autoBackupTimer = setInterval(async () => {
      await this.performAutoBackup();
    }, this.config.backupInterval * 60 * 1000);
  }

  /**
   * 停止自动备份
   */
  private stopAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  /**
   * 执行自动备份
   */
  private async performAutoBackup(): Promise<void> {
    if (!this.config.enabled || !this.config.autoBackup) {
      return;
    }

    let backupsCreated = 0;

    try {
      // 对所有监控的文件执行备份
      for (const filePath of this.watchedFiles.keys()) {
        if (await fsBridge.pathExists(filePath)) {
          try {
            await this.createBackup(filePath, {
              description: '自动备份',
              tags: ['auto'],
              isAutoBackup: true
            });
            backupsCreated++;
          } catch (error) {
            console.error(`自动备份文件失败 ${filePath}:`, error);
          }
        }
      }

      this.emitter.emit('autoBackupCompleted', backupsCreated);

    } catch (error) {
      console.error('执行自动备份失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      this.emitter.emit('backupError', `自动备份失败: ${msg}`);
    }
  }

  /**
   * 添加文件到监控列表
   */
  async addFileToWatch(filePath: string): Promise<void> {
    if (await fsBridge.pathExists(filePath)) {
      const statsRes = await fsBridge.stat(filePath);
      const stats = { mtime: new Date((statsRes.data as any).mtime) } as any;
      const checksum = await this.calculateChecksum(filePath);
      
      this.watchedFiles.set(filePath, {
        checksum,
        modifiedTime: stats.mtime
      });
    }
  }

  /**
   * 从监控列表移除文件
   */
  removeFileFromWatch(filePath: string): void {
    this.watchedFiles.delete(filePath);
  }

  /**
   * 保存备份元数据
   */
  private async saveBackupMetadata(): Promise<void> {
    try {
      const metadataPath = path.join(this.config.backupPath, 'metadata', 'backups.json');
      const data = {
        backups: Array.from(this.backups.values()),
        lastUpdated: new Date().toISOString()
      };
      await fsBridge.writeJson(metadataPath, data);
    } catch (error) {
      console.error('保存备份元数据失败:', error);
    }
  }

  /**
   * 加载备份元数据
   */
  private async loadBackupMetadata(): Promise<void> {
    try {
      const metadataPath = path.join(this.config.backupPath, 'metadata', 'backups.json');
      
      if (await fsBridge.pathExists(metadataPath)) {
        const data = await fsBridge.readJson(metadataPath);
        
        if (data.backups && Array.isArray(data.backups)) {
          this.backups.clear();
          data.backups.forEach((backup: any) => {
            this.backups.set(backup.id, {
              ...backup,
              timestamp: new Date(backup.timestamp)
            });
          });
        }
      }
    } catch (error) {
      console.error('加载备份元数据失败:', error);
    }
  }

  /**
   * 保存冲突数据
   */
  private async saveConflicts(): Promise<void> {
    try {
      const conflictsPath = path.join(this.config.backupPath, 'metadata', 'conflicts.json');
      const data = {
        conflicts: Array.from(this.conflicts.values()),
        lastUpdated: new Date().toISOString()
      };
      await fsBridge.writeJson(conflictsPath, data);
    } catch (error) {
      console.error('保存冲突数据失败:', error);
    }
  }

  /**
   * 加载冲突数据
   */
  private async loadConflicts(): Promise<void> {
    try {
      const conflictsPath = path.join(this.config.backupPath, 'metadata', 'conflicts.json');
      
      if (await fsBridge.pathExists(conflictsPath)) {
        const data = await fsBridge.readJson(conflictsPath);
        
        if (data.conflicts && Array.isArray(data.conflicts)) {
          this.conflicts.clear();
          data.conflicts.forEach((conflict: any) => {
            this.conflicts.set(conflict.id, {
              ...conflict,
              detectedAt: new Date(conflict.detectedAt),
              localVersion: {
                ...conflict.localVersion,
                modifiedTime: new Date(conflict.localVersion.modifiedTime)
              },
              remoteVersion: {
                ...conflict.remoteVersion,
                modifiedTime: new Date(conflict.remoteVersion.modifiedTime)
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('加载冲突数据失败:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<IBackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 重新启动自动备份
    if (this.config.autoBackup) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  /**
   * 获取配置
   */
  getConfig(): IBackupConfig {
    return { ...this.config };
  }

  /**
   * 获取备份统计信息
   */
  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    autoBackups: number;
    manualBackups: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  } {
    const backups = Array.from(this.backups.values());
    
    return {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.fileSize, 0),
      autoBackups: backups.filter(b => b.isAutoBackup).length,
      manualBackups: backups.filter(b => !b.isAutoBackup).length,
      oldestBackup: backups.length > 0 ? 
        new Date(Math.min(...backups.map(b => b.timestamp.getTime()))) : null,
      newestBackup: backups.length > 0 ? 
        new Date(Math.max(...backups.map(b => b.timestamp.getTime()))) : null
    };
  }

  /**
   * 事件管理
   */
  on<T extends keyof IBackupManagerEvents>(eventName: T, listener: IBackupManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IBackupManagerEvents>(eventName: T, listener: IBackupManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoBackup();
    this.emitter.removeAllListeners();
  }
}