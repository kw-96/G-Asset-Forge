export class CommandManager {
    constructor(editor) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 100;
        this.editor = editor;
    }
    execute(command) {
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
        }
        else {
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
    undo() {
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
    redo() {
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
    canUndo() {
        return this.currentIndex >= 0;
    }
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
    getHistorySize() {
        return this.history.length;
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
}
// 基础命令类
export class BaseCommand {
    constructor(id) {
        this.id = id || `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    canMerge(_other) {
        return false;
    }
    merge(_other) {
        return this;
    }
}
//# sourceMappingURL=command-manager.js.map