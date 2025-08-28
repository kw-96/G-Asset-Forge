/**
 * 回收站服务 - 实现项目的软删除和回收站机制
 */
import { EventEmitter } from '@g-asset-forge/common';

import { type ProjectData } from './types';

interface RecycleBinEvents {
  itemMoved: (item: RecycleBinItem) => void;
  itemRestored: (item: RecycleBinItem) => void;
  itemDeleted: (itemId: string) => void;
  binCleared: () => void;
}

/**
 * 回收站项目接口
 */
export interface RecycleBinItem {
  id: string;
  originalId: string;
  name: string;
  type: 'project';
  data: ProjectData;
  deletedAt: Date;
  deletedBy?: string;
  originalPath?: string;
}

/**
 * 回收站服务类
 */
export class RecycleBinService extends EventEmitter<RecycleBinEvents> {
  private readonly RECYCLE_BIN_KEY = 'g-asset-forge-recycle-bin';
  private readonly MAX_ITEMS = 50; // 最大回收站项目数量
  private readonly AUTO_CLEANUP_DAYS = 30; // 30天后自动清理

  constructor() {
    super();
    this.setupAutoCleanup();
  }

  /**
   * 将项目移动到回收站
   */
  async moveToRecycleBin(project: ProjectData): Promise<RecycleBinItem> {
    const recycleBinItem: RecycleBinItem = {
      id: this.generateId(),
      originalId: project.id,
      name: project.name,
      type: 'project',
      data: { ...project },
      deletedAt: new Date(),
      originalPath: `project://${project.id}`,
    };

    const items = await this.getRecycleBinItems();
    items.unshift(recycleBinItem);

    // 限制回收站项目数量
    if (items.length > this.MAX_ITEMS) {
      items.splice(this.MAX_ITEMS);
    }

    await this.saveRecycleBinItems(items);
    this.emit('itemMoved', recycleBinItem);

    return recycleBinItem;
  }

  /**
   * 从回收站恢复项目
   */
  async restoreFromRecycleBin(itemId: string): Promise<ProjectData | null> {
    const items = await this.getRecycleBinItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return null;
    }

    const item = items[itemIndex];
    const restoredProject = { ...item.data };

    // 更新恢复时间
    restoredProject.updatedAt = new Date();

    // 从回收站移除
    items.splice(itemIndex, 1);
    await this.saveRecycleBinItems(items);

    this.emit('itemRestored', item);
    return restoredProject;
  }

  /**
   * 永久删除回收站项目
   */
  async permanentlyDelete(itemId: string): Promise<boolean> {
    const items = await this.getRecycleBinItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return false;
    }

    items.splice(itemIndex, 1);
    await this.saveRecycleBinItems(items);

    this.emit('itemDeleted', itemId);
    return true;
  }

  /**
   * 获取回收站项目列表
   */
  async getRecycleBinItems(): Promise<RecycleBinItem[]> {
    try {
      const dataStr = localStorage.getItem(this.RECYCLE_BIN_KEY);
      if (!dataStr) {
        return [];
      }

      const items = JSON.parse(dataStr) as RecycleBinItem[];

      // 转换日期字符串为Date对象
      return items.map((item) => ({
        ...item,
        deletedAt: new Date(item.deletedAt),
      }));
    } catch (error) {
      console.error('获取回收站项目失败:', error);
      return [];
    }
  }

  /**
   * 清空回收站
   */
  async clearRecycleBin(): Promise<void> {
    localStorage.removeItem(this.RECYCLE_BIN_KEY);
    this.emit('binCleared');
  }

  /**
   * 获取回收站统计信息
   */
  async getRecycleBinStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem?: Date;
    newestItem?: Date;
  }> {
    const items = await this.getRecycleBinItems();

    if (items.length === 0) {
      return {
        totalItems: 0,
        totalSize: 0,
      };
    }

    const totalSize = items.reduce((size, item) => {
      return size + JSON.stringify(item.data).length;
    }, 0);

    const sortedByDate = items.sort(
      (a, b) => a.deletedAt.getTime() - b.deletedAt.getTime(),
    );

    return {
      totalItems: items.length,
      totalSize,
      oldestItem: sortedByDate[0]?.deletedAt,
      newestItem: sortedByDate[sortedByDate.length - 1]?.deletedAt,
    };
  }

  /**
   * 自动清理过期项目
   */
  async autoCleanup(): Promise<number> {
    const items = await this.getRecycleBinItems();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);

    const itemsToKeep = items.filter((item) => item.deletedAt > cutoffDate);
    const deletedCount = items.length - itemsToKeep.length;

    if (deletedCount > 0) {
      await this.saveRecycleBinItems(itemsToKeep);
      console.log(`自动清理了 ${deletedCount} 个过期的回收站项目`);
    }

    return deletedCount;
  }

  /**
   * 搜索回收站项目
   */
  async searchRecycleBinItems(query: string): Promise<RecycleBinItem[]> {
    const items = await this.getRecycleBinItems();

    if (!query.trim()) {
      return items;
    }

    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.data.description.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * 保存回收站项目到本地存储
   */
  private async saveRecycleBinItems(items: RecycleBinItem[]): Promise<void> {
    try {
      localStorage.setItem(this.RECYCLE_BIN_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('保存回收站项目失败:', error);
      throw error;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `recycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置自动清理定时器
   */
  private setupAutoCleanup(): void {
    // 每天检查一次过期项目
    setInterval(() => {
      this.autoCleanup().catch((error) => {
        console.error('自动清理回收站失败:', error);
      });
    }, 24 * 60 * 60 * 1000); // 24小时

    // 启动时立即执行一次清理
    setTimeout(() => {
      this.autoCleanup().catch((error) => {
        console.error('启动时清理回收站失败:', error);
      });
    }, 1000);
  }
}
