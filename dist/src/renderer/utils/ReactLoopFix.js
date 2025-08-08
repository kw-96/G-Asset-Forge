/**
 * React无限循环修复工具集
 * 集成InitializationManager、StateValidator和DebugLogger
 */
import { initializationManager } from './InitializationManager';
import { stateValidator as defaultStateValidator } from './StateValidator';
import { debugLogger as defaultDebugLogger } from './DebugLogger';
export { InitializationManager, initializationManager } from './InitializationManager';
export { StateValidator, stateValidator } from './StateValidator';
export { DebugLogger, debugLogger, logComponent, logStateUpdate, logEffect, logRender, logInfiniteLoop } from './DebugLogger';
/**
 * React无限循环修复工具集合
 * 提供统一的接口来使用所有修复工具
 */
export class ReactLoopFixToolkit {
    constructor(initManager = initializationManager, stateValidator = defaultStateValidator, debugLogger = defaultDebugLogger) {
        this.initManager = initManager;
        this.stateValidator = stateValidator;
        this.debugLogger = debugLogger;
        // 设置状态验证器的警告回调
        this.stateValidator.onWarning((pattern) => {
            this.debugLogger.warn('state-validation', `检测到可疑状态更新模式: ${pattern.type}`, pattern);
        });
    }
    /**
     * 获取工具集实例
     */
    static getInstance() {
        if (!ReactLoopFixToolkit.instance) {
            ReactLoopFixToolkit.instance = new ReactLoopFixToolkit();
        }
        return ReactLoopFixToolkit.instance;
    }
    /**
     * 初始化应用（只执行一次）
     */
    async initializeAppOnce(initFunction) {
        this.debugLogger.info('app', '开始应用初始化...');
        try {
            await this.initManager.initializeOnce(initFunction);
            this.debugLogger.info('app', '应用初始化完成');
        }
        catch (error) {
            this.debugLogger.error('app', '应用初始化失败', error);
            throw error;
        }
    }
    /**
     * 验证状态更新
     */
    validateStateUpdate(statePath, prevValue, nextValue, componentName) {
        // 记录状态更新日志
        this.debugLogger.logStateUpdate(statePath, prevValue, nextValue, componentName);
        // 验证状态更新
        return this.stateValidator.validateStateUpdate(statePath, prevValue, nextValue, componentName);
    }
    /**
     * 记录组件渲染
     */
    logComponentRender(componentName, renderCount, props, reason) {
        this.debugLogger.logRender(componentName, renderCount, props, reason);
    }
    /**
     * 记录useEffect执行
     */
    logEffectExecution(componentName, effectName, dependencies, action) {
        this.debugLogger.logEffect(componentName, effectName, dependencies, action);
    }
    /**
     * 检测无限循环
     */
    detectInfiniteLoop() {
        const detected = this.stateValidator.detectInfiniteLoop();
        this.debugLogger.logInfiniteLoopDetection(detected, {
            updateCount: this.stateValidator.getUpdateHistory().length,
        });
        return detected;
    }
    /**
     * 生成诊断报告
     */
    generateDiagnosticReport() {
        return {
            initialization: this.initManager.getStats(),
            stateValidation: this.stateValidator.generateReport(),
            logging: this.debugLogger.generateStats(),
        };
    }
    /**
     * 清除所有历史数据
     */
    clearAllHistory() {
        this.stateValidator.clearHistory();
        this.debugLogger.clearLogs();
        this.debugLogger.info('toolkit', '所有历史数据已清除');
    }
    /**
     * 重置所有工具
     */
    resetAll() {
        this.initManager.reset();
        this.stateValidator.clearHistory();
        this.debugLogger.clearLogs();
        this.debugLogger.info('toolkit', '所有工具已重置');
    }
    /**
     * 销毁工具集
     */
    destroy() {
        this.initManager.destroy();
        this.debugLogger.destroy();
        ReactLoopFixToolkit.instance = null;
    }
}
ReactLoopFixToolkit.instance = null;
// 导出默认工具集实例
export const reactLoopFixToolkit = ReactLoopFixToolkit.getInstance();
//# sourceMappingURL=ReactLoopFix.js.map