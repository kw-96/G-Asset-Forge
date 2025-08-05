import type { SuikaEditor } from './editor';
export interface ICommand {
    id: string;
    execute(): void;
    undo(): void;
    canMerge?(other: ICommand): boolean;
    merge?(other: ICommand): ICommand;
}
export declare class CommandManager {
    private editor;
    private history;
    private currentIndex;
    private maxHistorySize;
    constructor(editor: SuikaEditor);
    execute(command: ICommand): void;
    undo(): boolean;
    redo(): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    clear(): void;
    getHistorySize(): number;
    getCurrentIndex(): number;
}
export declare abstract class BaseCommand implements ICommand {
    id: string;
    constructor(id?: string);
    abstract execute(): void;
    abstract undo(): void;
    canMerge(_other: ICommand): boolean;
    merge(_other: ICommand): ICommand;
}
//# sourceMappingURL=command-manager.d.ts.map