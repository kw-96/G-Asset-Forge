import { debounce } from '@g-asset-forge/common';
import {
  type GAssetForgeEditor,
  type IEditorPaperData,
} from '@g-asset-forge/core';

import { dataCompatibilityV3 } from './data-compatibility-v3';

const STORE_KEY = 'g-asset-forge-paper';
const BACKUP_KEY_PREFIX = 'g-asset-forge-backup-';
const VERSION_KEY = 'g-asset-forge-version-';

interface BackupEntry {
  timestamp: number;
  data: string;
  version: string;
  size: number;
}

/**
 * 增强的自动保存类
 * 扩展现有的 AutoSaveGraphics 功能，支持版本管理和数据压缩
 */
export class AutoSaveGraphics {
  private compressionEnabled = true;
  private maxBackups = 10;
  private backupInterval = 5 * 60 * 1000; // 5分钟备份间隔
  private lastBackupTime = 0;
  private saveCount = 0;

  constructor(private editor: GAssetForgeEditor) {
    let data = this.load();
    if (data) {
      if (data.appVersion !== editor.appVersion) {
        if (data.appVersion === 'g-asset-forge-editor_0.0.2') {
          data = dataCompatibilityV3(data);
          editor.setContents(data);
        } else {
          window.alert(
            '编辑器版本和图纸版本不兼容，将清空本地缓存(version not match, to clear data)',
          );
          // this.clear();
          data = null;
        }
      } else {
        editor.setContents(data);
      }
    }

    this.autoSave();
    this.editor.on('destroy', () => this.stopAutoSave());

    // 定期清理旧备份
    this.cleanupOldBackups();
  }

  private listener = debounce(() => {
    this.save();
    this.saveCount++;

    // 每隔一定次数或时间创建备份
    const now = Date.now();
    if (
      this.saveCount % 50 === 0 ||
      now - this.lastBackupTime > this.backupInterval
    ) {
      this.createBackup();
      this.lastBackupTime = now;
    }
  }, 10);

  autoSave() {
    this.editor.commandManager.on('change', this.listener);
  }

  stopAutoSave() {
    this.editor.commandManager.off('change', this.listener);
  }

  save() {
    try {
      const data = this.editor.sceneGraph.toJSON();

      if (this.compressionEnabled) {
        const compressed = this.compressData(data);
        localStorage.setItem(STORE_KEY, compressed);
      } else {
        localStorage.setItem(STORE_KEY, data);
      }

      // 保存版本信息
      localStorage.setItem(
        VERSION_KEY + 'current',
        JSON.stringify({
          version: this.editor.appVersion,
          timestamp: Date.now(),
          compressed: this.compressionEnabled,
        }),
      );
    } catch (error) {
      console.error('保存失败:', error);

      // 如果保存失败，尝试清理缓存后重试
      this.cleanupStorage();
      try {
        const data = this.editor.sceneGraph.toJSON();
        localStorage.setItem(STORE_KEY, data);
      } catch (retryError) {
        console.error('重试保存仍然失败:', retryError);
      }
    }
  }

  clear() {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(VERSION_KEY + 'current');
  }

  load(): IEditorPaperData | null {
    try {
      const dataStr = localStorage.getItem(STORE_KEY);
      if (!dataStr) return null;

      // 检查是否是压缩数据
      const versionInfo = this.getVersionInfo();
      let data: IEditorPaperData;

      if (versionInfo?.compressed) {
        data = JSON.parse(this.decompressData(dataStr));
      } else {
        data = JSON.parse(dataStr);
      }

      return data;
    } catch (error) {
      console.error('加载数据失败:', error);
      return null;
    }
  }

  /**
   * 创建数据备份
   */
  createBackup(): void {
    try {
      const data = this.editor.sceneGraph.toJSON();
      const timestamp = Date.now();
      const backupKey = BACKUP_KEY_PREFIX + timestamp;

      const backupEntry: BackupEntry = {
        timestamp,
        data: this.compressionEnabled ? this.compressData(data) : data,
        version: this.editor.appVersion,
        size: data.length,
      };

      localStorage.setItem(backupKey, JSON.stringify(backupEntry));

      // 清理旧备份
      this.cleanupOldBackups();
    } catch (error) {
      console.error('创建备份失败:', error);
    }
  }

  /**
   * 获取所有备份
   */
  getBackups(): BackupEntry[] {
    const backups: BackupEntry[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_KEY_PREFIX)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '');
          backups.push(backup);
        } catch (error) {
          console.error('解析备份失败:', key, error);
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 从备份恢复
   */
  restoreFromBackup(timestamp: number): boolean {
    try {
      const backupKey = BACKUP_KEY_PREFIX + timestamp;
      const backupStr = localStorage.getItem(backupKey);

      if (!backupStr) return false;

      const backup: BackupEntry = JSON.parse(backupStr);
      let data: IEditorPaperData;

      if (this.compressionEnabled && backup.data.startsWith('compressed:')) {
        data = JSON.parse(this.decompressData(backup.data));
      } else {
        data = JSON.parse(backup.data);
      }

      this.editor.setContents(data);
      return true;
    } catch (error) {
      console.error('从备份恢复失败:', error);
      return false;
    }
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
      }
    }

    // 估算总容量（通常为5-10MB）
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  private compressData(data: string): string {
    // 简单的压缩：移除不必要的空白字符
    const compressed = data.replace(/\s+/g, ' ').trim();
    return 'compressed:' + compressed;
  }

  private decompressData(compressedData: string): string {
    if (compressedData.startsWith('compressed:')) {
      return compressedData.substring(11); // 移除 'compressed:' 前缀
    }
    return compressedData;
  }

  private getVersionInfo() {
    try {
      const versionStr = localStorage.getItem(VERSION_KEY + 'current');
      return versionStr ? JSON.parse(versionStr) : null;
    } catch {
      return null;
    }
  }

  private cleanupOldBackups(): void {
    const backups = this.getBackups();

    // 保留最新的备份
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      toDelete.forEach((backup) => {
        const backupKey = BACKUP_KEY_PREFIX + backup.timestamp;
        localStorage.removeItem(backupKey);
      });
    }
  }

  private cleanupStorage(): void {
    // 清理旧备份以释放空间
    const backups = this.getBackups();
    const toDelete = backups.slice(Math.floor(this.maxBackups / 2));

    toDelete.forEach((backup) => {
      const backupKey = BACKUP_KEY_PREFIX + backup.timestamp;
      localStorage.removeItem(backupKey);
    });
  }
}
