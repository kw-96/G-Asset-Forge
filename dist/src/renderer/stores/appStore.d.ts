import { CanvasElement } from '../types/canvas';
type AppPage = 'home' | 'editor' | 'settings';
interface AppState {
    version: string;
    platform: string;
    isInitialized: boolean;
    isInitializing: boolean;
    initializationError: string | null;
    currentPage: AppPage;
    isFirstTime: boolean;
    sidebarCollapsed: boolean;
    toolbarCollapsed: boolean;
    propertiesPanelCollapsed: boolean;
    activeTool: string;
    isLoading: boolean;
    canvasZoom: number;
    canvasX: number;
    canvasY: number;
    showGrid: boolean;
    showRulers: boolean;
    elements: Record<string, CanvasElement>;
    selectedElements: string[];
    selectedElement: CanvasElement | null;
    currentProject: any | null;
    hasUnsavedChanges: boolean;
    initializeApp: () => Promise<void>;
    initializeAppOnce: () => Promise<void>;
    batchUpdate: (updates: Partial<AppState>) => void;
    setAppVersion: (version: string) => void;
    setPlatform: (platform: string) => void;
    setCurrentPage: (page: AppPage) => void;
    setFirstTime: (isFirstTime: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setToolbarCollapsed: (collapsed: boolean) => void;
    setPropertiesPanelCollapsed: (collapsed: boolean) => void;
    setActiveTool: (tool: string) => void;
    setLoading: (loading: boolean) => void;
    setCanvasZoom: (zoom: number) => void;
    setCanvasPosition: (x: number, y: number) => void;
    setShowGrid: (show: boolean) => void;
    setShowRulers: (show: boolean) => void;
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    deleteElement: (id: string) => void;
    selectElements: (elementIds: string[]) => void;
    clearSelection: () => void;
    setCurrentProject: (project: Record<string, unknown> | null) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppState>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: boolean | undefined, action?: A | undefined): void;
}>;
export {};
//# sourceMappingURL=appStore.d.ts.map