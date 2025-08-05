import { SuikaEditor } from './editor';
export interface IZoomOptions {
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    smoothZoom: boolean;
    zoomDuration: number;
}
export declare class ZoomManager {
    private editor;
    private currentZoom;
    private targetZoom;
    private isAnimating;
    private animationStartTime;
    private animationDuration;
    private options;
    constructor(editor: SuikaEditor);
    setZoom(zoom: number): void;
    getZoom(): number;
    zoomAt(x: number, y: number, zoomDelta: number): void;
    zoomToFit(): void;
    zoomToContent(): void;
    zoomIn(step?: number): void;
    zoomOut(step?: number): void;
    resetZoom(): void;
    getZoomTransform(): {
        scaleX: number;
        scaleY: number;
    };
    viewportToScene(x: number, y: number): {
        x: number;
        y: number;
    };
    sceneToViewport(x: number, y: number): {
        x: number;
        y: number;
    };
    viewportToSceneSize(size: number): number;
    sceneToViewportSize(size: number): number;
    private animateZoom;
    private clampZoom;
    private easeOutCubic;
    getOptions(): IZoomOptions;
    setOptions(options: Partial<IZoomOptions>): void;
    getZoomState(): {
        currentZoom: number;
        targetZoom: number;
        isAnimating: boolean;
    };
    isZoomInRange(zoom: number): boolean;
    getZoomPercentage(): number;
    setZoomPercentage(percentage: number): void;
}
//# sourceMappingURL=zoom-manager.d.ts.map