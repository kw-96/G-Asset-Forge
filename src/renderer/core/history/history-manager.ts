// 历史记录管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ICommand, IHistoryState, IHistoryManagerEvents } from './history-types';

export class HistoryManager extends TypedEventEmitter<IHistoryManagerEvents> {
  private commands: ICommand[] = [];
  private currentIndex: number = -1;
  private maxSize: number = 100;

  constructor(maxSize: number = 100) {
    super();
    this.maxSize = maxSize;
  }

  execute(command: ICommand): void {
    // 执行命令
    command.execute();

    // 清除当前索引之后的历史记录
    this.commands = this.commands.slice(0, this.currentIndex + 1);

    // 尝试与上一个命令合并
    const lastCommand = this.commands[this.currentIndex];
    if (lastCommand && lastCommand.canMerge && lastCommand.canMerge(command)) {
      const mergedCommand = lastCommand.merge!(command);
      this.commands[this.currentIndex] = mergedCommand;
    } else {
      // 添加新命令到历史记录
      this.commands.push(command);
      this.currentIndex++;

      // 限制历史记录大小
      if (this.commands.length > this.maxSize) {
        this.commands.shift();
        this.currentIndex--;
      }
    }

    this.emit('commandExecuted', command);
    this.emitHistoryChanged();
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.commands[this.currentIndex];
    if (command) {
      command.undo();
      this.currentIndex--;
      this.emit('commandUndone', command);
    }
    this.emitHistoryChanged();
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.commands[this.currentIndex];
    if (command) {
      command.execute();
      this.emit('commandRedone', command);
    }
    this.emitHistoryChanged();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }

  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
    this.emitHistoryChanged();
  }

  getState(): IHistoryState {
    return {
      commands: [...this.commands],
      currentIndex: this.currentIndex,
      maxSize: this.maxSize
    };
  }

  getHistorySize(): number {
    return this.commands.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  setMaxSize(size: number): void {
    this.maxSize = size;
    
    // 如果当前历史记录超过新的最大大小，则截断
    if (this.commands.length > size) {
      const removeCount = this.commands.length - size;
      this.commands.splice(0, removeCount);
      this.currentIndex = Math.max(-1, this.currentIndex - removeCount);
      this.emitHistoryChanged();
    }
  }

  private emitHistoryChanged(): void {
    this.emit('historyChanged', this.getState());
  }
}