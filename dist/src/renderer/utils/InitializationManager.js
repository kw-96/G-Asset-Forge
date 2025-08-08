/**
 * 初始化管理器
 * 确保应用只初始化一次，防止重复初始化导致的无限循环
 */
/**
 * 初始化管理器类
 * 使用单例模式确保全局只有一个初始化管理器实例
 */
export class InitializationManager {
    constructor(options = {}) {
        this.initializationPromise = null;
        this.timeoutId = null;
        this.options = {
            maxRetries: options.maxRetries ?? 3,
            timeout: options.timeout ?? 10000, // 10秒超时
            enableLogging: options.enableLogging ?? true,
        };
        this.state = {
            status: 'idle',
            startTime: null,
            completedTime: null,
            error: null,
            retryCount: 0,
        };
    }
    /**
     * 获取单例实例
     */
    static getInstance(options) {
        if (!InitializationManager.instance) {
            InitializationManager.instance = new InitializationManager(options);
        }
        return InitializationManager.instance;
    }
    /**
     * 获取当前初始化状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 检查是否已初始化
     */
    get isInitialized() {
        return this.state.status === 'completed';
    }
    /**
     * 检查是否正在初始化
     */
    get isInitializing() {
        return this.state.status === 'initializing';
    }
    /**
     * 检查是否初始化失败
     */
    get hasFailed() {
        return this.state.status === 'failed';
    }
    /**
     * 只初始化一次的方法
     * 如果已经初始化或正在初始化，直接返回现有的Promise
     */
    async initializeOnce(initFunction) {
        // 如果已经完成初始化，直接返回
        if (this.state.status === 'completed') {
            this.log('应用已经初始化完成，跳过重复初始化');
            return;
        }
        // 如果正在初始化，返回现有的Promise
        if (this.state.status === 'initializing' && this.initializationPromise) {
            this.log('应用正在初始化中，等待完成...');
            return this.initializationPromise;
        }
        // 如果之前失败了，检查是否可以重试
        if (this.state.status === 'failed') {
            if (this.state.retryCount >= this.options.maxRetries) {
                throw new Error(`初始化失败，已达到最大重试次数 (${this.options.maxRetries})`);
            }
            this.log(`初始化失败，准备重试 (${this.state.retryCount + 1}/${this.options.maxRetries})`);
        }
        // 开始初始化
        this.initializationPromise = this.performInitialization(initFunction);
        return this.initializationPromise;
    }
    /**
     * 执行初始化过程
     */
    async performInitialization(initFunction) {
        try {
            // 更新状态为初始化中
            this.updateState({
                status: 'initializing',
                startTime: Date.now(),
                error: null,
            });
            this.log('开始应用初始化...');
            // 设置超时
            this.setupTimeout();
            // 执行初始化函数
            await initFunction();
            // 清除超时
            this.clearTimeout();
            // 更新状态为完成
            this.updateState({
                status: 'completed',
                completedTime: Date.now(),
            });
            const duration = this.state.completedTime - this.state.startTime;
            this.log(`应用初始化完成，耗时: ${duration}ms`);
        }
        catch (error) {
            // 清除超时
            this.clearTimeout();
            // 更新重试计数
            this.state.retryCount++;
            // 更新状态为失败
            this.updateState({
                status: 'failed',
                error: error instanceof Error ? error : new Error(String(error)),
            });
            this.log(`应用初始化失败: ${error instanceof Error ? error.message : String(error)}`);
            // 重新抛出错误
            throw error;
        }
    }
    /**
     * 设置初始化超时
     */
    setupTimeout() {
        this.timeoutId = setTimeout(() => {
            const error = new Error(`初始化超时 (${this.options.timeout}ms)`);
            this.updateState({
                status: 'failed',
                error,
            });
            this.log(`初始化超时: ${this.options.timeout}ms`);
        }, this.options.timeout);
    }
    /**
     * 清除超时定时器
     */
    clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    /**
     * 更新内部状态
     */
    updateState(updates) {
        this.state = { ...this.state, ...updates };
    }
    /**
     * 重置初始化状态（主要用于测试）
     */
    reset() {
        this.clearTimeout();
        this.initializationPromise = null;
        this.state = {
            status: 'idle',
            startTime: null,
            completedTime: null,
            error: null,
            retryCount: 0,
        };
        this.log('初始化管理器已重置');
    }
    /**
     * 强制重新初始化
     */
    async forceReinitialize(initFunction) {
        this.log('强制重新初始化...');
        this.reset();
        return this.initializeOnce(initFunction);
    }
    /**
     * 获取初始化统计信息
     */
    getStats() {
        const duration = this.state.startTime && this.state.completedTime
            ? this.state.completedTime - this.state.startTime
            : null;
        return {
            isInitialized: this.isInitialized,
            isInitializing: this.isInitializing,
            hasFailed: this.hasFailed,
            duration,
            retryCount: this.state.retryCount,
            error: this.state.error?.message || null,
        };
    }
    /**
     * 日志输出
     */
    log(message) {
        if (this.options.enableLogging) {
            console.log(`[InitializationManager] ${message}`);
        }
    }
    /**
     * 销毁管理器实例
     */
    destroy() {
        this.clearTimeout();
        this.initializationPromise = null;
        InitializationManager.instance = null;
    }
}
InitializationManager.instance = null;
// 导出默认实例
export const initializationManager = InitializationManager.getInstance();
//# sourceMappingURL=InitializationManager.js.map