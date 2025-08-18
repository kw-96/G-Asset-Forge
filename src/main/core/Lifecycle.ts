/**
 * 应用生命周期管理器 - 管理Electron应用的生命周期事件
 * @description 提供应用生命周期事件的统一管理和处理
 * @author 开发团队
 */
import { app, Event } from 'electron';
import { logger } from '../utils/logger';

/**
 * 生命周期事件处理器类型
 */
export type LifecycleEventHandler = () => void | Promise<void>;
export type QuitEventHandler = (event: Event) => void | Promise<void>;

/**
 * 生命周期管理器类
 * @description 统一管理Electron应用的生命周期事件
 */
export class Lifecycle {
  private isInitialized = false;
  private eventHandlers: Map<string, LifecycleEventHandler[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * 应用就绪事件处理器
   */
  public onReady(handler: LifecycleEventHandler): void {
    this.addEventHandler('ready', handler);
  }

  /**
   * 应用激活事件处理器（macOS）
   */
  public onActivate(handler: LifecycleEventHandler): void {
    this.addEventHandler('activate', handler);
  }

  /**
   * 所有窗口关闭事件处理器
   */
  public onWindowAllClosed(handler: LifecycleEventHandler): void {
    this.addEventHandler('window-all-closed', handler);
  }

  /**
   * 应用退出前事件处理器
   */
  public onBeforeQuit(handler: LifecycleEventHandler): void {
    this.addEventHandler('before-quit', handler);
  }

  /**
   * 应用即将退出事件处理器
   */
  public onWillQuit(handler: QuitEventHandler): void {
    this.addEventHandler('will-quit', handler as LifecycleEventHandler);
  }

  /**
   * 应用退出事件处理器
   */
  public onQuit(handler: LifecycleEventHandler): void {
    this.addEventHandler('quit', handler);
  }

  /**
   * 第二个实例启动事件处理器
   */
  public onSecondInstance(handler: LifecycleEventHandler): void {
    this.addEventHandler('second-instance', handler);
  }

  /**
   * 证书错误事件处理器
   */
  public onCertificateError(handler: LifecycleEventHandler): void {
    this.addEventHandler('certificate-error', handler);
  }

  /**
   * 移除事件处理器
   */
  public removeEventHandler(eventName: string, handler: LifecycleEventHandler): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 清除所有事件处理器
   */
  public clearEventHandlers(eventName?: string): void {
    if (eventName) {
      this.eventHandlers.delete(eventName);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * 获取应用状态信息
   */
  public getAppStatus() {
    return {
      isReady: app.isReady(),
      isPackaged: app.isPackaged,
      version: app.getVersion(),
      name: app.getName(),
      path: app.getAppPath(),
      userDataPath: app.getPath('userData'),
      tempPath: app.getPath('temp'),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
    };
  }

  /**
   * 设置应用用户模型ID（Windows）
   */
  public setAppUserModelId(id: string): void {
    if (process.platform === 'win32') {
      app.setAppUserModelId(id);
      logger.info('[lifecycle] 设置应用用户模型ID:', id);
    }
  }

  /**
   * 请求单实例锁
   */
  public requestSingleInstanceLock(): boolean {
    const gotTheLock = app.requestSingleInstanceLock();
    
    if (!gotTheLock) {
      logger.warn('[lifecycle] 应用已在运行，退出当前实例');
      app.quit();
      return false;
    }

    // 处理第二个实例启动
    app.on('second-instance', async () => {
      logger.info('[lifecycle] 检测到第二个实例启动');
      await this.executeEventHandlers('second-instance');
    });

    return true;
  }

  /**
   * 设置应用协议处理器
   */
  public setAsDefaultProtocolClient(protocol: string): boolean {
    const result = app.setAsDefaultProtocolClient(protocol);
    logger.info(`[lifecycle] 设置协议处理器 ${protocol}:`, result ? '成功' : '失败');
    return result;
  }

  /**
   * 禁用硬件加速
   */
  public disableHardwareAcceleration(): void {
    app.disableHardwareAcceleration();
    logger.info('[lifecycle] 已禁用硬件加速');
  }

  /**
   * 启用沙盒模式
   */
  public enableSandbox(): void {
    app.enableSandbox();
    logger.info('[lifecycle] 已启用沙盒模式');
  }

  /**
   * 获取事件处理器统计
   */
  public getEventHandlerStats() {
    const stats: Record<string, number> = {};
    for (const [eventName, handlers] of this.eventHandlers.entries()) {
      stats[eventName] = handlers.length;
    }
    return stats;
  }

  // 私有方法

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (this.isInitialized) {
      return;
    }

    // 应用就绪事件
    app.on('ready', async () => {
      logger.info('[lifecycle] 应用就绪');
      await this.executeEventHandlers('ready');
    });

    // 应用激活事件（macOS）
    app.on('activate', async () => {
      logger.info('[lifecycle] 应用激活');
      await this.executeEventHandlers('activate');
    });

    // 所有窗口关闭事件
    app.on('window-all-closed', async () => {
      logger.info('[lifecycle] 所有窗口已关闭');
      await this.executeEventHandlers('window-all-closed');
    });

    // 应用退出前事件
    app.on('before-quit', async () => {
      logger.info('[lifecycle] 应用即将退出');
      await this.executeEventHandlers('before-quit');
    });

    // 应用即将退出事件
    app.on('will-quit', async (event) => {
      logger.info('[lifecycle] 应用正在退出');
      const handlers = this.eventHandlers.get('will-quit') || [];
      for (const handler of handlers) {
        try {
          await (handler as QuitEventHandler)(event);
        } catch (error) {
          logger.error('[lifecycle] will-quit 事件处理器执行失败:', error);
        }
      }
    });

    // 应用退出事件
    app.on('quit', async () => {
      logger.info('[lifecycle] 应用已退出');
      await this.executeEventHandlers('quit');
    });

    // 证书错误事件
    app.on('certificate-error', async (event, _webContents, url, error, _certificate, callback) => {
      logger.warn('[lifecycle] 证书错误:', { url, error });
      await this.executeEventHandlers('certificate-error');
      
      // 在开发环境中忽略证书错误
      if (process.env['NODE_ENV'] === 'development') {
        event.preventDefault();
        callback(true);
      } else {
        callback(false);
      }
    });

    // GPU进程崩溃事件
    app.on('gpu-process-crashed', (_event, killed) => {
      logger.error('[lifecycle] GPU进程崩溃:', { killed });
    });

    // 渲染进程崩溃事件
    app.on('render-process-gone', (_event, _webContents, details) => {
      logger.error('[lifecycle] 渲染进程异常退出:', details);
    });

    // 子进程崩溃事件
    app.on('child-process-gone', (_event, details) => {
      logger.error('[lifecycle] 子进程异常退出:', details);
    });

    this.isInitialized = true;
    logger.info('[lifecycle] 生命周期事件监听器设置完成');
  }

  /**
   * 添加事件处理器
   */
  private addEventHandler(eventName: string, handler: LifecycleEventHandler): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)!.push(handler);
    logger.debug(`[lifecycle] 添加 ${eventName} 事件处理器`);
  }

  /**
   * 执行事件处理器
   */
  private async executeEventHandlers(eventName: string): Promise<void> {
    const handlers = this.eventHandlers.get(eventName) || [];
    
    for (const handler of handlers) {
      try {
        await handler();
      } catch (error) {
        logger.error(`[lifecycle] ${eventName} 事件处理器执行失败:`, error);
      }
    }
  }
}