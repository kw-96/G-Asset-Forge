/**
 * React无限循环修复工具集
 * 集成InitializationManager、StateValidator和DebugLogger
 */
import { InitializationManager } from './InitializationManager';
import { StateValidator } from './StateValidator';
import { DebugLogger } from './DebugLogger';
export { InitializationManager, initializationManager } from './InitializationManager';
export { StateValidator, stateValidator } from './StateValidator';
export { DebugLogger, debugLogger, logComponent, logStateUpdate, logEffect, logRender, logInfiniteLoop } from './DebugLogger';
export type { InitializationState, InitializationOptions } from './InitializationManager';
export type { StateUpdate, SuspiciousPattern, StateValidationOptions } from './StateValidator';
export type { LogLevel, LogEntry, DebugLoggerOptions } from './DebugLogger';
/**
 * React无限循环修复工具集合
 * 提供统一的接口来使用所有修复工具
 */
export declare class ReactLoopFixToolkit {
    readonly initManager: InitializationManager;
    readonly stateValidator: StateValidator;
    readonly debugLogger: DebugLogger;
    private static instance;
    private constructor();
    /**
     * 获取工具集实例
     */
    static getInstance(): ReactLoopFixToolkit;
    /**
     * 初始化应用（只执行一次）
     */
    initializeAppOnce(initFunction: () => Promise<void>): Promise<void>;
    /**
     * 验证状态更新
     */
    validateStateUpdate(statePath: string, prevValue: any, nextValue: any, componentName?: string): boolean;
    /**
     * 记录组件渲染
     */
    logComponentRender(componentName: string, renderCount: number, props?: any, reason?: string): void;
    /**
     * 记录useEffect执行
     */
    logEffectExecution(componentName: string, effectName: string, dependencies: any[], action: 'mount' | 'update' | 'cleanup'): void;
    /**
     * 检测无限循环
     */
    detectInfiniteLoop(): boolean;
    /**
     * 生成诊断报告
     */
    generateDiagnosticReport(): {
        initialization: ReturnType<InitializationManager['getStats']>;
        stateValidation: ReturnType<StateValidator['generateReport']>;
        logging: ReturnType<DebugLogger['generateStats']>;
    };
    /**
     * 清除所有历史数据
     */
    clearAllHistory(): void;
    /**
     * 重置所有工具
     */
    resetAll(): void;
    /**
     * 销毁工具集
     */
    destroy(): void;
}
export declare const reactLoopFixToolkit: ReactLoopFixToolkit;
//# sourceMappingURL=ReactLoopFix.d.ts.map