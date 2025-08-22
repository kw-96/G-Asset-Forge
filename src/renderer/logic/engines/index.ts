/**
 * 引擎系统统一导出 - 画布引擎适配器系统
 * @description 导出所有引擎相关的接口、适配器和管理器
 * @author 开发团队
 */

// 核心接口和类型
export type {
  CanvasEngine,
  EngineType,
  EngineStatus,
  EngineConfig,
  EnginePerformanceStats,
  EngineEvent,
  EngineEventListener,
  ViewportTransform,
  RenderOptions,
  ExportOptions,
  EngineComparison,
  EngineSwitchOptions
} from './core/EngineInterface';

// 核心实现
export { EngineFactory } from './core/EngineFactory';

// 引擎适配器
export { SuikaEngineAdapter } from './adapters/SuikaEngineAdapter';
// export { H5EditorEngineAdapter } from './adapters/H5EditorEngineAdapter'; // 已移除H5-editor引擎

// 导入实例（用于内部使用）
import type { EngineConfig, EngineType, EngineSwitchOptions, EnginePerformanceStats, EngineComparison, CanvasEngine } from './core/EngineInterface';
import { engineFactory } from './core/EngineFactory';
import { engineManager } from './core/EngineManager';

/**
 * 引擎系统初始化
 * @description 初始化整个引擎系统
 */
export const initializeEngineSystem = async (
  container: HTMLElement,
  config: Partial<EngineConfig> = {}
): Promise<void> => {
  console.info('[engine-system] 开始初始化引擎系统');

  try {
    // 默认配置
    const defaultConfig: EngineConfig = {
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
      enableGPUAcceleration: true,
      maxTextureSize: 4096,
      targetFPS: 60,
      enableGrid: true,
      enableRulers: true,
      enableSnapping: false,
      enableDebugMode: false,
      showPerformanceStats: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // 初始化引擎管理器
    await engineManager.initialize(container, finalConfig);

    console.info('[engine-system] 引擎系统初始化完成', {
      currentEngine: engineManager.getCurrentEngineType(),
      registeredEngines: engineManager.getRegisteredEngines(),
    });

  } catch (error) {
    console.error('[engine-system] 引擎系统初始化失败:', error);
    throw error;
  }
};

/**
 * 销毁引擎系统
 * @description 清理所有引擎资源
 */
export const destroyEngineSystem = async (): Promise<void> => {
  console.info('[engine-system] 销毁引擎系统');

  try {
    await engineManager.destroy();
    console.info('[engine-system] 引擎系统销毁完成');
  } catch (error) {
    console.error('[engine-system] 引擎系统销毁失败:', error);
  }
};

/**
 * 获取当前引擎实例
 * @description 获取当前激活的引擎实例
 */
export const getCurrentEngine = (): CanvasEngine | null => {
  return engineManager.getCurrentEngine();
};

/**
 * 切换引擎
 * @description 切换到指定的引擎类型
 */
export const switchEngine = async (
  type: EngineType,
  options?: EngineSwitchOptions
): Promise<void> => {
  return engineManager.switchEngine(type, options);
};

/**
 * 获取引擎性能统计
 * @description 获取当前或指定引擎的性能统计信息
 */
export const getEnginePerformance = (type?: EngineType): EnginePerformanceStats => {
  return engineManager.getEnginePerformance(type);
};

/**
 * 推荐最佳引擎
 * @description 根据需求推荐最适合的引擎
 */
export const recommendEngine = (requirements: string[]): EngineType => {
  return engineManager.recommendEngine(requirements);
};

/**
 * 比较引擎性能
 * @description 比较多个引擎的性能和功能
 */
export const compareEngines = async (
  types: EngineType[]
): Promise<Record<EngineType, EngineComparison>> => {
  return engineManager.compareEngines(types);
};

/**
 * 检查引擎兼容性
 * @description 检查指定引擎与当前元素的兼容性
 */
export const checkEngineCompatibility = (
  type: EngineType,
  elements: any[]
): { compatible: boolean; issues: string[]; suggestions: string[] } => {
  return engineManager.checkCompatibility(type, elements);
};

/**
 * 获取引擎系统状态
 * @description 获取整个引擎系统的状态信息
 */
export const getEngineSystemStatus = () => {
  const managerStatus = engineManager.getStatus();
  const factoryStatus = engineFactory.getStatus(); 

  return {
    manager: managerStatus,
    factory: factoryStatus,
    currentEngine: {
      type: managerStatus.currentEngine,
      performance: managerStatus.currentEngine ? getEnginePerformance() : null,
    },
    summary: {
      isInitialized: managerStatus.isInitialized,
      totalEngines: managerStatus.totalEngines,
      availableEngines: factoryStatus.supportedEngines,
      currentEngine: managerStatus.currentEngine,
    },
  };
};

/**
 * 引擎系统健康检查
 * @description 检查引擎系统的健康状态
 */
export const checkEngineSystemHealth = async () => {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    const status = getEngineSystemStatus();

    // 检查初始化状态
    if (!status.manager.isInitialized) {
      issues.push('引擎管理器未初始化');
    }

    // 检查当前引擎
    if (!status.currentEngine.type) {
      issues.push('没有激活的引擎');
    } else {
      // 检查引擎性能
      const performance = status.currentEngine.performance;
      if (performance) {
        if (performance.fps < 30) {
          warnings.push(`引擎帧率过低: ${performance.fps} FPS`);
        }
        
        if (performance.memoryUsage > 100 * 1024 * 1024) { // 100MB
          warnings.push(`内存使用过高: ${(performance.memoryUsage / 1024 / 1024).toFixed(1)} MB`);
        }
      }
    }

    // 检查可用引擎
    if (status.summary.availableEngines.length === 0) {
      issues.push('没有可用的引擎');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      warnings,
      status,
    };

  } catch (error) {
    console.error('[engine-system] 健康检查失败:', error);
    return {
      isHealthy: false,
      issues: [`健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`],
      warnings: [],
      status: null,
    };
  }
};

/**
 * 引擎系统性能监控
 * @description 监控引擎系统的性能指标
 */
export const startEnginePerformanceMonitoring = () => {
  console.info('[engine-system] 启动性能监控');
  
  // 这里可以启动性能监控逻辑
  // 例如：定期收集性能数据、监控内存使用等
};

export const stopEnginePerformanceMonitoring = () => {
  console.info('[engine-system] 停止性能监控');
  
  // 这里可以停止性能监控逻辑
};

/**
 * 获取引擎系统信息
 * @description 获取引擎系统的详细信息
 */
export const getEngineSystemInfo = () => {
  return {
    version: '1.0.0',
    supportedEngines: engineFactory.getSupportedEngines(),
    defaultEngine: engineFactory.getDefaultEngine(),
    systemStatus: getEngineSystemStatus(),
  };
};

// 导出引擎系统实例
export { engineManager, engineFactory };