export interface ICommand {
    id: string;
    type: string;
    timestamp: number;
    execute(): void;
    undo(): void;
    canMerge?(other: ICommand): boolean;
    merge?(other: ICommand): ICommand;
}
export interface IHistoryState {
    commands: ICommand[];
    currentIndex: number;
    maxSize: number;
}
export interface IHistoryManagerEvents extends Record<string, (...args: any[]) => void> {
    commandExecuted(command: ICommand): void;
    commandUndone(command: ICommand): void;
    commandRedone(command: ICommand): void;
    historyChanged(state: IHistoryState): void;
}
export declare enum CommandType {
    ADD_OBJECT = "add_object",
    REMOVE_OBJECT = "remove_object",
    MODIFY_OBJECT = "modify_object",
    MOVE_OBJECT = "move_object",
    RESIZE_OBJECT = "resize_object",
    ROTATE_OBJECT = "rotate_object",
    CHANGE_LAYER = "change_layer",
    ADD_LAYER = "add_layer",
    REMOVE_LAYER = "remove_layer",
    MODIFY_CANVAS = "modify_canvas"
}
//# sourceMappingURL=history-types.d.ts.map