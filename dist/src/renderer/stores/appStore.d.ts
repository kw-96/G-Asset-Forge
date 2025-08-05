interface CanvasElement {
    id: string;
    type: 'rectangle' | 'ellipse' | 'text' | 'image' | 'frame' | 'group';
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
    opacity?: number;
    visible: boolean;
    locked: boolean;
    children?: string[];
    parent?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    textAlign?: 'left' | 'center' | 'right';
}
interface AppState {
    version: string;
    platform: string;
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
    setAppVersion: (version: string) => void;
    setPlatform: (platform: string) => void;
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