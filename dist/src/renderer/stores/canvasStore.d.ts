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
export interface CanvasState {
    zoom: number;
    panX: number;
    panY: number;
    showGrid: boolean;
    showRuler: boolean;
    snapToGrid: boolean;
    backgroundColor: string;
    gridSize: number;
    fps: number;
    memoryUsage: number;
    objectCount: number;
    presets: typeof SIMPLE_GAME_ASSET_PRESETS;
    initializeCanvas: () => Promise<void>;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    setShowGrid: (show: boolean) => void;
    setShowRuler: (show: boolean) => void;
    setSnapToGrid: (snap: boolean) => void;
    setBackgroundColor: (color: string) => void;
    setGridSize: (size: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomToFit: () => void;
    resetView: () => void;
    centerView: () => void;
    updatePerformanceMetrics: (fps: number, memory: number, objectCount?: number) => void;
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
//# sourceMappingURL=canvasStore.d.ts.map