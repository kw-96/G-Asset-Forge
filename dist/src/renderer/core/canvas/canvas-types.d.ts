export interface ICanvasSize {
    width: number;
    height: number;
}
export interface ICanvasPosition {
    x: number;
    y: number;
}
export interface ICanvasBounds extends ICanvasPosition, ICanvasSize {
}
export interface ICanvasConfig {
    size: ICanvasSize;
    background: string;
    dpi: number;
    enableGrid: boolean;
    enableRuler: boolean;
}
export interface ICanvasObject {
    id: string;
    type: string;
    position: ICanvasPosition;
    size: ICanvasSize;
    rotation: number;
    opacity: number;
    visible: boolean;
    locked: boolean;
    zIndex: number;
}
export interface ICanvasLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    objects: ICanvasObject[];
}
export interface ICanvasState {
    layers: ICanvasLayer[];
    selectedObjects: string[];
    activeLayer: string;
    zoom: number;
    pan: ICanvasPosition;
}
export declare enum CanvasEventType {
    OBJECT_ADDED = "object:added",
    OBJECT_REMOVED = "object:removed",
    OBJECT_MODIFIED = "object:modified",
    OBJECT_SELECTED = "object:selected",
    SELECTION_CLEARED = "selection:cleared",
    CANVAS_RESIZED = "canvas:resized",
    ZOOM_CHANGED = "zoom:changed",
    PAN_CHANGED = "pan:changed"
}
export interface ICanvasEvent {
    type: CanvasEventType;
    data: any;
    timestamp: number;
}
//# sourceMappingURL=canvas-types.d.ts.map