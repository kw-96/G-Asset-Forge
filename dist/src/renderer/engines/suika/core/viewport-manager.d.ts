import { SuikaEditor } from './editor';
export interface IViewport {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface IViewportOptions {
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    smoothZoom: boolean;
    enablePan: boolean;
    enableZoom: boolean;
}
export declare class ViewportManager {
    private editor;
    private viewport;
    private options;
    private isPanning;
    private panStart;
    private lastPanTime;
    private panVelocity;
    constructor(editor: SuikaEditor);
    setViewport(viewport: Partial<IViewport>): void;
    getViewport(): IViewport;
    pan(dx: number, dy: number): void;
    smoothPan(dx: number, dy: number, duration?: number): void;
    zoomAt(x: number, y: number, zoomDelta: number): void;
    fitToScreen(): void;
    fitToContent(): void;
    resetViewport(): void;
    startPan(x: number, y: number): void;
    updatePan(x: number, y: number): void;
    endPan(): void;
    private applyInertia;
    private clampViewport;
    /**
     * 获取内容边界框
     */
    private getContentBounds;
    private easeOutCubic;
    getOptions(): IViewportOptions;
    setOptions(options: Partial<IViewportOptions>): void;
    getViewportState(): {
        viewport: IViewport;
        isPanning: boolean;
    };
}
//# sourceMappingURL=viewport-manager.d.ts.map