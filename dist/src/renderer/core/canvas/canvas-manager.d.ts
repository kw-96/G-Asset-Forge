import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ICanvasConfig, ICanvasState, ICanvasObject } from './canvas-types';
import type { ITool, ToolType, IToolConfig, IToolProperties } from '../tools/tool-types';
export interface ICanvasEngine {
    type: CanvasEngineType;
    initialize(container: HTMLElement, config: ICanvasConfig): Promise<void>;
    destroy(): void;
    getState(): ICanvasState;
    setState(state: Partial<ICanvasState>): void;
    addObject(object: ICanvasObject): void;
    removeObject(id: string): void;
    updateObject(id: string, updates: Partial<ICanvasObject>): void;
    selectObjects(ids: string[]): void;
    clearSelection(): void;
    zoom(level: number): void;
    pan(x: number, y: number): void;
    render(): void;
    exportImage(format: 'png' | 'jpg', quality?: number): string;
}
export declare enum CanvasEngineType {
    FABRIC = "fabric",
    SUIKA = "suika",
    H5_EDITOR = "h5-editor"
}
export interface ICanvasManagerEvents extends Record<string, (...args: any[]) => void> {
    engineSwitched(engine: {
        type: CanvasEngineType;
    }): void;
    stateChanged(state: ICanvasState): void;
    objectAdded(object: ICanvasObject): void;
    objectRemoved(id: string): void;
    objectUpdated(id: string, updates: Partial<ICanvasObject>): void;
    selectionChanged(ids: string[]): void;
    zoomChanged(level: number): void;
    panChanged(x: number, y: number): void;
    renderComplete(): void;
}
export declare class CanvasManager extends TypedEventEmitter<ICanvasManagerEvents> {
    private engine;
    private toolManager;
    constructor();
    initialize(container: HTMLElement, config: ICanvasConfig): Promise<void>;
    private setupEventListeners;
    switchEngine(engineType: CanvasEngineType, container: HTMLElement, config: ICanvasConfig): Promise<void>;
    getCurrentEngine(): ICanvasEngine | null;
    getEngineType(): CanvasEngineType | null;
    getState(): ICanvasState | null;
    setState(state: Partial<ICanvasState>): void;
    addObject(object: ICanvasObject): void;
    removeObject(id: string): void;
    updateObject(id: string, updates: Partial<ICanvasObject>): void;
    selectObjects(ids: string[]): void;
    clearSelection(): void;
    zoom(level: number): void;
    pan(x: number, y: number): void;
    render(): void;
    exportImage(format?: 'png' | 'jpg', quality?: number): string | null;
    activateTool(type: ToolType): boolean;
    getActiveTool(): ITool | null;
    getActiveToolType(): ToolType | null;
    getAllToolConfigs(): IToolConfig[];
    getToolConfig(type: ToolType): IToolConfig | undefined;
    setToolProperties(properties: Partial<IToolProperties>): void;
    getToolProperties(): IToolProperties;
    handleMouseDown(event: MouseEvent): void;
    handleMouseMove(event: MouseEvent): void;
    handleMouseUp(event: MouseEvent): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleKeyUp(event: KeyboardEvent): void;
    destroy(): void;
}
//# sourceMappingURL=canvas-manager.d.ts.map