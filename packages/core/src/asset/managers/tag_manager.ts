import { AssetTag } from '../types';
import { IndexedDBUtils } from '../utils/indexeddb_utils';

/**
 * 标签管理器 - 负责素材标签的管理
 */
export class TagManager {
  private dbUtils: IndexedDBUtils;

  constructor(dbUtils: IndexedDBUtils) {
    this.dbUtils = dbUtils;
  }

  /**
   * 创建标签
   */
  async createTag(
    tag: Omit<AssetTag, 'id' | 'createdAt' | 'usageCount'>,
  ): Promise<AssetTag> {
    const newTag: AssetTag = {
      ...tag,
      id: this.generateId(),
      usageCount: 0,
      createdAt: new Date(),
    };

    await this.dbUtils.add('tags', newTag);
    return newTag;
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<AssetTag[]> {
    return await this.dbUtils.getAll<AssetTag>('tags');
  }

  /**
   * 更新标签
   */
  async updateTag(id: string, updates: Partial<AssetTag>): Promise<AssetTag> {
    const tag = await this.dbUtils.get<AssetTag>('tags', id);
    if (!tag) {
      throw new Error(`标签不存在: ${id}`);
    }

    const updatedTag = { ...tag, ...updates };
    await this.dbUtils.put('tags', updatedTag);
    return updatedTag;
  }

  /**
   * 删除标签
   */
  async deleteTag(id: string): Promise<void> {
    await this.dbUtils.delete('tags', id);
  }

  /**
   * 更新标签使用计数
   */
  async updateTagUsageCount(tagIds: string[], delta: number): Promise<void> {
    for (const tagId of tagIds) {
      const tag = await this.dbUtils.get<AssetTag>('tags', tagId);
      if (tag) {
        const updatedTag = {
          ...tag,
          usageCount: Math.max(0, tag.usageCount + delta),
        };
        await this.dbUtils.put('tags', updatedTag);
      }
    }
  }

  /**
   * 创建默认标签
   */
  async createDefaultTags(): Promise<void> {
    const defaultTags: AssetTag[] = [
      {
        id: 'tag-game',
        name: '游戏',
        color: '#3b82f6',
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'tag-ui',
        name: 'UI',
        color: '#10b981',
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'tag-button',
        name: '按钮',
        color: '#f59e0b',
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'tag-icon',
        name: '图标',
        color: '#ef4444',
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'tag-fantasy',
        name: '奇幻',
        color: '#8b5cf6',
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'tag-modern',
        name: '现代',
        color: '#06b6d4',
        usageCount: 0,
        createdAt: new Date(),
      },
    ];

    for (const tag of defaultTags) {
      await this.dbUtils.add('tags', tag);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
