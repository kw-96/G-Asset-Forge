import { SuikaEditor } from './editor';
export interface ITool {
    name: string;
    type: string;
    activate(): void;
    deactivate(): void;
    handleMouseDown(x: number, y: number, event: MouseEvent): void;
    handleMouseMove(x: number, y: number, event: MouseEvent): void;
    handleMouseUp(x: number, y: number, event: MouseEvent): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare class SelectTool implements ITool {
    name: string;
    type: string;
    private editor;
    private isActive;
    private selectedObjects;
    private isDragging;
    private dragStart;
    private dragOffset;
    constructor(editor: SuikaEditor);
    activate(): void;
    deactivate(): void;
    handleMouseDown(x: number, y: number, event: MouseEvent): void;
    handleMouseMove(x: number, y: number, _event: MouseEvent): void;
    handleMouseUp(_x: number, _y: number, _event: MouseEvent): void;
    render(ctx: CanvasRenderingContext2D): void;
    selectObject(id: string): void;
    deselectObject(id: string): void;
    clearSelection(): void;
    getSelectedObjects(): string[];
    private moveSelectedObjects;
    private renderSelectionBoxes;
}
export declare class ToolManager {
    private editor;
    private tools;
    private activeTool;
    constructor(editor: SuikaEditor);
    private initializeTools;
    setActiveTool(toolName: string): void;
    getActiveTool(): ITool | null;
    getTools(): ITool[];
    handleMouseDown(x: number, y: number, event: MouseEvent): void;
    handleMouseMove(x: number, y: number, event: MouseEvent): void;
    handleMouseUp(x: number, y: number, event: MouseEvent): void;
    render(ctx: CanvasRenderingContext2D): void;
    selectObjects(ids: string[]): void;
    clearSelection(): void;
    getSelectedObjects(): string[];
    handleKeyDown?(event: KeyboardEvent): void;
    handleKeyUp?(event: KeyboardEvent): void;
    addTool(tool: ITool): void;
    removeTool(toolName: string): void;
}
//# sourceMappingURL=tool-manager.d.ts.map