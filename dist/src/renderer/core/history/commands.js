import { CommandType } from './history-types';
export class BaseCommand {
    constructor(type, id) {
        this.id = id || `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.timestamp = Date.now();
    }
    canMerge(_other) {
        return false;
    }
    merge(_other) {
        return this;
    }
}
// 添加对象命令
export class AddObjectCommand extends BaseCommand {
    constructor(objectData, canvasManager) {
        super(CommandType.ADD_OBJECT);
        this.objectData = objectData;
        this.canvasManager = canvasManager;
    }
    execute() {
        this.canvasManager.addObject(this.objectData);
    }
    undo() {
        this.canvasManager.removeObject(this.objectData.id);
    }
}
// 移除对象命令
export class RemoveObjectCommand extends BaseCommand {
    constructor(objectId, canvasManager) {
        super(CommandType.REMOVE_OBJECT);
        this.objectId = objectId;
        this.canvasManager = canvasManager;
        // 保存对象数据以便撤销
        const state = canvasManager.getState();
        if (state) {
            for (const layer of state.layers) {
                const obj = layer.objects.find((o) => o.id === objectId);
                if (obj) {
                    this.objectData = obj;
                    break;
                }
            }
        }
    }
    execute() {
        this.canvasManager.removeObject(this.objectId);
    }
    undo() {
        if (this.objectData) {
            this.canvasManager.addObject(this.objectData);
        }
    }
}
// 修改对象命令
export class ModifyObjectCommand extends BaseCommand {
    constructor(objectId, oldData, newData, canvasManager) {
        super(CommandType.MODIFY_OBJECT);
        this.objectId = objectId;
        this.oldData = oldData;
        this.newData = newData;
        this.canvasManager = canvasManager;
    }
    execute() {
        this.canvasManager.updateObject(this.objectId, this.newData);
    }
    undo() {
        this.canvasManager.updateObject(this.objectId, this.oldData);
    }
    canMerge(other) {
        return other instanceof ModifyObjectCommand &&
            other.objectId === this.objectId &&
            Date.now() - this.timestamp < 1000; // 1秒内的修改可以合并
    }
    merge(other) {
        if (other instanceof ModifyObjectCommand) {
            return new ModifyObjectCommand(this.objectId, this.oldData, other.newData, this.canvasManager);
        }
        return this;
    }
}
//# sourceMappingURL=commands.js.map