/**
 * React无限循环修复工具集
 * 集成InitializationManager、StateValidator和DebugLogger
 */

import { InitializationManager, initializationManager } from './InitializationManager';
import { StateValidator, stateValidator as defaultStateValidator, SuspiciousPattern } from './StateValidator';
import { DebugLogger, debugLogger as defaultDebugLogger } from './DebugLogger';

export { InitializationManager, initializationManager } from './InitializationManager';
export { StateValidator, stateValidator } from './StateValidator';
export { 
  DebugLogger, 
  debugLogger, 
  logComponent, 
  logStateUpdate, 
  logEffect, 
  logRender, 
  logInfiniteLoop 
} from './DebugLogger';

export type { InitializationState, InitializationOptions } from './InitializationManager';
export type { StateUpdate, SuspiciousPattern, StateValidationOptions } from './StateValidator';
export type { LogLevel, LogEntry, DebugLoggerOptions } from './DebugLogger';

/**
 * React无限循环修复工具集合
 * 提供统一的接口来使用所有修复工具
 */
export class ReactLoopFixToolkit {
  private static instance: ReactLoopFixToolkit | null = null;

  private constructor(
    public readonly initManager: InitializationManager = initializationManager,
    public readonly stateValidator: StateValidator = defaultStateValidator,
    public readonly debugLogger: DebugLogger = defaultDebugLogger
  ) {
    // 设置状态验证器的警告回调
    this.stateValidator.onWarning((pattern: SuspiciousPattern) => {
      this.debugLogger.warn(
        'state-validation',
        `检测到可疑状态更新模式: ${pattern.type}`,
        pattern
      );
    });
  }

  /**
   * 获取工具集实例
   */
  public static getInstance(): ReactLoopFixToolkit {
    if (!ReactLoopFixToolkit.instance) {
      ReactLoopFixToolkit.instance = new ReactLoopFixToolkit();
    }
    return ReactLoopFixToolkit.instance;
  }

  /**
   * 初始化应用（只执行一次）
   */
  public async initializeAppOnce(initFunction: () => Promise<void>): Promise<void> {
    this.debugLogger.info('app', '开始应用初始化...');
    
    try {
      await this.initManager.initializeOnce(initFunction);
      this.debugLogger.info('app', '应用初始化完成');
    } catch (error) {
      this.debugLogger.error('app', '应用初始化失败', error);
      throw error;
    }
  }

  /**
   * 验证状态更新
   */
  public validateStateUpdate(
    statePath: string,
    prevValue: any,
    nextValue: any,
    componentName?: string
  ): boolean {
    // 记录状态更新日志
    this.debugLogger.logStateUpdate(statePath, prevValue, nextValue, componentName);
    
    // 验证状态更新
    return this.stateValidator.validateStateUpdate(statePath, prevValue, nextValue, componentName);
  }

  /**
   * 记录组件渲染
   */
  public logComponentRender(
    componentName: string,
    renderCount: number,
    props?: any,
    reason?: string
  ): void {
    this.debugLogger.logRender(componentName, renderCount, props, reason);
  }

  /**
   * 记录useEffect执行
   */
  public logEffectExecution(
    componentName: string,
    effectName: string,
    dependencies: any[],
    action: 'mount' | 'update' | 'cleanup'
  ): void {
    this.debugLogger.logEffect(componentName, effectName, dependencies, action);
  }

  /**
   * 检测无限循环
   */
  public detectInfiniteLoop(): boolean {
    const detected = this.stateValidator.detectInfiniteLoop();
    this.debugLogger.logInfiniteLoopDetection(detected, {
      updateCount: this.stateValidator.getUpdateHistory().length,
    });
    return detected;
  }

  /**
   * 生成诊断报告
   */
  public generateDiagnosticReport(): {
    initialization: ReturnType<InitializationManager['getStats']>;
    stateValidation: ReturnType<StateValidator['generateReport']>;
    logging: ReturnType<DebugLogger['generateStats']>;
  } {
    return {
      initialization: this.initManager.getStats(),
      stateValidation: this.stateValidator.generateReport(),
      logging: this.debugLogger.generateStats(),
    };
  }

  /**
   * 清除所有历史数据
   */
  public clearAllHistory(): void {
    this.stateValidator.clearHistory();
    this.debugLogger.clearLogs();
    this.debugLogger.info('toolkit', '所有历史数据已清除');
  }

  /**
   * 重置所有工具
   */
  public resetAll(): void {
    this.initManager.reset();
    this.stateValidator.clearHistory();
    this.debugLogger.clearLogs();
    this.debugLogger.info('toolkit', '所有工具已重置');
  }

  /**
   * 销毁工具集
   */
  public destroy(): void {
    this.initManager.destroy();
    this.debugLogger.destroy();
    ReactLoopFixToolkit.instance = null;
  }
}

// 导出默认工具集实例
export const reactLoopFixToolkit = ReactLoopFixToolkit.getInstance();