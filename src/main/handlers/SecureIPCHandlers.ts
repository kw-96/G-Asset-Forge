/**
 * 安全IPC处理器 - 提供安全的IPC通信处理
 * @description 集成安全验证、权限控制、数据验证等功能
 * @author 开发团队
 */
import { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { logger } from '../services/LoggingService';
import { fileService } from '../services/FileService';
import { SecurityManager } from '../managers/SecurityManager';
import type { IPCRoute } from '../services/IPCService';

/**
 * 安全IPC配置接口
 */
export interface SecureIPCConfig {
  enableRateLimit: boolean;
  enableDataValidation: boolean;
  enablePermissionCheck: boolean;
  enableAuditLog: boolean;
  maxPayloadSize: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

/**
 * 默认安全IPC配置
 */
const DEFAULT_SECURE_IPC_CONFIG: SecureIPCConfig = {
  enableRateLimit: true,
  enableDataValidation: true,
  enablePermissionCheck: true,
  enableAuditLog: true,
  maxPayloadSize: 10 * 1024 * 1024, // 10MB
  rateLimitWindow: 60000, // 1分钟
  rateLimitMax: 100, // 每分钟最多100次请求
};

/**
 * IPC权限级别
 */
export enum IPCPermissionLevel {
  PUBLIC = 'public',      // 公开访问
  PROTECTED = 'protected', // 需要基本验证
  PRIVATE = 'private',    // 需要高级权限
  ADMIN = 'admin',        // 管理员权限
}

/**
 * 安全IPC路由接口
 */
export interface SecureIPCRoute extends IPCRoute {
  permission: IPCPermissionLevel;
  rateLimit?: {
    max: number;
    window: number;
  };
  dataSchema?: any; // JSON Schema for validation
  auditLog?: boolean;
}

/**
 * 安全IPC处理器类
 * @description 提供完整的安全IPC通信管理
 */
export class SecureIPCHandlers {
  private config: SecureIPCConfig;
  private securityManager: SecurityManager;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private permissionCache: Map<string, IPCPermissionLevel> = new Map();

  constructor(
    securityManager: SecurityManager,
    config: Partial<SecureIPCConfig> = {}
  ) {
    this.securityManager = securityManager;
    this.config = { ...DEFAULT_SECURE_IPC_CONFIG, ...config };
  }

  /**
   * 注册安全IPC路由
   */
  public registerSecureRoutes(): SecureIPCRoute[] {
    const routes: SecureIPCRoute[] = [
      // 文件操作路由
      {
        channel: 'file:read',
        type: 'handle',
        permission: IPCPermissionLevel.PROTECTED,
        handler: this.handleFileRead.bind(this),
        description: '读取文件',
        auditLog: true,
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'file:write',
        type: 'handle',
        permission: IPCPermissionLevel.PROTECTED,
        handler: this.handleFileWrite.bind(this),
        description: '写入文件',
        auditLog: true,
        validation: (args) => typeof args[0] === 'string' && args[1] !== undefined,
      },
      {
        channel: 'file:delete',
        type: 'handle',
        permission: IPCPermissionLevel.PRIVATE,
        handler: this.handleFileDelete.bind(this),
        description: '删除文件',
        auditLog: true,
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'file:list',
        type: 'handle',
        permission: IPCPermissionLevel.PROTECTED,
        handler: this.handleFileList.bind(this),
        description: '列出目录内容',
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'file:info',
        type: 'handle',
        permission: IPCPermissionLevel.PUBLIC,
        handler: this.handleFileInfo.bind(this),
        description: '获取文件信息',
        validation: (args) => typeof args[0] === 'string',
      },

      // 系统操作路由
      {
        channel: 'system:get-info',
        type: 'handle',
        permission: IPCPermissionLevel.PUBLIC,
        handler: this.handleSystemInfo.bind(this),
        description: '获取系统信息',
      },
      {
        channel: 'system:get-paths',
        type: 'handle',
        permission: IPCPermissionLevel.PROTECTED,
        handler: this.handleSystemPaths.bind(this),
        description: '获取系统路径',
      },
      {
        channel: 'system:show-dialog',
        type: 'handle',
        permission: IPCPermissionLevel.PROTECTED,
        handler: this.handleShowDialog.bind(this),
        description: '显示系统对话框',
        validation: (args) => typeof args[0] === 'string',
      },

      // 安全操作路由
      {
        channel: 'security:validate-url',
        type: 'handle',
        permission: IPCPermissionLevel.PUBLIC,
        handler: this.handleValidateUrl.bind(this),
        description: '验证URL安全性',
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'security:validate-file',
        type: 'handle',
        permission: IPCPermissionLevel.PUBLIC,
        handler: this.handleValidateFile.bind(this),
        description: '验证文件安全性',
        validation: (args) => typeof args[0] === 'string',
      },
      {
        channel: 'security:get-stats',
        type: 'handle',
        permission: IPCPermissionLevel.ADMIN,
        handler: this.handleSecurityStats.bind(this),
        description: '获取安全统计信息',
      },

      // 日志操作路由
      {
        channel: 'log:query',
        type: 'handle',
        permission: IPCPermissionLevel.ADMIN,
        handler: this.handleLogQuery.bind(this),
        description: '查询日志',
        rateLimit: { max: 10, window: 60000 }, // 每分钟最多10次
      },
      {
        channel: 'log:export',
        type: 'handle',
        permission: IPCPermissionLevel.ADMIN,
        handler: this.handleLogExport.bind(this),
        description: '导出日志',
        auditLog: true,
      },
    ];

    return routes;
  }

  /**
   * 验证IPC权限
   */
  public async validatePermission(
    event: IpcMainEvent | IpcMainInvokeEvent,
    requiredPermission: IPCPermissionLevel
  ): Promise<boolean> {
    try {
      const webContents = event.sender;
      const windowId = webContents.id.toString();
      
      // 检查权限缓存
      const cachedPermission = this.permissionCache.get(windowId);
      if (cachedPermission) {
        return this.comparePermissionLevels(cachedPermission, requiredPermission);
      }

      // 获取窗口权限级别
      const window = BrowserWindow.fromWebContents(webContents);
      if (!window) {
        logger.warn('[secure-ipc] 无法找到对应窗口');
        return false;
      }

      // 根据窗口类型确定权限级别
      let permissionLevel = IPCPermissionLevel.PUBLIC;
      
      // 主窗口具有更高权限
      if (window.webContents.getURL().includes('main')) {
        permissionLevel = IPCPermissionLevel.PRIVATE;
      }

      // 开发环境给予管理员权限
      if (process.env['NODE_ENV'] === 'development') {
        permissionLevel = IPCPermissionLevel.ADMIN;
      }

      // 缓存权限
      this.permissionCache.set(windowId, permissionLevel);

      return this.comparePermissionLevels(permissionLevel, requiredPermission);

    } catch (error) {
      logger.error('[secure-ipc] 权限验证失败', error);
      return false;
    }
  }

  /**
   * 验证速率限制
   */
  public validateRateLimit(channel: string, customLimit?: { max: number; window: number }): boolean {
    if (!this.config.enableRateLimit) return true;

    const limit = customLimit || {
      max: this.config.rateLimitMax,
      window: this.config.rateLimitWindow,
    };

    const now = Date.now();
    const key = channel;
    const entry = this.rateLimitMap.get(key);

    if (!entry || entry.resetTime <= now) {
      // 重置或创建新的限制记录
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + limit.window,
      });
      return true;
    }

    if (entry.count >= limit.max) {
      logger.warn(`[secure-ipc] 速率限制触发: ${channel}`, { count: entry.count, max: limit.max });
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * 验证数据负载
   */
  public validatePayload(data: any): boolean {
    if (!this.config.enableDataValidation) return true;

    try {
      const serialized = JSON.stringify(data);
      const size = Buffer.byteLength(serialized, 'utf8');

      if (size > this.config.maxPayloadSize) {
        logger.warn('[secure-ipc] 数据负载过大', { size, maxSize: this.config.maxPayloadSize });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('[secure-ipc] 数据负载验证失败', error);
      return false;
    }
  }

  /**
   * 记录审计日志
   */
  public auditLog(channel: string, event: IpcMainEvent | IpcMainInvokeEvent, args: any[], result?: any): void {
    if (!this.config.enableAuditLog) return;

    const auditEntry = {
      channel,
      timestamp: new Date().toISOString(),
      webContentsId: event.sender.id,
      url: event.sender.getURL(),
      args: args.length,
      success: result !== undefined,
      userAgent: event.sender.getUserAgent(),
    };

    logger.info('[secure-ipc] 审计日志', auditEntry);
  }

  // 私有方法 - IPC处理器

  /**
   * 处理文件读取
   */
  private async handleFileRead(event: IpcMainInvokeEvent, filePath: string, encoding?: BufferEncoding) {
    const result = await fileService.readFile(filePath, encoding);
    this.auditLog('file:read', event, [filePath, encoding], result);
    return result;
  }

  /**
   * 处理文件写入
   */
  private async handleFileWrite(event: IpcMainInvokeEvent, filePath: string, data: string | Buffer, options?: any) {
    const result = await fileService.writeFile(filePath, data, options);
    this.auditLog('file:write', event, [filePath, '***', options], result);
    return result;
  }

  /**
   * 处理文件删除
   */
  private async handleFileDelete(event: IpcMainInvokeEvent, filePath: string) {
    const result = await fileService.deleteFile(filePath);
    this.auditLog('file:delete', event, [filePath], result);
    return result;
  }

  /**
   * 处理文件列表
   */
  private async handleFileList(_event: IpcMainInvokeEvent, dirPath: string, recursive?: boolean) {
    const result = await fileService.listDirectory(dirPath, recursive);
    return result;
  }

  /**
   * 处理文件信息
   */
  private async handleFileInfo(_event: IpcMainInvokeEvent, filePath: string) {
    const result = await fileService.getFileInfo(filePath);
    return result;
  }

  /**
   * 处理系统信息
   */
  private async handleSystemInfo(_event: IpcMainInvokeEvent) {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
    };
  }

  /**
   * 处理系统路径
   */
  private async handleSystemPaths(_event: IpcMainInvokeEvent) {
    const { app } = require('electron');
    return {
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
    };
  }

  /**
   * 处理显示对话框
   */
  private async handleShowDialog(_event: IpcMainInvokeEvent, type: string, options: any) {
    switch (type) {
      case 'open':
        return await fileService.showOpenDialog(options);
      case 'save':
        return await fileService.showSaveDialog(options);
      default:
        return { success: false, error: '不支持的对话框类型' };
    }
  }

  /**
   * 处理URL验证
   */
  private async handleValidateUrl(_event: IpcMainInvokeEvent, url: string) {
    const isValid = this.securityManager.isSafeUrl(url);
    return { success: true, data: { isValid, url } };
  }

  /**
   * 处理文件验证
   */
  private async handleValidateFile(_event: IpcMainInvokeEvent, filePath: string, fileSize?: number) {
    const isValid = this.securityManager.isSafeFile(filePath, fileSize);
    return { success: true, data: { isValid, filePath } };
  }

  /**
   * 处理安全统计
   */
  private async handleSecurityStats(_event: IpcMainInvokeEvent) {
    const stats = this.securityManager.getSecurityStats();
    return { success: true, data: stats };
  }

  /**
   * 处理日志查询
   */
  private async handleLogQuery(_event: IpcMainInvokeEvent, _options: any) {
    // 这里需要集成日志服务的查询功能
    return { success: true, data: [] };
  }

  /**
   * 处理日志导出
   */
  private async handleLogExport(event: IpcMainInvokeEvent, options: any) {
    // 这里需要实现日志导出功能
    this.auditLog('log:export', event, [options], { success: true });
    return { success: true, message: '日志导出功能待实现' };
  }

  // 工具方法

  /**
   * 比较权限级别
   */
  private comparePermissionLevels(userLevel: IPCPermissionLevel, requiredLevel: IPCPermissionLevel): boolean {
    const levels = {
      [IPCPermissionLevel.PUBLIC]: 0,
      [IPCPermissionLevel.PROTECTED]: 1,
      [IPCPermissionLevel.PRIVATE]: 2,
      [IPCPermissionLevel.ADMIN]: 3,
    };

    return levels[userLevel] >= levels[requiredLevel];
  }

  /**
   * 清理过期的速率限制记录
   */
  public cleanupRateLimit(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (entry.resetTime <= now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.rateLimitMap.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug(`[secure-ipc] 清理过期的速率限制记录: ${expiredKeys.length} 个`);
    }
  }

  /**
   * 清理安全IPC处理器
   */
  public cleanup(): void {
    logger.info('[secure-ipc] 清理安全IPC处理器');
    this.rateLimitMap.clear();
    this.permissionCache.clear();
  }
}