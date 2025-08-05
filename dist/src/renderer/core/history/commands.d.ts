import type { ICommand } from './history-types';
export declare abstract class BaseCommand implements ICommand {
    id: string;
    type: string;
    timestamp: number;
    constructor(type: string, id?: string);
    abstract execute(): void;
    abstract undo(): void;
    canMerge(_other: ICommand): boolean;
    merge(_other: ICommand): ICommand;
}
export declare class AddObjectCommand extends BaseCommand {
    private objectData;
    private canvasManager;
    constructor(objectData: any, canvasManager: any);
    execute(): void;
    undo(): void;
}
export declare class RemoveObjectCommand extends BaseCommand {
    private objectId;
    private objectData;
    private canvasManager;
    constructor(objectId: string, canvasManager: any);
    execute(): void;
    undo(): void;
}
export declare class ModifyObjectCommand extends BaseCommand {
    private objectId;
    private oldData;
    private newData;
    private canvasManager;
    constructor(objectId: string, oldData: any, newData: any, canvasManager: unknown);
    execute(): void;
    undo(): void;
    canMerge(other: ICommand): boolean;
    merge(other: ICommand): ICommand;
}
//# sourceMappingURL=commands.d.ts.map