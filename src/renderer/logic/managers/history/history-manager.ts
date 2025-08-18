/**
 * 历史记录管理器
 * @description 管理操作历史记录，支持撤销和重做
 */
export interface IHistoryCommand {
  id: string;
  name: string;
  execute(): void;
  undo(): void;
  timestamp: Date;
}

export interface IHistoryState {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  currentIndex: number;
}

export class HistoryManager {
  private commands: IHistoryCommand[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;
  private listeners: Set<(state: IHistoryState) => void> = new Set();

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * 执行命令并添加到历史记录
   */
  executeCommand(command: IHistoryCommand): void {
    try {
      // 执行命令
      command.execute();

      // 清除当前位置之后的所有命令
      this.commands = this.commands.slice(0, this.currentIndex + 1);

      // 添加新命令
      this.commands.push(command);
      this.currentIndex++;

      // 限制历史记录大小
      if (this.commands.length > this.maxHistorySize) {
        this.commands.shift();
        this.currentIndex--;
      }

      this.notifyStateChange();
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    try {
      const command = this.commands[this.currentIndex];
      command?.undo();
      this.currentIndex--;
      this.notifyStateChange();
      return true;
    } catch (error) {
      console.error('Failed to undo command:', error);
      return false;
    }
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    try {
      this.currentIndex++;
      const command = this.commands[this.currentIndex];
      command?.execute();
      this.notifyStateChange();
      return true;
    } catch (error) {
      console.error('Failed to redo command:', error);
      this.currentIndex--;
      return false;
    }
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }

  /**
   * 获取当前状态
   */
  getState(): IHistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.currentIndex + 1,
      redoCount: this.commands.length - this.currentIndex - 1,
      currentIndex: this.currentIndex
    };
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
    this.notifyStateChange();
  }

  /**
   * 获取历史记录列表
   */
  getHistory(): IHistoryCommand[] {
    return [...this.commands];
  }

  /**
   * 添加状态变化监听器
   */
  onStateChange(listener: (state: IHistoryState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除状态变化监听器
   */
  offStateChange(listener: (state: IHistoryState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in history state listener:', error);
      }
    });
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    // 如果当前历史记录超过新的限制，截断它
    if (this.commands.length > this.maxHistorySize) {
      const removeCount = this.commands.length - this.maxHistorySize;
      this.commands.splice(0, removeCount);
      this.currentIndex = Math.max(-1, this.currentIndex - removeCount);
      this.notifyStateChange();
    }
  }

  /**
   * 获取最大历史记录大小
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }
}