import { ViewportManager } from './viewport-manager';
import { ZoomManager } from './zoom-manager';
import { SceneGraph } from './scene-graph';
import { ToolManager } from './tool-manager';
import { CommandManager } from './command-manager';
export interface ISuikaEditorOptions {
    containerElement: HTMLDivElement;
    width: number;
    height: number;
    offsetX?: number;
    offsetY?: number;
    showPerfMonitor?: boolean;
    userPreference?: Record<string, any>;
}
export interface ISuikaEditorEvents extends Record<string, (...args: any[]) => void> {
    destroy(): void;
    render(): void;
    selectionChange(): void;
    objectAdded(): void;
    objectRemoved(): void;
    objectUpdated(): void;
    zoomChanged(zoom: number): void;
    panChanged(pan: {
        x: number;
        y: number;
    }): void;
}
export declare class SuikaEditor {
    containerElement: HTMLDivElement;
    canvasElement: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private emitter;
    viewportManager: ViewportManager;
    zoomManager: ZoomManager;
    sceneGraph: SceneGraph;
    toolManager: ToolManager;
    commandManager: CommandManager;
    private options;
    paperId: string;
    private perfMonitor;
    private lastRenderTime;
    constructor(options: ISuikaEditorOptions);
    private resizeCanvas;
    private initPerfMonitor;
    private boundHandlers;
    private resizeObserver;
    private bindEvents;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleWheel;
    toScenePt(x: number, y: number): {
        x: number;
        y: number;
    };
    toViewportPt(x: number, y: number): {
        x: number;
        y: number;
    };
    getCursorXY(event: {
        clientX: number;
        clientY: number;
    }): {
        x: number;
        y: number;
    };
    getSceneCursorXY(event: {
        clientX: number;
        clientY: number;
    }): {
        x: number;
        y: number;
    };
    render(): void;
    getPerformanceInfo(): {
        fps: number;
        frameCount: number;
    };
    destroy(): void;
    private unbindEvents;
    on<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void;
    off<T extends keyof ISuikaEditorEvents>(eventName: T, listener: ISuikaEditorEvents[T]): void;
    getState(): any;
    setState(state: any): void;
}
//# sourceMappingURL=editor.d.ts.map