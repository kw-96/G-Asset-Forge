/**
 * 应用初始化Hook
 * 提供安全的应用初始化功能，防止重复初始化
 */
export interface UseAppInitializationOptions {
    enableAutoInit?: boolean;
    onInitialized?: () => void;
    onError?: (error: Error) => void;
}
export declare function useAppInitialization(options?: UseAppInitializationOptions): {
    isInitialized: boolean;
    isInitializing: boolean;
    initializationError: string | null;
    hasAttemptedInit: boolean;
    manualInit: () => Promise<void>;
    resetInitialization: () => void;
    canInitialize: boolean;
    hasError: boolean;
};
//# sourceMappingURL=useAppInitialization.d.ts.map