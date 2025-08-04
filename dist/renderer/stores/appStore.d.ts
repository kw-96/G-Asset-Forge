interface AppState {
    version: string;
    platform: string;
    sidebarCollapsed: boolean;
    currentTool: string | null;
    isLoading: boolean;
    currentProject: any | null;
    hasUnsavedChanges: boolean;
    initializeApp: () => Promise<void>;
    setAppVersion: (version: string) => void;
    setPlatform: (platform: string) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setCurrentTool: (tool: string | null) => void;
    setLoading: (loading: boolean) => void;
    setCurrentProject: (project: Record<string, unknown> | null) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppState>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: boolean | undefined, action?: A | undefined): void;
}>;
export {};
