import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ICommand, IHistoryState, IHistoryManagerEvents } from './history-types';
export declare class HistoryManager extends TypedEventEmitter<IHistoryManagerEvents> {
    private commands;
    private currentIndex;
    private maxSize;
    constructor(maxSize?: number);
    execute(command: ICommand): void;
    undo(): boolean;
    redo(): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    clear(): void;
    getState(): IHistoryState;
    getHistorySize(): number;
    getCurrentIndex(): number;
    setMaxSize(size: number): void;
    private emitHistoryChanged;
}
//# sourceMappingURL=history-manager.d.ts.map