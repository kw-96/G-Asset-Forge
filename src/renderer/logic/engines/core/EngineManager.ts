/**
 * 引擎管理器 - 统一管理多个画布引擎
 * @description 负责引擎的注册、切换、比较和性能监控
 * @author 开发团队
 */

import type { 
  CanvasEngine, 
  EngineType, 
  EngineConfig,
  EnginePerformanceStats,
  EngineComparison,
  EngineSwitchOptions
} from './EngineInterface';
import type { CanvasElement } from '../../../../interfaces/types/canvas';
import { engineFactory } from './EngineFactory';

/**
 * 引擎注册信息接口
 */
interface EngineRegistration {
  factory: () => Promise<CanvasEngine>;
  metadata: {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    priority: number;
  };
}

/**
 * 引擎管理器类
 * @description 实现多引擎的统一管理和切换功能
 */
export class EngineManager {
  private static instance: EngineManager | null = null;
  private registeredEngines: Map<EngineType, EngineRegistration> = new Map();
  private currentEngine: CanvasEngine | null = null;
  private currentEngineType: EngineType | null = null;
  private container: HTMLElement | null = null;
  private config: EngineConfig | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取引擎管理器单例实例
   */
  public static getInstance(): EngineManager {
    if (!EngineManager.instance) {
      EngineManager.instance = new EngineManager();
    }
    return EngineManager.instance;
  }

  /**
   * 初始化引擎管理器
   */
  public async initialize(container: HTMLElement, config: EngineConfig): Promise<void> {
    if (this.isInitialized) {
      console.warn('[engine-manager] 引擎管理器已经初始化');
      return;
    }

    try {
      console.info('[engine-manager] 开始初始化引擎管理器');

      this.container = container;
      this.config = config;

      // 注册内置引擎
      await this.registerBuiltinEngines();

      // 创建默认引擎
      const defaultEngineType = engineFactory.getDefaultEngine();
      await this.switchEngine(defaultEngineType);

      this.isInitialized = true;

      console.info('[engine-manager] 引擎管理器初始化完成', {
        defaultEngine: defaultEngineType,
        registeredEngines: Array.from(this.registeredEngines.keys()),
      });

    } catch (error) {
      console.error('[engine-manager] 引擎管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 销毁引擎管理器
   */
  public async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      console.info('[engine-manager] 销毁引擎管理器');

      // 销毁当前引擎
      if (this.currentEngine) {
        await this.currentEngine.destroy();
        this.currentEngine = null;
        this.currentEngineType = null;
      }

      // 清理注册信息
      this.registeredEngines.clear();
      this.container = null;
      this.config = null;
      this.isInitialized = false;

      console.info('[engine-manager] 引擎管理器销毁完成');

    } catch (error) {
      console.error('[engine-manager] 引擎管理器销毁失败:', error);
    }
  }

  // 引擎管理
  public registerEngine(type: EngineType, factory: () => Promise<CanvasEngine>): void {
    if (this.registeredEngines.has(type)) {
      console.warn(`[engine-manager] 引擎类型已存在，将被覆盖: ${type}`);
    }

    // 获取引擎信息
    const engineInfo = engineFactory.getEngineInfo(type);

    this.registeredEngines.set(type, {
      factory,
      metadata: {
        name: engineInfo.name,
        version: engineInfo.version,
        description: engineInfo.description,
        capabilities: engineInfo.capabilities,
        priority: this.getEnginePriority(type),
      },
    });

    console.info(`[engine-manager] 注册引擎: ${engineInfo.name}`, { type });
  }

  public unregisterEngine(type: EngineType): void {
    if (!this.registeredEngines.has(type)) {
      console.warn(`[engine-manager] 尝试注销不存在的引擎: ${type}`);
      return;
    }

    // 如果是当前引擎，需要先切换
    if (this.currentEngineType === type) {
      console.warn(`[engine-manager] 不能注销当前正在使用的引擎: ${type}`);
      return;
    }

    this.registeredEngines.delete(type);
    console.info(`[engine-manager] 注销引擎: ${type}`);
  }

  // 引擎切换
  public async switchEngine(type: EngineType, options: Partial<EngineSwitchOptions> = {}): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('引擎管理器未初始化');
    }

    if (!this.registeredEngines.has(type)) {
      throw new Error(`引擎类型未注册: ${type}`);
    }

    if (this.currentEngineType === type) {
      console.info(`[engine-manager] 引擎已经是 ${type}，无需切换`);
      return;
    }

    const switchOptions: EngineSwitchOptions = {
      preserveState: true,
      migrateElements: true,
      validateCompatibility: true,
      fallbackOnError: true,
      ...options,
    };

    try {
      console.info(`[engine-manager] 开始切换引擎: ${this.currentEngineType} -> ${type}`);

      // 保存当前状态
      let currentState: any = null;
      if (this.currentEngine && switchOptions.preserveState) {
        currentState = this.currentEngine.serialize();
      }

      // 兼容性检查
      if (switchOptions.validateCompatibility && currentState) {
        const compatibility = this.checkCompatibility(type, currentState.elements || []);
        if (!compatibility.compatible) {
          console.warn('[engine-manager] 兼容性检查失败:', compatibility.issues);
          if (!switchOptions.fallbackOnError) {
            throw new Error(`引擎兼容性检查失败: ${compatibility.issues.join(', ')}`);
          }
        }
      }

      // 销毁当前引擎
      if (this.currentEngine) {
        await this.currentEngine.destroy();
      }

      // 创建新引擎
      const registration = this.registeredEngines.get(type)!;
      const newEngine = await registration.factory();

      // 初始化新引擎
      if (!this.container || !this.config) {
        throw new Error('容器或配置未设置');
      }

      await newEngine.initializeEngine(this.config);

      // 迁移状态
      if (currentState && switchOptions.migrateElements) {
        try {
          await newEngine.deserialize(currentState);
          console.info('[engine-manager] 状态迁移完成');
        } catch (error) {
          console.warn('[engine-manager] 状态迁移失败:', error);
          if (!switchOptions.fallbackOnError) {
            throw error;
          }
        }
      }

      // 更新当前引擎
      this.currentEngine = newEngine;
      this.currentEngineType = type;

      console.info(`[engine-manager] 引擎切换完成: ${type}`);

    } catch (error) {
      console.error(`[engine-manager] 引擎切换失败: ${type}`, error);

      // 回退处理
      if (switchOptions.fallbackOnError && this.currentEngineType) {
        console.info('[engine-manager] 尝试回退到原引擎');
        try {
          // 这里可以实现回退逻辑
        } catch (fallbackError) {
          console.error('[engine-manager] 回退失败:', fallbackError);
        }
      }

      throw error;
    }
  }

  public getCurrentEngine(): CanvasEngine | null {
    return this.currentEngine;
  }

  public getCurrentEngineType(): EngineType | null {
    return this.currentEngineType;
  }

  // 引擎比较
  public async compareEngines(types: EngineType[]): Promise<Record<EngineType, EngineComparison>> {
    const results: Record<EngineType, EngineComparison> = {} as any;

    for (const type of types) {
      if (!this.registeredEngines.has(type)) {
        console.warn(`[engine-manager] 跳过未注册的引擎: ${type}`);
        continue;
      }

      try {
        const comparison = await this.benchmarkEngine(type);
        results[type] = comparison;
      } catch (error) {
        console.error(`[engine-manager] 引擎比较失败: ${type}`, error);
        results[type] = {
          performance: { renderSpeed: 0, memoryUsage: Infinity, startupTime: Infinity },
          features: { supported: [], missing: [], experimental: [] },
          compatibility: { score: 0, issues: [`比较失败: ${error}`], recommendations: [] },
        };
      }
    }

    return results;
  }

  public recommendEngine(requirements: string[]): EngineType {
    const availableEngines = Array.from(this.registeredEngines.keys());
    
    // 简单的推荐算法
    let bestEngine: EngineType | null = null;
    let bestScore = -1;

    for (const engineType of availableEngines) {
      const registration = this.registeredEngines.get(engineType)!;
      const capabilities = registration.metadata.capabilities;
      
      // 计算匹配分数
      const matchedRequirements = requirements.filter(req => capabilities.includes(req));
      const score = matchedRequirements.length / requirements.length * 100 + registration.metadata.priority;

      if (score > bestScore) {
        bestScore = score;
        bestEngine = engineType;
      }
    }

    return bestEngine || engineFactory.getDefaultEngine();
  }

  // 性能监控
  public getEnginePerformance(type?: EngineType): EnginePerformanceStats {
    const targetEngine = type ? 
      (this.currentEngineType === type ? this.currentEngine : null) : 
      this.currentEngine;

    if (!targetEngine) {
      return {
        fps: 0,
        frameTime: 0,
        memoryUsage: 0,
        drawCalls: 0,
        triangleCount: 0,
        textureCount: 0,
        lastUpdateTime: Date.now(),
      };
    }

    return targetEngine.getPerformanceStats();
  }

  public async benchmarkEngine(type: EngineType): Promise<EngineComparison> {
    if (!this.registeredEngines.has(type)) {
      throw new Error(`引擎类型未注册: ${type}`);
    }

    try {
      // 使用工厂进行基准测试
      const benchmark = await engineFactory.benchmarkEngine(type);
      const registration = this.registeredEngines.get(type)!;
      const capabilities = registration.metadata.capabilities;

      return {
        performance: {
          renderSpeed: 100 - benchmark.renderTime, // 转换为分数
          memoryUsage: benchmark.memoryUsage,
          startupTime: benchmark.initTime,
        },
        features: {
          supported: capabilities,
          missing: [],
          experimental: [],
        },
        compatibility: {
          score: benchmark.score,
          issues: [],
          recommendations: [],
        },
      };

    } catch (error) {
      throw new Error(`引擎基准测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 兼容性检查
  public checkCompatibility(type: EngineType, elements: CanvasElement[]): {
    compatible: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const registration = this.registeredEngines.get(type);
    
    if (!registration) {
      return {
        compatible: false,
        issues: [`引擎类型未注册: ${type}`],
        suggestions: [],
      };
    }

    const capabilities = registration.metadata.capabilities;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查元素类型兼容性（兼容较低 target）
    const elementTypes = Array.from(new Set(elements.map(el => el.type)));
    
    for (const elementType of elementTypes) {
      const requiredCapability = this.getRequiredCapability(elementType);
      if (requiredCapability && !capabilities.includes(requiredCapability)) {
        issues.push(`不支持元素类型: ${elementType}`);
        suggestions.push(`考虑转换 ${elementType} 元素为支持的类型`);
      }
    }

    // 检查特殊功能
    // NOTE: 由于 CanvasElement/TextElement 类型未必有 borderRadius，需类型判断
    const hasComplexElements = elements.some(el => {
      // 检查透明度
      if (typeof el.opacity === 'number' && el.opacity < 1) {
        return true;
      }
      // 检查描边宽度
      if (el.stroke && typeof el.stroke.width === 'number' && el.stroke.width > 0) {
        return true;
      }
      // 检查圆角，仅在存在 borderRadius 属性时判断
      // @ts-expect-error: 某些元素可能有 borderRadius
      if (el.borderRadius && typeof el.borderRadius === 'object') {
        // @ts-expect-error: 兼容不同元素的 borderRadius 结构
        if (el.borderRadius.topLeft || el.borderRadius.topRight || el.borderRadius.bottomLeft || el.borderRadius.bottomRight) {
          return true;
        }
      }
      return false;
    });

    if (hasComplexElements && !capabilities.includes('advanced-styling')) {
      issues.push('包含复杂样式的元素可能显示不正确');
      suggestions.push('简化元素样式以提高兼容性');
    }

    return {
      compatible: issues.length === 0,
      issues,
      suggestions,
    };
  }

  /**
   * 获取已注册的引擎列表
   */
  public getRegisteredEngines(): EngineType[] {
    return Array.from(this.registeredEngines.keys());
  }

  /**
   * 获取引擎元数据
   */
  public getEngineMetadata(type: EngineType) {
    const registration = this.registeredEngines.get(type);
    return registration ? { ...registration.metadata } : null;
  }

  /**
   * 检查引擎是否可用
   */
  public async isEngineAvailable(type: EngineType): Promise<boolean> {
    if (!this.registeredEngines.has(type)) {
      return false;
    }

    try {
      return await engineFactory.isEngineAvailable(type);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取管理器状态
   */
  public getStatus() {
    const registeredEngines = Array.from(this.registeredEngines.entries()).map(([type, reg]) => ({
      type,
      name: reg.metadata.name,
      version: reg.metadata.version,
      capabilities: reg.metadata.capabilities.length,
      priority: reg.metadata.priority,
    }));

    return {
      isInitialized: this.isInitialized,
      currentEngine: this.currentEngineType,
      registeredEngines,
      totalEngines: this.registeredEngines.size,
      hasContainer: !!this.container,
      hasConfig: !!this.config,
    };
  }

  // 私有方法
  private async registerBuiltinEngines(): Promise<void> {
    const supportedEngines = engineFactory.getSupportedEngines();

    for (const engineType of supportedEngines) {
      this.registerEngine(engineType, async () => {
        if (!this.container || !this.config) {
          throw new Error('容器或配置未设置');
        }
        return await engineFactory.createEngine(engineType, this.container, this.config);
      });
    }

    console.info('[engine-manager] 内置引擎注册完成', { 
      engines: supportedEngines 
    });
  }

  private getEnginePriority(type: EngineType): number {
    // 引擎优先级设置
    const priorities: Record<EngineType, number> = {
      'suika': 10,      // 高性能引擎，优先级最高
      // 'h5-editor': 8,   // 专业导出引擎 - 已移除
      'custom': 5,      // 自定义引擎
    };

    return priorities[type] || 0;
  }

  private getRequiredCapability(elementType: string): string | null {
    const capabilityMap: Record<string, string> = {
      'text': 'text-rendering',
      'image': 'image-processing',
      'shape': 'vector-graphics',
      'rectangle': 'vector-graphics',
      'circle': 'vector-graphics',
    };

    return capabilityMap[elementType] || null;
  }
}

// 导出单例实例
export const engineManager = EngineManager.getInstance();