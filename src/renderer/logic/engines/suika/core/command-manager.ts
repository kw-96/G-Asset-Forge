// 命令管理器 - 用于撤销/重做功能
import type { SuikaEditor } from './editor';

export interface ICommand {
  id: string;
  execute(): void;
  undo(): void;
  canMerge?(other: ICommand): boolean;
  merge?(other: ICommand): ICommand;
}

export class CommandManager {
  private editor: SuikaEditor;
  private history: ICommand[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

  constructor(editor: SuikaEditor) {
    this.editor = editor;
  }

  execute(command: ICommand): void {
    // 执行命令
    command.execute();

    // 清除当前索引之后的历史记录
    this.history = this.history.slice(0, this.currentIndex + 1);

    // 尝试与上一个命令合并
    const lastCommand = this.history[this.currentIndex];
    if (lastCommand && lastCommand.canMerge && lastCommand.canMerge(command)) {
      const mergedCommand = lastCommand.merge && lastCommand.merge(command);
      if (mergedCommand) {
        this.history[this.currentIndex] = mergedCommand;
      }
    } else {
      // 添加新命令到历史记录
      this.history.push(command);
      this.currentIndex++;

      // 限制历史记录大小
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
    }

    this.editor.render();
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.history[this.currentIndex];
    if (!command) {
      return false;
    }
    
    command.undo();
    this.currentIndex--;

    this.editor.render();
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    if (!command) {
      return false;
    }
    
    command.execute();

    this.editor.render();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistorySize(): number {
    return this.history.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

// 基础命令类
export abstract class BaseCommand implements ICommand {
  public id: string;

  constructor(id?: string) {
    this.id = id || `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  abstract execute(): void;
  abstract undo(): void;

  canMerge(_other: ICommand): boolean {
    return false;
  }

  merge(_other: ICommand): ICommand {
    return this;
  }
}
