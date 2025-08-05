import type { ICanvasSize, ICanvasPosition, ICanvasBounds } from './canvas-types';
export declare const GAME_ASSET_PRESETS: Record<string, ICanvasSize>;
export declare class CoordinateUtils {
    static screenToCanvas(screenPos: ICanvasPosition, canvasPos: ICanvasPosition, zoom: number): ICanvasPosition;
    static canvasToScreen(canvasPos: ICanvasPosition, canvasOffset: ICanvasPosition, zoom: number): ICanvasPosition;
    static getBounds(positions: ICanvasPosition[]): ICanvasBounds | null;
}
export declare class ZoomUtils {
    static readonly MIN_ZOOM = 0.1;
    static readonly MAX_ZOOM = 10;
    static readonly ZOOM_STEP = 0.1;
    static clampZoom(zoom: number): number;
    static getZoomToFit(contentSize: ICanvasSize, containerSize: ICanvasSize, padding?: number): number;
    static getZoomLevels(): number[];
}
export declare class ColorUtils {
    static hexToRgba(hex: string, alpha?: number): string;
    static rgbaToHex(rgba: string): string;
}
export declare class PerformanceUtils {
    private static performanceMarks;
    static startMark(name: string): void;
    static endMark(name: string): number;
    static measureFPS(callback: (fps: number) => void): () => void;
}
//# sourceMappingURL=canvas-utils.d.ts.map