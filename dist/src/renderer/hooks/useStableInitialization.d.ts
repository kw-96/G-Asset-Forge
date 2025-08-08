/**
 * 稳定的初始化状态管理Hook
 * 防止初始化相关的useEffect依赖问题
 */
export interface UseStableInitializationOptions {
    enableAutoInit?: boolean;
    onInitialized?: () => void;
    onError?: (error: Error) => void;
}
export interface InitializationState {
    isInitialized: boolean;
    isInitializing: boolean;
    initializationError: string | null;
    hasAttemptedInit: boolean;
}
export declare function useStableInitialization(options?: UseStableInitializationOptions): {
    manualInit: () => Promise<void>;
    resetInitialization: () => void;
    canInitialize: boolean;
    hasError: boolean;
    isInitialized: boolean;
    isInitializing: boolean;
    initializationError: string | null;
    hasAttemptedInit: boolean;
};
//# sourceMappingURL=useStableInitialization.d.ts.map