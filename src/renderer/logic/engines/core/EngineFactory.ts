/**
 * 引擎工厂 - 统一的引擎创建和管理工厂
 * @description 负责创建、配置和管理不同类型的画布引擎
 * @author 开发团队
 */

import type { 
  CanvasEngine, 
  EngineType, 
  EngineConfig 
} from './EngineInterface';
import { SuikaEngineAdapter } from '../adapters/SuikaEngineAdapter';
import { H5EditorEngineAdapter } from '../adapters/H5EditorEngineAdapter';

/**
 * 引擎信息接口
 */
interface EngineInfo {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  adapter: any;
  factory: () => Promise<CanvasEngine>;
}

/**
 * 引擎工厂类
 * @description 实现引擎的创建、注册和管理功能
 */
export class EngineFactory implements EngineFactory {
  private static instance: EngineFactory | null = null;
  private engines: Map<EngineType, EngineInfo> = new Map();
  private defaultEngine: EngineType = 'suika';

  private constructor() {
    this.registerBuiltinEngines();
  }

  /**
   * 获取引擎工厂单例实例
   */
  public static getInstance(): EngineFactory {
    if (!EngineFactory.instance) {
      EngineFactory.instance = new EngineFactory();
    }
    return EngineFactory.instance;
  }

  /**
   * 创建引擎实例
   */
  public async createEngine(
    type: EngineType, 
    _container: HTMLElement, 
    config: Partial<EngineConfig>
  ): Promise<CanvasEngine> {
    const engineInfo = this.engines.get(type);
    
    if (!engineInfo) {
      throw new Error(`不支持的引擎类型: ${type}`);
    }

    try {
      console.info(`[engine-factory] 创建引擎: ${engineInfo.name}`, { type });

      // 创建引擎实例
      const engine = await engineInfo.factory();

      // 初始化引擎（适配新的初始化签名）
      // 注意：container 参数在新接口中不再需要，但保留以保持兼容性
      await engine.initializeEngine(config);

      console.info(`[engine-factory] 引擎创建成功: ${engineInfo.name}`, { 
        type, 
        version: engine.version 
      });

      return engine;

    } catch (error) {
      console.error(`[engine-factory] 引擎创建失败: ${type}`, error);
      throw new Error(`创建引擎失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取支持的引擎类型
   */
  public getSupportedEngines(): EngineType[] {
    return Array.from(this.engines.keys());
  }

  /**
   * 获取引擎信息
   */
  public getEngineInfo(type: EngineType) {
    const engineInfo = this.engines.get(type);
    
    if (!engineInfo) {
      throw new Error(`引擎类型不存在: ${type}`);
    }

    return {
      name: engineInfo.name,
      version: engineInfo.version,
      description: engineInfo.description,
      capabilities: [...engineInfo.capabilities],
    };
  }

  /**
   * 注册引擎
   */
  public registerEngine(
    type: EngineType,
    info: Omit<EngineInfo, 'adapter'>,
    adapter?: any
  ): void {
    if (this.engines.has(type)) {
      console.warn(`[engine-factory] 引擎类型已存在，将被覆盖: ${type}`);
    }

    this.engines.set(type, {
      ...info,
      adapter,
    });

    console.info(`[engine-factory] 注册引擎: ${info.name}`, { type });
  }

  /**
   * 注销引擎
   */
  public unregisterEngine(type: EngineType): void {
    if (!this.engines.has(type)) {
      console.warn(`[engine-factory] 尝试注销不存在的引擎: ${type}`);
      return;
    }

    this.engines.delete(type);
    
    console.info(`[engine-factory] 注销引擎: ${type}`);
  }

  /**
   * 设置默认引擎
   */
  public setDefaultEngine(type: EngineType): void {
    if (!this.engines.has(type)) {
      throw new Error(`引擎类型不存在: ${type}`);
    }

    this.defaultEngine = type;
    
    console.info(`[engine-factory] 设置默认引擎: ${type}`);
  }

  /**
   * 获取默认引擎类型
   */
  public getDefaultEngine(): EngineType {
    return this.defaultEngine;
  }

  /**
   * 创建默认引擎
   */
  public async createDefaultEngine(
    container: HTMLElement, 
    config: Partial<EngineConfig>
  ): Promise<CanvasEngine> {
    return this.createEngine(this.defaultEngine, container, config);
  }

  /**
   * 检查引擎是否可用
   */
  public async isEngineAvailable(type: EngineType): Promise<boolean> {
    const engineInfo = this.engines.get(type);
    
    if (!engineInfo) {
      return false;
    }

    try {
      // 尝试创建一个临时实例来检查可用性
      const tempContainer = document.createElement('div');
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);

      const engine = await engineInfo.factory();
      await engine.initializeEngine({ width: 100, height: 100 });
      await engine.destroy();

      document.body.removeChild(tempContainer);

      return true;

    } catch (error) {
      console.warn(`[engine-factory] 引擎不可用: ${type}`, error);
      return false;
    }
  }

  /**
   * 获取引擎兼容性信息
   */
  public getEngineCompatibility(type: EngineType): {
    webgl: boolean;
    canvas2d: boolean;
    webgpu: boolean;
    offscreenCanvas: boolean;
    workers: boolean;
  } {
    const engineInfo = this.engines.get(type);
    
    if (!engineInfo) {
      throw new Error(`引擎类型不存在: ${type}`);
    }

    // 基于引擎类型返回兼容性信息
    switch (type) {
      case 'suika':
        return {
          webgl: true,
          canvas2d: true,
          webgpu: false,
          offscreenCanvas: true,
          workers: true,
        };
      
      case 'h5-editor':
        return {
          webgl: false,
          canvas2d: true,
          webgpu: false,
          offscreenCanvas: false,
          workers: false,
        };
      
      default:
        return {
          webgl: false,
          canvas2d: true,
          webgpu: false,
          offscreenCanvas: false,
          workers: false,
        };
    }
  }

  /**
   * 推荐最佳引擎
   */
  public recommendEngine(requirements: {
    performance?: 'low' | 'medium' | 'high';
    features?: string[];
    compatibility?: string[];
  }): EngineType {
    const availableEngines = this.getSupportedEngines();
    
    // 简单的推荐逻辑
    if (requirements.performance === 'high') {
      if (availableEngines.includes('suika')) {
        return 'suika';
      }
    }
    
    if (requirements.features?.includes('export')) {
      if (availableEngines.includes('h5-editor')) {
        return 'h5-editor';
      }
    }

    // 返回默认引擎
    return this.defaultEngine;
  }

  /**
   * 获取引擎性能基准
   */
  public async benchmarkEngine(type: EngineType): Promise<{
    initTime: number;
    renderTime: number;
    memoryUsage: number;
    score: number;
  }> {
    const engineInfo = this.engines.get(type);
    
    if (!engineInfo) {
      throw new Error(`引擎类型不存在: ${type}`);
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    try {
      // 测试初始化时间
      const initStart = performance.now();
      const engine = await engineInfo.factory();
      await engine.initializeEngine({ width: 800, height: 600 });
      const initTime = performance.now() - initStart;

      // 测试渲染时间
      const renderStart = performance.now();
      await engine.render();
      const renderTime = performance.now() - renderStart;

      // 获取内存使用情况
      const stats = engine.getPerformanceStats();
      const memoryUsage = stats.memoryUsage;

      // 计算综合得分
      const score = Math.max(0, 100 - (initTime / 10) - (renderTime / 5) - (memoryUsage / 1000000));

      await engine.destroy();

      return {
        initTime,
        renderTime,
        memoryUsage,
        score,
      };

    } finally {
      document.body.removeChild(tempContainer);
    }
  }

  /**
   * 注册内置引擎
   */
  private registerBuiltinEngines(): void {
    // 注册 Suika 引擎
    this.registerEngine('suika', {
      name: 'Suika Canvas Engine',
      version: '1.0.0',
      description: '高性能的2D画布引擎，基于WebGL渲染',
      capabilities: [
        'high-performance',
        'webgl-rendering',
        'gpu-acceleration',
        'vector-graphics',
        'text-rendering',
        'image-processing',
        'animation',
        'layers',
        'selection',
        'transformation',
        'export-png',
        'export-jpg',
        'export-svg',
      ],
      factory: async () => {
        const adapter = new SuikaEngineAdapter();
        return adapter as unknown as CanvasEngine;
      },
    }, SuikaEngineAdapter);

    // 注册 H5-Editor 引擎
    this.registerEngine('h5-editor', {
      name: 'H5-Editor Canvas Engine',
      version: '1.0.0',
      description: '专业的H5编辑器引擎，支持复杂布局和导出',
      capabilities: [
        'layout-engine',
        'professional-export',
        'template-system',
        'component-library',
        'responsive-design',
        'css-styling',
        'html-export',
        'pdf-export',
        'print-optimization',
      ],
      factory: async () => {
        const adapter = new H5EditorEngineAdapter();
        return adapter as unknown as CanvasEngine;
      },
    }, H5EditorEngineAdapter);

    console.info('[engine-factory] 内置引擎注册完成', {
      engines: this.getSupportedEngines(),
      default: this.defaultEngine,
    });
  }

  /**
   * 获取工厂状态
   */
  public getStatus() {
    const engines = Array.from(this.engines.entries()).map(([type, info]) => ({
      type,
      name: info.name,
      version: info.version,
      capabilities: info.capabilities.length,
    }));

    return {
      supportedEngines: this.getSupportedEngines(),
      defaultEngine: this.defaultEngine,
      registeredEngines: engines,
      totalEngines: this.engines.size,
    };
  }
}

// 导出单例实例
export const engineFactory = EngineFactory.getInstance();