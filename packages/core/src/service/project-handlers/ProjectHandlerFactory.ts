/**
 * 项目处理器工厂类
 * 负责创建和管理不同类型的项目处理器实例
 */

import { ProjectType } from '../ProjectTypeManager';
import { DesignProjectHandler } from './DesignProjectHandler';
import { H5ProjectHandler } from './H5ProjectHandler';
import type { IProjectHandler } from './ProjectHandler';

/**
 * 项目处理器工厂配置
 */
export interface ProjectHandlerFactoryConfig {
  enableCache?: boolean; // 是否启用处理器缓存
  maxCacheSize?: number; // 最大缓存数量
  autoCleanup?: boolean; // 是否自动清理未使用的处理器
}

/**
 * 项目处理器注册信息
 */
interface ProjectHandlerRegistration {
  type: ProjectType;
  handlerClass: new () => IProjectHandler;
  instance?: IProjectHandler;
  lastUsed?: Date;
}

/**
 * 项目处理器工厂类
 * 提供项目处理器的创建、管理和生命周期控制
 */
export class ProjectHandlerFactory {
  private static instance: ProjectHandlerFactory | null = null;
  private handlerRegistry = new Map<ProjectType, ProjectHandlerRegistration>();
  private activeHandlers = new Map<string, IProjectHandler>();
  private config: ProjectHandlerFactoryConfig;

  constructor(config: ProjectHandlerFactoryConfig = {}) {
    this.config = {
      enableCache: true,
      maxCacheSize: 10,
      autoCleanup: true,
      ...config,
    };

    this.registerDefaultHandlers();
  }

  /**
   * 获取工厂单例实例
   */
  static getInstance(
    config?: ProjectHandlerFactoryConfig,
  ): ProjectHandlerFactory {
    if (!ProjectHandlerFactory.instance) {
      ProjectHandlerFactory.instance = new ProjectHandlerFactory(config);
    }
    return ProjectHandlerFactory.instance;
  }

  /**
   * 注册项目处理器
   */
  registerHandler(
    type: ProjectType,
    handlerClass: new () => IProjectHandler,
  ): void {
    this.handlerRegistry.set(type, {
      type,
      handlerClass,
    });
  }

  /**
   * 创建项目处理器
   */
  async createHandler(
    type: ProjectType,
    projectId?: string,
  ): Promise<IProjectHandler> {
    const cacheKey = projectId || `default_${type}`;

    // 如果启用缓存且存在活跃的处理器，检查状态后返回
    if (this.config.enableCache && this.activeHandlers.has(cacheKey)) {
      const handler = this.activeHandlers.get(cacheKey)!;
      // 检查处理器是否已被销毁，如果是则重新创建
      if (handler.getState() === 'destroyed') {
        console.log(`处理器已销毁，重新创建: ${type} (${cacheKey})`);
        this.activeHandlers.delete(cacheKey);
      } else {
        this.updateHandlerUsage(type);
        return handler;
      }
    }

    // 获取处理器注册信息
    const registration = this.handlerRegistry.get(type);
    if (!registration) {
      throw new Error(`未找到项目类型 ${type} 的处理器`);
    }

    // 创建新的处理器实例
    const handler = new registration.handlerClass();

    // 如果启用缓存，将处理器添加到活跃列表
    if (this.config.enableCache) {
      this.activeHandlers.set(cacheKey, handler);
      this.updateHandlerUsage(type);

      // 检查缓存大小限制
      await this.enforceMaxCacheSize();
    }

    console.log(`项目处理器已创建: ${type} (${cacheKey})`);
    return handler;
  }

  /**
   * 获取处理器（不创建新实例）
   */
  getHandler(type: ProjectType, projectId?: string): IProjectHandler | null {
    const cacheKey = projectId || `default_${type}`;
    return this.activeHandlers.get(cacheKey) || null;
  }

  /**
   * 销毁项目处理器
   */
  async destroyHandler(type: ProjectType, projectId?: string): Promise<void> {
    const cacheKey = projectId || `default_${type}`;
    const handler = this.activeHandlers.get(cacheKey);

    if (handler) {
      try {
        await handler.destroy();
        this.activeHandlers.delete(cacheKey);
        console.log(`项目处理器已销毁: ${type} (${cacheKey})`);
      } catch (error) {
        console.error(`销毁项目处理器失败: ${type} (${cacheKey})`, error);
        throw error;
      }
    }
  }

  /**
   * 销毁所有处理器
   */
  async destroyAllHandlers(): Promise<void> {
    const destroyPromises: Promise<void>[] = [];

    for (const [cacheKey, handler] of this.activeHandlers) {
      destroyPromises.push(
        handler.destroy().catch((error) => {
          console.error(`销毁处理器失败 (${cacheKey}):`, error);
        }),
      );
    }

    await Promise.all(destroyPromises);
    this.activeHandlers.clear();

    console.log('所有项目处理器已销毁');
  }

  /**
   * 获取支持的项目类型列表
   */
  getSupportedTypes(): ProjectType[] {
    return Array.from(this.handlerRegistry.keys());
  }

  /**
   * 检查是否支持指定项目类型
   */
  isTypeSupported(type: ProjectType): boolean {
    return this.handlerRegistry.has(type);
  }

  /**
   * 获取活跃处理器统计信息
   */
  getActiveHandlerStats(): {
    totalActive: number;
    byType: Record<ProjectType, number>;
    cacheEnabled: boolean;
    maxCacheSize: number;
  } {
    const byType: Record<ProjectType, number> = {} as any;

    // 初始化计数器
    for (const type of this.getSupportedTypes()) {
      byType[type] = 0;
    }

    // 统计活跃处理器
    for (const handler of this.activeHandlers.values()) {
      const type = handler.getSupportedProjectType();
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      totalActive: this.activeHandlers.size,
      byType,
      cacheEnabled: this.config.enableCache || false,
      maxCacheSize: this.config.maxCacheSize || 0,
    };
  }

  /**
   * 清理未使用的处理器
   */
  async cleanupUnusedHandlers(maxAge: number = 30 * 60 * 1000): Promise<void> {
    if (!this.config.autoCleanup) {
      return;
    }

    const now = new Date();
    const handlersToDestroy: string[] = [];

    // 查找超过最大年龄的处理器
    for (const [type, registration] of this.handlerRegistry) {
      if (registration.lastUsed) {
        const age = now.getTime() - registration.lastUsed.getTime();
        if (age > maxAge) {
          // 查找对应的活跃处理器
          for (const [cacheKey, handler] of this.activeHandlers) {
            if (handler.getSupportedProjectType() === type) {
              handlersToDestroy.push(cacheKey);
            }
          }
        }
      }
    }

    // 销毁未使用的处理器
    for (const cacheKey of handlersToDestroy) {
      const handler = this.activeHandlers.get(cacheKey);
      if (handler) {
        try {
          await handler.destroy();
          this.activeHandlers.delete(cacheKey);
          console.log(`已清理未使用的处理器: ${cacheKey}`);
        } catch (error) {
          console.error(`清理处理器失败: ${cacheKey}`, error);
        }
      }
    }
  }

  /**
   * 注册默认处理器
   */
  private registerDefaultHandlers(): void {
    this.registerHandler(ProjectType.DESIGN, DesignProjectHandler);
    this.registerHandler(ProjectType.H5, H5ProjectHandler);
  }

  /**
   * 更新处理器使用时间
   */
  private updateHandlerUsage(type: ProjectType): void {
    const registration = this.handlerRegistry.get(type);
    if (registration) {
      registration.lastUsed = new Date();
    }
  }

  /**
   * 强制执行最大缓存大小限制
   */
  private async enforceMaxCacheSize(): Promise<void> {
    if (
      !this.config.maxCacheSize ||
      this.activeHandlers.size <= this.config.maxCacheSize
    ) {
      return;
    }

    // 按最后使用时间排序，移除最旧的处理器
    const handlerEntries = Array.from(this.activeHandlers.entries());
    const sortedEntries = handlerEntries.sort((a, b) => {
      const aType = a[1].getSupportedProjectType();
      const bType = b[1].getSupportedProjectType();
      const aLastUsed =
        this.handlerRegistry.get(aType)?.lastUsed?.getTime() || 0;
      const bLastUsed =
        this.handlerRegistry.get(bType)?.lastUsed?.getTime() || 0;
      return aLastUsed - bLastUsed;
    });

    // 移除超出限制的处理器
    const toRemove = sortedEntries.slice(
      0,
      this.activeHandlers.size - this.config.maxCacheSize,
    );

    for (const [cacheKey, handler] of toRemove) {
      try {
        await handler.destroy();
        this.activeHandlers.delete(cacheKey);
        console.log(`缓存限制清理处理器: ${cacheKey}`);
      } catch (error) {
        console.error(`缓存清理失败: ${cacheKey}`, error);
      }
    }
  }

  /**
   * 重置工厂（用于测试）
   */
  static reset(): void {
    if (ProjectHandlerFactory.instance) {
      ProjectHandlerFactory.instance.destroyAllHandlers().catch(console.error);
      ProjectHandlerFactory.instance = null;
    }
  }
}

/**
 * 全局项目处理器工厂实例
 */
export const globalProjectHandlerFactory = ProjectHandlerFactory.getInstance();
