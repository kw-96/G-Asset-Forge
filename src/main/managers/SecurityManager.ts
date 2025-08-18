/**
 * 安全管理器 - 负责应用的安全策略和防护措施
 * @description 管理内容安全策略、URL验证、权限控制等安全功能
 * @author 开发团队
 */
import { app } from 'electron';
import { logger } from '../services/LoggingService';

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  enableCSP: boolean;
  enableCORS: boolean;
  allowedOrigins: string[];
  blockedUrls: string[];
  enableUrlValidation: boolean;
  enablePermissionControl: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

/**
 * 默认安全配置
 */
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableCORS: true,
  allowedOrigins: ['http://localhost:3000', 'https://localhost:3000'],
  blockedUrls: [],
  enableUrlValidation: true,
  enablePermissionControl: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.mp3', '.wav', '.mp4', '.webm'],
};

/**
 * 安全管理器类
 * @description 提供全面的应用安全管理功能
 */
export class SecurityManager {
  private config: SecurityConfig;
  private isInitialized = false;
  private blockedAttempts: Map<string, number> = new Map();
  private maxBlockedAttempts = 10;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * 初始化安全管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[security-manager] 安全管理器已经初始化');
      return;
    }

    try {
      logger.info('[security-manager] 开始初始化安全管理器');

      // 设置内容安全策略
      if (this.config.enableCSP) {
        this.setupContentSecurityPolicy();
      }

      // 设置CORS策略
      if (this.config.enableCORS) {
        this.setupCORSPolicy();
      }

      // 设置权限控制
      if (this.config.enablePermissionControl) {
        this.setupPermissionControl();
      }

      // 设置Web内容安全
      this.setupWebContentsSecurity();

      // 设置会话安全
      this.setupSessionSecurity();

      this.isInitialized = true;
      logger.info('[security-manager] 安全管理器初始化完成');

    } catch (error) {
      logger.error('[security-manager] 安全管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 验证URL是否安全
   */
  public isSafeUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // 检查协议
      const allowedProtocols = ['http:', 'https:', 'file:', 'data:', 'blob:'];
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        logger.warn('[security-manager] 不安全的协议:', parsedUrl.protocol);
        return false;
      }

      // 检查是否在阻止列表中
      if (this.config.blockedUrls.some(blocked => url.includes(blocked))) {
        logger.warn('[security-manager] URL在阻止列表中:', url);
        return false;
      }

      // 开发环境允许localhost
      if (process.env['NODE_ENV'] === 'development') {
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
          return true;
        }
      }

      // 检查是否在允许列表中
      if (this.config.allowedOrigins.length > 0) {
        const origin = parsedUrl.origin;
        if (!this.config.allowedOrigins.includes(origin)) {
          logger.warn('[security-manager] URL不在允许列表中:', origin);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('[security-manager] URL验证失败:', error);
      return false;
    }
  }

  /**
   * 验证文件是否安全
   */
  public isSafeFile(filePath: string, fileSize?: number): boolean {
    try {
      // 检查文件大小
      if (fileSize && fileSize > this.config.maxFileSize) {
        logger.warn('[security-manager] 文件过大:', { filePath, fileSize, maxSize: this.config.maxFileSize });
        return false;
      }

      // 检查文件类型
      if (this.config.allowedFileTypes.length > 0) {
        const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
        if (!this.config.allowedFileTypes.includes(extension)) {
          logger.warn('[security-manager] 不允许的文件类型:', { filePath, extension });
          return false;
        }
      }

      // 检查危险路径
      const dangerousPaths = ['../', '.\\', '/etc/', '/sys/', 'C:\\Windows\\', 'C:\\System32\\'];
      if (dangerousPaths.some(dangerous => filePath.includes(dangerous))) {
        logger.warn('[security-manager] 危险的文件路径:', filePath);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('[security-manager] 文件验证失败:', error);
      return false;
    }
  }

  /**
   * 记录安全事件
   */
  public recordSecurityEvent(type: 'blocked_url' | 'blocked_file' | 'permission_denied' | 'navigation_blocked', details: any): void {
    const event = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: details.userAgent || 'unknown',
    };

    logger.warn('[security-manager] 安全事件:', event);

    // 记录阻止尝试次数
    const key = `${type}_${details.url || details.filePath || details.permission}`;
    const attempts = this.blockedAttempts.get(key) || 0;
    this.blockedAttempts.set(key, attempts + 1);

    // 如果阻止次数过多，可以采取更严格的措施
    if (attempts >= this.maxBlockedAttempts) {
      logger.error('[security-manager] 检测到可能的安全攻击:', { key, attempts });
      // 这里可以添加更严格的安全措施，比如临时禁用某些功能
    }
  }

  /**
   * 获取安全统计信息
   */
  public getSecurityStats() {
    const stats = {
      totalBlockedAttempts: Array.from(this.blockedAttempts.values()).reduce((sum, count) => sum + count, 0),
      blockedByType: {} as Record<string, number>,
      topBlockedItems: [] as Array<{ item: string; count: number }>,
    };

    // 按类型统计
    for (const [key, count] of this.blockedAttempts.entries()) {
      const type = key.split('_')[0];
      stats.blockedByType[type ?? ''] = (stats.blockedByType[type ?? ''] ?? 0) + count;
    }

    // 获取最常被阻止的项目
    stats.topBlockedItems = Array.from(this.blockedAttempts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([item, count]) => ({ item, count }));

    return stats;
  }

  /**
   * 更新安全配置
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('[security-manager] 安全配置已更新', newConfig);

    // 重新应用某些配置
    if (this.isInitialized) {
      if (newConfig.enableCSP !== undefined) {
        this.setupContentSecurityPolicy();
      }
      if (newConfig.enableCORS !== undefined) {
        this.setupCORSPolicy();
      }
    }
  }

  /**
   * 清理安全管理器
   */
  public cleanup(): void {
    logger.info('[security-manager] 清理安全管理器');
    this.blockedAttempts.clear();
    this.isInitialized = false;
  }

  // 私有方法

  /**
   * 设置内容安全策略
   */
  private setupContentSecurityPolicy(): void {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    const csp = cspDirectives.join('; ');

    // 为所有会话设置CSP
    app.on('session-created', (session) => {
      session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [csp],
          },
        });
      });
    });

    logger.info('[security-manager] 内容安全策略已设置');
  }

  /**
   * 设置CORS策略
   */
  private setupCORSPolicy(): void {
    app.on('session-created', (session) => {
      session.webRequest.onHeadersReceived((details, callback) => {
        const headers = details.responseHeaders || {};
        
        // 设置CORS头
        headers['Access-Control-Allow-Origin'] = this.config.allowedOrigins;
        headers['Access-Control-Allow-Methods'] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        headers['Access-Control-Allow-Headers'] = ['Content-Type', 'Authorization'];
        headers['Access-Control-Max-Age'] = ['86400'];

        callback({ responseHeaders: headers });
      });
    });

    logger.info('[security-manager] CORS策略已设置');
  }

  /**
   * 设置权限控制
   */
  private setupPermissionControl(): void {
    app.on('web-contents-created', (_event, contents) => {
      // 权限请求处理
      contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
        const allowedPermissions = ['notifications', 'clipboard-read', 'clipboard-write'];
        
        if (allowedPermissions.includes(permission)) {
          logger.info(`[security-manager] 允许权限: ${permission}`);
          callback(true);
        } else {
          logger.warn(`[security-manager] 拒绝权限: ${permission}`);
          this.recordSecurityEvent('permission_denied', { permission });
          callback(false);
        }
      });

      // 权限检查处理
      contents.session.setPermissionCheckHandler((_webContents, permission, _requestingOrigin) => {
        const allowedPermissions = ['notifications', 'clipboard-read', 'clipboard-write'];
        return allowedPermissions.includes(permission);
      });
    });

    logger.info('[security-manager] 权限控制已设置');
  }

  /**
   * 设置Web内容安全
   */
  private setupWebContentsSecurity(): void {
    app.on('web-contents-created', (_event, contents) => {
      // 阻止新窗口创建
      contents.setWindowOpenHandler(({ url }) => {
        logger.warn('[security-manager] 阻止新窗口创建:', url);
        this.recordSecurityEvent('blocked_url', { url, reason: 'new_window_blocked' });
        return { action: 'deny' };
      });

      // 导航拦截
      contents.on('will-navigate', (event, navigationUrl) => {
        if (!this.isSafeUrl(navigationUrl)) {
          logger.warn('[security-manager] 阻止不安全导航:', navigationUrl);
          this.recordSecurityEvent('navigation_blocked', { url: navigationUrl });
          event.preventDefault();
        }
      });

      // 阻止外部资源加载
      contents.session.webRequest.onBeforeRequest((details, callback) => {
        if (!this.isSafeUrl(details.url)) {
          logger.warn('[security-manager] 阻止不安全资源加载:', details.url);
          this.recordSecurityEvent('blocked_url', { url: details.url, reason: 'unsafe_resource' });
          callback({ cancel: true });
        } else {
          callback({ cancel: false });
        }
      });
    });

    logger.info('[security-manager] Web内容安全已设置');
  }

  /**
   * 设置会话安全
   */
  private setupSessionSecurity(): void {
    app.on('session-created', (session) => {
      // 设置安全头
      session.webRequest.onHeadersReceived((details, callback) => {
        const securityHeaders = {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        };

        callback({
          responseHeaders: {
            ...details.responseHeaders,
            ...Object.keys(securityHeaders).reduce((acc, key) => {
              acc[key] = [securityHeaders[key as keyof typeof securityHeaders]];
              return acc;
            }, {} as Record<string, string[]>),
          },
        });
      });

      // 清除不安全的缓存
      session.clearCache();
    });

    logger.info('[security-manager] 会话安全已设置');
  }
}