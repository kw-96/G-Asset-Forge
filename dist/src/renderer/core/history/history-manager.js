// 历史记录管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
export class HistoryManager extends TypedEventEmitter {
    constructor(maxSize = 100) {
        super();
        this.commands = [];
        this.currentIndex = -1;
        this.maxSize = 100;
        this.maxSize = maxSize;
    }
    execute(command) {
        // 执行命令
        command.execute();
        // 清除当前索引之后的历史记录
        this.commands = this.commands.slice(0, this.currentIndex + 1);
        // 尝试与上一个命令合并
        const lastCommand = this.commands[this.currentIndex];
        if (lastCommand && lastCommand.canMerge && lastCommand.canMerge(command)) {
            const mergedCommand = lastCommand.merge(command);
            this.commands[this.currentIndex] = mergedCommand;
        }
        else {
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
    undo() {
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
    redo() {
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
    canUndo() {
        return this.currentIndex >= 0;
    }
    canRedo() {
        return this.currentIndex < this.commands.length - 1;
    }
    clear() {
        this.commands = [];
        this.currentIndex = -1;
        this.emitHistoryChanged();
    }
    getState() {
        return {
            commands: [...this.commands],
            currentIndex: this.currentIndex,
            maxSize: this.maxSize
        };
    }
    getHistorySize() {
        return this.commands.length;
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    setMaxSize(size) {
        this.maxSize = size;
        // 如果当前历史记录超过新的最大大小，则截断
        if (this.commands.length > size) {
            const removeCount = this.commands.length - size;
            this.commands.splice(0, removeCount);
            this.currentIndex = Math.max(-1, this.currentIndex - removeCount);
            this.emitHistoryChanged();
        }
    }
    emitHistoryChanged() {
        this.emit('historyChanged', this.getState());
    }
}
//# sourceMappingURL=history-manager.js.map