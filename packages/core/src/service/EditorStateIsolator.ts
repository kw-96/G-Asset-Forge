/**
 * 编辑器状态隔离管理器
 * 负责管理不同项目类型的状态隔离，确保设计项目和H5项目的状态完全独立
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../editor';
import { ProjectType } from './ProjectTypeManager';

/**
 * 状态管理器接口
 * 定义所有状态管理器必须实现的基本方法
 */
export interface StateManager {
  /**
   * 初始化状态管理器
   * @param editor 编辑器实例
   * @param args 额外参数
   */
  initialize(editor: GAssetForgeEditor, ...args: any[]): Promise<void>;

  /**
   * 获取当前状态快照
   */
  getCurrentState(): any;

  /**
   * 恢复状态
   * @param state 要恢复的状态数据
   */
  restoreState(state: any): Promise<void>;

  /**
   * 创建状态快照
   */
  createSnapshot(): any;

  /**
   * 验证状态一致性
   */
  validateState(): boolean;

  /**
   * 清理状态管理器
   */
  cleanup(): Promise<void>;

  /**
   * 获取状态管理器类型
   */
  getType(): ProjectType;
}

/**
 * 状态快照数据结构
 */
export interface StateSnapshot {
  id: string;
  type: ProjectType;
  timestamp: number;
  data: any;
  metadata: {
    version: string;
    checksum?: string;
    size: number;
  };
}

/**
 * 状态隔离管理器事件
 */
interface EditorStateIsolatorEvents {
  stateManagerRegistered: (type: ProjectType, manager: StateManager) => void;
  stateManagerUnregistered: (type: ProjectType) => void;
  currentTypeChanged: (
    oldType: ProjectType | null,
    newType: ProjectType | null,
  ) => void;
  snapshotCreated: (snapshot: StateSnapshot) => void;
  stateRestored: (type: ProjectType, success: boolean) => void;
  validationFailed: (type: ProjectType, errors: string[]) => void;
}

/**
 * 编辑器状态隔离管理器
 * 管理不同项目类型的状态隔离，提供状态快照、恢复和验证功能
 */
export class EditorStateIsolator extends EventEmitter<EditorStateIsolatorEvents> {
  private currentProjectType: ProjectType | null = null;
  private stateManagers = new Map<ProjectType, StateManager>();
  private stateSnapshots = new Map<string, StateSnapshot>();
  // private editor: GAssetForgeEditor | null = null;
  private isInitialized = false;

  constructor() {
    super();
  }

  /**
   * 初始化状态隔离管理器
   */
  async initialize(_editor: GAssetForgeEditor): Promise<void> {
    if (this.isInitialized) {
      console.warn('EditorStateIsolator 已经初始化');
      return;
    }

    // this.editor = editor;
    this.isInitialized = true;

    console.log('EditorStateIsolator 初始化完成');
  }

  /**
   * 注册状态管理器
   */
  registerStateManager(type: ProjectType, manager: StateManager): void {
    if (this.stateManagers.has(type)) {
      console.warn(`状态管理器 ${type} 已存在，将被替换`);
    }

    this.stateManagers.set(type, manager);
    this.emit('stateManagerRegistered', type, manager);

    console.log(`状态管理器 ${type} 注册成功`);
  }

  /**
   * 注销状态管理器
   */
  async unregisterStateManager(type: ProjectType): Promise<void> {
    const manager = this.stateManagers.get(type);
    if (manager) {
      await manager.cleanup();
      this.stateManagers.delete(type);
      this.emit('stateManagerUnregistered', type);

      console.log(`状态管理器 ${type} 注销成功`);
    }
  }

  /**
   * 设置当前项目类型
   */
  async setCurrentProjectType(type: ProjectType | null): Promise<void> {
    const oldType = this.currentProjectType;

    if (oldType === type) {
      return; // 类型未变化
    }

    // 如果有旧类型，创建状态快照
    if (oldType && this.stateManagers.has(oldType)) {
      await this.createStateSnapshot(oldType);
    }

    this.currentProjectType = type;
    this.emit('currentTypeChanged', oldType, type);

    console.log(`当前项目类型从 ${oldType} 切换到 ${type}`);
  }

  /**
   * 获取当前项目类型
   */
  getCurrentProjectType(): ProjectType | null {
    return this.currentProjectType;
  }

  /**
   * 获取当前状态管理器
   */
  getCurrentStateManager(): StateManager | null {
    if (!this.currentProjectType) {
      return null;
    }
    return this.stateManagers.get(this.currentProjectType) || null;
  }

  /**
   * 获取指定类型的状态管理器
   */
  getStateManager(type: ProjectType): StateManager | null {
    return this.stateManagers.get(type) || null;
  }

  /**
   * 创建状态快照
   */
  async createStateSnapshot(type?: ProjectType): Promise<StateSnapshot | null> {
    const targetType = type || this.currentProjectType;
    if (!targetType) {
      console.warn('无法创建状态快照：未指定项目类型');
      return null;
    }

    const manager = this.stateManagers.get(targetType);
    if (!manager) {
      console.warn(`无法创建状态快照：未找到 ${targetType} 类型的状态管理器`);
      return null;
    }

    try {
      const stateData = manager.createSnapshot();
      const snapshot: StateSnapshot = {
        id: `${targetType}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: targetType,
        timestamp: Date.now(),
        data: stateData,
        metadata: {
          version: '1.0.0',
          size: JSON.stringify(stateData).length,
          checksum: this.calculateChecksum(stateData),
        },
      };

      this.stateSnapshots.set(snapshot.id, snapshot);
      this.emit('snapshotCreated', snapshot);

      console.log(`状态快照创建成功: ${snapshot.id} (${targetType})`);
      return snapshot;
    } catch (error) {
      console.error(`创建状态快照失败 (${targetType}):`, error);
      return null;
    }
  }

  /**
   * 恢复状态快照
   */
  async restoreStateSnapshot(snapshotId: string): Promise<boolean> {
    const snapshot = this.stateSnapshots.get(snapshotId);
    if (!snapshot) {
      console.warn(`状态快照不存在: ${snapshotId}`);
      return false;
    }

    const manager = this.stateManagers.get(snapshot.type);
    if (!manager) {
      console.warn(
        `无法恢复状态快照：未找到 ${snapshot.type} 类型的状态管理器`,
      );
      return false;
    }

    try {
      // 验证快照数据完整性
      if (!this.validateSnapshot(snapshot)) {
        console.error(`状态快照数据验证失败: ${snapshotId}`);
        return false;
      }

      await manager.restoreState(snapshot.data);
      this.emit('stateRestored', snapshot.type, true);

      console.log(`状态快照恢复成功: ${snapshotId} (${snapshot.type})`);
      return true;
    } catch (error) {
      console.error(`恢复状态快照失败 (${snapshotId}):`, error);
      this.emit('stateRestored', snapshot.type, false);
      return false;
    }
  }

  /**
   * 恢复指定类型的最新状态
   */
  async restoreLatestState(type: ProjectType): Promise<boolean> {
    // 查找该类型的最新快照
    const snapshots = Array.from(this.stateSnapshots.values())
      .filter((s) => s.type === type)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (snapshots.length === 0) {
      console.warn(`没有找到 ${type} 类型的状态快照`);
      return false;
    }

    return await this.restoreStateSnapshot(snapshots[0].id);
  }

  /**
   * 验证状态一致性
   */
  async validateStateConsistency(type?: ProjectType): Promise<boolean> {
    const targetType = type || this.currentProjectType;
    if (!targetType) {
      console.warn('无法验证状态一致性：未指定项目类型');
      return false;
    }

    const manager = this.stateManagers.get(targetType);
    if (!manager) {
      console.warn(`无法验证状态一致性：未找到 ${targetType} 类型的状态管理器`);
      return false;
    }

    try {
      const isValid = manager.validateState();
      if (!isValid) {
        this.emit('validationFailed', targetType, ['状态一致性验证失败']);
      }
      return isValid;
    } catch (error) {
      console.error(`状态一致性验证异常 (${targetType}):`, error);
      this.emit('validationFailed', targetType, [(error as Error).message]);
      return false;
    }
  }

  /**
   * 清理指定类型的状态
   */
  async cleanupState(type: ProjectType): Promise<void> {
    const manager = this.stateManagers.get(type);
    if (manager) {
      try {
        await manager.cleanup();
        console.log(`状态清理完成: ${type}`);
      } catch (error) {
        console.error(`状态清理失败 (${type}):`, error);
      }
    }

    // 清理相关的状态快照
    const snapshotsToRemove = Array.from(this.stateSnapshots.entries())
      .filter(([_, snapshot]) => snapshot.type === type)
      .map(([id]) => id);

    snapshotsToRemove.forEach((id) => {
      this.stateSnapshots.delete(id);
    });

    console.log(`清理了 ${snapshotsToRemove.length} 个 ${type} 类型的状态快照`);
  }

  /**
   * 清理所有状态
   */
  async cleanupAllStates(): Promise<void> {
    // 清理所有状态管理器
    for (const [type, manager] of this.stateManagers) {
      try {
        await manager.cleanup();
        console.log(`状态管理器清理完成: ${type}`);
      } catch (error) {
        console.error(`状态管理器清理失败 (${type}):`, error);
      }
    }

    // 清理所有快照
    this.stateSnapshots.clear();
    this.currentProjectType = null;

    console.log('所有状态清理完成');
  }

  /**
   * 获取状态快照列表
   */
  getSnapshots(type?: ProjectType): StateSnapshot[] {
    const snapshots = Array.from(this.stateSnapshots.values());

    if (type) {
      return snapshots.filter((s) => s.type === type);
    }

    return snapshots;
  }

  /**
   * 删除状态快照
   */
  deleteSnapshot(snapshotId: string): boolean {
    const deleted = this.stateSnapshots.delete(snapshotId);
    if (deleted) {
      console.log(`状态快照删除成功: ${snapshotId}`);
    }
    return deleted;
  }

  /**
   * 获取状态统计信息
   */
  getStateStats(): {
    registeredManagers: ProjectType[];
    currentType: ProjectType | null;
    snapshotCount: number;
    snapshotsByType: Record<string, number>;
  } {
    const snapshotsByType: Record<string, number> = {};

    for (const snapshot of this.stateSnapshots.values()) {
      snapshotsByType[snapshot.type] =
        (snapshotsByType[snapshot.type] || 0) + 1;
    }

    return {
      registeredManagers: Array.from(this.stateManagers.keys()),
      currentType: this.currentProjectType,
      snapshotCount: this.stateSnapshots.size,
      snapshotsByType,
    };
  }

  /**
   * 验证快照数据完整性
   */
  private validateSnapshot(snapshot: StateSnapshot): boolean {
    try {
      // 检查基本字段
      if (
        !snapshot.id ||
        !snapshot.type ||
        !snapshot.timestamp ||
        !snapshot.data
      ) {
        return false;
      }

      // 验证校验和（如果存在）
      if (snapshot.metadata.checksum) {
        const currentChecksum = this.calculateChecksum(snapshot.data);
        if (currentChecksum !== snapshot.metadata.checksum) {
          console.warn(`快照校验和不匹配: ${snapshot.id}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('快照验证异常:', error);
      return false;
    }
  }

  /**
   * 计算数据校验和
   */
  private calculateChecksum(data: any): string {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // 转换为32位整数
      }
      return hash.toString(16);
    } catch (error) {
      console.error('计算校验和失败:', error);
      return '';
    }
  }

  /**
   * 销毁状态隔离管理器
   */
  async destroy(): Promise<void> {
    await this.cleanupAllStates();
    this.stateManagers.clear();
    // this.editor = null;
    this.isInitialized = false;

    // 清理所有事件监听器
    (this as any).eventMap = {};

    console.log('EditorStateIsolator 销毁完成');
  }
}

/**
 * 全局编辑器状态隔离管理器实例
 */
export const globalEditorStateIsolator = new EditorStateIsolator();
