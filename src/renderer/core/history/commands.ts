// 命令实现
import type { ICommand } from './history-types';
import { CommandType } from './history-types';

export abstract class BaseCommand implements ICommand {
  public id: string;
  public type: string;
  public timestamp: number;

  constructor(type: string, id?: string) {
    this.id = id || `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.timestamp = Date.now();
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

// 添加对象命令
export class AddObjectCommand extends BaseCommand {
  private objectData: any;
  private canvasManager: any;

  constructor(objectData: any, canvasManager: any) {
    super(CommandType.ADD_OBJECT);
    this.objectData = objectData;
    this.canvasManager = canvasManager;
  }

  execute(): void {
    this.canvasManager.addObject(this.objectData);
  }

  undo(): void {
    this.canvasManager.removeObject(this.objectData.id);
  }
}

// 移除对象命令
export class RemoveObjectCommand extends BaseCommand {
  private objectId: string;
  private objectData: any;
  private canvasManager: any;

  constructor(objectId: string, canvasManager: any) {
    super(CommandType.REMOVE_OBJECT);
    this.objectId = objectId;
    this.canvasManager = canvasManager;
    
    // 保存对象数据以便撤销
    const state = canvasManager.getState();
    if (state) {
      for (const layer of state.layers) {
        const obj = layer.objects.find((o: any) => o.id === objectId);
        if (obj) {
          this.objectData = obj;
          break;
        }
      }
    }
  }

  execute(): void {
    this.canvasManager.removeObject(this.objectId);
  }

  undo(): void {
    if (this.objectData) {
      this.canvasManager.addObject(this.objectData);
    }
  }
}

// 修改对象命令
export class ModifyObjectCommand extends BaseCommand {
  private objectId: string;
  private oldData: any;
  private newData: any;
  private canvasManager: any;

  constructor(objectId: string, oldData: any, newData: any, canvasManager: unknown) {
    super(CommandType.MODIFY_OBJECT);
    this.objectId = objectId;
    this.oldData = oldData;
    this.newData = newData;
    this.canvasManager = canvasManager;
  }

  execute(): void {
    this.canvasManager.updateObject(this.objectId, this.newData);
  }

  undo(): void {
    this.canvasManager.updateObject(this.objectId, this.oldData);
  }

  override canMerge(other: ICommand): boolean {
    return other instanceof ModifyObjectCommand && 
           other.objectId === this.objectId &&
           Date.now() - this.timestamp < 1000; // 1秒内的修改可以合并
  }

  override merge(other: ICommand): ICommand {
    if (other instanceof ModifyObjectCommand) {
      return new ModifyObjectCommand(
        this.objectId,
        this.oldData,
        other.newData,
        this.canvasManager
      );
    }
    return this;
  }
}