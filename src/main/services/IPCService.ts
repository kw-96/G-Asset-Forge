/**
 * IPC通信服务 - 管理主进程与渲染进程间的通信
 * @description 提供统一的IPC通信管理，包括事件处理、消息路由、错误处理等
 * @author 开发团队
 */
import { ipcMain, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { logger } from '../utils/logger';

/**
 * IPC处理器类型
 */
export type IPCHandler = (event: IpcMainEvent, ...args: any[]) => void;
export type IPCInvokeHandler = (event: IpcMainInvokeEvent, ...args: any[]) => any | Promise<any>;

/**
 * IPC路由配置接口
 */
export interface IPCRoute {
  channel: string;
  handler: IPCHandler | IPCInvokeHandler;
  type: 'on' | 'handle';
  description?: string;
  validation?: (args: any[]) => boolean;
}

/**
 * IPC服务配置接口
 */
export interface IPCServiceConfig {
  enableLogging: boolean;
  enableValidation: boolean;
  maxMessageSize: number;
  timeout: number;
  enableRateLimit: boolean;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * 默认IPC服务配置
 */
const DEFAULT_IPC_CONFIG: IPCServiceConfig = {
  enableLogging: true,
  enableValidation: true,
  maxMessageSize: 10 * 1024 * 1024, // 10MB
  timeout: 30000, // 30秒
  enableRateLimit: true,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1分钟
  },
};

/**
 * IPC通信服务类
 * @description 提供完整的IPC通信管理功能
 */
export class IPCService {
  private config: IPCServiceConfig;
  private isInitialized = false;
  private routes: Map<string, IPCRoute> = new Map();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private mainWindow: BrowserWindow | null = null;

  constructor(config: Partial<IPCServiceConfig> = {}) {
    this.config = { ...DEFAULT_IPC_CONFIG, ...config };
  }

  /**
   * 初始化IPC服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[ipc-service] IPC服务已经初始化');
      return;
    }

    try {
      logger.info('[ipc-service] 开始初始化IPC服务');

      // 注册默认路由
      this.registerDefaultRoutes();

      // 设置错误处理
      this.setupErrorHandling();

      // 启动速率限制清理
      if (this.config.enableRateLimit) {
        this.startRateLimitCleanup();
      }

      this.isInitialized = true;
      logger.info('[ipc-service] IPC服务初始化完成');

    } catch (error) {
      logger.error('[ipc-service] IPC服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置处理器
   */
  public setupHandlers(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
    
    // 注册所有路由
    for (const [channel, route] of this.routes.entries()) {
      if (route.type === 'on') {
        ipcMain.on(channel, this.wrapHandler(route, route.handler as IPCHandler));
      } else if (route.type === 'handle') {
        ipcMain.handle(channel, this.wrapInvokeHandler(route, route.handler as IPCInvokeHandler));
      }
    }

    logger.info(`[ipc-service] IPC处理器设置完成，共 ${this.routes.size} 个路由`);
  }

  /**
   * 注册IPC路由
   */
  public registerRoute(route: IPCRoute): void {
    if (this.routes.has(route.channel)) {
      logger.warn(`[ipc-service] 路由已存在，将被覆盖: ${route.channel}`);
    }

    this.routes.set(route.channel, route);
    logger.debug(`[ipc-service] 注册路由: ${route.channel} (${route.type})`);
  }

  /**
   * 批量注册路由
   */
  public registerRoutes(routes: IPCRoute[]): void {
    routes.forEach(route => this.registerRoute(route));
    logger.info(`[ipc-service] 批量注册路由: ${routes.length} 个`);
  }

  /**
   * 移除路由
   */
  public removeRoute(channel: string): void {
    if (this.routes.has(channel)) {
      this.routes.delete(channel);
      ipcMain.removeAllListeners(channel);
      logger.debug(`[ipc-service] 移除路由: ${channel}`);
    }
  }

  /**
   * 发送消息到渲染进程
   */
  public sendToRenderer(channel: string, ...args: any[]): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      logger.warn('[ipc-service] 主窗口不可用，无法发送消息');
      return;
    }

    try {
      this.mainWindow.webContents.send(channel, ...args);
      
      if (this.config.enableLogging) {
        logger.debug(`[ipc-service] 发送消息到渲染进程: ${channel}`, { argsCount: args.length });
      }
    } catch (error) {
      logger.error(`[ipc-service] 发送消息失败: ${channel}`, error);
    }
  }

  /**
   * 广播消息到所有窗口
   */
  public broadcast(channel: string, ...args: any[]): void {
    const windows = BrowserWindow.getAllWindows();
    
    windows.forEach(window => {
      if (!window.isDestroyed()) {
        try {
          window.webContents.send(channel, ...args);
        } catch (error) {
          logger.error(`[ipc-service] 广播消息失败: ${channel}`, error);
        }
      }
    });

    if (this.config.enableLogging) {
      logger.debug(`[ipc-service] 广播消息: ${channel}`, { windowCount: windows.length });
    }
  }

  /**
   * 获取路由统计信息
   */
  public getRouteStats() {
    const stats = {
      totalRoutes: this.routes.size,
      routesByType: { on: 0, handle: 0 },
      routeList: [] as Array<{ channel: string; type: string; description?: string }>,
    };

    for (const [channel, route] of this.routes.entries()) {
      stats.routesByType[route.type]++;
      stats.routeList.push({
        channel,
        type: route.type,
        description: route.description ?? '',
      });
    }

    return stats;
  }

  /**
   * 获取速率限制统计
   */
  public getRateLimitStats() {
    const now = Date.now();
    const activeEntries = Array.from(this.rateLimitMap.entries())
      .filter(([, data]) => data.resetTime > now);

    return {
      activeEntries: activeEntries.length,
      totalEntries: this.rateLimitMap.size,
      topChannels: activeEntries
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([channel, data]) => ({ channel, count: data.count })),
    };
  }

  /**
   * 清理IPC服务
   */
  public async cleanup(): Promise<void> {
    logger.info('[ipc-service] 清理IPC服务');

    try {
      // 移除所有监听器
      for (const channel of this.routes.keys()) {
        ipcMain.removeAllListeners(channel);
      }

      // 清理数据
      this.routes.clear();
      this.rateLimitMap.clear();
      this.mainWindow = null;
      this.isInitialized = false;

      logger.info('[ipc-service] IPC服务清理完成');
    } catch (error) {
      logger.error('[ipc-service] IPC服务清理失败:', error);
    }
  }

  // 私有方法

  /**
   * 注册默认路由
   */
  private registerDefaultRoutes(): void {
    const defaultRoutes: IPCRoute[] = [
      {
        channel: 'app:get-version',
        type: 'handle',
        handler: async () => {
          return {
            version: require('../../../package.json').version,
            electronVersion: process.versions.electron,
            nodeVersion: process.version,
          };
        },
        description: '获取应用版本信息',
      },
      {
        channel: 'app:get-path',
        type: 'handle',
        handler: async (_event: IpcMainInvokeEvent, pathName: string) => {
          return require('electron').app.getPath(pathName as any);
        },
        description: '获取应用路径',
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'window:minimize',
        type: 'on',
        handler: (_event: IpcMainEvent) => {
          const window = BrowserWindow.fromWebContents(_event.sender ?? undefined);
          if (window) window.minimize();
        },
        description: '最小化窗口',
      },
      {
        channel: 'window:maximize',
        type: 'on',
        handler: (_event: IpcMainEvent) => {
          const window = BrowserWindow.fromWebContents(_event.sender ?? undefined);
          if (window) {
            if (window.isMaximized()) {
              window.unmaximize();
            } else {
              window.maximize();
            }
          }
        },
        description: '最大化/还原窗口',
      },
      {
        channel: 'window:close',
        type: 'on',
        handler: (_event: IpcMainEvent) => {
          const window = BrowserWindow.fromWebContents(_event.sender ?? undefined);
          if (window) window.close();
        },
        description: '关闭窗口',
      },
      // DevTools 控制
      {
        channel: 'devtools:open',
        type: 'handle',
        handler: async (event: IpcMainInvokeEvent, options?: { mode?: 'left' | 'right' | 'bottom' | 'undocked' | 'detach'; activate?: boolean; title?: string }) => {
          const window = BrowserWindow.fromWebContents(event.sender ?? undefined) || this.mainWindow;
          if (window && !window.isDestroyed()) {
            window.webContents.openDevTools(options as any);
            return { success: true };
          }
          return { success: false, error: 'Main window not available' };
        },
        description: '打开 DevTools',
      },
      {
        channel: 'devtools:close',
        type: 'handle',
        handler: async (event: IpcMainInvokeEvent) => {
          const window = BrowserWindow.fromWebContents(event.sender ?? undefined) || this.mainWindow;
          if (window && !window.isDestroyed()) {
            if (window.webContents.isDevToolsOpened()) {
              window.webContents.closeDevTools();
            }
            return { success: true };
          }
          return { success: false, error: 'Main window not available' };
        },
        description: '关闭 DevTools',
      },
      {
        channel: 'devtools:toggle',
        type: 'handle',
        handler: async (event: IpcMainInvokeEvent) => {
          const window = BrowserWindow.fromWebContents(event.sender ?? undefined) || this.mainWindow;
          if (window && !window.isDestroyed()) {
            window.webContents.toggleDevTools();
            return { success: true };
          }
          return { success: false, error: 'Main window not available' };
        },
        description: '切换 DevTools',
      },
      {
        channel: 'devtools:isOpened',
        type: 'handle',
        handler: async (event: IpcMainInvokeEvent) => {
          const window = BrowserWindow.fromWebContents(event.sender ?? undefined) || this.mainWindow;
          if (window && !window.isDestroyed()) {
            return { success: true, data: window.webContents.isDevToolsOpened() };
          }
          return { success: false, error: 'Main window not available' };
        },
        description: '查询 DevTools 是否打开',
      },
    ];

    this.registerRoutes(defaultRoutes);
  }

  /**
   * 包装事件处理器
   */
  private wrapHandler(route: IPCRoute, handler: IPCHandler): IPCHandler {
    return async (event: IpcMainEvent, ...args: any[]) => {
      const startTime = Date.now();
      const channel = route.channel;

      try {
        // 速率限制检查
        if (this.config.enableRateLimit && !this.checkRateLimit(channel)) {
          logger.warn(`[ipc-service] 速率限制触发: ${channel}`);
          return;
        }

        // 参数验证
        if (this.config.enableValidation && route.validation && !route.validation(args)) {
          logger.warn(`[ipc-service] 参数验证失败: ${channel}`, { args });
          return;
        }

        // 执行处理器
        await handler(event, ...args);

        // 记录性能
        const duration = Date.now() - startTime;
        if (this.config.enableLogging) {
          logger.debug(`[ipc-service] 处理完成: ${channel}`, { duration: `${duration}ms` });
        }

      } catch (error) {
        logger.error(`[ipc-service] 处理器执行失败: ${channel}`, error);
        
        // 发送错误到渲染进程
        event.reply(`${channel}:error`, {
          message: error instanceof Error ? error.message : '未知错误',
          code: 'IPC_HANDLER_ERROR',
        });
      }
    };
  }

  /**
   * 包装调用处理器
   */
  private wrapInvokeHandler(route: IPCRoute, handler: IPCInvokeHandler): IPCInvokeHandler {
    return async (event: IpcMainInvokeEvent, ...args: any[]) => {
      const startTime = Date.now();
      const channel = route.channel;

      try {
        // 速率限制检查
        if (this.config.enableRateLimit && !this.checkRateLimit(channel)) {
          logger.warn(`[ipc-service] 速率限制触发: ${channel}`);
          throw new Error('请求过于频繁，请稍后再试');
        }

        // 参数验证
        if (this.config.enableValidation && route.validation && !route.validation(args)) {
          logger.warn(`[ipc-service] 参数验证失败: ${channel}`, { args });
          throw new Error('参数验证失败');
        }

        // 执行处理器
        const result = await handler(event, ...args);

        // 记录性能
        const duration = Date.now() - startTime;
        if (this.config.enableLogging) {
          logger.debug(`[ipc-service] 调用完成: ${channel}`, { duration: `${duration}ms` });
        }

        return result;

      } catch (error) {
        logger.error(`[ipc-service] 调用处理器执行失败: ${channel}`, error);
        throw error;
      }
    };
  }

  /**
   * 检查速率限制
   */
  private checkRateLimit(channel: string): boolean {
    if (!this.config.enableRateLimit) return true;

    const now = Date.now();
    const key = channel;
    const limit = this.rateLimitMap.get(key);

    if (!limit || limit.resetTime <= now) {
      // 重置或创建新的限制记录
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs,
      });
      return true;
    }

    if (limit.count >= this.config.rateLimit.maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 处理未捕获的IPC错误
    process.on('uncaughtException', (error) => {
      logger.error('[ipc-service] 未捕获的异常:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('[ipc-service] 未处理的Promise拒绝:', { reason, promise });
    });
  }

  /**
   * 启动速率限制清理
   */
  private startRateLimitCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, data] of this.rateLimitMap.entries()) {
        if (data.resetTime <= now) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.rateLimitMap.delete(key));

      if (expiredKeys.length > 0) {
        logger.debug(`[ipc-service] 清理过期的速率限制记录: ${expiredKeys.length} 个`);
      }
    }, 60000); // 每分钟清理一次
  }
}