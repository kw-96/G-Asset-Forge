/**
 * 批量更新Hook
 * 提供批量状态更新功能，减少不必要的重新渲染
 */
export interface UseBatchUpdateOptions {
    debounceMs?: number;
    maxBatchSize?: number;
    enableLogging?: boolean;
}
export declare function useBatchUpdate(options?: UseBatchUpdateOptions): {
    addToBatch: (key: string, value: any) => void;
    batchUpdateMultiple: (updates: Record<string, any>) => void;
    flushImmediately: () => void;
    clearBatch: () => void;
    getBatchStatus: () => {
        pendingCount: number;
        pendingKeys: string[];
        hasPendingUpdates: boolean;
        hasTimer: boolean;
    };
    updateUI: (updates: {
        sidebarCollapsed?: boolean;
        toolbarCollapsed?: boolean;
        propertiesPanelCollapsed?: boolean;
        activeTool?: string;
        isLoading?: boolean;
    }) => void;
    updateCanvas: (updates: {
        canvasZoom?: number;
        canvasX?: number;
        canvasY?: number;
        showGrid?: boolean;
        showRulers?: boolean;
    }) => void;
    updateNavigation: (updates: {
        currentPage?: "home" | "editor" | "settings";
        isFirstTime?: boolean;
    }) => void;
};
//# sourceMappingURL=useBatchUpdate.d.ts.map