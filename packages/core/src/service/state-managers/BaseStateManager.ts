/**
 * 基础状态管理器
 * 提供状态管理器的通用功能和默认实现
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { GAssetForgeEditor } from '../../editor';
import type { StateManager } from '../EditorStateIsolator';
import { ProjectType } from '../ProjectTypeManager';

/**
 * 状态管理器事件
 */
interface BaseStateManagerEvents {
  stateChanged: (newState: any, oldState: any) => void;
  stateValidated: (isValid: boolean, errors?: string[]) => void;
  snapshotCreated: (snapshot: any) => void;
  stateRestored: (state: any) => void;
  cleanup: () => void;
  uiStateChanged: (uiState: any) => void;
  layerStateChanged: (layerState: any) => void;
}

/**
 * 基础状态数据结构
 */
export interface BaseState {
  id: string;
  type: ProjectType;
  timestamp: number;
  version: string;
}

/**
 * 基础状态管理器抽象类
 * 提供状态管理的通用功能，子类需要实现具体的状态逻辑
 */
export abstract class BaseStateManager
  extends EventEmitter<BaseStateManagerEvents>
  implements StateManager
{
  protected editor: GAssetForgeEditor | null = null;
  protected currentState: any = null;
  protected isInitialized = false;
  protected stateHistory: any[] = [];
  protected maxHistorySize = 50;

  constructor(protected type: ProjectType) {
    super();
  }

  /**
   * 初始化状态管理器
   */
  async initialize(editor: GAssetForgeEditor, ..._args: any[]): Promise<void> {
    void _args; // 明确表示忽略参数
    if (this.isInitialized) {
      console.warn(`${this.type} 状态管理器已经初始化`);
      return;
    }

    this.editor = editor;
    this.currentState = this.createInitialState();
    this.setupEventListeners();
    this.isInitialized = true;

    console.log(`${this.type} 状态管理器初始化完成`);
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): any {
    if (!this.isInitialized) {
      console.warn(`${this.type} 状态管理器未初始化`);
      return null;
    }

    return this.buildCurrentState();
  }

  /**
   * 恢复状态
   */
  async restoreState(state: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(`${this.type} 状态管理器未初始化`);
    }

    if (!state) {
      console.warn('恢复状态失败：状态数据为空');
      return;
    }

    try {
      const oldState = this.currentState;
      await this.applyState(state);
      this.currentState = { ...state };

      this.emit('stateRestored', state);
      this.emit('stateChanged', this.currentState, oldState);

      console.log(`${this.type} 状态恢复成功`);
    } catch (error) {
      console.error(`${this.type} 状态恢复失败:`, error);
      throw error;
    }
  }

  /**
   * 创建状态快照
   */
  createSnapshot(): any {
    if (!this.isInitialized) {
      console.warn(`${this.type} 状态管理器未初始化`);
      return null;
    }

    const snapshot = this.buildCurrentState();

    // 添加到历史记录
    this.addToHistory(snapshot);

    this.emit('snapshotCreated', snapshot);
    return snapshot;
  }

  /**
   * 验证状态一致性
   */
  validateState(): boolean {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const errors: string[] = [];
      const isValid = this.performStateValidation(errors);

      this.emit('stateValidated', isValid, errors);

      if (!isValid) {
        console.warn(`${this.type} 状态验证失败:`, errors);
      }

      return isValid;
    } catch (error) {
      console.error(`${this.type} 状态验证异常:`, error);
      this.emit('stateValidated', false, [(error as Error).message]);
      return false;
    }
  }

  /**
   * 清理状态管理器
   */
  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      this.removeEventListeners();
      await this.performCleanup();

      this.currentState = null;
      this.stateHistory = [];
      this.editor = null;
      this.isInitialized = false;

      this.emit('cleanup');

      // 清理所有事件监听器
      (this as any).eventMap = {};

      console.log(`${this.type} 状态管理器清理完成`);
    } catch (error) {
      console.error(`${this.type} 状态管理器清理失败:`, error);
      throw error;
    }
  }

  /**
   * 获取状态管理器类型
   */
  getType(): ProjectType {
    return this.type;
  }

  /**
   * 更新状态
   */
  protected updateState(newState: Partial<any>): void {
    if (!this.isInitialized) {
      return;
    }

    const oldState = { ...this.currentState };
    this.currentState = { ...this.currentState, ...newState };

    this.emit('stateChanged', this.currentState, oldState);
  }

  /**
   * 添加到历史记录
   */
  protected addToHistory(state: any): void {
    this.stateHistory.push({
      ...state,
      timestamp: Date.now(),
    });

    // 限制历史记录大小
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): any[] {
    return [...this.stateHistory];
  }

  /**
   * 清空状态历史
   */
  clearHistory(): void {
    this.stateHistory = [];
  }

  // 抽象方法 - 子类必须实现

  /**
   * 创建初始状态
   */
  protected abstract createInitialState(): any;

  /**
   * 构建当前状态
   */
  protected abstract buildCurrentState(): any;

  /**
   * 应用状态
   */
  protected abstract applyState(state: any): Promise<void>;

  /**
   * 执行状态验证
   */
  protected abstract performStateValidation(errors: string[]): boolean;

  /**
   * 设置事件监听器
   */
  protected abstract setupEventListeners(): void;

  /**
   * 移除事件监听器
   */
  protected abstract removeEventListeners(): void;

  /**
   * 执行清理操作
   */
  protected abstract performCleanup(): Promise<void>;
}
