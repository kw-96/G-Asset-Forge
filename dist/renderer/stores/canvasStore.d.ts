import { fabric } from 'fabric';
declare const SIMPLE_GAME_ASSET_PRESETS: {
    MOBILE_PORTRAIT: {
        width: number;
        height: number;
        name: string;
    };
    MOBILE_LANDSCAPE: {
        width: number;
        height: number;
        name: string;
    };
    TABLET_PORTRAIT: {
        width: number;
        height: number;
        name: string;
    };
    TABLET_LANDSCAPE: {
        width: number;
        height: number;
        name: string;
    };
    DESKTOP: {
        width: number;
        height: number;
        name: string;
    };
    SQUARE: {
        width: number;
        height: number;
        name: string;
    };
    HD: {
        width: number;
        height: number;
        name: string;
    };
    ICON_SMALL: {
        width: number;
        height: number;
        name: string;
    };
    ICON_MEDIUM: {
        width: number;
        height: number;
        name: string;
    };
    ICON_LARGE: {
        width: number;
        height: number;
        name: string;
    };
};
interface CanvasState {
    canvas: fabric.Canvas | null;
    canvasContainer: HTMLElement | null;
    width: number;
    height: number;
    zoom: number;
    backgroundColor: string;
    panX: number;
    panY: number;
    fps: number;
    memoryUsage: number;
    objectCount: number;
    presets: typeof SIMPLE_GAME_ASSET_PRESETS;
    initializeCanvas: () => Promise<void>;
    setCanvas: (canvas: fabric.Canvas | null) => void;
    setCanvasContainer: (container: HTMLElement | null) => void;
    setCanvasSize: (width: number, height: number) => void;
    setZoom: (zoom: number) => void;
    setBackgroundColor: (color: string) => void;
    setPan: (x: number, y: number) => void;
    fitToScreen: () => void;
    resetView: () => void;
    updatePerformanceMetrics: (fps: number, memory: number, objectCount?: number) => void;
    destroyCanvas: () => void;
    applyPreset: (presetKey: keyof typeof SIMPLE_GAME_ASSET_PRESETS) => void;
    getPresetList: () => Array<{
        key: string;
        name: string;
        width: number;
        height: number;
    }>;
}
export declare const useCanvasStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CanvasState>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: CanvasState | Partial<CanvasState> | ((state: CanvasState) => CanvasState | Partial<CanvasState>), replace?: boolean | undefined, action?: A | undefined): void;
}>;
export {};
