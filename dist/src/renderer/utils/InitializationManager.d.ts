/**
 * 初始化管理器
 * 确保应用只初始化一次，防止重复初始化导致的无限循环
 */
export interface InitializationState {
    status: 'idle' | 'initializing' | 'completed' | 'failed';
    startTime: number | null;
    completedTime: number | null;
    error: Error | null;
    retryCount: number;
}
export interface InitializationOptions {
    maxRetries?: number;
    timeout?: number;
    enableLogging?: boolean;
}
/**
 * 初始化管理器类
 * 使用单例模式确保全局只有一个初始化管理器实例
 */
export declare class InitializationManager {
    private static instance;
    private state;
    private options;
    private initializationPromise;
    private timeoutId;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(options?: InitializationOptions): InitializationManager;
    /**
     * 获取当前初始化状态
     */
    getState(): InitializationState;
    /**
     * 检查是否已初始化
     */
    get isInitialized(): boolean;
    /**
     * 检查是否正在初始化
     */
    get isInitializing(): boolean;
    /**
     * 检查是否初始化失败
     */
    get hasFailed(): boolean;
    /**
     * 只初始化一次的方法
     * 如果已经初始化或正在初始化，直接返回现有的Promise
     */
    initializeOnce(initFunction: () => Promise<void>): Promise<void>;
    /**
     * 执行初始化过程
     */
    private performInitialization;
    /**
     * 设置初始化超时
     */
    private setupTimeout;
    /**
     * 清除超时定时器
     */
    private clearTimeout;
    /**
     * 更新内部状态
     */
    private updateState;
    /**
     * 重置初始化状态（主要用于测试）
     */
    reset(): void;
    /**
     * 强制重新初始化
     */
    forceReinitialize(initFunction: () => Promise<void>): Promise<void>;
    /**
     * 获取初始化统计信息
     */
    getStats(): {
        isInitialized: boolean;
        isInitializing: boolean;
        hasFailed: boolean;
        duration: number | null;
        retryCount: number;
        error: string | null;
    };
    /**
     * 日志输出
     */
    private log;
    /**
     * 销毁管理器实例
     */
    destroy(): void;
}
export declare const initializationManager: InitializationManager;
//# sourceMappingURL=InitializationManager.d.ts.map