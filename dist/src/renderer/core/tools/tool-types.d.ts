export declare enum ToolType {
    SELECT = "select",
    RECTANGLE = "rectangle",
    CIRCLE = "circle",
    TEXT = "text",
    IMAGE = "image",
    BRUSH = "brush",
    CROP = "crop",
    PAN = "pan",
    ZOOM = "zoom",
    LINE = "line",
    POLYGON = "polygon",
    STAR = "star"
}
export interface IToolConfig {
    type: ToolType;
    name: string;
    icon: string;
    shortcut?: string;
    cursor?: string;
}
export interface IToolState {
    isActive: boolean;
    isDragging: boolean;
    startPoint?: {
        x: number;
        y: number;
    } | undefined;
    currentPoint?: {
        x: number;
        y: number;
    } | undefined;
    properties: Record<string, any>;
}
export interface ITool {
    type: ToolType;
    config: IToolConfig;
    state: IToolState;
    activate(): void;
    deactivate(): void;
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    render?(ctx: CanvasRenderingContext2D): void;
}
export interface IToolProperties {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    brushSize?: number;
    brushOpacity?: number;
    brushHardness?: number;
    cornerRadius?: number;
    imageFilter?: string;
    [key: string]: any;
}
//# sourceMappingURL=tool-types.d.ts.map