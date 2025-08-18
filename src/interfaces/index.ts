/**
 * 接口层统一导出
 * @description 提供接口层所有模块的统一入口
 * @author 开发团队
 */

// 导出API接口
export * from './api';

// 导出类型定义，避免与API接口中同名成员冲突
export type { ProjectVersion, QueryParams } from './types';
export * from './types';

// 导出数据验证
export * from './schemas';

/**
 * 接口层版本信息
 */
export const INTERFACE_VERSION = '1.0.0';

/**
 * 接口层配置
 */
export interface InterfaceConfig {
  version: string;
  enableValidation: boolean;
  enableLogging: boolean;
  strictMode: boolean;
  cacheEnabled: boolean;
  cacheTimeout: number;
}

/**
 * 默认接口层配置
 */
export const DEFAULT_INTERFACE_CONFIG: InterfaceConfig = {
  version: INTERFACE_VERSION,
  enableValidation: true,
  enableLogging: true,
  strictMode: true,
  cacheEnabled: true,
  cacheTimeout: 300000, // 5分钟
};

/**
 * 接口层管理器
 */
export class InterfaceManager {
  private static instance: InterfaceManager | null = null;
  private config: InterfaceConfig;
  private initialized = false;

  private constructor(config: InterfaceConfig = DEFAULT_INTERFACE_CONFIG) {
    this.config = { ...config };
  }

  /**
   * 获取接口层管理器单例实例
   */
  public static getInstance(config?: InterfaceConfig): InterfaceManager {
    if (!InterfaceManager.instance) {
      InterfaceManager.instance = new InterfaceManager(config);
    }
    return InterfaceManager.instance;
  }

  /**
   * 初始化接口层
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.info('[interface-manager] 初始化接口层', {
      version: this.config.version,
      enableValidation: this.config.enableValidation,
      strictMode: this.config.strictMode,
    });

    // 初始化验证器工厂
    if (this.config.enableValidation) {
      const { validatorFactory } = await import('./schemas');
      
      // 注册常用验证器
      const canvasValidators = await import('./schemas/canvas');
      const projectValidators = await import('./schemas/project');
      const assetValidators = await import('./schemas/asset');

      validatorFactory.registerValidator('canvas', canvasValidators);
      validatorFactory.registerValidator('project', projectValidators);
      validatorFactory.registerValidator('asset', assetValidators);
    }

    this.initialized = true;
    console.info('[interface-manager] 接口层初始化完成');
  }

  /**
   * 获取配置
   */
  public getConfig(): InterfaceConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<InterfaceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('[interface-manager] 配置已更新', this.config);
  }

  /**
   * 检查是否已初始化
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 获取版本信息
   */
  public getVersion(): string {
    return this.config.version;
  }

  /**
   * 获取健康状态
   */
  public getHealthStatus() {
    return {
      initialized: this.initialized,
      version: this.config.version,
      config: this.config,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 导出接口层管理器实例
 */
export const interfaceManager = InterfaceManager.getInstance();