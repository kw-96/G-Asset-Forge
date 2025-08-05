import type { ITool, IToolConfig, IToolState } from './tool-types';
import { ToolType } from './tool-types';
export declare abstract class BaseTool implements ITool {
    type: ToolType;
    config: IToolConfig;
    state: IToolState;
    constructor(type: ToolType, config: IToolConfig);
    activate(): void;
    deactivate(): void;
    protected onActivate(): void;
    protected onDeactivate(): void;
    abstract onMouseDown(event: MouseEvent): void;
    abstract onMouseMove(event: MouseEvent): void;
    abstract onMouseUp(event: MouseEvent): void;
    onKeyDown(_event: KeyboardEvent): void;
    onKeyUp(_event: KeyboardEvent): void;
    render?(_ctx: CanvasRenderingContext2D): void;
}
export declare class SelectTool extends BaseTool {
    private selectedObjects;
    private selectionBox;
    private isDragging;
    private isResizing;
    private resizeHandle;
    private originalObjectStates;
    constructor();
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(_event: MouseEvent): void;
    private handleObjectClick;
    private startSelectionBox;
    private updateSelectionBox;
    private finalizeSelectionBox;
    private startResize;
    private handleResize;
    private handleDrag;
    deleteSelectedObjects(): void;
    duplicateSelectedObjects(): void;
    clearSelection(): void;
    selectAll(): void;
    render(ctx: CanvasRenderingContext2D): void;
    private renderSelectionBorder;
    private renderTransformHandles;
    private getCanvasPoint;
    private getObjectAt;
    private getObjectById;
    private getAllObjects;
    private getObjectsInBox;
    private getObjectBounds;
    private getTransformHandles;
    private getResizeHandleAt;
    private moveObject;
    private resizeObject;
    private duplicateObject;
    private removeObject;
    private saveObjectStates;
    private updateCursor;
    private getCursorForHandle;
    private setCursor;
    private generateId;
    private emitSelectionChanged;
}
export declare class RectangleTool extends BaseTool {
    constructor();
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(_event: MouseEvent): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare class CircleTool extends BaseTool {
    constructor();
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(_event: MouseEvent): void;
}
export declare class TextTool extends BaseTool {
    constructor();
    onMouseDown(event: MouseEvent): void;
    onMouseMove(_event: MouseEvent): void;
    onMouseUp(_event: MouseEvent): void;
}
//# sourceMappingURL=tools.d.ts.map